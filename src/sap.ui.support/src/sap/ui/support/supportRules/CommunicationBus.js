/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/WindowCommunicationBus",
	"sap/ui/support/supportRules/WCBConfig"
],
function (CommunicationBusCommon, CommunicationBusConfig) {
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
					}
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
