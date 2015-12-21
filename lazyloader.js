'use strict';

/**
 * AMD, CommonJS & plain browser support
 */
(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['LukesLazyLoader'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LukesLazyLoader = factory();
  }

}(this, function () {

  /**
   * This class will create link and script tags for css and javascript
   * files respectively to lazy load them. It will call a callback once
   * all files have finished loading.
   *
   * Usage:
   *
   * Pass as many URLs to the class and a callback as the last parameter.
   * You can mix css and js files as you wish. The order in which files
   * load depend on the server, not on the order you pass them in. The
   * class will detect the filetype by its file extension and create link
   * or script tags accordingly. The following types will be recognized:
   *
   * CSS: *.css *.less
   * JavaScript: *.js *.es6 *.es *.jsx
   *
   * Any other file extension will not be loaded. If you need another
   * file type edit {@link LukesLazyLoader#_CSS_REGEX} and
   * {@link LukesLazyLoader#_JS_REGEX}.
   *
   * Example:
   *
   * new LukesLazyLoader('/my/js/file.js', '//server.com/css/file.css', function() {
   *   console.log('All files have been loaded');
   * });
   *
   * @param {...string} [files] Optional. Any number of URLs to load
   * @param {Function} [callback] Optional. The callback the will be
   *     called when all files have been loaded.
   * @constructor
   */
  function LukesLazyLoader(files, callback) {

    var args = Array.prototype.slice.call(arguments);
    callback = this._isFunction(args[args.length - 1]) ? args.pop() : this._noop;
    this._callbacks = [];

    this._addCallback(callback);
    this.setFiles(args);

    this._setBrowserCssOnLoadSupport();
    window.setTimeout(this.load.bind(this), 0);

  }

  /**
   * Preferred public API for loading files
   *
   * @param {...string} [files] Optional. Any number of URLs to load
   * @param {Function} [callback] Optional. The callback the will be
   *     called when all files have been loaded.
   * @returns {LukesLazyLoader} A new LukesLazyLoader instance
   * @static
   */
  LukesLazyLoader.load = function (files, callback) {
    return new LukesLazyLoader(files, callback);
  };

  /**
   * Instance implementation
   */
  (function () {

    /**
     * Internal constant.
     *
     * @type {string}
     * @private
     */
    this._TYPE_CSS = 'css';

    /**
     * Internal constant.
     *
     * @type {string}
     * @private
     */
    this._TYPE_JS = 'js';

    /**
     * Regex to detect css file types.
     *
     * @type {RegExp}
     * @private
     */
    this._CSS_REGEX = /(\.css|\.less)/i;

    /**
     * Regex to detect js file types.
     *
     * @type {RegExp}
     * @private
     */
    this._JS_REGEX = /(\.js|\.es6|\.es|\.jsx)/i;

    /**
     * Will load all files set with {@link LukesLazyLoader} and
     * {@link LukesLazyLoader#setFiles}.
     *
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this.load = function () {
      var len = this._files.length;
      for (var i = 0; i < len; i++) this._loadFile(this._files[i].url)
      return this;
    };

    /**
     * Sets the files that will be loaded with {@link LukesLazyLoader#load}.
     *
     * @param {string[]|...string} files Any number of URLs to load. Pass
     *     URLs as an array of strings or as multiple parameters (strings)
     * @returns {LukesLazyLoader} This instance
     */
    this.setFiles = function (files) {
      var len = files.length;
      files = Array.isArray(files) ? files : Array.prototype.slice.call(arguments);
      this._files = [];
      for (var i = 0; i < len; i++) this._files.push({url: files[i], loaded: false});
      return this;
    };

    /**
     * Adds a callback function that will be called when all files have finished
     * loading
     *
     * @param {Function} callback The function that will be called when all files
     *     have finished loading
     * @returns {LukesLazyLoader} This instance
     */
    this.then = function (callback) {
      this._addCallback(callback);
      return this;
    };

    /**
     * Will load the given files after
     *
     * @param {...string} [files] Optional. Any number of URLs to load
     * @param {Function} [callback] Optional. The callback the will be
     *     called when all files (passed to this method) have been loaded.
     * @returns {LukesLazyLoader} This instance
     */
    this.thenLoad = function (files, callback) {
      this._addToLoadQueue(new LukesLazyLoader(files, callback));
      return this;
    };

    /**
     * Will detect the file type of a URL and load it with a link or script tag.
     *
     * @param {string} url The URL to load
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._loadFile = function (url) {
      if (this._getFileType(url) === this._TYPE_JS) this._appendScript(url);
      if (this._getFileType(url) === this._TYPE_CSS) this._appendStylesheet(url);
      return this;
    };

    /**
     * Will append a script tag with a given URL to the head of the page
     * and set up callbacks.
     *
     * @param {string} url The URL to load
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._appendScript = function (url) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = this._getUrlLoadedMethod(url);
      this._appendToHead(script);
      return this;
    };

    /**
     * Will append a link tag with a given URL to the head of the page
     * and set up callbacks. It will also invoke polling for browsers
     * that do not support onload events.
     *
     * @param {string} url The URL to load
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._appendStylesheet = function (url) {
      var stylesheet = document.createElement("link");
      stylesheet.href = url;
      stylesheet.rel = 'stylesheet';
      stylesheet.type = 'text/css';
      stylesheet.onload = this._getUrlLoadedMethod(url);
      stylesheet.onreadystatechange = this._getOnReadyStateChangeCallback(url);
      this._appendToHead(stylesheet);
      if (!this._cssOnLoadSupport) this._pollStylesheet(stylesheet);
      return this;
    };

    /**
     * Will append an element to the head of the page.
     *
     * @param {Element} el The element to append to the head of the page
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._appendToHead = function (el) {
      document.getElementsByTagName("head")[0].appendChild(el);
      return this;
    };

    /**
     * Will detect if a URL points to a CSS or JavaScript file and return
     * either {@link LukesLazyLoader#_TYPE_CSS} or {@link LukesLazyLoader#_TYPE_JS}
     * or null if no file type could be detected.
     *
     * @param {string} url The URL to test
     * @returns {string|null} Either {@link LukesLazyLoader#_TYPE_CSS} or
     *     {@link LukesLazyLoader#_TYPE_JS} depending on the file type. Will
     *     return null if no file type could be detected.
     * @private
     */
    this._getFileType = function (url) {
      if (this._JS_REGEX.test(url)) return this._TYPE_JS;
      if (this._CSS_REGEX.test(url)) return this._TYPE_CSS;
      return null;
    };

    /**
     * Returns a callback method for the onreadystatechange-attribute that
     * will register a file to be loaded (for the 'all files have been loaded
     * logic of this class).
     *
     * @param {string} url The URL of the file this callback has been set for
     * @returns {Function} The callback for the onreadystatechange-attribute
     * @private
     */
    this._getOnReadyStateChangeCallback = function (url) {
      var self = this;
      return function () {
        if (['loaded', 'complete'].indexOf(this.readyState) > -1) self._setLoaded(url);
      };
    };

    /**
     * Returns a callback method for the onload-attribute that will register a
     * file to be loaded (for the 'all files have been loaded logic of this class).
     *
     * @param {string} url The URL of the file this callback has been set for
     * @returns {function(this:*)} The callback for the onload-attribute
     * @private
     */
    this._getUrlLoadedMethod = function (url) {
      return function () {
        this._setLoaded(url)
      }.bind(this);
    };

    /**
     * Will poll a given stylesheet for its CSS rules to detect if it has been loaded
     * and call {@link LukesLazyLoader#_setLoaded} once it succeeds.
     *
     * @param {Element} stylesheet The stylesheet to be polled
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._pollStylesheet = function (stylesheet) {
      try {
        if (stylesheet.cssRules || (stylesheet.rules && stylesheet.rules.length))
          this._setLoaded(stylesheet.getAttribute('href'));
        else
          setTimeout(function () {
            this._pollStylesheet(stylesheet);
          }.bind(this), 200);
      }
      catch (e) {
        setTimeout(function () {
          this._pollStylesheet(stylesheet);
        }.bind(this), 200);
      }
      return this;
    };

    /**
     * Marks a file to be loaded in the internal map if files to load and call
     * the callback once all files have been loaded.
     *
     * @param {string} url The URL of the file that has been loaded
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._setLoaded = function (url) {
      var allFilesHaveBeenLoaded = true;
      for (var key in this._files) {
        if (this._files[key].url === url) this._files[key].loaded = true;
        allFilesHaveBeenLoaded = allFilesHaveBeenLoaded && this._files[key].loaded;
      }
      if (allFilesHaveBeenLoaded) this._invokeCallbacks();
      return this;
    };

    /**
     * Detects whether or not a variable is a function.
     *
     * @param functionToCheck The variable in question
     * @returns {boolean} True if functionToCheck is a function, otherwise false
     * @private
     */
    this._isFunction = function (functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    };

    /**
     * Detects if a browser supports the onload-attribute on link tag.
     *
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._setBrowserCssOnLoadSupport = function () {
      var link = document.createElement("link");
      link.href = '//foo.css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.setAttribute('onload', 'return;');
      this._cssOnLoadSupport = typeof link.onload === 'function';
      return this;
    };

    /**
     * Adds a function to the list of callbacks to be called when all files
     * have finished loading.
     *
     * @param {Function} callback A callback function that will be called
     *     when all files have finished loading
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._addCallback = function (callback) {
      this._callbacks.push(callback);
      return this;
    };

    /**
     * Invokes all callbacks added by {@link LukesLazyLoader#_addCallback}
     *
     * @returns {LukesLazyLoader} This instance
     * @private
     */
    this._invokeCallbacks = function () {
      var len = this._callbacks.length;
      for (var i = 0; i < len; i++) this._callbacks[i]();
      return this;
    };

    /**
     * A function that does nothing to be used as default callback.
     *
     * @private
     */
    this._noop = function () {
    };

  }).call(LukesLazyLoader.prototype);

  /**
   * Return the class to be used by AMD, CommonJS or the browser
   */
  return LukesLazyLoader;

}));
