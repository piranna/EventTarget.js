
function EventTarget() {}

Object.assign(EventTarget.prototype, {

  addEventListener: function (type, listener) {
    if (!this._listeners) Object.defineProperty(this, '_listeners', {value: {}})
    var listeners = this._listeners

    var listenersByType = listeners[type]
    if (listenersByType === undefined) listeners[type] = listenersByType = [];

    if (listenersByType.some(function (l) {
      return l === listener
    })) return

    listenersByType.push(listener)
  },

  dispatchEvent: function (ev) {
    if (!this._listeners) Object.defineProperty(this, '_listeners', {value: {}})
    var listeners = this._listeners
    if (ev._dispatched) throw new DOMException('The object is in an invalid state.', 'InvalidStateError')
    ev._dispatched = true

    var type = ev.type
    if (type == undefined || type == '') throw new DOMException('UNSPECIFIED_EVENT_TYPE_ERR', 'UNSPECIFIED_EVENT_TYPE_ERR')

    var listenersByType = listeners[type].concat() || []

    var dummyListener = this['on' + type]
    var dummyIPos = listenersByType.length ? 1 : 0

    var stopImmediatePropagation = false

    // [ToDo] Use read-only properties instead of attributes when available
    ev.cancelable = true
    ev.defaultPrevented = false
    ev.isTrusted = false
    ev.preventDefault = function () {
      if (this.cancelable) this.defaultPrevented = true
    }
    ev.stopImmediatePropagation = function () {
      stopImmediatePropagation = true
    }
    ev.target = this
    ev.timeStamp = new Date().getTime()

    listenersByType.some(function (listener, i) {
      if (stopImmediatePropagation) return true
      if (i === dummyIPos && typeof dummyListener === 'function') {
        // We don't splice this in as could be overwritten; executes here per
        //  https://html.spec.whatwg.org/multipage/webappapis.html#event-handler-attributes:event-handlers-14
        dummyListener.call(this, ev)
      }
      listener.call(this, ev)
    }, this)
    if (typeof dummyListener === 'function' && listenersByType.length < 2) dummyListener.call(this, ev) // Won't have executed if too short

    return !ev.defaultPrevented
  },

  hasEventListener: function (type, listener) {
    if (!this._listeners) Object.defineProperty(this, '_listeners', {value: {}})

    var listeners = this._listeners;
    if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1) {
      return true
    }
    return false
  },

  removeEventListener: function (type, listener) {
    if (!this._listeners) Object.defineProperty(this, '_listeners', {value: {}})
    var listeners = this._listeners

    var listenersByType = listeners[type]
    if (listenersByType === undefined) return

    listenersByType.some(function (l, i) {
      if (l === listener) {
        listenersByType.splice(i, 1)
        return true
      }
    })

    if (!listenersByType.length) delete listeners[type]
  }
})

if (typeof module !== 'undefined' && module.exports) module.exports = EventTarget
