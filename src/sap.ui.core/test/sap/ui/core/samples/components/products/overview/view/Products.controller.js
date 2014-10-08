sap.ui.controller("samples.components.products.overview.view.Products", {
	
	onInit: function() {
		var oCurrencyType = new sap.ui.model.type.Float({minFractionDigits: 2, maxFractionDigits: 2});
		this.eventBusPublication = {};
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

	onRowSelect: function(oEvent) {
		// get the binding context of the first selected row
		this.oContext = oEvent.getParameter("rowContext");
		// update binding context of the details
		this.byId("lytDetails").setBindingContext(this.oContext);
		// Pass the selection from master to the other 
		var bus = sap.ui.getCore().getEventBus(); 
		bus.publish(this.eventBusPublication.channel,this.eventBusPublication.event, {context: this.oContext}); 
	}
});
