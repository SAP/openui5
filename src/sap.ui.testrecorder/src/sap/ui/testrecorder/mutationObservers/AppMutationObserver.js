/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/mutationObservers/MutationObserver"
], function (MutationObserver) {
	"use strict";

	var AppMutationObserver = MutationObserver.extend("sap.ui.testrecorder.mutationObservers.AppMutationObserver", {
		metadata: {
			library: "sap.ui.testrecorder"
		},
		_getOptions: function () {
			return {
				subtree: true,
				childList: true
			};
		}
	});

	return AppMutationObserver;
});
