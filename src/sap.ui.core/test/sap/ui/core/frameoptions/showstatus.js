/* eslint strict: [2, "global"] */
/* eslint-disable no-implicit-globals */
"use strict";
function updateStatus(bSuccess) {
	document.getElementById("status").innerHTML = "Framing has been " + (bSuccess ? "allowed" : "denied") + "!";
}
if (!window["sap-ui-config"]) {
	window["sap-ui-config"] = {};
}
if (!window["sap-ui-config"].frameOptionsConfig) {
	window["sap-ui-config"].frameOptionsConfig = {};
}
window["sap-ui-config"].frameOptionsConfig.callback = function(bSuccess) {
	if (document.readyState == "complete") {
		updateStatus(bSuccess);
	} else {
		document.addEventListener("readystatechange", function() {
			if (document.readyState == "complete") {
				updateStatus(bSuccess);
			}
		});
	}
};
