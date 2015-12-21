Luke's Lazyloader
=========

#### A tiny lazyloader for JavaScript and CSS that also calls onload-callbacks for CSS files ####

There are tons of lazyloaders out there and frameworks like Mootools or YUI have built-in funtionality for this. But they all fail to reliably detect or call a callback when CSS files have been loaded and applied. This is simply because link-tags (contrary to script-tags) don't always have a onload-property that calls a function when, well, the file has been loaded.

### Different browsers, different implementations ###

It's funnny. All major browsers implement an onload-propery on script-tags. Link-tags only have that property in Opera. Internet Explorer 6-8 have onreadystatechange-callbacks like XHR-calls and Firefox and Safari provide no such funtionality whatsoever.

### What can we do? ###

Behnam Taraghi (http://tugll.tugraz.at/96784/) had a clever idea to fix the Firefox/Safari issues. It's fairly simple: Create link-tags and poll them until they have a .cssRules-property. Unfortunately his code (http://tugll.tugraz.at/96784/weblog/9080.html) was kind of buggy and *only* supported FF/Safari. So, along with a private project I'm working on I created this lazyloader that works with CSS- and JavaScript-Files and supports every major browser.

Features
--------

* Lazyload JavaScript & CSS
* Pass multiple files to the loader
* Pass a callback that will be called when all files have been loaded

Dependencies
------------

*None.*

Usage
-----

Put

```html
<script src="lazyloader.js"></script>
```

on your website. And call

```javascript
new LazyLoader('your', 'css', 'and', 'js', 'files', callback);
```
whenever you need it. If you need seperate callbacks for each file simply call

```javascript
new LazyLoader('file1', callback1);
new LazyLoader('file2', callback2);
new LazyLoader('file3' 'file4', callback3);
```

Compatibility
-------------

I've tested this with

* Safari 5
* Firefox 3.6
* Opera 10.10
* Internet Explorer 6, 7, 8

Todo
----

* [ ] Bower, AMD, etc
* [ ] Promises
* [ ] Chainability to successively load files
