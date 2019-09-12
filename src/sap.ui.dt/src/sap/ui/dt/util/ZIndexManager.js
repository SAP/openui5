/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Popup",
	"sap/ui/core/BusyIndicator",
	"sap/base/Log",
	"sap/ui/dt/Util",
	"sap/m/InstanceManager",
	"sap/base/util/includes",
	"sap/base/util/restricted/_max",
	"sap/base/util/restricted/_min"
], function (
	Popup,
	BusyIndicator,
	Log,
	Util,
	InstanceManager,
	includes,
	_max,
	_min
) {
	"use strict";

	/**
	 * Utility class to calculate the next available z-index.
	 *
	 * @class
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.64
	 * @alias sap.ui.dt.util.ZIndexManager
	 * @experimental Since 1.64. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Z_INDEX_STEP = 10; // Hardcoded in sap.ui.core.Popup

	// '-3' because sap.ui.core.Popup is using -1 and -2 levels for the internal purpose
	// (e.g. rendering the underlying gray overlay below the BusyIndicator)
	var Z_INDICES_RESERVED = 3;

	var aAssignedZIndices = [];

	var _aPopupFilters = [];

	function getPopups() {
		return InstanceManager.getOpenDialogs()
			.concat(
				InstanceManager.getOpenPopovers(),
				BusyIndicator.oPopup && BusyIndicator.oPopup.isOpen() ? [BusyIndicator.oPopup] : []
			);
	}

	function getLastZIndex(iCurrent, iMax, aExistingIndices) {
		if (++iCurrent <= iMax) {
			if (includes(aExistingIndices, iCurrent)) {
				return getLastZIndex(iCurrent, iMax, aExistingIndices);
			}
			return iCurrent;
		}

		Log.error('sap.ui.dt.util.ZIndexManager: z-index limit has been exceeded, therefore all following calls receive the same z-Index = ' + iMax);
		return iMax;
	}

	function getZIndexFromPopups(aPopups) {
		return aPopups.map(function (oPopupElement) {
			return oPopupElement._iZIndex || oPopupElement.oPopup._iZIndex;
		});
	}

	var ZIndexManager = {
		/**
		 * Calculates the reliable z-index in the current window considering the global BusyIndicator dialog.
		 *
		 * Algorithm:
		 * 1) When popups are already open on the screen:
		 *      the highest z-index of validated popups is compared with the lowest z-index of invalidated popups.
		 *      The invalidated popups also include any BusyIndicator that might be open.
		 * 2) If the invalidated popups have the higher value then the next z-index is first decremented by 10,
		 *      which gives the last popup z-index and then 1 is added to it.
		 * 3) After incrementing 1 in Step 2), the resultant z-index value is compared against an array of assigned z-index values
		 *       by the ZIndexManager. Step 3) is repeated as long as it stays under a max value and a unique value is calculated.
		 *       The max value is the next possible popup z-index - 3 (hardcoded by variable Z_INDICES_RESERVED).
		 *             Example: when BusyIndicator has a z-index 100, then available indexes are:
		 *                      91, 92, 93, 94, 95, 96, 97. Indexes 98 & 99 are used by
		 *                      BusyIndicator internally, therefore we can't rely on them. The reason we start from
		 *                      the index 91 is that in sap.ui.core.Popup.getNextZIndex() there is a hardcoded step with
		 *                      a value 10 which means there are only 10 reliable indexes between the opened BusyIndicator
		 *                      and the previous absolutely positioned element on the screen;
		 * 4) If no popups are open or if validated popups have a higher z-index,
		 *       then simply the next possible z-index is returned by calling sap.ui.core.Popup.getNextZIndex().
		 *
		 * @returns {int} the next available z-index value
		 * @public
		 */
		getNextZIndex: function () {
			//get all open popups from InstanceManager
			var aAllOpenPopups = getPopups();
			var aValidatedPopups = [];
			var aInvalidatedPopups = [];

			aAllOpenPopups.forEach(function(oOpenPopup) {
				// check if non-adaptable popup
				var bValid = _aPopupFilters.every(function (fnFilter) {
					return fnFilter(oOpenPopup);
				});
				bValid && _aPopupFilters.length > 0
					? aValidatedPopups.push(oOpenPopup)
					: aInvalidatedPopups.push(oOpenPopup);
			});

			// get max Z-Index from validated popups
			var iMaxValidatedZIndex = aValidatedPopups.length > 0
				? _max(getZIndexFromPopups(aValidatedPopups))
				: -1;

			// get minimum Z-Index from invalidated popups
			var iMinInvalidatedZIndex = aInvalidatedPopups.length > 0
				? _min(getZIndexFromPopups(aInvalidatedPopups))
				: -1;

			// compare Z-Index of adaptable and non-adaptable popups - the higher one wins
			if (iMaxValidatedZIndex < iMinInvalidatedZIndex) {
				return this._getNextMinZIndex(iMinInvalidatedZIndex);
			}
			return Popup.getNextZIndex();
		},

		/**
		 * Calculates the z-index value below open popups.
		 * If there are no open popups it returns the value from sap.ui.core.Popup.getNextZIndex()
		 * @returns {int} z-index below open popups
		 * @public
		 */
		getZIndexBelowPopups: function () {
			var aOpenPopups = getPopups();
			var iLowestPopupZIndex;

			if (aOpenPopups.length > 0) {
				iLowestPopupZIndex = Math.min.apply(null, getZIndexFromPopups(aOpenPopups));
			}

			// if no open popups
			if (!Util.isInteger(iLowestPopupZIndex)) {
				return Popup.getNextZIndex();
			}

			// get the minimum possible z-index
			return this._getNextMinZIndex(iLowestPopupZIndex);
		},

		/**
		 * Filter functions can be added to validate open popups.
		 * sap.ui.dt.util.getNextZIndex() will return a z-index value greater than validated and less than invalidated popups.
		 * @param {function} fnFilter Filter function to be added
		 * @public
		 */
		addPopupFilter: function (fnFilter) {
			if (typeof fnFilter === "function") {
				_aPopupFilters = _aPopupFilters.concat([fnFilter]);
			}
		},

		/**
		 * Removes the passed filter function from existing filter functions.
		 * @param {function} fnFilter Filter function to be removed
		 * @public
		 */
		removePopupFilter: function (fnFilter) {
			_aPopupFilters = _aPopupFilters.filter(
				function(fnExistingFilter) {
					return fnExistingFilter === fnFilter;
				}
			);
		},

		/**
		 * Returns the next minimum possible z-index based on the passed z-index value.
		 * @param {int} iCurrent Current z-index value
		 * @returns {int} The next minimum z-index value
		 * @private
		 */
		_getNextMinZIndex: function (iCurrent) {
			// deduct indices reserved from current z-index
			var iMaxZIndex = iCurrent - Z_INDICES_RESERVED;
			// initial minimum z-index
			var iMinZIndex = iCurrent - Z_INDEX_STEP;
			var iNextZIndex = getLastZIndex(iMinZIndex, iMaxZIndex, aAssignedZIndices);
			aAssignedZIndices.push(iNextZIndex);
			return iNextZIndex;
		}
	};

	return ZIndexManager;
});