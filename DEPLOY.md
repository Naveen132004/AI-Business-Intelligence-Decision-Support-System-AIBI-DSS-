# Deploying AIBI-DSS

AIBI runs as four containers on one server, defined in `docker-compose.prod.yml`:

| Container    | What it is                                   | Exposed            |
| ------------ | -------------------------------------------- | ------------------ |
| `web`        | nginx serving the React build, proxying `/api` | port 80 (public) |
| `backend`    | Spring Boot API                              | internal only      |
| `ai-service` | FastAPI (Prophet, embeddings, Gemini)        | internal only      |
| `postgres`   | PostgreSQL 16 + pgvector                     | internal only      |

**Server size:** at least 2 vCPU and 4 GB RAM (the AI service alone uses about 2 GB).
The steps below use **Oracle Cloud Always Free**, which gives an ARM VM with up to
4 OCPU / 24 GB RAM at no cost. Any Ubuntu VPS with Docker works the same way from step 3.

---

## 1. Create the server (Oracle Cloud)

1. Sign up at <https://www.oracle.com/cloud/free/> and open the console.
2. **Compute → Instances → Create instance**
   - Image: **Canonical Ubuntu 22.04**
   - Shape: **Ampere → VM.Standard.A1.Flex**, 2 OCPU and 12 GB RAM (inside the free allowance)
   - Add your SSH public key (or let it generate one and download the private key)
3. Note the instance's **public IP address**.

## 2. Open port 80 (and 443 if you will add HTTPS)

Oracle blocks traffic in two places; open both.

1. **In the console:** instance → *Subnet* → *Security list* → **Add ingress rule**:
   source `0.0.0.0/0`, protocol TCP, destination port `80` (repeat for `443`).
2. **On the server** (Oracle's Ubuntu image ships restrictive iptables rules):

   ```bash
   ssh ubuntu@YOUR_SERVER_IP
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

## 3. Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit   # log out and back in so the group change applies
```

## 4. Get the code and configure it

```bash
git clone https://github.com/Naveen132004/AI-Business-Intelligence-Decision-Support-System-AIBI-DSS-.git aibi
cd aibi
cp .env.example .env
```

Generate the two secrets and put them in `.env`:

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
nano .env
```

Set `PUBLIC_URL` to the address people will use, e.g. `http://YOUR_SERVER_IP`.
Add `GEMINI_API_KEY` if you want the RAG assistant to answer questions.

## 5. Start it

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The first build takes 10–20 minutes (PyTorch and the Java build are the slow parts).
Watch progress with `docker compose -f docker-compose.prod.yml logs -f`.

Open **http://YOUR_SERVER_IP**.

## 6. Secure the admin account — do this first

`db/init.sql` seeds an admin user with a public password:
`admin@aibi.com` / `Admin@123`. Sign in with it, go to **Profile**, and change the
password immediately (or create your own account and stop using the seeded one).

---

## Updating to a new version

```bash
cd ~/aibi
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Your data lives in the `pgdata` Docker volume and survives rebuilds.

## Optional: a domain with HTTPS

1. Point an **A record** for your domain (e.g. `aibi.example.com`) at the server IP.
2. Serve the app on an internal port and let Caddy handle certificates. In `.env`:

   ```env
   HTTP_PORT=8080
   PUBLIC_URL=https://aibi.example.com
   ```

3. Install Caddy and give it the domain:

   ```bash
   sudo apt install -y caddy
   echo 'aibi.example.com {
       reverse_proxy localhost:8080
   }' | sudo tee /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   docker compose -f docker-compose.prod.yml up -d
   ```

Caddy obtains and renews the Let's Encrypt certificate automatically.

## Backups

```bash
# dump
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U aibi_user aibi_db | gzip > aibi-$(date +%F).sql.gz

# restore into a fresh stack
gunzip -c aibi-YYYY-MM-DD.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U aibi_user aibi_db
```

## Troubleshooting

| Symptom | Check |
| ------- | ----- |
| Site doesn't load | Port 80 open in **both** the Oracle security list and iptables (step 2); `docker compose -f docker-compose.prod.yml ps` |
| "502 Bad Gateway" right after starting | The backend takes ~30 s to boot; wait and refresh |
| Sign-in fails with a network error | `docker compose -f docker-compose.prod.yml logs backend` |
| Forecast / health score errors | `docker compose -f docker-compose.prod.yml logs ai-service` |
| Assistant says it can't answer | `GEMINI_API_KEY` missing in `.env`, then press **Sync data** on the Assistant page |
| Changed `.env` but nothing happened | Re-run `up -d` so containers are recreated with the new values |
