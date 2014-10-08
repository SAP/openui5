sap.ui.jsfragment("samples.components.ext.customer.CustomTextViewFrag", {

	createContent : function(oController) {
		var oTextView = new sap.ui.commons.TextView("iHaveCausedDestruction", {
			text : "Hello World"
		});
		return oTextView;
	}

});