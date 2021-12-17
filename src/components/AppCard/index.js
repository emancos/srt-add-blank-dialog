import React from 'react'
import { Card, Row, Col, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap'

const AppCard = (props) => {
  const { filePath, encoding, language, totalDialogs, filesize } = props.cardBody

  const fileName = filePath.match(/(\\|\/)/g)
    ? filePath.split(/(\\|\/)/g).pop()
    : (filePath || 'Carregar arquivo.')
    
  const badgeProps = props.badgeProps
  let encodingName = ''

  const overlay = (
    <Tooltip id='subtitle-name-file-tooltip'>
      {fileName.length > 46 ? fileName : ''}
      <p
        style={{
          color: '#1CD3D9',
          alignContent: 'center',
        }}
      >
        <strong>Clique para visualizar o texto</strong>
      </p>
    </Tooltip>
  )

  const badge = (
    <Badge
      type={badgeProps.type}
      bg={badgeProps.bg}
      aria-label='Carregar Legenda SRT'
      aria-describedby='load-srt'
      id='badge-info-file'
      onClick={props.onClinckShowSubtitle}
      style={{ color: badgeProps.color }}
    >
      {fileName.length > 46 ? fileName.substring(0, 46) : fileName}
    </Badge>
  )

  switch (encoding) {
    case 'utf8':
      encodingName = 'UTF-8'
      break
    case 'latin1':
      encodingName = 'ANSI'
      break
    default:
      encodingName = '----'
  }

  const showFile = fileName.match('.srt') ? (
    <OverlayTrigger placement='bottom' overlay={overlay}>
      {badge}
    </OverlayTrigger>
  ) : (
    badge
  )

  return (
    <>
      <Card>
        <Card.Header style={{ textAlign: 'center' }}>
          <b>Informações da legenda</b>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col>{showFile}</Col>
          </Row>
          <Row>
            <Col>
              <p>Codificação da legenda:</p>
            </Col>
            <Col>
              <Badge bg='success' pill style={{ fontSize: 14 }}>
                {encodingName}
              </Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>Linguagem:</p>
            </Col>
            <Col>
              <Badge bg='success' pill style={{ fontSize: 14 }}>
                {language.toUpperCase()}
              </Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>Total diálogos:</p>
            </Col>
            <Col>
              <Badge bg='success' pill style={{ fontSize: 14 }}>
                {totalDialogs}
              </Badge>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>tamanho do arquivo:</p>
            </Col>
            <Col>
              <Badge bg='success' pill style={{ fontSize: 14 }}>
                {filesize + 'KB'}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  )
}

export { AppCard }
