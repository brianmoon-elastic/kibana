/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import type { FileTransferDirection, FileTransferItem, FileTransferStatus } from '../types';

const SESSION_STORAGE_KEY = 'securitySolution.fileSystemBrowser.transfers';

interface StartTransferOptions {
  readonly fileName: string;
  readonly direction: FileTransferDirection;
  readonly endpointHostname: string;
  readonly sizeBytes?: number;
  readonly isFolder?: boolean;
}

interface FileTransferContextValue {
  readonly transfers: readonly FileTransferItem[];
  readonly isPanelExpanded: boolean;
  readonly activeTab: FileTransferDirection;
  readonly setIsPanelExpanded: (expanded: boolean) => void;
  readonly setActiveTab: (tab: FileTransferDirection) => void;
  readonly startTransfer: (options: StartTransferOptions) => string;
  readonly dismissTransfer: (transferId: string) => void;
  readonly clearCompletedTransfers: (direction?: FileTransferDirection) => void;
}

const FileTransferContext = createContext<FileTransferContextValue | undefined>(undefined);

const createTransferId = (): string =>
  `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getProgressIncrement = (sizeBytes?: number, isFolder?: boolean): number => {
  if (isFolder) {
    return 3;
  }

  if (!sizeBytes) {
    return 8;
  }

  if (sizeBytes > 1_000_000_000) {
    return 2;
  }

  if (sizeBytes > 100_000_000) {
    return 4;
  }

  if (sizeBytes > 10_000_000) {
    return 6;
  }

  return 10;
};

const readTransfersFromSession = (): readonly FileTransferItem[] => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as FileTransferItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTransfersToSession = (transfers: readonly FileTransferItem[]) => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(transfers));
};

export const FileTransferProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [transfers, setTransfers] = useState<readonly FileTransferItem[]>(() =>
    readTransfersFromSession()
  );
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<FileTransferDirection>('download');
  const intervalIdsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    writeTransfersToSession(transfers);
  }, [transfers]);

  const updateTransfer = useCallback(
    (transferId: string, updates: Partial<FileTransferItem>) => {
      setTransfers((currentTransfers) =>
        currentTransfers.map((transfer) =>
          transfer.id === transferId ? { ...transfer, ...updates } : transfer
        )
      );
    },
    []
  );

  const clearIntervalForTransfer = useCallback((transferId: string) => {
    const intervalId = intervalIdsRef.current.get(transferId);

    if (intervalId) {
      clearInterval(intervalId);
      intervalIdsRef.current.delete(transferId);
    }
  }, []);

  const simulateTransferProgress = useCallback(
    (transferId: string, sizeBytes?: number, isFolder?: boolean) => {
      const increment = getProgressIncrement(sizeBytes, isFolder);

      const intervalId = setInterval(() => {
        setTransfers((currentTransfers) => {
          const transfer = currentTransfers.find((item) => item.id === transferId);

          if (!transfer || transfer.status === 'success' || transfer.status === 'failed') {
            clearIntervalForTransfer(transferId);
            return currentTransfers;
          }

          const nextProgress = Math.min(transfer.progress + increment, 100);

          if (nextProgress >= 100) {
            clearIntervalForTransfer(transferId);

            return currentTransfers.map((item) =>
              item.id === transferId
                ? {
                    ...item,
                    progress: 100,
                    status: 'success' as FileTransferStatus,
                  }
                : item
            );
          }

          return currentTransfers.map((item) =>
            item.id === transferId
              ? {
                  ...item,
                  progress: nextProgress,
                  status: 'in_progress' as FileTransferStatus,
                }
              : item
          );
        });
      }, 400);

      intervalIdsRef.current.set(transferId, intervalId);
    },
    [clearIntervalForTransfer]
  );

  const startTransfer = useCallback(
    ({ fileName, direction, endpointHostname, sizeBytes, isFolder }: StartTransferOptions) => {
      const transferId = createTransferId();

      const newTransfer: FileTransferItem = {
        id: transferId,
        fileName,
        direction,
        endpointHostname,
        status: 'pending',
        progress: 0,
        isFolder,
      };

      setTransfers((currentTransfers) => [...currentTransfers, newTransfer]);
      setActiveTab(direction);
      setIsPanelExpanded(true);

      window.setTimeout(() => {
        updateTransfer(transferId, { status: 'in_progress', progress: 5 });
        simulateTransferProgress(transferId, sizeBytes, isFolder);
      }, 300);

      return transferId;
    },
    [simulateTransferProgress, updateTransfer]
  );

  const dismissTransfer = useCallback(
    (transferId: string) => {
      clearIntervalForTransfer(transferId);
      setTransfers((currentTransfers) =>
        currentTransfers.filter((transfer) => transfer.id !== transferId)
      );
    },
    [clearIntervalForTransfer]
  );

  const clearCompletedTransfers = useCallback(
    (direction?: FileTransferDirection) => {
      setTransfers((currentTransfers) => {
        const remainingTransfers = currentTransfers.filter((transfer) => {
          const isCompleted =
            transfer.status === 'success' || transfer.status === 'failed';
          const matchesDirection = direction ? transfer.direction === direction : true;

          if (isCompleted && matchesDirection) {
            clearIntervalForTransfer(transfer.id);
            return false;
          }

          return true;
        });

        return remainingTransfers;
      });
    },
    [clearIntervalForTransfer]
  );

  const value = useMemo<FileTransferContextValue>(
    () => ({
      transfers,
      isPanelExpanded,
      activeTab,
      setIsPanelExpanded,
      setActiveTab,
      startTransfer,
      dismissTransfer,
      clearCompletedTransfers,
    }),
    [
      transfers,
      isPanelExpanded,
      activeTab,
      startTransfer,
      dismissTransfer,
      clearCompletedTransfers,
    ]
  );

  return <FileTransferContext.Provider value={value}>{children}</FileTransferContext.Provider>;
};

export const useFileTransfer = (): FileTransferContextValue => {
  const context = useContext(FileTransferContext);

  if (!context) {
    throw new Error('useFileTransfer must be used within a FileTransferProvider');
  }

  return context;
};
