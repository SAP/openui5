/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

var FeedInputRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	FeedInputRenderer.render = function (oRm, oControl) {
		var sMyId = oControl.getId();

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMFeedIn");
		if (!oControl.getShowIcon()) {
			oRm.addClass("sapMFeedInNoIcon");
		}
		if (!oControl.getEnabled()) {
			oRm.addClass("sapMFeedInDisabled");
		}
		oRm.writeClasses();
		oRm.write(">");
		if (!!oControl.getShowIcon()) {
			this._addImage(oRm, oControl, sMyId);
		}
		oRm.write('<div id="' + sMyId + '-container"');
		oRm.addClass("sapMFeedInContainer");
		oRm.writeClasses();
		oRm.write(">");
		var oTextArea = oControl._getTextArea();
		oRm.renderControl(oTextArea);
		oRm.renderControl(oControl._getPostButton());
		oRm.write("</div>");
		oRm.write("</div>");
	};

	FeedInputRenderer._addImage = function (oRm, oControl, sMyId) {
		oRm.write('<figure id="' + sMyId + '-figure" class ="sapMFeedInFigure');
		if (!!oControl.getIcon()) {
				oRm.write('">');
			} else {
				oRm.write(' sapMFeedListItemIsDefaultIcon">');
			}
		oRm.renderControl(oControl._getImageControl());
		oRm.write('</figure>');
	};

	return FeedInputRenderer;

}, /* bExport= */ true);