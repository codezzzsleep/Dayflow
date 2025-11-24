# Pushing changes to your own repository

The sandbox environment used for this project does not have access to your personal Git remotes. To push the current branch to your own repository, run these commands locally (replace the placeholder values with your own repository URL and preferred branch name):

```bash
# Add your own remote
git remote add personal git@github.com:<your-username>/<your-repo>.git

# Push the current branch
git push personal work:main
```

If you prefer HTTPS instead of SSH, use:

```bash
git remote add personal https://github.com/<your-username>/<your-repo>.git
```

After pushing, you can open a pull request from the branch on your repository. This repository keeps changes on the `work` branch by default; if your default branch is different, adjust the push target accordingly.
