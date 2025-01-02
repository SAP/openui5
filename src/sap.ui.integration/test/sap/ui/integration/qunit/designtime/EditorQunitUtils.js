sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"./../editor/ContextHost"
], function(
	Localization,
	QUnitUtils,
	KeyCodes,
	Editor,
	Host,
	ContextHost
) {
	"use strict";

	var EditorQunitUtils = {};

	/**
	 * @param {sap.m.Input} oControl - Control to set the value on
	 * @param {string} sValue - Value to set
	*/
	EditorQunitUtils.setInputValue = function(oControl, sValue) {
		var oInputControl = oControl.$("inner");
		oInputControl.focus();
		oInputControl.val(sValue);
		QUnitUtils.triggerEvent("input", oInputControl);
	};

	/**
	 * @param {sap.m.SearchField} oControl - Control to set the value on
	 * @param {string} sValue - Value to set
	*/
	EditorQunitUtils.setSearchFieldValue = function(oControl, sValue) {
		var oInputControl = oControl.$("I");
		oInputControl.focus();
		oInputControl.val(sValue);
		QUnitUtils.triggerEvent("input", oInputControl);
	};

	/**
	 * @param {sap.m.ComboBox} oControl - Control to set the value on
	 * @param {string} sKey - Value to select from the available options
	*/
	EditorQunitUtils.selectComboBoxValue = function(oControl, sKey) {
		var sValue = oControl.getItemByKey(sKey).getText();
		this.setInputValueAndConfirm(oControl, sValue);
	};

	/**
	 * @param {sap.m.InputBase} oControl - Control to set the value on
	 * @param {string} sValue - Custom value to set
	*/
	EditorQunitUtils.setInputValueAndConfirm = function(oControl, sValue) {
		this.setInputValue(oControl, sValue);
		var oControlDomRef = oControl.getDomRef();
		QUnitUtils.triggerKeydown(oControlDomRef, KeyCodes.ENTER);
	};

	/**
	 * @param {sap.m.MultiInput} oControl - Control to add the value to
	 * @param {string} sValue - Value to add
	*/
	EditorQunitUtils.addToMultiInput = function(oControl, sValue) {
		this.setInputValue(oControl, sValue);
		QUnitUtils.triggerKeydown(oControl.getDomRef(), KeyCodes.ENTER);
	};

	EditorQunitUtils.openColumnMenu = function(oColumn, assert) {
		return new Promise(function(resolve) {
			var oHeaderMenu = oColumn.getHeaderMenuInstance();
			assert.ok(oHeaderMenu, "EditorQunitUtils openColumnMenu: header menu instance ok");
			// attach to event beforeOpen
			oHeaderMenu.attachEventOnce("beforeOpen", function() {
				setTimeout(function() {
					assert.ok(oColumn._isHeaderMenuOpen(), "EditorQunitUtils openColumnMenu: ColumnMenu is open");
					resolve();
				}, 200);
			});
			var oElement = oColumn.getDomRef();
			assert.ok(oElement, "EditorQunitUtils openColumnMenu: column domref ok");
			oElement.focus();
			QUnitUtils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
			QUnitUtils.triggerMouseEvent(oElement, "click");
			assert.ok(oElement, "EditorQunitUtils openColumnMenu: click column ok");
		});
	};

	EditorQunitUtils.tableUpdated = function(oField) {
		return new Promise(function(resolve) {
			oField.attachEventOnce("tableUpdated", function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.beforeEachTest = function(oHostConfig, oContextHostConfig) {
		oHostConfig = Object.assign({
			"id": "host",
			"getDestinations": function () {
				return new Promise(function (resolve) {
					EditorQunitUtils.wait().then(function () {
						resolve([
							{
								"name": "Products"
							},
							{
								"name": "Orders"
							},
							{
								"name": "Portal"
							},
							{
								"name": "Northwind"
							}
						]);
					});
				});
			}
		}, oHostConfig);
		oContextHostConfig = Object.assign({
			"id":"contexthost"
		}, oContextHostConfig);
		this.oHost = new Host(oHostConfig.id);
		this.oHost.getDestinations = oHostConfig.getDestinations;
		this.oContextHost = new ContextHost(oContextHostConfig.id);

		return this.createEditor();
	};

	EditorQunitUtils.afterEachTest = function(oEditor, sandbox, oMockServer) {
		oEditor.destroy();
		sandbox.restore();
		oMockServer && oMockServer.destroy();
		this.oHost && this.oHost.destroy();
		this.oContextHost && this.oContextHost.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	};

	EditorQunitUtils.createEditor = function(sLanguage, oDesigntime) {
		sLanguage = sLanguage || "en";
		Localization.setLanguage(sLanguage);
		var oEditor = new Editor({
			designtime: oDesigntime
		});
		var oContent = document.getElementById("content");
		if (!oContent) {
			oContent = document.createElement("div");
			oContent.style.position = "absolute";
			oContent.style.top = "200px";
			oContent.style.width = "800px";
			oContent.style.background = "white";

			oContent.setAttribute("id", "content");
			document.body.appendChild(oContent);
			document.body.style.zIndex = 1000;
		}
		oEditor.placeAt(oContent);
		return oEditor;
	};

	EditorQunitUtils.isFieldReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachFieldReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.isDestinationReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachDestinationReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.isUIReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachUIReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.isReady = function(oEditor) {
		return new Promise(function(resolve) {
			oEditor.attachReady(function() {
				resolve();
			});
		});
	};

	EditorQunitUtils.wait = function(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	};

	EditorQunitUtils.getRandomElementsOfArray = function(aArray, count) {
		var result = [];
		for (var i = 0; i < count; i++) {
			if (aArray.length === 0) {
				break;
			}
			var randomIndex = Math.floor(Math.random() * aArray.length);
			result.push(aArray[randomIndex]);
			aArray.splice(randomIndex, 1);
		}
		return result;
	};

	EditorQunitUtils.getRandomPropertiesOfObject = function(oObject, count) {
		var aKeys = Object.keys(oObject);
		if (aKeys.length <= 3 || (count && count >= aKeys.length)) {
			return oObject;
		}
		if (!count || count < 0) {
			count = count || aKeys.length / 3;
			count = count > 2 ? count : 3;
		}
		var aSubKeys = EditorQunitUtils.getRandomElementsOfArray(aKeys, count);
		var oSubObject = {};
		aSubKeys.forEach(function(sKey) {
			oSubObject[sKey] = oObject[sKey];
		});
		return oSubObject;
	};

	EditorQunitUtils.performance = {
		action: 150,
		interaction: 1000,
		complexInteraction: 3000
	};

	return EditorQunitUtils;
});
