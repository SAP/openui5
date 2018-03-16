/*!
 * ${copyright}
 */

sap.ui.define([
		'./library',
		'sap/ui/core/Element'
	],
	function (library, Element) {
		"use strict";

		/**
		 * Constructor for a new <code>ResponsiveScale</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <strong><i>Overview</i></strong>
		 *
		 * A {@link sap.m.Slider} element represents a scale with tickmarks and labels.
		 * The purpose of the element is to decouple the scale logic from other controls i.e. Slider / RangeSlider
		 *
		 *
		 * The most important properties of the ResponsiveScale are:
		 * <ul>
		 * <li> tickmarksBetweenLabels - Puts a label on every N-th tickmark.</li>
		 * </ul>
		 *
		 *
		 * @extends sap.ui.core.Element
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.46
		 * @alias sap.m.ResponsiveScale
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Scale = Element.extend("sap.m.ResponsiveScale", {
			metadata: {
				interfaces: [
					"sap.m.IScale"
				],
				library: "sap.m",
				properties: {
					/**
					 * Put a label on every N-th tickmark.
					 */
					tickmarksBetweenLabels: {type: "int", group: "Appearance", defaultValue: 0}
				}
			}
		});

		/**
		 * How many tickmarks could be placed on the axis/scale?
		 *
		 *
		 * @param {float} fSize - Size of the scale. This is the distance between the start and end point i.e. 0..100
		 * @param {float} fStep - The step walking from start to end.
		 * @param {int} iTickmarksThreshold - Limits the number of tickmarks.
		 *
		 * @returns {number} The max number of possible tickmarks
		 */
		Scale.prototype.calcNumTickmarks = function (fSize, fStep, iTickmarksThreshold) {
			var iMaxPossible = Math.floor(fSize / fStep); //How many tickmarks would be there if we show one for each step?

			iMaxPossible = iTickmarksThreshold && (iMaxPossible > iTickmarksThreshold) ?
				this._runStepsOptimization(iTickmarksThreshold, iMaxPossible) : iMaxPossible;

			return Math.floor(iMaxPossible);
		};

		/**
		 * This method is run when there's a risk for the ratio (maxPossibleTickmarks / customNumberOfTickmarksProvided)
		 * would not be an integer.
		 * The result of this method still might not be an integer, but at least there's a try to optimize the space,
		 * so the tickmarks would look like in the best case.
		 *
		 * @param {int} iTickmarksCount The number of tickmarks
		 * @param {int} iMaxPossibleTickmarks The maximum number of tickmarks
		 * @returns {int} Yhe optimized number of tickmarks
		 * @private
		 */
		Scale.prototype._runStepsOptimization = function (iTickmarksCount, iMaxPossibleTickmarks) {
			var iStepsCount = iMaxPossibleTickmarks / iTickmarksCount;

			// Loop until the iStepsCount is an integer.
			// That way tickmarks would be distributed in the best way
			while ((iTickmarksCount > 1) && (iStepsCount % 1 !== 0)) {
				iTickmarksCount--;
				iStepsCount = iMaxPossibleTickmarks / iTickmarksCount;
			}

			return iTickmarksCount;
		};

		/**
		 * Calculate the distance between tickmarks.
		 *
		 * Actually this calculates the distance between the first and the second tickmark, but as it's
		 * assumed that the tickmarks are spread evenly, it doesn't matter.
		 *
		 * @param {int} iTickmarksCount Number of tickmarks that'd be drawn
		 * @param {float} fStart The start value of the scale.
		 * @param {float} fEnd The end value of the scale.
		 * @param {float} fStep The step walking from start to end.
		 * @returns {float} The distance between tickmarks
		 * @private
		 */
		Scale.prototype.calcTickmarksDistance = function (iTickmarksCount, fStart, fEnd, fStep) {
			var fScaleSize = Math.abs(fStart - fEnd),
				iMaxPossibleTickmarks = Math.floor(fScaleSize / fStep),
				iStepsCount = Math.ceil(iMaxPossibleTickmarks / iTickmarksCount);

			return fStart + (iStepsCount * fStep);
		};

		/**
		 * Computes which tickmarks with labels should get hidden.
		 * Returns a flagged array with the indices of those tickmarks:
		 * <code>[0: undefined, 1: true, 2: undefined, 3: true, 4: undefined, 5: true, 6: undefined]</code>
		 *
		 * The algorithm to determine which labels should get hidden is:
		 * 1) Check if there's enough space for all the labels. Which means that the distance between labels
		 *      should not be less than labels' width. That width is defined in {_CONSTANTS.TICKMARKS.MIN_SIZE.WITH_LABEL}.
		 * 2) Start walking from both edges of the scale to the center and remove every second <b>visible</b> label.
		 * 3) Move the pointer to the next starting visible node and repeat from 1) if there's still not enough space.
		 *
		 * <b>Note:</b> The starting point is always an integer which is on power of 2. For example: 1, 2, 4, 8, 16, 32, etc.
		 * The implementation of 2) (the walk step/jump) is also an integer which is on power of 2. For example if we start from position
		 * <b>1</b> (the second element in the array), we'll visit the following nodes: 1, 3, 5, 7, 9, etc.
		 * Then if we move the starting pointer to the next visible node, its index (it's 2) is integer on power of 2,
		 * the jump would become <b>4</b>: 2, 6, 10, 14, 18, 22, etc. Remember that we want to remove every second <b>visible</b>
		 * node and 1, 3, 5, 7, 9 are already invisible. So, if we continue in that manner, we'll always move the starting
		 * pointer to the next integer which is on power of 2 and the jump step would be the next integer which is on power of 2.
		 * For example:
		 *
		 * Initial array:          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
		 * #1: Start: 1, Jump: 2:  [0, X, 2, X, 4, X, 6, X, 8, X, 10, X,  12, X,  14, X,  16]
		 * #2: Start: 2, Jump: 4:  [0, X, X, X, 4, X, X, X, 8, X, X,  X,  12, X,  X,  X,  16]
		 * #3: Start: 4, Jump: 8:  [0, X, X, X, X, X, X, X, 8, X, X,  X,  X,  X,  X,  X,  16]
		 * #4: Start: 8, Jump: 16: [0, X, X, X, X, X, X, X, X, X, X,  X,  X,  X,  X,  X,  16]
		 *
		 * @param {int} iScaleWidth - Width in Px of the scale
		 * @param {int} iTotalLabelsCount - Number of tickmarks with labels
		 * @param {float} fOffsetLeftPx - The distance in Px between the first and the second label
		 * @param {int} iLabelsMinDistance - The minimum distance between two labels
		 * @returns {Array} A flagged array with the indices of the hidden tickmarks
		 * @private
		 */
		Scale.prototype.getHiddenTickmarksLabels = function (iScaleWidth, iTotalLabelsCount, fOffsetLeftPx, iLabelsMinDistance) {
			var iJumpStep, iCurPos,
				aHiddenLabelsIndices = new Array(iTotalLabelsCount),
				// How many labels should get hidden, so there would be enough space.
				// There's min distance design limitation of {TICKMARKS.MIN_SIZE.WITH_LABEL} between the labels
				iStartPosition = Math.ceil(1 / (fOffsetLeftPx / iLabelsMinDistance)),
				fnCalcJumpStep = function (iPos) {
					// iPos^2 === iPos * iPos === iPos << 1
					return iPos << 1;
				};

			if (iStartPosition === 1) {
				return aHiddenLabelsIndices;
			}

			// The code bellow, with all the bitwise operators, just finds the next higher integer which is power of 2.
			// There are easier ways to achieve this, but not in constant time.
			// The starting position must be always an integer which is power of 2: 1, 2, 4, 8, 16, 32
			iStartPosition--;
			iStartPosition |= iStartPosition >> 1;
			iStartPosition |= iStartPosition >> 2;
			iStartPosition |= iStartPosition >> 4;
			iStartPosition |= iStartPosition >> 8;
			iStartPosition |= iStartPosition >> 16;
			iStartPosition++;
			// Already found the next higher integer, but we need the previous one
			iStartPosition = iStartPosition >> 1;
			// This is the step to walk over the items.
			// It's a function of iStartPosition which is equal to iStartPosition^2
			iJumpStep = fnCalcJumpStep(iStartPosition);

			while (iStartPosition) {
				iCurPos = iStartPosition;
				// Go from the current position to the middle of array
				while (iCurPos < ((iTotalLabelsCount / 2) + iJumpStep)) {
					aHiddenLabelsIndices[iCurPos] = true; // Go from left to right
					aHiddenLabelsIndices[iTotalLabelsCount - iCurPos - 1] = true; // Go from right to left.

					// Increase with the jump step
					iCurPos += iJumpStep;
				}

				// Decrease to the lower position until it gets 0.
				// Using just (iStartPosition / 2) won't work as (iStartPosition === 1) should be also considered.
				iStartPosition = iStartPosition >> 1;
				iJumpStep = fnCalcJumpStep(iStartPosition);
			}

			return aHiddenLabelsIndices;
		};

		return Scale;
	});
