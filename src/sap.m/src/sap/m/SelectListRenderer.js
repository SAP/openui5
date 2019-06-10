/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Element", "sap/ui/core/Icon", "sap/ui/core/IconPool", "sap/ui/Device"],
	function(Element, Icon, IconPool, Device) {
		"use strict";

		/**
		 * SelectList renderer.
		 *
		 * @namespace
		 */
		var SelectListRenderer = {
			apiVersion: 2
		};

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

			if (mStates.elementData) {
				oRm.openStart("ul", oList);
			} else {
				oRm.openStart("ul");
			}

			oRm.class(CSS_CLASS);

			if (oList.getShowSecondaryValues()) {
				oRm.class(CSS_CLASS + "TableLayout");
			}

			if (!oList.getEnabled()) {
				oRm.class(CSS_CLASS + "Disabled");
			}

			oRm.style("width", oList.getWidth());
			oRm.style("max-width", oList.getMaxWidth());
			this.writeAccessibilityState(oRm, oList);
			oRm.openEnd();
		};

		SelectListRenderer.writeCloseListTag = function(oRm, oList) {
			oRm.close("ul");
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

			oRm.openStart("li", mStates.elementData ? oItem : null);

			if (oItem instanceof sap.ui.core.SeparatorItem) {
				oRm.class(CSS_CLASS + "SeparatorItem");

				if (bShowSecondaryValues) {
					oRm.class(CSS_CLASS + "Row");
				}
			} else {

				oRm.class(CSS_CLASS + "ItemBase");

				if (bShowSecondaryValues) {
					oRm.class(CSS_CLASS + "Row");
				} else {
					oRm.class(CSS_CLASS + "Item");
				}

				if (oItem.bVisible === false) {
					oRm.class(CSS_CLASS + "ItemBaseInvisible");
				}

				if (!bEnabled) {
					oRm.class(CSS_CLASS + "ItemBaseDisabled");
				}

				if (bEnabled && Device.system.desktop) {
					oRm.class(CSS_CLASS + "ItemBaseHoverable");
				}

				if (oItem === oSelectedItem) {
					oRm.class(CSS_CLASS + "ItemBaseSelected");
				}

				if (bEnabled) {
					oRm.attr("tabindex", "0");
				}
			}

			if (sTooltip) {
				oRm.attr("title", sTooltip);
			}

			this.writeItemAccessibilityState.apply(this, arguments);

			oRm.openEnd();

			if (bShowSecondaryValues) {

				oRm.openStart("span");
				oRm.class(CSS_CLASS + "Cell");
				oRm.class(CSS_CLASS + "FirstCell");
				oRm.attr("disabled", "disabled"); // fixes span obtaining focus in IE
				oRm.openEnd();

				this._renderIcon(oRm, oItem);

				oRm.text(oItem.getText());
				oRm.close("span");

				oRm.openStart("span");
				oRm.class(CSS_CLASS + "Cell");
				oRm.class(CSS_CLASS + "LastCell");
				oRm.attr("disabled", "disabled"); // fixes span obtaining focus in IE
				oRm.openEnd();

				if (typeof oItem.getAdditionalText === "function") {
					oRm.text(oItem.getAdditionalText());
				}

				oRm.close("span");
			} else {
				this._renderIcon(oRm, oItem);

				oRm.text(oItem.getText());
			}

			oRm.close("li");
		};

		/**
		 * Writes the accessibility state to the control's root element.
		 * To be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oList An object representation of the control that should be rendered.
		 */
		SelectListRenderer.writeAccessibilityState = function(oRm, oList) {
			oRm.accessibilityState(oList, {
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
			var sRole = (oItem.isA("sap.ui.core.SeparatorItem")) ? "separator" : "option";

			var sDesc;

			if (!oItem.getText() && oItem.getIcon && oItem.getIcon()) {
				var oIconInfo = IconPool.getIconInfo(oItem.getIcon());
				if (oIconInfo) {
					sDesc = oIconInfo.text || oIconInfo.name;
				}
			}

			oRm.accessibilityState(oItem, {
				role: sRole,
				selected: mStates.selected,
				setsize: mStates.setsize,
				posinset: mStates.posinset,
				label: sDesc
			});
		};

		SelectListRenderer._renderIcon = function(oRm, oItem) {
			if (oItem.getIcon && oItem.getIcon()) {
				oRm.icon(oItem.getIcon(), SelectListRenderer.CSS_CLASS + "ItemIcon", {
					id: oItem.getId() + "-icon"
				});
			}
		};

		return SelectListRenderer;

	}, /* bExport= */ true);