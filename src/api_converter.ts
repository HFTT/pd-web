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
  decodeToTableId,
} from "~api"
import {
  PeerValue,
  RegionValue,
  PeerState,
  PeerError,
  PeerInAction,
} from "~components/region/peer-item"
import {
  StoreResp,
  OpStepResp,
  OperatorResp,
  PeerResp,
  RegionResp,
} from "~api_response"
import _ from "lodash"
import { string } from "prop-types"

type idToFlowBytes = { id: string; flowBytes: number }

export async function fetchStoreValues(): Promise<StoreValue[]> {
  const allStoreResps = await fetchAllStores()
  const allRegionResps = await fetchAllRegions()
  const allOps = await fetchAllOperators()
  const replicasNum = await fetchMaxReplicas()
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
    const x = writeHotData[storeId]
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

  let allRegVals: RegionValue[] = []

  const allStoreVals = allStoreResps.stores.map(sr => {
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

  allRegionResps.forEach(async (regionResp) => {
    const peersCount = (regionResp.peers || []).length

    const startKeyTableId = await decodeToTableId(regionResp.start_key)
    const endKeyTableId = await decodeToTableId(regionResp.end_key)
    const regionValue: RegionValue = {
      regionId: regionResp.id.toString(),
      startKey: startKeyTableId,
      endKey: endKeyTableId,
      regionSize: regionResp.approximate_keys || 0,
      peersCount,
    }
    allRegVals.push(regionValue)

    let errors: PeerError[] = []
    if (peersCount < replicasNum) {
      errors.push({
        type: "Missing Peer",
        peers: peersCount,
        expected: replicasNum,
      })
    } else if (peersCount > replicasNum) {
      errors.push({
        type: "Extra Peer",
        peers: peersCount,
        expected: replicasNum,
      })
    }
    const readHotRegion = readHotRegionSet.find(
      r => r.id === regionValue.regionId
    )
    if (readHotRegion != null) {
      errors.push({
        type: "Hot Read",
        flowBytes: readHotRegion.flowBytes,
      })
    }
    const writeHotRegion = writeHotRegionSet.find(
      w => w.id === regionValue.regionId
    )
    if (writeHotRegion != null) {
      errors.push({
        type: "Hot Write",
        flowBytes: writeHotRegion.flowBytes,
      })
    }

    const peers = regionResp.peers || []
    const op = allOps.find(
      op => op.region_id.toString() === regionValue.regionId
    )

    const inActions = getInActions(peers, regionResp, op)
    peers.forEach(p => {
      let peerState: PeerState = "Follower"
      if (p.is_learner) {
        peerState = "Learner"
      } else if (regionResp.leader && regionResp.leader.id === p.id) {
        peerState = "Leader"
      } else if ((regionResp.pending_peers || []).find(pd => pd.id === p.id)) {
        peerState = "Pending"
      }

      const inStore = p.store_id != null ? p.store_id.toString() : ""
      const pid = p.id ? p.id.toString() : ""
      const peerValue: PeerValue = {
        peerId: pid,
        peerState,
        region: regionValue,
        inActions: inActions[pid],
        errors,
        storeId: inStore,
      }

      const s = allStoreVals.find(s => s.storeId === inStore)
      if (s != null) {
        s.peers.push(peerValue)
      }
    })
  })

  for (const s of allStoreVals) {
    s.peers = s.peers.sort((a, b) =>
      Number(a.region.regionId) < Number(b.region.regionId) ? -1 : 1
    )
  }

  // special case for non existing peers
  for (const op of allOps) {
    for (const step of op.steps) {
      switch (step.type) {
        case "add_learner":
        case "add_light_peer":
        case "add_light_learner":
          const store = allStoreVals.find(
            store => store.storeId == step.to_store.toString()
          )
          const region = allRegVals.find(
            region => region.regionId == op.region_id.toString()
          )
          if (store != null && region != null) {
            const peer = store.peers.find(
              peer => peer.region.regionId == op.region_id.toString()
            )
            if (peer == null) {
              store.peers.push({
                peerId: step.peer_id.toString(),
                peerState: "Not Exists",
                region: region,
                inActions: [{ type: "Adding Learner" }],
                errors: [],
                storeId: store.storeId,
              })
            }
          }
          break
      }
    }
  }

  return allStoreVals.sort((a, b) => (a.storeId < b.storeId ? -1 : 1))
}

function containsEvictLeaderScheduler(
  schedulers: string[],
  storeId: string
): StoreScheduler {
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

function getInActions(
  peers: PeerResp[],
  rgResp: RegionResp,
  opResp?: OperatorResp
): { [peerId: string]: PeerInAction[] } {
  let inActions: { [peerId: string]: PeerInAction[] } = {}
  for (const p of peers) {
    inActions[_.defaultTo(p.id, 0).toString()] = []
  }
  if (opResp == null) {
    return inActions
  }
  opResp.steps.forEach(s => {
    switch (s.type) {
      case "add_learner":
      case "add_light_peer":
      case "add_light_learner":
        if (inActions[s.peer_id] != null) {
          inActions[s.peer_id].push({
            type: "Adding Learner",
          })
        }
      case "transfer_leader":
        if (inActions[s.to_store] != null) {
          inActions[s.to_store].push({
            type: "Transfer Leader",
            targetStore: s.to_store,
          })
        }
        const lid = getLeaderId(rgResp)
        if (lid != null) {
          inActions[lid].push({
            type: "Transfer Leader",
            targetStore: s.to_store,
          })
        }
        break
      case "promote_learner":
        if (inActions[s.peer_id] != null) {
          inActions[s.peer_id].push({
            type: "Promoting Learner",
          })
        }
        break
      case "remove_peer":
        const pid = getPeerId(s.from_store, peers)
        if (pid != null) {
          inActions[pid].push({
            type: "Removing",
          })
        }
        break
      case "merge_region":
        Object.keys(inActions).forEach(i => {
          inActions[i].push({
            type: "Merging",
            fromRegionId: s.from_region.id.toString(),
            toRegionId: s.to_region.id.toString(),
            isPassive: s.is_passive,
          })
        })
        break
      case "split_region":
        Object.keys(inActions).forEach(i => {
          inActions[i].push({
            type: "Spliting",
            startKey: s.start_key,
            endKey: s.end_key,
            policy: s.policy,
            splitKeys: s.split_keys,
          })
        })
        break
      default:
        break
    }
  })
  return inActions
}

function getPeerId(storeId: number, peers: PeerResp[]): string | undefined {
  for (const pr of peers) {
    if (pr.store_id != null && pr.store_id === storeId) {
      return _.defaultTo(pr.id, 0).toString()
    }
  }
}

function getLeaderId(regionResp: RegionResp): string | undefined {
  if (regionResp.leader != null && regionResp.leader.id != null) {
    return regionResp.leader.id.toString()
  }
}
