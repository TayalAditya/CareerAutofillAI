#!/usr/bin/env python3
"""
Test Script for Career AutoFill AI Agent
Verifies all components are working correctly
"""
import requests
import json
import time
import sys
import os

API_BASE = "http://localhost:8000"

def test_backend_connection():
    """Test if backend is running"""
    print("🔄 Testing backend connection...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running successfully!")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        print("💡 Make sure to run: python backend/main.py")
        return False

def test_resume_upload():
    """Test resume upload functionality"""
    print("\n🔄 Testing resume upload...")
    
    # Create a test text file to simulate resume
    test_resume_content = """
    John Doe
    john.doe@example.com
    +1-555-123-4567
    
    Education:
    Computer Science, Sample University
    
    Skills:
    Python, Machine Learning, React, JavaScript, Data Analysis
    
    Experience:
    - Software Development Intern at Tech Corp
    - Built web applications using React and Node.js
    - Developed ML models for data prediction
    """
    
    with open("test_resume.txt", "w") as f:
        f.write(test_resume_content)
    
    try:
        with open("test_resume.txt", "rb") as f:
            files = {"file": ("test_resume.txt", f, "text/plain")}
            response = requests.post(f"{API_BASE}/upload-resume", files=files, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Resume upload successful!")
            print(f"   📄 Extracted profile: {result['profile']['name']}")
            print(f"   🎯 Skills found: {len(result['profile']['skills'])} skills")
            return result['profile']
        else:
            print(f"❌ Resume upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Resume upload error: {e}")
        return None
    finally:
        # Cleanup
        if os.path.exists("test_resume.txt"):
            os.remove("test_resume.txt")

def test_job_analysis(user_profile):
    """Test job description analysis"""
    print("\n🔄 Testing job analysis...")
    
    test_job_description = """
    Software Engineering Intern - Summer 2024
    
    We are seeking a motivated Computer Science student for a software engineering internship. 
    
    Requirements:
    - Currently pursuing Bachelor's degree in Computer Science
    - Experience with Python, JavaScript, and web development
    - Knowledge of machine learning and data analysis
    - Strong problem-solving skills
    - Excellent communication abilities
    
    Responsibilities:
    - Develop web applications using React and Node.js
    - Build machine learning models for data analysis
    - Collaborate with engineering team on projects
    - Write clean, maintainable code
    
    This is a great opportunity to gain hands-on experience with modern technologies.
    """
    
    try:
        payload = {
            "job_description": test_job_description,
            "user_profile": user_profile
        }
        
        response = requests.post(f"{API_BASE}/analyze-job", 
                                json=payload, 
                                headers={"Content-Type": "application/json"},
                                timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Job analysis successful!")
            print(f"   📊 Match score: {result.get('match_score', 0):.1%}")
            print(f"   ✅ Matching skills: {len(result.get('matching_skills', []))}")
            print(f"   ❌ Missing skills: {len(result.get('missing_skills', []))}")
            return result
        else:
            print(f"❌ Job analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Job analysis error: {e}")
        return None

def test_application_generation(analysis_result, user_profile):
    """Test application package generation"""
    print("\n🔄 Testing application generation...")
    
    try:
        payload = {
            "analysis": analysis_result,
            "user_profile": user_profile
        }
        
        response = requests.post(f"{API_BASE}/generate-application",
                                json=payload,
                                headers={"Content-Type": "application/json"},
                                timeout=20)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Application generation successful!")
            print(f"   📝 Generated {len(result.get('bullets', []))} resume bullets")
            print(f"   💼 Cover letter: {len(result.get('cover_letter', ''))} characters")
            
            if 'evaluation' in result:
                eval_scores = result['evaluation']
                print(f"   📊 Evaluation scores:")
                print(f"      Relevance: {eval_scores.get('relevance_score', 0)}%")
                print(f"      ATS Score: {eval_scores.get('ats_score', 0)}%")
                print(f"      Readability: {eval_scores.get('readability_score', 0)}%")
            
            return result
        else:
            print(f"❌ Application generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Application generation error: {e}")
        return None

def test_evaluation_system():
    """Test the evaluation system independently"""
    print("\n🔄 Testing evaluation system...")
    
    try:
        # Add current directory to path to import evaluation module
        sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
        
        from evaluation import ApplicationEvaluator
        
        evaluator = ApplicationEvaluator()
        
        # Test data
        sample_jd = "Looking for Python developer with ML experience"
        sample_profile = {"skills": ["Python", "Machine Learning"], "name": "Test User"}
        sample_package = {
            "bullets": ["Developed Python applications", "Implemented ML models"],
            "cover_letter": "Dear hiring manager, I am interested in this position."
        }
        
        result = evaluator.evaluate_complete_package(sample_jd, sample_profile, sample_package)
        
        print("✅ Evaluation system working!")
        print(f"   📊 Overall score: {result['scores']['overall_score']}")
        print(f"   🎯 Relevance: {result['scores']['relevance_score']}")
        print(f"   🤖 ATS: {result['scores']['ats_score']}")
        
        return True
    except ImportError as e:
        print(f"❌ Could not import evaluation module: {e}")
        return False
    except Exception as e:
        print(f"❌ Evaluation system error: {e}")
        return False

def run_full_test():
    """Run complete system test"""
    print("🚀 Career AutoFill AI Agent - System Test")
    print("=" * 50)
    
    # Test 1: Backend connection
    if not test_backend_connection():
        print("\n❌ Backend not available. Please start the backend first:")
        print("   cd backend && python main.py")
        return False
    
    # Test 2: Resume upload
    user_profile = test_resume_upload()
    if not user_profile:
        print("\n❌ Resume upload failed. Check backend logs.")
        return False
    
    # Test 3: Job analysis
    analysis_result = test_job_analysis(user_profile)
    if not analysis_result:
        print("\n❌ Job analysis failed. Check AI agents.")
        return False
    
    # Test 4: Application generation
    application_package = test_application_generation(analysis_result, user_profile)
    if not application_package:
        print("\n❌ Application generation failed.")
        return False
    
    # Test 5: Evaluation system
    evaluation_works = test_evaluation_system()
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 SYSTEM TEST COMPLETE!")
    print("=" * 50)
    print("✅ Backend connection: Working")
    print("✅ Resume upload: Working") 
    print("✅ Job analysis: Working")
    print("✅ Application generation: Working")
    print(f"{'✅' if evaluation_works else '⚠️'} Evaluation system: {'Working' if evaluation_works else 'Limited'}")
    
    print(f"\n🎯 Sample Results:")
    print(f"   📊 Match Score: {analysis_result.get('match_score', 0):.1%}")
    print(f"   📝 Resume Bullets: {len(application_package.get('bullets', []))}")
    print(f"   📊 Overall Quality: {application_package.get('evaluation', {}).get('relevance_score', 'N/A')}%")
    
    print(f"\n🌐 Frontend: http://localhost:3000")
    print(f"🔌 Backend: http://localhost:8000")
    print(f"📱 Extension: Load from browser-extension/ folder")
    
    return True

if __name__ == "__main__":
    success = run_full_test()
    if success:
        print("\n🎊 All systems operational! Your AI agent is ready to use.")
    else:
        print("\n🔧 Some components need attention. Check the errors above.")
    
    sys.exit(0 if success else 1)
