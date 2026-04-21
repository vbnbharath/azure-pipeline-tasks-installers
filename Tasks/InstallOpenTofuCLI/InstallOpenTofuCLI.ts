import path = require('path');
import { createGitHubReleaseCliInstaller } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const OPENTOFU_CLI_NAME = 'tofu';
const OPENTOFU_DISPLAY_NAME = 'OpenTofu';

const downloadOpenTofuCLI = createGitHubReleaseCliInstaller({
    displayName: OPENTOFU_DISPLAY_NAME,
    toolName: OPENTOFU_CLI_NAME,
    repository: 'opentofu/opentofu',
    fallbackVersion: 'v1.11.6',
    artifactType: 'zip',
    buildDownloadUrl: (context) => {
        return `https://github.com/opentofu/opentofu/releases/download/v${context.version}/tofu_${context.version}_${context.platform}_${context.architecture}.zip`;
    },
});

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: OPENTOFU_DISPLAY_NAME,
    executableName: OPENTOFU_CLI_NAME,
    installer: downloadOpenTofuCLI,
});
