"""
Planner Agent: Parses job descriptions and extracts relevant requirements
"""
import re
import json
import os
from typing import List, Dict, Optional
from datetime import datetime
from sentence_transformers import SentenceTransformer
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

class JobDescriptionPlanner:
    def __init__(self):
        self.skill_patterns = [
            r"\b(Python|python)\b",
            r"\b(Flask|Django|FastAPI)\b", 
            r"\b(TensorFlow|PyTorch|Keras)\b",
            r"\b(React|Next\.js|Vue|Angular)\b",
            r"\b(Machine Learning|ML|Deep Learning|AI|Artificial Intelligence)\b",
            r"\b(Computer Vision|CV|Image Processing)\b",
            r"\b(Natural Language Processing|NLP)\b",
            r"\b(Docker|Kubernetes|AWS|Azure|GCP)\b",
            r"\b(Git|GitHub|GitLab)\b",
            r"\b(SQL|MySQL|PostgreSQL|MongoDB)\b",
            r"\b(Node\.js|JavaScript|TypeScript)\b",
            r"\b(Java|C\+\+|C#|Go|Rust)\b",
            r"\b(Linux|Unix|Ubuntu)\b",
            r"\b(API|REST|GraphQL)\b",
            r"\b(Data Science|Analytics|Statistics)\b"
        ]
        
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def extract_skills_regex(self, text: str) -> List[str]:
        """Extract skills using regex patterns"""
        found_skills = set()
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, text, flags=re.IGNORECASE)
            if matches:
                for match in matches:
                    if isinstance(match, str):
                        found_skills.add(match.strip())
                    else:
                        found_skills.add(match[0].strip())
        return list(found_skills)
    
    def extract_with_llm(self, jd_text: str) -> Dict:
        """Use LLM to extract structured information from job description"""
        prompt = f"""
        You are a job description parser. Extract the following information from the job description and return it as a JSON object:
        
        {{
            "title": "job title",
            "company": "company name (if mentioned)",
            "skills": ["list of technical skills required"],
            "keywords": ["6 most important keywords for this role"],
            "seniority": "intern/entry/mid/senior",
            "experience_required": "years of experience or 'none' for internships",
            "education": "education requirements",
            "location": "job location (if mentioned)",
            "job_type": "internship/full-time/part-time/contract"
        }}
        
        Job Description:
        {jd_text}
        
        Return only the JSON object, no additional text.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=500
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            else:
                # Fallback parsing
                return self._fallback_parse(jd_text)
                
        except Exception as e:
            print(f"LLM extraction failed: {e}")
            return self._fallback_parse(jd_text)
    
    def _fallback_parse(self, jd_text: str) -> Dict:
        """Fallback parsing using regex when LLM fails"""
        skills = self.extract_skills_regex(jd_text)
        
        # Extract title (usually in first few lines)
        lines = jd_text.split('\n')[:5]
        title = "Unknown Role"
        for line in lines:
            if any(word in line.lower() for word in ['intern', 'engineer', 'developer', 'analyst', 'scientist']):
                title = line.strip()
                break
        
        # Determine seniority
        seniority = "intern"
        if any(word in jd_text.lower() for word in ['intern', 'internship']):
            seniority = "intern"
        elif any(word in jd_text.lower() for word in ['entry', 'junior', 'graduate']):
            seniority = "entry"
        elif any(word in jd_text.lower() for word in ['senior', 'lead', 'principal']):
            seniority = "senior"
        else:
            seniority = "mid"
        
        return {
            "title": title,
            "company": "Unknown Company", 
            "skills": skills,
            "keywords": skills[:6] if len(skills) >= 6 else skills,
            "seniority": seniority,
            "experience_required": "none" if seniority == "intern" else "1-3 years",
            "education": "Bachelor's degree",
            "location": "Unknown",
            "job_type": "internship" if seniority == "intern" else "full-time"
        }
    
    def plan_application(self, jd_text: str, profile_path: str = "data/profile.json") -> Dict:
        """Main planning function that analyzes JD and creates application strategy"""
        
        # Load user profile
        try:
            with open(profile_path, 'r') as f:
                profile = json.load(f)
        except:
            print("Warning: Could not load profile, using basic analysis")
            profile = {}
        
        # Extract JD information
        jd_analysis = self.extract_with_llm(jd_text)
        
        # Match profile skills with JD requirements
        required_skills = jd_analysis.get("skills", [])
        user_skills = profile.get("skills", [])
        
        # Find matching skills
        matching_skills = []
        missing_skills = []
        
        for req_skill in required_skills:
            found_match = False
            for user_skill in user_skills:
                if req_skill.lower() in user_skill.lower() or user_skill.lower() in req_skill.lower():
                    matching_skills.append(req_skill)
                    found_match = True
                    break
            if not found_match:
                missing_skills.append(req_skill)
        
        # Calculate match score
        match_score = len(matching_skills) / len(required_skills) if required_skills else 0
        
        # Generate application strategy
        strategy = {
            "jd_analysis": jd_analysis,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "match_score": match_score,
            "recommended_focus": self._get_focus_areas(matching_skills, profile),
            "suggested_projects": self._suggest_relevant_projects(jd_analysis, profile),
            "timestamp": datetime.now().isoformat()
        }
        
        # Log the planning interaction
        self._log_interaction(jd_text, strategy)
        
        return strategy
    
    def _get_focus_areas(self, matching_skills: List[str], profile: Dict) -> List[str]:
        """Determine which aspects of profile to emphasize"""
        focus_areas = []
        
        # Check projects that match skills
        projects = profile.get("projects", [])
        for project in projects:
            project_techs = project.get("technologies", [])
            if any(skill.lower() in tech.lower() for skill in matching_skills for tech in project_techs):
                focus_areas.append(f"Highlight {project['title']} project")
        
        # Check experience
        experience = profile.get("experience", [])
        for exp in experience:
            if any(skill.lower() in exp.get("description", "").lower() for skill in matching_skills):
                focus_areas.append(f"Emphasize {exp['role']} experience")
        
        return focus_areas
    
    def _suggest_relevant_projects(self, jd_analysis: Dict, profile: Dict) -> List[Dict]:
        """Suggest which projects to highlight based on JD"""
        projects = profile.get("projects", [])
        relevant_projects = []
        
        jd_skills = [skill.lower() for skill in jd_analysis.get("skills", [])]
        
        for project in projects:
            project_techs = [tech.lower() for tech in project.get("technologies", [])]
            relevance_score = sum(1 for tech in project_techs if any(skill in tech for skill in jd_skills))
            
            if relevance_score > 0:
                relevant_projects.append({
                    "project": project,
                    "relevance_score": relevance_score,
                    "matching_techs": [tech for tech in project_techs if any(skill in tech for skill in jd_skills)]
                })
        
        # Sort by relevance
        relevant_projects.sort(key=lambda x: x["relevance_score"], reverse=True)
        return relevant_projects[:3]  # Top 3 most relevant
    
    def _log_interaction(self, jd_text: str, strategy: Dict):
        """Log the planning interaction"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "module": "planner",
            "input_jd": jd_text[:500] + "..." if len(jd_text) > 500 else jd_text,
            "output_strategy": strategy,
            "prompt_used": "JD analysis and skill matching prompt"
        }
        
        log_file = f"logs/planner_interaction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(log_file, 'w') as f:
                json.dump(log_entry, f, indent=2)
        except Exception as e:
            print(f"Failed to log interaction: {e}")

if __name__ == "__main__":
    # Test the planner
    planner = JobDescriptionPlanner()
    
    sample_jd = """
    Machine Learning Intern - Summer 2024
    
    We are looking for a passionate ML intern to join our AI team. 
    
    Requirements:
    - Currently pursuing Computer Science or related field
    - Strong programming skills in Python
    - Experience with TensorFlow or PyTorch
    - Knowledge of machine learning algorithms
    - Familiarity with data preprocessing and model evaluation
    - Good communication skills
    
    Preferred:
    - Experience with computer vision projects
    - Knowledge of Flask/Django for model deployment
    - Understanding of cloud platforms (AWS/Azure)
    
    This is a 3-month internship with potential for full-time conversion.
    """
    
    strategy = planner.plan_application(sample_jd)
    print("Planning Strategy:")
    print(json.dumps(strategy, indent=2))
