sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/base/util/UriParameters",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/GridTableType"
], function (ODataFieldValueHelpDelegate, UriParameters, ResponsiveTableType, GridTableType) {
	"use strict";

	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion) {
		oFieldHelp.setFilterFields("$search");
		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var oWrapper = bSuggestion ? oFieldHelp.getSuggestContent() : oFieldHelp.getDialogContent();

		if (bSuggestion && !oWrapper.getTable()) {

			var oSuggestionTable = new sap.m.Table(oFieldHelp.getId() + "--suggest--mTable", {
				growing: true, growingScrollToLoad: true, growingThreshold: 20,
				columns: [
					new sap.m.Column({header: new sap.m.Text({text : "ID"})}),
					new sap.m.Column({header: new sap.m.Text({text : "Name"})})
				],
				items: {
					path : "/Authors",
					suspended: bSuspended,
					template : new sap.m.ColumnListItem({
						type: "Active",
						cells: [
							new sap.m.Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
							new sap.m.Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
						]
					})
				},
				width: "30rem"
			});

			oWrapper.setTable(oSuggestionTable);
		}

		if (!bSuggestion && !oWrapper.getTable()) {

			var oDialogTable =  new sap.ui.mdc.Table(oFieldHelp.getId() + "--dialog--mdcTable", {
				header: "",
				p13nMode: ['Column','Sort'],
				autoBindOnInit: !bSuspended,
				showRowCount: true,
				width: "100%",
				type: new GridTableType({rowCountMode: "Auto"}),
				delegate: {
					name: "sap/ui/v4demo/delegate/MDCUITable.delegate",
					payload: {
						collectionName: "Authors"
					}
				},
				columns: [
					new sap.ui.mdc.table.Column({importance: "High", header: "ID", dataProperty: "ID", template: new sap.ui.mdc.Field({value: "{ID}", editMode: "Display"})}),
					new sap.ui.mdc.table.Column({importance: "High", header: "Name", dataProperty: "name", template: new sap.ui.mdc.Field({value: "{name}", editMode: "Display"})}),
					new sap.ui.mdc.table.Column({importance: "Low", header: "Country", dataProperty: "countryOfOrigin_code", template: new sap.ui.mdc.Field({value: "{countryOfOrigin_code}", additionalValue: "{countryOfOrigin/descr}", display: "Description", editMode: "Display"})}),
					new sap.ui.mdc.table.Column({importance: "Low", header: "Region", dataProperty: "regionOfOrigin_code", template: new sap.ui.mdc.Field({value: "{regionOfOrigin_code}", additionalValue: "{regionOfOrigin/text}", display: "Description", editMode: "Display"})}),
					new sap.ui.mdc.table.Column({importance: "Low", header: "City", dataProperty: "cityOfOrigin_city", template: new sap.ui.mdc.Field({value: "{cityOfOrigin_city}", additionalValue: "{cityOfOrigin/text}", display: "Description", editMode: "Display"})})
				]
			});

			oWrapper.setTable(oDialogTable);
			return oDialogTable.initialized();
		}
	};

	Delegate.determineSearchSupported = function(oPayload, oFieldHelp) {
		oFieldHelp.setFilterFields("$search");
		return Promise.resolve();
	};

	return Delegate;
});
