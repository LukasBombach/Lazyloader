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
  this._CSS_REGEX = /(\.css|\.less)$/i;

  /**
   *
   * @type {RegExp}
   * @private
   */
  this._JS_REGEX = /(\.js|\.es6|\.es|\.jsx)$/i;

  /**
   *
   * @param {Function} callback The callback the will be called when
   *     all files have been loaded.
   * @returns {LazyLoader} This instance
   */
  this.setCallback = function (callback) {
    return this;
  };

  /**
   *
   * @param {string[]|...string} files Any number of URLs to load
   * @returns {LazyLoader} This instance
   */
  this.setFiles = function (files) {
    return this;
  };

  /**
   *
   * @returns {LazyLoader} This instance
   * @private
   */
  this.load = function () {
    var len = this._files.length;
    this._numFilesLoading = 0;
    for (var i = 0; i < len; i++) this._loadFile(this._files[i])
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
    this._numFilesLoading++;
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
    this._numFilesLoading++;
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
    script.onload = this._decrementAndCallGlobalCallback.bind(this);
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
    var link = document.createElement("link");
    link.href = url;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.onload = this._decrementAndCallGlobalCallback.bind(this);
    link.onreadystatechange = this._getOnReadyStateChangeCallback();
    this._appendToHead(link);
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
   * @returns {Function}
   * @private
   */
  this._getOnReadyStateChangeCallback = function () {
    var self = this;
    return function () {
      if (['loaded', 'complete'].indexOf(this.readyState) > -1)
        self._decrementAndCallGlobalCallback();
    };
  };

  /**
   *
   * @returns {LazyLoader} This instance
   * @private
   */
  this._decrementAndCallGlobalCallback = function () {
    if (--this._numFilesLoading === 0) this._callback();
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
   * @private
   */
  this._noop = function () {
  };

}).call(LazyLoader.prototype);

