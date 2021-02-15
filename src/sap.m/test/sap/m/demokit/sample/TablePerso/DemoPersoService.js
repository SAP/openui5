sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var DemoPersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "demoApp-productsTable-productCol",
					order: 2,
					text: "Product",
					visible: true
				},
				{
					id: "demoApp-productsTable-supplierCol",
					order: 1,
					text: "Supplier",
					visible: true
				},
				{
					id: "demoApp-productsTable-dimensionsCol",
					order: 0,
					text: "Dimensions",
					visible: false
				},
				{
					id: "demoApp-productsTable-weightCol",
					order: 3,
					text: "Weight",
					visible: false
				},
				{
					id: "demoApp-productsTable-priceCol",
					order: 4,
					text: "Price",
					visible: false
				}
			]
		},

		oResetData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "demoApp-productsTable-productCol",
					order: 0,
					text: "Product",
					visible: true
				},
				{
					id: "demoApp-productsTable-supplierCol",
					order: 1,
					text: "Supplier",
					visible: false
				},
				{
					id: "demoApp-productsTable-dimensionsCol",
					order: 4,
					text: "Dimensions",
					visible: false
				},
				{
					id: "demoApp-productsTable-weightCol",
					order: 2,
					text: "Weight",
					visible: false
				},
				{
					id: "demoApp-productsTable-priceCol",
					order: 3,
					text: "Price",
					visible: false
				}
			]
		},


		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			oDeferred.resolve(this._oBundle);
			// setTimeout(function() {
			// 	oDeferred.resolve(this._oBundle);
			// }.bind(this), 2000);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		getResetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			// oDeferred.resolve(this.oResetData);

			setTimeout(function() {
				oDeferred.resolve(this.oResetData);
			}.bind(this), 2000);

			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			//set personalization
			this._oBundle = this.oResetData;

			//reset personalization, i.e. display table as defined
			//this._oBundle = null;

			oDeferred.resolve();

			// setTimeout(function() {
			// 	this._oBundle = this.oResetData;
			// 	oDeferred.resolve();
			// }.bind(this), 2000);

			return oDeferred.promise();
		},

		//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
		//to 'Weight (Important!)', but will leave all other column names as they are.
		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return DemoPersoService;

});
