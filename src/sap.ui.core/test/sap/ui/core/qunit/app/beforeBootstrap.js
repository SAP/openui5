(function() {
	"use strict";

	var oContent = document.createElement("content"),
		oTarget1 = document.createElement("div"),
		oTarget2 = document.createElement("div"),
		oTarget3 = document.createElement("div");

	oContent.setAttribute("id", "content");
	oTarget1.setAttribute("id", "target1");
	oTarget2.setAttribute("id", "target2");
	oTarget3.setAttribute("id", "target3");

	document.body.appendChild(oContent);
	document.body.appendChild(oTarget1);
	document.body.appendChild(oTarget2);
	document.body.appendChild(oTarget3);

}());
