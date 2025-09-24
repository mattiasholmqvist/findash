---
name: commit
description: Analyze changes and create a smart git commit
arguments: "Additional instructions for the commit"
---

additional instructions = $ARGUMENTS

type = "feat", "fix", "docs", "style", "refactor", "perf", "test", "chore"

# Smart Git CommitPRPs/ai_docs

Please help me create a git commit by:

1. First, check the current git status and analyze what changed:

```bash
git status
git diff --staged
```

2. If no files are staged, show me the changes and help me decide what to stage:

```bash
git diff
git status -s
```

3. Based on the changes, suggest:

- Use the standards from the "Version Control Structure" section of `CLAUDE.md`
- If the changes are complex, suggest breaking into multiple commits

4. After showing me the suggested commit message, ask if I want to:

- Use it as-is
- Modify it
- Add more details to the body
- Stage different files

5. Once approved, create the commit and show me the result.

6. Finally, ask if I want to push or create a PR.
