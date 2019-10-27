import React from "react"
import ReactDOM from "react-dom"
import { Router, Route } from "react-router-dom"
import history from "~/history"
import { StoresPage } from "~/pages/storespage"
import { GlobalStateProvider } from "~/utils/global-state.tsx"
import "~/styles/global_styles.scss"

ReactDOM.render(
  <>
    <GlobalStateProvider>
      <Router history={history}>
        <Route exact path="/" component={StoresPage} />
      </Router>
    </GlobalStateProvider>
  </>,
  document.getElementById("main-app")
)
