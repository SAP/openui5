sap.ui.define([
], function (
) {
	"use strict";

	var oFileUtils = {

		/**
		 * Lazy loads thirdparty jszip and saves files compressed.
		 *
		 * @param {object[]} aFiles Objects with file name and content.
		 * @param {string} sFolderName The name of the archive.
		 * @param {string} sExtension The extension of the archive.
		 */
		downloadFilesCompressed: function (aFiles, sFolderName, sExtension) {
			sap.ui.require([
				"sap/ui/thirdparty/jszip"
			], function (JSZip) {

				var oZipFile = new JSZip(),
					oFolder = oZipFile.folder(sFolderName);

				aFiles.forEach(function (oFile) {
					oFolder.file(oFile.name, oFile.content);
				});

				// File.save(oZipFile.generate({ type: "blob" }), sFolderName, sExtension, "application/zip");
				var blobData = oZipFile.generate({ type: "blob" });

				oFileUtils.downloadFile(blobData, sFolderName, sExtension, "application/zip");
			});
		},

		/**
		 * Lazy loads File util and saves file.
		 *
		 * @param {*} vData File content.
		 * @param {string} sFileName File name.
		 * @param {string} sFileExtension File extension.
		 * @param {string} sMimeType File mime-type.
		 */
		downloadFile: function (vData, sFileName, sFileExtension, sMimeType) {
			sap.ui.require([
				"sap/ui/core/util/File"
			], function (File) {
				File.save(vData, sFileName, sFileExtension, sMimeType);
			});
		}
	};

	return oFileUtils;
});