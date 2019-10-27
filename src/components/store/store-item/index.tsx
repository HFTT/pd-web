import React, { RefObject, useRef, useCallback, useEffect } from "react"
import style from "./styles.scss"
import { CardFootnote } from "~/components/card/card-footnote"
import { InfoTable } from "~/components/info-table"
import { PeerValue, PeerList } from "~/components/region/peer-item"
import { Selection, InteractionMode } from "../store-list"
import { RegionFilterAttibute } from "~components/filter"

export type StoreValue = {
  storeId: string
  capacity: string
  available: string

  address: string
  tikvVersion: string
  storeState: StoreState
  leaderCount: number
  leaderWeight: number
  leaderScore: number
  leaderSize: number
  regionCount: number
  regionWeight: number
  regionScore: number
  regionSize: number
  startTimestamp: string
  latestHeartbeatTimestamp: string
  uptime: string

  schedulers: StoreScheduler
  errors: StoreError[]
  peers: PeerValue[]
}

export type StoreState =
  | "Up"
  | "Down"
  | "Offline"
  | "Disconnected"

export type StoreScheduler = {
  evictingLeader: boolean
}

export type StoreError =
  | {
      type: "Hot Read"
      flowBytes: number
    }
  | {
      type: "Hot Write"
      flowBytes: number
    }
  | {
      type: "Store Down"
      downFrom: String
    }
  | {
      type: "Store Offline"
      offlineFrom: String
    }
  | {
      type: "Store Disconnected"
      disconnectedFrom: String
    }

type StoreItemProps = {
  store: StoreValue
  selection: Selection
  interactionMode: InteractionMode
  regionFilter: RegionFilterAttibute
  onSelectionChange: (selection: Selection) => void
}

export const StoreItem: React.FunctionComponent<StoreItemProps> = props => {
  const isStoreSelected =
    props.selection.type == "store" && props.selection.store.storeId == props.store.storeId
  const isStoreInteractMode =
    props.interactionMode.type == "peerTrySeclectStore"
  const isStoreInteractTarget =
    props.interactionMode.type == "peerTrySeclectStore" &&
    props.interactionMode.isTargetStore(props.store)

  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseDownCaptureStore = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef != null) {
        // Interact mode
        if (props.interactionMode.type == "peerTrySeclectStore") {
          e.stopPropagation()
          if (props.interactionMode.isTargetStore(props.store)) {
            props.interactionMode.onSelect(props.store)
          }
        }
      }
    },
    [props, cardRef]
  )

  const onMouseDownStore = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef != null) {
        // Select store
        e.preventDefault()
        if (
          props.selection.type == "store" &&
          props.selection.store.storeId == props.store.storeId
        ) {
          props.onSelectionChange({ type: "none" })
        } else {
          props.onSelectionChange({
            type: "store",
            store: props.store,
            cardRef: cardRef,
          })
        }
      }
    },
    [props, cardRef]
  )

  useEffect(() => {
    if (isStoreSelected && cardRef.current != null) {
      //TODO
      // cardRef.current.scrollIntoView({
      //   behavior: "smooth",
      //   block: "nearest",
      //   inline: "nearest",
      // })
    }
  }, [props, isStoreSelected, cardRef])

  return (
    <div
      className={style["container"]}
      onMouseDown={onMouseDownStore}
      onMouseDownCapture={onMouseDownCaptureStore}
      ref={cardRef}
    >
      <div
        className={[
          style["item"],
          isStoreSelected ? style["selected"] : "",
          isStoreInteractMode ? style["interact-mode"] : "",
          isStoreInteractTarget ? style["interact-mode-selectable"] : "",
        ].join(" ")}
      >
        <h2>{props.store.address}</h2>

        <h3>Basic</h3>

        <InfoTable
          infoEntries={[
            { name: "Store Id", value: props.store.storeId },
            { name: "Capacity", value: props.store.capacity },
            { name: "Available", value: props.store.available },
            { name: "Regions", value: props.store.regionCount.toString() },
            { name: "Leaders", value: props.store.leaderCount.toString() },
            { name: "State", value: props.store.storeState },
          ]}
        />

        <h3>Regions</h3>

        <PeerList
          peers={props.store.peers}
          selectedPeer={
            props.selection.type == "peer" ? props.selection.peer : null
          }
          regionFilter={props.regionFilter}
          onSelectedPeerChanged={peer =>
            peer == null
              ? props.onSelectionChange({ type: "none" })
              : props.onSelectionChange({
                  type: "peer",
                  peer: peer,
                  cardRef: cardRef,
                })
          }
        />
      </div>

      {props.store.schedulers.evictingLeader ? (
        <CardFootnote
          key={0}
          value="Evicting Leader"
          isSelected={isStoreSelected}
          // isSelected={false}
          footnoteState="info"
          onMouseDown={onMouseDownStore}
        />
      ) : (
        <></>
      )}
      {props.store.errors.map((item, idx) => (
        <CardFootnote
          key={idx + 1}
          value={item.type}
          // isSelected={false}
          isSelected={isStoreSelected}
          footnoteState="error"
          onMouseDown={onMouseDownStore}
        />
      ))}
    </div>
  )
}
