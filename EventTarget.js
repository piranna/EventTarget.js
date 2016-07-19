/**
 * @author mrdoob / http://mrdoob.com
 * @author Jesús Leganés Combarro "Piranna" <piranna@gmail.com>
 */


if(typeof Event === 'undefined')
  function Event(type, eventInitDict)
  {
    eventInitDict = eventInitDict || {}

    Object.defineProperties(this,
    {
      type      : {value: type, enumerable: true}),
      bubbles   : {value: eventInitDict.bubbles, enumerable: true}),
      cancelable: {value: eventInitDict.cancelable, enumerable: true}),
      composed  : {value: eventInitDict.composed, enumerable: true})
    }
  }


function EventTarget()
{
  var listeners = {};

  this.addEventListener = function(type, listener)
  {
    if(!listener) return

    var listeners_type = listeners[type]
    if(listeners_type === undefined)
      listeners[type] = listeners_type = [];

    for(var i=0,l; l=listeners_type[i]; i++)
      if(l === listener) return;

    listeners_type.push(listener);
  };

  this.dispatchEvent = function(event)
  {
    if(event._dispatched) throw 'InvalidStateError'
    Object.defineProperty(event, '_dispatched', {value: true})

    var type = event.type
    if(type == null || type == '') throw 'UNSPECIFIED_EVENT_TYPE_ERR'

    var listenerArray = listeners[type] || []

    var dummyListener = this['on' + type];
    if(dummyListener instanceof Function)
      listenerArray = listenerArray.concat(dummyListener);

    var stopImmediatePropagation = false

    Object.defineProperties(event,
    {
      cancelable: {value: true, enumerable: true},
      defaultPrevented: {value: false, enumerable: true},
      isTrusted: {value: false, enumerable: true},
      target: {value: this, enumerable: true},
      timeStamp: {value: new Date().getTime(), enumerable: true}
    })

    event.preventDefault = function()
    {
      if(this.cancelable)
        Object.defineProperty(this, 'defaultPrevented', {value: true})
    }
    event.stopPropagation = function()
    {
      stopPropagation = true
    }
    event.stopImmediatePropagation = function()
    {
      stopImmediatePropagation = true
    }

    for(var i=0,listener; listener=listenerArray[i]; i++)
    {
      if(stopImmediatePropagation) break

      listener.call(this, event);
    }

    return !event.defaultPrevented
  };

  this.removeEventListener = function(type, listener)
  {
    if(!listener) return

    var listeners_type = listeners[type]
    if(listeners_type === undefined) return

    for(var i=0,l; l=listeners_type[i]; i++)
      if(l === listener)
      {
        listeners_type.splice(i, 1);
        break;
      }

    if(!listeners_type.length)
      delete listeners[type]
  };
};


if(typeof module !== 'undefined' && module.exports)
  module.exports = EventTarget;
