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

    <div>
      {props.info.length != 0 ? <InfoTable infoEntries={props.info} /> : <></>}
    </div>
  </div>
)
