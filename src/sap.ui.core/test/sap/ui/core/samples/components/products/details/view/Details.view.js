sap.ui.jsview("samples.components.products.details.view.Details", {
	
	getControllerName: function() {
		return "samples.components.products.details.view.Details";
	},
	
	/**
	 * 
	 * @param oController may be null
	 * @returns {sap.ui.cre.Control}
	 */
	createContent: function(oController) {


		var oCurrencyType = new sap.ui.model.type.Float({minFractionDigits: 2, maxFractionDigits: 2});

		var oProductForm = new sap.ui.commons.layout.MatrixLayout();
		oProductForm.setLayoutFixed(false);
		oProductForm.setWidths("1%", "99%"); 
		oProductForm.createRow(
			new sap.ui.commons.Label({text:"{texts>EPM_PROD_LBL_ID}", width:"100%"}),
			new sap.ui.commons.TextField({editable:false, width:"80px", value:"{ProductID}"})
		);
		oProductForm.createRow(
			new sap.ui.commons.Label({text:"{texts>EPM_PROD_LBL_NAME}", width:"100%"}),
			new sap.ui.commons.TextField({editable:false, width:"200px", value:"{Name}"})
		);
		oProductForm.createRow(
			new sap.ui.commons.Label({text:"{texts>EPM_PROD_LBL_PRICE}", width:"100%"}),
			new sap.ui.commons.TextField({editable:false, width:"200px"}).bindProperty("value", "Price/Amount", oCurrencyType)
		);
		oProductForm.createRow(
			new sap.ui.commons.layout.MatrixLayoutCell({content: new sap.ui.commons.Label({text:"{texts>EPM_PROD_LBL_DESC}", width:"100%"})}).setVAlign("Top"),
			new sap.ui.commons.TextArea({editable:false, width:"400px", rows: 5, value:"{Description}"}) 
		);
		oProductForm.createRow(
			new sap.ui.commons.Label({text:"{texts>EPM_PROD_SUPP_LBL_SUPP}", width:"100%"}),
			new sap.ui.commons.TextField(this.createId("ProductFormSupplier"), {editable:false, width:"200px", value:"{Supplier/Name}"}) 
		);

		return oProductForm;
	}

});