/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/ToolbarRenderer", "sap/ui/core/Renderer", "sap/m/BarInPageEnabler", "./AnchorBar", "./library"],
	function (ToolbarRenderer, Renderer, BarInPageEnabler, AnchorBar, library) {
		"use strict";

		/**
		 * @class ObjectPageRenderer renderer.
		 * @static
		 */
		var AnchorBarRenderer = Renderer.extend(ToolbarRenderer);
		AnchorBarRenderer.renderBarContent = function (rm, oToolbar) {
			if (oToolbar._bHasButtonsBar) {

				rm.renderControl(oToolbar._getScrollArrowLeft());

				rm.write("<div");
				rm.writeAttributeEscaped("id", oToolbar.getId() + "-scrollContainer");
				// ARIA attributes
				rm.writeAttributeEscaped("aria-label", library.i18nModel.getResourceBundle().getText("ANCHOR_BAR_LABEL"));
				//
				rm.addClass("sapUxAPAnchorBarScrollContainer");
				rm.writeClasses();
				rm.write(">");

				rm.write("<div");
				rm.writeAttributeEscaped("id", oToolbar.getId() + "-scroll");
				rm.writeAttributeEscaped("role", "menu");
				rm.write(">");

				AnchorBarRenderer.renderBarItems(rm, oToolbar);

				rm.write("</div>");

				rm.write("</div>");

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
			if (oToolbar._sHierarchicalSelectMode === AnchorBar._hierarchicalSelectModes.Icon) {
				rm.addClass("sapUxAPAnchorBarOverflow");
			}
		};

		return AnchorBarRenderer;

	}, /* bExport= */ true);
