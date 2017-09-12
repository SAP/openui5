/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global", "sap/ui/core/XMLComposite", "./library", "sap/ui/core/Item"
], function(jQuery, XMLComposite, library, Item) {
	"use strict";

	/**
	 * Constructor for MultiEditField
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class  This control allows you to add items to a sap.m.Select instance. In addition, based on the property set, a set of prefilled entries is added.
	 * @extends sap.ui.core.XMLComposite
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @experimental since 1.52
	 * @since 1.52.0
	 * @alias sap.m.MultiEditField
	 * @sap-restricted sap.m.MultiEditField
	 */
	var MultiEditField = XMLComposite.extend("sap.m.MultiEditField", /** @lends sap.m.MultiEditField.prototype */ {
		metadata: {
			interfaces: ["sap.ui.core.IFormContent"],
			library: "sap.m",
			properties: {
				/**
				 * Select control can be rendered according to the type.
				 */
				type: {
					type: "sap.m.MultiEditFieldType",
					group: "Appearance",
					defaultValue: "Select"
				},

				/**
				 * The selected item from items aggregation. This can be <code>null</code> if no valid item or special item is selected.
				 */
				selectedItem: {
					type: "sap.ui.core.Item",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Defines whether the 'Select new value' item should be available in the selection field.
				 */
				showValueHelp: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true,
					invalidate: true
				},

				/**
				 * Defines whether the 'Leave blank' item should be available in the selection field.
				 */
				nullable: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false,
					invalidate: true
				}
			},

			aggregations: {
				/**
				 * The items that should be displayed after the predefined special items in the selection field.
				 */
				items: {
					type: "sap.ui.core.Item",
					multiple: true,
					bindable: "bindable"
				}
			},

			events: {
				/**
				 * This event is fired when the item of items aggregation in the selection field is changed.
				 */
				change: {
					parameters: {
						/**
						 * The selected item.
						 */
						selectedItem: {
							type: "sap.ui.core.Item"
						}
					}
				}
			}
		}
	});

	MultiEditField.prototype.init = function() {
		MultiEditField.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._getKeepAll = jQuery.sap.getter(new Item({
			key: "keep",
			text: this._oRb.getText("MULTI_EDIT_KEEP_TEXT")
		}));
		this._getBlank = jQuery.sap.getter(new Item({
			key: "blank",
			text: this._oRb.getText("MULTI_EDIT_BLANK_TEXT")
		}));
		this._getValueHelp = jQuery.sap.getter(new Item({
			key: "new",
			text: this._oRb.getText("MULTI_EDIT_NEW_TEXT")
		}));
	};

	MultiEditField.prototype.onBeforeRendering = function() {
		this.insertAggregation("items", this._getKeepAll(), 0, true);
		if (this.getNullable()) {
			this.insertAggregation("items", this._getBlank(), 1, true);
		} else {
			this.removeAggregation("items", this._getBlank(), true);
		}
		if (this.getShowValueHelp()) {
			this.insertAggregation("items", this._getValueHelp(), this.getNullable() ? 2 : 1, true);
		} else {
			this.removeAggregation("items", this._getValueHelp(), true);
		}
	};

	MultiEditField.prototype.setSelectedItem = function(oSelectedItem) {
		var oSelect = this.byId("select");
		if (!oSelectedItem || this.indexOfItem(oSelectedItem) < 0 || this._isSpecialValueItem(oSelectedItem)) {
			return this;
		} else {
			oSelect.setSelectedItemId(oSelectedItem.getId());
			return this.setProperty("selectedItem", oSelectedItem);
		}
	};

	MultiEditField.prototype.exit = function() {
		this._getKeepAll().destroy();
		this._getBlank().destroy();
		this._getValueHelp().destroy();
		this.byId("itemTemplate").destroy();
	};

	/**
	 * The field is not adjusted by the Form control to meet the cell's width
	 * @protected
	 * @returns {boolean} True this method always returns <code>true</code>
	 */
	MultiEditField.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	/**
	 * Checks if the 'Leave blank' item is selected.
	 * @public
	 * @returns {boolean} True if the 'Leave blank' item is selected.
	 */
	MultiEditField.prototype.isBlankSelected = function() {
		return this._getExternalItem(this.byId("select").getSelectedItem()) === this._getBlank();
	};

	/**
	 * Checks if the 'Keep existing value' item is selected.
	 * @public
	 * @returns {boolean} True if the 'Keep existing value' item is selected.
	 */
	MultiEditField.prototype.isKeepExistingSelected = function() {
		return this._getExternalItem(this.byId("select").getSelectedItem()) === this._getKeepAll();
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	/**
	 * Checks if the given item is one of three special items.
	 * @param {sap.ui.core.Item} item that is to be checked
	 * @private
	 * @returns {boolean} True if the given item is one of three special items.
	 */
	MultiEditField.prototype._isSpecialValueItem = function(item) {
		return item === this._getKeepAll() || item === this._getBlank() || item === this._getValueHelp();
	};

	/**
	 * Handles the change event of internal Select control and triggers the MultiEditField change event.
	 * @param {sap.ui.base.Event} event The Event object.
	 * @private
	 */
	MultiEditField.prototype._handleSelectionChange = function(event) {
		var oItem = this._getExternalItem(event.getParameter("selectedItem"));
		if (oItem && !this._isSpecialValueItem(oItem)) {
			this.fireChange({
				selectedItem: oItem
			});
		} else if (oItem === this._getValueHelp()) {
			this.fireEvent("_valueHelpRequest");
		}
	};

	/**
	 * Gets the MultiEditField item that corresponds to the internal Select control item.
	 * @param {sap.ui.core.Item} item The item from the items aggregation of the internal Select control.
	 * @private
	 * @returns {sap.ui.core.Item | null} The MultiEditField item that corresponds to the item from the internal Select control.
	 */
	MultiEditField.prototype._getExternalItem = function(item) {
		var iIndex = this.byId("select").indexOfItem(item);
		if (iIndex >= 0) {
			return this.getItems()[iIndex];
		}
		return null;
	};

	return MultiEditField;
});
