/*!
 * ${copyright}
 */

sap.ui.define([
], function () {
	"use strict";

	return {
		init: function (aSettings, oDelegates) {
			sap.ui.require([
				"sap/ui/testrecorder/Recorder"
			], function (Recorder) {

				if (aSettings[0].toLowerCase() === "true" || aSettings[0].toLowerCase() === "silent") {
					Recorder.start(aSettings);
				}
			});
		}
	};
});
