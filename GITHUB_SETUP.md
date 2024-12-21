# GitHub Repository Setup Guide

1. Generate a Personal Access Token (PAT):
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scopes:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
     - `write:packages` (Upload packages to GitHub Package Registry)
   - Copy the generated token

2. Configure Git with your credentials:
```bash
git config --global user.name "Your GitHub Username"
git config --global user.email "your.email@example.com"
```

3. Store your credentials:
```bash
# For Linux/macOS
git config --global credential.helper store
echo "https://YOUR-USERNAME:YOUR-TOKEN@github.com" > ~/.git-credentials

# For Windows
git config --global credential.helper wincred
```

4. Push the code:
```bash
git push -u origin main
```

5. Set up GitHub Secrets for Deployment:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `DEPLOY_KEY`: Your server's SSH private key
     - `DEPLOY_HOST`: Your server's hostname/IP
     - `DEPLOY_USER`: SSH username for deployment

After setting up these credentials, the GitHub Actions workflow will automatically:
- Build Docker images for frontend and backend
- Push them to GitHub Container Registry
- Deploy to your server when pushing to main branch
