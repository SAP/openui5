/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer'], function (Renderer) {
	"use strict";

	return Renderer.extend("sap.m.P13nFilterPanelRenderer", {
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("section", oControl);
				oRm.class("sapMFilterPanel");
				oRm.openEnd();

				oRm.openStart("div");
				oRm.class("sapMFilterPanelContent");
				oRm.class("sapMFilterPanelBG");
				oRm.openEnd();

				oControl.getAggregation("content").forEach(function (oChildren) {
					oRm.renderControl(oChildren);
				});

				oRm.close("div");
				oRm.close("section");
			}
		}
	});
}, true);