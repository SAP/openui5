sap.ui.define([
	'sap/ui/commons/Label',
	'sap/ui/commons/TextField',
	'sap/ui/core/mvc/JSView',
	'sap/ui/table/Column',
	'sap/ui/table/Table'
], function(Label, TextField, JSView, Column, Table) {
	"use strict";

	sap.ui.jsview("testdata.complexsyntax", {

		getControllerName: function() {
			return "testdata.complexsyntax";
		},

		/**
		 *
		 * @param oController may be null
		 * @returns {sap.ui.cre.Control}
		 */
		createContent: function(oController) {
			var aControls = [];
			var oLabel = new Label({text:"Hello Mr. {path:'/singleEntry/firstName', formatter:'.myFormatter'}, {/singleEntry/lastName}"}, oController);
			aControls.push(oLabel);

			var oTable = new Table({rows:"{/table}"});
			var oColumn = new Column();
			var oLabel2 = new Label({text:"Name"});
			var oTextField = new TextField({value:"{path:'gender', formatter:'.myGenderFormatter'} {firstName}, {lastName}"}, oController);
			oColumn.setLabel(oLabel2);
			oColumn.setTemplate(oTextField);
			oTable.addColumn(oColumn);
			aControls.push(oTable);
			var oLabel2 = new Label({text:"{path:'/singleEntry/amount', type:'sap.ui.model.type.Float'}"});
			aControls.push(oLabel2);
			return aControls;
		}
	});

});
