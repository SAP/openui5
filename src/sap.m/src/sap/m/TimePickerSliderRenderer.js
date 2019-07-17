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

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeAttribute("tabindex", "0");

			oRm.addClass("sapMTPColumn");
			if (oControl.getIsExpanded()) {
				oRm.addClass("sapMTPSliderExpanded");
			}
			if (!oControl.getIsCyclic()) {
				oRm.addClass("sapMTimePickerSliderShort");
			}
			if (!oControl._getEnabled()) {
				oRm.addClass("sapMTPDisabled");
			}
			oRm.writeClasses();

			//WAI-ARIA region
			oRm.writeAccessibilityState(oControl, {
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

			oRm.write(">");

			//Title label of the slider
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-label");
			oRm.addClass("sapMTimePickerLabel");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sControlLabel);
			oRm.write("</div>");

			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-valDescription");
			oRm.writeAttribute('aria-hidden', 'false');
			oRm.writeAttribute('aria-live', 'assertive');
			oRm.addClass("sapUiInvisibleText");
			oRm.writeClasses();
			oRm.write("></div>");

			oRm.write("<div class='sapMTimePickerItemArrows'>");
			oRm.renderControl(oControl.getAggregation("_arrowUp"));
			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass("sapMTimePickerSlider");
			TimePickerSliderRenderer.addItemValuesCssClass(oRm, oControl);
			oRm.writeClasses();

			oRm.writeAttribute("unselectable", "on");
			oRm.writeStyles();
			oRm.write(">");

			//render selection frame, same height - border height
			oRm.write("<div class=\"sapMTPPickerSelectionFrame\"></div>");

			oRm.write("<ul");
			oRm.writeAttribute("id", oControl.getId() + "-content");
			oRm.writeAttribute("unselectable", "on");
			oRm.write(">");

			for (iRepetition = 1; iRepetition <= nContentRepetitions; iRepetition++) {
				for (iIndex = 0; iIndex < aItems.length; iIndex++) {
					//unselectable for IE9
					oRm.write("<li");

					oRm.addClass("sapMTimePickerItem");
					if (!aItems[iIndex].getVisible()) {
						oRm.addClass("TPSliderItemHidden");
					}
					oRm.writeClasses();

					//WAI-ARIA region
					oRm.writeAccessibilityState(oControl);
					oRm.writeAttribute("unselectable", "on");

					oRm.write(">");
					oRm.writeEscaped(aItems[iIndex].getText());
					oRm.write("</li>");
				}
			}
			oRm.write("</ul>");

			oRm.write("</div>");

			//arrow down
			oRm.write("<div class='sapMTimePickerItemArrows'>");
			oRm.renderControl(oControl.getAggregation("_arrowDown"));
			oRm.write("</div>");

			oRm.write("</div>");
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
				oRm.addClass("SliderValues" + iVisibleItemsLength.toString());
			}
		};

		return TimePickerSliderRenderer;
	}, /* bExport= */ false);
