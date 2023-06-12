import styled from '@emotion/styled';




export const ToolBar = styled.div((props: any)=>({
    position: 'absolute',
    top: '0',
    left: '0',
    padding: '0',
    width: '100%',
    backgroundColor: '#3d3e45',
    fontSize: '14px', 
}));
  

export const Header = styled.div({
  width: '100%',
  height: '50px',
  boxSizing: 'border-box',
  backgroundColor: '#4553D4',
});

export const FlexContainer = styled.div({
  display: 'flex',
  alignItems: 'center'
})

export const UserContainer = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
  height: '50px',
  boxSizing: 'border-box',
  backgroundColor: '#4553D4',
  div:{
    color: 'white',
    transition: 'background-color 0.4s',
    cursor: 'pointer',
  }
});

export  const Avatar =  styled.div({
  marginRight: '12px',
  width: '30px',
  height: '30px',
  borderRadius: '15px',
  lineHeight: '30px',
  textAlign: 'center',
  backgroundColor: '#d0118b',
})

export  const UserName =  styled.div({
  width: '160px',
  minWidth: '160px',
  height: '30px',
  lineHeight: '30px',
  textAlign: 'left',
  fontWeight: '700',
  backgroundColor: '#4553D4',
})


export const ButtonContainer =  styled.div({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  cursor: 'pointer',
  button:{
    padding: '8px',
    width: '200px',
    boxSizing: 'border-box',
    border: 'none',
    backgroundColor: 'transparent',
    transition: 'background-color 0.4s',
    cursor: 'pointer',
    color: 'white',
    '&:hover': {
      backgroundColor: '#333',
    },
  }
})


export const ModeButton = styled.button((props: any)=>({
  padding: '8px 16px',
  cursor: 'pointer',
  border: 'none',
  color: 'white',
  fontSize: '14px', 
  backgroundColor: '#3d3e45',
  '&:first-of-type': {
    backgroundColor: props.mode === 'move' ? '#f0ad4e' : '#3d3e45',
    pointerEvents: props.mode === 'move' ? 'none' : 'auto'
  },
  '&:nth-of-type(2)': {
    backgroundColor: props.mode === 'comment' ? '#f0ad4e' : '#3d3e45', 
    pointerEvents:  props.mode === 'comment' ? 'none' : 'auto'
  },
  '&:hover': {
    backgroundColor: '#2a2b2f',
  },
  img: {
    width:'28px'
  }
}))
