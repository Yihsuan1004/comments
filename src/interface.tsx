
export interface DialogConfig{
  show: boolean,
  cacheKey?: string
  value?: string;
  top?: number,
  left?: number,
}

export interface DialogProps{
  onClose: () => void,
  top: number | undefined,
  left: number |  undefined,
  value: string |  undefined,
  cacheKey: string |  undefined,
}

export interface Comment{
  value: string |  undefined
}
