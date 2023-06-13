# Comments Project
This project is designed to provide users with the ability to add comments to a page that includes a canvas. The canvas displays static images, and users can interact with the canvas to add comments anywhere on the image.

---
## Demo
Here is demo :
https://yihsuan1004.github.io/comments/

---
## Features
The Comment System project includes the following features:
### 1. Multiple Images: 
The canvas can display more than one image, allowing users to interact with and comment on different images.
### 2. Comment Thread: 
Users can start a comment thread anywhere on the canvas. Clicking on the displayed image adds a new comment marker to the canvas and opens the comment dialog.
### 3. Comment Marker Position: 
Comment markers exist in the canvas and retain their position relative to the displayed image, regardless of pan and zoom settings.

### 4. Attachment to Images: 
If comments are placed on a specific image, they are attached to that image. If the image is moved or removed, all comments associated with it move accordingly.
### 5. Comment Dialog: 
The comment dialog is implemented outside of the canvas using React. The dialog includes a thread of comments and a field to add a new comment. It can also be closed.
### 6. Comment Display: 
Comments in the system display the following information:
1. Content of the comment
2. Time the comment was posted
3. Username of the comment author
