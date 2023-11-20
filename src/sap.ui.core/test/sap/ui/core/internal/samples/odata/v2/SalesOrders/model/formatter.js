sap.ui.define([], function () {
	"use strict";

	return {
		formatContextStatus : function (bTransient, bInactive, sIconOrTooltip) {
			var bIcon = sIconOrTooltip === "icon";

			if (bTransient === true) {
				if (bInactive) {
					return bIcon ? "sap-icon://sys-minus" : "Inactive";
				}
				return bIcon ? "sap-icon://sys-add" : "Transient";
			} else if (bTransient === false) {
				return bIcon ? "sap-icon://accept" : "Persisted";
			}

			return bIcon ? "sap-icon://cloud" : "From Server";
		},

		formatMessageDescription : function (oMessage) {
			var sResult = "";

			if (oMessage) {
				if (oMessage.description) {
					sResult += oMessage.description + "\n\n";
				}
				sResult += "See technical details for more information.";
			}

			return sResult;
		},

		formatMessageSubtitle : function (oMessage) {
			var i,
				sMessageFullTarget = oMessage && oMessage.fullTarget,
				sResult = oMessage && oMessage.additionalText ? oMessage.additionalText + "\n" : "";

			if (sMessageFullTarget) {
				i = sMessageFullTarget.lastIndexOf("ItemPosition=");
				if (i >= 0) {
					return sResult + "Sales Order Item "
						+ sMessageFullTarget.slice(i + 13, sMessageFullTarget.indexOf(")", i));
				} else {
					i = sMessageFullTarget.lastIndexOf("SalesOrderSet(");
					if (i >= 0) {
						return sResult + "Sales Order "
							+ sMessageFullTarget.slice(i + 14, sMessageFullTarget.indexOf(")", i));
					}
				}
			}
			return sResult;
		},

		formatMessageTargets : function (aTargets) {
			return aTargets && aTargets.join("\n");
		}
	};
},/* bExport */ true);