sap.ui.define([], function () {
	"use strict";

	return {
		formatMessageDescription : function (oMessage) {
			var sMessageDescription = oMessage.description,
				sResult = sMessageDescription ? sMessageDescription + "\n\n" : "";

			return sResult + "See technical details for more information.";
		},

		formatMessageSubtitle : function (oMessage) {
			var i,
				sMessageFullTarget = oMessage.fullTarget,
				sResult = oMessage.additionalText ? oMessage.additionalText + "\n" : "";

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
		},

		formatStatusIcon : function () {
			var oContext = this.getBinding("src").getContext();

			if (oContext && oContext.isTransient()) {
				return "sap-icon://alert";
			}

			return "sap-icon://cloud";
		},

		formatStatusToolTip : function () {
			var oContext = this.getBinding("src").getContext();

			if (oContext && oContext.isTransient()) {
				return "Transient";
			}

			return "From Server";
		}
	};
},/* bExport */ true);