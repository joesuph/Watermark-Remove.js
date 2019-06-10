var image = document.getElementById('img');
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
drawImage(image);

function drawImage(image) {
    // Set the canvas the same width and height of the image
    canvas.width = image.width;
    canvas.height = image.height;
    
    context.drawImage(image, 0, 0);
  }

var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;

for (var i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = 255 - imageData.data[i];
    imageData.data[i + 1] = 255 - imageData.data[i+1]
    imageData.data[i + 2] = 255 - imageData.data[i+2]
}
context.putImageData(imageData, 0, 0);