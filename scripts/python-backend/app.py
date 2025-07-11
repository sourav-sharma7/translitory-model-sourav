from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Dict
import time
import torch
from model import encoder, decoder, vocab, itos, predict_multilingual

# Initialize FastAPI app
app = FastAPI(title="Transliteration API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class TranslationRequest(BaseModel):
    text: str
    target_language: str

class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    confidence_score: float
    processing_time: float

LANG_TAGS = {
    "hindi": "<LANG_HIN>",
    "bengali": "<LANG_BEN>",
    "tamil": "<LANG_TAM>"
}

@app.get("/")
async def root():
    return {"message": "Transliteration API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Transliteration API",
        "version": "1.0.0",
        "supported_languages": list(LANG_TAGS.keys())
    }

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    start_time = time.time()

    if request.target_language not in LANG_TAGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported target language: {request.target_language}. Supported languages: {list(LANG_TAGS.keys())}"
        )

    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    if len(request.text) > 100:
        raise HTTPException(status_code=400, detail="Text too long. Maximum 100 characters allowed")

    try:
        lang_token = LANG_TAGS[request.target_language]
        words = request.text.strip().split()

        output_words = []
        for word in words:
            word_with_tag = f"{lang_token} {word.lower()}"
            translit = predict_multilingual(
                word_with_tag, encoder, decoder, vocab, itos,
                torch.device("cuda" if torch.cuda.is_available() else "cpu")
            )
            output_words.append(translit)

        translated_text = " ".join(output_words)
        processing_time = time.time() - start_time

        return TranslationResponse(
            translated_text=translated_text,
            source_language="english",
            target_language=request.target_language,
            confidence_score=0.95,
            processing_time=round(processing_time, 3)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.get("/languages")
async def get_supported_languages():
    return {
        "supported_languages": [
            {"code": "hindi", "name": "Hindi", "native_name": "हिन्दी"},
            {"code": "bengali", "name": "Bengali", "native_name": "বাংলা"},
            {"code": "tamil", "name": "Tamil", "native_name": "தமிழ்"},
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting Transliteration API...")
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
