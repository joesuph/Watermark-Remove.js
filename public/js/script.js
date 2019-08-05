var image;
var canvas;
var context;
var imageData;
var tint;
var alpha;
var paint = false;

window.addEventListener('load', init);

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
          context.putImageData(data,0,0);
        }
  }

  return data;
}


function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x,y];
}

/*
const canvas = document.querySelector('canvas')
canvas.addEventListener('mousedown', function(e) {
    point = getCursorPosition(canvas, e);
    imageData.data
})
*/


function init2(){
    canvas.onmousedown = ()=>{paint=true;}
    canvas.onmousemove = (e)=>{
      if(paint)
      {
        console.log('move');
        var p1 = getCursorPosition(canvas,e);
        var data = imageData.data;
        data[(p1[1]*image.width + p1[0])*4] = 255
        data[(p1[1]*image.width + p1[0])*4+1] = 255
        data[(p1[1]*image.width + p1[0])*4+2] = 0

      }
    }
    canvas.onmouseleave = ()=>{paint=false;}
    canvas.onmouseup = ()=>{paint=false;}
}

function getLinePoints(p1,p2)
{
	var slope;
  var b;
  var e;
  var original;
  
  var horiz = p1[0]-p2[0] > p1[1]-p2[1];
  //Get start x,y and ending y
  if(horiz)
  {
    if(p1[0]<p2[0]){b=p1[0];e=p2[0];original=p1[1];}
    else {b=p2[0];e=p1[0];original=p2[1];}
    slope = (p1[1]-p2[1])/(p1[0]-p2[0]);

  }
  else
  {
    if(p1[1]<p2[1]){b=p1[1];e=p2[1];original=p1[0];}
    else {b=p2[1];e=p1[1];original=p1[0];}
    slope = (p1[0]-p2[0])/(p1[1]-p2[1]);
  }
  var nps = [];
	var s = b + 1;
  //(yn-yo)/(xn-xo)=slope
  // yn = slope*(xn-xo)+yo
  while(s<e)
	{
	if(horiz)nps.push([s,Math.round((s-b)*slope+original)])
  else nps.push([Math.round((s-b)*slope+original),s])
  
	s+= 1;
	}
	return nps;
  
}


//onmousedown start paint
//while paint, on mousemove add pixel to edgeList
//on mouseup connect last pixel to first pixel with edgePixels, toggle paint

//on remove watemark button, get list of pixels in the region
//Add a rgb color dial and and alpha dial and edit the pixels in the region