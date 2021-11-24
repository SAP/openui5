/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.LocalBusyIndicatorSupport
sap.ui.define(['./Control', "sap/base/Log"],
	function(Control, Log) {
	"use strict";


	/**
	 * This class is only here for compatibility reasons. LBI works automatically with all controls
	 *
	 * @function
	 * @private
	 * @deprecated Since 1.15
	 * @alias sap.ui.core.LocalBusyIndicatorSupport
	 */
	var LocalBusyIndicatorSupport = function() {
		// "this" is the prototype now when called with apply()

		// Ensure only Control prototype is enhanced
		if (this === Control.prototype) {

			// Provide "setDelay" method for compatibility reasons
			// It has been renamed to "setBusyIndicatorDelay" and is deprecated
			this.setDelay = this.setBusyIndicatorDelay;

		} else {
			Log.error("Only controls can use the LocalBusyIndicator", this);
		}
	};


	return LocalBusyIndicatorSupport;

}, /* bExport= */ true);