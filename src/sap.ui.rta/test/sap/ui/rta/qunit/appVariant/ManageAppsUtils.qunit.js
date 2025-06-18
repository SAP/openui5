/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexRuntimeInfoAPI,
	AppVariantWriteAPI,
	Layer,
	FlUtils,
	ManageAppsController,
	AppVariantUtils,
	AppVariantOverviewUtils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given an AppVariantOverviewUtils is instantiated", {
		async before() {
			const oManageAppsController = new ManageAppsController();
			await oManageAppsController._createResourceBundle();
			this.oI18n = oManageAppsController._oI18n;
		},
		beforeEach() {
			this.oUshellContainerStub = {
				getServiceAsync() {
					return Promise.resolve({
						getLinks() {
							return Promise.resolve([[{result: "success"}]]);
						}
					});
				},
				setDirtyFlag() {
					return "";
				}
			};
			sandbox.stub(FlUtils, "getUshellContainer").returns(this.oUshellContainerStub);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When getAppVariantOverviewAttributes() method is called with some missing properties (Key user view) on S4/Hana Cloud", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				isOriginal: true,
				originLayer: Layer.VENDOR,
				isAppVariant: false,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action"
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, true, "then it is a S4/Hana Cloud system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, true, "then the button Adapt UI is enabled");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					false,
					"then the button Delete App Variant is not available on an orginal application"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called on S4/Hana Cloud with app let status 'U'", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				originLayer: Layer.VENDOR,
				isAppVariant: true,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action"
				},
				appVarStatus: "U"
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, true, "then it is a S4/Hana Cloud system");
				assert.equal(oAppVariantAttributes.adaptUIButtonVisibility, true, "then the button Adapt UI is available");
				assert.equal(oAppVariantAttributes.appVarStatus, "U", "then the right app let status is set");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, false, "then the button Adapt UI is enabled");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					true,
					"then the button Delete App Variant is available on an app variant"
				);
				assert.equal(
					oAppVariantAttributes.delAppVarButtonEnabled,
					true,
					"then the button Delete App Variant is enabled on an app variant"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called on S4/Hana Cloud with app let status 'R'", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				originLayer: Layer.VENDOR,
				isAppVariant: true,
				descriptorUrl: "url1",
				hasStartableIntent: false,
				appVarStatus: "R"
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, true, "then it is a S4/Hana Cloud system");
				assert.equal(oAppVariantAttributes.adaptUIButtonVisibility, true, "then the button Adapt UI is available");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, false, "then the button Adapt UI is enabled");
				assert.equal(oAppVariantAttributes.appVarStatus, "R", "then the right app let status is set");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					true,
					"then the button Delete App Variant is available on an app variant"
				);
				assert.equal(
					oAppVariantAttributes.delAppVarButtonEnabled,
					false,
					"then the button Delete App Variant is not enabled on an app variant"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called on S4/Hana onPremise and it has no target mappings", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				originLayer: Layer.VENDOR,
				isAppVariant: true,
				descriptorUrl: "url1",
				hasStartableIntent: false
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, false, "then it is a S4/Hana on premise system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, false, "then the button Adapt UI is enabled");
				assert.equal(oAppVariantAttributes.appVarStatus, undefined, "then the right app let status is set");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					true,
					"then the button Delete App Variant is available on an app variant"
				);
				assert.equal(
					oAppVariantAttributes.delAppVarButtonEnabled,
					true,
					"then the button Delete App Variant is not enabled on an app variant"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called on S4/Hana onPremise and it has target mappings", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				originLayer: Layer.VENDOR,
				isAppVariant: true,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action"
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, false, "then it is a S4/Hana on premise system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, true, "then the button Adapt UI is enabled");
				assert.equal(oAppVariantAttributes.appVarStatus, undefined, "then the right app let status is set");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					true,
					"then the button Delete App Variant is available on an app variant"
				);
				assert.equal(
					oAppVariantAttributes.delAppVarButtonEnabled,
					false,
					"then the button Delete App Variant is not enabled on an app variant"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called on S4/Hana Cloud with status 'Error'", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				originLayer: Layer.VENDOR,
				isAppVariant: true,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action"
				},
				appVarStatus: "E"
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.subTitle, "", "then the subtitle is an empty string");
				assert.strictEqual(oAppVariantAttributes.description, "", "then the description is an empty string");
				assert.strictEqual(oAppVariantAttributes.icon, "", "then the icon is an empty string");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, true, "then it is a S4/Hana Cloud system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, false, "then the button Adapt UI is not enabled");
				assert.equal(oAppVariantAttributes.appVarStatus, "E", "then the right app let status is set");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					true,
					"then the button Delete App Variant is available on an app variant"
				);
				assert.equal(
					oAppVariantAttributes.delAppVarButtonEnabled,
					true,
					"then the button Delete App Variant is enabled on an app variant"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with no intent parameters (Key user view) in on prem system", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				subTitle: "subTitle1",
				description: "description1",
				iconUrl: "sap-icon://history",
				isOriginal: true,
				originLayer: Layer.VENDOR,
				isAppVariant: false,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action"
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params, undefined, "then the params property does not exist");
				assert.equal(oAppVariantAttributes.isS4HanaCloud, false, "then it is an S4/Hana on prem system");
				assert.equal(oAppVariantAttributes.adaptUIButtonEnabled, true, "then the button Adapt UI is enabled");
				assert.equal(
					oAppVariantAttributes.delAppVarButtonVisibility,
					false,
					"then the button Delete App Variant is not available on an original application"
				);
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with intent parameter as an object (Key user view) on cloud system", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				subTitle: "subTitle1",
				description: "description1",
				iconUrl: "sap-icon://history",
				isOriginal: true,
				originLayer: Layer.VENDOR,
				isAppVariant: false,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action",
					parameters: {
						"sap-appvar-id": {
							value: "id1",
							required: true
						}
					}
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params["sap-appvar-id"], "id1", "then the intent property's value is correct");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with intent parameter as a string (Key user view) in on prem system", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				subTitle: "subTitle1",
				description: "description1",
				iconUrl: "sap-icon://history",
				isOriginal: true,
				originLayer: Layer.VENDOR,
				isAppVariant: false,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action",
					parameters: {
						"sap-appvar-id": "id1"
					}
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params["sap-appvar-id"], "id1", "then the intent property's value is correct");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called but the ushell container fails to retrieve the Navigation service", function(assert) {
			const oAppVariantInfo = {
				appId: "id1",
				title: "title1",
				subTitle: "subTitle1",
				description: "description1",
				iconUrl: "sap-icon://history",
				isOriginal: true,
				originLayer: Layer.VENDOR,
				isAppVariant: false,
				descriptorUrl: "url1",
				hasStartableIntent: true,
				startWith: {
					semanticObject: "SemObj",
					action: "Action",
					parameters: {
						"sap-appvar-id": "id1"
					}
				}
			};

			this.oUshellContainerStub.getServiceAsync = function() {
				return Promise.reject("Failed to get service");
			};

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo, true, this.oI18n)
			.catch(function(oError) {
				assert.equal(
					oError.message,
					"Error retrieving ushell service Navigation: Failed to get service",
					"then an error is raised"
				);
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on a reference app (currently adapting) which also has intent information present (Key user view) on S4 cloud system", function(assert) {
			const oResult = {
				response: {
					items: [
						{
							appId: "id1",
							title: "title1",
							subTitle: "subTitle1",
							description: "description1",
							iconUrl: "sap-icon://history",
							isOriginal: true,
							originLayer: Layer.VENDOR,
							isAppVariant: false,
							descriptorUrl: "url1",
							hasStartableIntent: true,
							startWith: {
								semanticObject: "SemObj",
								action: "Action",
								parameters: {
									"sap-appvar-id": {
										value: "id1"
									}
								}
							}
						}
					]
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves(oResult);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", true, this.oI18n).then(function(aAppVariantOverviewAttributes) {
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");
				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.equal(
					aAppVariantOverviewAttributes[0].iconText,
					"history",
					"then the icon tooltip text of an app variant is correct"
				);
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, "SemObj", "then the semantic object is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, "Action", "then the action is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, true, "then the app is adaptable");
				assert.ok(sendRequestStub.calledOnce, "then the listAllAppVariants is called once");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which is laid in the customer layer (SAP developer view) on cloud system", function(assert) {
			const oResult = {
				response: {}
			};

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves(oResult);

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", false, this.oI18n).then(function(aAppVariantOverviewAttributes) {
				assert.equal(aAppVariantOverviewAttributes.length, 0, "then the result contains no app variant entries");
				assert.ok(sendRequestStub.calledOnce, "then the sendRequest is called once");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on a reference app (currently adapting) which also has intent information present (SAP developer view) on prem system", function(assert) {
			const oResult = {
				response: {
					items: [
						{
							appId: "id1",
							title: "title1",
							subTitle: "subTitle1",
							description: "description1",
							iconUrl: "sap-icon://history",
							isOriginal: true,
							originLayer: Layer.VENDOR,
							isAppVariant: false,
							descriptorUrl: "url1",
							hasStartableIntent: false
						}
					]
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves(oResult);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", false, this.oI18n).then(function(aAppVariantOverviewAttributes) {
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");
				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.equal(
					aAppVariantOverviewAttributes[0].iconText,
					"history",
					"then the icon tooltip text of an app variant is correct"
				);
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, false, "then the app is not adaptable");
				assert.ok(sendRequestStub.calledOnce, "then the sendRequest is called once");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which has no intent information present (Key user view) on cloud system", function(assert) {
			const oResult = {
				response: {
					items: [
						{
							appId: "id1",
							title: "title1",
							subTitle: "subTitle1",
							description: "description1",
							iconUrl: "sap-icon://history",
							originLayer: Layer.VENDOR,
							isOriginal: false,
							isAppVariant: true,
							descriptorUrl: "url1",
							hasStartableIntent: false,
							startWith: {
								semanticObject: "",
								action: "",
								parameters: {}
							}
						},
						{
							appId: "id2",
							title: "title2",
							subTitle: "subTitle2",
							description: "description2",
							iconUrl: "sap-icon://account",
							isOriginal: true,
							originLayer: Layer.VENDOR,
							isAppVariant: false,
							descriptorUrl: "url2",
							hasStartableIntent: true,
							startWith: {
								semanticObject: "SemObj",
								action: "Action",
								parameters: {
									"sap-appvar-id": "id2"
								}
							}
						}
					]
				}
			};

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves(oResult);
			AppVariantUtils.setNewAppVariantId("id1");

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", true, this.oI18n)
			.then((aAppVariantOverviewAttributes) => {
				assert.ok(
					aAppVariantOverviewAttributes,
					"then the result contains app variant overview properties"
				);

				assert.strictEqual(
					aAppVariantOverviewAttributes[0].icon,
					"sap-icon://history",
					"then the icon of first app(variant) is correct"
				);
				assert.equal(
					aAppVariantOverviewAttributes[0].iconText,
					"history",
					"then the icon tooltip text of a first app(variant) is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[1].icon,
					"sap-icon://account",
					"then the icon of second app is correct"
				);
				assert.equal(
					aAppVariantOverviewAttributes[1].iconText,
					"account",
					"then the icon tooltip text of a second app(variant) is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[0].semanticObject,
					undefined,
					"then the semantic object of first app(variant) is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[1].semanticObject,
					"SemObj",
					"then the semantic object of second app is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[0].action,
					undefined,
					"then the action of first app(variant) is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[1].action,
					"Action",
					"then the action of second app is correct"
				);
				assert.equal(
					aAppVariantOverviewAttributes[0].adaptUIButtonEnabled,
					false,
					"then the first app(variant) is not adaptable"
				);
				assert.equal(
					aAppVariantOverviewAttributes[1].adaptUIButtonEnabled,
					true,
					"then the second app is adaptable"
				);
				assert.equal(
					aAppVariantOverviewAttributes[0].currentStatus,
					this.oI18n.getText("MAA_NEW_APP_VARIANT"),
					"then the first app(variant) is highlighted blue"
				);
				assert.ok(
					sendRequestStub.calledOnce,
					"then the sendRequest is called once"
				);
			});
		});

		QUnit.test("When getAppVariantOverview() method is called with current status 'Operation in Process'", function(assert) {
			const oResult = {
				response: {
					items: [
						{
							appId: "id1",
							title: "title1",
							subTitle: "subTitle1",
							description: "description1",
							iconUrl: "sap-icon://history",
							originLayer: Layer.VENDOR,
							isOriginal: false,
							isAppVariant: true,
							descriptorUrl: "url1",
							hasStartableIntent: true,
							startWith: {
								semanticObject: "SemObj",
								action: "Action",
								parameters: {
									"sap-appvar-id": {
										value: "id1"
									}
								}
							},
							appVarStatus: "R"
						}
					]
				}
			};

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves(oResult);

			AppVariantUtils.setNewAppVariantId(null);

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", true, this.oI18n)
			.then((aAppVariantOverviewAttributes) => {
				assert.ok(
					aAppVariantOverviewAttributes,
					"then the result contains app variant overview properties"
				);

				assert.strictEqual(
					aAppVariantOverviewAttributes[0].icon,
					"sap-icon://history",
					"then the icon of first app(variant) is correct"
				);
				assert.equal(
					aAppVariantOverviewAttributes[0].iconText,
					"history",
					"then the icon tooltip text of a first app(variant) is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[0].semanticObject,
					"SemObj",
					"then the semantic object of first app(variant) is correct"
				);
				assert.strictEqual(
					aAppVariantOverviewAttributes[0].action,
					"Action",
					"then the action of first app(variant) is correct"
				);
				assert.equal(
					aAppVariantOverviewAttributes[0].adaptUIButtonEnabled,
					false,
					"then the first app(variant) is not adaptable"
				);
				assert.equal(
					aAppVariantOverviewAttributes[0].currentStatus,
					this.oI18n.getText("MAA_OPERATION_IN_PROGRESS"),
					"then the first app(variant) is highlighted blue"
				);
				assert.ok(
					sendRequestStub.calledOnce,
					"then the sendRequest is called once"
				);
			});
		});
	});

	QUnit.module("Given an AppVariantOverviewUtils is instantiated", {
		async before() {
			const oManageAppsController = new ManageAppsController();
			await oManageAppsController._createResourceBundle();
			this.oI18n = oManageAppsController._oI18n;
		},
		beforeEach() {
			this.oUshellContainerStub = {
				getServiceAsync() {
					return Promise.resolve({
						getLinks() {
							return Promise.resolve([[]]);
						}
					});
				}
			};
			sandbox.stub(FlUtils, "getUshellContainer").returns(this.oUshellContainerStub);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which is also a reference app and has intent information present (Key user view) on cloud system", function(assert) {
			const oResult = {
				response: {
					items: [
						{
							appId: "id1",
							title: "title1",
							subTitle: "subTitle1",
							description: "description1",
							iconUrl: "sap-icon://history",
							isOriginal: true,
							originLayer: Layer.VENDOR,
							isAppVariant: true,
							descriptorUrl: "url1",
							hasStartableIntent: true,
							startWith: {
								semanticObject: "SemObj",
								action: "Action",
								parameters: {
									"sap-appvar-id": "id1"
								}
							}
						}
					]
				}
			};

			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "listAllAppVariants").resolves(oResult);

			return AppVariantOverviewUtils.getAppVariantOverview("testId", true, this.oI18n).then(function(aAppVariantOverviewAttributes) {
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");

				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, "SemObj", "then the semantic object is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, "Action", "then the action is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonEnabled, false, "then the app is not adaptable");
				assert.ok(sendRequestStub.calledOnce, "then the sendRequest is called once");
			});
		});

		QUnit.test("When getManifest() method is called", function(assert) {
			const oResult = {
				response: {
					"_version": "2.0.1",

					"sap.app": {
						id: "testId"
					}
				}
			};

			const sendRequestStub = sandbox.stub(AppVariantWriteAPI, "getManifest").resolves(oResult);

			return AppVariantOverviewUtils.getManifest("testIdDescriptorUrl").then(function(oManifest) {
				assert.ok(oManifest, "then the descriptor of the app is returned");
				assert.strictEqual(oManifest["sap.app"].id, "testId", "then the id of the descriptor is right");
				assert.ok(sendRequestStub.calledOnce, "then the sendRequest is called once");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});