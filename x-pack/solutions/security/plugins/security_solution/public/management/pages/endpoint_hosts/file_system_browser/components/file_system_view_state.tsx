/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiLoadingSpinner,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import type { FileSystemBrowserViewState } from '../types';

interface FileSystemViewStateProps {
  readonly state: FileSystemBrowserViewState;
  readonly searchTerm?: string;
  readonly onRefresh?: () => void;
}

export const FileSystemViewState = memo<FileSystemViewStateProps>(
  ({ state, searchTerm, onRefresh }) => {
    switch (state) {
      case 'loading':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-loading"
            icon={<EuiLoadingSpinner size="xl" />}
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.loadingTitle"
                  defaultMessage="Loading contents"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.loadingBody"
                  defaultMessage="This may take a moment for larger directories."
                />
              </EuiText>
            }
          />
        );
      case 'empty_folder':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-emptyFolder"
            iconType="folderOpen"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.emptyFolderTitle"
                  defaultMessage="This folder is empty"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.emptyFolderBody"
                  defaultMessage="There are no files or subfolders to display here."
                />
              </EuiText>
            }
          />
        );
      case 'load_error':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-loadError"
            iconType="alert"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.loadErrorTitle"
                  defaultMessage="Unable to load contents"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.loadErrorBody"
                  defaultMessage="Something went wrong while retrieving this directory. Try again."
                />
              </EuiText>
            }
            actions={
              onRefresh ? (
                <EuiButton onClick={onRefresh} fill={true} data-test-subj="fileSystemBrowserTryAgain">
                  <FormattedMessage
                    id="xpack.securitySolution.endpoint.fileSystemBrowser.state.tryAgain"
                    defaultMessage="Try again"
                  />
                </EuiButton>
              ) : undefined
            }
          />
        );
      case 'no_permission':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-noPermission"
            iconType="lock"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.noPermissionTitle"
                  defaultMessage="You don't have permission to view"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.noPermissionBody"
                  defaultMessage="Contact your administrator if you believe this is a mistake."
                />
              </EuiText>
            }
          />
        );
      case 'endpoint_offline':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-endpointOffline"
            iconType="offline"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.offlineTitle"
                  defaultMessage="Endpoint is offline"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.offlineBody"
                  defaultMessage="This endpoint must be online to browse its file system."
                />
              </EuiText>
            }
          />
        );
      case 'request_timed_out':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-requestTimedOut"
            iconType="clockCounter"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.timedOutTitle"
                  defaultMessage="Request timed out"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.timedOutBody"
                  defaultMessage="The endpoint took too long to respond. Try again."
                />
              </EuiText>
            }
          />
        );
      case 'path_invalid':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-pathInvalid"
            iconType="alert"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.pathInvalidTitle"
                  defaultMessage="Path no longer valid"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.pathInvalidBody"
                  defaultMessage="This folder may have been renamed, moved, or deleted on the endpoint."
                />
              </EuiText>
            }
          />
        );
      case 'folder_changed':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-folderChanged"
            iconType="refresh"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.folderChangedTitle"
                  defaultMessage="This folder has changed"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.folderChangedBody"
                  defaultMessage="Contents may have been added, removed, or last updated. Refresh to see the latest."
                />
              </EuiText>
            }
            actions={
              onRefresh ? (
                <EuiButton onClick={onRefresh} fill={true} data-test-subj="fileSystemBrowserRefresh">
                  <FormattedMessage
                    id="xpack.securitySolution.endpoint.fileSystemBrowser.state.refresh"
                    defaultMessage="Refresh"
                  />
                </EuiButton>
              ) : undefined
            }
          />
        );
      case 'searching':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-searching"
            icon={<EuiLoadingSpinner size="xl" />}
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.searchingTitle"
                  defaultMessage="Searching…"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.searchingBody"
                  defaultMessage="Looking for files and folders matching '{searchTerm}'."
                  values={{ searchTerm: searchTerm ?? '' }}
                />
              </EuiText>
            }
          />
        );
      case 'search_no_results':
        return (
          <EuiEmptyPrompt
            data-test-subj="fileSystemBrowserState-searchNoResults"
            iconType="search"
            title={
              <h3>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.searchNoResultsTitle"
                  defaultMessage="No results found"
                />
              </h3>
            }
            body={
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.state.searchNoResultsBody"
                  defaultMessage="Try a different search term or check for typos."
                />
              </EuiText>
            }
          />
        );
      default:
        return null;
    }
  }
);

FileSystemViewState.displayName = 'FileSystemViewState';
