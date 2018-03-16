/*!
 * ${copyright}
 */

// Provides control sap.m.VisibleItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Item'],
	function(jQuery, library, Item) {
		"use strict";


		/**
		 * Constructor for a new VisibleItem.
		 *
		 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new element
		 *
		 * @class
		 * VisibleItem is an item enhanced with a visible property.
		 * @extends sap.ui.core.Item
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.40
		 * @alias sap.m.VisibleItem
		 */
		var VisibleItem = Item.extend("sap.m.VisibleItem", /** @lends sap.m.VisibleItem.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {

					/**
					 * Determines if the item is visible.
					 */
					visible: {type: "boolean", group: "Behavior", defaultValue: true}
				}
			}
		});

		/**
		 * Gets all the li dom elements that have text matching the text of the item.
		 * @returns {*} All the li dom elements that have text matching the text of the item
		 * @private
		 */
		VisibleItem.prototype._getRefs = function() {
			var oParent = this.getParent(),
				$refs,
				that = this;

			if (oParent && oParent.$("content")) {
				$refs = oParent.$("content").find("li").filter(function() {
					return jQuery(this).html() === that.getText();
				});
			}

			return $refs;
		};

		/**
		 * Sets the visible property of the item.
		 * @param {boolean} bValue If the item is visible
		 * @returns {*} this
		 * @public
		 */
		VisibleItem.prototype.setVisible = function(bValue) {
			if (this.getVisible() === bValue) {
				return;
			}

			var $refs = this._getRefs();
			if ($refs) {
				if (bValue) {
					$refs.removeClass('TPSliderItemHidden');
				} else {
					$refs.addClass('TPSliderItemHidden');
				}
			}
			return this.setProperty('visible', bValue, true);
		};

		return VisibleItem;
	});