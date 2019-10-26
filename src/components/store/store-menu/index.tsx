import React, { useEffect, useRef } from "react"
import style from "./styles.scss"
import { CardAction, UserAction } from "~components/card/card-action"
import { CardInfo } from "~components/card/card-info"
import { StoreValue } from "../store-item"

type StoreMenuProps = {
  store: StoreValue
  onStoreUserAction: (userStoreAction: StoreUserAction) => void
  onBlur: () => void
  offsetLeft: number
}

export type StoreUserAction = "Delete" | "Up"

export const StoreMenu: React.FunctionComponent<StoreMenuProps> = props => {
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
        title="Storage Detail Info"
        info={[
          { name: "Store Id", value: props.store.storeId },
          { name: "Address", value: props.store.address },
          { name: "TiKV Version", value: props.store.tikvVersion },
          { name: "State Name", value: props.store.stateName },
          { name: "Leader Count", value: props.store.leaderCount.toString() },
          { name: "Leader Weight", value: props.store.leaderWeight.toString() },
          { name: "Leader Score", value: props.store.leaderScore.toString() },
          { name: "Leader Size", value: props.store.leaderSize.toString() },
          { name: "Region Count", value: props.store.regionCount.toString() },
          { name: "Region Weight", value: props.store.regionWeight.toString() },
          { name: "Region Score", value: props.store.regionScore.toString() },
          { name: "Region Size", value: props.store.regionSize.toString() },
          { name: "Start Timestamp", value: props.store.startTimestamp },
          {
            name: "Latest Heartbeat Timestamp",
            value: props.store.latestHeartbeatTimestamp,
          },
          { name: "Up Time", value: props.store.uptime },
        ]}
      />
      <CardAction
        actions={availableActions(props.store, props.onStoreUserAction)}
      />
    </div>
  )
}

function availableActions(
  store: StoreValue,
  onStoreUserAction: (userStoreAction: StoreUserAction) => void
): UserAction[] {
  return [
    store.stateName === "Up"
      ? { name: "Delete", onClick: () => onStoreUserAction("Delete") }
      : { name: "Up", onClick: () => onStoreUserAction("Up") },
  ]
}
