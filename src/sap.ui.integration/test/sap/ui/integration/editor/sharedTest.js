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

function init() {
	sap.ui.require(["sap-ui-integration-editor"], function () {
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
	var o = document.getElementById(id).getCurrentSettings()
	localStorage.setItem(localStorageKey + id, JSON.stringify(o, null, "\t"));
	updateAllLayerCard();
}
function deleteCurrentValues(id) {
	localStorage.removeItem(localStorageKey + id);
	loadCurrentValues(id);
	updateAllLayerCard();
}
function createCardEditorTag(id, changes, mode, language, designtime) {
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
	return '<ui-integration-card-editor id="' + id +
		'" card=\'' + JSON.stringify(card) +
		'\' mode="' + mode +
		'" language="' + language +
		'" allow-dynamic-values="true" allow-settings="true"></ui-integration-card-editor>';
}
function loadCurrentValues(id) {
	var dom = document.getElementById(id);
	if (!dom) return;
	var settings = getItem(id),
		div = document.createElement("div");
	div.innerHTML = createCardEditorTag(id, [settings], dom.getAttribute("mode"), dom.getAttribute("language") || "", dom.getAttribute("designtime") || "");
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
	target.innerHTML = createCardEditorTag("cardEditorAll", settings, "all", "");
}

function updateAdminContentLayerCard() {
	var target = document.getElementById("admincontent");
	if (!target) return;
	target.innerHTML = "";
	var settings = [],
		admin = getItem("cardEditorAdmin"),
		content = getItem("cardEditorContent");
	settings.push(admin, content);
	target.innerHTML = createCardEditorTag("cardEditorAdminContent", settings, "content", "");
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
	target.innerHTML = createCardEditorTag("cardEditorAdminContentTranslation", settings, "translation", "ru");
}
