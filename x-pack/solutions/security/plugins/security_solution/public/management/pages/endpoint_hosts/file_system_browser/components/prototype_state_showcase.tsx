/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import {
  EuiBadge,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiPopover,
  EuiSelectable,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import type { FileSystemBrowserViewState } from '../types';

interface PrototypeStateShowcaseProps {
  readonly selectedState: FileSystemBrowserViewState;
  readonly onStateChange: (state: FileSystemBrowserViewState) => void;
}

const STATE_OPTIONS: Array<{ label: string; value: FileSystemBrowserViewState }> = [
  { label: 'Default (live data)', value: 'default' },
  { label: 'Loading contents', value: 'loading' },
  { label: 'Empty folder', value: 'empty_folder' },
  { label: 'Unable to load contents', value: 'load_error' },
  { label: 'No permission', value: 'no_permission' },
  { label: 'Endpoint offline', value: 'endpoint_offline' },
  { label: 'Request timed out', value: 'request_timed_out' },
  { label: 'Path no longer valid', value: 'path_invalid' },
  { label: 'Folder has changed', value: 'folder_changed' },
  { label: 'Searching…', value: 'searching' },
  { label: 'No search results', value: 'search_no_results' },
];

export const PrototypeStateShowcase = memo<PrototypeStateShowcaseProps>(
  ({ selectedState, onStateChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const selectedLabel = useMemo(
      () => STATE_OPTIONS.find((option) => option.value === selectedState)?.label ?? 'Default',
      [selectedState]
    );

    const options = useMemo(
      () =>
        STATE_OPTIONS.map((option) => ({
          label: option.label,
          checked: selectedState === option.value ? ('on' as const) : undefined,
          key: option.value,
        })),
      [selectedState]
    );

    return (
      <EuiPanel
        color="subdued"
        paddingSize="s"
        hasShadow={false}
        data-test-subj="fileSystemBrowserPrototypeShowcase"
      >
        <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiBadge color="accent">
              <FormattedMessage
                id="xpack.securitySolution.endpoint.fileSystemBrowser.prototypeBadge"
                defaultMessage="Prototype only"
              />
            </EuiBadge>
          </EuiFlexItem>
          <EuiFlexItem grow={true}>
            <EuiText size="s">
              <FormattedMessage
                id="xpack.securitySolution.endpoint.fileSystemBrowser.prototypeDescription"
                defaultMessage="Preview UI states for design review. This control will not ship in production."
              />
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiPopover
              isOpen={isOpen}
              closePopover={() => setIsOpen(false)}
              button={
                <EuiButtonEmpty
                  iconType="arrowDown"
                  iconSide="right"
                  onClick={() => setIsOpen((current) => !current)}
                  data-test-subj="fileSystemBrowserPrototypeStateTrigger"
                >
                  {selectedLabel}
                </EuiButtonEmpty>
              }
            >
              <div style={{ width: 280 }}>
                <EuiTitle size="xxs">
                  <h4>
                    {i18n.translate(
                      'xpack.securitySolution.endpoint.fileSystemBrowser.prototypeStateTitle',
                      { defaultMessage: 'Showcase view state' }
                    )}
                  </h4>
                </EuiTitle>
                <EuiFormRow fullWidth={true} hasEmptyLabelSpace={true}>
                  <EuiSelectable
                    options={options}
                    onChange={(nextOptions) => {
                      const selected = nextOptions.find((option) => option.checked === 'on');
                      if (selected?.key) {
                        onStateChange(selected.key as FileSystemBrowserViewState);
                      }
                      setIsOpen(false);
                    }}
                    singleSelection={true}
                    searchable={false}
                    listProps={{ bordered: true }}
                  >
                    {(list) => list}
                  </EuiSelectable>
                </EuiFormRow>
              </div>
            </EuiPopover>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }
);

PrototypeStateShowcase.displayName = 'PrototypeStateShowcase';
