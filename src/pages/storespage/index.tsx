import React, { useState } from "react"
import style from "./styles.scss"
import { CardFootnote } from "~/components/card/card-footnote"
import { CardInfo } from "~/components/card/card-info"
import { Filter, RegionFilterAttibute } from "~/components/filter"
import { CardAction } from "~/components/card/card-action"
import { CardInteractTips } from "~/components/card/card-interact-tips"
import { PeerTagList, PeerTagValue } from "~/components/region/peer-tag"
import { Navigation } from "~/components/navigation"
import { StoreList } from "~/components/store/store-list"
import { StoreItem, StoreValue } from "~/components/store/store-item"
import { PeerMenu } from "~/components/region/peer-menu"
import { PeerList, PeerValue, RegionValue } from "~/components/region/peer-item"
import { dummyStore, dummyStoreList, dummyStore1, dummyPeer, genDummyStore } from "./dummy"
import { transferLeader, fetchStores, deleteStore, upStore, fetchAllRegions, fetchRegion, addEvictLeaderScheduler, removeEvictLeaderScheduler, RegionResp } from "~/api"

export const StoresPage: React.FunctionComponent = props => {
  const [regionFilterAttr, setRegionFilterAttr] = useState({
    normal: false,
    inAction: true,
    error: true,
  })

  const [searchInput, setSearchInput] = useState("")

  const randDummyStoreList: StoreValue[] = genDummyStore(10)

  return (
    <>
      <ApiTester callme={() => fetchStores().then(j => console.log(j))} name={"test fetch stores"} />
      <ApiTester callme={() => deleteStore(2).then(j => console.log(j))} name={"test delete store"} />
      <ApiTester callme={() => upStore(2).then(j => console.log(j))} name={"test up store"} />
      <ApiTester callme={() => fetchAllRegions().then(j => console.log(j))} name={"test fetch regions of store"} />
      <ApiTester callme={() => fetchRegion(84).then(j => console.log(j))} name="test fetch a specific region" />
      <ApiTester callme={() => addEvictLeaderScheduler(1).then(j => console.log(j))} name="test add a scheduler to evict leader" />
      <ApiTester callme={() => removeEvictLeaderScheduler(1).then(j => console.log(j))} name="test remove a scheduler to evict leader" />

      <Navigation />
      <div className={style["store-container"]}>
        <h2>{"Stores & Regions"}</h2>
        <Filter
          regionAttr={regionFilterAttr}
          onRegionAttrChange={newAttr => setRegionFilterAttr(newAttr)}
          searchAttr={{
            inputValue: searchInput,
            onInputValueChange: (newValue: string) => {
              setSearchInput(newValue)
            },
          }}
        />
      </div>
      {/* <StoreItem store={dummyStore} selection={{type:"none"}} onSelectionChange={()=>{}} />
      <StoreItem store={dummyStore} selection={{type:"store"}} onSelectionChange={()=>{}} /> */}
      <StoreList
        storeItems={randDummyStoreList}
        onStoreUserAction={(store, action) => {
          console.log(store, action)
        }}
        onPeerUserAction={(peer, action) => {
          console.log(peer, action)
        }}
      />
      <CardInteractTips title="Merge" tips="ecstas" onCancel={() => { }} />
      <CardFootnote
        isSelected={false}
        footnoteState="info"
        value="Hot Store"
        onMouseDown={() => { }}
      />
      <CardFootnote
        isSelected={true}
        footnoteState="error"
        value="Hot Store"
        onMouseDown={() => { }}
      />
      <CardInfo
        title="Missing Peers"
        info={[{ name: "Peers", value: "2" }, { name: "Expected", value: "3" }]}
      />
      <CardAction
        actions={[
          { name: "Split", onClick: () => { } },
          { name: "Delete", onClick: () => { } },
        ]}
      />
      <PeerTagList
        tags={[
          { name: "Missing Peer", type: "error" },
          { name: "Pending Peer", type: "error" },
          { name: "Adding", type: "inAction" },
        ]}
      />
      <PeerList
        peers={[dummyPeer, dummyPeer, dummyPeer]}
        selectedPeer={null}
        onSelectedPeerChanged={() => { }}
      />
      {/* <PeerMenu
        peer={dummyPeer}
        onPeerUserAction={() => { }}
        onBlur={() => { }}
        offsetLeft={0}
      /> */}
    </>
  )
}

// export async function fetchAll(): Promise<StoreValue[]> {
//   const allPeers: Promise<PeerValue> = fetchAllRegions().then(rawRegions =>
//     rawRegions.map(rawRegion => {

//       // rawRegion.peers.flatMap()
//       // const regionValue: RegionValue = {
//       //   regionId: rawRegion.id.toString(),
//       //   startKey: rawRegion.start_key,
//       //   endKey: rawRegion.end_key,
//       //   regionSize: rawRegion.approximate_size.toString(),
//       //   peersCount: rawRegion.peers.length
//       // }
//       return null
//     }
//     ))
//   // let a: RegionValue
//   // let b: RegionResp
  
//   let c: PeerValue // errors: $URLROOT/regions/check/miss-peer $
//   let d: StoreValue
//   return []
// }

type ApiTesterProps = {
  callme: () => void
  name?: string
}

const ApiTester: React.FunctionComponent<ApiTesterProps> = props => (
  <div>
    <button onClick={props.callme}>{props.name ? props.name : "test me"}</button>
  </div>
)

