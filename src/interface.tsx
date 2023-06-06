
export interface DialogConfig{
  show: boolean,
  cacheKey?: string
  comments?: Comment[] | []
  top?: number,
  left?: number,
}

export interface DialogProps{
  onClose: () => void,
  top: number | undefined,
  left: number |  undefined,
  comments?: Comment[] | [],
  cacheKey: string |  undefined,
}

export interface Comment{
  value: string |  undefined
}
