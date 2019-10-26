import React, { useRef, useEffect } from "react"
import style from "./styles.scss"
import { CardAction, UserAction } from "~components/card/card-action"
import { CardInfo } from "~components/card/card-info"
import { InfoEntry } from "~components/info-table"
import { PeerValue, PeerInAction, PeerError } from "../peer-item"

export type PeerMenuProps = {
  peer: PeerValue
  onPeerUserAction: (userAction: PeerUserAction) => void
  onBlur: () => void
  offsetLeft: number
}

export type PeerUserAction =
  | "Grant Leader"
  | "Transfer Peer"
  | "Split"
  | "Delete"

export const PeerMenu: React.FunctionComponent<PeerMenuProps> = props => {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (divRef.current != null) {
      divRef.current.focus({ preventScroll: true })
    }
  }, [props])

  return (
    <div
      className={style["container"]}
      style={{ left: props.offsetLeft }}
      onBlur={() => props.onBlur()}
      tabIndex={0}
      ref={divRef}
    >
      <CardInfo
        title={props.peer.peerId}
        info={[
          { name: "Start Key", value: props.peer.region.startKey },
          { name: "End Key", value: props.peer.region.endKey },
          { name: "Size", value: props.peer.region.regionSize },
          { name: "Peers", value: props.peer.region.peersCount.toString() },
          { name: "State", value: props.peer.peerState },
        ]}
      />

      {props.peer.inActions.map(item => (
        <CardInfo title={item.type} info={displayInfo(item)} />
      ))}
      {props.peer.errors.map(item => (
        <CardInfo title={item.type} info={displayInfo(item)} />
      ))}

      <CardAction
        actions={availableActions(props.peer, props.onPeerUserAction)}
      />
    </div>
  )
}

function displayInfo(info: PeerInAction | PeerError): InfoEntry[] {
  switch (info.type) {
    case "Adding":
      return []
    case "Missing Peer":
      return [
        { name: "Peers", value: info.peers.toString() },
        { name: "Expects", value: info.expected.toString() },
      ]
    case "Extra Peer":
      return [
        { name: "Peers", value: info.peers.toString() },
        { name: "Expects", value: info.expected.toString() },
      ]
  }
}

function availableActions(
  peer: PeerValue,
  onPeerUserAction: (userAction: PeerUserAction) => void
): UserAction[] {
  let actions = [
    {
      name: "Split",
      onClick: () => {
        onPeerUserAction("Split")
      },
    },
  ]

  if (peer.peerState == "Follower") {
    actions.push({
      name: "Grant Leader",
      onClick: () => {
        onPeerUserAction("Grant Leader")
      },
    })
  }

  return actions
}
