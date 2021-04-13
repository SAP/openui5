/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/m/MessageStrip",
	"sap/ui/core/MessageType"
],
function (
	Controller,
	Fragment,
	WriteStorage,
	Layer,
	MessageStrip,
	MessageType
) {
	"use strict";

	function buildQueryParameterMap(mConfig) {
		var mDefaultValues = {layer: Layer.CUSTOMER, type: "role"};
		return Object.assign({}, mDefaultValues, mConfig);
	}

	function assignDescriptionsToSelectedRoles(oSelectedRoles) {
		var mPropertyBag = {layer: Layer.CUSTOMER, flexObjects: oSelectedRoles};
		return WriteStorage.loadContextDescriptions(mPropertyBag).then(function(oResponse) {
			if (oResponse.role && oResponse.role.length === oSelectedRoles.role.length) {
				this.oSelectedContextsModel.setProperty("/selected", oResponse.role);
			}
		}.bind(this));
	}

	function loadFragment() {
		return Fragment.load({
			id: this.getView().getId(),
			name: "sap.ui.fl.variants.context.view.fragment.AddContextDialog",
			controller: this
		}).then(function(oDialog) {
			this.getView().addDependent(oDialog);
			oDialog._oList.attachUpdateStarted(this._updateStartedHandler.bind(this));
			return oDialog;
		}.bind(this));
	}

	function getData(mConfig, oPreviousRoles) {
		return WriteStorage.getContexts(buildQueryParameterMap(mConfig)).then(function(oResponse) {
			if (oPreviousRoles) {
				oResponse.values = oPreviousRoles.concat(oResponse.values);
			}
			this.oContextsModel.setData(oResponse);
			this.oContextsModel.refresh(true);
		}.bind(this));
	}

	return Controller.extend("sap.ui.fl.variants.context.controller.ContextVisibility", {
		onInit: function() {
			this.oSelectedContextsModel = this.getView().getModel("selectedContexts");
			this.oContextsModel = this.getView().getModel("contexts");
			this.oI18n = this.getView().getModel("i18n").getResourceBundle();
		},

		onBeforeRendering: function() {
			this.oSelectedContextsModel.refresh(true);
			var oSelectedContexts = this.getOwnerComponent().getSelectedContexts();
			var bHasContexts = oSelectedContexts.role.length > 0;
			this.byId("selectedContextsList").setVisible(bHasContexts);

			if (bHasContexts) {
				return assignDescriptionsToSelectedRoles.call(this, oSelectedContexts);
			}
			return Promise.resolve();
		},

		isSelected: function(oItem, aSelectedItems) {
			return aSelectedItems.some(function(oSelectedItem) {
				return oSelectedItem.id === oItem.id;
			});
		},

		formatSelectedIndex: function(aSelectedRoles) {
			return aSelectedRoles.length === 0 ? 0 : 1;
		},

		formatTooltip: function(sDescription) {
			if (!this.oI18n) {
				this.oI18n = this.getView().getModel("i18n").getResourceBundle();
			}
			return sDescription.length === 0 ? this.oI18n.getText("NO_DESCRIPTION") : sDescription;
		},

		/**
		 * If restricted radio button is selected, then it reveals the hidden selected contexts list.
		 */
		onSelectRestrictedRadioButton: function(oEvent) {
			oEvent.getSource().setSelected(true);
			var bFlag = oEvent.getParameters() && oEvent.getParameters().selected;
			this.byId("selectedContextsList").setVisible(bFlag);
		},

		onSelectPublicRadioButton: function() {
			this.oSelectedContextsModel.setProperty("/selected", []);
			this.showErrorMessage(false);
		},

		/**
		 * Checks if all data is loaded from back end.
		 * If not, it retrieves the next chunk from the back end and then updates the model.
		 */
		_appendDataFromBackend: function() {
			var oRoles = this.oContextsModel.getProperty("/values");
			if (this.oContextsModel.getProperty("/lastHitReached") === false) {
				var mConfig = {$skip: oRoles.length};
				return getData.call(this, mConfig, oRoles);
			}
			return Promise.resolve(oRoles);
		},

		/**
		 * Proxy handler that is called if <code>updateStarted</code> events are fired.
		 * Delegates to <code>_appendDataFromBackend</code> in case of a <code>Growing</code> event.
		 * <code>Growing</code> events are triggered if the user clicks on <code>More</code> or scrolls down in the <code>Select Contexts</code> list.
		 */
		_updateStartedHandler: function(oEvent) {
			if (oEvent.getParameter && oEvent.getParameter("reason") === "Growing") {
				return this._appendDataFromBackend();
			}
			return Promise.resolve();
		},

		/**
		 * Retrieves contexts from the back end, then opens a new <code>Select Contexts</code> dialog.
		 */
		_addContexts: function(oDialog) {
			oDialog._oList.removeSelections(true);
			return getData.call(this, {}).then(function() {
				return oDialog.open();
			});
		},

		/**
		 * Proxy handler method that calls <code>_addContext</code> if the <code>Select Contexts</code> dialog is not yet opened.
		 */
		onAddContextsHandler: function() {
			if (!this._oDialog) {
				this._oDialog = loadFragment.call(this);
			}
			return this._oDialog.then(function (oDialog) {
				return this._addContexts(oDialog);
			}.bind(this));
		},

		/**
		 * Retrieves filtered data from the back end, then updates the model.
		 */
		onSearch: function(oEvent) {
			var mConfig = {$filter: oEvent.getParameter("value")};
			return getData.call(this, mConfig);
		},

		/**
		 * Triggered if user clicks on <code>Select<code> button in <code>Select Contexts</code> dialog.
		 * Formats selected items, then updates the model accordingly.
		 */
		onSelectContexts: function(oEvent) {
			var aSelectedRoles = oEvent.getParameter("selectedContexts");
			var oSelectedItems = aSelectedRoles.map(function(oListItems) {
				return oListItems.getObject();
			});
			this.oSelectedContextsModel.setProperty("/selected", oSelectedItems);
			this.showErrorMessage(false);
		},

		/**
		 * Removes a single selected context.
		 */
		onDeleteContext: function(oEvent) {
			var aItems = this.oSelectedContextsModel.getProperty("/selected");
			var oToBeDeleted = oEvent.getParameter("listItem");
			var oNewData = aItems.filter(function(oItem) {
				return oItem.id !== oToBeDeleted.getTitle();
			});
			this.oSelectedContextsModel.setProperty("/selected", oNewData);
			// after deletion put the focus back to the list
			var oList = oEvent.getSource();
			oList.attachEventOnce("updateFinished", oList.focus, oList);
		},

		/**
		 * Removes all selected contexts.
		 */
		removeAll: function() {
			this.oSelectedContextsModel.setProperty("/selected", []);
		},

		/**
		 * Shows or removes error message depending on the input.
		 */
		showErrorMessage: function(bShowError) {
			var sErrorMessageId = this.getView().getId() + "--noSelectedRolesError";
			var oErrorMessage = sap.ui.getCore().byId(sErrorMessageId);
			if (oErrorMessage) {
				oErrorMessage.destroy();
			}
			if (bShowError) {
				oErrorMessage = new MessageStrip(sErrorMessageId, {text: this.oI18n.getText("SELECTED_ROLES_ERROR"), type: MessageType.Error, showIcon: true});
				this.byId("visibilityPanel").insertContent(oErrorMessage, 1);
			}
		},

		isRemoveAllEnabled: function(aSelectedRoleIds) {
			return aSelectedRoleIds.length !== 0;
		}
	});
});
