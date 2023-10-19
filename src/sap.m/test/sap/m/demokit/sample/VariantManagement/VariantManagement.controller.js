sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/m/MessageToast",
	"sap/m/VariantItem"
], function(Controller, MessageToast, VariantItem) {
	"use strict";

	return Controller.extend("sap.m.sample.VariantManagement.Page", {

		onInit: function() {
			this._oVM = this.getView().byId("vm");
		},
		_showMessagesMessage: function(sMessage) {
			MessageToast.show(sMessage, {
				closeOnBrowserNavigation: true
			});
		},
		_checkCurrentVariant: function() {
			var sSelectedKey = this._oVM.getSelectedKey();
			var oItem = this._oVM.getItemByKey(sSelectedKey);
			if (!oItem) {
				var sKey = this._oVM.getStandardVariantKey();
				if (sKey) {
					this._oVM.setSelectedKey(sKey);
				}
			}
		},
		_updateItems: function(mParams) {
			if (mParams.deleted) {
				mParams.deleted.forEach(function(sKey) {
						var oItem = this._oVM.getItemByKey(sKey);
						if (oItem) {
							this._oVM.removeItem(oItem);
							oItem.destroy();
						}
				}.bind(this));
			}

			if (mParams.hasOwnProperty("def")) {
				this._oVM.setDefaultKey(mParams.def);
			}

			this._checkCurrentVariant();
		},
		_createNewItem: function(mParams) {
			var sKey = "key_" + Date.now();

			var oItem = new VariantItem({
				key: sKey,
				title: mParams.name,
				executeOnSelect: mParams.execute,
				author: "sample",
				changeable: true,
				remove: true
			});

			if (mParams.hasOwnProperty("public")) {
				oItem.setSharing(mParams.public);
			}
			if (mParams.def) {
				this._oVM.setDefaultKey(sKey);
			}

			this._oVM.addItem(oItem);

			this._showMessagesMessage("New view '" + oItem.getTitle() +  "' created with key:'" + sKey + "'.");
		},
		onPress: function(event) {
			this._oVM.setModified(!this._oVM.getModified());
		},
		onManage: function(event) {
			var params = event.getParameters();
			this._updateItems(params);
		},
		onSelect: function(event) {
			var params = event.getParameters();
			var sMessage = "Selected Key: " + params.key;
			this._showMessagesMessage(sMessage);
			this._oVM.setModified(false);
		},
		onSave: function(event) {
			var params = event.getParameters();
			if (params.overwrite) {
				var oItem = this._oVM.getItemByKey(params.key);
				this._showMessagesMessage("View '" + oItem.getTitle() +  "' updated.");
			} else {
				this._createNewItem(params);
			}

			this._oVM.setModified(false);
		}
	});
});