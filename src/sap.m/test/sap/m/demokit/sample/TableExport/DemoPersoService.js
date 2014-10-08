jQuery.sap.declare("sap.m.sample.TableExport.DemoPersoService");

// Very simple page-context personalization
// persistence service, not for productive use!
sap.m.sample.TableExport.DemoPersoService = {

	oData : {
		_persoSchemaVersion: "1.0",
		aColumns : [
			{
				id: "demoApp-idProductsTable-productCol",
				order: 1,
				text: "Product",
				visible: true
			},
			{
				id: "demoApp-idProductsTable-supplierCol",
				order: 2,
				text: "Supplier",
				visible: true
			},
			{
				id: "demoApp-idProductsTable-dimensionsCol",
				order: 3,
				text: "Dimensions",
				visible: true
			},
			{
				id: "demoApp-idProductsTable-weightCol",
				order: 4,
				text: "Weight",
				visible: true
			},
			{
				id: "demoApp-idProductsTable-priceCol",
				order: 5,
				text: "Price",
				visible: true
			}
		]
	},

	getPersData : function () {
		var oDeferred = new jQuery.Deferred();
		if (!this._oBundle) {
			this._oBundle = this.oData;
		}
		var oBundle = this._oBundle;
		oDeferred.resolve(oBundle);
		return oDeferred.promise();
	},

	setPersData : function (oBundle) {
		var oDeferred = new jQuery.Deferred();
		this._oBundle = oBundle;
		oDeferred.resolve();
		return oDeferred.promise();
	},

	resetPersData : function () {
		var oDeferred = new jQuery.Deferred();
		var oInitialData = {
				_persoSchemaVersion: "1.0",
				aColumns : [
				{
							id: "demoApp-idProductsTable-productCol",
								order: 1,
								text: "Product",
								visible: true
							},
							{
								id: "demoApp-idProductsTable-supplierCol",
								order: 2,
								text: "Supplier",
								visible: true
							},
							{
								id: "demoApp-idProductsTable-dimensionsCol",
								order: 3,
								text: "Dimensions",
								visible: true
							},
							{
								id: "demoApp-idProductsTable-weightCol",
								order: 4,
								text: "Weight",
								visible: true
							},
							{
								id: "demoApp-idProductsTable-priceCol",
								order: 5,
								text: "Price",
								visible: true
							}
						]
		};

		//set personalization
		this._oBundle = oInitialData;

		//reset personalization, i.e. display table as defined
//		this._oBundle = null;

		oDeferred.resolve();
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
	}
};