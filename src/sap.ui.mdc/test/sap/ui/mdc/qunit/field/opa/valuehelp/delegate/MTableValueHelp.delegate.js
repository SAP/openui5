sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/base/util/UriParameters",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Table",
	"sap/m/Text"
], function (ODataFieldValueHelpDelegate, UriParameters, ResponsiveTableColumn, ColumnListItem, ResponsiveTable, Text) {
	"use strict";
	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion) {
		oFieldHelp.setFilterFields("$search");

		if (!oFieldHelp.getContent().getTable()) {

			var oWrapper = oFieldHelp.getContent();

			var oParams = UriParameters.fromQuery(location.search);
			var oParamSuspended = oParams.get("suspended");
			var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

			var oTable = new ResponsiveTable(oFieldHelp.getId() + "--mTable", {
				growing: true, growingScrollToLoad: true, growingThreshold: 20,
				columns: [
					new ResponsiveTableColumn({header: new Text({text : "ID"})}),
					new ResponsiveTableColumn({header: new Text({text : "Name"})})
				],
				items: {
					path : "/Authors",
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

			oWrapper.setTable(oTable);

			return Promise.resolve(oTable);
		}
	};

	Delegate.determineSearchSupported = function(oPayload, oFieldHelp) {
		oFieldHelp.setFilterFields("$search");
		return Promise.resolve();
	};

	return Delegate;
});
