import React from "react"
import ReactDOM from "react-dom"
import { Router, Route } from "react-router-dom"
import history from "~/history"
import { StoresPage } from "~/pages/storespage"
import "~/styles/global_styles.scss"

ReactDOM.render(
  <Router history={history}>
    <Route exact path="/" component={StoresPage} />
  </Router>,
  document.getElementById("main-app")
)
