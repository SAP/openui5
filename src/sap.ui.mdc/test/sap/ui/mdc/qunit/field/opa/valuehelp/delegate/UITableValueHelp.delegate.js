sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/base/util/UriParameters"
], function (ODataFieldValueHelpDelegate, UriParameters) {
	"use strict";
	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion) {
		oFieldHelp.setFilterFields("$search");

		if (!oFieldHelp.getContent().getTable()) {

			var oWrapper = oFieldHelp.getContent();

			var oParams = UriParameters.fromQuery(location.search);
			var oParamSuspended = oParams.get("suspended");
			var bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

			var oTable = new sap.ui.table.Table(oFieldHelp.getId() + "--uiTable", {
				rows: "{path : '/Authors', suspended : " + (bSuspended ?  "true" : "false") + "}",
				width: "30rem",
				selectionMode: "Single",
				selectionBehavior: "Row",
				visibleRowCountMode: "Fixed",
				columns: [
					new sap.ui.table.Column({sortProperty:"ID", filterProperty: "ID", sorted: true, template: new sap.m.Text({text: "{ID}"})}),
					new sap.ui.table.Column({sortProperty:"name", filterProperty: "name", sorted: true, template: new sap.m.Text({text: "{name}"})})
				]
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
