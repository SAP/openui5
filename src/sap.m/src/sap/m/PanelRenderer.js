/*!
 * ${copyright}
 */
sap.ui.define(["sap/m/library", "sap/ui/Device"],
	function(library, Device) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	/**
	 * Panel renderer
	 * @namespace
	 */
	var PanelRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Panel}
	 *          oControl an object representation of the control that should be rendered
	 */
	PanelRenderer.render = function(oRm, oControl) {
		this.startPanel(oRm, oControl);

		this.renderHeader(oRm, oControl);

		this.renderContent(oRm, oControl);

		this.endPanel(oRm);
	};

	PanelRenderer.startPanel = function (oRm, oControl) {
		var bIsExpandable = oControl.getExpandable(),
			bIsStickyPanel = oControl.getStickyHeader(),
			oAccAttributes = {
				role: oControl.getAccessibleRole().toLowerCase()
			};

		oRm.openStart("div", oControl);
		oRm.class("sapMPanel");
		if (bIsStickyPanel) {
			oRm.class("sapMPanelHasStickyHeader");
		}

		if (bIsExpandable) {
			oRm.class("sapMPanelExpandable");
		}

		oRm.style("width", oControl.getWidth());
		oRm.style("height", oControl.getHeight());

		// add an aria-labelledby refence to the header, only when a headerToolbar is provided
		// or the control is not expandable
		// since in the default case, the focus is on the header
		// and the header would be read out twice
		if (oControl.getHeaderToolbar() || !bIsExpandable) {
			oAccAttributes.labelledby = oControl._getLabellingElementId();
		}

		oRm.accessibilityState(oControl, oAccAttributes);
		oRm.openEnd();
	};

	PanelRenderer.renderHeader = function (oRm, oControl) {
		var bIsExpandable = oControl.getExpandable(),
			bIsExpanded = oControl.getExpanded(),
			bIsStickyPanel = oControl.getStickyHeader(),
			oHeaderTBar = oControl.getHeaderToolbar(),
			sHeaderClass;

		oRm.openStart("div");
		oRm.class("sapMPanelHeadingDiv");

		if (bIsStickyPanel) {
			oRm.class("sapMPanelStickyHeadingDiv");
		}

		if (!oHeaderTBar) {
			oRm.attr('role', 'heading');
			oRm.attr('aria-level', '2');
		}

		oRm.openEnd();

		if (bIsExpandable) {
			// we need a wrapping div around button and header
			// otherwise the border needed for both do not exact align
			oRm.openStart("div");
			if (oHeaderTBar) {
				sHeaderClass = "sapMPanelWrappingDivTb";
			} else {
				sHeaderClass = "sapMPanelWrappingDiv";
				this.writeHeaderAccessibility(oRm, oControl);
			}

			oRm.class(sHeaderClass);
			if (bIsExpanded) {
				oRm.class(sHeaderClass + "Expanded");
			}

			oRm.openEnd();

			if (bIsExpandable) {
				oRm.renderControl(oControl._oExpandButton);
			}
		}

		// render header
		var sHeaderText = oControl.getHeaderText();

		if (oHeaderTBar) {
			oHeaderTBar.setDesign(ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMPanelHeaderTB");
			oRm.renderControl(oHeaderTBar);

		} else if (sHeaderText || bIsExpandable) {
			oRm.openStart("div", oControl.getId() + "-header");
			oRm.class("sapMPanelHdr");
			oRm.openEnd();
			oRm.text(sHeaderText);
			oRm.close("div");
		}

		if (bIsExpandable) {
			oRm.close("div");
		}

		oRm.close("div");

		var oInfoTBar = oControl.getInfoToolbar();

		if (oInfoTBar) {
			// render infoBar
			oInfoTBar.setDesign(ToolbarDesign.Info, true);
			oInfoTBar.addStyleClass("sapMPanelInfoTB");

			if (bIsExpandable) {
				oRm.openStart("div");
				// use this class as marker class to ease selection later in onAfterRendering
				oRm.class("sapMPanelExpandablePart");
				oRm.openEnd();
				oRm.renderControl(oInfoTBar);
				oRm.close("div");
			} else {
				oRm.renderControl(oInfoTBar);
			}
		}
	};

	PanelRenderer.writeHeaderAccessibility = function (oRm, oControl) {
		oRm.attr('tabindex', 0);
		oRm.attr('role', 'button');
		oRm.attr('aria-expanded', oControl.getExpanded());
		oRm.attr('aria-controls', oControl.getId() + "-content");
	};

	PanelRenderer.renderContent = function (oRm, oControl) {
		this.startContent(oRm, oControl);

		this.renderChildren(oRm, oControl.getContent());

		this.endContent(oRm);
	};

	PanelRenderer.startContent = function (oRm, oControl) {
		oRm.openStart("div",  oControl.getId() + "-content");
		oRm.class("sapMPanelContent");
		oRm.class("sapMPanelBG" + oControl.getBackgroundDesign());

		if (oControl.getExpandable()) {
			// use this class as marker class to ease selection later in onAfterRendering
			oRm.class("sapMPanelExpandablePart");
		}

		if (Device.browser.firefox) {
			// ensure that the content is not included in the tab chain
			// this happens in FF, when we have a scrollable content
			oRm.attr('tabindex', '-1');
		}

		oRm.openEnd();
	};

	PanelRenderer.renderChildren = function (oRm, aChildren) {
		aChildren.forEach(oRm.renderControl, oRm);
	};

	PanelRenderer.endContent = function (oRm) {
		oRm.close("div");
	};

	PanelRenderer.endPanel = function (oRm) {
		oRm.close("div");
	};

	return PanelRenderer;

}, /* bExport= */ true);
