/*!
 * ${copyright}
 */

/* global FormData */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/rta/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/Layer",
	"sap/ui/core/util/File"
], function(
	Log,
	ManagedObject,
	Element,
	Fragment,
	Lib,
	Utils,
	JSONModel,
	MessageBox,
	MessageToast,
	TranslationAPI,
	Layer,
	FileUtil
) {
	"use strict";

	function showError(vError) {
		var sErrorMessage = vError.userMessage || vError.stack || vError.message || vError.status || vError;
		var oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
		Log.error(sErrorMessage);
		var sMsg = `${oTextResources.getText("MSG_LREP_TRANSFER_ERROR")}\n${
			 oTextResources.getText("MSG_ERROR_REASON", [sErrorMessage])}`;
		MessageBox.error(sMsg, {
			styleClass: Utils.getRtaStyleClassName()
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
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			ManagedObject.prototype.constructor.apply(this, aArgs);
			this._oTranslationModel = new JSONModel(getInitialTranslationModelData());
		}
	});

	function downloadFile(oEvent) {
		var oModel = oEvent.getSource().getModel("translation");
		var sSourceLanguage = oModel.getProperty("/sourceLanguage");
		var sTargetLanguage = oModel.getProperty("/targetLanguage");
		var sFileName = `${sSourceLanguage}_${sTargetLanguage}_` + `TranslationXLIFF`;

		var mPropertyBag = {
			layer: Layer.CUSTOMER,
			sourceLanguage: sSourceLanguage,
			targetLanguage: sTargetLanguage,
			selector: this.getToolbar().getRtaInformation().rootControl
		};

		var oSavePromise = new Promise(function(resolve) {
			if (oModel.getProperty("/translationRelevantDirtyChangesExist")) {
				oSavePromise = this.getToolbar().fireSave({
					callback: resolve
				});
			} else {
				resolve();
			}
		}.bind(this));

		oSavePromise
		.then(TranslationAPI.getTexts.bind(undefined, mPropertyBag))
		.then(function(translationTextsXML) {
			FileUtil.save(translationTextsXML, sFileName, "xml", "application/xml");
			this._oDownloadDialog.close();
		}.bind(this)).catch(function(e) {
			showError(e);
		});
	}

	Translation.prototype._createDownloadTranslationDialog = function() {
		return Fragment.load({
			name: "sap.ui.rta.toolbar.translation.DownloadTranslationDialog",
			id: `${this.getToolbar().getId()}_download_translation_fragment`,
			controller: {
				onDownloadFile: downloadFile.bind(this),
				onCancelDownloadDialog: function() {
					this._oDownloadDialog.close();
				}.bind(this)
			}
		}).then(function(oDownloadDialog) {
			this._oDownloadDialog = oDownloadDialog;
			this._oDownloadDialog.setModel(this._oTranslationModel, "translation");
			this.getToolbar().addDependent(this._oDownloadDialog);
			return oDownloadDialog;
		}.bind(this));
	};

	Translation.prototype._createUploadTranslationDialog = function() {
		var sUploadId = `${this.getToolbar().getId()}_upload_translation_fragment`;
		return Fragment.load({
			name: "sap.ui.rta.toolbar.translation.UploadTranslationDialog",
			id: sUploadId,
			controller: {
				onCancelUploadDialog: function() {
					this._oUploadDialog.close();
				}.bind(this),
				formatUploadEnabled() {
					var oFileUploader = Element.getElementById(`${sUploadId}--fileUploader`);
					return oFileUploader.checkFileReadable();
				},
				saveFiles: function(oEvent) {
					this._oTranslationModel.setProperty("/file", oEvent.getParameter("files")[0]);
				}.bind(this),
				handleUploadPress: handleUploadPress.bind(this, sUploadId)
			}
		}).then(function(oUploadDialog) {
			this._oUploadDialog = oUploadDialog;
			this._oUploadDialog.setModel(this._oTranslationModel, "translation");
			this.getToolbar().addDependent(this._oUploadDialog);
			return this._oUploadDialog;
		}.bind(this));
	};

	function handleUploadPress(sUploadId) {
		var oFileUploader = Element.getElementById(`${sUploadId}--fileUploader`);
		oFileUploader.checkFileReadable().then(function() {
			if (this._oTranslationModel.getProperty("/file")) {
				var mPropertyBag = {
					layer: Layer.CUSTOMER,
					payload: new FormData()
				};
				mPropertyBag.payload.append("file", this._oTranslationModel.getProperty("/file"), oFileUploader.getValue());
				return TranslationAPI.uploadTranslationTexts(mPropertyBag).then(function() {
					var oTextResources = Lib.getResourceBundleFor("sap.ui.rta");
					var sMsg = oTextResources.getText("MSG_UPLOAD_TRANSLATION_SUCCESS");
					MessageToast.show(sMsg, {
						styleClass: Utils.getRtaStyleClassName()
					});
					this._oUploadDialog.close();
				}.bind(this)).catch(function(e) {
					showError(e);
				}).finally(oFileUploader.clear.bind(oFileUploader));
			}
		}.bind(this));
	}

	function getInitialTranslationModelData() {
		return {
			sourceLanguage: "",
			sourceLanguages: [],
			downloadChangedTexts: false,
			file: undefined
		};
	}

	Translation.prototype.openDownloadTranslationDialog = function(mPropertyBag) {
		var bHasTranslationRelevantDirtyChange = TranslationAPI.hasTranslationRelevantDirtyChanges(mPropertyBag);
		this._oTranslationModel.setProperty("/translationRelevantDirtyChangesExist", bHasTranslationRelevantDirtyChange);

		return TranslationAPI.getSourceLanguages(mPropertyBag)
		.then(function(aSourceLanguages) {
			if (aSourceLanguages) {
				this._oTranslationModel.setProperty("/sourceLanguages", aSourceLanguages);
				this._oTranslationModel.setProperty("/sourceLanguage", aSourceLanguages[0] || "");
			}
		}.bind(this))
		.then(function() {
			if (this._oDownloadDialogPromise) {
				this._oTranslationModel.setProperty("/targetLanguage", "");
			} else {
				this._oDownloadDialogPromise = this._createDownloadTranslationDialog();
			}
			return this._oDownloadDialogPromise;
		}.bind(this))
		.then(function(oDialog) {
			return oDialog.open();
		})
		.catch(function(vError) {
			showError(vError);
		});
	};

	Translation.prototype.openUploadTranslationDialog = function() {
		this._oUploadDialogPromise ||= this._createUploadTranslationDialog();
		return this._oUploadDialogPromise.then(function(oUploadDialog) {
			this.getToolbar().addDependent(oUploadDialog);
			return oUploadDialog.open();
		}.bind(this));
	};

	return Translation;
});
