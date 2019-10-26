import React from "react"
import style from "./styles.scss"

export type InfoEntry = {
  name: string
  value: string
}

type InfoTableProps = {
  infoEntries: InfoEntry[]
}

export const InfoTable: React.FunctionComponent<InfoTableProps> = props => (
  <table className={style["container"]}>
    <tbody>
      {props.infoEntries.map((item, idx) => (
        <tr key={idx}>
          <td className={style["name"]}>{item.name}</td>
          <td className={style["value"]}>{item.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
)
