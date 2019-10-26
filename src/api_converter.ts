import {
  StoreValue,
  StoreState,
  StoreScheduler,
  StoreError,
} from "~components/store/store-item"
import {
  fetchAllOperators,
  fetchAllRegions,
  fetchAllStores,
  listSchedulers,
  fetchMaxReplicas,
  queryHotRead,
  queryHotWrite,
} from "~api"
import {
  PeerValue,
  RegionValue,
  PeerState,
  PeerError,
  PeerInAction,
} from "~components/region/peer-item"
import { StoreResp, OpStepResp, OperatorResp } from "~api_response"
import _ from "lodash"
import { string } from "prop-types"

type idToFlowBytes = { id: string; flowBytes: number }

export async function fetchStoreValues(): Promise<StoreValue[]> {
  const allStoreResp = await fetchAllStores()
  const allRegionResponse = await fetchAllRegions()
  const allOperators = await fetchAllOperators()
  const maxReplicas = await fetchMaxReplicas()
  const schedulers = await listSchedulers()

  const readHotData = await queryHotRead().then(r => {
    return r != null ? { ...(r.as_peer || {}), ...r.as_leader } : {}
  })
  const writeHotData = await queryHotWrite().then(r => {
    return r != null ? { ...(r.as_peer || {}), ...r.as_leader } : {}
  })

  let readHotRegionSet: idToFlowBytes[] = []
  let writeHotRegionSet: idToFlowBytes[] = []
  let readHotStoreSet: idToFlowBytes[] = []
  let writeHotStoreSet: idToFlowBytes[] = []
  Object.keys(readHotData).forEach(storeId => {
    const x = readHotData[storeId]
    readHotStoreSet.push({
      id: storeId,
      flowBytes: x.total_flow_bytes,
    })
    x.statistics.forEach(region => {
      readHotRegionSet.push({
        id: region.region_id.toString(),
        flowBytes: region.flow_bytes,
      })
    })
  })
  Object.keys(writeHotData).forEach(storeId => {
    const x = readHotData[storeId]
    writeHotStoreSet.push({
      id: storeId,
      flowBytes: x.total_flow_bytes,
    })
    x.statistics.forEach(region => {
      writeHotRegionSet.push({
        id: region.region_id.toString(),
        flowBytes: region.flow_bytes,
      })
    })
  })

  const storeValues = allStoreResp.stores.map(sr => {
    const storeId = _.defaultTo(sr.store.id, 0).toString()
    let storeValue: StoreValue = {
      storeId: storeId,
      capacity: _.defaultTo(sr.status.capacity, ""),
      available: _.defaultTo(sr.status.available, ""),

      address: _.defaultTo(sr.store.address, ""),
      tikvVersion: _.defaultTo(sr.store.version, ""),
      storeState: sr.store.state_name as StoreState,
      leaderCount: _.defaultTo(sr.status.leader_count, 0),
      leaderWeight: _.defaultTo(sr.status.leader_weight, 0),
      leaderScore: _.defaultTo(sr.status.leader_score, 0),
      leaderSize: _.defaultTo(sr.status.leader_size, 0),
      regionCount: _.defaultTo(sr.status.region_count, 0),
      regionWeight: _.defaultTo(sr.status.region_weight, 0),
      regionScore: _.defaultTo(sr.status.region_count, 0),
      regionSize: _.defaultTo(sr.status.region_size, 0),
      startTimestamp: _.defaultTo(sr.status.start_ts, ""),
      latestHeartbeatTimestamp: _.defaultTo(sr.status.last_heartbeat_ts, ""),
      uptime: _.defaultTo(sr.status.uptime, ""),

      schedulers: containsEvictLeaderScheduler(schedulers, storeId),
      errors: getStoreError(readHotStoreSet, writeHotStoreSet, sr),
      peers: [],
    }
    return storeValue
  })

  allRegionResponse.forEach(regionResp => {
    const peersCount = (regionResp.peers || []).length

    const regionValue: RegionValue = {
      regionId: regionResp.id.toString(),
      startKey: regionResp.start_key,
      endKey: regionResp.end_key,
      regionSize: regionResp.approximate_keys || 0,
      peersCount,
    }

    let errors: PeerError[] = []
    if (peersCount < maxReplicas) {
      errors.push({
        type: "Missing Peer",
        peers: peersCount,
        expected: maxReplicas,
      })
    } else if (peersCount > maxReplicas) {
      errors.push({
        type: "Extra Peer",
        peers: peersCount,
        expected: maxReplicas,
      })
    }
    for (const r of readHotRegionSet) {
      if (r.id === regionValue.regionId) {
        errors.push({
          type: "Hot Read",
          flowBytes: r.flowBytes,
        })
        break
      }
    }
    for (const w of writeHotRegionSet) {
      if (w.id === regionValue.regionId) {
        errors.push({
          type: "Hot Write",
          flowBytes: w.flowBytes,
        })
        break
      }
    }

    let inActions: PeerInAction[] = []
    for (const op of allOperators) {
      if (op.region_id.toString() === regionValue.regionId) {
        op.steps.forEach(s => {
          switch (s.type) {
            case "transfer_leader":
              inActions.push({
                type: "Transfer Leader",
                targetStore: s.to_store,
              })
              break
            case "add_learner":
              inActions.push({
                type: "Adding Learner",
              })
              break
            case "promote_learner":
              inActions.push({
                type: "Promoting Learner",
              })
              break
            case "remove_peer":
              inActions.push({
                type: "Removing",
              })
              break
            case "merge_region":
              inActions.push({
                type: "Merging",
                fromRegionId: s.from_region.id.toString(),
                toRegionId: s.to_region.id.toString(),
                isPassive: s.is_passive,
              })
              break
            case "split_region":
              inActions.push({
                type: "Spliting",
                startKey: s.start_key,
                endKey: s.end_key,
                policy: s.policy,
                splitKeys: s.split_keys,
              })
              break
            default:
              break
          }
        })
        break
      }
    }

    ; (regionResp.peers || []).forEach(p => {
      let peerState: PeerState = "Follower"
      if (p.is_learner) {
        peerState = "Learner"
      } else if (regionResp.leader && regionResp.leader.id === p.id) {
        peerState = "Leader"
      } else if ((regionResp.pending_peers || []).find(pd => pd.id === p.id)) {
        peerState = "Pending"
      }

      const peerValue: PeerValue = {
        peerId: p.id ? p.id.toString() : "",
        peerState,
        region: regionValue,
        inActions,
        errors,
      }

      const inStore = (p.store_id && p.store_id.toString()) || ""
      for (const s of storeValues) {
        if (s.storeId === inStore) {
          s.peers.push(peerValue)
          break
        }
      }
    })
  })

  for (const s of storeValues) {
    s.peers.sort((a, b) => Number(a.region.regionId) < Number(b.region.regionId) ? -1 : 1)
  }

  return storeValues.sort((a, b) => a.storeId < b.storeId ? -1 : 1)
}

function containsEvictLeaderScheduler(schedulers: string[], storeId: string): StoreScheduler {
  let found = false
  schedulers.forEach(s => {
    if (s.startsWith("evict-leader-scheduler") && s.endsWith(storeId)) {
      found = true
    }
  })
  return {
    evictingLeader: found,
  }
}

function getStoreError(
  readHotStoreSet: idToFlowBytes[],
  writeHotStoreSet: idToFlowBytes[],
  storeResp: StoreResp
): StoreError[] {
  const currentStoreId = _.defaultTo(storeResp.store.id, 0).toString()
  const storeState = storeResp.store.state_name as StoreState
  let storeErrs: StoreError[] = []
  for (const r of readHotStoreSet) {
    if (r.id === currentStoreId) {
      storeErrs.push({
        type: "Hot Read",
        flowBytes: r.flowBytes,
      })
      break
    }
  }
  for (const w of writeHotStoreSet) {
    if (w.id === currentStoreId) {
      storeErrs.push({
        type: "Hot Write",
        flowBytes: w.flowBytes,
      })
      break
    }
  }
  if (storeState === "Down") {
    storeErrs.push({
      type: "Store Down",
      downFrom: _.defaultTo(storeResp.status.last_heartbeat_ts, ""),
    })
  }
  if (storeState === "Offline") {
    storeErrs.push({
      type: "Store Offline",
      offlineFrom: _.defaultTo(storeResp.status.last_heartbeat_ts, ""),
    })
  }
  if (storeState === "Disconnected") {
    storeErrs.push({
      type: "Store Disconnected",
      disconnectedFrom: _.defaultTo(storeResp.status.last_heartbeat_ts, ""),
    })
  }

  return storeErrs
}
