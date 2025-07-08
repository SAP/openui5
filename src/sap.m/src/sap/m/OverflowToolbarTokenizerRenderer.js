/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Renderer', 'sap/m/TokenizerRenderer'],
	function(Renderer, TokenizerRenderer) {
	"use strict";


	/**
	 * OverflowToolbarTokenizerRenderer renderer.
	 * @namespace
	 */

	const OverflowToolbarTokenizerRenderer = Renderer.extend(TokenizerRenderer);
	OverflowToolbarTokenizerRenderer.apiVersion = 2;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Tokenizer} oControl an object representation of the control that should be rendered
	 */
	OverflowToolbarTokenizerRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);

		if (oControl.getRenderMode() === "Overflow") {
			oRm.class("sapMOverflowToolbarTokenizerButton");
			oRm.attr("tabindex", "0");
		}

		if (oControl.getRenderMode() !== "Overflow") {
			oRm.style("width", oControl.getWidth());
		}

		oRm.class("sapMOverflowToolbarTokenizer");

		oRm.openEnd();

		this.prependContent(oRm, oControl);
		this.renderOpenTag(oRm, oControl);
		this.renderInnerContent(oRm, oControl);

		oRm.close("div");
	};

	OverflowToolbarTokenizerRenderer.renderOpenTag = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-inner");
	};

	OverflowToolbarTokenizerRenderer.addWidthStyles = function(oRm, oControl) {
		if (oControl.getRenderMode() !== "Overflow") {
			oRm.style("width", `calc( 100% - ${oControl._getLabelWidth()}px)`);
			return;
		}

		oRm.style("width", "100%");
	};

	OverflowToolbarTokenizerRenderer.prependContent = function(oRm, oControl) {
		if (oControl.getRenderMode() !== "Overflow") {
			oRm.renderControl(oControl.getAggregation("label"));
		}
	};

	/**
	 * Renders the n-More indicator
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Tokenizer} oControl an object representation of the control that should be rendered
	 */
	OverflowToolbarTokenizerRenderer._renderIndicator = function(oRm, oControl) {
		if (oControl.getRenderMode() === "Overflow") {
			oRm.renderControl(oControl.getAggregation("moreItemsButton"));
			return;
		}

		TokenizerRenderer._renderIndicator.call(this, oRm, oControl);
	};

	return OverflowToolbarTokenizerRenderer;

}, /* bExport= */ true);
