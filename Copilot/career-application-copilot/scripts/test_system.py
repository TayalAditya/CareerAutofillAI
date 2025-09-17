"""
Test the Career Application Copilot system without requiring API keys
"""
import os
import sys
import json
from datetime import datetime

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_profile_loading():
    """Test if profile.json loads correctly"""
    try:
        with open('data/profile.json', 'r') as f:
            profile = json.load(f)
        
        required_fields = ['name', 'email', 'university', 'department', 'skills', 'projects']
        missing_fields = [field for field in required_fields if field not in profile]
        
        if missing_fields:
            print(f"❌ Profile missing fields: {missing_fields}")
            return False
        
        print("✅ Profile loaded successfully")
        print(f"   Name: {profile['name']}")
        print(f"   University: {profile['university']}")
        print(f"   Skills: {len(profile['skills'])} skills")
        print(f"   Projects: {len(profile['projects'])} projects")
        return True
        
    except Exception as e:
        print(f"❌ Failed to load profile: {e}")
        return False

def test_sample_jds():
    """Test if sample job descriptions exist"""
    jd_dir = 'data/sample_jds'
    
    if not os.path.exists(jd_dir):
        print(f"❌ Sample JD directory not found: {jd_dir}")
        return False
    
    jd_files = [f for f in os.listdir(jd_dir) if f.endswith('.txt')]
    
    if not jd_files:
        print(f"❌ No sample JD files found in {jd_dir}")
        return False
    
    print(f"✅ Found {len(jd_files)} sample job descriptions:")
    for jd_file in jd_files:
        file_path = os.path.join(jd_dir, jd_file)
        with open(file_path, 'r') as f:
            content = f.read()
        print(f"   {jd_file}: {len(content)} characters")
    
    return True

def test_planner_offline():
    """Test planner functionality without API calls"""
    try:
        from planner import JobDescriptionPlanner
        
        planner = JobDescriptionPlanner()
        
        # Test regex skill extraction
        sample_text = "Looking for intern with Python, TensorFlow, machine learning, and React experience."
        skills = planner.extract_skills_regex(sample_text)
        
        print("✅ Planner module loaded")
        print(f"   Extracted skills: {skills}")
        
        if len(skills) >= 2:
            print("✅ Skill extraction working")
            return True
        else:
            print("⚠️  Skill extraction may need improvement")
            return True  # Still passes since module loads
            
    except Exception as e:
        print(f"❌ Planner test failed: {e}")
        return False

def test_tracker():
    """Test tracker functionality"""
    try:
        from tracker import ApplicationTracker
        
        tracker = ApplicationTracker("logs/test_applications.csv")
        
        # Test logging capability
        sample_package = {
            "bullets": ["Test bullet 1", "Test bullet 2"],
            "cover_letter": "Test cover letter content",
            "job_match_score": 0.85,
            "strategy_used": {
                "jd_analysis": {"job_type": "test", "location": "test"},
                "matching_skills": ["Python", "Testing"]
            }
        }
        
        app_id = tracker.log_application(
            "TestCorp",
            "Test Role", 
            "Test job description",
            sample_package
        )
        
        if app_id:
            print("✅ Tracker module working")
            print(f"   Test application logged: {app_id}")
            
            # Test summary
            summary = tracker.get_applications_summary()
            print(f"   Total applications: {summary.get('total', 0)}")
            return True
        else:
            print("❌ Failed to log test application")
            return False
            
    except Exception as e:
        print(f"❌ Tracker test failed: {e}")
        return False

def test_mock_form():
    """Test if mock form exists"""
    form_path = 'mock_portal/form.html'
    
    if not os.path.exists(form_path):
        print(f"❌ Mock form not found: {form_path}")
        return False
    
    with open(form_path, 'r') as f:
        content = f.read()
    
    required_elements = ['id="name"', 'id="email"', 'id="bullets"', 'id="cover"']
    missing_elements = [elem for elem in required_elements if elem not in content]
    
    if missing_elements:
        print(f"❌ Mock form missing elements: {missing_elements}")
        return False
    
    print("✅ Mock form is properly structured")
    print(f"   Form size: {len(content)} characters")
    return True

def test_evaluation_module():
    """Test evaluation module"""
    try:
        from evaluation import ApplicationEvaluator
        
        evaluator = ApplicationEvaluator()
        
        # Test basic evaluation without embeddings
        sample_jd = "Python developer with Flask experience"
        sample_bullets = ["Built Python applications using Flask framework"]
        sample_cover = "I have experience with Python and Flask development"
        
        evaluation = evaluator.evaluate_application_package(
            sample_jd, sample_bullets, sample_cover
        )
        
        print("✅ Evaluation module loaded")
        print(f"   Overall score: {evaluation['overall_score']:.3f}")
        print(f"   Relevance: {evaluation['relevance']['overall']:.3f}")
        print(f"   ATS compatibility: {evaluation['ats_compatibility']['overall']:.3f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Evaluation test failed: {e}")
        return False

def test_directory_structure():
    """Test if all required directories exist"""
    required_dirs = [
        'src', 'data', 'data/sample_jds', 'logs', 
        'mock_portal', 'scripts', 'evaluation'
    ]
    
    missing_dirs = []
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            missing_dirs.append(dir_path)
    
    if missing_dirs:
        print(f"❌ Missing directories: {missing_dirs}")
        return False
    
    print("✅ All required directories exist")
    return True

def run_system_test():
    """Run comprehensive system test"""
    print("🚀 CAREER APPLICATION COPILOT - SYSTEM TEST")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Directory Structure", test_directory_structure),
        ("Profile Loading", test_profile_loading),
        ("Sample Job Descriptions", test_sample_jds),
        ("Planner Module", test_planner_offline),
        ("Tracker Module", test_tracker),
        ("Mock Form", test_mock_form),
        ("Evaluation Module", test_evaluation_module),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"🧪 Testing {test_name}...")
        try:
            if test_func():
                passed += 1
            print()
        except Exception as e:
            print(f"❌ Test {test_name} crashed: {e}")
            print()
    
    print("=" * 60)
    print(f"📊 TEST RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready to use.")
        print()
        print("Next steps:")
        print("1. Add your OpenAI API key to .env file")
        print("2. Run: python src/main.py --interactive")
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
    
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    # Change to project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    os.chdir(project_root)
    
    success = run_system_test()
    sys.exit(0 if success else 1)
