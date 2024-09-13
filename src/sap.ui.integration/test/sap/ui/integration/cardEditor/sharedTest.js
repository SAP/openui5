/* eslint-disable */

var baseUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/")+1),
	localStorageKey = document.querySelector("script[localstoragekey]").getAttribute("localstoragekey"),
	manifest = {
		"sap.app": {
			"id": "test.sample",
			"type": "card",
			"i18n": "designtime/i18n/i18n.properties",
			"title": "Test Card for Parameters",
			"subTitle": "Test Card for Parameters"
		},
		"sap.card": {
			"designtime": "designtime/withPreview/",
			"type": "List",
			"configuration": {
				"parameters": {
					"stringParameter": {},
					"cardTitle": {
						"value": "Card Title"
					}
				}
			},
			"header": {
				"title": "{parameters>/cardTitle/value}",
				"subTitle": "Card Sub Title",
				"icon": {
					"src": "sap-icon://accept"
				}
			},
			"content": {
				"data": {
					"json": [{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant",
							"Highlight": "Error"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer",
							"Highlight": "Warning"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional",
							"Highlight": "Success"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max. 1920 x 1080",
							"Highlight": "Information"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Print 2400 dpi image quality color documents",
							"Highlight": "None"
						}
					]
				},
				"maxItems": 4,
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

function switchTheme(oSelect) {
	sap.ui.require(["sap/ui/core/Theming"], function(Theming) {
		Theming.setTheme(oSelect.options[oSelect.selectedIndex].value);
	});
}

function switchLanguage(oSelect) {
	sap.ui.require([
		"sap/base/i18n/Localization",
		'sap/base/util/LoaderExtensions',
		"sap/ui/integration/util/Utils"
	], function (
		Localization,
		LoaderExtensions,
		Utils
	) {
		this._sLanguage = oSelect.options[oSelect.selectedIndex].value;
		Localization.setLanguage(this._sLanguage);
		updateAllLayerCard();
		loadAllChanges();
	});
}

function switchTranslationLanguageForOnlyMode(oSelect) {
	this._sTranslationLanguageForOnlyMode = oSelect.options[oSelect.selectedIndex].value;
	loadCurrentValues("cardEditorTranslation");
}

function switchTranslationLanguageForAllMode(oSelect) {
	this._sTranslationLanguageForAllMode = oSelect.options[oSelect.selectedIndex].value;
	updateAdminContentTranslationLayerCard();
}

function init() {
	sap.ui.require(["sap-ui-integration-card-editor"], function () {
		loadLanguages();
		updateAllLayerCard();
		loadAllChanges();
		//load common implementation for host testing
		sap.ui.require(["testjs/HostImpl"]);
	});

	// Simulate library location for the shared extension
	sap.ui.loader.config({
		paths: {
			"sap/ui/integration/cardEditor/test/testLib": sap.ui.require.toUrl("sap/ui/integration/cardEditor/test/testLib")
		}
	});
}

function getItem(id) {
	return JSON.parse(localStorage.getItem(localStorageKey + id) || "{}");
}

function showCurrentValues(id) {
	var o = document.getElementById(id).getCurrentSettings();
	console.log(o);
	alert(JSON.stringify(o, null, "\t"));
}

function saveCurrentValues(id) {
	var o = document.getElementById(id).getCurrentSettings();
	if (id === "cardEditorAdminContent") {
		id = "cardEditorContent";
	}
	if (id === "cardEditorAdminContentTranslation") {
		id = "cardEditorTranslation";
	}
	localStorage.setItem(localStorageKey + id, JSON.stringify(o, null, "\t"));
	updateAllLayerCard();
}

function deleteCurrentValues(id) {
	localStorage.removeItem(localStorageKey + id);
	loadCurrentValues(id);
	updateAllLayerCard();
}

function createCardEditorTag(id, changes, mode, language, designtime, previewPosition, height) {
	language = language || "";
	var card = {
		"manifest": "manifest.json",
		"host": "host",
		"manifestChanges": changes,
		"baseUrl": baseUrl
	};
	if (designtime && designtime !== "") {
		manifest["sap.card"].designtime = "withPreview/" + designtime;
		card.manifest = manifest;
	}
	height = height || "",
	previewPosition = previewPosition || "right";
	return '<ui-integration-card-editor id="' + id +
		'" preview-position="' + previewPosition +
		'" mode="' + mode +
		'" language="' + language +
		'" height="' + height +
		'" allow-dynamic-values="true" allow-settings="true" host="host"' +
		'" card=\'' + JSON.stringify(card).replaceAll("'", "&apos;") +
		'\'></ui-integration-card-editor>';
}

function loadCurrentValues(id) {
	var dom = document.getElementById(id);
	if (!dom) return;
	var settings = getItem(id),
		div = document.createElement("div");
	var sLanguage;
	if (id === "cardEditorTranslation") {
		sLanguage = this._sTranslationLanguageForOnlyMode || "ru";
	} else {
		sLanguage = this._sLanguage || dom.getAttribute("language") || "";
	}
	div.innerHTML = createCardEditorTag(id, [settings], dom.getAttribute("mode"), sLanguage, dom.getAttribute("designtime") || "", dom.getAttribute("preview-position"), dom.getAttribute("height"));
	dom.parentNode.replaceChild(div.firstChild, dom);
}

function loadAllChanges() {
	loadCurrentValues("cardEditorAdmin");
	loadCurrentValues("cardEditorContent")
	loadCurrentValues("cardEditorTranslation");
	loadCurrentValues("separatePreview");
	loadCurrentValues("previewAbstract");
	loadCurrentValues("previewAbstractLive");
	loadCurrentValues("previewLive")
	loadCurrentValues("previewLiveAbstract");
	loadCurrentValues("previewLiveOwnImage");
	loadCurrentValues("previewOwnImageLive")
	loadCurrentValues("previewNone");
	loadCurrentValues("previewNoScale");
}

function loadLanguages() {
	sap.ui.require([
		"sap/base/i18n/Localization",
		'sap/base/util/LoaderExtensions',
		"sap/ui/integration/util/Utils"
	], function (
		Localization,
		LoaderExtensions,
		Utils
	) {
		//load the language list
		var aLanguageList = LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
			dataType: "json",
			failOnError: false,
			async: false
		});
		var sCurrentLanguage =  Localization.getLanguage().replaceAll('_', '-');
		var oLanguageSelect = document.getElementById("languageSelect");
		if (oLanguageSelect) {
			for (var sLanguage in aLanguageList) {
				var oOption = document.createElement("OPTION");
				oOption.text = aLanguageList[sLanguage];
				oOption.value = sLanguage;
				if (sLanguage === sCurrentLanguage) {
					oOption.selected = true;
				}
				oLanguageSelect.add(oOption);
			}
			for (var sLanguage in Utils.languageMapping) {
				var oOption = document.createElement("OPTION");
				oOption.text =  sLanguage + "/" + Utils.languageMapping[sLanguage];
				oOption.value = sLanguage;
				if (sLanguage === sCurrentLanguage) {
					oOption.selected = true;
				}
				oLanguageSelect.add(oOption);
			}
		}
		var oTranslationLanguageSelectForOnlyMode = document.getElementById("translationLanguageSelectForOnlyMode");
		if (oTranslationLanguageSelectForOnlyMode) {
			var sTranslationLanguageForOnlyMode = this._sTranslationLanguageForOnlyMode || "ru";
			for (var sLanguage in aLanguageList) {
				var oOption = document.createElement("OPTION");
				oOption.text = aLanguageList[sLanguage];
				oOption.value = sLanguage;
				if (sLanguage === sTranslationLanguageForOnlyMode) {
					oOption.selected = true;
				}
				oTranslationLanguageSelectForOnlyMode.add(oOption);
			}
			for (var sLanguage in Utils.languageMapping) {
				var oOption = document.createElement("OPTION");
				oOption.text =  sLanguage + "/" + Utils.languageMapping[sLanguage];
				oOption.value = sLanguage;
				if (sLanguage === sTranslationLanguageForOnlyMode) {
					oOption.selected = true;
				}
				oTranslationLanguageSelectForOnlyMode.add(oOption);
			}
		}
		var oTranslationLanguageSelectForAllMode = document.getElementById("translationLanguageSelectForAllMode");
		if (oTranslationLanguageSelectForAllMode) {
			var sTranslationLanguageForAllMode = this._sTranslationLanguageForAllMode || "ru";
			for (var sLanguage in aLanguageList) {
				var oOption = document.createElement("OPTION");
				oOption.text = aLanguageList[sLanguage];
				oOption.value = sLanguage;
				if (sLanguage === sTranslationLanguageForAllMode) {
					oOption.selected = true;
				}
				oTranslationLanguageSelectForAllMode.add(oOption);
			}
			for (var sLanguage in Utils.languageMapping) {
				var oOption = document.createElement("OPTION");
				oOption.text =  sLanguage + "/" + Utils.languageMapping[sLanguage];
				oOption.value = sLanguage;
				if (sLanguage === sTranslationLanguageForAllMode) {
					oOption.selected = true;
				}
				oTranslationLanguageSelectForAllMode.add(oOption);
			}
		}
	});
}

function updateAllLayerCard() {
	updateAdminContentTranslationLayerCard();
	updateAdminContentLayerCard();
	var target = document.getElementById("all");
	if (!target) return;
	target.innerHTML = "";
	var settings = [],
		admin = getItem("cardEditorAdmin"),
		content = getItem("cardEditorContent"),
		translation = getItem("cardEditorTranslation");
	settings.push(admin, content, translation);
	target.innerHTML = createCardEditorTag("cardEditorAll", settings, "all", this._sLanguage || "", undefined, "top");
}

function updateAdminContentLayerCard() {
	var target = document.getElementById("admincontent");
	if (!target) return;
	target.innerHTML = "";
	var settings = [],
		admin = getItem("cardEditorAdmin"),
		content = getItem("cardEditorContent");
	settings.push(admin, content);
	target.innerHTML = createCardEditorTag("cardEditorAdminContent", settings, "content", "", undefined, "bottom");
}

function updateAdminContentTranslationLayerCard() {
	var target = document.getElementById("admincontenttranslation");
	if (!target) return;
	target.innerHTML = "";
	var settings = [],
		admin = getItem("cardEditorAdmin"),
		content = getItem("cardEditorContent"),
		translation = getItem("cardEditorTranslation");
	settings.push(admin, content, translation);
	var sLanguage = this._sTranslationLanguageForAllMode || "ru";
	target.innerHTML = createCardEditorTag("cardEditorAdminContentTranslation", settings, "translation", sLanguage);
}

function showEditorInDialog(oButton) {
	sap.ui.require(["sap/m/Dialog", "sap/ui/integration/designtime/editor/CardEditor"], function (Dialog, CardEditor) {
		var oCard = {
			"manifest": "manifest_i18n.json",
			"host": "host",
			"baseUrl": baseUrl
		};
		var oCardEditor = new CardEditor({
			card: oCard,
			allowSettings: true
		});
		var oSeparateEditorDialog= new Dialog({
			title: "Card Editor In Dailog",
			contentWidth: "680px",
			//contentHeight: "400px",
			resizable: true,
			content: oCardEditor,
			endButton: new sap.m.Button({
				text: "Close",
				press: function () {
					oSeparateEditorDialog.destroyContent();
					oSeparateEditorDialog.close();
				}
			})
		});
		oSeparateEditorDialog._onResize = function () {
			Dialog.prototype._onResize.call(this);
			var oDialogDom = oSeparateEditorDialog.getDomRef();
			if (oDialogDom) {
				var iHeight = oDialogDom.style.height;
				oCardEditor.setHeight(iHeight);
			}
		};
		oSeparateEditorDialog.open();
	});
}

function showSeparatePreview(id, oButton, sControlType) {
	var oEditor = document.getElementById(id);
	var oSeparatePreview = oEditor.getSeparatePreview();
	if (oSeparatePreview) {
		if (!sControlType || sControlType === "Popup") {
			sap.ui.require(["sap/m/Popover"], function (Popover) {
				var oSeparatePreviewPopover = new Popover({
					placement: "Right",
					contentWidth: "300px",
					contentHeight: "400px",
					content: oSeparatePreview,
					resizable: true,
					showHeader: false,
					afterClose: function(oEvent) {
						oSeparatePreview.destroy();
					}
				});
				oSeparatePreviewPopover.openBy(oButton);
			});
		} else if (sControlType === "Dialog") {
			sap.ui.require(["sap/m/Dialog"], function (Dialog) {
				var oSeparatePreviewDialog= new Dialog({
					title: "Card Preview In Dailog",
					contentWidth: "550px",
					contentHeight: "300px",
					resizable: true,
					content: oSeparatePreview,
					endButton: new sap.m.Button({
						text: "Close",
						press: function () {
							oSeparatePreviewDialog.destroyContent();
							oSeparatePreviewDialog.close();
						}
					})
				});
				oSeparatePreviewDialog.open();
			});
		}
	}
}
