/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AgentStatusRecords, HostInfo } from '../../../../common/endpoint/types';
import {
  HostPolicyResponseActionStatus,
  HostStatus,
} from '../../../../common/endpoint/types';

export const MOCK_PROTOTYPE_ENDPOINT_IDS = [
  'mock-endpoint-linux',
  'mock-endpoint-windows',
  'mock-endpoint-macos',
  'mock-endpoint-windows-2',
  'mock-endpoint-linux-2',
  'mock-endpoint-macos-2',
] as const;

export type MockPrototypeEndpointId = (typeof MOCK_PROTOTYPE_ENDPOINT_IDS)[number];

export const isMockPrototypeEndpointId = (endpointId: string): endpointId is MockPrototypeEndpointId =>
  (MOCK_PROTOTYPE_ENDPOINT_IDS as readonly string[]).includes(endpointId);

interface PrototypeEndpointConfig {
  readonly id: MockPrototypeEndpointId;
  readonly hostname: string;
  readonly osName: string;
  readonly hostStatus: HostStatus;
  readonly policyName: string;
  readonly agentVersion: string;
  readonly isolated?: boolean;
}

const PROTOTYPE_ENDPOINT_CONFIGS: readonly PrototypeEndpointConfig[] = [
  {
    id: 'mock-endpoint-linux',
    hostname: 'siem-linux-edge-sec-bis',
    osName: 'Linux',
    hostStatus: HostStatus.UNHEALTHY,
    policyName: 'Ubuntu-defend rev. 12',
    agentVersion: '9.4.1',
  },
  {
    id: 'mock-endpoint-windows-2',
    hostname: 'siem-windows-edge-sec',
    osName: 'Windows',
    hostStatus: HostStatus.INACTIVE,
    policyName: 'Elastic-Defend rev. 12',
    agentVersion: '9.4.2',
  },
  {
    id: 'mock-endpoint-macos',
    hostname: 'siem-macos-edge-sec',
    osName: 'macOS',
    hostStatus: HostStatus.HEALTHY,
    policyName: 'Elastic-Defend rev. 12',
    agentVersion: '9.4.3',
    isolated: true,
  },
  {
    id: 'mock-endpoint-windows',
    hostname: 'siem-windows-edge-sec-bis',
    osName: 'Windows',
    hostStatus: HostStatus.HEALTHY,
    policyName: 'Elastic-Defend rev. 12',
    agentVersion: '9.4.1',
  },
  {
    id: 'mock-endpoint-linux-2',
    hostname: 'siem-linux-edge-sec',
    osName: 'Linux',
    hostStatus: HostStatus.UPDATING,
    policyName: 'Ubuntu-defend rev. 12',
    agentVersion: '9.4.2',
  },
  {
    id: 'mock-endpoint-macos-2',
    hostname: 'siem-macos-edge-prod',
    osName: 'macOS',
    hostStatus: HostStatus.HEALTHY,
    policyName: 'Elastic-Defend rev. 12',
    agentVersion: '9.4.3',
  },
];

const MOCK_POLICY_ID = '00000000-0000-4000-8000-000000000001';
const LAST_CHECKIN = '2026-05-21T08:08:34.000Z';

const buildPrototypeEndpoint = (config: PrototypeEndpointConfig): HostInfo => {
  return {
    metadata: {
      '@timestamp': Date.parse(LAST_CHECKIN),
      host: {
        hostname: config.hostname,
        name: config.hostname,
        os: {
          name: config.osName,
        },
        ip: ['127.0.0.1', '::1', '10.128.0.68', 'fe80::4001:aff:fe80:44'],
      },
      agent: {
        id: config.id,
        version: config.agentVersion,
      },
      elastic: {
        agent: {
          id: `${config.id}-fleet`,
        },
      },
      Endpoint: {
        policy: {
          applied: {
            id: MOCK_POLICY_ID,
            name: config.policyName,
            status: HostPolicyResponseActionStatus.success,
            endpoint_policy_version: 12,
            version: 12,
          },
        },
        ...(config.isolated
          ? {
              configuration: {
                isolation: true,
              },
              state: {
                isolation: true,
              },
            }
          : {}),
      },
    },
    host_status: config.hostStatus,
    last_checkin: LAST_CHECKIN,
    policy_info: {
      agent: {
        configured: { id: MOCK_POLICY_ID, revision: 12 },
        applied: { id: MOCK_POLICY_ID, revision: 12 },
      },
      endpoint: { id: MOCK_POLICY_ID, revision: 12 },
    },
  } as HostInfo;
};

export const getMockPrototypeEndpointList = (): HostInfo[] =>
  PROTOTYPE_ENDPOINT_CONFIGS.map(buildPrototypeEndpoint);

export const getMockAgentStatusRecords = (endpoints: readonly HostInfo[]): AgentStatusRecords => {
  return endpoints.reduce<AgentStatusRecords>((records, endpoint) => {
    const agentId = endpoint.metadata.agent.id;

    records[agentId] = {
      agentId,
      agentType: 'endpoint',
      found: true,
      isolated: Boolean(endpoint.metadata.Endpoint.state?.isolation),
      lastSeen: endpoint.last_checkin ?? LAST_CHECKIN,
      pendingActions: {},
      status: endpoint.host_status,
    };

    return records;
  }, {});
};
