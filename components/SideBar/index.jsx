import React, { PropTypes } from 'react'
import { Link }             from 'react-router'
import { prefixLink }       from 'gatsby-helpers'
import moment               from 'moment'
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

    let dateObj = {}
    pages.forEach(page => {
      if (page.data.date === undefined) return
      const [year, month, day] = moment(page.data.date).format('YYYY-MM-DD').split('-')
      if (dateObj[year] === undefined) dateObj[year] = {}
      if (dateObj[year][month] === undefined) dateObj[year][month] = {}
      dateObj[year][month][day] = true
    })

    return (
      <aside className="side-bar">
        <TagNav className="tag-nav"/>
        <DateNav className="date-nav" pages={pages}/>
      </aside>
    )
  }
}

export default SideBar
