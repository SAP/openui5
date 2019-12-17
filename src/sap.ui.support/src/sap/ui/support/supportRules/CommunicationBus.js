/*!
 * ${copyright}
 */

/**
 * @typedef {object} EventListener
 */
sap.ui.define([
	"sap/base/Log",
	"jquery.sap.script", // contains jQuery.sap.getUriParameters
	"sap/ui/thirdparty/URI",
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBConfig"
],
function (Log, jQuery, URI, CommunicationBusCommon, CommunicationBusConfig) {
	"use strict";

	var oCommunicationBus;

	var CommunicationBus = CommunicationBusCommon.extend("sap.ui.support.supportRules.CommunicationBus", {
		constructor: function () {
			if (!oCommunicationBus) {
				var oConfig = new CommunicationBusConfig({
					modulePath: "sap/ui/support",
					receivingWindow: "supportTool",
					uriParams: {
						origin: "sap-ui-xx-support-origin",
						frameId: "sap-ui-xx-frame-identifier"
					},
					namespace: "support"
				});
				CommunicationBusCommon.call(this, oConfig);
			} else {
				return oCommunicationBus;
			}
		}
	});

	oCommunicationBus = new CommunicationBus();

	return oCommunicationBus;
}, true);
