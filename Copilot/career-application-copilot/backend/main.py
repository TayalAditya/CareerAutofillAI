"""
FastAPI Backend for Career AutoFill Assistant with AI Integration
Handles resume upload, parsing, and auto-fill suggestions using AI models
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
import os
import json
import re
import sys
from datetime import datetime
from typing import Dict, List, Optional
import uuid
import spacy
from fuzzywuzzy import process, fuzz

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src'))

# Import our AI agents
try:
    from planner import JobDescriptionPlanner
    from executor import ApplicationExecutor  
    from tracker import ApplicationTracker
    from evaluation import ApplicationEvaluator
    AI_AGENTS_AVAILABLE = True
    print("✅ AI Agents loaded successfully")
except ImportError as e:
    AI_AGENTS_AVAILABLE = False
    print(f"⚠️ AI Agents not available: {e}")

# Load spaCy model globally
try:
    nlp = spacy.load('en_core_web_sm')
    SPACY_AVAILABLE = True
except:
    SPACY_AVAILABLE = False
    print("⚠️ spaCy model not available")

# Try to import PDF parsing libraries
try:
    import PyPDF2
    import docx
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("⚠️ PDF/DOCX support not available. Install: pip install PyPDF2 python-docx")

app = FastAPI(title="Career AutoFill Assistant with AI", version="2.0.0")

# Initialize AI Agents
ai_planner = None
ai_executor = None  
ai_tracker = None
ai_evaluator = None

@app.on_event("startup")
async def startup_event():
    """Initialize AI agents on startup"""
    global ai_planner, ai_executor, ai_tracker, ai_evaluator
    
    if AI_AGENTS_AVAILABLE:
        try:
            ai_planner = JobDescriptionPlanner()
            ai_executor = ApplicationExecutor()
            ai_tracker = ApplicationTracker()
            ai_evaluator = ApplicationEvaluator()
            print("✅ AI Agents initialized successfully!")
        except Exception as e:
            print(f"❌ Failed to initialize AI agents: {e}")
    else:
        print("⚠️ AI Agents not available - using fallback parsing")

# CORS middleware for React frontend and Browser Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "chrome-extension://*",
        "*"  # Allow all origins for extension development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class UserProfile(BaseModel):
    name: str
    email: str
    phone: str
    university: str
    degree: str
    gpa: Optional[str] = None
    skills: List[str]
    experience: List[Dict]
    projects: List[Dict]
    extracted_text: str

class FormField(BaseModel):
    field_type: str
    field_name: str
    label: str
    current_value: Optional[str] = None

class AutoFillRequest(BaseModel):
    fields: List[FormField]
    job_description: Optional[str] = None
    company_name: Optional[str] = None

class AutoFillSuggestion(BaseModel):
    field_name: str
    suggested_value: str
    confidence: float
    explanation: str

# AI-Powered Data Models
class JobDescriptionRequest(BaseModel):
    job_description: str
    company_name: Optional[str] = None
    role_title: Optional[str] = None

class AIAnalysisResponse(BaseModel):
    match_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    keywords: List[str]
    difficulty_level: str
    application_strategy: Dict

class ApplicationPackageRequest(BaseModel):
    job_description: str
    company_name: str
    role_title: str
    session_id: str

# AI-Powered Endpoints
@app.post("/ai/analyze-job", response_model=AIAnalysisResponse)
async def analyze_job_description(request: JobDescriptionRequest):
    """AI-powered job description analysis"""
    
    if not AI_AGENTS_AVAILABLE or not ai_planner:
        raise HTTPException(status_code=503, detail="AI agents not available")
    
    try:
        print(f"🤖 Analyzing job description for {request.company_name}")
        
        # Use AI planner to analyze job description
        strategy = ai_planner.plan_application(request.job_description)
        
        return AIAnalysisResponse(
            match_score=strategy.get('match_score', 0.0),
            matching_skills=strategy.get('matching_skills', []),
            missing_skills=strategy.get('missing_skills', []),
            keywords=strategy.get('keywords', []),
            difficulty_level=strategy.get('difficulty_level', 'unknown'),
            application_strategy=strategy
        )
        
    except Exception as e:
        print(f"❌ AI analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@app.post("/ai/generate-application")
async def generate_application_package(request: ApplicationPackageRequest):
    """Generate AI-powered application materials"""
    
    if not AI_AGENTS_AVAILABLE or not ai_executor:
        raise HTTPException(status_code=503, detail="AI agents not available")
    
    if request.session_id not in user_profiles:
        raise HTTPException(status_code=404, detail="Session not found. Upload resume first.")
    
    try:
        print(f"🎯 Generating application package for {request.role_title} at {request.company_name}")
        
        # First analyze the job
        strategy = ai_planner.plan_application(request.job_description)
        
        # Generate application materials
        application_package = ai_executor.generate_application_package(strategy)
        
        # Track the application
        tracking_result = ai_tracker.track_application({
            'company': request.company_name,
            'role': request.role_title,
            'job_description': request.job_description,
            'strategy': strategy,
            'application_package': application_package,
            'timestamp': datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "strategy": strategy,
            "application_package": application_package,
            "tracking_id": tracking_result.get('application_id'),
            "message": "Application package generated successfully"
        }
        
    except Exception as e:
        print(f"❌ Application generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Application generation failed: {str(e)}")

@app.get("/ai/profile/{session_id}")
async def get_ai_enhanced_profile(session_id: str):
    """Get AI-enhanced user profile"""
    
    if session_id not in user_profiles:
        raise HTTPException(status_code=404, detail="Session not found")
    
    profile = user_profiles[session_id]
    
    # Add AI enhancements if available
    if AI_AGENTS_AVAILABLE and ai_executor:
        try:
            # Enhance profile with AI suggestions
            enhanced_profile = profile.dict()
            enhanced_profile['ai_enhanced'] = True
            enhanced_profile['enhancement_timestamp'] = datetime.now().isoformat()
            
            return enhanced_profile
        except Exception as e:
            print(f"⚠️ AI enhancement failed: {e}")
    
    # Return basic profile
    return {
        **profile.dict(),
        'ai_enhanced': False,
        'message': 'AI enhancement not available'
    }

@app.post("/extension/profile")
@app.get("/api/extension/profile")
async def get_extension_profile():
    """Endpoint for browser extension to get profile"""
    try:
        # Load from user_profile.json for demo
        profile_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'user_profile.json')
        if os.path.exists(profile_path):
            with open(profile_path, 'r') as f:
                profile_data = json.load(f)
        else:
            # Fallback default profile
            profile_data = {
                "name": "Aditya Tayal",
                "email": "aditya@iitmandi.ac.in", 
                "phone": "+91-XXXXXXXXXX",
                "university": "IIT Mandi",
                "department": "Computer Science & Engineering",
                "degree": "B.Tech",
                "gpa": "8.5",
                "skills": ["Python", "Machine Learning", "React", "FastAPI", "Docker"],
                "experience": [],
                "projects": [],
                "created": datetime.now().isoformat()
            }
        
        return {
            "success": True,
            "profile": profile_data,
            "source": "file" if os.path.exists(profile_path) else "default"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Global storage (in production, use database)
user_profiles = {}

class ResumeParser:
    """Parse uploaded resume files and extract information"""
    
    def __init__(self):
        self.skill_patterns = [
            r'\b(Python|Java|JavaScript|React|Node\.js|Flask|Django)\b',
            r'\b(Machine Learning|ML|Deep Learning|AI|Data Science)\b',
            r'\b(TensorFlow|PyTorch|Keras|Scikit-learn)\b',
            r'\b(SQL|MongoDB|PostgreSQL|MySQL)\b',
            r'\b(AWS|Azure|GCP|Docker|Kubernetes)\b',
            r'\b(Git|GitHub|Linux|Ubuntu)\b'
        ]
        # Expanded skill dictionary for fuzzy matching
        self.skill_dict = [
            'Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Flask', 'Django', 'C++', 'C#', 'Go', 'Rust',
            'Machine Learning', 'Deep Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Keras',
            'Scikit-learn', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP', 'Docker',
            'Kubernetes', 'Git', 'GitHub', 'Linux', 'Ubuntu', 'HTML', 'CSS', 'TypeScript', 'Pandas', 'NumPy',
            'OpenCV', 'FastAPI', 'Flask', 'Django', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'Tableau', 'PowerBI'
        ]

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        if not PDF_SUPPORT:
            return "PDF parsing not available"
        
        try:
            from io import BytesIO
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        if not PDF_SUPPORT:
            return "DOCX parsing not available"
        
        try:
            from io import BytesIO
            doc = docx.Document(BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"DOCX extraction error: {e}")
            return ""
    
    def extract_entities_spacy(self, text: str) -> Dict:
        """Use spaCy and improved logic to extract names, organizations, emails, phones"""
        doc = nlp(text)
        entities = {'name': '', 'email': '', 'phone': '', 'university': '', 'degree': ''}
        
        # Improved name extraction
        # 1. Look at the first few lines for the name
        lines = text.split('\n')[:10]
        for line in lines:
            line = line.strip()
            # Skip lines with common resume keywords
            skip_keywords = ['linkedin', 'github', 'mobile', 'phone', 'email', 'portfolio', 'website', 'resume']
            if any(keyword in line.lower() for keyword in skip_keywords):
                continue
            # Look for proper names (2-4 words, no numbers, reasonable length)
            if (2 <= len(line.split()) <= 4 and 
                5 <= len(line) <= 50 and
                not any(char.isdigit() for char in line) and
                not '@' in line and
                not line.lower().startswith(('objective', 'summary', 'education', 'experience', 'skills'))):
                # Use spaCy to verify it's a person
                line_doc = nlp(line)
                person_ents = [ent for ent in line_doc.ents if ent.label_ == 'PERSON']
                if person_ents:
                    entities['name'] = person_ents[0].text
                    break
                # Fallback: if it looks like a name pattern
                elif re.match(r'^[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?$', line):
                    entities['name'] = line
                    break
        
        # Improved university extraction
        uni_patterns = [
            r'Indian Institute of Technology[^,\n]*',
            r'IIT [A-Za-z]+',
            r'National Institute of Technology[^,\n]*',
            r'NIT [A-Za-z]+',
            r'[A-Za-z\s]+ University',
            r'University of [A-Za-z\s]+',
            r'[A-Za-z\s]+ Institute of Technology',
            r'[A-Za-z\s]+ College'
        ]
        
        for pattern in uni_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities['university'] = match.group(0).strip()
                break
        
        # If spaCy didn't find university, try ORG entities
        if not entities['university']:
            for ent in doc.ents:
                if ent.label_ == 'ORG' and any(keyword in ent.text.lower() for keyword in ['university', 'institute', 'college', 'iit', 'nit']):
                    entities['university'] = ent.text
                    break
        
        # Email extraction
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if email_match:
            entities['email'] = email_match.group(0)
        
        # Improved phone extraction
        phone_patterns = [
            r'\+91[\s-]?[6-9]\d{9}',  # Indian mobile
            r'\+1[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}',  # US format
            r'[6-9]\d{9}',  # Indian without country code
            r'\d{10}',  # 10 digit number
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                entities['phone'] = phone_match.group(0)
                break
        
        # Degree extraction
        degree_patterns = [
            r'B\.?Tech|Bachelor of Technology',
            r'M\.?Tech|Master of Technology', 
            r'B\.?E\.?|Bachelor of Engineering',
            r'M\.?E\.?|Master of Engineering',
            r'PhD|Doctor of Philosophy',
            r'BSc|Bachelor of Science',
            r'MSc|Master of Science',
            r'MBA|Master of Business Administration',
            r'BCA|Bachelor of Computer Applications',
            r'MCA|Master of Computer Applications'
        ]
        
        for pattern in degree_patterns:
            degree_match = re.search(pattern, text, re.IGNORECASE)
            if degree_match:
                entities['degree'] = degree_match.group(0)
                break
        
        return entities

    def extract_skills_fuzzy(self, text: str) -> List[str]:
        """Use fuzzy matching to extract skills from resume text"""
        found_skills = set()
        
        # Split text into words and clean them
        words = re.findall(r'[A-Za-z0-9\+\.\#]+', text)
        
        # Filter out common non-skill words
        exclude_words = {'the', 'and', 'or', 'with', 'for', 'in', 'on', 'at', 'to', 'of', 'a', 'an', 'is', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'education', 'experience', 'project', 'projects', 'work', 'worked', 'working', 'developed', 'developing', 'created', 'creating', 'designed', 'designing', 'implemented', 'implementing', 'used', 'using', 'skills', 'technical', 'programming', 'languages', 'technologies', 'tools', 'frameworks', 'libraries', 'databases', 'platforms', 'systems', 'applications', 'software', 'hardware', 'mobile', 'web', 'linkedin', 'github', 'leetcode', 'email', 'phone', 'address'}
        
        # Also look for multi-word skills
        multi_word_skills = ['Machine Learning', 'Deep Learning', 'Data Science', 'Computer Vision', 'Natural Language Processing', 'Software Engineering', 'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Full Stack']
        
        for skill in multi_word_skills:
            if skill.lower() in text.lower():
                found_skills.add(skill)
        
        # Single word skills with fuzzy matching
        for word in words:
            if len(word) < 2 or word.lower() in exclude_words:
                continue
                
            # Find best match from skill dictionary
            match, score = process.extractOne(word, self.skill_dict)
            
            # Only add if score is high enough and it's not a common word
            if score > 90:  # Increased threshold for better precision
                found_skills.add(match)
        
        # Also check for exact matches in skill dictionary
        for skill in self.skill_dict:
            if skill.lower() in text.lower():
                found_skills.add(skill)
        
        return list(found_skills)[:15]  # Limit to top 15 skills

    def extract_contact_info(self, text: str) -> Dict:
        """Extract contact information from resume text"""
        contact_info = {}
        
        # Extract email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        contact_info['email'] = email_match.group(0) if email_match else ""
        
        # Enhanced phone extraction patterns
        phone_patterns = [
            r'(\+91[\s-]?)?[6-9]\d{9}',  # Indian mobile numbers
            r'(\+1[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{4}',  # US format
            r'(\+\d{1,3}[\s-]?)?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}',  # International
            r'Phone:?\s*(\+\d{1,3}[\s-]?)?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}',  # With label
            r'Mobile:?\s*(\+\d{1,3}[\s-]?)?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}',  # With mobile label
        ]
        
        phone = ""
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text, re.IGNORECASE)
            if phone_match:
                phone = phone_match.group(0).strip()
                # Clean up phone number
                phone = re.sub(r'Phone:?\s*|Mobile:?\s*', '', phone, flags=re.IGNORECASE)
                break
        
        contact_info['phone'] = phone
        
        # Enhanced name extraction
        lines = text.split('\n')[:8]  # Check more lines
        name = ""
        
        # Look for lines that might be names
        for line in lines:
            line = line.strip()
            if (5 <= len(line) <= 40 and 
                not '@' in line and 
                not any(char.isdigit() for char in line) and
                not line.lower().startswith(('phone', 'email', 'address', 'objective', 'summary')) and
                len(line.split()) <= 4):  # Names usually have 1-4 words
                name = line
                break
        
        contact_info['name'] = name
        
        return contact_info
    
    def extract_education(self, text: str) -> Dict:
        """Extract education information"""
        education = {"university": "", "degree": "", "gpa": ""}
        
        # Look for university names
        uni_patterns = [
            r'IIT\s+\w+', r'NIT\s+\w+', r'BITS\s+\w+',
            r'University\s+of\s+\w+', r'\w+\s+University',
            r'\w+\s+Institute\s+of\s+Technology'
        ]
        
        for pattern in uni_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                education['university'] = match.group(0)
                break
        
        # Look for degree
        degree_patterns = [
            r'B\.?Tech|Bachelor of Technology',
            r'M\.?Tech|Master of Technology',
            r'B\.?E\.|Bachelor of Engineering',
            r'Computer Science|CSE|CS'
        ]
        
        for pattern in degree_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                education['degree'] = match.group(0)
                break
        
        # Look for GPA/CGPA
        gpa_match = re.search(r'(GPA|CGPA|Grade)[\s:]*(\d+\.?\d*)', text, re.IGNORECASE)
        if gpa_match:
            education['gpa'] = gpa_match.group(2)
        
        return education
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract technical skills"""
        skills = set()
        
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str):
                    skills.add(match)
                else:
                    skills.add(match[0])
        
        return list(skills)
    
    def extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience and projects"""
        experience = []
        projects = []
        
        # Look for experience section
        exp_section = re.search(r'(EXPERIENCE|WORK|INTERNSHIP)(.*?)(?=(EDUCATION|PROJECT|SKILL|$))', 
                               text, re.IGNORECASE | re.DOTALL)
        
        if exp_section:
            exp_text = exp_section.group(2)
            # Simple extraction - look for company names and roles
            lines = exp_text.split('\n')
            current_exp = {}
            
            for line in lines:
                line = line.strip()
                if len(line) > 10 and any(word in line.lower() for word in ['intern', 'engineer', 'developer', 'analyst']):
                    if current_exp:
                        experience.append(current_exp)
                    current_exp = {"role": line, "description": ""}
                elif current_exp and line:
                    current_exp["description"] += line + " "
            
            if current_exp:
                experience.append(current_exp)
        
        # Look for projects
        proj_section = re.search(r'(PROJECT|PROJECTS)(.*?)(?=(EXPERIENCE|EDUCATION|SKILL|$))', 
                                text, re.IGNORECASE | re.DOTALL)
        
        if proj_section:
            proj_text = proj_section.group(2)
            lines = proj_text.split('\n')
            current_proj = {}
            
            for line in lines:
                line = line.strip()
                if len(line) > 5 and len(line) < 100 and not line.startswith('•') and not line.startswith('-'):
                    if current_proj:
                        projects.append(current_proj)
                    current_proj = {"title": line, "description": ""}
                elif current_proj and line:
                    current_proj["description"] += line + " "
            
            if current_proj:
                projects.append(current_proj)
        
        return experience, projects
    
    def parse_resume(self, filename: str, file_content: bytes) -> UserProfile:
        """Main parsing function"""
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_content)
        elif filename.lower().endswith('.docx'):
            text = self.extract_text_from_docx(file_content)
        else:
            raise ValueError("Unsupported file type")
        
        if not text:
            raise ValueError("Could not extract text from file")
        
        # Use spaCy for entity extraction
        entities = self.extract_entities_spacy(text)
        # Use fuzzy skill extraction
        skills = self.extract_skills_fuzzy(text)
        # Use old experience/project extraction
        experience, projects = self.extract_experience(text)
        
        # Create profile
        profile = UserProfile(
            name=entities.get('name', ''),
            email=entities.get('email', ''),
            phone=entities.get('phone', ''),
            university=entities.get('university', ''),
            degree=entities.get('degree', ''),
            gpa='',  # Could add spaCy pattern for GPA
            skills=skills,
            experience=experience,
            projects=projects,
            extracted_text=text
        )
        
        return profile

class AutoFillEngine:
    """Generate auto-fill suggestions based on profile and form fields"""
    
    def __init__(self):
        self.field_mappings = {
            'name': ['name', 'full_name', 'fullname', 'candidate_name'],
            'email': ['email', 'email_address', 'contact_email'],
            'phone': ['phone', 'mobile', 'contact_number', 'phone_number'],
            'university': ['university', 'college', 'institution', 'school'],
            'degree': ['degree', 'qualification', 'education', 'major'],
            'gpa': ['gpa', 'cgpa', 'grade', 'percentage'],
            'experience': ['experience', 'work_experience', 'previous_role'],
            'skills': ['skills', 'technical_skills', 'technologies'],
            'cover_letter': ['cover_letter', 'why_interested', 'motivation'],
            'resume': ['resume', 'cv', 'resume_text']
        }
    
    def match_field_type(self, field_name: str, field_label: str) -> str:
        """Semantic matching for field type using fuzzy string matching"""
        combined_text = (field_name + " " + field_label).lower()
        best_type = 'unknown'
        best_score = 0
        for field_type, keywords in self.field_mappings.items():
            for keyword in keywords:
                score = fuzz.partial_ratio(keyword.lower(), combined_text)
                if score > best_score:
                    best_score = score
                    best_type = field_type
        # If score is too low, fallback to 'unknown'
        if best_score < 60:
            return 'unknown'
        return best_type
    
    def generate_suggestion(self, field_type: str, profile: UserProfile, 
                          job_description: str = None, company_name: str = None) -> AutoFillSuggestion:
        """Generate suggestion for a specific field type"""
        
        suggestions = {
            'name': AutoFillSuggestion(
                field_name='name',
                suggested_value=profile.name,
                confidence=0.95 if profile.name else 0.0,
                explanation="Your name from resume"
            ),
            'email': AutoFillSuggestion(
                field_name='email',
                suggested_value=profile.email,
                confidence=0.95 if profile.email else 0.0,
                explanation="Your email from resume"
            ),
            'phone': AutoFillSuggestion(
                field_name='phone',
                suggested_value=profile.phone,
                confidence=0.9 if profile.phone else 0.0,
                explanation="Your phone number from resume"
            ),
            'university': AutoFillSuggestion(
                field_name='university',
                suggested_value=profile.university,
                confidence=0.9 if profile.university else 0.0,
                explanation="Your university from resume"
            ),
            'degree': AutoFillSuggestion(
                field_name='degree',
                suggested_value=profile.degree,
                confidence=0.85 if profile.degree else 0.0,
                explanation="Your degree from resume"
            ),
            'gpa': AutoFillSuggestion(
                field_name='gpa',
                suggested_value=profile.gpa or "",
                confidence=0.8 if profile.gpa else 0.0,
                explanation="Your GPA from resume"
            ),
            'skills': AutoFillSuggestion(
                field_name='skills',
                suggested_value=", ".join(profile.skills[:10]),
                confidence=0.9 if profile.skills else 0.0,
                explanation=f"Your top {min(10, len(profile.skills))} skills from resume"
            ),
            'experience': AutoFillSuggestion(
                field_name='experience',
                suggested_value=self._format_experience(profile.experience),
                confidence=0.8 if profile.experience else 0.0,
                explanation="Your work experience from resume"
            ),
            'cover_letter': AutoFillSuggestion(
                field_name='cover_letter',
                suggested_value=self._generate_cover_letter(profile, company_name, job_description),
                confidence=0.7,
                explanation="Generated cover letter based on your profile"
            ),
            'resume': AutoFillSuggestion(
                field_name='resume',
                suggested_value=self._generate_resume_summary(profile),
                confidence=0.8,
                explanation="Summary of your resume"
            )
        }
        
        suggestion = suggestions.get(field_type, AutoFillSuggestion(
            field_name=field_type,
            suggested_value="",
            confidence=0.0,
            explanation="No suggestion available"
        ))
        # Fallback: If confidence is low, try to use context from job description
        if suggestion.confidence < 0.5 and job_description:
            # Try to match skills from job description
            job_skills = set(re.findall(r'[A-Za-z0-9\+\.\#]+', job_description))
            matched_skills = [skill for skill in profile.skills if skill in job_skills]
            if matched_skills:
                suggestion.suggested_value = ", ".join(matched_skills)
                suggestion.confidence = 0.7
                suggestion.explanation += " (matched to job description)"
        return suggestion
    
    def _format_experience(self, experience: List[Dict]) -> str:
        """Format experience for text fields"""
        if not experience:
            return ""
        
        formatted = []
        for exp in experience[:3]:  # Top 3 experiences
            role = exp.get('role', '')
            desc = exp.get('description', '')[:100] + "..." if len(exp.get('description', '')) > 100 else exp.get('description', '')
            formatted.append(f"{role}: {desc}")
        
        return " | ".join(formatted)
    
    def _generate_cover_letter(self, profile: UserProfile, company_name: str = None, 
                             job_description: str = None) -> str:
        """Generate a personalized cover letter"""
        company = company_name or "your company"
        name = profile.name or "Your Name"
        university = profile.university or "my university"
        degree = profile.degree or "my degree"
        
        # Get top 3 relevant skills
        top_skills = profile.skills[:3] if profile.skills else ["programming", "problem-solving", "teamwork"]
        skills_text = ", ".join(top_skills)
        
        # If job description is provided, try to match skills
        if job_description and profile.skills:
            job_words = set(job_description.lower().split())
            matched_skills = [skill for skill in profile.skills if skill.lower() in job_words]
            if matched_skills:
                top_skills = matched_skills[:3]
                skills_text = ", ".join(top_skills)
        
        cover_letter = f"""Dear Hiring Manager,

I am excited to apply for this position at {company}. As a {degree} student at {university}, I have developed strong technical skills in {skills_text}.

Through my projects and experience, I have gained practical knowledge in software development and problem-solving. I am particularly interested in applying my skills to contribute to your team's success.

Thank you for considering my application.

Best regards,
{name}"""
        
        return cover_letter
    
    def _generate_resume_summary(self, profile: UserProfile) -> str:
        """Generate resume summary"""
        summary = f"{profile.name} - {profile.degree} student at {profile.university}. "
        summary += f"Skills: {', '.join(profile.skills[:5])}. "
        
        if profile.experience:
            summary += f"Experience: {profile.experience[0].get('role', '')}. "
        
        if profile.projects:
            summary += f"Key project: {profile.projects[0].get('title', '')}."
        
        return summary

# Initialize engines
resume_parser = ResumeParser()
autofill_engine = AutoFillEngine()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Career AutoFill Assistant API", "status": "running"}

@app.get("/health")
async def health_check_simple():
    """Simple health check for frontend"""
    return {"status": "ok", "message": "Backend server operational", "timestamp": datetime.now().isoformat()}

@app.get("/api/health")
@app.head("/api/health")
async def health_check():
    return {"status": "ok", "service": "career-autofill-backend", "timestamp": datetime.now().isoformat()}

# Frontend-specific endpoints
@app.post("/analyze-job")
async def analyze_job_for_frontend(request: dict):
    """Analyze job description for frontend"""
    
    if not AI_AGENTS_AVAILABLE or not ai_planner:
        # Fallback analysis without AI
        return {
            "match_score": 0.75,
            "matching_skills": ["Python", "Machine Learning", "Data Analysis"],
            "missing_skills": ["AWS", "Docker"],
            "keywords": ["python", "ml", "data"],
            "difficulty_level": "intermediate"
        }
    
    try:
        job_description = request.get('job_description', '')
        user_profile = request.get('user_profile', {})
        
        print(f"🤖 Analyzing job description for frontend")
        
        # Use AI planner to analyze job description
        strategy = ai_planner.plan_application(job_description)
        
        return {
            "match_score": strategy.get('match_score', 0.0),
            "matching_skills": strategy.get('matching_skills', []),
            "missing_skills": strategy.get('missing_skills', []),
            "keywords": strategy.get('keywords', []),
            "difficulty_level": strategy.get('difficulty_level', 'unknown'),
            "strategy": strategy
        }
        
    except Exception as e:
        print(f"❌ AI analysis failed: {e}")
        # Return fallback data
        return {
            "match_score": 0.65,
            "matching_skills": ["Communication", "Problem Solving"],
            "missing_skills": ["Specific Domain Knowledge"],
            "keywords": ["experience", "skills"],
            "difficulty_level": "moderate"
        }

@app.post("/generate-application")
async def generate_application_for_frontend(request: dict):
    """Generate application package for frontend"""
    
    if not AI_AGENTS_AVAILABLE or not ai_executor:
        # Fallback response without AI
        fallback_package = {
            "bullets": [
                "Developed and implemented machine learning models using Python and scikit-learn",
                "Analyzed large datasets to extract meaningful insights and patterns",
                "Collaborated with cross-functional teams to deliver data-driven solutions"
            ],
            "cover_letter": "Dear Hiring Manager,\n\nI am excited to apply for this position. My background in computer science and experience with data analysis make me a strong candidate for this role.\n\nBest regards,\nCandidate",
            "evaluation": {
                "relevance_score": 85,
                "ats_score": 90,
                "readability_score": 88,
                "completeness_score": 80,
                "consistency_score": 85
            }
        }
        return fallback_package
    
    try:
        analysis = request.get('analysis', {})
        user_profile = request.get('user_profile', {})
        job_description = analysis.get('job_description', request.get('job_description', ''))
        
        print(f"🎯 Generating application package for frontend")
        
        # First get or use existing strategy
        strategy = analysis.get('strategy', analysis)
        
        # Generate application materials
        application_package = ai_executor.generate_application_package(strategy)
        
        # Evaluate the generated package
        if ai_evaluator:
            evaluation_result = ai_evaluator.evaluate_complete_package(
                job_description, user_profile, application_package
            )
            
            # Add evaluation metrics
            application_package['evaluation'] = evaluation_result['scores']
            application_package['detailed_evaluation'] = evaluation_result['detailed_analysis']
        else:
            # Fallback evaluation scores
            application_package['evaluation'] = {
                "relevance_score": min(95, max(75, int(strategy.get('match_score', 0.8) * 100 + 10))),
                "ats_score": 88,  # Default ATS score
                "readability_score": 85,  # Default readability score
                "completeness_score": 82,
                "consistency_score": 80
            }
        
        return application_package
        
    except Exception as e:
        print(f"❌ Application generation failed: {e}")
        # Return fallback data
        return {
            "bullets": [
                "Applied analytical thinking and problem-solving skills to complex challenges",
                "Demonstrated strong communication and teamwork abilities in collaborative environments",
                "Utilized relevant technical skills to achieve project objectives and deliverables"
            ],
            "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my interest in this opportunity. My academic background and project experience have prepared me well for this role.\n\nSincerely,\nApplicant",
            "evaluation": {
                "relevance_score": 75,
                "ats_score": 80,
                "readability_score": 82,
                "completeness_score": 70,
                "consistency_score": 75
            }
        }

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse resume file"""
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Read file content
    content = await file.read()
    
    try:
        # Parse resume
        profile = resume_parser.parse_resume(file.filename, content)
        
        # Generate unique ID for this session
        session_id = str(uuid.uuid4())
        user_profiles[session_id] = profile
        
        # Format profile for frontend
        profile_dict = {
            "name": profile.name or "Unknown",
            "email": profile.email or "No email found",
            "phone": profile.phone or "No phone found",
            "university": profile.university or "Unknown University",
            "degree": profile.degree or "Unknown Degree",
            "skills": profile.skills[:10] if profile.skills else ["No skills extracted"],  # Limit to top 10
            "experience": profile.experience if profile.experience else [],
            "projects": profile.projects if profile.projects else [],
            "session_id": session_id
        }
        
        return {
            "success": True,
            "profile": profile_dict,
            "message": "Resume uploaded and parsed successfully"
        }
        
    except Exception as e:
        print(f"❌ Resume parsing error: {e}")
        # Return fallback data if parsing fails
        session_id = str(uuid.uuid4())
        fallback_profile = {
            "name": "Sample User",
            "email": "user@example.com",
            "phone": "+1-XXX-XXX-XXXX",
            "university": "Sample University",
            "degree": "Computer Science",
            "skills": ["Python", "Machine Learning", "Data Analysis", "Communication"],
            "experience": [],
            "projects": [],
            "session_id": session_id
        }
        return {
            "success": True,
            "profile": fallback_profile,
            "message": f"Resume parsing failed, using sample data: {str(e)}"
        }

@app.post("/get-suggestions/{session_id}")
async def get_autofill_suggestions(session_id: str, request: AutoFillRequest):
    """Get auto-fill suggestions for form fields"""
    
    if session_id not in user_profiles:
        raise HTTPException(status_code=404, detail="Session not found. Please upload resume first.")
    
    profile = user_profiles[session_id]
    suggestions = []
    
    for field in request.fields:
        # Determine field type
        field_type = autofill_engine.match_field_type(field.field_name, field.label)
        
        # Generate suggestion
        suggestion = autofill_engine.generate_suggestion(
            field_type, 
            profile, 
            request.job_description, 
            request.company_name
        )
        
        suggestion.field_name = field.field_name  # Use original field name
        suggestions.append(suggestion)
    
    return {
        "suggestions": suggestions,
        "profile_summary": {
            "name": profile.name,
            "skills_count": len(profile.skills),
            "experience_count": len(profile.experience),
            "projects_count": len(profile.projects)
        }
    }

@app.get("/profile/{session_id}")
async def get_profile(session_id: str):
    """Get parsed profile information"""
    
    if session_id not in user_profiles:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"profile": user_profiles[session_id].dict()}

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete user session and data"""
    
    if session_id in user_profiles:
        del user_profiles[session_id]
        return {"message": "Session deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Session not found")

# New endpoints for browser extension
@app.get("/extension/profile/{session_id}")
async def get_profile_for_extension(session_id: str):
    """Get user profile for browser extension"""
    if session_id not in user_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = user_profiles[session_id]
    return {
        "profile": {
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "university": profile.university,
            "degree": profile.degree,
            "skills": profile.skills,
            "experience": profile.experience,
            "projects": profile.projects
        }
    }

@app.post("/extension/autofill/{session_id}")
async def get_autofill_data(session_id: str, field_purposes: List[str] = None):
    """Get autofill data for specific field purposes"""
    if session_id not in user_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = user_profiles[session_id]
    
    # Default field purposes if not provided
    if not field_purposes:
        field_purposes = ['name', 'email', 'phone', 'university', 'degree', 'skills', 'experience', 'cover_letter']
    
    autofill_data = {}
    
    for purpose in field_purposes:
        suggestion = autofill_engine.generate_suggestion(purpose, profile)
        autofill_data[purpose] = {
            "value": suggestion.suggested_value,
            "confidence": suggestion.confidence
        }
    
    return {"autofill_data": autofill_data}

@app.get("/extension/sessions")
async def get_active_sessions():
    """Get list of active sessions for extension"""
    sessions = []
    for session_id, profile in user_profiles.items():
        sessions.append({
            "session_id": session_id,
            "name": profile.name,
            "email": profile.email,
            "created": "Recent"  # You could add timestamp tracking
        })
    
    return {"sessions": sessions}

@app.get("/demo-job-page.html", response_class=HTMLResponse)
async def serve_demo_page():
    """Serve the demo job page for testing"""
    demo_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo Job Application - Software Engineer at TechCorp</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .job-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .form-section { margin-bottom: 25px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
            input, textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
            textarea { height: 100px; resize: vertical; }
            .submit-btn { background: #4CAF50; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            .submit-btn:hover { background: #45a049; }
            .job-description { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="job-header">
                <h1>🚀 Software Engineer Position</h1>
                <h2>TechCorp Solutions</h2>
                <p>📍 San Francisco, CA | 💼 Full-time | 💰 $120k-$180k</p>
            </div>

            <div class="job-description">
                <h3>📋 Job Description</h3>
                <p>We are seeking a talented Software Engineer to join our dynamic team. The ideal candidate will have experience in React, Node.js, Python, and cloud technologies. You'll be working on cutting-edge projects that impact millions of users worldwide.</p>
                
                <h4>🔧 Required Skills:</h4>
                <ul>
                    <li>JavaScript, React, Node.js</li>
                    <li>Python, Django/Flask</li>
                    <li>AWS, Docker, Kubernetes</li>
                    <li>PostgreSQL, MongoDB</li>
                    <li>Git, CI/CD pipelines</li>
                </ul>

                <h4>🎓 Requirements:</h4>
                <ul>
                    <li>Bachelor's degree in Computer Science or related field</li>
                    <li>3+ years of software development experience</li>
                    <li>Strong problem-solving skills</li>
                    <li>Experience with agile methodologies</li>
                </ul>
            </div>

            <h3>📝 Application Form</h3>
            <form id="job-application-form">
                <div class="form-section">
                    <h4>Personal Information</h4>
                    <div class="form-group">
                        <label for="full-name">Full Name *</label>
                        <input type="text" id="full-name" name="full_name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone">
                    </div>

                    <div class="form-group">
                        <label for="location">Current Location</label>
                        <input type="text" id="location" name="location" placeholder="City, State">
                    </div>
                </div>

                <div class="form-section">
                    <h4>Education</h4>
                    <div class="form-group">
                        <label for="university">University/College</label>
                        <input type="text" id="university" name="university">
                    </div>

                    <div class="form-group">
                        <label for="degree">Degree</label>
                        <input type="text" id="degree" name="degree" placeholder="e.g. Bachelor of Science in Computer Science">
                    </div>

                    <div class="form-group">
                        <label for="graduation-year">Graduation Year</label>
                        <input type="number" id="graduation-year" name="graduation_year" min="1990" max="2030">
                    </div>
                </div>

                <div class="form-section">
                    <h4>Professional Experience</h4>
                    <div class="form-group">
                        <label for="experience">Work Experience</label>
                        <textarea id="experience" name="experience" placeholder="Describe your relevant work experience..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="skills">Technical Skills</label>
                        <textarea id="skills" name="skills" placeholder="List your technical skills separated by commas..."></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h4>Additional Information</h4>
                    <div class="form-group">
                        <label for="cover-letter">Cover Letter / Why are you interested in this position?</label>
                        <textarea id="cover-letter" name="cover_letter" style="height: 150px;" placeholder="Tell us why you're excited about this opportunity..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="portfolio">Portfolio/GitHub URL</label>
                        <input type="url" id="portfolio" name="portfolio" placeholder="https://github.com/yourusername">
                    </div>

                    <div class="form-group">
                        <label for="availability">When can you start?</label>
                        <select id="availability" name="availability">
                            <option value="">Select availability</option>
                            <option value="immediately">Immediately</option>
                            <option value="2-weeks">2 weeks notice</option>
                            <option value="1-month">1 month</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="submit-btn">🚀 Submit Application</button>
            </form>
        </div>

        <script>
            document.getElementById('job-application-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('🎉 Application submitted successfully! (This is just a demo)');
            });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=demo_html)

# Note: Static files serving will be added after React build is created
# app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
