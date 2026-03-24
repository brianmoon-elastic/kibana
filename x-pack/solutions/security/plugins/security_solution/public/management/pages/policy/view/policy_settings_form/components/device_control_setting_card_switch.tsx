/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback } from 'react';
import type { EuiSwitchProps } from '@elastic/eui';
import { EuiSwitch } from '@elastic/eui';
import { cloneDeep } from 'lodash';
import { useTestIdGenerator } from '../../../../../hooks/use_test_id_generator';
import type { PolicyFormComponentCommonProps } from '../types';
import type { ImmutableArray } from '../../../../../../../common/endpoint/types';
import type { DeviceControlOSes } from '../../../types';

export interface DeviceControlSettingCardSwitchProps extends PolicyFormComponentCommonProps {
  selected: boolean;
  protectionLabel?: string;
  /** When false, only the switch is shown (label remains for accessibility). Use beside the card title. */
  showVisibleLabel?: boolean;
  osList: ImmutableArray<DeviceControlOSes>;
}

export const DeviceControlSettingCardSwitch = React.memo(
  ({
    protectionLabel,
    showVisibleLabel = true,
    osList,
    onChange,
    policy,
    mode,
    selected,
    'data-test-subj': dataTestSubj,
  }: DeviceControlSettingCardSwitchProps) => {
    const getTestId = useTestIdGenerator(dataTestSubj);
    const isEditMode = mode === 'edit';

    const handleSwitchChange = useCallback<EuiSwitchProps['onChange']>(
      (event) => {
        const newPayload = cloneDeep(policy);

        for (const os of osList) {
          const existing = newPayload[os].device_control;
          if (existing) {
            newPayload[os].device_control = {
              ...cloneDeep(existing),
              enabled: event.target.checked,
            };
          }
        }

        onChange({
          isValid: true,
          updatedPolicy: newPayload,
        });
      },
      [policy, onChange, osList]
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

DeviceControlSettingCardSwitch.displayName = 'DeviceControlSettingCardSwitch';
