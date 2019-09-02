sap.ui.define([
	'sap/ui/core/Control'],
	function (Control) {
		"use strict";
		var WrapperLayouter = Control.extend("xmldefs.WrapperLayouter", {
			metadata: {
				aggregations: {
					items: {
						multiple: true
					}
				},
				defaultAggregation: "items"
			},
			init: function () {
			},
			renderer: function (rm, oControl) {
				rm.write('<div>');
				var oItems = oControl.getItems();
				oItems.forEach(function (oItem) {
					rm.renderControl(oItem);
				}, this);
				rm.write('</div>');
			}
		});

		return WrapperLayouter;
	});
