"""
Fine-tuning script using LoRA (Low-Rank Adaptation)
Creates a specialized model for career application generation
"""
import json
import os
import torch
from datetime import datetime
from typing import Dict, List
import pandas as pd

try:
    from transformers import (
        AutoTokenizer, AutoModelForCausalLM, 
        TrainingArguments, Trainer, DataCollatorForLanguageModeling
    )
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from datasets import Dataset
    import bitsandbytes
    FINE_TUNING_AVAILABLE = True
except ImportError:
    FINE_TUNING_AVAILABLE = False
    print("Fine-tuning libraries not available. Install with:")
    print("pip install transformers peft datasets accelerate bitsandbytes")

class CareerCopilotFineTuner:
    def __init__(self, 
                 base_model: str = "microsoft/DialoGPT-medium",
                 output_dir: str = "models/career-copilot-lora"):
        self.base_model = base_model
        self.output_dir = output_dir
        self.tokenizer = None
        self.model = None
        
    def create_training_dataset(self, output_file: str = "data/fine_tune_dataset.jsonl"):
        """Create a synthetic training dataset for fine-tuning"""
        
        # Sample job descriptions and corresponding outputs
        training_data = [
            {
                "jd": "ML Engineer Intern with Python, TensorFlow, computer vision experience",
                "profile": "CSE student, projects in AI, TensorFlow experience",
                "bullets": [
                    "Developed computer vision models using TensorFlow achieving 92% accuracy",
                    "Built Python applications for image recognition and processing", 
                    "Implemented deep learning algorithms for real-time object detection",
                    "Led team of 4 in developing AI-powered accessibility platform",
                    "Optimized model performance reducing inference time by 40%"
                ],
                "cover_letter": "Dear Hiring Manager, I am excited to apply for the ML Engineer Intern position. As a Computer Science student with hands-on experience in TensorFlow and computer vision, I have developed strong skills through projects like DyslexoFly, an AI-powered learning platform. My experience with deep learning and Python makes me well-suited for this role. I look forward to contributing to your team's innovative ML projects."
            },
            {
                "jd": "Full Stack Developer Intern - React, Node.js, MongoDB, REST APIs",
                "profile": "CSE student, web development projects, JavaScript experience",
                "bullets": [
                    "Built full-stack web applications using React.js and Node.js",
                    "Developed RESTful APIs serving 1000+ daily requests with MongoDB",
                    "Implemented responsive UI components with modern CSS frameworks",
                    "Deployed applications on AWS with CI/CD pipelines",
                    "Collaborated in agile development team using Git workflows"
                ],
                "cover_letter": "Dear Hiring Manager, I am writing to express my interest in the Full Stack Developer Intern position. My experience with React.js, Node.js, and MongoDB through various projects has equipped me with the skills needed for this role. I have built complete web applications and understand both frontend and backend development. I am eager to contribute to your development team and learn from experienced engineers."
            },
            {
                "jd": "Data Science Intern - Python, pandas, machine learning, statistics",
                "profile": "CSE student, data analysis projects, Python and ML experience", 
                "bullets": [
                    "Analyzed large datasets using Python, pandas, and scikit-learn",
                    "Built predictive models achieving 85% accuracy on real-world data",
                    "Created interactive dashboards for data visualization",
                    "Performed statistical analysis and hypothesis testing",
                    "Presented insights to stakeholders through clear visualizations"
                ],
                "cover_letter": "Dear Hiring Manager, I am excited to apply for the Data Science Intern position. My strong foundation in Python, statistics, and machine learning, combined with hands-on project experience, makes me a suitable candidate. I have worked extensively with data analysis libraries and built predictive models. I am passionate about extracting insights from data and would love to contribute to your analytics team."
            }
        ]
        
        # Generate more diverse examples
        extended_data = []
        
        # Vary the examples with different roles and requirements
        role_variations = [
            ("Software Engineer", "Java, Spring, microservices"),
            ("Mobile Developer", "Android, Kotlin, Firebase"),
            ("DevOps Engineer", "Docker, Kubernetes, AWS"),
            ("AI Research", "PyTorch, research, publications"),
            ("Backend Developer", "Python, Flask, PostgreSQL"),
            ("Frontend Developer", "Vue.js, TypeScript, CSS"),
            ("QA Engineer", "testing, automation, Selenium"),
            ("Product Intern", "analytics, user research, A/B testing")
        ]
        
        for i, (role, skills) in enumerate(role_variations):
            # Create variations of the base examples
            for base_example in training_data:
                variation = {
                    "jd": f"{role} Intern - {skills}, problem-solving, teamwork",
                    "profile": f"CSE student, {skills.split(',')[0].strip()} experience, relevant projects",
                    "bullets": self._adapt_bullets(base_example["bullets"], skills),
                    "cover_letter": self._adapt_cover_letter(base_example["cover_letter"], role, skills)
                }
                extended_data.append(variation)
        
        # Convert to training format
        formatted_data = []
        for example in training_data + extended_data:
            formatted_example = self._format_training_example(example)
            formatted_data.append(formatted_example)
        
        # Save to JSONL file
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w') as f:
            for example in formatted_data:
                json.dump(example, f)
                f.write('\n')
        
        print(f"✅ Training dataset created: {output_file}")
        print(f"📊 Total examples: {len(formatted_data)}")
        return output_file
    
    def _adapt_bullets(self, base_bullets: List[str], skills: str) -> List[str]:
        """Adapt resume bullets for different skills"""
        skill_list = [s.strip() for s in skills.split(',')]
        adapted = []
        
        for bullet in base_bullets:
            # Replace technologies while keeping structure
            adapted_bullet = bullet
            if 'TensorFlow' in bullet and skill_list:
                adapted_bullet = bullet.replace('TensorFlow', skill_list[0])
            elif 'React.js' in bullet and skill_list:
                adapted_bullet = bullet.replace('React.js', skill_list[0])
            elif 'Python' in bullet and skill_list:
                adapted_bullet = bullet.replace('Python', skill_list[0])
            
            adapted.append(adapted_bullet)
        
        return adapted
    
    def _adapt_cover_letter(self, base_cover: str, role: str, skills: str) -> str:
        """Adapt cover letter for different roles"""
        adapted = base_cover.replace("ML Engineer", role)
        adapted = adapted.replace("Machine Learning", role.split()[0])
        
        # Replace skills mentions
        skill_list = [s.strip() for s in skills.split(',')]
        if skill_list:
            adapted = adapted.replace("TensorFlow", skill_list[0])
            adapted = adapted.replace("computer vision", skills)
        
        return adapted
    
    def _format_training_example(self, example: Dict) -> Dict:
        """Format example for training"""
        # Create input-output format
        input_text = f"""JD: {example['jd']}
PROFILE: {example['profile']}

Generate resume bullets and cover letter:"""
        
        output_text = f"""BULLETS:
{chr(10).join(['• ' + bullet for bullet in example['bullets']])}

COVER_LETTER:
{example['cover_letter']}"""
        
        return {
            "input": input_text,
            "output": output_text
        }
    
    def prepare_model(self):
        """Load and prepare model for fine-tuning"""
        if not FINE_TUNING_AVAILABLE:
            raise ImportError("Fine-tuning dependencies not installed")
        
        print(f"📥 Loading base model: {self.base_model}")
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.base_model)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Load model with 8-bit quantization for memory efficiency
        self.model = AutoModelForCausalLM.from_pretrained(
            self.base_model,
            load_in_8bit=True,
            device_map="auto",
            torch_dtype=torch.float16
        )
        
        # Prepare for k-bit training
        self.model = prepare_model_for_kbit_training(self.model)
        
        # Configure LoRA
        lora_config = LoraConfig(
            r=16,  # Rank
            lora_alpha=32,  # Alpha parameter
            target_modules=["c_attn", "c_proj"],  # Target modules for DialoGPT
            lora_dropout=0.1,
            bias="none",
            task_type="CAUSAL_LM"
        )
        
        # Apply LoRA
        self.model = get_peft_model(self.model, lora_config)
        
        print("✅ Model prepared for LoRA fine-tuning")
        print(f"🔢 Trainable parameters: {self.model.num_parameters():,}")
        
    def prepare_dataset(self, dataset_file: str):
        """Prepare dataset for training"""
        # Load data
        data = []
        with open(dataset_file, 'r') as f:
            for line in f:
                data.append(json.loads(line.strip()))
        
        # Format for training
        formatted_texts = []
        for example in data:
            text = f"{example['input']}\n\n{example['output']}{self.tokenizer.eos_token}"
            formatted_texts.append(text)
        
        # Tokenize
        def tokenize_function(examples):
            return self.tokenizer(
                examples["text"],
                truncation=True,
                padding=True,
                max_length=512
            )
        
        dataset = Dataset.from_dict({"text": formatted_texts})
        tokenized_dataset = dataset.map(tokenize_function, batched=True)
        
        return tokenized_dataset
    
    def train(self, dataset_file: str, num_epochs: int = 3):
        """Fine-tune the model"""
        if not self.model:
            self.prepare_model()
        
        print("📚 Preparing dataset...")
        train_dataset = self.prepare_dataset(dataset_file)
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            num_train_epochs=num_epochs,
            per_device_train_batch_size=2,
            gradient_accumulation_steps=4,
            warmup_steps=100,
            logging_steps=10,
            save_steps=500,
            evaluation_strategy="no",
            save_strategy="steps",
            logging_dir=f"{self.output_dir}/logs",
            remove_unused_columns=False,
            dataloader_pin_memory=False,
            fp16=True,
            report_to=None  # Disable wandb logging
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Create trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            data_collator=data_collator,
            train_dataset=train_dataset,
            tokenizer=self.tokenizer
        )
        
        print("🚀 Starting fine-tuning...")
        start_time = datetime.now()
        
        # Train
        trainer.train()
        
        end_time = datetime.now()
        print(f"✅ Training completed in {end_time - start_time}")
        
        # Save model
        trainer.save_model()
        self.tokenizer.save_pretrained(self.output_dir)
        
        print(f"💾 Model saved to {self.output_dir}")
        
        # Save training report
        self._save_training_report(start_time, end_time, num_epochs, len(train_dataset))
    
    def _save_training_report(self, start_time, end_time, epochs, dataset_size):
        """Save training report"""
        report = {
            "base_model": self.base_model,
            "output_dir": self.output_dir,
            "training_start": start_time.isoformat(),
            "training_end": end_time.isoformat(),
            "duration": str(end_time - start_time),
            "epochs": epochs,
            "dataset_size": dataset_size,
            "lora_config": {
                "r": 16,
                "lora_alpha": 32,
                "target_modules": ["c_attn", "c_proj"],
                "lora_dropout": 0.1
            }
        }
        
        report_file = f"{self.output_dir}/training_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📊 Training report saved: {report_file}")
    
    def test_model(self, test_input: str):
        """Test the fine-tuned model"""
        if not self.model:
            print("❌ Model not loaded. Train or load a model first.")
            return
        
        # Tokenize input
        inputs = self.tokenizer(test_input, return_tensors="pt")
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                inputs.input_ids,
                max_length=inputs.input_ids.shape[1] + 200,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract just the generated part
        response = generated_text[len(test_input):].strip()
        
        print("🤖 Generated Response:")
        print("-" * 40)
        print(response)
        
        return response

def main():
    """Main training pipeline"""
    print("🎯 Career Application Copilot - LoRA Fine-tuning")
    print("=" * 50)
    
    if not FINE_TUNING_AVAILABLE:
        print("❌ Fine-tuning dependencies not available")
        return
    
    # Initialize fine-tuner
    fine_tuner = CareerCopilotFineTuner()
    
    # Create training dataset
    dataset_file = fine_tuner.create_training_dataset()
    
    # Train model
    print("\n🚀 Starting training process...")
    fine_tuner.train(dataset_file, num_epochs=3)
    
    # Test the model
    test_input = """JD: Software Engineer Intern - Python, Flask, REST APIs, database design
PROFILE: CSE student, web development projects, Python experience

Generate resume bullets and cover letter:"""
    
    print("\n🧪 Testing fine-tuned model...")
    fine_tuner.test_model(test_input)
    
    print("\n✅ Fine-tuning complete!")
    print(f"📁 Model saved in: {fine_tuner.output_dir}")

if __name__ == "__main__":
    main()
