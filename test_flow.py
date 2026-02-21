import requests
from xrpl.wallet import generate_faucet_wallet
from xrpl.clients import JsonRpcClient
from models import init_db
import os
import json
import time
from PIL import Image, ImageDraw, ImageFont

# Ensure the database is initialized
init_db()

# Create a dummy image to test with
img = Image.new('RGB', (400, 300), color = (255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10,10), "Receipt: Lunch at Alice's Restaurant\nAmount: $15.50\nDate: 2026-02-21", fill=(0,0,0))
test_image_path = "test_receipt.jpg"
img.save(test_image_path)

print("Starting full system end-to-end test...")

# API URL
BASE_URL = "http://127.0.0.1:8000"

print("1. Creating a fake team member and funding their XRP testnet wallet...")
client = JsonRpcClient("https://s.altnet.rippletest.net:51234")
team_member_wallet = generate_faucet_wallet(client, debug=True)

# Generate a user in DB
resp = requests.post(
    f"{BASE_URL}/users", 
    data={"name": "Test User", "xrpl_address": team_member_wallet.classic_address}
)
user_data = resp.json()
print("Created Team Member:", user_data)
submitter_id = user_data["id"]

print("\n2. Submitting dummy receipt for AI Extraction...")
with open(test_image_path, "rb") as f:
    files = {"file": (test_image_path, f, "image/jpeg")}
    data = {"submitter_id": submitter_id}
    receipt_resp = requests.post(f"{BASE_URL}/submit-receipt", data=data, files=files)

receipt_result = receipt_resp.json()
print("Receipt Submission Match:", receipt_result)
receipt_id = receipt_result["receipt"]["id"]

print("\n3. Waiting for AI extraction... Let's list pending receipts")
pending_resp = requests.get(f"{BASE_URL}/pending-receipts")
print("Pending Receipts:", pending_resp.json())

print("\n4. Approving the receipt as reasonable... This should trigger XRPL Payment")
approve_resp = requests.post(f"{BASE_URL}/approve-receipt/{receipt_id}")
approve_result = approve_resp.json()

print("Approval Result:", approve_result)

if "tx_hash" in approve_result:
    print(f"\nSUCCESS! Transaction Hash: {approve_result['tx_hash']}")
    print(f"Verify on testnet explorer: https://testnet.xrpl.org/transactions/{approve_result['tx_hash']}")
else:
    print("\nFAILED: XRPL transaction hash missing.")

# Cleanup
if os.path.exists(test_image_path):
    os.remove(test_image_path)
