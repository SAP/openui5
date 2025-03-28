sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	'sap/m/Text',
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem",
	"sap/ui/model/Filter",
	"sap/ui/thirdparty/URI",
	"sap/ui/core/Fragment",
	"sap/ui/mdc/ValueHelpDelegate"
], function (Messaging, Controller, ConditionModel, JSONModel, Dialog, Button, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter, URI, Fragment, ValueHelpDelegate) {
	"use strict";

	function _updateParams(mParams) {
		const uri = URI(document.location.href);
		Object.keys(mParams).forEach(function (sKey) {
			uri.removeQuery(sKey);
			uri.addQuery(sKey, mParams[sKey]);
		});
		document.location = uri.toString();
	}

	return Controller.extend("sap.ui.v4demo.controller.App", {
		onInit: function () {
			Messaging.registerObject(this.getView(), true);
		},

		onMaxConditionsSwitchChange: function (oEvent) {
			const iNewMaxConditions = oEvent.getParameter("state") ? -1 : 1;
			_updateParams({
				"maxconditions": iNewMaxConditions.toString()
			});
		},

		onSuspendedSwitchChange: function (oEvent) {
			const bSuspended = oEvent.getParameter("state");
			_updateParams({
				"suspended": bSuspended ? "true" : "false"
			});
		},

		onViewSwitch: function (oEvent) {
			const view = oEvent.getParameter("selectedItem").getKey();

			let iMaxConditions;

			if (view === "sap.ui.v4demo.view.SingleSelect") {
				iMaxConditions = 1;
			}

			if (view === "sap.ui.v4demo.view.MultiSelect") {
				iMaxConditions = -1;
			}

			_updateParams({
				"view": view,
				"maxconditions": iMaxConditions
			});

		},

		// Relevant for Typeahead Fragment END

		onOpensOnClickChange: function (oEvent) {
			oEvent.getSource().getModel("runtimeState").setProperty("opensOnClick", !!oEvent.getParameter("state"));
		},

		// Relevant for Typeahead Fragment END

		onFirstMatchDataChange: function (oEvent) {
			oEvent.getSource().getModel("runtimeState").setProperty("/firstMatch/data", JSON.parse(oEvent.getParameter("value")));
		}
	});
});
