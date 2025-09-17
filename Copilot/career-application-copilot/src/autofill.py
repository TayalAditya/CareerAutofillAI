"""
Auto-Fill Demo: Automated form filling using Playwright
Demonstrates safe auto-fill capabilities on mock application forms
"""
import os
import json
import time
from typing import List
from datetime import datetime

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Playwright not available. Install with: pip install playwright && playwright install")

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    print("Selenium not available. Install with: pip install selenium")

class AutoFillDemo:
    def __init__(self, profile_path: str = "data/profile.json"):
        self.profile_path = profile_path
        self.profile = self._load_profile()
        
    def _load_profile(self) -> dict:
        """Load user profile for auto-filling personal information"""
        try:
            with open(self.profile_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load profile: {e}")
            return {}
    
    def fill_application_form(self, bullets: List[str], cover_letter: str, use_selenium: bool = False):
        """
        Main auto-fill function - fills mock application form
        """
        if use_selenium and SELENIUM_AVAILABLE:
            return self._fill_with_selenium(bullets, cover_letter)
        elif PLAYWRIGHT_AVAILABLE:
            return self._fill_with_playwright(bullets, cover_letter)
        else:
            print("❌ No automation framework available. Please install playwright or selenium.")
            return False
    
    def _fill_with_playwright(self, bullets: List[str], cover_letter: str) -> bool:
        """Fill application form using Playwright"""
        try:
            with sync_playwright() as p:
                # Launch browser in non-headless mode for demo
                browser = p.chromium.launch(headless=False, slow_mo=1000)  # 1 second delay between actions
                page = browser.new_page()
                
                # Navigate to mock form
                form_path = os.path.abspath("mock_portal/form.html")
                page.goto(f"file://{form_path}")
                
                print("🌐 Opening mock application form...")
                time.sleep(2)
                
                # Fill personal information
                print("📝 Filling personal information...")
                page.fill("#name", self.profile.get("name", ""))
                page.fill("#email", self.profile.get("email", ""))
                page.fill("#university", self.profile.get("university", ""))
                page.fill("#department", self.profile.get("department", ""))
                page.fill("#year", self.profile.get("year", ""))
                
                # Fill skills
                skills_text = ", ".join(self.profile.get("skills", [])[:10])
                page.fill("#skills", skills_text)
                
                # Fill resume bullets
                print("✍️  Adding resume bullets...")
                bullets_text = "\n".join([f"• {bullet}" for bullet in bullets])
                page.fill("#bullets", bullets_text)
                
                # Fill cover letter
                print("💌 Adding cover letter...")
                page.fill("#cover", cover_letter)
                
                # Fill additional fields if they exist
                try:
                    page.fill("#linkedin", self.profile.get("linkedin", ""))
                    page.fill("#github", self.profile.get("github", ""))
                    page.fill("#gpa", str(self.profile.get("gpa", "")))
                except:
                    pass  # These fields might not exist in all forms
                
                print("✅ Form filling completed!")
                print("⏳ Waiting 5 seconds before closing (demo purposes)...")
                time.sleep(5)
                
                # Optionally submit (commented out for safety)
                # page.click("#submit")
                
                browser.close()
                return True
                
        except Exception as e:
            print(f"❌ Playwright auto-fill failed: {e}")
            return False
    
    def _fill_with_selenium(self, bullets: List[str], cover_letter: str) -> bool:
        """Fill application form using Selenium"""
        try:
            # Setup Chrome options
            chrome_options = Options()
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            # chrome_options.add_argument("--headless")  # Uncomment for headless mode
            
            driver = webdriver.Chrome(options=chrome_options)
            
            # Navigate to mock form
            form_path = os.path.abspath("mock_portal/form.html")
            driver.get(f"file://{form_path}")
            
            print("🌐 Opening mock application form...")
            time.sleep(2)
            
            # Wait for form to load
            wait = WebDriverWait(driver, 10)
            
            # Fill personal information
            print("📝 Filling personal information...")
            name_field = wait.until(EC.presence_of_element_located((By.ID, "name")))
            name_field.send_keys(self.profile.get("name", ""))
            
            driver.find_element(By.ID, "email").send_keys(self.profile.get("email", ""))
            driver.find_element(By.ID, "university").send_keys(self.profile.get("university", ""))
            driver.find_element(By.ID, "department").send_keys(self.profile.get("department", ""))
            driver.find_element(By.ID, "year").send_keys(self.profile.get("year", ""))
            
            # Fill skills
            skills_text = ", ".join(self.profile.get("skills", [])[:10])
            driver.find_element(By.ID, "skills").send_keys(skills_text)
            
            # Fill resume bullets
            print("✍️  Adding resume bullets...")
            bullets_text = "\n".join([f"• {bullet}" for bullet in bullets])
            driver.find_element(By.ID, "bullets").send_keys(bullets_text)
            
            # Fill cover letter
            print("💌 Adding cover letter...")
            driver.find_element(By.ID, "cover").send_keys(cover_letter)
            
            print("✅ Form filling completed!")
            print("⏳ Waiting 5 seconds before closing (demo purposes)...")
            time.sleep(5)
            
            driver.quit()
            return True
            
        except Exception as e:
            print(f"❌ Selenium auto-fill failed: {e}")
            return False
    
    def create_application_pdf(self, bullets: List[str], cover_letter: str) -> str:
        """
        Generate a PDF application document (bonus feature)
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"logs/application_{timestamp}.pdf"
            
            doc = SimpleDocTemplate(filename, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Title
            title = Paragraph(f"Application - {self.profile.get('name', 'Candidate')}", styles['Title'])
            story.append(title)
            story.append(Spacer(1, 12))
            
            # Personal Info
            info = f"""
            Name: {self.profile.get('name', '')}<br/>
            Email: {self.profile.get('email', '')}<br/>
            University: {self.profile.get('university', '')} - {self.profile.get('department', '')}<br/>
            Year: {self.profile.get('year', '')}
            """
            story.append(Paragraph(info, styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Resume Bullets
            story.append(Paragraph("Resume Highlights:", styles['Heading2']))
            for bullet in bullets:
                story.append(Paragraph(f"• {bullet}", styles['Normal']))
            story.append(Spacer(1, 12))
            
            # Cover Letter
            story.append(Paragraph("Cover Letter:", styles['Heading2']))
            story.append(Paragraph(cover_letter, styles['Normal']))
            
            doc.build(story)
            print(f"✅ Application PDF generated: {filename}")
            return filename
            
        except ImportError:
            print("📄 PDF generation requires reportlab: pip install reportlab")
            return ""
        except Exception as e:
            print(f"❌ PDF generation failed: {e}")
            return ""
    
    def simulate_linkedin_application(self, job_url: str = None):
        """
        Simulate LinkedIn application process (DEMO ONLY - NOT FOR ACTUAL USE)
        This is purely for demonstration and educational purposes
        """
        print("🚨 DEMO MODE: LinkedIn Application Simulation")
        print("⚠️  This is for demonstration only - do not use on actual job postings")
        
        if not PLAYWRIGHT_AVAILABLE:
            print("❌ Playwright required for LinkedIn simulation")
            return False
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                page = browser.new_page()
                
                # Go to LinkedIn login (but don't actually log in)
                page.goto("https://www.linkedin.com/login")
                
                print("🌐 Opened LinkedIn login page")
                print("⚠️  Demo completed - actual login/application not performed for safety")
                
                time.sleep(3)
                browser.close()
                
        except Exception as e:
            print(f"❌ LinkedIn simulation failed: {e}")
            return False

def create_mock_form():
    """Create a mock HTML application form for testing"""
    form_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mock Job Application Form</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="text"], input[type="email"], textarea, select {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            box-sizing: border-box;
        }
        textarea {
            height: 120px;
            resize: vertical;
        }
        #bullets {
            height: 200px;
        }
        #cover {
            height: 300px;
        }
        button {
            background: #0073b1;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            background: #005885;
        }
        .demo-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>🚀 TechCorp Internship Application</h1>
        
        <div class="demo-note">
            <strong>Demo Form:</strong> This is a mock application form for testing the auto-fill functionality.
            No actual application will be submitted.
        </div>
        
        <form id="applicationForm">
            <div class="form-group">
                <label for="name">Full Name *</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="university">University *</label>
                <input type="text" id="university" name="university" required>
            </div>
            
            <div class="form-group">
                <label for="department">Department/Major *</label>
                <input type="text" id="department" name="department" required>
            </div>
            
            <div class="form-group">
                <label for="year">Academic Year</label>
                <input type="text" id="year" name="year">
            </div>
            
            <div class="form-group">
                <label for="skills">Technical Skills</label>
                <textarea id="skills" name="skills" placeholder="List your technical skills separated by commas"></textarea>
            </div>
            
            <div class="form-group">
                <label for="bullets">Resume Highlights *</label>
                <textarea id="bullets" name="bullets" placeholder="• Add your key achievements and experiences" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="cover">Cover Letter *</label>
                <textarea id="cover" name="cover" placeholder="Write your cover letter here..." required></textarea>
            </div>
            
            <div class="form-group">
                <label for="linkedin">LinkedIn Profile</label>
                <input type="text" id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/yourprofile">
            </div>
            
            <div class="form-group">
                <label for="github">GitHub Profile</label>
                <input type="text" id="github" name="github" placeholder="https://github.com/yourusername">
            </div>
            
            <div class="form-group">
                <label for="gpa">GPA</label>
                <input type="text" id="gpa" name="gpa" placeholder="8.5/10">
            </div>
            
            <button type="submit" id="submit">Submit Application</button>
        </form>
    </div>
    
    <script>
        document.getElementById('applicationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Demo form submitted! (No actual submission performed)');
        });
    </script>
</body>
</html>
"""
    
    os.makedirs("mock_portal", exist_ok=True)
    with open("mock_portal/form.html", "w") as f:
        f.write(form_html)
    
    print("✅ Mock application form created at mock_portal/form.html")

if __name__ == "__main__":
    # Create mock form for testing
    create_mock_form()
    
    # Test auto-fill
    demo = AutoFillDemo()
    
    sample_bullets = [
        "Developed AI-powered learning platform using Python and TensorFlow",
        "Built computer vision models achieving 94% accuracy on benchmark datasets",
        "Led team of 5 developers in agile development environment",
        "Implemented RESTful APIs with Flask serving 1000+ daily requests"
    ]
    
    sample_cover = """Dear Hiring Manager,

I am excited to apply for the Machine Learning Intern position at TechCorp. As a Computer Science student at IIT Mandi with a strong passion for AI and machine learning, I believe my technical skills and project experience make me an ideal candidate for this role.

Through my project DyslexoFly, I developed an AI-powered accessible learning platform that combines natural language processing with text-to-speech technology. This experience gave me hands-on expertise with TensorFlow, Python, and full-stack development using Flask and Next.js.

I am particularly drawn to TechCorp's innovative approach to machine learning applications and would love the opportunity to contribute to your team while learning from industry experts.

Thank you for considering my application.

Sincerely,
Aditya Tayal"""
    
    print("🚀 Starting auto-fill demo...")
    success = demo.fill_application_form(sample_bullets, sample_cover)
    
    if success:
        print("✅ Auto-fill demo completed successfully!")
    else:
        print("❌ Auto-fill demo failed")
