import React, { createContext, useReducer, useState, useEffect } from "react"

type GlobalState = {
    searchInupt: string
    setSearchInupt: (input: string) => void
}

const { Provider, Consumer } = createContext<GlobalState>({
    searchInupt: "",
    setSearchInupt: () => { },
})

export const GlobalStateProvider: React.FunctionComponent = props => {
    const [searchInupt, setSearchInupt] = useState<string>("")

    return (
        <Provider
            value={{
                searchInupt: searchInupt,
                setSearchInupt: setSearchInupt
            }}
        >
            {props.children}
        </Provider>
    )
}

export const GlobalStateConsumer = Consumer
