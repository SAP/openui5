sap.ui.define(['sap/ui/commons/Button', 'sap/ui/commons/Label', 'sap/ui/commons/TextArea', 'sap/ui/commons/TextField', 'sap/ui/commons/Toolbar', 'sap/ui/commons/layout/MatrixLayout', 'sap/ui/commons/layout/MatrixLayoutCell', 'sap/ui/commons/layout/MatrixLayoutRow', 'sap/ui/core/mvc/JSView', 'sap/ui/model/type/Float'],
	function(Button, Label, TextArea, TextField, Toolbar, MatrixLayout, MatrixLayoutCell, MatrixLayoutRow, JSView, Float) {
	"use strict";

	sap.ui.jsview("sap.ui.epm.ProductDetails", {

		getControllerName: function() {
			return "sap.ui.epm.ProductDetails";
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

			var oToolbar = new Toolbar({standalone: true});
			var oBack = new Button(this.createId("btnBack"), {text:"{texts>EPM_PROD_BUT_BACK}"});
			oToolbar.addItem(oBack);
			oProductForm.addRow(new MatrixLayoutRow().addCell(
				new MatrixLayoutCell({content: oToolbar}).setColSpan(2)
			));

			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_LBL_ID}", width:"100%"}),
				new TextField({editable:false, width:"80px", value:"{ProductID}"})
			);
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_LBL_NAME}", width:"100%"}),
				new TextField({editable:false, width:"100%", value:"{Name}"})
			);
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_LBL_PRICE}", width:"100%"}),
				new TextField({editable:false, width:"100px"}).bindProperty("value", "Price/Amount", oCurrencyType)
			);
			oProductForm.createRow(
				new MatrixLayoutCell({content: new Label({text:"{texts>EPM_PROD_LBL_DESC}", width:"100%"})}).setVAlign("Top"),
				new TextArea({editable:false, width:"100%", rows: 5, value:"{Description}"})
			);
			oProductForm.createRow(
				new Label({text:"{texts>EPM_PROD_SUPP_LBL_SUPP}", width:"100%"}),
				new TextField(this.createId("ProductFormSupplier"), {editable:false, width:"100%", value:"{Supplier/Name}"})
			);

			return oProductForm;
		}

	});

});
