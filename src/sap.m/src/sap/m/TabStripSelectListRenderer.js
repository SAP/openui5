/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/m/SelectListRenderer', 'sap/m/TabStripSelectList', 'sap/m/TabStripItem'],
	function(jQuery, Renderer, SelectListRenderer, TabStripSelectList, TabStripItem) {
		"use strict";

		/**
		 * <code>TabStripSelectList</code> renderer.
		 *
		 * @namespace
		 */
		var TabStripSelectListRenderer = Renderer.extend(SelectListRenderer);

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}
		 *
		 * @param oRm {sap.ui.core.RenderManager} The RenderManager that can be used for writing to the render output buffer
		 * @param oList {sap.ui.core.Control} An object representation of the control that should be rendered
		 * @param oItem {sap.ui.core.Element} An object representation of the element that should be rendered
		 * @param mStates {object}
		 */
		TabStripSelectListRenderer.renderItem = function(oRm, oList, oItem, mStates) {
			if (!(oItem instanceof sap.ui.core.Element)) {
				return;
			}
			var bEnabled                = oItem.getEnabled(),
				oSelectedItem           = oList.getSelectedItem(),
				CSS_CLASS               = SelectListRenderer.CSS_CLASS,
				sTooltip                = oItem.getTooltip_AsString(),
				sStateClass             = ' ',
				oCloseButton;

			oCloseButton = oItem.getAggregation('_closeButton');
			if (sap.ui.Device.system.desktop) {
				oCloseButton.addStyleClass(TabStripItem.CSS_CLASS_CLOSE_BUTTON_INVISIBLE);
			}

			oRm.write("<li");
			oRm.writeElementData(oItem);
			if (oItem instanceof sap.ui.core.SeparatorItem) {
				oRm.addClass(CSS_CLASS + "SeparatorItem");
			} else {
				oRm.addClass(CSS_CLASS + "ItemBase");

				oRm.addClass(CSS_CLASS + "Item");

				if (oItem.bVisible === false) {
					oRm.addClass(CSS_CLASS + "ItemBaseInvisible");
				}
				if (!bEnabled) {
					oRm.addClass(CSS_CLASS + "ItemBaseDisabled");
				}
				if (bEnabled) {
					oRm.writeAttribute("tabindex", "0");
				}
				if (bEnabled && sap.ui.Device.system.desktop) {
					oRm.addClass(CSS_CLASS + "ItemBaseHoverable");
				}
				if (oItem === oSelectedItem) {
					oRm.addClass(CSS_CLASS + "ItemBaseSelected");
					oItem.getAggregation('_closeButton').removeStyleClass(TabStripItem.CSS_CLASS_CLOSE_BUTTON_INVISIBLE);
				}
			}
			oRm.writeClasses();
			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}
			this.writeItemAccessibilityState.apply(this, arguments);
			oRm.write(">");

			oRm.write('<p');
			oRm.writeAttribute('class', 'sapMSelectListItemText');
			oRm.write('>');

			// always show the full text on phone
			oRm.writeEscaped(oItem.getText().slice(0, (sap.ui.Device.system.phone ? oItem.getText().length : TabStripItem.DISPLAY_TEXT_MAX_LENGTH)));

			// add three dots "..." at the end if not the whole text is shown
			if (!sap.ui.Device.system.phone && oItem.getText().length > TabStripItem.DISPLAY_TEXT_MAX_LENGTH) {
				oRm.write('...');
			}
			oRm.write('</p>');

			if (!oItem.getProperty('modified')) {
				sStateClass += TabStripItem.CSS_CLASS_STATE_INVISIBLE;
			}

			oRm.write("<p class=\"sapMTabStripSelectListItemModified" + sStateClass + "\">*</p>");

			oRm.renderControl(oCloseButton);

			oRm.write("</li>");
		};

		return TabStripSelectListRenderer;

	}, /* bExport= */ true);
