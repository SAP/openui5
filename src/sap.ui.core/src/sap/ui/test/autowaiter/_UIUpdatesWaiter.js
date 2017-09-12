/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_OpaLogger"
], function (_OpaLogger) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._UIUpdatesWaiter#hasPending");

	// ensure that timeouts set by control inner updates are not hooked into by _timeoutWaiter
	// if an update is continuously made by the UI, at some point it will be ignored by this validation
	return {
		hasPending: function () {
			var bUIDirty = sap.ui.getCore().getUIDirty();
			if (bUIDirty) {
				oHasPendingLogger.debug("The UI needs rerendering");
			}
			return bUIDirty;
		}
	};
});
