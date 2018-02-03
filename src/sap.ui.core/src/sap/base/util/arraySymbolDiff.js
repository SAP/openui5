/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/base/util/equal', 'sap/base/util/hashCode'], function(equal, hashCode) {
	"use strict";

	/**
	 * Calculate delta of old list and new list.
	 *
	 * This function implements the algorithm described in "A Technique for Isolating Differences Between Files"
	 * (Commun. ACM, April 1978, Volume 21, Number 4, Pages 264-268).
	 *
	 * Items in the arrays are not compared directly. Instead, a substitute symbol is determined for each item
	 * by applying the provided function <code>fnSymbol</code> to it. Items with strictly equal symbols are
	 * assumed to represent the same logical item:
	 * <pre>
	 *   fnSymbol(a) === fnSymbol(b)   <=>   a 'is logically the same as' b
	 * </pre>
	 * As an additional constraint, casting the symbols to string should not modify the comparison result.
	 * If this second constraint is not met, this method might report more diffs than necessary.
	 *
	 * If no symbol function is provided, a default implementation is used which applies <code>JSON.stringify</code>
	 * to non-string items and reduces the strings to a hash code. It is not guaranteed that this default
	 * implementation fulfills the above constraint in all cases, but it is a compromise between implementation
	 * effort, generality and performance. If items are known to be non-stringifiable (e.g. because they may
	 * contain cyclic references) or when hash collisions are likely, an own <code>fnSymbol</code> function
	 * must be provided.
	 *
	 * The result of the diff is a sequence of update operations, each consisting of a <code>type</code>
	 * (either <code>"insert"</code> or <code>"delete"</code>) and an <code>index</code>.
	 * By applying the operations one after the other to the old array, it can be transformed to an
	 * array whose items are equal to the new array.
	 *
	 * Sample implementation of the update
	 * <pre>
	 *
	 *  function update(aOldArray, aNewArray) {
	 *
	 *    // calculate the diff
	 *    var aDiff = arraySymbolDiff(aOldArray, aNewArray, __provide_your_symbol_function_here__);
	 *
	 *    // apply update operations
	 *    aDiff.forEach( function(op) {
	 *
	 *      // invariant: aOldArray and aNewArray now are equal up to (excluding) op.index
	 *
	 *      switch ( op.type ) {
	 *      case 'insert':
	 *        // new array contains a new (or otherwise unmapped) item, add it here
	 *        aOldArray.splice(op.index, 0, aNewArray[op.index]);
	 *        break;
	 *      case 'delete':
	 *        // an item is no longer part of the array (or has been moved to another position), remove it
	 *        aOldArray.splice(op.index, 1);
	 *        break;
	 *      default:
	 *        throw new Error('unexpected diff operation type');
	 *      }
	 *
	 *    });
	 *  }
	 *
	 * </pre>
	 *
	 * @function
	 * @param {Array} aOld Old Array
	 * @param {Array} aNew New Array
	 * @param {function} [fnSymbol] Function to calculate substitute symbols for array items
	 * @exports sap/base/util/arraySymbolDiff
	 * @return {Array.<{type:string,index:int}>} List of update operations
	 * @private
	 */
	var fnArraySymbolDiff = function(aOld, aNew, fnSymbol){
		var mSymbols = {},
			aOldRefs = [],
			aNewRefs = [],
			iOldLine,
			vSymbol, oSymbol,
			iOld = 0,
			iNew = 0,
			iOldRefLine,
			iNewRefLine,
			iOldDistance,
			iNewDistance,
			aDiff = [];

		// If arrays are equal, don't try to diff them
		if (aOld === aNew || equal(aOld, aNew)) {
			return aDiff;
		}

		// If no symbol function is provided, we stringify, if it is not type string, and create a hash from it
		fnSymbol = fnSymbol || function(vValue) {
			if (typeof vValue !== "string") {
				vValue = JSON.stringify(vValue) || "";
			}
			return hashCode(vValue);
		};

		// Pass 1
		for (var i = 0; i < aNew.length; i++) {
			vSymbol = fnSymbol(aNew[i]);
			oSymbol = mSymbols[vSymbol];
			if (!oSymbol) {
				oSymbol = mSymbols[vSymbol] = {
					iNewCount: 0,
					iOldCount: 0
				};
			}
			oSymbol.iNewCount++;
			aNewRefs[i] = {
				symbol: oSymbol
			};
		}

		// Pass 2
		for (var i = 0; i < aOld.length; i++) {
			vSymbol = fnSymbol(aOld[i]);
			oSymbol = mSymbols[vSymbol];
			if (!oSymbol) {
				oSymbol = mSymbols[vSymbol] = {
					iNewCount: 0,
					iOldCount: 0
				};
			}
			oSymbol.iOldCount++;
			oSymbol.iOldLine = i;
			aOldRefs[i] = {
				symbol: oSymbol
			};
		}

		// Pass 3
		for (var i = 0; i < aNewRefs.length; i++) {
			oSymbol = aNewRefs[i].symbol;
			if (oSymbol.iNewCount === 1 && oSymbol.iOldCount === 1) {
				aNewRefs[i].line = oSymbol.iOldLine;
				aOldRefs[oSymbol.iOldLine].line = i;
			}
		}

		// Pass 4
		for (var i = 0; i < aNewRefs.length - 1; i++) {
			iOldLine = aNewRefs[i].line;
			if (iOldLine !== undefined && iOldLine < aOldRefs.length - 1) {
				if (aOldRefs[iOldLine + 1].symbol === aNewRefs[i + 1].symbol) {
					aOldRefs[iOldLine + 1].line = i + 1;
					aNewRefs[i + 1].line = iOldLine + 1;
				}
			}
		}

		// Pass 5
		for (var i = aNewRefs.length - 1; i > 0; i--) {
			iOldLine = aNewRefs[i].line;
			if (iOldLine !== undefined && iOldLine > 0) {
				if (aOldRefs[iOldLine - 1].symbol === aNewRefs[i - 1].symbol) {
					aOldRefs[iOldLine - 1].line = i - 1;
					aNewRefs[i - 1].line = iOldLine - 1;
				}
			}
		}

		// Create diff
		while (iOld < aOld.length || iNew < aNew.length) {
			iNewRefLine = aOldRefs[iOld] && aOldRefs[iOld].line;
			iOldRefLine = aNewRefs[iNew] && aNewRefs[iNew].line;
			if (iOld < aOld.length && (iNewRefLine === undefined || iNewRefLine < iNew)) {
				aDiff.push({
					index: iNew,
					type: "delete"
				});
				iOld++;
			} else if (iNew < aNew.length && (iOldRefLine === undefined || iOldRefLine < iOld)) {
				aDiff.push({
					index: iNew,
					type: "insert"
				});
				iNew++;
			} else if (iNew === iNewRefLine) {
				iNew++;
				iOld++;
			} else {
				iNewDistance = iNewRefLine - iNew;
				iOldDistance = iOldRefLine - iOld;
				if (iNewDistance <= iOldDistance) {
					aDiff.push({
						index: iNew,
						type: "insert"
					});
					iNew++;
				} else {
					aDiff.push({
						index: iNew,
						type: "delete"
					});
					iOld++;
				}
			}
		}
		return aDiff;
	};

	return fnArraySymbolDiff;
});
