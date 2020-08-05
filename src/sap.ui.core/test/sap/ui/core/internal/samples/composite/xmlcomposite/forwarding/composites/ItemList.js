sap.ui.define([
	'sap/ui/core/Control'],
	function (Control) {
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
			renderer: {
				apiVersion: 2,
				render: function (oRm, oControl) {
					oRm.openStart("div", oControl);
					oRm.class("xxx");
					oRm.openEnd();
					var oItems = oControl.getItems();
					oRm.text("*");
					oItems.forEach(function (oItem) {
						oRm.text(oItem.getText());
						oRm.text("*");
					});
					oRm.close("div");
				}
			}
		});
		return ItemList;
	});
