import path = require('path');
import { createGitHubReleaseCliInstaller } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const ARGO_CD_CLI_NAME = 'argocd';
const ARGO_CD_DISPLAY_NAME = 'Argo CD';

const downloadArgoCDCLI = createGitHubReleaseCliInstaller({
    displayName: ARGO_CD_DISPLAY_NAME,
    toolName: ARGO_CD_CLI_NAME,
    repository: 'argoproj/argo-cd',
    fallbackVersion: 'v3.3.7',
    artifactType: 'file',
    buildDownloadUrl: (context) => {
        return `https://github.com/argoproj/argo-cd/releases/download/v${context.version}/${ARGO_CD_CLI_NAME}-${context.platform}-${context.architecture}${context.executableExtension}`;
    },
});

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: ARGO_CD_DISPLAY_NAME,
    executableName: ARGO_CD_CLI_NAME,
    installer: downloadArgoCDCLI,
    verifyLine: 'version --client --short',
});
