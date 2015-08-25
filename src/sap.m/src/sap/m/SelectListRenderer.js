/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		/**
		 * SelectList renderer.
		 *
		 * @namespace
		 */
		var SelectListRenderer = {};

		/**
		 * CSS class to be applied to the  root element of the SelectList.
		 *
		 * @readonly
		 * @const {string}
		 */
		SelectListRenderer.CSS_CLASS = "sapMSelectList";

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oSelectList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.render = function(oRm, oList) {
			var CSS_CLASS = SelectListRenderer.CSS_CLASS;

			oRm.write("<ul");
			oRm.writeControlData(oList);
			oRm.addClass(CSS_CLASS);

			if (!oList.getEnabled()) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			oRm.addStyle("width", oList.getWidth());
			oRm.addStyle("max-width", oList.getMaxWidth());
			oRm.writeStyles();
			oRm.writeClasses();
			this.writeAccessibilityState(oRm, oList);
			oRm.write(">");
			this.renderItems(oRm, oList);
			oRm.write("</ul>");
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.renderItems = function(oRm, oList) {
			var iSize = oList.getItems().length,
				oSelectedItem = oList.getSelectedItem();

			for (var i = 0, aItems = oList.getItems(); i < aItems.length; i++) {
				this.renderItem(oRm, oList, aItems[i], {
					selected: oSelectedItem === aItems[i],
					setsize: iSize,
					posinset: i + 1
				});
			}
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 * @param {sap.ui.core.Element} oItem An object representation of the element that should be rendered.
		 * @param {object} mStates
		 */
		SelectListRenderer.renderItem = function(oRm, oList, oItem, mStates) {
			var bEnabled = oItem.getEnabled(),
				oSelectedItem = oList.getSelectedItem(),
				CSS_CLASS = SelectListRenderer.CSS_CLASS,
				sTooltip = oItem.getTooltip_AsString();

			if (oItem instanceof sap.ui.core.Element) {
				oRm.write("<li");
				oRm.writeElementData(oItem);

				if (oItem instanceof sap.ui.core.SeparatorItem) {
					oRm.addClass(CSS_CLASS + "SeparatorItem");
				} else {
					oRm.addClass(CSS_CLASS + "Item");

					if (oItem.bVisible === false) {
						oRm.addClass(CSS_CLASS + "ItemInvisible");
					}

					if (!bEnabled) {
						oRm.addClass(CSS_CLASS + "ItemDisabled");
					}

					if (bEnabled && sap.ui.Device.system.desktop) {
						oRm.addClass(CSS_CLASS + "ItemHoverable");
					}

					if (oItem === oSelectedItem) {
						oRm.addClass(CSS_CLASS + "ItemSelected");
					}

					if (bEnabled) {
						oRm.writeAttribute("tabindex", "0");
					}
				}

				oRm.writeClasses();

				if (sTooltip) {
					oRm.writeAttributeEscaped("title", sTooltip);
				}

				this.writeItemAccessibilityState.apply(this, arguments);

				oRm.write(">");
				oRm.writeEscaped(oItem.getText());
				oRm.write("</li>");
			}
		};

		/**
		 * Writes the accessibility state to the control's root element.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.writeAccessibilityState = function(oRm, oList) {
			oRm.writeAccessibilityState({
				role: "listbox"
			});
		};

		/**
		 * Writes the accessibility state to the item.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 * @param {sap.ui.core.Element} oItem An object representation of the element that should be rendered.
		 * @param {object} mStates
		 */
		SelectListRenderer.writeItemAccessibilityState = function(oRm, oList, oItem, mStates) {
			var sRole = (oItem instanceof sap.ui.core.SeparatorItem) ? "separator" : "option";

			oRm.writeAccessibilityState(oItem, {
				role: sRole,
				selected: mStates.selected,
				setsize: mStates.setsize,
				posinset: mStates.posinset
			});
		};

		return SelectListRenderer;

	}, /* bExport= */ true);