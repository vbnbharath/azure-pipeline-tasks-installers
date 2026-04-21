import path = require('path');
import { createGitHubReleaseCliInstaller } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const DATABRICKS_CLI_NAME = 'databricks';
const DATABRICKS_DISPLAY_NAME = 'Databricks';

const downloadDatabricksCLI = createGitHubReleaseCliInstaller({
    displayName: DATABRICKS_DISPLAY_NAME,
    toolName: DATABRICKS_CLI_NAME,
    repository: 'databricks/cli',
    fallbackVersion: 'v0.297.2',
    artifactType: 'zip',
    buildDownloadUrl: (context) => {
        return `https://github.com/databricks/cli/releases/download/v${context.version}/databricks_cli_${context.version}_${context.platform}_${context.architecture}.zip`;
    },
});

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: DATABRICKS_DISPLAY_NAME,
    executableName: DATABRICKS_CLI_NAME,
    installer: downloadDatabricksCLI,
});
