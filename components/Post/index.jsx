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
    const post = this.props.post
    const data = post.data

    let contents = [
      <header key="post-header" className="post-header">
        <time className="post-datetime-wrapper" dateTime={data.date} itemProp="datePublished">
          <Link className="post-datetime" to={prefixLink('/' + moment(data.date).format('YYYY/MM/DD'))}>
            {moment(data.date).format('YYYY-MM-DD')}
          </Link>
        </time>
        <h1 className="post-title-wrapper" itemProp="headline">
          <Link className="post-title" to={prefixLink(post.path)}>
            {data.title}
          </Link>
        </h1>
        <TagList className="tags" tags={data.tags}/>
      </header>,
      <div key="post-description" className="post-description">{data.description}</div>
    ]

    if (! this.props.headerOnly)
      contents.push(<div key="post-body" className="post-body" itemProp="articleBody"
                         dangerouslySetInnerHTML={ { __html: data.body } } />)

    contents.push(<footer key="post-footer" className="post-footer"/>)

    return (
      <article className="post" itemScope itemType="http://schema.org/BlogPosting">
        <Helmet
          title={`${config.siteTitle} | ${data.title}`}
        />
        <div className="post-content">
          { contents }
        </div>
      </article>
    )
  }
}

export default Post
