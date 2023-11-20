sap.ui.define([
	'sap/m/Label',
	'sap/m/Input',
	'sap/ui/core/mvc/View',
	'sap/ui/table/Column',
	'sap/ui/table/Table'
], function (Label, Input, View, Column, Table) {
	"use strict";
	return View.extend("testdata.ComplexSyntax", {

		getControllerName: function() {
			return "testdata.complexsyntax";
		},

		createContent: function(oController) {
			return new Promise(function(resolve) {
				var aControls = [];
				var oLabel = new Label({ text: "Hello Mr. {path:'/singleEntry/firstName', formatter:'.formatter.name'}, {/singleEntry/lastName}" }, oController);
				aControls.push(oLabel);

				var oTable = new Table({ rows: "{/table}" });
				var oColumn = new Column();
				var oLabel2 = new Label({ text: "Name" });
				var oInputField = new Input({ value: "{path:'gender', formatter:'.formatter.gender'} {firstName}, {lastName}" }, oController);
				oColumn.setLabel(oLabel2);
				oColumn.setTemplate(oInputField);
				oTable.addColumn(oColumn);
				aControls.push(oTable);

				var oLabel3 = new Label({ text: "{path:'/singleEntry/amount', type:'sap.ui.model.type.Float'}" });
				aControls.push(oLabel3);

				resolve(aControls);
			});
		}
	});

});
