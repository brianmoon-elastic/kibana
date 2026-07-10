/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export type FileSystemPlatform = 'windows' | 'linux' | 'macos';

export type FileSystemEntryKind = 'folder' | 'file' | 'drive' | 'external_drive';

export interface FileSystemEntry {
  readonly id: string;
  readonly name: string;
  readonly kind: FileSystemEntryKind;
  readonly fileExtension?: string;
  readonly size?: string;
  readonly sizeBytes?: number;
  readonly created?: string;
  readonly lastUpdated?: string;
  readonly children?: readonly FileSystemEntry[];
}

export interface FileSearchResult extends FileSystemEntry {
  readonly pathSegments: readonly string[];
  readonly pathLabel: string;
}

export interface MockEndpointFileSystem {
  readonly endpointId: string;
  readonly hostname: string;
  readonly platform: FileSystemPlatform;
  readonly rootLabel: string;
  readonly entries: readonly FileSystemEntry[];
}

export type FileTransferDirection = 'upload' | 'download';

export type FileTransferStatus = 'pending' | 'in_progress' | 'success' | 'failed';

export interface FileTransferItem {
  readonly id: string;
  readonly fileName: string;
  readonly direction: FileTransferDirection;
  readonly status: FileTransferStatus;
  readonly progress: number;
  readonly endpointHostname: string;
  readonly isFolder?: boolean;
  readonly errorMessage?: string;
}

export interface FileSystemBrowserQueryParams {
  readonly selected_endpoint?: string;
  readonly path?: string;
  readonly search?: string;
}

/** Prototype-only view states for the state showcase dropdown */
export type FileSystemBrowserViewState =
  | 'default'
  | 'loading'
  | 'empty_folder'
  | 'load_error'
  | 'no_permission'
  | 'endpoint_offline'
  | 'request_timed_out'
  | 'path_invalid'
  | 'folder_changed'
  | 'searching'
  | 'search_no_results';
