import React from 'react'

import { Container, Row } from 'react-bootstrap'

const SubtitleShow = (props) => {
  const [srt, setSrt] = React.useState({})

  React.useEffect(() => {
    window.api.receive('subtitle-content', (data) => {
      setSrt((srt) => {
        return {
          ...data
        }
      })   
    })
  },[srt])

  return (
      <Container id='show-subtitle'>
        { Object.keys(srt).map((key, index) => {
          return (
            <div key={key}>
              <Row>{srt[key].num}</Row>
              <Row>{srt[key].time}</Row>
              <Row style={{whiteSpace: "pre-wrap"}}>{srt[key].dialog}</Row>
              <p></p>
            </div>
          )
        })}
      </Container>
  )
}

export { SubtitleShow }
