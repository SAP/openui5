/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Popup",
	"sap/ui/core/BusyIndicator",
	"sap/base/Log"
], function (
	Popup,
	BusyIndicator,
	Log
) {
	"use strict";

	var Z_INDEX_STEP = 10; // Hardcoded in sap.ui.core.Popup

	/**
	 * Serves as a flag if the getNextZIndex() is being called during the same BusyIndicator "session".
	 * @type {int}
	 */
	var iLastBusyIndicatorZIndex;

	/**
	 * The maximum value of z-index during the currently open BusyIndicator. Nobody should exceed this value, otherwise
	 * it will receive z-index above a busy indicator element.
	 * @type {int}
	 */
	var iMaxZIndex;

	/**
	 * The last returned z-index during the same BusyIndicator "session".
	 * @type {int}
	 */
	var iLastZIndex;

	/**
	 * Calculates the reliable z-index in the current window considering the global BusyIndicator dialog.
	 *
	 * Algorithm:
	 * 1) When no BusyIndicator is shown on the screen:
	 *      just returns a next z-index by using sap.ui.core.Popup.getNextZIndex();
	 * 2) When BusyIndicator is shown on the screen:
	 *      2.1) We calculate available z-indexes below the BusyIndicator element:
	 *             Example: when BusyIndicator has a z-index 100, then available indexes are:
	 *                      91, 92, 93, 94, 95, 96, 97. Indexes 98 & 99 are used by
	 *                      BusyIndicator internally, therefore we can't rely on them. The reason we start from
	 *                      the index 91 is that in sap.ui.core.Popup.getNextZIndex() there is a hardcoded step with
	 *                      a value 10 which means there are only 10 reliable indexes between the opened BusyIndicator
	 *                      and the previous absolutely positioned element on the screen;
	 *      2.2) We return the next available z-index from the range calculated on step 2.1;
	 *      2.3) When we reach the maximum available z-index during the same BusyIndicator "session",
	 *           then the latest available z-index is returned which may potentially cause problems with
	 *           layouts positions, that's why we prompt a developer in the console for this occasion.
	 *      2.4) When a new BusyIndicator "session" is started, then we calculate a new range of available z-indexes
	 *           on step 2.1.
	 *
	 * @function
	 * @exports sap/ui/dt/util/getNextZIndex
	 * @returns {int} - the next available z-index value
	 * @private
	 */
	var fnGetNextZIndex = function () {
		var iNextZIndex;
		var oBusyIndicatorPopup = BusyIndicator.oPopup;

		// In case when a global BusyIndicator is open, we should provide z-indexes below it.
		if (oBusyIndicatorPopup && oBusyIndicatorPopup.isOpen() && oBusyIndicatorPopup.getModal()) {
			// if the function is called for another "session" of a BusyIndicator we should reset the counters
			if (iLastBusyIndicatorZIndex !== oBusyIndicatorPopup._iZIndex) {
				iLastBusyIndicatorZIndex = oBusyIndicatorPopup._iZIndex;

				// Basically we get the "free" indexes below the BusyIndicator layer
				iLastZIndex = iLastBusyIndicatorZIndex - Z_INDEX_STEP;

				// '-3' because sap.ui.core.Popup is using -1 and -2 levels for the internal purpose
				// (e.g. rendering the underlying gray overlay below the BusyIndicator)
				iMaxZIndex = iLastBusyIndicatorZIndex - 3;
			}

			if (iLastZIndex < iMaxZIndex) {
				iNextZIndex = ++iLastZIndex;
			} else {
				iNextZIndex = iMaxZIndex;
				Log.error('sap.ui.dt.util.getNextZIndex: z-index limit has been exceeded, therefore all following calls receive the same z-Index = ' + iNextZIndex);
			}
		} else {
			iNextZIndex = Popup.getNextZIndex();
		}

		return iNextZIndex;
	};

	return fnGetNextZIndex;
});