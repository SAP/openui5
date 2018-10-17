/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], function (Element) {
	"use strict";

	/**
	 * Constructor for a new CollectionUploader.
	 *
	 * @class
	 * An abstract base class for uploading one or multiple files.
	 * @abstract
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @since 1.60
	 * @alias sap.m.CollectionUploader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CollectionUploader = Element.extend("sap.m.CollectionUploader", {
		metadata: {
			"abstract": true,
			publicMethods: [
				"uploadItem",
				"downloadItem",
				"terminateItem"
			]
		}
	});

	/**
	 * Starts the process of uploading the specified file.
	 *
	 * @param {UploadCollectionItem} oItem Item representing the file to be uploaded.
	 * @abstract
	 * @public
	 */
	CollectionUploader.prototype.uploadItem = function (oItem) {
		throw new Error("To be overridden in implementing class.");
	};

	/**
	 * Starts the process of downloading the specified file.
	 *
	 * @param {UploadCollectionItem} oItem Item representing the file to be downloaded.
	 * @param {boolean} bAskForLocation Whether to ask for download location target or not.
	 * @returns {boolean} <code>True</code> if the download has started successfully. <code>False</code> if the download couldn't be started.
	 * @abstract
	 * @public
	 */
	CollectionUploader.prototype.downloadItem = function (oItem, bAskForLocation) {
		throw new Error("To be overridden in implementing class.");
	};

	/**
	 * Attempts to terminate the process of uploading the specified file.
	 *
	 * @param {UploadCollectionItem} oItem Item representing the file whose ongoing upload process is to be terminated.
	 * @abstract
	 * @public
	 */
	CollectionUploader.prototype.terminateItem = function (oItem) {
		throw new Error("To be overridden in implementing class.");
	};

	return CollectionUploader;
});
