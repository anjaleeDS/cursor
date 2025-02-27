from typing import Optional, Dict
import anthropic
import openai
from config import ANTHROPIC_API_KEY, OPENAI_API_KEY
import json
from datetime import datetime

class LLMComparer:
    """A class to compare responses between Anthropic's Claude and OpenAI's models."""
    
    def __init__(self) -> None:
        if not ANTHROPIC_API_KEY or not OPENAI_API_KEY:
            raise ValueError("API keys cannot be empty")
            
        # First test Anthropic
        try:
            self.claude = anthropic.Anthropic(
                api_key=ANTHROPIC_API_KEY
            )
            print("Anthropic client initialized successfully")
        except Exception as e:
            print(f"Anthropic client error: {str(e)}")
            raise
            
        # Then test OpenAI
        try:
            self.openai_client = openai.OpenAI(
                api_key=OPENAI_API_KEY
            )
            print("OpenAI client initialized successfully")
        except Exception as e:
            print(f"OpenAI client error: {str(e)}")
            raise

    def get_claude_response(self, prompt: str) -> str:
        """Get a response from Claude."""
        try:
            response = self.claude.messages.create(
                model= "claude-3-5-sonnet-20240620",  # Using stable Claude 2.1 version
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            if not response.content:
                raise ValueError("Empty response from Claude")
            return response.content[0].text
        except Exception as e:
            raise RuntimeError(f"Claude API error: {str(e)}") from e

    def get_openai_response(self, prompt: str) -> str:
        """Get a response from OpenAI."""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[{"role": "user", "content": prompt}]
            )
            if not response.choices:
                raise ValueError("Empty response from OpenAI")
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {str(e)}") from e

    def format_output(self, text: str, title: str = "") -> str:
        """Format text output with a title and proper indentation"""
        if not text:
            return ""
        
        lines = text.strip().split('\n')
        indented = '\n    '.join(lines)
        
        if title:
            return f"\n=== {title} ===\n    {indented}\n"
        return f"    {indented}\n"

    def compare(self, prompt: str) -> Dict[str, str]:
        """Compare responses from both models."""
        try:
            print("\n🤔 Getting initial responses...")
            
            print("\nAsking Claude...")
            claude_response = self.get_claude_response(prompt)
            print(self.format_output(claude_response, "Claude's Response"))
            
            print("Asking GPT-4...")
            openai_response = self.get_openai_response(prompt)
            print(self.format_output(openai_response, "GPT-4's Response"))
            
            print("\n📝 Getting critiques...")
            
            print("\nGetting Claude's critique of GPT-4...")
            claude_critique = self.get_claude_critique(openai_response, prompt)
            print(self.format_output(claude_critique, "Claude's Critique of GPT-4"))
            
            print("Getting GPT-4's critique of Claude...")
            gpt_critique = self.get_gpt_critique(claude_response, prompt)
            print(self.format_output(gpt_critique, "GPT-4's Critique of Claude"))
            
            print("\n🎯 Getting final analysis...")
            final_analysis = self.get_final_analysis(prompt, claude_response, openai_response, claude_critique, gpt_critique)
            print(self.format_output(final_analysis, "Final Analysis"))
            
            return {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "prompt": prompt,
                "responses": {
                    "claude": claude_response,
                    "gpt4": openai_response
                },
                "critiques": {
                    "claude_of_gpt": claude_critique,
                    "gpt_of_claude": gpt_critique
                },
                "final_analysis": final_analysis
            }
        except Exception as e:
            raise RuntimeError(f"Failed to compare responses: {str(e)}") from e

    def get_claude_critique(self, response: str, prompt: str) -> str:
        """Get a critique from Claude."""
        critique_prompt = f"""
        Analyze this response to the question: "{prompt}"

        Response to analyze:
        {response}

        Provide a detailed critique addressing:
        1. Accuracy of information
        2. Completeness of the answer
        3. Clarity and structure
        4. Potential improvements
        
        Format your response in clear sections with bullet points.
        """
        return self.get_claude_response(critique_prompt)

    def get_gpt_critique(self, response: str, prompt: str) -> str:
        """Get a critique from GPT-4."""
        critique_prompt = f"""
        Analyze this response to the question: "{prompt}"

        Response to analyze:
        {response}

        Provide a detailed critique addressing:
        1. Accuracy of information
        2. Completeness of the answer
        3. Clarity and structure
        4. Potential improvements
        
        Format your response in clear sections with bullet points.
        """
        return self.get_openai_response(critique_prompt)

    def get_final_analysis(self, prompt: str, claude_response: str, gpt_response: str, 
                         claude_critique: str, gpt_critique: str) -> str:
        """Get a final analysis of the responses."""
        final_prompt = f"""
        Compare these two responses and their mutual critiques to determine the strengths 
        and best aspects of each response.

        Original question: {prompt}

        Claude's response: {claude_response}
        GPT's response: {gpt_response}

        Claude's critique of GPT: {claude_critique}
        GPT's critique of Claude: {gpt_critique}

        Please provide a clear summary with:
        1. Key strengths from each response (bullet points)
        2. Most valuable aspects of each response (bullet points)
        3. Final recommendation on which parts to take from each response
        
        Format your response in clear sections with headings and bullet points.
        """
        return self.get_claude_response(final_prompt)

    def interactive_mode(self):
        """Run the comparison tool in interactive mode."""
        print("\n=== 🤖 LLM Comparison Tool ===")
        print("This tool compares responses from Claude and GPT-4")
        print("Enter 'quit' or 'exit' to end the program")
        
        while True:
            prompt = input("\n❓ Enter your question: ").strip()
            
            if prompt.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break
            
            if not prompt:
                print("⚠️  Please enter a valid question.")
                continue
            
            try:
                result = self.compare(prompt)
                
                # Save results to file (optional)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"comparison_results_{timestamp}.json"
                with open(filename, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"\n💾 Results saved to {filename}")
                
            except Exception as e:
                print(f"\n❌ Error: {str(e)}")
                print("Please try again or enter 'quit' to exit.")

if __name__ == "__main__":
    try:
        # Initialize API clients
        print("Initializing API clients...")
        comparer = LLMComparer()
        print("\nClients initialized successfully!")
        
        # Run the interactive mode
        comparer.interactive_mode()
        
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        exit(1) 