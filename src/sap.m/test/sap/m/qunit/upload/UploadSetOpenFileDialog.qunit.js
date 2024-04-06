/*global QUnit */

sap.ui.define("sap.m.qunit.UploadSetOpenFileDialog", [
	"sap/ui/thirdparty/jquery",
	"sap/m/upload/UploadSet",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/UploadSetItem",
	"sap/m/ObjectMarker",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (jQuery, UploadSet, JSONModel, UploadSetItem, ObjectMarker, Log, nextUIUpdate) {
	"use strict";

	var IMAGE_PATH = "test-resources/sap/m/images/";

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
				"thumbnailUrl": IMAGE_PATH + "Woman_04.png",
				"uploadedDate": "2014-07-25",
				"url": "/pathToTheFile/Woman_04.png",
				"ariaLabelForPicture": "textForImageOfItemKateBrown"
			}
		]
	};

	function createItemTemplate() {
		return new UploadSetItem({
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

	QUnit.module("UploadSet openFileDialog method", {
		beforeEach: async function () {
			this.oUploadSet = new UploadSet({
				instantUpload: true,
				items: {
					path: "/items",
					template: createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(oData));
			this.oUploadSet.placeAt("qunit-fixture");
			await nextUIUpdate();
			this.stub(jQuery.prototype, "trigger");
		},
		afterEach: function () {
			this.oUploadSet.destroy();
			this.oUploadSet = null;
		}
	});

	QUnit.test("The property multiple of the UploadSet is set to true", function (assert) {
		// Arrange
		this.oUploadSet.setMultiple(true);
		var oItem = this.oUploadSet.getItems()[0];
		this.spy(Log, "warning");

		// Act
		var oReturnValue = this.oUploadSet.openFileDialog(oItem);

		// Assert
		assert.ok(oReturnValue instanceof UploadSet, "Function returns an instance of UploadSet");
		assert.equal(Log.warning.callCount, 1, "Warning log was generated correctly");
		assert.ok(Log.warning.calledWith("Version Upload cannot be used in multiple upload mode"), "Warning log was generated with the correct message");
	});

	QUnit.test("Check trigger click event on FileUploader input element with item passed to openFileDialog", function (assert) {
		// Arrange
		this.oUploadSet.setMultiple(false);
		var oItem = this.oUploadSet.getItems()[0];

		// Act
		var oReturnValue = this.oUploadSet.openFileDialog(oItem);
		var aInputField = this.oUploadSet._oFileUploader.$().find("input[type=file]");

		// Assert
		assert.ok(oReturnValue instanceof UploadSet, "Function returns an instance of UploadSet");
		assert.notEqual(aInputField, 0, "There is an input element with type=file in the FileUploader");
		aInputField.one('click', function (oEvent) {
			assert.ok(true, "Click event was triggered.");
		});
		aInputField = aInputField.trigger("click");
		assert.notEqual(aInputField, 0, "The input file can trigger click event");
	});

	QUnit.test("Check trigger click event on FileUploader input element without an UploadSetItem passed to openFileDialog", function (assert) {
		// Arrange
		this.oUploadSet.setMultiple(false);

		// Act
		var oReturnValue = this.oUploadSet.openFileDialog();
		var aInputField = this.oUploadSet._oFileUploader.$().find("input[type=file]");

		// Assert
		assert.ok(oReturnValue instanceof UploadSet, "Function returns an instance of UploadSet");
		assert.notEqual(aInputField, 0, "There is an input element with type=file in the FileUploader");
		aInputField.one('click', function (oEvent) {
			assert.ok(true, "Click event was triggered.");
		});
		aInputField = aInputField.trigger("click");
		assert.notEqual(aInputField, 0, "The input file can trigger click event");
	});

	QUnit.test("In case of 'uploadNewVersion' use case check if oItemToUpdate is set correctly", function (assert) {
		// Arrange
		this.oUploadSet.setMultiple(false);
		var oItem = this.oUploadSet.getItems()[0];

		// Act
		this.oUploadSet.openFileDialog(oItem);

		// Assert
		assert.ok(this.oUploadSet._oItemToUpdate);
		assert.deepEqual(this.oUploadSet._oItemToUpdate, oItem);
	});

	QUnit.test("onUploadComplete event test that _oItemToUpdate is set to null in the case of uploadComplete", async function (assert) {
		// Arrange
		var oItem = this.oUploadSet.getItems()[0];
		oItem.setUploadState("Ready");
		this.oUploadSet.placeAt("qunit-fixture");
		await nextUIUpdate();

		//Act
		this.oUploadSet.uploadItem(oItem);

		//Assert
		assert.equal(this.oUploadSet._oItemToUpdate, null, "_oItemToUpdate was set to null");
	});
});
