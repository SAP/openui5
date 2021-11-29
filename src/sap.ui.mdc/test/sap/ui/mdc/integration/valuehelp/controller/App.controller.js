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
	"sap/ui/core/Fragment",
	"sap/ui/core/Core"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, ButtonType, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter, UriParameters, URI, Fragment, oCore) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.App", {
		onInit: function () {

			oCore.getMessageManager().registerObject(this.getView(), true);

			//var oDefaultModel = this.getView().getModel();
			//oDefaultModel.setSizeLimit(100000);

			this.oParams = UriParameters.fromQuery(location.search);
			var oParamSuspended = this.oParams.get("suspended");
			var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

			var oParamNoXML = this.oParams.get("noxml");
			var bNoXML = oParamNoXML ? oParamNoXML === "true" : false;

			var oParamMaxConditions = this.oParams.get("maxconditions");
			var iMaxConditions = oParamMaxConditions ? parseInt(oParamMaxConditions) : 1;

			var oCM = new ConditionModel();
			this.getView().setModel(oCM, "cm");

			this.oJSONModel = new JSONModel();
			this.oJSONModel.setData({
				maxConditions: iMaxConditions,
				isSuspended: bSuspended,
				noXML: bNoXML
			});

			this.getView().setModel(this.oJSONModel, "settings");

			var sDefaultView = iMaxConditions === 1 ? "sap.ui.v4demo.view.SingleSelect" : "sap.ui.v4demo.view.MultiSelect";
			var sStandardView = bSuspended || bNoXML ? "sap.ui.v4demo.view.Empty" : sDefaultView;
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
			var bSuspended = oEvent.getParameter("state");
			var uri = URI(document.location.href);
			uri.removeQuery("suspended");
			uri.addQuery("suspended", bSuspended ? "true" : "false");
			if (bSuspended) {
				uri.removeQuery("noxml");
				uri.addQuery("noxml", "true");
			}
			document.location = uri.toString();
		},

		onXMLSwitchChange: function (oEvent) {
			var bNoXML = oEvent.getParameter("state");
			var uri = URI(document.location.href);
			uri.removeQuery("noxml");
			uri.addQuery("noxml", bNoXML ? "true" : "false");
			if (!bNoXML) {
				uri.removeQuery("suspended");
				uri.addQuery("suspended", "false");
			}
			document.location = uri.toString();
		}
	});
});
