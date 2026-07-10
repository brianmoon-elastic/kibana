/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import {
  EuiButtonIcon,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import type { FileSearchResult, FileSystemEntry } from '../types';
import { getEntryTypeLabel } from '../mock_data';

export type FileBrowserTableItem = FileSystemEntry | FileSearchResult;

const isSearchResult = (entry: FileBrowserTableItem): entry is FileSearchResult =>
  'pathLabel' in entry;

interface FileMetadataPanelProps {
  readonly selectedItems: readonly FileBrowserTableItem[];
  readonly onClose: () => void;
}

export const FileMetadataPanel = memo<FileMetadataPanelProps>(({ selectedItems, onClose }) => {
  const { euiTheme } = useEuiTheme();

  const listItems = useMemo(() => {
    if (selectedItems.length === 0) {
      return [];
    }

    if (selectedItems.length === 1) {
      const item = selectedItems[0];
      const items = [
        {
          title: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.name',
            { defaultMessage: 'Name' }
          ),
          description: item.name,
        },
        {
          title: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.type',
            { defaultMessage: 'Type' }
          ),
          description: getEntryTypeLabel(item),
        },
        {
          title: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.size',
            { defaultMessage: 'Size' }
          ),
          description: item.size ?? '—',
        },
        {
          title: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.created',
            { defaultMessage: 'Created' }
          ),
          description: item.created ?? '—',
        },
        {
          title: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.lastUpdated',
            { defaultMessage: 'Last updated' }
          ),
          description: item.lastUpdated ?? '—',
        },
      ];

      if (isSearchResult(item)) {
        items.unshift({
          title: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.path',
            { defaultMessage: 'Path' }
          ),
          description: item.pathLabel,
        });
      }

      return items;
    }

    const fileCount = selectedItems.filter((item) => item.kind === 'file').length;
    const folderCount = selectedItems.filter(
      (item) => item.kind === 'folder' || item.kind === 'drive' || item.kind === 'external_drive'
    ).length;

    return [
      {
        title: i18n.translate(
          'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.selectionCount',
          { defaultMessage: 'Selected items' }
        ),
        description: String(selectedItems.length),
      },
      {
        title: i18n.translate(
          'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.files',
          { defaultMessage: 'Files' }
        ),
        description: String(fileCount),
      },
      {
        title: i18n.translate(
          'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.folders',
          { defaultMessage: 'Folders' }
        ),
        description: String(folderCount),
      },
    ];
  }, [selectedItems]);

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <EuiPanel
      hasShadow={false}
      hasBorder={true}
      paddingSize="m"
      style={{
        width: 320,
        minWidth: 320,
        borderLeft: euiTheme.border.thin,
        height: '100%',
      }}
      data-test-subj="fileSystemBrowserMetadataPanel"
    >
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" responsive={false}>
        <EuiFlexItem grow={true}>
          <EuiTitle size="xs">
            <h3>
              {selectedItems.length === 1 ? (
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.metadata.singleTitle"
                  defaultMessage="Details"
                />
              ) : (
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.fileSystemBrowser.metadata.multiTitle"
                  defaultMessage="{count} items selected"
                  values={{ count: selectedItems.length }}
                />
              )}
            </h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType="cross"
            aria-label={i18n.translate(
              'xpack.securitySolution.endpoint.fileSystemBrowser.metadata.close',
              { defaultMessage: 'Close details panel' }
            )}
            onClick={onClose}
            data-test-subj="fileSystemBrowserMetadataPanelClose"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <EuiDescriptionList listItems={listItems} type="column" compressed={true} />
      {selectedItems.length > 1 && (
        <>
          <EuiSpacer size="m" />
          <EuiText size="s" color="subdued">
            <FormattedMessage
              id="xpack.securitySolution.endpoint.fileSystemBrowser.metadata.multiHint"
              defaultMessage="Use Download to retrieve all selected files and folders."
            />
          </EuiText>
          <EuiSpacer size="s" />
          <EuiText size="xs">
            {selectedItems.map((item) => (
              <div key={item.id} className="eui-textTruncate">
                {isSearchResult(item) ? `${item.pathLabel} / ${item.name}` : item.name}
              </div>
            ))}
          </EuiText>
        </>
      )}
    </EuiPanel>
  );
});

FileMetadataPanel.displayName = 'FileMetadataPanel';
