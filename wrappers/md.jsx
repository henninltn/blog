import React      from 'react'
import { config } from 'config'
import Router     from '../components/Router'

class MarkDownWrapper extends React.Component {
  static propTypes () {
    return {
      children: React.PropTypes.object,
      history: React.PropTypes.object,
      location: React.PropTypes.object,
      params: React.PropTypes.object,
      route: React.PropTypes.object,
      routeParams: React.PropTypes.object,
      routes: React.PropTypes.array
    }
  }
  render () {
    const location = this.props.location,
      route = this.props.route

    return <Router route={route} path={location.pathname}/>
  }
}

export default MarkDownWrapper
