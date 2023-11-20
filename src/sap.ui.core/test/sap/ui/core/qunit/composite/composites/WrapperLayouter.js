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
			renderer: {
				apiVersion: 2,
				render: function (rm, oControl) {
					rm.openStart('div').openEnd();
					var oItems = oControl.getItems();
					oItems.forEach(function (oItem) {
						rm.renderControl(oItem);
					});
					rm.close('div');
				}
			}
		});

		return WrapperLayouter;
	});
