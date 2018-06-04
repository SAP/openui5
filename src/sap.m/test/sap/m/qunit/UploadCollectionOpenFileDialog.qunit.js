/*global QUnit,sinon*/

sap.ui.define("sap.m.qunit.UploadCollectionOpenFileDialog", [
	"jquery.sap.global",
	"sap/m/UploadCollection",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/Event",
	"sap/ui/Device",
	"sap/m/UploadCollectionItem",
	"sap/m/ObjectMarker"
], function (jQuery, UploadCollection, JSONModel, Event, Device, UploadCollectionItem, ObjectMarker) {
	"use strict";

	var oData = {
		"items": [
			{
				"contributor": "Susan Baker",
				"tooltip": "Susan Baker",
				"documentId": "64469d2f-b3c4-a517-20d6-f91ebf85b9da",
				"fileName": "Screenshot.jpg",
				"fileSize": 20,
				"mimeType": "image/jpg",
				"thumbnailUrl": "",
				"uploadedDate": "Date: 2014-07-30",
				"ariaLabelForPicture": "textForIconOfItemSusanBaker",
				"markers": [
					{
						"type": "Locked",
						"visibility": "IconAndText"
					}
				]
			}, {
				"contributor": "John Smith",
				"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcde",
				"fileName": "Notes.txt",
				"fileSize": 10,
				"mimeType": "text/plain",
				"thumbnailUrl": "",
				"uploadedDate": "2014-08-01",
				"url": "/pathToTheFile/Notes.txt",
				"markers": [
					{
						"type": "Locked",
						"visibility": "IconAndText"
					}
				]
			}, {
				"contributor": "J Edgar Hoover",
				"documentId": "5082cc4d-da9f-2835-2c0a-8100ed47bcdf",
				"enableEdit": false,
				"enableDelete": false,
				"fileName": "Document.txt",
				"fileSize": 15,
				"mimeType": "text/plain",
				"thumbnailUrl": "",
				"uploadedDate": "2014-09-01",
				"url": "/pathToTheFile/Document.txt"
			}, {
				"contributor": "Kate Brown",
				"documentId": "b68a7065-cc2a-2140-922d-e7528cd32172",
				"enableEdit": false,
				"enableDelete": false,
				"visibleEdit": "{visibleEdit}",
				"visibleDelete": "{visibleDelete}",
				"fileName": "Picture of a woman.png",
				"fileSize": 70,
				"mimeType": "image/png",
				"thumbnailUrl": "../images/Woman_04.png",
				"uploadedDate": "2014-07-25",
				"url": "/pathToTheFile/Woman_04.png",
				"ariaLabelForPicture": "textForImageOfItemKateBrown"
			}
		]
	};

	function createItemTemplate() {
		return new UploadCollectionItem({
			contributor: "{contributor}",
			tooltip: "{tooltip}",
			documentId: "{documentId}",
			enableEdit: "{enableEdit}",
			enableDelete: "{enableDelete}",
			fileName: "{fileName}",
			fileSize: "{fileSize}",
			mimeType: "{mimeType}",
			thumbnailUrl: "{thumbnailUrl}",
			uploadedDate: "{uploadedDate}",
			url: "{url}",
			ariaLabelForPicture: "{ariaLabelForPicture}",
			markers: {
				path: "markers",
				template: createMarkerTemplate(),
				templateShareable: false
			}
		});
	}

	function createMarkerTemplate() {
		return new ObjectMarker({
			type: "{type}",
			visibility: "{visibility}"
		});
	}

	QUnit.module("openFileDialog method", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			sinon.stub(jQuery.prototype, "trigger");
		},
		afterEach: function () {
			jQuery.prototype.trigger.restore();
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("The property multiple of the UploadCollection is set to true", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(true);
		var oItem = this.oUploadCollection.getItems()[0];
		sinon.spy(jQuery.sap.log, "warning");

		// Act
		var oReturnValue = this.oUploadCollection.openFileDialog(oItem);

		// Assert
		assert.ok(oReturnValue instanceof UploadCollection, "Function returns an instance of UploadCollection");
		assert.equal(jQuery.sap.log.warning.callCount, 1, "Warning log was generated correctly");
		assert.ok(jQuery.sap.log.warning.calledWith("Version Upload cannot be used in multiple upload mode"), "Warning log was generated with the correct message");

		// Restore
		jQuery.sap.log.warning.restore();
	});

	QUnit.test("Check trigger click event on FileUploader input element with item passed to openFileDialog", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItem = this.oUploadCollection.getItems()[0];

		// Act
		var oReturnValue = this.oUploadCollection.openFileDialog(oItem);
		var aInputField = this.oUploadCollection._oFileUploader.$().find("input[type=file]");

		// Assert
		assert.ok(oReturnValue instanceof UploadCollection, "Function returns an instance of UploadCollection");
		assert.notEqual(aInputField, 0, "There is an input element with type=file in the FileUploader");
		aInputField.one('click', function (oEvent) {
			assert.ok(true, "Click event was triggered.");
		});
		aInputField = aInputField.trigger("click");
		assert.notEqual(aInputField, 0, "The input file can trigger click event");
	});

	QUnit.test("Check trigger click event on FileUploader input element without an UploadCollectionItem passed to openFileDialog", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);

		// Act
		var oReturnValue = this.oUploadCollection.openFileDialog();
		var aInputField = this.oUploadCollection._oFileUploader.$().find("input[type=file]");

		// Assert
		assert.ok(oReturnValue instanceof UploadCollection, "Function returns an instance of UploadCollection");
		assert.notEqual(aInputField, 0, "There is an input element with type=file in the FileUploader");
		aInputField.one('click', function (oEvent) {
			assert.ok(true, "Click event was triggered.");
		});
		aInputField = aInputField.trigger("click");
		assert.notEqual(aInputField, 0, "The input file can trigger click event");
	});

	QUnit.test("In case of 'uploadNewVersion' use case check if oItemToUpdate is set correctly", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItem = this.oUploadCollection.getItems()[0];

		// Act
		this.oUploadCollection.openFileDialog(oItem);

		// Assert
		assert.ok(this.oUploadCollection._oItemToUpdate);
		assert.deepEqual(this.oUploadCollection._oItemToUpdate, oItem);
	});

	QUnit.module("openFileDialog Integration", {
		beforeEach: function () {
			this.oUploadCollection = new UploadCollection({
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadCollection.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.aFile = [{
				name: "file",
				size: 1,
				type: "type"
			}];
			this.sRequestId = "1";
		},
		afterEach: function () {
			this.oUploadCollection.destroy();
			this.oUploadCollection = null;
		}
	});

	QUnit.test("onChange event ends in rerendering without the item which is updated", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItemToUpdate = this.oUploadCollection.getItems()[0];
		this.oUploadCollection._oItemToUpdate = oItemToUpdate;
		// Act
		this.oUploadCollection._getFileUploader().fireChange({
			files: this.aFile,
			newValue: this.aFile[0].name
		});
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.deepEqual(this.oUploadCollection.aItems.length, 5, "The new file is in the UploadCollection.aItems");
		assert.deepEqual(this.oUploadCollection._oList.getItems().length, 4, "The new file is not in the aggregated list");
	});

	QUnit.test("onChange event test NumberOfAttachmentTitle", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItemToUpdate = this.oUploadCollection.getItems()[0];
		this.oUploadCollection._oItemToUpdate = oItemToUpdate;
		// Act
		this.oUploadCollection._getFileUploader().fireChange({
			files: this.aFile,
			newValue: this.aFile[0].name
		});
		this.oUploadCollection.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oUploadCollection._oNumberOfAttachmentsTitle.getText().indexOf("4") > -1, "Number of attachments is reduced in case of uploadingNewVersion");
	});

	QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the first case of uploadComplete", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);
		this.oUploadCollection._oItemToUpdate = this.oUploadCollection.getItems()[0];
		var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
		var aRequestHeaders = [{
			name: sHeaderName,
			value: this.sRequestId
		}];
		var oFileUploaderEventMock = {
			fileName: this.aFile[0].name,
			status: 200,
			headers: {
				sHeaderName: this.sRequestId
			}
		};

		// Act
		this.oUploadCollection._getFileUploader().fireChange({
			files: this.aFile,
			newValue: this.aFile[0].name
		});
		this.oUploadCollection._getFileUploader().fireUploadStart({
			fileName: this.aFile[0].name,
			requestHeaders: aRequestHeaders
		});
		this.oUploadCollection._onUploadComplete(new Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

		// Assert
		assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
	});

	QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the second case of uploadComplete", function (assert) {
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItemToUpdate = this.oUploadCollection.getItems()[0];
		this.oUploadCollection._oItemToUpdate = oItemToUpdate;
		var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
		var aRequestHeaders = [{
			name: sHeaderName,
			value: this.sRequestId
		}];
		var oFileUploaderEventMock = {
			fileName: this.aFile[0].name,
			status: 103,
			headers: {
				sHeaderName: this.sRequestId
			}
		};
		// Act
		this.oUploadCollection._getFileUploader().fireChange({
			files: this.aFile,
			newValue: this.aFile[0].name
		});
		this.oUploadCollection._getFileUploader().fireUploadStart({
			fileName: this.aFile[0].name,
			requestHeaders: aRequestHeaders
		});
		this.oUploadCollection._onUploadComplete(new Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

		// Assert
		assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
	});

	QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the third case of uploadComplete", function (assert) {
		// at present it is very hard to simulate IE9 in QUnits
		if (Device.browser.msie && Device.browser.version <= 9) {
			assert.expect(0);
			return;
		}
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItemToUpdate = this.oUploadCollection.getItems()[0];
		this.oUploadCollection._oItemToUpdate = oItemToUpdate;
		var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
		var aRequestHeaders = [{
			name: sHeaderName,
			value: this.sRequestId
		}];
		var oFileUploaderEventMock = {
			fileName: this.aFile[0].name,
			status: 200,
			headers: {
				sHeaderName: this.sRequestId
			},
			requestHeaders: aRequestHeaders
		};
		// Act
		this.oUploadCollection._getFileUploader().fireChange({
			files: this.aFile,
			newValue: this.aFile[0].name
		});
		this.oUploadCollection._getFileUploader().fireUploadStart({
			fileName: this.aFile[0].name,
			requestHeaders: aRequestHeaders
		});
		this.oUploadCollection._onUploadComplete(new Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

		// Assert
		assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
	});

	QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the fourth case of uploadComplete", function (assert) {
		// at present it is very hard to simulate IE9 in QUnits
		if (Device.browser.msie && Device.browser.version <= 9) {
			assert.expect(0);
			return;
		}
		// Arrange
		this.oUploadCollection.setMultiple(false);
		var oItemToUpdate = this.oUploadCollection.getItems()[0];
		this.oUploadCollection._oItemToUpdate = oItemToUpdate;
		var sHeaderName = this.oUploadCollection._headerParamConst.requestIdName;
		var aRequestHeaders = [{
			name: sHeaderName,
			value: this.sRequestId
		}];
		var oFileUploaderEventMock = {
			fileName: this.aFile[0].name,
			status: 103,
			headers: {
				sHeaderName: this.sRequestId
			},
			requestHeaders: aRequestHeaders
		};
		// Act
		this.oUploadCollection._getFileUploader().fireChange({
			files: this.aFile,
			newValue: this.aFile[0].name
		});
		this.oUploadCollection._getFileUploader().fireUploadStart({
			fileName: this.aFile[0].name,
			requestHeaders: aRequestHeaders
		});
		this.oUploadCollection._onUploadComplete(new Event("uploadComplete", this.oUploadCollection._getFileUploader(), oFileUploaderEventMock));

		// Assert
		assert.equal(this.oUploadCollection._oItemToUpdate, null, "_oItemToUpdate was set to null");
	});
});
