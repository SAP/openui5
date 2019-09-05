/*!
 * ${copyright}
 */

sap.ui.define([
], function() {
	"use strict";

	var KEY_CODE = {
		ALT: 18,
		T: 84
	};

	return {
		init: function () {
			var bLeftAlt = false;

			// listen for ctrl + alt + shift + t
			document.addEventListener("keydown", function(e) {
				if (e.keyCode === KEY_CODE.ALT) {
					bLeftAlt = typeof e.location !== "number" || e.location === 1;
					return;
				}

				if (e.shiftKey && e.altKey && e.ctrlKey && e.keyCode === KEY_CODE.T && bLeftAlt) {
					sap.ui.require(["sap/ui/testrecorder/Bootstrap"], function (Bootstrap) {
						Bootstrap.init(["true", "window"]);
					}, function (oError) {
						/*eslint-disable no-console */
						console.warn("Could not load library 'sap/ui/testrecorder/Bootstrap'! Details: " + oError);
					});
				}
			});
		}
	};
});
