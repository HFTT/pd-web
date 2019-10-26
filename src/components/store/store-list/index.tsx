import React, {
  useRef,
  useState,
  RefObject,
  useCallback,
  useEffect,
} from "react"
import style from "./styles.scss"
import { StoreItem, StoreValue } from "../store-item"
import { StoreMenu, StoreUserAction } from "../store-menu"
import { PeerValue } from "~/components/region/peer-item"
import {
  PeerMenu,
  PeerUserAction,
  PeerInteractActionType,
} from "~/components/region/peer-menu"
import { RegionFilterAttibute } from "~components/filter"

export type PeerUserActionExtended =
  | {
    type: "Add Peer"
    addToStore: StoreValue
  }
  | {
    type: "Transfer Peer"
    transferToStore: StoreValue
  }
  | {
    type: "Delete Peer"
  }
  | {
    type: "Grant Leader"
  }
  | {
    type: "Split Region"
  }

export type Selection =
  | {
    type: "none"
  }
  | {
    type: "store"
    store: StoreValue
    cardRef: RefObject<HTMLDivElement>
  }
  | {
    type: "peer"
    peer: PeerValue
    cardRef: RefObject<HTMLDivElement>
  }

export type InteractionMode =
  | {
    type: "none"
  }
  | {
    type: "peerTrySeclectStore"
    action: PeerInteractActionType
    isTargetStore: (store: StoreValue) => boolean
    onSelect: (store: StoreValue) => void
  }

type StoreListProps = {
  storeItems: StoreValue[]
  regionFilter: RegionFilterAttibute
  onStoreUserAction: (store: StoreValue, userAction: StoreUserAction) => void
  onPeerUserAction: (
    peer: PeerValue,
    userAction: PeerUserActionExtended
  ) => void
}

export const StoreList: React.FunctionComponent<StoreListProps> = props => {
  const [selection, setSelection] = useState<Selection>({ type: "none" })
  const [interactionMode, setInteractionMode] = useState<InteractionMode>({
    type: "none",
  })

  const onPeerUserAction = useCallback(
    (peer: PeerValue, userAction: PeerUserAction) => {
      console.log(peer, userAction)
      const checkStoreDontContainRegion = (store: StoreValue) =>
        store.peers.findIndex(p => p.region.regionId == peer.region.regionId) ==
        -1
      switch (userAction) {
        case "Add Peer": {
          setInteractionMode({
            type: "peerTrySeclectStore",
            action: "Add Peer",
            isTargetStore: checkStoreDontContainRegion,
            onSelect: store => {
              setSelection({ type: "none" })
              setInteractionMode({ type: "none" })
              props.onPeerUserAction(peer, {
                type: "Add Peer",
                addToStore: store,
              })
            },
          })
          break
        }
        case "Transfer Peer": {
          setInteractionMode({
            type: "peerTrySeclectStore",
            action: "Transfer Peer",
            isTargetStore: checkStoreDontContainRegion,
            onSelect: store => {
              setSelection({ type: "none" })
              setInteractionMode({ type: "none" })
              props.onPeerUserAction(peer, {
                type: "Transfer Peer",
                transferToStore: store,
              })
            },
          })
          break
        }
        case "Delete Peer":
          setSelection({ type: "none" })
          props.onPeerUserAction(peer, { type: "Delete Peer" })
          break
        case "Grant Leader":
          setSelection({ type: "none" })
          props.onPeerUserAction(peer, { type: "Grant Leader" })
          break
        case "Split Region":
          setSelection({ type: "none" })
          props.onPeerUserAction(peer, { type: "Split Region" })
          break
      }
    },
    [props, interactionMode]
  )

  return (
    <div className={style["container"]}>
      <div className={style["inner"]}>
        {props.storeItems.map(item => (
          <StoreItem
            key={item.storeId}
            store={item}
            selection={selection}
            interactionMode={interactionMode}
            regionFilter={props.regionFilter}
            onSelectionChange={setSelection}
          />
        ))}

        {selection.type == "store" && selection.cardRef.current != null ? (
          <StoreMenu
            store={selection.store}
            onStoreUserAction={userAction => {
              props.onStoreUserAction(selection.store, userAction)
              setSelection({ type: "none" })
            }
            }
            onBlur={() => setSelection({ type: "none" })}
            offsetLeft={calcStoreMenuOffset(selection.cardRef.current)}
          />
        ) : (
            <></>
          )}

        {selection.type == "peer" && selection.cardRef.current != null ? (
          <PeerMenu
            peer={selection.peer}
            interactAction={
              interactionMode.type == "peerTrySeclectStore"
                ? {
                  type: interactionMode.action,
                  onCancel: () => {
                    setInteractionMode({
                      type: "none",
                    })
                    setSelection({
                      type: "none",
                    })
                  },
                }
                : null
            }
            onPeerUserAction={userAction =>
              onPeerUserAction(selection.peer, userAction)
            }
            onBlur={() => {
              if (interactionMode.type == "none") {
                setSelection({ type: "none" })
              }
            }}
            offsetLeft={calcStoreMenuOffset(selection.cardRef.current)}
          />
        ) : (
            <></>
          )}
      </div>
    </div>
  )
}

function calcStoreMenuOffset(storeCardContainer: HTMLDivElement): number {
  return storeCardContainer.offsetLeft + storeCardContainer.offsetWidth + 20
}
