/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * WheelSlider renderer.
		 * @namespace
		 */
		var WheelSliderRenderer = {
			apiVersion: 2
		};

		var iItemsOffset = 60;

		/**
		 * Renders the HTML for a {@link sap.m.WheelSlider}, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		WheelSliderRenderer.render = function(oRm, oControl) {
			var iIndex,
				aItems = oControl.getItems(),
				sControlLabel = oControl.getLabel();

			oRm.openStart("div", oControl);
			oRm.attr("tabindex", "0");

			oRm.class("sapMWS");
			if (oControl.getIsExpanded()) {
				oRm.class("sapMWSExpanded");
			}
			if (!oControl.getIsCyclic()) {
				oRm.class("sapMWSShort");
			}

			//WAI-ARIA region
			oRm.accessibilityState(oControl, {
				role: "list",
				labelledby: {
					value: oControl.getId() + "-label",
					append: true
				},
				describedby: {
					value: oControl.getId() + "-valDescription",
					append: true
				}
			});

			oRm.openEnd();

			//Title label of the slider
			oRm.openStart("div", oControl.getId() + "-label");
			oRm.class("sapMWSLabel");
			oRm.openEnd();
			oRm.text(sControlLabel);
			oRm.close("div");

			oRm.openStart("div", oControl.getId() + "-valDescription");
			oRm.attr('aria-hidden', 'false');
			oRm.attr('aria-live', 'assertive');
			oRm.class("sapUiInvisibleText");
			oRm.openEnd();
			oRm.close("div");

			oRm.openStart("div");
			oRm.class("sapMWSArrows");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_arrowUp"));
			oRm.close("div");

			oRm.openStart("div");
			oRm.class("sapMWSInner");
			WheelSliderRenderer.addItemValuesCssClass(oRm, oControl);
			oRm.attr("unselectable", "on");
			oRm.openEnd();

			//render selection frame, same height - border height
			oRm.openStart("div");
			oRm.class("sapMWSSelectionFrame");
			oRm.openEnd();
			oRm.close("div");

			oRm.openStart("ul", oControl.getId() + "-content");
			oRm.attr("unselectable", "on");
			if (oControl._marginTop) {
				oRm.style("margin-top", oControl._marginTop + "px");
			}
			if (oControl._marginBottom) {
				oRm.style("margin-bottom", oControl._marginBottom + "px");
			}
			oRm.openEnd();

			if (aItems.length) {
				var iSelectedItemIndex = oControl.getSelectedItemIndex();
				var iMinIndex = oControl.getIsCyclic() ? iSelectedItemIndex - iItemsOffset : Math.max(iSelectedItemIndex - iItemsOffset, 0);
				var iMaxIndex = oControl.getIsCyclic() ? iSelectedItemIndex + iItemsOffset : Math.min(iSelectedItemIndex + iItemsOffset, aItems.length - 1);
				oControl.iPreviousMiddle = iSelectedItemIndex;
				oControl.iMinIndex = iMinIndex;
				oControl.iMaxIndex = iMaxIndex;
				for (iIndex = iMinIndex; iIndex <= iMaxIndex; iIndex++) {
					var iCurrentIndex = iIndex;
					while (iCurrentIndex < 0) {
						iCurrentIndex += aItems.length;
					}
					while (iCurrentIndex >= aItems.length) {
						iCurrentIndex -= aItems.length;
					}

					//unselectable for IE9
					oRm.openStart("li");

					oRm.attr("data-sap-ui-index", iCurrentIndex);

					oRm.class("sapMWSItem");

					//WAI-ARIA region
					oRm.accessibilityState(oControl);
					oRm.attr("unselectable", "on");

					oRm.openEnd();
					oRm.text(aItems[iCurrentIndex].getText());
					oRm.close("li");
				}
			}
			oRm.close("ul");

			oRm.close("div");

			//arrow down
			oRm.openStart("div");
			oRm.class("sapMWSArrows");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_arrowDown"));
			oRm.close("div");

			oRm.close("div");
		};

		/**
		 * Adds a class to the current element in the RenderManager's buffer based on the number of visible items in the slider.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 * @protected
		 */
		WheelSliderRenderer.addItemValuesCssClass = function(oRm, oControl) {
			var iVisibleItemsLength = oControl.getItems().length;

			if (iVisibleItemsLength > 2 && iVisibleItemsLength < 13) {
				oRm.class("SliderValues" + iVisibleItemsLength.toString());
			}
		};

		return WheelSliderRenderer;
	});