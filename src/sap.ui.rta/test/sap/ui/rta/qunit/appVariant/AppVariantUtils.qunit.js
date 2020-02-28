/* global QUnit  */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/base/Log",
	"sap/ui/core/Manifest",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/thirdparty/sinon-4"
], function (
	jQuery,
	AppVariantUtils,
	Settings,
	Layer,
	FlUtils,
	WriteUtils,
	DescriptorVariantFactory,
	Log,
	Manifest,
	ChangesWriteAPI,
	AppVariantWriteAPI,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given an AppVariantUtils is instantiated", {
		beforeEach: function () {
			var oUshellContainerStub = {
				getService : function () {
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
				},
				getLogonSystem: function() {
					return {
						isTrial: function() {
							return false;
						}
					};
				}
			};
			sandbox.stub(FlUtils, "getUshellContainer").returns(oUshellContainerStub);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
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
			assert.notEqual(AppVariantUtils.getId("customer.testId.id_1234567890123456789012345678901234567890"), "customer.testId.id_1234567890123456789012345678901234567890", "then the guid has been changed");
		});

		QUnit.test("When getId() method is called with an id which had problems with trimming", function (assert) {
			var sTrimmedId = AppVariantUtils.getId("cus.sd.schedulingagreements.manage");
			assert.ok(sTrimmedId.length < 56, "then the id has been trimmed properly and will never complain of already exisiting id");

			sTrimmedId = AppVariantUtils.getId("cus.sd.schedulingagreements.factsheets1");
			assert.ok(sTrimmedId.length < 56, "then the id has been trimmed properly and will never complain of already exisiting id");
		});

		QUnit.test("When getNewAppVariantId() method is called with an id which has a 'customer' prefix and has a jquery UID as a suffix", function (assert) {
			var sGeneratedId = AppVariantUtils.getId("customer.testId.id_1234567");
			assert.strictEqual(AppVariantUtils.getNewAppVariantId(), sGeneratedId, "then the id is correct");
		});

		QUnit.test("When getInlinePropertyChange() method is called", function (assert) {
			var oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New title entered by a key user via RTA tool",
				value: {
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
				inbound1: {
					semanticObject: "semanticObject1",
					action: "action1"
				},
				inbound2: {
					semanticObject: "semanticObject2",
					action: "action2"
				},
				inbound3: {
					semanticObject: "semanticObject3",
					action: "action3"
				}
			};

			assert.deepEqual(AppVariantUtils.getInboundInfo(oInbounds), {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: true}, "then the current inbound info is correct");
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound match with 1 inbounds' SO and action", function (assert) {
			var oInbounds = {
				inbound1: {
					semanticObject: "semanticObject1",
					action: "action1"
				},
				inbound2: {
					semanticObject: "testSemanticObject",
					action: "testAction"
				},
				inbound3: {
					semanticObject: "semanticObject3",
					action: "action3"
				}
			};

			assert.deepEqual(AppVariantUtils.getInboundInfo(oInbounds), {currentRunningInbound: "inbound2", addNewInboundRequired: false}, "then the current inbound info is correct");
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound match with 2 inbounds' SO and action", function (assert) {
			var oInbounds = {
				inbound1: {
					semanticObject: "semanticObject1",
					action: "action1"
				},
				inbound2: {
					semanticObject: "testSemanticObject",
					action: "testAction"
				},
				inbound3: {
					semanticObject: "testSemanticObject",
					action: "testAction"
				}
			};

			assert.strictEqual(AppVariantUtils.getInboundInfo(oInbounds), undefined, "then the current inbound info is correct");
		});

		QUnit.test("When getInlineChangesForInboundProperties() method is called for title inline change of inbound", function (assert) {
			var oInboundPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "title",
					operation: "UPSERT",
					propertyValue: "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.title}}"
				},
				texts: {
					"appVariantId_sap.app.crossNavigation.inbounds.testInbound.title": {
						type: "XTIT",
						maxLength: 50,
						comment: "New title entered by a key user via RTA tool",
						value: {
							"": "Test Title"
						}
					}
				}
			};
			assert.deepEqual(AppVariantUtils.getInlineChangesForInboundProperties("testInbound", "appVariantId", "title", "Test Title"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		QUnit.test("When getInlineChangesForInboundProperties() method is called for icon inline change of inbound", function (assert) {
			var oInboundPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "icon",
					operation: "UPSERT",
					propertyValue: "Test icon"
				},
				texts: {}
			};
			assert.deepEqual(AppVariantUtils.getInlineChangesForInboundProperties("testInbound", "appVariantId", "icon", "Test icon"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		QUnit.test("When getInlineChangeForInboundPropertySaveAs() method is called", function (assert) {
			var oInboundPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "signature/parameters/sap-appvar-id",
					operation: "UPSERT",
					propertyValue: {
						required: true,
						filter: {
							value: "customer.appvar.id",
							format: "plain"
						},
						launcherValue: {
							value: "customer.appvar.id"
						}
					}
				}
			};
			assert.deepEqual(AppVariantUtils.getInlineChangeForInboundPropertySaveAs("testInbound", "customer.appvar.id"), oInboundPropertyChange, "then the inbound property change is correct");
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
			sandbox.stub(FlUtils, "getParsedURLHash").returns(oParsedHash);

			assert.deepEqual(AppVariantUtils.getInlineChangeCreateInbound("testInbound"), oInboundPropertyChange, "then the inbound property change is correct");
		});

		var fnCreateAppComponent = function() {
			var oDescriptor = {
				"sap.app" : {
					id : "TestId",
					applicationVersion: {
						version: "1.2.3"
					}
				}
			};

			var oManifest = new Manifest(oDescriptor);
			var oAppComponent = {
				name: "testComponent",
				getManifest : function() {
					return oManifest;
				}
			};

			return oAppComponent;
		};

		QUnit.test("When createInlineChange() method is called for propertyChange 'title'", function (assert) {
			var oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New title entered by a key user via RTA tool",
				value: {
					"": "Test Title"
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setTitle", oAppComponent).then(function(oDescrChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oDescrChange._oInlineChange, "then the title inline change is correct");
				assert.strictEqual(oDescrChange._oInlineChange.getMap().changeType, "appdescr_app_setTitle", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'subTitle'", function (assert) {
			var oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New subtitle entered by a key user via RTA tool",
				value: {
					"": "Test Subtitle"
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setSubTitle", oAppComponent).then(function(oSubtitleInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oSubtitleInlineChange._oInlineChange, "then the subtitle inline change is correct");
				assert.strictEqual(oSubtitleInlineChange._oInlineChange.getMap().changeType, "appdescr_app_setSubTitle", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'description'", function (assert) {
			var oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New description entered by a key user via RTA tool",
				value: {
					"": "Test Description"
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setDescription", oAppComponent).then(function(oDescriptionInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oDescriptionInlineChange._oInlineChange, "then the description inline change is correct");
				assert.strictEqual(oDescriptionInlineChange._oInlineChange.getMap().changeType, "appdescr_app_setDescription", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'icon'", function (assert) {
			var oPropertyChange = {
				icon: "testIcon"
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_ui_setIcon", oAppComponent).then(function(oIconInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oIconInlineChange._oInlineChange, "then the icon inline change is correct");
				assert.strictEqual(oIconInlineChange._oInlineChange.getMap().changeType, "appdescr_ui_setIcon", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inbound'", function (assert) {
			var oGeneratedID = AppVariantUtils.getId("testId");
			var oPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "signature/parameters/sap-appvar-id",
					operation: "UPSERT",
					propertyValue: {
						required: true,
						filter: {
							value: oGeneratedID,
							format: "plain"
						},
						launcherValue: {
							value: oGeneratedID
						}
					}
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the change inbound inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'createInbound'", function (assert) {
			var oPropertyChange = {
				inbound: {
					testInbound: {
						semanticObject: "testSemanticObject",
						action: "testAction"
					}
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_addNewInbound", oAppComponent).then(function(oCreateInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oCreateInboundInlineChange._oInlineChange, "then the create inbound inline change is correct");
				assert.strictEqual(oCreateInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_addNewInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundTitle'", function (assert) {
			var oPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "title",
					operation: "UPSERT",
					propertyValue: "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.title}}"
				},
				texts: {
					"appVariantId_sap.app.crossNavigation.inbounds.testInbound.title": {
						type: "XTIT",
						maxLength: 50,
						comment: "New title entered by a key user via RTA tool",
						value: {
							"": "Test Title"
						}
					}
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the inbound title inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundSubtitle'", function (assert) {
			var oPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "subTitle",
					operation: "UPSERT",
					propertyValue: "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.subtitle}}"
				},
				texts: {
					"appVariantId_sap.app.crossNavigation.inbounds.testInbound.subtitle": {
						type: "XTIT",
						maxLength: 50,
						comment: "New subtitle entered by a key user via RTA tool",
						value: {
							"": "Test Subtitle"
						}
					}
				}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the create inbound subTitle inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundIcon'", function (assert) {
			var oPropertyChange = {
				inboundId: "testInbound",
				entityPropertyChange: {
					propertyPath: "icon",
					operation: "UPSERT",
					propertyValue: "testIcon"
				},
				texts: {}
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the create inbound icon inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'removeInbound'", function (assert) {
			var oPropertyChange = {
				inboundId: "testInbound"
			};

			var oAppComponent = fnCreateAppComponent();
			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").returns(oAppComponent);
			var oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_removeAllInboundsExceptOne", oAppComponent).then(function(oRemoveAllInboundsExceptOneInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oRemoveAllInboundsExceptOneInlineChange._oInlineChange, "then the remove inbound inline change is correct");
				assert.strictEqual(oRemoveAllInboundsExceptOneInlineChange._oInlineChange.getMap().changeType, "appdescr_app_removeAllInboundsExceptOne", "then the change type is correct");
			});
		});

		QUnit.test("When getTransportInput() method is called", function (assert) {
			var oTransportInput = AppVariantUtils.getTransportInput("", "TestNamespace", "TestId", "appdescr_variant");

			assert.strictEqual(oTransportInput.getPackage(), "", "then the package is correct");
			assert.strictEqual(oTransportInput.getNamespace(), "TestNamespace", "then the namespace is correct");
			assert.strictEqual(oTransportInput.getId(), "TestId", "then the id is correct");
			assert.strictEqual(oTransportInput.getDefinition().fileType, "appdescr_variant", "then the file type is correct");
		});

		QUnit.test("When onTransportInDialogSelected() method is called and rejected", function (assert) {
			var oTransportInfo;

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			})
			.then(function(oDescriptorVariant) {
				return AppVariantUtils.onTransportInDialogSelected(oDescriptorVariant, oTransportInfo);
			})
			.catch(function() {
				assert.ok("Operation cancelled successfully");
			});
		});

		QUnit.test("When createAppVariant() method is called", function (assert) {
			var oAppComponent = fnCreateAppComponent();
			var fnSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves();
			return AppVariantUtils.createAppVariant(oAppComponent, {id: "customer.appvar.id", layer: Layer.CUSTOMER}).then(function() {
				assert.ok(fnSaveAsAppVariantStub.calledWithExactly({selector: oAppComponent, id: "customer.appvar.id", layer: Layer.CUSTOMER, version: "1.0.0"}));
			});
		});

		QUnit.test("When deleteAppVariant() method is called", function (assert) {
			var fnDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();
			var vAppIdSelector = {appId: "customer.appvar.id"};
			return AppVariantUtils.deleteAppVariant(vAppIdSelector, Layer.CUSTOMER).then(function() {
				assert.ok(fnDeleteAppVariantStub.calledWithExactly({selector: vAppIdSelector, layer: Layer.CUSTOMER}));
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

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Error1").returns();
			var oResult = AppVariantUtils.buildErrorInfo('MSG_COPY_UNSAVED_CHANGES_FAILED', oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");

			sandbox.restore();

			oError = {
				iamAppId: "IamId"
			};

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IamId").returns();
			oResult = AppVariantUtils.buildErrorInfo('MSG_COPY_UNSAVED_CHANGES_FAILED', oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");

			sandbox.restore();

			oError = "Error2";

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Error2").returns();
			oResult = AppVariantUtils.buildErrorInfo('MSG_COPY_UNSAVED_CHANGES_FAILED', oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");
		});

		QUnit.test("When showRelevantDialog() is called with success message and Ok button is pressed", function (assert) {
			var oInfo = {
				text: "Text",
				copyId: false
			};

			var bSuccessful = true;
			var oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("OK");
			});

			return AppVariantUtils.showRelevantDialog(oInfo, bSuccessful).then(function() {
				assert.ok("then the successful dialog pops up and OK button pressed");
				assert.ok(oCopyIDStub.notCalled, "then the ID is not copied");
			});
		});

		QUnit.test("When showRelevantDialog() is called with success message and CopyID and Ok button is pressed", function (assert) {
			var oInfo = {
				text: "Text",
				copyId: true,
				appVariantId: "Whatever!"
			};

			var bSuccessful = true;

			var oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Copy ID and Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo, bSuccessful).then(function() {
				assert.ok("then the successful dialog pops up and Copy ID and Close button pressed");
				assert.equal(oCopyIDStub.callCount, 1, "then the ID is copied successfully");
			});
		});

		QUnit.test("When showRelevantDialog() is called from overview dialog with failure message and Close button is pressed", function (assert) {
			var oInfo = {
				text: "Text",
				overviewDialog: true
			};
			var oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function(bResponse) {
				assert.ok("then the failure dialog pops up and Close button pressed");
				assert.strictEqual(bResponse, false);
				assert.ok(oCopyIDStub.notCalled, "then the ID is not copied");
			});
		});

		QUnit.test("When showRelevantDialog() is called with failure message and close button is pressed", function (assert) {
			var oInfo = {
				text: "Text"
			};
			var oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function() {
				assert.ok("then the failure dialog pops up and Close button pressed");
				assert.ok(oCopyIDStub.notCalled, "then the ID is not copied");
			});
		});

		QUnit.test("When showRelevantDialog() is called with failure message and Copy ID and close button is pressed", function (assert) {
			var oInfo = {
				text: "Text",
				copyId: true,
				appVariantId: "Whatever!"
			};

			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Copy ID and Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function() {
				assert.ok("then the failure dialog pops up and Copy ID and close button pressed");
			});
		});

		QUnit.test("When showRelevantDialog() is called with info message (Delete an app variant) and Ok button is pressed", function (assert) {
			var oInfo = {
				text: "Text",
				deleteAppVariant: true
			};

			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("OK");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function() {
				assert.ok("then the info dialog pops up and Ok button pressed");
			});
		});

		QUnit.test("When showRelevantDialog() is called with info message (Delete an app variant) and Close button is pressed", function (assert) {
			var oInfo = {
				text: "Text",
				deleteAppVariant: true
			};

			sandbox.stub(sap.m.MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).catch(
				function() {
					assert.ok("then the info dialog pops up and Close button pressed");
				}
			);
		});

		QUnit.test("When navigateToFLPHomepage() method is called and navigation to launchpad gets triggered", function (assert) {
			sandbox.restore();
			window.bUShellNavigationTriggered = false;
			if (!sap.ushell) {
				sap.ushell = {};
			}
			var originalUShell = sap.ushell.services;

			sap.ushell.services = Object.assign({}, sap.ushell.services, {
				AppConfiguration: {
					getCurrentApplication: function() {
						return {
							componentHandle: {
								getInstance: function() {
									return "testInstance";
								}
							}
						};
					}
				}
			});

			sandbox.stub(FlUtils, "getUshellContainer").returns({
				getService : function() {
					return {
						toExternal : function() {
							window.bUShellNavigationTriggered = true;
						}
					};
				}
			});

			return AppVariantUtils.navigateToFLPHomepage().then(function() {
				assert.equal(window.bUShellNavigationTriggered, true, "then the navigation to fiorilaunchpad gets triggered");
				sap.ushell.services = originalUShell;
				delete window.bUShellNavigationTriggered;
			});
		});

		QUnit.test("When navigateToFLPHomepage() method is called and navigation to launchad does not get triggered", function (assert) {
			sandbox.restore();
			window.bUShellNavigationTriggered = false;
			if (!sap.ushell) {
				sap.ushell = {};
			}
			var originalUShell = sap.ushell.services;

			sap.ushell.services = Object.assign({}, sap.ushell.services, {
				AppConfiguration: {
					getCurrentApplication: function() {
						return {
							componentHandle: {
								getInstance: function() {
									return undefined;
								}
							}
						};
					}
				}
			});

			sandbox.stub(FlUtils, "getUshellContainer").returns({
				getService : function() {
					return {
						toExternal : function() {
							window.bUShellNavigationTriggered = true;
						}
					};
				}
			});

			return AppVariantUtils.navigateToFLPHomepage().then(function() {
				assert.equal(window.bUShellNavigationTriggered, false, "then the navigation to fiorilaunchpad does not get triggered");
				sap.ushell.services = originalUShell;
				delete window.bUShellNavigationTriggered;
			});
		});

		QUnit.test("When triggerCatalogAssignment() method is called on S4 Cloud system", function (assert) {
			var oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantUtils.triggerCatalogAssignment("AppVarId", Layer.CUSTOMER, "OriginalId").then(function() {
				assert.ok(oSendRequestStub.calledWith("/sap/bc/lrep/appdescr_variants/AppVarId?action=assignCatalogs&assignFromAppId=OriginalId", "POST"));
			});
		});

		QUnit.test("When triggerCatalogUnAssignment() method is called on S4 Cloud system", function (assert) {
			var oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantUtils.triggerCatalogUnAssignment("AppVarId", Layer.CUSTOMER).then(function() {
				assert.ok(oSendRequestStub.calledWith("/sap/bc/lrep/appdescr_variants/AppVarId?action=unassignCatalogs", "POST"));
			});
		});

		QUnit.test("When showMessage() method is called", function(assert) {
			var sMessageKey = "SOME_KEY";
			var oGetText = sandbox.stub(AppVariantUtils, "getText");
			var oShowRelevantDialogStub = sandbox.stub(AppVariantUtils, "showRelevantDialog");

			AppVariantUtils.showMessage(sMessageKey);

			assert.equal(oGetText.callCount, 1, "then the getText() method is called once");
			assert.equal(oShowRelevantDialogStub.callCount, 1, "then the info message toast pops up");
		});

		QUnit.test("When catchErrorDialog() method is called", function(assert) {
			var oError = {};
			var oBuildErrorInfoStub = sandbox.stub(AppVariantUtils, "buildErrorInfo");
			var oShowRelevantDialogStub = sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			return AppVariantUtils.catchErrorDialog(oError, "SOME_KEY", "IAMId").then(function() {
				assert.equal(oBuildErrorInfoStub.callCount, 1, "then the buildErrorInfo() method is called once");
				assert.equal(oShowRelevantDialogStub.callCount, 1, "then the showRelevantDialog() method is called once");
			});
		});

		QUnit.test("When buildSuccessInfo() method is called for S/4HANA on Premise", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			var oGetText = sandbox.stub(AppVariantUtils, "getText");

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			})
			.then(function(oAppVariant) {
				return AppVariantUtils.buildSuccessInfo(oAppVariant.getId(), false, false);
			}).then(function(oInfo) {
				assert.equal(oGetText.callCount, 2, "then the getText() method is called twice");
				assert.strictEqual(oInfo.appVariantId, "customer.TestId", "then the app variant id is as expected");
				assert.strictEqual(oInfo.copyId, true, "then the copyID value is as expected");
			});
		});

		QUnit.test("When buildSuccessInfo() method is called for S/4HANA Cloud", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
			var oGetText = sandbox.stub(AppVariantUtils, "getText");

			return DescriptorVariantFactory.createNew({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			})
			.then(function(oAppVariant) {
				return AppVariantUtils.buildSuccessInfo(oAppVariant.getId(), false, true);
			}).then(function(oInfo) {
				assert.equal(oGetText.callCount, 2, "then the getText() method is called twice");
				assert.strictEqual(oInfo.appVariantId, "customer.TestId", "then the app variant id is as expected");
				assert.strictEqual(oInfo.copyId, false, "then the copyID value is as expected");
			});
		});

		QUnit.test("When buildFinalSuccessInfoS4HANACloud() method is called for S/4HANA Cloud after catalog assignment finished succesfully", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
			var oGetText = sandbox.stub(AppVariantUtils, "getText");
			AppVariantUtils.buildFinalSuccessInfoS4HANACloud();
			assert.equal(oGetText.callCount, 1, "then the getText() method is called once");
		});

		QUnit.test("When buildDeleteSuccessMessage() method is called for S/4HANA onPremise after deletion finished succesfully", function(assert) {
			var oGetText = sandbox.stub(AppVariantUtils, "getText");
			AppVariantUtils.buildDeleteSuccessMessage("APP_VAR_ID", false);
			assert.ok(oGetText.calledWithExactly("DELETE_APP_VARIANT_SUCCESS_MESSAGE", "APP_VAR_ID"), "then the getText() method is called with correct parameters");
		});

		QUnit.test("When buildDeleteSuccessMessage() method is called for S/4HANA Cloud after deletion finished succesfully", function(assert) {
			var oGetText = sandbox.stub(AppVariantUtils, "getText");
			AppVariantUtils.buildDeleteSuccessMessage("APP_VAR_ID", true);
			assert.ok(oGetText.calledWithExactly("DELETE_APP_VARIANT_SUCCESS_MESSAGE_CLOUD", "APP_VAR_ID"), "then the getText() method is called with correct parameters");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
