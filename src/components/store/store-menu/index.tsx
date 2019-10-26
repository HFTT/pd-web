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

export type StoreUserAction = "Up" | "Offline" | "Tombstone" | "Evict Leader" | "Stop Evict Leader"

export const StoreMenu: React.FunctionComponent<StoreMenuProps> = props => {
  const divRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (divRef.current != null) {
      divRef.current.focus({ preventScroll: true })
      divRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
    }
  }, [props])

  const actions = availableActions(props.store, props.onStoreUserAction)

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
          { name: "Store State", value: props.store.storeState },
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

      {
        actions.length > 0 ? <CardAction
          actions={actions}
        /> : <></>
      }

    </div>
  )
}

function availableActions(
  store: StoreValue,
  onStoreUserAction: (userStoreAction: StoreUserAction) => void
): UserAction[] {
  let actions: UserAction[] = []
  
  if (store.schedulers.evictingLeader) {
    actions.push({ name: "Stop Evict Leader", onClick: () => onStoreUserAction("Stop Evict Leader") })
  } else {
    actions.push({ name: "Evict Leader", onClick: () => onStoreUserAction("Evict Leader") })
  }

  switch (store.storeState) {
    case "Up": actions.push({ name: "Offline", onClick: () => onStoreUserAction("Offline") }); break;
    case "Offline":
      actions.push({ name: "Up", onClick: () => onStoreUserAction("Up") })
      actions.push({ name: "Tombstone", onClick: () => onStoreUserAction("Tombstone") })
      break;
  }

  return actions
}
