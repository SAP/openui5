sap.ui.define("sap/ui/table/sample/TableExampleUtils", [
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/FeedListItem",
	"sap/ui/core/format/DateFormat"
], function (JSONModel, Popover, List, FeedListItem, DateFormat) {
	"use strict";
	
	var Utils = {};
	
	// Access explored demo data, enrich it and return a JSONModel containing the data
	Utils.initSampleDataModel = function() {
		var oModel = new JSONModel();
		
		var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});
		
		jQuery.ajax(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"), {
			dataType: "json",
			success: function (oData) {
				var aTemp1 = [];
				var aTemp2 = [];
				var aSuppliersData = [];
				var aCategoryData = [];
				for (var i=0; i<oData.ProductCollection.length; i++) {
					var oProduct = oData.ProductCollection[i];
					if (oProduct.SupplierName && jQuery.inArray(oProduct.SupplierName, aTemp1) < 0) {
						aTemp1.push(oProduct.SupplierName);
						aSuppliersData.push({Name: oProduct.SupplierName});
					}
					if (oProduct.Category && jQuery.inArray(oProduct.Category, aTemp2) < 0) {
						aTemp2.push(oProduct.Category);
						aCategoryData.push({Name: oProduct.Category});
					}
					oProduct.DeliveryDate = (new Date()).getTime() - (i%10 * 4 * 24 * 60 * 60 * 1000);
					oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
					oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
					oProduct.Available = oProduct.Status == "Available" ? true : false;
				}
				
				oData.Suppliers = aSuppliersData;
				oData.Categories = aCategoryData;
				
				oModel.setData(oData);
			}.bind(this),
			error: function () {
				jQuery.sap.log.error("failed to load json");
			}
		});
		
		return oModel;
	};
	
	Utils.formatAvailableToObjectState = function (bAvailable) {
		return bAvailable ? "Success" : "Error";
	};
	
	Utils.formatAvailableToIcon = function(bAvailable) {
		return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
	};
	
	Utils.showInfo = function(aItems, oBy) {
		if (typeof(aItems) == "string") {
			jQuery.ajax(aItems, {
				dataType: "json",
				sync: true,
				success: function (oData) {
					Utils.showInfo(oData, oBy);
				}
			});
			return;
		}
		
		var oPopover = new Popover({
			showHeader: false,
			placement: "Auto",
			afterClose: function(){
				oPopover.destroy();
			},
			content: [
				new List({
					items: {
						path: "/items",
						template: new FeedListItem({
							senderActive: false,
							sender: "{title}",
							showIcon: false,
							text: "{text}"
						})
					}
				})
			]
		});
		
		jQuery.sap.syncStyleClass("sapUiSizeCompact", oBy, oPopover);
		jQuery.sap.syncStyleClass("sapUiSizeCozy", oBy, oPopover);
		oPopover.setModel(new JSONModel({items: aItems}));
		oPopover.openBy(oBy, true);
	};
	

	return Utils;
	
}, true /* bExport */);