import { fabric } from 'fabric';
import { ImgType } from './type';

export class CustomImage extends fabric.Image {
  // Add your custom properties or methods here
  isFirstSelected?: boolean;
  isMoved?: boolean;
  imgType?: ImgType;
  collections?: CommentImage[];
}


export class CommentImage extends fabric.Image {
  // Add your custom properties or methods here
  isFirstSelected?: boolean;
  isMoved?: boolean;
  imgType?: ImgType;
  relationship?: number[];
  parentImg?: CustomImage;
  // Add your custom methods or overrides here
}