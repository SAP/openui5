sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/thirdparty/jquery"
], function(Opa5, jQuery) {
	"use strict";

	return Opa5.extend("sap.ui.testrecorder.integration.pages.Common", {
		iStartMyMockRecorder: function () {
			var sModulePath = jQuery.sap.getModulePath("sap/ui/testrecorder/recorderMock");
			return this.iStartMyAppInAFrame({
				source: sModulePath + "/overlay.html",
				autoWait:true
			});
		},
		iStartMyMockApp: function () {
			var sModulePath = jQuery.sap.getModulePath("sap/ui/testrecorder/appMock");
			return this.iStartMyAppInAFrame({
				source: sModulePath + "/index.html",
				autoWait:true
			});
		},
		iStartRecorder: function () {
			this.waitFor({
				check: function () {
					if (Opa5.getWindow().sap.ui.require("sap/ui/testrecorder/Recorder")) {
						return true;
					} else {
						Opa5.getWindow().sap.ui.require(["sap/ui/testrecorder/Recorder"]);
						return false;
					}
				},
				success: function () {
					// start programatically, instead of waiting for the url param to be recognized,
					// so that the recorder will also be started when the browser tab isn't active
					Opa5.getWindow().sap.ui.testrecorder.Recorder.start([]);
					Opa5.assert.ok(true, "Recorder started");
					return this.waitFor({
						matchers: [function () {
							var oRecorderJQuery = this._getRecorderInFrame().jQuery;
							return oRecorderJQuery && oRecorderJQuery("h2:contains(Control Tree)").length;
						}.bind(this), function () {
							if (this._getRecorderInFrame().sap.ui.require("sap/ui/test/OpaPlugin")) {
								return true;
							} else {
								this._getRecorderInFrame().sap.ui.require(["sap/ui/test/OpaPlugin"]);
								return false;
							}
						}.bind(this)],
						success: function () {
							this._getRecorderInFrame().__opaPlugin__ = new (this._getRecorderInFrame().sap.ui.test.OpaPlugin)();
							Opa5.assert.ok(this._getRecorderInFrame().__opaPlugin__, "Should load Opa plugin instance in recorder frame");
						}.bind(this)
					});
				},
				errorMessage: "Cannot start test recorder"
			});
		},
		_getRecorderInFrame: function () {
			return Opa5.getJQuery()("#sap-ui-test-recorder-frame")[0].contentWindow;
		}
	});
});
