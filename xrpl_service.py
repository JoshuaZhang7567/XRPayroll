import os
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.models.transactions import Payment, Memo
from xrpl.transaction import submit_and_wait
from xrpl.utils import xrp_to_drops
import json

# Set up the XRPL testnet client
TESTNET_URL = "https://s.altnet.rippletest.net:51234"
client = JsonRpcClient(TESTNET_URL)

def get_club_wallet():
    """
    Retrieves the club wallet. In production, this would use a secure vault.
    For this testnet app, we generate one and save its seed to memory or a file, 
    or just require a CLI setup. Let's make an automated env or file-backed setup.
    """
    wallet_seed_file = "club_wallet_seed.txt"
    if os.path.exists(wallet_seed_file):
        with open(wallet_seed_file, "r") as f:
            seed = f.read().strip()
        from xrpl.wallet import Wallet
        return Wallet.from_seed(seed)
    else:
        print("Generating a new club wallet on the Testnet and funding it...")
        wallet = generate_faucet_wallet(client, debug=True)
        with open(wallet_seed_file, "w") as f:
            f.write(wallet.seed)
        return wallet

def process_reimbursement(destination_address: str, amount_usd: float, metadata: dict) -> str:
    """
    Sends XRP to the destination address. We will assume 1 XRP = 1 USD for simplicity 
    in this demo, or we can just send the amount in XRP directly.
    Attaches metadata as a Memo.
    Returns the transaction hash.
    """
    club_wallet = get_club_wallet()
    
    # We will just map the amount directly for the demo (amount_usd defaults to XRP)
    amount_drops = xrp_to_drops(amount_usd)
    
    # Prepare the memo
    memo_data = json.dumps(metadata)
    memo = Memo(
        memo_data=memo_data.encode('utf-8').hex()
    )
    
    payment_tx = Payment(
        account=club_wallet.address,
        amount=amount_drops,
        destination=destination_address,
        memos=[memo]
    )
    
    # Sign and submit
    print(f"Submitting payment of {amount_usd} XRP to {destination_address}...")
    response = submit_and_wait(payment_tx, client, club_wallet)
    
    if response.result.get("meta", {}).get("TransactionResult") == "tesSUCCESS":
        return response.result["hash"]
    else:
        raise Exception(f"Transaction failed: {response.result}")

