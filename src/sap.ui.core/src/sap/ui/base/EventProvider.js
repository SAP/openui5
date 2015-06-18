/*!
 * ${copyright}
 */

// Provides class sap.ui.base.EventProvider
sap.ui.define(['jquery.sap.global', './Event', './Object', './ObjectPool'],
	function(jQuery, Event, BaseObject, ObjectPool) {
	"use strict";


	/**
	 * Creates an instance of EventProvider.
	 * @class Provides internal eventing facilities for objects, so other objects can attach
	 * and detach events, and are notified, when events are fired
	 *
	 * @abstract
	 * @extends sap.ui.base.Object
	 * @author Malte Wedel, Daniel Brinkmann
	 * @version ${version}
	 * @constructor
	 * @public
	 * @alias sap.ui.base.EventProvider
	 */
	var EventProvider = BaseObject.extend("sap.ui.base.EventProvider", /* @lends sap.ui.base.EventProvider */ {
	
		constructor : function() {
	
			BaseObject.call(this);
	
			/**
			 * A map of arrays of event registrations keyed by the event names
			 * @private
			 */
			this.mEventRegistry = {};
	
		}
	
	});
	
	/**
	 * Map of event names and ids, that are provided by this class
	 * @private
	 * @static
	 */
	EventProvider.M_EVENTS = {EventHandlerChange:"EventHandlerChange"};
	
	/**
	 * Pool is defined on the prototype to be shared among all EventProviders
	 * @private
	 */
	EventProvider.prototype.oEventPool = new ObjectPool(Event);
	
	/**
	 * Adds an event registration for the given object and given event name
	 *
	 * @param {string}
	 *            sEventId The identifier of the event to listen for
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or on the event provider-instance
	 * @param {object}
	 *            [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.base.EventProvider} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	EventProvider.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		jQuery.sap.assert(typeof (sEventId) === "string" && sEventId, "EventProvider.attachEvent: sEventId must be a non-empty string");
		if (typeof (oData) === "function") {
		//one could also increase the check in the line above
		//if(typeof(oData) === "function" && oListener === undefined) {
			oListener = fnFunction;
			fnFunction = oData;
			oData = undefined;
		}
		jQuery.sap.assert(typeof (fnFunction) === "function", "EventProvider.attachEvent: fnFunction must be a function");
		jQuery.sap.assert(!oListener || typeof (oListener) === "object", "EventProvider.attachEvent: oListener must be empty or an object");
	
		if (!this.mEventRegistry[sEventId]) {
			this.mEventRegistry[sEventId] = [];
		}
		this.mEventRegistry[sEventId].push({oListener:oListener, fFunction:fnFunction, oData: oData});
	
		// Inform interested parties about changed EventHandlers
		this.fireEvent(EventProvider.M_EVENTS.EventHandlerChange, {EventId: sEventId, type: 'listenerAttached'});
	
		return this;
	};
	
	/**
	 * Adds a one time event registration for the given object and given event name. When the event occurs, the handler function is called and removed
	 * from registration.
	 *
	 * @param {string}
	 *            sEventId The identifier of the event to listen for
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or on the event provider-instance
	 * @param {object}
	 *            [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.base.EventProvider} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	EventProvider.prototype.attachEventOnce = function(sEventId, oData, fnFunction, oListener) {
		if (typeof (oData) === "function") {
			oListener = fnFunction;
			fnFunction = oData;
			oData = undefined;
		}
		function fnOnce() {
			this.detachEvent(sEventId, fnOnce);  // ‘this’ is always the control, due to the context ‘undefined’ in the attach call below
			fnFunction.apply(oListener || this, arguments);  // needs to do the same resolution as in fireEvent
		}
		this.attachEvent(sEventId, oData, fnOnce, undefined);  // a listener of ‘undefined’ enforce a context of ‘this’ even after clone
		return this;
	};
	
	/**
	 * Removes an event registration for the given object and given event name.
	 *
	 * The passed parameters must match those used for registration with {@link #attachEvent } beforehand!
	 *
	 * @param {string}
	 *            sEventId The identifier of the event to detach from
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.base.EventProvider} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	EventProvider.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		jQuery.sap.assert(typeof (sEventId) === "string" && sEventId, "EventProvider.detachEvent: sEventId must be a non-empty string" );
		jQuery.sap.assert(typeof (fnFunction) === "function", "EventProvider.detachEvent: fnFunction must be a function");
		jQuery.sap.assert(!oListener || typeof (oListener) === "object", "EventProvider.detachEvent: oListener must be empty or an object");
	
		var aEventListeners = this.mEventRegistry[sEventId];
		if (!aEventListeners) {
			return this;
		}
		
		var bListenerDetached = false;
		
		//PERFOPT use array. remember length to not re-calculate over and over again
		for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
			//PERFOPT check for identity instead of equality... avoid type conversion
			if (aEventListeners[i].fFunction === fnFunction && aEventListeners[i].oListener === oListener) {
				//delete aEventListeners[i];
				aEventListeners.splice(i,1);
				bListenerDetached = true;
				break;
			}
		}
		// If we just deleted the last registered EventHandler, remove the whole entry from our map.
		if (aEventListeners.length == 0) {
			delete this.mEventRegistry[sEventId];
		}
	
		if (bListenerDetached) {
			// Inform interested parties about changed EventHandlers
			this.fireEvent(EventProvider.M_EVENTS.EventHandlerChange, {EventId: sEventId, type: 'listenerDetached' });
		}
	
		return this;
	};
	
	/**
	 * Fires the given event and notifies all listeners. Listeners must not change
	 * the content of the event.
	 *
	 * @param {string} sEventId the event id
	 * @param {object} [mParameters] the parameter map
	 * @param {boolean} [bAllowPreventDefault] whether prevent default is allowed
	 * @param {boolean} [bEnableEventBubbling] whether event bubbling is enabled
	 * @return {sap.ui.base.EventProvider|boolean} Returns <code>this</code> to allow method chaining or
	 *		   whether the default action should be executed, when bAllowPreventDefault has been set to true
	 * @protected
	 */
	EventProvider.prototype.fireEvent = function(sEventId, mParameters, bAllowPreventDefault, bEnableEventBubbling) {
		// at least in BrowserEventManager when firing events of its E_EVENTS enumeration, the type will be an integer... thus avoid this check
		//	jQuery.sap.assert(typeof (sEventId) == "string");
	
		// get optional parameters right
		if (typeof mParameters == "boolean") {
			bEnableEventBubbling = bAllowPreventDefault;
			bAllowPreventDefault = mParameters;
		}
	
		var aEventListeners = this.mEventRegistry[sEventId],
			bPreventDefault = false,
			oEvent, oParent, oInfo;
	
		if (bEnableEventBubbling || (aEventListeners && jQuery.isArray(aEventListeners))) {
	
			// this ensures no 'concurrent modification exception' occurs (e.g. an event listener deregisters itself).
			aEventListeners = aEventListeners ? aEventListeners.slice() : [];
	
			oEvent = this.oEventPool.borrowObject(sEventId, this, mParameters);
	
			//PERFOPT use array. remember length to not re-calculate over and over again
			for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
				oInfo = aEventListeners[i];
				oInfo.fFunction.call(oInfo.oListener || this, oEvent, oInfo.oData);
			}
	
			// In case this is a bubbling event and object has a getParent method, also fire on parents
			if (bEnableEventBubbling) {
				oParent = this.getEventingParent();
				while (oParent && !oEvent.bCancelBubble) {
					aEventListeners = oParent.mEventRegistry[sEventId];
					if (aEventListeners && aEventListeners instanceof Array) {
						aEventListeners = aEventListeners.slice();
						for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
							oInfo = aEventListeners[i];
							oInfo.fFunction.call(oInfo.oListener || oParent, oEvent, oInfo.oData);
						}
					}
					oParent = oParent.getEventingParent();
				}
			}
	
			// Store prevent default state, before returning event to the pool
			bPreventDefault = oEvent.bPreventDefault;
	
			this.oEventPool.returnObject(oEvent);
		}
	
		// Only return prevent default result in case it has been enabled, for compatibility
		if (bAllowPreventDefault) {
			return !bPreventDefault;
		} else {
			return this;
		}
	};
	
	/**
	 * Returns whether there are any listeners for the given event ID.
	 *
	 * @param {string} sEventId the ID of the event
	 * @return {boolean} whether there are any listeners
	 * @private
	 */
	EventProvider.prototype.hasListeners = function(sEventId) {
		return !!this.mEventRegistry[sEventId];
	};
	
	/**
	 * Returns the list of events currently having listeners attached.
	 *
	 * Introduced for lightspeed support to ensure that only relevant events are attached to the LS-world.
	 *
	 * This is a static method to avoid the pollution of the Element/Control namespace.
	 * As the callers are limited and known and for performance reasons the internal event registry
	 * is returned. It contains more information than necessary, but needs no expensive conversion.
	 *
	 * @return {object} the list of events currently having listeners attached
	 * @private
	 * @static
	 */
	EventProvider.getEventList = function(oEventProvider) {
		return oEventProvider.mEventRegistry;
	};
	
	/**
	 * Returns the parent in the eventing hierarchy of this object.
	 *
	 * Per default this returns null, but if eventing is used in objects, which are hierarchically
	 * structured, this can be overwritten to make the object hierarchy visible to the eventing and
	 * enables the use of event bubbling within this object hierarchy.
	 *
	 * @return {sap.ui.base.EventProvider} the parent event provider
	 * @protected
	 */
	EventProvider.prototype.getEventingParent = function() {
		return null;
	};
	
	/**
	 * Returns a string representation of this object.
	 *
	 * In case there is no class or id information, a simple static string is returned.
	 * Subclasses should override this method.
	 *
	 * @return {string} a string description of this eventProvider
	 * @public
	 */
	EventProvider.prototype.toString = function() {
		if ( this.getMetadata ) {
			return "EventProvider " + this.getMetadata().getName();
		} else {
			return "EventProvider";
		}
	};
	
	
	/**
	 * @see sap.ui.base.Object.prototype.destroy
	 * @public
	 */
	EventProvider.prototype.destroy = function() {
		this.mEventRegistry = {};
		BaseObject.prototype.destroy.apply(this, arguments);
	};
	

	return EventProvider;

});
