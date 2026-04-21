# Azure Pipelines CLI Installer Tasks

Install DevOps CLI tools in Azure Pipelines without custom scripts.  
Provides reusable tasks with version control, caching, and consistent behavior.

[![ADO Extension: Build and Publish](https://github.com/vbnbharath/azure-pipeline-tasks-installers/actions/workflows/publish-extension.yaml/badge.svg?branch=main&event=push)](https://github.com/vbnbharath/azure-pipeline-tasks-installers/actions/workflows/publish-extension.yaml)

---

## Overview

This Azure DevOps extension provides installer tasks that:

- install a requested CLI version  
- reuse the Azure Pipelines tool cache when available  
- add the tool to `PATH`  
- expose the installed binary path via `cliLocation`  

---

## Included Tasks

- `InstallArgoCDCLI@1`
- `InstallCheckmarxOneCLI@1`
- `InstallDatabricksCLI@1`
- `InstallHashicorpSentinelCLI@1`
- `InstallOpenTofuCLI@1`
- `InstallPackerCLI@1`
- `InstallWizCLI@1`

---

## Usage

All tasks follow the same contract:

- Input (Required): `version`
- Output: `cliLocation`

### Example

```yaml
steps:
- task: InstallArgoCDCLI@1
  name: installArgo
  inputs:
    version: latest

- script: |
    argocd version --client --short
    echo "Installed at: $(installArgo.cliLocation)"
```

---

## Repository Layout

- `Tasks/Common`: Shared installer logic and utilities  

- `Tasks/Install*`: Individual task implementations  

- `azure-devops-extension.json`: Extension manifest  

- `docs.md`: Marketplace content  

---

## Build and package

Install dependencies:

```bash
npm install
```

Build the extension payload:

```bash
npm run build:release
```

Package the extension:

```bash
npm run package:release
```

---

## Publishing

Marketplace content is sourced from `docs.md`.

Extension manifest is defined in: `azure-devops-extension.json`

For more details: https://learn.microsoft.com/en-us/azure/devops/extend/develop/manifest
