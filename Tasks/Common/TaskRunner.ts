import tasks = require('azure-pipelines-task-lib');
import tools = require('azure-pipelines-tool-lib');
import path = require('path');
import { ToolRunner } from 'azure-pipelines-task-lib/toolrunner';

export interface CliTaskRunnerOptions {
    taskJsonPath: string;
    displayName: string;
    executableName: string;
    installer: (inputVersion: string) => Promise<string>;
    inputName?: string;
    verifyMessageKey?: string;
    verifyArgs?: string[];
    verifyLine?: string;
}

export async function runInstallerTask(options: CliTaskRunnerOptions): Promise<void> {
    tasks.setResourcePath(path.normalize(path.join(__dirname, 'resources.json')));
    tasks.setResourcePath(path.normalize(options.taskJsonPath));

    try {
        const inputVersion = tasks.getInput(options.inputName ?? 'version', true) as string;
        const executablePath = await options.installer(inputVersion);
        prependExecutableDirectory(executablePath);
        await verifyInstallation(options);
        tasks.setResult(tasks.TaskResult.Succeeded, '');
    } catch (error) {
        tasks.setResult(tasks.TaskResult.Failed, getErrorMessage(error));
    }
}

function prependExecutableDirectory(executablePath: string): void {
    const executableDirectory = path.dirname(executablePath);
    const envPath = process.env.PATH ?? process.env.Path ?? '';

    if (!envPath.startsWith(executableDirectory)) {
        tools.prependPath(executableDirectory);
    }
}

async function verifyInstallation(options: CliTaskRunnerOptions): Promise<number> {
    console.log(tasks.loc(options.verifyMessageKey ?? 'VerifyCLIInstallation', options.displayName));

    const executablePath = tasks.which(options.executableName, true);
    const cliTool: ToolRunner = tasks.tool(executablePath);

    if (options.verifyLine) {
        cliTool.line(options.verifyLine);
    } else {
        for (const argument of options.verifyArgs ?? ['version']) {
            cliTool.arg(argument);
        }
    }

    return cliTool.execAsync();
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}
