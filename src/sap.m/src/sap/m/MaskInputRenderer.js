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

	MaskInputRenderer.apiVersion = 2;

	/**
	 * Returns the inner aria labelledby announcement texts for the accessibility.
	 *
	 * @override
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String} The inner aria labelledby announcement texts
	 */
	MaskInputRenderer.getLabelledByAnnouncement = function(oControl) {
		var sMask = oControl.getMask(),
			sPlaceholder = oControl.getPlaceholder() || "",
			oResourceBundle,
			sMaskScreenReaderTag,
			sAnnouncement = "";

		if (sMask && sMask.length) {
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			sMaskScreenReaderTag = oResourceBundle.getText("MASKINPUT_SCREENREADER_TAG");

			if (sPlaceholder) {
				sPlaceholder = " " + sPlaceholder + " ";
			}
			sAnnouncement = sMaskScreenReaderTag + sPlaceholder;
			return sAnnouncement;
		}

		return InputBaseRenderer.getLabelledByAnnouncement.apply(this, arguments);
	};

	/**
	 * Returns the inner aria describedby announcement texts for the accessibility.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control.
	 * @returns {String} The inner aria describedby announcement texts
	 */
	MaskInputRenderer.getDescribedByAnnouncement = function(oControl) {
		var sMask = oControl.getMask(),
			sMaskPlaceholderSymbol = oControl.getPlaceholderSymbol(),
			oResourceBundle,
			sAnnouncement = "";

		if (sMask.length && sMaskPlaceholderSymbol) {
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			sAnnouncement = oResourceBundle.getText("MASKINPUT_SCREENREADER_DESCRIPTION", [sMaskPlaceholderSymbol, sMask]);

			return sAnnouncement.trim();
		}

		return InputBaseRenderer.getDescribedByAnnouncement.apply(this, arguments);
	};

	return MaskInputRenderer;

}, /* bExport= */ true);
