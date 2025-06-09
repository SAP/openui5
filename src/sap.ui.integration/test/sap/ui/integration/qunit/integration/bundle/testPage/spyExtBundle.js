(function () {
	"use strict";

	function spyAppendChild() {
		const originalAppendChild = document.head.appendChild;
		document.head.appendChild = function (element) {
			if (element.tagName === "SCRIPT" && element.src.includes("sap-ui-integration-ext.js")) {
				window._integrationExtBundleLoaded = true;
			}
			return originalAppendChild.call(document.head, element);
		};
	}

	spyAppendChild();
})();
