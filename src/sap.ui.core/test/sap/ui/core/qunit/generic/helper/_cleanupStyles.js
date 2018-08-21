sap.ui.define([], function() {
	"use strict";

	var style = document.createElement("style");
	style.innerText =
		".sap-desktop ::-webkit-scrollbar {" +
		"	width: 16px !important;" +
		"}" +
		"html {" +
		"	overflow: auto !important;" +
		"}";
	document.head.appendChild(style);

});
