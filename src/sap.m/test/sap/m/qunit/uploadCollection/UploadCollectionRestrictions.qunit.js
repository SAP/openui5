/*global QUnit*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/UploadCollection",
	"sap/m/UploadCollectionItem",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/UploadCollectionRenderer",
	"sap/m/ListItemBaseRenderer",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/m/ListSeparators",
	"sap/m/ListMode",
	"sap/ui/model/json/JSONModel",
	"test-resources/sap/m/qunit/uploadCollection/UploadCollectionTestUtils"
], function (jQuery, UploadCollection, UploadCollectionItem, Toolbar, Label, UploadCollectionRenderer,
			 ListItemBaseRenderer, Dialog, Device, ListSeparators, ListMode, JSONModel, TestUtils) {
	"use strict";

	function getData() {
		return {
			items: [
				{
					fileType: "jpg",
					fileName: "Screenshot.jpg",
					fileSize: 20,
					mimeType: "image/jpg"
				},
				{
					fileType: "mp4",
					fileName: "LookHowLongVideoNameThisIsYeah.mp4",
					fileSize: 40,
					mimeType: "video/mp4"
				}
			]
		};
	}

	function getItemRestrictionMask(oItem) {
		return (oItem._bFileTypeRestricted ? "1" : "0")
			+ (oItem._bFileNameLengthRestricted ? "1" : "0")
			+ (oItem._bFileSizeRestricted ? "1" : "0")
			+ (oItem._bMimeTypeRestricted ? "1" : "0");
	}

	QUnit.module("Restrictions", {
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

	QUnit.test("File type restriction and actual file type of an item are interdependent", function (assert) {
		assert.expect(11);

		var iEventCounter = 0,
			oJpgItem = this.oUploadCollection.getItems()[0],
			oMp4Item = this.oUploadCollection.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(true, "Event 'TypeMissmatch' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		this.oUploadCollection.attachTypeMissmatch(fnCheckEvent);
		assert.equal(oJpgItem._isRestricted() || oMp4Item._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		this.oUploadCollection.setFileType(["doc"]);
		assert.equal(oJpgItem._isRestricted() && oMp4Item._isRestricted(), true, "After changing file type restriction both files should now be restricted.");
		assert.equal(getItemRestrictionMask(oJpgItem), "1000", "Only 'file type' restriction should be flagged.");
		this.oUploadCollection.setFileType(["doc", "jpg"]);
		assert.equal(oJpgItem._isRestricted(), false, "After enlarging white list with JPG, picture file should again not be restricted.");
		assert.equal(oMp4Item._isRestricted(), true, "After enlarging white list with JPG, video file should still be restricted.");

		// Messing with type of the files
		oJpgItem.setFileName("NotAPictureAnymore.xls");
		assert.equal(oJpgItem._isRestricted(), true, "After moving its type out of white list file should be again restricted.");
		oMp4Item.setFileName("VideoTurnedDocument.doc");
		assert.equal(oMp4Item._isRestricted(), false, "After moving its type back to white list file should not be restricted.");

		// Final null
		this.oUploadCollection.setFileType(null);
		assert.equal(oJpgItem._isRestricted() || oMp4Item._isRestricted(), false, "After removing file type restriction both files should now be unrestricted.");

		this.oUploadCollection.detachTypeMissmatch(fnCheckEvent);
	});

	QUnit.test("File size restriction and actual file size of an item are interdependent", function (assert) {
		assert.expect(11);

		var iEventCounter = 0,
			oSmallerItem = this.oUploadCollection.getItems()[0],
			oBiggerItem = this.oUploadCollection.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(true, "Event 'FileSizeExceed' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		this.oUploadCollection.attachFileSizeExceed(fnCheckEvent);
		assert.equal(oSmallerItem._isRestricted() || oBiggerItem._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		this.oUploadCollection.setMaximumFileSize(10);
		assert.equal(oSmallerItem._isRestricted() && oBiggerItem._isRestricted(), true, "After changing size restriction both files should now be restricted.");
		assert.equal(getItemRestrictionMask(oSmallerItem), "0010", "Only 'file size' restriction should be flagged.");
		this.oUploadCollection.setMaximumFileSize(30);
		assert.equal(oSmallerItem._isRestricted(), false, "After rising size restriction enough smaller file should again not be restricted.");
		assert.equal(oBiggerItem._isRestricted(), true, "After rising size restriction bigger file should still be restricted.");

		// Messing with file size
		oSmallerItem.setFileSize(40);
		assert.equal(oSmallerItem._isRestricted(), true, "After rising its size file should be again restricted.");
		oBiggerItem.setFileSize(20);
		assert.equal(oBiggerItem._isRestricted(), false, "After lowering its size file should not be restricted.");

		// Final null
		this.oUploadCollection.setMaximumFileSize(null);
		assert.equal(oSmallerItem._isRestricted() || oBiggerItem._isRestricted(), false, "After removing file size restriction both files should now be unrestricted.");

		this.oUploadCollection.detachFileSizeExceed(fnCheckEvent);
	});

	QUnit.test("File name length restriction and actual file name length of an item are interdependent", function (assert) {
		assert.expect(11);

		var iEventCounter = 0,
			oShorterItem = this.oUploadCollection.getItems()[0],
			oLongerItem = this.oUploadCollection.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(true, "Event 'FilenameLengthExceed' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		this.oUploadCollection.attachFilenameLengthExceed(fnCheckEvent);
		assert.equal(oShorterItem._isRestricted() || oLongerItem._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		this.oUploadCollection.setMaximumFilenameLength(5);
		assert.equal(oShorterItem._isRestricted() && oLongerItem._isRestricted(), true, "After changing length restriction both files should now be restricted.");
		assert.equal(getItemRestrictionMask(oShorterItem), "0100", "Only 'file name length' restriction should be flagged.");
		this.oUploadCollection.setMaximumFilenameLength(20);
		assert.equal(oShorterItem._isRestricted(), false, "After rising length restriction enough shorter file should again not be restricted.");
		assert.equal(oLongerItem._isRestricted(), true, "After rising size restriction longer file should still be restricted.");

		// Messing with file name length
		oShorterItem.setFileName("012345678901234567890123456789.jpg");
		assert.equal(oShorterItem._isRestricted(), true, "After rising its size the formerly shorter file should be again restricted.");
		oLongerItem.setFileName("0123456789012345.mp4");
		assert.equal(oLongerItem._isRestricted(), false, "After lowering its size the formerly longer file should not be restricted.");

		// Final null
		this.oUploadCollection.setMaximumFilenameLength(null);
		assert.equal(oShorterItem._isRestricted() || oLongerItem._isRestricted(), false, "After removing file size restriction both files should now be unrestricted.");

		this.oUploadCollection.detachFilenameLengthExceed(fnCheckEvent);
	});

	QUnit.test("Mime type restriction and actual mime type of an item are interdependent", function (assert) {
		assert.expect(11);

		var iEventCounter = 0,
			oJpgItem = this.oUploadCollection.getItems()[0],
			oMp4Item = this.oUploadCollection.getItems()[1],
			fnCheckEvent = function () {
				assert.ok(true, "Event 'TypeMissmatch' should be fired 3 times after restriction introduced (this is " + (++iEventCounter) + ". time).");
			};

		this.oUploadCollection.attachTypeMissmatch(fnCheckEvent);
		assert.equal(oJpgItem._isRestricted() || oMp4Item._isRestricted(), false, "Files should not be restricted at the start.");

		// Messing with restriction
		this.oUploadCollection.setMimeType(["application/msword"]);
		assert.equal(oJpgItem._isRestricted() && oMp4Item._isRestricted(), true, "After changing mime type restriction both files should now be restricted.");
		assert.equal(getItemRestrictionMask(oJpgItem), "0001", "Only 'mime type' restriction should be flagged.");
		this.oUploadCollection.setMimeType(["application/msword", "image/jpg"]);
		assert.equal(oJpgItem._isRestricted(), false, "After enlarging white list with JPG, picture file should again not be restricted.");
		assert.equal(oMp4Item._isRestricted(), true, "After enlarging white list with JPG, video file should still be restricted.");

		// Messing with type of the files
		oJpgItem.setMimeType(["text/plain"]);
		assert.equal(oJpgItem._isRestricted(), true, "After moving its mime type out of white list file should be again restricted.");
		oMp4Item.setMimeType(["application/msword"]);
		assert.equal(oMp4Item._isRestricted(), false, "After moving its mime type back to white list file should not be restricted.");

		// Final null
		this.oUploadCollection.setMimeType(null);
		assert.equal(oJpgItem._isRestricted() || oMp4Item._isRestricted(), false, "After removing mime type restriction both files should now be unrestricted.");

		this.oUploadCollection.detachTypeMissmatch(fnCheckEvent);
	});
});