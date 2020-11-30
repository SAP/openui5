sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate",
	"sap/ui/mdc/FilterField"
], function (ODataFieldValueHelpDelegate, FilterField) {
	"use strict";
	var Delegate = Object.assign({}, ODataFieldValueHelpDelegate);

	Delegate.contentRequest = function(oPayload, oFieldHelp, bSuggestion) {
		var isSuggest = bSuggestion;

		oFieldHelp.setFilterFields("$search");

		if (!oFieldHelp.getContent().getTable()) {
			oFieldHelp.getContent().setTable(
				new sap.m.Table({
					growing: true, growingScrollToLoad: true, growingThreshold: 20,
					autoPopinMode: true,
					contextualWidth: "Auto",
					hiddenInPopin: ["Low"],
					columns: [
						new sap.m.Column({width: '5rem', importance:"High", header: new sap.m.Text({text : "ID"})}),
						new sap.m.Column({header: new sap.m.Text({text : "Name "})}),
						new sap.m.Column({width: '8rem', visible: !isSuggest, importance:"Low", header: new sap.m.Text({text : "Date of Birth"})})
					],
					items: {
						path : "/Authors",
						template : new sap.m.ColumnListItem({
							type: "Active",
							cells: [new sap.m.Text({text: "{ID}"}),
									new sap.m.Text({text: "{name}"}),
									new sap.m.Text({text: "{dateOfBirth}"})]
						})
					},
					width: isSuggest ? "20rem" : "100%"
				})
			);
		} else {
			var oTableWrapper = oFieldHelp.getContent();
			var oTable = oTableWrapper.getTable();

			oTable.getColumns()[2].setVisible(!isSuggest);
			if (isSuggest) {
				oTable.setWidth("20rem");
				oTable.getColumns()[1].setWidth("100%");
				oTable.getColumns()[2].setVisible(false);
			} else {
				oTable.setWidth("100%");
				oTable.getColumns()[1].setWidth(null);
				oTable.getColumns()[2].setVisible(true);
			}
		}

		return Promise.resolve();
	};

	Delegate.determineSearchSupported = function(oPayload, oFieldHelp) {
		oFieldHelp.setFilterFields("$search");
		return Promise.resolve();
	};

	return Delegate;
});
