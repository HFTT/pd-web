import React, { RefObject, useEffect, useRef } from "react"
import style from "./styles.scss"
import { PeerTagList, PeerTagValue } from "../peer-tag"
import { RegionFilterAttibute } from "~components/filter"

export type PeerValue = {
  peerId: string
  peerState: PeerState
  region: RegionValue
  inActions: PeerInAction[]
  errors: PeerError[]
  storeId: string
}

export type RegionValue = {
  regionId: string
  startKey: string
  endKey: string
  regionSize: number
  peersCount: number
}

export type PeerState =
  | "Leader"
  | "Follower"
  | "Learner"
  | "Pending"
  | "Not Exists"

export type PeerInAction =
  | {
      type: "Adding Learner"
    }
  | {
      type: "Promoting Learner"
    }
  | {
      type: "Transfer Leader"
      targetStore: number
    }
  | {
      type: "Removing"
    }
  | {
      type: "Spliting"
      startKey: string
      endKey: string
      policy: string
      splitKeys: string[]
    }
  | {
      type: "Merging"
      fromRegionId: string
      toRegionId: string
      isPassive: boolean
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
  | {
      type: "Hot Read"
      flowBytes: number
    }
  | {
      type: "Hot Write"
      flowBytes: number
    }

type PeerListProps = {
  peers: PeerValue[]
  selectedPeer: PeerValue | null
  regionFilter: RegionFilterAttibute
  onSelectedPeerChanged: (peer: PeerValue | null) => void
}

type PeerProps = {
  peer: PeerValue
  containerRef: React.RefObject<HTMLDivElement>
  selectedPeer: PeerValue | null
  onSelectedPeerChanged: (peer: PeerValue | null) => void
}

export const PeerList: React.FunctionComponent<PeerListProps> = props => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className={style["list-container"]}>
      <div className={style["list-inner"]} ref={containerRef}>
        {props.peers.map(item =>
          shouldShowPeer(props.regionFilter, item) ? (
            <PeerItem
              key={item.peerId}
              peer={item}
              containerRef={containerRef}
              selectedPeer={props.selectedPeer}
              onSelectedPeerChanged={props.onSelectedPeerChanged}
            />
          ) : (
            <></>
          )
        )}
      </div>
    </div>
  )
}

export const PeerItem: React.FunctionComponent<PeerProps> = props => {
  let isPeerSelected =
    props.selectedPeer != null && props.selectedPeer == props.peer
  let isRegionSelected =
    props.selectedPeer != null &&
    props.selectedPeer.region.regionId == props.peer.region.regionId

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
      ref={divRef => {
        if (
          isRegionSelected &&
          divRef != null &&
          props.containerRef.current != null
        ) {
          const diff =
            (props.containerRef.current.clientHeight - divRef.clientHeight) / 2
            // FIXME: 251 is magic number
          props.containerRef.current.scrollTop = divRef.offsetTop - 251 - diff
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
  const inActionTags: PeerTagValue[] = inActions.map(item => ({
    name: item.type,
    type: "inAction",
  }))
  const errorTags: PeerTagValue[] = errors.map(item => ({
    name: item.type,
    type: "error",
  }))
  return inActionTags.concat(errorTags)
}

function shouldShowPeer(
  regionFilter: RegionFilterAttibute,
  peer: PeerValue
): boolean {
  return (
    (peer.errors.length > 0 && regionFilter.error) ||
    (peer.inActions.length > 0 && regionFilter.inAction) ||
    (peer.errors.length == 0 &&
      peer.inActions.length == 0 &&
      regionFilter.normal)
  )
}
