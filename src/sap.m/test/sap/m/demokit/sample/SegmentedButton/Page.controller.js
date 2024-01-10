sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/ElementRegistry',
	'sap/m/MessageToast'
], function(Controller, ElementRegistry, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.SegmentedButton.Page", {

		onSelectionChange: function (oEvent) {
			var oSegmentedButton = this.byId('SB1'),
				oSelectedItemId = oSegmentedButton.getSelectedItem(),
				oSelectedItem = ElementRegistry.get(oSelectedItemId),
				oTextControl = this.byId('selectedItemPreview');

			//the selected item could be found via the "item" parameter of "selectionChange" event
			MessageToast.show("oEvent.getParameter('item').getText(): '" + oEvent.getParameter("item").getText() + "' selected");

			//the selected item could also be found via the "selectItem" association not only when "selectionChange" but when needed
			oTextControl.setText("getSelectedItem(): " + oSelectedItem.getText());

		}

	});

});
