import React, { PropTypes } from 'react'
import { Link }             from 'react-router'
import Helmet               from 'react-helmet'
import { prefixLink }       from 'gatsby-helpers'
import moment               from 'moment'
import { config }           from 'config'
import TagList              from '../TagList'
import                           './style.scss'

class Post extends React.Component {
  static propTypes() {
    return {
      post:       PropTypes.object,
      headerOnly: PropTypes.bool
    }
  }
  render() {
    const { post, headerOnly } = this.props
    const data = post.data
    const { date, path, title, tags, description, body } = data

    return (
      <article className="post" itemScope itemType="http://schema.org/BlogPosting">
        <Helmet
          title={`${config.siteTitle} | ${title}`}
        />
        <div className="post-content">
          <header key="post-header" className="post-header">
            <time className="post-datetime-wrapper" dateTime={date} itemProp="datePublished">
              <Link className="post-datetime" to={prefixLink(`/${moment(date).format('YYYY/MM/DD')}/`)}>
                {moment(date).format('YYYY-MM-DD')}
              </Link>
            </time>
            <h1 className="post-title-wrapper" itemProp="headline">
              <Link className="post-title" to={prefixLink(path)}>
                {title}
              </Link>
            </h1>
            <TagList className="tags" tags={tags}/>
          </header>
          <div key="post-description" className="post-description">{description}</div>
          { headerOnly ? ''
            : <div key="post-body" className="post-body" itemProp="articleBody"
                   dangerouslySetInnerHTML={ { __html: body } } /> }
          <footer key="post-footer" className="post-footer"/>
        </div>
      </article>
    )
  }
}

export default Post
