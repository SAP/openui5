/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Rendering",
	"./WaiterBase"
], function (Rendering, WaiterBase) {
	"use strict";

	var UIUpdatesWaiter = WaiterBase.extend("sap.ui.test.autowaiter._UIUpdatesWaiter", {
		// ensure that timeouts set by control inner updates are not hooked into by _timeoutWaiter
		// if an update is continuously made by the UI, at some point it will be ignored by this validation
		hasPending: function () {
			var bUIDirty = Rendering.isPending();
			if (bUIDirty) {
				this._oHasPendingLogger.debug("The UI needs rerendering");
			}
			return bUIDirty;
		}
	});

	return new UIUpdatesWaiter();
});
