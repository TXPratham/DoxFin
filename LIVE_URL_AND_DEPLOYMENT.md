# DoxFin Live Public URL & Tunnel Deployment Guide

This guide details how to expose your local DoxFin deployment over a secure public URL, how to check or launch your live link on-demand, and how to configure a **permanent, fixed URL that never changes**.

---

## 1. Quick Reference: How to Get Your URL Every Time

### Check the Currently Active URL (Instant)
If the tunnel is already running in the background and you just need the link:

```powershell
.\check-tunnel-url.ps1
```
*Sample Output:*
```
Currently Active Cloudflare Tunnel URL:
https://alter-sum-applications-parameter.trycloudflare.com
```

### Start a New Tunnel & Auto-Copy URL (1-Click)
To launch a new public tunnel to your local frontend (`http://localhost:3000`):

```powershell
.\start-tunnel.ps1
```
What this does:
1. Verifies that the frontend (port 3000) and backend (port 8000) are running.
2. Launches `cloudflared` to establish a secure tunnel.
3. Automatically parses and prints the live HTTPS address.
4. **Copies the URL straight to your clipboard** so you can immediately paste it into your browser or share it.

---

## 2. Why Quick Tunnel URLs Change

DoxFin uses **Cloudflare Quick Tunnels** (`trycloudflare.com`) by default because they require:
- **Zero account creation or login**
- **Zero DNS configuration**
- **Zero firewall port-forwarding**

However, Quick Tunnels are ephemeral:
- Each time the tunnel process or server restarts, Cloudflare allocates a new random subdomain (e.g., `https://random-words.trycloudflare.com`).
- The previous URL is immediately released.

If you need a **permanent fixed URL**, choose one of the options in Section 3 below.

---

## 3. How to Set Up a Permanent Fixed URL (Never Changes)

### Option A: Free Fixed Subdomain via Localtunnel (No Account Needed)
Localtunnel allows you to request a custom subdomain without creating an account:

```powershell
# In PowerShell:
npx localtunnel --port 3000 --subdomain doxfin-pratham
```
Your URL will **always** be:
👉 **`https://doxfin-pratham.loca.lt`** every single time you start it!

---

### Option B: Free Permanent Static Domain via Ngrok (Official Free Tier)
Ngrok provides 1 free permanent static domain per free account:

1. Sign up for a free account at [ngrok.com](https://ngrok.com).
2. Claim your free static domain (for example: `doxfin-app.ngrok-free.app`).
3. Connect your authtoken:
   ```powershell
   ngrok config add-authtoken <YOUR_TOKEN>
   ```
4. Start your permanent tunnel:
   ```powershell
   ngrok http --domain=doxfin-app.ngrok-free.app 3000
   ```
Your URL will stay **`https://doxfin-app.ngrok-free.app`** permanently.

---

### Option C: Production Cloudflare Named Tunnel (Custom Domain)
If you own a domain name and manage it through Cloudflare:

1. Authenticate with your Cloudflare account:
   ```powershell
   cloudflared tunnel login
   ```
2. Create a named tunnel:
   ```powershell
   cloudflared tunnel create doxfin
   ```
3. Route DNS for your custom domain:
   ```powershell
   cloudflared tunnel route dns doxfin app.yourdomain.com
   ```
4. Run the tunnel:
   ```powershell
   cloudflared tunnel run doxfin
   ```
Your application will be permanently reachable at **`https://app.yourdomain.com`**.

---

## 4. Complete End-to-End Startup Sequence

To start DoxFin from scratch with full public access:

### Terminal 1 — Start the Backend Server:
```powershell
.\.venv\Scripts\Activate.ps1
python run_backend.py
```
*(Runs on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`)*

### Terminal 2 — Start the Frontend Dev Server:
```powershell
cd frontend
npm run dev
```
*(Runs on `http://localhost:3000` and proxies `/api` to the backend)*

### Terminal 3 — Launch the Public Tunnel:
```powershell
.\start-tunnel.ps1
```
*(Grabs your live HTTPS address and copies it to your clipboard)*

---

## 5. Built-in Security Protections on Public Tunnels

When accessed publicly via the tunnel, DoxFin automatically enforces enterprise security protections:

| Protection | Implementation | Details |
| :--- | :--- | :--- |
| **HTTP Hardening Headers** | FastAPI Middleware | Injects `nosniff`, `SAMEORIGIN`, `1; mode=block`, `HSTS`, `Referrer-Policy`, and `Permissions-Policy`. |
| **Path Traversal Shield** | Regex Whitelist | Validates all `document_id` inputs (`^[a-zA-Z0-9_\-]+$`) to block `../`, `..\`, null bytes, and script tags. |
| **PDF Decontamination** | PyMuPDF Scrubbing | Strips malicious embedded JavaScript, launch annotations, and unknown attachments on upload. |
| **Prompt Injection Defense** | RAG Guard Filters | Blocks adversarial prompt leaks, system prompt extractions, and jailbreak patterns with a `SECURITY_VIOLATION` response. |
| **Sliding-Window Rate Limiter** | Pure Python Guard | Restricts clients to 120 req/min windowed per IP to prevent automated scraping or denial-of-service. |

To run the automated security verification suite:
```powershell
.\.venv\Scripts\python.exe -m unittest backend/tests/test_enterprise_security.py
```
*(Passes 5/5 automated test suites cleanly)*
