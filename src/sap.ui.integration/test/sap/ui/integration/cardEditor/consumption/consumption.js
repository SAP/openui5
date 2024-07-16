var editor;
function init() {
	//load common implementation for host testing
	sap.ui.require(["this/HostImpl"]);

	var manifest = { "sap.app": { "id": "test.sample" }, "sap.card": { "type": "List", "configuration": { "destinations": { "dest1": { "name": "Sample" } }, "parameters": { "string": { "type": "string", "label": "String Parameter", "value": "{{TRANS}}", "translatable": true } }, "int": { "type": "integer", "label": "Integer Parameter", "value": 1 } } } };

	var adminchanges = {
		"/sap.card/configuration/parameters/string/value": "String Value Admin",
		"/sap.card/configuration/destinations/dest1/name": "JAM",
		":layer": 0,
		":errors": false
	};

	var pagechanges = {
		"/sap.card/configuration/parameters/string/value": "String Value Page",
		":layer": 5,
		":errors": false
	};

	var translationchanges = {

	};

	sap.ui.require(["sap/ui/integration/designtime/editor/CardEditor"], function (CardEditor) {
		editor = new CardEditor({
			card: {
				manifest: manifest,
				manifestChanges: [adminchanges, pagechanges, translationchanges], //old or new format
				baseUrl: "",
				host: "host"
			},
			mode: "admin",
			language: "fr-CA" //if mode is translation, required

		});
		editor.placeAt("editor");

	});

}
function logChanges() {
	console.log(editor.getCurrentSettings());
}