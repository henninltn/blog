import React, { PropTypes } from 'react'
import Post                 from '../Post'
import PostList             from '../PostList'
import Page                 from '../Page'
import { config }           from '../../config'
import                           './style.scss'

class Router extends React.Component {
  static propTypes() {
    return {
      route: PropTypes.object,
      path:  PropTypes.string
    }
  }
  render() {
    const route = this.props.route,
      path = this.props.path,
      pages = route.pages,
      page = route.page

    // page not found but
    // posts filtered by tags in path
    if (path.match(new RegExp(`^/tags/(${config.tags.map(tagObj => tagObj.name).join('|')})`))) {
      const tags = config.tags === undefined ? []
        : config.tags.map(tagObj => tagObj.name).filter(tag => path.includes(tag))
      return <PostList pages={pages} tags={tags}/>
    }

    // page not found but
    // posts filtered by date in path
    if (path.match(/^\/\d{4}.*/)) {
      const dates = path.split('/').slice(1)
      return <PostList pages={pages} year={dates[0]} month={dates[1]} day={dates[2]}/>
    }

    // page not found
    if (page.path.match(/^\/404\.html/))
      return <Page page={pages.find(page => page.path === '/404.html')}/>

    // page found and
    // static page
    if (page.path.match(/^\/pages\/.*/))  // /pages/.*
      return <Page page={page}/>

    // page found and
    // blog post
    if (page.path.match(/^\/posts\/\d{4}\/\d{2}\/\d{2}\/.*/))  // /posts/dddd/dd/dd/.*
      return <Post post={page} headerOnly={false}/>

    // page found but
    // the others regarded as not found
    return <Page page={pages.find(page => page.path === '/404.html')}/>
  }
}

export default Router
