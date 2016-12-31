import React      from 'react'
import Helmet     from 'react-helmet'
import { config } from 'config'
import PostList   from '../components/PostList'
import                 '../resources/scss/index.scss'

class Index extends React.Component {
  static propTypes() {
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
    const route = this.props.route

    return (
      <div className="posts-wrapper">
        <Helmet
          title={config.siteTitle}
          meta={[
            {"name": "description",
             "content": "人に何かを教えようとしたときとか、自分の学習プロセスを見直そうとしたとき、" +
                        "今まで何してきたか分からなくなってることが多かったので、簡単に振り返られると" +
                        "いいなあと思って始めた個人的な日記。"},
          ]}
        />
        <PostList pages={route.pages}/>
      </div>
    )
  }
}

export default Index
