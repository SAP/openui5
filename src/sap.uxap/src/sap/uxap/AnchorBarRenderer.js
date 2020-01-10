/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ToolbarRenderer", "sap/ui/core/Renderer", "sap/m/BarInPageEnabler", "./library"],
	function (ToolbarRenderer, Renderer, BarInPageEnabler, library) {
		"use strict";

		/**
		 * @class ObjectPageRenderer renderer.
		 * @static
		 */
		var AnchorBarRenderer = Renderer.extend(ToolbarRenderer);

		AnchorBarRenderer.apiVersion = 2;

		var _AnchorBarHierarchicalSelectMode = AnchorBarRenderer._AnchorBarHierarchicalSelectMode = {
			Icon: "icon",
			Text: "text"
		};

		AnchorBarRenderer.renderBarContent = function (rm, oToolbar) {
			if (oToolbar._bHasButtonsBar) {

				rm.renderControl(oToolbar._getScrollArrowLeft());

				rm.openStart("div", oToolbar.getId() + "-scrollContainer");
				if (oToolbar._bHideScrollContainer) {
					rm.style("display", "none");
				}
				// ARIA attributes
				rm.attr("aria-label", sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("ANCHOR_BAR_LABEL"))
					.class("sapUxAPAnchorBarScrollContainer")
					.openEnd();

				rm.openStart("div", oToolbar.getId() + "-scroll")
					.attr("role", "menubar")
					.openEnd();

				if (!oToolbar._bHideScrollContainer) {
					AnchorBarRenderer.renderBarItems(rm, oToolbar);
				}

				rm.close("div");

				rm.close("div");

				rm.renderControl(oToolbar._getScrollArrowRight());
			}

			BarInPageEnabler.addChildClassTo(oToolbar._oSelect, oToolbar);
			rm.renderControl(oToolbar._oSelect);
		};

		AnchorBarRenderer.renderBarItems = function (rm, oToolbar) {

			var sSelectedItemId = oToolbar.getSelectedButton();
			oToolbar.getContent().forEach(function(oControl) {
				BarInPageEnabler.addChildClassTo(oControl, oToolbar);
				if (oControl.getId() === sSelectedItemId) {
					oControl.addStyleClass("sapUxAPAnchorBarButtonSelected");
				}
				rm.renderControl(oControl);
			});
		};

		AnchorBarRenderer.decorateRootElement = function (rm, oToolbar) {
			ToolbarRenderer.decorateRootElement.apply(this, arguments);
			if (oToolbar._sHierarchicalSelectMode === _AnchorBarHierarchicalSelectMode.Icon) {
				rm.class("sapUxAPAnchorBarOverflow");
			}

			if (oToolbar.getBackgroundDesign()) {
				rm.class("sapUxAPAnchorBar" + oToolbar.getBackgroundDesign());
			}
		};

		return AnchorBarRenderer;

	}, /* bExport= */ true);
