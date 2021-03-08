// Provides control sap.ui.dt.test.controls.SimpleScrollControl
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
	var SimpleScrollControl = Control.extend("sap.ui.dt.test.controls.SimpleScrollControl", {

		metadata: {
			properties: {
				scrollcontainerEnabled: {
					type: "boolean",
					defaultValue: true
				},
				useAlternateScrollContainer: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				content1: {type: "sap.ui.core.Control", multiple: true, singularName: "content1"},
				content2: {type: "sap.ui.core.Control", multiple: true, singularName: "content2"},
				content3: {type: "sap.ui.core.Control", multiple: true, singularName: "content3"},
				content4: {type: "sap.ui.core.Control", multiple: true, singularName: "content4"},
				content5: {type: "sap.ui.core.Control", multiple: true, singularName: "content5"},
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
					content3: {
						domRef: function(oElement) {
							return oElement.$("content3").get(0);
						}
					},
					content4: {
						domRef: function(oElement) {
							return oElement.$("content4").get(0);
						}
					},
					content5: {
						domRef: function(oElement) {
							return oElement.$("content5").get(0);
						}
					},
					footer: {
						domRef: function(oElement) {
							return oElement.$("footer").get(0);
						}
					}
				},
				scrollContainers: [
					{
						domRef: "> .sapUiDtTestSSCScrollContainer",
						aggregations: ["content1", "content2"]
					},
					{
						domRef: "> .sapUiDtTestSSCScrollContainer2",
						aggregations: function(oControl, fnUpdateScrollContainer) {
							oControl._updateFunction = fnUpdateScrollContainer;
							if (oControl.getUseAlternateScrollContainer()) {
								return ["content4", "content5"];
							}
							return ["content3", "content4"];
						}
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

				function renderAggregations(aNames) {
					aNames.forEach(function(sName) {
						sId = oControl.getId() + "-" + sName;
						oRm.openStart("div", sId);
						oRm.openEnd();
						aContent = oControl.getAggregation(sName, []);
						aContent.forEach(function(oControl) {
							oRm.renderControl(oControl);
						});
						oRm.close("div");
					});
				}

				if (oControl.getScrollcontainerEnabled()) {
					oRm.openStart("div", oControl.getId() + "-scrollContainer");
					oRm.class("sapUiDtTestSSCScrollContainer");
					oRm.style("height", "600px");
					oRm.style("width", "450px");
					oRm.style("overflow", "auto");
					oRm.openEnd();
					renderAggregations(["content1", "content2"]);
					oRm.close("div");

					oRm.openStart("div", oControl.getId() + "-scrollContainer2");
					oRm.class("sapUiDtTestSSCScrollContainer2");
					oRm.style("height", "600px");
					oRm.style("width", "450px");
					oRm.style("overflow", "auto");
					oRm.openEnd();
					renderAggregations(["content3", "content4", "content5"]);
					oRm.close("div");
				} else {
					renderAggregations(["content1", "content2", "content3", "content4", "content5"]);
				}

				sId = oControl.getId() + "-footer";
				oRm.openStart("div", sId);
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

	SimpleScrollControl.prototype.changeScrollContainer = function() {
		if (this.getUseAlternateScrollContainer()) {
			this.setUseAlternateScrollContainer(false);
		} else {
			this.setUseAlternateScrollContainer(true);
		}
		this._updateFunction({index: 1});
	};

	return SimpleScrollControl;
}, /* bExport= */ true);
