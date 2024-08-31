/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/UploadSetRenderer",
	"sap/m/upload/Uploader",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ListItemBaseRenderer",
	"sap/m/MenuButton",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/upload/UploadSetTestUtils",
	"sap/ui/core/dnd/DragAndDrop",
	"sap/ui/base/Event",
	"sap/m/library",
	"sap/ui/model/Sorter",
	"sap/m/IllustratedMessageType",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/IllustratedMessage"
], function (Element, Library0, jQuery, UploadSet, UploadSetItem, UploadSetRenderer, Uploader, Toolbar, Label, ListItemBaseRenderer, MenuButton, Dialog, Device, MessageBox, JSONModel, TestUtils, DragAndDrop, EventBase, Library, Sorter, IllustratedMessageType, nextUIUpdate, IllustratedMessage) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = Library.ListMode,
		UploadType = Library.UploadType,
		UploadState = Library.UploadState,
		ButtonType = Library.ButtonType;

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4",
					selected: true
				},
				{
					fileName: "Brenda.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false,
					selected: true
				}
			]
		};
	}
	QUnit.module("UploadSet general functionality", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	/* ====== */
	/* Events */
	/* ====== */

	var NoopUploader = Uploader.extend("sap.m.qunit.upload.NoopUploader", {});
	NoopUploader.prototype.uploadItem = function (oItem, aHeaders) {};
	NoopUploader.prototype.downloadItem = function (oItem, aHeaders, bAskForLocation) {};

	QUnit.test("Test for progressbar visibility", async function (assert) {
		//arrange
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setUploadState("Ready");
		var progressBox = oItem._getProgressBox();
		assert.ok(progressBox.getVisible(), "progress bar is visible for the uploading state");
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();
		//Act
		this.oUploadSet.uploadItem(oItem);
		var done = assert.async();
		this.oUploadSet.attachEventOnce("uploadCompleted", function (oEvent) {
			var progressBox = oEvent.getParameter("item")._getProgressBox();
			//assert
			assert.ok(!progressBox.getVisible(), "progress bar is not visible for the uploaded state");
			done();
		});
	});

	QUnit.test("Test for terminate upload dialog popup", function(assert) {
		// Arrange
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setUploadState(UploadState.Uploading);
		var oTerminateButton = oItem._getTerminateButton();
		assert.ok(oTerminateButton.getVisible(), "Terminate button is visible for the uploading state");
		// Act
		oTerminateButton.firePress();
		// Assert
		var oDialog = Element.getElementById(this.oUploadSet.getId() + "-teminateDialog");
		assert.ok(oDialog, "Terminate dialog should now be presented.");
		assert.equal(oDialog.getButtons()[0].getType(), ButtonType.Emphasized, "First button is emphasized.");
		oDialog.getButtons()[1].firePress();
		oDialog.getButtons()[0].getParent().fireAfterClose();
		oDialog = Element.getElementById(this.oUploadSet.getId() + "-teminateDialog");
		assert.notOk(oDialog, "Terminate dialog should now be closed.");
	});

	QUnit.test("Test for checking if the upload type is of Native by default", function (assert) {
		//arrange
		var oItem = this.oUploadSet.getItems()[0];
		assert.equal(oItem.getUploadType(), UploadType.Native ,"Upload type is returning as Native as expected");
	});

	QUnit.test("Test for checking if the upload type is of Native when uploaded by the user", function (assert) {
		this.oUploadSet.attachEventOnce("beforeUploadStarts",function(oEvent){
			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getUploadType(),UploadType.Native,"Upload type is returning as Native as expected");
		});

		var file = new File(["foo"], "foo.txt", {
			type: "text/plain"
		  });
		var oFiles = {
			0: file,
			length: 1
		};

		this.oUploadSet._processNewFileObjects(oFiles);
	});

	QUnit.test("Events beforeItemAdded and afterItemAdded are called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(5);
		var oOrigUploader,
			oNoopUploader = new NoopUploader();

		oOrigUploader = this.oUploadSet.getUploader();
		this.oUploadSet.setUploader(oNoopUploader);

		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "newFile.txt", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "newFile.txt", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "newFile.txt"}
				};
			}
		});

		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			oEvent.preventDefault();
			assert.ok(true, "beforeItemAdded event should have been called.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(false, "afterItemAdded event should have not been called, as it was canceled.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "anotherNewFile.txt"}
				};
			}
		});

		this.oUploadSet.setUploader(oOrigUploader);
	});

	QUnit.test("File upload button is not visible after setting uploadButtonInvisible to true", function(assert) {
		//Arrange
		this.oUploadSet.setUploadButtonInvisible(true);

		//Assert
		assert.equal(this.oUploadSet.getDefaultFileUploader().getVisible(), false, "File Uploader is not visible");
	});

	QUnit.test("Event beforeItemRemoved is called at proper time and with correct parameters, prevent default applies.", function (assert) {
		assert.expect(4);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.attachEventOnce("beforeItemRemoved", function (oEvent) {
			assert.ok(true, "beforeItemRemoved event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		// Now with the prevent default
		this.oUploadSet.attachEventOnce("beforeItemRemoved", function (oEvent) {
			assert.ok(true, "beforeItemRemoved event should have been called.");
			oEvent.preventDefault();
		});
		oItem._getDeleteButton().firePress();

		// There should be no dialog
		oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event afterItemRemoved is called at proper time and with correct parameters.", function (assert) {
		assert.expect(3);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.attachEventOnce("afterItemRemoved", function (oEvent) {
			assert.ok(true, "afterItemRemoved event should have been called.");
		});
		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[0].firePress();
		oDialog.getButtons()[0].getParent().fireAfterClose();
		oDialog.destroy();

		// There should be no dialog
		oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event beforeItemEdited is called at proper time and with correct parameters, prevent default applies.", async function (assert) {
		assert.expect(9);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		// With wanton prevent default there is no edit mode
		this.oUploadSet.attachEventOnce("beforeItemEdited", function (oEvent) {
			assert.ok(true, "beforeItemEdited event should have been called.");
			oEvent.preventDefault();
		});
		oItem._getEditButton().firePress();
		await nextUIUpdate();

		// Check no edit mode in place
		assert.notOk(this.oUploadSet._oEditedItem, "UploadSet should know nothing about any edited item.");
		assert.notOk(oItem._bInEditMode, "Item should know it is NOT being edited.");
		assert.equal(oItem._getFileNameLink().$().length, 1, "File name link should be rendered.");
		assert.equal(oItem._getFileNameEdit().$().length, 0, "File name edit should be ignored.");

		oItem._getEditButton().firePress();
		await nextUIUpdate();

		// Check everybody on the same page regarding the edit mode
		assert.equal(this.oUploadSet._oEditedItem, oItem, "Item should be known to the UploadSet as the edited one.");
		assert.ok(oItem._bInEditMode, "Item should know it is being edited.");
		assert.equal(oItem._getFileNameEdit().$().length, 1, "File name edit should be rendered.");
		assert.equal(oItem._getFileNameLink().$().length, 0, "File name link should be ignored.");
	});

	QUnit.test("Event afterItemEdited is called at proper time and with correct parameters.", async function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
		});
		oItem._getEditButton().firePress();
		await nextUIUpdate();

		oItem._getConfirmRenameButton().firePress();
		await nextUIUpdate();

	});

	QUnit.test("Allow Curly bracees in the fileName property", function (assert) {
		//Arrange
		var oBeforeItemAddedStub = sinon.stub(this.oUploadSet, "fireBeforeItemAdded").returns(true);
		var oAfterItemAddedStub = sinon.stub(this.oUploadSet, "fireAfterItemAdded");
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "{newFile}.txt"}
				};
			}
		});
		assert.ok(oBeforeItemAddedStub.called, "beforeItemAdded event should have been called.");
		if (oBeforeItemAddedStub.args && oBeforeItemAddedStub.args[0] && oBeforeItemAddedStub.args[0][0]) {
			assert.ok(oBeforeItemAddedStub.calledWith(oBeforeItemAddedStub.args[0][0]), "Item is UploadSetItem");
			assert.equal(oBeforeItemAddedStub.args[0][0].item.getFileName(), "{newFile}.txt", "File name should be correct.");
		}
		assert.ok(oAfterItemAddedStub.called, "afterItemAdded event should have been called.");
		if (oAfterItemAddedStub.args && oAfterItemAddedStub.args[0] && oAfterItemAddedStub.args[0][0]) {
			assert.ok(oAfterItemAddedStub.calledWith(oBeforeItemAddedStub.args[0][0]), "Item is UploadSetItem");
			assert.equal(oAfterItemAddedStub.args[0][0].item.getFileName(), "{newFile}.txt", "File name should be correct.");
		}
	});

	QUnit.test("Check blank filename", function (assert) {
		//Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: ""}
				};
			}
		});
	});

	QUnit.test("Rename filename with no extension", async function (assert) {
		assert.expect(2);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		oItem._getEditButton().firePress();
		await nextUIUpdate();

		oItem.setFileName("testFileName");

		oItem._getConfirmRenameButton().firePress();
		await nextUIUpdate();
	});

	[
		{
			message: "Rename filename to empty string -> show error",
			inputString: ""
		},
		{
			message: "Rename filename to string with multiple white spaces -> show error",
			inputString: "       "
		},
		{
			message: "Rename filename to string with multiple white spaces, horizontal tabulations, new line characters -> show error",
			inputString: "    \t \n \t \t  \n  "
		}
	].forEach(function(data) {
		QUnit.test(data.message, function (assert) {
			// Arrange
			var oItem = this.oUploadSet.getItems()[0];

			oItem._getEditButton().firePress();
			oItem._getFileNameEdit().setValue(data.inputString);
			oItem._getConfirmRenameButton().firePress();

			// Assert
			var oEdit = oItem._getFileNameEdit();
			assert.ok(!!oEdit, "Item edit control is present");
			assert.equal(oEdit.getValueStateText(), "Please enter a file name.", "Item edit control error message is correct");
		});
	});

	[
		{
			message: "Same file names are not allowed, rename file to already existing file name -> show error",
			inputString: "Brenda"
		},
		{
			message: "Same file names are not allowed, rename file to already existing file name with multiple white spaces -> show error",
			inputString: "   Brenda      "
		},
		{
			message: "Same file names are not allowed, rename file to already existing file name with multiple white spaces, horizontal tabulations, new line characters -> show error",
			inputString: "    \t \n Brenda\t \t  \n  "
		}
	].forEach(function(data) {
		QUnit.test(data.message, function (assert) {
			// Arrange
			var oItem = this.oUploadSet.getItems()[0];

			oItem._getEditButton().firePress();
			oItem._getFileNameEdit().setValue(data.inputString);
			oItem._getConfirmRenameButton().firePress();

			// Assert
			assert.notOk(this.oUploadSet.getSameFilenameAllowed(), "Flag same file names are not allowed is set");
			var oEdit = oItem._getFileNameEdit();
			assert.ok(!!oEdit, "Item edit control is present");
			assert.equal(oEdit.getValueStateText(), "File name already exists.", "Item edit control error message is correct");
		});
	});

	QUnit.test("Then enabling edit button, UploadSet.handleItemGetDisabled is not called", function (assert) {
		var spyHandleItemGetDisabled = this.spy(this.oUploadSet, "handleItemGetDisabled");
		var oItem = this.oUploadSet.getItems()[1];
		assert.notOk(oItem.getEnabledEdit(), "Edit button initially is disabled");

		oItem.setEnabledEdit(true);

		assert.ok(oItem.getEnabledEdit(), "Edit button is enabled");
		assert.ok(spyHandleItemGetDisabled.notCalled, "UploadSet.handleItemGetDisabled is not called");
	});

	QUnit.test("Then showing edit button, UploadSet.handleItemGetDisabled is not called", function (assert) {
		var spyHandleItemGetDisabled = this.spy(this.oUploadSet, "handleItemGetDisabled");
		var oItem = this.oUploadSet.getItems()[1];
		assert.notOk(oItem.getVisibleEdit(), "Edit button initially is hidden");

		oItem.setVisibleEdit(true);

		assert.ok(oItem.getVisibleEdit(), "Edit button is visible");
		assert.ok(spyHandleItemGetDisabled.notCalled, "UploadSet.handleItemGetDisabled is not called");
	});

	QUnit.test("Then disabling edit button, for item that is not in edit, UploadSet._handleItemEditCancelation is not called", function (assert) {
		var spyHandleItemEditCancelation = this.spy(this.oUploadSet, "_handleItemEditCancelation");
		var oItem = this.oUploadSet.getItems()[0];
		assert.ok(oItem.getEnabledEdit(), "Edit button initially is enabled");

		oItem.setEnabledEdit(false);

		assert.notOk(oItem.getEnabledEdit(), "Edit button is disabled");
		assert.ok(spyHandleItemEditCancelation.notCalled, "UploadSet._handleItemEditCancelation is not called");
	});

	QUnit.test("Then hiding edit button, for item that is not in edit, UploadSet._handleItemEditCancelation is not called", function (assert) {
		var spyHandleItemEditCancelation = this.spy(this.oUploadSet, "_handleItemEditCancelation");
		var oItem = this.oUploadSet.getItems()[0];
		assert.ok(oItem.getVisibleEdit(), "Edit button initially is visible");

		oItem.setVisibleEdit(false);

		assert.notOk(oItem.getVisibleEdit(), "Edit button is hidden");
		assert.ok(spyHandleItemEditCancelation.notCalled, "UploadSet._handleItemEditCancelation is not called");
	});

	QUnit.test("Then hiding edit button, for item that is not in edit, but there is another item in edit mode UploadSet._handleItemEditCancelation is not called", async function (assert) {
		var spyHandleItemEditCancelation = this.spy(this.oUploadSet, "_handleItemEditCancelation");
		var oItem0 = this.oUploadSet.getItems()[0],
			oItem1 = this.oUploadSet.getItems()[1];
		oItem0.setVisibleEdit(true);
		oItem1.setVisibleEdit(true);
		assert.ok(oItem0.getVisibleEdit(), "First edit button initially is visible");
		assert.ok(oItem1.getVisibleEdit(), "Second edit button initially is visible");

		oItem0._getEditButton().firePress();
		await nextUIUpdate();

		oItem1.setVisibleEdit(false);

		assert.notOk(oItem1.getVisibleEdit(), "Edit button is hidden");
		assert.ok(spyHandleItemEditCancelation.notCalled, "UploadSet._handleItemEditCancelation is not called");
	});

	QUnit.test("Then hiding edit button, for item that is in edit, it's edit mode is cancelled", function (assert) {
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setVisibleEdit(true);
		assert.ok(oItem.getVisibleEdit(), "Edit button initially is visible");

		oItem._getEditButton().firePress();
		var sItemEditFileName = oItem._getFileNameEdit().getValue();
		oItem._getFileNameEdit().setValue(sItemEditFileName + " - some additional text");

		oItem.setVisibleEdit(false);
		assert.notOk(oItem.getVisibleEdit(), "Edit button is hidden");

		oItem.setVisibleEdit(true);
		assert.ok(oItem.getVisibleEdit(), "Edit button is visible");

		oItem._getEditButton().firePress();
		assert.equal(oItem._getFileNameEdit().getValue(), sItemEditFileName, "File name didn't changed");
	});

	QUnit.test("Check filename with no extension", function (assert) {
		//Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "testFileName"}
				};
			}
		});
	});

	QUnit.test("oXhr parameters are not empty", async function (assert) {
		var oUploader = new Uploader(),
			oItem = this.oUploadSet.getItems()[0],
			done = assert.async();

		this.oUploadSet.attachEventOnce("uploadCompleted",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "item param present");
			assert.ok(oEvent.mParameters.hasOwnProperty("response"), "response param present");
			assert.equal(oEvent.getParameter("responseXML"), null, "response xml param not present");
			assert.ok(oEvent.getParameter("readyState"), "readystate param present");
			assert.ok(oEvent.getParameter("status"), "status param present");
			assert.ok(oEvent.getParameter("headers"), "headers param present");
			done();
		});

		//Arrange
		this.oUploadSet.registerUploaderEvents(oUploader);
		this.oUploadSet.addDependent(oUploader);
		await nextUIUpdate();

		//Act
		oUploader.uploadItem(oItem);
	});

	QUnit.test("Check multi-part form data in XMLHttpRequest", async function (assert) {
		//Setup
		var oUploader = new Uploader({
			useMultipart: true
				}),
		oItem = this.oUploadSet.getItems()[0],
		oXMLHttpRequestSendSpy = this.spy(window.XMLHttpRequest.prototype, "send");
		var oFormData = new window.FormData();

		this.oUploadSet.setAggregation("uploader", oUploader);
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestSendSpy.calledWith(oFormData), "XML Http request is made with form-data");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("No data rendering - with default text and description", async function(assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");
		var sNoDataText = this.oUploadSet._oRb.getText("UPLOAD_SET_NO_DATA_TEXT");
		var sNoDataDescription = this.oUploadSet._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");
		var oIllustratedMessage = this.oUploadSet._getIllustratedMessage();

		await nextUIUpdate();
		//Assert
		assert.equal(this.oUploadSet.getNoDataText(), sNoDataText, "default text is returned for getNoDataText");
		assert.equal(this.oUploadSet.getNoDataDescription(), sNoDataDescription, "default description is returned for getNoDataDescription");
		assert.equal(this.oUploadSet._oList.getNoDataText(), sNoDataText + " " + sNoDataDescription, "Nodata Text is set in the List");
		assert.equal(oIllustratedMessage.getTitle(), sNoDataText, "default text is rendered in Upload set");
		assert.equal(oIllustratedMessage.getDescription(), sNoDataDescription, "default discription is rendered in Upload set");

		this.oUploadSet.setUploadEnabled(false);
		await nextUIUpdate();
		assert.equal(oIllustratedMessage.getTitle(), sNoDataText, "default title is rendered in Upload set (uploadEnabled=false)");
		assert.equal(oIllustratedMessage.getDescription(), " ", "Empty string discription is rendered in Upload set (uploadEnabled=false)");

	});

	QUnit.test("No data type illustrated message rendering if not set via aggregation", async function (assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");
		var oIllustratedMessage = this.oUploadSet._getIllustratedMessage();

		await nextUIUpdate();
		//Assert
		assert.equal(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoData, "The no data illustrated message is rendred");
		assert.equal(oIllustratedMessage.getDomRef().querySelector("svg").getAttribute("aria-labelledby"), this.oUploadSet._oInvisibleText.getId(), "AriaLabelledBy is set correctly.");
	});

	QUnit.test("No data type illustrated message rendering if set via aggregation", async function (assert) {
		var oIllustratedMessage = new IllustratedMessage({
			illustrationType: "sapIllus-NoActivities"
		});
		this.oUploadSet.setAggregation("illustratedMessage", oIllustratedMessage);
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Arrange
		this.oUploadSet.unbindAggregation("items");
		//Assert
		var oIllustratedAggregation = this.oUploadSet.getAggregation("illustratedMessage");

		assert.equal(oIllustratedAggregation.getIllustrationType(), "sapIllus-NoActivities", "illustrated message Aggregation rendered correctly");
		oIllustratedMessage.destroy();
	});

	QUnit.test("Get ariaDescribedBy values and validate them with illustration message text and descriptions", async function (assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");
		var oIllustratedMessage = this.oUploadSet._getIllustratedMessage();

		await nextUIUpdate();
		//Assert
		var oTextAndDescriptionIds = oIllustratedMessage.getAccessibilityReferences();
		var aAriaDescribedById = this.oUploadSet._oUploadButton.getAriaDescribedBy();
		assert.equal(Object.keys(oTextAndDescriptionIds).length, 2, "Length of the ariadescribedby array is two");
		assert.equal(aAriaDescribedById[0], oTextAndDescriptionIds.title, "Title id is included in aria-describedBy");
		assert.equal(aAriaDescribedById[1], oTextAndDescriptionIds.description, "Description id is included in aria-describedBy");
	});

	QUnit.test("Test httpRequestMethod property with XMLHttpRequest", async function (assert) {
		//Setup
		var oUploader = new Uploader({
			httpRequestMethod: "PUT"
		}),
		oItem = this.oUploadSet.getItems()[0],
		oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		this.oUploadSet.setAggregation("uploader", oUploader);
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith("PUT"), "XML Http put request is made");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("Test incomplete items are empty after upload completed", async function (assert) {
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setUploadState("Ready");
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		this.oUploadSet.uploadItem(oItem);

		//Assert
		assert.equal(this.oUploadSet.getIncompleteItems(), 0, "incomplete items are empty");
	});

	QUnit.test("No Data is rendered after item is removed", async function (assert) {
		assert.notOk(document.querySelector(".sapMUCNoDataPage"), "No Data template is not visible");

		var oItem1 = this.oUploadSet.getItems()[0];
		var oItem2 = this.oUploadSet.getItems()[1];
		this.oUploadSet.removeItem(oItem1);
		this.oUploadSet.removeItem(oItem2);

		await nextUIUpdate();

		//Assert
		var noDataTemplate = document.querySelector(".sapMUCNoDataPage");
		assert.ok(noDataTemplate, "No Data template is visible");
		var NodataOffSetheight = this.oUploadSet.getList().getDomRef()?.querySelector(".sapMUCNoDataPage").offsetHeight;
		assert.equal( NodataOffSetheight + "px", this.oUploadSet.getList().getDomRef()?.querySelector(".sapMUCNoDataPage").style.height, 'No Data template has fix height of no data offsetHeight');
	});

	QUnit.test("Upload url of Uploader updated with UploadSet uploadurl", function (assert) {
		this.oUploadSet._getImplicitUploader();
		this.oUploadSet.setUploadUrl('/test');
		assert.equal(this.oUploadSet.getUploadUrl(), "/test", "Uploader uploadUrl is updated successfuly");
	});

	QUnit.test("UploadSet.setMaxFileNameLength updates maxFileNameLength and maximumFilenameLength properties", function(assert) {
		//Arrange
		this.oUploadSet.setMaxFileNameLength(50);

		//Assert
		assert.equal(this.oUploadSet.getMaxFileNameLength(), 50, "UploadSet maxFileNameLength is 50");
		assert.equal(this.oUploadSet.getDefaultFileUploader().getMaximumFilenameLength(), 50, "File Uploader maximumFilenameLength is 50");
	});

	function createNativeDragEventDummy(sEventType) {
		var oEvent;

		if (typeof Event === "function") {
			oEvent = new Event(sEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE
			oEvent = document.createEvent("Event");
			oEvent.initEvent(sEventType, true, true);
		}

		oEvent.dataTransfer = {
			types: [],
				dropEffect: "",
				setDragImage: function() {},
			setData: function() {}
		};

		return oEvent;
	}

	function createjQueryDragEventDummy(sEventType, oControl, bRemoveId, bRemoveDraggable) {
		var oEvent = jQuery.Event(sEventType);
		var oTarget = oControl.getDomRef();

		oEvent.target = oTarget;
		if (bRemoveId === true) {
			delete oTarget.dataset.sapUi;
			oTarget.removeAttribute("id");
		}
		if (bRemoveDraggable === true) {
			oTarget.draggable = false;
		}
		oEvent.originalEvent = createNativeDragEventDummy(sEventType);

		return oEvent;
	}

	function getData1() {
		return {
			items: [
				{
					fileName: "Alice.mp4",
					"markers": [
						{
							"type": "Locked",
							"visibility": "IconAndText"
						}
					]
				},
				{
					fileName: "Test.mp4",
					"markers": [
						{
							"type": "Locked",
							"visibility": "IconAndText"
						}
					]
				},
				{
					fileName: "Brenda.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false
				}
			]
		};
	}

	QUnit.test("Test for cleaner aggregations destruction", function(assert){
		//arrange
		var oItemsList = this.oUploadSet.getItems();
		oItemsList.forEach(function(oItem){
			assert.ok(!oItem.isDestroyed(), "Item aggregation controls are active.");
			assert.ok(oItem && oItem.getDependents().length, "Item dependents are active.");
		});

		//act
		this.oUploadSet.destroyItems();

		//assert
		oItemsList.forEach(function(oItem){
			assert.ok(oItem && !oItem.getDependents().length, "Item dependents destroyed completely.");
			assert.ok(oItem.isDestroyed(), "Item aggregation controls are destroyed completely.");
		});
	});

	QUnit.test("Test to check if edited item in fetched from source. so, with binding change edithandler still gets actual item", function(assert){
		//arrange
		var oItemsList = this.oUploadSet.getItems();
		var itemTobeEdited = oItemsList[0];
		var oEvent = new EventBase("click", {}, { // using BaseEvent to create sample mouse click event.
			item: itemTobeEdited
		});
		var findByIdSpy = this.spy(UploadSetItem, "_findById");

		//act
		this.oUploadSet._handleItemEdit(oEvent, itemTobeEdited);

		//assert
		assert.ok(findByIdSpy.called, "Edited item fetched from source");
	});

	QUnit.test("Test to check if item to be deleted is fetched from source. so, with binding change deletehandler still gets actual item", function(assert){
		//arrange
		var oItemsList = this.oUploadSet.getItems();
		var itemTobeDeleted = oItemsList[0];
		var oEvent = new EventBase("click", {}, { // using BaseEvent to create sample mouse click event.
			item: itemTobeDeleted
		});
		var findByIdSpy = this.stub(UploadSetItem, "_findById");
		this.stub(MessageBox, "show").callsFake(function(){
			return true;
		});

		//act
		this.oUploadSet._handleItemDelete(oEvent, itemTobeDeleted);

		//assert
		assert.ok(findByIdSpy.called, "Item to be deleted is fetched from source");
	});

	QUnit.test("Edit with different event target", async function(assert) {
		// Arrange
		var sEditButtonId = this.oUploadSet.getItems()[0].sId + "-editButton";
		Element.getElementById(sEditButtonId).firePress();
		await nextUIUpdate();

		var oSpy = this.spy(UploadSet.prototype, "_handleItemEditConfirmation");
		var oEvent = {
			target: {
				id: "",
				closest: function(selector) {
					return null;
				}
			}
		};

		// Act
		this.oUploadSet._handleClick(oEvent, this.oUploadSet.getItems()[1]);
		await nextUIUpdate();

		// Assert
		assert.equal(oSpy.callCount, 1, "Editing will proceed with target clicked elsewhere on the list");
	});

	QUnit.test("Cancel with different event target", async function(assert) {
		// Arrange
		var sEditButtonId = this.oUploadSet.getItems()[1].sId + "-editButton";
		Element.getElementById(sEditButtonId).firePress();
		await nextUIUpdate();

		var oSpy = this.spy(UploadSet.prototype, "_handleItemEditCancelation");
		var oEvent = {
			target: {
				closest: function(selector) {
					return {
						id: 'item-cancelButton'
					};
				}
			}
		};

		// Act
		this.oUploadSet._handleClick(oEvent, this.oUploadSet.getItems()[1]);
		await nextUIUpdate();

		// Assert
		assert.equal(oSpy.callCount, 1, "Cancel handling is done even for targets that are not the button itself.");
	});

	QUnit.test("Test for nullable Queryselection check", async function(assert) {
		var sEditButtonId = this.oUploadSet.getItems()[1].sId + "-editButton";
		var oItem = this.oUploadSet.getItems()[1];
		Element.getElementById(sEditButtonId).firePress();
		await nextUIUpdate();

		var querySpy = this.spy(oItem._oListItem.getDomRef(), "querySelector");
		this.stub(oItem._oListItem, "getDomRef").callsFake(function(){
			return null;
		});
		var oEvent = {
			target: {
				closest: function(selector) {
					return {
						id: 'item-editButton'
					};
				}
			}
		};

		// Act
		this.oUploadSet._handleItemEditConfirmation(oEvent, this.oUploadSet.getItems()[1]);
		await nextUIUpdate();

		// Assert
		assert.ok(querySpy.notCalled, "QuerySelector not called without dom reference.");
	});

	QUnit.test("Test to avoid item creation for item in destruction phase", function(assert) {
		var oItem = this.oUploadSet.getItems()[1];

		var listItemSpy = this.spy(oItem, "_getListItem");

		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = Element.getElementById(this.oUploadSet.getId() + "-deleteDialog");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		// Assert
		assert.ok(listItemSpy.notCalled, "UploadSetItem not created for item in destruction phase.");
	});

	QUnit.test("Test to validate enable/disable status of upload button on illustrated message section", async function(assert) {

		//arrange
		this.oUploadSet.removeAllItems();
		await nextUIUpdate();

		//assert initial case
		assert.ok(this.oUploadSet._oUploadButton && this.oUploadSet._oUploadButton.getEnabled(), "By default uploadenabled is set to true and Upload button is enabled");

		//act
		this.oUploadSet.setUploadEnabled(false);
		await nextUIUpdate();

		//assert
		assert.ok(this.oUploadSet._oUploadButton && !this.oUploadSet._oUploadButton.getEnabled(), "Upload button on illustrated message section is disabled when uploadenabled is set to false");
	});

	QUnit.test("Test to validate visibility status of upload button on illustrated message section", async function(assert) {

		//arrange
		this.oUploadSet.removeAllItems();
		await nextUIUpdate();

		//assert initial case
		assert.ok(this.oUploadSet._oUploadButton && this.oUploadSet._oUploadButton.getVisible(), "By default uploadButtonInvisible is set to false and Upload button is visible");

		//act
		this.oUploadSet.setUploadButtonInvisible(true);
		await nextUIUpdate();

		//assert
		assert.ok(this.oUploadSet._oUploadButton && !this.oUploadSet._oUploadButton.getVisible(), "Upload button on illustrated message section is hidden when uploadButtonInvisible is set to true");
	});

	QUnit.test("Test to check focus update on delete item", async function (assert){
		//arrange
		this.oUploadSet1 = new UploadSet("uploadSet1", {
			items: [
				{
					fileName: "Alice33.mp4",
					selected: true
				},
				{
					fileName: "Brenda33.mp4",
					enabledRemove: false,
					enabledEdit: false,
					visibleRemove: false,
					visibleEdit: false,
					selected: true
				}
			]
		}).setModel(new JSONModel(getData()));
		this.oUploadSet1.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oItemsList = this.oUploadSet1.getItems();
		this.oUploadSet1._oItemToBeDeleted = oItemsList[0];
		var fnDone = assert.async();
		var iState = 0;

		var afterRenderDelegate = {
			onAfterRendering: function () {
				if ( iState == 0 ) {
					iState++;
					assert.equal(this.oUploadSet1._bItemRemoved, false, "_bItemRemoved flag is reset to false");
					assert.equal(document.activeElement,  this.oUploadSet1.getList().getItems()[0].getDomRef(), "Focus is set correctly");
					this.oUploadSet1._oItemToBeDeleted = oItemsList[1];
					this.oUploadSet1._handleClosedDeleteDialog(MessageBox.Action.DELETE);
				} else {
					assert.equal(this.oUploadSet1._bItemRemoved, false, "_bItemRemoved flag is reset to false");
					assert.equal(document.activeElement,  this.oUploadSet1.getList().getDomRef().querySelector(".sapMUCNoDataPage"), "Focus is set correctly");
					this.oUploadSet1.removeEventDelegate(afterRenderDelegate);

					this.oUploadSet1.destroy();
					this.oUploadSet1 = null;
					fnDone();
				}
			}.bind(this)

		};
		this.oUploadSet1.addEventDelegate(afterRenderDelegate);
		this.oUploadSet1._handleClosedDeleteDialog(MessageBox.Action.DELETE);
	});

	QUnit.module("UploadSet general functionality", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				uploadEnabled: false,
				uploadButtonInvisible: false
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Test to validate visibility status of upload button on illustrated message section when upload disabled", function(assert) {
		var button = this.oUploadSet.getUploadButtonForIllustratedMessage();

		assert.equal(button.getEnabled(), false, "Upload button on illustrated message section is disabled when uploadEnabled is set to false");
		assert.equal(button.getVisible(), true, "Upload button on illustrated message section is visible when uploadButtonInvisible is set to false");
	});

	QUnit.module("UploadSet general functionality", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				fileTypes:"txt,doc,png",
				mediaTypes:"text/plain,application/msword,image/jpeg,image/png",
				maxFileNameLength: 50,
				maxFileSize: 5,
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData1()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("SameFilenameAllowed set as false in uploadSet", async function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		// Set as false
		this.oUploadSet.setSameFilenameAllowed(false);
		this.oUploadSet.placeAt("qunit-fixture");

		oItem._getEditButton().firePress();
		await nextUIUpdate();

		this.oUploadSet.getItems()[0].$("fileNameEdit-inner")[0].value = "Test";
		oItem._getConfirmRenameButton().firePress();
		await nextUIUpdate();

		assert.equal(this.oUploadSet.getItems()[0].getFileName(), "Alice.mp4", "FileName will remain same");
	});

	QUnit.test("SameFilenameAllowed set as true in uploadSet", async function (assert) {
		assert.expect(2);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.setSameFilenameAllowed(true);
		this.oUploadSet.placeAt("qunit-fixture");

		oItem._getEditButton().firePress();
		await nextUIUpdate();

		this.oUploadSet.attachEventOnce("fileRenamed", function (oEvent) {
			assert.ok(true, "FileRenamed event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "Test.mp4", "File name should be correct.");
		});
		this.oUploadSet.getItems()[0].$("fileNameEdit-inner")[0].value = "Test";

		oItem._getConfirmRenameButton().firePress();
		await nextUIUpdate();
	});

	QUnit.test("Test for invalid media type, files upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: "Sample File 2.txt",
				size: 1,
				type: "text/plain"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "text/plain"
			},
			3: {
				name: "Sample File 4.txt",
				size: 1,
				type: "text/plain"
			},
			4: {
				name: "Sample File 5.pdf",
				size: 1,
				type: "application/pdf"
			},
			length: 5
		};

		var done = assert.async();

		this.oUploadSet.attachEventOnce("mediaTypeMismatch",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "mismatch item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 5.pdf", "mismatched UploadSetItem received");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for invalid media type, change Upload mediaTypes value and make upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = {
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "type1"
			},
			1: {
				name: "Sample File 2.txt",
				size: 1,
				type: "type2"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "unknown-type"
			},
			length: 5
		};
		this.oUploadSet.setMediaTypes(["type1", "type2"]);

		var done = assert.async();

		this.oUploadSet.attachEventOnce("mediaTypeMismatch",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "mismatch item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 3.txt", "mismatched UploadSetItem received");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for invalid file type, files upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: "Sample File 2.pdf",
				size: 1,
				type: "application/pdf"
			},
			length: 2
		};
		this.oUploadSet.setMediaTypes([]);

		var done = assert.async();

		this.oUploadSet.attachEventOnce("fileTypeMismatch",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "mismatch item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 2.pdf", "mismatched UploadSetItem received");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for invalid file type, change Upload set fileTypes value and make upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.xxx",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: "Sample File 2.yyy",
				size: 1,
				type: "application/pdf"
			},
			length: 2
		};
		this.oUploadSet.setMediaTypes([]);
		this.oUploadSet.setFileTypes(["xxx"]);

		var done = assert.async();

		this.oUploadSet.attachEventOnce("fileTypeMismatch",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "mismatch item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 2.yyy", "mismatched UploadSetItem received");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file name maximum length, upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader(),
			sLongFileName = "12345678901234567890123456789012345678901234567890.txt",
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: sLongFileName,
				size: 1,
				type: "text/plain"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "text/plain"
			},
			length: 3
		};
		assert.equal(this.oUploadSet.getMaxFileNameLength(), 50, "upload set file name maximum length is ok");
		var done = assert.async();

		this.oUploadSet.attachEventOnce("fileNameLengthExceeded",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), sLongFileName, "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file name maximum length, change Upload set maxFileNameLength value and make upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader(),
			sLongFileName = "12345678901234567890.txt",
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: sLongFileName,
				size: 1,
				type: "text/plain"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "text/plain"
			},
			length: 3
		};
		assert.equal(this.oUploadSet.getMaxFileNameLength(), 50, "upload set file name maximum length is ok");
		this.oUploadSet.setMaxFileNameLength(20);
		assert.equal(this.oUploadSet.getMaxFileNameLength(), 20, "upload set file name maximum length changed");

		var done = assert.async();

		this.oUploadSet.attachEventOnce("fileNameLengthExceeded",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), sLongFileName, "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file maximum size, upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader(),
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: "Sample File 2.txt",
				size: 6 * 1024 * 1024,
				type: "text/plain"
			},
			length: 2
		};
		assert.equal(this.oUploadSet.getMaxFileSize(), 5, "upload set file maximum size is ok");
		var done = assert.async();

		this.oUploadSet.attachEventOnce("fileSizeExceeded",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 2.txt", "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Test for file maximum size, change Upload set maxFileSize value and make upload attempt", function(assert) {
		//arrange
		var oFileUploader = this.oUploadSet.getDefaultFileUploader(),
			oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain"
			},
			1: {
				name: "Sample File 2.txt",
				size: 4 * 1024 * 1024,
				type: "text/plain"
			},
			length: 2
		};
		assert.equal(this.oUploadSet.getMaxFileSize(), 5, "upload set file maximum size is ok");
		this.oUploadSet.setMaxFileSize(3);
		assert.equal(this.oUploadSet.getMaxFileSize(), 3, "upload set file maximum size have changed");
		var done = assert.async();

		this.oUploadSet.attachEventOnce("fileSizeExceeded",function(oEvent){
			//Assert
			assert.ok(oEvent.getParameter("item"), "item is present");

			var oItem = oEvent.getParameter("item");
			assert.equal(oItem.getFileName(), "Sample File 2.txt", "event contain correct invalid file name");
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Marker is not displayed when the item is in edit mode", async function(assert) {
		//Arrange
		var oItem = this.oUploadSet.getItems()[0];
		var oMarkerItem = oItem.getMarkers()[0];
		oItem._getEditButton().firePress();
		this.oUploadSet.invalidate();
		await nextUIUpdate();
		//Act
		var oMarkerContainerItem = oMarkerItem.getDomRef().parentNode;
		var sMarkerItemStyle = oMarkerContainerItem.getAttribute("style");

		//Assert
		assert.ok(sMarkerItemStyle.indexOf("display: none") >= 0, "Item in edit mode: Marker not displayed");
	});

	QUnit.module("Rendering of UploadSet with hideUploadButton = true", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false,
					uploadButtonInvisible: true
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("File upload button is visible after setting uploadButtonInvisible to false", function(assert) {
		//Arrange
		this.oUploadSet.setUploadButtonInvisible(false);
		//Assert
		assert.equal(this.oUploadSet.getDefaultFileUploader().getVisible(), true, "File Uploader is visible");
	});

	QUnit.test("Remove Aggregation supports index", async function (assert) {
		assert.equal(this.oUploadSet.getItems().length, 2, "2 items are present before operation");

		this.oUploadSet.removeItem(0);
		await nextUIUpdate();

		//Assert
		assert.equal(this.oUploadSet.getItems().length, 1, "item is successfully removed using index");

		this.oUploadSet.removeAggregation("items",0);
		await nextUIUpdate();

		//Assert
		assert.equal(this.oUploadSet.getItems().length, 0, "item is successfully removed using index");
	});

	QUnit.test("Remove Aggregation destroys supplied control object", async function (assert) {
		//Arrange
		var uploadSetItem = this.oUploadSet.getItems()[0];

		//Act
		this.oUploadSet.removeAggregation("items", uploadSetItem);
		await nextUIUpdate();

		//Assert
		assert.equal(this.oUploadSet.getList().getItems().length, 1, "List Item removed successfully");
	});

	QUnit.test("Remove all aggregations destroys complete list and also main list aggregation", async function (assert) {

		//Arrange
		var oItem = this.oUploadSet.getItems()[0];
		this.oUploadSet.insertIncompleteItem(oItem);

		this.spy(this.oUploadSet, "removeAllAggregation");

		await nextUIUpdate();

		//Assert
		assert.equal(this.oUploadSet.getIncompleteItems().length, 1, "incomplete items list has one item");

		//Act
		this.oUploadSet.removeAllIncompleteItems();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oUploadSet.removeAllAggregation.called, "Custom RemoveAllAggregation method called to destroy list aggragtion of current aggragtion to be destroyed");
		assert.equal(this.oUploadSet.getIncompleteItems(), 0, "incomplete items are empty");
		var oList = this.oUploadSet.getList().getAggregation("incompleteItems");
		assert.equal(oList && oList.getAggregation("incompleteItems"), null, "incomplete items aggreagtions are destroyed from the list binding.");

		//Assert
		assert.equal(this.oUploadSet.getList().getItems().length, 1, "UploadSet has two list items");

		//Act
		this.oUploadSet.removeAllItems();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oUploadSet.removeAllAggregation.called, "Custom RemoveAllAggregation method called to destroy list aggragtion of current aggragtion to be destroyed");
		var oListUploadSet = this.oUploadSet.getList();
		assert.equal(oListUploadSet && oListUploadSet.getItems() && oListUploadSet.getItems().length, 0, "List Items destroyed sucessfully");
		assert.equal(oListUploadSet && oListUploadSet.getAggregation("items") && oListUploadSet.getAggregation("items").length, 0, "Items aggreagtions are destroyed from list binding.");
	});

	QUnit.module("Drag and drop", {
		beforeEach: async function () {
			this.$RootNode = jQuery(document.body);
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Dragged into target area", function(assert) {
		var oTargetDomRef = this.oUploadSet.getList().getDomRef();
		oTargetDomRef.focus();
		var oDropInfo = this.oUploadSet.getList().getDragDropConfig()[1];
		oDropInfo.attachDragEnter(function(oEvent) {
			assert.ok(oEvent.getParameter("dragSession"), "drag session exists");
		});
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
	});

	QUnit.test("bring Drop here illustrated message, when Dragged into target area", function(assert) {
		var oTargetDomRef = this.oUploadSet.getList().getDomRef();
		oTargetDomRef.focus();
		this.oUploadSet.removeAllItems(); // illustrated message only renders when there are no items in the list.
		var oDropInfo = this.oUploadSet.getList().getDragDropConfig()[1];
		oDropInfo.attachDragEnter(function(oEvent) {
			assert.equal(this.oUploadSet._getIllustratedMessage().getIllustrationType(), IllustratedMessageType.UploadCollection, "The Drop file here illustrated message is rendred");
		}.bind(this));

		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));

	});

	QUnit.test("Drag and drop lifecycle & drag session", function(assert) {
		var oEvent = createjQueryDragEventDummy("dragstart", this.oUploadSet.getList().getItems()[0]);
		oEvent.target.focus();
		DragAndDrop.preprocessEvent(oEvent);
		assert.notEqual(oEvent.dragSession, null, "dragstart: A drag session was created for item");

		var oDragSession = oEvent.dragSession;
		this.oUploadSet.attachItemDrop(function(oEvent) {
			assert.ok(oEvent.getParameter("dragSession"), "Drop item event triggered");
		});

		oEvent = createjQueryDragEventDummy("drop", this.oUploadSet.getList().getItems()[0], false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "drop: Drag session was preserved");

		oEvent = createjQueryDragEventDummy("dragend", this.oUploadSet.getList().getItems()[0], false);
		DragAndDrop.preprocessEvent(oEvent);
		assert.ok(oEvent.dragSession === oDragSession, "dragend: Drag session was preserved");

	});

	QUnit.test("Drag and then move away outside the browser, illustrated image get properly displayed", function(assert) {
		this.oUploadSet.removeAllItems(); // illustrated message only renders when there are no items in the list.
		var oTargetDomRef = this.oUploadSet.getList().getDomRef();
		oTargetDomRef.focus();
		var oDropInfo = this.oUploadSet.getList().getDragDropConfig()[1];
		oDropInfo.attachDragEnter(function() {
			assert.equal(this.oUploadSet._getIllustratedMessage().getIllustrationType(), IllustratedMessageType.UploadCollection, "The Drop file here illustrated message is rendered");
		}.bind(this));

		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragenter"));
		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragleave"));

		assert.equal(this.oUploadSet._getIllustratedMessage().getIllustrationType(), IllustratedMessageType.NoData, "The Drop file here illustrated message got reset");
	});

	QUnit.test("Drag away outside the browser then drag is not initiated, illustrated image is updated", function(assert) {
		this.oUploadSet.removeAllItems(); // illustrated message only renders when there are no items in the list.
		var spyGetIllustratedMessage = this.spy(this.oUploadSet, "_getIllustratedMessage");
		var oTargetDomRef = this.oUploadSet.getList().getDomRef();
		oTargetDomRef.focus();

		oTargetDomRef.dispatchEvent(createNativeDragEventDummy("dragleave"));

		assert.equal(this.oUploadSet._getIllustratedMessage().getIllustrationType(), IllustratedMessageType.NoData, "Illustrated message is correct");
		assert.equal(spyGetIllustratedMessage.callCount, 2, "Update illustrated message was called");
	});

	QUnit.test("Drag away outside the browser, illustrated image is not updated, then there is drag session with drag control", function(assert) {
		this.oUploadSet.removeAllItems(); // illustrated message only renders when there are no items in the list.
		var spyGetIllustratedMessage = this.spy(this.oUploadSet, "_getIllustratedMessage");
		this.oUploadSet.ondragleave({dragSession: {getDropControl: function() {return true;}}, relatedTarget: true});

		assert.equal(this.oUploadSet._getIllustratedMessage().getIllustrationType(), IllustratedMessageType.NoData, "Illustrated message is correct");
		assert.equal(spyGetIllustratedMessage.callCount, 1, "Only initial call was mad");
	});

	QUnit.test("Test for method setMultiple", function(assert) {
		assert.equal(this.oUploadSet.getMultiple(), false, "Initial multiple value (false) is set correctly");
		this.oUploadSet.setMultiple(true);
		assert.equal(this.oUploadSet.getMultiple(), true, "Multiple property should be set to true");
	});

	QUnit.test("Test if upload is disabled, on drop file code isn't executed", function(assert) {
		// arrange
		var oEvent = new EventBase("drop", {}, { // using BaseEvent to create sample drop event to simulate drag and drop
			browserEvent: {}
		});
		this.spy(oEvent, "getParameter");
		this.oUploadSet.setUploadEnabled(false);

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(oEvent.getParameter.notCalled, "Code din't get executed");
	});

	function getDragAndPropEvent(isFileEntries) {
		const oDataTransfer = {items: []};

		if (isFileEntries?.length) {
			isFileEntries.forEach(function(isFile) {
				oDataTransfer.items.push({
					isFile: isFile,
					webkitGetAsEntry: function() {
						return {
							isFile: this.isFile,
							isDirectory: !this.isFile,
							file: function(callback) {
								callback(this.isFile ? "file" : "directory");
							}
						};
					}
				});
			});
		}

		return new EventBase("drop", {}, { // using BaseEvent to create sample drop event to simulate drag and drop
			browserEvent: {
				dataTransfer: oDataTransfer
			}
		});
	}

	[
		{
			message: "Two files",
			dropContent: [true, true],
			multiple: false,
			directory: false,
			errorMessage: "UPLOADCOLLECTION_MULTIPLE_FALSE"
		},
		{
			message: "One file and one directory",
			dropContent: [true, false],
			multiple: false,
			directory: false,
			errorMessage: "UPLOADCOLLECTION_MULTIPLE_FALSE"
		},
		{
			message: "One file and one directory",
			dropContent: [true, false],
			multiple: true,
			directory: false,
			errorMessage: "UPLOAD_SET_DIRECTORY_FALSE"
		},
		{
			message: "One file and one directory",
			dropContent: [true, false],
			multiple: true,
			directory: true,
			errorMessage: "UPLOAD_SET_DIRECTORY_FALSE"
		},
		{
			message: "One directory",
			dropContent: [false],
			multiple: true,
			directory: false,
			errorMessage: "UPLOAD_SET_DIRECTORY_FALSE"
		},
		{
			message: "One file",
			dropContent: [true],
			multiple: false,
			directory: true,
			errorMessage: "UPLOAD_SET_DROP_DIRECTORY"
		},
		{
			message: "One file and one directory",
			dropContent: [true, false],
			multiple: false,
			directory: true,
			errorMessage: "UPLOAD_SET_DROP_DIRECTORY"
		}
	].forEach(function(data) {
		QUnit.test(data.message + ", multiple - " + data.multiple + ", directory - " + data.directory, function (assert) {
			// arrange
			const oEvent = getDragAndPropEvent(data.dropContent);
			this.oUploadSet.setDirectory(data.directory);
			this.oUploadSet.setMultiple(data.multiple);
			this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
			this.spy(this.oUploadSet._oRb, "getText");
			this.stub(MessageBox, "error");

			// act
			this.oUploadSet._onDropFile(oEvent);

			// assert
			assert.ok(this.oUploadSet._getFilesFromDataTransferItems.notCalled, "Multiple files are not uploaded");
			assert.ok(this.oUploadSet._oRb.getText.calledOnce, "Get error text had been called 1 time");
			assert.ok(this.oUploadSet._oRb.getText.firstCall.calledWith(data.errorMessage), "Get correct error text");
			assert.ok(MessageBox.error.calledOnce, "Set error message had been called 1 time");

			MessageBox.error.reset();
		});
	});

	QUnit.test("Drop no files or directories", function(assert) {
		// arrange
		const oEvent = getDragAndPropEvent();
		this.oUploadSet.setDirectory(false);
		this.oUploadSet.setMultiple(false);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		this.spy(this.oUploadSet._oRb, "getText");
		this.stub(MessageBox, "error");

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.notCalled, "Multiple files are not uploaded");
		assert.ok(this.oUploadSet._oRb.getText.notCalled, "Get error text is not called");
		assert.ok(MessageBox.error.notCalled, "Set error message is not called");
		MessageBox.error.reset();
	});

	QUnit.test("Drop multiple files, but webkitGetAsEntry return null", function(assert) {
		// arrange
		const oEvent = getDragAndPropEvent([true, true]);
		const oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems[0].webkitGetAsEntry = function() { return null;};
		oItems[1].webkitGetAsEntry = function() { return null;};
		this.oUploadSet.setDirectory(false);
		this.oUploadSet.setMultiple(false);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		this.spy(this.oUploadSet._oRb, "getText");
		this.stub(MessageBox, "error");

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.notCalled, "Multiple files are not uploaded");
		assert.ok(this.oUploadSet._oRb.getText.notCalled, "Get error text is not called");
		assert.ok(MessageBox.error.notCalled, "Set error message is not called");
		MessageBox.error.reset();
	});

	QUnit.test("Drop multiple files", function(assert) {
		// arrange
		const that = this,
			oEvent = getDragAndPropEvent([true, true]);
		this.oUploadSet.setDirectory(false);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		const done = assert.async();
		this.stub(this.oUploadSet, "_processNewFileObjects").callsFake(function() {
			assert.ok(that.oUploadSet._processNewFileObjects.called, "Upload files called");
			assert.ok(that.oUploadSet._processNewFileObjects.firstCall.calledWithExactly(["file", "file"]), "To upload passed two files");
			done();
		});

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.called, "Retrieve files for upload");
	});

	QUnit.test("Drop multiple files, file loading throw error", function(assert) {
		// arrange
		const oEvent = getDragAndPropEvent([true, true]);
		const oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems[1].webkitGetAsEntry = function() {
			return {
				isFile: this.isFile,
				isDirectory: !this.isFile,
				file: function(_resolve, reject) {
					reject("error loading file");
				}
			};
		};
		this.oUploadSet.setDirectory(false);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		this.spy(this.oUploadSet, "_processNewFileObjects");

		// act
		assert.throws(this.oUploadSet._onDropFile(oEvent), "Error is thrown");

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.called, "Retrieve files for upload");
		assert.ok(this.oUploadSet._processNewFileObjects.notCalled, "File upload is not triggered");
	});

	QUnit.test("Drop directory with two files", function(assert) {
		// arrange
		const that = this,
			oEvent = getDragAndPropEvent([false]);
		const oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems[0].webkitGetAsEntry = function() {
				return {
					isFile: this.isFile,
					isDirectory: !this.isFile,
					createReader: function() {
						return {
							readEntries: function(caller) {
								const aDataTransferItems = getDragAndPropEvent([true, true]).getParameter("browserEvent").dataTransfer.items;
								caller(aDataTransferItems.map(function(entry) { return entry.webkitGetAsEntry();}));
							}
						};
					}
				};
			};
		this.oUploadSet.setDirectory(true);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		const done = assert.async();
		this.stub(this.oUploadSet, "_processNewFileObjects").callsFake(function() {
			assert.ok(that.oUploadSet._processNewFileObjects.called, "Upload files called");
			assert.ok(that.oUploadSet._processNewFileObjects.firstCall.calledWithExactly(["file", "file"]), "To upload passed two files");
			done();
		});

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.called, "Retrieve files for upload");
	});

	QUnit.test("Drop directory with not files", function(assert) {
		// arrange
		const oEvent = getDragAndPropEvent([false]);
		const oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems[0].webkitGetAsEntry = function() {
				return {
					isFile: this.isFile,
					isDirectory: !this.isFile,
					createReader: function() {
						return {
							readEntries: function(caller) {
								caller([]);
							}
						};
					}
				};
			};
		this.oUploadSet.setDirectory(true);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		this.spy(this.oUploadSet, "_processNewFileObjects");

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.called, "Retrieve files for upload");
		assert.ok(this.oUploadSet._processNewFileObjects.notCalled, "File upload is not triggered");
	});

	QUnit.test("webkitGetAsEntry return object that don't have isFile and isDirectory flags set to true", function(assert) {
		// arrange
		const oEvent = getDragAndPropEvent([false]);
		const oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems[0].webkitGetAsEntry = function() {
				return {};
			};
		this.oUploadSet.setDirectory(true);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		this.spy(this.oUploadSet, "_processNewFileObjects");

		// act
		this.oUploadSet._onDropFile(oEvent);

		// assert
		assert.ok(this.oUploadSet._getFilesFromDataTransferItems.called, "Retrieve files for upload");
		assert.ok(this.oUploadSet._processNewFileObjects.notCalled, "File upload is not triggered");
	});

	QUnit.test("Test for MultiSelect in pending upload (not supported)", function(assert) {
		//Act
		this.oUploadSet.setInstantUpload(false);
		this.oUploadSet.setMode(ListMode.MultiSelect);
		//Assert
		assert.equal(this.oUploadSet.getMode(), ListMode.None, "Mode after setting 'MultiSelect' in pending upload is 'None'");
	});

	QUnit.test("Test for method setMode)", function(assert) {
		assert.equal(this.oUploadSet.getMode(), ListMode.MultiSelect, "Initial mode MultiSelect is set correctly");
		this.oUploadSet.setMode(ListMode.SingleSelect);
		assert.equal(this.oUploadSet.getMode(), ListMode.SingleSelect, "Mode is set to SingleSelect");
	});

	QUnit.test("Set and get selected items by Id", function(assert) {
		//Arrange
		var aAllItems = this.oUploadSet.getItems();
		this.oUploadSet.setMode(ListMode.MultiSelect);

		//Act
		var oReturnedUploadSet = this.oUploadSet.setSelectedItemById(aAllItems[0].getId(), true);

		//Assert
		assert.ok(oReturnedUploadSet instanceof UploadSet, "Returned value is UploadSet");
		assert.deepEqual(this.oUploadSet.getSelectedItems()[0], aAllItems[0], "Data of first selected item is correct");
		assert.ok(this.oUploadSet.getSelectedItems()[0] instanceof UploadSetItem, "First item returned is UploadSetItem");
	});

	QUnit.test("Get selected items without selection", function(assert) {
		//Assert
		assert.equal(this.oUploadSet.getSelectedItems().length, 0, "0 items have been selected");
	});

	QUnit.test("Set and get selected item", function(assert) {
		//Arrange
		var aAllItems = this.oUploadSet.getItems();
		this.oUploadSet.setMode(ListMode.SingleSelect);

		//Act
		this.oUploadSet.setSelectedItem(aAllItems[0], true);

		//Assert
		assert.deepEqual(this.oUploadSet.getSelectedItem()[0], aAllItems[0], "Selected item is correct");
		assert.ok(this.oUploadSet.getSelectedItem()[0] instanceof UploadSetItem, "Item returned is UploadSetItem");
	});

	QUnit.test("Set and get selected item by Id", function(assert) {
		//Arrange
		var aAllItems = this.oUploadSet.getItems();
		this.oUploadSet.setMode(ListMode.SingleSelectLeft);

		//Act
		var oReturnedUploadSet = this.oUploadSet.setSelectedItemById(aAllItems[0].getId(), true);

		//Assert
		assert.deepEqual(oReturnedUploadSet, this.oUploadSet, "Local UploadSet and returned element are deepEqual");
		assert.deepEqual(this.oUploadSet.getSelectedItem()[0], aAllItems[0], "Selected item is correct");
		assert.ok(oReturnedUploadSet.getItems()[0].getSelected(), "The getSelected of UploadSetItem has been set correctly");
		assert.ok(this.oUploadSet.getSelectedItem()[0] instanceof UploadSetItem, "Item returned is UploadSetItem");
	});

	QUnit.test("Get selected item without selection", function(assert) {
		//Assert
		assert.equal(this.oUploadSet.getSelectedItem(), null, "Selected item is correct");
	});

	QUnit.test("Set all and get selected items", function(assert) {
		//Arrange
		var aAllItems = this.oUploadSet.getItems();
		this.oUploadSet.setMode(ListMode.MultiSelect);

		//Act
		var oReturnedUploadSet = this.oUploadSet.selectAll();

		//Assert
		assert.ok(oReturnedUploadSet instanceof UploadSet, "Returned value is UploadSet");
		assert.equal(this.oUploadSet.getSelectedItems().length, aAllItems.length, "Input and Output amount of items are equal");
		assert.equal(oReturnedUploadSet.getSelectedItems().length, this.oUploadSet.getSelectedItems().length, "Return value of selectAll is equal to getSelectedItems");
		assert.deepEqual(oReturnedUploadSet, this.oUploadSet, "Local UploadSet and returned element are deepEqual");
		assert.deepEqual(this.oUploadSet.getSelectedItems()[0], aAllItems[0], "Data of first selected item is correct");
		assert.ok(this.oUploadSet.getSelectedItems()[0] instanceof UploadSetItem, "First item returned is UploadSetItem");
		assert.equal(this.oUploadSet.getSelectedItem()[0], aAllItems[0], "getSelectedItem() returns first selected item for multiple selection");
	});

	QUnit.test("Set and reset all items manually to check sync state of UploadSet Items and UploadSet.", function(assert) {
		//Arrange
		var aAllItems = this.oUploadSet.getItems();
		this.oUploadSet.setMode(ListMode.MultiSelect);

		//Act
		for (var i = 0; i < aAllItems.length; i++) {
			aAllItems[i].setSelected(true);
		}
		//Assert
		assert.equal(this.oUploadSet.getSelectedItems().length, 2, "2 items are selected");

		// Act
		for (var i = 0; i < aAllItems.length; i++) {
			aAllItems[i].setSelected(false);
		}

		//Assert
		assert.equal(this.oUploadSet.getSelectedItems().length, 0, "0 items are selected");
	});

	QUnit.test("Test for binding Selected property on each UploadSetItem", function(assert) {
		//Arrange
		var aAllItems = this.oUploadSet.getItems();
		this.oUploadSet.setMode(ListMode.MultiSelect);

		//Assert
		assert.equal(this.oUploadSet.getSelectedItems().length, 0, "no items are selected");

		// Binding selected attribute to validate if items are selected

		//Act
		aAllItems.forEach((oItem) => oItem.bindProperty("selected", {
			path: "selected"
		}));

		//Assert to validate if bound property "selected" is propogated to list selection.
		assert.equal(this.oUploadSet.getSelectedItems().length, 2, "2 items are selected with property selected bound to each UploadSetItem");
	});

	QUnit.module("Grouping tests", {
		beforeEach: async function() {
			this.oUploadSet = new UploadSet({
				items: {
					path: "/items",
					templateShareable: false,
					template: TestUtils.createItemTemplate(),
					sorter: new Sorter("fileName", false, function(oContext) {
						return {
							key: oContext.getProperty("fileName"),
							upperCase: false
						};
					})
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Test for adding Groups", async function(assert) {
		//Arrange
		this.spy(this.oUploadSet._oList, "addItemGroup");
		this.spy(this.oUploadSet, "getBindingInfo");
		var aList = this.oUploadSet._oList,
			aItems = aList.getItems();

		//Act
		this.oUploadSet.invalidate();
		await nextUIUpdate();

		//Assert
		assert.ok(this.oUploadSet.getBindingInfo.calledWith("items"), "Model fetched from items binding to lookup for grouping keys");
		assert.equal(this.oUploadSet._oList.addItemGroup.callCount, 2, "Two groups were added");
		assert.equal(aItems.length, 4, "Each item is part of a separate group (we have inside 2 group items, each with 1 UploadSet item)");
		aItems.forEach(function(oItem) {
			if (oItem._bGroupHeader) {
				assert.ok(oItem.getTitle().length > 0, "The group item has title property");
			}
		});
	});

	QUnit.module("Directory Uploads", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData1()));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Directory uploads setter/getter test", function(assert) {
		//Assert
		assert.equal(this.oUploadSet.getDirectory(), false, "By default directory uploads are set to false");

		//act
		this.oUploadSet.setDirectory(true);

		//assert
		assert.equal(this.oUploadSet.getDirectory(), true, "Directory uploads are now enabled with setter");
	});

	QUnit.test("Upload files from directory using directory feature", function(assert) {

		//act
		this.oUploadSet.setDirectory(true);

		var oInput = document.querySelector("[type='file']");

		//assert
		assert.ok(oInput.hasAttribute("webkitdirectory"), "Attribute properly set");

		//arrange
		var oProcessNewFileObjects = this.spy(this.oUploadSet, '_processNewFileObjects');
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = {
			0: {
				name: "Sample File 1",
				size: 1,
				type: "type"
			},
			1: {
				name: "Sample File 2",
				size: 1,
				type: "type"
			},
			length: 2
		};

		//act
		oFileUploader.fireChange({id:'directory-uploads', newValue:'', files:oFileList});

		//assert
		assert.ok(oProcessNewFileObjects.calledWith(oFileList), "Uploadset will upload files from directory");
	});

	QUnit.test("Upload files from directory & sub directories using directory uploads", function(assert) {
		//arrange
		var oProcessNewFileObjects = this.spy(this.oUploadSet, '_processNewFileObjects');
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 1.txt"
			},
			1: {
				name: "Sample File 2",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 2.txt"
			},
			2: {
				name: "Sample File 3",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 3.txt"
			},
			3: {
				name: "Sample File 4",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 4.txt"
			},
			4: {
				name: "Sample File 5",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 5.txt"
			},
			length: 5
		};

		//act
		oFileUploader.fireChange({id:'directory-uploads', newValue:'', files:oFileList});

		//assert
		assert.ok(oProcessNewFileObjects.calledWith(oFileList), "Uploadset will upload files from directories & sub directories");
	});

	QUnit.test("Directory uploads aborted with mismatch file/files types of selected directory files", function(assert) {
		//arrange
		var oFileUploaderChangeSpy = this.spy(this.oUploadSet, '_onFileUploaderChange');
		var oFileUploader = this.oUploadSet.getDefaultFileUploader();
		var oFileList = { // Files with webKitrelative path to simulate directory and sub directories
			0: {
				name: "Sample File 1.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 1.txt"
			},
			1: {
				name: "Sample File 2.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/Sample File 2.txt"
			},
			2: {
				name: "Sample File 3.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 3.txt"
			},
			3: {
				name: "Sample File 4.txt",
				size: 1,
				type: "text/plain",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 4.txt"
			},
			4: {
				name: "Sample File 5.pdf",
				size: 1,
				type: "application/pdf",
				webkitRelativePath: "uploadset-samples/samples-set2/Sample File 5.pdf"
			},
			length: 5
		};

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});

		//assert
		assert.ok(oFileUploaderChangeSpy.notCalled, "Directory uploads aborted with restrited file types");
	});

	return Library0.load("sap.suite.ui.commons")
	.then(function() {
		QUnit.module("Cloud File Picker", {
			beforeEach: async function () {
				this.$RootNode = jQuery(document.body);
				this.oUploadSet = new UploadSet("uploadSet", {
					items: {
						path: "/items",
						template: TestUtils.createItemTemplate(),
						templateShareable: false
					}
				}).setModel(new JSONModel(getData()));
				this.oUploadSet.placeAt("qunit-fixture");
				await nextUIUpdate();
				return this.oUploadSet._loadCloudFilePickerDependency()
				.then(function(cloudFilePicker) {
					this.oUploadSet._cloudFilePickerControl = cloudFilePicker;
				}.bind(this));
			},
			afterEach: function() {
				this.oUploadSet.destroy();
				this.oUploadSet = null;
			}
		});

		QUnit.test("CloudFilePicker instance is created and invoked", function(assert) {

			// act
			var oCloudFilePickerInstance = this.oUploadSet._invokeCloudFilePicker();

			// assert
			assert.ok(oCloudFilePickerInstance.getDomRef(), "CloudFilePicker rendered successfully");

			oCloudFilePickerInstance.close();
		});

		QUnit.test("Cloud File Picker Menu button visibility", function (assert) {
            // assert
            assert.equal(this.oUploadSet._getCloudFilePicker(), null, "Cloud File Picker Button not enabled by default");

            //act
            this.oUploadSet.setCloudFilePickerEnabled(true);

            // assert
            assert.equal(this.oUploadSet._getCloudFilePicker() instanceof MenuButton, true, "Cloud File Picker Menu Button enabled with CloudFilePicker property enabled");
            assert.ok(this.oUploadSet._getCloudFilePicker().getMenu().getItems().length === 2, "Cloud File Picker Menu Button created with 2 menu items (local and cloud)");
        });

        QUnit.test("Cloud File picker Menu button created with custom text", function (assert) {

            // arrange
            var sDefaultCloudFilePickerButtonText = this.oUploadSet._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT");

            //act
            this.oUploadSet.setCloudFilePickerEnabled(true);
            var oCloudPickerButton = this.oUploadSet._getCloudFilePicker();

            // assert
            assert.ok(oCloudPickerButton && oCloudPickerButton.getMenu().getItems()[1].getText() === sDefaultCloudFilePickerButtonText, "Cloud File Picker Menu Button created with default text");

            //act
            var sCustomCloudFilePickerButtonText = "Custom Cloud Picker Text";
            this.oUploadSet.setCloudFilePickerButtonText(sCustomCloudFilePickerButtonText);
            var oCloudPickerButton2 = this.oUploadSet._getCloudFilePicker();

            // assert
            assert.ok(oCloudPickerButton2 && oCloudPickerButton2.getMenu().getItems()[1].getText() === sCustomCloudFilePickerButtonText, "Cloud File Picker Menu Button created with custom text");
        });

		QUnit.test("Cloud File Picker instance created with service url provided", function (assert) {

			// act
			var oCloudFilePickerInstance = this.oUploadSet._invokeCloudFilePicker();

			// assert
			assert.equal(oCloudFilePickerInstance.getServiceUrl(), '', "Cloud File Picker instance created with default service url");

			oCloudFilePickerInstance.close();

			//act
			this.oUploadSet.setCloudFilePickerServiceUrl('test/');
			oCloudFilePickerInstance = this.oUploadSet._invokeCloudFilePicker();

			// assert
			assert.equal(oCloudFilePickerInstance.getServiceUrl(), 'test/', "Cloud File Picker instance created with supplied service url");

			oCloudFilePickerInstance.close();
		});

		QUnit.test("Selected File from cloud file picker uploaded", function (assert){
			var CloudFileInfo = sap.ui.require("sap/suite/ui/commons/CloudFileInfo");
			// arrange
			var oCloudFilePickerSelectorSpy = this.spy(this.oUploadSet, '_onCloudPickerFileChange');
			var mParameters = {
				selectedFiles: [
					new CloudFileInfo({
						fileShareId: 'Ifs12test',
						fileShareItemName: 'Test File.txt',
						fileShareItemContentSize: '2048',
						fileShareItemContentLink: '/test/test-file',
						fileShareItemContentType: 'Doc'
					})
				]
			};

			// act
			var oCloudFilePickerInstance = this.oUploadSet._invokeCloudFilePicker();
			this.oUploadSet.setCloudFilePickerServiceUrl('test/');
			oCloudFilePickerInstance.fireSelect(mParameters);

			oCloudFilePickerInstance.close();

			// assert
			assert.ok(oCloudFilePickerSelectorSpy.called, "Cloud File Picker fires select event with selected files info");

			var done = assert.async();

			this.oUploadSet.attachEventOnce("uploadCompleted",function(oEvent){
				var oItem = oEvent.getParameter("item");
				//Assert
				assert.ok(oItem, "item param present");
				assert.ok(oItem && oItem.getFileName() === 'Test File.txt', "File selected from cloud uploaded");
				assert.equal(oItem.getUploadType(),UploadType.Cloud,"Item has been uploaded from cloud");
				done();
			});
		});
	})
	.catch(function () {
		QUnit.module("Cloud File Picker");
		QUnit.test("Cloud File Picker not supported", function (assert) {
			assert.ok(true, "Cloud File Picker type is not available with this distribution.");
		});
	});

});