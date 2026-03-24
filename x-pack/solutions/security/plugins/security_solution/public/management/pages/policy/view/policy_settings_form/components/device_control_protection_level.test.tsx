/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { cloneDeep } from 'lodash';
import { fireEvent, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import type { AppContextTestRender } from '../../../../../../common/mock/endpoint';
import { createAppRootMockRenderer } from '../../../../../../common/mock/endpoint';
import { FleetPackagePolicyGenerator } from '../../../../../../../common/endpoint/data_generators/fleet_package_policy_generator';
import { DeviceControlAccessLevel as DeviceControlAccessLevelEnum } from '../../../../../../../common/endpoint/types';
import { expectIsViewOnly } from '../mocks';
import type { DeviceControlProtectionLevelProps } from './device_control_protection_level';
import { DeviceControlProtectionLevel } from './device_control_protection_level';

describe('Policy form DeviceControlProtectionLevel component', () => {
  let formProps: DeviceControlProtectionLevelProps;
  let render: () => ReturnType<AppContextTestRender['render']>;
  let renderResult: ReturnType<typeof render>;

  const selectAccessLevel = async (optionTestId: string) => {
    fireEvent.click(renderResult.getByTestId('test-select'));
    const listbox = await screen.findByRole('listbox');
    fireEvent.click(within(listbox).getByTestId(optionTestId));
    await waitForElementToBeRemoved(listbox);
  };

  beforeEach(() => {
    const mockedContext = createAppRootMockRenderer();
    const policy = new FleetPackagePolicyGenerator('seed').generateEndpointPackagePolicy().inputs[0]
      .config.policy.value;

    policy.windows.device_control = {
      enabled: true,
      usb_storage: DeviceControlAccessLevelEnum.deny_all,
    };
    policy.mac.device_control = {
      enabled: true,
      usb_storage: DeviceControlAccessLevelEnum.deny_all,
    };

    formProps = {
      policy,
      onChange: jest.fn(),
      mode: 'edit',
      'data-test-subj': 'test',
      osList: ['windows', 'mac'],
    };

    render = () => {
      renderResult = mockedContext.render(<DeviceControlProtectionLevel {...formProps} />);
      return renderResult;
    };
  });

  it('should render expected super select control', () => {
    const { getByTestId } = render();
    expect(getByTestId('test-select'));
  });

  it('should allow audit mode to be selected', async () => {
    const expectedPolicyUpdate = cloneDeep(formProps.policy);
    expectedPolicyUpdate.windows.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
    expectedPolicyUpdate.mac.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
    if (expectedPolicyUpdate.windows.popup.device_control) {
      expectedPolicyUpdate.windows.popup.device_control.enabled = false;
    }
    if (expectedPolicyUpdate.mac.popup.device_control) {
      expectedPolicyUpdate.mac.popup.device_control.enabled = false;
    }

    render();

    await selectAccessLevel('test-option-audit');

    expect(formProps.onChange).toHaveBeenCalledWith({
      isValid: true,
      updatedPolicy: expectedPolicyUpdate,
    });
  });

  it('should disable notifications when switching from deny_all to audit', async () => {
    formProps.policy.windows.popup.device_control = {
      enabled: true,
      message: 'Test message',
    };
    formProps.policy.mac.popup.device_control = {
      enabled: true,
      message: 'Test message',
    };

    const expectedPolicyUpdate = cloneDeep(formProps.policy);
    expectedPolicyUpdate.windows.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
    expectedPolicyUpdate.mac.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
    expectedPolicyUpdate.windows.popup.device_control!.enabled = false;
    expectedPolicyUpdate.mac.popup.device_control!.enabled = false;

    render();

    await selectAccessLevel('test-option-audit');

    expect(formProps.onChange).toHaveBeenCalledWith({
      isValid: true,
      updatedPolicy: expectedPolicyUpdate,
    });
  });

  it('should allow block mode to be selected and enable notifications by default', async () => {
    formProps.policy.windows.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
    formProps.policy.mac.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
    formProps.policy.windows.popup.device_control = {
      enabled: false,
      message: 'Test message',
    };
    formProps.policy.mac.popup.device_control = {
      enabled: false,
      message: 'Test message',
    };

    const expectedPolicyUpdate = cloneDeep(formProps.policy);
    expectedPolicyUpdate.windows.device_control!.usb_storage =
      DeviceControlAccessLevelEnum.deny_all;
    expectedPolicyUpdate.mac.device_control!.usb_storage = DeviceControlAccessLevelEnum.deny_all;
    expectedPolicyUpdate.windows.popup.device_control!.enabled = true;
    expectedPolicyUpdate.mac.popup.device_control!.enabled = true;

    render();

    await selectAccessLevel('test-option-deny_all');

    expect(formProps.onChange).toHaveBeenCalledWith({
      isValid: true,
      updatedPolicy: expectedPolicyUpdate,
    });
  });

  describe('and rendered in View mode', () => {
    beforeEach(() => {
      formProps.mode = 'view';
    });

    it('should display block', () => {
      render();

      expectIsViewOnly(renderResult.getByTestId('test'));
      expect(renderResult.getByTestId('test-viewValue')).toHaveTextContent('Block all');
    });

    it('should display audit', () => {
      formProps.policy.windows.device_control!.usb_storage = DeviceControlAccessLevelEnum.audit;
      render();

      expectIsViewOnly(renderResult.getByTestId('test'));
      expect(renderResult.getByTestId('test-viewValue')).toHaveTextContent(
        'Read, write, and execute'
      );
    });

    it('should not render super select', () => {
      render();

      expect(renderResult.queryByTestId('test-select')).toBeNull();
    });
  });
});
