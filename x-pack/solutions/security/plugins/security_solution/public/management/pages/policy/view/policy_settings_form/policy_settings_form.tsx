/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useState } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { useIsExperimentalFeatureEnabled } from '../../../../../common/hooks/use_experimental_features';
import { useKibana } from '../../../../../common/lib/kibana';
import { updateAntivirusRegistrationEnabled } from '../../../../../../common/endpoint/utils/update_antivirus_registration_enabled';
import { useGetProtectionsUnavailableComponent } from './hooks/use_get_protections_unavailable_component';
import { EventMergingBanner } from './components/event_merging_banner';
import { RelatedDetectionRulesCallout } from './components/related_detection_rules_callout';
import { AdvancedSection } from './components/advanced_section';
import { useTestIdGenerator } from '../../../../hooks/use_test_id_generator';
import { useGetDeviceControlUpsellComponent } from './hooks/use_get_device_control_component';
import { isEndpointPolicyDevPreviewEnabled } from './hooks/endpoint_policy_dev_preview';

// Redesigned cards
import { MalwareCard } from './components/cards/redesigned/malware_card';
import { AntivirusSection } from './components/cards/redesigned/antivirus_section';
import { RansomwareCard } from './components/cards/redesigned/ransomware_card';
import { MemoryCard } from './components/cards/redesigned/memory_card';
import { DeviceControlCardRedesigned } from './components/cards/redesigned/device_control_card';
import { AttackSurfaceReductionCardRedesigned } from './components/cards/redesigned/attack_surface_reduction_card';
import { EventCollectionSection } from './components/event_collection_section';

import type { PolicyFormComponentCommonProps } from './types';

export type PolicySettingsFormProps = PolicyFormComponentCommonProps;

export const PolicySettingsForm = memo<PolicySettingsFormProps>((props) => {
  const getTestId = useTestIdGenerator(props['data-test-subj']);
  const ProtectionsUpSellingComponent = useGetProtectionsUnavailableComponent();
  const DeviceControlUpSellingComponent = useGetDeviceControlUpsellComponent();
  const devPolicyPreview = isEndpointPolicyDevPreviewEnabled();
  const showProtectionsDespiteUpsell = devPolicyPreview;

  const { storage } = useKibana().services;

  const trustedDevices = useIsExperimentalFeatureEnabled('trustedDevices');

  const [showEventMergingBanner, setShowEventMergingBanner] = useState(
    storage.get('securitySolution.showEventMergingBanner') ?? true
  );
  const onBannerDismiss = useCallback(() => {
    setShowEventMergingBanner(false);
    storage.set('securitySolution.showEventMergingBanner', false);
  }, [storage]);

  const onChangeProxy: PolicySettingsFormProps['onChange'] = ({ isValid, updatedPolicy }) => {
    updateAntivirusRegistrationEnabled(updatedPolicy);
    props.onChange({ isValid, updatedPolicy });
  };

  const renderDeviceControlSection = () => {
    if (!trustedDevices) {
      return null;
    }
    return (
      <>
        {DeviceControlUpSellingComponent && !devPolicyPreview ? (
          <DeviceControlUpSellingComponent />
        ) : (
          <DeviceControlCardRedesigned {...props} data-test-subj={getTestId('deviceControl')} />
        )}
        <EuiSpacer size="l" />
      </>
    );
  };

  return (
    <div data-test-subj={getTestId()}>
      {showEventMergingBanner && (
        <>
          <EventMergingBanner onDismiss={onBannerDismiss} />
          <EuiSpacer size="s" />
        </>
      )}

      {ProtectionsUpSellingComponent && !showProtectionsDespiteUpsell ? (
        <>
          <EuiSpacer size="m" />
          <ProtectionsUpSellingComponent />
          <EuiSpacer size="l" />
        </>
      ) : (
        <>
          <RelatedDetectionRulesCallout />
          <EuiSpacer size="l" />

          <MalwareCard {...props} onChange={onChangeProxy} data-test-subj={getTestId('malware')} />
          <EuiSpacer size="l" />

          <AntivirusSection
            {...props}
            onChange={onChangeProxy}
            data-test-subj={getTestId('antivirusSection')}
          />
          <EuiSpacer size="l" />

          <RansomwareCard
            {...props}
            onChange={onChangeProxy}
            data-test-subj={getTestId('ransomware')}
          />
          <EuiSpacer size="l" />

          <MemoryCard {...props} onChange={onChangeProxy} data-test-subj={getTestId('memory')} />
          <EuiSpacer size="l" />

          {renderDeviceControlSection()}

          <AttackSurfaceReductionCardRedesigned
            {...props}
            data-test-subj={getTestId('attackSurface')}
          />
          <EuiSpacer size="l" />
        </>
      )}

      <EventCollectionSection {...props} data-test-subj={getTestId('eventCollection')} />
      <EuiSpacer size="m" />

      <AdvancedSection {...props} data-test-subj={getTestId('advancedSection')} />
    </div>
  );
});
PolicySettingsForm.displayName = 'PolicySettingsForm';
