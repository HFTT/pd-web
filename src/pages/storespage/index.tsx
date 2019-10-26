import React, { useState } from "react"
import style from "./styles.scss"
import { CardFootnote } from "~/components/card/card-footnote"
import { CardInfo } from "~/components/card/card-info"
import { Filter, RegionFilterAttibute } from "~/components/filter"
import { CardAction } from "~/components/card/card-action"
import { PeerTagList, PeerTagValue } from "~/components/region/peer-tag"
import { Navigation } from "~/components/navigation"
import { StoreList } from "~/components/store/store-list"
import { StoreItem, StoreValue } from "~/components/store/store-item"
import { PeerMenu } from "~/components/region/peer-menu"
import { PeerList, PeerValue } from "~/components/region/peer-item"
import { dummyStore, dummyStoreList, dummyStore1, dummyPeer } from "./dummy"

export const StoresPage: React.FunctionComponent = props => {
  const [regionFilterAttr, setRegionFilterAttr] = useState({
    normal: false,
    inAction: true,
    error: true,
  })

  const [searchInput, setSearchInput] = useState("")

  return (
    <>
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
        storeItems={dummyStoreList}
        onStoreUserAction={action => {
          alert(action)
        }}
        onPeerUserAction={action => {
          alert(action)
        }}
      />
      <CardFootnote
        isSelected={false}
        footnoteState="info"
        value="Hot Store"
        onMouseDown={() => {}}
      />
      <CardFootnote
        isSelected={true}
        footnoteState="error"
        value="Hot Store"
        onMouseDown={() => {}}
      />
      <CardInfo
        title="Missing Peers"
        info={[{ name: "Peers", value: "2" }, { name: "Expected", value: "3" }]}
      />
      <CardAction
        actions={[
          { name: "Split", onClick: () => {} },
          { name: "Delete", onClick: () => {} },
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
        onSelectedPeerChanged={() => {}}
      />
      <PeerMenu
        peer={dummyPeer}
        onPeerUserAction={() => {}}
        onBlur={() => {}}
        offsetLeft={0}
      />
    </>
  )
}
