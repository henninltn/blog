import React      from 'react'
import { rhythm } from '../utils/typography'
import Header     from '../components/Header'
import SideBar    from '../components/SideBar'
import { config } from '../config'
import                 '../resources/scss/base.scss'
import                 '../resources/scss/_template.scss'

class Template extends React.Component {
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
    const children = this.props.children,
      route = this.props.route

    const collectTags = tags => tags === undefined || tags === "" || config.tags === undefined ? []
      : config.tags.map(tagObj => tagObj.name).filter(tagName => tags.includes(tagName))

    for (let i = 0; i < route.pages.length; i++) {
      this.props.route.pages[i].data.tags = collectTags(route.pages[i].data.tags)
      const body = this.props.route.pages[i].data.body
      if (body !== undefined) {
        this.props.route.pages[i].data.body = route.pages[i].data.body.replace(/(<a href=".*")(>)/g, '$1 target="_blank"$2')
      }
    }

    return (
      <div className="app">
        <Header className="main-header"/>
        <div className="main-row">
            <main className="content">
              {children}
            </main>
            <SideBar pages={route.pages} className="side-bar"/>
        </div>
        <footer className="main-footer">&copy; 2017 {config.siteAuthor}</footer>
      </div>
    )
  }
}

export default Template
