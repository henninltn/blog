import React, { PropTypes } from 'react'
import                           './style.scss'

class Collapse extends React.Component {
  constructor(props) {
    super(props)
    const isShown = this.props.isShown
    this.state = {
      isShown: typeof isShown === 'boolean' ? isShown : false
    }
    this.onClick = this.onClick.bind(this)
  }
  static propTypes() {
    return {
      className: PropTypes.string,
      label: PropTypes.any,
      children: PropTypes.any,
      isShown: PropTypes.bool
    }
  }
  onClick(event) {
    event.preventDefault()
    this.setState({ isShown: !this.state.isShown})
  }
  render() {
    const { className, label, children } = this.props
    const isShown = this.state.isShown

    return (
      <div className={`collapse-wrapper ${className}`}>
        <div className="collapse-header">
          <span className="collapse-clickable" onClick={this.onClick}>{ isShown ? '\u2228' : '>' }</span>
          <span className="collapse-label">{ label }</span>
        </div>
        <div className="collapse-children">
          { isShown ? children : []}
        </div>
      </div>
    )
  }
}

export default Collapse