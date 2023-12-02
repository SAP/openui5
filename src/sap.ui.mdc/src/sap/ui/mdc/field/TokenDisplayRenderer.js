/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', 'sap/m/TokenRenderer'],
	(Renderer, TokenRenderer) => {
		"use strict";

		/**
		 * TokenDisplay renderer.
		 * @namespace
		 */
		const TokenDisplayRenderer = Renderer.extend(TokenRenderer);
		TokenDisplayRenderer.apiVersion = 2;

		TokenDisplayRenderer._setAttributes = function(oRm, oControl) {
			TokenRenderer._setAttributes(oRm, oControl);
			oRm.attr("delimiter", oControl.getProperty("_delimiter"));
		};

		return TokenDisplayRenderer;
	});