(function(){

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

/*var res = document.evaluate("//*[contains(text(),'mamma')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
alert(res.iterateNext());

var xres = document.evaluate("//*[contains(text(),'if')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
console.log(xres);
var tmp, res = [];
while ((tmp = xres.iterateNext()) && res.push(tmp)) {
};
console.log(res);*/

var $ = function(str){
    return document.getElementById(str);
};

var bar = $('searchyBar');
function _xfind(str, caseSensitive){
    var xpath = caseSensitive ? "//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'" + str + "')]" : "//*[contains(text(),'" + str + "')]";
    var xres = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var tmp, res = [];
    while ((tmp = xres.iterateNext())) {
        res.push(tmp);
    };
    return res;
}

function _dfind(str){
    return rec(document.body, str, []);
}

function rec(element, keyword, stack){
    if (element) {
        //console.log(element);
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

document.addEventListener('webkitAnimationEnd', function(e){
    e.target.className = e.target.className.replace(/(^|\s+)pop(\s+|$)/g, '$1$2'); 
}, false);

//xpath is an order of magnitude faster :)

/*console.log(_xfind('mamma', true).length);

console.time('dfind');
console.log(_dfind('mamma').length);
console.timeEnd('dfind');*/

var slice = Array.prototype.slice;
var searchyMatchCounter = $('searchyMatchCounter');

console.time('xfind');
var cache = [], span, els, matches = [], counter = 0;
_xfind('song').forEach(function(el){
    slice.call(el.childNodes).filter(function(child){ return child.nodeType === 3; }).forEach(function(tNode){
        //console.log(tNode);
        //console.log(tNode, tNode.nodeValue);
        span = document.createElement('span');
        span.innerHTML = tNode.nodeValue.replace(/(song)/g, '<span class="_searchyMatch"><span class="">$1</span></span>');
        el.insertBefore(span, tNode);
        el.removeChild(tNode);
        cache.push({ parent: el, tNode: tNode, span: span });
        //console.log(8, span.querySelectorAll('._searchyMatch'))
        var els = slice.call(span.querySelectorAll('._searchyMatch'));
        matches = matches.concat(els);
        els.forEach(function(match){
            match.style.width = match.offsetWidth + 'px';
            match.style.height = match.offsetHeight + 'px';
            match.childNodes[0].className = '_searchyMatchInner';            
        });
    })    
});
console.timeEnd('xfind');
//console.log(matches);
searchyMatchCounter.textContent = matches.length + ' matches';
matches[0].className += " pop";

$('searchyNext').addEventListener('click', function(e){
    var el = matches[counter < matches.length - 1 ? ++counter : (counter = 0)];
    el.className += " pop";
    window.scrollTo(0, Math.max(findPos(el)[1] - 50, 0));
    rePos();
}, false);

$('searchyPrev').addEventListener('click', function(e){
    var el = matches[counter > 0 ? --counter : (counter = matches.length - 1)];
    el.className += " pop";
    window.scrollTo(0, Math.max(findPos(el)[1] - 50, 0));
    rePos();
}, false);

document.addEventListener('scroll', rePos, false);
document.addEventListener('touchmove', function(e){
    bar.style.display = 'none';
}, false);
document.addEventListener('touchend', function(e){
    var y = window.pageYOffset;
    setTimeout(function(){
        if(y == window.pageYOffset){
            bar.style.display = 'block';
        }
    }, 100);
});
function rePos(e){
    bar.style.webkitTransform = 'translate3d(0px, ' + window.pageYOffset + 'px, 0px)';
    bar.style.display = 'block';
}

//var matches = (slice.call(document.getElementsByClassName('_searchyMatch')) || []);
//console.log(matches);

/*cache.forEach(function(item){
    item.parent.insertBefore(item.tNode, item.span);
    item.parent.removeChild(item.span);    
});*/

})();
