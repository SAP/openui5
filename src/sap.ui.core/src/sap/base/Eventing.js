/*!
 * ${copyright}
 */

// Provides mixin sap/base/Eventing
sap.ui.define([
	"sap/base/assert",
	"sap/base/Event"
], function(
	assert,
	Event
) {
	"use strict";

	/**
	 * Eventing mixin
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @param {module:sap/base/Event} fnEventClass The Event class
	 * @mixin module:sap/base/Eventing
	 * @private
	 * @ui5-restricted sap.ui.core sap/base/i18n sap/ui/base/EventProvider
	 */
	var Eventing = function(fnEventClass) {
		this.fnEventClass = fnEventClass || Event;
		this.attachEvent = attachEvent;
		this.attachEventOnce = attachEventOnce;
		this.detachEvent = detachEvent;
		this.fireEvent = fireEvent;
		this.hasListeners = hasListeners;
		this.getEventingParent = getEventingParent;
		if (this.destroy) {
			var fnOrigDestroy = this.destroy;
			this.destroy = function() {
				fnOrigDestroy.apply(this, arguments);
				destroy();
			};
		} else {
			this.destroy = destroy;
		}
	};

	/**
	 * Attaches an event handler to the event with the given identifier.
	 *
	 * @param {string}
	 * 		sType The type of the event to listen for
	 * @param {function}
	 * 		fnFunction The handler function to call when the event occurs. The event
	 * 		object ({@link module:sap/base/Event}) is provided as first argument of the handler. Handlers must not change
	 * 		the content of the event.
 	 * @param {object}
	 * 		[oData] An object that will be passed to the handler along with the event object when the event is fired
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @name module:sap/base/Eventing#attachEvent
	 * @function
	 * @public
	 */
	function attachEvent(sType, fnFunction, oData) {
		this.mEventRegistry = this.mEventRegistry || {};
		assert(typeof (sType) === "string" && sType, "Eventing.attachEvent: sType must be a non-empty string");
		assert(typeof (fnFunction) === "function", "Eventing.attachEvent: fnFunction must be a function");

		var aEventListeners = this.mEventRegistry[sType];
		if ( !Array.isArray(aEventListeners) ) {
			aEventListeners = this.mEventRegistry[sType] = [];
		}

		aEventListeners.push({fnFunction: fnFunction, oData: oData});

		return this;
	}

	/**
	 * Attaches an event handler, called one time only, to the event with the given identifier.
	 *
	 * When the event occurs, the handler function is called and the handler registration is automatically removed afterwards.
	 *
	 * @param {string}
	 *            sType The type of the event to listen for
	 * @param {function}
	 *            fnFunction The handler function to call when the event occurs. The event
	 *                       object ({@link module:sap/base/Event}) is provided as first argument of the handler. Handlers must not change
	 *                       the content of the event.
	 * @param {object}
	 *            [oData] An object that will be passed to the handler along with the event object when the event is fired
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @name module:sap/base/Eventing#attachEventOnce
	 * @function
	 * @public
	 */
	function attachEventOnce(sType, fnFunction, oData) {
		var fnOnce = function() {
			this.detachEvent(sType, fnOnce);
			fnFunction.apply(this, arguments);  // needs to do the same resolution as in fireEvent
		};
		fnOnce.oOriginal = {
			fnFunction: fnFunction,
			oData: oData
		};
		this.attachEvent(sType, fnOnce, oData);
		return this;
	}

	/**
	 * Removes a previously attached event handler from the event with the given identifier.
	 *
	 * The passed parameters must match those used for registration with {@link #attachEvent} beforehand.
	 *
	 * @param {string}
	 *            sType The type of the event to detach from
	 * @param {function}
	 *            fnFunction The handler function to detach from the event
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @name module:sap/base/Eventing#detachEvent
	 * @function
	 * @public
	 */
	function detachEvent(sType, fnFunction) {
		this.mEventRegistry = this.mEventRegistry || {};
		assert(typeof (sType) === "string" && sType, "Eventing.detachEvent: sType must be a non-empty string" );
		assert(typeof (fnFunction) === "function", "Eventing.detachEvent: fnFunction must be a function");

		var aEventListeners = this.mEventRegistry[sType];
		if ( !Array.isArray(aEventListeners) ) {
			return this;
		}

		var oFound, oOriginal;

		for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
			if (aEventListeners[i].fnFunction === fnFunction) {
				oFound = aEventListeners[i];
				aEventListeners.splice(i,1);
				break;
			}
		}
		// If no listener was found, look for original listeners of attachEventOnce
		if (!oFound) {
			for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
				oOriginal = aEventListeners[i].fnFunction.oOriginal;
				if (oOriginal && oOriginal.fnFunction === fnFunction) {
					oFound = oOriginal;
					aEventListeners.splice(i,1);
					break;
				}
			}
		}
		// If we just deleted the last registered EventHandler, remove the whole entry from our map.
		if (aEventListeners.length == 0) {
			delete this.mEventRegistry[sType];
		}

		return this;
	}

	/**
	 * Fires an {@link module:sap/base/Event event} with the given settings and notifies all attached event handlers.
	 *
	 * @param {string}
	 *            sType The type of the event to fire
	 * @param {object}
	 *            [oParameters] Parameters which should be carried by the event
	 * @param {boolean}
	 *            [bAllowPreventDefault] Defines whether function <code>preventDefault</code> is supported on the fired event
	 * @param {boolean}
	 *            [bEnableEventBubbling] Defines whether event bubbling is enabled on the fired event. Set to <code>true</code> the event is also forwarded to the parent(s)
	 *                                   of the event provider ({@link #getEventingParent}) until the bubbling of the event is stopped or no parent is available anymore.
	 * @return {this|boolean} Returns <code>this</code> to allow method chaining. When <code>preventDefault</code> is supported on the fired event
	 *                                             the function returns <code>true</code> if the default action should be executed, <code>false</code> otherwise.
	 * @name module:sap/base/Eventing#fireEvent
	 * @function
	 * @protected
	 */
	function fireEvent(sType, oParameters, bAllowPreventDefault, bEnableEventBubbling) {

		// get optional parameters right
		if (typeof oParameters === "boolean") {
			bEnableEventBubbling = bAllowPreventDefault;
			bAllowPreventDefault = oParameters;
		}
		/* eslint-disable consistent-this */
		var oProvider = this,
		/* eslint-enable consistent-this */
			bPreventDefault = false,
			aEventListeners, oEvent, i, iL, oInfo;

		do {
			oProvider.mEventRegistry = oProvider.mEventRegistry || {};
			aEventListeners = oProvider.mEventRegistry[sType];

			if ( Array.isArray(aEventListeners) ) {

				// avoid issues with 'concurrent modification' (e.g. if an event listener unregisters itself).
				aEventListeners = aEventListeners.slice();
				oEvent = new oProvider.fnEventClass(sType, this, oParameters);

				for (i = 0, iL = aEventListeners.length; i < iL; i++) {
					oInfo = aEventListeners[i];
					oInfo.fnFunction.call(oProvider, oEvent, oInfo.oData);
				}

				bEnableEventBubbling = bEnableEventBubbling && !oEvent.bCancelBubble;
			}

			oProvider = oProvider.getEventingParent();

		} while (bEnableEventBubbling && oProvider);

		if ( oEvent ) {
			// remember 'prevent default' state before returning event to the pool
			bPreventDefault = oEvent.bPreventDefault;
		}

		// return 'execute default' flag only when 'prevent default' has been enabled, otherwise return 'this' (for compatibility)
		return bAllowPreventDefault ? !bPreventDefault : this;
	}

	/**
	 * Returns whether there are any registered event handlers for the event with the given identifier.
	 *
	 * @param {string} sType The type of the event
	 * @return {boolean} Whether there are any registered event handlers
	 * @name module:sap/base/Eventing#hasListeners
	 * @function
	 * @protected
	 */
	function hasListeners(sType) {
		return !!(this.mEventRegistry && this.mEventRegistry[sType]);
	}

	/**
	 * Returns the list of events currently having listeners attached.
	 *
	 * Introduced for lightspeed support to ensure that only relevant events are attached to the LS-world.
	 *
	 * This is a static method to avoid the pollution of the Element/Control namespace.
	 * As the callers are limited and known and for performance reasons the internal event registry
	 * is returned. It contains more information than necessary, but needs no expensive conversion.
	 *
	 * @param {module:sap/base/Eventing} oEventing The event provider to get the registered events for
	 * @return {object} the list of events currently having listeners attached
	 * @name module:sap/base/Eventing.getEventList
	 * @function
	 * @private
	 * @static
	 */
	Eventing.getEventList = function(oEventing) {
		return oEventing.mEventRegistry || {};
	};

	/**
	 * Checks whether the given event provider has the given listener registered for the given event.
	 *
	 * Returns true if function and listener object both match the corresponding parameters of
	 * at least one listener registered for the named event.
	 *
	 * @param {module:sap/base/Eventing}
	 *            oEventing The event provider to get the registered events for
	 * @param {string}
	 *            sType The type of the event to check listeners for
	 * @param {function}
	 *            fnFunction The handler function to check for
	 * @return {boolean} Returns whether a listener with the same parameters exists
	 * @name module:sap/base/Eventing.hasListener
	 * @function
	 * @private
	 * @ui5-restricted sap/base, sap.ui.core
	 */
	Eventing.hasListener = function(oEventing, sType, fnFunction) {
		assert(typeof (sType) === "string" && sType, "Eventing.hasListener: sType must be a non-empty string" );
		assert(typeof (fnFunction) === "function", "Eventing.hasListener: fnFunction must be a function");

		var aEventListeners = oEventing && oEventing.mEventRegistry[sType];
		if ( aEventListeners ) {
			for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
				if (aEventListeners[i].fnFunction === fnFunction) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Returns the parent in the Eventing hierarchy of this object.
	 *
	 * Per default this returns null, but if Eventing is used in objects, which are hierarchically
	 * structured, this can be overwritten to make the object hierarchy visible to the Eventing and
	 * enables the use of event bubbling within this object hierarchy.
	 *
	 * @return {module:sap/base/Eventing|null} The parent event provider
	 * @name module:sap/base/Eventing#getEventingParent
	 * @function
	 * @protected
	 */
	function getEventingParent() {
		return null;
	}

	/**
	 * Cleans up the internal structures and removes all event handlers.
	 *
	 * The object must not be used anymore after destroy was called.
	 *
	 * @name module:sap/base/Eventing#destroy
	 * @function
	 * @public
	 */
	function destroy() {
		this.mEventRegistry = {};
	}

	return Eventing;
});