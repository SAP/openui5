sap.ui.controller("sap.ui.epm.ProductDetails", {

	onRowSelect: function(oContext) {    
		this.getView().setBindingContext(oContext);  
	}  	
});