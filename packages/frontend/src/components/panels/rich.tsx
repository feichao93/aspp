import classNames from 'classnames'
import React from 'react'

export const Rich = {
  string(str: string, danger = false) {
    return <span className={classNames('rich', 'string', { danger })}>{JSON.stringify(str)} </span>
  },
  number(num: number | string) {
    return <span className="rich number">{num}</span>
  },
  reserved(s: string) {
    return <span className="rich reserved">{s}</span>
  },
}
