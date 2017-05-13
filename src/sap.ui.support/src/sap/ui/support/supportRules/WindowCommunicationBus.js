/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global"
],
function (jQuery) {
	"use strict";

	var CommunicationBus = {
		channels: {},
		onMessageChecks: []
	};

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

	CommunicationBus.subscribe = function (channelName, callback, context) {
		if (!this.channels[channelName]) {
			this.channels[channelName] = [{
				callback: callback,
				context: context
			}];
			return;
		}

		this.channels[channelName].push({
			callback: callback,
			context: context
		});
	};

	CommunicationBus.publish = function (channelName, aParams) {
		var receivingWindow = this._getReceivingWindow(),
			dataObject = {
				channelName: channelName,
				params: aParams,
				_frameIdentifier: frameIdentifier,
				_origin: window.location.href
			};

		// TODO: we need to find a way to make sure we're executing on the
		// correct window. Issue happen in cases where we're too fast to
		// post messages to the iframe but it is not there yet
		receivingWindow.postMessage(dataObject, this.origin);
	};

	CommunicationBus.destroyChanels = function () {
		CommunicationBus.channels = {};
	};

	CommunicationBus._getReceivingWindow = function () {

		if (window.communicationWindows && window.communicationWindows.hasOwnProperty("supportTool")) {
			return window.communicationWindows.supportTool;
		}

		// If opener is not null, tool's UI is in an IFRAME (parent is used),
		// else it's a POPUP WINDOW (opener is used)
		return window.opener || window.parent;
	};

	CommunicationBus._onmessage = function (evt) {
		// Validate received message
		var checkResults = CommunicationBus.onMessageChecks.every(function (fnMsgCheck) {
			return fnMsgCheck.call(null, evt);
		});

		if (!checkResults) {
			jQuery.sap.log.error("Message was received but failed validation");
			return;
		}

		var channelName = evt.data.channelName,
			params = evt.data.params,
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
