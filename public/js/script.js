var image;
var canvas;
var context;
var imageData;
var tint;
var alpha;

window.addEventListener('load', init);
function init()
{
image = document.getElementById('img');
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');
drawImage(image);

imageData = context.getImageData(0, 0, canvas.width, canvas.height);

tint = [Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255)]
alpha = .25;
imageData.data = addWatermark(imageData.data,image.width,image.height,tint,alpha);

context.putImageData(imageData,0,0);

}

function drawImage(image) {
    // Set the canvas the same width and height of the image
    canvas.width = image.width;
    canvas.height = image.height;
    
    context.drawImage(image, 0, 0);
  }

  function addWatermark(data,dx,dy,tint,alpha)
{
  console.log("Tint:");
  console.log(tint);

  //Get Inidices
  var maskRatio = Math.random();
  var maskamountratio = .3;
  var maskwidth = maskRatio * image.width * maskamountratio;
  var maskheight = maskRatio * image.height * maskamountratio;
  var maskAmount = Math.floor(maskamountratio * image.width * image.height / (maskwidth * maskheight));

  
  var indices = new Map();
  for (var i=Math.floor(dx /4);i<Math.floor((dx * 3) /4);i++)
  {
    if (indices.get(i) == undefined)
        indices.set(i,new Set());
    for(var j=0;j<dy;j++)
    {
        indices.get(i).add(j);
    }
  }
  //Apply tint to indices
  console.log(indices.entries.length)
  for (var i=0;i<data.length;i += 4)
  {
    if (indices.get(Math.floor(i/(4*dx))) != undefined)
        if(indices.get(Math.floor(i/(4*dx))).has((i/4)%dx))
        {
          data[i] = (1-alpha) * data[i] + alpha * tint[0]
          data[i+1] = (1-alpha) * data[i] + alpha * tint[1]
          data[i+2] = (1-alpha) * data[i] + alpha * tint[2]
        }
  }

  return data;
}