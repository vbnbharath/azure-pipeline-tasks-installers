import path = require('path');
import { createGitHubReleaseCliInstaller } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const CHECKMARX_ONE_TOOL_NAME = 'checkmarxone';
const CHECKMARX_ONE_EXECUTABLE_NAME = 'cx';
const CHECKMARX_ONE_DISPLAY_NAME = 'Checkmarx One';
const CHECKMARX_ONE_ARCHITECTURE_MAP: Record<string, string> = {
    x64: 'x64',
    arm64: 'arm64',
    arm: 'armv6',
};

const downloadCheckmarxOneCLI = createGitHubReleaseCliInstaller({
    displayName: CHECKMARX_ONE_DISPLAY_NAME,
    toolName: CHECKMARX_ONE_TOOL_NAME,
    executableName: CHECKMARX_ONE_EXECUTABLE_NAME,
    repository: 'Checkmarx/ast-cli',
    fallbackVersion: '2.3.48',
    artifactType: (context) => context.platform === 'windows' ? 'zip' : 'tar.gz',
    architectureMap: CHECKMARX_ONE_ARCHITECTURE_MAP,
    buildDownloadUrl: (context) => {
        const assetArchitecture = context.platform === 'linux' ? context.architecture : 'x64';
        const extension = context.platform === 'windows' ? 'zip' : 'tar.gz';
        return `https://github.com/Checkmarx/ast-cli/releases/download/${context.version}/ast-cli_${context.version}_${context.platform}_${assetArchitecture}.${extension}`;
    },
});

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: CHECKMARX_ONE_DISPLAY_NAME,
    executableName: CHECKMARX_ONE_EXECUTABLE_NAME,
    installer: downloadCheckmarxOneCLI,
});
