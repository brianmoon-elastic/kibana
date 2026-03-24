/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { cloneDeep } from 'lodash';
import type { EuiTextAreaProps, EuiSwitchProps } from '@elastic/eui';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIconTip,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTextArea,
} from '@elastic/eui';
import { useTestIdGenerator } from '../../../../../hooks/use_test_id_generator';
import { getEmptyValue } from '../../../../../../common/components/empty_value';
import { useLicense } from '../../../../../../common/hooks/use_license';
import type { PolicyFormComponentCommonProps } from '../types';
import type { ImmutableArray } from '../../../../../../../common/endpoint/types';
import { DeviceControlAccessLevel as DeviceControlAccessLevelEnum } from '../../../../../../../common/endpoint/types';
import type { DeviceControlOSes } from '../../../types';
import { DefaultPolicyDeviceNotificationMessage } from '../../../../../../../common/endpoint/models/policy_config';
import { useGetCustomNotificationUnavailableComponent } from '../hooks/use_get_custom_notification_unavailable_component';
import {
  NOTIFY_USER_CHECKBOX_LABEL,
  NOTIFICATION_MESSAGE_LABEL,
  CUSTOMIZE_NOTIFICATION_MESSAGE_LABEL,
} from './shared_translations';

const DEFAULT_DEVICE_CONTROL_OS_LIST: ImmutableArray<DeviceControlOSes> = ['windows', 'mac'];

export type DeviceControlNotifyUserOptionProps = PolicyFormComponentCommonProps & {
  osList?: ImmutableArray<DeviceControlOSes>;
  formDisabled?: boolean;
};

export const DeviceControlNotifyUserOption = React.memo(
  ({
    policy,
    onChange,
    mode,
    osList = DEFAULT_DEVICE_CONTROL_OS_LIST,
    formDisabled = false,
    'data-test-subj': dataTestSubj,
  }: DeviceControlNotifyUserOptionProps) => {
    const isEnterprise = useLicense().isEnterprise();
    const getTestId = useTestIdGenerator(dataTestSubj);
    const CustomNotificationUpsellingComponent = useGetCustomNotificationUnavailableComponent();

    const isEditMode = mode === 'edit';

    const primaryOs = osList[0];

    const isDeviceControlEnabled = osList.some((os) => policy[os].device_control?.enabled);

    const currentAccessLevel = policy[primaryOs].device_control?.usb_storage;

    const userNotificationSelected = policy[primaryOs].popup.device_control?.enabled || false;
    const userNotificationMessage = policy[primaryOs].popup.device_control?.message || '';

    const handleUserNotificationSwitch = useCallback<NonNullable<EuiSwitchProps['onChange']>>(
      (event) => {
        const newPayload = cloneDeep(policy);

        for (const os of osList) {
          const prev = newPayload[os].popup.device_control;
          newPayload[os].popup.device_control = {
            enabled: event.target.checked,
            message: prev?.message ?? DefaultPolicyDeviceNotificationMessage,
          };
        }

        onChange({ isValid: true, updatedPolicy: newPayload });
      },
      [osList, policy, onChange]
    );

    const handleCustomUserNotification = useCallback<NonNullable<EuiTextAreaProps['onChange']>>(
      (event) => {
        const newPayload = cloneDeep(policy);
        for (const os of osList) {
          const prev = newPayload[os].popup.device_control;
          newPayload[os].popup.device_control = {
            enabled: prev?.enabled ?? false,
            message: event.target.value,
          };
        }

        onChange({ isValid: true, updatedPolicy: newPayload });
      },
      [osList, policy, onChange]
    );

    const customNotificationComponent = useMemo(() => {
      if (!userNotificationSelected) {
        return null;
      }

      if (CustomNotificationUpsellingComponent) {
        return <CustomNotificationUpsellingComponent />;
      }

      if (!isEditMode) {
        return (
          <>
            <EuiSpacer size="m" />
            <EuiText size="s">
              <h4>{NOTIFICATION_MESSAGE_LABEL}</h4>
            </EuiText>
            <EuiSpacer size="xs" />
            <>{userNotificationMessage || getEmptyValue()}</>
          </>
        );
      }

      return (
        <>
          <EuiSpacer size="m" />
          <EuiFlexGroup gutterSize="xs">
            <EuiFlexItem grow={false}>
              <EuiText size="s" data-test-subj={getTestId('customMessageTitle')}>
                <h4>{CUSTOMIZE_NOTIFICATION_MESSAGE_LABEL}</h4>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiIconTip
                position="right"
                data-test-subj={getTestId('tooltipInfo')}
                anchorProps={{ 'data-test-subj': getTestId('tooltipIcon') }}
                content={
                  <>
                    <FormattedMessage
                      id="xpack.securitySolution.endpoint.policyDetailsConfig.deviceControl.notifyUserTooltip.a"
                      defaultMessage="Selecting the user notification option will display a notification to the host user when device access is blocked or restricted."
                    />
                    <EuiSpacer size="m" />
                    <FormattedMessage
                      id="xpack.securitySolution.endpoint.policyDetailsConfig.deviceControl.notifyUserTooltip.c"
                      defaultMessage="The user notification can be customized in the text box below. Bracketed tags can be used to dynamically populate the applicable action and device type."
                    />
                  </>
                }
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xs" />
          <EuiTextArea
            value={userNotificationMessage}
            onChange={handleCustomUserNotification}
            fullWidth={true}
            disabled={!isEditMode || formDisabled}
            data-test-subj={getTestId('customMessage')}
          />
        </>
      );
    }, [
      CustomNotificationUpsellingComponent,
      getTestId,
      handleCustomUserNotification,
      isEditMode,
      userNotificationMessage,
      userNotificationSelected,
      formDisabled,
    ]);

    if (!isEnterprise) {
      return null;
    }

    if (currentAccessLevel !== DeviceControlAccessLevelEnum.deny_all) {
      return null;
    }

    const switchDisabled = !isEnterprise || !isDeviceControlEnabled || !isEditMode || formDisabled;

    return (
      <div data-test-subj={getTestId()}>
        <EuiSpacer size="m" />
        <EuiHorizontalRule margin="m" data-test-subj={getTestId('sectionDivider')} />

        <EuiFlexGroup
          gutterSize="m"
          alignItems="flex-start"
          justifyContent="spaceBetween"
          responsive={false}
        >
          <EuiFlexItem grow={true}>
            <EuiText
              size="s"
              css={({ euiTheme }) => ({ fontWeight: euiTheme.font.weight.semiBold })}
            >
              {NOTIFY_USER_CHECKBOX_LABEL}
            </EuiText>
            <EuiSpacer size="xs" />
            <EuiText color="subdued" size="xs">
              <FormattedMessage
                id="xpack.securitySolution.endpoint.policyDetailsConfig.deviceControl.notifyUserDescription"
                defaultMessage="Enabling this will display a notification to the host user when device access is blocked or restricted. The user notification can be customized once enabled."
              />
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label={NOTIFY_USER_CHECKBOX_LABEL}
              showLabel={false}
              checked={userNotificationSelected}
              onChange={handleUserNotificationSwitch}
              disabled={switchDisabled}
              data-test-subj={getTestId('checkbox')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        {customNotificationComponent}
      </div>
    );
  }
);
DeviceControlNotifyUserOption.displayName = 'DeviceControlNotifyUserOption';
