"""
Tracker Agent: Logs applications and manages application status
"""
import csv
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd

class ApplicationTracker:
    def __init__(self, log_file: str = "logs/applications.csv"):
        self.log_file = log_file
        self.ensure_log_file_exists()
    
    def ensure_log_file_exists(self):
        """Create log file with headers if it doesn't exist"""
        if not os.path.exists(self.log_file):
            os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
            
            headers = [
                "timestamp", "company", "role", "job_type", "location", 
                "jd_snippet", "bullets", "cover_letter_snippet", "status",
                "match_score", "skills_matched", "application_url", "notes"
            ]
            
            with open(self.log_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(headers)
    
    def log_application(self, 
                       company: str, 
                       role: str, 
                       jd_text: str, 
                       application_package: Dict,
                       application_url: str = "",
                       notes: str = "") -> str:
        """Log a new application entry"""
        
        strategy = application_package.get("strategy_used", {})
        jd_analysis = strategy.get("jd_analysis", {})
        
        row_data = {
            "timestamp": datetime.now().isoformat(),
            "company": company,
            "role": role,
            "job_type": jd_analysis.get("job_type", "unknown"),
            "location": jd_analysis.get("location", "unknown"),
            "jd_snippet": jd_text[:300] + "..." if len(jd_text) > 300 else jd_text,
            "bullets": " | ".join(application_package.get("bullets", [])),
            "cover_letter_snippet": application_package.get("cover_letter", "")[:200] + "...",
            "status": "applied",
            "match_score": application_package.get("job_match_score", 0),
            "skills_matched": ", ".join(strategy.get("matching_skills", [])),
            "application_url": application_url,
            "notes": notes
        }
        
        # Append to CSV
        try:
            with open(self.log_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=row_data.keys())
                writer.writerow(row_data)
            
            application_id = f"{company}_{role}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            print(f"✅ Application logged: {application_id}")
            return application_id
            
        except Exception as e:
            print(f"❌ Failed to log application: {e}")
            return ""
    
    def update_status(self, company: str, role: str, new_status: str, notes: str = ""):
        """Update application status"""
        try:
            # Read current data
            df = pd.read_csv(self.log_file)
            
            # Find matching application (most recent if multiple)
            mask = (df['company'] == company) & (df['role'] == role)
            matching_rows = df[mask]
            
            if matching_rows.empty:
                print(f"❌ No application found for {company} - {role}")
                return False
            
            # Update the most recent application
            latest_idx = matching_rows.index[-1]
            df.loc[latest_idx, 'status'] = new_status
            
            if notes:
                existing_notes = df.loc[latest_idx, 'notes']
                df.loc[latest_idx, 'notes'] = f"{existing_notes} | {datetime.now().strftime('%Y-%m-%d')}: {notes}"
            
            # Save back to CSV
            df.to_csv(self.log_file, index=False)
            print(f"✅ Status updated: {company} - {role} -> {new_status}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to update status: {e}")
            return False
    
    def get_applications_summary(self) -> Dict:
        """Get summary statistics of applications"""
        try:
            df = pd.read_csv(self.log_file)
            
            if df.empty:
                return {"total": 0, "by_status": {}, "by_company": {}, "avg_match_score": 0}
            
            summary = {
                "total": len(df),
                "by_status": df['status'].value_counts().to_dict(),
                "by_company": df['company'].value_counts().head(10).to_dict(),
                "by_role": df['role'].value_counts().head(10).to_dict(),
                "avg_match_score": df['match_score'].mean(),
                "recent_applications": df.tail(5)[['timestamp', 'company', 'role', 'status']].to_dict('records')
            }
            
            return summary
            
        except Exception as e:
            print(f"❌ Failed to generate summary: {e}")
            return {"error": str(e)}
    
    def get_pending_followups(self, days_threshold: int = 7) -> List[Dict]:
        """Get applications that need follow-up"""
        try:
            df = pd.read_csv(self.log_file)
            
            if df.empty:
                return []
            
            # Convert timestamp to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Find applications older than threshold with no response
            cutoff_date = datetime.now() - timedelta(days=days_threshold)
            
            pending_mask = (
                (df['status'] == 'applied') & 
                (df['timestamp'] < cutoff_date)
            )
            
            pending_apps = df[pending_mask]
            
            return pending_apps[['company', 'role', 'timestamp', 'application_url']].to_dict('records')
            
        except Exception as e:
            print(f"❌ Failed to get pending follow-ups: {e}")
            return []
    
    def export_applications(self, format: str = "json", filter_status: str = None) -> str:
        """Export applications to different formats"""
        try:
            df = pd.read_csv(self.log_file)
            
            if filter_status:
                df = df[df['status'] == filter_status]
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            if format.lower() == "json":
                output_file = f"logs/applications_export_{timestamp}.json"
                df.to_json(output_file, orient='records', indent=2)
            elif format.lower() == "excel":
                output_file = f"logs/applications_export_{timestamp}.xlsx"
                df.to_excel(output_file, index=False)
            else:
                output_file = f"logs/applications_export_{timestamp}.csv"
                df.to_csv(output_file, index=False)
            
            print(f"✅ Applications exported to {output_file}")
            return output_file
            
        except Exception as e:
            print(f"❌ Failed to export: {e}")
            return ""
    
    def get_application_analytics(self) -> Dict:
        """Advanced analytics on application data"""
        try:
            df = pd.read_csv(self.log_file)
            
            if df.empty:
                return {"message": "No data available"}
            
            # Convert timestamp to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['date'] = df['timestamp'].dt.date
            
            analytics = {
                "applications_over_time": df.groupby('date').size().tail(30).to_dict(),
                "success_rate_by_company": self._calculate_success_rates(df, 'company'),
                "success_rate_by_role": self._calculate_success_rates(df, 'role'),
                "match_score_vs_success": self._analyze_match_score_correlation(df),
                "top_skills_in_successful_apps": self._analyze_successful_skills(df),
                "application_timeline": {
                    "fastest_response": self._get_fastest_response(df),
                    "average_response_time": self._get_average_response_time(df)
                }
            }
            
            return analytics
            
        except Exception as e:
            print(f"❌ Failed to generate analytics: {e}")
            return {"error": str(e)}
    
    def _calculate_success_rates(self, df: pd.DataFrame, group_by: str) -> Dict:
        """Calculate success rates grouped by specified column"""
        success_statuses = ['interview', 'offer', 'accepted']
        
        grouped = df.groupby(group_by)['status'].apply(
            lambda x: (x.isin(success_statuses).sum() / len(x)) * 100
        ).round(2)
        
        return grouped.to_dict()
    
    def _analyze_match_score_correlation(self, df: pd.DataFrame) -> Dict:
        """Analyze correlation between match score and success"""
        success_statuses = ['interview', 'offer', 'accepted']
        
        successful = df[df['status'].isin(success_statuses)]['match_score'].mean()
        unsuccessful = df[~df['status'].isin(success_statuses)]['match_score'].mean()
        
        return {
            "avg_match_score_successful": round(successful, 3) if not pd.isna(successful) else 0,
            "avg_match_score_unsuccessful": round(unsuccessful, 3) if not pd.isna(unsuccessful) else 0,
            "correlation": "positive" if successful > unsuccessful else "negative"
        }
    
    def _analyze_successful_skills(self, df: pd.DataFrame) -> List[str]:
        """Find most common skills in successful applications"""
        success_statuses = ['interview', 'offer', 'accepted']
        successful_apps = df[df['status'].isin(success_statuses)]
        
        all_skills = []
        for skills_str in successful_apps['skills_matched'].dropna():
            skills = [skill.strip() for skill in skills_str.split(',')]
            all_skills.extend(skills)
        
        if not all_skills:
            return []
        
        skill_counts = pd.Series(all_skills).value_counts().head(10)
        return skill_counts.index.tolist()
    
    def _get_fastest_response(self, df: pd.DataFrame) -> str:
        """Get fastest response time"""
        # This would require parsing response dates - simplified for now
        return "Feature coming soon"
    
    def _get_average_response_time(self, df: pd.DataFrame) -> str:
        """Get average response time"""
        # This would require parsing response dates - simplified for now
        return "Feature coming soon"
    
    def display_dashboard(self):
        """Display a simple text dashboard"""
        summary = self.get_applications_summary()
        pending = self.get_pending_followups()
        
        print("\n" + "="*50)
        print("📊 APPLICATION TRACKER DASHBOARD")
        print("="*50)
        
        print(f"📈 Total Applications: {summary.get('total', 0)}")
        
        if summary.get('by_status'):
            print("\n📋 Status Breakdown:")
            for status, count in summary['by_status'].items():
                print(f"   {status.title()}: {count}")
        
        print(f"\n🎯 Average Match Score: {summary.get('avg_match_score', 0):.1%}")
        
        if pending:
            print(f"\n⏰ Pending Follow-ups ({len(pending)} applications):")
            for app in pending[:3]:
                print(f"   {app['company']} - {app['role']}")
        
        if summary.get('recent_applications'):
            print("\n🕒 Recent Applications:")
            for app in summary['recent_applications']:
                timestamp = datetime.fromisoformat(app['timestamp']).strftime('%m/%d %H:%M')
                print(f"   {timestamp} - {app['company']} ({app['status']})")
        
        print("="*50)

if __name__ == "__main__":
    # Test the tracker
    tracker = ApplicationTracker()
    
    # Sample application package
    sample_package = {
        "bullets": [
            "Developed AI-powered learning platform using Python and TensorFlow",
            "Built computer vision models achieving 94% accuracy",
            "Led team of 5 developers in agile development environment"
        ],
        "cover_letter": "Dear Hiring Manager, I am excited to apply for this position...",
        "job_match_score": 0.85,
        "strategy_used": {
            "jd_analysis": {"job_type": "internship", "location": "Remote"},
            "matching_skills": ["Python", "TensorFlow", "Machine Learning"]
        }
    }
    
    # Log a test application
    app_id = tracker.log_application(
        "TechCorp", 
        "ML Intern", 
        "Looking for ML intern with Python and TensorFlow experience...",
        sample_package,
        "https://techcorp.com/careers/ml-intern"
    )
    
    # Display dashboard
    tracker.display_dashboard()
    
    # Test status update
    tracker.update_status("TechCorp", "ML Intern", "interview", "Scheduled for next week")
