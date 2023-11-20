/*!
 * ${copyright}
 */
/*eslint-disable max-len */
sap.ui.define(function() {
	"use strict";

	// Static class

	/**
	 * @alias sap.ui.model.TreeBindingUtils
	 * @namespace
	 * @public
	 */
	var TreeBindingUtils = function() {};

	/**
	 * Merges together oNewSection into a set of other sections (aSections)
	 * The array/objects are not modified, the function returns a new section array.
	 * @param {object[]} aSections the sections into which oNewSection will be merged
	 * @param {object} oNewSection the section which should be merged into aNewSections
	 * @return {object[]} a new array containing all sections from aSections merged with oNewSection
	 * @public
	 */
	TreeBindingUtils.mergeSections = function (aSections, oNewSection) {
		// Iterate over all known/loaded sections of the node
		var aNewSections = [];
		for (var i = 0; i < aSections.length; i++) {

			var oCurrentSection = aSections[i];
			var iCurrentSectionEndIndex = oCurrentSection.startIndex + oCurrentSection.length;
			var iNewSectionEndIndex = oNewSection.startIndex + oNewSection.length;

			if (oNewSection.startIndex <= iCurrentSectionEndIndex && iNewSectionEndIndex >= iCurrentSectionEndIndex
					&& oNewSection.startIndex >= oCurrentSection.startIndex) {
				//new section expands to the right
				oNewSection.startIndex = oCurrentSection.startIndex;
				oNewSection.length = iNewSectionEndIndex - oCurrentSection.startIndex;
			} else if (oNewSection.startIndex <= oCurrentSection.startIndex && iNewSectionEndIndex >= oCurrentSection.startIndex
					&& iNewSectionEndIndex <= iCurrentSectionEndIndex) {
				//new section expands to the left
				oNewSection.length = iCurrentSectionEndIndex - oNewSection.startIndex;
			} else if (oNewSection.startIndex >= oCurrentSection.startIndex && iNewSectionEndIndex <= iCurrentSectionEndIndex) {
				//new section is contained in old one
				oNewSection.startIndex = oCurrentSection.startIndex;
				oNewSection.length = oCurrentSection.length;
			} else if (iNewSectionEndIndex < oCurrentSection.startIndex || oNewSection.startIndex > iCurrentSectionEndIndex) {
				//old and new sections do not overlap, either the new section is completely left or right from the old one
				aNewSections.push(oCurrentSection);
			}
		}

		aNewSections.push(oNewSection);

		return aNewSections;
	};

	/**
	 * Compares new requests with pending requests. If any differences are found, either the new request is reduced or the pending request is canceled.
	 * - If the new request is totally covered by a pending request the new request is canceled.
	 * - If a part of the new request is already covered by a pending request, the new request is reduced by the already covered parts.
	 * - If a new requests is reduced but contains <code>threshold</code> information, it will always be increased again by that threshold. This will prevent making too many small requests.
	 * - If the new request covers the pending request but adds additional data, the pending request is canceled.
	 *
	 * @param {object} oNewRequest Contains the <code>iSkip</code> and <code>iTop</code> values of a new request that can be modified. It may also contains an optional <code>iThreshold</code> value
	 * @param {object} oPendingRequest Contains the <code>iSkip</code> and <code>iTop</code> values and the <code>oRequestHandle</code> of a pending request
	 *			The <code>oRequestHandle</code> is used to cancel the pending request.
	 * @return {boolean} <code>false</code> if the new request is ignored
	 * @private
	 */
	TreeBindingUtils._determineRequestDelta = function (oNewRequest, oPendingRequest) {
		var iNewSectionEndIndex = oNewRequest.iSkip + oNewRequest.iTop;
		var iPendingSectionEndIndex = oPendingRequest.iSkip + oPendingRequest.iTop;

		if (oNewRequest.iSkip === oPendingRequest.iSkip && oNewRequest.iTop === oPendingRequest.iTop) {
			//new section equals old section completely => ignore new request
			return false; // Needs to be handled by caller!
		} else if (oNewRequest.iSkip < oPendingRequest.iSkip && iNewSectionEndIndex > oPendingRequest.iSkip
				&& iNewSectionEndIndex <= iPendingSectionEndIndex) {
			//new section expands to the left
			oNewRequest.iTop = oPendingRequest.iSkip - oNewRequest.iSkip;

			if (oNewRequest.iThreshold) { // Add threshold if given
				oNewRequest.iTop = oNewRequest.iTop + oNewRequest.iThreshold;
				oNewRequest.iSkip = Math.max(0, oNewRequest.iSkip - oNewRequest.iThreshold);
				// threshold is already added to top, so its not needed anymore
				oNewRequest.iThreshold = 0;
			}
		} else if (oNewRequest.iSkip < iPendingSectionEndIndex && iNewSectionEndIndex > iPendingSectionEndIndex
				&& oNewRequest.iSkip >= oPendingRequest.iSkip) {
			//new section expands to the right
			oNewRequest.iSkip = iPendingSectionEndIndex;
			oNewRequest.iTop = iNewSectionEndIndex - oNewRequest.iSkip;

			if (oNewRequest.iThreshold) { // Add threshold if given
				oNewRequest.iTop += oNewRequest.iThreshold;
				// threshold is already added to top, so its not needed anymore
				oNewRequest.iThreshold = 0;
			}
		} else if (oNewRequest.iSkip >= oPendingRequest.iSkip && iNewSectionEndIndex <= iPendingSectionEndIndex) {	// First check whether we should ignore the new request.
																													// Keeping pending ones is better
			//new section is contained in old one => ignore new request
			return false; // Needs to be handled by caller!
		} else if (oNewRequest.iSkip <= oPendingRequest.iSkip && iNewSectionEndIndex >= iPendingSectionEndIndex) {
			//new section overlaps old section completely , either the new section is completely left or right from the old one
			// => abort pending request
			oPendingRequest.oRequestHandle.abort();
		} else if (iNewSectionEndIndex <= oPendingRequest.iSkip || oNewRequest.iSkip >= iPendingSectionEndIndex) {
			//old and new sections do not overlap, either the new section is completely left or right from the old one
		}

		return undefined;
	};

	return TreeBindingUtils;
});