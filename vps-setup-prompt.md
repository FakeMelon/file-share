# VPS Setup Prompt for Claude

Copy and paste this to Claude on your VPS:

---

Set up and deploy a Next.js file-share app on this server. Here are the details:

**Repo:** https://github.com/FakeMelon/file-share.git

**Requirements:**
1. Clone the repo to `/opt/file-share`
2. Install dependencies and build the production Next.js app
3. Create a `.env.local` with:
   - `UPLOAD_PASSWORD` — generate a strong random password and show it to me
   - `MAX_FILE_SIZE_MB=100`
   - `MAX_FILES=10`
   - `PORT=3001`
4. Run it with **pm2** (name: `file-share`, using `npm run start`)
5. Set up **nginx** reverse proxy for `file.mapu.co.il` → `localhost:3001`
   - This server already runs other services on other subdomains of `mapu.co.il`, so just add a new server block — don't touch existing configs
   - Set `client_max_body_size 100m` to allow large uploads
   - Proxy headers: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `Host`
   - WebSocket support headers for Next.js HMR (upgrade, connection)
6. Set up **SSL with Let's Encrypt** using certbot for `file.mapu.co.il`
   - If certbot is already installed, just run it for the new subdomain
   - If not, install it first

After everything is running, show me:
- The pm2 status
- A curl test to `https://file.mapu.co.il` to confirm it's live
- The upload password you generated
