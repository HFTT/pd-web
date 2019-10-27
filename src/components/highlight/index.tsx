import React from "react"
import style from "./styles.scss"

type HighlightProps = {
  isHighlighted: boolean
}

export const Highlight: React.FunctionComponent<HighlightProps> = props => (
  <div className={[style["container"], props.isHighlighted ? style["highlight"] : ""].join(" ")}>
    {props.children}
  </div>
)
