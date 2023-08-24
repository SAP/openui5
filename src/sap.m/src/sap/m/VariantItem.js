/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/library', 'sap/ui/core/Item'
], function(library, Item) {
	"use strict";

	/**
	 * Constructor for a new sap.m.VariantItem.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The VariantItem class describes a variant item.
	 * @extends sap.ui.core.Item
	 * @constructor
	 * @public
	 * @alias sap.m.VariantItem
	 */
	var VariantItem = Item.extend("sap.m.VariantItem", /** @lends sap.m.VariantItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Contains the information is the item is public or private.
				 */
				sharing: {
					type: "string",
					group: "Misc",
					defaultValue: "private"
				},

				/**
				 * Indicates if the item is removable.
				 */
				remove: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates if the item is marked as favorite.
				 */
				favorite: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the item is marked as apply automatically.
				 */
				executeOnSelect: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Indicates if the item is renamable.
				 */
				rename: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Contains the title if the item.
				 */
				title: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},


				/**
				 * Indicates if the item is visible.
				 */
				visible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Indicates if the item is changeable.
				 */
				changeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Contains the author information of the item.
				 */
				author: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Contains the contexts information of the item.
				 */
				contexts: {
					type: "object",
					group: "Misc",
					defaultValue: {}
				},

				/**
				 * Contains the initial value of the property <code>favorite</code>. Is used for cancel operations.
				 */
				_originalFavorite: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: true
				},

				/**
				 * Contains the initial value of the property <code>executeOnSelect</code>. Is used for cancel operations.
				 */
				_originalExecuteOnSelect: {
					type: "boolean",
					visibility: "hidden",
					defaultValue: false
				},

				/**
				 * Contains the initial value of the property <code>title</code>. Is used for cancel operations.
				 */
				_originalTitle: {
					type: "string",
					visibility: "hidden",
					defaultValue: null
				},

				/**
				 * Contains the initial value of the property <code>contexts</code>. Is used for cancel operations.
				 */
				_originalContexts:{
					type: "object",
					group: "Misc",
					visibility: "hidden",
					defaultValue: {}
				}
			}
		}
	});

	VariantItem.prototype.init = function() {
		Item.prototype.init.apply(this);
		this._bOriginalTitleSet = false;
		this._bOriginalFavoriteSet = false;
		this._bOiginalExecuteOnSelectSet = false;
		this._oOriginalContextsSet = false;
	};

	VariantItem.prototype.setText = function(sText) {
		this.setProperty("text", sText);
		this.setTitle(sText);
		return this;
	};

	VariantItem.prototype.setTitle = function(sValue) {
		this.setProperty("title", sValue);
		if (!this._bOriginalTitleSet) {
			this._bOriginalTitleSet = true;
			this._setOriginalTitle(sValue);
		}
		return this;
	};
	VariantItem.prototype.setFavorite = function(bValue) {
		this.setProperty("favorite", bValue);
		if (!this._bOriginalFavoriteSet) {
			this._bOriginalFavoriteSet = true;
			this._setOriginalFavorite(bValue);
		}
		return this;
	};
	VariantItem.prototype.setExecuteOnSelect = function(bValue) {
		this.setProperty("executeOnSelect", bValue);
		if (!this._bOiginalExecuteOnSelectSet) {
			this._bOiginalExecuteOnSelectSet = true;
			this._setOriginalExecuteOnSelect(bValue);
		}
		return this;
	};
	VariantItem.prototype.setContexts = function(oValue) {
		this.setProperty("contexts", oValue);
		if (!this._oOriginalContextsSet) {
			this._oOriginalContextsSet = true;
			this._setOriginalContexts(oValue);
		}
		return this;
	};

	VariantItem.prototype._getOriginalFavorite = function() {
		return 	this.getProperty("_originalFavorite");
	};
	VariantItem.prototype._setOriginalFavorite = function(vValue) {
		this.setProperty("_originalFavorite", vValue);
		return this;
	};
	VariantItem.prototype._getOriginalExecuteOnSelect = function() {
		return 	this.getProperty("_originalExecuteOnSelect");
	};
	VariantItem.prototype._setOriginalExecuteOnSelect = function(vValue) {
		this.setProperty("_originalExecuteOnSelect", vValue);
		return this;
	};
	VariantItem.prototype._getOriginalTitle = function() {
		return 	this.getProperty("_originalTitle");
	};
	VariantItem.prototype._setOriginalTitle = function(vValue) {
		this.setProperty("_originalTitle", vValue);
		return this;
	};
	VariantItem.prototype._getOriginalContexts = function() {
		return this.getProperty("_originalContexts");
	};
	VariantItem.prototype._setOriginalContexts = function(vValue) {
		this.setProperty("_originalContexts", vValue);
		return this;
	};

	return VariantItem;
});