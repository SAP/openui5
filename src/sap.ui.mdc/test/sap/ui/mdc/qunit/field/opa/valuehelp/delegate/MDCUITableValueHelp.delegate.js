sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/base/util/UriParameters",
	"sap/ui/mdc/Field",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/GridTableType",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Table",
	"sap/m/Text"
], function (ODataFieldValueHelpDelegate, UriParameters, Field, Table, Column, ResponsiveTableType, GridTableType, ResponsiveTableColumn, ColumnListItem, ResponsiveTable, Text) {
	"use strict";

	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion) {
		oFieldHelp.setFilterFields("$search");
		var oParams = UriParameters.fromQuery(location.search);
		var oParamSuspended = oParams.get("suspended");
		var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		var oWrapper = bSuggestion ? oFieldHelp.getSuggestContent() : oFieldHelp.getDialogContent();

		if (bSuggestion && !oWrapper.getTable()) {

			var oSuggestionTable = new ResponsiveTable(oFieldHelp.getId() + "--suggest--mTable", {
				columns: [
					new ResponsiveTableColumn({header: new Text({text : "ID"})}),
					new ResponsiveTableColumn({header: new Text({text : "Name"})})
				],
				items: {
					path : "/Authors",
					length: 10,
					suspended: bSuspended,
					template : new ColumnListItem({
						type: "Active",
						cells: [
							new Text({text: "{path: 'ID', type:'sap.ui.model.odata.type.String'}"}),
							new Text({text: "{path: 'name', type:'sap.ui.model.odata.type.String'}"})
						]
					})
				},
				width: "30rem"
			});

			oWrapper.setTable(oSuggestionTable);
		}

		if (!bSuggestion && !oWrapper.getTable()) {
			var oDialogTable =  new Table(oFieldHelp.getId() + "--dialog--mdcTable", {
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
					new Column({importance: "High", header: "ID", dataProperty: "ID", template: new Field({value: "{ID}", editMode: "Display"})}),
					new Column({importance: "High", header: "Name", dataProperty: "name", template: new Field({value: "{name}", editMode: "Display"})}),
					new Column({importance: "Low", header: "Country", dataProperty: "countryOfOrigin_code", template: new Field({value: "{countryOfOrigin_code}", additionalValue: "{countryOfOrigin/descr}", display: "Description", editMode: "Display"})}),
					new Column({importance: "Low", header: "Region", dataProperty: "regionOfOrigin_code", template: new Field({value: "{regionOfOrigin_code}", additionalValue: "{regionOfOrigin/text}", display: "Description", editMode: "Display"})}),
					new Column({importance: "Low", header: "City", dataProperty: "cityOfOrigin_city", template: new Field({value: "{cityOfOrigin_city}", additionalValue: "{cityOfOrigin/text}", display: "Description", editMode: "Display"})})
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
