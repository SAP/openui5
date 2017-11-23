/* global QUnit  */

QUnit.config.autostart = false;

sap.ui.require([
	"jquery.sap.global",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/thirdparty/sinon"
], function(
	jQuery,
	AppVariantUtils,
	FakeLrepConnectorLocalStorage,
	Settings,
	sinon) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	QUnit.start();

	FakeLrepConnectorLocalStorage.enableFakeConnector();

	QUnit.module("Given an AppVariantUtils is instantiated", {
		beforeEach: function () {
			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							getHash : function() {
								return "testSemanticObject-testAction";
							},
							parseShellHash : function() {
								return {
									semanticObject : "testSemanticObject",
									action : "testAction"
								};
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
	}, function () {

		QUnit.test("When getManifirstSupport() method is called", function (assert) {
			return AppVariantUtils.getManifirstSupport("testId").then(function(oResult) {
				assert.equal(oResult.response, false, "then the running app is a scaffolding app");
			});
		});

		QUnit.test("When getId() method is called with an id which does not have a 'customer' prefix", function (assert) {
			assert.notEqual(AppVariantUtils.getId("testId"), "customer.testId", "then the id is concatenated with prefix customer and suffix jquery uid");
		});

		QUnit.test("When getId() method is called with an id which has a 'customer' prefix", function (assert) {
			assert.notEqual(AppVariantUtils.getId("customer.testId"), "customer.testId", "then the id is concatenated with suffix generated jquery UID");
		});

		QUnit.test("When trimIdIfRequired() method is called with an id which has a 'customer' prefix and more than 56 characters long", function (assert) {
			var sTrimmedId = AppVariantUtils.trimIdIfRequired("customer.testId.id_1234567890123456789012345678901234567890");
			assert.equal(sTrimmedId.length, 56, "then the id trimmed to 56 characters");
		});

		QUnit.test("When getId() method is called with an id which has a 'customer' prefix and has a jquery UID as a suffix", function (assert) {
			assert.notEqual(AppVariantUtils.getId("customer.testId.id_1234567"), "customer.testId.id_1234567", "then the id is replaced with suffix generated jquery UID");
		});

		QUnit.test("When getNewAppVariantId() method is called with an id which has a 'customer' prefix and has a jquery UID as a suffix", function (assert) {
			var sGeneratedId = AppVariantUtils.getId("customer.testId.id_1234567");
			assert.strictEqual(AppVariantUtils.getNewAppVariantId(), sGeneratedId, "then the id is correct");
		});

		QUnit.test("When createDescriptorVariant() is called", function (assert) {
			return AppVariantUtils.createDescriptorVariant({id: "testId", reference: "testReference"}).then(function(oDescriptorVariant) {
				assert.ok(true, "then the descriptor variant is created");
				assert.strictEqual(oDescriptorVariant._id, "testId", "then the id of the descriptor variant is correct");
				assert.strictEqual(oDescriptorVariant._reference, "testReference", "then the reference of the descriptor variant is correct");
			});
		});

		QUnit.test("When getInlinePropertyChange() method is called", function (assert) {
			var oPropertyChange = {
				"type": "XTIT",
				"maxLength": 50,
				"comment": "New title entered by a key user via RTA tool",
				"value": {
					"": "TestTitle"
				}
			};
			assert.deepEqual(AppVariantUtils.getInlinePropertyChange("title", "TestTitle"), oPropertyChange, "then the inline property change is correct");
		});

		QUnit.test("When getInlineChangeInputIcon() method is called", function (assert) {
			assert.deepEqual(AppVariantUtils.getInlineChangeInputIcon("testIcon"), {icon: "testIcon"}, "then the content of icon inline change is correct");
		});

		QUnit.test("When getInlineChangeRemoveInbounds() method is called", function (assert) {
			assert.deepEqual(AppVariantUtils.getInlineChangeRemoveInbounds("testInbound"), {inboundId: "testInbound"}, "then the content of remove inbound inline change is correct");
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound does not match with all possible inbounds", function (assert) {
			var oInbounds = {
				"inbound1": {
					semanticObject: "semanticObject1",
					action: "action1"
				},
				"inbound2": {
					semanticObject: "semanticObject2",
					action: "action2"
				},
				"inbound3": {
					semanticObject: "semanticObject3",
					action: "action3"
				}
			};

			assert.deepEqual(AppVariantUtils.getInboundInfo(oInbounds), {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: true}, "then the current inbound info is correct");
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound match with 1 inbounds' SO and action", function (assert) {
			var oInbounds = {
				"inbound1": {
					semanticObject: "semanticObject1",
					action: "action1"
				},
				"inbound2": {
					semanticObject: "testSemanticObject",
					action: "testAction"
				},
				"inbound3": {
					semanticObject: "semanticObject3",
					action: "action3"
				}
			};

			assert.deepEqual(AppVariantUtils.getInboundInfo(oInbounds), {currentRunningInbound: "inbound2", addNewInboundRequired: false}, "then the current inbound info is correct");
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound match with 2 inbounds' SO and action", function (assert) {
			var oInbounds = {
				"inbound1": {
					semanticObject: "semanticObject1",
					action: "action1"
				},
				"inbound2": {
					semanticObject: "testSemanticObject",
					action: "testAction"
				},
				"inbound3": {
					semanticObject: "testSemanticObject",
					action: "testAction"
				}
			};

			assert.strictEqual(AppVariantUtils.getInboundInfo(oInbounds), undefined, "then the current inbound info is correct");
		});

		QUnit.test("When getInlineChangesForInboundProperties() method is called for title inline change of inbound", function (assert) {
			var oInboundPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "title",
					"operation": "UPSERT",
					"propertyValue": "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.title}}"
				},
				"texts": {
					"appVariantId_sap.app.crossNavigation.inbounds.testInbound.title": {
						"type": "XTIT",
						"maxLength": 50,
						"comment": "New title entered by a key user via RTA tool",
						"value": {
							"": "Test Title"
						}
					}
				}
			};
			assert.deepEqual(AppVariantUtils.getInlineChangesForInboundProperties("testInbound", "appVariantId", "title", "Test Title"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		QUnit.test("When getInlineChangesForInboundProperties() method is called for icon inline change of inbound", function (assert) {
			var oInboundPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "icon",
					"operation": "UPSERT",
					"propertyValue": "Test icon"
				},
				"texts": {}
			};
			assert.deepEqual(AppVariantUtils.getInlineChangesForInboundProperties("testInbound", "appVariantId", "icon", "Test icon"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		QUnit.test("When getInlineChangeForInboundPropertySaveAs() method is called", function (assert) {
			var oGeneratedID = AppVariantUtils.getId("testId");
			var oInboundPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/sap-appvar-id",
					"operation": "UPSERT",
					"propertyValue": {
						"required": true,
						"filter": {
							"value": oGeneratedID,
							"format": "plain"
						},
						"launcherValue": {
							"value": oGeneratedID
						}
					}
				}
			};
			assert.deepEqual(AppVariantUtils.getInlineChangeForInboundPropertySaveAs("testInbound"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		QUnit.test("When getInlineChangeCreateInbound() method is called", function (assert) {
			var oInboundPropertyChange = {
				inbound: {}
			};
			oInboundPropertyChange.inbound["testInbound"] = {
				semanticObject: "testSemanticObject",
				action: "testAction"
			};

			var oParsedHash = {
				semanticObject: "testSemanticObject",
				action: "testAction"
			};
			sandbox.stub(AppVariantUtils, "getURLParsedHash").returns(oParsedHash);

			assert.deepEqual(AppVariantUtils.getInlineChangeCreateInbound("testInbound"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'title'", function (assert) {
			var oPropertyChange = {
				"type": "XTIT",
				"maxLength": 50,
				"comment": "New title entered by a key user via RTA tool",
				"value": {
					"": "Test Title"
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "title").then(function(oTitleInlineChange) {
				assert.ok(oTitleInlineChange, "then the title inline change is correct");
				assert.strictEqual(oTitleInlineChange.getMap().changeType, "appdescr_app_setTitle", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'subTitle'", function (assert) {
			var oPropertyChange = {
				"type": "XTIT",
				"maxLength": 50,
				"comment": "New subtitle entered by a key user via RTA tool",
				"value": {
					"": "Test Subtitle"
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "subtitle").then(function(oSubtitleInlineChange) {
				assert.ok(oSubtitleInlineChange, "then the subtitle inline change is correct");
				assert.strictEqual(oSubtitleInlineChange.getMap().changeType, "appdescr_app_setSubTitle", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'description'", function (assert) {
			var oPropertyChange = {
				"type": "XTIT",
				"maxLength": 50,
				"comment": "New description entered by a key user via RTA tool",
				"value": {
					"": "Test Description"
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "description").then(function(oDescriptionInlineChange) {
				assert.ok(oDescriptionInlineChange, "then the description inline change is correct");
				assert.strictEqual(oDescriptionInlineChange.getMap().changeType, "appdescr_app_setDescription", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'icon'", function (assert) {
			var oPropertyChange = {
				icon: "testIcon"
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "icon").then(function(oIconInlineChange) {
				assert.ok(oIconInlineChange, "then the icon inline change is correct");
				assert.strictEqual(oIconInlineChange.getMap().changeType, "appdescr_ui_setIcon", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inbound'", function (assert) {
			var oGeneratedID = AppVariantUtils.getId("testId");
			var oPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/sap-appvar-id",
					"operation": "UPSERT",
					"propertyValue": {
						"required": true,
						"filter": {
							"value": oGeneratedID,
							"format": "plain"
						},
						"launcherValue": {
							"value": oGeneratedID
						}
					}
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "inbound").then(function(oChangeInboundInlineChange) {
				assert.ok(oChangeInboundInlineChange, "then the change inbound inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'createInbound'", function (assert) {
			var oPropertyChange = {
				"inbound": {
					"testInbound": {
						semanticObject: "testSemanticObject",
						action: "testAction"
					}
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "createInbound").then(function(oCreateInboundInlineChange) {
				assert.ok(oCreateInboundInlineChange, "then the create inbound inline change is correct");
				assert.strictEqual(oCreateInboundInlineChange.getMap().changeType, "appdescr_app_addNewInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundTitle'", function (assert) {
			var oPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "title",
					"operation": "UPSERT",
					"propertyValue": "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.title}}"
				},
				"texts": {
					"appVariantId_sap.app.crossNavigation.inbounds.testInbound.title": {
						"type": "XTIT",
						"maxLength": 50,
						"comment": "New title entered by a key user via RTA tool",
						"value": {
							"": "Test Title"
						}
					}
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "inboundTitle").then(function(oChangeInboundInlineChange) {
				assert.ok(oChangeInboundInlineChange, "then the inbound title inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundSubtitle'", function (assert) {
			var oPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "subTitle",
					"operation": "UPSERT",
					"propertyValue": "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.subtitle}}"
				},
				"texts": {
					"appVariantId_sap.app.crossNavigation.inbounds.testInbound.subtitle": {
						"type": "XTIT",
						"maxLength": 50,
						"comment": "New subtitle entered by a key user via RTA tool",
						"value": {
							"": "Test Subtitle"
						}
					}
				}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "inboundSubtitle").then(function(oChangeInboundInlineChange) {
				assert.ok(oChangeInboundInlineChange, "then the create inbound subTitle inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundIcon'", function (assert) {
			var oPropertyChange = {
				"inboundId": "testInbound",
				"entityPropertyChange": {
					"propertyPath": "icon",
					"operation": "UPSERT",
					"propertyValue": "testIcon"
				},
				"texts": {}
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "inboundIcon").then(function(oChangeInboundInlineChange) {
				assert.ok(oChangeInboundInlineChange, "then the create inbound icon inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'removeInbound'", function (assert) {
			var oPropertyChange = {
				"inboundId": "testInbound"
			};

			return AppVariantUtils.createInlineChange(oPropertyChange, "removeInbound").then(function(oRemoveAllInboundsExceptOneInlineChange) {
				assert.ok(oRemoveAllInboundsExceptOneInlineChange, "then the remove inbound inline change is correct");
				assert.strictEqual(oRemoveAllInboundsExceptOneInlineChange.getMap().changeType, "appdescr_app_removeAllInboundsExceptOne", "then the change type is correct");
			});
		});

		QUnit.test("When getTransportInput() method is called", function (assert) {
			var oTransportInput = AppVariantUtils.getTransportInput("", "TestNamespace", "TestId", "appdescr_variant");

			assert.strictEqual(oTransportInput.getPackage(), "", "then the package is correct");
			assert.strictEqual(oTransportInput.getNamespace(), "TestNamespace", "then the namespace is correct");
			assert.strictEqual(oTransportInput.getId(), "TestId", "then the id is correct");
			assert.strictEqual(oTransportInput.getDefinition().fileType, "appdescr_variant", "then the file type is correct");
		});

		QUnit.test("When isS4HanaCloud() method is called", function (assert) {
			return AppVariantUtils.createDescriptorVariant({id: "testId", reference: "testReference"}).then(function(oDescriptorVariant) {
				assert.equal(AppVariantUtils.isS4HanaCloud(oDescriptorVariant._oSettings), false, "then the platform is not S4 Hana Cloud");
			});
		});

		QUnit.test("When isStandAloneApp() method is called", function (assert) {
			assert.equal(AppVariantUtils.isStandAloneApp(), true, "then the app is a stand alone application");
		});

		QUnit.test("When getInboundInfo() is called with no inbounds passed as a parameter", function (assert) {
			assert.deepEqual(AppVariantUtils.getInboundInfo(), {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: true}, "then the correct inbound info is returned");
		});

		QUnit.test("When copyId() is called", function (assert) {
			assert.equal(AppVariantUtils.copyId("CopyMe"), true, "then the the string is copied to your clipboard");
		});

		QUnit.test("When buildErrorInfo() is called for different error possibilities", function (assert) {
			var oError = {
				messages: [{
					text: "Error1"
				}]
			};
			var oResult = AppVariantUtils.buildErrorInfo('MSG_COPY_UNSAVED_CHANGES_FAILED', oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");

			oError = {
				iamAppId: "IamId"
			};
			oResult = AppVariantUtils.buildErrorInfo('MSG_COPY_UNSAVED_CHANGES_FAILED', oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");

			oError = "Error2";
			oResult = AppVariantUtils.buildErrorInfo('MSG_COPY_UNSAVED_CHANGES_FAILED', oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");
		});
	});
});
