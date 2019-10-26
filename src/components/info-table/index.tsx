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
    {props.infoEntries.map((item, idx) => (
      <tbody>
        <tr key={idx}>
          <td style-width="40%">{item.name}</td>
          <td style-width="60%">{item.value}</td>
        </tr>
      </tbody>
    ))}
  </table>
)
