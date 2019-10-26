import React from "react"
import style from "./styles.scss"

type CardFootnoteProps = {
  value: string
  footnoteState: "info" | "error"
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export const CardFootnote: React.FunctionComponent<CardFootnoteProps> = props => (
  <div className={[style["container"],
      props.isSelected ? style["selected"] : "",
      props.footnoteState == "error" ? style["error"] : ""].join(" ")}
      onMouseDown={props.onMouseDown}>
    <p>{props.value}</p>
  </div>
)
