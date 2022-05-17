sap.ui.define([
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
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/URI",
	"sap/ui/core/Fragment",
	"sap/ui/core/Core"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter, UriParameters, URI, Fragment, oCore) {
	"use strict";

	function _updateParams(mParams) {
		var uri = URI(document.location.href);
		Object.keys(mParams).forEach(function (sKey) {
			uri.removeQuery(sKey);
			uri.addQuery(sKey, mParams[sKey]);
		});
		document.location = uri.toString();
	}

	var aAllViews = [
		{path: "sap.ui.v4demo.view.FieldValueHelp", text: "Classic FieldValueHelp", maxConditions: -1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.Default", text: "Default", maxConditions: -1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.SalesOrganization", text: "SalesOrganization Example", maxConditions: -1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.ModelInOut", text: "Model In-/Out", maxConditions: 1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.SingleSelect", text: "SingleSelect Examples", maxConditions: 1, maxConditionsToggleEnabled: false},
		{path: "sap.ui.v4demo.view.MultiSelect", text: "MultiSelect Examples", maxConditions: -1, maxConditionsToggleEnabled: false}
	];

	return Controller.extend("sap.ui.v4demo.controller.App", {
		onInit: function () {

			oCore.getMessageManager().registerObject(this.getView(), true);

			//var oDefaultModel = this.getView().getModel();
			//oDefaultModel.setSizeLimit(100000);

			this.oParams = UriParameters.fromQuery(location.search);
			var oParamSuspended = this.oParams.get("suspended");
			var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

			var sSelectedView = this.oParams.get("view") || "sap.ui.v4demo.view.Default";
			var oSelectedView = aAllViews.find(function (oView) {
				return oView.path === sSelectedView;
			});


			var oParamMaxConditions = this.oParams.get("maxconditions");
			var iMaxConditions = oParamMaxConditions ? parseInt(oParamMaxConditions) : 1;

			var oCM = new ConditionModel();
			this.getView().setModel(oCM, "cm");

			this.oJSONModel = new JSONModel();
			this.oJSONModel.setData({
				maxConditions: oSelectedView.maxConditionsToggleEnabled ? (iMaxConditions || oSelectedView.maxConditions) : oSelectedView.maxConditions,
				maxConditionsBlocked: !oSelectedView.maxConditionsToggleEnabled,
				isSuspended: bSuspended,
				views: aAllViews,
				selectedView: oSelectedView,

				conditionCreationStrategies: [
					{key: "AlwaysNew"},
					{key: "Merge"},
					{key: "Replace"}
				],

				selectionConsidersList: false,
				selectionConsidersPayload: false,

				conditionCreationStrategy: "AlwaysNew",

				// Relevant for SalesOrganization Fragment BEG

				salesOrganisations: [
					{key: "1010", text: "Sales Organisation 1010"},
					{key: "1020", text: "Sales Organisation 1020"},
					{key: "1030", text: "Sales Organisation 1030"}
				],
				distributionChannels: [
					{key: "10", text: "Distribution Channel 10 for 1010", salesOrganization: "1010"},
					{key: "10", text: "Distribution Channel 10 for 1020", salesOrganization: "1020"},
					{key: "10", text: "Distribution Channel 10 for 1030", salesOrganization: "1030"},
					{key: "20", text: "Distribution Channel 20 for 1010", salesOrganization: "1010"},
					{key: "20", text: "Distribution Channel 20 for 1020", salesOrganization: "1020"},
					{key: "20", text: "Distribution Channel 20 for 1030", salesOrganization: "1030"}
				],
				divisions: [
					{key: "00", text: "Division 00 for 1010 10", salesOrganization: "1010", distributionChannel: "10"},
					{key: "00", text: "Division 00 for 1010 20", salesOrganization: "1010", distributionChannel: "20"},
					{key: "00", text: "Division 00 for 1020 10", salesOrganization: "1020", distributionChannel: "10"},
					{key: "00", text: "Division 00 for 1020 20", salesOrganization: "1020", distributionChannel: "20"},
					{key: "00", text: "Division 00 for 1030 10", salesOrganization: "1030", distributionChannel: "10"},
					{key: "00", text: "Division 00 for 1030 20", salesOrganization: "1030", distributionChannel: "20"},
					{key: "02", text: "Division 02 for 1010 10", salesOrganization: "1010", distributionChannel: "10"},
					{key: "02", text: "Division 02 for 1010 20", salesOrganization: "1010", distributionChannel: "20"},
					{key: "02", text: "Division 02 for 1020 10", salesOrganization: "1020", distributionChannel: "10"},
					{key: "02", text: "Division 02 for 1020 20", salesOrganization: "1020", distributionChannel: "20"},
					{key: "02", text: "Division 02 for 1030 10", salesOrganization: "1030", distributionChannel: "10"},
					{key: "02", text: "Division 02 for 1030 20", salesOrganization: "1030", distributionChannel: "20"}
				]

				// Relevant for SalesOrganization Fragment END

			});

			this.getView().setModel(this.oJSONModel, "settings");
			this.setFragment(sSelectedView).then(function () {
				this.visualizeFilterBarState();
			}.bind(this));

		},

		visualizeFilterBarState: function () {
			var oFilterBar = oCore.byId("FB0");
			var oTextArea = oCore.byId("container-v4demo---app--footerTA");

			if (oFilterBar) {
				setInterval(function () {
					oTextArea.setValue(JSON.stringify(oFilterBar.getInternalConditions(), undefined, 2));
				}, 1000);
			}
		},

		setFragment: function (sFragment, sFragmentController) {
			var oPage = this.getView().byId('P0');
			return Fragment.load({name: sFragment, type: "XML", controller: this}).then(function name(oFragment) {
				oPage.removeAllContent();
				oPage.addContent(oFragment);
			});
		},

		onMaxConditionsSwitchChange: function (oEvent) {
			var iNewMaxConditions = oEvent.getParameter("state") ? -1 : 1;
			_updateParams({
				"maxconditions": iNewMaxConditions.toString()
			});
		},

		onSuspendedSwitchChange: function (oEvent) {
			var bSuspended = oEvent.getParameter("state");
			_updateParams({
				"suspended": bSuspended ? "true" : "false"
			});
		},

		onViewSwitch: function (oEvent) {
			var view = oEvent.getParameter("selectedItem").getKey();

			var iMaxConditions;

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

		}
	});
});
