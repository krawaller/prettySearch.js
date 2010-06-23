(function(){

var iOS = /iPod|iPhone|iPad/.test(navigator.userAgent);

/**
 * PPK's utility functions
 * @param {Object} obj
 */
function findPos(obj){
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
            
        }
        while (obj = obj.offsetParent);
        
        return [curleft, curtop];
    }
}

var $ = function(str){
    return document.getElementById(str);
};
var slice = Array.prototype.slice;

if(!$('searchyBar')){
    var s = document.createElement('link');
    s.rel = 'stylesheet';
    s.media = 'all';
    s.href = 'http://79.99.1.153/prettySearch.js/searchy.css';
    
    (document.getElementsByTagName('head') || [document.body])[0].appendChild(s);
    
    var wrapper = document.createElement('div');
    wrapper.id = 'searchyWrapper';
    wrapper.style.display = 'none';
    
    wrapper.innerHTML = ['<div id="searchyBar">',
        '<button id="searchyDoneButton">Klar</button>',
        '<div id="searchySearchFieldWrapper">',
            '<img id="searchySearchIcon" width="10" height="10" title="" alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABBklEQVQYGXVQsUoDURCcuRcDYmHlN/gBihAbq4CFKAh+g6Yyh5WolRHBJoIWKv7BiUUgIKSSWNkGglYWKfMBwsllnT14IRZus29mZ3fnLaFoHJ4uM+DaiBqMBWBvPzmaj7etL697sHF0tkKzvgMDOiSCgdtC35O8WL+/uRx6rSLiyshQTLD60D4fOHmQnqwxSfphrtIS3HUu0ZgNmD1FkZN37Yt3wjp61h17aKL2E1XPs2FWcnnkEhCv7sm9RnK/eVxT96Zs9SI3/Yz7pKFrsOAiQhMNvfHoYyvLslz473kkrmpLV2daVK7L/8t49LlTCuP42byXpvNLXHguLUj8r9CbpmK9fwHbJF6o5mo3KAAAAABJRU5ErkJggg==" />',
            '<input type="search" placeholder="search" id="searchySearchField" autocorrect="off" autocomplete="off" />',
        '</div>',
        '<div id="searchyMatchNavigation">',
            '<button id="searchyPrev">◂</button><button id="searchyNext">◂</button>',
        '</div>',
        '<div id="searchyMatchCounter">Hittades inte</div>',
    '</div>'].join("\n");
    document.body.insertBefore(wrapper, document.body.firstChild);
    
    var interval = setInterval(function(){
        if(window.getComputedStyle(document.documentElement, null)['padding-top'] == '32px'){
            wrapper.style.display = 'block';
            clearInterval(interval);
        }
    }, 40);
} else {
    isHidden = false;
}

var isHidden = false;
var bar = $('searchyBar');
var wrapper = bar.parentNode;
bar.style.display = 'block';

var searchyMatchCounter = $('searchyMatchCounter');
var searchField = $('searchySearchField');
var searchyDoneButton = $('searchyDoneButton');

if(!iOS){
    bar.style.position = 'fixed';
}

var re, rematchRe = /^\/([\s\S]+)\/(\w*)$/, hasSubGroup = /^[\S\s]*\([\S\s]+\)[\S\s]*$/;
/**
 * Find textNodes containing str
 * @param {String} str
 */ 
function dfind(str){
    var reOpts;

    // Regexpify if applicable
    if(reOpts = str.match(rematchRe)){
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
        } catch(e){
            return [];
        }
    } else {
        re = new RegExp("("+str+")", "gi");
    }
    
    var els = document.body.getElementsByTagName("*");
    var matches = [];
    var tNodes = [];
    for(var i = 0, el; el = els[i++];){
        for(var j = 0, children = el.childNodes, child; child = children[j++];){
            re.lastIndex = 0;
            if(child.nodeType === 3 && re.test(child.nodeValue)){
                matches.push(child);
            }
        }
    }
    return matches;
}

/* Bind events */

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
    find(this.value);
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

// TODO: merge step funcs
/**
 * Jump to next occurrence
 * @param {Object} i
 */
function searchyNext(i){
    var el = matches[typeof i != 'undefined' ? (counter = i) : (counter < matches.length - 1 ? ++counter : (counter = 0))];
    el.className += " pop";
    window.scrollTo(0, Math.max((findPos(el) || [0,0])[1] - 50, 0));
    rePos();
}
$('searchyNext').addEventListener('click', function(){ searchyNext(); }, false);

/**
 * Jump to previous occurrence
 * @param {Object} e
 */
$('searchyPrev').addEventListener('click', function(e){
    var el = matches[counter > 0 ? --counter : (counter = matches.length - 1)];
    el.className += " pop";
    var pos = findPos(el);
    window.scrollTo(Math.max(pos[0] - 50, 0), Math.max(pos[1] - 50, 0));
    rePos();
}, false);

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
    if(isHidden){ return; }
    bar.style.display = 'none';
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
        }
    }, 100);
});

/**
 * Actual searchyBar repositioning function
 * @param {Object} e
 */
function rePos(e){
    if (!isHidden && iOS) {
        var x = window.pageXOffset + window.innerWidth - 320; //FIXME
        bar.style.webkitTransform = 'translate3d(' + x + 'px, ' + window.pageYOffset + 'px, 0px)';
        bar.style.display = 'block';
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
            timeoutInner = setTimeout(arguments.callee, 0);
        }
        
        if(tmp = funcs[i++]){
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
    if(!el){ console.log('Error', tNode, el); return; } //Hum
    span = document.createElement('span');
            
    el.insertBefore(span, tNode);
    el.removeChild(tNode);
    
    var match, 
        s = tNode.nodeValue, 
        idx = 0,
        t, m, c;
        
    while((match = re.exec(s))){
        t = document.createTextNode(s.substring(idx, re.lastIndex - match[1].length));
        m = document.createElement('span');
        m.className = '_searchyMatch';
        c = document.createElement('span');
        c.textContent = match[1];
        m.appendChild(c);
        idx = re.lastIndex;
        
        span.appendChild(t);
        span.appendChild(m);
        
        m.style.width = m.offsetWidth + 'px';
        m.style.height = m.offsetHeight + 'px';
        c.className = '_searchyMatchInner';
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
        searchyNext(0);    
    };
    
    chunk(els, findNodeOccurrences, null, 0, fns);
}

setTimeout(rePos, 0);


})();
