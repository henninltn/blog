import React          from 'react'
import { Link }       from 'react-router'
import { prefixLink } from 'gatsby-helpers'
import { config }     from 'config'
import                     './style.scss'

class Header extends React.Component {
  render () {
    return (
      <header className="main-header">
        <div className="site-title-container">
          <h1 className="site-title-wrapper">
            <Link className="site-title" to={prefixLink('/')}>{config.siteTitle}</Link>
          </h1>
          <h2 className="site-sub-title">{config.siteSubTitle}</h2>
        </div>
        <nav className="main-header-nav">
          <ul className="nav-wrapper">
            <li>
              <Link to={prefixLink('/')}>Home</Link>
            </li>
            <li>
              <Link>Archives</Link>
            </li>
            <li>
              <a href={`https://github.com/${config.githubId}`} target="_blank">Github</a>
            </li>
            <li>
              <a href={`https://twitter.com/${config.twitterId}`} target="_blank">Twitter</a>
            </li>
          </ul>
        </nav>
      </header>
    )
  }
}

export default Header
