# Python ML Translation Backend

This is a FastAPI-based backend service for the ML translation application.

## Setup Instructions

1. **Create a virtual environment:**
   \`\`\`bash
   cd scripts/python-backend
   python -m venv venv
   \`\`\`

2. **Activate the virtual environment:**
   
   **On Windows:**
   \`\`\`bash
   venv\Scripts\activate
   \`\`\`
   
   **On macOS/Linux:**
   \`\`\`bash
   source venv/bin/activate
   \`\`\`

3. **Install dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Run the server:**
   \`\`\`bash
   python main.py
   \`\`\`

The server will start on `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /translate` - Translate text
- `GET /languages` - Get supported languages
- `GET /docs` - Interactive API documentation (Swagger UI)

## Integration with Your ML Model

Replace the `simulate_ml_model_processing()` function in `main.py` with your actual ML model code:

```python
def your_ml_model_translate(text: str, target_language: str) -> tuple[str, float]:
    # Load your trained model
    # model = load_model('path/to/your/model')
    
    # Perform translation
    # translated_text = model.translate(text, target_language)
    # confidence = model.get_confidence()
    
    return translated_text, confidence
