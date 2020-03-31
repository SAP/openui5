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
					if (oFileUtils.isBlob(oFile.name)) {
						var sContent =  oFile.content.split(",")[1]; // erase the base64 prefix
						oFolder.file(oFile.name, sContent, { base64: true });
					} else {
						oFolder.file(oFile.name, oFile.content);
					}
				});

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
		},

		fetch: function (sUrl) {
			if (oFileUtils.isBlob(sUrl)) {
				return oFileUtils._fetchBlob(sUrl);
			}

			return new Promise(function (resolve, reject ) {
				jQuery.ajax(sUrl, {
					dataType: "text"
				}).done(function (oData) {
					resolve(oData);
				}).fail(function (jqXHR, sTextStatus, sError) {
					reject(sError);
				});
			});
		},

		isBlob: function (sName) {
			return (sName.match(/\.(jpeg|jpg|gif|png)$/) !== null);
		},

		_fetchBlob: function (sUrl) {
			return new Promise(function (resolve, reject) {
				jQuery.ajax(sUrl, {
					xhrFields: {
						responseType: "blob"
					}
				}).done(function (oData) {
					var oReader = new FileReader();
					oReader.readAsDataURL(oData);
					oReader.onloadend = function() {
						var sBase64data = oReader.result;
						resolve(sBase64data);
					};
				}).fail(function (jqXHR, sTextStatus, sError) {
					reject(sError);
				});
			});
		}
	};

	return oFileUtils;
});