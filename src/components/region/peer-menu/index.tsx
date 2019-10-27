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
  | "Add Peer"
  | "Transfer Peer"
  | "Delete Peer"
  | "Grant Leader"
  | "Split Region"

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
        title="Peer Info"
        info={[
          { name: "Region Id", value: props.peer.region.regionId },
          { name: "Peer Id", value: props.peer.peerId },
          { name: "Start TableID", value: props.peer.region.startKey },
          { name: "End TableID", value: props.peer.region.endKey },
          {
            name: "Size",
            value: props.peer.region.regionSize.toString() + " kvs",
          },
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

      {props.interactAction == null ? (
        <CardAction
          actions={availableActions(props.peer, props.onPeerUserAction)}
        />
      ) : (
        <CardInteractTips
          title={props.interactAction.type}
          tips={displayInteractTips(props.interactAction.type)}
          onCancel={props.interactAction.onCancel}
        />
      )}
    </div>
  )
}

function displayInfo(info: PeerInAction | PeerError): InfoEntry[] {
  switch (info.type) {
    case "Transfer Leader":
      return [{ name: "Target Store", value: info.targetStore.toString() }]
    case "Spliting":
      return [
        { name: "Start Key", value: info.startKey },
        { name: "End Key", value: info.endKey },
        { name: "Split Keys", value: info.splitKeys.toString() },
        { name: "Policy", value: info.policy },
      ]
    case "Merging":
      return [
        { name: "From Region", value: info.fromRegionId },
        { name: "To Region", value: info.toRegionId },
        { name: "Is Passive", value: info.isPassive.toString() },
      ]
    case "Transfer Leader":
      return [{ name: "Target Store", value: info.targetStore.toString() }]
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
    case "Hot Read":
      return [{ name: "Flow Bytes", value: info.flowBytes.toString() }]
    case "Hot Write":
      return [{ name: "Flow Bytes", value: info.flowBytes.toString() }]
    default:
      return []
  }
}

function displayInteractTips(intectAction: PeerInteractActionType): string {
  switch (intectAction) {
    case "Add Peer":
      return "Press a store to add a new replica to the new one.\n\nThis action only applies on stores not containing the same region"
    case "Transfer Peer":
      return "Press a store to tranfer this peer to the new one.\n\nThis action only applies on stores not containing the same region"
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
      name: "Delete Peer",
      onClick: () => {
        onPeerUserAction("Delete Peer")
      },
    },
    {
      name: "Split Region",
      onClick: () => {
        onPeerUserAction("Split Region")
      },
    },
  ]

  if (peer.peerState != "Leader") {
    actions.push({
      name: "Grant Leader",
      onClick: () => {
        onPeerUserAction("Grant Leader")
      },
    })
  }

  return actions
}
