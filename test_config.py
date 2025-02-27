import sys
import os

# Print current directory and files
print("Current directory:", os.getcwd())
print("Files in directory:", os.listdir())

# Try to import and print keys
try:
    from config import ANTHROPIC_API_KEY, OPENAI_API_KEY
    print("\nKeys from config:")
    print(f"Anthropic key exists: {'Yes' if ANTHROPIC_API_KEY else 'No'}")
    print(f"Anthropic key starts with: {ANTHROPIC_API_KEY[:8]}..." if ANTHROPIC_API_KEY else "No Anthropic key")
    print(f"OpenAI key exists: {'Yes' if OPENAI_API_KEY else 'No'}")
    print(f"OpenAI key starts with: {OPENAI_API_KEY[:4]}..." if OPENAI_API_KEY else "No OpenAI key")
except Exception as e:
    print("\nError importing config:", str(e))

# Print Python path
print("\nPython path:", sys.path) 