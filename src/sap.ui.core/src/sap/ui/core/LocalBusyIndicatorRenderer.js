/*!
 * ${copyright}
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the
	 *            render output buffer
	 * @param {sap.ui.core.LocalBusyIndicator}
	 *            oControl an object representation of the control that should
	 *            be rendered
	 * @private
	 */
	var fnRenderFlickerDivs = function(oRm, oControl) {
		var sId = oControl.getId();
		var sIdAnimation = sId + "-animation";
		var aBoxEnum = [ "-leftBox", "-middleBox", "-rightBox" ];

		oRm.openStart('div', sIdAnimation);
		oRm.class("sapUiLocalBusyIndicatorAnimation");
		oRm.openEnd();

		for ( var i = 0; i < aBoxEnum.length; i++) {
			oRm.openStart('div', sId + aBoxEnum[i]);
			oRm.class("sapUiLocalBusyIndicatorBox");
			oRm.openEnd();
			oRm.close("div");
		}

		oRm.close("div");
	};

	/**
	 * LocalBusyIndicator renderer.
	 * @namespace
	 * @alias sap.ui.core.LocalBusyIndicatorRenderer
	 */
	var LocalBusyIndicatorRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the
	 *            render output buffer
	 * @param {sap.ui.core.LocalBusyIndicator}
	 *            oControl an object representation of the control that should
	 *            be rendered
	 */
	LocalBusyIndicatorRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);
		oRm.class("sapUiLocalBusyIndicator");
		oRm.openEnd();

		fnRenderFlickerDivs(oRm, oControl);

		oRm.close("div");
	};

	return LocalBusyIndicatorRenderer;

}, /* bExport= */ true);
