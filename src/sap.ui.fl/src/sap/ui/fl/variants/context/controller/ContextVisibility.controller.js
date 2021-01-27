/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer"
],
function (
	Controller,
	Fragment,
	WriteStorage,
	Layer
) {
	"use strict";

	function buildGetContextsPropertyBag(sSkipValue) {
		var mPropertyBag = {layer: Layer.CUSTOMER, type: "role"};
		if (this.sFilterValue) {
			mPropertyBag["$filter"] = this.sFilterValue;
		}
		if (sSkipValue) {
			mPropertyBag["$skip"] = sSkipValue;
		}
		return mPropertyBag;
	}

	function assignDescriptionsToSelectedRoles(aSelectedRoles) {
		var mPropertyBag = {layer: Layer.CUSTOMER, flexObjects: {roles: aSelectedRoles}};
		return WriteStorage.loadContextDescriptions(mPropertyBag).then(function(oResponse) {
			this.oSelectedContextsModel.setProperty("/selected", oResponse.role);
		}.bind(this));
	}

	return Controller.extend("sap.ui.fl.variants.context.controller.ContextVisibility", {
		onInit: function() {
			this.oSelectedContextsModel = this.getView().getModel("selectedContexts");
			this.oContextsModel = this.getView().getModel("contexts");
			var aSelectedRoles = this.getOwnerComponent().getSelectedRoles();
			if (aSelectedRoles.length > 0) {
				return assignDescriptionsToSelectedRoles.call(this, aSelectedRoles);
			}
			return Promise.resolve(this.oSelectedContextsModel.setProperty("/selected", []));
		},

		onBeforeRendering: function() {
			var oRadioButtonGroup = this.byId("visibilityRadioButtonGroup");
			if (this.getOwnerComponent().getSelectedRoles().length === 0) {
				oRadioButtonGroup.setSelectedIndex(0);
			} else {
				oRadioButtonGroup.setSelectedIndex(1);
				this.byId("selectedContextsList").setVisible(true);
			}
		},

		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		isSelected: function(oItem, aSelectedItems) {
			return aSelectedItems.some(function(oSelectedItem) {
				return oSelectedItem.id === oItem.id;
			});
		},

		/**
		 * If restricted radio button is selected, then it reveals the hidden selected contexts list.
		 */
		onSelectRestrictedRadioButton: function(oEvent) {
			oEvent.getSource().setSelected(true);
			var bFlag = oEvent.getParameters() && oEvent.getParameters().selected;
			this.byId("selectedContextsList").setVisible(bFlag);
		},

		/**
		 * Checks if all data is loaded from back end.
		 * If not, it retrieves the next chunk from the back end and then updates the model.
		 */
		_appendDataFromBackend: function() {
			var oRoles = this.oContextsModel.getProperty("/values");
			if (this.oContextsModel.getProperty("/lastHitReached") === false) {
				return WriteStorage.getContexts(buildGetContextsPropertyBag.call(this, oRoles.length)).then(function(oResponse) {
					oRoles = oRoles.concat(oResponse.values);
					this.oContextsModel.setProperty("/values", oRoles);
					this.oContextsModel.setProperty("/lastHitReached", oResponse.lastHitReached);
					this.oContextsModel.refresh(true);
					return oRoles;
				}.bind(this));
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
		_addContexts: function() {
			return WriteStorage.getContexts(buildGetContextsPropertyBag.call(this)).then(function(oResponse) {
				this.oContextsModel.setData(oResponse);
				return Fragment.load({
					id: this.createId("Fragment"),
					name: "sap.ui.fl.variants.context.view.fragment.AddContextDialog",
					controller: this
				});
			}.bind(this)).then(function(oDialog) {
				this._oDialog = oDialog;
				this.getView().addDependent(this._oDialog);
				this._oDialog._oList.attachUpdateStarted(this._updateStartedHandler.bind(this));
				return this._oDialog.open();
			}.bind(this));
		},

		/**
		 * Proxy handler method that calls <code>_addContext</code> if the <code>Select Contexts</code> dialog is not yet opened.
		 */
		onAddContextsHandler: function() {
			if (!this._oDialog) {
				return this._addContexts();
			}
			return Promise.resolve(this._oDialog.open());
		},

		/**
		 * Retrieves filtered data from the back end, then updates the model.
		 */
		onSearch: function(oEvent) {
			this.sFilterValue = oEvent.getParameter("value");
			return WriteStorage.getContexts(buildGetContextsPropertyBag.call(this)).then(function(oResponse) {
				this.oContextsModel.setData(oResponse);
			}.bind(this));
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
		},

		/**
		 * Removes all selected contexts.
		 */
		removeAll: function() {
			this.oSelectedContextsModel.setProperty("/selected", []);
		}
	});
});
