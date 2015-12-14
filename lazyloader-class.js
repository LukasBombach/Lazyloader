'use strict';

/**
 *
 * @param {...string} files Any number of URLs to load
 * @param callback The callback the will be called when
 *     all files have been loaded.
 * @constructor
 */
function LazyLoader(files, callback) {
  this._files = Array.prototype.slice.call(arguments, 0, -1);
  this._callback = Array.prototype.slice.call(arguments, -1);
  this._numFilesLoading = 0;
  this._load();
}

(function() {

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
   * @returns {LazyLoader} This instance
   * @private
   */
  this._load = function () {
    var len = this._files.length;
    for (var i = 0; i < len; i++)
      this._loadFile(this._files[i])
    return this;
  };

  /**
   *
   * @param {string} url
   * @returns {LazyLoader} This instance
   * @private
   */
  this._loadFile = function (url) {

    if (this._getFileType(url) === this._TYPE_JS) {
      this._numFilesLoading++;
      this._appendScript(url)
    }

    if (this._getFileType(url) === this._TYPE_CSS) {
      this._numFilesLoading++;
      this._appendStylesheet(url)
    }

    return this;

  };

  /**
   *
   * @param url
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
  this._getFileType = function(url) {
    if (this._JS_REGEX.test(url)) return this._TYPE_JS;
    if (this._CSS_REGEX.test(url)) return this._TYPE_CSS;
    return null;
  };

  /**
   *
   * @returns {LazyLoader} This instance
   * @private
   */
  this._decrementAndCallGlobalCallback = function() {
    if(--this._numFilesLoading === 0) this._callback();
    return this;
  }

}).call(LazyLoader.prototype);

