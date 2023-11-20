/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
	"use strict";

	/**
	 * ObjectContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var ObjectContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.ObjectContentRenderer", {
		apiVersion: 2,
		MIN_OBJECT_CONTENT_HEIGHT: "3rem" // assuming 1 line of text and content padding
	});

	/**
	 * @override
	 */
	 ObjectContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		return ObjectContentRenderer.MIN_OBJECT_CONTENT_HEIGHT;
	};

	return ObjectContentRenderer;
});
