/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  FileSearchResult,
  FileSystemEntry,
  FileSystemPlatform,
  MockEndpointFileSystem,
} from './types';

const WINDOWS_MISC_FILES: readonly FileSystemEntry[] = [
  { id: 'chrome', name: 'Chrome', kind: 'folder' },
  { id: 'diagnostics', name: 'Diagnostics', kind: 'folder' },
  { id: 'edge', name: 'Edge', kind: 'folder' },
  { id: 'ifcompatcache', name: 'IFCompatCache', kind: 'folder' },
  { id: 'lowrisk', name: 'LowRisk', kind: 'folder' },
  {
    id: 'autorun-inf',
    name: 'autorun.inf',
    kind: 'file',
    fileExtension: '.inf',
    size: '1KB',
    sizeBytes: 1024,
    created: 'Apr 12, 2026 @ 14:22:10.000',
    lastUpdated: 'Apr 12, 2026 @ 14:22:10.000',
  },
  {
    id: 'cred-dump',
    name: 'cred_dump.dmp',
    kind: 'file',
    fileExtension: '.dmp',
    size: '12.4MB',
    sizeBytes: 13002342,
    created: 'May 3, 2026 @ 09:15:44.000',
    lastUpdated: 'May 3, 2026 @ 09:15:44.000',
  },
  {
    id: 'desktop-ini',
    name: 'desktop.ini',
    kind: 'file',
    fileExtension: '.ini',
    size: '1KB',
    sizeBytes: 512,
    created: 'Jan 8, 2026 @ 11:00:00.000',
    lastUpdated: 'Jan 8, 2026 @ 11:00:00.000',
  },
  {
    id: 'hosts',
    name: 'hosts',
    kind: 'file',
    size: '1KB',
    sizeBytes: 768,
    created: 'Feb 1, 2026 @ 08:30:12.000',
    lastUpdated: 'May 18, 2026 @ 16:42:33.000',
  },
  {
    id: 'invoice-exe',
    name: 'invoice_march.pdf.exe',
    kind: 'file',
    fileExtension: '.exe',
    size: '96.3KB',
    sizeBytes: 98611,
    created: 'May 19, 2026 @ 07:55:01.000',
    lastUpdated: 'May 19, 2026 @ 07:55:01.000',
  },
  {
    id: 'keylogger-tmp',
    name: 'keylogger.tmp',
    kind: 'file',
    fileExtension: '.tmp',
    size: '340.1KB',
    sizeBytes: 348262,
    created: 'May 20, 2026 @ 22:10:18.000',
    lastUpdated: 'May 20, 2026 @ 22:10:18.000',
  },
  {
    id: 'malware-ps1',
    name: 'malware.ps1',
    kind: 'file',
    fileExtension: '.ps1',
    size: '8.2KB',
    sizeBytes: 8396,
    created: 'May 17, 2026 @ 13:44:55.000',
    lastUpdated: 'May 17, 2026 @ 13:44:55.000',
  },
  {
    id: 'ntuser-bak',
    name: 'ntuser.dat.bak',
    kind: 'file',
    fileExtension: '.bak',
    size: '3.2MB',
    sizeBytes: 3355443,
    created: 'Mar 2, 2026 @ 10:12:00.000',
    lastUpdated: 'Mar 2, 2026 @ 10:12:00.000',
  },
  {
    id: 'payload-dll',
    name: 'payload.dll',
    kind: 'file',
    fileExtension: '.dll',
    size: '512.4KB',
    sizeBytes: 524697,
    created: 'May 15, 2026 @ 18:30:22.000',
    lastUpdated: 'May 15, 2026 @ 18:30:22.000',
  },
  {
    id: 'powershell-history',
    name: 'powershell_history.txt',
    kind: 'file',
    fileExtension: '.txt',
    size: '22.1KB',
    sizeBytes: 22630,
    created: 'May 21, 2026 @ 06:00:00.000',
    lastUpdated: 'May 21, 2026 @ 08:08:34.000',
  },
  {
    id: 'run-once-bat',
    name: 'run_once.bat',
    kind: 'file',
    fileExtension: '.bat',
    size: '2KB',
    sizeBytes: 2048,
    created: 'Apr 28, 2026 @ 15:20:00.000',
    lastUpdated: 'Apr 28, 2026 @ 15:20:00.000',
  },
  {
    id: 'schtasks-xml',
    name: 'schtasks.xml',
    kind: 'file',
    fileExtension: '.xml',
    size: '4KB',
    sizeBytes: 4096,
    created: 'May 10, 2026 @ 12:05:00.000',
    lastUpdated: 'May 10, 2026 @ 12:05:00.000',
  },
  {
    id: 'setup-msi',
    name: 'setup.msi',
    kind: 'file',
    fileExtension: '.msi',
    size: '4.6MB',
    sizeBytes: 4823449,
    created: 'May 8, 2026 @ 09:00:00.000',
    lastUpdated: 'May 8, 2026 @ 09:00:00.000',
  },
  {
    id: 'svchost-fake',
    name: 'svchost_fake.exe',
    kind: 'file',
    fileExtension: '.exe',
    size: '1.2MB',
    sizeBytes: 1258291,
    created: 'May 16, 2026 @ 20:45:00.000',
    lastUpdated: 'May 16, 2026 @ 20:45:00.000',
  },
  {
    id: 'thumbcache-db',
    name: 'thumbcache.db',
    kind: 'file',
    fileExtension: '.db',
    size: '2.1MB',
    sizeBytes: 2202009,
    created: 'Feb 14, 2026 @ 07:30:00.000',
    lastUpdated: 'May 20, 2026 @ 23:59:59.000',
  },
];

const WINDOWS_FILE_SYSTEM: readonly FileSystemEntry[] = [
  {
    id: 'drive-c',
    name: 'Local disk (C:)',
    kind: 'drive',
    size: '512GB',
    children: [
      {
        id: 'c-users',
        name: 'Users',
        kind: 'folder',
        children: [
          {
            id: 'c-users-admin',
            name: 'Administrator',
            kind: 'folder',
            children: [
              {
                id: 'c-users-admin-misc',
                name: 'Misc',
                kind: 'folder',
                children: [
                  {
                    id: 'c-users-admin-misc-files',
                    name: 'Files',
                    kind: 'folder',
                    children: WINDOWS_MISC_FILES,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'c-windows',
        name: 'Windows',
        kind: 'folder',
        children: [
          {
            id: 'c-windows-system32',
            name: 'System32',
            kind: 'folder',
            children: [
              {
                id: 'c-windows-system32-drivers',
                name: 'drivers',
                kind: 'folder',
                children: [
                  {
                    id: 'c-windows-system32-drivers-etc',
                    name: 'etc',
                    kind: 'folder',
                    children: [
                      {
                        id: 'c-windows-hosts',
                        name: 'hosts',
                        kind: 'file',
                        size: '1KB',
                        sizeBytes: 768,
                        created: 'Feb 1, 2026 @ 08:30:12.000',
                        lastUpdated: 'May 18, 2026 @ 16:42:33.000',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'drive-d',
    name: 'Data (D:)',
    kind: 'drive',
    size: '2TB',
    children: [
      {
        id: 'd-backups',
        name: 'Backups',
        kind: 'folder',
        children: [
          {
            id: 'd-backups-daily',
            name: 'daily',
            kind: 'folder',
            children: [
              {
                id: 'd-backups-daily-snapshot',
                name: 'snapshot_20260521.tar.gz',
                kind: 'file',
                fileExtension: '.gz',
                size: '1.8GB',
                sizeBytes: 1932735283,
                created: 'May 21, 2026 @ 02:00:00.000',
                lastUpdated: 'May 21, 2026 @ 02:15:00.000',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'drive-e',
    name: 'USB Drive (E:)',
    kind: 'external_drive',
    size: '64GB',
    children: [
      {
        id: 'e-evidence',
        name: 'evidence',
        kind: 'folder',
        children: [
          {
            id: 'e-evidence-memory',
            name: 'memory.raw',
            kind: 'file',
            fileExtension: '.raw',
            size: '8GB',
            sizeBytes: 8589934592,
            created: 'May 20, 2026 @ 14:00:00.000',
            lastUpdated: 'May 20, 2026 @ 14:45:00.000',
          },
        ],
      },
    ],
  },
];

const LINUX_FILE_SYSTEM: readonly FileSystemEntry[] = [
  {
    id: 'linux-root',
    name: '/',
    kind: 'drive',
    children: [
      {
        id: 'linux-bin',
        name: 'bin',
        kind: 'folder',
        children: [],
      },
      {
        id: 'linux-var',
        name: 'var',
        kind: 'folder',
        children: [
          {
            id: 'linux-var-log',
            name: 'log',
            kind: 'folder',
            children: [
              {
                id: 'linux-auth-log',
                name: 'auth.log',
                kind: 'file',
                fileExtension: '.log',
                size: '4.2MB',
                sizeBytes: 4404019,
                created: 'May 1, 2026 @ 00:00:00.000',
                lastUpdated: 'May 21, 2026 @ 08:08:34.000',
              },
              {
                id: 'linux-syslog',
                name: 'syslog',
                kind: 'file',
                fileExtension: '.log',
                size: '12.8MB',
                sizeBytes: 13421772,
                created: 'May 1, 2026 @ 00:00:00.000',
                lastUpdated: 'May 21, 2026 @ 08:08:34.000',
              },
            ],
          },
        ],
      },
      {
        id: 'linux-tmp',
        name: 'tmp',
        kind: 'folder',
        children: [
          {
            id: 'linux-tmp-suspicious-sh',
            name: 'suspicious.sh',
            kind: 'file',
            fileExtension: '.sh',
            size: '3.1KB',
            sizeBytes: 3174,
            created: 'May 19, 2026 @ 03:22:11.000',
            lastUpdated: 'May 19, 2026 @ 03:22:11.000',
          },
          {
            id: 'linux-tmp-suspicious-binary',
            name: 'suspicious_binary',
            kind: 'file',
            fileExtension: 'ELF (inferred)',
            size: '6.2MB',
            sizeBytes: 6501171,
            created: 'Apr 2, 2026 @ 13:14:02.000',
            lastUpdated: 'May 21, 2026 @ 07:52:19.000',
          },
        ],
      },
      {
        id: 'linux-media',
        name: 'media',
        kind: 'folder',
        children: [
          {
            id: 'linux-media-analyst',
            name: 'analyst',
            kind: 'folder',
            children: [
              {
                id: 'linux-media-analyst-documents',
                name: 'Documents',
                kind: 'folder',
                children: [
                  {
                    id: 'linux-media-analyst-documents-misc',
                    name: 'misc',
                    kind: 'folder',
                    children: [
                      {
                        id: 'linux-media-analyst-documents-misc-temp',
                        name: 'temp',
                        kind: 'folder',
                        children: [
                          {
                            id: 'linux-temp-staging',
                            name: 'staging_payload.bin',
                            kind: 'file',
                            fileExtension: '.bin',
                            size: '2.4MB',
                            sizeBytes: 2516582,
                            created: 'May 10, 2026 @ 09:00:00.000',
                            lastUpdated: 'May 20, 2026 @ 14:30:00.000',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'linux-home',
        name: 'home',
        kind: 'folder',
        children: [
          {
            id: 'linux-home-analyst',
            name: 'analyst',
            kind: 'folder',
            children: [
              {
                id: 'linux-home-analyst-notes',
                name: 'investigation_notes.txt',
                kind: 'file',
                fileExtension: '.txt',
                size: '18KB',
                sizeBytes: 18432,
                created: 'May 18, 2026 @ 10:00:00.000',
                lastUpdated: 'May 20, 2026 @ 17:30:00.000',
              },
            ],
          },
        ],
      },
    ],
  },
];

const MACOS_FILE_SYSTEM: readonly FileSystemEntry[] = [
  {
    id: 'mac-hd',
    name: 'Macintosh HD',
    kind: 'drive',
    size: '1TB',
    children: [
      {
        id: 'mac-applications',
        name: 'Applications',
        kind: 'folder',
        children: [
          {
            id: 'mac-utilities',
            name: 'Utilities',
            kind: 'folder',
            children: [
              {
                id: 'mac-console-log',
                name: 'Console.app',
                kind: 'file',
                fileExtension: '.app',
                size: '12MB',
                sizeBytes: 12582912,
                created: 'Jan 1, 2026 @ 00:00:00.000',
                lastUpdated: 'Jan 1, 2026 @ 00:00:00.000',
              },
            ],
          },
        ],
      },
      {
        id: 'mac-users',
        name: 'Users',
        kind: 'folder',
        children: [
          {
            id: 'mac-user-sec',
            name: 'sec-analyst',
            kind: 'folder',
            children: [
              {
                id: 'mac-downloads',
                name: 'Downloads',
                kind: 'folder',
                children: [
                  {
                    id: 'mac-dmg',
                    name: 'update.dmg',
                    kind: 'file',
                    fileExtension: '.dmg',
                    size: '256MB',
                    sizeBytes: 268435456,
                    created: 'May 17, 2026 @ 11:11:11.000',
                    lastUpdated: 'May 17, 2026 @ 11:11:11.000',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'mac-var',
        name: 'var',
        kind: 'folder',
        children: [
          {
            id: 'mac-var-log',
            name: 'log',
            kind: 'folder',
            children: [
              {
                id: 'mac-system-log',
                name: 'system.log',
                kind: 'file',
                fileExtension: '.log',
                size: '6.4MB',
                sizeBytes: 6710886,
                created: 'May 1, 2026 @ 00:00:00.000',
                lastUpdated: 'May 21, 2026 @ 08:08:34.000',
              },
            ],
          },
        ],
      },
    ],
  },
];

const PLATFORM_FILE_SYSTEMS: Record<FileSystemPlatform, readonly FileSystemEntry[]> = {
  windows: WINDOWS_FILE_SYSTEM,
  linux: LINUX_FILE_SYSTEM,
  macos: MACOS_FILE_SYSTEM,
};

const PLATFORM_ROOT_LABELS: Record<FileSystemPlatform, string> = {
  windows: 'This PC',
  linux: '/',
  macos: 'Macintosh HD',
};

export const MOCK_ENDPOINT_FILE_SYSTEMS: readonly MockEndpointFileSystem[] = [
  {
    endpointId: 'mock-endpoint-windows',
    hostname: 'siem-windows-edge-sec-bis',
    platform: 'windows',
    rootLabel: PLATFORM_ROOT_LABELS.windows,
    entries: PLATFORM_FILE_SYSTEMS.windows,
  },
  {
    endpointId: 'mock-endpoint-linux',
    hostname: 'siem-linux-edge-sec-bis',
    platform: 'linux',
    rootLabel: PLATFORM_ROOT_LABELS.linux,
    entries: PLATFORM_FILE_SYSTEMS.linux,
  },
  {
    endpointId: 'mock-endpoint-macos',
    hostname: 'siem-macos-edge-sec',
    platform: 'macos',
    rootLabel: PLATFORM_ROOT_LABELS.macos,
    entries: PLATFORM_FILE_SYSTEMS.macos,
  },
];

export const inferPlatformFromHostname = (hostname: string): FileSystemPlatform => {
  const normalized = hostname.toLowerCase();

  if (normalized.includes('linux')) {
    return 'linux';
  }

  if (normalized.includes('macos') || normalized.includes('mac')) {
    return 'macos';
  }

  return 'windows';
};

export const getMockFileSystemForEndpoint = (
  endpointId: string,
  hostname: string
): MockEndpointFileSystem => {
  const existing = MOCK_ENDPOINT_FILE_SYSTEMS.find(
    (entry) => entry.endpointId === endpointId || entry.hostname === hostname
  );

  if (existing) {
    return existing;
  }

  const platform = inferPlatformFromHostname(hostname);

  return {
    endpointId,
    hostname,
    platform,
    rootLabel: PLATFORM_ROOT_LABELS[platform],
    entries: PLATFORM_FILE_SYSTEMS[platform],
  };
};

export const resolvePathSegments = (path?: string): readonly string[] => {
  if (!path) {
    return [];
  }

  return path.split('/').filter(Boolean);
};

export const getEntriesAtPath = (
  rootEntries: readonly FileSystemEntry[],
  pathSegments: readonly string[]
): readonly FileSystemEntry[] => {
  let currentEntries = rootEntries;

  for (const segment of pathSegments) {
    const match = currentEntries.find((entry) => entry.id === segment);

    if (!match?.children) {
      return [];
    }

    currentEntries = match.children;
  }

  return currentEntries;
};

export const getBreadcrumbLabels = (
  rootLabel: string,
  rootEntries: readonly FileSystemEntry[],
  pathSegments: readonly string[]
): readonly string[] => {
  const labels: string[] = [rootLabel];
  let currentEntries = rootEntries;

  for (const segment of pathSegments) {
    const match = currentEntries.find((entry) => entry.id === segment);

    if (!match) {
      break;
    }

    labels.push(match.name);
    currentEntries = match.children ?? [];
  }

  return labels;
};

export const filterEntriesBySearch = (
  entries: readonly FileSystemEntry[],
  searchTerm: string
): readonly FileSystemEntry[] => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return entries;
  }

  return entries.filter((entry) => entry.name.toLowerCase().includes(normalizedSearch));
};

export const getEntryTypeLabel = (entry: FileSystemEntry): string => {
  switch (entry.kind) {
    case 'folder':
      return 'Folder';
    case 'drive':
      return 'Drive';
    case 'external_drive':
      return 'External drive';
    case 'file':
      return entry.fileExtension ?? 'File';
  }
};

export const getEntryIconType = (entry: FileSystemEntry): string => {
  switch (entry.kind) {
    case 'folder':
      return 'folderClosed';
    case 'drive':
      return 'storage';
    case 'external_drive':
      return 'exportAction';
    case 'file':
      return 'document';
  }
};

export const searchEntriesGlobally = (
  entries: readonly FileSystemEntry[],
  searchTerm: string,
  rootLabel: string,
  parentPathSegments: readonly string[] = [],
  parentPathLabels: readonly string[] = []
): readonly FileSearchResult[] => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return [];
  }

  const results: FileSearchResult[] = [];

  for (const entry of entries) {
    const pathSegments = [...parentPathSegments, entry.id];
    const pathLabels = [...parentPathLabels, entry.name];
    const pathLabel = [rootLabel, ...pathLabels.slice(1)].join(' / ');

    if (entry.name.toLowerCase().includes(normalizedSearch)) {
      results.push({
        ...entry,
        pathSegments,
        pathLabel,
      });
    }

    if (entry.children) {
      results.push(
        ...searchEntriesGlobally(
          entry.children,
          searchTerm,
          rootLabel,
          pathSegments,
          pathLabels
        )
      );
    }
  }

  return results;
};

export const isNavigableEntry = (entry: FileSystemEntry): boolean =>
  entry.kind === 'folder' || entry.kind === 'drive' || entry.kind === 'external_drive';

export const isDownloadableEntry = (entry: FileSystemEntry): boolean =>
  entry.kind === 'file' || entry.kind === 'folder';
