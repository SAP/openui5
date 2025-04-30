
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

	RenameDialog.prototype.openDialogAndHandleRename = async function(mPropertyBag) {
		this._oDialog = await this._createPopup();
		const oOverlay = mPropertyBag.overlay;
		const oElement = oOverlay.getElement();
		const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		const oEditableControlDomRef = oDesignTimeMetadata.getAssociatedDomRef(oElement, mPropertyBag.domRef);
		const sCurrentText = typeof mPropertyBag.action.getTextMutators === "function"
			? mPropertyBag.action.getTextMutators(oElement).getText()
			: oEditableControlDomRef.textContent;
		this.oDialogModel.setData({
			oldText: sCurrentText,
			newText: sCurrentText
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

	const VALIDATION_STATES = {
		VALID: "VALID",
		INVALID: "INVALID",
		SAME_TEXT: "SAME_TEXT"
	};

	RenameDialog.prototype.checkValidRename = function() {
		const oModelData = this.oDialogModel.getData();
		const sNewText = oModelData.newText || "";
		const sOldText = oModelData.oldText || "";
		try {
			validateText(sNewText, sOldText, this.oAction);
			this.oDialogModel.setProperty("/validationError", undefined);
			return VALIDATION_STATES.VALID;
		} catch (oError) {
			if (oError.message === "sameTextError") {
				// Do not show error message in case of same text
				this.oDialogModel.setProperty("/validationError", undefined);
				return VALIDATION_STATES.SAME_TEXT;
			}
			this.oDialogModel.setProperty("/validationError", oError.message);
			this.oDialogModel.setProperty("/isValidRename", false);
			return VALIDATION_STATES.INVALID;
		}
	};

	RenameDialog.prototype.onTextChange = function(oEvent) {
		const sNewText = oEvent.getParameter("value").trim("");
		this.oDialogModel.setProperty("/newText", sNewText.length ? sNewText : "\xa0");
		this.checkValidRename();
	};

	RenameDialog.prototype.onSave = function() {
		if (this.checkValidRename() === VALIDATION_STATES.VALID) {
			this._fnResolveAfterClose(this.oDialogModel.getData().newText);
		} else if (this.checkValidRename() === VALIDATION_STATES.SAME_TEXT) {
			this._fnResolveAfterClose();
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