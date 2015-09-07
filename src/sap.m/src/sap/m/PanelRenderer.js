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
		this.startPanel(oRm, oControl);

		this.renderHeader(oRm, oControl);

		this.renderContent(oRm, oControl);

		this.endPanel(oRm);
	};

	PanelRenderer.startPanel = function (oRm, oControl) {
		oRm.write("<section");

		oRm.addClass("sapMPanel");
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());

		oRm.writeAccessibilityState(oControl, { role: "form" });
		oRm.writeControlData(oControl);
		oRm.writeClasses();
		oRm.writeStyles();

		oRm.write(">");
	};

	PanelRenderer.renderHeader = function (oRm, oControl) {
		var bIsExpandable = oControl.getExpandable(),
			bIsExpanded = oControl.getExpanded(),
			oHeaderTBar = oControl.getHeaderToolbar(),
			sHeaderClass;

		if (bIsExpandable) {
			// we need a wrapping div around icon and header
			// otherwise the border needed for both do not exact align
			oRm.write("<header");
			if (oHeaderTBar) {
				sHeaderClass = "sapMPanelWrappingDivTb";
			} else {
				sHeaderClass = "sapMPanelWrappingDiv";
			}

			oRm.addClass(sHeaderClass);
			if (bIsExpanded) {
				oRm.addClass(sHeaderClass + "Expanded");
			}

			oRm.writeClasses();
			oRm.write(">");

			var oIcon = oControl._getIcon();
			if (bIsExpanded) {
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

		} else if (sHeaderText || bIsExpandable) {
			oRm.write("<h1");
			oRm.addClass("sapMPanelHdr");
			if (bIsExpandable) {
				// use this class as marker class - to ease selection later in onAfterRendering
				oRm.addClass("sapMPanelHdrExpandable");
			}

			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-header");
			oRm.write(">");
			oRm.writeEscaped(sHeaderText);
			oRm.write("</h1>");
		}

		if (bIsExpandable) {
			oRm.write("</header>");
		}

		var oInfoTBar = oControl.getInfoToolbar();

		if (oInfoTBar) {
			if (bIsExpandable) {
				// use this class as marker class to ease selection later in onAfterRendering
				oInfoTBar.addStyleClass("sapMPanelExpandablePart");
			}

			// render infoBar
			oInfoTBar.setDesign(sap.m.ToolbarDesign.Info, true);
			oRm.renderControl(oInfoTBar);
		}
	};

	PanelRenderer.renderContent = function (oRm, oControl) {
		this.startContent(oRm, oControl);

		this.renderChildren(oRm, oControl.getContent());

		this.endContent(oRm);
	};

	PanelRenderer.startContent = function (oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapMPanelContent");
		oRm.addClass("sapMPanelBG" + oControl.getBackgroundDesign());

		if (oControl.getExpandable()) {
			// use this class as marker class to ease selection later in onAfterRendering
			oRm.addClass("sapMPanelExpandablePart");
		}

		oRm.writeClasses();
		oRm.write(">");
	};

	PanelRenderer.renderChildren = function (oRm, aChildren) {
		aChildren.forEach(oRm.renderControl);
	};

	PanelRenderer.endContent = function (oRm) {
		oRm.write("</div>");
	};

	PanelRenderer.endPanel = function (oRm) {
		oRm.write("</section>");
	};

	return PanelRenderer;

}, /* bExport= */ true);
