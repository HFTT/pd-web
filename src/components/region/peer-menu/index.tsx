import React, { useRef, useEffect } from "react"
import style from "./styles.scss"
import { CardAction, UserAction } from "~components/card/card-action"
import { CardInfo } from "~components/card/card-info"
import { InfoEntry } from "~components/info-table"
import { PeerValue, PeerInAction, PeerError } from "../peer-item"
import { CardInteractTips } from "~components/card/card-interact-tips"

export type PeerMenuProps = {
  peer: PeerValue
  interactAction: PeerInteractAction | null
  onPeerUserAction: (userAction: PeerUserAction) => void
  onBlur: () => void
  offsetLeft: number
}

export type PeerUserAction =
  | "Grant Leader"
  | "Add Peer"
  | "Transfer Peer"
  | "Split"
  | "Delete"

export type PeerInteractActionType = "Transfer Peer" | "Add Peer"

export type PeerInteractAction = {
  type: PeerInteractActionType
  onCancel: () => void
}

export const PeerMenu: React.FunctionComponent<PeerMenuProps> = props => {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (divRef.current != null) {
      divRef.current.focus({ preventScroll: true })
      divRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
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

      {
        props.interactAction == null ?
          <CardAction
            actions={availableActions(props.peer, props.onPeerUserAction)}
          /> :
          <CardInteractTips
            title={props.interactAction.type}
            tips={displayInteractTips(props.interactAction.type)}
            onCancel={props.interactAction.onCancel}
          />
      }

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

function displayInteractTips(intectAction: PeerInteractActionType): string {
  switch (intectAction) {
    case "Add Peer": return "Add Peer Tips"
    case "Transfer Peer": return "Transfer Peer Tips"
  }
}

function availableActions(
  peer: PeerValue,
  onPeerUserAction: (userAction: PeerUserAction) => void
): UserAction[] {
  let actions = [
    {
      name: "Add Peer",
      onClick: () => {
        onPeerUserAction("Add Peer")
      },
    },
    {
      name: "Transfer Peer",
      onClick: () => {
        onPeerUserAction("Transfer Peer")
      },
    },
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
