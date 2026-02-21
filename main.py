from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
import secrets
from dotenv import load_dotenv

load_dotenv()

from models import init_db, get_db, User, Receipt
from ai_extractor import extract_receipt_info
from xrpl_service import process_reimbursement

app = FastAPI(title="XRPayroll API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("static", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/static/index.html")

@app.on_event("startup")
def on_startup():
    init_db()

@app.post("/users", summary="Create a new team member with their XRPL address")
def create_user(name: str = Form(...), xrpl_address: str = Form(...), db: Session = Depends(get_db)):
    user = User(name=name, xrpl_address=xrpl_address)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/submit-receipt", summary="Submit a receipt image for AI extraction and pending approval")
async def submit_receipt(
    submitter_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == submitter_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Submitter not found")

    file_extension = file.filename.split(".")[-1]
    safe_filename = f"{secrets.token_hex(8)}.{file_extension}"
    file_path = os.path.join("uploads", safe_filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        # 1. AI Extracts data
        extracted_data = extract_receipt_info(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract info: {str(e)}")

    # 2. Save Pending Receipt
    receipt = Receipt(
        submitter_id=user.id,
        image_path=file_path,
        amount=extracted_data.amount,
        merchant=extracted_data.merchant,
        date_extracted=extracted_data.date,
        status="pending"
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)

    return {
        "message": "Receipt submitted for review",
        "receipt": {
            "id": receipt.id,
            "status": receipt.status,
            "amount": receipt.amount,
            "merchant": receipt.merchant,
            "date": receipt.date_extracted
        }
    }

@app.get("/pending-receipts", summary="List receipts waiting for approval")
def get_pending_receipts(db: Session = Depends(get_db)):
    receipts = db.query(Receipt).filter(Receipt.status == "pending").all()
    result = []
    for r in receipts:
        submitter = db.query(User).filter(User.id == r.submitter_id).first()
        result.append({
            "id": r.id,
            "submitter": submitter.name,
            "amount": r.amount,
            "merchant": r.merchant,
            "date": r.date_extracted,
            "image_path": r.image_path
        })
    return result

@app.post("/approve-receipt/{receipt_id}", summary="Approve receipt and reimburse on XRP Ledger")
def approve_receipt(receipt_id: int, db: Session = Depends(get_db)):
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    if receipt.status != "pending":
        raise HTTPException(status_code=400, detail=f"Receipt is already {receipt.status}")

    user = db.query(User).filter(User.id == receipt.submitter_id).first()

    # Create metadata for the XRPL memo
    metadata = {
        "receipt_id": receipt.id,
        "merchant": receipt.merchant,
        "amount_usd": receipt.amount,
        "date_extracted": receipt.date_extracted,
        "timestamp": datetime.utcnow().isoformat()
    }

    try:
        # Trigger XRPL Reimbursement
        tx_hash = process_reimbursement(
            destination_address=user.xrpl_address,
            amount_usd=receipt.amount,
            metadata=metadata
        )
        
        # Update Database
        receipt.status = "paid"
        receipt.xrpl_tx_hash = tx_hash
        db.commit()
        
        return {
            "message": "Reimbursement successful",
            "tx_hash": tx_hash,
            "receipt_id": receipt.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reimbursement failed: {str(e)}")

# Add script execution to run app: uvicorn main:app --reload
