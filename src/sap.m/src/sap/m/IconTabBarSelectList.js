/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabBarSelectList.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control',
	'sap/ui/core/delegate/ItemNavigation'],
	function(jQuery, library, Control,
			ItemNavigation) {
		"use strict";

		/**
		 * Constructor for a new <code>sap.m.IconTabBarSelectList</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class
		 * The <code>sap.m.IconTabBarSelectList</code> displays a list of items that allows the user to select an item.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.42.0
		 * @alias sap.m.IconTabBarSelectList
		 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
		 */
		var IconTabBarSelectList = Control.extend("sap.m.IconTabBarSelectList", /** @lends sap.m.IconTabBarSelectList.prototype */ {
			metadata: {
				library: "sap.m",
				aggregations : {
					/**
					 * The items displayed in the list.
					 */
					items : {type : "sap.m.IconTabFilter", multiple : true, singularName : "item"}
				},
				events: {
					/**
					 * This event is fired when the selection has changed.
					 *
					 * <b>Note: </b> The selection can be changed by pressing a non-selected item,
					 * via keyboard and after the Enter or Space key is pressed.
					 */
					selectionChange: {
						parameters: {
							/**
							 * The selected item.
							 */
							selectedItem: { type: "sap.m.IconTabFilter" }
						}
					}
				}
			}
		});

		/**
		 * Initializes the control.
		 * @private
		 * @override
		 */
		IconTabBarSelectList.prototype.init = function () {
			this._itemNavigation = new ItemNavigation();
			this._itemNavigation.setCycling(false);
			this.addEventDelegate(this._itemNavigation);

			this._itemNavigation.setPageSize(10);
		};

		/**
		 * Clears the control dependencies.
		 * @private
		 */
		IconTabBarSelectList.prototype.exit = function () {
			if (this._itemNavigation) {
				this._itemNavigation.destroy();
			}
		};

		IconTabBarSelectList.prototype.onAfterRendering = function () {
			var item,
				items = this.getItems(),
				domRefs = [];

			for (var i = 0; i < items.length; i++) {
				item = items[i];
				domRefs.push(item.getDomRef());
			}


			this._itemNavigation.setRootDomRef(this.getDomRef());
			this._itemNavigation.setItemDomRefs(domRefs);
		};

		IconTabBarSelectList.prototype.setSelectedItem = function (item) {
			if (this._selectedItem) {
				this._deselectItem(this._selectedItem);
			}

			if (item) {
				this._selectItem(item);
			}

			this._selectedItem = item;
		};

		IconTabBarSelectList.prototype.getSelectedItem = function () {
			return this._selectedItem;
		};

		/**
		 * Deselects an item.
		 * @private
		 */
		IconTabBarSelectList.prototype._deselectItem = function(item) {
			var $item = item.$();
			if ($item) {
				$item.removeClass('sapMITBSelectItemSelected');
				$item.removeAttr('aria-selected');
			}
		};

		/**
		 * Selects an item.
		 * @private
		 */
		IconTabBarSelectList.prototype._selectItem = function(item) {
			var $item = item.$();
			if ($item) {
				$item.addClass('sapMITBSelectItemSelected');
				$item.attr('aria-selected', true);
			}
		};

		/**
		 * Handles tap event.
		 * @private
		 */
		IconTabBarSelectList.prototype.ontap = function (event) {

			var source = event.target;
			var $target = jQuery(source);

			if (!$target.hasClass('sapMITBSelectItem')) {
				$target = $target.parent(".sapMITBSelectItem");
			}

			var source = sap.ui.getCore().byId($target[0].id);
			if (source && source.getEnabled()) {

				event.preventDefault();

				if (source != this.getSelectedItem()) {
					this._selectItem(source);
					this.fireSelectionChange({
						selectedItem: source
					});
				}
			}

			if (this._iconTabHeader) {
				this._iconTabHeader._closeOverflow();
			}
		};

		IconTabBarSelectList.prototype.onsapenter = IconTabBarSelectList.prototype.ontap;
		IconTabBarSelectList.prototype.onsapspace = IconTabBarSelectList.prototype.ontap;

		return IconTabBarSelectList;

	}, /* bExport= */ true);