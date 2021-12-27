/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/rta/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/Layer",
	"sap/ui/core/util/File"
],
function(
	ManagedObject,
	Fragment,
	Utils,
	FlUtils,
	JSONModel,
	MessageBox,
	MessageToast,
	TranslationAPI,
	Layer,
	FileUtil
) {
	"use strict";

	function saveFiles(oEvent) {
		this._oTranslationModel.setProperty("/file", oEvent.getParameter("files")[0]);
	}

	function resetDownloadTranslationDialog() {
		this._oTranslationModel.setData(getTranslationModelData());
		return Promise.resolve(this._oDialogDownload);
	}

	function createDownloadTranslationDialog() {
		return Fragment.load({
			name: "sap.ui.rta.toolbar.translation.DownloadTranslationDialog",
			id: this.getToolbar().getId() + "_download_translation_fragment",
			controller: {
				onDownloadFile: function (oEvent) {
					var oModel = oEvent.getSource().getModel("translation");
					var sSourceLanguage = oModel.getProperty("/sourceLanguage");
					var sTargetLanguage = oModel.getProperty("/targetLanguage");
					var sFileName = sSourceLanguage + "_" + sTargetLanguage + "_" + "TranslationXLIFF";

					var mPropertyBag = {
						layer: Layer.CUSTOMER,
						sourceLanguage: sSourceLanguage,
						targetLanguage: sTargetLanguage,
						selector: this.getToolbar().getRtaInformation().rootControl
					};
					TranslationAPI.getTexts(mPropertyBag).then(function (translationTextsXML) {
						FileUtil.save(translationTextsXML, sFileName, "xml", "application/xml");
					}).catch(function (e) {
						MessageBox.error("Translation texts export failed: " + e);
					});
				}.bind(this),
				onCancelDownloadDialog: function () {
					this._oDialogDownload.close();
				}.bind(this)
			}
		}).then(function (oTranslationDialog) {
			this._oDialogDownload = oTranslationDialog;
			this._oDialogDownload.setModel(this._oTranslationModel, "translation");
			this.getToolbar().addDependent(this._oDialogDownload);
		}.bind(this));
	}

	function createUploadTranslationDialog() {
		var sUploadId = this.getToolbar().getId() + "_upload_translation_fragment";
		return Fragment.load({
			name: "sap.ui.rta.toolbar.translation.UploadTranslationDialog",
			id: sUploadId,
			controller: {
				onCancelUploadDialog: function () {
					this._oDialogUpload.close();
				}.bind(this),
				saveFiles: saveFiles.bind(this)
			}
		}).then(function (oTranslationDialog) {
			this._oDialogUpload = oTranslationDialog;
			this._oDialogUpload.setModel(this._oTranslationModel, "translation");
			this.getToolbar().addDependent(this._oDialogUpload);
			return sUploadId;
		}.bind(this));
	}

	function getTranslationModelData() {
		return Object.assign({}, {
			sourceLanguage: "",
			sourceLanguages: [],
			downloadChangedTexts: false,
			file: undefined
		});
	}

	/**
	 * Controller for the <code>sap.ui.rta.toolbar.translation.Translation</code> controls.
	 * Contains implementation of translation functionality.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.93
	 * @alias sap.ui.rta.toolbar.translation.Translation
	 */
	var Translation = ManagedObject.extend("sap.ui.rta.toolbar.translation.Translation", {
		metadata: {
			properties: {
				toolbar: {
					type: "sap.ui.rta.toolbar.Base"
				}
			}
		},
		constructor: function () {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this._oTranslationModel = new JSONModel(getTranslationModelData());
		}
	});

	Translation.prototype.showTranslationPopover = function (oEvent) {
		var oTranslationButton = oEvent.getSource();

		if (!this._oPopoverPromise) {
			this._oPopoverPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.translation.TranslationPopover",
				id: this.getToolbar().getId() + "_translationPopoverDialog",
				controller: {
					openDownloadTranslationDialog: this.openDownloadTranslationDialog.bind(this),
					openUploadTranslationDialog: this.openUploadTranslationDialog.bind(this)
				}
			}).then(function (oTranslationPopover) {
				this._oPopover = oTranslationPopover;
				oTranslationButton.addDependent(this._oPopover);
				return this._oPopover;
			}.bind(this));
		}

		return this._oPopoverPromise.then(function (oTranslationDialog) {
			if (!oTranslationDialog.isOpen()) {
				oTranslationDialog.openBy(oTranslationButton);
			} else {
				oTranslationDialog.close();
			}
		});
	};

	Translation.prototype.openDownloadTranslationDialog = function () {
		if (this._oDialogDownload) {
			this._oDialogPromise = resetDownloadTranslationDialog.call(this);
		} else {
			this._oDialogPromise = createDownloadTranslationDialog.call(this);
		}
		return this._oDialogPromise.then(function () {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				selector: this.getToolbar().getRtaInformation().rootControl
			};
			TranslationAPI.getSourceLanguages(mPropertyBag).then(function (oResponse) {
				var aSourceLanguages = oResponse.sourceLanguages;
				if (aSourceLanguages) {
					this._oTranslationModel.setProperty("/sourceLanguages", aSourceLanguages);
					this._oTranslationModel.setProperty("/sourceLanguage", aSourceLanguages[0] || "");
				}
				this.getToolbar().addDependent(this._oDialogDownload);
				this._oDialogDownload.open();
			}.bind(this))
			.catch(function (e) {
				MessageBox.error("Get translation source languages failed: " + e);
			});
			return this._oDialogDownload;
		}.bind(this));
	};

	Translation.prototype.openUploadTranslationDialog = function () {
		if (!this._oDialogUpload) {
			this._oDialogPromise = createUploadTranslationDialog.call(this);
		}
		return this._oDialogPromise.then(function () {
			this.getToolbar().addDependent(this._oDialogUpload);
			return this._oDialogUpload.open();
		}.bind(this));
	};

	return Translation;
});
