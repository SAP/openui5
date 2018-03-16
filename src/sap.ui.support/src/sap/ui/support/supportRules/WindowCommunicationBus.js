/*!
 * ${copyright}
 */

/**
 * @typedef {object} EventListener
 */
sap.ui.define([
	"jquery.sap.global"
],
function (jQuery) {
	"use strict";

	/**
	 * <h3>Overview</h3>
	 * The CommunicationBus is responsible for core communication between the SupportAssistant the views and SupportAssistant in iFrame mode.
	 * @class
	 * @constructor
	 * @name sap.ui.support.WindowCommunicationBus
	 * @memberof sap.ui.support
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	var CommunicationBus = {
		channels: {},
		onMessageChecks: []
	};

	/**
	 * Indicates the origin of the SupportAssistant.
	 */
	var originParameter = jQuery.sap.getUriParameters().get("sap-ui-xx-support-origin");
	var origin = originParameter;
	var frameIdentifier = jQuery.sap.getUriParameters().get("sap-ui-xx-frame-identifier") || '_unnamed_frame_-_use_message_origin_';

	if (!origin) {
		// When loading from CDN, module path needs to be relative to that origin
		var modulePathURI = new window.URI(jQuery.sap.getModulePath("sap.ui.support"));
		var protocol = modulePathURI.protocol() === "" ?
			window.location.protocol.replace(":", "") : modulePathURI.protocol();

		var host = modulePathURI.host() === "" ?
			window.location.host : modulePathURI.host();

		origin = protocol + "://" + host;
	}

	CommunicationBus.origin = origin;

	/**
	 * Subscribes to a channel with callback and given context
	 * @private
	 * @static
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus.subscribe
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @param {string} sChannelName Name of the channel to subscribe
	 * @param {function} fnCallback Callback for the SupportAssistant
	 * @param {object} oContext Context for the subscribed channel
	 */
	CommunicationBus.subscribe = function (sChannelName, fnCallback, oContext) {
		if (!this.channels[sChannelName]) {
			this.channels[sChannelName] = [{
				callback: fnCallback,
				context: oContext
			}];
			return;
		}

		this.channels[sChannelName].push({
			callback: fnCallback,
			context: oContext
		});
	};

	/**
	 * Publishes given channel by name and settings
	 * @private
	 * @static
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus.publish
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @param {string} sChannelName Name of the channel to publish
	 * @param {string} aParams Settings passed to the SupportAssistant
	 */
	CommunicationBus.publish = function (sChannelName, aParams) {
		var receivingWindow = this._getReceivingWindow(),
			dataObject = {
				channelName: sChannelName,
				params: aParams,
				_frameIdentifier: frameIdentifier,
				_origin: window.location.href
			};

		// TODO: we need to find a way to make sure we're executing on the
		// correct window. Issue happen in cases where we're too fast to
		// post messages to the iframe but it is not there yet
		receivingWindow.postMessage(dataObject, this.origin);
	};

	/**
	 * Clears all subscribed channels from the CommunicationBus
	 * @private
	 * @static
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus.destroyChanels
	 * @memberof sap.ui.support.WindowCommunicationBus
	 */
	CommunicationBus.destroyChanels = function () {
		CommunicationBus.channels = {};
	};

	/**
	 * Retrieves the window hosting the SupportAssistant
	 * @private
	 * @static
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus._getReceivingWindow
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @returns {object} Window containing the SupportAssistant
	 */
	CommunicationBus._getReceivingWindow = function () {

		if (window.communicationWindows && window.communicationWindows.hasOwnProperty("supportTool")) {
			return window.communicationWindows.supportTool;
		}

		// If opener is not null, tool's UI is in an IFRAME (parent is used),
		// else it's a POPUP WINDOW (opener is used)
		return window.opener || window.parent;
	};

	/**
	 * This is the message handler used for communication between the CommunicationBus and {@link sap.ui.support.WCBChannels}
	 * @private
	 * @static
	 * @method
	 * @name sap.ui.support.WindowCommunicationBus._onmessage
	 * @memberof sap.ui.support.WindowCommunicationBus
	 * @param {EventListener} evt Event fired by the channels attached to the CommunicationBus
	 */
	CommunicationBus._onmessage = function (eMessage) {
		// Validate received message
		var checkResults = CommunicationBus.onMessageChecks.every(function (fnMsgCheck) {
			return fnMsgCheck.call(null, eMessage);
		});

		if (!checkResults) {
			jQuery.sap.log.error("Message was received but failed validation");
			return;
		}

		var channelName = eMessage.data.channelName,
			params = eMessage.data.params,
			callbackObjects = CommunicationBus.channels[channelName];

		if (!callbackObjects) {
			return;
		}

		callbackObjects.forEach(function (cbObj) {
			cbObj.callback.apply(cbObj.context, [params]);
		});
	};

	if (window.addEventListener) {
		window.addEventListener("message", CommunicationBus._onmessage, false);
	} else {
		window.attachEvent("onmessage", CommunicationBus._onmessage);
	}

	// Dependent frames notify parent
	if (originParameter) {
		CommunicationBus.publish("COMM_BUS_INTERNAL", "READY");
	}

	return CommunicationBus;
}, true);
