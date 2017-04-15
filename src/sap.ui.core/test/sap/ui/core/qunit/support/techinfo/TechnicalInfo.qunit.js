/*global QUnit*/
/*!
 * ${copyright}
 */

sap.ui.require([
	"sap/ui/core/support/techinfo/TechnicalInfo",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/date/Gregorian",
	"sap/ui/model/ValidateException"
], function (TechnicalInfo, ResourceModel, Gregorian, ValidateException) {
	"use strict";

	QUnit.module("Parsing and formatting");

	QUnit.test("Build Date Parsing", function(assert) {
		var sBuildDateSeconds = "20170413152356";
		var sBuildDateMinutes = "201704131523";
		var sBuildDateDash = "20170413-1523";

		// TODO clarify whether timestamps should be parsed in UTC to prevent timezone conversion
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
		this.stub(sap.ui.Device.support, "touch", true);

		assert.strictEqual(TechnicalInfo._getContentDensityClass(), "sapUiSizeCozy", "The content density is set to 'Cozy'");
	});

	QUnit.test("Content Density class: Compact", function(assert) {
		delete TechnicalInfo._sContentDensityClass;
		this.stub(sap.ui.Device.support, "touch", false);

		assert.strictEqual(TechnicalInfo._getContentDensityClass(), "sapUiSizeCompact", "The content density is set to 'Compact'");
	});

	QUnit.module("CustomURLType", {
		beforeEach: function() {
			this.oCustomTypeURL =  new TechnicalInfo.CustomTypeURL();
		},
		afterEach: function() {
			this.oCustomTypeURL.destroy();
		}
	});

	QUnit.test("Parsing", function(assert) {
		assert.strictEqual(this.oCustomTypeURL.parseValue("something"), "something", "The value remains unchanged during parsing");
	});

	QUnit.test("Formatting", function(assert) {
		assert.strictEqual(this.oCustomTypeURL.formatValue("something"), "something", "The value remains unchanged during formatting");
	});

	QUnit.test("Validation", function(assert) {
		var sHTTPSCDN = "https://sapui5.hana.ondemand.com/resources/sap/ui/support/",
			sHTTPCustom = "http://my.server:12345/some/deep/path/sap/ui/support/",
			sFaultyURL1 = "ohSnapThisWontWork/sap/ui/support/",
			sFaultyURL2 = "http://ohSnapThisWontWork",
			sFaultyURL3 = "http:///ohSn@pThisWontWork/ !/§&/($ __/sap/ui/support/",
			sFaultyURL4 = "/sap/ui/support/",
			sFaultyURL5 = "john:doe@ftp://sap/ui/support/";

		assert.ok(this.oCustomTypeURL.validateValue(sHTTPSCDN), "URL '" + sHTTPSCDN + "' is a valid custom bootstrap URL");
		assert.ok(this.oCustomTypeURL.validateValue(sHTTPCustom), "URL '" + sHTTPCustom + "' is a valid custom bootstrap URL");
		assert.throws(function() {
				this.oCustomTypeURL.validateValue(sFaultyURL1);
			},
			ValidateException,
			"URL '" + sFaultyURL1 + "' is not a valid custom bootstrap URL");
		assert.throws(function() {
				this.oCustomTypeURL.validateValue(sFaultyURL2);
			},
			ValidateException,
			"URL '" + sFaultyURL2 + "' is not a valid custom bootstrap URL");
		assert.throws(function() {
				this.oCustomTypeURL.validateValue(sFaultyURL3);
			},
			ValidateException,
			"URL '" + sFaultyURL3 + "' is not a valid custom bootstrap URL");
		assert.throws(function() {
				this.oCustomTypeURL.validateValue(sFaultyURL4);
			},
			ValidateException,
			"URL '" + sFaultyURL4 + "' is not a valid custom bootstrap URL");
		assert.throws(function() {
				this.oCustomTypeURL.validateValue(sFaultyURL5);
			},
			ValidateException,
			"URL '" + sFaultyURL5 + "' is not a valid custom bootstrap URL");
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
			var oI18nModel = new ResourceModel({
				bundleName: "sap.ui.core.messagebundle"
			});
			TechnicalInfo._storage.clear();
			TechnicalInfo._oDialog = sap.ui.xmlfragment("technicalInfoDialog", "sap.ui.core.support.techinfo.TechnicalInfo", this);
			TechnicalInfo._oDialog.setModel(oI18nModel, "i18n");
			TechnicalInfo._oDialog.setModel(TechnicalInfo._createViewModel(), "view");
			TechnicalInfo._oAssistantPopover = sap.ui.xmlfragment("technicalInfoDialogAssistantPopover", "sap.ui.core.support.techinfo.TechnicalInfoAssistantPopover", TechnicalInfo);
			TechnicalInfo._oDialog.addDependent(TechnicalInfo._oAssistantPopover);
		},
		afterEach: function () {
			TechnicalInfo._oDialog.destroy();
			TechnicalInfo._oAssistantPopover.destroy();
		}
	});

	QUnit.test("Custom", function (assert) {
		TechnicalInfo._setActiveLocations("custom");
		var oRadioBtnStandard = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standard"),
			oRadioBtnCustom = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--custom"),
			oCustom = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--customBootstrapURL"),
			oStandard = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standardBootstrapURL");

		assert.ok(oRadioBtnStandard.getSelected() === false, "The standard radio button is not selected");
		assert.ok(oStandard.getEnabled() === false, "The select drop down is disabled");
		assert.ok(oRadioBtnCustom.getSelected() === true, "The custom radio button is selected");
		assert.ok(oCustom.getEnabled() === true, "Custom input filed is enabled");
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") === "custom", "The variable in local storage is updated.");
	});

	QUnit.test("Standard", function (assert) {
		TechnicalInfo._setActiveLocations("standard");
		var oRadioBtnStandard = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standard"),
			oRadioBtnCustom = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--custom"),
			oCustom = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--customBootstrapURL"),
			oStandard = sap.ui.getCore().byId("technicalInfoDialogAssistantPopover--standardBootstrapURL");

		assert.ok(oRadioBtnStandard.getSelected() === true, "The standard radio button is selected");
		assert.ok(oStandard.getEnabled() === true, "The select drop down is enabled");
		assert.ok(oRadioBtnCustom.getSelected() === false, "The custom radio button is not selected");
		assert.ok(oCustom.getEnabled() === false, "Custom input filed is disabled");
		assert.ok(TechnicalInfo._storage.get("sap-ui-selected-location") === "standard", "The variable in local storage is updated.");
	});

	QUnit.module("View model");

	QUnit.test("Initialization", function(assert) {
		var oI18nModel = new ResourceModel({
			bundleName: "sap.ui.core.messagebundle"
		});
		TechnicalInfo._storage.clear();
		TechnicalInfo._oDialog = sap.ui.xmlfragment("technicalInfoDialog", "sap.ui.core.support.techinfo.TechnicalInfo", this);
		TechnicalInfo._oDialog.setModel(oI18nModel, "i18n");
		var oViewModel = TechnicalInfo._createViewModel();
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
				"ProductVersion",
				"ProductTimestamp",
				"SupportAssistantPopoverURLs",
				"ApplicationURL",
				"UserAgent",
				"DebugMode"
			],
			"The view model has all technical information keys: " + aKeys.toString());

		assert.ok(oViewModel.getProperty("/ProductName").length > 0, "The product name is set");
		assert.ok(oViewModel.getProperty("/ProductVersion").length > 0, "The product version is set");
		assert.ok(oViewModel.getProperty("/ProductTimestamp") instanceof Date, "The product timestamp is a Date");
		assert.ok(oViewModel.getProperty("/SupportAssistantPopoverURLs") instanceof Array, "The support assistant popover urls is a Array");
		assert.ok(oViewModel.getProperty("/SupportAssistantPopoverURLs").length > 0, "The standard url for support assistant popover is set");

		var aUrls = oViewModel.getProperty("/SupportAssistantPopoverURLs");
		for (var i = 0; i < aUrls.length; i++) {
			var aBootstrapKeys = Object.keys(aUrls[i]);
			assert.deepEqual(aBootstrapKeys,["DisplayName","Value"], "The URL " + i + " form SupportAssistantPopoverURLs has the right format keys: " + aBootstrapKeys.toString() );
		}
		assert.ok(oViewModel.getProperty("/SelectedLocation") === "standard" || oViewModel.getProperty("/SelectedLocation") === "custom", "The selected location is set");
		assert.ok(oViewModel.getProperty("/OpenUI5ProductVersion") === null || oViewModel.getProperty("/OpenUI5ProductVersion").length > 0, "The OpenUI5 product version is null or set");
		assert.ok(oViewModel.getProperty("/OpenUI5ProductTimestamp") === null || oViewModel.getProperty("/OpenUI5ProductTimestamp") instanceof Date, "The OpenUI5 product timestamp is null or a Date");
		assert.strictEqual(oViewModel.getProperty("/ApplicationURL"), document.location.href, "The application URL is equal to the 'document.location.href' property");
		assert.strictEqual(oViewModel.getProperty("/UserAgent"), navigator.userAgent, "The user agent is equal to the 'navigator.userAgent' property");
		assert.strictEqual(typeof oViewModel.getProperty("/DebugMode"), "boolean", "The debug mode is a boolean");
		assert.strictEqual(typeof oViewModel.getProperty("/OpenSupportAssistantInNewWindow"), "boolean", "The open support assistant in new window is a boolean");
		assert.strictEqual(oViewModel.getProperty("/DebugMode"), sap.ui.getCore().getConfiguration().getDebug(), "The debug mode is equal to the UI5 core value");
	});

});