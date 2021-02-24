# GUIDELINES


## Workflow: 
### Commits:

- Before committing anything, make sure to run `git status` and `git diff` to ensure that your code does not contain any unwanted changes. Only commit changes that are related to your task.

- Avoid including configuration files (e.g. `.vscode/`) or temporary files (like `.swp`, `.pyc`) in your commits. Add them to `.gitignore` beforehand.


- Have clear commit messages that start with what the change is related to, and then give a small description of it. Like
````
Backend: Added Registration Views
Added views for creating, removing and deleting new users
````

### Branches:

- Have a clear name for your branch. If you are working on UI Fixes, your branch should be named something like `ui-fixes-<your name>`.

- You may compare your branch with the master/development by `git diff --name-only master HEAD` and `git diff master HEAD` to ensure that your changes are the way you want.
