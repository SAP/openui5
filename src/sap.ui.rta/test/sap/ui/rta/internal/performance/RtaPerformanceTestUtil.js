sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	'sap/ui/thirdparty/sinon'
], function(
	RuntimeAuthoring,
	Plugin,
	DesignTime,
	FlexUtils,
	FlexSettings,
	sinon
){
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oManifest = {
		"sap.app" : {
			applicationVersion : {
				version : "1.2.3"
			}
		}
	};

	var oMockedAppComponent = {
		getManifestEntry: function () {
			return {};
		},
		getMetadata: function () {
			return {
				getName: function () {
					return "someName";
				},
				getManifest: function () {
					return oManifest;
				}
			};
		},
		getManifest: function () {
			return oManifest;
		},
		getModel: function () {},
		getLocalId: function() {}
	};

	var Util = {

		_createStartRtaFunction: function(oRuntimeAuthoring) {
			return function() {
				return Promise.all([
					new Promise(function (fnResolve) {
						oRuntimeAuthoring.attachStart(fnResolve);
					}),
					oRuntimeAuthoring.start()
				]);
			};
		},

		_defineTestStubs: function(oRuntimeAuthoring) {
			sandbox.stub(FlexSettings, "getInstance").returns(Promise.resolve({
				isProductiveSystem: function() { return false; }
			}));
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(oMockedAppComponent);
			var oFlexController = oRuntimeAuthoring._getFlexController();
			sandbox.stub(oFlexController, "getComponentChanges").returns(Promise.resolve([]));
		},

		startRta: function(oHorizontalLayout, aPlugins) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oHorizontalLayout
			});
			if (aPlugins && Array.isArray(aPlugins)) {
				if (!aPlugins.length) {
					aPlugins.push(new Plugin("abc"));
				}
				oRuntimeAuthoring.setPlugins(aPlugins);
			}
			Util._defineTestStubs(oRuntimeAuthoring);

			// will result in custom timer in webPageTest
			window.performance.mark("rta.start.starts");

			return oRuntimeAuthoring.start()
			.then(function() {
				var sMeasureName = "RTA start function called";
				//will result in custom timer in webPageTest
				window.performance.mark("rta.start.ends");
				window.performance.measure(sMeasureName, "rta.start.starts", "rta.start.ends");
				sap.ui.rta.startTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
				jQuery.sap.log.info(sMeasureName, sap.ui.rta.startTime + "ms");
				//visual change at the end
				var oOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oHorizontalLayout);
				oOverlay.setSelected(true);
			})
			.then(function() {
				sandbox.restore();
			});
		},

		startRtaWithoutStretch: function(oRootControl) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oRootControl
			});
			var mPlugins = oRuntimeAuthoring.getDefaultPlugins();
			delete mPlugins["stretch"];
			oRuntimeAuthoring.setPlugins(mPlugins);

			Util._defineTestStubs(oRuntimeAuthoring);

			// will result in custom timer in webPageTest
			window.performance.mark("rta.start.starts");

			return oRuntimeAuthoring.start()
			.then(function() {
				var sMeasureName = "RTA start function called";
				//will result in custom timer in webPageTest
				window.performance.mark("rta.start.ends");
				window.performance.measure(sMeasureName, "rta.start.starts", "rta.start.ends");
				sap.ui.rta.startTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
				jQuery.sap.log.info(sMeasureName, sap.ui.rta.startTime + "ms");
				//visual change at the end
				var oOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oRootControl);
				oOverlay.setSelected(true);
			})
			.then(function() {
				sandbox.restore();
			});
		},

		startRtaWithoutDt: function(oHorizontalLayout) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oHorizontalLayout
			});
			Util._defineTestStubs(oRuntimeAuthoring);
			sandbox.stub(DesignTime.prototype, "addRootElement");

			// will result in custom timer in webPageTest
			window.performance.mark("rta.start.starts");

			return oRuntimeAuthoring.start()

			.then(function() {
				var sMeasureName = "RTA start function called without starting DT";
				//will result in custom timer in webPageTest
				window.performance.mark("rta.start.ends");
				window.performance.measure(sMeasureName, "rta.start.starts", "rta.start.ends");
				sap.ui.rta.startTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
				jQuery.sap.log.info(sMeasureName, sap.ui.rta.startTime + "ms");
			})
			.then(function() {
				sandbox.restore();
			});
		},

		startRtaConstructorOnly: function(oHorizontalLayout) {
			var iRtaStartCounter = 1000;
			var sMeasureName = "RTA init function called " + iRtaStartCounter + " times";
			window.performance.clearMeasures();

			// will result in custom timer in webPageTest
			window.performance.mark("rta.init.starts");

			for (var i = 0; i < iRtaStartCounter; i++) {
				/* eslint no-new: 0 */
				new RuntimeAuthoring({
					rootControl : oHorizontalLayout
				});
			}

			//will result in custom timer in webPageTest
			window.performance.mark("rta.init.ends");
			window.performance.measure(sMeasureName, "rta.init.starts", "rta.init.ends");
			sap.ui.rta.creationTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
			jQuery.sap.log.info(sMeasureName, sap.ui.rta.creationTime + "ms");
		}
	};

	window.startRta = Util.startRta;
	window.startRtaWithoutDt = Util.startRtaWithoutDt;
	window.startRtaConstructorOnly = Util.startRtaConstructorOnly;

	return Util;
}, true);
