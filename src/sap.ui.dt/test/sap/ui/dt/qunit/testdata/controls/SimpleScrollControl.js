// Provides control sap.ui.dt.test.controls.SimpleScrollControl
/*globals sap*/
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function(jQuery, Control) {
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
				scrollContainers : [{
					domRef : "> .sapUiDtTestSSCScrollContainer",
					aggregations : ["content1", "content2"]
				}]
			}
		},

		renderer: function(oRm, oCtrl) {
			oRm.write("<div");
			oRm.writeControlData(oCtrl);
			oRm.addClass("sapUiDtTestSSC");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div id='scrollContainer'");
			oRm.addClass("sapUiDtTestSSCScrollContainer");
			oRm.addStyle("height", "700px");
			oRm.addStyle("width", "450px");
			oRm.addStyle("overflow", "scroll");
			oRm.writeStyles();
			oRm.writeClasses();
			oRm.write(">");

			var sId = oCtrl.getId() + "-content1";
			oRm.write("<div id='" + sId + "'>");
			var aContent = oCtrl.getAggregation("content1", []);
			aContent.forEach(function(oCtrl){
				oRm.renderControl(oCtrl);
			});
			oRm.write("</div>");

			sId = oCtrl.getId() + "-content2";
			oRm.write("<div id='" + sId + "'>");
			aContent = oCtrl.getAggregation("content2", []);
			aContent.forEach(function(oCtrl){
				oRm.renderControl(oCtrl);
			});
			oRm.write("</div>");

			//end scrollcontainer
			oRm.write("</div>");

			sId = oCtrl.getId() + "-footer";
			oRm.write("<div id='" + sId + "'>");
			aContent = oCtrl.getAggregation("footer", []);
			aContent.forEach(function(oCtrl){
				oRm.renderControl(oCtrl);
			});
			oRm.write("</div>");
			oRm.write("</div>");
		}

	});

	return SimpleScrollControl;

}, /* bExport= */ true);
