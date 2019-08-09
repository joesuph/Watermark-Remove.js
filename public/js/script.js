var image;
var canvas;
var context;
var imageData;
var tint;
var alpha;
var paint = false;
var edget;
var first;
var last;

window.addEventListener('load', init);

function init()
{
    /********************************************
    Add Watermark to image and place it in canvas
    ********************************************/
    image = document.getElementById('img');
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    tint = [255,255,255]
    imageData.data = addWatermark(imageData.data,tint);

    context.putImageData(imageData,0,0);
    

    /*********************************************
     Set up event handlers for watermark selecting
     *********************************************/
    canvas.onmousedown = (e)=>{paint=true;edget = new Set([intify(findPos(e,canvas))]);first = findPos(e,canvas);last =findPos(e,canvas);}
    canvas.onmousemove = (e)=>{
      if(paint)
      {
        var data = imageData.data;
        console.log('move');
        var p1 = findPos(e,canvas);
        var lp = getLinePoints(last,p1);
        last = p1;
        for(var i=0;i<lp.length;i++)
        {
          edget.add(intify(lp[i]));
          data[(lp[i][1]*image.width + lp[i][0])*4] = 0;
          data[(lp[i][1]*image.width + lp[i][0])*4+1] = 255;
          data[(lp[i][1]*image.width +lp[i][0])*4+2] = 0;
          imageData.data = data;
          
        }
        edget.add(intify(p1));

        data[(p1[1]*image.width + p1[0])*4] = 0;
        data[(p1[1]*image.width + p1[0])*4+1] = 255;
        data[(p1[1]*image.width + p1[0])*4+2] = 0;
        imageData.data = data;
        context.putImageData(imageData,0,0);
      }
    }
    canvas.onmouseleave = ()=>{paint=false;}
    canvas.onmouseup = ()=>
    {
      var data = imageData.data;
      paint=false;
      lp = getLinePoints(first,last);
      for(var i=0;i<lp.length;i++)
      {
        edget.add(intify(lp[i]));
        data[(lp[i][1]*image.width + lp[i][0])*4] = 0;
        data[(lp[i][1]*image.width + lp[i][0])*4+1] = 255;
        data[(lp[i][1]*image.width +lp[i][0])*4+2] = 0;
        imageData.data = data;
        
      }
      context.putImageData(imageData,0,0);
    }
}


/*************************************************
 * Adds watermark to imageData
 *  params = (imageData,tint_of_desired_watermark)
 *************************************************/
function addWatermark(data,tint)
{
  //Get Inidices
  var maskRatio = Math.random() * .5;
  var maskimageratio = .3;
  var maskwidth = maskRatio * image.width * maskimageratio;
  var maskheight = maskRatio * image.height * maskimageratio;
  var maskAmount = Math.floor(maskimageratio * image.width * image.height / (maskwidth * maskheight));
  
  var indices = new Map();
  for(var a=0;a<maskAmount;a++)
  {
    var rx = Math.floor(image.width * Math.random() * (1-maskwidth/image.width));
    var ry = Math.floor(image.height * Math.random() * (1 - maskheight/image.height));
    for (var i=ry;i<ry+maskheight;i++)
    {
      if (indices.get(i) == undefined)
          indices.set(i,new Set());
      for(var j=rx;j<rx + maskwidth;j++){indices.get(i).add(j);}
    }
  }

  //Apply tint to indices
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


/**********************************
 * Get Position of mouse in canvas
 *    params = (event, canvas)
 ***********************************/
function findPos(e,obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
      do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return [e.pageX-curleft, e.pageY-curtop];
  }
  return undefined;
}

/**********************************************
 * Returns inner pixel from a set of pixel edges
 *  params = (edge_set_as_ints)
 ***********************************************/
function getInner(edges)
{
  var edd;
  for(var i=0;i<edges.length;i++){edd.push(pointify(edges[i]))}
  var arr = edd.sort((a,b)=>{return a[0]-b[0]});
  var left = arr[0][0];
  var avg = (arr[1][1] + arr[2][1])/2;
  return [left+1,Math.round(avg)];
}

/*******************************************************
 * Convert to and from point and integer representations
 ******************************************************/
function intify(point){return point[0] + point[1] * image.width;}
function pointify(num){return [num % image.width,Math.floor(num / image.width)];}

/*******************************************************
 * Get integer representation of pixels within edge list
 * starting from innerpoint
 *******************************************************/
function fill(edges,inner)
{
  var visited = new Set();
  var visit_later=[inner];
  while(visit_later.length != 0)
  {
    visit__later
  }
}


/***********************************************************
 * Get the pixels along the straight line between two points
 ************************************************************/
function getLinePoints(p1,p2)
{
	var slope;
  var b;
  var e;
  var original;
  
  var horiz = Math.abs(p1[0]-p2[0]) > Math.abs(p1[1]-p2[1]);
  
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
    else {b=p2[1];e=p1[1];original=p2[0];}
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