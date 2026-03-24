/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { cloneDeep } from 'lodash';
import type { EuiTextAreaProps, EuiSwitchProps } from '@elastic/eui';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiHorizontalRule,
  EuiIconTip,
  EuiText,
  EuiTextArea,
  EuiSwitch,
} from '@elastic/eui';
import { PROTECTION_NOTICE_SUPPORTED_ENDPOINT_VERSION } from '../protection_notice_supported_endpoint_version';
import { useTestIdGenerator } from '../../../../../hooks/use_test_id_generator';
import { getEmptyValue } from '../../../../../../common/components/empty_value';
import { useEffectivePlatinumPlusForPolicyForm } from '../hooks/endpoint_policy_dev_preview';
import type { PolicyFormComponentCommonProps } from '../types';
import type { ImmutableArray, UIPolicyConfig } from '../../../../../../../common/endpoint/types';
import { ProtectionModes } from '../../../../../../../common/endpoint/types';
import type { PolicyProtection, MacPolicyProtection, LinuxPolicyProtection } from '../../../types';
import { useGetCustomNotificationUnavailableComponent } from '../hooks/use_get_custom_notification_unavailable_component';
import {
  NOTIFY_USER_CHECKBOX_LABEL,
  NOTIFICATION_MESSAGE_LABEL,
  CUSTOMIZE_NOTIFICATION_MESSAGE_LABEL,
} from './shared_translations';

export interface NotifyUserOptionProps extends PolicyFormComponentCommonProps {
  protection: PolicyProtection;
  osList: ImmutableArray<Partial<keyof UIPolicyConfig>>;
  /** When true (e.g. protection feature off), controls are non-interactive. */
  formDisabled?: boolean;
  /**
   * When false, omits the spacer and horizontal rule above "Notify user" (use when the parent
   * already rendered a divider after the preceding setting).
   */
  showTopSectionDivider?: boolean;
}

export const NotifyUserOption = React.memo(
  ({
    policy,
    onChange,
    mode,
    protection,
    osList,
    formDisabled = false,
    showTopSectionDivider = true,
    'data-test-subj': dataTestSubj,
  }: NotifyUserOptionProps) => {
    const isPlatinumPlus = useEffectivePlatinumPlusForPolicyForm();
    const getTestId = useTestIdGenerator(dataTestSubj);
    const CustomNotificationUpsellingComponent = useGetCustomNotificationUnavailableComponent();

    const isEditMode = mode === 'edit';
    const primaryOs = osList[0];
    const selected = policy[primaryOs][protection].mode;
    const userNotificationSelected = policy[primaryOs].popup[protection].enabled;
    const userNotificationMessage = policy[primaryOs].popup[protection].message;

    const supportedVersion =
      PROTECTION_NOTICE_SUPPORTED_ENDPOINT_VERSION[
        protection as keyof typeof PROTECTION_NOTICE_SUPPORTED_ENDPOINT_VERSION
      ];

    const handleUserNotificationSwitch = useCallback<NonNullable<EuiSwitchProps['onChange']>>(
      (event) => {
        const newPayload = cloneDeep(policy);

        for (const os of osList) {
          if (os === 'windows') {
            newPayload[os].popup[protection].enabled = event.target.checked;
          } else if (os === 'mac') {
            newPayload[os].popup[protection as MacPolicyProtection].enabled = event.target.checked;
          } else if (os === 'linux') {
            newPayload[os].popup[protection as LinuxPolicyProtection].enabled =
              event.target.checked;
          }
        }

        onChange({ isValid: true, updatedPolicy: newPayload });
      },
      [policy, onChange, osList, protection]
    );

    const handleCustomUserNotification = useCallback<NonNullable<EuiTextAreaProps['onChange']>>(
      (event) => {
        const newPayload = cloneDeep(policy);
        for (const os of osList) {
          if (os === 'windows') {
            newPayload[os].popup[protection].message = event.target.value;
          } else if (os === 'mac') {
            newPayload[os].popup[protection as MacPolicyProtection].message = event.target.value;
          } else if (os === 'linux') {
            newPayload[os].popup[protection as LinuxPolicyProtection].message = event.target.value;
          }
        }

        onChange({ isValid: true, updatedPolicy: newPayload });
      },
      [policy, onChange, osList, protection]
    );

    const tooltipProtectionText = useCallback((protectionType: PolicyProtection) => {
      if (protectionType === 'memory_protection') {
        return i18n.translate(
          'xpack.securitySolution.endpoint.policyDetail.memoryProtectionTooltip',
          {
            defaultMessage: 'memory threat',
          }
        );
      } else if (protectionType === 'behavior_protection') {
        return i18n.translate(
          'xpack.securitySolution.endpoint.policyDetail.behaviorProtectionTooltip',
          {
            defaultMessage: 'malicious behavior',
          }
        );
      } else {
        return protectionType;
      }
    }, []);

    const tooltipBracketText = useCallback((protectionType: PolicyProtection) => {
      if (protectionType === 'memory_protection' || protectionType === 'behavior_protection') {
        return i18n.translate('xpack.securitySolution.endpoint.policyDetail.rule', {
          defaultMessage: 'rule',
        });
      } else {
        return i18n.translate('xpack.securitySolution.endpoint.policyDetail.filename', {
          defaultMessage: 'filename',
        });
      }
    }, []);

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
              <EuiText
                size="s"
                data-test-subj={getTestId('customMessageTitle')}
                css={({ euiTheme }) => ({ fontWeight: euiTheme.font.weight.semiBold })}
              >
                {CUSTOMIZE_NOTIFICATION_MESSAGE_LABEL}
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
                      id="xpack.securitySolution.endpoint.policyDetailsConfig.notifyUserTooltip.a"
                      defaultMessage="Selecting the user notification option will display a notification to the host user when { protectionName } is prevented or detected."
                      values={{
                        protectionName: tooltipProtectionText(protection),
                      }}
                    />
                    <EuiSpacer size="m" />
                    <FormattedMessage
                      id="xpack.securitySolution.endpoint.policyDetailsConfig.notifyUserTooltip.c"
                      defaultMessage="
                      The user notification can be customized in the text box below. Bracketed tags can be used to dynamically populate the applicable action (such as prevented or detected) and the { bracketText }."
                      values={{
                        bracketText: tooltipBracketText(protection),
                      }}
                    />
                  </>
                }
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xs" />
          <EuiTextArea
            placeholder={i18n.translate(
              'xpack.securitySolution.endpoint.policyDetails.userNotification.placeholder',
              {
                defaultMessage: 'Input your custom notification message',
              }
            )}
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
      protection,
      tooltipBracketText,
      tooltipProtectionText,
      userNotificationMessage,
      userNotificationSelected,
      formDisabled,
    ]);

    if (!isPlatinumPlus) {
      return null;
    }

    const switchDisabled = !isEditMode || selected === ProtectionModes.off || formDisabled;

    return (
      <div data-test-subj={getTestId()}>
        {showTopSectionDivider ? (
          <>
            <EuiSpacer size="m" />
            <EuiHorizontalRule margin="m" data-test-subj={getTestId('sectionDivider')} />
          </>
        ) : null}

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
            {supportedVersion ? (
              <>
                <EuiSpacer size="xs" />
                <EuiText color="subdued" size="xs" data-test-subj={getTestId('supportedVersion')}>
                  <FormattedMessage
                    id="xpack.securitySolution.endpoint.policyDetailsConfig.notifyUserDescription"
                    defaultMessage="Enabling this will display a notification to the host user when {protectionName} is prevented or detected. The user notification can be customized once enabled. Supported on agent version {version} and beyond."
                    values={{
                      protectionName: tooltipProtectionText(protection),
                      version: supportedVersion,
                    }}
                  />
                </EuiText>
              </>
            ) : null}
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
NotifyUserOption.displayName = 'NotifyUserOption';
