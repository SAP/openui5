/*!

* ${copyright}

*/
sap.ui.define(["sap/ui/core/library", "sap/ui/core/InvisibleText"],
	function(coreLibrary, InvisibleText) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * Token renderer.
	 * @namespace
	 */
	var TokenRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenRenderer.render = function(oRm, oControl){
		var sTooltip = oControl._getTooltip(oControl, oControl.getEditable()),
			aAccDescribebyValues = [], // additional accessibility attributes
			oAccAttributes = {
				role: "listitem"
			};

		// write the HTML into the render manager
		oRm.openStart("div", oControl).attr("tabindex", "-1").class("sapMToken");

		if (oControl.getSelected()) {
			oRm.class("sapMTokenSelected");
		}

		if (!oControl.getEditable()) {
			oRm.class("sapMTokenReadOnly");
		}

		// add tooltip if available
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		// ARIA attributes
		aAccDescribebyValues.push(InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_LABEL"));

		if (oControl.getEditable()) {
			aAccDescribebyValues.push(InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_DELETABLE"));
		}

		if (oControl.getSelected()) {
			aAccDescribebyValues.push(InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_SELECTED"));
		}

		//ARIA attributes
		oAccAttributes.describedby = {
			value: aAccDescribebyValues.join(" "),
			append: true
		};

		oRm.accessibilityState(oControl, oAccAttributes);

		oRm.openEnd();

		TokenRenderer._renderInnerControl(oRm, oControl);

		if (oControl.getEditable()) {
			oRm.renderControl(oControl._deleteIcon);
		}

		oRm.close("div");
	};

	/**
	 * Renders the inner HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TokenRenderer._renderInnerControl = function(oRm, oControl){
		var sTextDir = oControl.getTextDirection();

		oRm.openStart("span").class("sapMTokenText");
		// set text direction
		if (sTextDir !== TextDirection.Inherit) {
			oRm.attr("dir", sTextDir.toLowerCase());
		}
		oRm.openEnd();

		var title = oControl.getText();
		if (title) {
			oRm.text(title);
		}
		oRm.close("span");
	};


	return TokenRenderer;

}, /* bExport= */ true);
