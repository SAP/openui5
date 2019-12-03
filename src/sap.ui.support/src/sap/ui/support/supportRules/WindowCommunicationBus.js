/*!
 * ${copyright}
 */

/**
 * @typedef {object} EventListener
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/Log",
	"jquery.sap.script"
], function (Object, Log, jQuery) {
	"use strict";

	/**
	 * <h3>Overview</h3>
	 * The CommunicationBus is responsible for core communication between а tool frame and an application window
	 * Note that in each window there will be one "copy" of the class, so e.g. static properties will be instanciated again for each new window
	 * Since we need to configure the bus for multiple tools, for each tool we should create one inheriting class.
	 * Each of these child classes are singletons, so they will have one instance per window.
	 * If you need to share the exact same data between the two frames, use global variables
	 * @class
	 * @constructor
	 * @name sap.ui.support.WindowCommunicationBus
	 * @memberof sap.ui.support
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	var CommunicationBus = Object.extend("sap.ui.support.supportRules.WindowCommunicationBus", {
		constructor: function (oConfig) {
			this._oConfig = oConfig;
			// inheriting classes will be singletons, and events should only be added once per window
			if (window.addEventListener) {
				window.addEventListener("message", this._onmessage.bind(this), false);
			} else {
				window.attachEvent("onmessage", this._onmessage.bind(this));
			}
		}
	});

	CommunicationBus.bSilentMode = false;
	// channels should be namespaced: each tool should have its own namespace
	CommunicationBus.channels = {};
	// only the opener window will have a non-empty frames object (opened frames will have an empty frames object)
	CommunicationBus.frames = {};


	/**
	 * Subscribes to a channel with callback and given context
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus.subscribe
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @param {string} sChannelName Name of the channel to subscribe
	 * @param {function} fnCallback Callback for the SupportAssistant
	 * @param {object} oContext Context for the subscribed channel
	 */
	CommunicationBus.prototype.subscribe = function (sChannelName, fnCallback, oContext) {
		if (this._bSilentMode) {
			return;
		}

		CommunicationBus.channels[this._oConfig._sNamespace] = CommunicationBus.channels[this._oConfig._sNamespace] || {};
		CommunicationBus.channels[this._oConfig._sNamespace][sChannelName] = CommunicationBus.channels[this._oConfig._sNamespace][sChannelName] || [];

		CommunicationBus.channels[this._oConfig._sNamespace][sChannelName].push({
			callback: fnCallback,
			context: oContext
		});
	};

	/**
	 * Publishes given channel by name and settings
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus.publish
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @param {string} sChannelName Name of the channel to publish
	 * @param {string} aParams Settings passed to the SupportAssistant
	 */
	CommunicationBus.prototype.publish = function (sChannelName, aParams) {
		if (this._bSilentMode) {
			return;
		}

		var receivingWindow = this._oConfig.getReceivingWindow();
		var dataObject = {
			channelName: sChannelName,
			channelNamespace: this._oConfig._sNamespace,
			params: aParams,
			_frameIdentifier: this._getFrameIdentifier(),
			_origin: window.location.href
		};

		// TODO: we need to find a way to make sure we're executing on the
		// correct window. Issue happen in cases where we're too fast to
		// post messages to the iframe but it is not there yet
		receivingWindow.postMessage(dataObject, this._oConfig.getOrigin());
	};

	/**
	 * mark an iframe as a valid participant in the communication
	 * @method
	 * @param {object} oOptions information about the iframe
	 */
	CommunicationBus.prototype.allowFrame = function (oOptions) {
		// when a frame is opened from the application (opener) window, save the frame identifiers
		// this will allow communication between the opener and the new frame
		CommunicationBus.frames[this._oConfig._sNamespace] = {
			origin: oOptions.origin,
			identifier: oOptions.identifier,
			url: oOptions.url.replace(/\.\.\//g, '')
		};
	};

	/**
	 * Clears all subscribed channels from the CommunicationBus
	 * @private
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus.destroyChannels
	 * @memberof sap.ui.support.WindowCommunicationBus
	 */
	CommunicationBus.prototype.destroyChannels = function () {
		CommunicationBus.channels = {};
	};

	/**
	 * This is the message handler used for communication between the CommunicationBus and {@link sap.ui.support.WCBChannels}
	 * @private
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus._onmessage
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @param {EventListener} eMessage Event fired by the channels attached to the CommunicationBus
	 */
	CommunicationBus.prototype._onmessage = function (eMessage) {
		if (!this._validate(eMessage)) {
			Log.error("Message was received but failed validation");
			return;
		}

		var mChannels = CommunicationBus.channels[eMessage.data.channelNamespace];
		var callbackObjects = mChannels && mChannels[eMessage.data.channelName] || [];

		callbackObjects.forEach(function (cbObj) {
			cbObj.callback.apply(cbObj.context, [eMessage.data.params]);
		});
	};


	/**
	 * validate messages published from external window to application window (i.e. from tool frame to opener window)
	 * no validation needed the other way (i.e. from opener window to tool frame)
	 * @private
	 * @method
	 * @param {EventListener} eMessage Event fired by the channels attached to the CommunicationBus
	 * @returns {boolean} true if the message is valid
	 */
	CommunicationBus.prototype._validate = function (eMessage) {
		if (jQuery.isEmptyObject(CommunicationBus.frames)) {
			// when loaded in a tool frame, the CommumnicationBus class will always have an empty 'frames' object.
			// in this case, a message is sent from the opener to the tool frame and no validation is necessary
			return true;
		}
		var oFrameConfig = CommunicationBus.frames[this._oConfig._sNamespace];
		if (!oFrameConfig) {
			// there are no tools associated with this frame
			return true;
		}

		// when a message is sent from a tool frame to the application (opener) window,
		// the message should have the correct details, validating that it comes from a known tool frame
		var bMatchOrigin = eMessage.origin === oFrameConfig.origin;
		var bMatchIdentifier = eMessage.data._frameIdentifier === oFrameConfig.identifier;
		var bMatchUrl = eMessage.data._origin.indexOf(oFrameConfig.url) > -1;

		return bMatchOrigin && bMatchIdentifier && bMatchUrl;
	};

	CommunicationBus.prototype._getFrameIdentifier = function () {
		var oFrameConfig = CommunicationBus.frames[this._oConfig._sNamespace] || {};
		// a tool should start one frame whose ID is known by both the opener window and the frame.
		// within the opener window, the ID of the opened frame is saved in the CommunicationBus.frames static property
		// within the frame, the ID is 'saved' as a URI parameter.
		return oFrameConfig.identifier || this._oConfig.getFrameId();
	};

	return CommunicationBus;
}, true);
