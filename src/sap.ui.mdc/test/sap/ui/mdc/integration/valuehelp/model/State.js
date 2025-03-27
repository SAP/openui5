sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/mdc/ValueHelpDelegate"], (JSONModel, ValueHelpDelegate) => {

	"use strict";

	const oUrlParams = Object.fromEntries(new URLSearchParams(window.location.search));

	const availableViews = [
		{path: "sap.ui.v4demo.view.Typeahead", text: "Explore: Controlled Open State for Typeahead", maxConditions: 1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.SingleSelect", text: "Explore: ValueHelp Examples SingleSelect", maxConditions: 1, maxConditionsToggleEnabled: false},
		{path: "sap.ui.v4demo.view.MultiSelect", text: "Explore: ValueHelp Examples MultiSelect", maxConditions: -1, maxConditionsToggleEnabled: false},
		{path: "sap.ui.v4demo.view.OPA-1", text: "OPA: Standard Configuration (Single)", maxConditions: 1},
		{path: "sap.ui.v4demo.view.OPA-2", text: "OPA: Standard Configuration (Multi)", maxConditions: -1},
		{path: "sap.ui.v4demo.view.OPA-3", text: "OPA: Define Conditions Popover", maxConditions: -1},
		{path: "sap.ui.v4demo.view.OPA-4", text: "OPA: Dialog with Default FilterBar Configuration", maxConditions: 1},
		{path: "sap.ui.v4demo.view.OPA-5", footer: "sap.ui.v4demo.view.OPA-5-Footer",  text: "OPA: ValueHelps With Complex Keys", maxConditions: -1, maxConditionsToggleEnabled: true},
		{path: "sap.ui.v4demo.view.OPA-6", text: "OPA: Popover.opensOnClick", maxConditions: 1},
		{path: "sap.ui.v4demo.view.OPA-7", text: "OPA: Popover.opensOnFocus", maxConditions: 1},
		{path: "sap.ui.v4demo.view.FirstMatch", text: "Explore: ValueHelpDelegate.getFirstMatch", maxConditions: 1}
	];

	const activeViewPath = oUrlParams.view || "sap.ui.v4demo.view.Typeahead";
	const activeView = availableViews.find(function (oView) {
		return oView.path === activeViewPath;
	});

	const maxConditions = oUrlParams.maxconditions ? parseInt(oUrlParams.maxconditions) : (activeView.maxConditions || 1);

	const oAppStateModel = new JSONModel({

		activeViewPath,
		activeView,
		availableViews,

		maxConditions,

		conditionCreationStrategies: [
			{key: "AlwaysNew"},
			{key: "Merge"},
			{key: "Replace"}
		],

		selectionConsidersList: false,
		selectionConsidersPayload: false,

		conditionCreationStrategy: "AlwaysNew",

		//Typeahead
		opensOnClick: false,
		showTypeahead: ValueHelpDelegate.showTypeahead.toString(),
		shouldOpenOnFocus: ValueHelpDelegate.shouldOpenOnFocus.toString(),
		shouldOpenOnClick: ValueHelpDelegate.shouldOpenOnClick.toString(),

		//SalesOrganization
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

		//Firstmatch
		firstMatch: {
			data: [

				{key: "-", text: "Automatic"},
				{key: "Automatic", text: "-"},

				{key: "-", text: "automatic"},
				{key: "automatic", text: "-"},

				{key: "-", text: "Auto"},
				{key: "Auto", text: "-"},

				{key: "-", text: "auto"},
				{key: "auto", text: "-"}
			],
			caseSensitive: false,
			display: "Value"
		}

	});

	return oAppStateModel;
});