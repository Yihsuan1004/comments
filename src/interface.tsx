
export interface DialogConfig{
  show: boolean,
  value?: string;
  top?: number,
  left?: number
}

export interface DialogProps{
  onClose: () => void,
  top: number | undefined,
  left: number |  undefined,
  value: string |  undefined
}

export interface Comment{
  value: string |  undefined
}
