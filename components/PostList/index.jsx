import React, { PropTypes } from 'react'
import moment               from 'moment'
import conditions           from '../../utils/conditions'
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
    const { pages, tags, year, month, day } = this.props

    const postHeaders = pages
      .filter(conditions.isPost)
      // filtered by tags if defined at this.props
      .filter(page => ! conditions.ifExists(tags) || tags.length === 0 ? true
        : tags.some(tag => page.data.tags.includes(tag)))
      /* filtered by year, month and day if defined at this.props
       *    /posts/year/month/day/.*
       * or /posts/year/month/.*
       * or /posts/year/.*
       * or /posts/.*
       */
      .filter(page => page.requirePath.match(
        new RegExp('^posts/'
          + [day, month, year].reduce((accum, i) => conditions.ifExists(i) && i !== "" ? `${i}/${accum}` : '.*', '.*')
          + '/index.md$')))
      .sort((post1, post2) => moment(post2.data.date).format('x') - moment(post1.data.date).format('x'))
      .map(post => <Post key={post.path} className="post" post={post} headerOnly={true}/>)

    return (
      <div className="posts">
        { postHeaders.length !== 0 ? postHeaders
          : <div className="no-contents"><h1 className="no-contents-header">No Contents</h1></div> }
      </div>
    )
  }
}

export default PostList
