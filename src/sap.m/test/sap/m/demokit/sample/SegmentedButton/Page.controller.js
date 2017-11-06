sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, Controller) {
	"use strict";

	var Controller = Controller.extend("sap.m.sample.SegmentedButton.Page", {
		onSelectionChange: function (oEvent) {
			//the selected item could be found via the "item" parameter of "selectionChange" event
			sap.m.MessageToast.show("oEvent.getParameter('item').getText(): " + oEvent.getParameter("item").getText() + " selected");
			//the selected item could also be found via the "selectItem" association not only when "selectionChange" but when needed
			this.byId('selectedItem').setText("getSelectedItem(): " +
			sap.ui.getCore().byId(this.byId('item').getSelectedItem()).getText());
		}
	});

	return Controller;

});
