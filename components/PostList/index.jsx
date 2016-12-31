import React, { PropTypes } from 'react'
import moment               from 'moment'
import { config }           from 'config'
import Post                 from '../Post'
import                           './style.scss'

class PostList extends React.Component {
  static propTypes() {
    return {
      pages: PropTypes.arrayOf(PropTypes.object),
      tags:  PropTypes.arrayOf(PropTypes.string),
      year:  PropTypes.number,
      month: PropTypes.number,
      day:   PropTypes.number
    }
  }
  render () {
    const pages = this.props.pages,
      tags = this.props.tags,
      year = this.props.year,
      month = this.props.month,
      day = this.props.day


    const postHeaders = pages
      .filter(page => page.path.match(/^\/posts\/\d{4}\/\d{2}\/\d{2}\/.*/))  // /posts/dddd/dd/dd/.*
      // filtered by tags if defined at this.props
      .filter(page => tags === undefined || tags.length === 0 ? true
        : tags.some(tag => page.data.tags.includes(tag)))
      /* filtered by year, month and day if defined at this.props
       *    /posts/year/month/day/.*
       * or /posts/year/month/.*
       * or /posts/year/.*
       * or /posts/.*
       */
      .filter(page => page.path.match(
        new RegExp('^/posts/'
          + [day, month, year].reduce((accum, i) => i !== undefined && i !== "" ? `${i}/${accum}` : '.*', '.*'))))
      .sort((post1, post2) => moment(post2.data.date).format('x') - moment(post1.data.date).format('x'))
      .map(post => <Post key={post.path} className="post" post={post} headerOnly={true}/>)

    if (postHeaders.length === 0) postHeaders.push(
        <div key="no-contents" className="no-contents">
          <h1 className="no-contents-header">No Contents</h1>
        </div>)

    return <div className="posts">{ postHeaders }</div>
  }
}

export default PostList
