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
		var c = sap.ui.commons;
		var aControls = [];
		var oLabel = new c.Label({text:"Hello Mr. {path:'/singleEntry/firstName', formatter:'.myFormatter'}, {/singleEntry/lastName}"}, oController);
		aControls.push(oLabel);
		
		var oTable = new sap.ui.table.Table({rows:"{/table}"});
		var oColumn = new sap.ui.table.Column();
		var oLabel2 = new c.Label({text:"Name"});
		var oTextField = new c.TextField({value:"{path:'gender', formatter:'.myGenderFormatter'} {firstName}, {lastName}"}, oController);
		oColumn.setLabel(oLabel2);
		oColumn.setTemplate(oTextField);
		oTable.addColumn(oColumn);
		aControls.push(oTable);
		var oLabel2 = new c.Label({text:"{path:'/singleEntry/amount', type:'sap.ui.model.type.Float'}"});
		aControls.push(oLabel2);
		return aControls;
	}
});