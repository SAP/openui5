sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/Control'],
	function (jQuery, Control, XML) {
		"use strict";
		var ItemList = Control.extend("composites.ItemList", {
			metadata: {
				aggregations: {
					items: {
						type: "sap.ui.core.Item",
						multiple: true
					}
				},
				defaultAggregation: "items"
			},
			renderer: function (oRm, oControl) {
				oRm.write("<div");
				oRm.writeControlData(oControl);
				oRm.addClass("xxx");
				oRm.writeClasses();
				oRm.write(">");
				var oItems = oControl.getItems();
				oRm.writeEscaped("*");
				oItems.forEach(function (oItem) {
					oRm.writeEscaped(oItem.getText());
					oRm.writeEscaped("*");
				}, this);
				oRm.write("</div>");
			}
		});
		return ItemList;
	}, /* bExport= */true);
