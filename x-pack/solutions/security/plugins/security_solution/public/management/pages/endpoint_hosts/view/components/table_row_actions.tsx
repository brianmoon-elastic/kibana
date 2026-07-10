/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import type { EuiContextMenuPanelProps, EuiPopoverProps } from '@elastic/eui';
import {
  EuiBadge,
  EuiButtonIcon,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPopover,
  EuiToolTip,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { ContextMenuItemNavByRouter } from '../../../../components/context_menu_with_router_support/context_menu_item_nav_by_router';
import type { HostInfo } from '../../../../../../common/endpoint/types';
import { useIsExperimentalFeatureEnabled } from '../../../../../common/hooks/use_experimental_features';
import { useEndpointActionItems } from '../hooks';

export interface TableRowActionProps {
  endpointInfo: HostInfo;
}

const renderMenuItem = (
  itemProps: ReturnType<typeof useEndpointActionItems>[number],
  handleCloseMenu: () => void
) => {
  const isBrowseFilesItem = itemProps.key === 'browseFilesLink';

  return (
    <ContextMenuItemNavByRouter
      {...itemProps}
      onClick={(ev) => {
        handleCloseMenu();
        if (itemProps.onClick) {
          itemProps.onClick(ev);
        }
      }}
    >
      {isBrowseFilesItem ? (
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" gutterSize="s">
          <EuiFlexItem grow={false}>{itemProps.children}</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiBadge color="primary">
              <FormattedMessage
                id="xpack.securitySolution.endpoint.actions.browseFilesNewBadge"
                defaultMessage="New"
              />
            </EuiBadge>
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        itemProps.children
      )}
    </ContextMenuItemNavByRouter>
  );
};

export const TableRowActions = memo<TableRowActionProps>(({ endpointInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const endpointActions = useEndpointActionItems(endpointInfo, { isEndpointList: true });
  const isFileSystemBrowserEnabled = useIsExperimentalFeatureEnabled(
    'responseActionsFileSystemBrowser'
  );

  const handleCloseMenu = useCallback(() => setIsOpen(false), []);
  const handleToggleMenu = useCallback(() => setIsOpen((current) => !current), []);

  const menuItems: EuiContextMenuPanelProps['items'] = useMemo(() => {
    if (!isFileSystemBrowserEnabled) {
      return endpointActions.map((itemProps) => renderMenuItem(itemProps, handleCloseMenu));
    }

    const responseKeys = new Set([
      'isolateHost',
      'unIsolateHost',
      'consoleLink',
      'browseFilesLink',
    ]);
    const investigateKeys = new Set(['actionsLogLink', 'hostDetailsLink']);
    const agentKeys = new Set(['agentConfigLink', 'agentDetailsLink', 'agentPolicyReassignLink']);

    const responseItems = endpointActions.filter((item) => responseKeys.has(String(item.key)));
    const investigateItems = endpointActions.filter((item) =>
      investigateKeys.has(String(item.key))
    );
    const agentItems = endpointActions.filter((item) => agentKeys.has(String(item.key)));

    const groupedItems: EuiContextMenuPanelProps['items'] = [];
    let sectionCount = 0;

    const pushSection = (key: string, title: React.ReactNode, items: typeof endpointActions) => {
      if (items.length === 0) {
        return;
      }

      if (sectionCount > 0) {
        groupedItems.push(<EuiHorizontalRule key={`${key}-divider`} margin="none" />);
      }

      sectionCount += 1;

      groupedItems.push(
        <EuiContextMenuItem key={`${key}-title`} disabled={true} style={{ cursor: 'default' }}>
          <strong>{title}</strong>
        </EuiContextMenuItem>
      );
      groupedItems.push(...items.map((itemProps) => renderMenuItem(itemProps, handleCloseMenu)));
    };

    pushSection(
      'response',
      <FormattedMessage
        id="xpack.securitySolution.endpoint.actions.responseSection"
        defaultMessage="Response"
      />,
      responseItems
    );
    pushSection(
      'investigate',
      <FormattedMessage
        id="xpack.securitySolution.endpoint.actions.investigateSection"
        defaultMessage="Investigate"
      />,
      investigateItems
    );
    pushSection(
      'agent',
      <FormattedMessage
        id="xpack.securitySolution.endpoint.actions.agentSection"
        defaultMessage="Agent"
      />,
      agentItems
    );

    return groupedItems;
  }, [endpointActions, handleCloseMenu, isFileSystemBrowserEnabled]);

  const panelProps: EuiPopoverProps['panelProps'] = useMemo(() => {
    return { 'data-test-subj': 'tableRowActionsMenuPanel' };
  }, []);

  return (
    <EuiPopover
      anchorPosition="downRight"
      panelPaddingSize="none"
      panelProps={panelProps}
      button={
        <EuiToolTip
          content={i18n.translate('xpack.securitySolution.endpoint.list.actionmenu', {
            defaultMessage: 'Open',
          })}
          disableScreenReaderOutput
        >
          <EuiButtonIcon
            data-test-subj="endpointTableRowActions"
            iconType="boxesVertical"
            onClick={handleToggleMenu}
            aria-label={i18n.translate('xpack.securitySolution.endpoint.list.actionmenu', {
              defaultMessage: 'Open',
            })}
          />
        </EuiToolTip>
      }
      isOpen={isOpen}
      closePopover={handleCloseMenu}
      aria-label={i18n.translate(
        'xpack.securitySolution.endpoint.list.actionmenu.popover.ariaLabel',
        { defaultMessage: 'Endpoint row actions' }
      )}
    >
      <EuiContextMenuPanel items={menuItems} />
    </EuiPopover>
  );
});
TableRowActions.displayName = 'EndpointTableRowActions';
