import React from "react"
import style from "./styles.scss"

export type PeerTagValue = {
  name: string
  type: "inAction" | "error"
}

type PeerTagListProps = {
  tags: PeerTagValue[]
}

type PeerTagProps = {
  value: PeerTagValue
}

export const PeerTagList: React.FunctionComponent<PeerTagListProps> = props => (
  <div className={style["container"]}>
    {props.tags.map((value, idx) => (
      <PeerTag key={idx} value={value} />
    ))}
  </div>
)

export const PeerTag: React.FunctionComponent<PeerTagProps> = props => (
  <div
    className={[
      style["peer-tag"],
      props.value.type == "inAction" ? style["action"] : style["error"],
    ].join(" ")}
  >
    {props.value.name}
  </div>
)
