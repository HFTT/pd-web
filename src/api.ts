import { async } from "q"
import { OperatorResp, StoresResp, RegionResp, StoreHotRegionInfosResp } from "~api_response"

export const APIROOT = "http://localhost:2379/pd/api/v1"
export const DECODEAPI = "http://localhost:4321"
// export const APIROOT = "http://172.18.0.6:2379/pd/api/v1"
// export const APIROOT = "http://127.0.0.1:2379/pd/api/v1"

export async function fetchAllStores(): Promise<StoresResp> {
    return sendRequest(`${APIROOT}/stores`, "GET")
}

export async function fetchAllRegions(): Promise<RegionResp[]> {
    return sendRequest(`${APIROOT}/regions`, "GET").then(r => r.regions)
}

export async function fetchRegion(regionId: number): Promise<RegionResp> {
    return sendRequest(`${APIROOT}/region/id/${regionId}`, "GET")
}

export async function fetchMaxReplicas(): Promise<number> {
    return sendRequest(`${APIROOT}/config/replicate`, "GET").then(v => v["max-replicas"])
}

export async function fetchAllOperators(): Promise<OperatorResp[]> {
    return sendRequest(`${APIROOT}/operators`, "GET")
}

export async function upStore(storeId: string): Promise<any> {
    return sendRequest(`${APIROOT}/store/${storeId}/state?state=Up`, "POST")
}

export async function deleteStore(storeId: string): Promise<any> {
    return sendRequest(`${APIROOT}/store/${storeId}`, "DELETE")
}

export async function tombstoneStore(storeId: string): Promise<any> {
    return sendRequest(`${APIROOT}/store/${storeId}/state?state=Tombstone`, "POST")
}

export async function addPeer(regionId: string, toStoreId: string): Promise<any> {
    const body = {
        name: "add-peer",
        region_id: Number(regionId),
        to_store_id: Number(toStoreId),
    }
    return sendRequest(`${APIROOT}/operators`, "POST", body)
}

export async function deletePeer(regionId: string, fromStoreId: string): Promise<any> {
    const body = {
        name: "remove-peer",
        region_id: Number(regionId),
        store_id: Number(fromStoreId),
    }
    return sendRequest(`${APIROOT}/operators`, "POST", body)
}

export async function grantLeader(regionId: string, StoreId: string): Promise<any> {
    const body = {
        name: "transfer-leader",
        region_id: Number(regionId),
        to_store_id: Number(StoreId),
    }
    return sendRequest(`${APIROOT}/operators`, "POST", body)
}

export async function transferPeer(regionId: string, fromStoreId: string, toStoreId: string): Promise<any> {
    const body = {
        name: "transfer-peer",
        region_id: Number(regionId),
        from_store_id: Number(fromStoreId),
        to_store_id: Number(toStoreId),
    }
    return sendRequest(`${APIROOT}/operators`, "POST", body)
}

export async function transferLeader(regionId: number, toStoreId: number): Promise<void> {
    const body = {
        name: "transfer-leader",
        region_id: regionId,
        to_store_id: toStoreId,
    }
    return sendRequest(`${APIROOT}/operators`, "POST", body)
}

export async function splitRegion(regionId: string): Promise<void> {
    return sendRequest(`${APIROOT}/operators`, "POST", {
        name: "split-region",
        region_id: Number(regionId),
        policy: "scan"
    })
}

export async function addEvictLeaderScheduler(storeId: string): Promise<any> {
    return sendRequest(`${APIROOT}/schedulers`, "POST", {
        name: `evict-leader-scheduler`,
        store_id: Number(storeId)
    })
}

export async function removeEvictLeaderScheduler(storeId: string): Promise<any> {
    return sendRequest(`${APIROOT}/schedulers/evict-leader-scheduler-${storeId}`, "DELETE")
}

export async function listSchedulers(): Promise<string[]> {
    return sendRequest(`${APIROOT}/schedulers`, "GET")
}

export async function queryHotRead(): Promise<StoreHotRegionInfosResp> {
    return sendRequest(`${APIROOT}/hotspot/regions/read`, "GET")    
}

export async function queryHotWrite(): Promise<StoreHotRegionInfosResp> {
    return sendRequest(`${APIROOT}/hotspot/regions/write`, "GET")    
}

export async function decodeToTableId(key: string): Promise<string> {
    return sendRequest(`${DECODEAPI}?decode-table-id=${key}`, "GET")
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