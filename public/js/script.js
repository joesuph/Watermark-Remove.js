var image;
var canvas;
var context;
var imageData;
var tint;
var alpha;

window.addEventListener('load', init);
/**
 * Load image into canvas.
 * Apply watermark to image.
 */
function init()
{
  image = document.getElementById('img');
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);

  imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  tint = [255,255,255]
  imageData.data = addWatermark(imageData.data,image.width,image.height,tint);

  context.putImageData(imageData,0,0);

  init2();
}



  function addWatermark(data,dx,dy,tint)
{
  console.log("Tint:");
  console.log(tint);

  //Get Inidices
  var maskRatio = Math.random() * .5;
  var maskimageratio = .3;
  var maskwidth = maskRatio * image.width * maskimageratio;
  var maskheight = maskRatio * image.height * maskimageratio;
  var maskAmount = Math.floor(maskimageratio * image.width * image.height / (maskwidth * maskheight));

  
  var indices = new Map();
  for(var a=0;a<maskAmount;a++)
  {

    //
    var rx = Math.floor(image.width * Math.random() * (1-maskwidth/image.width));
    var ry = Math.floor(image.height * Math.random() * (1 - maskheight/image.height));
    for (var i=ry;i<ry+maskheight;i++)
    {
      if (indices.get(i) == undefined)
          indices.set(i,new Set());
      for(var j=rx;j<rx + maskwidth;j++)
      {
          indices.get(i).add(j);
      }
    }
  }

  //Apply tint to indices
  console.log(indices.entries.length)
  var alpha = Math.random() * .8;
  for (var i=0;i<data.length;i += 4)
  {
    if (indices.get(Math.floor(i/(4*image.width))) != undefined)
        if(indices.get(Math.floor(i/(4*image.width))).has((i/4)%image.width))
        {
          data[i] = (1-alpha) * data[i] + alpha * tint[0]
          data[i+1] = (1-alpha) * data[i+1] + alpha * tint[1]
          data[i+2] =(1-alpha) * data[i+2] + alpha * tint[2]
        }
  }

  return data;
}

/*
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x,y];
}

const canvas = document.querySelector('canvas')
canvas.addEventListener('mousedown', function(e) {
    point = getCursorPosition(canvas, e);
    imageData.data
})
*/

//extra
var offsetLeft;
  var offsetTop;
  var elPage;
  var scrollLeft;
  var scrollTop ;
  var drawing = false;
  var lastPos = null;

 function init2(){
  var offsetLeft = canvas.offsetLeft;
  var offsetTop  = canvas.offsetTop;
  var elPage = document.body;
  var scrollLeft = elPage.scrollLeft;
  var scrollTop  = elPage.scrollTop;

  var drawing = false;
  var lastPos = null;
}

listen(canvas, 'mousedown', function(event) {
    drawing = true;
    lastPos = getPos(event);
});
listen(canvas, 'mousemove', function(event) {
    if (!drawing) {
        return;
    }
    
    var p = getPos(event);
    context.beginPath();
    context.moveTo(lastPos[0], lastPos[1]);
    context.lineTo(p[0], p[1]);
    context.stroke();
    lastPos = p;
});
listen(document, 'mouseup', function(event) {
    drawing = false;
});
listen(document.querySelector('#download'), 'click', function(event) {
    window.open(canvas.toDataURL(), '_blank');
});

listen(document, 'scroll', function(event) {
    scrollLeft = elPage.scrollLeft;
    scrollTop  = elPage.scrollTop;
});

function listen(elem, type, listener) {
    elem.addEventListener(type, listener, false);
}

function getPos(event) {
    var x = event.clientX - offsetLeft + scrollLeft;
    var y = event.clientY - offsetTop  + scrollTop;
    return [x, y];
}