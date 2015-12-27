sap.ui.define(['sap/ui/commons/Label', 'sap/ui/commons/TextArea', 'sap/ui/commons/TextField', 'sap/ui/commons/layout/MatrixLayout', 'sap/ui/commons/layout/MatrixLayoutCell', 'sap/ui/core/mvc/JSView', 'sap/ui/model/type/Float'],
	function(Label, TextArea, TextField, MatrixLayout, MatrixLayoutCell, JSView, Float) {
	"use strict";

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


			var oCurrencyType = new Float({minFractionDigits: 2, maxFractionDigits: 2});

			var oProductForm = new MatrixLayout();
			oProductForm.setLayoutFixed(false);
			oProductForm.setWidths("1%", "99%");
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_LBL_ID}", width:"100%"}),
				new TextField({editable:false, width:"80px", value:"{ProductID}"})
			);
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_LBL_NAME}", width:"100%"}),
				new TextField({editable:false, width:"200px", value:"{Name}"})
			);
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_LBL_PRICE}", width:"100%"}),
				new TextField({editable:false, width:"200px"}).bindProperty("value", "Price/Amount", oCurrencyType)
			);
			oProductForm.createRow(
				new MatrixLayoutCell({content: new Label({text:"{texts>EPM_PROD_LBL_DESC}", width:"100%"})}).setVAlign("Top"),
				new TextArea({editable:false, width:"400px", rows: 5, value:"{Description}"})
			);
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_SUPP_LBL_SUPP}", width:"100%"}),
				new TextField(this.createId("ProductFormSupplier"), {editable:false, width:"200px", value:"{Supplier/Name}"})
			);

			return oProductForm;
		}

	});

});
