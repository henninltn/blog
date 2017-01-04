import React      from 'react'
import { config } from 'config'
import Router     from '../components/Router'

class MarkDownWrapper extends React.Component {
  static propTypes () {
    return {
      history: React.PropTypes.object,
      location: React.PropTypes.object,
      params: React.PropTypes.object,
      route: React.PropTypes.object,
      routeParams: React.PropTypes.object,
      routes: React.PropTypes.array
    }
  }
  render () {
    const { location, route } = this.props

    return <Router route={route} requestPath={location.pathname}/>
  }
}

export default MarkDownWrapper
