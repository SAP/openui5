/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./PlaceholderBaseRenderer"], function(Renderer, PlaceholderBaseRenderer) {
	"use strict";

	/**
	 * ObjectPlaceholderRenderer renderer.
	 * @namespace
	 */
	var ObjectPlaceholderRenderer = Renderer.extend(PlaceholderBaseRenderer);

	ObjectPlaceholderRenderer.apiVersion = 2;

	/**
	 * CSS class to be applied to the HTML root element of the placeholder.
	 *
	 * @type {string}
	 */
	ObjectPlaceholderRenderer.CSS_CLASS_PLACEHOLDER = "sapFCardContentObjectPlaceholder";

	ObjectPlaceholderRenderer.renderColumn = function(oRm, iRowsCnt) {
		oRm.openStart("div")
			.class("sapFCardObjectPlaceholderColumn")
			.openEnd();

		for (var i = 0; i < iRowsCnt; i++) {
			this.renderRow(oRm, "First", false);
			this.renderRow(oRm, "Second", i === iRowsCnt);
		}

		oRm.close("div");
	};

	ObjectPlaceholderRenderer.renderRow = function(oRm, sRow, bLastInColumn) {
		oRm.openStart("div")
			.class("sapFCardLoadingShimmer")
			.class("sapFCardObjectPlaceholderGroup" + sRow + "Row");

		if (bLastInColumn) {
			oRm.class("sapFCardObjectPlaceholderGroupLastRow");
		}

		oRm.openEnd()
			.close("div");
	};

	ObjectPlaceholderRenderer.renderContent = function(oControl, oRm) {
		for (var i = 0; i < oControl._iColsCnt; i++) {
			this.renderColumn(oRm, oControl._iRowsCnt);
		}
	};

	ObjectPlaceholderRenderer.addOuterAttributes = function(oControl, oRm) {

		PlaceholderBaseRenderer.addOuterAttributes.apply(this, arguments);

		oRm.class(ObjectPlaceholderRenderer.CSS_CLASS_PLACEHOLDER);

	};

	return ObjectPlaceholderRenderer;

}, /* bExport= */ true);
