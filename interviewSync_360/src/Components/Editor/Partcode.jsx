import { useContext } from 'react';

import React from 'react'
import Editor from './Editor'

import { Box, styled } from '@mui/material';

import { DataContext } from "../../context/DataProvider"

const Container = styled(Box)`
    background-color: #060606;
    height: 50vh;
    display: flex;
`

const Partcode = () => {

  const { html, css, js, setHtml, setCss, setJs } = useContext(DataContext);

  return (
    <Container>
      <Editor
        heading="HTML"
        icon="/"
        color='#FF3C41'
        value={html}
        onChange={setHtml}
      />
      <Editor
        heading="CSS"
        icon="*"
        color='#0EBEFF'
        value={css}
        onChange={setCss}
      />
      <Editor
        heading="JavaScript"
        icon="( )"
        color='#FCD000'
        value={js}
        onChange={setJs}
      />
    </Container>
  )
}

export default Partcode