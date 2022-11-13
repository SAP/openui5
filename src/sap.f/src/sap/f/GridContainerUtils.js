/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleRenderer"
], function (Log, Element, InvisibleRenderer) {
	"use strict";

	return {

		findDropTargetsAbove: function (oGrid, oItem) {
			return this._findDropTargets(oGrid, oItem, this._isAbove);
		},

		findDropTargetsBelow: function (oGrid, oItem) {
			return this._findDropTargets(oGrid, oItem, this._isBelow);
		},

		/**
		 * Returns the wrapper DomRef of a control.
		 *
		 * @param {sap.ui.core.Control} oItem Instance from the <code>items</code> aggregation.
		 * @returns {HTMLElement} oDomRef the wrapper's DomRef
		 */
		getItemWrapper: function (oItem) {
			var oItemDomRef = oItem.getDomRef(),
				oInvisibleSpan;

			if (oItemDomRef) {
				return oItemDomRef.parentElement;
			}

			oInvisibleSpan = document.getElementById(InvisibleRenderer.createInvisiblePlaceholderId(oItem));

			if (oInvisibleSpan) {
				return oInvisibleSpan.parentElement;
			}

			return null;
		},

		createConfig: function (oGrid, oItem) {
			return {
				grid: oGrid,
				item: oItem
			};
		},

		/**
		 * Searches for the closest item to the given one
		 * Tries to find it in the same container first, if there is no success, all other GridContainers are being searched
		 * @param {sap.ui.core.Control} oGrid The grid
		 * @param {sap.ui.core.Control} oItem The item that is being dragged
		 * @param {function} fnMatch Filter function
		 * @returns {object[]} Array of configurations for possible drop targets, sorted by distance
		 */
		_findDropTargets: function (oGrid, oItem, fnMatch) {
			var aTargets = [],
				oItemWrapper = this.getItemWrapper(oItem),
				aCurrGridMatchingItems = oGrid.getItems().filter(function (a) {
					return fnMatch(oItemWrapper, this.getItemWrapper(a));
				}.bind(this)),
				oCurrGridMatch = this.createConfig(oGrid, this._findClosest(oItem, aCurrGridMatchingItems), oItem, fnMatch);

			if (oCurrGridMatch.item) {
				aTargets.push(oCurrGridMatch);
			} else {
				aTargets = Array.from(document.querySelectorAll(".sapFGridContainer"))
					.filter(function (a) {
						return fnMatch(oItemWrapper, a);
					})
					.map(function (oGrid) {
						var oNextGrid = Element.closestTo(oGrid);
						var oCfg = this.createConfig(oNextGrid, this._findClosest(oItem, oNextGrid.getItems()), oItem, fnMatch);
						oCfg.distFromItemToGrid = this._getDistance(oItem, oNextGrid, fnMatch);
						return oCfg;
					}.bind(this))
					.sort(function (a, b) {
						return a.distFromItemToGrid - b.distFromItemToGrid;
					});
			}

			return aTargets;
		},

		_findClosest: function (oItem, aControls, fnMatch) {
			var oClosestItem = null,
				fClosestDistance = Number.POSITIVE_INFINITY;

			aControls.forEach(function (oControl) {
				var fDist = this._getDistance(oItem, oControl, fnMatch);
				if (fDist < fClosestDistance) {
					oClosestItem = oControl;
					fClosestDistance = fDist;
				}
			}.bind(this));

			return oClosestItem;
		},

		/**
		 * Finds the closest distance from point to line segment
		 * The idea of the algorithm is illustrated here http://paulbourke.net/geometry/pointlineplane/
		 * @param {sap.ui.core.Control} a The first control
		 * @param {sap.ui.core.Control} b The second control
		 * @param {function} fnMatch Filter function
		 * @returns {float} Squared distance between the center of "a" and closest point from "b"
		 */
		_getDistance: function (a, b, fnMatch) {
			var aRect = a.getDomRef().getBoundingClientRect(),
				bRect = b.getDomRef().getBoundingClientRect();


			var P1 = {
				x: bRect.left
			};

			if (fnMatch === this._isAbove) {
				P1.y = bRect.top + bRect.height; // bottom left corner
			} else {
				P1.y = bRect.top; // upper right corner
			}

			// Points P1 and P2 form a line segment |P1P2|
			var P2 = {
				x: P1.x + bRect.width,
				y: P1.y
			};

			// Point P3 is the middle of the dragged control
			var P3 = {
				x: aRect.left + aRect.width / 2,
				y: aRect.top + aRect.height / 2
			};

			// ||P2 - P1|| Euclidean distance (norm) between P1 and P2
			var fNormSquared = (P2.x - P1.x) * (P2.x - P1.x) + (P2.y - P1.y) * (P2.y - P1.y);

			// The coefficient, that determines the closest point
			var iCoeff = ((P3.x - P1.x) * (P2.x - P1.x) + (P3.y - P1.y) * (P2.y - P1.y)) / fNormSquared;

			// We are searching for a point P, that is the closest point from "a" to the line segment
			var P = {};

			if (iCoeff < 0) { // closest point is P1
				P.x = P1.x;
				P.y = P1.y;
			} else if (iCoeff > 1) { // closest point is P2
				P.x = P2.x;
				P.y = P2.y;
			} else { // closest point is is lying on the line segment |P1P2|
				P.x = P1.x + iCoeff * (P2.x - P1.x);
				P.y = P1.y + iCoeff * (P2.y - P1.y);
			}

			// Finally, measure the distance from P3 to P (the closest possible distance) using Pythagorean theorem
			var fDx = (P.x - P3.x),
				fDy = (P.y - P3.y),
				fDist = fDx * fDx + fDy * fDy;

			if (fDist > Number.MAX_SAFE_INTEGER) {
				Log.warning("Maximum safe integer value exceeded.", fDist, "GridContainerUtils");
			}

			return fDist;
		},

		/**
		 * @param {HTMLElement} a Item from the GridContainer
		 * @param {HTMLElement} b HTML Element
		 * @returns {boolean} Whether "b" is above oItem
		 */
		_isAbove: function (a, b) {
			var fY1 = a.getBoundingClientRect().top,
				fY2 = b.getBoundingClientRect().top;

			return fY2 - fY1 < 0;
		},

		/**
		 * @param {HTMLElement} a Item from the GridContainer
		 * @param {HTMLElement} b HTML Element
		 * @returns {boolean} Whether "b" is below oItem
		 */
		_isBelow: function (a, b) {
			var fY1 = a.getBoundingClientRect().top,
				fY2 = b.getBoundingClientRect().top;

			return fY2 - fY1 > 0;
		}

	};
});