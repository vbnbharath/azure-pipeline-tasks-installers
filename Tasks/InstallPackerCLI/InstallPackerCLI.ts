import path = require('path');
import { createCliInstaller } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const PACKER_CLI_NAME = 'packer';
const PACKER_DISPLAY_NAME = 'Packer';
const PACKER_ARCHITECTURE_MAP: Record<string, string> = {
    x64: 'amd64',
    x32: '386',
    arm64: 'arm64',
    arm: 'arm',
};

const downloadPackerCLI = createCliInstaller({
    displayName: PACKER_DISPLAY_NAME,
    toolName: PACKER_CLI_NAME,
    artifactType: 'zip',
    architectureMap: PACKER_ARCHITECTURE_MAP,
    latestVersion: {
        requestUrl: 'https://checkpoint-api.hashicorp.com/v1/check/packer',
        fallbackVersion: '1.15.1',
        readVersion: (payload) => payload.current_version,
    },
    buildDownloadUrl: (context) => {
        return `https://releases.hashicorp.com/packer/${context.version}/packer_${context.version}_${context.platform}_${context.architecture}.zip`;
    },
});

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: PACKER_DISPLAY_NAME,
    executableName: PACKER_CLI_NAME,
    installer: downloadPackerCLI,
});
