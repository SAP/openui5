sap.ui.define(['exports', './chunk-7ceb84db'], function (exports, __chunk_1) { 'use strict';

	var NativeResize =
	/*#__PURE__*/
	function () {
	  function NativeResize() {
	    __chunk_1._classCallCheck(this, NativeResize);
	  }

	  __chunk_1._createClass(NativeResize, null, [{
	    key: "initialize",
	    value: function initialize() {
	      NativeResize.resizeObserver = new window.ResizeObserver(function (entries) {
	        // call attached callbacks
	        entries.forEach(function (entry) {
	          var callbacks = NativeResize.observedObjects.get(entry.target);
	          callbacks.forEach(function (el) {
	            return el();
	          });
	        });
	      });
	      NativeResize.observedObjects = new Map();
	    }
	  }, {
	    key: "attachListener",
	    value: function attachListener(ref, callback) {
	      var observedDOMs = NativeResize.observedObjects;
	      var callbacks = observedDOMs.get(ref) || []; // if no callbacks has been added for this ref - start observing it

	      if (!callbacks.length) {
	        NativeResize.resizeObserver.observe(ref);
	      } // save the callbacks in an array


	      observedDOMs.set(ref, [].concat(__chunk_1._toConsumableArray(callbacks), [callback]));
	    }
	  }, {
	    key: "detachListener",
	    value: function detachListener(ref, callback) {
	      var callbacks = NativeResize.observedObjects.get(ref) || [];
	      var filteredCallbacks = callbacks.filter(function (fn) {
	        return fn !== callback;
	      });

	      if (!callbacks.length || callbacks.length === filteredCallbacks.length && callbacks.length !== 0) {
	        return;
	      }

	      NativeResize.observedObjects.set(ref, filteredCallbacks);

	      if (!filteredCallbacks.length) {
	        NativeResize.resizeObserver.unobserve(ref);
	      }
	    }
	  }]);

	  return NativeResize;
	}();

	var INTERVAL = 300;

	var CustomResize =
	/*#__PURE__*/
	function () {
	  function CustomResize() {
	    __chunk_1._classCallCheck(this, CustomResize);
	  }

	  __chunk_1._createClass(CustomResize, null, [{
	    key: "initialize",
	    value: function initialize() {
	      CustomResize.initialized = false;
	      CustomResize.resizeInterval = undefined;
	      CustomResize.resizeListeners = new Map();
	    }
	  }, {
	    key: "attachListener",
	    value: function attachListener(ref, callback) {
	      var observedObject = CustomResize.resizeListeners.get(ref);
	      var existingCallbacks = observedObject ? observedObject.callbacks : [];
	      CustomResize.resizeListeners.set(ref, {
	        width: ref ? ref.offsetWidth : 0,
	        height: ref ? ref.offsetHeight : 0,
	        callbacks: existingCallbacks.concat(callback)
	      });
	      CustomResize.initListener();
	    }
	  }, {
	    key: "initListener",
	    value: function initListener() {
	      if (CustomResize.resizeListeners.size > 0 && !CustomResize.initialized) {
	        CustomResize.resizeInterval = setInterval(CustomResize.checkListeners.bind(CustomResize), INTERVAL);
	      }
	    }
	  }, {
	    key: "checkListeners",
	    value: function checkListeners() {
	      CustomResize.resizeListeners.forEach(function (entry, ref) {
	        var changed = CustomResize.checkSizes(entry, ref);

	        if (changed || entry && !entry._hasBeenRendered) {
	          CustomResize.updateSizes(entry, ref.offsetWidth, ref.offsetHeight);
	          entry.callbacks.forEach(function (el) {
	            return el();
	          });
	          entry._hasBeenRendered = true;
	        }
	      });
	    }
	  }, {
	    key: "updateSizes",
	    value: function updateSizes(sizes, newWidth, newHeight) {
	      sizes.width = newWidth;
	      sizes.height = newHeight;
	    }
	  }, {
	    key: "checkSizes",
	    value: function checkSizes(entry, ref) {
	      var oldHeight = entry.height;
	      var oldWidth = entry.width;
	      var newHeight = ref.offsetHeight;
	      var newWidth = ref.offsetWidth;
	      return oldHeight !== newHeight || oldWidth !== newWidth;
	    }
	  }, {
	    key: "detachListener",
	    value: function detachListener(ref, callback) {
	      var listenerObject = CustomResize.resizeListeners.get(ref);
	      var callbacks = listenerObject ? listenerObject.callbacks : [];
	      var filteredCallbacks = callbacks.filter(function (fn) {
	        return fn !== callback;
	      });

	      if (!listenerObject || callbacks.length === filteredCallbacks.length && callbacks.length !== 0) {
	        return;
	      }

	      CustomResize.resizeListeners.set(ref, Object.assign(listenerObject, {
	        callbacks: filteredCallbacks
	      }));

	      if (!filteredCallbacks.length) {
	        listenerObject.callbacks = null;
	        CustomResize.resizeListeners["delete"](ref);
	      }

	      if (CustomResize.resizeListeners.size === 0) {
	        CustomResize.initialized = false;
	        clearInterval(CustomResize.resizeInterval);
	      }
	    }
	  }]);

	  return CustomResize;
	}();

	var ResizeHandler =
	/*#__PURE__*/
	function () {
	  function ResizeHandler() {
	    __chunk_1._classCallCheck(this, ResizeHandler);
	  }

	  __chunk_1._createClass(ResizeHandler, null, [{
	    key: "initialize",
	    value: function initialize() {
	      ResizeHandler.Implementation = window.ResizeObserver ? NativeResize : CustomResize;
	      ResizeHandler.Implementation.initialize();
	    }
	    /**
	     * @static
	     * @private
	     * @param {*} ref Reference to be observed
	     * @param {*} callback Callback to be executed
	     * @memberof ResizeHandler
	     */

	  }, {
	    key: "attachListener",
	    value: function attachListener(ref, callback) {
	      ResizeHandler.Implementation.attachListener.call(ResizeHandler.Implementation, ref, callback);
	    }
	    /**
	     * @static
	     * @private
	     * @param {*} ref Reference to be unobserved
	     * @memberof ResizeHandler
	     */

	  }, {
	    key: "detachListener",
	    value: function detachListener(ref, callback) {
	      ResizeHandler.Implementation.detachListener.call(ResizeHandler.Implementation, ref, callback);
	    }
	    /**
	     * @static
	     * @public
	     * @param {*} ref Reference to a UI5 Web Component or DOM Element to be observed
	     * @param {*} callback Callback to be executed
	     * @memberof ResizeHandler
	     */

	  }, {
	    key: "register",
	    value: function register(ref, callback) {
	      if (ref.isUI5Element) {
	        ref = ref.getDomRef();
	      }

	      ResizeHandler.attachListener(ref, callback);
	    }
	    /**
	     * @static
	     * @public
	     * @param {*} ref Reference to UI5 Web Component or DOM Element to be unobserved
	     * @memberof ResizeHandler
	     */

	  }, {
	    key: "deregister",
	    value: function deregister(ref, callback) {
	      if (ref.isUI5Element) {
	        ref = ref.getDomRef();
	      }

	      ResizeHandler.detachListener(ref, callback);
	    }
	  }]);

	  return ResizeHandler;
	}();

	ResizeHandler.initialize();

	exports.ResizeHandler = ResizeHandler;

});
//# sourceMappingURL=chunk-b4193b36.js.map
