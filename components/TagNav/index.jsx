import React      from 'react'
import { config } from 'config'
import Tag        from '../Tag'
import                 './style.scss'

class TagNav extends React.Component {
  render() {
    const tags = config.tags.map(tagObj => tagObj.name)

    const tagNavList = tags.sort().map(tag =>
      <li key={tag} className="tag-link-wrapper">
        <Tag className="tag-link" name={tag}/>
      </li>)

    return (
      <nav className="tag-nav">
        <h1 className="tag-nav-header">Tags</h1>
        <ul className="tag-link-list">{ tagNavList }</ul>
      </nav>
    )
  }
}

export default TagNav
