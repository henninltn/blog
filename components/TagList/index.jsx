import React, { PropTypes } from 'react'
import { config }           from 'config'
import Tag                  from '../Tag'
import                           './style.scss'

class TagList extends React.Component {
  static propTypes() {
    return {
      tags: PropTypes.arrayOf(PropTypes.string)
    }
  }
  render() {
    const tags = this.props.tags

    const tagList = tags.sort().map(tag =>
      <li key={tag} className="tag-wrapper">
        <Tag className="tag" name={tag}/>
      </li>)

    return (<ul className="tags">{ tagList }</ul>)
  }
}

export default TagList
