import tasks = require('azure-pipelines-task-lib');
import tools = require('azure-pipelines-tool-lib');
import fs = require('fs');
import os = require('os');
import path = require('path');

type DownloadArtifactType = 'file' | 'zip' | 'tar.gz';

const DEFAULT_CLI_VARIABLE_NAME = 'cliLocation';
const DEFAULT_GETTING_LATEST_CLI_VERSION_MESSAGE_KEY = 'GettingLatestCLIVersion';
const DEFAULT_CLI_VERSION_NOT_FOUND_MESSAGE_KEY = 'CLIVersionNotFound';
const DEFAULT_CLI_DOWNLOAD_FAILED_MESSAGE_KEY = 'CLIDownloadFailed';
const DEFAULT_CLI_NOT_FOUND_IN_FOLDER_MESSAGE_KEY = 'CLINotFoundInFolder';

export interface LatestVersionOptions {
    inputVersion: string;
    displayName: string;
    requestUrl?: string;
    logMessageKey?: string;
    notFoundMessageKey?: string;
    fallbackVersion: string;
    readVersion?: (payload: any) => string | ResolvedCliVersion | undefined;
    resolveVersion?: () => Promise<string | ResolvedCliVersion | undefined>;
}

export interface ResolvedCliVersion {
    version: string;
    downloadUrl?: string;
}

export interface DownloadContext {
    version: string;
    platform: string;
    architecture: string;
    executableExtension: string;
}

export interface CliDownloadOptions {
    version: string;
    displayName: string;
    toolName: string;
    variableName?: string;
    artifactType: DownloadArtifactType | ((context: DownloadContext) => DownloadArtifactType);
    executableName?: string;
    platformMap?: Record<string, string>;
    architectureMap?: Record<string, string>;
    downloadFailedMessageKey?: string;
    executableNotFoundMessageKey?: string;
    buildDownloadUrl: (context: DownloadContext) => string;
    buildDownloadFileName?: (context: DownloadContext) => string;
}

export interface ManagedCliInstallerOptions extends Omit<CliDownloadOptions, 'version'> {
    latestVersion: Omit<LatestVersionOptions, 'inputVersion' | 'displayName'>;
}

export interface GitHubReleaseCliInstallerOptions extends Omit<ManagedCliInstallerOptions, 'latestVersion'> {
    repository: string;
    fallbackVersion: string;
    readVersion?: (payload: any) => string | undefined;
    logMessageKey?: string;
    notFoundMessageKey?: string;
}

export const DEFAULT_PLATFORM_MAP: Record<string, string> = {
    Darwin: 'darwin',
    Linux: 'linux',
    Windows_NT: 'windows',
};

export const DEFAULT_ARCHITECTURE_MAP: Record<string, string> = {
    x64: 'amd64',
    arm64: 'arm64',
};

export async function resolveCliVersion(options: LatestVersionOptions): Promise<ResolvedCliVersion> {
    let requestedVersion: string | ResolvedCliVersion = options.inputVersion;

    if (options.inputVersion.toLowerCase() === 'latest') {
        console.log(tasks.loc(options.logMessageKey ?? DEFAULT_GETTING_LATEST_CLI_VERSION_MESSAGE_KEY, options.displayName));

        try {
            requestedVersion = await resolveLatestVersion(options);
        } catch (error) {
            console.warn(tasks.loc(
                options.notFoundMessageKey ?? DEFAULT_CLI_VERSION_NOT_FOUND_MESSAGE_KEY,
                getErrorMessage(error),
                options.fallbackVersion,
            ));
            requestedVersion = options.fallbackVersion;
        }
    }

    const resolvedVersion = typeof requestedVersion === 'string'
        ? { version: requestedVersion }
        : requestedVersion;
    const version = tools.cleanVersion(resolvedVersion.version);
    if (!version) {
        throw new Error(tasks.loc('InputVersionNotValidSemanticVersion', options.inputVersion));
    }

    return {
        ...resolvedVersion,
        version,
    };
}

async function resolveLatestVersion(options: LatestVersionOptions): Promise<string | ResolvedCliVersion> {
    if (options.resolveVersion) {
        const latestVersion = await options.resolveVersion();
        if (!latestVersion) {
            throw new Error('No latest version was resolved');
        }

        return latestVersion;
    }

    if (!options.requestUrl || !options.readVersion) {
        throw new Error('Latest version source is not configured');
    }

    const payload = await fetchJson(options.requestUrl);
    const latestVersion = options.readVersion(payload);
    if (!latestVersion) {
        throw new Error(`No version payload returned from ${options.requestUrl}`);
    }

    return latestVersion;
}

export async function downloadCli(options: CliDownloadOptions): Promise<string> {
    const context = createDownloadContext(
        options.version,
        options.platformMap ?? DEFAULT_PLATFORM_MAP,
        options.architectureMap ?? DEFAULT_ARCHITECTURE_MAP,
    );
    const artifactType = resolveArtifactType(options.artifactType, context);
    const executableName = options.executableName ?? options.toolName;

    let cachedToolPath = tools.findLocalTool(options.toolName, options.version);
    if (!cachedToolPath) {
        const downloadUrl = options.buildDownloadUrl(context);
        const fileName = options.buildDownloadFileName?.(context) ?? buildDefaultDownloadFileName(options, context, executableName);
        let downloadPath: string;

        try {
            downloadPath = await tools.downloadTool(downloadUrl, fileName);
        } catch (error) {
            throw new Error(tasks.loc(
                options.downloadFailedMessageKey ?? DEFAULT_CLI_DOWNLOAD_FAILED_MESSAGE_KEY,
                options.displayName,
                downloadUrl,
                getErrorMessage(error),
            ));
        }

        cachedToolPath = artifactType === 'zip'
            ? await cacheZip(downloadPath, options.toolName, options.version)
            : artifactType === 'tar.gz'
                ? await cacheTar(downloadPath, options.toolName, options.version)
                : await tools.cacheFile(
                    downloadPath,
                    `${executableName}${context.executableExtension}`,
                    options.toolName,
                    options.version,
                );
    }

    const executablePath = findCliExecutable(cachedToolPath, executableName, context.executableExtension);
    if (!executablePath) {
        throw new Error(tasks.loc(
            options.executableNotFoundMessageKey ?? DEFAULT_CLI_NOT_FOUND_IN_FOLDER_MESSAGE_KEY,
            options.displayName,
            cachedToolPath,
        ));
    }

    if (!context.executableExtension) {
        fs.chmodSync(executablePath, 0o755);
    }

    tasks.setVariable(options.variableName ?? DEFAULT_CLI_VARIABLE_NAME, executablePath);

    return executablePath;
}

export function createCliInstaller(options: ManagedCliInstallerOptions): (inputVersion: string) => Promise<string> {
    return async (inputVersion: string): Promise<string> => {
        const { latestVersion, ...downloadOptions } = options;
        const resolvedVersion = await resolveCliVersion({
            ...latestVersion,
            inputVersion,
            displayName: downloadOptions.displayName,
        });

        return downloadCli({
            ...downloadOptions,
            version: resolvedVersion.version,
            buildDownloadUrl: (context) => resolvedVersion.downloadUrl ?? downloadOptions.buildDownloadUrl(context),
        });
    };
}

export function createGitHubReleaseCliInstaller(options: GitHubReleaseCliInstallerOptions): (inputVersion: string) => Promise<string> {
    const {
        repository,
        fallbackVersion,
        readVersion = readGitHubReleaseVersion,
        logMessageKey,
        notFoundMessageKey,
        ...downloadOptions
    } = options;

    return createCliInstaller({
        ...downloadOptions,
        latestVersion: {
            requestUrl: `https://api.github.com/repos/${repository}/releases/latest`,
            fallbackVersion,
            readVersion,
            logMessageKey,
            notFoundMessageKey,
        },
    });
}

function buildDefaultDownloadFileName(options: CliDownloadOptions, context: DownloadContext, executableName: string): string {
    const uniqueId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const artifactType = resolveArtifactType(options.artifactType, context);
    const suffix = artifactType === 'zip'
        ? '.zip'
        : artifactType === 'tar.gz'
            ? '.tar.gz'
            : context.executableExtension;
    return `${executableName}-${context.version}-${uniqueId}${suffix}`;
}

async function cacheZip(downloadPath: string, toolName: string, version: string): Promise<string> {
    const extractedPath = await tools.extractZip(downloadPath);
    return tools.cacheDir(extractedPath, toolName, version);
}

async function cacheTar(downloadPath: string, toolName: string, version: string): Promise<string> {
    const extractedPath = await tools.extractTar(downloadPath);
    return tools.cacheDir(extractedPath, toolName, version);
}

export function createDownloadContext(
    version: string,
    platformMap: Record<string, string>,
    architectureMap: Record<string, string>,
): DownloadContext {
    return {
        version,
        platform: resolveMapping(platformMap, os.type(), 'OperatingSystemNotSupported'),
        architecture: resolveMapping(architectureMap, os.arch(), 'ArchitectureNotSupported'),
        executableExtension: os.type().match(/^Win/) ? '.exe' : '',
    };
}

function resolveMapping(mapping: Record<string, string>, key: string, messageKey: string): string {
    const resolvedValue = mapping[key];
    if (!resolvedValue) {
        throw new Error(tasks.loc(messageKey, key));
    }

    return resolvedValue;
}

function findCliExecutable(rootFolder: string, executableName: string, executableExtension: string): string {
    const candidatePath = path.join(rootFolder, `${executableName}${executableExtension}`);
    const allPaths = tasks.find(rootFolder);
    const matchingResultFiles = tasks.match(allPaths, candidatePath, rootFolder);
    return matchingResultFiles[0];
}

function resolveArtifactType(
    artifactType: DownloadArtifactType | ((context: DownloadContext) => DownloadArtifactType),
    context: DownloadContext,
): DownloadArtifactType {
    if (typeof artifactType === 'function') {
        return artifactType(context);
    }

    return artifactType;
}

async function fetchJson(url: string): Promise<any> {
    const response = await globalThis.fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    return response.json();
}

function readGitHubReleaseVersion(payload: any): string | undefined {
    return payload.tag_name;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}
