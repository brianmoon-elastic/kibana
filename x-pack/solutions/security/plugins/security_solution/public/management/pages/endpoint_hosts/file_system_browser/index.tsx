/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  EuiBreadcrumbs,
  EuiButton,
  EuiCallOut,
  EuiEmptyPrompt,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import type { EuiBreadcrumb } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { AdministrationListPage } from '../../../components/administration_list_page';
import { useGetEndpointDetails } from '../../../hooks';
import { getFileSystemBrowserPath } from '../../../common/routing';
import {
  getBreadcrumbLabels,
  getEntriesAtPath,
  getMockFileSystemForEndpoint,
  isDownloadableEntry,
  resolvePathSegments,
  searchEntriesGlobally,
} from './mock_data';
import type { FileSystemBrowserViewState } from './types';
import {
  getMockPrototypeEndpointList,
  isMockPrototypeEndpointId,
} from '../mock_prototype_endpoints';
import { BackToEndpointsButton } from './components/back_to_endpoints_button';
import { FileMetadataPanel, type FileBrowserTableItem } from './components/file_metadata_panel';
import { FileSystemBrowserTable } from './components/file_system_browser_table';
import { FileSystemViewState } from './components/file_system_view_state';
import { PrototypeStateShowcase } from './components/prototype_state_showcase';
import { useFileTransfer } from './components/file_transfer_provider';

const parseQueryParams = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    selectedEndpoint: params.get('selected_endpoint') ?? undefined,
    path: params.get('path') ?? undefined,
    search: params.get('search') ?? undefined,
  };
};

const SEARCH_DEBOUNCE_MS = 700;
const INITIAL_LOAD_MS = 900;

export const FileSystemBrowserPage = memo(() => {
  const history = useHistory();
  const location = useLocation();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { startTransfer } = useFileTransfer();

  const [showcaseViewState, setShowcaseViewState] =
    useState<FileSystemBrowserViewState>('default');
  const [selectedItems, setSelectedItems] = useState<readonly FileBrowserTableItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState<string | undefined>();

  const { selectedEndpoint, path, search: searchQuery } = useMemo(
    () => parseQueryParams(location.search),
    [location.search]
  );

  const isMockEndpoint = selectedEndpoint ? isMockPrototypeEndpointId(selectedEndpoint) : false;
  const prototypeEndpoints = useMemo(() => getMockPrototypeEndpointList(), []);

  const {
    data: hostInfo,
    isFetching: isHostInfoLoading,
    error: hostInfoError,
  } = useGetEndpointDetails(selectedEndpoint ?? '', {
    enabled: Boolean(selectedEndpoint) && !isMockEndpoint,
  });

  const mockFileSystem = useMemo(() => {
    if (!selectedEndpoint) {
      return undefined;
    }

    const prototypeMatch = prototypeEndpoints.find(
      (endpoint) => endpoint.metadata.agent.id === selectedEndpoint
    );
    const hostname =
      prototypeMatch?.metadata.host.hostname ??
      hostInfo?.metadata?.host?.hostname ??
      selectedEndpoint;

    return getMockFileSystemForEndpoint(selectedEndpoint, hostname);
  }, [hostInfo?.metadata?.host?.hostname, prototypeEndpoints, selectedEndpoint]);

  const pathSegments = useMemo(() => resolvePathSegments(path), [path]);
  const currentEntries = useMemo(() => {
    if (!mockFileSystem) {
      return [];
    }

    return getEntriesAtPath(mockFileSystem.entries, pathSegments);
  }, [mockFileSystem, pathSegments]);

  const isSearchMode = Boolean(debouncedSearch?.trim());
  const globalSearchResults = useMemo(() => {
    if (!mockFileSystem || !debouncedSearch?.trim()) {
      return [];
    }

    return searchEntriesGlobally(
      mockFileSystem.entries,
      debouncedSearch,
      mockFileSystem.rootLabel
    );
  }, [debouncedSearch, mockFileSystem]);

  const tableItems = useMemo((): readonly FileBrowserTableItem[] => {
    if (isSearchMode) {
      return globalSearchResults;
    }

    return currentEntries;
  }, [currentEntries, globalSearchResults, isSearchMode]);

  const breadcrumbLabels = useMemo(() => {
    if (!mockFileSystem) {
      return [];
    }

    return getBreadcrumbLabels(mockFileSystem.rootLabel, mockFileSystem.entries, pathSegments);
  }, [mockFileSystem, pathSegments]);

  const isPathInvalid = useMemo(() => {
    if (!mockFileSystem || pathSegments.length === 0 || isSearchMode) {
      return false;
    }

    let currentEntriesForPath = mockFileSystem.entries;

    for (const segment of pathSegments) {
      const match = currentEntriesForPath.find((entry) => entry.id === segment);
      if (!match) {
        return true;
      }
      currentEntriesForPath = match.children ?? [];
    }

    return false;
  }, [isSearchMode, mockFileSystem, pathSegments]);

  useEffect(() => {
    setIsInitialLoading(true);
    const timer = window.setTimeout(() => setIsInitialLoading(false), INITIAL_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [selectedEndpoint, path]);

  useEffect(() => {
    if (!searchQuery?.trim()) {
      setDebouncedSearch(undefined);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedItems([]);
  }, [path, debouncedSearch, selectedEndpoint]);

  const updateQueryParams = useCallback(
    (updates: { path?: string; search?: string; clearPath?: boolean; clearSearch?: boolean }) => {
      if (!selectedEndpoint) {
        return;
      }

      const nextPath = updates.clearPath
        ? undefined
        : 'path' in updates
        ? updates.path
        : path;
      const nextSearch = updates.clearSearch
        ? undefined
        : 'search' in updates
        ? updates.search
        : searchQuery;

      history.push(
        getFileSystemBrowserPath({
          selected_endpoint: selectedEndpoint,
          ...(nextPath ? { path: nextPath } : {}),
          ...(nextSearch ? { search: nextSearch } : {}),
        })
      );
    },
    [history, path, searchQuery, selectedEndpoint]
  );

  const handleNavigateToPath = useCallback(
    (nextPathSegments: readonly string[]) => {
      updateQueryParams({
        path: nextPathSegments.length > 0 ? nextPathSegments.join('/') : undefined,
        clearPath: nextPathSegments.length === 0,
        clearSearch: true,
      });
    },
    [updateQueryParams]
  );

  const handleNavigateToEntry = useCallback(
    (entry: FileBrowserTableItem) => {
      const nextPath =
        'pathSegments' in entry
          ? entry.pathSegments
          : [...pathSegments, entry.id];

      handleNavigateToPath(nextPath);
    },
    [handleNavigateToPath, pathSegments]
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateQueryParams({
        search: event.target.value || undefined,
        clearSearch: !event.target.value,
      });
    },
    [updateQueryParams]
  );

  const handleUploadClick = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  const handleUploadFileSelected = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file || !mockFileSystem) {
        return;
      }

      startTransfer({
        fileName: file.name,
        direction: 'upload',
        endpointHostname: mockFileSystem.hostname,
        sizeBytes: file.size,
        isFolder: false,
      });

      event.target.value = '';
    },
    [mockFileSystem, startTransfer]
  );

  const handleBulkDownload = useCallback(() => {
    if (!mockFileSystem) {
      return;
    }

    selectedItems
      .filter(isDownloadableEntry)
      .forEach((item) => {
        startTransfer({
          fileName: item.name,
          direction: 'download',
          endpointHostname: mockFileSystem.hostname,
          sizeBytes: item.sizeBytes,
          isFolder: item.kind === 'folder',
        });
      });
  }, [mockFileSystem, selectedItems, startTransfer]);

  const handleSelectionChange = useCallback((items: readonly FileBrowserTableItem[]) => {
    setSelectedItems(items);
  }, []);

  const handleCloseMetadataPanel = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const handleRefresh = useCallback(() => {
    setShowcaseViewState('default');
    setIsInitialLoading(true);
    window.setTimeout(() => setIsInitialLoading(false), INITIAL_LOAD_MS);
  }, []);

  const breadcrumbs = useMemo(() => {
    if (!mockFileSystem || isSearchMode) {
      return [];
    }

    const items: EuiBreadcrumb[] = breadcrumbLabels.map((label, index) => {
      const isLast = index === breadcrumbLabels.length - 1;
      const targetPathSegments = pathSegments.slice(0, index);

      return {
        text: label,
        ...(isLast
          ? {}
          : {
              onClick: (event: React.MouseEvent) => {
                event.preventDefault();
                handleNavigateToPath(targetPathSegments);
              },
            }),
      };
    });

    return items;
  }, [breadcrumbLabels, handleNavigateToPath, isSearchMode, mockFileSystem, pathSegments]);

  const resolvedViewState = useMemo((): FileSystemBrowserViewState | 'loaded' => {
    if (showcaseViewState !== 'default') {
      return showcaseViewState;
    }

    if (isInitialLoading) {
      return 'loading';
    }

    if (isSearching) {
      return 'searching';
    }

    if (isSearchMode && globalSearchResults.length === 0) {
      return 'search_no_results';
    }

    if (isPathInvalid) {
      return 'path_invalid';
    }

    if (!isSearchMode && tableItems.length === 0) {
      return 'empty_folder';
    }

    return 'loaded';
  }, [
    globalSearchResults.length,
    isInitialLoading,
    isPathInvalid,
    isSearchMode,
    isSearching,
    showcaseViewState,
    tableItems.length,
  ]);

  const showDownloadButton = selectedItems.length >= 2;
  const showMetadataPanel = selectedItems.length > 0;

  if (!selectedEndpoint) {
    return (
      <AdministrationListPage
        data-test-subj="fileSystemBrowserPage"
        title={
          <FormattedMessage
            id="xpack.securitySolution.endpoint.fileSystemBrowser.pageTitle"
            defaultMessage="File system browser"
          />
        }
        headerBackComponent={<BackToEndpointsButton />}
      >
        <EuiEmptyPrompt
          iconType="alert"
          title={
            <h2>
              <FormattedMessage
                id="xpack.securitySolution.endpoint.fileSystemBrowser.noEndpointTitle"
                defaultMessage="No endpoint selected"
              />
            </h2>
          }
          body={
            <FormattedMessage
              id="xpack.securitySolution.endpoint.fileSystemBrowser.noEndpointBody"
              defaultMessage="Select an endpoint from the Endpoints list and choose Browse files."
            />
          }
        />
      </AdministrationListPage>
    );
  }

  if (!isMockEndpoint && isHostInfoLoading && !mockFileSystem) {
    return (
      <AdministrationListPage
        data-test-subj="fileSystemBrowserPage"
        title={
          <FormattedMessage
            id="xpack.securitySolution.endpoint.fileSystemBrowser.pageTitle"
            defaultMessage="File system browser"
          />
        }
        headerBackComponent={<BackToEndpointsButton />}
      >
        <FileSystemViewState state="loading" />
      </AdministrationListPage>
    );
  }

  if (!isMockEndpoint && hostInfoError && !mockFileSystem) {
    return (
      <AdministrationListPage
        data-test-subj="fileSystemBrowserPage"
        title={
          <FormattedMessage
            id="xpack.securitySolution.endpoint.fileSystemBrowser.pageTitle"
            defaultMessage="File system browser"
          />
        }
        headerBackComponent={<BackToEndpointsButton />}
      >
        <EuiEmptyPrompt
          color="danger"
          iconType="alert"
          title={
            <h2>
              <FormattedMessage
                id="xpack.securitySolution.endpoint.fileSystemBrowser.endpointErrorTitle"
                defaultMessage="Could not load endpoint"
              />
            </h2>
          }
          body={
            <FormattedMessage
              id="xpack.securitySolution.endpoint.fileSystemBrowser.endpointErrorBody"
              defaultMessage="Return to the Endpoints list and try again."
            />
          }
        />
      </AdministrationListPage>
    );
  }

  const pageTitle = mockFileSystem?.hostname ?? selectedEndpoint;

  return (
    <AdministrationListPage
      data-test-subj="fileSystemBrowserPage"
      title={pageTitle}
      headerBackComponent={<BackToEndpointsButton />}
    >
      <EuiCallOut
        size="s"
        title={
          <FormattedMessage
            id="xpack.securitySolution.endpoint.fileSystemBrowser.prototypeCalloutTitle"
            defaultMessage="File System Browser prototype"
          />
        }
        iconType="beaker"
      >
        <FormattedMessage
          id="xpack.securitySolution.endpoint.fileSystemBrowser.prototypeCalloutBody"
          defaultMessage="This experience uses mock endpoint and file data for design review."
        />
      </EuiCallOut>
      <EuiSpacer size="m" />
      <PrototypeStateShowcase
        selectedState={showcaseViewState}
        onStateChange={setShowcaseViewState}
      />
      <EuiSpacer size="m" />
      <EuiFieldSearch
        fullWidth={true}
        placeholder={i18n.translate(
          'xpack.securitySolution.endpoint.fileSystemBrowser.searchPlaceholder',
          {
            defaultMessage: 'Search files or folders on this endpoint',
          }
        )}
        value={searchQuery ?? ''}
        onChange={handleSearchChange}
        data-test-subj="fileSystemBrowserSearch"
      />
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" responsive={false}>
        <EuiFlexItem grow={true}>
          {isSearchMode ? (
            <span data-test-subj="fileSystemBrowserSearchModeLabel">
              <FormattedMessage
                id="xpack.securitySolution.endpoint.fileSystemBrowser.searchModeLabel"
                defaultMessage="Searching entire endpoint"
              />
            </span>
          ) : (
            <EuiBreadcrumbs breadcrumbs={breadcrumbs} data-test-subj="fileSystemBrowserBreadcrumbs" />
          )}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup gutterSize="s" responsive={false}>
            {showDownloadButton && (
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType="download"
                  onClick={handleBulkDownload}
                  data-test-subj="fileSystemBrowserBulkDownloadButton"
                >
                  <FormattedMessage
                    id="xpack.securitySolution.endpoint.fileSystemBrowser.downloadSelected"
                    defaultMessage="Download ({count})"
                    values={{ count: selectedItems.length }}
                  />
                </EuiButton>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <EuiButton
                iconType="exportAction"
                onClick={handleUploadClick}
                data-test-subj="fileSystemBrowserUploadButton"
              >
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.uploadFile"
                  defaultMessage="Upload file"
                />
              </EuiButton>
              <input
                ref={uploadInputRef}
                type="file"
                hidden={true}
                onChange={handleUploadFileSelected}
                data-test-subj="fileSystemBrowserUploadInput"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiFlexGroup gutterSize="none" alignItems="stretch">
        <EuiFlexItem grow={true}>
          {resolvedViewState === 'loaded' ? (
            <FileSystemBrowserTable
              items={tableItems}
              endpointHostname={mockFileSystem?.hostname ?? pageTitle}
              isSearchMode={isSearchMode}
              selectedItems={selectedItems}
              onSelectionChange={handleSelectionChange}
              onNavigateToEntry={handleNavigateToEntry}
            />
          ) : (
            <FileSystemViewState
              state={resolvedViewState as FileSystemBrowserViewState}
              searchTerm={searchQuery}
              onRefresh={handleRefresh}
            />
          )}
        </EuiFlexItem>
        {showMetadataPanel && (
          <EuiFlexItem grow={false}>
            <FileMetadataPanel
              selectedItems={selectedItems}
              onClose={handleCloseMetadataPanel}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </AdministrationListPage>
  );
});

FileSystemBrowserPage.displayName = 'FileSystemBrowserPage';
