# XRPayroll

A complete Receipt Reimbursement System built on the XRP Ledger.

This application allows a club or organization team members to submit receipts for expenses. The system utilizes Gemini AI (LLM) to extract transaction information (amount, date, merchant), and provides a treasurer dashboard for approving pending reimbursements. When a reimbursement is approved, it automatically generates a payment transaction on the XRP Ledger directly to the team member. The receipt metadata is recorded as a Memo on the ledger for an immutable audit trail.

## Features
- **AI Receipts**: Built-in Google GenAI receipt image extraction to JSON.
- **XRP Testnet Integrated**: Reimburses testers directly using the `xrpl-py` SDK.
- **On-chain Logging**: Encodes metadata directly onto XRPL.

## Setup
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
5. View the endpoints and test directly through the Swagger UI: `http://127.0.0.1:8000/docs`

## Testing
Run `python test_flow.py` to simulate a fully automated sequence involving user creation, mock receipt uploading, simulated AI processing, and an automated mock-reimbursement on the XRP Testnet.