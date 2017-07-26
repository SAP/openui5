/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_opaCorePlugin"
], function (_OpaLogger, _opaCorePlugin) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._UIUpdatesWaiter#hasPending");

	// ensure that timeouts set by control inner updates are not hooked into by _timeoutWaiter
	// if an update is continuously made by the UI, at some point it will be ignored by this validation
	return {
		hasPending: function () {
			var bUIDirty = _opaCorePlugin.isUIDirty();
			if (bUIDirty) {
				oHasPendingLogger.debug("The UI needs rerendering");
			}
			return bUIDirty;
		}
	};
});
