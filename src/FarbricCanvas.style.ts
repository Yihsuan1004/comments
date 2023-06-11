import styled from '@emotion/styled'



export const ToolBar = styled.div((props: any)=>({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#4553D4',
    fontSize: '14px', 
    padding: '0',
    display: 'flex',
    button:{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '14px', 
      backgroundColor: '#4553D4',
      transition: 'background-color .4s',
      '&:first-of-type': {
        backgroundColor: props.mode === 'move' ? '#f0ad4e' : '#4553D4',
        pointerEvents: props.mode === 'move' ? 'none' : 'auto'
      },
      '&:nth-of-type(2)': {
        backgroundColor: props.mode === 'comment' ? '#f0ad4e' : '#4553D4', 
        pointerEvents:  props.mode === 'comment' ? 'none' : 'auto'
      },
      '&:hover': {
        backgroundColor: '#3d48af',
      },
      img: {
        marginRight:'8px',
        width:'36px'
      }
    }
}));
  
