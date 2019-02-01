/* global QUnit */

sap.ui.define([
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"sap/ui/thirdparty/sinon-4"
], function(
	AppVariantOverviewUtils,
	AppVariantUtils,
	Settings,
	jQuery,
	waitForThemeApplied,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an AppVariantOverviewUtils is instantiated", {
		beforeEach: function () {
			this.originalUShell = sap.ushell;

			sap.ushell = Object.assign({}, sap.ushell, {
				Container : {
					getService : function() {
						return {
							getLinks: function() {
								return Promise.resolve([{
									result: "success"
								}]);
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
			sap.ushell = this.originalUShell;
		}
	}, function() {

		QUnit.test("When getAppVariantOverviewAttributes() method is called with some missing properties (Key user view) on S4/Hana Cloud", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action"
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, true, "then it is a S4/Hana Cloud system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, true, "then the button Adapt UI is enabled");
				assert.equal(oAppVariantAttributes.delAppVarButtonVisibility, false, "then the button Delete App Variant is not available on an orginal application");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with no intent parameters (Key user view) in on prem system", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				subTitle : "subTitle1",
				description : "description1",
				iconUrl : "sap-icon://history",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action"
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params, undefined, "then the params property does not exist");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, false, "then it is an S4/Hana on prem system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, true, "then the button Adapt UI is enabled");
				assert.equal(oAppVariantAttributes.delAppVarButtonVisibility, false, "then the button Delete App Variant is not available on an original application");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with intent parameter as an object (Key user view) on cloud system", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				subTitle : "subTitle1",
				description : "description1",
				iconUrl : "sap-icon://history",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action",
					"parameters": {
						"sap-appvar-id" : {
							value: "id1",
							required: true
						}
					}
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params["sap-appvar-id"], "id1", "then the intent property's value is correct");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with intent parameter as a string (Key user view) in on prem system", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				subTitle : "subTitle1",
				description : "description1",
				iconUrl : "sap-icon://history",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action",
					"parameters": {
						"sap-appvar-id" : "id1"
					}
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params["sap-appvar-id"], "id1", "then the intent property's value is correct");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on a reference app (currently adapting) which also has intent information present (Key user view) on S4 cloud system", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: false,
							descriptorUrl : "url1",
							hasStartableIntent: true,
							startWith: {
								"semanticObject": "SemObj",
								"action": "Action",
								"parameters": {
									"sap-appvar-id" : {
										value: "id1"
									}
								}
							}
						}
					]
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			var sendRequestStub = sandbox.stub(AppVariantOverviewUtils, "sendRequest").resolves(oResult);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", true).then(function(aAppVariantOverviewAttributes){
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");
				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.equal(aAppVariantOverviewAttributes[0].iconText, "history", "then the icon tooltip text of an app variant is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, "SemObj", "then the semantic object is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, "Action", "then the action is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, true, "then the app is adaptable");
				assert.ok(AppVariantOverviewUtils.sendRequest.calledOnce, "then the sendRequest is called once");
				assert.strictEqual(sendRequestStub.firstCall.args[0], "/sap/bc/lrep/app_variant_overview/?sap.app/id=testId&layer=CUSTOMER*", "then the route is correct");
				assert.strictEqual(sendRequestStub.firstCall.args[1], "GET", "then the operation is correct");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which is laid in the customer layer (SAP developer view) on cloud system", function (assert) {
			var oResult = {
				response: {}
			};

			var sendRequestStub = sandbox.stub(AppVariantOverviewUtils, "sendRequest").resolves(oResult);

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", false).then(function(aAppVariantOverviewAttributes){
				assert.equal(aAppVariantOverviewAttributes.length, 0, "then the result contains no app variant entries");
				assert.ok(AppVariantOverviewUtils.sendRequest.calledOnce, "then the sendRequest is called once");
				assert.strictEqual(sendRequestStub.firstCall.args[0], "/sap/bc/lrep/app_variant_overview/?sap.app/id=testId&layer=VENDOR", "then the route is correct");
				assert.strictEqual(sendRequestStub.firstCall.args[1], "GET", "then the operation is correct");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on a reference app (currently adapting) which also has intent information present (SAP developer view) on prem system", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: false,
							descriptorUrl : "url1",
							hasStartableIntent: false
						}
					]
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":false,
					"isAtoEnabled":false,
					"isProductiveSystem":false
				})
			);

			var sendRequestStub = sandbox.stub(AppVariantOverviewUtils, "sendRequest").resolves(oResult);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", false).then(function(aAppVariantOverviewAttributes){
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");
				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.equal(aAppVariantOverviewAttributes[0].iconText, "history", "then the icon tooltip text of an app variant is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, false, "then the app is not adaptable");
				assert.ok(AppVariantOverviewUtils.sendRequest.calledOnce, "then the sendRequest is called once");
				assert.strictEqual(sendRequestStub.firstCall.args[0], "/sap/bc/lrep/app_variant_overview/?sap.app/id=testId&layer=VENDOR", "then the route is correct");
				assert.strictEqual(sendRequestStub.firstCall.args[1], "GET", "then the operation is correct");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which has no intent information present (Key user view) on cloud system", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							originLayer: "VENDOR",
							isOriginal : false,
							isAppVariant: true,
							descriptorUrl : "url1",
							hasStartableIntent: false,
							startWith: {
								"semanticObject": "",
								"action": "",
								"parameters": {}
							}
						},
						{
							appId : "id2",
							title : "title2",
							subTitle : "subTitle2",
							description : "description2",
							iconUrl : "sap-icon://account",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: false,
							descriptorUrl : "url2",
							hasStartableIntent: true,
							startWith: {
								"semanticObject": "SemObj",
								"action": "Action",
								"parameters": {
									"sap-appvar-id" : "id2"
								}
							}
						}
					]
				}
			};

			var sendRequestStub = sandbox.stub(AppVariantOverviewUtils, "sendRequest").resolves(oResult);
			AppVariantUtils.setNewAppVariantId("id1");

			var oResourceBundlePromise = jQuery.sap.resources({
				url: jQuery.sap.getModulePath("sap.ui.rta.appVariant.manageApps.webapp.i18n", "/i18n.properties"),
				async: true
			});

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			return Promise.all([AppVariantOverviewUtils.getAppVariantOverview("testId", true), oResourceBundlePromise]).then(function(aParams) {
				var aAppVariantOverviewAttributes = aParams[0], oResourceBundle = aParams[1];

				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");

				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of first app(variant) is correct");
				assert.equal(aAppVariantOverviewAttributes[0].iconText, "history", "then the icon tooltip text of a first app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[1].icon, "sap-icon://account", "then the icon of second app is correct");
				assert.equal(aAppVariantOverviewAttributes[1].iconText, "account", "then the icon tooltip text of a second app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, undefined, "then the semantic object of first app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[1].semanticObject, "SemObj", "then the semantic object of second app is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, undefined, "then the action of first app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[1].action, "Action", "then the action of second app is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, false, "then the first app(variant) is not adaptable");
				assert.equal(aAppVariantOverviewAttributes[1].adaptUIButtonEnabled, true, "then the second app is adaptable");
				assert.equal(aAppVariantOverviewAttributes[0].currentStatus, oResourceBundle.getText("MAA_NEW_APP_VARIANT"), "then the first app(variant) is highlighted blue");
				assert.ok(AppVariantOverviewUtils.sendRequest.calledOnce, "then the sendRequest is called once");
				assert.strictEqual(sendRequestStub.firstCall.args[0], "/sap/bc/lrep/app_variant_overview/?sap.app/id=testId&layer=CUSTOMER*", "then the route is correct");
				assert.strictEqual(sendRequestStub.firstCall.args[1], "GET", "then the operation is correct");
			});
		});
	});

	QUnit.module("Given an AppVariantOverviewUtils is instantiated", {
		beforeEach: function () {
			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = Object.assign({}, sap.ushell, {
				Container : {
					getService : function() {
						return {
							getLinks: function() {
								return Promise.resolve([]);
							}
						};
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
			sap.ushell = this.originalUShell;
		}
	}, function() {
		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which is also a reference app and has intent information present (Key user view) on cloud system", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: true,
							descriptorUrl : "url1",
							hasStartableIntent: true,
							startWith: {
								"semanticObject": "SemObj",
								"action": "Action",
								"parameters": {
									"sap-appvar-id" : "id1"
								}
							}
						}
					]
				}
			};

			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					"isKeyUser":true,
					"isAtoAvailable":true,
					"isAtoEnabled":true,
					"isProductiveSystem":false
				})
			);

			var sendRequestStub = sandbox.stub(AppVariantOverviewUtils, "sendRequest").resolves(oResult);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", true).then(function(aAppVariantOverviewAttributes){
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");

				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, "SemObj", "then the semantic object is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, "Action", "then the action is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, false, "then the app is not adaptable");
				assert.ok(AppVariantOverviewUtils.sendRequest.calledOnce, "then the sendRequest is called once");
				assert.strictEqual(sendRequestStub.firstCall.args[0], "/sap/bc/lrep/app_variant_overview/?sap.app/id=testId&layer=CUSTOMER*", "then the route is correct");
				assert.strictEqual(sendRequestStub.firstCall.args[1], "GET", "then the operation is correct");
			});
		});

		QUnit.test("When getDescriptor() method is called", function (assert) {
			var oResult = {
				response: {
					"sap.app" : {
						id : "testId"
					}
				}
			};

			sandbox.stub(AppVariantOverviewUtils, "sendRequest").resolves(oResult);

			return AppVariantOverviewUtils.getDescriptor("testIdDescriptorUrl").then(function(oDescriptor){
				assert.ok(oDescriptor, "then the descriptor of the app is returned");
				assert.strictEqual(oDescriptor["sap.app"].id, "testId", "then the id of the descriptor is right");
				assert.ok(AppVariantOverviewUtils.sendRequest.calledOnce, "then the sendRequest is called once");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});

	return waitForThemeApplied();
});