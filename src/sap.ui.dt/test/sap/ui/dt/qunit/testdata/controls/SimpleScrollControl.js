// Provides control sap.ui.dt.test.controls.SimpleScrollControl
/*globals sap*/
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";

	/**
	 * Constructor for a new SimpleScrollControl.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A simple ScrollControl.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version @version@
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.dt.test.controls.SimpleScrollControl
	 */
	var SimpleScrollControl = Control.extend('sap.ui.dt.test.controls.SimpleScrollControl', {

		metadata: {
			properties: {
				scrollcontainerEnabled: {
					type: "boolean",
					defaultValue: true
				}
			},

			aggregations: {
				content1: {type: "sap.ui.core.Control", multiple: true, singularName: "content1"},
				content2: {type: "sap.ui.core.Control", multiple: true, singularName: "content2"},
				footer: {type: "sap.ui.core.Control", multiple: true, singularName: "footer"}
			},
			designtime: {
				aggregations: {
					content1: {
						domRef: function(oElement) {
							return oElement.$("content1").get(0);
						}
					},
					content2: {
						domRef: function(oElement) {
							return oElement.$("content2").get(0);
						}
					},
					footer: {
						domRef: function(oElement) {
							return oElement.$("footer").get(0);
						}
					}
				},
				scrollContainers : [
					{
						domRef : "> .sapUiDtTestSSCScrollContainer",
						aggregations : ["content1", "content2"]
					}
				],
				actions: {
					move: {
						changeType: "moveControls"
					}
				}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				var sId;
				var aContent;
				oRm.openStart("div", oControl);
				oRm.class("sapUiDtTestSSC");
				oRm.openEnd();

				function renderAggregations() {
					sId = oControl.getId() + "-content1";
					oRm.openStart("div");
					oRm.attr("id", sId);
					oRm.openEnd();
					aContent = oControl.getAggregation("content1", []);
					aContent.forEach(function(oControl) {
						oRm.renderControl(oControl);
					});
					oRm.close("div");

					sId = oControl.getId() + "-content2";
					oRm.openStart("div");
					oRm.attr("id", sId);
					oRm.openEnd();
					aContent = oControl.getAggregation("content2", []);
					aContent.forEach(function(oControl) {
						oRm.renderControl(oControl);
					});
					oRm.close("div");
				}

				if (oControl.getScrollcontainerEnabled()) {
					oRm.openStart("div");
					oRm.attr("id", oControl.getId() + "-scrollContainer");
					oRm.class("sapUiDtTestSSCScrollContainer");
					oRm.style("height", "600px");
					oRm.style("width", "450px");
					oRm.style("overflow", "auto");
					oRm.openEnd();

					renderAggregations();

					//end scrollcontainer
					oRm.close("div");
				} else {
					renderAggregations();
				}

				sId = oControl.getId() + "-footer";
				oRm.openStart("div");
				oRm.attr("id", sId);
				oRm.openEnd();

				aContent = oControl.getAggregation("footer", []);
				aContent.forEach(function(oControl) {
					oRm.renderControl(oControl);
				});
				oRm.close("div");

				oRm.close("div");
			}
		}

	});

	return SimpleScrollControl;
}, /* bExport= */ true);
