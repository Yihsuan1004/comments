
export interface DialogConfig{
  show: boolean,
  cacheKey?: string
  comments?: CommentPanel[] | []
  top?: number,
  left?: number,
}

export interface DialogProps{
  onClose: () => void,
  onDelete: () => void,
  top: number | undefined,
  left: number |  undefined,
  comments?: CommentPanel[] | [],
  cacheKey: string |  undefined,
}

export interface CommentPanel{
  name: string,
  value: string |  undefined
  time: string
}


export interface PositionProps {
  top: number |  undefined,
  left: number |  undefined
}