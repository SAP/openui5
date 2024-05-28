/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Lib",
		'sap/ui/core/Renderer',
		'sap/m/TokenizerRenderer',
		'sap/m/library'
	],
	(Library, Renderer, TokenizerRenderer, mLibrary) => {
		"use strict";

		const { EmptyIndicatorMode } = mLibrary;

		// shortcut for library resource bundle
		const oRb = Library.getResourceBundleFor("sap.m");

		/**
		 * TokenizerDisplay renderer.
		 * @namespace
		 */
		const TokenizerDisplayRenderer = Renderer.extend(TokenizerRenderer);
		TokenizerDisplayRenderer.apiVersion = 2;

		TokenizerDisplayRenderer._renderIndicator = function(oRm, oControl) {
			TokenizerRenderer._renderIndicator.apply(this, arguments);

			//***** add emptyIndicator */
			if (oControl.getEmptyIndicatorMode() !== EmptyIndicatorMode.Off && oControl.getTokens().length == 0) {
				this._renderEmptyIndicator(oRm, oControl);
			}
		};

		TokenizerDisplayRenderer._renderIndicatorTabIndex = function(oRm, oControl) {
			oRm.attr("tabindex", "0");
			oRm.attr("role", "button");
		};


		/**
		 * Renders the empty text indicator.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.mdc.field.TokenizerDisplay} oControl An object representation of the control that should be rendered.
		 */
		TokenizerDisplayRenderer._renderEmptyIndicator = function(oRm, oControl) {
			oRm.openStart("span");
			oRm.class("sapMEmptyIndicator");
			if (oControl.getEmptyIndicatorMode() === EmptyIndicatorMode.Auto) {
				oRm.class("sapMEmptyIndicatorAuto");
			}
			oRm.openEnd();
			oRm.openStart("span");
			oRm.attr("aria-hidden", true);
			oRm.openEnd();
			oRm.text(oRb.getText("EMPTY_INDICATOR"));
			oRm.close("span");
			//Empty space text to be announced by screen readers
			oRm.openStart("span");
			oRm.class("sapUiPseudoInvisibleText");
			oRm.openEnd();
			oRm.text(oRb.getText("EMPTY_INDICATOR_TEXT"));
			oRm.close("span");
			oRm.close("span");
		};

		return TokenizerDisplayRenderer;
	});