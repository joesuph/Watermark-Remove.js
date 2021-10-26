var image = document.getElementById('img')
var canvas;
var context;
var imageData;
var tint;
var alpha;
var paint = false;
var edget;
var first;
var last;
var wimdata;
var region = new Set();


$('#example').click(()=>{
    image.src='example.jpg';
    $('#area').show()
    setTimeout(initRemoval,1000)
})

var upload_set_butt = $('#upload').change(()=>{
  var fr = new FileReader();
  fr.onload = ()=>{
      image.src = fr.result;
      $('#area').show()
      setTimeout(initRemoval,1000)
  }
  fr.readAsDataURL($('#upload')[0].files[0])
})

function initRemoval()
{
  
    /********************************************
    Add Watermarked image and place it in canvas
    ********************************************/
    if(image.width > image.height)
      image.width = 500;
    else
      image.height = 500;

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, dWidth = image.width,dHeight=image.height);

    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    tint = [255,255,255]
    //imageData.data = addWatermark(imageData.data,tint);
    wimdata = new Uint8ClampedArray(imageData.data);
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


      var inner = getInner(Array.from(edget));
      var visited = Array.from(fill(edget,inner));
      visited.forEach(item => region.add(item));
      var vot=[];
      for(var i=0;i<visited.length;i++){vot.push(pointify(visited[i]));}

      for(var i=0;i<vot.length;i++)
      {
        data[(vot[i][1]*image.width + vot[i][0])*4] = 255 * .25 + data[(vot[i][1]*image.width + vot[i][0])*4] * .75;
        data[(vot[i][1]*image.width + vot[i][0])*4+1] = 255 * .25 + data[(vot[i][1]*image.width + vot[i][0])*4+1]*.75 ;
        data[(vot[i][1]*image.width +vot[i][0])*4+2] = 0+ data[(vot[i][1]*image.width +vot[i][0])*4+2]*.75;
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
  var edd=[];
  for(var i=0;i<edges.length;i++){edd.push(pointify(edges[i]))} //Fill edd with the point notation of the data from edges
  var arr = edd.sort((a,b)=>{return a[0]-b[0]});               //Sort to get  the farthest left point
  var left = arr[0][0];
  var avg = (arr[1][1] + arr[2][1])/2;                        //Take the avg of nearby points to get the trend of height
  return [left+1,Math.round(avg)];             //return inner point as 1 pixel to the right of the leftist edge pixel and the height of the avg
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
  var r;
  var l;
  var d;
  var u;

  var count=0;
  var visited = new Set();
  var visit_later=new Set([intify(inner)]);
  while(visit_later.length != 0)
  {
    v = pointify(Array.from(visit_later)[0]);
    r = intify([v[0]+1,v[1]])
    l = intify([v[0]-1,v[1]])
    d = intify([v[0],v[1]+1])
    u = intify([v[0],v[1]-1])

    if(!visited.has(r) && !edges.has(r))
      visit_later.add(r)
    if(!visited.has(l) && !edges.has(l))
      visit_later.add(l)
    if(!visited.has(d) && !edges.has(d))
      visit_later.add(d)
    if(!visited.has(u) && !edges.has(u))
      visit_later.add(u)
    
    visited.add(intify(v));
    visit_later.delete(intify(v));

    count++;
    if(count > image.width * image.height * .5){console.log('Diverge');return visited;}
    
  }
  return visited;
}


/***********************************************************
 * Get the pixels along the straight line between two points
 ************************************************************/
function getLinePoints(p1,p2)
{
	var slope;
  var begin;
  var end;
  var original;
  
  var horiz = Math.abs(p1[0]-p2[0]) > Math.abs(p1[1]-p2[1]); //Find pixel increment direction
  
  //Get start x,y and ending y
  if(horiz)     //if pixel increment is left to right
  {
    if(p1[0]<p2[0]){begin=p1[0];end=p2[0];original=p1[1];}
    else {begin=p2[0];end=p1[0];original=p2[1];}
    slope = (p1[1]-p2[1])/(p1[0]-p2[0]);

  }
  else
  {
    if(p1[1]<p2[1]){begin=p1[1];end=p2[1];original=p1[0];}
    else {begin=p2[1];end=p1[1];original=p2[0];}
    slope = (p1[0]-p2[0])/(p1[1]-p2[1]);
  }
  var nps = [];
	var state = begin + 1;
  //(yn-yo)/(xn-xo)=slope
  // yn = slope*(xn-xo)+yo
  while(state<end)
	{
	  if(horiz)nps.push([state,Math.round((state-begin)*slope+original)])
    else nps.push([Math.round((state-begin)*slope+original),state])
	  state+= 1;
	}
	return nps;
  
}

document.getElementById('done').onclick = done;

function done()
{
  $('#done').remove()
  $('#canvas').remove()
  document.body.removeChild(canvas);
  var c = document.createElement("canvas");
  c.id = 'edit';
  var ctx = c.getContext('2d')
  c.width = image.width;
  c.height = image.height;
  ctx.drawImage(image, 0, 0);
  imageData = ctx.getImageData(0, 0, c.width, c.height);
  //Added these 2 lines
  imageData.data.set(wimdata);
  ctx.putImageData(imageData,0,0);
  //Set imageData equal to one
  document.body.appendChild(c);

  //Add range
  var range = document.createElement('input');
  range.type = 'range';
  range.min = '1';
  range.max = '1000';
  range.style.display = 'block';
  document.body.appendChild(range);

  range.oninput = (e)=>{
    imageData.data.set(wimdata);
    var data = imageData.data;
    var alpha = range.value/1000;
    var arr = Array.from(region);
    var point;
    for(var i=0;i<arr.length;i++)
    {
      point = pointify(arr[i]);
      data[(point[1]*image.width + point[0])*4] = (data[(point[1]*image.width + point[0])*4]-(255 * alpha))/(1-alpha);
      data[(point[1]*image.width + point[0])*4+1] = (data[(point[1]*image.width + point[0])*4+1]-(255 * alpha))/(1-alpha);
      data[(point[1]*image.width +point[0])*4+2] = (data[(point[1]*image.width +point[0])*4+2]-(255 * alpha))/(1-alpha);

    }
    imageData.data = data;
    ctx.putImageData(imageData,0,0);
  };
}
