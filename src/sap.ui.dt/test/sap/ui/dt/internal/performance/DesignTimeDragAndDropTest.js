window.wpp = {
	customMetrics: {}
};

sap.ui.require([
	"dt/performance/PerformanceTestUtil",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/m/Label"
], function(
	PerformanceTestUtil,
	VerticalLayout,
	HorizontalLayout,
	nextUIUpdate,
	Label
) {
	"use strict";
	// create Vertical Layout
	const oLayout1 = new VerticalLayout("Layout1");
	PerformanceTestUtil.addMixedControlsTo(oLayout1, 1, 30, true /* visible */);
	PerformanceTestUtil.addMixedControlsTo(oLayout1, 31, 60, false /* invisible */);
	const oContainerLayout1 = new VerticalLayout({
		id: "ContainerLayout1",
		content: [
			new Label({
				text: "ContainerLayout1"
			}),
			oLayout1
		]
	});
	const oLayout2 = new VerticalLayout("Layout2");
	PerformanceTestUtil.addMixedControlsTo(oLayout2, 61, 90, true /* visible */);
	PerformanceTestUtil.addMixedControlsTo(oLayout2, 91, 120, false /* invisible */);
	const oContainerLayout2 = new VerticalLayout({
		id: "ContainerLayout2",
		content: [
			new Label({
				text: "ContainerLayout2"
			}),
			oLayout2
		]
	});
	const oLayout3 = new VerticalLayout("Layout3");
	PerformanceTestUtil.addMixedControlsTo(oLayout3, 121, 150, true /* visible */);
	PerformanceTestUtil.addMixedControlsTo(oLayout3, 151, 200, false /* invisible */);
	const oContainerLayout3 = new VerticalLayout({
		id: "ContainerLayout3",
		content: [
			new Label({
				text: "ContainerLayout3"
			}),
			oLayout3
		]
	});

	const oHorizontalLayout = new HorizontalLayout("HorizontalLayout", {
		content: [oContainerLayout1, oContainerLayout2, oContainerLayout3]
	});
	oHorizontalLayout.placeAt("content");
	nextUIUpdate().then(() => {
		PerformanceTestUtil.startDesignTime(oHorizontalLayout);
	});
});

window.startDragAndDrop = function() {
	"use strict";
	sap.ui.require([
		"sap/ui/dt/OverlayRegistry",
		"sap/base/Log"
	], function(
		OverlayRegistry,
		BaseLog
	) {
		performance.mark("drag.starts");
		// get overlays
		const oLayout1Overlay = OverlayRegistry.getOverlay("Layout1");
		const oControlInLayout1Overlay = OverlayRegistry.getOverlay("Control1");
		const oLayout2Overlay = OverlayRegistry.getOverlay("Layout2");
		const oLayout2ContentOverlay = oLayout2Overlay.getAggregationOverlay("content");
		const oControlInLayout2Overlay = OverlayRegistry.getOverlay("Control61");
		const oLayout3Overlay = OverlayRegistry.getOverlay("Layout3");
		const oLayout3ContentOverlay = oLayout3Overlay.getAggregationOverlay("content");
		const oControlInLayout3Overlay = OverlayRegistry.getOverlay("Control121");
		// execute operations based on console.log statements in drag&drop plugin
		// do it in a promise chain so that the browser can render in between...
		Promise.resolve().then(function() {
			oLayout1Overlay.getDomRef().dispatchEvent(new MouseEvent("click"));
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragstart"));
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
		}).then(function() {
			for (let i = 0; i < 100; i++) {
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
			}
		}).then(function() {
			oControlInLayout2Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
			oControlInLayout2Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
		}).then(function() {
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
			oLayout2ContentOverlay.getDomRef().dispatchEvent(new DragEvent("dragleave"));
		}).then(function() {
			for (let i = 0; i < 100; i++) {
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
			}
		}).then(function() {
			oControlInLayout3Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
		}).then(function() {
			oLayout2ContentOverlay.getDomRef().dispatchEvent(new DragEvent("dragleave"));
		}).then(function() {
			oControlInLayout3Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
		}).then(function() {
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
		}).then(function() {
			oControlInLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
		}).then(function() {
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
		}).then(function() {
			oLayout3ContentOverlay.getDomRef().dispatchEvent(new DragEvent("dragleave"));
		}).then(function() {
			for (let i = 0; i < 100; i++) {
				oControlInLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
			}
		}).then(function() {
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragenter"));
		}).then(function() {
			oLayout3ContentOverlay.getDomRef().dispatchEvent(new DragEvent("dragleave"));
		}).then(function() {
			for (let i = 0; i < 100; i++) {
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragover"));
				oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("drag"));
			}
		}).then(function() {
			oLayout3ContentOverlay.getDomRef().dispatchEvent(new DragEvent("drop"));
		}).then(function() {
			oLayout1Overlay.getDomRef().dispatchEvent(new DragEvent("dragend"));
		}).then(function() {
			// measure time
			performance.mark("drag.ends");
			performance.measure("DragAndDrop", "drag.starts", "drag.ends");
			window.wpp.customMetrics.dragDropTime = performance.getEntriesByName("DragAndDrop")[0].duration;
			BaseLog.info("Drag and Drop took ", `${window.wpp.customMetrics.dragDropTime}ms`);

			// mark something as done
			document.getElementById("overlay-container").setAttribute("sap-ui-dt-drag-drop-done", "true");
		});
	});
};