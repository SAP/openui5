window.measureApplyStylesAfterStartUpWithStretchPlugin = function() {
	"use strict";
	sap.ui.require([
		"rta/performance/RtaPerformanceTestUtil",
		"sap/ui/core/Element",
		"sap/ui/dt/OverlayRegistry",
		"sap/base/util/restricted/_debounce",
		"sap/base/Log"
	], function(
		RtaPerformanceTestUtil,
		Element,
		OverlayRegistry,
		_debounce,
		BaseLog
	) {
		const aStack = [];
		aStack.push(new Date().getTime());

		RtaPerformanceTestUtil.startRta(Element.getElementById("visibleLayout")).then(function() {
			let iCountCall = 0;
			let bMeasurementDone = false;

			const fnDebouncedFn = _debounce(function() {
				if (!bMeasurementDone) {
					bMeasurementDone = true;
					window.wpp.customMetrics.applyStylesAfterStartWithStretch = aStack[aStack.length - 1] - aStack[0];
					BaseLog.info(`ApplyStylesAfterStart = ${window.wpp.customMetrics.applyStylesAfterStartWithStretch}ms`);
					BaseLog.info(`Count call = ${iCountCall}`);
				} else {
					BaseLog.error("Some applyStyles() calculation exceeded timeout of 2000ms");
					window.wpp.customMetrics.applyStylesAfterStartWithStretch = 10000;
				}
			}, 2000);

			function onGeometryChanged() {
				aStack.push(new Date().getTime());
				iCountCall++;
				setTimeout(fnDebouncedFn);
			}

			OverlayRegistry.getOverlays().forEach(function(oElementOverlay) {
				oElementOverlay.attachGeometryChanged(onGeometryChanged);
			});
		});
	});
};

window.measureApplyStylesAfterStartUpWithoutStretchPlugin = function() {
	"use strict";
	sap.ui.require([
		"rta/performance/RtaPerformanceTestUtil",
		"sap/ui/core/Element",
		"sap/ui/dt/OverlayRegistry",
		"sap/base/util/restricted/_debounce",
		"sap/base/Log"
	], function(
		RtaPerformanceTestUtil,
		Element,
		OverlayRegistry,
		_debounce,
		BaseLog
	) {
		const aStack = [];
		aStack.push(new Date().getTime());

		RtaPerformanceTestUtil.startRtaWithoutStretch(Element.getElementById("visibleLayout")).then(function() {
			aStack.push(new Date().getTime());
			let iCountCall = 0;
			let bMeasurementDone = false;

			const fnDebouncedFn = _debounce(function() {
				if (!bMeasurementDone) {
					bMeasurementDone = true;
					window.wpp.customMetrics.applyStylesAfterStartWithoutStretch = aStack[aStack.length - 1] - aStack[0];
					BaseLog.info(`ApplyStylesAfterStartWithoutStretch = ${window.wpp.customMetrics.applyStylesAfterStartWithoutStretch}ms`);
					BaseLog.info(`Count call = ${iCountCall}`);
				} else {
					BaseLog.error("Some applyStyles() calculation exceeded timeout of 2000ms");
					window.wpp.customMetrics.applyStylesAfterStartWithoutStretch = 10000;
				}
			}, 2000);

			function onGeometryChanged() {
				aStack.push(new Date().getTime());
				iCountCall++;
				setTimeout(fnDebouncedFn);
			}

			OverlayRegistry.getOverlays().forEach(function(oElementOverlay) {
				oElementOverlay.attachGeometryChanged(onGeometryChanged);
			});
			setTimeout(fnDebouncedFn, 100);
		});
	});
};