/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiProgress,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
  useEuiTheme,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';
import type { FileTransferDirection, FileTransferItem } from '../types';
import { useFileTransfer } from './file_transfer_provider';

const getStatusLabel = (transfer: FileTransferItem): string => {
  const itemLabel = transfer.isFolder ? 'folder' : 'file';

  switch (transfer.status) {
    case 'pending':
      return i18n.translate('xpack.securitySolution.endpoint.fileSystemBrowser.transfer.pending', {
        defaultMessage: 'Preparing {itemLabel}…',
        values: { itemLabel },
      });
    case 'in_progress':
      return i18n.translate(
        'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.inProgress',
        {
          defaultMessage: '{progress}% complete',
          values: { progress: transfer.progress },
        }
      );
    case 'success':
      return transfer.direction === 'download'
        ? i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.downloadSuccess',
            {
              defaultMessage: '{itemLabel} download complete',
              values: { itemLabel: transfer.isFolder ? 'Folder' : 'File' },
            }
          )
        : i18n.translate(
            'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.uploadSuccess',
            {
              defaultMessage: '{itemLabel} upload complete',
              values: { itemLabel: transfer.isFolder ? 'Folder' : 'File' },
            }
          );
    case 'failed':
      return transfer.errorMessage ??
        i18n.translate('xpack.securitySolution.endpoint.fileSystemBrowser.transfer.failed', {
          defaultMessage: 'Transfer failed',
        });
  }
};

const TransferRow = memo<{ transfer: FileTransferItem }>(({ transfer }) => {
  const { dismissTransfer } = useFileTransfer();
  const { euiTheme } = useEuiTheme();

  const iconType = transfer.direction === 'download' ? 'download' : 'exportAction';
  const statusColor =
    transfer.status === 'failed'
      ? euiTheme.colors.danger
      : transfer.status === 'success'
      ? euiTheme.colors.success
      : euiTheme.colors.subduedText;

  return (
    <div
      style={{
        padding: `${euiTheme.size.s} ${euiTheme.size.m}`,
        borderBottom: euiTheme.border.thin,
      }}
      data-test-subj={`fileTransferRow-${transfer.id}`}
    >
      <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type={iconType} color="subdued" />
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <EuiText size="s">
            <strong className="eui-textTruncate">{transfer.fileName}</strong>
          </EuiText>
          <EuiText size="xs" color={statusColor}>
            {getStatusLabel(transfer)}
          </EuiText>
          {(transfer.status === 'pending' || transfer.status === 'in_progress') && (
            <EuiProgress
              value={transfer.progress}
              max={100}
              size="xs"
              color="primary"
              data-test-subj={`fileTransferProgress-${transfer.id}`}
            />
          )}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType="cross"
            aria-label={i18n.translate(
              'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.dismiss',
              {
                defaultMessage: 'Dismiss transfer',
              }
            )}
            onClick={() => dismissTransfer(transfer.id)}
            data-test-subj={`fileTransferDismiss-${transfer.id}`}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
});

TransferRow.displayName = 'TransferRow';

export const FileTransferStatusPanel = memo(() => {
  const {
    transfers,
    isPanelExpanded,
    setIsPanelExpanded,
    activeTab,
    setActiveTab,
    clearCompletedTransfers,
  } = useFileTransfer();
  const { euiTheme } = useEuiTheme();

  const transfersForTab = useMemo(
    () => transfers.filter((transfer) => transfer.direction === activeTab),
    [activeTab, transfers]
  );

  const activeTransferCount = useMemo(
    () =>
      transfers.filter(
        (transfer) => transfer.status === 'pending' || transfer.status === 'in_progress'
      ).length,
    [transfers]
  );

  const completedCountForTab = useMemo(
    () =>
      transfersForTab.filter(
        (transfer) => transfer.status === 'success' || transfer.status === 'failed'
      ).length,
    [transfersForTab]
  );

  if (transfers.length === 0) {
    return null;
  }

  const tabs = [
    {
      id: 'download' as FileTransferDirection,
      label: i18n.translate(
        'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.downloadTab',
        { defaultMessage: 'Downloads' }
      ),
    },
    {
      id: 'upload' as FileTransferDirection,
      label: i18n.translate(
        'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.uploadTab',
        { defaultMessage: 'Uploads' }
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        right: euiTheme.size.xl,
        bottom: 0,
        width: 420,
        zIndex: euiTheme.levels.toast,
      }}
      data-test-subj="fileTransferStatusPanel"
    >
      <EuiPanel hasShadow={true} paddingSize="none">
        <div
          style={{
            padding: `${euiTheme.size.s} ${euiTheme.size.m} 0`,
            borderBottom: euiTheme.border.thin,
          }}
        >
          <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
            <EuiFlexItem grow={true}>
              <EuiTitle size="xxs">
                <h3>
                  {activeTransferCount > 0 ? (
                    <FormattedMessage
                      id="xpack.securitySolution.endpoint.fileSystemBrowser.transfer.activeTitle"
                      defaultMessage="{count, plural, one {# transfer in progress} other {# transfers in progress}}"
                      values={{ count: activeTransferCount }}
                    />
                  ) : (
                    <FormattedMessage
                      id="xpack.securitySolution.endpoint.fileSystemBrowser.transfer.completedTitle"
                      defaultMessage="File transfers"
                    />
                  )}
                </h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType={isPanelExpanded ? 'arrowDown' : 'arrowUp'}
                aria-label={
                  isPanelExpanded
                    ? i18n.translate(
                        'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.collapse',
                        { defaultMessage: 'Collapse transfer panel' }
                      )
                    : i18n.translate(
                        'xpack.securitySolution.endpoint.fileSystemBrowser.transfer.expand',
                        { defaultMessage: 'Expand transfer panel' }
                      )
                }
                onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                data-test-subj="fileTransferTogglePanel"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiTabs size="s" bottomBorder={false}>
            {tabs.map((tab) => (
              <EuiTab
                key={tab.id}
                isSelected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-test-subj={`fileTransferTab-${tab.id}`}
              >
                {tab.label}
              </EuiTab>
            ))}
          </EuiTabs>
        </div>
        {isPanelExpanded && (
          <>
            {completedCountForTab > 0 && (
              <div
                style={{
                  padding: `${euiTheme.size.xs} ${euiTheme.size.m}`,
                  borderBottom: euiTheme.border.thin,
                  textAlign: 'right',
                }}
              >
                <EuiButtonEmpty
                  size="xs"
                  onClick={() => clearCompletedTransfers(activeTab)}
                  data-test-subj={`fileTransferClearCompleted-${activeTab}`}
                >
                  <FormattedMessage
                    id="xpack.securitySolution.endpoint.fileSystemBrowser.transfer.clearCompleted"
                    defaultMessage="Clear completed"
                  />
                </EuiButtonEmpty>
              </div>
            )}
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {transfersForTab.length === 0 ? (
                <>
                  <EuiSpacer size="m" />
                  <EuiText size="s" color="subdued" textAlign="center">
                    <FormattedMessage
                      id="xpack.securitySolution.endpoint.fileSystemBrowser.transfer.emptyTab"
                      defaultMessage="No {direction} yet"
                      values={{
                        direction: activeTab === 'download' ? 'downloads' : 'uploads',
                      }}
                    />
                  </EuiText>
                  <EuiSpacer size="m" />
                </>
              ) : (
                transfersForTab.map((transfer) => (
                  <TransferRow key={transfer.id} transfer={transfer} />
                ))
              )}
            </div>
          </>
        )}
      </EuiPanel>
    </div>
  );
});

FileTransferStatusPanel.displayName = 'FileTransferStatusPanel';
