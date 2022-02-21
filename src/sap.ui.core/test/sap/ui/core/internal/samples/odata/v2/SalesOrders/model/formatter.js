sap.ui.define([], function () {
	"use strict";

	return {
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
		},

		formatStatusIcon : function () {
			var oContext = this.getBinding("src").getContext();

			if (oContext) {
				if (oContext.isInactive()) {
					return "sap-icon://sys-minus";
				} else if (oContext.isTransient()
					// after the context has been removed from created contexts cache all bindings
					// are updated, so the formatter is called for a context which has been removed
					// from the OData model; in that case oContext.isTransient() returns false as
					// the created promise has been rejected; formatStatusIcon must not return
					// "sap-icon://cloud" in that case otherwise all transient entities that are
					// displayed in that row are getting a wrong icon as the binding refers only to
					// the item position which does not change so the icon does not change too.
					|| !oContext.getObject()) {
					return "sap-icon://sys-add";
				} else if (oContext.isTransient() === false) {
					return "sap-icon://accept";
				}
			}

			return "sap-icon://cloud";
		},

		formatStatusToolTip : function () {
			var oContext = this.getBinding("src").getContext();

			if (oContext) {
				if (oContext.isInactive()) {
					return "Inactive";
				} else if (oContext.isTransient()
					// see #formatStatusIcon
					|| !oContext.getObject()) {
					return "Transient";
				} else if (oContext.isTransient() === false) {
					return "Persisted";
				}
			}

			return "From Server";
		}
	};
},/* bExport */ true);