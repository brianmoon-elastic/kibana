/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { cloneDeep } from 'lodash';
import type { PolicyConfig, UIPolicyConfig } from '../../../../../../../common/endpoint/types';

type PolicyOsKey = keyof UIPolicyConfig;

/**
 * When the global OS toggle turns off, copy malware + popup.malware from the first
 * supported policy OS (tab order) onto every other supported OS.
 */
export const copyMalwareSettingsFromReferenceOs = (
  policy: PolicyConfig,
  supportedPolicyOses: readonly PolicyOsKey[]
): void => {
  if (supportedPolicyOses.length < 2) {
    return;
  }
  const refKey = supportedPolicyOses[0];
  const malwareSnapshot = cloneDeep(policy[refKey].malware);
  const popupMalwareSnapshot = cloneDeep(policy[refKey].popup.malware);

  for (let i = 1; i < supportedPolicyOses.length; i++) {
    const targetKey = supportedPolicyOses[i];
    policy[targetKey].malware = cloneDeep(malwareSnapshot);
    policy[targetKey].popup.malware = cloneDeep(popupMalwareSnapshot);
  }
};

/**
 * Same for memory threat protection.
 */
export const copyMemoryProtectionFromReferenceOs = (
  policy: PolicyConfig,
  supportedPolicyOses: readonly PolicyOsKey[]
): void => {
  if (supportedPolicyOses.length < 2) {
    return;
  }
  const refKey = supportedPolicyOses[0];
  const memorySnapshot = cloneDeep(policy[refKey].memory_protection);
  const popupSnapshot = cloneDeep(policy[refKey].popup.memory_protection);

  for (let i = 1; i < supportedPolicyOses.length; i++) {
    const targetKey = supportedPolicyOses[i];
    policy[targetKey].memory_protection = cloneDeep(memorySnapshot);
    policy[targetKey].popup.memory_protection = cloneDeep(popupSnapshot);
  }
};

export type DeviceControlPolicyOs = 'windows' | 'mac';

/**
 * Copy device_control + popup.device_control from the first OS (tab order) to the other.
 */
export const copyDeviceControlFromReferenceOs = (
  policy: PolicyConfig,
  supportedPolicyOses: readonly DeviceControlPolicyOs[]
): void => {
  if (supportedPolicyOses.length < 2) {
    return;
  }
  const refKey = supportedPolicyOses[0];
  const dcSnapshot = cloneDeep(policy[refKey].device_control);
  const popupDcSnapshot = policy[refKey].popup.device_control
    ? cloneDeep(policy[refKey].popup.device_control)
    : undefined;

  for (let i = 1; i < supportedPolicyOses.length; i++) {
    const targetKey = supportedPolicyOses[i];
    if (dcSnapshot) {
      policy[targetKey].device_control = cloneDeep(dcSnapshot);
    }
    if (popupDcSnapshot) {
      policy[targetKey].popup.device_control = cloneDeep(popupDcSnapshot);
    }
  }
};
