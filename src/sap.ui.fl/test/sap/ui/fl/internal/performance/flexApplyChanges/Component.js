sap.ui.define([
	"sap/m/App",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"fl/performance/utils/FlexPerformanceTestUtil",
	"sap/ui/core/mvc/XMLView"
], function(
	App,
	UIComponent,
	FlUtils,
	URLHandler,
	FlexPerformanceTestUtil,
	XMLView
) {
	"use strict";

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
			var oApp = new App();
			var sTestCase = FlUtils.getUrlParameter("sap-ui-fl-test-case") || "rename";
			var sTestProcessing = FlUtils.getUrlParameter("sap-ui-fl-test-processing") || "js";
			var mViewProperties = {
				id: "idMain1",
				async: true,
				viewName: "fl.performance.view." + (sTestProcessing === "js" ? "jsBaseView" : sTestCase + "-scenario")
			};
			if (sTestProcessing === "js") {
				XMLView.create(mViewProperties).then(function (oView) {
					oApp.addPage(oView);
					window.fnResolve();
				});
			} else {
				FlexPerformanceTestUtil.startMeasurementForXmlPreprocessing(this);
				XMLView.create(mViewProperties).then(function (oView) {
					oApp.addPage(oView);

					var sControlToBeChanged;
					switch (sTestCase) {
						case "rename":
							sControlToBeChanged = "idMain1--initialLabel";
							break;
						case "diverse":
							sControlToBeChanged = "idMain1--dependencyScenarioControl.layout";
							break;
						default:
					}
					var oControlToBeChanged = sap.ui.getCore().byId(sControlToBeChanged);
					return FlexPerformanceTestUtil.waitForChangesAndWriteData(oControlToBeChanged);
				});
			}
			return oApp;
		}
	});
});
