import discord
import os
import httpx
from dotenv import load_dotenv

# Fix macOS SSL Certification Verification Issue
import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# State machine for users in the process of linking:
# link_states[discord_id] = "WAITING_FOR_NAME" or "WAITING_FOR_PASSWORD" or {"name": "..."}
link_states = {}

API_BASE = "http://127.0.0.1:8000"

async def check_if_linked(discord_id: str) -> bool:
    async with httpx.AsyncClient() as http_client:
        res = await http_client.get(f"{API_BASE}/bot/user/{discord_id}")
        return res.status_code == 200

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')

@client.event
async def on_message(message):
    # Ignore our own messages
    if message.author == client.user:
        return

    # only answer DMs
    if not isinstance(message.channel, discord.DMChannel):
        return

    discord_id = str(message.author.id)
    is_linked = await check_if_linked(discord_id)

    if not is_linked:
        if discord_id not in link_states:
            link_states[discord_id] = "WAITING_FOR_NAME"
            await message.channel.send("Welcome to XRPayroll! You haven't linked your account yet.\nWhat is the **Full Name** you registered with?")
            return
            
        state = link_states[discord_id]
        if state == "WAITING_FOR_NAME":
            link_states[discord_id] = {"name": message.content.strip()}
            await message.channel.send(f"Great! Now what is the **Password** for '{message.content.strip()}'?")
            return
            
        if isinstance(state, dict) and "name" in state:
            name = state["name"]
            password = message.content.strip()
            
            # Attempt link
            async with httpx.AsyncClient() as http_client:
                res = await http_client.post(f"{API_BASE}/bot/link", data={
                    "discord_id": discord_id,
                    "name": name,
                    "password": password
                })
                
            if res.status_code == 200:
                data = res.json()
                del link_states[discord_id]
                await message.channel.send(f"Success! Linked to profile **{data['name']}**. You can now send me receipt images directly here!")
            else:
                del link_states[discord_id]
                await message.channel.send("Invalid name or password. Please try again from the beginning. What is your Full Name?")
            return

    # User is linked. Process attachments
    if message.attachments:
        await message.channel.send("Analyzing receipt with AI... ⏳")
        for attachment in message.attachments:
            if any(attachment.filename.lower().endswith(ext) for ext in ['png', 'jpg', 'jpeg']):
                file_bytes = await attachment.read()
                
                async with httpx.AsyncClient() as http_client:
                    files = {'file': (attachment.filename, file_bytes, attachment.content_type)}
                    data = {'discord_id': discord_id}
                    
                    try:
                        # Increase timeout for AI processing
                        res = await http_client.post(f"{API_BASE}/bot/submit", data=data, files=files, timeout=30.0)
                        if res.status_code == 200:
                            receipt = res.json()["receipt"]
                            await message.channel.send(f"✅ **Receipt Published!**\nIdentified **${receipt['amount']:.2f}** from **{receipt['merchant']}**.\nIt is now pending Treasurer approval.")
                        else:
                            await message.channel.send(f"❌ Failed to process: {res.json().get('detail', 'Unknown error')}")
                    except Exception as e:
                        await message.channel.send(f"❌ Error communicating with backend: {str(e)}")
            else:
                await message.channel.send("Please upload a valid image file (PNG/JPG).")
    else:
        await message.channel.send("You are already linked! Send me a picture of your receipt whenever you're ready to submit for reimbursement.")

if __name__ == "__main__":
    if not TOKEN:
        print("ERROR: DISCORD_TOKEN is not set in .env")
    else:
        client.run(TOKEN)
