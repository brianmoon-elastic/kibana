/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useContext } from 'react';
import type { EuiSwitchProps } from '@elastic/eui';
import { EuiSwitch } from '@elastic/eui';
import { cloneDeep } from 'lodash';
import { useTestIdGenerator } from '../../../../../hooks/use_test_id_generator';
import type { PolicyFormComponentCommonProps } from '../types';
import type {
  ImmutableArray,
  PolicyConfig,
  UIPolicyConfig,
} from '../../../../../../../common/endpoint/types';
import { ProtectionModes } from '../../../../../../../common/endpoint/types';
import type { LinuxPolicyProtection, MacPolicyProtection, PolicyProtection } from '../../../types';
import { PreservedProtectionModesContext } from './preserved_protection_modes_context';

const readProtectionMode = (
  policyConfig: PolicyConfig,
  os: Partial<keyof UIPolicyConfig>,
  protection: PolicyProtection
): ProtectionModes => {
  if (os === 'windows') {
    return policyConfig[os][protection].mode;
  }
  if (os === 'mac') {
    return policyConfig[os][protection as MacPolicyProtection].mode;
  }
  return policyConfig[os][protection as LinuxPolicyProtection].mode;
};

const writeProtectionMode = (
  policyConfig: PolicyConfig,
  os: Partial<keyof UIPolicyConfig>,
  protection: PolicyProtection,
  nextMode: ProtectionModes
): void => {
  if (os === 'windows') {
    policyConfig[os][protection].mode = nextMode;
  } else if (os === 'mac') {
    policyConfig[os][protection as MacPolicyProtection].mode = nextMode;
  } else if (os === 'linux') {
    policyConfig[os][protection as LinuxPolicyProtection].mode = nextMode;
  }
};

export interface ProtectionSettingCardSwitchProps extends PolicyFormComponentCommonProps {
  protection: PolicyProtection;
  selected: boolean;
  protectionLabel?: string;
  /** When false, only the switch is shown (label is still provided for accessibility). Use beside the card title. */
  showVisibleLabel?: boolean;
  osList: ImmutableArray<Partial<keyof UIPolicyConfig>>;
  additionalOnSwitchChange?: ({
    value,
    policyConfigData,
    protectionOsList,
  }: {
    value: boolean;
    policyConfigData: PolicyConfig;
    protectionOsList: ImmutableArray<Partial<keyof UIPolicyConfig>>;
  }) => PolicyConfig;
}

export const ProtectionSettingCardSwitch = React.memo(
  ({
    protection,
    protectionLabel,
    showVisibleLabel = true,
    osList,
    additionalOnSwitchChange,
    onChange,
    policy,
    mode,
    selected,
    'data-test-subj': dataTestSubj,
  }: ProtectionSettingCardSwitchProps) => {
    const getTestId = useTestIdGenerator(dataTestSubj);
    const isEditMode = mode === 'edit';
    const preservedModesRef = useContext(PreservedProtectionModesContext);

    const handleSwitchChange = useCallback<EuiSwitchProps['onChange']>(
      (event) => {
        const newPayload = cloneDeep(policy);

        if (!event.target.checked) {
          for (const os of osList) {
            const currentMode = readProtectionMode(newPayload, os, protection);
            if (preservedModesRef?.current && currentMode !== ProtectionModes.off) {
              preservedModesRef.current[os as keyof UIPolicyConfig] = currentMode;
            }
            writeProtectionMode(newPayload, os, protection, ProtectionModes.off);
          }
        } else {
          for (const os of osList) {
            const restored =
              preservedModesRef?.current?.[os as keyof UIPolicyConfig] ?? ProtectionModes.prevent;
            if (preservedModesRef?.current) {
              delete preservedModesRef.current[os as keyof UIPolicyConfig];
            }
            writeProtectionMode(newPayload, os, protection, restored);
          }
        }

        onChange({
          isValid: true,
          updatedPolicy: additionalOnSwitchChange
            ? additionalOnSwitchChange({
                value: event.target.checked,
                policyConfigData: newPayload,
                protectionOsList: osList,
              })
            : newPayload,
        });
      },
      [policy, onChange, additionalOnSwitchChange, osList, protection, preservedModesRef]
    );

    return (
      <EuiSwitch
        label={protectionLabel ?? ''}
        showLabel={showVisibleLabel}
        {...(showVisibleLabel ? { labelProps: { 'data-test-subj': getTestId('label') } } : {})}
        checked={selected}
        disabled={!isEditMode}
        onChange={handleSwitchChange}
        data-test-subj={getTestId()}
      />
    );
  }
);

ProtectionSettingCardSwitch.displayName = 'ProtectionSettingCardSwitch';
