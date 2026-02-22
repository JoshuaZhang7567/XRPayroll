# XRPayroll

A complete Receipt Reimbursement System built on the XRP Ledger.

This application allows a club or organization team members to submit receipts for expenses. The system utilizes Gemini AI (LLM) to extract transaction information (amount, date, merchant), and provides a treasurer dashboard for approving pending reimbursements. When a reimbursement is approved, it automatically generates a payment transaction on the XRP Ledger directly to the team member. The receipt metadata is recorded as a Memo on the ledger for an immutable audit trail.

## Features
- **AI Receipts**: Built-in Google GenAI receipt image extraction to JSON.
- **XRP Testnet Integrated**: Reimburses testers directly using the `xrpl-py` SDK.
- **On-chain Logging**: Encodes metadata directly onto XRPL.

## Setup
### 1. Backend API
1. Clone the repository.
2. Setup the virtual environment and install requirements:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
3. Set your `GEMINI_API_KEY` inside `.env`.
4. Run the API:
```bash
uvicorn main:app --reload
```
*(The backend runs on http://127.0.0.1:8000)*

### 2. Frontend React App
1. Open a new terminal tab.
2. Navigate into the frontend folder:
```bash
cd frontend
```
3. Install the dependencies and start the app:
```bash
npm install
npm run dev
```
4. Open your browser to the local URL provided (usually `http://localhost:5173`) to view the beautiful modern interface!

## Testing
Run `python test_flow.py` to simulate a fully automated sequence involving user creation, mock receipt uploading, simulated AI processing, and an automated mock-reimbursement on the XRP Testnet.