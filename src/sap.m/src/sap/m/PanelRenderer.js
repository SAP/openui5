/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * Panel renderer
	 * @namespace
	 */
	var PanelRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *          oControl an object representation of the control that should be rendered
	 */
	PanelRenderer.render = function(oRm, oControl) {
		// start Panel
		oRm.write("<section");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMPanel");
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");

		var bIsExpandable = oControl.getExpandable();
		var oHeaderTBar = oControl.getHeaderToolbar();

		if (bIsExpandable) {

			// we need a wrapping div around icon and header since otherwise the border needed for both do not exact align
			oRm.write("<div");

			if (oHeaderTBar) {
				// we are in the toolbar case
				oRm.addClass("sapMPanelWrappingDivTb");
			} else {
				oRm.addClass("sapMPanelWrappingDiv");
			}

			oRm.writeClasses();
			oRm.write(">");

			var oIcon = oControl._getIcon();
			if (oControl.getExpanded()) {
				oIcon.addStyleClass("sapMPanelExpandableIconExpanded");
			} else {
				oIcon.removeStyleClass("sapMPanelExpandableIconExpanded");
			}

			oRm.renderControl(oIcon);
		}

		// render header
		var sHeaderText = oControl.getHeaderText();


		if (oHeaderTBar) {
			oHeaderTBar.setDesign(sap.m.ToolbarDesign.Transparent, true);

			if (bIsExpandable) {
				// use this class as marker class - to ease selection later in onAfterRendering
				oHeaderTBar.addStyleClass("sapMPanelHdrExpandable");
			}

			oRm.renderControl(oHeaderTBar);

		} else if (sHeaderText) {
			oRm.write("<div");
			oRm.addClass("sapMPanelHdr");
			if (bIsExpandable) {
				// use this class as marker class - to ease selection later in onAfterRendering
				oRm.addClass("sapMPanelHdrExpandable");
			}

			oRm.writeClasses();
			oRm.write(">");

			oRm.writeEscaped(sHeaderText);
			oRm.write("</div>");
		}

		if (bIsExpandable) {
			oRm.write("</div>");
		}

		var oInfoTBar = oControl.getInfoToolbar();

		if (oInfoTBar) {
			if (bIsExpandable) {
				// use this class as marker class - to ease selection later in onAfterRendering
				oInfoTBar.addStyleClass("sapMPanelExpandablePart");
			}

			// render infoBar
			oInfoTBar.setDesign(sap.m.ToolbarDesign.Info, true);
			oRm.renderControl(oInfoTBar);
		}

		// render content
		oRm.write("<div");
		oRm.addClass("sapMPanelContent");
		oRm.addClass("sapMPanelBG");

		if (bIsExpandable) {
			// use this class as marker class - to ease selection later in onAfterRendering
			oRm.addClass("sapMPanelExpandablePart");
		}

		oRm.writeClasses();
		oRm.write(">");
		var aChildren = oControl.getContent();
		var iLength = aChildren.length;
		for (var i = 0; i < iLength; i++) {
			oRm.renderControl(aChildren[i]);
		}
		oRm.write("</div>");

		oRm.write("</section>");
	};

	return PanelRenderer;

}, /* bExport= */ true);
