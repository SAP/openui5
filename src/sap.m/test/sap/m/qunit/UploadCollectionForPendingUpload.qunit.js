/*global QUnit,sinon*/

sap.ui.define("sap.m.qunit.UploadCollectionForPendingUpload", [
	"sap/ui/thirdparty/jquery",
	"sap/m/UploadCollection",
	"sap/ui/model/json/JSONModel",
	"sap/m/ListMode",
	"sap/m/UploadCollectionItem",
	"sap/m/MessageBox",
	"sap/ui/unified/FileUploader",
	"sap/ui/base/Event",
	"sap/m/UploadCollectionParameter",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/qunit/QUnitUtils", // only used indirectly as it adds some methods to fake events
	"sap/ui/events/jquery/EventExtension"
], function(
	jQuery,
	UploadCollection,
	JSONModel,
	ListMode,
	UploadCollectionItem,
	MessageBox,
	FileUploader,
	Event,
	UploadCollectionParameter,
	Device,
	Log
) {
	"use strict";


	QUnit.module("PendingUpload: public and private methods", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection("pendingUploads", {});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Set of 'instantUpload' at runtime is allowed", function(assert) {
		var oUploadCollection = this.oUploadCollection;
		assert.ok(oUploadCollection.getInstantUpload(), "Default value should be set to true.");
		this.oUploadCollection.setInstantUpload(false);
		assert.ok(!oUploadCollection.getInstantUpload(), "Reset of value to false should be possible at runtime.");
		this.oUploadCollection.setInstantUpload(true);
		assert.ok(oUploadCollection.getInstantUpload(), "Reset of value back to true should be possible at runtime.");
		oUploadCollection.destroy();
	});

	QUnit.test("Check if property binding via model is still working", function(assert) {
		var oUploadCollection = this.oUploadCollection;
		oUploadCollection.destroy();
		var oData = {
			fileTypes: ["jpg", "gif"]
		};
		oUploadCollection = new UploadCollection({
			instantUpload: false,
			fileType: "{/fileTypes}"
		}).setModel(new JSONModel(oData));
		oUploadCollection.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		var aFileTypesExpected = oData.fileTypes.toString();
		assert.equal(oUploadCollection.getFileType().toString(), aFileTypesExpected, "Binded fileType value is set correctly for instantUpload : false");
		oUploadCollection.setFileType([]);
		assert.equal(oUploadCollection.getFileType().toString(), "", "Binded fileType value is set correctly for instantUpload : false");
		oUploadCollection.destroy();
		oUploadCollection = null;
	});

	QUnit.test("API method 'upload' exists and reacts depending on usages.", function(assert) {
		var oUploadCollection = this.oUploadCollection;
		sinon.spy(Log, "error");
		oUploadCollection.upload();
		assert.equal(Log.error.callCount, 0, "No error should be logged, because of valid API call.");
		oUploadCollection.destroy();

		oUploadCollection = new UploadCollection({
			instantUpload: false
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		Log.error.reset();
		oUploadCollection.upload();
		assert.equal(Log.error.callCount, 0, "No error should be logged, because of valid API call.");
		oUploadCollection.destroy();
		oUploadCollection = null;
		Log.error.restore();
	});

	QUnit.module("PendingUpload: test setters", {
		beforeEach: function() {
			this.createUploadCollection = function(oAddToContructor) {
				if (this.oUploadCollection) {
					this.oUploadCollection.destroy();
				}
				this.oUploadCollection = new UploadCollection(oAddToContructor).placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			};
			this.oUploadCollection = new UploadCollection("pendingUploads", {}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Test for method setFileType", function(assert) {
		var aTypes = ["jpg", "png", "bmp", "unittest"],
			aNewTypes = ["txt, xml"];
		this.createUploadCollection({
			instantUpload: false,
			fileType: aTypes
		});
		assert.equal(this.oUploadCollection.getFileType().toString(), aTypes.toString(), "Initial fileType value should be set correctly.");
		this.oUploadCollection.setFileType(aNewTypes);
		assert.equal(this.oUploadCollection.getFileType().toString(), aNewTypes.toString(), "FileType should be reset correctly.");
	});

	QUnit.test("Test for method setMaximumFilenameLength", function(assert) {
		this.createUploadCollection({
			instantUpload: false,
			maximumFilenameLength: 10
		});
		assert.equal(this.oUploadCollection.getMaximumFilenameLength(), 10, "Initial maximumFilenameLength value should be set correctly.");
		this.oUploadCollection.setMaximumFilenameLength(20);
		assert.equal(this.oUploadCollection.getMaximumFilenameLength(), 20, "MaximumFilenameLength property should be reset correctly.");
	});

	QUnit.test("Test for method setMaximumFileSize", function(assert) {
		this.createUploadCollection({
			instantUpload: false,
			maximumFileSize: 50
		});
		assert.equal(this.oUploadCollection.getMaximumFileSize(), 50, "Initial maximFileSize value should be set correctly.");
		this.oUploadCollection.setMaximumFileSize(20);
		assert.equal(this.oUploadCollection.getMaximumFileSize(), 20, "MaximumFileSize property should be reset correctly.");
	});

	QUnit.test("Test for method setMimeType", function(assert) {
		var aTypes = ["text", "image", "unittest"],
			aNewTypes = ["somethingelse"];
		this.createUploadCollection({
			instantUpload: false,
			mimeType: aTypes
		});
		assert.equal(this.oUploadCollection.getMimeType().toString(), aTypes.toString(), "Initial mimeType value should be set correctly.");
		this.oUploadCollection.setMimeType(aNewTypes);
		assert.equal(this.oUploadCollection.getMimeType().toString(), aNewTypes.toString(), "MimeType property should be reset correctly.");
	});

	QUnit.test("Test for method setMultiple", function(assert) {
		this.createUploadCollection({
			instantUpload: false,
			multiple: true
		});
		assert.equal(this.oUploadCollection.getMultiple(), true, "Initial multiple value should be set correctly .");
		this.oUploadCollection.setMultiple(false);
		assert.equal(this.oUploadCollection.getMultiple(), false, "Multiple property should be reset correctly.");
	});

	QUnit.test("Test for method setUploadEnabled", function(assert) {
		this.createUploadCollection({
			instantUpload: false,
			uploadEnabled: false
		});
		assert.equal(this.oUploadCollection.getUploadEnabled(), false, "Initial uploadEnabled value should be set correctly.");
		this.oUploadCollection.setUploadEnabled(true);
		assert.equal(this.oUploadCollection.getUploadEnabled(), true, "UploadEnabled property should be reset correctly.");
	});

	QUnit.test("Test for method setUploadUrl", function(assert) {
		var sUploadUrl = "my/upload/url",
			sNewUrl = "my/another/url";
		this.createUploadCollection({
			instantUpload: false,
			uploadUrl: sUploadUrl
		});
		assert.equal(this.oUploadCollection.getUploadUrl(), sUploadUrl, "Initial uploadUrl value should be set correctly .");
		this.oUploadCollection.setUploadUrl(sNewUrl);
		assert.equal(this.oUploadCollection.getUploadUrl(), sNewUrl, "UploadUrl property should be reset correctly.");
	});

	QUnit.module("Rendering of UploadCollection with instantUpload = false ", {

		beforeEach: function() {
			this.oUploadCollection = new UploadCollection("uploadCollection1", {
				instantUpload: false
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var oFile = { name: "file1" };
			this.aFiles = [oFile];
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("Rendering after initial load", function(assert) {
		assert.ok(this.oUploadCollection, "UploadCollection should be instantiated.");
		assert.ok(this.oUploadCollection.getDomRef("list"), "Item list should be rendered.");
		assert.ok(this.oUploadCollection.getDomRef("toolbar"), "Toolbar of the item list should be rendered.");
		assert.ok(this.oUploadCollection.getDomRef("numberOfAttachmentsTitle"), "Title Number of attachments should be rendered.");
	});

	QUnit.test("Rendering of an item after change event", function(assert) {
		var oFileUploader = this.oUploadCollection._getFileUploader();
		oFileUploader.fireChange({
			files: this.aFiles,
			newValue: "file1" // needed to enable IE9 support and non failing tests
		});
		sap.ui.getCore().applyChanges();

		var sItemId = this.oUploadCollection.getItems()[0].getId(),
			fnIdPresent = function (sInnerControlName) { return document.getElementById(sItemId + sInnerControlName); };
		assert.ok(fnIdPresent("-ta_filenameHL"), "FileName is rendered");
		assert.ok(!fnIdPresent("-ta_editFileName"), "No input field should be rendered if instantUpload = false ");
		assert.ok(!fnIdPresent("-okButton"), "No OK button should be rendered if instantUpload = false");
		assert.ok(!fnIdPresent("-cancelButton"), "No Cancel button should be rendered if instantUpload = false");
		assert.ok(fnIdPresent("-editButton"), "Edit button should be rendered if instantUpload = false");
		assert.ok(fnIdPresent("-deleteButton"), "Delete button should be rendered if instantUpload = false");
		assert.ok(fnIdPresent("-ia_iconHL"), "Icon should be rendered if instantUpload = false");
	});

	QUnit.skip("Download fails in pending upload mode", function(assert) {
		assert.equal(this.oUploadCollection.downloadItem(null, false), false, "In pending upload mode, the download method returns false.");
	});

	QUnit.test("Set tooltip of FileUploader", function(assert) {
		var sText = this.oUploadCollection._oRb.getText("UPLOADCOLLECTION_ADD");
		assert.strictEqual(this.oUploadCollection._oFileUploader.getTooltip(), sText, "Correct tooltip of FileUploader");
		assert.strictEqual(this.oUploadCollection._oFileUploader.getButtonText(), sText, "Correct tooltip of FileUploader");
	});

	QUnit.test("File upload button is visible", function(assert) {
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), true, "File Uploader is visible");
	});

	// jQeury.sap.focus doesn't  exist
	QUnit.skip("Focus handling after change event", function(assert) {
		//Arrange
		var oFileUploader = this.oUploadCollection._getFileUploader();
		oFileUploader.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		var oButtonFU = this.oUploadCollection.getToolbar().getContent()[2].$().find("button");
		var oStubFUFocus = sinon.stub(jQuery.sap, "focus");
		sap.ui.getCore().applyChanges();

		//Act
		//Assert
		assert.ok(oStubFUFocus.withArgs(oButtonFU), "Set focus on FileUploader called");

		//Restore
		oStubFUFocus.restore();
	});

	QUnit.module("Rendering of UploadCollection with instantUpload = false and uploadButtonInvisible = true", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection("uploadCollectionHiddenUpload", {
				instantUpload: false,
				uploadButtonInvisible: true
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("File upload button is not visible", function(assert) {
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), false, "File Uploader is not visible");
	});

	QUnit.test("File upload button is visible after setting the uploadButtonInvisible property to false", function(assert) {
		this.oUploadCollection.setUploadButtonInvisible(false);
		assert.equal(this.oUploadCollection._getFileUploader().getVisible(), true, "File Uploader is visible");
	});

	QUnit.module("PendingUpload: upload method", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection({ instantUpload: false });
			var oFile = {
				name: "file1"
			};
			this.aFiles = [oFile];
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	// Obsolete for "one uploader to rule them all"
	QUnit.skip("Test Upload", function(assert) {
		var oFileUploader1 = this.oUploadCollection._getFileUploader();
		var fnFUUpload1 = this.spy(oFileUploader1, "upload");
		oFileUploader1.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		oFileUploader1.setValue("file1.txt");
		var oFileUploader2 = this.oUploadCollection._getFileUploader();
		var fnFUUpload2 = this.spy(oFileUploader2, "upload");
		oFileUploader2.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		oFileUploader2.setValue("file2.txt");
		this.oUploadCollection.upload();
		assert.ok(fnFUUpload1.calledOnce, true, "'Upload' method of FileUploader should be called for each FU instance just once");
		assert.ok(fnFUUpload2.calledOnce, true, "'Upload' method of FileUploader should be called for each FU instance just once");
	});

	QUnit.test("Test Upload with checks for file uploader visibility", function(assert) {
		var oFileUploader1 = this.oUploadCollection._getFileUploader();
		oFileUploader1.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		var oFileUploader2 = this.oUploadCollection._getFileUploader();
		oFileUploader2.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		this.oUploadCollection.upload();

		var aToolbarElements = this.oUploadCollection._oHeaderToolbar.getContent();
		for (var i = 0; i < aToolbarElements.length; i++) {
			if (aToolbarElements[i] instanceof FileUploader) {
				assert.equal(aToolbarElements[i].getVisible(), true, "File Uploader in header content at position" + i + " is visible");
			}
		}
	});

	QUnit.test("Test Upload with checks for file uploader visibility when files have been added, but not uploaded", function(assert) {
		var oFileUploader1 = this.oUploadCollection._getFileUploader();
		oFileUploader1.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		var oFileUploader2 = this.oUploadCollection._getFileUploader();
		oFileUploader2.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});

		this.oUploadCollection.setUploadButtonInvisible(true);

		var aToolbarElements = this.oUploadCollection._oHeaderToolbar.getContent();
		for (var i = 0; i < aToolbarElements.length; i++) {
			if (aToolbarElements[i] instanceof FileUploader) {
				assert.equal(aToolbarElements[i].getVisible(), false, "File Uploader in header content at position" + i + " is not visible");
			}
		}
	});

	QUnit.test("Test Upload with checks for file uploader visibility after changing uploadButtonInvisible property", function(assert) {
		var oFileUploader1 = this.oUploadCollection._getFileUploader();
		oFileUploader1.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		var oFileUploader2 = this.oUploadCollection._getFileUploader();
		oFileUploader2.fireChange({
			files: this.aFiles,
			newValue: "file1"// needed to enable IE9 support and non failing tests
		});
		this.oUploadCollection.upload();
		this.oUploadCollection.setUploadButtonInvisible(true);

		var aToolbarElements = this.oUploadCollection._oHeaderToolbar.getContent();
		for (var i = 0; i < aToolbarElements.length; i++) {
			if (aToolbarElements[i] instanceof FileUploader) {
				assert.equal(aToolbarElements[i].getVisible(), false, "File Uploader in header content at position" + i + " is not visible");
			}
		}
	});

	QUnit.skip("Drop file in UploadCollection", function(assert) {
		//Arrange
		sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		var $DragDropArea = this.oUploadCollection.$("drag-drop-area");
		var oFileList = {
			0: {
				name: "file",
				size: 1,
				type: "type"
			},
			length: 1
		};
		/*eslint-disable new-cap*/
		var oEvent = jQuery.Event("drop", {
			originalEvent: {
				dataTransfer: {
					files: oFileList
				}
			}
		});
		/*eslint-enable new-cap*/
		this.oUploadCollection.$("drag-drop-area").removeClass("sapMUCDragDropOverlayHide");
		//Act
		$DragDropArea.trigger(oEvent);
		//Assert
		assert.ok($DragDropArea.hasClass("sapMUCDragDropOverlayHide"), "The UploadCollection drag and drop overlay is hidden after drop");
		assert.equal(this.oUploadCollection._aFilesFromDragAndDropForPendingUpload.length, 1, "File is inserted in the array");
	});

	QUnit.skip("Dropping more than one file is not allowed when multiple is false", function(assert) {
		//Arrange
		this.oUploadCollection.setMultiple(false);
		sap.ui.getCore().applyChanges();
		sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		var oSpyOnChange = sinon.spy(this.oUploadCollection, "_onChange");
		var oStubMessageBox = sinon.stub(MessageBox, "error");
		var $DragDropArea = this.oUploadCollection.$("drag-drop-area");
		var oFileList = [
			{
				name: "file1"
			}, {
				name: "file2"
			}
		];
		/*eslint-disable new-cap*/
		var oEvent = jQuery.Event("drop", {
			originalEvent: {
				dataTransfer: {
					files: oFileList
				}
			}
		});
		/*eslint-enable new-cap*/
		//Act
		$DragDropArea.trigger(oEvent);
		//Assert
		assert.ok(oSpyOnChange.notCalled, "Files are not dropped in UploadCollection");
		assert.ok(oStubMessageBox.called, "Error messagebox is displayed");
		//Restore
		oStubMessageBox.restore();
	});

	QUnit.module("Delete PendingUpload Item", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection("pendingUploads", {
				instantUpload: false,
				multiple: true
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.skip("Check file list", function(assert) {
		assert.expect(4);
		var oHandleDeleteStub = sinon.stub(this.oUploadCollection, "_handleDelete");
		var oFile0 = {
			name: "Screenshot.ico"
		};
		var oFile1 = {
			name: "Notes.txt"
		};
		var oFile2 = {
			name: "Document.txt"
		};
		var oFile3 = {
			name: "Picture of a woman.png"
		};
		var aFiles = [oFile0];
		var oFileUploader = this.oUploadCollection._oFileUploader;
		oFileUploader.fireChange({
			files: aFiles,
			newValue: "Screenshot.ico"// needed to enable IE9 support and non failing tests
		});
		sap.ui.getCore().applyChanges();
		aFiles = [oFile1];
		oFileUploader.fireChange({
			files: aFiles,
			newValue: "Notes.txt"// needed to enable IE9 support and non failing tests
		});
		sap.ui.getCore().applyChanges();
		aFiles = [oFile2];
		oFileUploader.fireChange({
			files: aFiles,
			newValue: "Document.txt"// needed to enable IE9 support and non failing tests
		});
		sap.ui.getCore().applyChanges();
		aFiles = [oFile3];
		oFileUploader.fireChange({
			files: aFiles,
			newValue: "Picture of a woman.png"// needed to enable IE9 support and non failing tests
		});
		sap.ui.getCore().applyChanges();

		//check the call of _handleDelete
		var sDeleteButtonId = this.oUploadCollection.aItems[0].getId() + "-deleteButton";
		var oDeleteButton = sap.ui.getCore().byId(sDeleteButtonId);
		oDeleteButton.firePress();
		sap.ui.getCore().applyChanges();
		assert.ok(oHandleDeleteStub.called, "Function '_handleDelete' was called");

		//check the number of list items
		var iLengthBeforeDeletion = this.oUploadCollection.getItems().length;
		var sNameBeforeDeletion = this.oUploadCollection.getItems()[0].getFileName();
		assert.equal(iLengthBeforeDeletion, 4, "4 list items available");

		this.oUploadCollection._oItemToBeDeleted = {
			documentId: this.oUploadCollection.getItems()[0].getDocumentId(),
			_iLineNumber: 0
		};
		this.oUploadCollection._onCloseMessageBoxDeleteItem(MessageBox.Action.OK);
		sap.ui.getCore().applyChanges();

		//check the deleted item by comparison of the name before and after the deletion
		var sNameAfterDeletion = this.oUploadCollection.getItems()[0].getFileName();
		assert.notEqual(sNameBeforeDeletion, sNameAfterDeletion, "Item was deleted, checked by different names!");

		//check the deleted item by comparison of the number of list items before and after the deletion
		var iLengthAfterDeletion = this.oUploadCollection.getItems().length;
		assert.notEqual(iLengthBeforeDeletion, iLengthAfterDeletion, "Item was deleted, checked by different number of items!");
		oHandleDeleteStub.restore();
	});

	QUnit.skip("Delete PendingUpload item which comes from drag and drop", function(assert) {
		//Arrange
		sinon.stub(this.oUploadCollection, "_checkForFiles").returns(true);
		/*eslint-disable new-cap*/
		var oEvent = jQuery.Event("drop", {
			originalEvent: {
				dataTransfer: {
					files: [{ name: "file0.txt" }, { name: "file1.txt" }]
				}
			}
		});
		/*eslint-enable new-cap*/
		this.oUploadCollection.$("drag-drop-area").trigger(oEvent);
		//Act
		this.oUploadCollection.removeAggregation("items", this.oUploadCollection.getItems()[0]);
		//Assert
		assert.equal(this.oUploadCollection._aFilesFromDragAndDropForPendingUpload.length, 1, "File is deleted, only one file left after delete");
	});

	QUnit.module("Delete PendingUpload Item, multiple FileUploaderInstances", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection("pendingUploads", {
				instantUpload: false
			});
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oFile0 = {
				name: "file0"
			};
			this.oFile1 = {
				name: "file1"
			};
			this.oFile2 = {
				name: "file2"
			};
			this.oFile3 = {
				name: "file3"
			};
			this.oFile4 = {
				name: "file4"
			};
			this.simulateDeleteLastAddedItem = function() {
				this.oUploadCollection._oItemToBeDeleted = this.oUploadCollection.getItems()[0];
				this.oUploadCollection._oItemToBeDeleted._iLineNumber = 0;
				this.oUploadCollection._onCloseMessageBoxDeleteItem(MessageBox.Action.OK);
				sap.ui.getCore().applyChanges();
			};
			this.simulateFilePreselection = function(aFiles) {
				var oFileUploader = this.oUploadCollection._oFileUploader;
				oFileUploader.fireChange({
					files: aFiles,
					newValue: aFiles[0].name
				});
				sap.ui.getCore().applyChanges();
			};
			this.simulateXhrPreuploadProcessing = function(fileUploader, fileName, callOrder) {
				this.oUploadCollection._iUploadStartCallCounter = callOrder;
				fileUploader.fireUploadStart({
					"fileName": fileName,
					"requestHeaders": fileUploader.getHeaderParameters()
				});
			};
			this.abortStub = sinon.stub(FileUploader.prototype, "abort");
			this.encodeToAscii = function(value) {
				var sEncodedValue = "";
				for (var i = 0; i < value.length; i++) {
					sEncodedValue = sEncodedValue + value.charCodeAt(i);
				}
				return sEncodedValue;
			};
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
			this.abortStub.restore();
		}
	});

	QUnit.skip("Check if the item is properly saved to prevent further upload", function(assert) {
		var properCancellationHeaderParameterExists = false;
		this.simulateFilePreselection.bind(this)([this.oFile0]);

		this.simulateDeleteLastAddedItem.bind(this)();

		sap.ui.getCore().applyChanges();
		jQuery.each(this.oUploadCollection._aDeletedItemForPendingUpload, function(iIndex, item) {
			if (item.getAssociation("fileUploader") === this.oUploadCollection._aFileUploadersForPendingUpload[0].sId && item.getFileName() === this.oFile0.name) {
				properCancellationHeaderParameterExists = true;
			}
		}.bind(this));
		assert.equal(properCancellationHeaderParameterExists, true, "File is registered for cancellation of upload");
	});

	QUnit.skip("Checking if abort is properly called. 1 file, 1 instance of File Uploader", function(assert) {
		this.simulateFilePreselection.bind(this)([this.oFile0]);
		this.simulateDeleteLastAddedItem.bind(this)();

		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);

		assert.equal(this.abortStub.callCount, 1, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
		assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile0.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	});

	QUnit.skip("Checking if abort is properly called. 2 files, 1 instance of File Uploader", function(assert) {
		if (Device.browser.msie && Device.browser.version <= 9) {
			// In case of IE9, multiple selection is not possible, so nothing needs to be tested.
			assert.expect(0);
			return;
		}
		this.simulateFilePreselection.bind(this)([this.oFile0, this.oFile1]);
		this.simulateDeleteLastAddedItem.bind(this)();

		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile1.name, 1);

		assert.equal(this.abortStub.callCount, 1, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
		assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile1.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	});

	QUnit.skip("Checking if abort is properly called. 2 files, 2 instances of File Uploader, ", function(assert) {
		this.simulateFilePreselection.bind(this)([this.oFile0]);
		this.simulateFilePreselection.bind(this)([this.oFile1]);
		this.simulateDeleteLastAddedItem.bind(this)();

		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[1], this.oFile1.name, 0);

		assert.equal(this.abortStub.callCount, 1, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
		assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[1]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile1.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	});

	QUnit.skip("Checking if abort is properly called. 5 files, 2 instances of File Uploader, 2 deletions ", function(assert) {
		if (Device.browser.msie && Device.browser.version <= 9) {
			// In case of IE9, multiple selection is not possible, so nothing needs to be tested.
			assert.expect(0);
			return;
		}
		this.simulateFilePreselection.bind(this)([this.oFile0, this.oFile1, this.oFile2]);
		this.simulateDeleteLastAddedItem.bind(this)();
		this.simulateFilePreselection.bind(this)([this.oFile3, this.oFile4]);
		this.simulateDeleteLastAddedItem.bind(this)();

		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile1.name, 1);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile2.name, 2);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[1], this.oFile3.name, 0);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[1], this.oFile4.name, 1);

		assert.equal(this.abortStub.callCount, 2, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
		assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile2.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
		assert.equal(this.abortStub.getCall(1).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[1]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(1).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile4.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	});

	QUnit.skip("Checking if abort is properly called. 3 files with same names, 1 instance of File Uploader, 2 deletions ", function(assert) {
		if (Device.browser.msie && Device.browser.version <= 9) {
			// In case of IE9, multiple selection is not possible, so nothing needs to be tested.
			assert.expect(0);
			return;
		}
		this.simulateFilePreselection.bind(this)([this.oFile0, this.oFile0, this.oFile0]);
		this.simulateDeleteLastAddedItem.bind(this)();
		this.simulateDeleteLastAddedItem.bind(this)();

		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 0);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 1);
		this.simulateXhrPreuploadProcessing(this.oUploadCollection._aFileUploadersForPendingUpload[0], this.oFile0.name, 2);

		assert.equal(this.abortStub.callCount, 2, "Function 'FileUploader.prototype.abort' was called " + this.abortStub.callCount + " time(s)");
		assert.equal(this.abortStub.getCall(0).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(0).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile0.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
		assert.equal(this.abortStub.getCall(1).calledOn(this.oUploadCollection._aFileUploadersForPendingUpload[0]), true, "Function 'FileUploader.prototype.abort' was called on proper instance of FileUploader");
		assert.equal(this.abortStub.getCall(1).calledWithMatch(new RegExp(this.oUploadCollection._headerParamConst.fileNameRequestIdName), new RegExp("^" + this.encodeToAscii(this.oFile0.name) + ".*")), true, "Function 'FileUploader.prototype.abort' was called with proper arguments");
	});

	QUnit.module("PendingUpload uploadProgress Event", {
		beforeEach: function() {
			this.oUploadCollection = new UploadCollection("pendingUploads");
			sinon.spy(this.oUploadCollection, "_onUploadProgress");

			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.skip("onUploadProgress with instantUpload=false", function(assert) {
		//Arrange
		sinon.stub(this.oUploadCollection, "getInstantUpload").returns(false);

		//Act
		this.oUploadCollection._oFileUploader.fireUploadProgress();

		//Assert
		assert.strictEqual(this.oUploadCollection._onUploadProgress.callCount, 1, "Method _onUploadProgress has been called.");
	});

	QUnit.skip("onUploadProgress with instantUpload=true", function(assert) {
		//Arrange
		//Act
		this.oUploadCollection._oFileUploader.fireUploadProgress();

		//Assert
		assert.strictEqual(this.oUploadCollection._onUploadProgress.callCount, 1, "Method _onUploadProgress has been called.");
	});
});