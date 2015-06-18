/*!
 * ${copyright}
 */

// Provides class sap.ui.core.EventBus
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/base/EventProvider'],
	function(jQuery, BaseObject, EventProvider) {
	"use strict";


	/**
	 * Creates an instance of EventBus.
	 * @class Provides eventing facilities, so subscribe, unsubscribe and publish events.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.8.0
	 * @alias sap.ui.core.EventBus
	 */
	var EventBus = BaseObject.extend("sap.ui.core.EventBus", {
		
		constructor : function() {
			BaseObject.apply(this);
			this._mChannels = {};
			this._defaultChannel = new EventProvider();
		}
	
	});
	
	/**
	 * Adds an event registration for the given object and given event name.
	 * 
	 * The channel "sap.ui" is reserved by th UI5 framework. An application might listen to events on this channel but is not allowed to publish own events there.
	 *
	 * @param {string}
	 *            [sChannelId] The channel of the event to subscribe for. If not given the default channel is used.
	 * @param {string}
	 *            sEventId The identifier of the event to subscribe for
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or on the event bus-instance. This functions might have the following parameters: sChannelId, sEventId, oData.
	 * @param {object}
	 *            [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	EventBus.prototype.subscribe = function(sChannelId, sEventId, fnFunction, oListener) {
		if (typeof (sEventId) === "function") {
			oListener = fnFunction;
			fnFunction = sEventId;
			sEventId = sChannelId;
			sChannelId = null;
		}
		
		jQuery.sap.assert(!sChannelId || typeof (sChannelId) === "string", "EventBus.subscribe: sChannelId must be empty or a non-empty string");
		jQuery.sap.assert(typeof (sEventId) === "string" && sEventId, "EventBus.subscribe: sEventId must be a non-empty string");
		jQuery.sap.assert(typeof (fnFunction) === "function", "EventBus.subscribe: fnFunction must be a function");
		jQuery.sap.assert(!oListener || typeof (oListener) === "object", "EventBus.subscribe: oListener must be empty or an object");
		
		var oChannel = getOrCreateChannel(this, sChannelId);
		oChannel.attachEvent(sEventId, fnFunction, oListener);
		return this;
	};
	
	/**
	 * Removes an event registration for the given object and given event name.
	 *
	 * The passed parameters must match those used for registration with {@link #subscribe } beforehand!
	 *
	 * @param {string}
	 *            [sChannelId] The channel of the event to unsubscribe from. If not given the default channel is used.
	 * @param {string}
	 *            sEventId The identifier of the event to unsubscribe from
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            [oListener] The object, that wants to be notified, when the event occurs
	 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	EventBus.prototype.unsubscribe = function(sChannelId, sEventId, fnFunction, oListener) {
		if (typeof (sEventId) === "function") {
			oListener = fnFunction;
			fnFunction = sEventId;
			sEventId = sChannelId;
			sChannelId = null;
		}
		
		jQuery.sap.assert(!sChannelId || typeof (sChannelId) === "string", "EventBus.unsubscribe: sChannelId must be empty or a non-empty string");
		jQuery.sap.assert(typeof (sEventId) === "string" && sEventId, "EventBus.unsubscribe: sEventId must be a non-empty string");
		jQuery.sap.assert(typeof (fnFunction) === "function", "EventBus.unsubscribe: fnFunction must be a function");
		jQuery.sap.assert(!oListener || typeof (oListener) === "object", "EventBus.unsubscribe: oListener must be empty or an object");
		
		var oChannel = getChannel(this, sChannelId);
		if (!oChannel) {
			return this;
		}
		
		oChannel.detachEvent(sEventId, fnFunction, oListener);
		if (oChannel != this._defaultChannel) { // Check whether Channel is unused
			var mEvents = EventProvider.getEventList(oChannel);
			var bIsEmpty = true;
			for (var sId in mEvents) {
				if (oChannel.hasListeners(sId)) {
					bIsEmpty = false;
					break;
				}
			}
			if (bIsEmpty) {
				delete this._mChannels[sChannelId];
			}
		}
		
		return this;
	};
	
	/**
	 * Fires the given event and notifies all listeners. Listeners must not change the content of the event.
	 * 
	 * The channel "sap.ui" is reserved by the UI5 framework. An application might listen to events 
	 * on this channel but is not allowed to publish own events there.
	 *
	 * @param {string}
	 *            [sChannelId] The channel of the event; if not given the default channel is used
	 * @param {string}
	 *            sEventId The identifier of the event
	 * @param {object}
	 * 			  [oData] the parameter map
	 * @public
	 */
	EventBus.prototype.publish = function(sChannelId, sEventId, oData) {
		
		if (arguments.length == 1) { //sEventId
			oData = null;
			sEventId = sChannelId;
			sChannelId = null;
		} else if (arguments.length == 2) { //sChannelId + sEventId || sEventId + oData
			if (typeof (sEventId) != "string") {
				oData = sEventId;
				sEventId = sChannelId;
				sChannelId = null;
			}
		}
		
		oData = oData ? oData : {};
		
		jQuery.sap.assert(!sChannelId || typeof (sChannelId) === "string", "EventBus.publish: sChannelId must be empty or a non-empty string");
		jQuery.sap.assert(typeof (sEventId) === "string" && sEventId, "EventBus.publish: sEventId must be a non-empty string");
		jQuery.sap.assert(typeof (oData) === "object", "EventBus.publish: oData must be an object");
		
		var oChannel = getChannel(this, sChannelId);
		if (!oChannel) {
			return;
		}
		
		//see sap.ui.base.EventProvider.prototype.fireEvent
		var aEventListeners = EventProvider.getEventList(oChannel)[sEventId];
		if (aEventListeners && jQuery.isArray(aEventListeners)) {
			// this ensures no 'concurrent modification exception' occurs (e.g. an event listener deregisters itself).
			aEventListeners = aEventListeners.slice();
			var oInfo;
			for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
				oInfo = aEventListeners[i];
				oInfo.fFunction.call(oInfo.oListener || this, sChannelId, sEventId, oData);
			}
		}
	};
	
	/**
	 * @see sap.ui.base.Object#getInterface
	 * @public
	 */
	EventBus.prototype.getInterface = function() {
		return this;
	};
	
	/**
	 * @see sap.ui.base.Object#destroy
	 * @public
	 */
	EventBus.prototype.destroy = function() {
		this._defaultChannel.destroy();
		for (var channel in this._mChannels) {
			this._mChannels[channel].destroy();
		}
		this._mChannels = {};
		BaseObject.prototype.destroy.apply(this, arguments);
	};
	
	
	function getChannel(oEventBus, sChannelId){
		if (!sChannelId) {
			return oEventBus._defaultChannel;
		}
		return oEventBus._mChannels[sChannelId];
	}
	
	function getOrCreateChannel(oEventBus, sChannelId){
		var oChannel = getChannel(oEventBus, sChannelId);
		if (!oChannel && sChannelId) {
			oEventBus._mChannels[sChannelId] = new EventProvider();
			oChannel = oEventBus._mChannels[sChannelId];
		}
		return oChannel;
	}

	return EventBus;

});
