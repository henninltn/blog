import React, { PropTypes } from 'react'
import { Link }             from 'react-router'
import Helmet               from 'react-helmet'
import { prefixLink }       from 'gatsby-helpers'
import { config }           from '../../config'
import                           './style.scss'

class Page extends React.Component {
  static propTypes() {
    return {
      page: PropTypes.object
    }
  }
  render() {
    const page = this.props.page,
      data = page.data

    return (
    <article className="page" itemScope itemType="http://schema.org/BlogPosting">
      <Helmet
        title={`${config.siteTitle} | ${data.title}`}
      />
      <div className="page-content">
        <header className="page-header">
          <Link className="page-title-wrapper" to={prefixLink(page.path)}>
            <h1 className="page-title" itemProp="headline">{data.title}</h1>
          </Link>
        </header>
        <div className="page-description">{data.description}</div>
        <div className="page-body" dangerouslySetInnerHTML={{ __html: page.data.body }}></div>
        <footer className="page-footer"/>
      </div>
    </article>
    )
  }
}

export default Page
