/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer', './InputBaseRenderer'], function(Renderer, InputBaseRenderer) {
	"use strict";

	/**
	 * MaskInputRenderer renderer.
	 * @namespace
	 */
	var MaskInputRenderer = Renderer.extend(InputBaseRenderer);

	/**
	 * Returns the inner aria labelledby announcement texts for the accessibility.
	 *
	 * @override
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String}
	 */
	MaskInputRenderer.getLabelledByAnnouncement = function(oControl) {
		var sMask = oControl.getMask(),
			sPlaceholder = oControl.getPlaceholder() || "",
			sToolTip = oControl.getTooltip_AsString() || "",
			oResourceBundle,
			sMaskScreenReaderTag,
			sAnnouncement = "";

		if (sMask && sMask.length) {
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			sMaskScreenReaderTag = oResourceBundle.getText("MASKINPUT_SCREENREADER_TAG");

			if (sToolTip) {
				sToolTip = " " + sToolTip + " ";
			}
			if (sPlaceholder) {
				sPlaceholder = " " + sPlaceholder + " ";
			}
			sAnnouncement = sMaskScreenReaderTag + sPlaceholder + sToolTip;
			return sAnnouncement;
		}

		return InputBaseRenderer.getLabelledByAnnouncement.apply(this, arguments);
	};

	/**
	 * Returns the inner aria describedby announcement texts for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String}
	 */
	MaskInputRenderer.getDescribedByAnnouncement = function(oControl) {
		var sMask = oControl.getMask(),
			sMaskPlaceholderSymbol = oControl.getPlaceholderSymbol(),
			oResourceBundle,
			sAnnouncement = "";

		if (sMask.length && sMaskPlaceholderSymbol) {
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			sAnnouncement = oResourceBundle.getText("MASKINPUT_SCREENREADER_DESCRIPTION", [sMaskPlaceholderSymbol, sMask]);

			return jQuery.trim(sAnnouncement);
		}

		return InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
	};

	return MaskInputRenderer;

}, /* bExport= */ true);
