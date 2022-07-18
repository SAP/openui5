(function () {
	"use strict";
	document.documentElement.style.opacity = "0";
	document.documentElement.style.transition = "opacity 0.1s";
})();

window.addEventListener("load", function () {
	"use strict";
	var sTargetRoot = document.location.href.substring(0, document.location.href.indexOf("/test-resources")),
		sWebApp = sTargetRoot + "/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/",
		sRes = sTargetRoot + "/resources/",
		aNodes = [],
		iLoadedCnt = 0,
		oEl = document.createElement("div");

	aNodes.push('<script src="' + sWebApp + 'scripts/codesample.js"></script>');
	aNodes.push('<link rel="stylesheet" href="' + sWebApp + 'css/topic.css">');
	aNodes.push('<link rel="stylesheet" href="' + sWebApp + 'css/codesample.css">');
	aNodes.push('<link rel="stylesheet" href="' + sRes + 'sap/ui/core/themes/sap_horizon/library.css">');
	aNodes.push('<link rel="stylesheet" href="' + sRes + 'sap/ui/documentation/sdk/thirdparty/highlight.js/styles.css">');
	aNodes.push('<script src="' + sRes + 'sap/ui/documentation/sdk/thirdparty/highlight.js/highlight.js"></script>');
	aNodes.push('<script src="' + sWebApp + 'scripts/topic.js"></script>');

	function afterLoad() {
		iLoadedCnt++;
		if (iLoadedCnt === aNodes.length) {
			window.parent.postMessage("bootFinished", window.location.origin);
		}
	}

	aNodes.forEach(function (s) {
		oEl.innerHTML = s;
		if (oEl.firstChild.tagName === "SCRIPT") {
			var sc = document.createElement("script");
			sc.src = oEl.firstChild.src;
			sc.async = true;

			sc.addEventListener("load", function () {
				if (window.hljs && window.codesample) {
					window.codesample();
					document.documentElement.style.opacity = "1";
					if (document.querySelector("script[data-require-ui5-init]") || document.querySelector("script[data-require-ui5-noinit]")) {
						var oScript = document.createElement("script");
						oScript.setAttribute("id", "sap-ui-bootstrap");
						oScript.setAttribute("src", sRes + "/sap-ui-integration.js");
						oScript.setAttribute("data-sap-ui-theme", "sap_horizon");
						oScript.setAttribute("data-sap-ui-compatVersion", "edge");
						oScript.setAttribute("data-sap-ui-async", "true");
						if (document.querySelector("script[data-require-ui5-init]")) {
							oScript.setAttribute("data-sap-ui-oninit", "init");
						}
						oScript.setAttribute("data-sap-ui-resourceroots", '{"custom": "./"}');
						document.head.appendChild(oScript);
					}
				}
				afterLoad();
			});
			document.head.appendChild(sc);
		} else {
			oEl.firstChild.addEventListener("load", afterLoad);
			document.head.appendChild(oEl.firstChild);
		}
	});
});