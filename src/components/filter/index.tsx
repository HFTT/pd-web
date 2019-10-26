import React, { useState } from "react"
import style from "./styles.scss"
import _ from "lodash"

type FilterProps = {
  regionAttr: RegionFilterAttibute
  onRegionAttrChange: (regionAttr: RegionFilterAttibute) => void
  onSearchInputChange: (input: string) => void
}

export type RegionFilterAttibute = {
  normal: boolean
  inAction: boolean
  error: boolean
}

type RegionFilterProps = {
  regionAttr: RegionFilterAttibute
  onRegionAttrChange: (regionAttr: RegionFilterAttibute) => void
}

type SearchInuptProps = {
  onSearchInputChange: (input: string) => void
}

const RegionFilter: React.FunctionComponent<RegionFilterProps> = props => {
  return (
    <div className={style["region-container"]}>
      <button
        className={props.regionAttr.normal ? style["active"] : ""}
        onClick={() =>
          props.onRegionAttrChange(
            _.update(
              _.clone(props.regionAttr),
              "normal",
              (value: boolean) => !value
            )
          )
        }
      >
        normal regions
      </button>
      <button
        className={props.regionAttr.inAction ? style["active"] : ""}
        onClick={() =>
          props.onRegionAttrChange(
            _.update(
              _.clone(props.regionAttr),
              "inAction",
              (value: boolean) => !value
            )
          )
        }
      >
        in-action regions
      </button>
      <button
        className={props.regionAttr.error ? style["active"] : ""}
        onClick={() =>
          props.onRegionAttrChange(
            _.update(
              _.clone(props.regionAttr),
              "error",
              (value: boolean) => !value
            )
          )
        }
      >
        error regions
      </button>
    </div>
  )
}

const SearchInupt: React.FunctionComponent<SearchInuptProps> = props => {
  return (
    <div className={style["search-container"]}>
      <span className={style["input-icon"]}>
        <i className="fas fa-search" />
      </span>
      <input placeholder="search" onChange={e => props.onSearchInputChange(e.target.value)} />
    </div>
  )
}

export const Filter: React.FunctionComponent<FilterProps> = props => (
  <div className={style["filter-container"]}>
    <h3>Filter</h3>
    <RegionFilter
      regionAttr={props.regionAttr}
      onRegionAttrChange={props.onRegionAttrChange}
    />
    <SearchInupt onSearchInputChange={props.onSearchInputChange} />
  </div>
)
