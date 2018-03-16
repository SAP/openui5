/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Element", "sap/ui/Device"],
	function(Element, Device) {
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
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.render = function(oRm, oList) {
			this.writeOpenListTag(oRm, oList, { elementData: true });
			this.renderItems(oRm, oList);
			this.writeCloseListTag(oRm, oList);
		};

		SelectListRenderer.writeOpenListTag = function(oRm, oList, mStates) {
			var CSS_CLASS = SelectListRenderer.CSS_CLASS;

			oRm.write("<ul");
			if (mStates.elementData) {
				oRm.writeControlData(oList);
			}
			oRm.addClass(CSS_CLASS);

			if (oList.getShowSecondaryValues()) {
				oRm.addClass(CSS_CLASS + "TableLayout");
			}

			if (!oList.getEnabled()) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			oRm.addStyle("width", oList.getWidth());
			oRm.addStyle("max-width", oList.getMaxWidth());
			oRm.writeStyles();
			oRm.writeClasses();
			this.writeAccessibilityState(oRm, oList);
			oRm.write(">");
		};

		SelectListRenderer.writeCloseListTag = function(oRm, oList) {
			oRm.write("</ul>");
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.renderItems = function(oRm, oList) {
			var iSize = oList._getNonSeparatorItemsCount(),
				aItems = oList.getItems(),
				oSelectedItem = oList.getSelectedItem(),
				iCurrentPosInSet = 1,
				oItemStates;

			for (var i = 0; i < aItems.length; i++) {
				oItemStates = {
					selected: oSelectedItem === aItems[i],
					setsize: iSize,
					elementData: true
				};

				if (!(aItems[i] instanceof sap.ui.core.SeparatorItem)) {
					oItemStates.posinset = iCurrentPosInSet++;
				}

				this.renderItem(oRm, oList, aItems[i], oItemStates);
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

			if (!(oItem instanceof Element)) {
				return;
			}

			var bEnabled = oItem.getEnabled(),
				oSelectedItem = oList.getSelectedItem(),
				CSS_CLASS = SelectListRenderer.CSS_CLASS,
				sTooltip = oItem.getTooltip_AsString(),
				bShowSecondaryValues = oList.getShowSecondaryValues();

			oRm.write("<li");

			if (mStates.elementData) {
				oRm.writeElementData(oItem);
			}

			if (oItem instanceof sap.ui.core.SeparatorItem) {
				oRm.addClass(CSS_CLASS + "SeparatorItem");

				if (bShowSecondaryValues) {
					oRm.addClass(CSS_CLASS + "Row");
				}
			} else {

				oRm.addClass(CSS_CLASS + "ItemBase");

				if (bShowSecondaryValues) {
					oRm.addClass(CSS_CLASS + "Row");
				} else {
					oRm.addClass(CSS_CLASS + "Item");
				}

				if (oItem.bVisible === false) {
					oRm.addClass(CSS_CLASS + "ItemBaseInvisible");
				}

				if (!bEnabled) {
					oRm.addClass(CSS_CLASS + "ItemBaseDisabled");
				}

				if (bEnabled && Device.system.desktop) {
					oRm.addClass(CSS_CLASS + "ItemBaseHoverable");
				}

				if (oItem === oSelectedItem) {
					oRm.addClass(CSS_CLASS + "ItemBaseSelected");
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

			if (bShowSecondaryValues) {

				oRm.write("<span");
				oRm.addClass(CSS_CLASS + "Cell");
				oRm.addClass(CSS_CLASS + "FirstCell");
				oRm.writeClasses();
				oRm.writeAttribute("disabled", "disabled"); // fixes span obtaining focus in IE
				oRm.write(">");
				oRm.writeEscaped(oItem.getText());
				oRm.write("</span>");

				oRm.write("<span");
				oRm.addClass(CSS_CLASS + "Cell");
				oRm.addClass(CSS_CLASS + "LastCell");
				oRm.writeClasses();
				oRm.writeAttribute("disabled", "disabled"); // fixes span obtaining focus in IE
				oRm.write(">");

				if (typeof oItem.getAdditionalText === "function") {
					oRm.writeEscaped(oItem.getAdditionalText());
				}

				oRm.write("</span>");
			} else {
				oRm.writeEscaped(oItem.getText());
			}

			oRm.write("</li>");
		};

		/**
		 * Writes the accessibility state to the control's root element.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.writeAccessibilityState = function(oRm, oList) {
			oRm.writeAccessibilityState(oList, {
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