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
		var bIsExpandable = oControl.getExpandable();

		oRm.openStart("div", oControl);
		oRm.class("sapMPanel");

		if (bIsExpandable) {
			oRm.class("sapMPanelExpandable");
		}

		oRm.style("width", oControl.getWidth());
		oRm.style("height", oControl.getHeight());
		oRm.accessibilityState(oControl, {
			role: oControl.getAccessibleRole().toLowerCase(),
			labelledby: oControl._getLabellingElementId()
		});
		oRm.openEnd();
	};

	PanelRenderer.renderHeader = function (oRm, oControl) {
		var bIsExpandable = oControl.getExpandable(),
			bIsExpanded = oControl.getExpanded(),
			oHeaderTBar = oControl.getHeaderToolbar(),
			sHeaderClass;

		if (bIsExpandable) {
			// we need a wrapping div around button and header
			// otherwise the border needed for both do not exact align
			oRm.openStart("header");
			if (oHeaderTBar) {
				sHeaderClass = "sapMPanelWrappingDivTb";
			} else {
				sHeaderClass = "sapMPanelWrappingDiv";
			}

			oRm.class(sHeaderClass);
			if (bIsExpanded) {
				oRm.class(sHeaderClass + "Expanded");
			}

			oRm.openEnd();

			var oButton = oControl._getButton();

			oControl._toggleButtonIcon(bIsExpanded);

			oRm.renderControl(oButton);
		}

		// render header
		var sHeaderText = oControl.getHeaderText();

		if (oHeaderTBar) {
			oHeaderTBar.setDesign(ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMPanelHeaderTB");
			oRm.renderControl(oHeaderTBar);

		} else if (sHeaderText || bIsExpandable) {
			oRm.openStart("h2", oControl.getId() + "-header");
			oRm.class("sapMPanelHdr");
			oRm.openEnd();
			oRm.text(sHeaderText);
			oRm.close("h2");
		}

		if (bIsExpandable) {
			oRm.close("header");
		}

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
