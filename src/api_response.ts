export type StoresResp = {
  count: number
  stores: StoreResp[]
}

export type StoreResp = {
  store: {
    id?: number
    address?: string
    state_name?: string
    labels?: {
      key?: string
      value?: string
    }
    version?: string
  }
  status: {
    available?: string
    capacity?: string
    leader_count?: number
    leader_weight?: number
    leader_score?: number
    leader_size?: number
    region_count?: number
    region_weight?: number
    region_score?: number
    region_size?: number
    start_ts?: string
    last_heartbeat_ts?: string
    uptime?: string
  }
}

export type RegionResp = {
  id: number
  start_key: string
  end_key: string
  epoch?: {
    conf_ver?: number
    version?: number
  }
  peers?: PeerResp[]
  leader?: PeerResp
  down_peers?: {
    peer?: PeerResp
    down_second?: number
  }
  pending_peers?: PeerResp[]
  written_bytes?: number
  read_bytes?: number
  written_keys?: number
  read_keys?: number
  approximate_size?: number
  approximate_keys?: number
}

export type PeerResp = {
  id?: number
  store_id?: number
  is_learner?: boolean
}

export type StoreHotRegionInfosResp = {
  as_peer?: StoreHotRegionsStatResp
  as_leader: StoreHotRegionsStatResp
}

export type StoreHotRegionsStatResp = {
  [key: string]: /* store ID */ {
    total_flow_bytes: number
    regions_count: number
    statistics: HotPeerStatResp[]
  }
}

export type HotPeerStatResp = {
  store_id: number
  region_id: number
  hot_degree: number
  flow_bytes: number
  last_update_time: Date
}

export type OperatorResp = {
  region_id: number
  steps: OpStepResp[]
  // current_step: number
}

export type OpStepResp =
  | {
      type: "transfer_leader"
      from_store: number
      to_store: number
    }
  | {
      type: "add_learner"
      to_store: number
      peer_id: number
    }
  | {
      type: "promote_learner"
      to_store: number
      peer_id: number
    }
  | {
      type: "remove_peer"
      from_store: number
    }
  | {
      type: "merge_region"
      from_region: RegionResp
      to_region: RegionResp
      is_passive: boolean
    }
  | {
      type: "split_region"
      start_key: string
      end_key: string
      policy: string
      split_keys: string[]
    }
  | {
      type: "add_light_peer"
      to_store: number
      peer_id: number
    }
  | {
      type: "add_light_learner"
      to_store: number
      peer_id: number
    }
