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
	 * @class  This control allows you to add items to a sap.m.Select instance. In addition, based on the property set, a set of pre-filled entries is added.
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
				 * The selected item from <code>items</code> aggregation. This can be <code>null</code> if no valid item or special item is selected.
				 */
				selectedItem: {
					type: "sap.ui.core.Item",
					group: "Data",
					defaultValue: null,
					invalidate: true
				},

				/**
				 * Defines whether the 'Select new value' item should be available in the selection field.
				 * Please note that upon selecting this item, the previously selected item is restored.
				 * As a consequence, the <code>selectedItem</code> property never contains this item.
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
					defaultValue: true,
					invalidate: true
				},

				/**
				 * Defines whether the 'Label' is required for the selection field.
				 */
				required: {
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

			associations: {
				/**
				 * The label that should be displayed before the field.
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "ariaLabelledBy"
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
		if (!MultiEditField.prototype._oRb) {
			MultiEditField.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		}

		this._getKeepAll = jQuery.sap.getter(new Item({
			key: "keep",
			text: "< " + this._oRb.getText("MULTI_EDIT_KEEP_TEXT") + " >"
		}));
		this._getBlank = jQuery.sap.getter(new Item({
			key: "blank",
			text: "< " + this._oRb.getText("MULTI_EDIT_BLANK_TEXT") + " >"
		}));
		this._getValueHelp = jQuery.sap.getter(new Item({
			key: "new",
			text: "< " + this._oRb.getText("MULTI_EDIT_NEW_TEXT") + " >"
		}));

		// This enables FormElements to correctly write aria attributes to the internal Select control
		this.byId("select").getParent = this.getParent.bind(this);
		this._oLastSelectedItem = this._getKeepAll();
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

		var oSelectedItem = this.getSelectedItem();
		if (oSelectedItem) {
			oSelectedItem = this._getInternalItem(oSelectedItem);
			this.byId("select").setSelectedItem(oSelectedItem);
		}
	};

	MultiEditField.prototype.setSelectedItem = function(oSelectedItem) {
		var oItem = this._getExternalItem(oSelectedItem) || oSelectedItem;
		var oInternalItem;

		if (oItem && this.indexOfItem(oItem) >= 0 && !this._isSpecialValueItem(oItem)) {
			oInternalItem = this._getInternalItem(oSelectedItem);
			if (oInternalItem) {
				this.byId("select").setSelectedItem(oInternalItem);
			}
			this._oLastSelectedItem = oItem;
			return this.setProperty("selectedItem", oItem);
		}
		return this;
	};

	MultiEditField.prototype.exit = function() {
		this._getKeepAll().destroy();
		this._getBlank().destroy();
		this._getValueHelp().destroy();

		var oItemTemplate = this.byId("itemTemplate");
		if (oItemTemplate) {
			oItemTemplate.destroy();
		}
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
	 * If the selected item is the Value Help item, an internal event is triggered and the item is reset.
	 *
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

		if (oItem !== this._getValueHelp()) {
			this._oLastSelectedItem = oItem;
			this.setProperty("selectedItem", oItem, true);
		}
	};

	/**
	 * Sets the previously selected item as the currently selected item of the internal select control.
	 * @protected
	 */
	MultiEditField.prototype.resetSelection = function() {
		this.byId("select").setSelectedItem(this._getInternalItem(this._oLastSelectedItem));
	};

	/**
	 * Gets the MultiEditField item that corresponds to the internal Select control item.
	 * If the provided item already exists in the MultiEditField control, it is simply returned.
	 *
	 * @param {sap.ui.core.Item} item The item from the items aggregation of the internal Select control.
	 * @returns {sap.ui.core.Item | null} The MultiEditField item that corresponds to the item from the internal Select control.
	 * @private
	 */
	MultiEditField.prototype._getExternalItem = function(item) {
		var iIndex = this.byId("select").indexOfItem(item);
		if (iIndex >= 0) {
			return this.getItems()[iIndex];
		}
		return null;
	};

	/**
	 * Gets the internal Select item that corresponds to the MultiEditField item.
	 * If the provided item already exists in the Select control, it is simply returned.
	 *
	 * @param {sap.ui.core.Item} item The item from the items aggregation of the MultiEditField control.
	 * @returns {sap.ui.core.Item | null} The internal Select item that corresponds to the item from the MultiEditField control.
	 * @private
	 */
	MultiEditField.prototype._getInternalItem = function(item) {
		var iIndex = this.indexOfItem(item);
		if (iIndex >= 0) {
			return this.byId("select").getItems()[iIndex];
		}
		return null;
	};

	/**
	 * Gets the DOM reference of the internal Select control.
	 * @returns {Element} The DOM reference of the internal Select control.
	 * @private
	 */
	MultiEditField.prototype._getInternalDomRef = function() {
		var oSelect = this.byId("select");
		return oSelect && oSelect.getDomRef();
	};

	/**
	 * Gets the UI area of the internal Select control.
	 * @returns {sap.ui.core.UIArea} The UI area of the internal Select control.
	 * @private
	 */
	MultiEditField.prototype._getInternalUIArea = function() {
		return this.byId("select").getUIArea();
	};

	return MultiEditField;
});
