(function(){

//TODO: use text nodes directly from *find

var iOS = /iPod|iPhone/.test(navigator.userAgent);

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

// XPath is 5-10 times faster :)
// Translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')

// Cache DOM elements
var $ = function(str){
    return document.getElementById(str);
};
var slice = Array.prototype.slice;

var bar = $('searchyBar');
var searchyMatchCounter = $('searchyMatchCounter');
var searchField = $('searchySearchField');


/**
 * Finds all occurrences of a string, be it case sensitive or not
 * @param {Object} str
 * @param {Object} caseSensitive
 */
function _xfind(str, caseSensitive){
    var xpath = caseSensitive ? "//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'" + str + "')]" : "//*[contains(text(),'" + str + "')]";
    var xres = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var tmp, res = [];
    while ((tmp = xres.iterateNext())) {
        res.push(tmp);
    };
    return res;
}

var re, rematchRe = /^\/([\s\S]+)\/(\w*)$/, hasSubGroup = /^[\S\s]*\([\S\s]+\)[\S\s]*$/;
/**
 * Find textNodes containing str
 * @param {String} str
 */ 
function dfind(str){
    var reOpts;
    console.log(str.match(rematchRe));
    if(reOpts = str.match(rematchRe)){
        var reStr = reOpts[1];
        if(!hasSubGroup.test(reStr)){
            reStr = "(" + reStr + ")";
        }
        
        var modifiers = reOpts[2].split("");
        if(modifiers.indexOf("g") == -1){
            modifiers.push("g");
        }
        
        re = new RegExp(reStr, modifiers.join(""));
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

/**
 * Finds all occurrences of a string
 * @param {Object} str
 */
function _dfind(str){
    return rec(document.body, str, []);
}

/**
 * Helper function to recursively find all elements matching a certain string
 * @param {Object} str
 * @param {Object} caseSensitive
 */
function rec(element, keyword, stack){
    if (element) {
        if (element.nodeType == 3) {
            if (element.nodeValue.indexOf(keyword) != -1) {
                stack.push(element.parentNode);
            }
        }
        else 
            if (element.nodeName.toLowerCase() != 'select') {
                for (var i = element.childNodes.length - 1; i >= 0; i--) {
                    rec(element.childNodes[i], keyword, stack);
                }
            }
    }
    return stack;
}

/* Bind events */

/**
 * Perform search upon keydown
 * @param {Object} e
 */
searchField.addEventListener('keyup', function(e){
    find(this.value);
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
    window.scrollTo(0, Math.max(findPos(el)[1] - 50, 0));
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
    bar.style.display = 'none';
}, false);

/**
 * Show bar if our touchmove did not initiate a scroll
 * @param {Object} e
 */
document.addEventListener('touchend', function(e){
    var y = window.pageYOffset;
    setTimeout(function(){
        if(y == window.pageYOffset){
            bar.style.display = 'block';
        }
    }, 100);
});

/**
 * Actual repositioning function
 * @param {Object} e
 */
function rePos(e){
    if (iOS) {
        bar.style.webkitTransform = 'translate3d(0px, ' + window.pageYOffset + 'px, 0px)';
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

var cache = [], span, els, matches, counter;
function find(_str){
    str = _str;
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
    
    if(str.length < 2){
        return;
    }

    counter = 0;
    matches = [];
    
    var els = dfind(str);
    if(!els.length){ return; }
    
    els.splice(100); // Too many
    
    var fns = {};
    fns[0] = function(){
        searchyNext(0);    
    };
    
    chunk(els, findNodeOccurrences, null, 0, fns);
}

})();
