import React, { RefObject, useRef, useCallback } from "react"
import style from "./styles.scss"
import { CardFootnote } from "~/components/card/card-footnote"
import { InfoTable } from "~/components/info-table"
import { PeerValue, PeerList } from "~/components/region/peer-item"
import { Selection } from "../store-list"

export type StoreValue = {
  storeId: string
  capacity: string
  available: string
  readQPS: string
  writeQPS: string

  address: string
  tikvVersion: string
  stateName: string
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

  schedulers: StoreScheduler[]
  errors: StoreError[]
  peers: PeerValue[]
}

export type StoreScheduler =
  | {
      type: "Evicting Leader"
    }
  | {
      type: "Gathering Leader"
    }

export type StoreError =
  | {
      type: "Hot Store"
    }
  | {
      type: "Store is Down"
      downFrom: Date
    }

type StoreItemProps = {
  store: StoreValue
  selection: Selection
  onSelectionChange: (selection: Selection) => void
}

export const StoreItem: React.FunctionComponent<StoreItemProps> = props => {
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseDownStore = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (cardRef != null) {
        if (
          props.selection.type == "store" &&
          props.selection.store == props.store
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

  let isStoreSelected =
    props.selection.type == "store" && props.selection.store == props.store

  return (
    <div
      className={style["container"]}
      onMouseDown={onMouseDownStore}
      ref={cardRef}
    >
      <div
        className={[
          style["item"],
          isStoreSelected ? style["selected"] : "",
        ].join(" ")}
      >
        <h2>{props.store.storeId}</h2>

        <h3>Basic</h3>

        <InfoTable
          infoEntries={[
            { name: "Capacity", value: props.store.capacity },
            { name: "Available", value: props.store.available },
            { name: "Read", value: props.store.readQPS + " QPS" },
            { name: "Write", value: props.store.writeQPS + " QPS" },
          ]}
        />

        <h3>Regions</h3>

        <PeerList
          peers={props.store.peers}
          selectedPeer={
            props.selection.type == "peer" ? props.selection.peer : null
          }
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

      {props.store.schedulers.map(item => (
        <CardFootnote
          value={item.type}
          isSelected={isStoreSelected}
          footnoteState="info"
          onMouseDown={onMouseDownStore}
        />
      ))}
      {props.store.errors.map(item => (
        <CardFootnote
          value={item.type}
          isSelected={isStoreSelected}
          footnoteState="error"
          onMouseDown={onMouseDownStore}
        />
      ))}
    </div>
  )
}
