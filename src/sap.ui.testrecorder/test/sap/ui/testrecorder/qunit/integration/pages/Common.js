sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("sap.ui.testrecorder.qunit.integration.pages.Common", {
		iStartMyMockRecorder: function () {
			this.iStartMyAppInAFrame({
				source: sap.ui.require.toUrl("sap/ui/testrecorder/recorderMock/overlay.html"),
				autoWait:true
			});

			return this.waitFor({
				check: function () {
					return checkTreeLoaded(Opa5.getJQuery());
				},
				success: function () {
					Opa5.assert.ok(true, "Recorder started");
				}
			});
		},
		iStartMyMockApp: function () {
			return this.iStartMyAppInAFrame({
				source: sap.ui.require.toUrl("sap/ui/testrecorder/appMock/index.html"),
				autoWait:true
			});
		},
		iStartRecorder: function () {
			// start the recorder programatically, instead of waiting for the url param to be read,
			// so that the recorder will also be started when the browser tab isn't active
			this.waitFor({
				timeout: 30,
				check: function () {
					Opa5.getContext()._getRecorderControls = function () {
						Opa5.assert.ok(false, "Could not get recorder utils. Maybe the recorder is not loaded?");
						return [];
					};
					// wait for the recorder to load
					if (Opa5.getWindow().sap.ui.require("sap/ui/testrecorder/Recorder")) {
						return true;
					} else {
						Opa5.getWindow().sap.ui.require(["sap/ui/testrecorder/Recorder"]);
						return false;
					}
				},
				success: function () {
					// start the recorder
					Opa5.getWindow().sap.ui.testrecorder.Recorder.start([]);
					return this.waitFor({
						timeout: 30,
						matchers: [
							function () {
								// wait for the frame to be created
								var oFrame = Opa5.getJQuery()("#sap-ui-test-recorder-frame");
								return !!oFrame.length && oFrame[0].contentWindow;
							},
							function (oRecorderWindow) {
								Opa5.getContext().recorderWindow = oRecorderWindow;
								// wait for jquery to load inside the frame
								var oRecorderJQuery = oRecorderWindow.jQuery;
								return oRecorderJQuery;
							},
							function (oRecorderJQuery) {
								return checkTreeLoaded(oRecorderJQuery);
							},
							function () {
								Opa5.assert.ok(true, "Recorder started");
								// wait for opaplugin to load
								if (Opa5.getContext().recorderWindow.sap.ui.require("sap/ui/test/OpaPlugin")) {
									return true;
								} else {
									Opa5.getContext().recorderWindow.sap.ui.require(["sap/ui/test/OpaPlugin"]);
									return false;
								}
							}
						],
						success: function () {
							// save the plugin for later (to check recorder's controls)
							var oRecorderOpaPlugin = new (Opa5.getContext().recorderWindow.sap.ui.test.OpaPlugin)();
							Opa5.assert.ok(oRecorderOpaPlugin, "Should load Opa plugin instance in recorder frame");
							Opa5.getContext().recorderOpaPlugin = oRecorderOpaPlugin;
							Opa5.getContext()._getRecorderControls = oRecorderOpaPlugin._getFilteredControls.bind(oRecorderOpaPlugin);
						}
					});
				},
				errorMessage: "Cannot start test recorder"
			});
		}
	});

	function checkTreeLoaded(jQuery) {
		// wait for the control tree to be loaded and visible
		var oTree = jQuery("tree");
		return !!oTree.length && oTree.is(":visible") && oTree.css("visibility") !== "hidden";
	}
});
