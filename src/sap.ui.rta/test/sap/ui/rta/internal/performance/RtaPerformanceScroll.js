window.startScrollTest = function() {
	"use strict";
	sap.ui.require([
		"dt/performance/PerformanceTestUtil"
	], function(
		DtPerformanceTestUtil
	) {
		DtPerformanceTestUtil.measureApplyStylePerformance("applyStylesScroll", 2000);

		let iStartWidth = 0;
		const aWidthsToTest = [1000, 0, 100, 200, 300, 400, 50];
		const iStep = 5;

		(function fnRecursiveLoop(aWidthsToTest) {
			const iTargetWidth = aWidthsToTest.shift();
			let iNewWidth = iStartWidth;
			if (iTargetWidth !== undefined) {
				do {
					iNewWidth = (iTargetWidth > iStartWidth) ? iNewWidth + iStep : iNewWidth - iStep;
					// eslint-disable-next-line no-loop-func
					setTimeout(function() {
						document.getElementById("opLayout-opwrapper").scrollTop = iNewWidth;
					}, 0);
				} while (iNewWidth !== iTargetWidth);

				iStartWidth = iTargetWidth;
				setTimeout(fnRecursiveLoop.bind(null, aWidthsToTest), 500);
			}
		})(aWidthsToTest);
	});
};