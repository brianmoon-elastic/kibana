/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { i18n } from '@kbn/i18n';
import { useAppUrl } from '../../../../../common/lib/kibana';
import { BackToExternalAppButton } from '../../../../components/back_to_external_app_button/back_to_external_app_button';
import { getEndpointListPath } from '../../../../common/routing';
import { APP_UI_ID } from '../../../../../../common';

export const BackToEndpointsButton = memo(() => {
  const { getAppUrl } = useAppUrl();

  const backLinkOptions = useMemo(() => {
    const endpointListPath = getEndpointListPath({ name: 'endpointList' });

    return {
      backButtonLabel: i18n.translate(
        'xpack.securitySolution.endpoint.fileSystemBrowser.backToEndpoints',
        {
          defaultMessage: 'Back to endpoints',
        }
      ),
      backButtonUrl: getAppUrl({ path: endpointListPath }),
      onBackButtonNavigateTo: [APP_UI_ID, { path: endpointListPath }],
    };
  }, [getAppUrl]);

  return (
    <BackToExternalAppButton
      {...backLinkOptions}
      data-test-subj="fileSystemBrowserBackToEndpoints"
    />
  );
});

BackToEndpointsButton.displayName = 'BackToEndpointsButton';
