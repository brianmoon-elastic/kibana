/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { policyFactory } from '../../../../../../../common/endpoint/models/policy_config';
import {
  DeviceControlAccessLevel,
  ProtectionModes,
} from '../../../../../../../common/endpoint/types';
import {
  copyDeviceControlFromReferenceOs,
  copyMalwareSettingsFromReferenceOs,
  copyMemoryProtectionFromReferenceOs,
} from './copy_protection_os_settings_on_split';

describe('copyMalwareSettingsFromReferenceOs', () => {
  it('copies first policy OS malware + popup settings onto the others', () => {
    const policy = policyFactory();
    policy.mac.malware.mode = ProtectionModes.detect;
    policy.mac.popup.malware.message = 'mac-only';

    copyMalwareSettingsFromReferenceOs(policy, ['windows', 'mac', 'linux']);

    expect(policy.mac.malware.mode).toEqual(policy.windows.malware.mode);
    expect(policy.mac.popup.malware.message).toEqual(policy.windows.popup.malware.message);
    expect(policy.linux.malware.mode).toEqual(policy.windows.malware.mode);
  });

  it('uses the first OS in the list as the reference snapshot', () => {
    const policy = policyFactory();
    policy.mac.malware.mode = ProtectionModes.detect;
    policy.windows.malware.mode = ProtectionModes.prevent;

    copyMalwareSettingsFromReferenceOs(policy, ['mac', 'windows', 'linux']);

    expect(policy.windows.malware.mode).toBe(ProtectionModes.detect);
    expect(policy.linux.malware.mode).toBe(ProtectionModes.detect);
  });
});

describe('copyMemoryProtectionFromReferenceOs', () => {
  it('aligns memory protection across OSes from the reference key', () => {
    const policy = policyFactory();
    policy.linux.memory_protection.mode = ProtectionModes.detect;

    copyMemoryProtectionFromReferenceOs(policy, ['windows', 'mac', 'linux']);

    expect(policy.linux.memory_protection.mode).toEqual(policy.windows.memory_protection.mode);
  });
});

describe('copyDeviceControlFromReferenceOs', () => {
  it('copies device control from the first OS to the second', () => {
    const policy = policyFactory();
    if (!policy.windows.device_control || !policy.mac.device_control) {
      throw new Error('expected factory policy to include device_control');
    }
    policy.windows.device_control.usb_storage = DeviceControlAccessLevel.deny_all;
    policy.mac.device_control.usb_storage = DeviceControlAccessLevel.audit;

    copyDeviceControlFromReferenceOs(policy, ['windows', 'mac']);

    expect(policy.mac.device_control.usb_storage).toBe(DeviceControlAccessLevel.deny_all);
  });
});
