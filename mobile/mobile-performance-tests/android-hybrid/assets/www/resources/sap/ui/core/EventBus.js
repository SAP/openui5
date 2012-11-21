/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.EventBus
jQuery.sap.declare("sap.ui.core.EventBus");
jQuery.sap.require("sap.ui.base.EventProvider");

(function(){

/**
 * Creates an instance of EventBus.
 * @class Provides eventing facilities, so subscribe, unsubscribe and publish events.
 *
 * @abstract
 * @extends sap.ui.base.Object
 * @author SAP AG
 * @version 1.9.0-SNAPSHOT
 * @constructor
 * @public
 * @since 1.8.0
 * @name sap.ui.core.EventBus
 */
sap.ui.base.Object.extend("sap.ui.core.EventBus", {
	
	constructor : function() {
		sap.ui.base.Object.apply(this);
		this._mChannels = {};
		this._defaultChannel = new sap.ui.base.EventProvider();
	}

});

/**
 * Adds an event registration for the given object and given event name.
 * 
 * The channel "sap.ui" is reserved by th UI5 framework. An application might listen to events on this channel but is not allowed to publish own events there.
 *
 * @param {String}
 *            [sChannelId] The channel of the event to subscribe for. If not given the default channel is used.
 * @param {String}
 *            sEventId The identifier of the event to subscribe for
 * @param {Function}
 *            fFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or on the event bus-instance. This functions might have the following parameters: sChannelId, sEventId, oData.
 * @param {Object}
 *            [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.EventBus.prototype.subscribe = function(sChannelId, sEventId, fFunction, oListener) {
	if(typeof(sEventId) === "function") {
		oListener = fFunction;
		fFunction = sEventId;
		sEventId = sChannelId;
		sChannelId = null;
	}
	
	jQuery.sap.assert(!sChannelId || typeof(sChannelId) === "string", "EventBus.subscribe: sChannelId must be empty or a non-empty string");
	jQuery.sap.assert(typeof(sEventId) === "string" && sEventId, "EventBus.subscribe: sEventId must be a non-empty string");
	jQuery.sap.assert(typeof(fFunction) === "function", "EventBus.subscribe: fFunction must be a function");
	jQuery.sap.assert(!oListener || typeof(oListener) === "object", "EventBus.subscribe: oListener must be empty or an object");
	
	var oChannel = getOrCreateChannel(this, sChannelId);
	oChannel.attachEvent(sEventId, fFunction, oListener);
	return this;
};

/**
 * Removes an event registration for the given object and given event name.
 *
 * The passed parameters must match those used for registration with {@link #subscribe } beforehand!
 *
 * @param {String}
 *            [sChannelId] The channel of the event to unsubscribe from. If not given the default channel is used.
 * @param {String}
 *            sEventId The identifier of the event to unsubscribe from
 * @param {Function}
 *            fFunction The function to call, when the event occurs.
 * @param {Object}
 *            [oListener] The object, that wants to be notified, when the event occurs
 * @return {sap.ui.core.EventBus} Returns <code>this</code> to allow method chaining
 * @public
 */
sap.ui.core.EventBus.prototype.unsubscribe = function(sChannelId, sEventId, fFunction, oListener) {
	if(typeof(sEventId) === "function") {
		oListener = fFunction;
		fFunction = sEventId;
		sEventId = sChannelId;
		sChannelId = null;
	}
	
	jQuery.sap.assert(!sChannelId || typeof(sChannelId) === "string", "EventBus.unsubscribe: sChannelId must be empty or a non-empty string");
	jQuery.sap.assert(typeof(sEventId) === "string" && sEventId, "EventBus.unsubscribe: sEventId must be a non-empty string");
	jQuery.sap.assert(typeof(fFunction) === "function", "EventBus.unsubscribe: fFunction must be a function");
	jQuery.sap.assert(!oListener || typeof(oListener) === "object", "EventBus.unsubscribe: oListener must be empty or an object");
	
	var oChannel = getChannel(this, sChannelId);
	if(!oChannel){
		return this;
	}
	
	oChannel.detachEvent(sEventId, fFunction, oListener);
	if(oChannel != this._defaultChannel){ // Check whether Channel is unused
		var mEvents = sap.ui.base.EventProvider.getEventList(oChannel);
		var bIsEmpty = true;
		for(var sId in mEvents){
			if(oChannel.hasListeners(sId)){
				bIsEmpty = false;
				break;
			}
		}
		if(bIsEmpty){
			delete this._mChannels[sChannelId];
		}
	}
	
	return this;
};

/**
 * Fires the given event and notifies all listeners. Listeners must not change the content of the event.
 * 
 * The channel "sap.ui" is reserved by th UI5 framework. An application might listen to events on this channel but is not allowed to publish own events there.
 *
 * @param {String}
 *            [sChannelId] The channel of the event; if not given the default channel is used
 * @param {String}
 *            sEventId The identifier of the event
 * @param {Object}
 * 			  [oData] the parameter map
 * @public
 */
sap.ui.core.EventBus.prototype.publish = function(sChannelId, sEventId, oData) {
	
	if(arguments.length == 1){ //sEventId
		oData = null;
		sEventId = sChannelId;
		sChannelId = null;
	}else if(arguments.length == 2){ //sChannelId + sEventId || sEventId + oData
		if(typeof(sEventId) != "string") {
			oData = sEventId;
			sEventId = sChannelId;
			sChannelId = null;
		}
	}
	
	oData = oData ? oData : {};
	
	jQuery.sap.assert(!sChannelId || typeof(sChannelId) === "string", "EventBus.publish: sChannelId must be empty or a non-empty string");
	jQuery.sap.assert(typeof(sEventId) === "string" && sEventId, "EventBus.publish: sEventId must be a non-empty string");
	jQuery.sap.assert(typeof(oData) === "object", "EventBus.publish: oData must be an object");
	
	var oChannel = getChannel(this, sChannelId);
	if(!oChannel){
		return;
	}
	
	//see sap.ui.base.EventProvider.prototype.fireEvent
	var aEventListeners = sap.ui.base.EventProvider.getEventList(oChannel)[sEventId];
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
sap.ui.core.EventBus.prototype.getInterface = function() {
	return this;
};


function getChannel(oEventBus, sChannelId){
	if(!sChannelId){
		return oEventBus._defaultChannel;
	}
	return oEventBus._mChannels[sChannelId];
};

function getOrCreateChannel(oEventBus, sChannelId){
	var oChannel = getChannel(oEventBus, sChannelId);
	if(!oChannel && sChannelId){
		oEventBus._mChannels[sChannelId] = new sap.ui.base.EventProvider();
		oChannel = oEventBus._mChannels[sChannelId];
	}
	return oChannel;
};

}());
