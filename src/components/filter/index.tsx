import React from "react"
import style from "./styles.scss"
import _ from "lodash"

type FilterProps = {
  regionAttr: RegionFilterAttibute
  searchAttr: SearchFilterAttribute
  onRegionAttrChange: (regionAttr: RegionFilterAttibute) => void
}

type RegionFilterProps = {
  regionAttr: RegionFilterAttibute
  onRegionAttrChange: (regionAttr: RegionFilterAttibute) => void
}

type SearchFilterProps = {
  searchAttr: SearchFilterAttribute
}

export type RegionFilterAttibute = {
  normal: boolean
  inAction: boolean
  error: boolean
}

export type SearchFilterAttribute = {
  inputValue: string
  onInputValueChange: (newValue: string) => void
}

const RegionFilter: React.FunctionComponent<RegionFilterProps> = props => (
  <div className={style["region-container"]}>
    <button
      className={props.regionAttr.normal ? style["active"] : ""}
      onClick={() => props.onRegionAttrChange(_.update(_.clone(props.regionAttr), "normal", (value: boolean) => !value))}
    >
      normal regions
    </button>
    <button
      className={props.regionAttr.inAction ? style["active"] : ""}
      onClick={() => props.onRegionAttrChange(_.update(_.clone(props.regionAttr), "inAction", (value: boolean) => !value))}
    >
      in-action regions
    </button>
    <button
      className={props.regionAttr.error ? style["active"] : ""}
      onClick={() => props.onRegionAttrChange(_.update(_.clone(props.regionAttr), "error", (value: boolean) => !value))}
    >
      error regions
    </button>
  </div>
)

const SearchFilter: React.FunctionComponent<SearchFilterProps> = props => (
  <div className={style["search-container"]}>
    <span className={style["input-icon"]}>
      <i className="fas fa-search" />
    </span>
    <input
      value={props.searchAttr.inputValue}
      onChange={e => props.searchAttr.onInputValueChange(e.target.value)}
    />
  </div>
)

export const Filter: React.FunctionComponent<FilterProps> = props => (
  <div className={style["filter-container"]}>
    <h3>Filter</h3>
    <RegionFilter regionAttr={props.regionAttr} onRegionAttrChange={props.onRegionAttrChange} />
    <SearchFilter searchAttr={props.searchAttr} />
  </div>
)
