/*!
 * ${copyright}
 */
sap.ui.define([ "jquery.sap.global", "sap/ui/core/XMLComposite", "./library", "sap/ui/core/Item" ],
	function(jQuery, XMLComposite, library, Item) {
	"use strict";

	/**
	 * Constructor for MultiEditField
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class MultiEditField
	 * @extends sap.ui.core.XMLComposite
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @experimental since 1.52
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MultiEditField = XMLComposite.extend("sap.m.MultiEditField", { /** @lends sap.m.MultiEditField.prototype */
		interfaces : ["sap.ui.core.IFormContent"],
		library: "sap.m",
		metadata : {
			properties : {
				/**
				 * Can contain Date, Input or Select.
				 */
				type: {
					type: "sap.m.MultiEditFieldType",
					group: "Appearance",
					defaultValue: "Select"
				},

				/**
				 * The value of the field. This can be <code>null</code> if no valid value is selected or entered, or if the "Leave blank" entry is selected.
				 */
				selectedItem: {
					type: "sap.ui.core.Item",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Defines whether a value help should be available in the control.
				 */
				showValueHelp: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true,
					invalidate: true
				},

				/**
				 * Defines whether the value can be null or not.
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
				 * The items that should be displayed after the predefined items.
				 */
				items: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			},

			events: {
				/**
				 * This event is fired when the value in the selection field is changed.
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

		this.insertAggregation("items", this._getKeepAll(), 0, true);
		this.insertAggregation("items", this._getValueHelp(), 1, true);
	};

	MultiEditField.prototype.setNullable = function(bNullable) {
		if (this.getNullable() !== bNullable) {
			if (bNullable) {
				this.insertAggregation("items", this._getBlank(), 1, true);
			} else {
				this.removeAggregation("items", this._getBlank(), true);
			}
		}
		this.setProperty("nullable", bNullable);
		return this;
	};

	MultiEditField.prototype.setShowValueHelp = function(bShowValueHelp) {
		if (this.getShowValueHelp() !== bShowValueHelp) {
			if (bShowValueHelp) {
				var iIndex = this.indexOfItem(this._getBlank()) === 1 ? 2 : 1;
				this.insertAggregation("items", this._getValueHelp(), iIndex, true);
			} else {
				this.removeAggregation("items", this._getValueHelp(), true);
			}
		}
		this.setProperty("showValueHelp", bShowValueHelp);
		return this;
	};

	MultiEditField.prototype.exit = function() {
		this._getKeepAll().destroy();
		this._getBlank().destroy();
		this._getValueHelp().destroy();
	};

	MultiEditField.prototype.setSelectedItem = function(oSelectedItem) {
		var oSelect = this.byId("select");
		if (this.indexOfItem(oSelectedItem) < 0 || this._isSpecialValueItem(oSelectedItem)) {
			return this;
		} else {
			oSelect.setSelectedItemId(oSelectedItem.getId());
			return this.setProperty("selectedItem", oSelectedItem);
		}
	};

	/* =========================================================== */
	/* Public methods                                              */
	/* =========================================================== */

	/**
	 * Returns true if the 'Leave blank' item is selected.
	 * @public
	 * @returns {boolean} True if the 'Leave blank' item is selected.
	 */
	MultiEditField.prototype.isBlankSelected = function() {
		return this._selectedItem === this._getBlank();
	};

	/**
	 * Returns true if the 'Keep existing value' item is selected.
	 * @public
	 * @returns {boolean} True if the 'Keep existing value' item is selected.
	 */
	MultiEditField.prototype.isKeepExistingSelected = function() {
		return this._selectedItem === this._getKeepAll();
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	MultiEditField.prototype._isSpecialValueItem = function(item) {
		return item === this._getKeepAll() || item === this._getBlank() || item === this._getValueHelp();
	};

	/**
	 * Handles the selection change event of sap.m.Select and triggers the corresponding event.
	 * @private
	 */
	MultiEditField.prototype._handleSelectionChange = function(oEvent) {
		this._selectedItem = oEvent.getParameter("selectedItem");
		if (!this._isSpecialValueItem(this._selectedItem)) {
			this.fireChange({
				selectedItem: this._selectedItem
			});
		}
	};
	return MultiEditField;
});
