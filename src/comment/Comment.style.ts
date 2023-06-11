import styled from '@emotion/styled'
import { PositionProps } from '../interface';



export const CommentContainer = styled.div((props:PositionProps) => ({
    position: ((props.top || props.left) ? 'absolute':'static'),
    top: (props.top || 0),
    left: (props.left || 0),
    display:'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
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
}))

export const ToolBar = styled.div({
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '12px 16px',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
});

