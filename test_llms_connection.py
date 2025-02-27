import anthropic
import openai
from config import ANTHROPIC_API_KEY, OPENAI_API_KEY

def test_claude():
    print("\nTesting Claude connection...")
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        # Try different Claude models
        models_to_try = [
            "claude-3-5-sonnet-20240620",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-sonnet-20250219"
        ]
        
        for model in models_to_try:
            try:
                print(f"\nTrying model: {model}")
                response = client.messages.create(
                    model=model,
                    max_tokens=100,
                    messages=[{"role": "user", "content": "Say 'Hello'"}]
                )
                print(f"✅ Success with model {model}")
                print(f"Response: {response.content[0].text}")
                break
            except Exception as e:
                print(f"❌ Failed with model {model}: {str(e)}")
                
    except Exception as e:
        print(f"❌ Claude connection failed: {str(e)}")

def test_openai():
    print("\nTesting OpenAI connection...")
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'Hello'"}]
        )
        print("✅ OpenAI test successful!")
        print(f"OpenAI response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ OpenAI test failed: {str(e)}")

if __name__ == "__main__":
    print("Starting API connection tests...")
    print(f"Anthropic API key (first 8 chars): {ANTHROPIC_API_KEY[:8]}...")
    print(f"OpenAI API key (first 4 chars): {OPENAI_API_KEY[:4]}...")
    
    test_claude()
    # test_openai() 
