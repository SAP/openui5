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
					"stringParameter": {}
				}
			},
			"header": {
				"title": "Card Title",
				"subTitle": "Card Sub Title",
				"icon": {
					"src": "sap-icon://accept"
				}
			},
		}
	};

function switchTheme(oSelect) {
	sap.ui.getCore().applyTheme(oSelect.options[oSelect.selectedIndex].value);
}

function switchLanguage(oSelect) {
	this._sLanguage = oSelect.options[oSelect.selectedIndex].value;
	sap.ui.getCore().getConfiguration().setLanguage(this._sLanguage);
	updateAllLayerCard();
	loadAllChanges();
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
	localStorage.setItem(localStorageKey + id, JSON.stringify(o, null, "\t"));
	updateAllLayerCard();
}
function deleteCurrentValues(id) {
	localStorage.removeItem(localStorageKey + id);
	loadCurrentValues(id);
	updateAllLayerCard();
}
function createCardEditorTag(id, changes, mode, language, designtime, previewPosition) {
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
	previewPosition = previewPosition || "right";
	return '<ui-integration-card-editor id="' + id +
		'" preview-position="' + previewPosition +
		'" mode="' + mode +
		'" language="' + language +
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
	div.innerHTML = createCardEditorTag(id, [settings], dom.getAttribute("mode"), sLanguage, dom.getAttribute("designtime") || "", dom.getAttribute("preview-position"));
	dom.parentNode.replaceChild(div.firstChild, dom);
}

function loadAllChanges() {
	loadCurrentValues("cardEditorAdmin");
	loadCurrentValues("cardEditorContent")
	loadCurrentValues("cardEditorTranslation");
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
	sap.ui.require(['sap/base/util/LoaderExtensions', "sap/ui/core/Core"],
	function (LoaderExtensions, Core) {
		//load the language list
		var aLanguageList = LoaderExtensions.loadResource("sap/ui/integration/editor/languages.json", {
			dataType: "json",
			failOnError: false,
			async: false
		});
		var sCurrentLanguage =  Core.getConfiguration().getLanguage().replaceAll('_', '-');
		var oLanguageSelect = document.getElementById("languageSelect");
		if (!oLanguageSelect) return;
		for (var sLanguage in aLanguageList) {
			var oOption = document.createElement("OPTION");
			oOption.text = aLanguageList[sLanguage];
			oOption.value = sLanguage;
			if (sLanguage === sCurrentLanguage) {
				oOption.selected = true;
			}
			oLanguageSelect.add(oOption);
		}
		var oTranslationLanguageSelectForOnlyMode = document.getElementById("translationLanguageSelectForOnlyMode");
		if (!oTranslationLanguageSelectForOnlyMode) return;
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
		var oTranslationLanguageSelectForAllMode = document.getElementById("translationLanguageSelectForAllMode");
		if (!oTranslationLanguageSelectForAllMode) return;
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
