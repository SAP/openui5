/*global QUnit*/
sap.ui.define([
	"sap/m/upload/UploadSet",
	"sap/m/upload/UploadSetItem",
	"sap/ui/model/json/JSONModel",
	"./UploadSetTestUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (UploadSet, UploadSetItem, JSONModel, TestUtils, nextUIUpdate) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileType: "jpg",
					fileName: "Screenshot.jpg"
				},
				{
					fileType: "mp4",
					fileName: "LookHowLongVideoNameThisIsYeah.mp4"
				}
			]
		};
	}

	function getItemRestrictionMask(oItem) {
		return (oItem._bFileTypeRestricted ? "1" : "0")
			+ (oItem._bNameLengthRestricted ? "1" : "0")
			+ (oItem._bSizeRestricted ? "1" : "0")
			+ (oItem._bMediaTypeRestricted ? "1" : "0");
	}

	QUnit.module("UploadSet restrictions", {
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

	QUnit.test("File type restriction and actual file type of an item are interdependent", function (assert) {
		assert.expect(7);

		var iEventCounter = 0,
			oJpgItem = this.oUploadSet.getItems()[0],
			oMp4Item = this.oUploadSet.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(iEventCounter < 3, "Event 'TypeMissmatch' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		this.oUploadSet.attachFileTypeMismatch(fnCheckEvent);
		assert.equal(oJpgItem._isRestricted() || oMp4Item._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		this.oUploadSet.setFileTypes(["doc"]);
		assert.equal(oJpgItem._isRestricted() && oMp4Item._isRestricted(), false, "After changing file type restriction both files should not be restricted.");
		assert.equal(getItemRestrictionMask(oJpgItem), "0000", "No restriction should be flagged.");
		this.oUploadSet.setFileTypes(["doc", "jpg"]);
		assert.equal(oJpgItem._isRestricted(), false, "After enlarging include list with JPG, picture file should again not be restricted.");

		// Messing with type of the files
		oJpgItem.setFileName("NotAPictureAnymore.xls");
		assert.equal(oJpgItem._isRestricted(), true, "After moving its type out of include list file should be again restricted.");
		oMp4Item.setFileName("VideoTurnedDocument.doc");
		assert.equal(oMp4Item._isRestricted(), false, "After moving its type back to include list file should not be restricted.");

		this.oUploadSet.detachFileTypeMismatch(fnCheckEvent);
	});

	QUnit.test("File size restriction and actual file size of an item are interdependent", function (assert) {
		assert.expect(7);

		var iEventCounter = 0,
			oSmallerItem = this.oUploadSet.getItems()[0],
			oBiggerItem = this.oUploadSet.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(iEventCounter < 3, "Event 'FileSizeExceed' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		// Hack file sizes manualy
		oSmallerItem._setFileObject({
			size: UploadSetItem.MEGABYTE * 20
		});
		oBiggerItem._setFileObject({
			size: UploadSetItem.MEGABYTE * 40
		});

		this.oUploadSet.attachFileSizeExceeded(fnCheckEvent);
		assert.equal(oSmallerItem._isRestricted() || oBiggerItem._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		assert.equal(getItemRestrictionMask(oBiggerItem), "0000", "No restriction should be flagged.");
		this.oUploadSet.setMaxFileSize(30);
		assert.equal(oSmallerItem._isRestricted(), false, "After rising size restriction enough smaller file should again not be restricted.");
		assert.equal(oBiggerItem._isRestricted(), false, "After rising size restriction existing bigger file should not be restricted.");

		// Messing with file size
		oSmallerItem._setFileObject({
			size: UploadSetItem.MEGABYTE * 40
		});
		assert.equal(oSmallerItem._isRestricted(), true, "After rising its size file should be again restricted.");
		oBiggerItem._setFileObject({
			size: UploadSetItem.MEGABYTE * 20
		});
		assert.equal(oBiggerItem._isRestricted(), false, "After lowering its size file should not be restricted.");

		this.oUploadSet.detachFileSizeExceeded(fnCheckEvent);
	});

	QUnit.test("File name length restriction and actual file name length of an item are interdependent", function (assert) {
		assert.expect(7);

		var iEventCounter = 0,
			oShorterItem = this.oUploadSet.getItems()[0],
			oLongerItem = this.oUploadSet.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(iEventCounter < 3, "Event 'FilenameLengthExceed' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		this.oUploadSet.attachFileNameLengthExceeded(fnCheckEvent);
		assert.equal(oShorterItem._isRestricted() || oLongerItem._isRestricted(), false, "Files should not be restricted at the start.");

		assert.equal(getItemRestrictionMask(oShorterItem), "0000", "No restriction should be flagged.");
		this.oUploadSet.setMaxFileNameLength(20);
		assert.equal(oShorterItem._isRestricted(), false, "After rising length restriction enough shorter file should again not be restricted.");
		assert.equal(oLongerItem._isRestricted(), false, "After rising size restriction existing longer file should not be restricted.");

		// Messing with file name length
		oShorterItem.setFileName("012345678901234567890123456789.jpg");
		assert.equal(oShorterItem._isRestricted(), true, "After rising its size the formerly shorter file should be again restricted.");
		oLongerItem.setFileName("0123456789012345.mp4");
		assert.equal(oLongerItem._isRestricted(), false, "After lowering its size the formerly longer file should not be restricted.");

		this.oUploadSet.detachFileNameLengthExceeded(fnCheckEvent);
	});

	QUnit.test("Mime type restriction and actual mime type of an item are interdependent", function (assert) {
		assert.expect(7);

		var iEventCounter = 0,
			oJpgItem = this.oUploadSet.getItems()[0],
			oMp4Item = this.oUploadSet.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(iEventCounter < 3, "Event 'TypeMissmatch' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		oJpgItem._setFileObject({
			type: "image/jpg"
		});
		oMp4Item._setFileObject({
			type: "video/mp4"
		});

		this.oUploadSet.attachMediaTypeMismatch(fnCheckEvent);
		assert.equal(oJpgItem._isRestricted() || oMp4Item._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		assert.equal(getItemRestrictionMask(oJpgItem), "0000", "No restriction should be flagged.");
		this.oUploadSet.setMediaTypes(["application/msword", "image/jpg"]);
		assert.equal(oJpgItem._isRestricted(), false, "After enlarging include list with JPG, picture file should again not be restricted.");
		assert.equal(oMp4Item._isRestricted(), false, "After enlarging include list with JPG, existing video file should not be restricted.");

		// Messing with type of the files
		oJpgItem._setFileObject({
			type: "text/plain"
		});
		assert.equal(oJpgItem._isRestricted(), true, "After moving its mime type out of include list file should be again restricted.");
		oMp4Item._setFileObject({
			type: "application/msword"
		});
		assert.equal(oMp4Item._isRestricted(), false, "After moving its mime type back to include list file should not be restricted.");

		this.oUploadSet.detachMediaTypeMismatch(fnCheckEvent);
	});

	QUnit.test("Checking if isRestricted() is a Public Method", function (assert) {
		assert.expect(2);

		var oShorterItem = this.oUploadSet.getItems()[0],
			oLongerItem = this.oUploadSet.getItems()[1];

		this.oUploadSet.setMaxFileNameLength(20);
		oShorterItem.setFileName("0123456789.jpg");
		oLongerItem.setFileName("012345678901234567890123456789.mp4");
		assert.equal(oShorterItem.isRestricted(), false, "File with shorter name should not be restricted.");
		assert.equal(oLongerItem.isRestricted(), true, "File with longer name should be restricted.");
	});
});