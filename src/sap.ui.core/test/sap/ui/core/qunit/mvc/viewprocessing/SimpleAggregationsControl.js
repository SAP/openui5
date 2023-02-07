/**
 * Control which contains Simple aggregations
 */
sap.ui.define(['sap/ui/core/Control'], function(Control) {
	"use strict";

	var SimpleAggregationsControl = Control.extend("sap.ui.core.qunit.mvc.viewprocessing.SimpleAggregationsControl", {
		metadata: {
			library: "sap.ui.core.qunit.mvc.viewprocessing",
			defaultAggregation: "bottomControls",
			aggregations: {

				alternativeContent: {type: "sap.ui.core.Control", multiple: true}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oControl) {
				oRM.openStart("div", oControl).class("myTestAggrs").openEnd();

				var renderCtrls = function(aCtrls){
					if (aCtrls){
						aCtrls.forEach(function(oCtrl) {
							oRM.renderControl(oCtrl);
						});
					}
				};

				renderCtrls(oControl.getAggregation("alternativeContent"));
				oRM.close("div");
			}
		}
	});

	SimpleAggregationsControl.prototype.toString = function() {
		return "SimpleAggregationsControl";
	};

	return SimpleAggregationsControl;
});