import path = require('path');
import { createCliInstaller } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const SENTINEL_CLI_NAME = 'sentinel';
const SENTINEL_DISPLAY_NAME = 'Hashicorp Sentinel';
const SENTINEL_ARCHITECTURE_MAP: Record<string, string> = {
    x64: 'amd64',
    x32: '386',
    arm64: 'arm64',
    arm: 'arm',
};

const downloadSentinelCLI = createCliInstaller({
    displayName: SENTINEL_DISPLAY_NAME,
    toolName: SENTINEL_CLI_NAME,
    artifactType: 'zip',
    architectureMap: SENTINEL_ARCHITECTURE_MAP,
    latestVersion: {
        requestUrl: 'https://checkpoint-api.hashicorp.com/v1/check/sentinel',
        fallbackVersion: '0.40.0',
        readVersion: (payload) => payload.current_version,
    },
    buildDownloadUrl: (context) => {
        return `https://releases.hashicorp.com/sentinel/${context.version}/sentinel_${context.version}_${context.platform}_${context.architecture}.zip`;
    },
});

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: SENTINEL_DISPLAY_NAME,
    executableName: SENTINEL_CLI_NAME,
    installer: downloadSentinelCLI,
});
