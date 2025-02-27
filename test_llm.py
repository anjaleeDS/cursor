from llms import LLMComparer

try:
    comparer = LLMComparer()
    print("LLMComparer initialized successfully!")
except Exception as e:
    print(f"Error initializing LLMComparer: {type(e).__name__}: {str(e)}") 