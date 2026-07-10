/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Routes, Route } from '@kbn/shared-ux-router';
import React, { Suspense, memo, useEffect } from 'react';
import { EuiLoadingLogo } from '@elastic/eui';
import { useDispatch } from 'react-redux';
import type { EndpointAction } from './store/action';
import { EndpointList } from './view';
import {
  MANAGEMENT_ROUTING_ENDPOINT_FILE_BROWSER_PATH,
  MANAGEMENT_ROUTING_ENDPOINTS_PATH,
} from '../../common/constants';
import { NotFoundPage } from '../../../app/404';
import { FileTransferProvider } from './file_system_browser/components/file_transfer_provider';

const FileSystemBrowserPage = React.lazy(async () => {
  const module = await import('./file_system_browser');
  return { default: module.FileSystemBrowserPage };
});

const FileTransferStatusPanel = React.lazy(async () => {
  const module = await import('./file_system_browser/components/file_transfer_status_panel');
  return { default: module.FileTransferStatusPanel };
});

const FileSystemBrowserPageLoader = () => (
  <Suspense
    fallback={
      <EuiLoadingLogo logo="logoSecurity" size="xl" data-test-subj="fileSystemBrowserPageLoader" />
    }
  >
    <FileSystemBrowserPage />
  </Suspense>
);

const EndpointsTransferShell = ({ children }: { children: React.ReactNode }) => (
  <FileTransferProvider>
    {children}
    <Suspense fallback={null}>
      <FileTransferStatusPanel />
    </Suspense>
  </FileTransferProvider>
);

/**
 * Provides the routing container for the hosts related views
 */
export const EndpointsContainer = memo(() => {
  const dispatch = useDispatch<(a: EndpointAction) => void>();

  useEffect(() => {
    return () => dispatch({ type: 'serverFinishedInitialization', payload: false });
  }, [dispatch]);

  return (
    <EndpointsTransferShell>
      <Routes>
        <Route
          path={MANAGEMENT_ROUTING_ENDPOINT_FILE_BROWSER_PATH}
          component={FileSystemBrowserPageLoader}
        />
        <Route path={MANAGEMENT_ROUTING_ENDPOINTS_PATH} exact component={EndpointList} />
        <Route path="*" component={NotFoundPage} />
      </Routes>
    </EndpointsTransferShell>
  );
});

EndpointsContainer.displayName = 'EndpointsContainer';
