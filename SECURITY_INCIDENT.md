# 🚨 Security Incident: Exposed API Key - Action Required

## What Happened?
Your OneSignal API key was exposed in `workers/wrangler.toml` and has been committed to git history. This is a **critical security issue** that needs immediate attention.

## ✅ What I've Done

1. **Removed the API key** from `workers/wrangler.toml`
2. **Created `.dev.vars`** file for local development (gitignored)
3. **Updated `.gitignore`** to prevent future commits of `.dev.vars`

## 🔴 CRITICAL: What You MUST Do Now

### 1. Revoke and Regenerate the Exposed API Key

**⚠️ This is the MOST IMPORTANT step!**

Since the API key has been committed to git (and possibly pushed to GitHub/GitLab), you need to:

1. Go to your OneSignal dashboard: https://dashboard.onesignal.com/
2. Navigate to **Settings** → **Keys & IDs**
3. **Delete or revoke** the exposed REST API Key
4. **Generate a new REST API Key**
5. Update the new key in:
   - `workers/.dev.vars` (for local development)
   - Cloudflare Workers secrets (for production - see below)

### 2. Set Up Cloudflare Workers Secrets (Production)

For production deployment, set the API key as a secret:

```bash
cd workers
wrangler secret put ONESIGNAL_API_KEY
```

When prompted, paste your **NEW** OneSignal API key.

### 3. Update Local Development File

Update `workers/.dev.vars` with your **NEW** API key:

```
ONESIGNAL_API_KEY=your_new_api_key_here
```

### 4. Clean Git History (Optional but Recommended)

If you've pushed this to a public repository, the old API key is still visible in git history. You have two options:

#### Option A: Remove from Git History (Recommended for Public Repos)

**⚠️ Warning: This rewrites git history and requires force push**

```bash
# Install git-filter-repo if you haven't
# brew install git-filter-repo

# Backup your repo first!
cd /Users/vokingley/Documents/Nextjs/rank-alert

# Remove the sensitive data from all commits
git filter-repo --path workers/wrangler.toml --invert-paths --force

# Or use BFG Repo-Cleaner (alternative method)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
# java -jar bfg.jar --delete-files wrangler.toml
# git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

After cleaning:
```bash
# Force push to remote (⚠️ coordinate with team first!)
git push origin --force --all
git push origin --force --tags
```

#### Option B: Commit the Fix (Simpler, but old key remains in history)

If this is a private repository and you've already revoked the key:

```bash
git add .
git commit -m "security: Remove exposed OneSignal API key from wrangler.toml"
git push
```

**Note:** The old key will still be visible in git history, but it's safe if you've revoked it.

## 📝 How to Use Secrets Going Forward

### Local Development
- Add secrets to `workers/.dev.vars` (this file is gitignored)
- Wrangler automatically loads this file during `wrangler dev`

### Production Deployment
- Use `wrangler secret put SECRET_NAME` to set secrets
- Secrets are encrypted and stored securely in Cloudflare

### In Your Worker Code
Access secrets the same way as environment variables:

```typescript
export default {
  async fetch(request: Request, env: Env) {
    const apiKey = env.ONESIGNAL_API_KEY; // Works for both vars and secrets
    // ...
  }
}
```

## 🔒 Best Practices

1. **Never commit secrets** to version control
2. **Always use `.env`, `.dev.vars`, or secret management** for sensitive data
3. **Rotate API keys** if they're ever exposed
4. **Use different keys** for development and production
5. **Review `.gitignore`** before committing new files
6. **Enable secret scanning** on GitHub/GitLab if available

## 📋 Checklist

- [ ] Revoke the old OneSignal API key
- [ ] Generate a new OneSignal API key
- [ ] Update `workers/.dev.vars` with the new key
- [ ] Set the new key in Cloudflare Workers: `wrangler secret put ONESIGNAL_API_KEY`
- [ ] Test locally with `wrangler dev`
- [ ] Deploy to production with `wrangler deploy`
- [ ] (Optional) Clean git history if pushed to public repo
- [ ] Commit the changes: `git add . && git commit -m "security: Remove exposed API key"`

## 🆘 Need Help?

If you have questions or need assistance with any of these steps, let me know!

---

**Current Status:**
- ✅ API key removed from `wrangler.toml`
- ✅ `.dev.vars` created for local development
- ✅ `.gitignore` updated
- ⏳ **Waiting for you to revoke and regenerate the API key**
