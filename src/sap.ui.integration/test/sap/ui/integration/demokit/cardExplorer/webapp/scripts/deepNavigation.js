(function () {
	"use strict";

	window.addEventListener("message", function (oEvent) {
		if (oEvent.data.channel === "scrollTo") {
			document.getElementById(oEvent.data.id).scrollIntoView();
		}
	}, false);

})();
