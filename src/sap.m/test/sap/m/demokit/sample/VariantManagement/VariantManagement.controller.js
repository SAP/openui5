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
		_getItemByKey: function(sKey) {
			var oItem = null;
			var aItems = this._oVM.getItems();
			if (aItems) {
				aItems.some(function(oEntry) {
					if (oEntry.getKey() === sKey) {
						oItem = oEntry;
					}

					return (oItem !== null);
				});
			}

			return oItem;
		},
		_getFirstVisibleItem: function() {
			var oItem = null;
			var aItems = this._oVM.getItems();
			if (aItems) {
				aItems.some(function(oEntry) {
					if (oEntry.getFavorite()) {
						oItem = oEntry;
					}

					return (oItem !== null);
				});
			}

			return oItem;
		},

		_checkCurrentVariant: function() {
			var sSelectedKey = this._oVM.getSelectedKey();
			var oItem = this._getItemByKey(sSelectedKey);
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
						var oItem = this._getItemByKey(sKey);
						if (oItem) {
							this._oVM.removeItem(oItem);
							oItem.destroy();
						}
				}.bind(this));
			}

			if (mParams.renamed) {
				mParams.renamed.forEach(function(oElement) {
						var oItem = this._getItemByKey(oElement.key);
						if (oItem) {
							oItem.setTitle(oElement.name);
							oItem.setOriginalTitle(oElement.name);
						}
				}.bind(this));
			}

			if (mParams.exe) {
				mParams.exe.forEach(function(oElement) {
						var oItem = this._getItemByKey(oElement.key);
						if (oItem) {
							oItem.setExecuteOnSelect(oElement.exe);
							oItem.setOriginalExecuteOnSelect(oElement.exe);
						}
				}.bind(this));
			}

			if (mParams.fav) {
				mParams.fav.forEach(function(oElement) {
						var oItem = this._getItemByKey(oElement.key);
						if (oItem) {
							oItem.setFavorite(oElement.visible);
							oItem.setOriginalFavorite(oElement.visible);
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
				originalTitle: mParams.name,
				originalExecuteOnSelect: mParams.execute,
				executeOnSelect: mParams.execute,
				author: "sample",
				changeable: true,
				remove: true
			});

			if (mParams.hasOwnProperty("public")) {
				oItem.setSharing(mParams.public);
			}
			if (mParams.def) {
				this._oVM.setDefaultKey(mParams.def);
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
				var oItem = this._getItemByKey(params.key);
				this._showMessagesMessage("View '" + oItem.getTitle() +  "' updated.");
			} else {
				this._createNewItem(params);
			}

			this._oVM.setModified(false);
		}
	});
});