var sBaseUrl = document.location.protocol + "/" + document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/") + 1);
function init() {
	sap.ui.require(["sap-ui-integration-editor"], function () {
		sap.ui.require(["testjs/genericHost", "sap/m/Button", "sap/m/Dialog", "sap/ui/integration/designtime/editor/CardEditor"], function (o, Button, Dialog, CardEditor) {
			var oEditor = new CardEditor({
				card: {
					manifest: './manifest.json', baseUrl: sBaseUrl, manifestChanges: [{ "undefined": "undefined", "/sap.card/header/title": "Card Title1", "/sap.card/header/subTitle": "Card Sub Title1", "/sap.card/header/icon/src": "sap-icon://accept", "/sap.card/configuration/destinations/dest/name": "", "/sap.card/configuration/destinations/destLabel/name": "", "/sap.card/configuration/destinations/destLabelTrans/name": "", ":layer": 0, ":errors": false }, { "undefined": "undefined", "/sap.card/header/title": "new diff qqq", "/sap.card/header/subTitle": "Card Sub Title12", "/sap.card/header/icon/src": "sap-icon://accept", ":layer": 5, ":errors": false }],
				},
				mode: "content",
				allowSettings: true,
				allowDynamicValues: true
			});
			oEditor.placeAt("content");
		});
	});
}
function _init() {
	var oScript = document.createElement("script");
	oScript.setAttribute("src", "https://sdk.openui5.org/resources/sap-ui-integration-nojQuery.js");
	oScript.setAttribute("id", "sap-ui-bootstrap");
	oScript.setAttribute("data-sap-ui-theme", "sap_horizon");
	//oScript.setAttribute("data-sap-ui-oninit", "init");
	oScript.addEventListener("load", function () {
		init();
	})
	oScript.setAttribute("data-sap-ui-resourceroots", '{"":"https://sdk.openui5.org/resources","testjs":"./"}');
	document.head.appendChild(oScript);
}