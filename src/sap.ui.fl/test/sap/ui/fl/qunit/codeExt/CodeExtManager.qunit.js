/*global QUnit */

sap.ui.define([
	"sap/ui/fl/codeExt/CodeExtManager",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	CodeExtManager,
	CompatibilityConnector,
	Utils,
	LayerUtils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("CodeExtManager", {
		afterEach : function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("createOrUpdateCodeExtChange throws an error if no codeRef is provided", function(assert) {
			var oPropertyBag = {
				content: {
					codeRef: undefined
				},
				selector: {
					id: "controllerName"
				}
			};

			assert.throws(function() {
				CodeExtManager.createOrUpdateCodeExtChange(oPropertyBag);
			}, new Error("no code reference passed for the code extension change"), "an error was thrown");
		});

		QUnit.test("createOrUpdateCodeExtChange throws an error if no controller name is provided", function(assert) {
			var oPropertyBag = {
				content: {
					codeRef: "codeRef"
				}
			};

			assert.throws(function() {
				CodeExtManager.createOrUpdateCodeExtChange(oPropertyBag);
			}, new Error("no controller name passed for the code extension change"), "an error was thrown");

			var oPropertyBag2 = {
				content: {
					codeRef: "codeRef"
				},
				selector: {
					id: undefined
				}
			};

			assert.throws(function() {
				CodeExtManager.createOrUpdateCodeExtChange(oPropertyBag2);
			}, new Error("no controller name passed for the code extension change"), "an error was thrown");
		});

		QUnit.test("createOrUpdateCodeExtChange throws an error if no reference is provided", function(assert) {
			var oPropertyBag = {
				content: {
					codeRef: "codeRef"
				},
				selector: {
					id: "controllerName"
				}
			};

			assert.throws(function() {
				CodeExtManager.createOrUpdateCodeExtChange(oPropertyBag);
			}, new Error("no reference passed for the code extension change"), "an error was thrown");
		});

		QUnit.test("createOrUpdateCodeExtChange creates a new change and calls the backend connection class to propagate the creation", function(assert) {
			var sGeneratedId = "id_123_0";
			var sCodeRef = "myCode/code.js";
			var sControllerName = "controllerName";

			sandbox.stub(Utils, "createDefaultFileName").returns(sGeneratedId);

			var sExpectedUrl = "/sap/bc/lrep/content/apps/component/changes/" + sGeneratedId + ".change?layer=CUSTOMER";

			var oPropertyBag = {
				componentName: "component",
				fileName: "a.js",
				namespace: "",
				reference: "component.Component",
				content: {
					codeRef: sCodeRef
				},
				selector: {
					id: sControllerName
				}
			};

			var oLrepConnectorSendStub = sandbox.stub(CodeExtManager._oLrepConnector, "send");

			CodeExtManager.createOrUpdateCodeExtChange(oPropertyBag);

			assert.ok(oLrepConnectorSendStub.calledOnce, "the sending was initiated");

			var oCallArguments = oLrepConnectorSendStub.getCall(0).args;

			assert.equal(oCallArguments[0], sExpectedUrl, "the url was build correct");
			assert.equal(oCallArguments[1], "PUT", "the backend operation should be a writing");
			assert.equal(oCallArguments[2].changeType, "codeExt", "the change type is codeExt");
			assert.equal(oCallArguments[2].content.codeRef, sCodeRef, "the code reference property should be set in the content section");
			assert.equal(oCallArguments[2].selector.id, sControllerName, "the controller name property should be set in the content section");
			assert.equal(oCallArguments[2].fileName, sGeneratedId, "an ID was generated");
		});

		QUnit.test("createOrUpdateCodeExtChange creates a new change with TransportInfor and calls the backend connection class to propagate the creation", function(assert) {
			var sGeneratedId = "id_123_0";
			var sCodeRef = "myCode/code.js";
			var sControllerName = "controllerName";

			sandbox.stub(Utils, "createDefaultFileName").returns(sGeneratedId);

			var sExpectedUrl = "/sap/bc/lrep/content/apps/component/changes/" + sGeneratedId + ".change?layer=CUSTOMER&changelist=myTransportId&package=myPackageName";

			var oPropertyBag = {
				componentName: "component",
				fileName: "a.js",
				namespace: "",
				reference: "component.Component",
				content: {
					codeRef: sCodeRef
				},
				selector: {
					id: sControllerName
				}
			};

			var mOptions = {
				transportId: "myTransportId",
				packageName: "myPackageName"
			};

			var oLrepConnectorSendStub = sandbox.stub(CodeExtManager._oLrepConnector, "send");

			CodeExtManager.createOrUpdateCodeExtChange(oPropertyBag, mOptions);

			assert.ok(oLrepConnectorSendStub.calledOnce, "the sending was initiated");

			var oCallArguments = oLrepConnectorSendStub.getCall(0).args;

			assert.equal(oCallArguments[0], sExpectedUrl, "the url was build correct");
			assert.equal(oCallArguments[1], "PUT", "the backend operation should be a writing");
			assert.equal(oCallArguments[2].changeType, "codeExt", "the change type is codeExt");
			assert.equal(oCallArguments[2].content.codeRef, sCodeRef, "the code reference property should be set in the content section");
			assert.equal(oCallArguments[2].selector.id, sControllerName, "the controller name property should be set in the content section");
			assert.equal(oCallArguments[2].fileName, sGeneratedId, "an ID was generated");
		});

		QUnit.test("createCodeExtChanges creates new changes with transportId, packageName, codeRef and calls the backend connection class to propagate the creation", function(assert) {
			var sGeneratedId = "id_123_0";
			var sLayer = "VENDOR";
			var sCodeRef = "myCode/code.js";
			var sControllerName1 = "controllerName1";
			var sControllerName2 = "controllerName2";
			var sReference = "component.Component";
			var sNamespace = "namespace";
			var sLanguage = "EN";

			sandbox.stub(Utils, "createDefaultFileName").returns(sGeneratedId);
			sandbox.stub(LayerUtils, "getCurrentLayer").returns(sLayer);
			sandbox.stub(Utils, "createNamespace").returns(sNamespace);
			sandbox.stub(Utils, "getCurrentLanguage").returns(sLanguage);

			var aChanges = [
				{
					changeType : "codeExt",
					namespace : "",
					componentName : "component",
					reference : sReference,
					selector : {
						id : sControllerName1
					}
				},
				{
					changeType : "codeExt",
					namespace : "",
					componentName : "component",
					reference : sReference,
					selector : {
						id : sControllerName2
					}
				}];

			var mOptions = {
				transportId: "myTransportId",
				packageName: "myPackageName",
				codeRef: sCodeRef
			};

			var aExpectedPayload = [
				{
					appDescriptorChange: false,
					fileName: sGeneratedId,
					fileType: "change",
					changeType: "codeExt",
					reference: sReference,
					packageName: "myPackageName",
					content: {
						codeRef: sCodeRef
					},
					selector: {
						id : sControllerName1
					},
					layer: sLayer,
					moduleName: "",
					texts: {},
					namespace: sNamespace,
					projectId : "component",
					creation: "",
					originalLanguage: sLanguage,
					support: {
						generator: "Change.createInitialFileContent",
						service: "",
						user: "",
						sapui5Version: sap.ui.version,
						compositeCommand: "",
						sourceChangeFileName: ""
					},
					oDataInformation: {},
					dependentSelector: {},
					validAppVersions: {},
					jsOnly: false,
					variantReference: ""
				},
				{
					appDescriptorChange: false,
					fileName: sGeneratedId,
					fileType: "change",
					changeType: "codeExt",
					reference: sReference,
					packageName: "myPackageName",
					content: {
						codeRef: sCodeRef
					},
					selector: {
						id : sControllerName2
					},
					layer: sLayer,
					moduleName: "",
					texts: {},
					namespace: sNamespace,
					projectId : "component",
					creation: "",
					originalLanguage: sLanguage,
					support: {
						generator: "Change.createInitialFileContent",
						service: "",
						user: "",
						sapui5Version: sap.ui.version,
						compositeCommand: "",
						sourceChangeFileName: ""
					},
					oDataInformation: {},
					dependentSelector: {},
					validAppVersions: {},
					jsOnly: false,
					variantReference: ""
				}
			];

			var oConnectorCreateStub = sandbox.stub(CompatibilityConnector, "create");

			CodeExtManager.createCodeExtChanges(aChanges, mOptions);

			assert.ok(oConnectorCreateStub.calledOnce, "the sending was initiated");

			var oCallArguments = oConnectorCreateStub.getCall(0).args;

			assert.deepEqual(oCallArguments[0], aExpectedPayload, "the payload was built correctly");
			assert.equal(oCallArguments[1], mOptions.transportId, "the transportId was sent correctly");
		});

		QUnit.test("deleteCodeExtChange throws an error if the passed object is not an code extension", function(assert) {
			var oPropertyBag = {
				changeType: "codeExt",
				fileType: "somethingElse"
			};

			assert.throws(function() {
				CodeExtManager.deleteCodeExtChange(oPropertyBag);
			}, new Error("the change is not of type 'code extension'"), "an error was thrown");
		});
		QUnit.test("deleteCodeExtChange throws an error if the passed object is not an change file", function(assert) {
			var oPropertyBag = {
				changeType: "somethingElse",
				fileType: "change"
			};

			assert.throws(function() {
				CodeExtManager.deleteCodeExtChange(oPropertyBag);
			}, new Error("the change is not of type 'code extension'"), "an error was thrown");
		});

		QUnit.test("deleteCodeExtChange throws an error if the file name is not specified", function(assert) {
			var oPropertyBag = {
				fileName: undefined,
				fileType: "change",
				changeType: "codeExt",
				content: {
					codeRef: "codeRef",
					appVariantId: "controllerName"
				}
			};

			assert.throws(function() {
				CodeExtManager.deleteCodeExtChange(oPropertyBag);
			}, new Error("the extension does not contains a file name"), "an error was thrown");
		});

		QUnit.test("deleteCodeExtChange throws an error if the passed object has no namepsace property", function(assert) {
			var oPropertyBag = {
				changeType: "codeExt",
				fileType: "change",
				fileName: "a",
				content: {
					codeRef: "codeRef",
					appVariantId: "controllerName"
				}
			};

			assert.throws(function() {
				CodeExtManager.deleteCodeExtChange(oPropertyBag);
			}, new Error("the extension does not contains a namespace"), "an error was thrown");
		});

		QUnit.test("deleteCodeExtChange deletes a change and calls the backend connection class to propagate the deletion", function(assert) {
			var sFileName = "id_123_0";
			var sCodeRef = "myCode/code.js";
			var sNameSpace = "apps/component/changes/";
			var sControllerName = "controllerName";

			sandbox.stub(Utils, "createDefaultFileName").returns(sFileName);

			var sExpectedUrl = "/sap/bc/lrep/content/" + sNameSpace + sFileName + ".change?layer=VENDOR";

			var oPropertyBag = {
				changeType: "codeExt",
				fileName: sFileName,
				fileType: "change",
				componentName: "component",
				namespace: sNameSpace,
				reference: "component.Component",
				content: {
					codeRef: sCodeRef,
					appVariantId: sControllerName
				},
				layer: "VENDOR"
			};

			var oLrepConnectorSendStub = sandbox.stub(CodeExtManager._oLrepConnector, "send");

			CodeExtManager.deleteCodeExtChange(oPropertyBag);

			assert.ok(oLrepConnectorSendStub.calledOnce, "the sending was initiated");

			var oCallArguments = oLrepConnectorSendStub.getCall(0).args;

			assert.equal(oCallArguments[0], sExpectedUrl, "the url was build correct");
			assert.equal(oCallArguments[1], "DELETE", "the backend operation should be a deletion");
			assert.equal(oCallArguments[2].fileName, sFileName, "the file name was taken over from the id property");
		});

		QUnit.test("deleteCodeExtChange deletes a change with TranportInfor and calls the backend connection class to propagate the deletion", function(assert) {
			var sFileName = "id_123_0";
			var sCodeRef = "myCode/code.js";
			var sNameSpace = "apps/component/changes/";
			var sControllerName = "controllerName";

			sandbox.stub(Utils, "createDefaultFileName").returns(sFileName);

			var sExpectedUrl = "/sap/bc/lrep/content/" + sNameSpace + sFileName + ".change?layer=VENDOR&changelist=myTransportId&package=myPackageName";

			var oPropertyBag = {
				changeType: "codeExt",
				fileName: sFileName,
				fileType: "change",
				componentName: "component",
				namespace: sNameSpace,
				reference: "component.Component",
				content: {
					codeRef: sCodeRef,
					appVariantId: sControllerName
				},
				layer: "VENDOR"
			};

			var mOptions = {
				transportId: "myTransportId",
				packageName: "myPackageName"
			};

			var oLrepConnectorSendStub = sandbox.stub(CodeExtManager._oLrepConnector, "send");

			CodeExtManager.deleteCodeExtChange(oPropertyBag, mOptions);

			assert.ok(oLrepConnectorSendStub.calledOnce, "the sending was initiated");

			var oCallArguments = oLrepConnectorSendStub.getCall(0).args;

			assert.equal(oCallArguments[0], sExpectedUrl, "the url was build correct");
			assert.equal(oCallArguments[1], "DELETE", "the backend operation should be a deletion");
			assert.equal(oCallArguments[2].fileName, sFileName, "the file name was taken over from the id property");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});