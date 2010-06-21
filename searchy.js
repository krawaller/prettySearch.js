(function(){

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

//xpath is an order of magnitude faster :)
console.time('xfind');
console.log(_xfind('mamma', true).length);
console.timeEnd('xfind');
console.time('dfind');
console.log(_dfind('mamma').length);
console.timeEnd('dfind');

var slice = Array.prototype.slice;

var cache = [], span, els, matches = [];
_xfind('ma').forEach(function(el){
    slice.call(el.childNodes).filter(function(child){ return child.nodeType === 3; }).forEach(function(tNode){
        //console.log(tNode, tNode.nodeValue);
        span = document.createElement('span');
        span.innerHTML = tNode.nodeValue.replace(/(ma)/g, '<span class="_searchyMatch"><span class="">$1</span></span>');
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
console.log(matches);
matches[0].className += " pop";

//var matches = (slice.call(document.getElementsByClassName('_searchyMatch')) || []);
//console.log(matches);

/*cache.forEach(function(item){
    item.parent.insertBefore(item.tNode, item.span);
    item.parent.removeChild(item.span);    
});*/

})();
