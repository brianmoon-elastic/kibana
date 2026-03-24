/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import { cloneDeep } from 'lodash';
import { EuiFlexGroup, EuiFlexItem, EuiSuperSelect, EuiText } from '@elastic/eui';
import type { EuiSuperSelectOption } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { useTestIdGenerator } from '../../../../../hooks/use_test_id_generator';
import type { PolicyFormComponentCommonProps } from '../types';
import type {
  ImmutableArray,
  DeviceControlAccessLevel,
} from '../../../../../../../common/endpoint/types';
import { DeviceControlAccessLevel as DeviceControlAccessLevelEnum } from '../../../../../../../common/endpoint/types';
import type { DeviceControlOSes } from '../../../types';

const USB_STORAGE_ACCESS_LABEL = i18n.translate(
  'xpack.securitySolution.endpoint.policyDetailsConfig.deviceControl.usbStorageAccess',
  {
    defaultMessage: 'USB storage access',
  }
);

const READ_WRITE_EXECUTE_LABEL = i18n.translate(
  'xpack.securitySolution.endpoint.policy.details.deviceControl.readWriteExecute',
  {
    defaultMessage: 'Read, write, and execute',
  }
);

const READ_AND_WRITE_LABEL = i18n.translate(
  'xpack.securitySolution.endpoint.policy.details.deviceControl.readAndWrite',
  {
    defaultMessage: 'Read and write',
  }
);

const READ_ONLY_LABEL = i18n.translate(
  'xpack.securitySolution.endpoint.policy.details.deviceControl.readOnly',
  {
    defaultMessage: 'Read only',
  }
);

const BLOCK_ALL_LABEL = i18n.translate(
  'xpack.securitySolution.endpoint.policy.details.deviceControl.blockAll',
  {
    defaultMessage: 'Block all',
  }
);

export type DeviceControlProtectionLevelProps = PolicyFormComponentCommonProps & {
  osList: ImmutableArray<DeviceControlOSes>;
  settingsDisabled?: boolean;
};

export const DeviceControlProtectionLevel = memo<DeviceControlProtectionLevelProps>(
  ({
    policy,
    osList,
    mode,
    onChange,
    settingsDisabled = false,
    'data-test-subj': dataTestSubj,
  }) => {
    const isEditMode = mode === 'edit';
    const getTestId = useTestIdGenerator(dataTestSubj);

    const options: Array<EuiSuperSelectOption<DeviceControlAccessLevel>> = useMemo(
      () => [
        {
          value: DeviceControlAccessLevelEnum.audit,
          inputDisplay: READ_WRITE_EXECUTE_LABEL,
          'data-test-subj': getTestId('option-audit'),
        },
        {
          value: DeviceControlAccessLevelEnum.no_execute,
          inputDisplay: READ_AND_WRITE_LABEL,
          'data-test-subj': getTestId('option-no_execute'),
        },
        {
          value: DeviceControlAccessLevelEnum.read_only,
          inputDisplay: READ_ONLY_LABEL,
          'data-test-subj': getTestId('option-read_only'),
        },
        {
          value: DeviceControlAccessLevelEnum.deny_all,
          inputDisplay: BLOCK_ALL_LABEL,
          'data-test-subj': getTestId('option-deny_all'),
        },
      ],
      [getTestId]
    );

    const labelByLevel = useMemo(
      () =>
        ({
          [DeviceControlAccessLevelEnum.audit]: READ_WRITE_EXECUTE_LABEL,
          [DeviceControlAccessLevelEnum.no_execute]: READ_AND_WRITE_LABEL,
          [DeviceControlAccessLevelEnum.read_only]: READ_ONLY_LABEL,
          [DeviceControlAccessLevelEnum.deny_all]: BLOCK_ALL_LABEL,
        } as Record<DeviceControlAccessLevel, string>),
      []
    );

    const primaryOs = osList[0];

    const currentAccessLevel = useMemo(() => {
      return policy[primaryOs]?.device_control?.usb_storage ?? DeviceControlAccessLevelEnum.audit;
    }, [policy, primaryOs]);

    const currentAccessLevelLabel = labelByLevel[currentAccessLevel] ?? BLOCK_ALL_LABEL;

    const isDeviceControlEnabled = useMemo(() => {
      return osList.some((os) => {
        if (os === 'windows' || os === 'mac') {
          return policy[os].device_control?.enabled;
        }
        return false;
      });
    }, [policy, osList]);

    const applyAccessLevel = useCallback(
      (accessLevel: DeviceControlAccessLevel) => {
        const newPayload = cloneDeep(policy);

        for (const os of osList) {
          if (os === 'windows' || os === 'mac') {
            const existingDc = newPayload[os].device_control;
            newPayload[os].device_control = {
              enabled: existingDc?.enabled ?? true,
              usb_storage: accessLevel,
            };

            const prevPopup = newPayload[os].popup.device_control;
            newPayload[os].popup = {
              ...newPayload[os].popup,
              device_control: {
                enabled: accessLevel === DeviceControlAccessLevelEnum.deny_all,
                message: prevPopup?.message ?? '',
              },
            };
          }
        }

        onChange({ isValid: true, updatedPolicy: newPayload });
      },
      [onChange, osList, policy]
    );

    const handleChange = useCallback(
      (value: string) => {
        applyAccessLevel(value as DeviceControlAccessLevel);
      },
      [applyAccessLevel]
    );

    const selectDisabled = !isEditMode || !isDeviceControlEnabled || settingsDisabled;

    return (
      <EuiFlexGroup gutterSize="s" alignItems="center" data-test-subj={getTestId()}>
        <EuiFlexItem>
          <EuiText size="s" css={({ euiTheme }) => ({ fontWeight: euiTheme.font.weight.semiBold })}>
            {USB_STORAGE_ACCESS_LABEL}
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false} css={{ minWidth: 200 }}>
          {isEditMode ? (
            <EuiSuperSelect
              options={options}
              valueOfSelected={currentAccessLevel}
              onChange={handleChange}
              disabled={selectDisabled}
              compressed
              aria-label={USB_STORAGE_ACCESS_LABEL}
              data-test-subj={getTestId('select')}
            />
          ) : (
            <EuiText size="s" data-test-subj={getTestId('viewValue')}>
              {currentAccessLevelLabel}
            </EuiText>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
);
DeviceControlProtectionLevel.displayName = 'DeviceControlProtectionLevel';
