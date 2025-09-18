# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from analysis import analyze_pfz

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for uploaded DataFrame
csv_data = None

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
