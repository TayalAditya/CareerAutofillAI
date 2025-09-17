"""
Executor Agent: Generates tailored resume bullets and cover letters
"""
import json
import os
import re
from typing import Dict, List, Optional
from datetime import datetime
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Import fine-tuning libraries conditionally
try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from peft import PeftModel
    FINE_TUNING_AVAILABLE = True
except ImportError:
    FINE_TUNING_AVAILABLE = False
    print("Warning: Fine-tuning libraries not available, falling back to OpenAI API")

class ApplicationExecutor:
    def __init__(self, profile_path: str = "data/profile.json"):
        self.profile_path = profile_path
        self.profile = self._load_profile()
        
        # Load fine-tuned model if available
        self.fine_tuned_model = None
        self.tokenizer = None
        self.use_fine_tuned = False
        
        # Try to load the fine-tuned model
        if FINE_TUNING_AVAILABLE:
            self._load_fine_tuned_model()
    
    def _load_fine_tuned_model(self):
        """Load the fine-tuned LoRA model if available"""
        try:
            model_path = os.getenv("FINE_TUNED_MODEL_PATH", "./models/career-copilot-lora")
            base_model = "microsoft/DialoGPT-medium"  # This should match what was used in training
            
            # Check if model path exists
            if not os.path.exists(model_path):
                print(f"⚠️ Fine-tuned model not found at {model_path}, falling back to OpenAI API")
                return
                
            print(f"🔄 Loading fine-tuned model from {model_path}...")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(base_model)
            
            # Load the base model
            base_model = AutoModelForCausalLM.from_pretrained(
                base_model,
                load_in_8bit=True,
                device_map="auto",
                torch_dtype=torch.float16
            )
            
            # Load the fine-tuned model
            self.fine_tuned_model = PeftModel.from_pretrained(
                base_model,
                model_path,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            
            # Set generation config
            self.fine_tuned_model.config.pad_token_id = self.tokenizer.eos_token_id
            self.fine_tuned_model.eval()
            
            print("✅ Fine-tuned LoRA model loaded successfully!")
            self.use_fine_tuned = True
            
        except Exception as e:
            print(f"❌ Error loading fine-tuned model: {e}")
            print("⚠️ Falling back to OpenAI API")
            self.use_fine_tuned = False
        
    def _load_profile(self) -> Dict:
        """Load user profile from JSON file"""
        try:
            with open(self.profile_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading profile: {e}")
            return {}
    
    def generate_resume_bullets(self, strategy: Dict) -> List[str]:
        """Generate tailored resume bullets based on job strategy"""
        
        jd_analysis = strategy.get("jd_analysis", {})
        matching_skills = strategy.get("matching_skills", [])
        relevant_projects = strategy.get("suggested_projects", [])
        
        # Create context for LLM
        context = {
            "job_title": jd_analysis.get("title", "Unknown Role"),
            "required_skills": jd_analysis.get("skills", []),
            "matching_skills": matching_skills,
            "relevant_projects": relevant_projects,
            "profile": self.profile
        }
        
        prompt = f"""
        You are an expert resume writer specializing in creating ATS-friendly bullet points for undergraduate students applying to internships. 

        Create 6 compelling resume bullet points that highlight the candidate's most relevant experiences for this specific role. Each bullet should:
        - Start with a strong action verb
        - Include specific metrics, technologies, or outcomes where possible
        - Be 1-2 lines maximum
        - Incorporate keywords from the job requirements naturally
        - Showcase projects and experiences that match the role

        Job Title: {context['job_title']}
        Required Skills: {', '.join(context['required_skills'])}
        Candidate's Matching Skills: {', '.join(context['matching_skills'])}

        Candidate Profile:
        Education: {self.profile.get('university', '')} - {self.profile.get('department', '')}
        Key Projects: {json.dumps([p['project']['title'] + ': ' + p['project']['description'] for p in context['relevant_projects'][:3]], indent=2)}
        Experience: {json.dumps([exp['role'] + ' - ' + exp['description'] for exp in self.profile.get('experience', [])], indent=2)}

        Return ONLY a JSON object in this exact format:
        {{
            "bullets": [
                "First bullet point",
                "Second bullet point", 
                "Third bullet point",
                "Fourth bullet point",
                "Fifth bullet point",
                "Sixth bullet point"
            ]
        }}
        """
        
        # Log the prompt for evaluation
        print(f"🔄 Generating resume bullets using {'fine-tuned LoRA model' if self.use_fine_tuned else 'FALLBACK mode - model not available'}...")
        
        try:
            # Always try to use fine-tuned model first
            if self.use_fine_tuned and self.fine_tuned_model:
                print("✅ Using LoRA fine-tuned model for generation")
                return self._generate_with_fine_tuned(prompt)
            else:
                # If model not available, use local fallback (not API)
                print("⚠️ LoRA model not available, using local fallback generation")
                return self._fallback_bullets(context)
                
        except Exception as e:
            print(f"Error generating bullets: {e}")
            return self._fallback_bullets(context)
    
    def _generate_with_fine_tuned(self, prompt: str) -> List[str]:
        """Generate content using the fine-tuned model"""
        # Format prompt for the model
        formatted_prompt = f"Input: {prompt}\n\nOutput:"
        
        # Tokenize the prompt
        inputs = self.tokenizer(formatted_prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
        
        # Generate the response
        with torch.no_grad():
            outputs = self.fine_tuned_model.generate(
                inputs["input_ids"],
                max_new_tokens=600,
                temperature=0.2,
                top_p=0.95,
                num_return_sequences=1,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode the response
        response_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract the output part
        output_text = response_text.split("Output:")[1].strip() if "Output:" in response_text else response_text
        
        # Try to extract JSON
        json_match = re.search(r'\{.*\}', output_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group(0))
                bullets = result.get("bullets", [])
                
                # Log the interaction
                self._log_interaction("resume_bullets_fine_tuned", prompt, output_text, bullets)
                return bullets
            except json.JSONDecodeError:
                print("⚠️ Invalid JSON from fine-tuned model output")
                # Extract any bullet points using regex as fallback
                bullet_matches = re.findall(r'"([^"]+)"', output_text)
                if bullet_matches and len(bullet_matches) >= 4:
                    print("✅ Successfully extracted bullet points using regex")
                    return bullet_matches[:6]  # Take up to 6 bullets
        
        print("⚠️ Could not extract structured output from fine-tuned model, using fallback generation")
        return self._fallback_bullets({"job_title": "LoRA Model Generation", 
                                      "relevant_projects": [], 
                                      "matching_skills": ["python", "machine learning", "data science"]})
    
    def _generate_with_openai(self, prompt: str) -> List[str]:
        """Generate content using OpenAI API"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=600
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group(0))
            bullets = result.get("bullets", [])
            
            # Log the interaction
            self._log_interaction("resume_bullets_openai", prompt, response_text, bullets)
            return bullets
        else:
            # Create fallback bullets without context reference
            return self._fallback_bullets({"job_title": "Unknown Role"})
    
    def _fallback_bullets(self, context: Dict) -> List[str]:
        """Fallback bullet generation when LLM fails"""
        bullets = [
            f"Developed {context['relevant_projects'][0]['project']['title'] if context['relevant_projects'] else 'software projects'} using {', '.join(context['matching_skills'][:3])}",
            f"Built full-stack applications with {self.profile.get('skills', ['Python', 'JavaScript'])[0]} and modern frameworks",
            f"Implemented machine learning models achieving high accuracy on real-world datasets",
            "Collaborated in team projects and hackathons, demonstrating strong problem-solving skills",
            f"Managed version control and deployment using Git and cloud platforms",
            f"Led technical initiatives as {self.profile.get('experience', [{}])[0].get('role', 'team member')} with measurable impact"
        ]
        return bullets[:6]
    
    def generate_cover_letter(self, strategy: Dict) -> str:
        """Generate tailored cover letter based on job strategy"""
        
        jd_analysis = strategy.get("jd_analysis", {})
        matching_skills = strategy.get("matching_skills", [])
        relevant_projects = strategy.get("suggested_projects", [])
        focus_areas = strategy.get("recommended_focus", [])
        
        prompt = f"""
        You are a professional cover letter writer specializing in internship applications for computer science students.

        Write a compelling cover letter (maximum 350 words) for this internship application. The cover letter should:
        - Have a strong opening that mentions the specific role and company
        - Highlight 2-3 most relevant projects/experiences that match the job requirements
        - Demonstrate genuine interest in the role and company
        - Show how the candidate's skills align with the position
        - End with a professional closing and call to action
        - Use a confident but humble tone appropriate for a student

        Job Details:
        - Title: {jd_analysis.get('title', 'Unknown Role')}
        - Company: {jd_analysis.get('company', 'the company')}
        - Required Skills: {', '.join(jd_analysis.get('skills', []))}
        
        Candidate Information:
        - Name: {self.profile.get('name', 'Student')}
        - University: {self.profile.get('university', '')} - {self.profile.get('department', '')}
        - Matching Skills: {', '.join(matching_skills)}
        - Top Relevant Project: {relevant_projects[0]['project']['title'] + ' - ' + relevant_projects[0]['project']['description'] if relevant_projects else 'Various technical projects'}
        - Key Experience: {self.profile.get('experience', [{}])[0].get('role', '') + ' - ' + self.profile.get('experience', [{}])[0].get('description', '') if self.profile.get('experience') else 'Academic projects and coursework'}

        Focus Areas: {', '.join(focus_areas)}

        Write the cover letter in a professional format with proper paragraphs. Do not include a date or address header.
        """
        
        try:
            # Use fine-tuned model if available
            if self.use_fine_tuned and self.fine_tuned_model:
                print("✅ Using LoRA fine-tuned model for cover letter generation")
                cover_letter = self._generate_cover_letter_with_fine_tuned(prompt)
                return cover_letter
            else:
                # If model not available, use local fallback
                print("⚠️ LoRA model not available, using fallback cover letter generation")
                return self._fallback_cover_letter(jd_analysis)
            
        except Exception as e:
            print(f"Error generating cover letter: {e}")
            return self._fallback_cover_letter(jd_analysis)
    
    def _fallback_cover_letter(self, jd_analysis: Dict) -> str:
        """Fallback cover letter when LLM fails"""
        name = self.profile.get('name', 'Student')
        university = self.profile.get('university', 'University')
        department = self.profile.get('department', 'Computer Science')
        
        cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {jd_analysis.get('title', 'internship')} position at {jd_analysis.get('company', 'your company')}. As a {department} student at {university}, I am excited about the opportunity to contribute to your team and grow my skills in a professional environment.

Through my academic projects and personal initiatives, I have developed strong proficiency in {', '.join(self.profile.get('skills', ['Python', 'Machine Learning'])[:3])}. My recent project, {self.profile.get('projects', [{}])[0].get('title', 'a technical project')}, demonstrates my ability to build end-to-end solutions and work with modern technologies that align with your requirements.

As a {self.profile.get('experience', [{}])[0].get('role', 'student leader')}, I have honed my collaboration and problem-solving skills while managing technical initiatives. I am particularly drawn to this role because it offers the opportunity to apply my technical skills while learning from experienced professionals in the industry.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team. Thank you for considering my application.

Sincerely,
{name}"""
        
        return cover_letter
    
    def generate_application_package(self, strategy: Dict) -> Dict:
        """Generate complete application package (bullets + cover letter)"""
        
        print("Generating tailored resume bullets...")
        bullets = self.generate_resume_bullets(strategy)
        
        print("Generating personalized cover letter...")
        cover_letter = self.generate_cover_letter(strategy)
        
        package = {
            "bullets": bullets,
            "cover_letter": cover_letter,
            "strategy_used": strategy,
            "generated_at": datetime.now().isoformat(),
            "job_match_score": strategy.get("match_score", 0)
        }
        
        # Save the complete package
        self._save_package(package)
        
        return package
    
    def _save_package(self, package: Dict):
        """Save the generated application package"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"logs/application_package_{timestamp}.json"
        
        try:
            with open(filename, 'w') as f:
                json.dump(package, f, indent=2)
            print(f"Application package saved to {filename}")
        except Exception as e:
            print(f"Failed to save package: {e}")
    
    def _log_interaction(self, generation_type: str, prompt: str, response: str, output: any):
        """Log LLM interactions for debugging and evaluation"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "module": "executor",
            "generation_type": generation_type,
            "prompt": prompt,
            "raw_response": response,
            "parsed_output": output,
            "model": "gpt-3.5-turbo"
        }
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_file = f"logs/executor_{generation_type}_{timestamp}.json"
        
        try:
            with open(log_file, 'w') as f:
                json.dump(log_entry, f, indent=2)
        except Exception as e:
            print(f"Failed to log interaction: {e}")

if __name__ == "__main__":
    # Test the executor
    executor = ApplicationExecutor()
    
    # Sample strategy (normally comes from planner)
    sample_strategy = {
        "jd_analysis": {
            "title": "Machine Learning Intern",
            "company": "Tech Corp",
            "skills": ["Python", "TensorFlow", "Machine Learning", "Computer Vision"],
            "seniority": "intern"
        },
        "matching_skills": ["Python", "TensorFlow", "Machine Learning"],
        "missing_skills": ["Computer Vision"],
        "match_score": 0.75,
        "suggested_projects": [
            {
                "project": {
                    "title": "DyslexoFly",
                    "description": "AI-powered accessible learning platform"
                },
                "relevance_score": 3
            }
        ]
    }
    
    package = executor.generate_application_package(sample_strategy)
    print("\nGenerated Application Package:")
    print("Resume Bullets:")
    for i, bullet in enumerate(package["bullets"], 1):
        print(f"{i}. {bullet}")
    
    print(f"\nCover Letter:\n{package['cover_letter']}")
    print(f"\nJob Match Score: {package['job_match_score']:.2%}")
