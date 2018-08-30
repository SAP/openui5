(function () {
	"use strict";

	var aHTMLElementID = ["target", "target1", "target2"];

	aHTMLElementID.forEach(function (sElementId) {
		var oElement = document.createElement("div");
		oElement.setAttribute("id", sElementId);
		document.body.appendChild(oElement);
	});

}());