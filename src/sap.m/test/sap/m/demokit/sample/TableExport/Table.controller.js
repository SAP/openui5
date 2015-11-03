sap.ui.define([
		'jquery.sap.global',
		'sap/m/TablePersoController',
		'sap/m/MessageBox',
		'./DemoPersoService',
		'./Formatter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/util/Export',
		'sap/ui/core/util/ExportTypeCSV',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, TablePersoController, MessageBox, DemoPersoService, Formatter, Controller, Export, ExportTypeCSV, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableExport.Table", {

		onInit : function() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);

		},

		onDataExport : sap.m.Table.prototype.exportData || function(oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
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
			oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		}

	});


	return TableController;

});
