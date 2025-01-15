import React from 'react'

export default function Summary(props) {
  return (
    <div className='summary' style={{
        backgroundColor:`${props.color}`
    }}>
        <div className='title'>{props.title}</div>
        <div className='number'>{props.number}</div>
        <div className='description'>{props.description}</div>
    </div>
  )
}
