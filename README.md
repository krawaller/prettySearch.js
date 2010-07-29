# prettySearch.js

This is a bookmarklet for iOS devices which lets you search the current page using a search string or a Regular Expression. It highlights the matches and lets you jump between them, and the bar follows you around the page. Also, the search is carried out asynchronously, so your browser won't freeze. On top of this, it uses a new nifty caching system to work instantenously, even when offline.

### Advanced Usage

Try using a regexp like `/\w+a\b/` to find all words ending in an "a". PrettySearch will look for the first subgroup, if any, so you can do stuff like `/\w+ok(\w)\w+/` to make advanced searches.

## License 

(The MIT License)

Copyright (c) 2010 Krawaller <info@krawaller.se>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.