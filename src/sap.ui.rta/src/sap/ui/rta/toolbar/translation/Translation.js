/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/rta/Utils",
	"sap/ui/model/json/JSONModel"
],
function(
	Fragment,
	Utils,
	JSONModel
) {
	"use strict";

	var oDialog;
	var oContext;

	var oTranslationModel = new JSONModel({
		sourceLanguage: "",
		downloadChangedTexts: false
	});

	function resetTranslationDialog() {
		oTranslationModel.setProperty("/sourceLanguage", "");
		oTranslationModel.setProperty("/downloadChangedTexts", false);
		return Promise.resolve(oDialog);
	}

	function createDownloadTranslationDialog() {
		return Fragment.load({
			name: "sap.ui.rta.toolbar.translation.DownloadTranslationDialog",
			id: oContext.getId() + "_download_translation_fragment",
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
			oDialog.setModel(oTranslationModel, "translation");
			oDialog.addStyleClass(Utils.getRtaStyleClassName());
			oContext.addDependent(oDialog);
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
	var Translation = {};

	Translation.showTranslationPopover = function (oEvent, oToolbar) {
		var oTranslationButton = oEvent.getSource();

		// Will reset the dialog information after RTA toolbar was closed and opened again
		if (oContext !== oToolbar) {
			oContext = oToolbar;
			oDialog = undefined;
		}

		if (!oContext.oTranslationPopoverPromise) {
			oContext.oTranslationPopoverPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.translation.TranslationPopover",
				id: oContext.getId() + "_translationPopoverDialog",
				controller: {
					openDownloadTranslationDialog: Translation.openDownloadTranslationDialog
				}
			}).then(function (oTranslationDialog) {
				oTranslationButton.addDependent(oTranslationDialog);
				return oTranslationDialog;
			});
		}

		return oContext.oTranslationPopoverPromise.then(function (oTranslationDialog) {
			if (!oTranslationDialog.isOpen()) {
				oTranslationDialog.openBy(oTranslationButton);
			} else {
				oTranslationDialog.close();
			}
		});
	};

	Translation.openDownloadTranslationDialog = function () {
		var oDialogPromise;

		if (oDialog) {
			oDialogPromise = resetTranslationDialog();
		} else {
			oDialogPromise = createDownloadTranslationDialog();
		}
		return oDialogPromise.then(function () {
			oContext.addDependent(oDialog);
			return oDialog.open();
		});
	};

	return Translation;
});
