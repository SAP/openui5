jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.m.sample.TableExport.DemoPersoService");
jQuery.sap.require("sap.m.sample.TableExport.Formatter");

sap.ui.controller("sap.m.sample.TableExport.Table", {

	onInit : function() {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);

	},

	onDataExport : sap.m.Table.prototype.exportData || function(oEvent) {

		var oExport = new sap.ui.core.util.Export({

			// Type that will be used to generate the content. Own ExportType's can be created to support other formats
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ";"
			}),

			// Pass in the model created above
			models : this.getView().getModel(),

			// binding information for the rows aggregation
			rows : {
				path : "/ProductCollection"
			},

			// column definitions with column name and binding info for the content

			columns : [{
				name : "Product",
				template : {
					content : "{Name}"
				}
			}, {
				name : "Product ID",
				template : {
					content : "{ProductId}"
				}
			}, {
				name : "Supplier",
				template : {
					content : "{SupplierName}"
				}
			}, {
				name : "Dimensions",
				template : {
					content : {
						parts : ["Width", "Depth", "Height", "DimUnit"],
						formatter : function(width, depth, height, dimUnit) {
							return width + " x " + depth + " x " + height + " " + dimUnit;
						},
						state : "Warning"
					}
				// "{Width} x {Depth} x {Height} {DimUnit}"
				}
			}, {
				name : "Weight",
				template : {
					content : "{WeightMeasure} {WeightUnit}"
				}
			}, {
				name : "Price",
				template : {
					content : "{Price} {CurrencyCode}"
				}
			}]
		});

		// download exported file
		oExport.saveFile().always(function() {
			this.destroy();
		});
	}

});
