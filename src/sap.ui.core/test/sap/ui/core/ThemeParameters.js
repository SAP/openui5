// Note: the HTML page 'ThemeParameters.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Text",
	"sap/m/ColumnListItem"
], function(Theming, Parameters, Table, Column, Text, ColumnListItem) {
	"use strict";

	var oList = new Table({
		columns: [
			new Column({
				header: new Text({
					text: "Parameter Name"
				})
			}),
			new Column({
				width: "20em",
				header: new Text({
					text: "Value"
				})
			})
		]
	}).placeAt("content");


	function fetchParameters() {
		var mAllParameters = Parameters.get();

		oList.destroyItems();
		for (var name in mAllParameters) {
			var oItem = new ColumnListItem({
				cells: [
					new Text({
						text: name
					}),
					new Text({
						text: mAllParameters[name]
					})
				]
			});
			oList.addItem(oItem);
		}
	}


	// react on theme change
	Theming.attachApplied(function(evt){
		fetchParameters();
	});


	fetchParameters();
});