import styled from '@emotion/styled'
import { PositionProps } from '../../interface';



export const DialogContainer = styled.div((props:PositionProps) =>({
    position: 'absolute',
    top: (props.top || 0),
    left: (props.left || 0),
    padding: '48px 16px 16px 16px',
    width: '300px',
    backgroundColor: 'white',
    fontSize: '14px', 
    borderRadius: '8px',
    boxShadow: 'rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px',
    boxSizing: 'border-box',
    '& div': {
      boxSizing: 'border-box'
    },
  }));
  
  
export const UserInfo = styled.div({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px'
  });

export const DialogContent = styled.div({
    padding: '12px 0',
    borderTop: '1px solid #eee',
});
  
  
export const UserName = styled.div({
    color: 'black',
    fontWeight: '700'
  });
  
  
export const UserTime = styled.div({
    color: '#b3b3b3'
  });
  
  
export const UserComment = styled.div({
    color: '#222222'
  });
  
  
export const CommentContainer = styled.div({
    display:'flex',
    alignItems: 'center',
    padding: '4px',
    border: '1px solid #bbb',
    borderRadius: '8px',
    '&:hover': {
      borderColor: '#999',
    },

    textarea: {
      padding: '8px',
      width: '100%',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: '8px 0 0 8px',
      transition: 'all .4s',
      fontSize: '14px',
      '&:focus': {
        outline: 'none',
        borderColor: '#777',
      },
    },
    button: {
      padding: '0 12px',
      width: '32px',
      height: '32px',
      borderRadius: '50px',
      border: 'none',
    },
})

export const DialogToolBar = styled.div({
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '12px 16px',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    button:{
      padding: '6px',
      width: '30px',
      height: '30px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#fff',
      transition: 'background-color 0.4s',
      cursor: 'pointer',
      img:{
        width: '100%',
        height: 'auto'
      },
      '&:hover': {
        backgroundColor: '#eee',
      },
      '&:first-of-type': {
        marginRight: '4px'
      },
    }
});

