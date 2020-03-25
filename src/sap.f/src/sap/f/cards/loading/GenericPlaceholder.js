/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (Control, Core) {
	"use strict";

	/**
	 * Constructor for a new <code>loading</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.76
	 * @alias sap.f.cards.loading.ListLoadingContent
	 */
	var GenericPlaceholder = Control.extend("sap.f.cards.loading.GenericPlaceholder", {
		metadata: {
			library: "sap.f"
		},
		renderer: function (oRm, oControl) {
			// set title for screen reader
			var oResBundle = Core.getLibraryResourceBundle("sap.ui.core"),
				sTitle = oResBundle.getText("BUSY_TEXT");
			oRm.write("<div");
			oRm.writeElementData(oControl);
			oRm.addClass("sapFCardContentPlaceholder");
			oRm.addClass("sapFCardContentGenericPlaceholder");
			oRm.attr("tabindex", "0");
			oRm.attr("title", sTitle);
			oRm.accessibilityState(oControl, {
				role: "progressbar",
				valuemin: "0",
				valuemax: "100"
			});
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<div");
			oRm.addClass("sapFCardLoadingShimmer");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg' version='1.1'");
			oRm.writeAttribute("viewBox", "0 0 144 144");
			oRm.addClass("sapFCardSVG");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<g>");
			oRm.write("<path");
			oRm.writeAttribute("d", "M0,0v144h144V0H0z M36.4,114h-8.8V87.8h8.8V114z M50.3,114h-9.2V80.8h9.2V114z M64.1,114h-9.2V99.9h9.2V114z M66.9,64.9 c0,1.6-0.8,2.4-2.2,2.4H26.8c-1.6,0-2.4-0.8-2.4-2.4V26.4c0-1.6,0.8-2.4,2.4-2.4h37.9c1.5,0,2.2,0.8,2.2,2.4V64.9z M119.6,117.6 c0,1.6-0.8,2.4-2.2,2.4H79.1c-1.6,0-2.4-0.8-2.4-2.4V79.1c0-1.6,0.8-2.4,2.4-2.4h38.2c1.5,0,2.2,0.8,2.2,2.4V117.6z M119.6,64.7 c0,0.6-0.2,1.2-0.7,1.8c-0.4,0.6-1,0.8-1.6,0.8H79.1c-0.6,0-1.2-0.3-1.7-0.8c-0.5-0.6-0.8-1.2-0.8-1.8V26.4c0-0.6,0.3-1.2,0.8-1.7 c0.6-0.5,1.2-0.8,1.8-0.8h38.1c1.5,0,2.2,0.8,2.2,2.4V64.7z");
			oRm.write("/>");
			oRm.write("<path");
			oRm.writeAttribute("d", "M92.3,104.8l-6.6-5.1l-4.5,6l9.6,7.3c0.2,0.4,0.9,0.7,2.1,0.9c1.4,0,2.5-0.6,3.4-1.7L114,87l-6.2-4.3L92.3,104.8z");
			oRm.write("/>");
			oRm.write("<rect");
			oRm.writeAttribute("x", "32.8");
			oRm.writeAttribute("y", "43.1");
			oRm.writeAttribute("width", "25.9");
			oRm.writeAttribute("height", "5.2");
			oRm.write("/>");
			oRm.write("<rect");
			oRm.writeAttribute("x", "32.8");
			oRm.writeAttribute("y", "52.5");
			oRm.writeAttribute("width", "25.9");
			oRm.writeAttribute("height", "5.2");
			oRm.write("/>");
			oRm.write("<path");
			oRm.writeAttribute("d", "M115.9,27.2H81c-0.8,0-1.1,0.4-1.1,1.1v34.9c0,0.6,0.4,0.9,1.1,0.9h34.9c0.6,0,0.9-0.3,0.9-0.9V28.3 C116.8,27.6,116.5,27.2,115.9,27.2z M93.8,35.3c1.2-0.9,2.7-1.4,4.4-1.4c1.9,0,3.4,0.5,4.5,1.6c1.1,1.1,1.7,2.7,1.7,4.8 c0,1.9-0.7,3.3-2,4.2s-2.7,1.4-4.2,1.4c-1.8,0-3.2-0.5-4.4-1.5c-1.2-1-1.8-2.6-1.8-4.7C92.1,37.8,92.7,36.3,93.8,35.3z M108.8,59.6 H87.4v-5.8c0-1.6,0.3-2.9,1-3.8c0.7-0.9,1.6-1.7,2.6-2.2c1.1-0.5,2.2-0.8,3.4-0.9c1.2-0.1,2.3-0.2,3.3-0.2h1.1 c2.6,0,4.9,0.4,6.9,1.3c2,0.9,3,2.8,3,5.8V59.6z");
			oRm.write("/>");
			oRm.write("<rect");
			oRm.writeAttribute("x", "32.8");
			oRm.writeAttribute("y", "33.8");
			oRm.writeAttribute("width", "25.9");
			oRm.writeAttribute("height", "5.1");
			oRm.write("/>");
			oRm.write("</g>");
			oRm.write("</svg>");
			oRm.write("</div>");
			oRm.write("</div>");
		}
	});

	return GenericPlaceholder;
});
