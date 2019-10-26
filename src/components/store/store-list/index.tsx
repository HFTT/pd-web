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
import { PeerMenu, PeerUserAction } from "~/components/region/peer-menu"

type StoreListProps = {
  storeItems: StoreValue[]
  onStoreUserAction: (store: StoreValue, userAction: StoreUserAction) => void
  onPeerUserAction: (peer: PeerValue, userAction: PeerUserAction) => void
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

export const StoreList: React.FunctionComponent<StoreListProps> = props => {
  const [selection, setSelection] = useState<Selection>({ type: "none" })

  return (
    <div className={style["store-list-container"]}>
      {props.storeItems.map(item => (
        <StoreItem
          key={item.storeId}
          store={item}
          selection={selection}
          onSelectionChange={selection => {
            console.log(selection)
            setSelection(selection)
          }}
        />
      ))}

      {selection.type == "store" && selection.cardRef.current != null ? (
        <StoreMenu
          store={selection.store}
          onStoreUserAction={userAction =>
            props.onStoreUserAction(selection.store, userAction)
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
          onPeerUserAction={userAction =>
            props.onPeerUserAction(selection.peer, userAction)
          }
          onBlur={() => setSelection({ type: "none" })}
          offsetLeft={calcStoreMenuOffset(selection.cardRef.current)}
        />
      ) : (
        <></>
      )}
    </div>
  )
}

function calcStoreMenuOffset(storeCardContainer: HTMLDivElement): number {
  return storeCardContainer.offsetLeft + storeCardContainer.offsetWidth + 20
}
