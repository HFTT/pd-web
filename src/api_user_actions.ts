import { StoreValue } from "~components/store/store-item";
import { StoreUserAction } from "~components/store/store-menu";
import { PeerValue } from "~components/region/peer-item";
import { PeerUserActionExtended } from "~components/store/store-list";
import { upStore, deleteStore, addEvictLeaderScheduler, removeEvictLeaderScheduler, addPeer, deletePeer, grantLeader, splitRegion, transferPeer, tombstoneStore } from "~api";

export async function storeUserAction(store: StoreValue, storeUserAction: StoreUserAction): Promise<void> {
    switch (storeUserAction) {
        case "Up":
            return upStore(store.storeId)
        case "Offline":
            return deleteStore(store.storeId)
        case "Tombstone":
            return tombstoneStore(store.storeId)
        case "Evict Leader":
            return addEvictLeaderScheduler(store.storeId)
        case "Stop Evict Leader":
            return removeEvictLeaderScheduler(store.storeId)
        default:
            return
    }
}

export async function peerUserAction(peer: PeerValue, peerUserAction: PeerUserActionExtended): Promise<void> {
    switch (peerUserAction.type) {
        case "Add Peer":
            return addPeer(peer.region.regionId, peerUserAction.addToStore.storeId)
        case "Transfer Peer":
            return transferPeer(peer.region.regionId, peer.storeId, peerUserAction.transferToStore.storeId)
        case "Delete Peer":
            return deletePeer(peer.region.regionId, peer.storeId)
        case "Grant Leader":
            return grantLeader(peer.region.regionId, peer.storeId)
        case "Split Region":
            return splitRegion(peer.region.regionId)
        default:
            return
    }
}