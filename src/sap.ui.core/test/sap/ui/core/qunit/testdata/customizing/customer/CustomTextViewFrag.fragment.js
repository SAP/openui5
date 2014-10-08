sap.ui.jsfragment("testdata.customizing.customer.CustomTextViewFrag", {

	createContent : function(oController) {
		var oTextView = new sap.ui.commons.TextView("iHaveCausedDestruction", {
			text : "Hello World"
		});
		return oTextView;
	}

});