"""
Career Application Copilot - Main CLI Interface
Author: Aditya Tayal
University: IIT Mandi, Department of CSE
"""
import argparse
import json
import os
import sys
from datetime import datetime
from typing import Optional

# Add src to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from planner import JobDescriptionPlanner
from executor import ApplicationExecutor  
from tracker import ApplicationTracker

class CareerCopilot:
    def __init__(self):
        self.planner = JobDescriptionPlanner()
        self.executor = ApplicationExecutor()
        self.tracker = ApplicationTracker()
        
    def process_application(self, 
                          jd_text: str, 
                          company: str = "Unknown Company",
                          role: str = "Unknown Role",
                          application_url: str = "",
                          auto_apply: bool = False) -> dict:
        """
        Complete end-to-end application processing pipeline
        """
        print(f"\n🚀 Processing application for {role} at {company}")
        print("="*60)
        
        # Step 1: Planning
        print("📋 Step 1: Analyzing job description...")
        strategy = self.planner.plan_application(jd_text)
        
        print(f"   ✅ Job analysis complete")
        print(f"   🎯 Match Score: {strategy['match_score']:.1%}")
        print(f"   ✅ Skills Matched: {', '.join(strategy['matching_skills'][:3])}")
        
        # Step 2: Execution  
        print("\n✍️  Step 2: Generating application materials...")
        application_package = self.executor.generate_application_package(strategy)
        
        print(f"   ✅ {len(application_package['bullets'])} resume bullets generated")
        print(f"   ✅ Cover letter generated ({len(application_package['cover_letter'])} chars)")
        
        # Step 3: Tracking
        print("\n📊 Step 3: Logging application...")
        app_id = self.tracker.log_application(
            company=company,
            role=role, 
            jd_text=jd_text,
            application_package=application_package,
            application_url=application_url
        )
        
        # Step 4: Auto-fill (if requested)
        if auto_apply:
            print("\n🤖 Step 4: Auto-filling application form...")
            self._auto_fill_demo(application_package)
        
        return {
            "application_id": app_id,
            "strategy": strategy,
            "package": application_package,
            "company": company,
            "role": role
        }
    
    def _auto_fill_demo(self, package: dict):
        """Demonstrate auto-fill capability with mock form"""
        try:
            from autofill import AutoFillDemo
            demo = AutoFillDemo()
            demo.fill_application_form(
                bullets=package['bullets'],
                cover_letter=package['cover_letter']
            )
            print("   ✅ Auto-fill demo completed")
        except ImportError:
            print("   ⚠️  Auto-fill module not available (install playwright)")
        except Exception as e:
            print(f"   ❌ Auto-fill failed: {e}")
    
    def display_results(self, result: dict):
        """Display formatted results to user"""
        package = result['package']
        strategy = result['strategy']
        
        print(f"\n🎉 Application package ready for {result['role']} at {result['company']}")
        print("="*60)
        
        # Resume bullets
        print("\n📝 TAILORED RESUME BULLETS:")
        print("-" * 40)
        for i, bullet in enumerate(package['bullets'], 1):
            print(f"{i}. {bullet}")
        
        # Cover letter preview
        print(f"\n💌 COVER LETTER PREVIEW:")
        print("-" * 40)
        cover_preview = package['cover_letter'][:300] + "..." if len(package['cover_letter']) > 300 else package['cover_letter']
        print(cover_preview)
        
        # Strategy insights
        print(f"\n🧠 STRATEGY INSIGHTS:")
        print("-" * 40)
        print(f"Match Score: {strategy['match_score']:.1%}")
        print(f"Skills Matched: {', '.join(strategy['matching_skills'])}")
        print(f"Skills to Highlight: {', '.join([skill for skill in strategy['matching_skills'][:3]])}")
        
        if strategy.get('missing_skills'):
            print(f"Skills to Develop: {', '.join(strategy['missing_skills'][:3])}")
        
        # Save full cover letter to file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        cover_file = f"logs/cover_letter_{result['company']}_{timestamp}.txt"
        try:
            with open(cover_file, 'w') as f:
                f.write(package['cover_letter'])
            print(f"\n💾 Full cover letter saved to: {cover_file}")
        except:
            pass
    
    def interactive_mode(self):
        """Interactive CLI mode for better user experience"""
        print("\n🎯 CAREER APPLICATION COPILOT")
        print("=" * 50)
        print("Author: Aditya Tayal | IIT Mandi CSE")
        print("=" * 50)
        
        while True:
            print("\nWhat would you like to do?")
            print("1. 📝 Process new job application")
            print("2. 📊 View application dashboard") 
            print("3. 🔄 Update application status")
            print("4. 📈 View analytics")
            print("5. 🚪 Exit")
            
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == "1":
                self._interactive_application()
            elif choice == "2":
                self.tracker.display_dashboard()
            elif choice == "3":
                self._interactive_status_update()
            elif choice == "4":
                self._display_analytics()
            elif choice == "5":
                print("👋 Thank you for using Career Copilot!")
                break
            else:
                print("❌ Invalid choice. Please try again.")
    
    def _interactive_application(self):
        """Interactive application processing"""
        print("\n📝 NEW JOB APPLICATION")
        print("-" * 30)
        
        # Get job details
        company = input("Company name: ").strip() or "Unknown Company"
        role = input("Role/Position: ").strip() or "Unknown Role"
        application_url = input("Application URL (optional): ").strip()
        
        # Get job description
        print("\nJob Description Options:")
        print("1. Paste job description text")
        print("2. Load from file")
        
        jd_choice = input("Choose option (1-2): ").strip()
        
        if jd_choice == "2":
            file_path = input("Enter file path: ").strip()
            try:
                with open(file_path, 'r') as f:
                    jd_text = f.read()
            except Exception as e:
                print(f"❌ Error reading file: {e}")
                return
        else:
            print("Paste job description (press Ctrl+Z then Enter on Windows, or Ctrl+D on Unix when done):")
            try:
                jd_text = sys.stdin.read()
            except KeyboardInterrupt:
                print("\n❌ Operation cancelled")
                return
        
        if not jd_text.strip():
            print("❌ No job description provided")
            return
        
        # Auto-fill option
        auto_apply = input("Enable auto-fill demo? (y/n): ").strip().lower() == 'y'
        
        # Process application
        try:
            result = self.process_application(
                jd_text=jd_text,
                company=company,
                role=role,
                application_url=application_url,
                auto_apply=auto_apply
            )
            
            self.display_results(result)
            
        except Exception as e:
            print(f"❌ Error processing application: {e}")
    
    def _interactive_status_update(self):
        """Interactive status update"""
        print("\n🔄 UPDATE APPLICATION STATUS")
        print("-" * 30)
        
        company = input("Company name: ").strip()
        role = input("Role: ").strip()
        new_status = input("New status (applied/interview/offer/rejected): ").strip()
        notes = input("Notes (optional): ").strip()
        
        if company and role and new_status:
            self.tracker.update_status(company, role, new_status, notes)
        else:
            print("❌ Company, role, and status are required")
    
    def _display_analytics(self):
        """Display application analytics"""
        analytics = self.tracker.get_application_analytics()
        
        print("\n📈 APPLICATION ANALYTICS")
        print("=" * 40)
        
        if analytics.get('error'):
            print(f"❌ Error: {analytics['error']}")
            return
        
        # Success rates
        if analytics.get('success_rate_by_company'):
            print("\n🏢 Success Rate by Company:")
            for company, rate in list(analytics['success_rate_by_company'].items())[:5]:
                print(f"   {company}: {rate}%")
        
        # Match score analysis
        match_analysis = analytics.get('match_score_vs_success', {})
        if match_analysis:
            print(f"\n🎯 Match Score Analysis:")
            print(f"   Successful apps avg: {match_analysis.get('avg_match_score_successful', 0):.1%}")
            print(f"   Unsuccessful apps avg: {match_analysis.get('avg_match_score_unsuccessful', 0):.1%}")
        
        # Top skills
        top_skills = analytics.get('top_skills_in_successful_apps', [])
        if top_skills:
            print(f"\n⭐ Top Skills in Successful Applications:")
            for skill in top_skills[:5]:
                print(f"   • {skill}")

def main():
    parser = argparse.ArgumentParser(
        description="Career Application Copilot - AI-powered job application automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --interactive                    # Interactive mode
  python main.py --jd job.txt --company "Google"  # Process specific job
  python main.py --dashboard                      # View dashboard
  
Author: Aditya Tayal | IIT Mandi CSE
        """
    )
    
    parser.add_argument("--jd", help="Path to job description file")
    parser.add_argument("--company", default="Unknown Company", help="Company name")
    parser.add_argument("--role", default="Unknown Role", help="Job role/position")
    parser.add_argument("--url", default="", help="Application URL")
    parser.add_argument("--auto-apply", action="store_true", help="Enable auto-fill demo")
    parser.add_argument("--interactive", action="store_true", help="Start interactive mode")
    parser.add_argument("--dashboard", action="store_true", help="Show application dashboard")
    parser.add_argument("--analytics", action="store_true", help="Show analytics")
    
    args = parser.parse_args()
    
    copilot = CareerCopilot()
    
    # Handle different modes
    if args.interactive:
        copilot.interactive_mode()
    elif args.dashboard:
        copilot.tracker.display_dashboard()
    elif args.analytics:
        copilot._display_analytics()
    elif args.jd:
        # File-based processing
        try:
            with open(args.jd, 'r') as f:
                jd_text = f.read()
            
            result = copilot.process_application(
                jd_text=jd_text,
                company=args.company,
                role=args.role,
                application_url=args.url,
                auto_apply=args.auto_apply
            )
            
            copilot.display_results(result)
            
        except FileNotFoundError:
            print(f"❌ File not found: {args.jd}")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        # Default to interactive mode
        copilot.interactive_mode()

if __name__ == "__main__":
    main()
