/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/demo/cardExplorer/Constants",
	"sap/ui/demo/cardExplorer/util/FileUtils",
	"sap/ui/thirdparty/jszip"
], function(Constants, FileUtils, JSZip) {
	"use strict";

	QUnit.module("FileUtils");

	QUnit.test("There is hidden .card folder in the generated archive when downloading card bundle", function (assert) {
		// Arrange
		var oDownloadFileStub = sinon.stub(FileUtils, "downloadFile"),
			oFolderSpy = sinon.spy(JSZip.prototype, "folder"),
			done = assert.async();

		oDownloadFileStub.callsFake(function () {
			// assert
			assert.ok(oFolderSpy.calledWith(".card"), "Hidden .card folder is added to the archive");

			// clean up
			oFolderSpy.restore();
			oDownloadFileStub.restore();
			done();
		});

		// act
		FileUtils.downloadFilesCompressed([], "folderName", Constants.CARD_BUNDLE_EXTENSION);
	});

	QUnit.test("Hidden .card folder is NOT added to the generated archive", function (assert) {
		// Arrange
		var oDownloadFileStub = sinon.stub(FileUtils, "downloadFile"),
			oFolderSpy = sinon.spy(JSZip.prototype, "folder"),
			done = assert.async();

		oDownloadFileStub.callsFake(function () {
			// assert
			assert.notOk(oFolderSpy.calledWith(".card"), "Hidden .card folder should NOT be added to the archive");

			// clean up
			oFolderSpy.restore();
			oDownloadFileStub.restore();
			done();
		});

		// act
		FileUtils.downloadFilesCompressed([], "folderName", "zip");
	});

});