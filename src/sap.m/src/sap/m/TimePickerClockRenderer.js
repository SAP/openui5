/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
		"use strict";

		/**
		 * TimePickerClock renderer.
		 * @namespace
		 */
		var TimePickerClockRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for a {@link sap.m.TimePickerClock}, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePickerClock} oControl An object representation of the control that should be rendered
		 */
		TimePickerClockRenderer.render = function(oRm, oControl) {
			var	iReplacement = oControl.getLastItemReplacement(),
				iDisplayStep = oControl.getDisplayStep(),
				iAngleStep = oControl._getAngleStep(),
				iVisualItemsCount = 360 / iAngleStep,
				iMultiplier = iVisualItemsCount / oControl._getItemsCount(),
				bFractions = true,
				sLabel = oControl.getLabel(),
				bLastReplacement = iReplacement !== -1 ? true : false,
				iItemMin = oControl.getItemMin(),
				iItemMax = oControl.getItemMax(),
				iSelectedValue = oControl.getSelectedValue(),
				iHoveredValue = oControl.getHoveredValue(),
				bSelectedItem = (iSelectedValue >= iItemMin && iSelectedValue <= iItemMax) || (iSelectedValue === iReplacement),
				bHoveredItem = iHoveredValue !== -1,
				aValues = [],
				iItemStep,
				iIndex,
				iValueIndex;

			// prepare values except the last one
			for (iIndex = iItemMin; iIndex <= iItemMax - 1; iIndex++) {
				if (iIndex % iDisplayStep === 0) {
					aValues.push(iIndex);
				}
			}

			// prepare last value
			aValues.push(bLastReplacement ? iReplacement : iItemMax);

			// determines angle step for values display
			iItemStep = 360 / aValues.length;

			// output clock body
			oRm.openStart("div", oControl.getId()); // clock wrapper
			oRm.class("sapMTPClock");

			if (oControl.getSkipAnimation()) {
				oRm.class("sapMTPCSkipAnimation");
			}
			if (oControl.getFadeIn()) {
				oRm.class("sapMTPCFadeIn");
			}
			if (oControl.getFadeOut()) {
				oRm.class("sapMTPCFadeOut");
			}

			oRm.attr("ondragstart", "return false;");
			oRm.attr("ondrop", "return false;");
			oRm.attr("aria-hidden", "true");
			oRm.openEnd();

			oRm.openStart("div"); // clock dial
			oRm.class("sapMTPCDial");
			oRm.attr("data-label", sLabel);
			oRm.openEnd();
			oRm.close("div");

			oRm.openStart("div"); // clock items list wrapper
			oRm.class("sapMTPCItems");
			oRm.openEnd();

			// output items
			for (iIndex = 1; iIndex <= iVisualItemsCount; iIndex++) {
				oRm.openStart("div"); // item wrapper
				oRm.class("sapMTPCItem");
				oRm.class("sapMTPCDeg" + (iIndex * oControl._getAngleStep()));

				iValueIndex = iIndex / (iDisplayStep * iMultiplier) - 1;

				oRm.openEnd();

				if (iIndex % (iDisplayStep * iMultiplier) !== 0) {
					if (bFractions) {
						// output fraction dot
						oRm.openStart("span");
						oRm.class("sapMTPCMidDot");
						oRm.openEnd();
						oRm.close('span');
					}
				} else {
					// output item
					oRm.openStart("span"); // item dot
					oRm.class("sapMTPCDot");
					oRm.openEnd();
					oRm.close('span');

					oRm.openStart("span", oControl.getId() + "-" + (aValues[iValueIndex])); // item number
					oRm.class("sapMTPCNumber");
					oRm.openEnd();
					// put number here
					oRm.text(aValues[iValueIndex]);
					oRm.close('span');
				}
				oRm.close('div'); // item wrapper close
			}

			oRm.close("div"); // clock items list wrapper close

			// output selection marker
			if (bSelectedItem) {
				if (iReplacement !== -1 && iSelectedValue === iReplacement) {
					iSelectedValue = iItemMax;
				}

				oRm.openStart("div");
				oRm.class("sapMTPCSelectedItem");
				oRm.class("sapMTPCItem");
				oRm.class("sapMTPCDeg" + iSelectedValue * (iItemMax === 12 ? iItemStep : iAngleStep));
				oRm.openEnd();

				oRm.openStart("div"); // item dot
				oRm.class("sapMTPCMarker");
				oRm.openEnd();
				oRm.close('div');

				oRm.openStart("div"); // item number outer
				oRm.class("sapMTPCNumber");
				oRm.class("sapMTPCSelected");
				oRm.attr("id", oControl.getId() + "-selected");
				oRm.openEnd();
				oRm.text(iSelectedValue === iItemMax && iReplacement !== -1 ? iReplacement : iSelectedValue);
				oRm.close('div');

				oRm.close("div"); // selection marker close
			}

			// output hover marker
			if (bHoveredItem) {
				if (iReplacement !== -1 && iHoveredValue === iReplacement) {
					iHoveredValue = iItemMax;
				}

				iIndex = iHoveredValue * (iItemMax === 12 ? iItemStep : iAngleStep);
				if (iIndex === 0) {
					iIndex = 360;
				}

				oRm.openStart("div");
				oRm.class("sapMTPCHoveredItem");
				oRm.class("sapMTPCItem");
				oRm.class("sapMTPCDeg" + iIndex);
				oRm.openEnd();

				oRm.openStart("div"); // item dot
				oRm.class("sapMTPCHoverMarker");
				oRm.openEnd();
				oRm.close('div');

				oRm.openStart("div"); // item number outer
				oRm.class("sapMTPCNumber");
				oRm.class("sapMTPCHovered");
				oRm.attr("id", oControl.getId() + "-hovered");
				oRm.openEnd();
				oRm.text(iHoveredValue === iItemMax && iReplacement !== -1 ? iReplacement : iHoveredValue);
				oRm.close('div');

				oRm.close("div"); // hover marker close
			}

			// output clock cover
			oRm.openStart("div", oControl.getId() + "-cover");
			oRm.class("sapMTPClockCover");
			oRm.openEnd();
			oRm.close("div");

			oRm.close("div"); // clock wrapper close
		};

		return TimePickerClockRenderer;
	});