/*!
 * ${copyright}
 */

/**
 * Contains String analyzing functionality such as calculating the levenshtein distance between 2 strings
 */
sap.ui.define([],
	function () {
	"use strict";

	var StringAnalyzer = {
		/**
		 *
		 * @param {string} sWordA
		 * @param {string} sWordB
		 * @returns levenshtein distance number
		 */
		calculateLevenshteinDistance: function(sWordA, sWordB) {

			var iLengthA = sWordA.length;
			var iLengthB = sWordB.length;

			if (iLengthA === 0) {
				return iLengthB;
			}
			if (iLengthB === 0) {
				return iLengthA;
			}

			// fill the x axis of the matrix
			var aMatrix = new Array(iLengthB + 1);
			var iIndexFirstRowX;
			for (iIndexFirstRowX = 0; iIndexFirstRowX <= iLengthB; iIndexFirstRowX++) {
				aMatrix[iIndexFirstRowX] = new Array(iLengthA + 1);
				aMatrix[iIndexFirstRowX][0] = iIndexFirstRowX;
			}

			// fill the y axis of the matrix
			var iIndexFirstRowY;
			for (iIndexFirstRowY = 0; iIndexFirstRowY <= iLengthA; iIndexFirstRowY++) {
				aMatrix[0][iIndexFirstRowY] = iIndexFirstRowY;
			}

			// calculate the levenshtein distance row by row
			var iLevenshteinDistance = 0;
			var iIndexRowsX;
			var iIndexRowY;
			for (iIndexRowsX = 1; iIndexRowsX <= iLengthB; iIndexRowsX++) {
				for (iIndexRowY = 1; iIndexRowY <= iLengthA; iIndexRowY++) {
					var iDeletionCost = aMatrix[iIndexRowsX - 1][iIndexRowY] + 1;
					var iInsertionCost = aMatrix[iIndexRowsX][iIndexRowY - 1] + 1;
					var iSubstitutionCost = aMatrix[iIndexRowsX - 1][iIndexRowY - 1];
					if (sWordA[iIndexRowY] !== sWordB[iIndexRowsX]) {
						iSubstitutionCost += 1;
					}
					iLevenshteinDistance = Math.min(iDeletionCost, iInsertionCost, iSubstitutionCost);
					aMatrix[iIndexRowsX][iIndexRowY] = iLevenshteinDistance;
				}
			}
			//the last calculated distance is the shortest distance
			return iLevenshteinDistance;
		}
	};

	return StringAnalyzer;
}, false);
