window.startDragAndDrop = function() {
	"use strict";
	sap.ui.require([
		"dt/performance/PerformanceTestUtil"
	], function(
		DtPerformanceTestUtil
	) {
		function fnRecursiveloop(aEvents) {
			const aEvent = aEvents.shift();
			if (aEvent) {
				setTimeout(function() {
					document.getElementById(aEvent[1]).dispatchEvent(new Event(aEvent[0]));
					fnRecursiveloop(aEvents);
				}, aEvent[0] === "dragenter" ? 50 : 0);
			}
		}

		fetch("./dragAndDrop/dragDropEvents.json")
		.then((oResponse) => oResponse.json())
		.then(function(aEvents) {
			DtPerformanceTestUtil.measureApplyStylePerformance("applyStylesDragDrop", 3000);

			fnRecursiveloop(aEvents);
		});
	});
};

window.startResizeTest = function() {
	"use strict";
	sap.ui.require([
		"dt/performance/PerformanceTestUtil"
	], function(
		DtPerformanceTestUtil
	) {
		DtPerformanceTestUtil.measureApplyStylePerformance("applyStylesResize", 2000);

		let iStartWidth = document.getElementById("content").getBoundingClientRect().width;
		const aWidthsToTest = [450, 300, 650, 500];
		const iJumpsInPxls = 5;
		let iNextWidth = iStartWidth - (iStartWidth % iJumpsInPxls);

		(function fnRecursiveloop(aWidthsToTest) {
			var iTargetWidth = aWidthsToTest.shift();
			if (iTargetWidth) {
				for (iNextWidth = iStartWidth - (iStartWidth % iJumpsInPxls);
					iNextWidth !== iTargetWidth;
					iNextWidth = (iTargetWidth > iStartWidth) ? iNextWidth + iJumpsInPxls : iNextWidth - iJumpsInPxls
				) {
					setTimeout(function(iNextWidth) { document.getElementById("content").style.width = `${iNextWidth}px`; }, 0, iNextWidth);
				}
				iStartWidth = iNextWidth;
				setTimeout(function() {
					document.getElementById("content").style.width = `${iNextWidth}px`;
					fnRecursiveloop(aWidthsToTest, iStartWidth, iJumpsInPxls);
				}, 100);
			}
		})(aWidthsToTest, iStartWidth, iJumpsInPxls);
	});
};