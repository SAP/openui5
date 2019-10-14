sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/variants/URLHandler",
	"fl/performance/utils/FlexPerformanceTestUtil",
	"sap/ui/core/mvc/JSView",
	"sap/ui/core/mvc/XMLView"
], function(
	UIComponent,
	FakeLrepConnectorSessionStorage,
	FakeLrepConnector,
	FlUtils,
	URLHandler,
	FlexPerformanceTestUtil,
	JSView,
	XMLView
) {
	"use strict";

	function _createFakeLrep(oComponent) {
		var mAppManifest = oComponent.getManifestEntry("sap.app");
		var mSettings = {};
		var sTestCase = FlUtils.getUrlParameter("sap-ui-fl-test-case") || "rename";
		var sTestScope = FlUtils.getUrlParameter("sap-ui-fl-test-scope") || "1050";
		var sJsonFile = "/FakeLrep." + sTestCase + "." + sTestScope + ".json";
		mSettings.sInitialComponentJsonPath = jQuery.sap.getModulePath("sap.ui.fl.internal.performance.flexData").replace('resources', 'test-resources') + sJsonFile;
		FakeLrepConnectorSessionStorage.enableFakeConnector(
			mSettings,
			mAppManifest.id + '.Component',
			mAppManifest.applicationVersion.version);
	}

	return UIComponent.extend("fl.performance.flexApplyChanges.Component", {
		metadata: {
			manifest: "json"
		},

		constructor: function() {
			var sCurrentVariantFromURL = FlUtils.getUrlParameter(URLHandler.variantTechnicalParameterName);
			if (sCurrentVariantFromURL) {
				arguments[0].componentData = {technicalParameters: {}};
				arguments[0].componentData.technicalParameters[URLHandler.variantTechnicalParameterName] = [sCurrentVariantFromURL];
			}
			UIComponent.prototype.constructor.apply(this, arguments);
		},

		createContent: function () {
			_createFakeLrep(this);
			var oApp = new sap.m.App();
			var sTestCase = FlUtils.getUrlParameter("sap-ui-fl-test-case") || "rename";
			var sTestProcessing = FlUtils.getUrlParameter("sap-ui-fl-test-processing") || "js";
			var mViewProperties = {
				id: "idMain1",
				async: true
			};
			if (sTestProcessing === "js") {
				JSView.create(Object.assign(mViewProperties, {viewName: "fl.performance.view.jsView"}))
					.then(function (oView) {
						oApp.addPage(oView);
						window.fnResolve();
					});
			} else {
				var bVariantSwitchScenario = sTestCase === "variants" && !FlUtils.getUrlParameter(URLHandler.variantTechnicalParameterName);
				if (!bVariantSwitchScenario) {
					FlexPerformanceTestUtil.startMeasurementForXmlPreprocessing(this);
				}
				XMLView.create(Object.assign(mViewProperties, {viewName: "fl.performance.view." + sTestCase + "-scenario"}))
					.then(function (oView) {
						var sControlToBeChanged;
						switch (sTestCase) {
							case "rename":
								sControlToBeChanged = "idMain1--initialLabel";
								break;
							case "diverse":
								sControlToBeChanged = "idMain1--dependencyScenarioControl.layout";
								break;
							case "variants": // only xml scenario
								sControlToBeChanged = "idMain1--dependencyScenarioControl.vbox";
								break;
						}
						var oControlToBeChanged = sap.ui.getCore().byId(sControlToBeChanged);
						Promise.resolve().then(function() {
							if (bVariantSwitchScenario) {
								FlexPerformanceTestUtil.startMeasurement();
								return FlexPerformanceTestUtil.updateVariant(this)
									.then(FlexPerformanceTestUtil.stopMeasurement);
							}
						}.bind(this)).then(FlexPerformanceTestUtil.waitForChangesAndWriteData.bind(null, oControlToBeChanged));

						oApp.addPage(oView);
					}.bind(this));
			}
			return oApp;
		},

		destroy: function() {
			var mAppManifest = this.getManifestEntry("sap.app");
			FakeLrepConnector.disableFakeConnector(
				mAppManifest.id + '.Component',
				mAppManifest.applicationVersion.version
			);
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}

	});
});
