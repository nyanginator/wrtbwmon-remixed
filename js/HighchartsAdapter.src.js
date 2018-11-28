/*

HighchartsAdapter.js

Allows Highcharts to be used without JQuery or any other JavaScript framework

Created by Kate Morley - http://code.iamkate.com/ - and released under the terms
of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

// create the HighchartsAdapter object
var HighchartsAdapter = (function(){

  // the pathAnim object
  var pathAnimation;

  // define the list of native events
  var nativeEvents = [
    'blur',
    'change',
    'click',
    'dblclick',
    'focus',
    'keydown',
    'keupress',
    'keyup',
    'load',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'reset',
    'resize',
    'select',
    'submit',
    'touchcancel',
    'touchend',
    'touchenter',
    'touchleave',
    'touchmove',
    'touchstart',
    'unload',
    'wheel'
  ];

  /* Initialises the adapter. The parameter is:
   *
   * pathAnim - the pathAnim object
   */
  function initialise(pathAnim){

    // store the pathAnim object
    pathAnimation = pathAnim;

  }

  /* Adds a script element to the document. The parameters are:
   *
   * url      - the script URL
   * callback - a function to call once the script has loaded
   */
  function loadJavascript(url, callback){

    // create the script element and add it to the document
    var script    = document.createElement('script');
    script.src    = url;
    script.onload = callback;
    document.getElementsByTagName('head')[0].appendChild(script);

  }

  /* Returns the width or height of the specified node. The parameters are:
   *
   * node      - the node
   * dimension - either 'width' or 'height'
   */
  function getDimension(node, dimension){

    // check whether the browser can determine computed styles
    if ('getComputedStyle' in window){

      // return the computed dimension
      return parseInt(window.getComputedStyle(node)[dimension]);

    }else{

      // return the measured dimension
      return node[
          'client' + dimension.charAt(0).toUpperCase() + dimension.slice(1)];

    }

  }

  /* Adds an event listener. The parameters are:
   *
   * node     - the node
   * event    - the event
   * listener - the listener
   */
  function addEventListener(node, event, listener){

    // determine the type of event
    if (inArray(event, nativeEvents) == -1){

      // add a custom listener as the name does not match a native event
      addCustomEventListener(node, event, listener);

    }else if ('addEventListener' in node){

      // add a listener using the W3C event model
      node.addEventListener(event, listener, false);

    }else if ('attachEvent' in node){

      // add a listener using the legacy Microsoft event model
      node.attachEvent('on' + event, listener);

    }else{

      // add a custom listener as the node does not support native events
      addCustomEventListener(node, event, listener);

    }

  }

  /* Adds a custom event listener. The parameters are:
   *
   * node     - the node
   * event    - the event
   * listener - the listener
   */
  function addCustomEventListener(node, event, listener){

    // add the event listener
    if (!('_listeners' in node)) node._listeners = {};
    if (!(event in node._listeners)) node._listeners[event] = [];
    node._listeners[event].push(listener);

  }

  /* Removes an event listener. The parameters are:
   *
   * node     - the node
   * event    - the event
   * listener - the listener
   */
  function removeEventListener(node, event, listener){

    // determine the type of event
    if (inArray(event, nativeEvents) == -1){

      // remove a custom listener as the name does not match a native event
      removeCustomEventListener(node, event, listener);

    }else if ('addEventListener' in node){

      // remove a listener using the W3C event model
      node.removeEventListener(event, listener, false);

    }else if ('attachEvent' in node){

      // remove a listener using the legacy Microsoft event model
      node.detachEvent('on' + event, listener);

    }else{

      // remove a custom listener as the node does not support native events
      removeCustomEventListener(node, event, listener);

    }

  }

  /* Removes a custom event listener. The parameters are:
   *
   * node     - the node
   * event    - the event
   * listener - the listener
   */
  function removeCustomEventListener(node, event, listener){

    // return immediately if there are no listeners
    if (!('_listeners' in node) || !(event in node._listeners)) return;

    // find the index of the event listener
    var index = inArray(listener, node._listeners[event]);

    // remove the event listener if it was found
    if (index != -1) node._listeners[event].splice(index, 1);

  }

  /* Triggers an event on a node. The parameters are:
   *
   * node            - the node
   * event           - the event
   * eventParameters - the event parameters
   * defaultFunction - the function to call if the default is not prevented
   */
  function triggerEvent(node, event, eventParameters, defaultFunction){

    // ensure the eventParameters parameter is defined
    if (!eventParameters) eventParameters = {};

    // loop over the listeners, calling them
    if ('_listeners' in node && event in node._listeners){
      for (var i = 0; i < node._listeners[event].length; i ++){
        node._listeners[event][i].call(node, eventParameters);
      }
    }

    // call the default function if appropriate
    if (defaultFunction && !eventParameters.defaultPrevented){
      defaultFunction(eventParameters);
    }

  }

  // Dummy function required by Highcharts.
  function washMouseEvent(e){
    return e;
  }

  /* Animates a node. The parameters are:
   *
   * node       - the node
   * properties - an object mapping property names to their new value
   * options    - a list mapping option names to values
   *
   * The options are:
   *
   * duration - the duration of the animation in milliseconds; this optional
   *            parameter defaults to 400
   * complete - an optional function to call when the animation is complete
   */
  function startAnimating(node, properties, options){

    // determine whether this is an HTML node or SVG
    var isSVG = ('attr' in node);

    // initialise the processed properties
    var processedProperties = {};

    // loop over the properties
    for (var property in properties){

      // check whether the property is a path
      if (isSVG && property == 'd'){

        // store the paths
        processedProperties[property] = {
          end   : properties[property],
          paths :
              pathAnimation.init(
                  node,
                  node.d,
                  properties[property])
        };

      }else{

        // determine the property start value and change
        var start  = (isSVG ? node.attr(property) : node.style[property]);
        var change = (properties[property] ? properties[property] : 0) - start;

        // reset the property for SVG elements (needed for opacity at least)
        if (isSVG) node.attr(property, start);

        // store the start value and change
        processedProperties[property] = {
          start  : start,
          change : change
        };

      }

    }

    // determine the duration
    var duration = ('duration' in options ? options.duration : 400);

    // record the animation start time
    var startTime = (new Date()).getTime();

    // start animating
    if (!('_animations' in node)) node._animations = [];
    var interval =
        window.setInterval(
            function(){

              // determine the animation stage
              var offset = (new Date()).getTime() - startTime;
              var stage = (offset > duration ? 1 : offset / duration);

              // loop over the values
              for (var property in processedProperties){

                // check whether the property is a path
                if (isSVG && property == 'd'){

                  // determine the new value
                  var value =
                      pathAnimation.step(
                          processedProperties[property].paths[0],
                          processedProperties[property].paths[1],
                          stage,
                          processedProperties[property].end);

                }else{

                  // determine the new value
                  var value = processedProperties[property].start
                            + processedProperties[property].change * stage;

                }

                //update the property
                if (isSVG){
                  node.attr(property, value);
                }else{
                  node.style[property] = value;
                }

              }

              // stop animating and call the completion functon if necessary
              if (stage == 1){
                if ('complete' in options) options.complete();
                window.clearInterval(interval);
                node._animations.splice(inArray(interval, node._animations), 1);
              }

            },
            20);
    node._animations.push(interval);

  };

  /* Stops animating a node. The parameter is:
   *
   * node - the node
   */
  function stopAnimating(node){

    // check whether the node is being animated
    if ('_animations' in node){

      // loop over the animations, stopping them
      while (node._animations.length > 0){
        window.clearInterval(node._animations.pop());
      }

    }

  }

  /* Returns the offset, in pixels, of a node relative to the page. The returned
   * object has 'top' and 'left' as keys. The parameter is:
   *
   * node - the node
   */
  function getOffset(node){

    // initialise the offset
    var offset = {
      top  : 0,
      left : 0
    };

    // loop until we reach the root of the document
    while (node){

      // update the offset
      offset.top  += node.offsetTop;
      offset.left += node.offsetLeft;

      // move to the offset parent
      node = node.offsetParent;

    }

    // return the offset
    return offset;

  }

  /* Returns the index of an item in an array, or -1 if it is not found. The
   * parameters are:
   *
   * item  - the item to find
   * array - the array
   * start - the index from which to start; this optional parameter defaults to
   *         0
   */
  function inArray(item, array, start){

    // return immediately if the array was not supplied
    if (!array) return -1;

    // loop over the array, return the index of the item if it is found
    for (var i = (start === undefined ? 0 : start); i < array.length; i ++){
      if (array[i] === item) return i;
    }

    // return that the item was not found
    return -1;

  }

  /* Calls a function on each item in an array. The parameters are:
   *
   * array    - the array
   * callback - the function
   */
  function each(array, callback){

    // loop over the array, calling the function on each item
    for (var i = 0; i < array.length; i ++){
      callback.call(array[i], array[i], i, array);
    }

  }

  /* Returns the array produced by calling a function on each item in an array.
   * The parameters are:
   *
   * array    - the array
   * callback - the function
   */
  function map(array, callback){

    // initialise the mapped array
    var mappedArray = [];

    // loop over the array, mapping each item
    for (var i = 0; i < array.length; i ++){
      mappedArray[i] = callback.call(array[i], array[i], i);
    }

    // return the mapped array
    return mappedArray;

  }

  /* Calls a function on each item in an array and returns an array containing
   * all items for which the callback returned true. The parameters are:
   *
   * array    - the array
   * callback - the function
   */
  function filter(array, callback){

    // initialise the filtered array
    var filteredArray = [];

    // loop over the array, filtering each item
    for (var i = 0; i < array.length; i ++){
      if (callback.call(array[i], array[i], i)) filteredArray.push(array[i]);
    }

    // return the filtered array
    return filteredArray;


  }

  // return the public API
  return {
    init           : initialise,
    getScript      : loadJavascript,
    adapterRun     : getDimension,
    addEvent       : addEventListener,
    removeEvent    : removeEventListener,
    fireEvent      : triggerEvent,
    washMouseEvent : washMouseEvent,
    animate        : startAnimating,
    stop           : stopAnimating,
    offset         : getOffset,
    inArray        : inArray,
    each           : each,
    map            : map,
    grep           : filter
  };

})();
