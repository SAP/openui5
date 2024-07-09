sap.ui.loader.config({
	shim: {
		"sap/ui/codeeditor/js/ace/ext-themelist": {
			deps: ["sap/ui/codeeditor/js/ace/ace"]
		}
	}
});

sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/codeeditor/CodeEditor",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/codeeditor/js/ace/ace",
	"sap/ui/codeeditor/js/ace/ext-themelist"
],  function (
	ManagedObject,
	CodeEditor,
	App,
	Page,
	Label,
	Button,
	Select,
	Item,
	ace
	// ext-themelist
) {
	"use strict";

	var mValues = {
		"html": document.getElementById("htmlSample").textContent.trim().replace(/&sol;/g, "/"), // Handling escaped closing script tag sol
		"javascript": document.getElementById("javascriptSample").textContent,
		"css": document.getElementById("cssSample").textContent,
		"xquery": document.getElementById("xquerySample").textContent,
		"coffee": document.getElementById("coffeeSample").textContent,
		"plain_text": document.getElementById("plainText").textContent,
		"json": document.getElementById("json").textContent,
		"properties": document.getElementById("i18n.properties").textContent
	};

	var oCodeEditor = new CodeEditor({
		type: "html",
		value: ManagedObject.escapeSettingsValue(mValues["html"]),
		height: "auto",
		maxLines: 70,
		tooltip: "Code editor control"
	});

	var oInvalidateBtn = new Button({ text: "Invalidate" }).attachPress(oCodeEditor.invalidate);

	new App({
		pages: [
			new Page({
				title: "Code Editor",
				headerContent: [
					new Label({ text: "type:"}),
					new Select({
						items: [
							new Item({ key: "html", text: "html"}),
							new Item({ key: "javascript", text: "javascript"}),
							new Item({ key: "css", text: "css"}),
							new Item({ key: "xquery", text: "xquery"}),
							new Item({ key: "coffee", text: "coffee"}),
							new Item({ key: "plain_text", text: "plain text"}),
							new Item({ key: "json", text: "json"}),
							new Item({ key: "properties", text: "i18n.properties"})
						],
						change: function (e) {
							var sKey = e.getSource().getSelectedKey();
							oCodeEditor.setType(sKey).setValue(mValues[sKey]);
						}
					}),
					new Label({ text: "colorTheme", showColon: true }),
					new Select({
						selectedKey: oCodeEditor.getColorTheme(),
						items: [
							{ name: "default"},
							{ name: "hcb" },
							{ name: "hcb_bright" },
							{ name: "hcb_blue" }
						].concat(ace.require("ace/ext/themelist").themes).map(function (mTheme) {
							return new Item({ key: mTheme.name, text: mTheme.name });
						}),
						change: function (e) {
							var sKey = e.getSource().getSelectedKey();
							oCodeEditor.setColorTheme(sKey);
						}
					}),
					oInvalidateBtn
				],
				content: [
					new Label({ text: "Hello World App" }),
					oCodeEditor,
					new Button({ text: "Save"})
				]
			})
		]
	}).placeAt("body");

	oCodeEditor.addCustomCompleter({
		getCompletions: function (callback, context) {
			// callback is provided to us by ACE so we can execute it in a way like
			// below in order to display suggestions to the user

			// ideally, the array argument, provided to the following method call,
			// will be dynamically generated based on the content of the context
			// object

			// let's assume the context contained an sPrefix equal to 'read', which
			// means the cursor in ACE is at the end of a 'read' word

			// by executing the following call, we can show a list of suggestions
			// like that: readFile, readStream, readResponse
			callback(null, [
				{
					// name is not displayed on the screen
					name: "readFile",
					// value is displayed on the screen
					value: "readFile()",
					// score determines which suggestion goes first
					score: "1",
					// meta is short info displayed on the right of value
					meta: "function"
				},
				{
					// name is not displayed on the screen
					name: "readStream",
					// value is displayed on the screen
					value: "readStream(input)",
					// score determines which suggestion goes first
					score: "3",
					// meta is short info displayed on the right of value
					meta: "params: input"
				},
				{
					// name is not displayed on the screen
					name: "readStream",
					// value is displayed on the screen
					value: "readStream(input, encoding)",
					// score determines which suggestion goes first
					score: "2",
					// meta is short info displayed on the right of value
					meta: "params: input, encoding"
				}
			]);
		}
	});
});