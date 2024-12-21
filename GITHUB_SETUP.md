# GitHub Setup Guide

This guide explains how to set up your GitHub repository and configure it for development.

## Table of Contents
- [Repository Setup](#repository-setup)
- [Branch Protection](#branch-protection)
- [Environment Variables](#environment-variables)
- [GitHub Actions](#github-actions)
- [Development Workflow](#development-workflow)
- [Code Review Process](#code-review-process)

## Repository Setup

1. Create a new repository on GitHub:
```bash
# Initialize with main branch
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Add remote and push
git remote add origin https://github.com/yourusername/dropship-platform.git
git push -u origin main
```

2. Configure repository settings:
- Enable "Issues" and "Projects"
- Set up branch protection rules
- Configure GitHub Actions permissions
- Set up repository secrets

## Branch Protection

Configure branch protection rules for `main`:

1. Go to Settings > Branches > Add rule
2. Configure the following:
```yaml
Branch name pattern: main
Protect matching branches:
  ✓ Require pull request reviews before merging
    ✓ Required approving reviews: 1
    ✓ Dismiss stale pull request approvals when new commits are pushed
    ✓ Require review from Code Owners
  ✓ Require status checks to pass before merging
    ✓ Require branches to be up to date before merging
    Required status checks:
      - build
      - test
      - security
  ✓ Include administrators
  ✓ Allow force pushes: Disabled
  ✓ Allow deletions: Disabled
```

## Environment Variables

Set up the following repository secrets:

1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:
```
# Docker Hub
DOCKER_HUB_USERNAME
DOCKER_HUB_TOKEN

# Deployment
DEPLOY_HOST
DEPLOY_USER
DEPLOY_KEY

# Security
SNYK_TOKEN
SONAR_TOKEN

# Notifications
SLACK_WEBHOOK_URL
```

## GitHub Actions

Our CI/CD pipeline is configured in `.github/workflows/deploy.yml`. It includes:

1. Testing:
```yaml
- Unit tests
- Integration tests
- E2E tests
- Code coverage
```

2. Security:
```yaml
- SAST scanning
- Dependency scanning
- Container scanning
- Secret scanning
```

3. Build:
```yaml
- Frontend build
- Backend build
- Docker image builds
```

4. Deploy:
```yaml
- Staging deployment
- Production deployment
- Database migrations
```

## Development Workflow

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: your commit message"
```

3. Keep your branch updated:
```bash
git fetch origin
git rebase origin/main
```

4. Push changes:
```bash
git push origin feature/your-feature-name
```

5. Create a Pull Request:
- Use the PR template
- Link related issues
- Add appropriate labels
- Request reviews

## Code Review Process

### Submitting Code for Review

1. PR Title Format:
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(auth): add OAuth2 authentication
```

2. PR Description Template:
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Reviewing Code

1. Review Checklist:
```markdown
Code Quality:
- [ ] Follows coding standards
- [ ] No code smells
- [ ] Appropriate error handling
- [ ] Efficient algorithms/data structures

Security:
- [ ] Input validation
- [ ] Authentication/Authorization
- [ ] No sensitive data exposure
- [ ] Safe dependencies

Testing:
- [ ] Adequate test coverage
- [ ] Edge cases covered
- [ ] Tests are meaningful
- [ ] Tests pass

Documentation:
- [ ] Code is self-documenting
- [ ] Comments where needed
- [ ] API documentation updated
- [ ] README updated if needed
```

2. Providing Feedback:
- Be specific and constructive
- Include code examples
- Reference documentation/best practices
- Use a collaborative tone

## Git Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: Code change that neither fixes a bug nor adds a feature
- perf: Code change that improves performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools

Examples:
```bash
feat(auth): add JWT authentication
fix(api): handle null response in user service
docs(readme): update deployment instructions
style(lint): format code according to new rules
refactor(core): simplify error handling logic
perf(query): optimize database queries
test(api): add integration tests for auth endpoints
chore(deps): update dependencies
```

## Issue Templates

### Bug Report Template
```markdown
**Description**
A clear and concise description of the bug.

**Steps To Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Ubuntu 20.04]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

**Additional Context**
Add any other context about the problem here.
```

### Feature Request Template
```markdown
**Problem Statement**
A clear and concise description of the problem this feature would solve.

**Proposed Solution**
A clear and concise description of what you want to happen.

**Alternative Solutions**
A clear and concise description of any alternative solutions you've considered.

**Additional Context**
Add any other context or screenshots about the feature request here.
```

## Pull Request Labels

Use the following labels to categorize PRs:

```yaml
Type:
  - feature
  - bugfix
  - hotfix
  - documentation
  - refactor
  - performance
  - test
  - dependency

Priority:
  - critical
  - high
  - medium
  - low

Status:
  - ready for review
  - in review
  - changes requested
  - approved
  - blocked

Size:
  - xs (0-9 lines)
  - sm (10-29 lines)
  - md (30-99 lines)
  - lg (100-499 lines)
  - xl (500+ lines)
```

For more information about deployment and API documentation, please refer to:
- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](API_DOCS.md)
