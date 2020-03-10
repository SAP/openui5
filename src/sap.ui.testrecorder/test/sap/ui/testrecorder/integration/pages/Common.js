sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/thirdparty/jquery"
], function(Opa5, jQuery) {
	"use strict";

	return Opa5.extend("sap.ui.testrecorder.integration.pages.Common", {
		iStartMyMockRecorder: function () {
			return this.iStartMyAppInAFrame({
				source: jQuery.sap.getModulePath("sap/ui/testrecorder/recorderMock") + "/overlay.html",
				autoWait:true
			});
		},
		iStartMyMockApp: function () {
			return this.iStartMyAppInAFrame({
				source: jQuery.sap.getModulePath("sap/ui/testrecorder/appMock") + "/index.html",
				autoWait:true
			});
		},
		iStartRecorder: function () {
			// start the recorder programatically, instead of waiting for the url param to be read,
			// so that the recorder will also be started when the browser tab isn't active
			this.waitFor({
				check: function () {
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
								// wait for the control tree to be loaded and visible
								var oTree = oRecorderJQuery("tree");
								return !!oTree.length && oTree.is(":visible") && oTree.css("visibility") !== "hidden";
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
							Opa5.getContext().recorderOpaPlugin = new (Opa5.getContext().recorderWindow.sap.ui.test.OpaPlugin)();
							Opa5.assert.ok(Opa5.getContext().recorderOpaPlugin, "Should load Opa plugin instance in recorder frame");
						}
					});
				},
				errorMessage: "Cannot start test recorder"
			});
		}
	});
});
