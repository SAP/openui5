/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/UploadCollection",
	"sap/m/UploadCollectionItem",
	"sap/m/UploadCollectionParameter",
	"sap/m/UploadState",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/UploadCollectionRenderer",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/ListSeparators",
	"sap/m/ListMode",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/uploadCollection/UploadCollectionTestUtils"
], function (jQuery, UploadCollection, UploadCollectionItem, UploadCollectionParameter, UploadState, Toolbar, Label,
			 UploadCollectionRenderer, ListItemBaseRenderer, Dialog, Device, ListSeparators, ListMode, MessageBox,
			 JSONModel, TestUtils) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4"
				},
				{
					fileName: "Brenda.mp4",
					enableDelete: false,
					enableEdit: false,
					visibleDelete: false,
					visibleEdit: false
				}
			]
		};
	}

	QUnit.module("UploadCollectionItem general functionality", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection("uploadCollection", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Flags enableDelete, enableEdit, visibleDelete, visibleEdit", function (assert) {
		var oItem0 = this.oUploadCollection.getItems()[0],
			oItem1 = this.oUploadCollection.getItems()[1];

		assert.ok(oItem0._getDeleteButton().getEnabled(), "Delete button should be enabled by default.");
		assert.ok(oItem0._getDeleteButton().getVisible(), "Delete button should be visible by default.");
		assert.ok(oItem0._getEditButton().getEnabled(), "Edit button should be enabled by default.");
		assert.ok(oItem0._getEditButton().getVisible(), "Edit button should be visible by default.");

		assert.notOk(oItem1._getDeleteButton().getEnabled(), "Delete button should be disabled for 'enableDelete' set to false.");
		assert.notOk(oItem1._getDeleteButton().getVisible(), "Delete button should be invisible by for 'visibleDelete' set to false.");
		assert.notOk(oItem1._getEditButton().getEnabled(), "Edit button should be disabled for 'enableEdit' set to false.");
		assert.notOk(oItem1._getEditButton().getVisible(), "Edit button should be invisible for 'visibleEdit' set to false.");

		// Disable/hide ex-post
		oItem0.setEnableDelete(false);
		oItem0.setVisibleDelete(false);
		oItem0.setEnableEdit(false);
		oItem0.setVisibleEdit(false);

		assert.notOk(oItem0._getDeleteButton().getEnabled(), "Delete button should be disabled for 'enableDelete' set ex-post to false.");
		assert.notOk(oItem0._getDeleteButton().getVisible(), "Delete button should be invisible by for 'visibleDelete' set ex-post to false.");
		assert.notOk(oItem0._getEditButton().getEnabled(), "Edit button should be disabled for 'enableEdit' set ex-post to false.");
		assert.notOk(oItem0._getEditButton().getVisible(), "Edit button should be invisible for 'visibleEdit' set ex-post to false.");
	});

	QUnit.test("Terminate: abort on FileUploader is called", function (assert) {
		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt"
			}),
			oDialog;

		this.oUploadCollection._getFileUploader()._aXhr = [];
		sinon.spy(this.oUploadCollection._getFileUploader(), "abort");

		oItem.setUploadState(UploadState.Uploading);
		oItem._requestIdName = 0;
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog should be closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
		assert.equal(this.oUploadCollection._getFileUploader().abort.callCount, 1, "Abort on FileUploader should be called.");
	});


	/* =============== */
	/* Handler Methods */
	/* =============== */

	QUnit.test("Delete: _handleDelete creates a popup and changes the internal state of UploadCollection correctly", function (assert) {
		var oItem0 = this.oUploadCollection.getItems()[0],
			oMessageBoxStub = sinon.stub(MessageBox, "show"),
			oCloseMessageBoxStub = sinon.stub(this.oUploadCollection, "_onCloseMessageBoxDeleteItem"),
			sCompactClass = "sapUiSizeCompact",
			oEvent = {
				getParameters: function () {
					return {
						id: oItem0.getId() + "-deleteButton"
					};
				}
			};

		this.oUploadCollection.addStyleClass(sCompactClass);
		this.oUploadCollection._handleDelete(oEvent, oItem0);
		oMessageBoxStub.getCall(0).args[1].onClose();

		assert.ok(oCloseMessageBoxStub.called, "The _onCloseMessageBoxDeleteItem should correctly registered to handle the closing of MessageBox.");
		assert.equal(this.oUploadCollection._oItemToBeDeleted, oItem0, "The item that is to be deleted should be updated correctly.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].dialogId, "messageBoxDeleteFile", "Correct dialog id should be handed to the show function.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].actions[0], MessageBox.Action.OK, "OK action should be included in the MessageBox call.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].actions[1], MessageBox.Action.CANCEL, "Cancel action should be included in the MessageBox call.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].styleClass, sCompactClass, "Compact class should be handed from UploadCollection to the MessageBox correctly.");

		oMessageBoxStub.restore();
	});

	QUnit.test("Terminate: _handleTerminateRequest called on terminate button press", function (assert) {
		var oDialogOpenStub = sinon.stub(Dialog.prototype, "open"),
			oHandleTerminateSpy = sinon.spy(this.oUploadCollection, "_handleTerminateRequest"),
			oFileUploader = this.oUploadCollection._getFileUploader(),
			oFile2 = {
				name: "Document.txt"
			},
			oTerminateButton,
			oDialog;

		oFileUploader._aXhr = [];
		oFileUploader.fireChange({
			files: [oFile2]
		});

		oTerminateButton = this.oUploadCollection.getItems()[0]._getTerminateButton();
		oTerminateButton.firePress();

		assert.equal(oHandleTerminateSpy.callCount, 1, "_handleTerminateRequest on UploadCollection should be called called.");

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.close();
		oDialogOpenStub.restore();
	});

	QUnit.test("Terminate: _handleTerminateRequest opens a dialog which can be cancelled", function (assert) {
		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt"
			}),
			oDialog;

		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		assert.ok(oDialog.getDomRef(), "Dialog should be rendered.");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog should be closed.");
			done();
		});
		oDialog.getButtons()[1].firePress();
	});

	/* ====== */
	/* Events */
	/* ====== */

	QUnit.test("Event beforeUploadTermination is fired if the terminating dialog is confirmed, providing for preventDefault.", function (assert) {
		assert.expect(3);

		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt",
				documentId: "4712"
			}),
			oDialog;

		oItem.setUploadState(UploadState.Uploading);
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachBeforeUploadTermination(function (oEvent) {
			assert.ok(true, "beforeUploadTermination event should be called.");
			assert.deepEqual(oEvent.getParameter("item"), oItem, "Correct item passed.");
			oEvent.preventDefault();
		});
		this.oUploadCollection.attachUploadTerminated(function (oEvent) {
			assert.ok(false, "uploadTerminated event shouldn't haven been called after calling prevetnDefault in beforeUploadTermination.");
		});
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog should be closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
	});

	QUnit.test("Event uploadTerminated is fired if the upload termination is processed.", function (assert) {
		assert.expect(2);

		var done = assert.async(),
			oFileUploader = this.oUploadCollection._getFileUploader(),
			sFileName = "otto4711.txt",
			oItem = new UploadCollectionItem({
				fileName: sFileName
			}),
			sRequestId = 1,
			oDialog;

		// Hack uploader to think it is actually aborting something
		oFileUploader._aXhr = [{
			fileName: sFileName,
			xhr: {
				abort: function () {
				}
			},
			requestHeaders: [
				{
					name: this.oUploadCollection._headerParamConst.requestIdName,
					value: sRequestId
				},
				{
					name: this.oUploadCollection._headerParamConst.fileNameRequestIdName,
					value: this.oUploadCollection._encodeToAscii(oItem.getFileName()) + oItem._requestIdName
				}
			]
		}];
		this.oUploadCollection._mRequestIdToItemMap[sRequestId] = oItem;

		oItem.setUploadState(UploadState.Uploading);
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachUploadTerminated(function (oEvent) {
			assert.ok(true, "uploadTerminated event should be called after confirmed upload termination.");
			assert.deepEqual(oEvent.getParameter("fileName"), sFileName, "Correct item passed.");
			done();
		});
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.getButtons()[0].firePress();
	});

	QUnit.test("Event deleteFile is fired if the upload is completed before the actual confirmation of the termination.", function (assert) {
		assert.expect(4);

		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt",
				documentId: "4712"
			}),
			oDialog;

		oItem.setUploadState(UploadState.Complete);
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachFileDeleted(function (oEvent) {
			assert.ok(true, "fileDeleted event should be called.");
			assert.equal(oEvent.getParameter("documentId"), "4712", "Correct documentId passed.");
			assert.deepEqual(oEvent.getParameter("item"), oItem, "Correct item passed.");
		});
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog is closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
	});

	// TODO: Move to UC.qunit

	/* =============== */
	/* Handler Methods */
	/* =============== */

	QUnit.test("Delete: _handleDelete creates a popup and changes the internal state of UploadCollection correctly", function (assert) {
		var oItem0 = this.oUploadCollection.getItems()[0],
			oMessageBoxStub = sinon.stub(MessageBox, "show"),
			oCloseMessageBoxStub = sinon.stub(this.oUploadCollection, "_onCloseMessageBoxDeleteItem"),
			sCompactClass = "sapUiSizeCompact",
			oEvent = {
				getParameters: function () {
					return {
						id: oItem0.getId() + "-deleteButton"
					};
				}
			};

		this.oUploadCollection.addStyleClass(sCompactClass);
		this.oUploadCollection._handleDelete(oEvent, oItem0);
		oMessageBoxStub.getCall(0).args[1].onClose();

		assert.ok(oCloseMessageBoxStub.called, "The _onCloseMessageBoxDeleteItem should correctly registered to handle the closing of MessageBox.");
		assert.equal(this.oUploadCollection._oItemToBeDeleted, oItem0, "The item that is to be deleted should be updated correctly.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].dialogId, "messageBoxDeleteFile", "Correct dialog id should be handed to the show function.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].actions[0], MessageBox.Action.OK, "OK action should be included in the MessageBox call.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].actions[1], MessageBox.Action.CANCEL, "Cancel action should be included in the MessageBox call.");
		assert.equal(oMessageBoxStub.getCall(0).args[1].styleClass, sCompactClass, "Compact class should be handed from UploadCollection to the MessageBox correctly.");

		oMessageBoxStub.restore();
	});

	QUnit.test("Terminate: _handleTerminateRequest called on terminate button press", function (assert) {
		var oDialogOpenStub = sinon.stub(Dialog.prototype, "open"),
			oHandleTerminateSpy = sinon.spy(this.oUploadCollection, "_handleTerminateRequest"),
			oFileUploader = this.oUploadCollection._getFileUploader(),
			oFile2 = {
				name: "Document.txt"
			},
			oTerminateButton,
			oDialog;

		oFileUploader._aXhr = [];
		oFileUploader.fireChange({
			files: [oFile2]
		});

		oTerminateButton = this.oUploadCollection.getItems()[0]._getTerminateButton();
		oTerminateButton.firePress();

		assert.equal(oHandleTerminateSpy.callCount, 1, "_handleTerminateRequest on UploadCollection should be called called.");

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.destroy();
		oDialogOpenStub.restore();
	});

	QUnit.test("Terminate: _handleTerminateRequest opens a dialog which can be cancelled", function (assert) {
		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt"
			}),
			oDialog;

		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		assert.ok(oDialog.getDomRef(), "Dialog should be rendered.");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog should be closed.");
			done();
		});
		oDialog.getButtons()[1].firePress();
	});

	/* ====== */
	/* Events */
	/* ====== */

	QUnit.test("Event beforeUploadTermination is fired if the terminating dialog is confirmed, providing for preventDefault.", function (assert) {
		assert.expect(3);

		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt",
				documentId: "4712"
			}),
			oDialog;

		oItem.setUploadState(UploadState.Uploading);
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachBeforeUploadTermination(function (oEvent) {
			assert.ok(true, "beforeUploadTermination event should be called.");
			assert.deepEqual(oEvent.getParameter("item"), oItem, "Correct item passed.");
			oEvent.preventDefault();
		});
		this.oUploadCollection.attachUploadTerminated(function (oEvent) {
			assert.ok(false, "uploadTerminated event shouldn't haven been called after calling prevetnDefault in beforeUploadTermination.");
		});
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog should be closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
	});

	QUnit.test("Event uploadTerminated is fired if the upload termination is processed.", function (assert) {
		assert.expect(2);

		var done = assert.async(),
			oFileUploader = this.oUploadCollection._getFileUploader(),
			sFileName = "otto4711.txt",
			oItem = new UploadCollectionItem({
				fileName: sFileName
			}),
			sRequestId = 1,
			oDialog;

		// Hack uploader to think it is actually aborting something
		oFileUploader._aXhr = [{
			fileName: sFileName,
			xhr: {
				abort: function () {}
			},
			requestHeaders: [
				{
					name: this.oUploadCollection._headerParamConst.requestIdName,
					value: sRequestId
				},
				{
					name: this.oUploadCollection._headerParamConst.fileNameRequestIdName,
					value: this.oUploadCollection._encodeToAscii(oItem.getFileName()) + oItem._requestIdName
				}
			]
		}];
		this.oUploadCollection._mRequestIdToItemMap[sRequestId] = oItem;

		oItem.setUploadState(UploadState.Uploading);
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachUploadTerminated(function (oEvent) {
			assert.ok(true, "uploadTerminated event should be called after confirmed upload termination.");
			assert.deepEqual(oEvent.getParameter("fileName"), sFileName, "Correct item passed.");
			done();
		});
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.getButtons()[0].firePress();
	});

	QUnit.test("Event deleteFile is fired if the upload is completed before the actual confirmation of the termination.", function (assert) {
		assert.expect(4);

		var done = assert.async(),
			oItem = new UploadCollectionItem({
				fileName: "otto4711.txt",
				documentId: "4712"
			}),
			oDialog;

		oItem.setUploadState(UploadState.Complete);
		this.oUploadCollection.insertItem(oItem);
		this.oUploadCollection.attachFileDeleted(function (oEvent) {
			assert.ok(true, "fileDeleted event should be called.");
			assert.equal(oEvent.getParameter("documentId"), "4712", "Correct documentId passed.");
			assert.deepEqual(oEvent.getParameter("item"), oItem, "Correct item passed.");
		});
		this.oUploadCollection._handleTerminateRequest({}, oItem);

		oDialog = sap.ui.getCore().byId(this.oUploadCollection.getId() + "deleteDialog");
		oDialog.attachAfterClose(function () {
			assert.ok(true, "Dialog is closed.");
			done();
		});
		oDialog.getButtons()[0].firePress();
	});

	QUnit.test("Event beforeUploadStarts is fired with correct content and provides a way to alter header params", function(assert) {
		var sFileName = "someFileName",
			sRequestId = "1",
			aRequestHeaders = [{
				name: this.oUploadCollection._headerParamConst.requestIdName,
				value: sRequestId
			}],
			sSlugName = "slug",
			sSlugValueBefore = jQuery.now(),
			sSlugValueAfter,
			sChangedSlugValue = "ChangedSlugValue",
			sSecurityTokenName = "securuityToken",
			sSecurityTokenValueBefore = jQuery.now(),
			sSecurityTokenValueAfter;

		function onBeforeUploadStarts(oEvent) {
			var oHeaderParameter1 = new UploadCollectionParameter({ name: sSlugName, value: sSlugValueBefore });
			oEvent.getParameters().addHeaderParameter(oHeaderParameter1);
			var oHeaderParameter2 = new UploadCollectionParameter({
				name: sSecurityTokenName,
				value: sSecurityTokenValueBefore
			});
			oEvent.getParameters().addHeaderParameter(oHeaderParameter2);
			assert.equal(oEvent.getParameter("fileName"), sFileName, "Event should bear a correct file name.");
			assert.ok(oEvent.getParameter("addHeaderParameter"), "Event should contain method 'addHeaderParameter'.");
			assert.ok(oEvent.getParameter("getHeaderParameter"), "Event should contain method 'getHeaderParameter'.");
			assert.equal(oEvent.getParameters().getHeaderParameter(sSlugName).getValue(), sSlugValueBefore, "Value of the header parameter should be correct.");
			assert.equal(oEvent.getParameters().getHeaderParameter(sSecurityTokenName).getValue(), sSecurityTokenValueBefore, "Value of the header parameter2 retrieved correctly");
			assert.equal(oEvent.getParameters().getHeaderParameter(sSlugName).getName(), sSlugName, "Name of the first header parameter should be slug.");

			var oSlugParameter = oEvent.getParameters().getHeaderParameter(sSlugName);
			oSlugParameter.setValue(sChangedSlugValue);
		}

		this.oUploadCollection.attachBeforeUploadStarts(onBeforeUploadStarts);
		this.oUploadCollection._getFileUploader().fireUploadStart({
			fileName: sFileName,
			requestHeaders: aRequestHeaders
		});
		var iParamCounter = aRequestHeaders.length;
		for (var i = 0; i < iParamCounter; i++) {
			if (aRequestHeaders[i].name === sSlugName) {
				sSlugValueAfter = aRequestHeaders[i].value;
			}
			if (aRequestHeaders[i].name === sSecurityTokenName) {
				sSecurityTokenValueAfter = aRequestHeaders[i].value;
			}
		}
		assert.equal(sSlugValueAfter, sChangedSlugValue);
		assert.notEqual(sSlugValueBefore, sSlugValueAfter, "Slug value is set correctly by the method 'addHeaderParameter' of the beforeUploadStarts event");
		assert.equal(sSecurityTokenValueBefore, sSecurityTokenValueAfter, "SecurityToken value is set correctly by the method 'addHeaderParameter' of the beforeUploadStarts event");
	});

	/* ============== */
	/* Inner Controls */
	/* ============== */

	QUnit.test("Inner controls are created lazily, not eagerly.", function (assert) {
		assert.expect(22);
		var oItem = new UploadCollectionItem({
				fileName: "otto4711.txt",
				documentId: "4712"
			});

		assert.notOk(oItem._oListItem, "Inner list item should not be created eagerly.");
		assert.notOk(oItem._oIcon, "Inner icon should be created eagerly.");
		assert.notOk(oItem._oProgressLabel, "Inner progress label should not be created eagerly.");
		assert.notOk(oItem._oBusyIndicator, "Inner busy indicator should not be created eagerly.");
		assert.notOk(oItem._oFileNameLink, "Inner hyperlink should not be created eagerly.");
		assert.notOk(oItem._oEditButton, "Inner edit button should not be created eagerly.");
		assert.notOk(oItem._oFileNameEdit, "Inner file name edit should not be created eagerly.");
		assert.notOk(oItem._oDeleteButton, "Inner delete button should not be created eagerly.");
		assert.notOk(oItem._oTerminateButton, "Inner terminate button should not be created eagerly.");
		assert.notOk(oItem._oConfirmRenameButton, "Inner confirm button for rename dialog should not be created eagerly.");
		assert.notOk(oItem._oCancelRenameButton, "Inner cancel button for rename dialog should not be created eagerly.");

		this.oUploadCollection.insertItem(oItem);

		assert.ok(oItem._getListItem(), "Inner list item should be created.");
		assert.ok(oItem._getIcon(), "Inner icon should be created.");
		assert.ok(oItem._getProgressLabel(), "Inner progress label should be created.");
		assert.ok(oItem._getBusyIndicator(), "Inner busy indicator should be created.");
		assert.ok(oItem._getFileNameLink(), "Inner hyperlink should be created.");
		assert.ok(oItem._getEditButton(), "Inner edit button should be created.");
		assert.ok(oItem._getFileNameEdit(), "Inner file name edit should be created.");
		assert.ok(oItem._getDeleteButton(), "Inner delete button should be created.");
		assert.ok(oItem._getTerminateButton(), "Inner terminate button should be created.");
		assert.ok(oItem._getConfirmRenameButton(), "Inner confirm button for rename dialog should be created.");
		assert.ok(oItem._getCancelRenameButton(), "Inner cancel button for rename dialog should be created.");
	});
});