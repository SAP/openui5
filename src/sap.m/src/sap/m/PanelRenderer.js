/*!
 * ${copyright}
 */
sap.ui.define(["sap/m/library"],
	function(library) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

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
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMPanel");
		oRm.writeClasses();
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.writeAccessibilityState(oControl, {
			role: oControl.getAccessibleRole().toLowerCase(),
			labelledby: oControl._getLabellingElementId()
		});
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
			oHeaderTBar.setDesign(ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMPanelHeaderTB");
			oRm.renderControl(oHeaderTBar);

		} else if (sHeaderText || bIsExpandable) {
			oRm.write("<h1");
			oRm.addClass("sapMPanelHdr");
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
			oInfoTBar.setDesign(ToolbarDesign.Info, true);
			oInfoTBar.addStyleClass("sapMPanelInfoTB");
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

		if (sap.ui.Device.browser.firefox) {
			// ensure that the content is not included in the tab chain
			// this happens in FF, when we have a scrollable content
			oRm.writeAttribute('tabindex', '-1');
		}

		oRm.write(">");
	};

	PanelRenderer.renderChildren = function (oRm, aChildren) {
		aChildren.forEach(oRm.renderControl);
	};

	PanelRenderer.endContent = function (oRm) {
		oRm.write("</div>");
	};

	PanelRenderer.endPanel = function (oRm) {
		oRm.write("</div>");
	};

	return PanelRenderer;

}, /* bExport= */ true);
