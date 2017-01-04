import React, { PropTypes } from 'react'
import Post                 from '../Post'
import PostList             from '../PostList'
import Page                 from '../Page'
import conditions           from '../../utils/conditions'
import { config }           from '../../config'
import                           './style.scss'

class Router extends React.Component {
  static propTypes() {
    return {
      route: PropTypes.object,
      requestPath:  PropTypes.string
    }
  }
  render() {
    const { route, requestPath } = this.props
    const { pages, page } = route

    // page not found but
    // posts filtered by tags in path
    if (requestPath.match(new RegExp(`^/tags/(${config.tags.map(tagObj => tagObj.name).join('|')})\/$`))) {
      const tags = config.tags === undefined ? []
        : config.tags.map(tagObj => tagObj.name).filter(tag => requestPath.includes(tag))
      return <PostList pages={pages} tags={tags}/>
    }

    // page not found but
    // posts filtered by date in path
    if (requestPath.match(/^\/\d{4}(\/\d{2}(\/\d{2})?)?\/$/)) {
      const dates = requestPath.split('/').slice(1)
      return <PostList pages={pages} year={dates[0]} month={dates[1]} day={dates[2]}/>
    }

    // page not found
    if (conditions.ifExists(page) && conditions.ifExists(page.requirePath) && page.requirePath.match(/^\/404\.html/))
      return <Page page={pages.find(page => page.path === '/404.html')}/>

    // page found and
    // static page
    if (conditions.isPage(page))
      return <Page page={page}/>

    // page found and
    // blog post
    if (conditions.isPost(page))
      return <Post post={page} headerOnly={false}/>

    // page found but
    // the others regarded as not found
    return <Page page={pages.find(page => page.path === '/404.html')}/>
  }
}

export default Router
