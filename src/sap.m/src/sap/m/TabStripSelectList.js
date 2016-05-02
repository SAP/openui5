/*!
 * ${copyright}
 */

// Provides control sap.m.TabStripSelectList.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/SelectList', 'sap/m/TabStripItem'],
	function(jQuery, library, Control, SelectList, TabStripItem) {
		"use strict";

		/**
		 * Constructor for a new <code>TabStripSelectList</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
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
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model
		 */
		var TabStripSelectList = SelectList.extend("sap.m.TabStripSelectList", /** @lends sap.m.TabStripSelectList.prototype */ {
			metadata: {
				library: "sap.m"
			}
		});

		/**
		 * The default CSS class name of <code>SelectList</code>.
		 *
		 * @type {string}
		 */
		TabStripSelectList.CSS_CLASS_SELECTLIST = 'sapMSelectList';

		/**
		 * The default CSS class name of <code>TabStripSelectList</code>.
		 *
		 * @type {string}
		 */
		TabStripSelectList.CSS_CLASS_TABSTRIPSELECTLIST = 'sapMTabStripSelectList';

		/**
		 * Initializes the control.
		 *
		 * @override
		 * @public
		 */
		TabStripSelectList.prototype.init = function () {
			SelectList.prototype.init.call(this);
			this.addStyleClass(TabStripSelectList.CSS_CLASS_SELECTLIST);
			this.addStyleClass(TabStripSelectList.CSS_CLASS_TABSTRIPSELECTLIST);
		};

		/**
		 * Overrides the method in order to attach event listeners.
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
		 * Handles the <code>mouseenter</code> event.
		 *
		 * @param oEvent {jQuery.Event} Event object
		 */
		TabStripSelectList.prototype.mouseenter = function (oEvent) {
			var oControl = jQuery(oEvent.target).control(0);
			if (sap.ui.Device.system.desktop && // close button always visible on phone and tablet
				oControl instanceof sap.m.TabStripItem && // only this type has _closeButton aggregation
				this.getSelectedItem() !== oControl
			) {
					oControl.getAggregation('_closeButton').$().removeClass(TabStripItem.CSS_CLASS_CLOSE_BUTTON_INVISIBLE);
			}
		};

		/**
		 * Handles the <code>mouseleave</code> event.
		 *
		 * @param oEvent {jQuery.Event} Event object
		*/
		TabStripSelectList.prototype.mouseleave = function (oEvent) {
			var oControl = jQuery(oEvent.target).control(0);
			if (
				sap.ui.Device.system.desktop && // close button always visible on phone and tablet
				oControl instanceof sap.m.TabStripItem && // only this type has _closeButton aggregation
				jQuery(oEvent.target).hasClass('sapMSelectListItem') &&
				this.getSelectedItem() !== oControl
			) {
					oControl.getAggregation('_closeButton').$().addClass(TabStripItem.CSS_CLASS_CLOSE_BUTTON_INVISIBLE);
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

				if (this.fireSelectionChange({selectedItem: oItem})) {
					var oPrevSelectedItem = this.getSelectedItem();
					if (oPrevSelectedItem && oPrevSelectedItem !== oItem) {
						if (sap.ui.Device.system.desktop) {
							// close button is always visible on phone and tablet
							oPrevSelectedItem.getAggregation('_closeButton').addStyleClass(TabStripItem.CSS_CLASS_CLOSE_BUTTON_INVISIBLE);
						}
					}
					this.setSelection(oItem);
				}
			}
		};

		/**
		 * Changes the visibility of the item's state symbol (*).
		 * @param {mixed} vItemId
		 * @param {boolean} bShowState
		 */
		TabStripSelectList.prototype.changeItemState = function(vItemId, bShowState) {
			var $oItemState;

			// optimisation to not invalidate and re-render the whole parent DOM, but only manipulate the CSS class
			// for invisibility on the concrete DOM element that needs to change
			var aItems = this.getItems();
			aItems.forEach(function (oItem) {
				if (vItemId === oItem.getId()) {
					$oItemState = jQuery(oItem.$().children('.' + TabStripItem.CSS_CLASS_STATE)[0]);
					if (bShowState === true) {
						$oItemState.removeClass(TabStripItem.CSS_CLASS_STATE_INVISIBLE);
					} else if (!$oItemState.hasClass(TabStripItem.CSS_CLASS_STATE_INVISIBLE)) {
						$oItemState.addClass(TabStripItem.CSS_CLASS_STATE_INVISIBLE);
					}
				}
			});
		};

		/**
		 * Override the method in order to force 'allowPreventDefault' to 'true'.
		 * @override
		 * @param {object} mParameters Parameters to be included in the event
		 * @returns {sap.ui.core.support.Support|sap.ui.base.EventProvider|boolean|sap.ui.core.Element|*}
		 */
		TabStripSelectList.prototype.fireSelectionChange = function(mParameters) {
			var bAllowPreventDefault = true;
			return this.fireEvent("selectionChange", mParameters, bAllowPreventDefault);
		};

		return TabStripSelectList;
	}, /* bExport= */ true);
