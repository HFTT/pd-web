import React, { useState } from "react"
import { Link } from "react-router-dom"
import style from "./styles.scss"

type NavigationProps = {}

export const Navigation: React.FunctionComponent<NavigationProps> = props => {
  const tabs = ["Stores & Regions", "PD Cluster", "Config", "Connected"]
  const [activeIndex, setActiveIndex] = useState(0)

  const links = ["#", "#", "#", "#"]

  return (
    <div className={style["nav-container"]}>
      <h2>PD Control</h2>
      <div className={style["nav-button-group"]}>
        {
          tabs.map((tab, index) =>
            <div key={index} className={[style["nav-button"], activeIndex === index ? style["active"] : ""].join(" ")}>
              <Link
                onClick={() => { setActiveIndex(index) }}
                to={links[index]}>
                {tab}
              </Link>
            </div>
          )
        }
      </div>
    </div>
  )
}
