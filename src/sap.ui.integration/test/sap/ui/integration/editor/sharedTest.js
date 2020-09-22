/* eslint-disable */

var baseUrl = document.location.pathname.substring(0, document.location.pathname.lastIndexOf("/")),
	localStorageKey = document.querySelector("script[localstoragekey]").getAttribute("localstoragekey"),
	manifest = "manifest.json";

function switchTheme(oSelect) {
	sap.ui.getCore().applyTheme(oSelect.options[oSelect.selectedIndex].value);
}

function init() {
	updateAllLayerCard();
	loadAllChanges();
	//load common implementation for host testing
	sap.ui.require(["testjs/HostImpl"]);
}

function setManifest(manifest) {
	this.manifest = manifest;
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
	var editablecheckbox = document.getElementById(id + "-checkbox");
	var visiblecheckbox = document.getElementById(id + "-checkbox-visible");
	if (editablecheckbox) {
		o[":designtime"] = {
			"/form/items/string/editable": !editablecheckbox.checked,
			"/form/items/string/visible": !visiblecheckbox.checked
		};
	}
	localStorage.setItem(localStorageKey + id, JSON.stringify(o, null, "\t"));
	updateAllLayerCard();
}
function deleteCurrentValues(id) {
	localStorage.removeItem(localStorageKey + id);
	loadCurrentValues(id);
	updateAllLayerCard();
}
function createCardEditorTag(id, changes, mode, language) {
	language = language || "";
	var card = {
		"manifest": manifest,
		"host": "host",
		"manifestChanges": changes,
		"baseUrl": baseUrl
	};
	return '<ui-integration-card-editor id="' + id + '" card=\'' + JSON.stringify(card) + '\' mode="' + mode + '" language="' + language + '"></ui-integration-card-editor>';
}
function loadCurrentValues(id) {
	var dom = document.getElementById(id),
		settings = getItem(id),
		div = document.createElement("div");
	if (!dom) return;
	div.innerHTML = createCardEditorTag(id, [settings], dom.getAttribute("mode"), dom.getAttribute("language") || "");
	dom.parentNode.replaceChild(div.firstChild, dom);
}

function loadAllChanges() {
	loadCurrentValues("cardEditorAdmin");
	loadCurrentValues("cardEditorContent")
	loadCurrentValues("cardEditorTranslation");
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
	target.innerHTML = createCardEditorTag("cardEditorAdminContentTranslation", settings, "all", "");
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
