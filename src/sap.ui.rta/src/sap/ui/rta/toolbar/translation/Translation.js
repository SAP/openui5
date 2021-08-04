/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/rta/Utils",
	"sap/ui/model/json/JSONModel"
], function(
	ManagedObject,
	Fragment,
	Utils,
	JSONModel
) {
	"use strict";

	var oDialog;
	var oPopover;

	function resetTranslationDialog() {
		this._oTranslationModel.setProperty("/sourceLanguage", "");
		this._oTranslationModel.setProperty("/downloadChangedTexts", false);
		return Promise.resolve(oDialog);
	}

	function createDownloadTranslationDialog() {
		return Fragment.load({
			name: "sap.ui.rta.toolbar.translation.DownloadTranslationDialog",
			id: this.getContext().getId() + "_download_translation_fragment",
			controller: {
				onDownloadFile: function () {
					oDialog.close();
				},
				onCancelDownloadDialog: function () {
					oDialog.close();
				}
			}
		}).then(function (oTranslationDialog) {
			oDialog = oTranslationDialog;
			oDialog.setModel(this._oTranslationModel, "translation");
			oDialog.addStyleClass(Utils.getRtaStyleClassName());
			this.getContext().addDependent(oDialog);
		}.bind(this));
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
				context: {
					type: "sap.ui.rta.toolbar.Base"
				}
			}
		},
		constructor: function() {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this._oTranslationModel = new JSONModel({
				sourceLanguage: "",
				downloadChangedTexts: false
			});
		}
	});

	Translation.prototype.exit = function() {
		if (this._oDialogPromise) {
			this._oDialogPromise.then(oDialog.destroy.bind(oDialog));
		}
		if (this._oPopoverPromise) {
			this._oPopoverPromise.then(oPopover.destroy.bind(oPopover));
		}
	};

	Translation.prototype.showTranslationPopover = function (oEvent) {
		var oTranslationButton = oEvent.getSource();

		if (!this._oPopoverPromise) {
			this._oPopoverPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.translation.TranslationPopover",
				id: this.getContext().getId() + "_translationPopoverDialog",
				controller: {
					openDownloadTranslationDialog: this.openDownloadTranslationDialog.bind(this)
				}
			}).then(function (oTranslationPopover) {
				oPopover = oTranslationPopover;
				oTranslationButton.addDependent(oTranslationPopover);
				return oTranslationPopover;
			});
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
		if (oDialog) {
			this._oDialogPromise = resetTranslationDialog.call(this);
		} else {
			this._oDialogPromise = createDownloadTranslationDialog.call(this);
		}
		return this._oDialogPromise.then(function () {
			this.getContext().addDependent(oDialog);
			return oDialog.open();
		}.bind(this));
	};

	return Translation;
});
