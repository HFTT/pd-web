import React from "react"
import style from "./styles.scss"

type CardActionProps = {
  actions: UserAction[]
}

export type UserAction = {
  name: string
  onClick: () => void
}

export const CardAction: React.FunctionComponent<CardActionProps> = props => (
  <div className={style["container"]}>
    <h3>Actions</h3>
    <div>
      {props.actions.map(item => (
        <button key={item.name} onClick={item.onClick}>{item.name}</button>
      ))}
    </div>
  </div>
)
