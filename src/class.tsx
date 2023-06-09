import { fabric } from 'fabric';

export class CustomImage extends fabric.Image {
  // Add your custom properties or methods here
  isFirstSelected?: boolean;
  isMoved?: boolean;
  imgType?: 'comment' | 'picture';
  collections?: CommentImage[];
}


export class CommentImage extends fabric.Image {
  // Add your custom properties or methods here
  isFirstSelected?: boolean;
  isMoved?: boolean;
  imgType?: 'comment' | 'picture';
  relationship?: number[];
  parentImg?: CustomImage;
  // Add your custom methods or overrides here
}