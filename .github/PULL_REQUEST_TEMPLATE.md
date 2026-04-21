## Summary

Describe the change and why it is needed.

## Type of change

- [ ] New installer task
- [ ] Enhancement to an existing task
- [ ] Bug fix
- [ ] Documentation update
- [ ] Packaging or manifest change
- [ ] CI or release workflow change

## Affected area

- [ ] InstallArgoCDCLI
- [ ] InstallCheckmarxOneCLI
- [ ] InstallDatabricksCLI
- [ ] InstallHashicorpSentinelCLI
- [ ] InstallOpenTofuCLI
- [ ] InstallPackerCLI
- [ ] InstallWizCLI
- [ ] Shared task code in `Tasks/Common`
- [ ] `azure-devops-extension.json`
- [ ] GitHub Actions workflow
- [ ] Documentation

## Related issue

Closes #

## Validation

List what you ran to verify the change.

```text
npm run build:release
npm run package:release
```

Add any task-specific pipeline validation or sample YAML used for testing.

## Checklist

- [ ] I updated docs if the user-facing behavior changed.
- [ ] I kept task inputs, outputs, and messages consistent with the existing extension pattern.
- [ ] I removed secrets and sensitive data from logs, screenshots, and examples.
- [ ] I tested the relevant task, packaging flow, or workflow change.
