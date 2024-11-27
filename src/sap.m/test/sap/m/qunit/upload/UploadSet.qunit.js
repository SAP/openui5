/*global QUnit*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/m/upload/UploadSetRenderer",
	"sap/m/upload/Uploader",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/upload/UploadSetTestUtils",
	"sap/ui/core/Core",
	"sap/ui/core/dnd/DragAndDrop",
	"sap/ui/base/Event",
	"sap/m/library",
	"sap/ui/model/Sorter",
	"sap/m/IllustratedMessageType",
	"sap/ui/core/Core"
], function (jQuery, UploadSet, UploadSetItem, UploadSetRenderer, Uploader, Toolbar, Label, ListItemBaseRenderer,
			 Dialog, Device, MessageBox, JSONModel, TestUtils, oCore, DragAndDrop, EventBase, Library, Sorter, IllustratedMessageType, Core) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = Library.ListMode;

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
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
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
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
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
		oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
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
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.ok(oDialog, "Remove dialog should now be presented.");
		oDialog.getButtons()[0].firePress();
		oDialog.getButtons()[0].getParent().fireAfterClose();
		oDialog.destroy();

		// There should be no dialog
		oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		assert.notOk(oDialog, "Remove dialog should not exist at this time.");
	});

	QUnit.test("Event beforeItemEdited is called at proper time and with correct parameters, prevent default applies.", function (assert) {
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
		oCore.applyChanges();

		// Check no edit mode in place
		assert.notOk(this.oUploadSet._oEditedItem, "UploadSet should know nothing about any edited item.");
		assert.notOk(oItem._bInEditMode, "Item should know it is NOT being edited.");
		assert.equal(oItem._getFileNameLink().$().length, 1, "File name link should be rendered.");
		assert.equal(oItem._getFileNameEdit().$().length, 0, "File name edit should be ignored.");

		oItem._getEditButton().firePress();
		oCore.applyChanges();

		// Check everybody on the same page regarding the edit mode
		assert.equal(this.oUploadSet._oEditedItem, oItem, "Item should be known to the UploadSet as the edited one.");
		assert.ok(oItem._bInEditMode, "Item should know it is being edited.");
		assert.equal(oItem._getFileNameEdit().$().length, 1, "File name edit should be rendered.");
		assert.equal(oItem._getFileNameLink().$().length, 0, "File name link should be ignored.");
	});

	QUnit.test("Event afterItemEdited is called at proper time and with correct parameters.", function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		// DOM inspection is needed
		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
		});
		oItem._getEditButton().firePress();
		oCore.applyChanges();

		oItem._getConfirmRenameButton().firePress();
		oCore.applyChanges();

	});

	QUnit.test("Allow Curly bracees in the fileName property", function (assert) {
		//Arrange
		this.oUploadSet.attachEventOnce("beforeItemAdded", function (oEvent) {
			assert.ok(true, "beforeItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "{newFile}.txt", "File name should be correct.");
		});
		this.oUploadSet.attachEventOnce("afterItemAdded", function (oEvent) {
			assert.ok(true, "afterItemAdded event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "{newFile}.txt", "File name should be correct.");
		});
		this.oUploadSet._onFileUploaderChange({
			getParameter: function () {
				return {
					length: 1,
					0: {name: "{newFile}.txt"}
				};
			}
		});
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

	QUnit.test("Rename filename with no extension", function (assert) {
		assert.expect(2);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.placeAt("qunit-fixture");

		this.oUploadSet.attachEventOnce("afterItemEdited", function (oEvent) {
			assert.ok(true, "afterItemEdited event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "testFileName", "File name should be correct.");
		});
		oItem._getEditButton().firePress();
		oCore.applyChanges();

		oItem.setFileName("testFileName");

		oItem._getConfirmRenameButton().firePress();
		oCore.applyChanges();

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

	QUnit.test("oXhr parameters are not empty", function (assert) {
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
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);
	});

	QUnit.test("Check multi-part form data in XMLHttpRequest", function (assert) {
		//Setup
		var oUploader = new Uploader({
			useMultipart: true
				}),
		oItem = this.oUploadSet.getItems()[0],
		oXMLHttpRequestSendSpy = this.spy(window.XMLHttpRequest.prototype, "send");
		var oFormData = new window.FormData();

		this.oUploadSet.setAggregation("uploader", oUploader);
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestSendSpy.calledWith(oFormData), "XML Http request is made with form-data");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("No data rendering - with default text and description", function(assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");
		var sNoDataText = this.oUploadSet._oRb.getText("UPLOAD_SET_NO_DATA_TEXT");
		var sNoDataDescription = this.oUploadSet._oRb.getText("UPLOADCOLLECTION_NO_DATA_DESCRIPTION");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet.getNoDataText(), sNoDataText, "default text is returned for getNoDataText");
		assert.equal(this.oUploadSet.getNoDataDescription(), sNoDataDescription, "default description is returned for getNoDataDescription");
		assert.equal(this.oUploadSet._getIllustratedMessage().getTitle(), sNoDataText, "default text is rendered in Upload set");
		assert.equal(this.oUploadSet._getIllustratedMessage().getDescription(), sNoDataDescription, "default discription is rendered in Upload set");
	});

	QUnit.test("No data type illustrated message rendering", function(assert) {
		//Arrange
		this.oUploadSet.unbindAggregation("items");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet._getIllustratedMessage().getIllustrationType(), IllustratedMessageType.NoData, "The no data illustrated message is rendred");
	});

	QUnit.test("No data rendering - with user specified no data text", function(assert) {
		//Arrange
		this.oUploadSet.setNoDataText("myNoDataText");
		this.oUploadSet.unbindAggregation("items");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet._getIllustratedMessage().getTitle(), "myNoDataText", "The no data text set by user is rendered");
	});

	QUnit.test("No data rendering - with user specified no data description", function(assert) {
		//Arrange
		this.oUploadSet.setNoDataDescription("myNoDataDescription");
		this.oUploadSet.unbindAggregation("items");

		oCore.applyChanges();
		//Assert
		assert.equal(this.oUploadSet._getIllustratedMessage().getDescription(), "myNoDataDescription", "The no data description set by user is rendered");
	});

	QUnit.test("Test httpRequestMethod property with XMLHttpRequest", function (assert) {
		//Setup
		var oUploader = new Uploader({
			httpRequestMethod: "PUT"
		}),
		oItem = this.oUploadSet.getItems()[0],
		oXMLHttpRequestOpenSpy = this.spy(window.XMLHttpRequest.prototype, "open");

		this.oUploadSet.setAggregation("uploader", oUploader);
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		oUploader.uploadItem(oItem);

		//Assert
		assert.ok(oXMLHttpRequestOpenSpy.calledWith("PUT"), "XML Http put request is made");

		//Clean
		oUploader.destroy();
	});

	QUnit.test("Test incomplete items are empty after upload completed", function (assert) {
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setUploadState("Ready");
		this.oUploadSet.placeAt("qunit-fixture");
		oCore.applyChanges();

		//Act
		this.oUploadSet.uploadItem(oItem);

		//Assert
		assert.equal(this.oUploadSet.getIncompleteItems(), 0, "incomplete items are empty");
	});

	QUnit.test("No Data is rendered after item is removed", function (assert) {
		assert.notOk(document.querySelector(".sapMUCNoDataPage"), "No Data template is not visible");

		var oItem1 = this.oUploadSet.getItems()[0];
		var oItem2 = this.oUploadSet.getItems()[1];
		this.oUploadSet.removeItem(oItem1);
		this.oUploadSet.removeItem(oItem2);

		oCore.applyChanges();

		//Assert
		assert.ok(document.querySelector(".sapMUCNoDataPage"), "No Data template is visible");
	});

	QUnit.test("Upload url of Uploader updated with UploadSet uploadurl", function (assert) {
		this.oUploadSet._getImplicitUploader();
		this.oUploadSet.setUploadUrl('/test');
		assert.equal(this.oUploadSet.getUploadUrl(), "/test", "Uploader uploadUrl is updated successfuly");
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

	QUnit.test("Test to validate enable/disable status of upload button on illustrated message section", function(assert) {

		//arrange
		this.oUploadSet.removeAllItems();
		oCore.applyChanges();

		//assert initial case
		assert.ok(this.oUploadSet._oUploadButton && this.oUploadSet._oUploadButton.getEnabled(), "By default uploadenabled is set to true and Upload button is enabled");

		//act
		this.oUploadSet.setUploadEnabled(false);
		oCore.applyChanges();

		//assert
		assert.ok(this.oUploadSet._oUploadButton && !this.oUploadSet._oUploadButton.getEnabled(), "Upload button on illustrated message section is disabled when uploadenabled is set to false");
	});

	QUnit.test("Test to validate visibility status of upload button on illustrated message section", function(assert) {

		//arrange
		this.oUploadSet.removeAllItems();
		oCore.applyChanges();

		//assert initial case
		assert.ok(this.oUploadSet._oUploadButton && this.oUploadSet._oUploadButton.getVisible(), "By default uploadButtonInvisible is set to false and Upload button is visible");

		//act
		this.oUploadSet.setUploadButtonInvisible(true);
		oCore.applyChanges();

		//assert
		assert.ok(this.oUploadSet._oUploadButton && !this.oUploadSet._oUploadButton.getVisible(), "Upload button on illustrated message section is hidden when uploadButtonInvisible is set to true");
	});

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

	QUnit.test("Test to avoid item creation for item in destruction phase", function(assert) {
		var oItem = this.oUploadSet.getItems()[1];

		var listItemSpy = this.spy(oItem, "_getListItem");

		oItem._getDeleteButton().firePress();

		// Close the dialog
		var oDialog = oCore.byId(this.oUploadSet.getId() + "-deleteDialog");
		oDialog.getButtons()[1].firePress();
		oDialog.destroy();

		// Assert
		assert.ok(listItemSpy.notCalled, "UploadSetItem not created for item in destruction phase.");
	});

	QUnit.module("UploadSet general functionality", {
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				uploadEnabled: false,
				uploadButtonInvisible: false
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
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
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				fileTypes:"txt,doc,png",
				mediaTypes:"text/plain,application/msword,image/jpeg,image/png",
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData1()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("SameFilenameAllowed set as false in uploadSet", function (assert) {
		assert.expect(1);
		var oItem = this.oUploadSet.getItems()[0];

		// Set as false
		this.oUploadSet.setSameFilenameAllowed(false);
		this.oUploadSet.placeAt("qunit-fixture");

		oItem._getEditButton().firePress();
		oCore.applyChanges();

		this.oUploadSet.getItems()[0].$("fileNameEdit-inner")[0].value = "Test";
		oItem._getConfirmRenameButton().firePress();
		oCore.applyChanges();

		assert.equal(this.oUploadSet.getItems()[0].getFileName(), "Alice.mp4", "FileName will remain same");
	});

	QUnit.test("SameFilenameAllowed set as true in uploadSet", function (assert) {
		assert.expect(2);
		var oItem = this.oUploadSet.getItems()[0];

		this.oUploadSet.setSameFilenameAllowed(true);
		this.oUploadSet.placeAt("qunit-fixture");

		oItem._getEditButton().firePress();
		oCore.applyChanges();

		this.oUploadSet.attachEventOnce("fileRenamed", function (oEvent) {
			assert.ok(true, "FileRenamed event should have been called.");
			assert.equal(oEvent.getParameter("item").getFileName(), "Test.mp4", "File name should be correct.");
		});
		this.oUploadSet.getItems()[0].$("fileNameEdit-inner")[0].value = "Test";

		oItem._getConfirmRenameButton().firePress();
		oCore.applyChanges();
	});

	QUnit.test("Test for invalid file type, media type files upload attempt", function(assert) {
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
			if (oItem) {
				assert.equal(oItem.getMetadata().getName(), "sap.m.upload.UploadSetItem", "mismatched UploadSetItem received");
			}
			done();
		});

		//act
		oFileUploader.handlechange({
			target: {
				files: oFileList
			}
		});
	});

	QUnit.test("Marker is not displayed when the item is in edit mode", function(assert) {
		//Arrange
		var oItem = this.oUploadSet.getItems()[0];
		var oMarkerItem = oItem.getMarkers()[0];
		oItem._getEditButton().firePress();
		this.oUploadSet.rerender();
		//Act
		var oMarkerContainerItem = oMarkerItem.getDomRef().parentNode;
		var sMarkerItemStyle = oMarkerContainerItem.getAttribute("style");

		//Assert
		assert.ok(sMarkerItemStyle.indexOf("display: none") >= 0, "Item in edit mode: Marker not displayed");
	});

	QUnit.module("Rendering of UploadSet with hideUploadButton = true", {
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false,
					uploadButtonInvisible: true
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
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

	QUnit.test("Remove Aggregation supports index", function (assert) {
		assert.equal(this.oUploadSet.getItems().length, 2, "2 items are present before operation");

		this.oUploadSet.removeItem(0);
		oCore.applyChanges();

		//Assert
		assert.equal(this.oUploadSet.getItems().length, 1, "item is successfully removed using index");

		this.oUploadSet.removeAggregation("items",0);
		oCore.applyChanges();

		//Assert
		assert.equal(this.oUploadSet.getItems().length, 0, "item is successfully removed using index");
	});

	QUnit.test("Remove Aggregation destroys supplied control object", function (assert) {
		//Arrange
		var uploadSetItem = this.oUploadSet.getItems()[0];

		//Act
		this.oUploadSet.removeAggregation("items", uploadSetItem);
		oCore.applyChanges();

		//Assert
		assert.equal(this.oUploadSet.getList().getItems().length, 1, "List Item removed successfully");
	});

	QUnit.module("Drag and drop", {
		beforeEach: function () {
			this.$RootNode = jQuery(document.body);
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
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
		var oDataTransfer = {items: []};

		if (isFileEntries && isFileEntries.length) {
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
			var oEvent = getDragAndPropEvent(data.dropContent);
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
		var oEvent = getDragAndPropEvent();
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
		var oEvent = getDragAndPropEvent([true, true]);
		var oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
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
		var that = this,
			oEvent = getDragAndPropEvent([true, true]);
		this.oUploadSet.setDirectory(false);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		var done = assert.async();
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
		var oEvent = getDragAndPropEvent([true, true]);
		var oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
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
		var that = this,
			oEvent = getDragAndPropEvent([false]);
		var oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
		oItems[0].webkitGetAsEntry = function() {
				return {
					isFile: this.isFile,
					isDirectory: !this.isFile,
					createReader: function() {
						return {
							readEntries: function(caller) {
								var aDataTransferItems = getDragAndPropEvent([true, true]).getParameter("browserEvent").dataTransfer.items;
								caller(aDataTransferItems.map(function(entry) { return entry.webkitGetAsEntry();}));
							}
						};
					}
				};
			};
		this.oUploadSet.setDirectory(true);
		this.oUploadSet.setMultiple(true);
		this.spy(this.oUploadSet, "_getFilesFromDataTransferItems");
		var done = assert.async();
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
		var oEvent = getDragAndPropEvent([false]);
		var oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
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
		var oEvent = getDragAndPropEvent([false]);
		var oItems = oEvent.getParameter("browserEvent").dataTransfer.items;
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
		aAllItems.forEach(function (oItem) {
			oItem.bindProperty("selected", {
					path: "selected"
			});
        });

		//Assert to validate if bound property "selected" is propogated to list selection.
		assert.equal(this.oUploadSet.getSelectedItems().length, 2, "2 items are selected with property selected bound to each UploadSetItem");
	});

	QUnit.module("Grouping tests", {
		beforeEach: function() {
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
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("Test for adding Groups", function(assert) {
		//Arrange
		this.spy(this.oUploadSet._oList, "addItemGroup");
		this.spy(this.oUploadSet, "getBindingInfo");
		var aList = this.oUploadSet._oList,
			aItems = aList.getItems();

		//Act
		this.oUploadSet.rerender();

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
		beforeEach: function () {
			this.oUploadSet = new UploadSet("uploadSet", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData1()));
			this.oUploadSet.placeAt("qunit-fixture");
			oCore.applyChanges();
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

	return Core.loadLibrary("sap.suite.ui.commons", { async: true })
	.then(function() {
		QUnit.module("Cloud File Picker", {
			beforeEach: function () {
				this.$RootNode = jQuery(document.body);
				this.oUploadSet = new UploadSet("uploadSet", {
					items: {
						path: "/items",
						template: TestUtils.createItemTemplate(),
						templateShareable: false
					}
				}).setModel(new JSONModel(getData()));
				this.oUploadSet.placeAt("qunit-fixture");
				oCore.applyChanges();
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

		QUnit.test("Cloud File Picker button visibility", function (assert) {
			// assert
			assert.equal(this.oUploadSet._getCloudFilePicker(), null, "Cloud File Picker Button not enabled by default");

			//act
			this.oUploadSet.setCloudFilePickerEnabled(true);

			// assert
			assert.equal(this.oUploadSet._getCloudFilePicker() instanceof sap.m.Button, true, "Cloud File Picker Button enabled with CloudFilePicker property enabled");
		});

		QUnit.test("Cloud File picker button created with custom text", function (assert) {

			// arrange
			var sDefaultCloudFilePickerButtonText = this.oUploadSet._oRb.getText("UPLOAD_SET_DEFAULT_CFP_BUTTON_TEXT");

			//act
			this.oUploadSet.setCloudFilePickerEnabled(true);
			var oCloudPickerButton = this.oUploadSet._getCloudFilePicker();

			// assert
			assert.ok(oCloudPickerButton && oCloudPickerButton.getText() === sDefaultCloudFilePickerButtonText, "Cloud File Picker Button created with default text");

			//act
			this.oUploadSet.setCloudFilePickerButtonText("Upload from cloud");
			var oCloudPickerButton2 = this.oUploadSet._getCloudFilePicker();

			// assert
			assert.ok(oCloudPickerButton2 && oCloudPickerButton2.getText() === 'Upload from cloud', "Cloud File Picker Button created with custom text");
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
				//Assert
				assert.ok(oEvent.getParameter("item"), "item param present");
				var addedItem = oEvent.getParameter("item");
				assert.ok(addedItem && addedItem.getFileName() === 'Test File.txt', "File selected from cloud uploaded");
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