/**
 * by Curiosum, based on greggman / http://greggman.com/,  Hans Eklund
 */
 
if (!window.requestAnimationFrame)
{

	window.requestAnimationFrame = (function ()
	{

		return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function ( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element)
			{

				window.setTimeout(callback, 1000 / 50);

			};

	})();

}


// GLOBALS
var literki=['a','ą','b','c','ć','d','e','ę','f','g','h','i','j','k','l','ł','m','n','ń','o','ó','p','r','s','ś','t','u','w','y','z','ź','ż'];
var literkiCount=literki.length;
var windWidth;
var literkiWidth=50;
var literkiHeight=50;
var rowsCount;
var literkiPerRow;
var input = {
	dragStartX: 0,
	dragStartY: 0,
	dragX: 0,
	dragY: 0,
	dragDX: 0,
	dragDY: 0,
	dragging: false
};
var current_element = null;
var current_element_id=0;
var posX = 0;
var posY = 0;
var dX = 0;
var dY = 0;
var snap=false;
var containerWidth = document.getElementById('container').offsetWidth;
//console.log('containerWidth: '+containerWidth);
var containerHeight = document.getElementById('container').offsetHeigth;
var prefixedTransform;
var Literki=[];
var Positions = [];
var Words = [];
var counter=100;

window.onload =init();


function init()
	{
		if ('transform' in document.body.style)
		{
			prefixedTransform = 'transform';
		}
		else if ('webkitTransform' in document.body.style)
		{
			prefixedTransform = 'webkitTransform';
		}


		var container = document.getElementById('container');

		//Literki = document.getElementsByTagName('literka');


		setSize(container);
		var n=0;
		// listeners
		for (var r = 0; r < rowsCount; r++)
		{
		for (var p = 0; p < literkiPerRow; p++)
		{
			if(literki[n])
			{
			Literki[n]=document.createElement("literka");
			Literki[n].id='literka'+n;
			Literki[n].setAttribute('ltrid', n);
			Literki[n].setAttribute('clone', 'true');
			Literki[n].style.top=(r*literkiWidth)+'px';
			Literki[n].style.left=(p*literkiWidth)+'px';
			Literki[n].style.width=literkiWidth-10+'px';
			Literki[n].style.height=literkiWidth-10+'px';
			Literki[n].style.fontSize=(literkiWidth-10)*0.9+'px';
			Literki[n].style.lineHeight=literkiWidth-10+'px';
			Literki[n].innerHTML=literki[n];
			container.appendChild(Literki[n]);
			
			if (window.PointerEvent)
			{
				input.pointers = [];
				Literki[n].addEventListener("pointerdown", pointerDownHandler, false);

			}
			else
			{
				Literki[n].addEventListener('touchstart', onTouchStart);
				//Literki[n].addEventListener('touchstart', cloneElement);
				Literki[n].addEventListener('mousedown', onMouseDown);
				//Literki[n].addEventListener('mousedown', cloneElement);
			}
			}
		n++;	
		}
		}

		onAnimationFrame();


	}
function setSize(el){
	
	windWidth = document.getElementById('container').offsetWidth;
	windHeight = document.getElementById('container').offsetHeight;
	
	rowsCount=Math.floor(Math.sqrt((windHeight*literkiCount)/(3*windWidth)));	
	literkiPerRow=Math.ceil(literkiCount/rowsCount);
	literkiWidth=windWidth/literkiPerRow;
	//literkiWidth=Math.floor(literkiWidth);
	literkiWidthStr=literkiWidth.toString()+'px';
	
	console.log('literkiCount: '+literkiCount);
	console.log('windWidth: '+windWidth);
	console.log('windHeight: '+windHeight);
	
	console.log('rowsCount: '+rowsCount);
	console.log('literkiPerRow: '+literkiPerRow);
	console.log('literkiWidth: '+literkiWidth);
	
	
}
function onAnimationFrame()
	{
		requestAnimationFrame(onAnimationFrame);
		snap=false;
		
		posX = input.dragX-dX;
		posY = input.dragY-dY;
		
		//restict horizontally
		if (posX < 0) posX = 0;
		else if (posX > containerWidth) posX = containerWidth;

		//restict vertically
		if (posY < 0) posY = 0;
		else if (posY > containerHeight) posY = containerHeight;

		
		
		if (current_element)
		{
		Positions.forEach( function(element,id)
		//for(element in Positions)
		{
			var id=element.id;
			var px=element.posX-(input.dragX-dX);
			var py=element.posY-(input.dragY-dY);
			
			// kasujemy wszystkie odniesienia do bieżącego elementu
			if(Positions[id].next==current_element_id) delete Positions[id].next;
			if(Positions[id].prev==current_element_id) delete Positions[id].prev;
			
			
			
			if(id==current_element_id) {} // omijamy sprawdzanie samego ze sobą
			else if(py<(literkiWidth/2) && py>-(literkiWidth/2))  // góra dół
					{
						// lewa strona
						if(px<(literkiWidth+10) && px>0) 
							{
								if(Positions[id].prev) return; //blokada wstawiania w środku słowa
								
								
								posX=element.posX-literkiWidth+1;
								posY=element.posY;
								snap='left';
								snap_id=id;							
								
								// ustawiamy wskaźniki dla lewej strony
								Positions[current_element_id].next=id;
								Positions[id].prev=current_element_id;
								
							}
						else // zdejmujemy wskaźnik z elementu obok (jeżeli to odpowiedni wskaźnik)
						if(Positions[current_element_id].next==id) 
							{delete Positions[current_element_id].next;}
					
						
						
						// prawa strona
						if(px>-(literkiWidth+10) && px<0) 
							{
								if(Positions[id].next) return; //blokada wstawiania w środku słowa
								
								posX=element.posX+literkiWidth-1;
								posY=element.posY;
								snap='right';
								snap_id=id;
								
								// ustawiamy wskaźniki dla prawej strony
								Positions[id].next=current_element_id;
								Positions[current_element_id].prev=id;
								
							}
						else  // zdejmujemy wskaźnik z elementu obok (jeżeli to odpowiedni wskaźnik)
						if(Positions[current_element_id].prev==id) 
						{delete Positions[current_element_id].prev;}
						
					}
				else 
					{	// tu zdejmujemy wskaźniki jeśli wyjeżdżamy w górę i w dół
						if(Positions[current_element_id].next==id) 
							delete Positions[current_element_id].next;
						if(Positions[current_element_id].prev==id) 
							delete Positions[current_element_id].prev;
						
					}
				
		});

			
		
			current_element.style.left = posX + 'px';
			current_element.style.top = posY + 'px';
			Positions[current_element_id].id = current_element_id;
			Positions[current_element_id].posX = posX;
			Positions[current_element_id].posY = posY;
			
			
			
			
		}
		dump(Positions,'Positions');
		dump(snap, 'snap');	
	}


	/*
	 * Events
	 */
function cloneElement(element)
	{
		var clone=element.cloneNode(true);
		clone.id='literka'+counter;
		clone.setAttribute('ltrid',counter);
		clone.setAttribute('clone','true');
		counter++;
		document.getElementById('container').appendChild(clone);
		
		clone.addEventListener('touchstart', onTouchStart);
		clone.addEventListener('mousedown', onMouseDown);
				
		
	}
function onMouseDown(event)
	{

		current_element = this;
		
		
		current_element_id = parseInt(this.getAttribute('ltrid'));
		
		if(!Positions[current_element_id])
			Positions[current_element_id]={'id':current_element_id};
		
		if(Positions[current_element_id].next==undefined && Positions[current_element_id].prev==undefined) 
			play_letter(this.innerHTML);
		
		
		if (this.style.left) posX = parseInt(this.style.left.substring(0, this.style.left.length - 2));
		else posX = 0;

		if (this.style.top) posY = parseInt(this.style.top.substring(0, this.style.top.length - 2));
		else posY = 0;
		
		dX=event.clientX-posX;
		dY=event.clientY-posY;

		//console.log('start x:' + posX + ' y:' + posY + ' dX:' + dX + ' dY:' + dY);

		event.preventDefault();
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mousemove', ontMouseMove);
		handleDragStart(event.clientX, event.clientY);
	}

function ontMouseMove(event)
	{
		if (input.dragging) handleDragging(event.clientX, event.clientY);
	}

function onMouseUp(event)
	{
		document.removeEventListener('mouseup', onMouseUp);
		document.removeEventListener('mousemove', ontMouseMove);
		event.preventDefault();
		handleDragStop();
	}

function onTouchStart(event)
	{
		current_element = this;		
		
		current_element_id = this.getAttribute('ltrid');
		
		
		if(!Positions[current_element_id])
			Positions[current_element_id]={'id':current_element_id};
		
		if(Positions[current_element_id].next==undefined && Positions[current_element_id].prev==undefined) 
			play_letter(this.innerHTML);
		
		if (this.style.left) posX = parseInt(this.style.left.substring(0, this.style.left.length - 2));
		else posX = 0;

		if (this.style.top) posY = parseInt(this.style.top.substring(0, this.style.top.length - 2));
		else posY = 0;
		
		dX=event.touches[0].clientX-posX;
		dY=event.touches[0].clientY-posY;
		
		event.preventDefault();
		if (event.touches.length === 1)
		{
			handleDragStart(event.touches[0].clientX, event.touches[0].clientY);
			document.addEventListener('touchmove', onTouchMove);
			document.addEventListener('touchend', onTouchEnd);
			document.addEventListener('touchcancel', onTouchEnd);
		}
	}

function onTouchMove(event)
	{
		event.preventDefault();
		if (event.touches.length === 1)
		{
			handleDragging(event.touches[0].clientX, event.touches[0].clientY);
		}
	}

function onTouchEnd(event)
	{
		
		event.preventDefault();
		if (event.touches.length === 0)
		{
			handleDragStop(input.dragX, input.dragY);
			document.removeEventListener('touchmove', onTouchMove);
			document.removeEventListener('touchend', onTouchEnd);
			document.removeEventListener('touchcancel', onTouchEnd);
		}
	}

function indexOfPointer(pointerId)
	{
		for (var i = 0; i < input.pointers.length; i++)
		{
			if (input.pointers[i].pointerId === pointerId)
			{
				return i;
			}
		}
		return -1;
	}

function pointerDownHandler(event)
	{
		current_element = this;
		var pointerIndex = indexOfPointer(event.pointerId);
		if (pointerIndex < 0)
		{
			input.pointers.push(event);
		}
		else
		{
			input.pointers[pointerIndex] = event;
		}
		if (input.pointers.length === 1)
		{
			handleDragStart(input.pointers[0].clientX, input.pointers[0].clientY);
			window.addEventListener("pointermove", pointerMoveHandler, false);
			window.addEventListener("pointerup", pointerUpHandler, false);
		}
	}

function pointerMoveHandler(event)
	{
		var pointerIndex = indexOfPointer(event.pointerId);
		if (pointerIndex < 0)
		{
			input.pointers.push(event);
		}
		else
		{
			input.pointers[pointerIndex] = event;
		}

		if (input.pointers.length === 1)
		{
			handleDragging(input.pointers[0].clientX, input.pointers[0].clientY);
		}
	}

function pointerUpHandler(event)
	{
		
		current_element = null;
		var pointerIndex = indexOfPointer(event.pointerId);
		if (pointerIndex < 0)
		{}
		else
		{
			input.pointers.splice(pointerIndex, 1);
		}

		if (input.pointers.length === 0 && input.dragging)
		{
			handleDragStop();
			window.removeEventListener("pointermove", pointerMoveHandler, false);
			window.removeEventListener("pointerup", pointerUpHandler, false);
		}
	}

function handleDragStart(x, y)
	{
		dump('dragg start','status');
		
		if(current_element.getAttribute('clone')=='true') cloneElement(current_element);
		current_element.setAttribute('clone','false'); 
		
		input.dragging = true;
		input.dragStartX = input.dragX = x;
		input.dragStartY = input.dragY = y;
		for (var n = 0; n < Literki.length; n++)
			{Literki[n].style.zIndex="0";}
		current_element.style.zIndex="10";
	}

function handleDragging(x, y)
	{
		dump('dragging','status');
		if (input.dragging)
		{
			input.dragDX = x - input.dragX;
			input.dragDY = y - input.dragY;
			input.dragX = x;
			input.dragY = y;
		}
	}

function handleDragStop()
	{
		dump('dragg end','status');
		if (input.dragging)
		{
			input.dragging = false;
			input.dragDX = 0;
			input.dragDY = 0;
		}
		
		if(Positions[current_element_id].posY<(literkiWidth*rowsCount)) // jeśli literka upuszczona na górze to kasujemy ją
			{	
				var l=document.getElementById('literka'+current_element_id);
				document.getElementById('container').removeChild(l);
				current_element = null;
				delete Positions[current_element_id];
			}
		else 
			findWords();
		
		//dump(Positions,'Positions');
	}
	

	
function findWords()
	{
		var current_id = current_element_id;
		
		Positions.forEach( function(element,id)
		{
			document.getElementById('literka'+id).classList.remove('word');
		});
		// jeśli pojedyńcza literka to spadamy stąd!
		if(Positions[current_id].next==undefined && Positions[current_id].prev==undefined) 
		{
			//play_letter(word);
			
			return '';
		}
		var word=document.getElementById('literka'+current_id).innerHTML;
		document.getElementById('literka'+current_id).classList.add('word');
		
		
		while(Positions[current_id].next!=undefined) // w przód
			{
				current_id=Positions[current_id].next;
				document.getElementById('literka'+current_id).classList.add('word');
				word+=document.getElementById('literka'+current_id).innerHTML;
			}
		current_id = current_element_id;	
		while(Positions[current_id].prev!=undefined) // w tył
			{
				current_id=Positions[current_id].prev;
				document.getElementById('literka'+current_id).classList.add('word');
				word=document.getElementById('literka'+current_id).innerHTML+word;
			}
		//return word.replace(/\W/g,'');
		
		play_word(word);
		//console.log(word);
		dump(word,'word');
		return word;
		
	}

function play_word(word)
	{
			if(word)
			{
			var audio = document.createElement("audio");
			audio.id='audio_'+word;
			//audio.src='mp3/'+word+'.mp3';
			audio.src='http://translate.google.com/translate_tts?ie=utf-8&tl=pl&q='+word
			
			audio.style.display='none';
			//document.getElementById('audio_container').appendChild(audio);
			audio.play();
			delete audio;
			console.log('playing word: '+word);
			}
	}
function play_letter(letter)
	{
			if(letter)
			{
			//var audio = document.createElement("audio");
			//audio.src='audio/'+letter+'.mp3';
			//audio.src='/android_asset/www/audio/'+letter+'.mp3';
			//audio.style.display='none';
			//document.getElementById('audio_container').appendChild(audio);
			console.log('playing letter: '+letter);
			var audio=new Media('audio/'+letter+'.mp3',
				// success callback
				function () {
					console.log("playAudio():Audio Success");
				},
				// error callback
				function (err) {
					console.log("playAudio():Audio Error: ");
					console.log(err);
				}
			);
			
			audio.play();
			audio.release();
			//delete audio;
		
			}
	}	
	
	

function repeatString(str, num) {
    out = '';
    for (var i = 0; i < num; i++) {
        out += str; 
    }
    return out;
}
function dump(v, name, recursionLevel) {
	return;
    name = (typeof name === 'undefined') ? "debug" : name;
    recursionLevel = (typeof recursionLevel !== 'number') ? 0 : recursionLevel;


    var vType = typeof v;
    //var out = vType;
	var out = '';

    switch (vType) {
        case "number":
            /* there is absolutely no way in JS to distinguish 2 from 2.0
            so 'number' is the best that you can do. The following doesn't work:
            var er = /^[0-9]+$/;
            if (!isNaN(v) && v % 1 === 0 && er.test(3.0))
                out = 'int';*/
        case "boolean":
            out += ":" + v;
            break;
        case "string":
            out += ':'+ v + ' ';
            break;
        case "object":
            //check if null
            if (v === null) {
                out = "null";

            }
            //If using jQuery: if ($.isArray(v))
            //If using IE: if (isArray(v))
            //this should work for all browsers according to the ECMAScript standard:
            else if (Object.prototype.toString.call(v) === '[object Array]') {  
                out = 'array(' + v.length + '): {\n';
                for (var i = 0; i < v.length; i++) {
                    out += repeatString('   ', recursionLevel) + "   [" + i + "]:  " + 
                        dump(v[i], "none", recursionLevel + 1) + "\n";
                }
                out += repeatString('   ', recursionLevel) + "}";
            }
            else { //if object    
                sContents = "{\n";
                cnt = 0;
                for (var member in v) {
                    //No way to know the original data type of member, since JS
                    //always converts it to a string and no other way to parse objects.
                    sContents += repeatString('   ', recursionLevel) + "   " + member +
                        "" + dump(v[member], "none", recursionLevel + 1) + "\n";
                    cnt++;
                }
                sContents += repeatString('   ', recursionLevel) + "}";
                out += "(" + cnt + "): " + sContents;
            }
            break;
    }

    if(document.getElementById('debug_'+name)){
		document.getElementById('debug_'+name).innerHTML='<strong>'+name+'</strong>'+out;
	}
	else 
	{
		var new_debug = document.createElement("div");
		new_debug.id='debug_'+name;
		new_debug.innerHTML='<strong>'+name+'</strong>'+out;
		document.getElementById('debug').appendChild(new_debug);
		
	}

    return out;
}