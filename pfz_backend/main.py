# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from .analysis import analyze_pfz
from .fish_prediction import fish_predictor

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for uploaded DataFrame
csv_data = None

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Fish prediction API is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "fish_predictor_loaded": fish_predictor.model is not None}

@app.post("/upload_csv")
def upload_csv(file: UploadFile = File(...)):
    global csv_data
    if not file.filename.endswith('.csv'):
        return {"error": "Invalid file"}
    try:
        df = pd.read_csv(file.file)
    except Exception:
        return {"error": "Invalid file"}
    csv_data = df
    return {"message": "CSV uploaded successfully", "rows": len(df)}

@app.get("/predict_pfz")
def predict_pfz():
    global csv_data
    if csv_data is None:
        return {"error": "No data uploaded"}
    result = analyze_pfz(csv_data)
    return {"zones": result}

@app.post("/predict_fish")
async def predict_fish(file: UploadFile = File(...)):
    """Predict fish species from uploaded image"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Get prediction
        result = fish_predictor.predict_fish(image_bytes)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
