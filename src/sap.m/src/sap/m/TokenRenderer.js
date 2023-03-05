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
	 * @param {sap.m.Token} oControl an object representation of the control that should be rendered
	 */
	TokenRenderer.render = function(oRm, oControl){
		var sTooltip = oControl._getTooltip(oControl, oControl.getEditable() && oControl.getProperty("editableParent"));
		var oDeleteIcon = oControl.getAggregation("deleteIcon");
		var aAccDescribebyValues = []; // additional accessibility attributes
		var oAccAttributes = {
			role: "option"
		};
		var vPosinset = oControl.getProperty("posinset");
		var vSetSize = oControl.getProperty("setsize");

		// write the HTML into the render manager
		oRm.openStart("div", oControl).class("sapMToken");

		this._setAttributes(oRm, oControl);

		if (oControl.getSelected()) {
			oRm.class("sapMTokenSelected");
		}

		if (vPosinset !== undefined) {
			oRm.attr("aria-posinset", oControl.getProperty("posinset"));
		}

		if (vSetSize !== undefined) {
			oRm.attr("aria-setsize", oControl.getProperty("setsize"));
		}

		if (!oControl.getEditable()) {
			oRm.class("sapMTokenReadOnly");
		}

		if (oControl.getTruncated()) {
			oRm.class("sapMTokenTruncated");
		}

		// add tooltip if available
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		// ARIA attributes
		aAccDescribebyValues.push(InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_LABEL"));

		if (oControl.getEditable() && oControl.getProperty("editableParent")) {
			aAccDescribebyValues.push(InvisibleText.getStaticId("sap.m", "TOKEN_ARIA_DELETABLE"));
		}

		oRm.attr("aria-selected", oControl.getSelected());

		//ARIA attributes
		oAccAttributes.describedby = {
			value: aAccDescribebyValues.join(" "),
			append: true
		};

		oRm.accessibilityState(oControl, oAccAttributes);

		oRm.openEnd();

		TokenRenderer._renderInnerControl(oRm, oControl);

		if (oControl.getEditable() && oDeleteIcon) {
			oRm.renderControl(oDeleteIcon);
		}

		oRm.close("div");
	};

	/**
	 * Renders the inner HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Token} oControl an object representation of the control that should be rendered
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


/**
	 * Callback for specific rendering of token tabindex attributes.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager currently rendering this control
	 * @param {sap.m.Token}
	 *            oControl the Token that should be rendered
	 * @private
	 *
	 * @ui5-restricted sap.ui.mdc.field.TokenDisplayRenderer
	 */
	TokenRenderer._setAttributes = function(oRm, oControl) {
		oRm.attr("tabindex", "-1");
	};


	return TokenRenderer;

}, /* bExport= */ true);
