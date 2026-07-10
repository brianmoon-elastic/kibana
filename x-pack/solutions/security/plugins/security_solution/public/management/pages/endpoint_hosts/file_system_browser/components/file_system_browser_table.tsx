/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import type { Criteria, EuiBasicTableColumn, EuiTableSelectionType } from '@elastic/eui';
import {
  EuiBasicTable,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { FileSearchResult } from '../types';
import {
  getEntryIconType,
  getEntryTypeLabel,
  isDownloadableEntry,
  isNavigableEntry,
} from '../mock_data';
import type { FileBrowserTableItem } from './file_metadata_panel';
import { useFileTransfer } from './file_transfer_provider';

interface FileSystemBrowserTableProps {
  readonly items: readonly FileBrowserTableItem[];
  readonly endpointHostname: string;
  readonly isSearchMode: boolean;
  readonly selectedItems: readonly FileBrowserTableItem[];
  readonly onSelectionChange: (items: readonly FileBrowserTableItem[]) => void;
  readonly onNavigateToEntry: (entry: FileBrowserTableItem) => void;
}

const isSearchResult = (entry: FileBrowserTableItem): entry is FileSearchResult =>
  'pathLabel' in entry;

export const FileSystemBrowserTable = memo<FileSystemBrowserTableProps>(
  ({
    items,
    endpointHostname,
    isSearchMode,
    selectedItems,
    onSelectionChange,
    onNavigateToEntry,
  }) => {
    const { startTransfer } = useFileTransfer();
    const [sort, setSort] = useState<Criteria<FileBrowserTableItem>['sort']>({
      field: 'name',
      direction: 'asc',
    });

    const sortedItems = useMemo(() => {
      if (!sort) {
        return [...items];
      }

      const sorted = [...items];

      sorted.sort((itemA, itemB) => {
        const field = sort.field as keyof FileBrowserTableItem;
        const valueA = itemA[field];
        const valueB = itemB[field];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sort.direction === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return 0;
      });

      return sorted;
    }, [items, sort]);

    const handleTableChange = useCallback(({ sort: nextSort }: Criteria<FileBrowserTableItem>) => {
      if (nextSort) {
        setSort(nextSort);
      }
    }, []);

    const handleDownload = useCallback(
      (entry: FileBrowserTableItem) => {
        startTransfer({
          fileName: entry.name,
          direction: 'download',
          endpointHostname,
          sizeBytes: entry.sizeBytes,
          isFolder: entry.kind === 'folder',
        });
      },
      [endpointHostname, startTransfer]
    );

    const selection: EuiTableSelectionType<FileBrowserTableItem> = useMemo(
      () => ({
        selectable: () => true,
        selectableMessage: (selectable) =>
          !selectable
            ? i18n.translate(
                'xpack.securitySolution.endpoint.fileSystemBrowser.selectionDisabled',
                { defaultMessage: 'Unable to select this item' }
              )
            : '',
        onSelectionChange: (nextSelectedItems) => onSelectionChange(nextSelectedItems),
        selected: [...selectedItems],
        initialSelected: [],
      }),
      [onSelectionChange, selectedItems]
    );

    const columns = useMemo<Array<EuiBasicTableColumn<FileBrowserTableItem>>>(() => {
      const baseColumns: Array<EuiBasicTableColumn<FileBrowserTableItem>> = [
        {
          field: 'name',
          name: i18n.translate('xpack.securitySolution.endpoint.fileSystemBrowser.column.name', {
            defaultMessage: 'Name',
          }),
          sortable: true,
          render: (name: string, entry: FileBrowserTableItem) => {
            const navigable = isNavigableEntry(entry) && !isSearchMode;

            return (
              <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiIcon type={getEntryIconType(entry)} />
                </EuiFlexItem>
                <EuiFlexItem>
                  {navigable ? (
                    <EuiLink
                      onClick={() => onNavigateToEntry(entry)}
                      data-test-subj={`fileSystemBrowserEntry-${entry.id}`}
                    >
                      {name}
                    </EuiLink>
                  ) : (
                    <span data-test-subj={`fileSystemBrowserEntry-${entry.id}`}>{name}</span>
                  )}
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          },
        },
      ];

      if (isSearchMode) {
        baseColumns.push({
          field: 'pathLabel',
          name: i18n.translate('xpack.securitySolution.endpoint.fileSystemBrowser.column.path', {
            defaultMessage: 'Path',
          }),
          render: (_pathLabel: string | undefined, entry: FileBrowserTableItem) =>
            isSearchResult(entry) ? (
              <EuiLink onClick={() => onNavigateToEntry(entry)}>{entry.pathLabel}</EuiLink>
            ) : (
              '—'
            ),
        });
      }

      baseColumns.push(
        {
          field: 'kind',
          name: i18n.translate('xpack.securitySolution.endpoint.fileSystemBrowser.column.type', {
            defaultMessage: 'Type',
          }),
          width: '140px',
          render: (_kind: FileBrowserTableItem['kind'], entry: FileBrowserTableItem) =>
            getEntryTypeLabel(entry),
        },
        {
          field: 'size',
          name: i18n.translate('xpack.securitySolution.endpoint.fileSystemBrowser.column.size', {
            defaultMessage: 'Size',
          }),
          width: '100px',
          render: (size: string | undefined) => size ?? '—',
        },
        {
          field: 'created',
          name: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.column.created',
            {
              defaultMessage: 'Created',
            }
          ),
          width: '200px',
          render: (created: string | undefined) => created ?? '—',
        },
        {
          field: 'lastUpdated',
          name: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.column.lastUpdated',
            {
              defaultMessage: 'Last updated',
            }
          ),
          width: '200px',
          render: (lastUpdated: string | undefined) => lastUpdated ?? '—',
        },
        {
          name: i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.column.actions',
            {
              defaultMessage: 'Actions',
            }
          ),
          width: '80px',
          align: 'right',
          actions: [
            {
              render: (entry: FileBrowserTableItem) => {
                if (!isDownloadableEntry(entry)) {
                  return null;
                }

                return (
                  <EuiToolTip
                    content={i18n.translate(
                      'xpack.securitySolution.endpoint.fileSystemBrowser.downloadTooltip',
                      {
                        defaultMessage: 'Download {itemType}',
                        values: {
                          itemType: entry.kind === 'folder' ? 'folder' : 'file',
                        },
                      }
                    )}
                  >
                    <EuiButtonIcon
                      iconType="download"
                      aria-label={i18n.translate(
                        'xpack.securitySolution.endpoint.fileSystemBrowser.downloadAriaLabel',
                        {
                          defaultMessage: 'Download {fileName}',
                          values: { fileName: entry.name },
                        }
                      )}
                      onClick={() => handleDownload(entry)}
                      data-test-subj={`fileSystemBrowserDownload-${entry.id}`}
                    />
                  </EuiToolTip>
                );
              },
            },
          ],
        }
      );

      return baseColumns;
    }, [handleDownload, isSearchMode, onNavigateToEntry]);

    return (
      <>
        {isSearchMode && (
          <EuiText size="s" color="subdued" data-test-subj="fileSystemBrowserSearchResultCount">
            <span>
              {i18n.translate(
                'xpack.securitySolution.endpoint.fileSystemBrowser.searchResultCount',
                {
                  defaultMessage:
                    'Showing {count, plural, one {# search result} other {# search results}}',
                  values: { count: items.length },
                }
              )}
            </span>
          </EuiText>
        )}
        <EuiBasicTable
          data-test-subj="fileSystemBrowserTable"
          tableCaption={i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.tableCaption',
            {
              defaultMessage: 'Endpoint file system',
            }
          )}
          items={sortedItems}
          itemId="id"
          columns={columns}
          selection={selection}
          sorting={{ sort }}
          onChange={handleTableChange}
        />
      </>
    );
  }
);

FileSystemBrowserTable.displayName = 'FileSystemBrowserTable';
