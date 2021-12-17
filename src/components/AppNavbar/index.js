import React from 'react'
import { Navbar, Container } from 'react-bootstrap'

const AppNavbar = (props) => {

  return (
    <Navbar bg='dark' variant='dark'>
      <Container>
        <Navbar.Brand>
          <img
            alt=''
            src='assets/icons/icon-white.png'
            width='30'
            height='30'
            className='d-inline-block align-top'
          />{' '}
          { props.tittle }
        </Navbar.Brand>
      </Container>
    </Navbar>
  )
}

export { AppNavbar }

