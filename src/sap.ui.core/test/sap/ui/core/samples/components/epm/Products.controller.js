sap.ui.controller("sap.ui.epm.Products", {
	
	onInit: function() {
		var oCurrencyType = new sap.ui.model.type.Float({minFractionDigits: 2, maxFractionDigits: 2});

		// bind the table
		this.byId("tblProducts").bindRows("/ProductCollection");
		
		// bind details
		this.byId("lytSupplier").bindContext("Supplier");

		// apply the widths to the details layouts
		this.byId("lytProductDetails").setWidths("1%", "1%", "98%");
		this.byId("lytSupplier").setWidths("1%", "1%", "1%", "97%");
		this.byId("productDetailsPrice").bindProperty("value", "Price/Amount", oCurrencyType);
		this.byId("priceTemplate").bindProperty("text", "Price/Amount", oCurrencyType);
		
	},
	
	onBeforeRendering: function() {},
	
	onAfterRendering: function() {},
	
	onExit: function() {} ,
	
	onRowSelect: function(oEvent) {
		
		// get the binding context of the first selected row
		var oContext = oEvent.getParameter("rowContext");

		// update binding context of the details
		var bus = sap.ui.getCore().getEventBus(); 
		bus.publish("C1","rowSelect1", oContext); 
	}
	
});
