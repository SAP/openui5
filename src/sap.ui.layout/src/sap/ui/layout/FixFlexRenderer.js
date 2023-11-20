/*!
 * ${copyright}
 */

sap.ui.define([
], function () {
	"use strict";

	/**
	 * FixFlex renderer
	 * @namespace
	 */
	var FixFlexRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.layout.FixFlex} oControl an object representation of the control that should be rendered
	 */
	FixFlexRenderer.render = function (oRM, oControl) {
		oRM.openStart("div", oControl)
			.class("sapUiFixFlex");

		if (oControl.getMinFlexSize() !== 0) {
			oRM.class("sapUiFixFlexInnerScrolling");
		}

		// Setting css class for horizontal layout
		if (!oControl.getVertical()) {
			oRM.class("sapUiFixFlexRow");
		}

		oRM.openEnd();

		// Defines the rendering sequence - fix/flex or flex/fix
		if (oControl.getFixFirst()) {
			this.renderFixChild(oRM, oControl);
			this.renderFlexChild(oRM, oControl);
		} else {
			this.renderFlexChild(oRM, oControl);
			this.renderFixChild(oRM, oControl);
		}

		oRM.close("div");
	};

	/**
	 * Render the controls in the flex container
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.layout.FixFlex} oControl an object representation of the control that should be rendered
	 */
	FixFlexRenderer.renderFixChild = function (oRM, oControl) {
		oRM.openStart("div", oControl.getId() + "-Fixed").class("sapUiFixFlexFixed");

		// Set specific height/width to the element depending of the orientation of the layout
		if (oControl.getFixContentSize() !== "auto") {
			if (oControl.getVertical()) {
				oRM.style("height", oControl.getFixContentSize());
			} else {
				oRM.style("width", oControl.getFixContentSize());
			}
		}

		oRM.openEnd();

		oControl.getFixContent().forEach(oRM.renderControl, oRM);

		oRM.close("div");
	};

	/**
	 * Render the controls in the fix container
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.layout.FixFlex} oControl an object representation of the control that should be rendered
	 */
	FixFlexRenderer.renderFlexChild = function (oRM, oControl) {
		oRM.openStart("div", oControl.getId() + "-Flexible").class("sapUiFixFlexFlexible").openEnd();

		oRM.openStart("div", oControl.getId() + "-FlexibleContainer").class("sapUiFixFlexFlexibleContainer");

		if (oControl.getMinFlexSize() !== 0) {
			if (oControl.getVertical()) {
				oRM.style("min-height", oControl.getMinFlexSize() + "px");
			} else {
				oRM.style("min-width", oControl.getMinFlexSize() + "px");
			}
		}

		oRM.openEnd();

		oRM.renderControl(oControl.getFlexContent());

		oRM.close("div")
			.close("div");
	};

	return FixFlexRenderer;

}, /* bExport= */ true);