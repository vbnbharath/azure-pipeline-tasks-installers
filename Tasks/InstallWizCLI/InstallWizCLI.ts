import path = require('path');
import { createCliInstaller, createDownloadContext, DEFAULT_PLATFORM_MAP, DownloadContext, ResolvedCliVersion } from '../Common/CLIInstaller';
import { runInstallerTask } from '../Common/TaskRunner';

const WIZ_CLI_NAME = 'wizcli';
const WIZ_DISPLAY_NAME = 'Wiz.io';
const WIZ_DOWNLOAD_ROOT = 'https://downloads.wiz.io/v1/wizcli';
const WIZ_FALLBACK_VERSION = '1.43.0';

const WIZ_ARCHITECTURE_MAP: Record<string, string> = {
    x64: 'amd64',
    arm64: 'arm64',
};

const downloadWizCLI = createCliInstaller({
    displayName: WIZ_DISPLAY_NAME,
    toolName: WIZ_CLI_NAME,
    artifactType: 'file',
    architectureMap: WIZ_ARCHITECTURE_MAP,
    latestVersion: {
        fallbackVersion: WIZ_FALLBACK_VERSION,
        resolveVersion: resolveLatestWizCacheVersion,
    },
    buildDownloadUrl: (context) => buildWizDownloadUrl(context.version, context),
});

async function resolveLatestWizCacheVersion(): Promise<ResolvedCliVersion> {
    const downloadUrl = buildWizDownloadUrl('latest', createCurrentWizDownloadContext());
    const response = await globalThis.fetch(downloadUrl, { method: 'HEAD' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }

    const lastModified = response.headers.get('last-modified');
    if (!lastModified) {
        throw new Error(`No Last-Modified header returned from ${downloadUrl}`);
    }

    return {
        version: buildLatestCacheVersion(lastModified, response.headers.get('x-amz-meta-sha256')),
        downloadUrl,
    };
}

function createCurrentWizDownloadContext(): DownloadContext {
    return createDownloadContext(WIZ_FALLBACK_VERSION, DEFAULT_PLATFORM_MAP, WIZ_ARCHITECTURE_MAP);
}

function buildWizDownloadUrl(version: string, context: DownloadContext): string {
    const assetArchitecture = context.platform === 'windows' ? 'amd64' : context.architecture;
    return `${WIZ_DOWNLOAD_ROOT}/${version}/wizcli-${context.platform}-${assetArchitecture}${context.executableExtension}`;
}

function buildLatestCacheVersion(lastModified: string, checksum: string | null): string {
    const parsedDate = new Date(lastModified);
    if (Number.isNaN(parsedDate.valueOf())) {
        throw new Error(`Invalid Last-Modified header: ${lastModified}`);
    }

    const hours = parsedDate.getUTCHours().toString().padStart(2, '0');
    const minutes = parsedDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = parsedDate.getUTCSeconds().toString().padStart(2, '0');
    const cacheVersion = `${parsedDate.getUTCFullYear()}.${parsedDate.getUTCMonth() + 1}.${parsedDate.getUTCDate()}-t${hours}${minutes}${seconds}`;
    return checksum ? `${cacheVersion}.sha${checksum.slice(0, 8).toLowerCase()}` : cacheVersion;
}

runInstallerTask({
    taskJsonPath: path.join(__dirname, '..', 'task.json'),
    displayName: WIZ_DISPLAY_NAME,
    executableName: WIZ_CLI_NAME,
    installer: downloadWizCLI,
});
