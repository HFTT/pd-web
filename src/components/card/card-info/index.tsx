import React from "react"
import style from "./styles.scss"
import { InfoTable, InfoEntry } from "~/components/info-table"

type CardInfoProps = {
  title: string
  info: InfoEntry[]
}

export const CardInfo: React.FunctionComponent<CardInfoProps> = props => (
  <div className={style["container"]}>
    <h3>{props.title}</h3>

    <InfoTable infoEntries={props.info} />
  </div>
)
