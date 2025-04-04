/* global QUnit  */

sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	MessageBox,
	FlexRuntimeInfoAPI,
	AppVariantFactory,
	WriteUtils,
	AppVariantWriteAPI,
	ChangesWriteAPI,
	Layer,
	FlUtils,
	AppVariantUtils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	function stubUshellContainer() {
		const oUshellContainerStub = {
			getServiceAsync() {
				return Promise.resolve({
					getHash() {
						return "testSemanticObject-testAction";
					},
					parseShellHash() {
						return {
							semanticObject: "testSemanticObject",
							action: "testAction"
						};
					}
				});
			},
			getLogonSystem() {
				return {
					isTrial() {
						return false;
					}
				};
			}
		};
		sandbox.stub(FlUtils, "getUshellContainer").returns(oUshellContainerStub);
	}

	QUnit.module("Given the ushell container is stubbed", {
		beforeEach() {
			stubUshellContainer();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When getId() method is called with an id which does not have a 'customer' prefix", function(assert) {
			assert.notEqual(AppVariantUtils.getId("testId"), "customer.testId", "then the id is concatenated with prefix customer and suffix generated UID");
		});

		QUnit.test("When getId() method is called with an id which has a 'customer' prefix", function(assert) {
			assert.notEqual(AppVariantUtils.getId("customer.testId"), "customer.testId", "then the id is concatenated with suffix generated UID");
		});

		QUnit.test("When trimIdIfRequired() method is called with an id which has a 'customer' prefix and more than 56 characters long", function(assert) {
			const sTrimmedId = AppVariantUtils.trimIdIfRequired("customer.testId.id_1234567890123456789012345678901234567890");
			assert.equal(sTrimmedId.length, 56, "then the id trimmed to 56 characters");
		});

		QUnit.test("When getId() method is called with an id which has a 'customer' prefix and has a generated UID as a suffix", function(assert) {
			assert.notEqual(AppVariantUtils.getId("customer.testId.id_1234567"), "customer.testId.id_1234567", "then the id is replaced with suffix generated UID");
			assert.notEqual(AppVariantUtils.getId("customer.testId.id_1234567890123456789012345678901234567890"), "customer.testId.id_1234567890123456789012345678901234567890", "then the guid has been changed");
		});

		QUnit.test("When getId() method is called with an id which had problems with trimming", function(assert) {
			let sTrimmedId = AppVariantUtils.getId("cus.sd.schedulingagreements.manage");
			assert.ok(sTrimmedId.length < 56, "then the id has been trimmed properly and will never complain of already exisiting id");

			sTrimmedId = AppVariantUtils.getId("cus.sd.schedulingagreements.factsheets1");
			assert.ok(sTrimmedId.length < 56, "then the id has been trimmed properly and will never complain of already exisiting id");
		});

		QUnit.test("When getNewAppVariantId() method is called with an id which has a 'customer' prefix and has a generated UID as a suffix", function(assert) {
			const sGeneratedId = AppVariantUtils.getId("customer.testId.id_1234567");
			assert.strictEqual(AppVariantUtils.getNewAppVariantId(), sGeneratedId, "then the id is correct");
		});

		QUnit.test("When prepareTextsChange() method is called", function(assert) {
			const oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New title entered by a key user via RTA tool",
				value: {
					"": "TestTitle"
				}
			};
			assert.deepEqual(AppVariantUtils.prepareTextsChange("title", "TestTitle"), oPropertyChange, "then the inline property change is correct");
		});

		QUnit.test("When getInlineChangeInputIcon() method is called", function(assert) {
			assert.deepEqual(AppVariantUtils.getInlineChangeInputIcon("testIcon"), {content: {icon: "testIcon"}}, "then the content of icon inline change is correct");
		});

		QUnit.test("When prepareRemoveAllInboundsExceptOneChange() method is called", function(assert) {
			assert.deepEqual(AppVariantUtils.prepareRemoveAllInboundsExceptOneChange("testInbound"), {content: {inboundId: "testInbound"}}, "then the content of remove inbound inline change is correct");
		});

		QUnit.test("When getInboundInfo() is called, the running app has no inbounds present in the manifest", function(assert) {
			return AppVariantUtils.getInboundInfo()
			.then(function(mInboundInfo) {
				assert.deepEqual(mInboundInfo, {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: true}, "then the current inbound info is correct");
			});
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound does not match with inbounds present in the manifest", function(assert) {
			const oInbounds = {
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

			return AppVariantUtils.getInboundInfo(oInbounds)
			.then(function(mInboundInfo) {
				assert.deepEqual(mInboundInfo, {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: true}, "then the current inbound info is correct");
			});
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound does match with an inbound present in the manifest", function(assert) {
			const oInbounds = {
				"customer.savedAsAppVariant": {
					semanticObject: "testSemanticObject",
					action: "testAction"
				}
			};

			return AppVariantUtils.getInboundInfo(oInbounds)
			.then(function(mInboundInfo) {
				assert.deepEqual(mInboundInfo, {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: false}, "then the existing inbound will be reused");
			});
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound match with 1 inbounds' SO and action", function(assert) {
			const oInbounds = {
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

			return AppVariantUtils.getInboundInfo(oInbounds)
			.then(function(mInboundInfo) {
				assert.deepEqual(mInboundInfo, {currentRunningInbound: "inbound2", addNewInboundRequired: false}, "then the current inbound info is correct");
			});
		});

		QUnit.test("When getInboundInfo() is called, the semantic object and action of running inbound match with 2 inbounds' SO and action", function(assert) {
			const oInbounds = {
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

			return AppVariantUtils.getInboundInfo(oInbounds)
			.then(function(mInboundInfo) {
				assert.deepEqual(mInboundInfo, {currentRunningInbound: "customer.savedAsAppVariant", addNewInboundRequired: true}, "then the current inbound info is correct");
			});
		});

		QUnit.test("When prepareAddNewInboundChange() method is called", function(assert) {
			const oInboundPropertyChange = {
				content: {
					inbound: {
						"customer.savedAsAppVariant": {
							semanticObject: "testSemanticObject",
							action: "testAction",
							title: "{{referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.title}}",
							subTitle: "{{referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.subTitle}}",
							icon: "Test icon",
							signature: {
								parameters: {
									"sap-appvar-id": {
										required: true,
										filter: {
											value: "appVariantId",
											format: "plain"
										},
										launcherValue: {
											value: "appVariantId"
										}
									}
								},
								additionalParameters: "ignored"
							}
						}
					}
				},
				texts: {
					"referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.title": {
						type: "XTIT",
						maxLength: 50,
						comment: "New title entered by a key user via RTA tool",
						value: {
							"": "Test Title"
						}
					},
					"referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.subTitle": {
						type: "XTIT",
						maxLength: 50,
						comment: "New subTitle entered by a key user via RTA tool",
						value: {
							"": "Test Subtitle"
						}
					}
				}
			};

			return AppVariantUtils.prepareAddNewInboundChange("customer.savedAsAppVariant", "appVariantId", {title: "Test Title", subTitle: "Test Subtitle", icon: "Test icon", referenceAppId: "referenceId"})
			.then(function(oPreparedInboundChange) {
				assert.deepEqual(oPreparedInboundChange, oInboundPropertyChange, "then the addNewInbound change structure is correct");
			});
		});

		QUnit.test("When prepareChangeInboundChange() method is called", function(assert) {
			const oInboundPropertyChange = {
				content: {
					inboundId: "customer.savedAsAppVariant",
					entityPropertyChange: [{
						propertyPath: "signature/parameters/sap-appvar-id",
						operation: "UPSERT",
						propertyValue: {
							required: true,
							filter: {
								value: "appVariantId",
								format: "plain"
							},
							launcherValue: {
								value: "appVariantId"
							}
						}
					}, {
						propertyPath: "title",
						operation: "UPSERT",
						propertyValue: "{{referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.title}}"
					}, {
						propertyPath: "subTitle",
						operation: "UPSERT",
						propertyValue: "{{referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.subTitle}}"
					}, {
						propertyPath: "icon",
						operation: "UPSERT",
						propertyValue: "Test icon"
					}]
				},
				texts: {
					"referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.title": {
						type: "XTIT",
						maxLength: 50,
						comment: "New title entered by a key user via RTA tool",
						value: {
							"": "Test Title"
						}
					},
					"referenceId_sap.app.crossNavigation.inbounds.customer.savedAsAppVariant.subTitle": {
						type: "XTIT",
						maxLength: 50,
						comment: "New subTitle entered by a key user via RTA tool",
						value: {
							"": "Test Subtitle"
						}
					}
				}
			};

			assert.deepEqual(AppVariantUtils.prepareChangeInboundChange("customer.savedAsAppVariant", "appVariantId", {title: "Test Title", subTitle: "Test Subtitle", icon: "Test icon", referenceAppId: "referenceId"}), oInboundPropertyChange, "then the addNewInbound change structure is correct");
		});

		QUnit.test("When getInlineChangeForInboundPropertySaveAs() method is called", function(assert) {
			const oInboundPropertyChange = {
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

		QUnit.test("When getTransportInput() method is called", function(assert) {
			const oTransportInput = AppVariantUtils.getTransportInput("", "TestNamespace", "TestId", "appdescr_variant");

			assert.strictEqual(oTransportInput.getPackage(), "", "then the package is correct");
			assert.strictEqual(oTransportInput.getNamespace(), "TestNamespace", "then the namespace is correct");
			assert.strictEqual(oTransportInput.getId(), "TestId", "then the id is correct");
			assert.strictEqual(oTransportInput.getDefinition().fileType, "appdescr_variant", "then the file type is correct");
		});

		QUnit.test("When onTransportInDialogSelected() method is called and rejected", function(assert) {
			let oTransportInfo;

			return AppVariantFactory.prepareCreate({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			})
			.then(function(oManifestVariant) {
				return AppVariantUtils.onTransportInDialogSelected(oManifestVariant, oTransportInfo);
			})
			.catch(function() {
				assert.ok("Operation cancelled successfully");
			});
		});

		QUnit.test("When deleteAppVariant() method is called", function(assert) {
			const fnDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();
			const vAppIdSelector = {appId: "customer.appvar.id"};
			return AppVariantUtils.deleteAppVariant(vAppIdSelector, Layer.CUSTOMER).then(function() {
				assert.ok(fnDeleteAppVariantStub.calledWithExactly({selector: vAppIdSelector, layer: Layer.CUSTOMER}));
			});
		});

		QUnit.test("When copyId() is called", function(assert) {
			assert.equal(AppVariantUtils.copyId("CopyMe"), true, "then the the string is copied to your clipboard");
		});

		QUnit.test("When buildErrorInfo() is called for different error possibilities", function(assert) {
			let oError = {
				messages: [{
					text: "Error1"
				}]
			};

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Error1").returns();
			let oResult = AppVariantUtils.buildErrorInfo("MSG_COPY_UNSAVED_CHANGES_FAILED", oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");

			sandbox.restore();

			oError = {
				iamAppId: "IamId"
			};

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "IAM App Id: IamId").returns();
			oResult = AppVariantUtils.buildErrorInfo("MSG_COPY_UNSAVED_CHANGES_FAILED", oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");

			sandbox.restore();

			oError = "Error2";

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "Error2").returns();
			oResult = AppVariantUtils.buildErrorInfo("MSG_COPY_UNSAVED_CHANGES_FAILED", oError, "AppVariantId");
			assert.strictEqual(oResult.appVariantId, "AppVariantId", "then the appVariantId is correct");
			assert.notEqual(oResult.text, undefined, "then the text is correct");
		});

		QUnit.test("When _getErrorMessageText() is called with differente errors", function(assert) {
			const oError = {
				status: 500,
				messageKey: "MSG_SAVE_APP_VARIANT_FAILED"
			};
			oError.userMessage = "The referenced object does not exist or is not unique";
			let sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, oError.userMessage, "then the userMessage error is returned");
			delete oError.userMessage;

			oError.messages = [{text: "this is"}, {text: "a test error"}];
			sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, oError.messages.map(function(oError) {
				return oError.text;
			}).join("\n"), "then the messages error is returned");
			delete oError.messages;

			oError.iamAppId = "Test IAM error message";
			sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, `IAM App Id: ${oError.iamAppId}`, "then the error message with IAM AppID is returned");
			delete oError.iamAppId;

			oError.stack = "Error: this is test stack message";
			sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, oError.stack, "then the stack error is returned");
			delete oError.stack;

			oError.message = "This is a test message";
			sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, oError.message, "then the message error is returned");
			delete oError.message;

			sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, oError.status, "then the status is returned");
			delete oError.status;

			sErrorMessage = AppVariantUtils._getErrorMessageText(oError);
			assert.strictEqual(sErrorMessage, oError, "then the error object is returned");
		});

		QUnit.test("When showRelevantDialog() is called with success message and Ok button is pressed", function(assert) {
			const oInfo = {
				text: "Text",
				copyId: false
			};

			const bSuccessful = true;
			const oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose(MessageBox.Action.OK);
			});

			return AppVariantUtils.showRelevantDialog(oInfo, bSuccessful).then(function() {
				assert.ok("then the successful dialog pops up and OK button pressed");
				assert.ok(oCopyIDStub.notCalled, "then the ID is not copied");
			});
		});

		QUnit.test("When showRelevantDialog() is called with success message and CopyID and Ok button is pressed", function(assert) {
			const oInfo = {
				text: "Text",
				copyId: true,
				appVariantId: "Whatever!"
			};

			const bSuccessful = true;

			const oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Copy ID and Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo, bSuccessful).then(function() {
				assert.ok("then the successful dialog pops up and Copy ID and Close button pressed");
				assert.equal(oCopyIDStub.callCount, 1, "then the ID is copied successfully");
			});
		});

		QUnit.test("When showRelevantDialog() is called from overview dialog with failure message and Close button is pressed", function(assert) {
			const oInfo = {
				text: "Text",
				overviewDialog: true
			};
			const oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function(bResponse) {
				assert.ok("then the failure dialog pops up and Close button pressed");
				assert.strictEqual(bResponse, false);
				assert.ok(oCopyIDStub.notCalled, "then the ID is not copied");
			});
		});

		QUnit.test("When showRelevantDialog() is called with failure message and close button is pressed", function(assert) {
			const oInfo = {
				text: "Text"
			};
			const oCopyIDStub = sandbox.stub(AppVariantUtils, "copyId");
			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function() {
				assert.ok("then the failure dialog pops up and Close button pressed");
				assert.ok(oCopyIDStub.notCalled, "then the ID is not copied");
			});
		});

		QUnit.test("When showRelevantDialog() is called with failure message and Copy ID and close button is pressed", function(assert) {
			const oInfo = {
				text: "Text",
				copyId: true,
				appVariantId: "Whatever!"
			};

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Copy ID and Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function() {
				assert.ok("then the failure dialog pops up and Copy ID and close button pressed");
			});
		});

		QUnit.test("When showRelevantDialog() is called with info message (Delete an app variant) and Ok button is pressed", function(assert) {
			const oInfo = {
				text: "Text",
				deleteAppVariant: true
			};

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose(MessageBox.Action.OK);
			});

			return AppVariantUtils.showRelevantDialog(oInfo).then(function() {
				assert.ok("then the info dialog pops up and Ok button pressed");
			});
		});

		QUnit.test("When showRelevantDialog() is called with info message (Delete an app variant) and Close button is pressed", function(assert) {
			const oInfo = {
				text: "Text",
				deleteAppVariant: true
			};

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			return AppVariantUtils.showRelevantDialog(oInfo).catch(
				function() {
					assert.ok("then the info dialog pops up and Close button pressed");
				}
			);
		});

		QUnit.test("When navigateToFLPHomepage() method is called and navigation to launchpad gets triggered", function(assert) {
			sandbox.restore();
			let bUShellNavigationTriggered = false;

			sandbox.stub(FlUtils, "getUshellContainer").returns({
				getServiceAsync() {
					return Promise.resolve({
						navigate() {
							bUShellNavigationTriggered = true;
						},
						getCurrentApplication() {
							return {
								componentInstance: "testInstance"
							};
						}
					});
				}
			});

			return AppVariantUtils.navigateToFLPHomepage().then(function() {
				assert.ok(bUShellNavigationTriggered, "then the navigation to fiorilaunchpad gets triggered");
			});
		});

		QUnit.test("When navigateToFLPHomepage() method is called and navigation to launchad does not get triggered", function(assert) {
			sandbox.restore();
			let bUShellNavigationTriggered = false;

			sandbox.stub(FlUtils, "getUshellContainer").returns({
				getServiceAsync() {
					return Promise.resolve({
						navigate() {
							bUShellNavigationTriggered = true;
						},
						getCurrentApplication() {
							return {
								componentHandle: {
									getInstance() {
										return undefined;
									}
								}
							};
						}
					});
				}
			});

			return AppVariantUtils.navigateToFLPHomepage().then(function() {
				assert.notOk(bUShellNavigationTriggered, "then the navigation to fiorilaunchpad does not get triggered");
			});
		});

		QUnit.test("When triggerCatalogAssignment() method is called on S4 Cloud system", function(assert) {
			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantUtils.triggerCatalogAssignment("AppVarId", Layer.CUSTOMER, "OriginalId").then(function() {
				assert.ok(oSendRequestStub.calledWith("/sap/bc/lrep/appdescr_variants/AppVarId?action=assignCatalogs&assignFromAppId=OriginalId", "POST"));
			});
		});

		QUnit.test("When triggerCatalogUnAssignment() method is called on S4 Cloud system", function(assert) {
			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantUtils.triggerCatalogUnAssignment("AppVarId", Layer.CUSTOMER).then(function() {
				assert.ok(oSendRequestStub.calledWith("/sap/bc/lrep/appdescr_variants/AppVarId?action=unassignCatalogs", "POST"));
			});
		});

		QUnit.test("When showMessage() method is called", function(assert) {
			const sMessageKey = "SOME_KEY";
			const oGetText = sandbox.stub(AppVariantUtils, "getText");
			const oShowRelevantDialogStub = sandbox.stub(AppVariantUtils, "showRelevantDialog");

			AppVariantUtils.showMessage(sMessageKey);

			assert.equal(oGetText.callCount, 1, "then the getText() method is called once");
			assert.equal(oShowRelevantDialogStub.callCount, 1, "then the info message toast pops up");
		});

		QUnit.test("When catchErrorDialog() method is called", function(assert) {
			const oError = {};
			const oBuildErrorInfoStub = sandbox.stub(AppVariantUtils, "buildErrorInfo");
			const oShowRelevantDialogStub = sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();
			return AppVariantUtils.catchErrorDialog(oError, "SOME_KEY", "IAMId").then(function() {
				assert.equal(oBuildErrorInfoStub.callCount, 1, "then the buildErrorInfo() method is called once");
				assert.equal(oShowRelevantDialogStub.callCount, 1, "then the showRelevantDialog() method is called once");
			});
		});

		QUnit.test("When buildSuccessInfo() method is called for S/4HANA on Premise", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);
			const oGetText = sandbox.stub(AppVariantUtils, "getText");

			return AppVariantFactory.prepareCreate({
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
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);
			const oGetText = sandbox.stub(AppVariantUtils, "getText");

			return AppVariantFactory.prepareCreate({
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
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);
			const oGetText = sandbox.stub(AppVariantUtils, "getText");
			AppVariantUtils.buildFinalSuccessInfoS4HANACloud();
			assert.equal(oGetText.callCount, 1, "then the getText() method is called once");
		});

		QUnit.test("When buildDeleteSuccessMessage() method is called for S/4HANA onPremise after deletion finished succesfully", function(assert) {
			const oGetText = sandbox.stub(AppVariantUtils, "getText");
			AppVariantUtils.buildDeleteSuccessMessage("APP_VAR_ID", false);
			assert.ok(oGetText.calledWithExactly("DELETE_APP_VARIANT_SUCCESS_MESSAGE", "APP_VAR_ID"), "then the getText() method is called with correct parameters");
		});

		QUnit.test("When buildDeleteSuccessMessage() method is called for S/4HANA Cloud after deletion finished succesfully", function(assert) {
			const oGetText = sandbox.stub(AppVariantUtils, "getText");
			AppVariantUtils.buildDeleteSuccessMessage("APP_VAR_ID", true);
			assert.ok(oGetText.calledWithExactly("DELETE_APP_VARIANT_SUCCESS_MESSAGE_CLOUD", "APP_VAR_ID"), "then the getText() method is called with correct parameters");
		});
	});

	QUnit.module("Given the ushell container and an UIComponent is stubbed", {
		beforeEach() {
			stubUshellContainer();
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, "TestId");
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When createAppVariant() method is called", function(assert) {
			const fnSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves();
			return AppVariantUtils.createAppVariant(this.oAppComponent, {id: "customer.appvar.id", layer: Layer.CUSTOMER}).then(function() {
				assert.ok(fnSaveAsAppVariantStub.calledWithExactly({selector: this.oAppComponent, id: "customer.appvar.id", layer: Layer.CUSTOMER, version: "1.0.0"}));
			}.bind(this));
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'title'", function(assert) {
			const oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New title entered by a key user via RTA tool",
				value: {
					"": "Test Title"
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setTitle", this.oAppComponent).then(function(oManifestChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oManifestChange._oInlineChange, "then the title inline change is correct");
				assert.strictEqual(oManifestChange._oInlineChange.getMap().changeType, "appdescr_app_setTitle", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'subTitle'", function(assert) {
			const oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New subtitle entered by a key user via RTA tool",
				value: {
					"": "Test Subtitle"
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setSubTitle", this.oAppComponent).then(function(oSubtitleInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oSubtitleInlineChange._oInlineChange, "then the subtitle inline change is correct");
				assert.strictEqual(oSubtitleInlineChange._oInlineChange.getMap().changeType, "appdescr_app_setSubTitle", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'description'", function(assert) {
			const oPropertyChange = {
				type: "XTIT",
				maxLength: 50,
				comment: "New description entered by a key user via RTA tool",
				value: {
					"": "Test Description"
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_setDescription", this.oAppComponent).then(function(oDescriptionInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oDescriptionInlineChange._oInlineChange, "then the description inline change is correct");
				assert.strictEqual(oDescriptionInlineChange._oInlineChange.getMap().changeType, "appdescr_app_setDescription", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'icon'", function(assert) {
			const oPropertyChange = {
				content: {
					icon: "testIcon"
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_ui_setIcon", this.oAppComponent).then(function(oIconInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oIconInlineChange._oInlineChange, "then the icon inline change is correct");
				assert.strictEqual(oIconInlineChange._oInlineChange.getMap().changeType, "appdescr_ui_setIcon", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inbound'", function(assert) {
			const oGeneratedID = AppVariantUtils.getId("testId");
			const oPropertyChange = {
				content: {
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
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the change inbound inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'createInbound'", function(assert) {
			const oPropertyChange = {
				content: {
					inbound: {
						testInbound: {
							semanticObject: "testSemanticObject",
							action: "testAction"
						}
					}
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_addNewInbound", this.oAppComponent).then(function(oCreateInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oCreateInboundInlineChange._oInlineChange, "then the create inbound inline change is correct");
				assert.strictEqual(oCreateInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_addNewInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundTitle'", function(assert) {
			const oPropertyChange = {
				content: {
					inboundId: "testInbound",
					entityPropertyChange: {
						propertyPath: "title",
						operation: "UPSERT",
						propertyValue: "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.title}}"
					}
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

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the inbound title inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundSubtitle'", function(assert) {
			const oPropertyChange = {
				content: {
					inboundId: "testInbound",
					entityPropertyChange: {
						propertyPath: "subTitle",
						operation: "UPSERT",
						propertyValue: "{{appVariantId_sap.app.crossNavigation.inbounds.testInbound.subtitle}}"
					}
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

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the create inbound subTitle inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'inboundIcon'", function(assert) {
			const oPropertyChange = {
				content: {
					inboundId: "testInbound",
					entityPropertyChange: {
						propertyPath: "icon",
						operation: "UPSERT",
						propertyValue: "testIcon"
					}
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_changeInbound", this.oAppComponent).then(function(oChangeInboundInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oChangeInboundInlineChange._oInlineChange, "then the create inbound icon inline change is correct");
				assert.strictEqual(oChangeInboundInlineChange._oInlineChange.getMap().changeType, "appdescr_app_changeInbound", "then the change type is correct");
			});
		});

		QUnit.test("When createInlineChange() method is called for propertyChange 'removeInbound'", function(assert) {
			const oPropertyChange = {
				content: {
					inboundId: "testInbound"
				}
			};

			const oCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return AppVariantUtils.createInlineChange(oPropertyChange, "appdescr_app_removeAllInboundsExceptOne", this.oAppComponent).then(function(oRemoveAllInboundsExceptOneInlineChange) {
				assert.equal(oCreateChangesSpy.callCount, 1, "then ChangesWriteAPI.create method is called once");
				assert.ok(oRemoveAllInboundsExceptOneInlineChange._oInlineChange, "then the remove inbound inline change is correct");
				assert.strictEqual(oRemoveAllInboundsExceptOneInlineChange._oInlineChange.getMap().changeType, "appdescr_app_removeAllInboundsExceptOne", "then the change type is correct");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});