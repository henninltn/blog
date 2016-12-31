import React, { PropTypes } from 'react'
import { Link }             from 'react-router'
import { prefixLink }       from 'gatsby-helpers'
import { config }           from 'config'
import                           './style.scss'

class Tag extends React.Component {
  static propTypes() {
    return {
      name: PropTypes.string
    }
  }
  render() {
    const tagName = this.props.name
    const tagInfo = config.tags.find(tag => tag.name == tagName)

    return (
      <div className="tag">
        <Link className="tag-name" to={prefixLink('/tags/' + tagInfo.name)}>{tagInfo.name}</Link>
      </div>
    )
  }
}

export default Tag
