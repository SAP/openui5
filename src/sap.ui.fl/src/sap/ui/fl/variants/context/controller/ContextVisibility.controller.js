/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/base/util/restricted/_isEqual"
], function(
	Controller,
	Fragment,
	WriteStorage,
	Layer,
	_isEqual
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
			oDialog._oList.attachSelectionChange(this._onSelectionChange.bind(this));
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

	function itemToJson(oItem) {
		return {id: oItem.getTitle(), description: oItem.getDescription()};
	}

	return Controller.extend("sap.ui.fl.variants.context.controller.ContextVisibility", {
		onInit() {
			this.oSelectedContextsModel = this.getView().getModel("selectedContexts");
			this.oContextsModel = this.getView().getModel("contexts");
			this.oI18n = this.getView().getModel("i18n").getResourceBundle();
		},

		onBeforeRendering() {
			this.oSelectedContextsModel.refresh(true);
			if (!this.oSelectedContextsModel.getProperty("/noDataText")) {
				this.oSelectedContextsModel.setProperty("/noDataText", this.oI18n.getText("NO_SELECTED_ROLES"));
				this.oSelectedContextsModel.refresh(true);
			}
			var oSelectedContexts = this.getOwnerComponent().getSelectedContexts();
			var bHasContexts = oSelectedContexts.role.length > 0;
			if (bHasContexts) {
				this._pLoadContextDescriptions = assignDescriptionsToSelectedRoles.call(this, oSelectedContexts);
			} else {
				this._pLoadContextDescriptions = Promise.resolve();
			}
		},

		_onSelectionChange(oEvent) {
			var oSelectedItem = itemToJson(oEvent.getParameter("listItem"));
			if (oEvent.getParameter("selected") === true) {
				this.oCurrentSelection.push(oSelectedItem);
			} else {
				this.oCurrentSelection = this.oCurrentSelection.filter(function(oItem) {
					return !_isEqual(oItem, oSelectedItem);
				});
			}
		},

		isSelected(oItem, aSelectedItems) {
			return aSelectedItems.some(function(oSelectedItem) {
				return oSelectedItem.id === oItem.id;
			});
		},

		formatTooltip(sDescription) {
			this.oI18n ||= this.getView().getModel("i18n").getResourceBundle();
			return sDescription.length === 0 ? this.oI18n.getText("NO_DESCRIPTION") : sDescription;
		},

		/**
		 * Checks if all data is loaded from back end.
		 * If not, it retrieves the next chunk from the back end and then updates the model.
		 * @returns {Promise} Resolves with additional data
		 */
		_appendDataFromBackend() {
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
		 * @param {sap.ui.base.Event} oEvent - Event object
		 * @returns {Promise} Resolves with additional data
		 */
		_updateStartedHandler(oEvent) {
			if (oEvent.getParameter && oEvent.getParameter("reason") === "Growing") {
				return this._appendDataFromBackend();
			}
			return Promise.resolve();
		},

		/**
		 * Retrieves contexts from the back end, then opens a new <code>Select Contexts</code> dialog.
		 * @param {object} oDialog - The Select Contexts dialog
		 * @returns {Promise} Resolves as soon as the dialog is opened
		 */
		_addContexts(oDialog) {
			oDialog.clearSelection();
			this.oCurrentSelection = this.oSelectedContextsModel.getProperty("/selected") || [];
			return getData.call(this, {}).then(function() {
				return oDialog.open();
			});
		},

		/**
		 * Proxy handler method that calls <code>_addContext</code> if the <code>Select Contexts</code> dialog is not yet opened.
		 * @returns {Promise} Resolves as soon as the dialog is opened
		 */
		onAddContextsHandler() {
			this._oDialog ||= loadFragment.call(this);
			return this._oDialog.then(function(oDialog) {
				return this._addContexts(oDialog);
			}.bind(this));
		},

		/**
		 * Retrieves filtered data from the back end, then updates the model.
		 * @param {sap.ui.base.Event} oEvent - Event object
		 * @returns {Promise<object>} The data
		 */
		onSearch(oEvent) {
			oEvent.getSource().clearSelection();
			var mConfig = {$filter: oEvent.getParameter("value")};
			return getData.call(this, mConfig);
		},

		/**
		 * Triggered if user clicks on <code>Select<code> button in <code>Select Contexts</code> dialog.
		 * Formats selected items, then updates the model accordingly.
		 */
		onSelectContexts() {
			this.oSelectedContextsModel.setProperty("/selected", this.oCurrentSelection);
			this.oSelectedContextsModel.refresh(true);
			this.oCurrentSelection = [];
		},

		/**
		 * Removes a single selected context.
		 * @param {sap.ui.base.Event} oEvent - Event object
		 */
		onDeleteContext(oEvent) {
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
		removeAll() {
			this.oSelectedContextsModel.setProperty("/selected", []);
		},

		isRemoveAllEnabled(aSelectedRoleIds) {
			return aSelectedRoleIds?.length !== 0;
		},

		isMessageStripVisible(aSelectedRoles, bShowMessageStrip) {
			return bShowMessageStrip && aSelectedRoles?.length === 0;
		}
	});
});
