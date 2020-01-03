/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * TimePickerSlider renderer.
		 * @namespace
		 */
		var TimePickerSliderRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for a {@link sap.m.TimePickerSlider}, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		TimePickerSliderRenderer.render = function(oRm, oControl) {
			var iIndex,
				iRepetition,
				nContentRepetitions = oControl._getContentRepeat(),
				aItems = oControl.getItems(),
				sControlLabel = oControl.getLabel();

			oRm.openStart("div", oControl);
			oRm.attr("tabindex", "0");

			oRm.class("sapMTPColumn");
			if (oControl.getIsExpanded()) {
				oRm.class("sapMTPSliderExpanded");
			}
			if (!oControl.getIsCyclic()) {
				oRm.class("sapMTimePickerSliderShort");
			}
			if (!oControl._getEnabled()) {
				oRm.class("sapMTPDisabled");
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
			oRm.class("sapMTimePickerLabel");
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
			oRm.class("sapMTimePickerItemArrows");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_arrowUp"));
			oRm.close("div");

			oRm.openStart("div");
			oRm.class("sapMTimePickerSlider");
			TimePickerSliderRenderer.addItemValuesCssClass(oRm, oControl);
			oRm.attr("unselectable", "on");
			oRm.openEnd();

			//render selection frame, same height - border height
			oRm.openStart("div");
			oRm.class("sapMTPPickerSelectionFrame");
			oRm.openEnd();
			oRm.close("div");

			oRm.openStart("ul", oControl.getId() + "-content");
			oRm.attr("unselectable", "on");
			oRm.openEnd();

			for (iRepetition = 1; iRepetition <= nContentRepetitions; iRepetition++) {
				for (iIndex = 0; iIndex < aItems.length; iIndex++) {
					//unselectable for IE9
					oRm.openStart("li");

					oRm.class("sapMTimePickerItem");
					if (!aItems[iIndex].getVisible()) {
						oRm.class("TPSliderItemHidden");
					}

					//WAI-ARIA region
					oRm.accessibilityState(oControl);
					oRm.attr("unselectable", "on");

					oRm.openEnd();
					oRm.text(aItems[iIndex].getText());
					oRm.close("li");
				}
			}
			oRm.close("ul");

			oRm.close("div");

			//arrow down
			oRm.openStart("div");
			oRm.class("sapMTimePickerItemArrows");
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
		TimePickerSliderRenderer.addItemValuesCssClass = function(oRm, oControl) {
			var iVisibleItemsLength = oControl.getItems().filter(function(item) {
				return item.getVisible();
			}).length;

			if (iVisibleItemsLength > 2 && iVisibleItemsLength < 13) {
				oRm.class("SliderValues" + iVisibleItemsLength.toString());
			}
		};

		return TimePickerSliderRenderer;
	});