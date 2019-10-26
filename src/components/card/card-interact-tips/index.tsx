import React from "react"
import style from "./styles.scss"

type CardInteractTipsProps = {
  title: string,
  tips: string
  onCancel: () => void
}

export const CardInteractTips: React.FunctionComponent<CardInteractTipsProps> = props => (
  <div className={style["container"]}>
    <h3>{props.title}</h3>
    <p>{props.tips}</p>
    <button onClick={props.onCancel} onMouseDown={e => e.preventDefault()}>
      Cancel
    </button>
  </div>
)
