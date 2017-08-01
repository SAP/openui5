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
					defaultValue: true,
					invalidate: true
				}
			},
			aggregations: {
				/**
				* Defines personalization items.
				*/
				unit: {
					type: "sap.m.MultiEditField",
					multiple: false
				},
				/**
				 * The items that should be displayed after the predefined items.
				 */
				items: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			}
		}
	});

	MultiEditField.prototype.init = function() {
		MultiEditField.prototype._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._oPrefilledItems = {
			keep: new Item({
				key: "_keep",
				text: this._oRb.getText("MULTI_EDIT_KEEP_TEXT")
			}),
			nullable: new Item({
				key: "_blank",
				text: this._oRb.getText("MULTI_EDIT_BLANK_TEXT")
			}),
			showValueHelp: new Item({
				key: "_new",
				text: this._oRb.getText("MULTI_EDIT_NEW_TEXT")
			})
		};
	};

	MultiEditField.prototype.onBeforeRendering = function() {
		var oItem;
		var i = 0;
		var sGetter;

		for (var property in this._oPrefilledItems) {
			oItem = this._oPrefilledItems[property];
			sGetter = "get" + jQuery.sap.charToUpperCase(property, 0);

			if (this.indexOfItem(oItem) === -1) {
				this.insertAggregation("items", oItem, i, true);
			} else if (this.indexOfItem(oItem) !== -1 && this[sGetter] && !this[sGetter]()) {
				this.removeAggregation("items", oItem);
			}
			i++;
		}
	};

	MultiEditField.prototype.exit = function() {
		if (this._oPrefilledItems) {
			for (var i = 0;  i < this._oPrefilledItems.length; i++) {
				this._oPrefilledItems[i].destroy();
			}
			this._oPrefilledItems = null;
		}
	};
	return MultiEditField;
});