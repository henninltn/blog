import React, { PropTypes }         from 'react'
import { Link }                     from 'react-router'
import { List, Map, Range, Repeat } from 'immutable'
import { prefixLink }               from 'gatsby-helpers'
import moment                       from 'moment'
import { config }                   from 'config'
import Collapse                     from '../Collapse'
import                                   './style.scss'

class DateNav extends React.Component {
  static propTypes() {
    return {
      pages: PropTypes.arrayOf(PropTypes.object)
    }
  }
  render() {
    const pages = this.props.pages

    const dateMap = pages.reduce((accum, page) =>
        page.data.date === undefined || page.data.date === "" ? accum :
          List(moment(page.data.date).format('YYYY-MM-DD').split('-'))
            .push(true).reverse()
            .reduce((accum, i) => Map().set(i, accum))
            .mergeDeep(accum)
      , Map())

    const calender = (year, month) => {
      const firstDay = new Date(year, month - 1, 1).getDay()
      return Repeat(Range(1, 8), 5).zipWith((weekList, weekOfMonth) =>
          weekList.map(day => day + weekOfMonth * 7 - firstDay)
        , Range(0))
    }

    const children = dateMap.map((monthMap, year) => {
      const yearLink = `/${year}`
      return (
        <Collapse className="year-nav" key={yearLink}
                  label={<Link className="year-link" to={prefixLink(yearLink)}>{ year }</Link>}>
          <ul className="month-nav-list">
            { monthMap.map((dayMap, month) => {
              const monthLink = `${yearLink}/${month}`
              return (
                <li className="month-nav-wrapper" key={monthLink}>
                  <Collapse className="month-nav"
                            label={<Link to={prefixLink(monthLink)}>{ month }</Link>}>
                    <ul className="day-nav-list">
                      { calender(year, month).zipWith((weekList, weekOfMonth) =>
                          <li className="week-list-wrapper" key={`${monthLink}-${weekOfMonth}`}>
                            <ul className="week-list">
                              { weekList.map(day => {
                                const dateObj = new Date(year, month - 1, day),
                                  displayedMonth = dateObj.getMonth() + 1,
                                  displayedDate = dateObj.getDate()
                                const dayLink = `${yearLink}/${displayedMonth}/${displayedDate}`
                                const ifLinkedDay = dayMap.get(('00' + day).slice(-2), false)
                                const classNames = `${parseInt(month) !== displayedMonth ? 'invalid-day'
                                  : ifLinkedDay ? 'linked-day' : ''}`

                                return (
                                  <li className={`day-nav ${classNames}`} key={dayLink}>
                                    { ifLinkedDay
                                      ? <Link className="day-link" to={prefixLink(dayLink)}>{ displayedDate }</Link>
                                      : <span className="day-text">{ displayedDate }</span>}
                                  </li>
                                )}) }
                            </ul>
                          </li>
                      , Range(1)) }
                    </ul>
                  </Collapse>
                </li>
              )
            }).toIndexedSeq().toArray() }
          </ul>
        </Collapse>
      )
    }).toIndexedSeq().toArray()

    return (
      <nav className="date-nav">
        <h1 className="date-nav-header">Archives</h1>
        { children }
      </nav>
    )
  }
}

export default DateNav
