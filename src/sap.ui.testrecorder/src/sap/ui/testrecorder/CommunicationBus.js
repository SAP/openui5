/*!
 * ${copyright}
 */

/**
 * @typedef {object} EventListener
 */
sap.ui.define([
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBConfig"
], function (CommunicationBus, CommunicationBusConfig) {
	"use strict";

	var oRecorderCommunicationBus;

	var RecorderCommunicationBus = CommunicationBus.extend("sap.ui.testrecorder.CommunicationBus", {
		constructor: function () {
			if (!oRecorderCommunicationBus) {
				var oConfig = new CommunicationBusConfig({
					modulePath: "sap/ui/test",
					receivingWindow: "testRecorder",
					uriParams: {
						origin: "sap-ui-testrecorder-origin",
						frameId: "sap-ui-testrecorder-frame-identifier"
					},
					namespace: "testRecorder"
				});
				CommunicationBus.call(this, oConfig);
			} else {
				return oRecorderCommunicationBus;
			}
		}
	});

	oRecorderCommunicationBus = new RecorderCommunicationBus();

	return oRecorderCommunicationBus;
}, true);
