/*!
 * ${copyright}
 */

// Provides control sap.m.MenuListItem.
sap.ui.define([
	'./ListItemBase',
	'./library',
	"sap/ui/core/Element",
	'sap/ui/core/IconPool',
	'sap/ui/core/library',
	'./MenuListItemRenderer',
	'sap/m/Image'
],
	function(ListItemBase, library, Element, IconPool, coreLibrary, MenuListItemRenderer, Image) {
		"use strict";

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

		// shortcut for sap.ui.core.ItemSelectionMode
		var ItemSelectionMode = coreLibrary.ItemSelectionMode;

		/**
		 * Constructor for a new <code>MenuListItem</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The <code>sap.m.MenuListItem</code> is a list item used in the <code>sap.m.Menu</code>.
		 * @extends sap.m.ListItemBase
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.MenuListItem
		 */
		var MenuListItem = ListItemBase.extend("sap.m.MenuListItem", /** @lends sap.m.MenuListItem.prototype */ {
			metadata : {

				library : "sap.m",
				properties : {

					/**
					 * Enabled items can be selected.
					 */
					enabled : {type : "boolean", group : "Misc", defaultValue : true},

					/**
					 * Defines the title of the <code>MenuListItem</code>.
					 */
					title : {type : "string", group : "Misc", defaultValue : null},

					/**
					 * Defines the icon of the <code>MenuListItem</code>.
					 */
					icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

					/**
					 * By default, one or more requests are sent to get the density perfect version of the icon if the given version of the icon doesn't exist on the server.
					 * <b>Note:</b> If bandwidth is a key factor for the application, set this value to <code>false</code>.
					 */
					iconDensityAware : {type : "boolean", group : "Misc", defaultValue : true},

					/**
					 * Defines the selection mode of the child items (e.g. <code>None</code>, <code>SingleSelect</code>, <code>MultiSelect</code>)
					 */
					itemSelectionMode : {type : "sap.ui.core.ItemSelectionMode", group : "Behavior", defaultValue : ItemSelectionMode.None},

					/**
					 * Defines the <code>title</code> text directionality with enumerated options. By default, the control inherits text direction from the DOM.
					 */
					titleTextDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

					/**
					 * Defines whether a visual separator should be rendered before the item.
					 * <b>Note:</b> If an item is invisible, its separator is also not displayed.
					 */
					startsSection : {type : "boolean", group : "Behavior", defaultValue : false}
				},
				associations: {

					/**
					 * MenuItemGroup associated with this item.
					 */
					_group : {type : "sap.ui.unified.MenuItemGroup",  group : "Behavior", visibility : "hidden"},

					/**
					 * The <code>MenuItem</code> that this control renders.
					 * Used internally in sap.m.Menu.
					 */
					menuItem: { type: "sap.m.MenuItem", multiple: false }
				}
			},

			renderer: MenuListItemRenderer
		});


		MenuListItem.prototype.exit = function() {
			if (this._image) {
				this._image.destroy();
			}

			if (this._imageRightArrow) {
				this._imageRightArrow.destroy();
			}

			ListItemBase.prototype.exit.apply(this, arguments);
		};


		/**
		 * @private
		 * @param {string} sImgId The ID of the image
		 * @param {string} sImgStyle The style of the image
		 * @param {string} sSrc The source of the image
		 * @param {boolean} bIconDensityAware If the icon is density aware
		 * @returns {object} The image
		 */
		MenuListItem.prototype._getImage = function(sImgId, sImgStyle, sSrc, bIconDensityAware) {
			var oImage = this._image;

			if (oImage) {
				oImage.setSrc(sSrc);
				if (oImage.isA("sap.m.Image")) {
					oImage.setDensityAware(bIconDensityAware);
				}
			} else {
				oImage = IconPool.createControlByURI({
					id: sImgId,
					src : sSrc,
					densityAware : bIconDensityAware,
					useIconTooltip : false
				}, Image).setParent(this, null, true);
			}

			if (oImage.isA("sap.m.Image")) {
				oImage.addStyleClass(sImgStyle, true);
			} else {
				oImage.addStyleClass(sImgStyle + "Icon", true);
			}

			this._image = oImage;
			return this._image;
		};

		/**
		 * @private
		 */
		MenuListItem.prototype._getIconArrowRight = function() {
			if (!this._imageRightArrow) {
				this._imageRightArrow = IconPool.createControlByURI({
					id: this.getId() + "-arrowRight",
					src : "sap-icon://slim-arrow-right",
					useIconTooltip : false
				}, Image).setParent(this, null, true);
				this._imageRightArrow.addStyleClass("sapMMenuLIArrowRightIcon", true);
			}

			return this._imageRightArrow;
		};

		MenuListItem.prototype._hasSubItems = function() {
			return !!(this.getMenuItem() && Element.getElementById(this.getMenuItem())._getItems().length);
		};

		MenuListItem.prototype.setProperty = function(sPropertyKey, vPropertyValue) {
			ListItemBase.prototype.setProperty.apply(this, arguments);
			this.fireEvent("propertyChanged", {propertyKey: sPropertyKey, propertyValue: vPropertyValue });
			if (sPropertyKey === "enabled") {
				this.setType(vPropertyValue ? ListType.Active : ListType.Inactive);
			}
		};

		MenuListItem.prototype._getMenuItemGroup = function() {
			return Element.getElementById(this.getAssociation("_group"));
		};

		MenuListItem.prototype._getItemSelectionMode = function() {
			var oGroup = this._getMenuItemGroup();
			return oGroup ? oGroup.getItemSelectionMode() : ItemSelectionMode.None;
		};

		MenuListItem.prototype._hasGroupSeparator = function() {
			var oMenuItem = Element.getElementById(this.getMenuItem()),
				oMenuItemParent = oMenuItem && oMenuItem.getParent(),
				aItems,
				iIndex;

			if (!oMenuItemParent) {
				return false;
			}

			if (oMenuItemParent.getItemSelectionMode) {
				oMenuItemParent = oMenuItemParent.getParent();
			}

			aItems = oMenuItemParent._getItems();
			iIndex = aItems.indexOf(oMenuItem);

			return iIndex > 0 && aItems[iIndex - 1] && aItems[iIndex - 1].getAssociation("_group") !== oMenuItem.getAssociation("_group");
		};

		return MenuListItem;
	});

