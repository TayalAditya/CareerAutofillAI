"""
Evaluation Module: Comprehensive metrics and analysis for Career Application Copilot
Author: Aditya Tayal, IIT Mandi CSE
"""
import json
import os
import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import pandas as pd
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    import torch
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    print("Warning: sentence-transformers not available. Install with: pip install sentence-transformers")

try:
    import textstat
    TEXTSTAT_AVAILABLE = True
except ImportError:
    TEXTSTAT_AVAILABLE = False
    print("Warning: textstat not available. Install with: pip install textstat")

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ApplicationEvaluator:
    """
    Comprehensive evaluation system for AI agent performance
    Measures quality and reliability across multiple dimensions
    """
    
    def __init__(self):
        if EMBEDDINGS_AVAILABLE:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            self.embedding_model = None
        
        self.evaluation_history = []
        self.metrics_weights = {
            'relevance': 0.3,
            'ats_compatibility': 0.25,
            'readability': 0.2,
            'completeness': 0.15,
            'consistency': 0.1
        }
            
    def evaluate_complete_package(self, 
                                job_description: str,
                                user_profile: Dict,
                                generated_package: Dict) -> Dict:
        """
        Main evaluation function that computes all metrics
        """
        
        evaluation_result = {
            'timestamp': datetime.now().isoformat(),
            'job_description': job_description,
            'user_profile': user_profile,
            'generated_package': generated_package
        }
        
        # 1. Relevance Score - How well does the content match job requirements
        relevance_score = self.evaluate_relevance(
            job_description, self._combine_package_text(generated_package)
        )
        
        # 2. ATS Compatibility Score - How well will it pass ATS systems
        ats_score = self.evaluate_ats_compatibility(generated_package)
        
        # 3. Readability Score - How easy to read and understand
        readability_score = self.evaluate_readability(generated_package)
        
        # 4. Completeness Score - How complete is the generated content
        completeness_score = self.evaluate_completeness(user_profile, generated_package)
        
        # 5. Consistency Score - Internal consistency of generated content
        consistency_score = self.evaluate_consistency(generated_package)
        
        # Calculate weighted overall score
        overall_score = (
            relevance_score * self.metrics_weights['relevance'] +
            ats_score * self.metrics_weights['ats_compatibility'] +
            readability_score * self.metrics_weights['readability'] +
            completeness_score * self.metrics_weights['completeness'] +
            consistency_score * self.metrics_weights['consistency']
        )
        
        # Detailed evaluation results
        evaluation_result.update({
            'scores': {
                'relevance_score': round(relevance_score * 100, 2),
                'ats_score': round(ats_score * 100, 2),
                'readability_score': round(readability_score * 100, 2),
                'completeness_score': round(completeness_score * 100, 2),
                'consistency_score': round(consistency_score * 100, 2),
                'overall_score': round(overall_score * 100, 2)
            },
            'detailed_analysis': {
                'keyword_matches': self._analyze_keyword_matches(job_description, generated_package),
                'ats_issues': self._identify_ats_issues(generated_package),
                'readability_stats': self._get_readability_stats(generated_package),
                'missing_elements': self._identify_missing_elements(user_profile, generated_package)
            }
        })
        
        # Store for historical analysis
        self.evaluation_history.append(evaluation_result)
        
        return evaluation_result
            
    def evaluate_relevance(self, jd_text: str, generated_content: str) -> float:
        """
        Evaluate how relevant the generated content is to the job description
        Returns similarity score between 0 and 1
        """
        if not self.embedding_model:
            return self._fallback_relevance(jd_text, generated_content)
        
        try:
            # Generate embeddings
            jd_embedding = self.embedding_model.encode([jd_text])
            content_embedding = self.embedding_model.encode([generated_content])
            
            # Calculate cosine similarity
            similarity = torch.nn.functional.cosine_similarity(
                torch.tensor(jd_embedding), 
                torch.tensor(content_embedding)
            ).item()
            
            return max(0, similarity)  # Ensure non-negative
            
        except Exception as e:
            print(f"Embedding-based relevance failed: {e}")
            return self._fallback_relevance(jd_text, generated_content)
    
    def _fallback_relevance(self, jd_text: str, generated_content: str) -> float:
        """Fallback relevance calculation using keyword overlap"""
        # Extract keywords from both texts
        jd_keywords = self._extract_keywords(jd_text.lower())
        content_keywords = self._extract_keywords(generated_content.lower())
        
        if not jd_keywords:
            return 0.0
        
        # Calculate overlap
        overlap = len(jd_keywords.intersection(content_keywords))
        relevance = overlap / len(jd_keywords)
        
        return min(1.0, relevance)
    
    def evaluate_ats_compatibility(self, package: Dict) -> float:
        """
        Calculate ATS (Applicant Tracking System) compatibility score
        """
        
        score = 1.0
        issues = []
        
        # Check resume bullets
        bullets = package.get('bullets', [])
        
        for bullet in bullets:
            # Penalize for overly complex formatting
            if len(re.findall(r'[^\w\s]', bullet)) > len(bullet) * 0.2:
                score -= 0.05
                issues.append("Excessive special characters")
            
            # Reward for quantifiable achievements
            if re.search(r'\d+%|\d+\+|\$\d+|\d+ years?|\d+ projects?', bullet):
                score += 0.02
            
            # Penalize for overly long bullets
            if len(bullet.split()) > 25:
                score -= 0.03
                issues.append("Overly long bullet points")
            
            # Reward for action verbs
            action_verbs = ['developed', 'implemented', 'created', 'managed', 'led', 'improved', 'optimized']
            if any(verb in bullet.lower() for verb in action_verbs):
                score += 0.01
        
        # Check cover letter
        cover_letter = package.get('cover_letter', '')
        if cover_letter:
            # Optimal length check (150-250 words)
            word_count = len(cover_letter.split())
            if 150 <= word_count <= 250:
                score += 0.05
            elif word_count < 100 or word_count > 400:
                score -= 0.05
                issues.append("Sub-optimal cover letter length")
        
        return max(min(score, 1.0), 0)

    def evaluate_readability(self, package: Dict) -> float:
        """
        Calculate readability score using various readability metrics
        """
        
        combined_text = self._combine_package_text(package)
        
        if not combined_text:
            return 0
        
        if TEXTSTAT_AVAILABLE:
            try:
                # Multiple readability metrics
                flesch_score = textstat.flesch_reading_ease(combined_text)
                flesch_kincaid = textstat.flesch_kincaid_grade(combined_text)
                
                # Convert to 0-1 scale where higher is better
                # Flesch Reading Ease: 60-70 is optimal for professional content
                if 60 <= flesch_score <= 70:
                    flesch_normalized = 1.0
                elif 50 <= flesch_score < 60 or 70 < flesch_score <= 80:
                    flesch_normalized = 0.85
                else:
                    flesch_normalized = max(0, 1.0 - abs(flesch_score - 65) * 0.02)
                
                # Flesch-Kincaid Grade: 8-12 is optimal for professional content
                if 8 <= flesch_kincaid <= 12:
                    fk_normalized = 1.0
                else:
                    fk_normalized = max(0, 1.0 - abs(flesch_kincaid - 10) * 0.1)
                
                # Average the scores
                readability_score = (flesch_normalized + fk_normalized) / 2
                
                return min(readability_score, 1.0)
                
            except:
                pass
        
        # Fallback scoring based on simple metrics
        sentences = len(re.findall(r'[.!?]+', combined_text))
        words = len(combined_text.split())
        
        if sentences == 0:
            return 0.5
        
        avg_words_per_sentence = words / sentences
        
        # Optimal range: 15-20 words per sentence
        if 15 <= avg_words_per_sentence <= 20:
            return 0.9
        elif 10 <= avg_words_per_sentence < 15 or 20 < avg_words_per_sentence <= 25:
            return 0.75
        else:
            return 0.6

    def evaluate_completeness(self, user_profile: Dict, package: Dict) -> float:
        """
        Calculate how completely the user's profile is represented
        """
        
        score = 0
        total_elements = 0
        
        # Check if key skills are mentioned
        user_skills = user_profile.get('skills', [])
        generated_text = self._combine_package_text(package).lower()
        
        if user_skills:
            mentioned_skills = sum(1 for skill in user_skills if skill.lower() in generated_text)
            skill_coverage = mentioned_skills / len(user_skills)
            score += skill_coverage * 0.4  # 40% weight for skills
            total_elements += 0.4
        
        # Check if education is mentioned
        education = user_profile.get('degree', '') or user_profile.get('university', '')
        if education and education.lower() in generated_text:
            score += 0.2
        total_elements += 0.2
        
        # Check if experience is reflected
        experience = user_profile.get('experience', [])
        if experience:
            # Simple check for experience keywords
            exp_keywords = ['experience', 'worked', 'developed', 'managed', 'project']
            if any(keyword in generated_text for keyword in exp_keywords):
                score += 0.2
        total_elements += 0.2
        
        # Check completeness of package components
        if package.get('bullets'):
            score += 0.1
        total_elements += 0.1
        
        if package.get('cover_letter'):
            score += 0.1
        total_elements += 0.1
        
        return (score / total_elements) if total_elements > 0 else 0

    def evaluate_consistency(self, package: Dict) -> float:
        """
        Calculate internal consistency of generated content
        """
        
        bullets = package.get('bullets', [])
        cover_letter = package.get('cover_letter', '')
        
        if not bullets and not cover_letter:
            return 0
        
        score = 1.0
        
        # Check for contradictions in skills mentioned
        all_text = self._combine_package_text(package)
        
        # Consistency in tone (simple heuristic)
        formal_indicators = len(re.findall(r'\b(?:utilize|facilitate|implement|optimize)\b', all_text, re.IGNORECASE))
        casual_indicators = len(re.findall(r'\b(?:use|help|make|improve)\b', all_text, re.IGNORECASE))
        
        if formal_indicators > 0 and casual_indicators > 0:
            tone_ratio = min(formal_indicators, casual_indicators) / max(formal_indicators, casual_indicators)
            if tone_ratio < 0.3:  # Very inconsistent tone
                score -= 0.15
        
        # Check for repeated information
        sentences = re.split(r'[.!?]+', all_text)
        unique_sentences = set(s.strip().lower() for s in sentences if len(s.strip()) > 10)
        
        if len(sentences) > 0:
            valid_sentences = [s for s in sentences if len(s.strip()) > 10]
            if valid_sentences:
                uniqueness_ratio = len(unique_sentences) / len(valid_sentences)
                score += (uniqueness_ratio - 0.8) * 0.5  # Reward uniqueness above 80%
        
        return max(min(score, 1.0), 0)

    def _combine_package_text(self, package: Dict) -> str:
        """Combine all text from the package"""
        
        text_parts = []
        
        if package.get('bullets'):
            text_parts.extend(package['bullets'])
        
        if package.get('cover_letter'):
            text_parts.append(package['cover_letter'])
        
        return ' '.join(text_parts)

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        
        # Common technical and professional keywords
        keywords = re.findall(r'\b(?:Python|Java|JavaScript|React|Node\.js|Django|Flask|'
                            r'Machine Learning|ML|AI|Data Science|TensorFlow|PyTorch|'
                            r'AWS|Azure|Docker|Kubernetes|Git|SQL|MongoDB|'
                            r'leadership|management|development|analysis|optimization|'
                            r'collaboration|communication|problem-solving)\b', 
                            text, re.IGNORECASE)
        
        return list(set(keyword.lower() for keyword in keywords))

    def _analyze_keyword_matches(self, job_description: str, package: Dict) -> Dict:
        """Analyze keyword matches between job description and package"""
        
        job_keywords = self._extract_keywords(job_description)
        package_keywords = self._extract_keywords(self._combine_package_text(package))
        
        matched = list(set(job_keywords) & set(package_keywords))
        missing = list(set(job_keywords) - set(package_keywords))
        
        return {
            'total_job_keywords': len(job_keywords),
            'matched_keywords': matched,
            'missing_keywords': missing,
            'match_percentage': len(matched) / max(len(job_keywords), 1) * 100
        }

    def _identify_ats_issues(self, package: Dict) -> List[str]:
        """Identify potential ATS issues"""
        
        issues = []
        combined_text = self._combine_package_text(package)
        
        # Check for excessive formatting
        if len(re.findall(r'[^\w\s]', combined_text)) > len(combined_text) * 0.15:
            issues.append("Excessive special characters may confuse ATS")
        
        # Check for missing quantifiable achievements
        bullets = package.get('bullets', [])
        quantified_bullets = sum(1 for bullet in bullets if re.search(r'\d+', bullet))
        
        if len(bullets) > 0 and quantified_bullets / len(bullets) < 0.3:
            issues.append("Less than 30% of bullets contain quantifiable achievements")
        
        return issues

    def _get_readability_stats(self, package: Dict) -> Dict:
        """Get detailed readability statistics"""
        
        combined_text = self._combine_package_text(package)
        
        if not combined_text:
            return {}
        
        if TEXTSTAT_AVAILABLE:
            try:
                return {
                    'flesch_reading_ease': round(textstat.flesch_reading_ease(combined_text), 2),
                    'flesch_kincaid_grade': round(textstat.flesch_kincaid_grade(combined_text), 2),
                    'avg_sentence_length': round(textstat.avg_sentence_length(combined_text), 2),
                    'lexicon_count': textstat.lexicon_count(combined_text)
                }
            except:
                pass
        
        # Fallback stats
        words = len(combined_text.split())
        sentences = len(re.findall(r'[.!?]+', combined_text))
        
        return {
            'word_count': words,
            'sentence_count': sentences,
            'avg_sentence_length': round(words / max(sentences, 1), 2)
        }

    def _identify_missing_elements(self, user_profile: Dict, package: Dict) -> List[str]:
        """Identify missing elements that should be included"""
        
        missing = []
        generated_text = self._combine_package_text(package).lower()
        
        # Check for missing skills
        user_skills = user_profile.get('skills', [])
        mentioned_skills = [skill for skill in user_skills if skill.lower() in generated_text]
        
        if len(mentioned_skills) < min(3, len(user_skills)):
            missing.append("Key skills not adequately represented")
        
        # Check for missing education
        if user_profile.get('university') and user_profile['university'].lower() not in generated_text:
            missing.append("University/education not mentioned")
        
        # Check for missing contact info
        if not package.get('bullets') or len(package['bullets']) < 3:
            missing.append("Insufficient bullet points (recommended: 3-5)")
        
        return missing

    def generate_evaluation_report(self, evaluation_result: Dict) -> str:
        """Generate a human-readable evaluation report"""
        
        scores = evaluation_result['scores']
        analysis = evaluation_result['detailed_analysis']
        
        report = f"""
# AI Agent Evaluation Report
Generated: {evaluation_result['timestamp']}

## Overall Performance
**Overall Score: {scores['overall_score']}/100**

## Detailed Scores
- 📊 Relevance Score: {scores['relevance_score']}/100
- 🤖 ATS Compatibility: {scores['ats_score']}/100  
- 📖 Readability: {scores['readability_score']}/100
- ✅ Completeness: {scores['completeness_score']}/100
- 🔄 Consistency: {scores['consistency_score']}/100

## Keyword Analysis
- Total job keywords identified: {analysis['keyword_matches']['total_job_keywords']}
- Keywords matched: {len(analysis['keyword_matches']['matched_keywords'])}
- Match percentage: {analysis['keyword_matches']['match_percentage']:.1f}%
- Missing keywords: {', '.join(analysis['keyword_matches']['missing_keywords'][:5])}

## Areas for Improvement
"""
        
        if analysis['ats_issues']:
            report += "\n### ATS Issues:\n"
            for issue in analysis['ats_issues']:
                report += f"- {issue}\n"
        
        if analysis['missing_elements']:
            report += "\n### Missing Elements:\n"
            for element in analysis['missing_elements']:
                report += f"- {element}\n"
        
        # Recommendations based on scores
        report += "\n## Recommendations\n"
        
        if scores['relevance_score'] < 70:
            report += "- Improve relevance by including more job-specific keywords\n"
        
        if scores['ats_score'] < 80:
            report += "- Optimize for ATS by adding quantifiable achievements\n"
        
        if scores['readability_score'] < 75:
            report += "- Improve readability by simplifying sentence structure\n"
        
        return report

if __name__ == "__main__":
    # Test the evaluator
    evaluator = ApplicationEvaluator()
    
    # Sample evaluation
    sample_jd = """
    Looking for ML intern with Python, TensorFlow, and computer vision experience.
    Should have strong problem-solving skills and experience with deep learning.
    """
    
    sample_bullets = [
        "Developed computer vision models using TensorFlow achieving 94% accuracy",
        "Built Python applications for image processing and analysis",
        "Implemented deep learning algorithms for real-time object detection"
    ]
    
    sample_cover = """
    I am excited to apply for the ML internship. My experience with TensorFlow 
    and computer vision through my DyslexoFly project makes me a strong candidate.
    I have developed deep learning models and worked extensively with Python.
    """
    
    evaluation = evaluator.evaluate_application_package(sample_jd, sample_bullets, sample_cover)
    
    print("📊 EVALUATION RESULTS")
    print("=" * 40)
    print(f"Overall Score: {evaluation['overall_score']:.3f}")
    print(f"Relevance: {evaluation['relevance']['overall']:.3f}")
    print(f"ATS Compatibility: {evaluation['ats_compatibility']['overall']:.3f}")
    print(f"Readability: {evaluation['readability']['overall']:.3f}")
    print(f"Keyword Match: {evaluation['detailed_analysis']['keywords_analysis']['match_percentage']:.1%}")
    
    if evaluation['detailed_analysis']['suggestions']:
        print("\n💡 Suggestions:")
        for suggestion in evaluation['detailed_analysis']['suggestions']:
            print(f"- {suggestion}")
    
    # Generate report
    evaluator.generate_evaluation_report()
