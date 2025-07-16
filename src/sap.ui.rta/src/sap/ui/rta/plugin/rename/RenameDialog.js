
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/util/validateText",
	"sap/ui/rta/Utils"
], function(
	ManagedObject,
	Element,
	Fragment,
	JSONModel,
	ResourceModel,
	validateText,
	RtaUtils
) {
	"use strict";

	/**
	 * @class Constructor for a new sap.ui.rta.plugin.rename.RenameDialog.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.136
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	const RenameDialog = ManagedObject.extend("sap.ui.rta.plugin.rename.RenameDialog");

	RenameDialog.prototype._createPopup = async function() {
		const oDialog = await Fragment.load({
			name: "sap.ui.rta.plugin.rename.RenameDialog",
			controller: this
		});
		oDialog.addStyleClass(RtaUtils.getRtaStyleClassName());
		this.oDialogModel = new JSONModel();
		oDialog.setModel(this.oDialogModel);
		const oI18nModel = new ResourceModel({ bundleName: "sap.ui.rta.messagebundle" });
		oDialog.setModel(oI18nModel, "i18n");

		return oDialog;
	};

	RenameDialog.prototype._openPopup = function() {
		this._oDialog.open();
		const oInput = Element.getElementById("sapUiRtaRenameDialog_input");
		oInput.getFocusDomRef().select();
		return new Promise((resolve) => {
			this._fnResolveAfterClose = resolve;
		});
	};

	function getCurrentText(mPropertyBag) {
		if (mPropertyBag.currentText) {
			return mPropertyBag.currentText;
		}
		const oOverlay = mPropertyBag.overlay;
		const oElement = oOverlay.getElement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const oEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, mPropertyBag.domRef);
		if (typeof mPropertyBag.action.getTextMutators === "function") {
			return mPropertyBag.action.getTextMutators(oElement).getText();
		}
		return oEditableControlDomRef.textContent;
	}

	/**
	 * Opens the rename dialog and handles the rename.
	 * @param {object} mPropertyBag - Properties for the rename dialog
	 * @param {object} mPropertyBag.action - Action definition used to retrieve validators
	 * @param {sap.ui.dt.ElementOverlay} mPropertyBag.overlay - Overlay of the element to be renamed
	 * @param {string} [mPropertyBag.currentText] - Current text of the element, if not provided it will be fetched via the designtime metadata
	 * @param {boolean} [mPropertyBag.acceptSameText] - If true, the save button is still enabled and will return the same text if no changes are made
	 * @param {object} [mPropertyBag.dialogSettings] - Additional settings to customize the dialog
	 * @param {string} [mPropertyBag.dialogSettings.title] - Title of the dialog
	 * @returns {Promise<string>} Promise that resolves with the new text after renaming or undefined if cancelled
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	RenameDialog.prototype.openDialogAndHandleRename = async function(mPropertyBag) {
		this._oDialog = await this._createPopup();
		const sCurrentText = getCurrentText(mPropertyBag);
		this.bAcceptSameText = mPropertyBag.acceptSameText || false;
		this.oDialogModel.setData({
			oldText: sCurrentText,
			newText: sCurrentText,
			dialogSettings: mPropertyBag.dialogSettings || {},
			isSaveEnabled: this.bAcceptSameText
		});
		this.oDialogModel.refresh(true);
		this.oAction = mPropertyBag.action;
		const sNewText = await this._openPopup();
		const oClosePromise = new Promise((resolve) => {
			this._oDialog.attachAfterClose(() => {
				this._oDialog.destroy();
				resolve();
			});
		});
		this._oDialog.close();
		await oClosePromise;
		return sNewText;
	};

	function checkValidRename() {
		const oModelData = this.oDialogModel.getData();
		const sNewText = oModelData.newText || "";
		const sOldText = oModelData.oldText || "";
		try {
			validateText(sNewText, sOldText, this.oAction);
			this.oDialogModel.setProperty("/validationError", undefined);
			this.oDialogModel.setProperty("/isSaveEnabled", true);
			return true;
		} catch (oError) {
			if (oError.message === "sameTextError") {
				// Do not show error message in case of same text
				this.oDialogModel.setProperty("/validationError", undefined);
				this.oDialogModel.setProperty("/isSaveEnabled", this.bAcceptSameText);
				return true;
			}
			this.oDialogModel.setProperty("/validationError", oError.message);
			this.oDialogModel.setProperty("/isSaveEnabled", false);
			return false;
		}
	}

	RenameDialog.prototype.onTextChange = function(oEvent) {
		const sNewText = oEvent.getParameter("value").trim("");
		this.oDialogModel.setProperty("/newText", sNewText.length ? sNewText : "\xa0");
		checkValidRename.call(this);
	};

	RenameDialog.prototype.onSave = function() {
		if (checkValidRename.call(this)) {
			this._fnResolveAfterClose(this.oDialogModel.getData().newText);
		}
	};

	RenameDialog.prototype.onCancel = function() {
		this._fnResolveAfterClose();
	};

	RenameDialog.prototype.destroy = function(...aArgs) {
		ManagedObject.prototype.destroy.apply(this, aArgs);
		if (this._oDialog) {
			this._oDialog.destroy();
		}
	};

	return RenameDialog;
});