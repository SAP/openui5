/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/Log",
	"sap/base/strings/formatMessage",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/rta/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement"
], function(
	ManagedObject,
	Log,
	formatMessage,
	BusyIndicator,
	Fragment,
	coreLibrary,
	Layer,
	ContextBasedAdaptationsAPI,
	ContextSharingAPI,
	Utils,
	JSONModel,
	Measurement
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Controller for the <code>sap.ui.rta.toolbar.contextBased.SaveAsAdaptation</code> controls.
	 * Contains implementation of context-based-adaptation functionality.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.110
	 * @alias sap.ui.rta.toolbar.contextBased.SaveAsAdaptation
	 */
	var SaveAsAdaptation = ManagedObject.extend("sap.ui.rta.toolbar.contextBased.SaveAsAdaptation", {
		metadata: {
			properties: {
				toolbar: {
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		constructor: function() {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this.oTextResources = this.getToolbar().getTextResources();
		}
	});

	SaveAsAdaptation.prototype.openAddAdaptationDialog = function(sLayer, bIsEditMode) {
		this._bIsEditMode = bIsEditMode;
		if (!this._oAddAdaptationDialogPromise) {
			this._oAddAdaptationDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.contextBased.SaveAsAdaptationDialog",
				id: `${this.getToolbar().getId()}_fragment--sapUiRta_addAdaptationDialog`,
				controller: {
					onAdaptationTitleChange: onAdaptationTitleChange.bind(this),
					onSaveAsAdaptation: onSaveAsAdaptation.bind(this),
					onCancelAdaptationDialog: onCancelAdaptationDialog.bind(this),
					onPriorityChange: onPriorityChange.bind(this)
				}
			}).then(function(oDialog) {
				this._oAddAdaptationDialog = oDialog;
				this._oAddAdaptationDialog.attachBeforeClose(clearComponent.bind(this));
				oDialog.addStyleClass(Utils.getRtaStyleClassName());
				this.getToolbar().addDependent(this._oAddAdaptationDialog);
				this.oDialogModel = new JSONModel();
				this._oAddAdaptationDialog.setModel(this.oDialogModel, "dialogModel");
			}.bind(this));
		} else {
			var oInputField = this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-title-input");
			oInputField.setValue("");
			oInputField.setValueState(ValueState.None);
		}
		return this._oAddAdaptationDialogPromise.then(function() {
			return createContextSharingComponent.call(this, sLayer);
		}.bind(this)).then(function() {
			var oRtaInformation = this.getToolbar().getRtaInformation();
			this.oAdaptationsModel = ContextBasedAdaptationsAPI.getAdaptationsModel({ control: oRtaInformation.rootControl, layer: oRtaInformation.flexSettings.layer });
			if (bIsEditMode) {
				enableEditMode.call(this);
			} else {
				this.oDialogModel.setProperty("/title", this.oTextResources.getText("SAC_DIALOG_HEADER"));
				this.oDialogModel.refresh(true);
			}
			return openDialog.call(this);
		}.bind(this));
	};

	// ------ open dialog -----
	function openDialog() {
		formatPriorityText.call(this, this.oAdaptationsModel.getProperty("/adaptations"));
		return this._oAddAdaptationDialog.open();
	}

	// ------ enables dialog for editing -----
	function enableEditMode() {
		this.oDialogModel.setProperty("/title", this.oTextResources.getText("EAC_DIALOG_HEADER"));
		this.oDialogModel.refresh(true);
		var oDisplayedAdaptation = this.oAdaptationsModel.getProperty("/displayedAdaptation");
		this._mEditProperties = {
			adaptationId: oDisplayedAdaptation.id,
			title: oDisplayedAdaptation.title,
			priority: oDisplayedAdaptation.rank - 1,
			roles: oDisplayedAdaptation.contexts.role
		};
		this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-title-input").setValue(this._mEditProperties.title);
		this._oContextComponentInstance.setSelectedContexts({role: this._mEditProperties.roles});
	}

	// ------ formatting ------
	function formatPriorityText(aAdaptations) {
		var aItems = [{ key: "0", title: this.oTextResources.getText("TXT_SELECT_FIRST_PRIO") }];
		var sPriorityTextTemplate = this.oTextResources.getText("TXT_SELECT_PRIO");
		var iCurrentPriority = this._mEditProperties ? this._mEditProperties.priority : undefined;
		// create the data for the priority selection model
		// selected is the currently or by default selected priority
		// priority is the array with all available priorities together with the displayed text defined in text template
		aAdaptations.forEach(function(oAdaptation, iIndex) {
			if (iCurrentPriority !== undefined && iCurrentPriority === iIndex) {
				return;
			}
			var iKey = aItems.length;
			aItems.push({
				key: iKey.toString(),
				title: formatMessage(sPriorityTextTemplate, [oAdaptation.title, iKey + 1])
			});
		});
		this.oDialogModel.setProperty("/selected", iCurrentPriority ? aItems[iCurrentPriority].key : aItems[0].key);
		this.oDialogModel.setProperty("/priority", aItems);
	}

	function onAdaptationTitleChange() {
		checkAdaptationsNameConstraints.call(this);
		enableSaveAsButton.call(this);
	}

	function onContextRoleChange() {
		enableSaveAsButton.call(this);
	}

	function onCancelAdaptationDialog() {
		this._oAddAdaptationDialog.close();
	}

	function onSaveAsAdaptation() {
		var oContextBasedAdaptation = {};
		oContextBasedAdaptation.title = getAdaptationTitle.call(this);
		oContextBasedAdaptation.contexts = this._oContextComponentInstance.getSelectedContexts();
		oContextBasedAdaptation.priority = getAdaptationPriority.call(this);
		var oRtaInformation = this.getToolbar().getRtaInformation();
		if (this._bIsEditMode) {
			Measurement.start("onCBAUpdateAdaptation", "Measurement of updating a context-based adaptation");
			oContextBasedAdaptation.adaptationId = this._mEditProperties.adaptationId;
			ContextBasedAdaptationsAPI.update({
				control: oRtaInformation.rootControl,
				layer: oRtaInformation.flexSettings.layer,
				contextBasedAdaptation: oContextBasedAdaptation,
				adaptationId: this._mEditProperties.adaptationId
			})
			.then(function(oContextBasedAdaptation, oResponse) {
				if (oResponse.status === 200) {
					this.oAdaptationsModel.updateAdaptationContent(oContextBasedAdaptation);
					Measurement.end("onCBAUpdateAdaptation");
					Measurement.getActive() && Log.info(`onCBAUpdateAdaptation: ${Measurement.getMeasurement("onCBAUpdateAdaptation").time} ms`);
				}
			}.bind(this, oContextBasedAdaptation))
			.catch(function(oError) {
				Log.error(oError.stack);
				var sMessage = "MSG_LREP_TRANSFER_ERROR";
				var oOptions = { titleKey: "EAC_DIALOG_HEADER" };
				oOptions.details = oError.userMessage;
				Utils.showMessageBox("error", sMessage, oOptions);
			});
		} else {
			Measurement.start("onCBASaveAsAdaptation", "Measurement of saving a context-based adaptation");
			BusyIndicator.show();
			ContextBasedAdaptationsAPI.create({
				control: oRtaInformation.rootControl,
				layer: oRtaInformation.flexSettings.layer,
				contextBasedAdaptation: oContextBasedAdaptation
			}).then(function() {
				BusyIndicator.hide();
				this.getToolbar().fireEvent("switchAdaptation", {adaptationId: oContextBasedAdaptation.id, trigger: "SaveAs"});
				Measurement.end("onCBASaveAsAdaptation");
				Measurement.getActive() && Log.info(`onCBASaveAsAdaptation: ${Measurement.getMeasurement("onCBASaveAsAdaptation").time} ms`);
			}.bind(this)).catch(function(oError) {
				BusyIndicator.hide();
				Log.error(oError.stack);
				var sMessage = "MSG_LREP_TRANSFER_ERROR";
				var oOptions = { titleKey: "SAC_DIALOG_HEADER" };
				oOptions.details = oError.userMessage;
				Utils.showMessageBox("error", sMessage, oOptions);
			});
		}
		this._oAddAdaptationDialog.close();
	}

	function onPriorityChange(oEvent) {
		enableSaveAsButton.call(this);
		this.sPriority = oEvent.getParameters().selectedItem.getProperty("key");
	}

	function checkAdaptationsNameConstraints() {
		// check for empty adaptations title
		if (this._oAddAdaptationDialog && this._oAddAdaptationDialog.isOpen()) {
			var oInputField = this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-title-input");
			var iAdaptationTitleLength = oInputField.getValue().trim().length;
			var iMaxTitleLength = 100;
			if (iAdaptationTitleLength === 0) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this.oTextResources.getText("TXT_CTX_ERROR_EMPTY_TITLE"));
			} else if (iAdaptationTitleLength > iMaxTitleLength) {
				oInputField.setValueState(ValueState.Error);
				oInputField.setValueStateText(this.oTextResources.getText("TXT_CTX_ERROR_MAX_LEN", [
					iMaxTitleLength
				]));
			} else if (iAdaptationTitleLength > 0) {
				// check for duplicates
				var iIndexOfDuplicate = this.oAdaptationsModel.getProperty("/adaptations").findIndex(function(adaptation) {
					if (adaptation.title.trim().toLowerCase() === oInputField.getValue().trim().toLowerCase()) {
						// allow matching in case of edit mode with already used title
						if (this._mEditProperties && this._mEditProperties.title.toLowerCase() === oInputField.getValue().toLowerCase()) {
							return false;
						}
						return true;
					}
					return false;
				}.bind(this));
				if (iIndexOfDuplicate > -1) {
					oInputField.setValueState(ValueState.Error);
					oInputField.setValueStateText(this.oTextResources.getText("TXT_CTX_ERROR_DUPLICATE_TITLE"));
				} else {
					oInputField.setValueState(ValueState.None);
					oInputField.setValueStateText(null);
				}
			}
		}
	}

	function createContextSharingComponent(sLayer) {
		var mPropertyBag = { layer: sLayer || Layer.CUSTOMER };
		return ContextSharingAPI.createComponent(mPropertyBag).then(function(oContextSharingComponent) {
			this._oContextComponent = oContextSharingComponent;
			this._oContextComponentInstance = oContextSharingComponent.getComponentInstance();
			this._oContextComponentInstance.resetSelectedContexts();
			this._oAddAdaptationDialog.addContent(this._oContextComponent);
			var oContextsList = sap.ui.getCore().byId("contextSharing---ContextVisibility--selectedContextsList");
			oContextsList.attachUpdateFinished(onContextRoleChange.bind(this));
			oContextsList.getHeaderToolbar().getContent()[0].setRequired(true);
			this._oContextComponentInstance.setEmptyListTextWithAdvice();
			this._oContextComponentInstance.showMessageStrip(false);
		}.bind(this));
	}

	function getAdaptationTitle() {
		var oInputField = this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-title-input");
		return oInputField ? oInputField.getValue().trim() : "";
	}

	function getAdaptationPriority() {
		if (this._bIsEditMode && !this.sPriority) {
			this.sPriority = this.oDialogModel.getProperty("/selected");
		}
		return Number(this.sPriority) || 0;
	}

	function enableSaveAsButton() {
		var oInputField = this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-title-input");
		var bEnable;
		var bRolesSelectedAndValidTitle = this._oContextComponentInstance.getSelectedContexts().role.length > 0
			&& oInputField.getValueState() === ValueState.None
			&& oInputField.getValue().length > 0;
		if (this._bIsEditMode && this._mEditProperties && this.oDialogModel) {
			bEnable = bRolesSelectedAndValidTitle
				// check that some of the properties title, priority, roles have been changed
				&& (oInputField.getValue() !== this._mEditProperties.title
				|| this.oDialogModel.getProperty("/selected") !== (this._mEditProperties.priority).toString()
				|| this._oContextComponentInstance.getSelectedContexts().role.length !== this._mEditProperties.roles.length
				|| !this._oContextComponentInstance.getSelectedContexts().role.every(function(sRole) {
					return this._mEditProperties.roles.indexOf(sRole) > -1;
				}.bind(this)));
		} else {
			bEnable = bRolesSelectedAndValidTitle;
		}
		this.getToolbar().getControl("addAdaptationDialog--saveAdaptation-saveButton").setEnabled(bEnable);
	}

	function clearComponent() {
		this._mEditProperties = undefined;
		this._oAddAdaptationDialog.removeContent(this._oContextComponent);
		this._oContextComponentInstance.destroy();
		this._oContextComponent.destroy();
	}

	return SaveAsAdaptation;
});