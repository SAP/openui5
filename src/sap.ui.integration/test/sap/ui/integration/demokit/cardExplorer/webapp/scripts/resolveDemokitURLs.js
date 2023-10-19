(function () {
	"use strict";

	function resolveDemokitLinks() {
		var aLinks = document.getElementsByTagName("a"),
			iInd,
			oLink;

		for (iInd = 0; iInd < aLinks.length; iInd++) {
			oLink = aLinks[iInd];

			if (oLink.dataset.demokitHref) {
				oLink.href = resolveDemokitURL(oLink.dataset.demokitHref);
			}

			if (oLink.getAttribute("target") === "_blank") {
				oLink.setAttribute("rel", "noopener noreferrer");
			}
		}
	}

	function resolveDemokitURL(sUrl) {
		var sCurrentUrl = window.location.href,
			sDemokitUrl = sCurrentUrl.replace(/sap\/ui\/integration\/.*/, "../");

		if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
			sDemokitUrl += "documentation.html";
		}

		return sDemokitUrl + sUrl;
	}

	resolveDemokitLinks();
	window.resolveDemokitURL = resolveDemokitURL;
})();