window.wpp = {
	customMetrics: {}
};
window.onAppReady = new Promise(function(fnResolve) {
	"use strict";
	window.fnResolve = fnResolve;
});

sap.ui.require([
	"dt/performance/PerformanceTestUtil",
	"sap/m/Panel",
	"sap/ui/core/Core",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	PerformanceTestUtil,
	Panel,
	Core,
	VerticalLayout,
	nextUIUpdate
) {
	"use strict";
	Core.ready().then(async () => {
		const oSourcePanel = new Panel("SourcePanel");
		const oTargetPanel = new Panel("TargetPanel");
		const oLayout = new VerticalLayout("Layout", {
			content: [oSourcePanel, oTargetPanel]
		});
		oLayout.placeAt("content");
		PerformanceTestUtil.addButtons(oSourcePanel, "content", 51);
		PerformanceTestUtil.addButtons(oTargetPanel, "content", 5);
		await nextUIUpdate();
		window.onAppReady = PerformanceTestUtil.startDesignTime(oLayout, "SourcePanel");
	});
});

window.fnFinishDragDrop = function(oOverlay, oSource, oTarget) {
	"use strict";
	oOverlay.$().trigger("drag");
	oSource.$().trigger("dragenter");
	oSource.$().trigger("dragover");
	oSource.$().trigger("dragleave");
	oTarget.$().trigger("dragenter");
	oTarget.$().trigger("dragover");
	oOverlay.$().trigger("dragend");
};

window.fnDrag = function(oOverlay, oSource, oTarget) {
	"use strict";
	oOverlay.$().trigger("click");
	oOverlay.setSelected(true);
	oOverlay.$().trigger("dragstart");
	if (!oTarget.getParentAggregationOverlay().getTargetZone()) {
		oTarget.getParentAggregationOverlay().attachEventOnce("targetZoneChange", function() {
			window.fnFinishDragDrop(oOverlay, oSource, oTarget);
		});
	} else {
		window.fnFinishDragDrop(oOverlay, oSource, oTarget);
	}
};

window.measureApplyStylesDragDropOneByOne = function() {
	"use strict";
	sap.ui.require([
		"sap/ui/dt/OverlayRegistry",
		"sap/base/Log",
		"sap/base/util/restricted/_debounce"
	], function(
		OverlayRegistry,
		BaseLog,
		_debounce
	) {
		const oSourceElementOverlay = OverlayRegistry.getOverlay("SourcePanel");
		const oSourceAggregationOverlay = oSourceElementOverlay.getAggregationOverlay("content");

		const oTargetOverlay = OverlayRegistry.getOverlay("TargetPanelbutton5");

		const aChildren = oSourceAggregationOverlay.getChildren().slice(1);

		const aStack = [];
		let iCountCall = 0;
		let bMeasurementDone = false;

		const fnDebouncedFn = _debounce(function() {
			if (!bMeasurementDone) {
				bMeasurementDone = true;
				window.wpp.customMetrics.applyStylesDragDrop = aStack[aStack.length - 1] - aStack[0];
				BaseLog.info(`ApplyStylesDragDrop = ${window.wpp.customMetrics.applyStylesDragDrop}ms`);
				BaseLog.info(`Count call = ${iCountCall}`);
			} else {
				BaseLog.error("Some applyStyles() calculation exceeded timeout of 2000ms");
				window.wpp.customMetrics.applyStylesDragDrop = 10000;
			}
		}, 2000);

		OverlayRegistry.getOverlays().forEach(function(oElementOverlay) {
			oElementOverlay.attachGeometryChanged(function() {
				aStack.push(new Date().getTime());
				iCountCall++;
				setTimeout(fnDebouncedFn);
			});
		});

		aStack.push(new Date().getTime());
		// Drag button overlays one by one
		(function fnWorker(aChildren) {
			var oButtonOverlay = aChildren[0];
			if (aChildren.length > 1) {
				oButtonOverlay.attachEventOnce("geometryChanged", function() {
					fnWorker(aChildren.slice(1));
				});
			}
			window.fnDrag(oButtonOverlay, oSourceAggregationOverlay, oTargetOverlay);
		})(aChildren);
	});
};

window.measureApplyStylesDragDropAtOnce = function() {
	"use strict";
	sap.ui.require([
		"sap/ui/dt/OverlayRegistry",
		"sap/base/Log",
		"sap/base/util/restricted/_debounce"
	], function(
		OverlayRegistry,
		BaseLog,
		_debounce
	) {
		const oSourceElementOverlay = OverlayRegistry.getOverlay("SourcePanel");
		const oSourceAggregationOverlay = oSourceElementOverlay.getAggregationOverlay("content");

		const oTargetOverlay = OverlayRegistry.getOverlay("TargetPanelbutton5");

		const aChildren = oSourceAggregationOverlay.getChildren().slice(1);

		const aStack = [];
		let iCountCall = 0;
		let bMeasurementDone = false;

		const fnDebouncedFn = _debounce(function() {
			if (!bMeasurementDone) {
				bMeasurementDone = true;
				window.wpp.customMetrics.applyStylesDragDrop = aStack[aStack.length - 1] - aStack[0];
				BaseLog.info(`ApplyStylesDragDrop = ${window.wpp.customMetrics.applyStylesDragDrop}ms`);
				BaseLog.info(`Count call = ${iCountCall}`);
			} else {
				BaseLog.error("Some applyStyles() calculation exceeded timeout of 2000ms");
				window.wpp.customMetrics.applyStylesDragDrop = 10000;
			}
		}, 2000);

		OverlayRegistry.getOverlays().forEach(function(oElementOverlay) {
			oElementOverlay.attachGeometryChanged(function() {
				aStack.push(new Date().getTime());
				iCountCall++;
				setTimeout(fnDebouncedFn);
			});
		});

		aStack.push(new Date().getTime());
		aChildren.forEach(function(oChild) {
			window.fnDrag(oChild, oSourceAggregationOverlay, oTargetOverlay);
			window.dispatchEvent(new Event("resize"));
		});
	});
};