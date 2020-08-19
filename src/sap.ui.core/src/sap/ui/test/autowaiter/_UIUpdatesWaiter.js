/*!
 * ${copyright}
 */

sap.ui.define([
	"./WaiterBase"
], function (WaiterBase) {
	"use strict";

	var UIUpdatesWaiter = WaiterBase.extend("sap.ui.test.autowaiter._UIUpdatesWaiter", {
		// ensure that timeouts set by control inner updates are not hooked into by _timeoutWaiter
		// if an update is continuously made by the UI, at some point it will be ignored by this validation
		hasPending: function () {
			var bUIDirty = sap.ui.getCore().getUIDirty();
			if (bUIDirty) {
				this._oHasPendingLogger.debug("The UI needs rerendering");
			}
			return bUIDirty;
		}
	});

	return new UIUpdatesWaiter();
});
