import styled from '@emotion/styled'


export const DialogContainer = styled.div((props:any) =>({
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
  
  
export const DialogContent = styled.div({
    padding: '12px 0',
    borderTop: '1px solid #eee',
});
  

export const CommentContainer = styled.div({
    display:'flex',
    alignItems: 'center'
})
 

export const CommentInput = styled.input({
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #bbb',
    borderRight: 'none',
    borderRadius: '8px 0 0 8px',
    transition: 'all .4s',
    '&:hover': {
        borderColor: '#999',
    },
    '&:focus': {
      outline:'none',
      borderColor: '#777'
    }
 })




export const CommentButton = styled.button({
    height: '33px',
    borderRadius: '0 8px 8px 0',
    padding: '0 12px',
    border:'1px solid #777'
})
   
   
export const ToolBar = styled.div({
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '12px 16px',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
});