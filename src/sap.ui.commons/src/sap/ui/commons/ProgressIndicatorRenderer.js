/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.ProgressIndicator
sap.ui.define(["sap/ui/core/Configuration"],
	function(Configuration) {
	"use strict";


	/**
	 * ProgressIndicator renderer.
	 * @namespace
	 */
	var ProgressIndicatorRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ProgressIndicatorRenderer.render = function (oRm, oProgressIndicator) {
		var widthControl = oProgressIndicator.getWidth(),
			widthBar = oProgressIndicator.getPercentValue(),
			tooltip = oProgressIndicator.getTooltip_AsString(),
			displayValue = oProgressIndicator.getDisplayValue(),
			widthBorder;

		oProgressIndicator.bRtl  = Configuration.getRTL();

		if (widthBar > 100) {
			widthBorder = (10000 / widthBar) + '%';
		} else {
			widthBorder = '100%';
		}

		oRm.write('<div');
		oRm.writeControlData(oProgressIndicator);
		oRm.writeAttribute('tabindex', '0');

		if (Configuration.getAccessibility()) {
			oRm.writeAccessibilityState(oProgressIndicator, {
				role: 'progressbar',
				valuemin: '0%',
				valuenow: widthBar + '%',
				valuemax: '100%'
			});
		}

		if (displayValue) {
			oRm.writeAttributeEscaped('aria-valuetext', displayValue);
		}

		if (tooltip) {
			oRm.writeAttributeEscaped('title', tooltip);
		}

		if (oProgressIndicator.getWidth() && oProgressIndicator.getWidth() !== '') {
			oRm.writeAttribute('style', 'height: 16px; width:' + widthControl + ';');
		}

		oRm.addClass('sapUiProgInd');
		oRm.writeClasses();

		oRm.write('>');

		oRm.write('<div');
		oRm.writeAttribute('id', oProgressIndicator.getId() + '-box');

		if (oProgressIndicator.getWidth() && oProgressIndicator.getWidth() !== '') {
			oRm.writeAttribute('style', 'height: 16px; width:' + widthBorder + ';');
		}

		oRm.addClass('sapUiProgIndBorder');
		oRm.writeClasses();

		oRm.write('>');

		oRm.write('<div');
		oRm.writeAttribute('id', oProgressIndicator.getId() + '-bar');
		oRm.writeAttribute('style', 'height: 14px; width:' + oProgressIndicator.getPercentValue() + '%;');

		var sBarColor = oProgressIndicator.getBarColor();
		switch (sBarColor) {
			case "POSITIVE":
				oRm.addClass('sapUiProgIndBarPos');
				break;
			case "NEGATIVE":
				oRm.addClass('sapUiProgIndBarNeg');
				break;
			case "CRITICAL":
				oRm.addClass('sapUiProgIndBarCrit');
				break;
			case "NEUTRAL":
				oRm.addClass('sapUiProgIndBar');
				break;
			default:
				oRm.addClass('sapUiProgIndBar');
				break;
		}

		oRm.writeClasses();

		oRm.write('>');

		oRm.write('<div');
		oRm.writeAttribute('id', oProgressIndicator.getId() + '-end');

		if (widthBar > 100) {
			oRm.addClass(oProgressIndicator._getProgIndTypeClass(sBarColor));
		} else {
			oRm.addClass('sapUiProgIndEndHidden');
		}

		oRm.writeClasses();
		if (oProgressIndicator.bRtl) {
			oRm.writeAttribute('style', 'position: relative; right:' + widthBorder);
		} else {
			oRm.writeAttribute('style', 'position: relative; left:' + widthBorder);
		}

		oRm.write('>');
		oRm.write('</div>');

		oRm.write('<span');

		oRm.addClass('sapUiProgIndFont');
		oRm.writeClasses();

		oRm.write('>');

		if (oProgressIndicator.getShowValue() && oProgressIndicator.getShowValue()) {
			if (oProgressIndicator.getDisplayValue() && oProgressIndicator.getDisplayValue() !== '') {
				oRm.writeEscaped(oProgressIndicator.getDisplayValue());
			}
		}

		oRm.write('</span>');
		oRm.write('</div>');
		oRm.write('</div>');
		oRm.write('</div>');
	};

	return ProgressIndicatorRenderer;

}, /* bExport= */ true);
