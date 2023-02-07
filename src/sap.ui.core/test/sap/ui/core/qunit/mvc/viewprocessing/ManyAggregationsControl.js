/**
 * Control which contains many aggregations
 */
sap.ui.define(['sap/ui/core/Control'], function(Control) {
	"use strict";

	var ManyAggregationsControl = Control.extend("sap.ui.core.qunit.mvc.viewprocessing.ManyAggregationsControl", {
		metadata: {
			library: "sap.ui.core.qunit.mvc.viewprocessing",
			defaultAggregation: "bottomControls",
			aggregations: {

				alternativeContent: {type: "sap.ui.core.Control", multiple: true},

				footerToolbar: {type: "sap.m.Toolbar", multiple: false},

				content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

				secondaryContent: {type: "sap.ui.core.Control", multiple: true},

				headerToolbar: {type: "sap.m.Toolbar", multiple: false},

				infoToolbar: {type: "sap.m.Toolbar", multiple: false},

				// two aggregations, but they will end up in only one
				bottomControls: {type: "sap.ui.core.Control", multiple: true, singularName: "bottomControl"},
				groundControls: {type: "sap.ui.core.Control", multiple: true, singularName: "groundControl"}
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
				renderCtrls(oControl.getAggregation("content"));
				renderCtrls(oControl.getAggregation("secondaryContent"));
				oRM.close("div");
			}
		}
	});

	ManyAggregationsControl.prototype.toString = function() {
		return "ManyAggregationsControl";
	};

	return ManyAggregationsControl;
});