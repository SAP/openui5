/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/rta/Utils",
	"sap/ui/model/Binding"
], function (
	ManagedObject,
	Fragment,
	Layer,
	ContextSharingAPI,
	Utils,
	Binding
) {
	"use strict";

	/**
	 * Controller for the <code>sap.ui.rta.toolbar.contextBased.SaveAsContextBasedAdaptation</code> controls.
	 * Contains implementation of context-based-adaptation functionality.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.106
	 * @alias sap.ui.rta.toolbar.contextBased.SaveAsContextBasedAdaptation
	 */
	var SaveAsContextBasedAdaptation = ManagedObject.extend("sap.ui.rta.toolbar.contextBased.SaveAsContextBasedAdaptation", {
		metadata: {
			properties: {
				toolbar: {
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		constructor: function () {
			ManagedObject.prototype.constructor.apply(this, arguments);
			this.oTextResources = this.getToolbar().getTextResources();
		}
	});

	SaveAsContextBasedAdaptation.prototype.openAddAdaptationDialog = function (sLayer) {
		if (!this._oAddAdaptationDialogPromise) {
			this._oAddAdaptationDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.contextBased.SaveAsContextBasedAdaptationDialog",
				id: this.getToolbar().getId() + "_fragment--sapUiRta_addAdaptationDialog",
				controller: {
					onAdaptationTitleChange: function (oEvent) {
						this.sAdaptationTitle = oEvent.getParameter("value");
						_validateAddAdaptationInput.call(this);
					}.bind(this),
					// TODO: implementation of save as context based adaptation
					onSaveAsContextBasedAdaptation: function () {
					},
					onCancelContextBasedAdaptationDialog: function () {
						_clearContexts.call(this);
						this._oAddAdaptationDialog.close();
					}.bind(this)
				}
			}).then(function (oDialog) {
				this._oAddAdaptationDialog = oDialog;
				oDialog.addStyleClass(Utils.getRtaStyleClassName());
				this.getToolbar().addDependent(this._oAddAdaptationDialog);
				createContextSharingComponent.call(this, sLayer);
			}.bind(this));
		} else {
			this.getToolbar().getControl("addAdaptationDialog--saveContextBasedAdaptation-title-input").setValue("");
		}
		return this._oAddAdaptationDialogPromise.then(function () {
			return this._oAddAdaptationDialog.open();
		}.bind(this));
	};

	function createContextSharingComponent(sLayer) {
		var mPropertyBag = { layer: sLayer || Layer.CUSTOMER, isAppContext: true };
		return ContextSharingAPI.createComponent(mPropertyBag).then(function (oContextSharingComponent) {
			this._oContextComponent = oContextSharingComponent;
			this._oContextComponentInstance = oContextSharingComponent.getComponentInstance();
			this._oContextComponentInstance.setSelectedContexts({ role: [] });
			this._oAddAdaptationDialog.addContent(this._oContextComponent);
			var oSelectedContextsModel = this._oContextComponentInstance.getSelectedContextsModel();
			this.oSelectedContextsBinding = new Binding(oSelectedContextsModel, "/", oSelectedContextsModel.getContext("/"));
			this.oSelectedContextsBinding.attachChange(onSelectedContextsChange.bind(this));
		}.bind(this));
	}

	function onSelectedContextsChange() {
		this.aSelectedRoles = this._oContextComponentInstance.getSelectedContexts().role;
		_validateAddAdaptationInput.call(this);
	}

	function _validateAddAdaptationInput() {
		if (getAdaptationTitle.call(this).length > 0 && getSelectedContexts.call(this).length > 0) {
			_enableSaveAsButton.call(this, true);
		} else {
			_enableSaveAsButton.call(this, false);
		}
	}

	function getAdaptationTitle() {
		return this.sAdaptationTitle || "";
	}

	function getSelectedContexts() {
		return this.aSelectedRoles || [];
	}

	function _enableSaveAsButton(bEnable) {
		this.getToolbar().getControl("addAdaptationDialog--saveContextBasedAdaptation-saveButton").setEnabled(bEnable);
	}

	function _clearContexts() {
		if (this._oContextComponentInstance) {
			if (this._oContextComponent.isDestroyed()) {
				return createContextSharingComponent.call(this);
			}
			this._oContextComponentInstance.setSelectedContexts({ role: [] });
			this._oAddAdaptationDialog.addContent(this._oContextComponent);
		}
	}
	return SaveAsContextBasedAdaptation;
});