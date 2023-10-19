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
	"sap/ui/thirdparty/URI",
	"sap/ui/core/Fragment",
	"sap/ui/core/Core",
	"sap/ui/mdc/ValueHelpDelegate"
], function (Controller, ConditionModel, JSONModel, Dialog, Button, Text, MessageToast, UIComponent, SelectDialog, StandardListItem, Filter, URI, Fragment, oCore, ValueHelpDelegate) {
	"use strict";

	function _updateParams(mParams) {
		const uri = URI(document.location.href);
		Object.keys(mParams).forEach(function (sKey) {
			uri.removeQuery(sKey);
			uri.addQuery(sKey, mParams[sKey]);
		});
		document.location = uri.toString();
	}

	const aAllViews = [
		{path: "sap.ui.v4demo.view.Typeahead", text: "Explore: Controlled Open State for Typeahead", maxConditions: 1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.SingleSelect", text: "Explore: ValueHelp Examples SingleSelect", maxConditions: 1, maxConditionsToggleEnabled: false},
		{path: "sap.ui.v4demo.view.MultiSelect", text: "Explore: ValueHelp Examples MultiSelect", maxConditions: -1, maxConditionsToggleEnabled: false},
		{path: "sap.ui.v4demo.view.OPA-1", text: "OPA: Standard Configuration (Single)", maxConditions: 1},
		{path: "sap.ui.v4demo.view.OPA-2", text: "OPA: Standard Configuration (Multi)", maxConditions: -1},
		{path: "sap.ui.v4demo.view.OPA-3", text: "OPA: Define Conditions Popover", maxConditions: -1},
		{path: "sap.ui.v4demo.view.OPA-4", text: "OPA: Dialog with Default FilterBar Configuration", maxConditions: 1},
		{path: "sap.ui.v4demo.view.OPA-5", footer: "sap.ui.v4demo.view.OPA-5-Footer",  text: "OPA: ValueHelps With Complex Keys", maxConditions: -1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.OPA-6", text: "OPA: Popover.opensOnClick", maxConditions: 1},
		{path: "sap.ui.v4demo.view.OPA-7", text: "OPA: Popover.opensOnFocus", maxConditions: 1}


	];

	return Controller.extend("sap.ui.v4demo.controller.App", {
		onInit: function () {

			oCore.getMessageManager().registerObject(this.getView(), true);

			this.oParams = new URLSearchParams(window.location.search);
			const oParamSuspended = this.oParams.get("suspended");
			const bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

			const sSelectedView = this.oParams.get("view") || aAllViews[0].path;
			const oSelectedView = aAllViews.find(function (oView) {
				return oView.path === sSelectedView;
			});


			const oParamMaxConditions = this.oParams.get("maxconditions");
			const iMaxConditions = oParamMaxConditions ? parseInt(oParamMaxConditions) : (oSelectedView.maxConditions || 1);

			const oCM = new ConditionModel();
			this.getView().setModel(oCM, "cm");

			this.oJSONModel = new JSONModel();
			this.oJSONModel.setData({
				maxConditions: iMaxConditions,
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
				],

				// Relevant for SalesOrganization Fragment END


				// Relevant for Typeahead Fragment BEG
				showTypeahead: 'function (oPayload, oContent) {\n\tif (!oContent || (oContent.isA("sap.ui.mdc.valuehelp.base.FilterableListContent") && !oContent.getFilterValue())) { // Do not show non-existing content or suggestions without filterValue\n\t\treturn false;\n\t} else if (oContent.isA("sap.ui.mdc.valuehelp.base.ListContent")) { // All List-like contents should have some data to show\n\t\tvar oListBinding = oContent.getListBinding();\n\t\tvar iLength = oListBinding && oListBinding.getAllCurrentContexts().length;\n\t\treturn iLength > 0;\n\t}\n\treturn true; // All other content should be shown by default\n};',
				opensOnClick: false
				// Relevant for Typeahead Fragment END

			});

			this.getView().setModel(this.oJSONModel, "settings");
			this.setFragment(sSelectedView);

			if (oSelectedView.footer) {
				this.setFooterFragment(sSelectedView);
			}
		},

		setFragment: function (sFragment, sFragmentController) {
			const oPage = this.getView().byId('P0');
			return Fragment.load({name: sFragment, type: "XML", controller: this}).then(function name(oFragment) {
				oPage.removeAllContent();
				oPage.addContent(oFragment);
			});
		},

		setFooterFragment: function (sFragment, sFragmentController) {
			const oPage = this.getView().byId('P0');
			return Fragment.load({name: sFragment + "-Footer", type: "XML", controller: this}).then(function name(oFragment) {
				oPage.setFooter(oFragment);
			}).catch(function (oError) {
				//noop
			});
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
			this.oJSONModel.setProperty("opensOnClick", !!oEvent.getParameter("state"));
		}

		// Relevant for Typeahead Fragment END
	});
});
