import { PeerValue } from "~components/region/peer-item"
import { StoreValue } from "~components/store/store-item"
import _ from "lodash"

export const dummyRegion = {
  regionId: "22134231",
  startKey: "1820000092123",
  endKey: "1932300000349",
  regionSize: "12M kvs",
  peersCount: 2,
}

const genDummyRegion = () => ({
  regionId: (Math.ceil(Math.random() * 7) + 22222).toString(),
  startKey: "1820000092123",
  endKey: "1932300000349",
  regionSize: "12M kvs",
  peersCount: 2,
})

export const dummyPeer: PeerValue = {
  peerId: "22134231",
  peerState: "Leader",
  inActions: [{ type: "Adding" }],
  errors: [{ type: "Missing Peer", peers: 2, expected: 3 }],
  region: dummyRegion,
}

const genDummyPeer = (n: number) =>
  new Array(n).fill(null).map(() => ({
    peerId: Math.ceil(Math.random() * 40).toString(),
    peerState: "Leader",
    inActions: [{ type: "Adding" }],
    errors: [{ type: "Missing Peer", peers: 2, expected: 3 }],
    region: genDummyRegion(),
  }))


export const dummyStore: StoreValue = {
  storeId: "22134231",
  capacity: "29 GiB",
  available: "250 GiB",
  readQPS: "16K",
  writeQPS: "2K",

  address: "tikv1:20160",
  tikvVersion: "4.0.0-alpha",
  storeState: "Up",
  leaderCount: 6,
  leaderWeight: 1,
  leaderScore: 6,
  leaderSize: 6,
  regionCount: 20,
  regionWeight: 1,
  regionScore: 20,
  regionSize: 20,
  startTimestamp: "2019-10-25T01:52:15Z",
  latestHeartbeatTimestamp: "2019-10-25T08:11:58.651970456Z",
  uptime: "6h19m43.651970456s",
  schedulers: { evictingLeader: true },
  errors: [{ type: "Hot Store" }],
  peers: [dummyPeer, dummyPeer, dummyPeer],
}

export const dummyStore1: StoreValue = _.set(
  _.clone(dummyStore),
  "storeId",
  "22134233"
)

export const genDummyStore = (n: number) =>
  new Array(n).fill(null).map((e, idx) => (
    _.assign(_.clone(dummyStore),
      {
        "storeId": (1000 + idx).toString(),
        "peers": genDummyPeer(4)
      })))

// export const dummyStoreList: StoreValue[] = [dummyStore, dummyStore, dummyStore1, dummyStore, dummyStore, dummyStore, dummyStore, dummyStore, dummyStore, dummyStore, dummyStore, dummyStore]
export const dummyStoreList: StoreValue[] = [dummyStore, dummyStore1]
