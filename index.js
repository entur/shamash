import React from 'react'
import ReactDOM from 'react-dom'
import '@entur/component-library/lib/index.css'

import App from './components/App'

if (module.hot) {
  module.hot.accept('./components/App', () => {
    const NextRoot = require('./components/App').default
    render(NextRoot)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  render(App)
})

const render = RootElement => {
  ReactDOM.render(
    <RootElement/>,
    document.querySelector('#root')
  )
}
