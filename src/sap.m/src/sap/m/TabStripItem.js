/*!
 * ${copyright}
 */
// Provides control sap.m.TabStripItem.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Item", "sap/ui/base/ManagedObject", 'sap/ui/core/IconPool', './AccButton'],
	function(jQuery, library, Item, ManagedObject, IconPool, AccButton) {
		"use strict";

		/**
		 * Constructor for a new TabStripItem.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Items provide information about Error Messages in the page.
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
					 * Boolean property to show if a control is edited (default is false). Items that are marked as 'modified' have a star to indicate that they haven't been saved
					 */
					modified: {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations: {
					/**
					 * Internal aggregation to hold the close button
					 */
					_closeButton: { type : "sap.m.Button", multiple: false}
				},
				events: {
					/**
					 * Fired when the close button is pressed
					 */
					itemClosePressed: {
						allowPreventDefault: true,
						parameters: {
							/**
							 * Tab id of the tab to be closed
							 */
							item: {type: "sap.m.TabStripItem"}
						}
					},
					/**
					 * Let the outside world know that some of its properties has changed.
					 * @private
					 */
					itemPropertyChanged: {
						parameters: {
							itemChanged: {type: 'sap.m.TabStripItem'},
							propertyKey: {type: "string"},
							propertyValue:  {type: "mixed"}
						}
					},
					/**
					 * Fired when the tab item is selected
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
		TabStripItem.DISPLAY_TEXT_MAX_LENGHT = 25;
		TabStripItem._CSS_CLASS = "sapMTabContainerItem";
		TabStripItem._CSS_CLASS_LABEL = "sapMTabContainerItemLabel";
		TabStripItem._CSS_CLASS_BUTTON = "sapMTabContainerItemButton";
		TabStripItem.CSS_CLASS_STATE = "sapMTabStripSelectListItemModified";
		TabStripItem.CSS_CLASS_STATEINVISIBLE = "sapMTabStripSelectListItemModifiedInvisible";
		TabStripItem.CSS_CLASS_CLOSEBUTTON = 'sapMTabStripSelectListItemCloseBtn';


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
		 * Overriding of the setProperty method in order to avoid unnecessary rerendering.
		 *
		 * @override
		 * @param {string} sName The name of the property
		 * @param {string} sValue The value of the property
		 * @param {boolean} bSupressInvalidation
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
