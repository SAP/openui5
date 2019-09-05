/*!
* ${copyright}
*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/testrecorder/CommunicationBus"
], function (jQuery, ManagedObject, CommunicationBus) {
	"use strict";

	var oUIContextInjector = null;
	var oControlInspector = null;
	var oRecordListener = null;
	var oRecorder = null;

	var Recorder = ManagedObject.extend("sap.ui.testrecorder.Recorder", {
		constructor: function () {
			if (!oRecorder) {
				ManagedObject.apply(this, arguments);
			} else {
				jQuery.sap.log.warning("Only one Recorder allowed");
				return oRecorder;
			}
		}
	});

	Recorder.prototype.start = function (aTestRecorderConfig) {
		if (this._hasStarted) {
			return;
		}

		this._hasStarted = true;
		this._testRecorderConfig = aTestRecorderConfig || sap.ui.getCore().getConfiguration().getTestRecorderMode();

		if (this._testRecorderConfig && !this._testRecorderConfig.indexOf("silent") > -1 && !this._isInIframe()) {
			sap.ui.require([
				"sap/ui/testrecorder/UIContextInjector",
				"sap/ui/testrecorder/inspector/ControlInspector",
				"sap/ui/testrecorder/interaction/RecordListener"
			], function (UIContextInjector, ControlInspector, RecordListener) {
				oUIContextInjector = UIContextInjector;
				oControlInspector = ControlInspector;
				oRecordListener = RecordListener;

				oUIContextInjector.injectFrame(this._testRecorderConfig, this._stop.bind(this));
				CommunicationBus.allowFrame(oUIContextInjector.getCommunicationInfo());

				oControlInspector.init();
				oRecordListener.init();
			}.bind(this));
		}
	};

	Recorder.prototype._stop = function () {
		this._hasStarted = false;
		oControlInspector.stop();
		oRecordListener.stop();
	};

	Recorder.prototype._isInIframe = function () {
		try {
			if (window.self !== window.top) {
				// in our case it kind of makes sense to have a recorder per iframe, so only prevent nested recorders
				var sTestRecorderFrameId = "#sap-ui-test-recorder-frame";
				if (window.top.$ && window.top.$(sTestRecorderFrameId).length && window.top.$(sTestRecorderFrameId)[0].contentWindow === window.self) {
					return true;
				} else {
					return false;
				}
			}
		} catch (e) {
			// Access to window.top might be blocked if so the page is inside an iframe.
			return true;
		}
	};

	oRecorder = new Recorder();

	return oRecorder;

}, true);
