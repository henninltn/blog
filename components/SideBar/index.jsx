import React, { PropTypes } from 'react'
import { Link }             from 'react-router'
import { prefixLink }       from 'gatsby-helpers'
import { config }           from '../../config'
import TagNav               from '../../components/TagNav'
import DateNav              from '../../components/DateNav'
import                           './style.scss'

class SideBar extends React.Component {
  static propTypes() {
    return {
      pages: PropTypes.arrayOf(PropTypes.object)
    }
  }
  render() {
    const pages = this.props.pages

    return (
      <aside className="side-bar">
        <TagNav className="tag-nav"/>
        <DateNav className="date-nav" pages={pages}/>
      </aside>
    )
  }
}

export default SideBar
