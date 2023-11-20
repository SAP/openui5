/*global QUnit*/
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Supportability",
	"sap/ui/core/support/techinfo/TechnicalInfo",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/date/Gregorian",
	"sap/ui/model/ValidateException",
	"sap/ui/core/Element"
], function (Device, Supportability, TechnicalInfo, ResourceModel, Gregorian, ValidateException, Element) {
	"use strict";

	QUnit.module("Parsing and formatting");

	QUnit.test("Build Date Parsing", function(assert) {
		var sBuildDateSeconds = "20170413152356";
		var sBuildDateMinutes = "201704131523";
		var sBuildDateDash = "20170413-1523";

		// TODO: clarify whether timestamps should be parsed in UTC to prevent timezone conversion
		function equalDate(oDate, iYear, iMonth, iDayInMonth, iHour, iMinutes, iSeconds, sMessage) {
			assert.equal(oDate.getFullYear(), iYear, sMessage + ", year should be " + iYear);
			assert.equal(oDate.getMonth(), iMonth - 1, sMessage + ", month should be " + (iMonth - 1));
			assert.equal(oDate.getDate(), iDayInMonth, sMessage + ", day should be " + iDayInMonth);
			assert.equal(oDate.getHours(), iHour, sMessage + ", hours should be " + iHour);
			assert.equal(oDate.getMinutes(), iMinutes, sMessage + ", minutes should be " + iMinutes);
			assert.equal(oDate.getSeconds(), iSeconds, sMessage + ", seconds should be " + iSeconds);
		}

		equalDate(TechnicalInfo._convertBuildDate(sBuildDateSeconds), 2017, 4, 13, 15, 23, 56, "A build date with seconds is converted properly");
		equalDate(TechnicalInfo._convertBuildDate(sBuildDateMinutes), 2017, 4, 13, 15, 23,  0, "A build date without seconds is converted properly");
		equalDate(TechnicalInfo._convertBuildDate(sBuildDateDash),    2017, 4, 13, 15, 23,  0, "A build date with dash and without seconds is converted properly");
	});

	QUnit.test("Content Density class: Cozy", function(assert) {
		delete TechnicalInfo._sContentDensityClass;
		this.stub(Device.support, "touch").value(true);

		assert.strictEqual(TechnicalInfo._getContentDensityClass(), "sapUiSizeCozy", "The content density is set to 'Cozy'");
	});

	QUnit.test("Content Density class: Compact", function(assert) {
		delete TechnicalInfo._sContentDensityClass;
		this.stub(Device.support, "touch").value(false);

		assert.strictEqual(TechnicalInfo._getContentDensityClass(), "sapUiSizeCompact", "The content density is set to 'Compact'");
	});

	QUnit.module("CustomURLType");
	QUnit.test("URL Validation", function(assert) {
		var aValidValues = [
				"https://sdk.openui5.org/resources/sap/ui/support/",
				"https://www.sap.com:8080/sap/ui/support/"
			],
			aInvalidValues = [
				"ohSnapThisWontWork/sap/ui/support/,",
				"http://ohSnapThisWontWork",
				"http:///ohSn@pThisWontWork/ !/§&/($ __/sap/ui/support/",
				"/sap/ui/support/",
				"john:doe@ftp://sap/ui/support/",
				"http://:8080/sap/ui/support/",
				"http://./..:8080///sap/ui/support/",
				"localhost:80808/",
				"http://sap.com",
				"htt://www.sap.com",
				"://www.sap.com",
				"http://www.0.0.0.0",
				"0.0.0.0:8080/sap/ui/support/",
				"0.0.0.0/sap/ui/support/",
				"localhost:80808/sap/ui/support/"
			],
			aValues = window.location.protocol !== "https:" ? aValidValues : aInvalidValues;

		aValues.push("http://my.server:12345/some/deep/path/sap/ui/support/");
		aValues.push("http://www.sap.com:8080/sap/ui/support/");
		aValues.push("http://0.0.0.0:8080/sap/ui/support/");
		aValues.push("http://localhost:8080/testsuite/resources/sap/ui/support/");

		aValidValues.forEach(function (sValue) {
			assert.ok(TechnicalInfo._validateValue(sValue), "URL '" + sValue + "' is a valid custom bootstrap URL");
		});
		aInvalidValues.forEach(function (sValue) {
			assert.throws(function () {
					TechnicalInfo._validateValue(sValue);
				},
				ValidateException,
				"URL '" + sValue + "' is not a valid custom bootstrap URL");
		});
	});

	QUnit.test("Mode Validation", function(assert) {
		var aValidValues = [
				"x",
				"X",
				"true",
				"false",
				"sap",
				"sap/ui/",
				"sap/ui/Device.js",
				"sap/ui/Device.js,sap/m",
				"sap/ui/Device.js,sap/m/Button.js",
				"sap/u*"
			],
			aInvalidValues = [
				"111",
				"sap is awesome!",
				"http://www.sdk.openui5.org",
				"\"hello\"",
				"sap_ui",
				"\\//\\",
				"l33th4xx0r",
				"alert('here');"
			];

		aValidValues.forEach(function (sValue) {
			assert.ok(TechnicalInfo._validateCustomDebugValue(sValue), "mode '" + sValue + "' is a valid custom debug mode");
		});
		aInvalidValues.forEach(function (sValue) {
			assert.throws(function () {
					TechnicalInfo._validateCustomDebugValue(sValue);
			},
			ValidateException,
			"Mode '" + sValue + "' is not a valid custom debug mode");
		});
	});

	QUnit.module("SaveLocalStorageDefault");

	QUnit.test("Set default value to empty value in local storage", function(assert) {
		TechnicalInfo._storage.clear();
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") == null, "The default is empty");
		TechnicalInfo._saveLocalStorageDefault("sap-ui-selected-location", "standard");
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") === "standard", "The default option is set correctly");
		TechnicalInfo._saveLocalStorageDefault("sap-ui-selected-location", "custom");
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") === "standard", "The default option is set and skipped correctly");
		TechnicalInfo._storage.clear();
	});

	QUnit.module("Set active location", {
		beforeEach: function () {
			TechnicalInfo._storage.clear();
			return TechnicalInfo._loadAndInitialize().then(function() {
				return TechnicalInfo._loadAssistantPopover();
			});
		},
		afterEach: function () {
			TechnicalInfo._pOpenDialog = null;
			TechnicalInfo._oDialog.destroy();
			TechnicalInfo._pAssistantPopover = null;
			TechnicalInfo._oAssistantPopover.destroy();
		}
	});

	QUnit.test("Custom", function (assert) {
		TechnicalInfo._setActiveLocations("custom");
		var oRadioBtnStandard = Element.getElementById("technicalInfoDialogAssistantPopover--standard"),
			oRadioBtnCustom = Element.getElementById("technicalInfoDialogAssistantPopover--custom"),
			oCustom = Element.getElementById("technicalInfoDialogAssistantPopover--customBootstrapURL"),
			oStandard = Element.getElementById("technicalInfoDialogAssistantPopover--standardBootstrapURL");

		assert.ok(oRadioBtnStandard.getSelected() === false, "The standard radio button is not selected");
		assert.ok(oStandard.getEnabled() === false, "The select drop down is disabled");
		assert.ok(oRadioBtnCustom.getSelected() === true, "The custom radio button is selected");
		assert.ok(oCustom.getEnabled() === true, "Custom input filed is enabled");
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") === "custom", "The variable in local storage is updated.");
	});

	QUnit.test("Standard", function (assert) {
		TechnicalInfo._setActiveLocations("standard");
		var oRadioBtnStandard = Element.getElementById("technicalInfoDialogAssistantPopover--standard"),
			oRadioBtnCustom = Element.getElementById("technicalInfoDialogAssistantPopover--custom"),
			oCustom = Element.getElementById("technicalInfoDialogAssistantPopover--customBootstrapURL"),
			oStandard = Element.getElementById("technicalInfoDialogAssistantPopover--standardBootstrapURL");

		assert.ok(oRadioBtnStandard.getSelected() === true, "The standard radio button is selected");
		assert.ok(oStandard.getEnabled() === true, "The select drop down is enabled");
		assert.ok(oRadioBtnCustom.getSelected() === false, "The custom radio button is not selected");
		assert.ok(oCustom.getEnabled() === false, "Custom input filed is disabled");
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") === "standard", "The variable in local storage is updated.");
	});

	QUnit.module("View model");

	QUnit.test("Initialization", function(assert) {
		TechnicalInfo._storage.clear();
		return TechnicalInfo._loadAndInitialize().then(function() {
			var oViewModel = TechnicalInfo._oDialog.getModel("view");
			var aKeys = Object.keys(oViewModel.getData());
			assert.deepEqual(
				aKeys,
				[
					"ProductName",
					"StandardBootstrapURL",
					"CustomBootstrapURL",
					"OpenSupportAssistantInNewWindow",
					"SelectedLocation",
					"OpenUI5ProductVersion",
					"OpenUI5ProductTimestamp",
					"DebugModuleSelectionCount",
					"ProductVersion",
					"ProductTimestamp",
					"DebugModulesTitle",
					"SupportAssistantPopoverURLs",
					"ApplicationURL",
					"UserAgent",
					"DebugMode"
				],
				"The view model has all technical information keys: " + aKeys.toString());

			assert.ok(oViewModel.getProperty("/ProductName").length > 0, "The product name is set");
			assert.ok(oViewModel.getProperty("/ProductVersion").length > 0, "The product version is set");
			assert.ok(oViewModel.getProperty("/SupportAssistantPopoverURLs") instanceof Array, "The support assistant popover urls is a Array");
			assert.ok(oViewModel.getProperty("/SupportAssistantPopoverURLs").length > 0, "The standard url for support assistant popover is set");

			var aUrls = oViewModel.getProperty("/SupportAssistantPopoverURLs");
			for (var i = 0; i < aUrls.length; i++) {
				var aBootstrapKeys = Object.keys(aUrls[i]);
				assert.deepEqual(aBootstrapKeys,["DisplayName","Value"], "The URL " + i + " form SupportAssistantPopoverURLs has the right format keys: " + aBootstrapKeys.toString() );
			}
			assert.ok(oViewModel.getProperty("/SelectedLocation") === "standard" || oViewModel.getProperty("/SelectedLocation") === "custom", "The selected location is set");
			assert.ok(oViewModel.getProperty("/OpenUI5ProductVersion") === null || oViewModel.getProperty("/OpenUI5ProductVersion").length > 0, "The OpenUI5 product version is null or set");
			assert.strictEqual(oViewModel.getProperty("/ApplicationURL"), document.location.href, "The application URL is equal to the 'document.location.href' property");
			assert.strictEqual(oViewModel.getProperty("/UserAgent"), navigator.userAgent, "The user agent is equal to the 'navigator.userAgent' property");
			assert.strictEqual(typeof oViewModel.getProperty("/DebugMode"), "boolean", "The debug mode is a boolean");
			assert.strictEqual(typeof oViewModel.getProperty("/OpenSupportAssistantInNewWindow"), "boolean", "The open support assistant in new window is a boolean");
			assert.strictEqual(oViewModel.getProperty("/DebugMode"), Supportability.isDebugModeEnabled(), "The debug mode is equal to the UI5 core value");

			TechnicalInfo._oDialog.destroy();
		});
	});

	QUnit.module("Closing and destroying dialog");

	QUnit.test("After close method is called, the dialog should be destroyed", function(assert) {
		TechnicalInfo._storage.clear();
		return TechnicalInfo._loadAndInitialize().then(function(oDialog) {
			return TechnicalInfo._loadAssistantPopover();
		}).then(function() {
			return TechnicalInfo._loadDebugPopover();
		}).then(function() {
			return TechnicalInfo.close().then(function() {
				assert.ok(!TechnicalInfo._oDialog, "The dialog is destroyed");
				assert.ok(!TechnicalInfo._oAssistantPopover, "The Support Assistant popover is destroyed");
				assert.ok(!TechnicalInfo._oDebugPopover, "The debug popover is destroyed");
			});
		});
	});

});