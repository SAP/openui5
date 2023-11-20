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

		var CLOCK_ANGLE_STEP = 6;

		/**
		 * Renders the HTML for a {@link sap.m.TimePickerClock}, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
		 * @param {sap.m.TimePickerClock} oControl An object representation of the control that should be rendered
		 */
		TimePickerClockRenderer.render = function(oRm, oControl) {
			var	iReplacement = oControl.getLastItemReplacement(),
				iDisplayStep = oControl.getDisplayStep(),
				iValueStep = oControl.getValueStep(),
				bFractions = oControl.getFractions(),
				bInnerItems = oControl.getInnerItems(),
				sLabel = oControl.getLabel(),
				bLastReplacement = iReplacement !== -1 ? true : false,
				iItemMin = oControl.getItemMin(),
				iItemMax = oControl.getItemMax(),
				iSelectedValue = oControl.getSelectedValue(),
				bSelectedOuter = (iSelectedValue >= iItemMin && iSelectedValue <= iItemMax) || (!bInnerItems && iSelectedValue === iReplacement),
				bSelectedInner = ((iSelectedValue >= iItemMin + iItemMax && iSelectedValue < iItemMax * 2) || iSelectedValue === iReplacement) && bInnerItems,
				aValues = [],
				aInnerValues = [],
				iItemStep,
				iIndex,
				iValueIndex;

			// prepare values except the last one
			for (iIndex = iItemMin; iIndex <= iItemMax - 1; iIndex++) {
				aValues.push(iIndex);
				if (bInnerItems) {
					aInnerValues.push(iIndex + iItemMax);
				}
			}

			// prepare last value
			aValues.push(bLastReplacement && !bInnerItems ? iReplacement : iItemMax);
			if (bInnerItems) {
				aInnerValues.push(bLastReplacement ? iReplacement.toString().padStart(2, "0") : oControl._getMaxValue());
			}

			// determines angle step for values display
			iItemStep = 360 / CLOCK_ANGLE_STEP / aValues.length;
			// determines step for values display in units
			if (iValueStep * iItemStep > iDisplayStep) {
				iDisplayStep = iValueStep * iItemStep;
			}

			// output clock body
			oRm.openStart("div", oControl.getId()); // clock wrapper
			oRm.class("sapMTPClock");
			if (bInnerItems) {
				oRm.class("sapMTPCInner");
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
			oRm.openEnd();

			// output items
			for (iIndex = 1; iIndex <= 60; iIndex++) {
				oRm.openStart("div"); // item wrapper
				oRm.class("sapMTPCItem");
				oRm.class("sapMTPCDeg" + (iIndex * CLOCK_ANGLE_STEP));

				iValueIndex = iIndex / iItemStep - 1;

				oRm.openEnd();

				if (iIndex % iDisplayStep !== 0) {
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

					oRm.openStart("span", oControl.getId() + "-" + (iValueIndex + 1)); // item number
					oRm.class("sapMTPCNumber");
					oRm.openEnd();
					// put number here
					oRm.text(aValues[iValueIndex]);
					oRm.close('span');

					if (bInnerItems) {
						oRm.openStart("span", oControl.getId() + "-" + (iValueIndex + iItemMax + 1)); // inner item number
						oRm.class("sapMTPCNumber");
						if (iValueIndex === 11 && (iSelectedValue === 0 || iSelectedValue === 24) && oControl.getSupport2400() && oControl._selectToggledElement) {
							oRm.class("sapMTPCSelected");
						}
						oRm.openEnd();
						// put number here
						oRm.text(aInnerValues[iValueIndex]);
						oRm.close('span');
					}
				}
				oRm.close('div'); // item wrapper close
			}

			oRm.close("div"); // clock items list wrapper close

			// output selection marker
			if (bSelectedOuter || bSelectedInner) {

				if (iSelectedValue === 0) {
					iSelectedValue = oControl._getMaxValue();
				}
				iValueIndex = iSelectedValue - 1;
				oRm.openStart("div");
				oRm.class("sapMTPCItem");
				iIndex = bSelectedInner ? iSelectedValue - iItemMax : iSelectedValue;
				oRm.class("sapMTPCDeg" + iIndex * CLOCK_ANGLE_STEP * iItemStep);
				oRm.openEnd();

				oRm.openStart("div"); // item dot
				oRm.class("sapMTPCMarker");
				oRm.openEnd();
				oRm.close('div');

				oRm.openStart("div"); // item number outer
				oRm.class("sapMTPCNumber");
				if (bSelectedOuter) {
					oRm.class("sapMTPCSelected");
					oRm.attr("id", oControl.getId() + "-selected");
				} else {
					oRm.class("sapMTPCInvisible");
				}
				oRm.openEnd();
				oRm.text(aValues[iValueIndex]);
				oRm.close('div');

				if (bSelectedInner) {
					oRm.openStart("div", oControl.getId() + "-selected"); // item number inner (if necessary)
					oRm.class("sapMTPCNumber");
					oRm.class("sapMTPCSelected");
					oRm.openEnd();
					oRm.text(aInnerValues[iValueIndex - iItemMax]);
					oRm.close('div');
				}

				oRm.close("div"); // selection marker close

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