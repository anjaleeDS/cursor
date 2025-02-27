import anthropic
from config import ANTHROPIC_API_KEY

def list_available_models():
    print("Attempting to list available Claude models...")
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        # Get available models
        models = client.models.list()
        
        print("\nAvailable Models:")
        for model in models:
            print(f"- {model.id}")
            
    except Exception as e:
        print(f"Error listing models: {str(e)}")

if __name__ == "__main__":
    list_available_models() 