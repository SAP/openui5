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
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @experimental since 1.52
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MultiEditField = XMLComposite.extend("sap.m.MultiEditField", { /** @lends sap.m.MultiEditField.prototype */
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
				value: { type: "any", group: "Appearance", defaultValue: null },

				/**
				 * Defines whether a value help should be available in the control.
				 */
				showValueHelp: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true,
					invalidate: true
				},

				/**
				 * Defines whether the value can be null or not.
				 */
				nullable: {
					type: "boolean",
					group: "Appearance",
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
						value: {
							type: "string"
						}
					}
				}
			}
		}
	});

	MultiEditField.prototype.init = function() {
		MultiEditField.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oPrefilledItems = {
			keep: new Item({
				key: this._MultiEditFieldSelection.KeepAll,
				text: this._oRb.getText("MULTI_EDIT_KEEP_TEXT")
			}),
			nullable: new Item({
				key: this._MultiEditFieldSelection.Blank,
				text: this._oRb.getText("MULTI_EDIT_BLANK_TEXT")
			}),
			showValueHelp: new Item({
				key: this._MultiEditFieldSelection.ValueHelp,
				text: this._oRb.getText("MULTI_EDIT_NEW_TEXT")
			})
		};
		//this.setPrefilledItemTexts();
		this.setPrefilledItems();
	};


	MultiEditField.prototype.setPrefilledItems = function() {
		var oItems = this._oPrefilledItems,
			i = 0;

		if (this.indexOfItem(oItems.keep) < 0) {
			this.insertItem(oItems.keep, i++, true);
		}

		if (this.getNullable()) {
			if (this.indexOfItem(oItems.nullable) < 0) {
				this.insertItem(oItems.nullable, i++, true);
			}
		} else if (this.indexOfItem(oItems.nullable) >= 0) {
			this.removeItem(oItems.nullable);
		}

		if (this.getShowValueHelp()) {
			if (this.indexOfItem(oItems.showValueHelp) < 0) {
				this.insertItem(oItems.showValueHelp, i++, true);
			}
		} else { // noinspection JSLint
			if (this.indexOfItem(oItems.showValueHelp) >= 0) {
						this.removeItem(oItems.showValueHelp);
					}
		}
	};

	MultiEditField.prototype.setNullable = function(bActive) {
		if (this.getNullable() !== bActive) {
			this.setProperty("nullable", bActive);
			this.setPrefilledItems();
		}
	};

	MultiEditField.prototype.setShowValueHelp = function(bActive) {
		if (this.getShowValueHelp() !== bActive) {
			this.setProperty("showValueHelp", bActive);
			this.setPrefilledItems();
		}
	};
	MultiEditField.prototype.onBeforeRendering = function() {
	};

	MultiEditField.prototype.exit = function() {
		var sProperty;
		var oPrefilledItems = this._oPrefilledItems;
		if (oPrefilledItems) {
			for (sProperty in oPrefilledItems) {
				oPrefilledItems[sProperty].destroy();
			}
			this._oPrefilledItems = null;
		}
	};

	/**
	 * MultiEditField special selection item keys.
	 * @private
	 */
	MultiEditField.prototype._MultiEditFieldSelection = {
		Blank: "_blank",
		KeepAll: "_keep",
		ValueHelp: "_new"
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
		return this._sCurrentSelection === this._MultiEditFieldSelection.Blank;
	};

	/**
	 * Returns true if the 'Keep existing value' item is selected.
	 * @public
	 * @returns {boolean} True if the 'Keep existing value' item is selected.
	 */
	MultiEditField.prototype.isKeepExistingSelected = function() {
		return this._sCurrentSelection === this._MultiEditFieldSelection.KeepAll;
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	/**
	 * Handles the selection change event of sap.m.Select and triggers the corresponding event.
	 * @private
	 */
	MultiEditField.prototype._handleSelectionChange = function(oEvent) {
		var oItem = oEvent.getParameter("selectedItem");
		this._sCurrentSelection = oItem.getKey();
		switch (this._sCurrentSelection) {
			case this._MultiEditFieldSelection.Blank:
			case this._MultiEditFieldSelection.KeepAll:
			case this._MultiEditFieldSelection.ValueHelp:
				// fire special value selected event
				break;
			default:
				break;
		}
	};
	return MultiEditField;
});
