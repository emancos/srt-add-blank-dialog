import React from 'react'

import { Button, Form, ProgressBar } from 'react-bootstrap'
import { AppCard } from '../AppCard'

import './AppForm.css'

const AppForm = (props) => {
  const dataInfo = React.useRef({})

  const [totalProcess, setTotalProcess] = React.useState(0)
  const [processing, setProcessing] = React.useState({ className: '', text: '' })
  const [disabledButton, setDisabledButton] = React.useState(true)
  const [badgeProps, setBadgeProps] = React.useState({
    type: '',
    bg: 'secondary',
    color: 'white',
  })
  const [card, setCard] = React.useState({
    filePath: '',
    encoding: '0',
    language: 'n/a',
    totalDialogs: 0,
    filesize: 0,
  })

  const onClickLoadSrt = () => {
    window.api.send('click-button', true)
    if (!dataInfo.current.filePath) {
      setBadgeProps((badge) => {
        return {
          type: '',
          bg: 'warning',
          color: '#171a20',
        }
      })
      setCard((card) => {
        card.filePath = 'Carregando...'
        return {
          ...card,
        }
      })
      setTotalProcess(0)
    }
  }

  const onClinckShowSubtitle = () => {
    const { filePath, encoding } = dataInfo.current
    window.api.send('subtitle-show', { openFile: true, filePath, encoding })
  }

  const onClickProcessSubititle = async () => {
    const { filePath, encoding } = dataInfo.current
    window.api.send('process-subtitle', { filePath, encoding })
    setProcessing({className: 'processing', text: 'Processando'})
       
    //let progress = 0
    /*while (progress < card.totalDialogs) {
      await sleep(10)
      
      progress = progress + percent
    }*/
  }

  /*const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }*/

  React.useEffect(() => {
    
    window.api.receive('file-selected', (data) => {
      if (data.filePath) {
        dataInfo.current = { ...data }
        setBadgeProps((badge) => {
          return {
            type: 'button',
            bg: 'info',
            color: '#171a20',
          }
        })
        setCard((card) => {
          return {
            ...dataInfo.current,
          }
        })
      } else {
        if (!dataInfo.current.filePath) {
          setBadgeProps((badge) => {
            return {
              type: '',
              bg: 'secondary',
              color: 'white',
            }
          })
          setCard((card) => {
            return {
              filePath: '',
              encoding: '0',
              language: 'n/a',
              totalDialogs: 0,
              filesize: 0,
            }
          })
        }
      }
      if (dataInfo.current.totalDialogs) {
        setDisabledButton(false)
      }
    })
    window.api.receive('srt-processing', (data) => {
      setTotalProcess((totalProcess) => data)
    })
    if(totalProcess === dataInfo.current.totalDialogs) {
      setProcessing({className: 'finished', text: ''})
    }
  }, [card, totalProcess])

  return (
    <>
      <Form>
        <Button
          variant='primary'
          id='load-srt-button'
          onClick={onClickLoadSrt}
          className='mb-3'
        >
          <b>Carregar</b>
        </Button>
        <Form.Group className='mb-3'>
          <AppCard
            cardBody={card}
            badgeProps={badgeProps}
            onClinckShowSubtitle={onClinckShowSubtitle}
          />
        </Form.Group>
        <Button
          variant='secondary'
          type='submit'
          disabled={disabledButton}
          className='mb-3'
          onClick={onClickProcessSubititle}
        >
          <b>Processar Legenda</b>
        </Button>
      </Form>
      
      {(totalProcess > 0) ? (   
        
        <div>
          <span className={processing.className}>{processing.text}</span>
          <ProgressBar
            animated
            variant='info'
            now={totalProcess}
            max={dataInfo.current.totalDialogs}
            label={<b>{`${totalProcess} de ${dataInfo.current.totalDialogs}`}</b>}
          />
        </div>     
      ) : (
        ''
      )}
    </>
  )
}

export { AppForm }
