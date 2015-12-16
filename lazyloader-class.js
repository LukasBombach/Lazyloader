'use strict';

/**
 *
 * @param {...string} files Any number of URLs to load
 * @param {Function} callback The callback the will be called when
 *     all files have been loaded.
 * @constructor
 */
function LazyLoader(files, callback) {

  var args = Array.prototype.slice.call(arguments);
  callback = this._isFunction(args[args.length - 1]) ? args.pop() : this._noop;

  this.setCallback(callback);
  this.setFiles(args);

  this._setBrowserCssOnLoadSupport();
  this.load();

}

(function () {

  /**
   *
   * @type {string}
   * @private
   */
  this._TYPE_CSS = 'css';

  /**
   *
   * @type {string}
   * @private
   */
  this._TYPE_JS = 'js';

  /**
   *
   * @type {RegExp}
   * @private
   */
  this._CSS_REGEX = /(\.css|\.less)/i;

  /**
   *
   * @type {RegExp}
   * @private
   */
  this._JS_REGEX = /(\.js|\.es6|\.es|\.jsx)/i;

  /**
   *
   * @returns {LazyLoader} This instance
   * @private
   */
  this.load = function () {
    var len = this._files.length;
    for (var i = 0; i < len; i++) this._loadFile(this._files[i].url)
    return this;
  };

  /**
   *
   * @param {Function} callback The callback the will be called when
   *     all files have been loaded.
   * @returns {LazyLoader} This instance
   */
  this.setCallback = function (callback) {
    this._callback = callback;
    return this;
  };

  /**
   *
   * @param {string[]|...string} files Any number of URLs to load
   * @returns {LazyLoader} This instance
   */
  this.setFiles = function (files) {
    var len = files.length;
    this._files = [];
    for (var i = 0; i < len; i++) this._files.push({ url:files[i], loaded:false });
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
   * @private
   */
  this._loadFile = function (url) {
    if (this._getFileType(url) === this._TYPE_JS) this._loadScript(url);
    if (this._getFileType(url) === this._TYPE_CSS) this._loadStylesheet(url);
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
   * @private
   */
  this._loadScript = function (url) {
    this._appendScript(url);
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
   * @private
   */
  this._loadStylesheet = function (url) {
    this._appendStylesheet(url);
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
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
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
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
   *
   * @param el
   * @returns {LazyLoader} This instance
   * @private
   */
  this._appendToHead = function (el) {
    document.getElementsByTagName("head")[0].appendChild(el);
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {string|null}
   * @private
   */
  this._getFileType = function (url) {
    if (this._JS_REGEX.test(url)) return this._TYPE_JS;
    if (this._CSS_REGEX.test(url)) return this._TYPE_CSS;
    return null;
  };

  /**
   *
   * @param {string} url
   * @returns {Function}
   * @private
   */
  this._getOnReadyStateChangeCallback = function (url) {
    var self = this;
    return function () {
      if (['loaded', 'complete'].indexOf(this.readyState) > -1) self._setLoaded(url);
    };
  };

  /**
   *
   * @param {string} url
   * @returns {function(this:*)}
   * @private
   */
  this._getUrlLoadedMethod = function (url) {
    return function () { this._setLoaded(url) }.bind(this);
  };

  /**
   *
   * @param {Element} stylesheet
   * @returns {LazyLoader} This instance
   * @private
   */
  this._pollStylesheet = function (stylesheet) {
    try {
      if (stylesheet.cssRules || (stylesheet.rules && stylesheet.rules.length))
        this._setLoaded(stylesheet.getAttribute('href'));
      else
        setTimeout(function() { this._pollStylesheet(stylesheet);}.bind(this), 200);
    }
    catch(e) {
      setTimeout(function() { this._pollStylesheet(stylesheet); }.bind(this), 200);
    }
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
   * @private
   */
  this._setLoaded = function (url) {
    var allFilesHaveBeenLoaded = true;
    for (var key in this._files) {
      if (this._files[key].url === url) this._files[key].loaded = true;
      allFilesHaveBeenLoaded = allFilesHaveBeenLoaded && this._files[key].loaded;
    }
    if (allFilesHaveBeenLoaded) this._callback();
    return this;
  };

  /**
   *
   * @param functionToCheck
   * @returns {*|boolean}
   * @private
   */
  this._isFunction = function(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  };

  /**
   *
   * @returns {LazyLoader} This instance
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
   *
   * @private
   */
  this._noop = function () {
  };

}).call(LazyLoader.prototype);

