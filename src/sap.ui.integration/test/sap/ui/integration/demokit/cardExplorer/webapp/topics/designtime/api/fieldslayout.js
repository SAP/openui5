var oBasicSettings = {
	manifest: {
		"sap.app": {
			"id": "test"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"param": {

					},
					"param1": {
						"value": "2020-09-02"
					},
				}
			}
		}
	}
};
var oAdvancedSettings = {
	manifest: {
		"sap.app": {
			"id": "test",
			"i18n": "i18n/i18n.properties"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"editor": "./advanced",
				"parameters": {
					"param": {

					},
					"string": {
						"value": "{i18n>TRANSLATED_STRING_VALUE}"
					},
					"object": {
						"value": {}
					},
					"objectWithPropertiesDefined": {
						"value": { "text": "{i18n>TRANSLATED_STRING_VALUE}", "key": "key01", "type": "type01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "object": {"text": "text01", "key": "key01"} }
					},
					"objectsWithPropertiesDefined": {
						"value": [
							{ "text": "{i18n>TRANSLATED_STRING_VALUE}", "key": "key01", "type": "type01", "url": "https://sap.com/06", "icon": "sap-icon://accept", "int": 1, "editable": true, "object": {"text": "text01", "key": "key01"} }
						]
					}
				}
			}
		}
	},
	baseUrl: "./"
};

function init() {
	sap.ui.require(["sap-ui-integration-editor"], function() {
		sap.ui.require(["sap/ui/integration/designtime/editor/CardEditor", "sap/base/Log"], function (CardEditor, Log) {
			function placeAdvancedEditor(domElement, sItem) {
				var oAdvancedEditor = new CardEditor({
					mode: "admin",
					card: oAdvancedSettings,
					allowSettings: true
				});
				oAdvancedEditor._startEditor = function () {
					var mItems = this._oDesigntimeInstance.settings.form.items;
					for (var n in mItems) {
						if (n !== sItem) {
							delete mItems[n];
						}
					}
					CardEditor.prototype._startEditor.apply(this, arguments);
				};
				oAdvancedEditor.attachReady(function (oEditor, i) {
					domElement.innerHTML = "";
					oAdvancedEditor.placeAt(domElement);
				}.bind(null, oEditor, i));
			};
			var aSamples = document.querySelectorAll("td[data-sample]");
			for (var i = 0; i < aSamples.length; i++) {
				try {
					var iSample = aSamples[i].dataset.sample;
					if (!iSample) {
						var sItem = aSamples[i].dataset.item;
						if (!sItem) {
							continue
						}
						placeAdvancedEditor(aSamples[i], sItem);
					} else {
						var sCode = document.querySelector("pre[data-sample='" + iSample + "']").innerText,
						oConfig = JSON.parse(sCode);
						if (!oConfig.param1) {
							oConfig = {
								param: oConfig
							}
						}
						var oEditor = new CardEditor({
							mode: "admin",
							card: oBasicSettings,
							allowSettings: true,
							designtime: {
								form: {
									items: oConfig
								}
							}
						});
						oEditor.attachReady(function (oEditor, i) {
							aSamples[i].innerHTML = "";
							oEditor.placeAt(aSamples[i]);
						}.bind(null, oEditor, i));
					}
				} catch (ex) {
					Log.error("Fail to load cards designtime: " + ex);
				}
			}
			var aSpecialSamples = document.querySelectorAll("div[data-sample]");
			for (var i = 0; i < aSpecialSamples.length; i++) {
				try {
					placeAdvancedEditor(aSpecialSamples[i], aSpecialSamples[i].dataset.item);
				} catch (ex) {
					Log.error("Fail to load cards designtime: " + ex);
				}
			}
		})
	});
}
window._samples = {};