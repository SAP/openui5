/*!
 * ${copyright}
 */

// Provides control sap.m.TabStripSelectList.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/SelectList', 'sap/m/TabStripItem', 'sap/ui/base/ManagedObject', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, SelectList, TabStripItem, ManagedObject) {
		"use strict";

		/**
	 * Constructor for a new TabStripSelectList.
		 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * The <code>sap.m.TabStripSelectList</code> displays a list of items that allows the user to select an item.
	 * @extends sap.m.SelectList
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.m.TabStripSelectList
	     * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var TabStripSelectList = SelectList.extend("sap.m.TabStripSelectList", /** @lends sap.m.TabStripSelectList.prototype */ {
			metadata: {
				library: "sap.m"
			},
			aggregations: {
				/**
				 * Defines the items contained within this control.
				 */
				items: { type: "sap.m.TabStripItem", multiple: false, singularName: "item" }
			}
		});

		// ToDo: align these with the file names (i.e. not tabselect but tabstripselect)
		TabStripSelectList.CSS_CLASS_SELECTLIST             = 'sapMSelectList';
		TabStripSelectList.CSS_CLASS_TABSELECTLIST          = 'sapMTabStripSelectList';
		TabStripSelectList.CSS_CLASS_CLOSEBUTTON            = 'sapMTabStripSelectListItemCloseBtn';
		TabStripSelectList.CSS_CLASS_CLOSEBUTTONINVISIBLE   = 'sapMTabStripSelectListItemCloseBtnInvisible'; // ToDo: this belongs to item

	/**
	 * Initialize the control instance
	 * @override
	 * @private
	 */
		TabStripSelectList.prototype.init = function () {
			SelectList.prototype.init.call(this);
			this.addStyleClass(TabStripSelectList.CSS_CLASS_SELECTLIST);
			this.addStyleClass(TabStripSelectList.CSS_CLASS_TABSELECTLIST);
		};


		/**
	 * Override the method in order to attach event listeners
		 * @override
		 * @private
		 */
		TabStripSelectList.prototype.onAfterRendering = function () {
			SelectList.prototype.onAfterRendering.apply(this, arguments);
			var oDomRef = this.getDomRef();
			oDomRef.addEventListener("mouseenter", jQuery.proxy(TabStripSelectList.prototype.mouseenter, this), true);
			oDomRef.addEventListener("mouseleave", jQuery.proxy(TabStripSelectList.prototype.mouseleave, this), true);
		};

		/**
	 * Handles the mouseenter event.
		 *
	 * @param {jQuery.Event} oEvent Event object
		 */
		TabStripSelectList.prototype.mouseenter = function (oEvent) {
			var oControl = jQuery(oEvent.target).control(0);
			if (sap.ui.Device.system.desktop && // close button always visible on phone and tablet
				oControl instanceof sap.m.TabStripItem && // only this type has _closeButton aggregation
				this.getSelectedItem() !== oControl
			) {
					oControl.getAggregation('_closeButton').$().removeClass(TabStripSelectList.CSS_CLASS_CLOSEBUTTONINVISIBLE);
			}
		};

		/**
	 * Handles the mouseleave event.
		 *
	 * @param {jQuery.Event} oEvent Event object
		*/
		TabStripSelectList.prototype.mouseleave = function (oEvent) {
			var oControl = jQuery(oEvent.target).control(0);
			if (
				sap.ui.Device.system.desktop && // close button always visible on phone and tablet
				oControl instanceof sap.m.TabStripItem && // only this type has _closeButton aggregation
				jQuery(oEvent.target).hasClass('sapMSelectListItem') &&
				this.getSelectedItem() !== oControl
			) {
					oControl.getAggregation('_closeButton').$().addClass(TabStripSelectList.CSS_CLASS_CLOSEBUTTONINVISIBLE);
			}
		};

		/**
		 * Activates an item on the list.
		 *
		 * @param {sap.ui.core.Item} oItem The item to be activated.
		 * @private
		*/
		TabStripSelectList.prototype._activateItem = function(oItem) {
			if (oItem instanceof sap.ui.core.Item && oItem && oItem.getEnabled()) {
				this.fireItemPress({
					item: oItem
				});

				var oPrevSelectedItem = this.getSelectedItem();
				if (oPrevSelectedItem && oPrevSelectedItem !== oItem) {
					if (sap.ui.Device.system.desktop) {
						// close button is always visible on phone and tablet
						oPrevSelectedItem.getAggregation('_closeButton').addStyleClass(TabStripSelectList.CSS_CLASS_CLOSEBUTTONINVISIBLE);
					}
				}
				this.setSelection(oItem);
				this.fireSelectionChange({
					selectedItem: oItem
				});
			}
		};


		/**
	     * Change the visibility of the item "state" symbol
		 * @param {mixed} vItemId
		 * @param {boolean} bShowState
		 */
		TabStripSelectList.prototype.changeItemState = function(vItemId, bShowState) {
			// ToDo: remove this hack !? - for some reason these are 'undefined' - can it be the lazy loading?
			TabStripItem.CSS_CLASS_STATE            = "sapMTabStripSelectListItemModified";
			TabStripItem.CSS_CLASS_STATEINVISIBLE   = "sapMTabStripSelectListItemModifiedInvisible";


			var $oItemState;

			// optimisation to not invalidate and rerender the whole parent DOM, but only manipulate the CSS class
			// for invisibility on the concrete DOM element that needs to change
			var aItems = this.getItems();
			aItems.forEach(function (oItem) {
				if (vItemId === oItem.getId()) {
					$oItemState = jQuery(oItem.$().children('.' + TabStripItem.CSS_CLASS_STATE)[0]);
					if (bShowState === true) {
						$oItemState.removeClass(TabStripItem.CSS_CLASS_STATEINVISIBLE);
					} else if (!$oItemState.hasClass(TabStripItem.CSS_CLASS_STATEINVISIBLE)) {
						$oItemState.addClass(TabStripItem.CSS_CLASS_STATEINVISIBLE);
					}
				}
			});
		};

		return TabStripSelectList;

	}, /* bExport= */ true);
