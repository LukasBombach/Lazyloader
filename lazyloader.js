var LazyLoader = function(files, callback){

  var filesToLoad = 0,
      file,
      obj,
      newStylesheetIndex = document.styleSheets.length-1;
  
  for (index in files) {

    filesToLoad++;
    
    var file = files[index];
    
    if(getFileType(file)=='css') {
      appendStylesheet(file);
      newStylesheetIndex++;
      if(!window.opera && navigator.userAgent.indexOf("MSIE") == -1)
        callCallbackForStylesheet(newStylesheetIndex);
    }
    
    if(getFileType(file)=='js') {
      appendScriptAndCallCallback(file);
    }
 
  }
  
  function getFileType(file) {
    file = file.toLowerCase()
  
    var jsIndex = file.indexOf('js'),
        cssIndex = file.indexOf('css');
    
    if(jsIndex==-1 && cssIndex==-1)
      return false;
    
    if(jsIndex > cssIndex)
      return 'js';
    else
      return 'css';
  }
  
  function appendStylesheet(url) {
    var oLink = document.createElement("link")
    oLink.href = url;
    oLink.rel = "stylesheet";
    oLink.type = "text/css";
    oLink.onload = decrementAndCallGlobalCallback;
    oLink.onreadystatechange= function () { if(this.readyState == 'loaded' || this.readyState == 'complete') decrementAndCallGlobalCallback(); }
    document.getElementsByTagName("head")[0].appendChild(oLink);
  }
  
  function callCallbackForStylesheet(index) {

    try {
        if (document.styleSheets[index].cssRules) {
            decrementAndCallGlobalCallback();
        } else {
            if (document.styleSheets[index].rules && document.styleSheets[index].rules.length) {
                decrementAndCallGlobalCallback();
            } else {
                setTimeout(function() {
                  callCallbackForStylesheet(index);
                }, 250);
            }
        }
    }
    catch(e) {
        setTimeout(function() {
          callCallbackForStylesheet(index);
        }, 250);
    }

  }
  
  function appendScriptAndCallCallback(url) {
    var oScript = document.createElement('script');
    oScript.type = 'text/javascript';
    oScript.src = url;
    oScript.onload = decrementAndCallGlobalCallback;
    document.getElementsByTagName("head")[0].appendChild(oScript);
  }

  function decrementAndCallGlobalCallback() {
    filesToLoad--;

    if(filesToLoad == 0)
      callback();
  }
};
