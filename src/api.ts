import { async } from "q"

export const APIROOT = "http://localhost:2379/api/v1"
export const TANGENTA_APIROOT = "http://172.18.0.6:2379/pd/api/v1"
export const TANGENTA_REAL_PD = "http://127.0.0.1:2379/pd/api/v1"
export const GAUFOO_APIROOT = "http://172.18.0.7:2379/pd/api/v1"

type StoresResp = {
    count: number
    stores: StoreResp[]
}

type StoreResp = {
    store: {
        id: number
        address: string
        state_name: string
        version: string
    }
    status: {
        available: string
        capacity: string
        leader_count: number
        leader_weight: number
        leader_score: number
        leader_size: number
        region_count: number
        region_weight: number
        region_score: number
        region_size: number
        start_ts: string
        last_heartbeat_ts: string
        uptime: string
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

type PeerResp = {
    Id?: number
    StoreId?: number
    IsLearner?: boolean
}

export async function fetchStores(): Promise<StoresResp> {
    return await sendRequest(`${GAUFOO_APIROOT}/stores`, "GET")
}

export async function fetchAllRegions(): Promise<RegionResp[]> {
    return await sendRequest(`${GAUFOO_APIROOT}/regions`, "GET")
}

export async function fetchRegion(regionId: number): Promise<RegionResp> {
    return await sendRequest(`${TANGENTA_APIROOT}/region/id/${regionId}`, "GET")
}

export async function upStore(storeId: number): Promise<any> {
    return await sendRequest(`${GAUFOO_APIROOT}/store/${storeId}/state?state=Up`, "POST")
}

export async function deleteStore(storeId: number): Promise<any> {
    return await sendRequest(`${GAUFOO_APIROOT}/store/${storeId}`, "DELETE")
}

export async function transferLeader(regionId: number, toStoreId: number): Promise<void> {
    const body = {
        name: "transfer-leader",
        region_id: regionId,
        to_store_id: toStoreId,
    }
    const resp = await sendRequest(`${TANGENTA_APIROOT}/operators`, "POST", body)
    return resp
}

export async function addEvictLeaderScheduler(storeId: number): Promise<any> {
    return await sendRequest(`${TANGENTA_APIROOT}/schedulers`, "POST", {
        name: `evict-leader-scheduler`,
        store_id: storeId
    })
}

export async function removeEvictLeaderScheduler(storeId: number): Promise<any> {
    return await sendRequest(`${TANGENTA_APIROOT}/schedulers/evict-leader-scheduler-${storeId}`, "DELETE")
}

async function sendRequest(url: string, method: string, body?: any): Promise<any> {
    const res = await fetch(url, {
        method: method,
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    return res.json()
}