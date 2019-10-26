import React, { RefObject } from "react"
import style from "./styles.scss"
import { PeerTagList, PeerTagValue } from "../peer-tag"

export type PeerValue = {
  peerId: string
  peerState: PeerState
  region: RegionValue
  inActions: PeerInAction[]
  errors: PeerError[]
}

export type RegionValue = {
  regionId: string
  startKey: string
  endKey: string
  regionSize: string
  peersCount: number
}

export type PeerState = "Leader" | "Follower" | "Learner" | "Pending"

export type PeerInAction = {
  type: "Adding"
}

export type PeerError =
  | {
      type: "Missing Peer"
      peers: number
      expected: number
    }
  | {
      type: "Extra Peer"
      peers: number
      expected: number
    }

type PeerListProps = {
  peers: PeerValue[]
  selectedPeer: PeerValue | null
  onSelectedPeerChanged: (peer: PeerValue | null) => void
}

type PeerProps = {
  peer: PeerValue
  selectedPeer: PeerValue | null
  onSelectedPeerChanged: (peer: PeerValue | null) => void
}

export const PeerList: React.FunctionComponent<PeerListProps> = props => (
  <div className={style["list-container"]}>
    {props.peers.map((item, idx) => (
      <PeerItem
        key={idx}
        peer={item}
        selectedPeer={props.selectedPeer}
        onSelectedPeerChanged={props.onSelectedPeerChanged}
      />
    ))}
  </div>
)

export const PeerItem: React.FunctionComponent<PeerProps> = props => {
  let isPeerSelected =
    props.selectedPeer != null && props.selectedPeer == props.peer
  let isRegionSelected =
    props.selectedPeer != null && props.selectedPeer.region == props.peer.region

  return (
    <div
      className={[
        style["peer-container"],
        isRegionSelected ? style["selected"] : "",
      ].join(" ")}
      onMouseDown={e => {
        e.stopPropagation()
        e.preventDefault()
        if (isPeerSelected) {
          props.onSelectedPeerChanged(null)
        } else {
          props.onSelectedPeerChanged(props.peer)
        }
      }}
    >
      <div className={style["title-row"]}>
        <h4>{props.peer.region.regionId}</h4>
        {props.peer.peerState != "Follower" ? (
          <p>{props.peer.peerState}</p>
        ) : (
          <></>
        )}
      </div>
      <PeerTagList tags={displayTag(props.peer.inActions, props.peer.errors)} />
    </div>
  )
}

function displayTag(
  inActions: PeerInAction[],
  errors: PeerError[]
): PeerTagValue[] {
  const errorTags: PeerTagValue[] = errors.map(item => ({
    name: item.type,
    type: "error",
  }))
  const inActionTags: PeerTagValue[] = inActions.map(item => ({
    name: item.type,
    type: "inAction",
  }))
  return errorTags.concat(inActionTags)
}
