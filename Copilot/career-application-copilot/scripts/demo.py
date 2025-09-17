"""
Demo Script: Career Application Copilot
Works without external API keys or heavy dependencies
"""
import json
import os
import sys
from datetime import datetime

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def load_profile():
    """Load user profile"""
    with open('../data/profile.json', 'r') as f:
        return json.load(f)

def mock_planner(jd_text, profile):
    """Mock planner that works without external dependencies"""
    import re
    
    # Simple skill extraction
    skills_in_jd = []
    skill_patterns = [
        r'\b(python|Python)\b',
        r'\b(tensorflow|TensorFlow)\b', 
        r'\b(machine learning|ML)\b',
        r'\b(computer vision|CV)\b',
        r'\b(deep learning)\b',
        r'\b(flask|Flask)\b',
        r'\b(react|React)\b',
        r'\b(node\.js|Node.js)\b'
    ]
    
    for pattern in skill_patterns:
        if re.search(pattern, jd_text, re.IGNORECASE):
            skill_name = pattern.replace(r'\b', '').replace(r'\.', '.').split('|')[0].strip('()')
            skills_in_jd.append(skill_name)
    
    # Match with user skills
    user_skills = [skill.lower() for skill in profile.get('skills', [])]
    matched_skills = []
    
    for jd_skill in skills_in_jd:
        for user_skill in user_skills:
            if jd_skill.lower() in user_skill.lower():
                matched_skills.append(user_skill)
                break
    
    match_score = len(matched_skills) / max(len(skills_in_jd), 1)
    
    return {
        "jd_analysis": {
            "title": "Machine Learning Intern",
            "company": "TechCorp",
            "skills": skills_in_jd,
            "job_type": "internship"
        },
        "matching_skills": matched_skills,
        "missing_skills": [skill for skill in skills_in_jd if skill not in matched_skills],
        "match_score": match_score,
        "suggested_projects": profile.get('projects', [])[:2]
    }

def mock_executor(strategy, profile):
    """Mock executor that generates content without LLM"""
    
    matching_skills = strategy.get('matching_skills', [])
    projects = strategy.get('suggested_projects', [])
    
    # Generate resume bullets
    bullets = [
        f"Developed AI-powered learning platform using {matching_skills[0] if matching_skills else 'Python'} and modern frameworks",
        f"Built computer vision models achieving 94% accuracy on benchmark datasets using {matching_skills[1] if len(matching_skills) > 1 else 'TensorFlow'}",
        "Led team of 5 developers in agile development environment delivering projects ahead of schedule",
        f"Implemented RESTful APIs with Flask handling 1000+ daily requests with 99.9% uptime",
        "Optimized machine learning model performance reducing inference time by 40%",
        "Collaborated with cross-functional teams to deliver end-to-end ML solutions"
    ]
    
    # Generate cover letter
    company = strategy.get('jd_analysis', {}).get('company', 'TechCorp')
    role = strategy.get('jd_analysis', {}).get('title', 'Machine Learning Intern')
    
    cover_letter = f"""Dear Hiring Manager,

I am excited to apply for the {role} position at {company}. As a Computer Science student at {profile.get('university', 'IIT Mandi')} with hands-on experience in {', '.join(matching_skills[:3])}, I believe my technical skills and project experience make me an ideal candidate for this role.

Through my project {projects[0].get('title', 'DyslexoFly') if projects else 'DyslexoFly'}, I developed an AI-powered platform that demonstrates my ability to build end-to-end solutions using modern technologies. My experience with {', '.join(matching_skills[:2])} aligns perfectly with your requirements.

As a {profile.get('experience', [{}])[0].get('role', 'STAC Core Member')}, I have honed my collaboration and leadership skills while managing technical initiatives. I am particularly drawn to {company}'s innovative approach to technology and would welcome the opportunity to contribute to your team while learning from industry experts.

Thank you for considering my application. I look forward to discussing how my background and enthusiasm can contribute to your team.

Sincerely,
{profile.get('name', 'Aditya Tayal')}"""

    return {
        "bullets": bullets,
        "cover_letter": cover_letter,
        "job_match_score": strategy.get('match_score', 0.85),
        "generated_at": datetime.now().isoformat()
    }

def display_results(jd_file, company, role, strategy, package):
    """Display formatted results"""
    print(f"\n🎉 APPLICATION PACKAGE GENERATED")
    print("=" * 60)
    print(f"📄 Job: {role} at {company}")
    print(f"📊 Match Score: {strategy['match_score']:.1%}")
    print(f"✅ Skills Matched: {', '.join(strategy['matching_skills'][:3])}")
    
    print(f"\n📝 TAILORED RESUME BULLETS:")
    print("-" * 40)
    for i, bullet in enumerate(package['bullets'], 1):
        print(f"{i}. {bullet}")
    
    print(f"\n💌 COVER LETTER:")
    print("-" * 40)
    print(package['cover_letter'])
    
    print(f"\n📊 ANALYSIS:")
    print("-" * 40)
    print(f"Required Skills: {', '.join(strategy['jd_analysis']['skills'])}")
    print(f"Your Matching Skills: {', '.join(strategy['matching_skills'])}")
    if strategy['missing_skills']:
        print(f"Skills to Highlight More: {', '.join(strategy['missing_skills'][:3])}")
    
    # Save results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f"../logs/demo_output_{timestamp}.json"
    
    try:
        output_data = {
            "job_details": {"company": company, "role": role},
            "strategy": strategy,
            "package": package
        }
        
        os.makedirs("../logs", exist_ok=True)
        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"\n💾 Results saved to: {output_file}")
    except Exception as e:
        print(f"⚠️  Could not save results: {e}")

def demo_workflow():
    """Main demo workflow"""
    print("🚀 CAREER APPLICATION COPILOT - DEMO MODE")
    print("=" * 60)
    print("Author: Aditya Tayal | IIT Mandi CSE")
    print("Note: This demo works without external API dependencies")
    print("=" * 60)
    
    # Load profile
    try:
        profile = load_profile()
        print(f"✅ Profile loaded for {profile['name']}")
    except Exception as e:
        print(f"❌ Failed to load profile: {e}")
        return
    
    # Load sample JD
    jd_file = "../data/sample_jds/ml_intern_techcorp.txt"
    try:
        with open(jd_file, 'r') as f:
            jd_text = f.read()
        print(f"✅ Job description loaded ({len(jd_text)} characters)")
    except Exception as e:
        print(f"❌ Failed to load JD: {e}")
        return
    
    print("\n📋 Step 1: Analyzing job description...")
    strategy = mock_planner(jd_text, profile)
    print(f"   ✅ Analysis complete (Match Score: {strategy['match_score']:.1%})")
    
    print("\n✍️  Step 2: Generating application materials...")
    package = mock_executor(strategy, profile)
    print(f"   ✅ Generated {len(package['bullets'])} bullets and cover letter")
    
    print("\n📊 Step 3: Displaying results...")
    display_results(jd_file, "TechCorp", "ML Intern", strategy, package)
    
    print(f"\n🎯 DEMO COMPLETE!")
    print("=" * 60)
    print("To use with real LLM integration:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Add OpenAI API key to .env file")
    print("3. Run: python src/main.py --interactive")

if __name__ == "__main__":
    demo_workflow()
