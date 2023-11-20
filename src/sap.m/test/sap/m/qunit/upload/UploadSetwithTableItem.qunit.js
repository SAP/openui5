/*global QUnit, sinon*/
sap.ui.define([
	"sap/m/upload/UploadSetwithTable",
	"sap/m/upload/UploadSetwithTableItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"./UploadSetwithTableTestUtils"
], function (UploadSetwithTable, UploadSetwithTableItem, JSONModel, oCore, TestUtils) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileName: "Alice.mp4"
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
	QUnit.module("UploadSet Table Item general functionality", {
		beforeEach: function () {

			this.oUploadSetwithTableItem = TestUtils.createItemTemplate();
			this.oParent = {
				_getActiveUploader: function () {
					return {
						download: function () {
							return true;
						}
					};
				},
				_isRestricted: function () {
					return true;
				}
			};
			this.oUploadSetwithTable = new UploadSetwithTable("UploadSetwithTableItem", {
				items: {
					path: "/items",
					template: TestUtils.createItemTemplate(),
					templateShareable: false
				}
			}).setModel(new JSONModel(getData()));
			this.oUploadSetwithTable.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oUploadSetwithTableItem.destroy();
			this.oUploadSetwithTable.destroy();
			this.oUploadSetwithTable = null;
		}
	});

	QUnit.test("Test for UploadSet Table Item Instance Creation", function (assert) {
		//arrange
		assert.ok(this.oUploadSetwithTable, "Instance created successfully");
	});

	QUnit.test("UploadSet Table Item get/set file name", function (assert) {

		assert.equal(this.oUploadSetwithTable.getItems()[0].getFileName(), 'Alice.mp4', "getting uploadsetwithTable item's file name successfully");

		var oItem = this.oUploadSetwithTable.getItems()[0];
		oItem.setFileName("New_sample.pdf");
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getFileName(), "New_sample.pdf", "Getting/Setting the uploadsetwithTable item's name correctly");

	});

	QUnit.test("Getting/setting MIME type of the item", function (assert) {

		assert.equal(this.oUploadSetwithTable.getItems()[0].getMediaType(), '', "getting uploadsetwithTable item's media type successfully");

		var oItem = this.oUploadSetwithTable.getItems()[0];
		oItem.setMediaType("pdf");
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getMediaType(), "pdf", "Getting/setting uploadsetwithTable item's media type successfully");

	});

	QUnit.test("Getting/setting URL of item", function (assert) {

		assert.equal(this.oUploadSetwithTable.getItems()[0].getUrl(), '', "getting uploadsetwithTable item's URL successfully");

		var Item = this.oUploadSetwithTable.getItems()[0];
		Item.setUrl("uploadSetTableDemo/SampleFiles/Animation.gif");
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getUrl(), "uploadSetTableDemo/SampleFiles/Animation.gif", "getting/setting uploadsetwithTable item's URL successfully");

	});

	QUnit.test("Getting/setting upload_URL of item", function (assert) {
		assert.equal(this.oUploadSetwithTable.getItems()[0].getUploadUrl(), '', "getting uploadsetwithTable item's Upload_URL successfully");

		var Item = this.oUploadSetwithTable.getItems()[0];
		Item.setUploadUrl("uploadSetTableDemo/SampleFiles/Animation.gif");
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getUploadUrl(), "uploadSetTableDemo/SampleFiles/Animation.gif", "getting/setting uploadsetwithTable item's Upload_URL successfully");

	});

	QUnit.test("Getting Upload state of item", function (assert) {

		assert.equal(this.oUploadSetwithTable.getItems()[0].getUploadState(), "Complete", "getting uploadsetwithTable item's Upload state successfully");

	});

	QUnit.test("Getting/setting Preview status of item", function (assert) {

		assert.equal(this.oUploadSetwithTable.getItems()[0].getPreviewable(), true, "getting uploadsetwithTable item's Preview status successfully");

		var Item = this.oUploadSetwithTable.getItems()[0];
		Item.setPreviewable(false);
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getUploadUrl(), false, "getting/setting uploadsetwithTable item's Preview status successfully");

	});
	QUnit.test("Getting/setting filesize of item", function (assert) {
		assert.equal(this.oUploadSetwithTable.getItems()[0].getFileSize(), '', "getting uploadsetwithTable item's file size successfully");

		var Item = this.oUploadSetwithTable.getItems()[0];
		Item.setFileSize(166.55);
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getFileSize(), 166.55, "getting/setting uploadsetwithTable item's file size successfully");

	});

	QUnit.test("UploadSet Table Item get/set file name", function (assert) {
		var oItem = this.oUploadSetwithTable.getItems()[0];
		oCore.applyChanges();
		assert.equal(this.oUploadSetwithTable.getItems()[0].getFileName(), "Alice.mp4", "Getting/Setting the uploadsetwithTable item's name correctly");

		oItem.setFileName("sample.mp4");
		oCore.applyChanges();

		assert.equal(this.oUploadSetwithTable.getItems()[0].getFileName(), "sample.mp4", "Getting/Setting the uploadsetwithTable item's name correctly");
	});

	QUnit.test("Previewed Pressed File", function (assert) {
		var uploadSetItem = new UploadSetwithTableItem();
		var mockParent = {
			_openFilePreview: function () { }
		};
		var spy = sinon.spy(mockParent, "_openFilePreview");
		uploadSetItem.getParent = function () {
			return mockParent;
		};
		uploadSetItem.openPreview();
		assert.ok(spy.calledOnce, "_openFilePreview was called");
		assert.ok(spy.calledWith(uploadSetItem), "_openFilePreview was called with correct argument");
		spy.restore();
	});

	QUnit.test("UploadSetwithtableItem download functionality", function (assert) {
		this.oUploadSetwithTableItem.setParent(null);
		assert.strictEqual(this.oUploadSetwithTableItem.download(false), false, "download returns false without a parent association");
		this.oParent._getActiveUploader = function () {
			return null;
		};
		assert.strictEqual(this.oUploadSetwithTableItem.download(false), false, "download returns false with a parent association but without an active uploader");
	});

	QUnit.test("Test for itemisRestricted ", function (assert) {
		assert.ok(this.oParent._isRestricted(), "Item is restricted  if _isRestricted is true");
		this.oParent._isRestricted = function () {
			return false;
		};
		assert.notOk(this.oParent._isRestricted(), "Item is not restricted  if _isRestricted is false");
	});

	QUnit.test("getFileObject returns expected File Object", function (assert) {
		var expectedFileObject = new File([], "test.txt");
		this.oUploadSetwithTableItem._oFileObject = expectedFileObject;
		var result = this.oUploadSetwithTableItem.getFileObject();
		assert.strictEqual(result, expectedFileObject, "Return file object as expected");
	});

});