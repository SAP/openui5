/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ToolbarRenderer", "sap/ui/core/Renderer", "sap/m/BarInPageEnabler", "./library"],
	function (ToolbarRenderer, Renderer, BarInPageEnabler, library) {
		"use strict";

		/**
		 * ObjectPageRenderer renderer.
		 * @namespace
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
				// ARIA attributes
				rm.class("sapUxAPAnchorBarScrollContainer")
					.openEnd();

				rm.openStart("div", oToolbar.getId() + "-scroll")
					.attr("role", "listbox")
					.attr("aria-describedby", oToolbar.getId() + "-desc")
					.attr("aria-label", sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("ANCHOR_BAR_ARIA_LABEL"))
					.openEnd();

				AnchorBarRenderer.renderBarItems(rm, oToolbar);

				rm.close("div");

				rm.openStart("span", oToolbar.getId() + "-desc")
					.class("sapUiPseudoInvisibleText")
					.openEnd();
				rm.text(sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("ANCHOR_BAR_ARIA_LABEL_DESC"));
				rm.close("span");

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
