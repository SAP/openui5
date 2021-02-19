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

			var oTable = new sap.m.Table(oFieldHelp.getId() + "--mTable", {
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
