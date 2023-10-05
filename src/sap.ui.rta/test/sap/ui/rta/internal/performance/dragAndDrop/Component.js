sap.ui.define([
	"sap/ui/core/UIComponent",
	"dt/performance/PerformanceTestUtil",
	"rta/performance/RtaPerformanceTestUtil",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/library",
	"sap/ui/core/CustomData",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Element"
], function(
	UIComponent,
	DtPerformanceTestUtil,
	RtaPerformanceTestUtil,
	HBox,
	Label,
	mobileLibrary,
	CustomData,
	VerticalLayout,
	sinon,
	oCore,
	RtaQunitUtils,
	Element
) {
	"use strict";

	var {FlexWrap} = mobileLibrary;

	return UIComponent.extend("rta.performance.dragAndDrop.Component", {
		metadata: {
			manifest: "json"
		},

		onAfterRendering() {
			window.fnResolve(RtaPerformanceTestUtil.startRta(Element.registry.get("HBox")));
		},

		createContent() {
			// create Vertical Layout
			var oLayout1 = new VerticalLayout("Layout1");
			DtPerformanceTestUtil.addBoxesWithMixedControls(oLayout1, 6);
			DtPerformanceTestUtil.addMixedControlsTo(oLayout1, 31, 60, false /* invisible */);
			var oContainerLayout1 = new VerticalLayout({
				id: "ContainerLayout1",
				content: [
					new Label({
						id: "labelForLayout1",
						text: "ContainerLayout1"
					}),
					oLayout1
				]
			});
			var oLayout2 = new VerticalLayout("Layout2");
			DtPerformanceTestUtil.addBoxesWithMixedControls(oLayout2, 6, 6);
			DtPerformanceTestUtil.addMixedControlsTo(oLayout2, 91, 120, false /* invisible */);
			var oContainerLayout2 = new VerticalLayout({
				id: "ContainerLayout2",
				content: [
					new Label({
						id: "labelForLayout2",
						text: "ContainerLayout2"
					}),
					oLayout2
				]
			});
			var oLayout3 = new VerticalLayout("Layout3");
			DtPerformanceTestUtil.addBoxesWithMixedControls(oLayout3, 6, 12);
			DtPerformanceTestUtil.addMixedControlsTo(oLayout3, 151, 200, false /* invisible */);
			var oContainerLayout3 = new VerticalLayout({
				id: "ContainerLayout3",
				content: [
					new Label({
						id: "labelForLayout3",
						text: "ContainerLayout3"
					}),
					oLayout3
				]
			});

			// with adding a margin to the first item in a box the box is not eligible for stretching anymore
			oLayout3.getContent()[1].getItems()[0].addStyleClass("sapUiRtaPerfTestMarginTop");

			var oHBox = new HBox("HBox", {
				wrap: FlexWrap.Wrap,
				items: [oContainerLayout1, oContainerLayout2, oContainerLayout3],
				customData: [
					new CustomData({
						key: "sap-ui-custom-settings",
						value: {
							"sap.ui.dt": {
								designtime: "rta/performance/HBox.designtime"
							}
						}
					})
				]
			});
			oHBox.setWidth("100%");

			var mHBoxDesigntimeMetadata = {
				aggregations: {
					items: {
						propagateRelevantContainer: true
					}
				}
			};
			RtaQunitUtils.stubSapUiRequire(sinon, [{
				name: ["rta/performance/HBox.designtime"],
				stub: mHBoxDesigntimeMetadata
			}]);

			return oHBox;
		}
	});
});
