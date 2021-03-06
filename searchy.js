;(function(){
var iOS = /iPod|iPhone|iPad/.test(navigator.userAgent); // Yeak

/**
 * PPK's utility functions
 * @param {Object} obj
 */
function findPos(obj){
    var curleft = 0, curtop = 0;
    if (obj && obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        }
        while ( (obj = obj.offsetParent) );
        return [curleft, curtop];
    }
}

var $ = function(str){
    return document.getElementById(str);
}, slice = Array.prototype.slice;

var w, isHidden = false;
if(!$('searchyBar')){
    w = document.createElement('div');
    w.id = 'searchyWrapper';

    w.innerHTML = ['<div id="searchyBar">',
        '<button id="searchyDoneButton" class="_noMatch">Done</button>',
        '<div id="searchySearchFieldWrapper">',
            '<img id="searchySearchIcon" width="10" height="10" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABBklEQVQYGXVQsUoDURCcuRcDYmHlN/gBihAbq4CFKAh+g6Yyh5WolRHBJoIWKv7BiUUgIKSSWNkGglYWKfMBwsllnT14IRZus29mZ3fnLaFoHJ4uM+DaiBqMBWBvPzmaj7etL697sHF0tkKzvgMDOiSCgdtC35O8WL+/uRx6rSLiyshQTLD60D4fOHmQnqwxSfphrtIS3HUu0ZgNmD1FkZN37Yt3wjp61h17aKL2E1XPs2FWcnnkEhCv7sm9RnK/eVxT96Zs9SI3/Yz7pKFrsOAiQhMNvfHoYyvLslz473kkrmpLV2daVK7L/8t49LlTCuP42byXpvNLXHguLUj8r9CbpmK9fwHbJF6o5mo3KAAAAABJRU5ErkJggg==" />',
            '<input type="search" placeholder="search" id="searchySearchField" autocorrect="off" autocomplete="off" />',
        '</div>',
        '<div id="searchyMatchNavigation">',
            '<button id="searchyPrev">\u25c2</button><button id="searchyNext">\u25c2</button>',
        '</div>',
        '<div id="searchyMatchCounter" class="_noMatch">No matches</div>',
    '</div>'].join("\n");
    document.body.insertBefore(w, document.body.firstChild);
} else {
    $('searchyBar').style.display = 'block';
}

var scrolling = false,
    bar = $('searchyBar'),
    wrapper = bar.parentNode,
    searchyMatchCounter = $('searchyMatchCounter'),
    searchField = $('searchySearchField'),
    searchyDoneButton = $('searchyDoneButton');

if(!iOS){ bar.style.position = 'fixed'; bar.style.right = '0px'; bar.style.left = 'auto'; }

var nogo = ['HTML', 'HEAD', 'STYLE', 'TITLE', 'LINK', 'META', 'SCRIPT', 'OBJECT', 'IFRAME', 'PRE', 'OPTION'], re, rematchRe = /^\/([\s\S]+)\/(\w*)$/, hasSubGroup = /^[\S\s]*\([\S\s]+\)[\S\s]*$/;
/**
 * Find textNodes containing str
 * @param {String} str
 */ 
function dfind(str){
    var reOpts;
    // Regexpify if applicable
    if( (reOpts = str.match(rematchRe)) ){
        var reStr = reOpts[1];
        if(!hasSubGroup.test(reStr)){
            reStr = "(" + reStr + ")";
        }
        var modifiers = reOpts[2].split("");
        if(modifiers.indexOf("g") == -1){
            modifiers.push("g");
        }
        try {
            re = new RegExp(reStr, modifiers.join(""));
            if(re.test("")){ // Must not match empty string
            	re = new RegExp("("+str+")", "gi");
            }
        } catch(e){
            return [];
        }
    } else {
        re = new RegExp("("+str+")", "gi");
    }
    
    var els = document.body.getElementsByTagName("*"),
        matches = [],
        tNodes = [];

    for(var i = 0, el; (el = els[i++]) ;){
        if (nogo.indexOf(el.nodeName) == -1 && el.className.indexOf('_noMatch') == -1) {
            for (var j = 0, children = el.childNodes, child; (child = children[j++]);) {
                re.lastIndex = 0;
                if (child.nodeType === 3 && re.test(child.nodeValue)) {
                    matches.push(child);
                }
            }
        }
    }
    return matches;
}

/* Bind events */

/**
 * Hide and clear searches upon Done click
 */
searchyDoneButton.addEventListener('click', function(){
    clearSearch();
    bar.style.display = 'none';
    isHidden = true;
}, false);

/**
 * Perform search upon keyup
 * @param {Object} e
 */
searchField.addEventListener('keyup', function(e){
	if(e.keyCode != 13){
    	find(this.value);
	} else {
		searchyStep(1);
	}
}, false);

/**
 * Clear searchField upon click
 * @param {Object} e
 */
searchField.addEventListener('click', function(e){
    this.value = "";
}, false);

/**
 * Remove pop class upon animation end
 * @param {Object} e
 */
document.addEventListener('webkitAnimationEnd', function(e){
    e.target.className = e.target.className.replace(/(^|\s+)pop(\s+|$)/g, '$1$2'); 
}, false);

/**
 * Jump to occurrence specified by counter + delta
 * @param {Object} ds Step delta
 */
function searchyStep(ds){
    var lastEl = matches[counter],
        i = counter + ds,
        el = matches[(counter = i < 0 ? i = matches.length - 1 : (i > matches.length - 1 ? 0 : i))],
        pos;
    
	if(lastEl){
    	lastEl.className = (lastEl.className || "").replace(/(^|\s+)_searchyActive(\s+|$)/g, '$1$2');
    }
	if(el){
		el.className += " _searchyActive";
		pos = findPos(el);
	}
	
    if(!pos){ return; }
    window.scrollTo(Math.max(pos[0] - 50, 0), Math.max(pos[1] - 50, 0));
    rePos();
}
$('searchyNext').addEventListener('click', function(){ searchyStep(1); }, false);

/**
 * Jump to previous occurrence
 */
$('searchyPrev').addEventListener('click', function(){ searchyStep(-1); }, false);

/**
 * Reposition bar upon scrolling if iOS - how to feature detect?
 */
if(iOS){
    document.addEventListener('scroll', rePos, false);
}

/**
 * Hide bar upon scroll start
 * @param {Object} e
 */
document.addEventListener('touchmove', function(e){
    if(isHidden || scrolling){ return; }
    bar.style.display = 'none';
    scrolling = true;
}, false);

/**
 * Show bar if our touchmove did not initiate a scroll
 * @param {Object} e
 */
document.addEventListener('touchend', function(e){
    if(isHidden){ return; }
    var y = window.pageYOffset;
    setTimeout(function(){
        if(y == window.pageYOffset){
            bar.style.display = 'block';
            scrolling = false;
        }
    }, 100);
}, false);

/**
 * Actual searchyBar repositioning function
 * @param {Object} e
 */
function rePos(e){
    if (!isHidden && iOS) {
        var x = window.pageXOffset + window.innerWidth - 320; //FIXME
        bar.style.webkitTransform = 'translate3d(' + x + 'px, ' + window.pageYOffset + 'px, 0px)';
        bar.style.display = 'block';
        scrolling = false;
    }
}

/**
 * Chunker from NCZ-online
 * @param {Object} array
 * @param {Object} process
 * @param {Object} context
 */
var tmp, timeoutOuter, timeoutInner;
function chunk(array, process, context, i, funcs){
    timeoutOuter = setTimeout(function(){
        var item = array.shift();
        process.call(context, item);

        if (array.length > 0){
            timeoutInner = setTimeout(arguments.callee, 30);
        }
        
        if( (tmp = funcs[i++]) ){
            tmp();
        }
    }, 0);
}

var str;
/**
 * Find all occurrences of the RegExpified string in a text node and highlight them 
 * @param {Object} tNode
 */
function findNodeOccurrences(tNode){
    var el = tNode.parentNode;
    if(!el){
        //console.log('Error', tNode, el); 
        return; 
    } //Hum
    span = document.createElement('span');
    span.className = '_searchyMatchWrapper';
            
    el.insertBefore(span, tNode);
    el.removeChild(tNode);
    
    var match, 
        s = tNode.nodeValue, 
        idx = 0,
        t, m, c;
		re.lastIndex = 0;
		
    while( (match = re.exec(s)) ){
        t = document.createTextNode(s.substring(idx, re.lastIndex - match[1].length));
        m = document.createElement('span');

        m.className = '_searchyMatch';
        m.textContent = match[1];
        
        span.appendChild(t);
        span.appendChild(m);
        
        idx = re.lastIndex;
        
        matches.push(m);
    }
    span.appendChild(document.createTextNode(s.substring(idx)));
    searchyMatchCounter.textContent = matches.length + ' matches';
}

/**
 * Clear all traces of a search
 */
function clearSearch(){
    var parent;
    slice.call(document.getElementsByClassName('_searchyMatch')).forEach(function(el){
        parent = el.parentNode;
        parent.insertBefore(document.createTextNode(el.textContent), el);
        parent.removeChild(el);
        parent.normalize();    
    });
    searchyMatchCounter.textContent = 'No matches';
    
    if(timeoutOuter){
        clearTimeout(timeoutOuter);
    } 
    if(timeoutInner){
        clearTimeout(timeoutInner);
    }
    
    counter = 0;
    matches = [];
}

var cache = [], span, els, matches, counter;
/**
 * The function controlling the search flow
 */
function find(_str){
    if(_str === str){ return; }
    str = _str;
    
    clearSearch();
    if(str.length < 2){
        return;
    }
    
    var els = dfind(str);

    if(!els.length){ return; }
    els.splice(100); // Too many
    
    var fns = {};
    fns[0] = function(){
        searchyStep(0);    
    };
    
    chunk(els, findNodeOccurrences, null, 0, fns);
}
rePos();
setTimeout(function(){ wrapper.style.display = 'block'; }, 0);
})();