/*!
 * ${copyright}
 */
// Provides control sap.m.TabStripItem.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Item", "sap/ui/base/ManagedObject", 'sap/ui/core/IconPool', './AccButton'],
	function(jQuery, library, Item, ManagedObject, IconPool, AccButton) {
		"use strict";

		/**
		 * Constructor for a new <code>TabStripItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <code>TabStripItem</code> provides information about Error Messages in the page.
		 * @extends sap.ui.core.Item
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.34
		 * @alias sap.m.TabStripItem
		 */
		var TabStripItem = Item.extend("sap.m.TabStripItem", /** @lends sap.m.TabStripItem.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {

					/**
					 * Shows if a control is edited (default is false). Items that are marked as modified have a * symbol to indicate that they haven't been saved.
					 */
					modified: {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations: {

					/**
					 * Internal aggregation to hold the Close button.
					 */
					_closeButton: { type : "sap.m.Button", multiple: false}
				},
				events: {

					/**
					 * Fired when the Close button is pressed.
					 */
					itemClosePressed: {
						allowPreventDefault: true,
						parameters: {

							/**
							 * Tab ID of the tab to be closed.
							 */
							item: {type: "sap.m.TabStripItem"}
						}
					},

					/**
					 * Sends information that some of the properties have changed.
					 * @private
					 */
					itemPropertyChanged: {
						parameters: {

							/**
							 * The <code>TabStripItem</code> that provoked the change.
							 */
							itemChanged: {type: 'sap.m.TabStripItem'},

							/**
							 * The property name to be changed.
							 */
							propertyKey: {type: "string"},

							/**
							 * The new property value.
							 */
							propertyValue:  {type: "mixed"}
						}
					},

					/**
					 * Fired when the <code>TabStripItem</code> is selected.
					 * ToDo: Is this needed? (Vesko)
					 */
					tabSelected: {
						parameters: {
							tab: {type: "sap.m.TabStripItem"}
						}
					}
				}
			}
		});


		// ToDo: change the constants names
		// ToDo: (2) move all css constants to an array constant
		/**
		 * The maximum text length of a <code>TabStripItem</code>.
		 * ToDo: Add underscore to the beginning to mark this constant private
		 * @type {number}
		 */
		TabStripItem.DISPLAY_TEXT_MAX_LENGHT = 25;

		/**
		 * The default CSS class name of <code>TabStripItem</code> in context of the <code>TabStrip</code>.
		 *
		 * @type {string}
		 * @private
		 */
		TabStripItem._CSS_CLASS = "sapMTabContainerItem";

		/**
		 * The default CSS class name of the <code>TabStripItem</code>'s label in context of <code>TabStrip</code>.
		 *
		 * @type {string}
		 * @private
		 */
		TabStripItem._CSS_CLASS_LABEL = "sapMTabContainerItemLabel";

		/**
		 * The default CSS class name of <code>TabStripItem</code>'s button in context of <code>TabStrip</code>.
		 *
		 * @type {string}
		 * @private
		 */
		TabStripItem._CSS_CLASS_BUTTON = "sapMTabContainerItemButton";

		/**
		 * The default CSS class name of <code>TabStripItem</code>'s modified state in context of <code>TabStripSelect</code>.
		 *
		 * @type {string}
		 */
		TabStripItem.CSS_CLASS_STATE = "sapMTabStripSelectListItemModified";

		/**
		 * The default CSS class name of <code>TabStripItem</code>'s invisible state in context of <code>TabStripSelect</code>.
		 *
		 * @type {string}
		 */
		TabStripItem.CSS_CLASS_STATEINVISIBLE = "sapMTabStripSelectListItemModifiedInvisible";

		/**
		 * The default CSS class name of <code>TabStripItem</code>'s Close button in context of <code>TabStripSelect</code>.
		 *
		 * @type {string}
		 */
		TabStripItem.CSS_CLASS_CLOSEBUTTON = 'sapMTabStripSelectListItemCloseBtn';

		TabStripItem.CSS_CLASS_CLOSEBUTTONINVISIBLE   = 'sapMTabStripSelectListItemCloseBtnInvisible';


		/**
		 * Initialise the instance
		 * @override
		 */
		TabStripItem.prototype.init = function () {
			var oButton = new AccButton({
				type: sap.m.ButtonType.Transparent,
				icon: IconPool.getIconURI("decline"),
				tabIndex: "-1",
				ariaHidden: "true"
			}).addStyleClass(TabStripItem.CSS_CLASS_CLOSEBUTTON);
			this.setAggregation('_closeButton', oButton);
		};

		/**
		 * Overrides the <code>setProperty</code> method in order to avoid unnecessary re-rendering.
		 *
		 * @override
		 * @param sName {string} The name of the property
		 * @param vValue {boolean | string | object} The value of the property
		 * @param bSupressInvalidation {boolean} Whether to suppress invalidation
		 */
		TabStripItem.prototype.setProperty = function (sName, vValue, bSupressInvalidation) {
			if (sName === 'modified') {
				bSupressInvalidation = true;
			}
			ManagedObject.prototype.setProperty.call(this, sName, vValue, bSupressInvalidation);

			// optimisation to not invalidate and rerender the whole parent DOM, but only manipulate the CSS class
			// for invisibility on the concrete DOM element that needs to change
			if (this.getParent() && this.getParent().changeItemState) {
				this.getParent().changeItemState(this.getId(), vValue);
			}

			this.fireItemPropertyChanged({
				itemChanged     : this,
				propertyKey     : sName,
				propertyValue   : vValue
			});

			return this;
		};

		return TabStripItem;

	}, /* bExport= */ false);
