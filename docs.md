## 🚀 Azure Pipelines CLI Installer Tasks

**Streamline CI/CD pipelines with high-performance, cached CLI installers for ArgoCD, Checkmarx One, Databricks, Hashicorp Sentinel, OpenTofu, and modern DevOps toolchains.**

---

### ⚡ What is this?

Stop writing `powershell | bash` scripts in every pipeline.

**Azure Pipelines CLI Installer Tasks** provides ready-to-use Azure Pipelines tasks to install popular CLI tools on demand — with version control, caching, and consistent behavior across all agents.

---

### 🔧 Supported CLI Tools

Install the latest or pinned versions of the following tools:

| Task Name | YAML Identifier | Primary Utility |
| --- | --- | --- |
| Argo CD Installer | `InstallArgoCDCLI@1` | Installs Argo CD CLI and adds it to `PATH` for GitOps workflows. |
| Checkmarx One Installer | `InstallCheckmarxOneCLI@1` | Installs Checkmarx One CLI for security scanning and automation in pipelines. |
| Databricks Installer | `InstallDatabricksCLI@1` | Installs Databricks CLI for workspace, job, and deployment automation. |
| HashiCorp Sentinel Installer | `InstallHashicorpSentinelCLI@1` | Installs HashiCorp Sentinel CLI for policy-as-code validation workflows. |
| OpenTofu Installer | `InstallOpenTofuCLI@1` | Installs OpenTofu CLI for open-source infrastructure-as-code provisioning. |
| Packer Installer | `InstallPackerCLI@1` | Installs Packer CLI for automated image build pipelines. |
| Wiz Installer | `InstallWizCLI@1` | Installs Wiz CLI for cloud security checks and pipeline automation. |

---

### 🎯 Why teams use this

- **No more install scripts**: Remove repeated shell scripts from pipelines.
- **Consistent across pipelines**: Same install behavior across all teams and environments.
- **Built-in caching**: Reuses Azure Pipelines tool cache when available.
- **Version control**: Use `latest` or pin exact versions for reproducible builds.
- **Works everywhere**: Supports both Linux and Windows agents.

---

### 🧩 How it works

Each task:

- Installs the requested CLI version  
- Reuses tool cache when available  
- Adds the tool to `PATH`  
- Exposes the binary location via `cliLocation`  

---

### Task Examples

#### Argo CD

```yaml
- task: vbnbharath.installers.argo.InstallArgoCDCLI@1
  inputs:
    version: latest
```

#### Checkmarx One

```yaml
- task: vbnbharath.installers.cx1.InstallCheckmarxOneCLI@1
  inputs:
    version: latest
```

#### Databricks

```yaml
- task: vbnbharath.installers.dbx.InstallDatabricksCLI@1
  name: installDbx
  inputs:
    version: latest

- script: |
    databricks version
    echo "Installed at: $(installDbx.cliLocation)"
```

#### Hashicorp Sentinel

```yaml
- task: vbnbharath.installers.hcp.InstallHashicorpSentinelCLI@1
  inputs:
    version: latest
```

#### OpenTofu

```yaml
- task: vbnbharath.installers.tofu.InstallOpenTofuCLI@1
  inputs:
    version: latest
```

#### Packer

```yaml
- task: vbnbharath.installers.pkr.InstallPackerCLI@1
  inputs:
    version: latest
```

#### Wiz.io

```yaml
- task: vbnbharath.installers.wiz.InstallWizCLI@1
  inputs:
    version: latest
```

---

### Inputs
- **`version`**: (Required) The version to install. We recommend using specific versions for production environments.

### Output Variables
- **`cliLocation`**: Exports the absolute path of the tool directory. Use this if your script requires explicit pathing instead of relying on the global `PATH` .

---

### Security & Compliance
- **Minimal Permissions:** This extension only requires `vso.build` and `vso.release` read-only scopes.[6, 7]
- **Secret Handling:** All sensitive inputs are masked in logs using the `setSecret` protocol.
- **Data Privacy:** No telemetry or user data is collected. All downloads occur over encrypted HTTPS from official repositories.

### 💡 Best Practices

- Pin versions for production pipelines  
- Use `latest` for validation/testing  
- Use `cliLocation` when exact binary path is required  

---

### ⭐ If this saves you time

Give it a ⭐ and share it with your team!
