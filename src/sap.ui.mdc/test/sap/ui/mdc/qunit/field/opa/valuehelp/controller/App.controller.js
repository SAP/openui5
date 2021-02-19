sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	'sap/m/Text',
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/ui/model/Filter",
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/URI",
	"sap/ui/core/Fragment"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter, UriParameters, URI, Fragment) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.App", {
		onInit: function () {

			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

			var oDefaultModel = this.getView().getModel();
			oDefaultModel.setSizeLimit(100000);

			this.oParams = UriParameters.fromQuery(location.search);
			var oParamSuspended = this.oParams.get("suspended");
			var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;
			var oParamMaxConditions = this.oParams.get("maxconditions");
			var iMaxConditions = oParamMaxConditions ? parseInt(oParamMaxConditions) : 1;

			var oCM = new ConditionModel();
			this.getView().setModel(oCM, "cm");

			this.oJSONModel = new JSONModel();
			this.oJSONModel.setData({
				maxConditions: iMaxConditions,
				isSuspended: bSuspended
			});

			this.getView().setModel(this.oJSONModel, "settings");

			var sStandardView = bSuspended ? "sap.ui.v4demo.view.Suspended" : "sap.ui.v4demo.view.NotSuspended";
			var sViewOverride = this.oParams.get("view");

			this.setFragment(sViewOverride || sStandardView);
		},

		setFragment: function (sFragment) {
			var oPage = this.getView().byId('P0');
			Fragment.load({name: sFragment, type: "XML"}).then(function name(oFragment) {
				oPage.removeAllContent();
				oPage.addContent(oFragment);
			});
		},

		onMaxConditionsSwitchChange: function (oEvent) {
			var iNewMaxConditions = oEvent.getParameter("state") ? -1 : 1;
			var uri = URI(document.location.href);
			uri.removeQuery("maxconditions");
			uri.addQuery("maxconditions", iNewMaxConditions.toString());
			document.location = uri.toString();

		},

		onSuspendedSwitchChange: function (oEvent) {
			var uri = URI(document.location.href);
			uri.removeQuery("suspended");
			uri.addQuery("suspended", oEvent.getParameter("state") ? "true" : "false");
			document.location = uri.toString();
		}
	});
});
