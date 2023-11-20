/*!
 * ${copyright}
 */

/**
 * @typedef {object} EventListener
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/base/Log",
	"sap/base/util/isEmptyObject"
], function (BaseObject, Log, isEmptyObject) {
	"use strict";

	/**
	 * <h3>Overview</h3>
	 * The WindowCommunicationBus is responsible for core communication between a tool frame and an application window
	 * Note that in each window there will be one "copy" of the class, so e.g. static properties will be instantiated again for each new window
	 * Since we need to configure the bus for multiple tools, for each tool we should create one inheriting class.
	 * Each of these child classes are singletons, so they will have one instance per window.
	 * If you need to share the exact same data between the two frames, use global variables
	 * @class
	 * @alias sap.ui.support.WindowCommunicationBus
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	var WindowCommunicationBus = BaseObject.extend("sap.ui.support.supportRules.WindowCommunicationBus", {
		constructor: function (oConfig) {
			BaseObject.call(this);
			this.bSilentMode = false;
			this._channels = {};
			this._frame = {};
			this._oConfig = oConfig;

			// inheriting classes will be singletons, and events should only be added once per window
			if (window.addEventListener) {
				window.addEventListener("message", this._onmessage.bind(this), false);
			} else {
				window.attachEvent("onmessage", this._onmessage.bind(this));
			}
		}
	});

	/**
	 * Subscribes to a channel with callback and given context
	 * @param {string} sChannelName Name of the channel to subscribe
	 * @param {function} fnCallback Callback for the SupportAssistant
	 * @param {object} oContext Context for the subscribed channel
	 */
	WindowCommunicationBus.prototype.subscribe = function (sChannelName, fnCallback, oContext) {
		if (this.bSilentMode) {
			return;
		}

		this._channels[sChannelName] = this._channels[sChannelName] || [];
		this._channels[sChannelName].push({
			callback: fnCallback,
			context: oContext
		});
	};

	/**
	 * Publishes given channel by name and settings
	 * @param {string} sChannelName Name of the channel to publish
	 * @param {string} aParams Settings passed to the SupportAssistant
	 */
	WindowCommunicationBus.prototype.publish = function (sChannelName, aParams) {
		if (this.bSilentMode) {
			return;
		}

		var receivingWindow = this._oConfig.getReceivingWindow();
		var dataObject = {
			channelName: sChannelName,
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
	 * @param {object} oOptions information about the iframe
	 */
	WindowCommunicationBus.prototype.allowFrame = function (oOptions) {
		// when a frame is opened from the application (opener) window, save the frame identifiers
		// this will allow communication between the opener and the new frame
		this._frame = {
			origin: oOptions.origin,
			identifier: oOptions.identifier,
			url: oOptions.url
		};
	};

	/**
	 * Clears all subscribed channels from the WindowCommunicationBus
	 * @private
	 */
	WindowCommunicationBus.prototype.destroyChannels = function () {
		this._channels = {};
	};

	/**
	 * This is the message handler used for communication between the WindowCommunicationBus and {@link sap.ui.support.WCBChannels}
	 * @private
	 * @param {EventListener} eMessage Event fired by the channels attached to the WindowCommunicationBus
	 */
	WindowCommunicationBus.prototype._onmessage = function (eMessage) {
		if (!this._validate(eMessage)) {
			Log.error("Message was received but failed validation");
			return;
		}

		var callbackObjects = this._channels[eMessage.data.channelName] || [];

		callbackObjects.forEach(function (cbObj) {
			cbObj.callback.apply(cbObj.context, [eMessage.data.params]);
		});
	};

	/**
	 * validate messages published from external window to application window (i.e. from tool frame to opener window)
	 * no validation needed the other way (i.e. from opener window to tool frame)
	 * @private
	 * @param {EventListener} eMessage Event fired by the channels attached to the WindowCommunicationBus
	 * @returns {boolean} true if the message is valid
	 */
	WindowCommunicationBus.prototype._validate = function (eMessage) {
		if (isEmptyObject(this._frame)) {
			// there are no channels associated with this bus, or
			// when loaded in a tool frame, the CommumnicationBus class will always have an empty 'frame' object.
			// in this case, a message is sent from the opener to the tool frame and no validation is necessary
			return true;
		}

		// when a message is sent from a tool frame to the application (opener) window,
		// the message should have the correct details, validating that it comes from a known tool frame

		// check if the frame ID (number represented as string) is the same
		var bMatchIdentifier = eMessage.data._frameIdentifier === this._frame.identifier;

		// check if the URL matches: 1. check if the domain name matches - should be case insensitive
		var oOriginRegExp = new RegExp("^" + this._frame.origin + "$", "i");
		var bMatchOrigin = oOriginRegExp.exec(eMessage.origin);

		// check if the URL matches: 2. check if the path to the iframe matches.
		// if the frame URL is relative to the parent window's URL, remove relative path segments
		var iFrameUrlQuery = this._frame.url.indexOf("?");
		var sFrameUrl = this._frame.url.substr(0, iFrameUrlQuery).replace(/\.\.\//g, "").replace(/\.\//g, "") + this._frame.url.substr(iFrameUrlQuery);
		var bMatchUrl = eMessage.data._origin.indexOf(sFrameUrl) > -1;

		return bMatchIdentifier && bMatchOrigin && bMatchUrl;
	};

	WindowCommunicationBus.prototype._getFrameIdentifier = function () {
		// a tool should start one frame whose ID is known by both the opener window and the frame.
		// within the opener window, the ID of the opened frame is saved in the _frame property
		// within the frame, the ID is 'saved' as a URI parameter.
		return this._frame.identifier || this._oConfig.getFrameId();
	};

	return WindowCommunicationBus;
}, true);
