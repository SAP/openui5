/*!
 * ${copyright}
 */

// Provides control sap.ui.table.RowAction
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', './TableUtils', './library', 'sap/ui/core/Icon', 'sap/ui/unified/Menu', 'sap/ui/core/Popup', './RowActionItem'],
function(jQuery, Control, TableUtils, library, Icon, Menu, Popup, RowActionItem) {
	"use strict";

	/**
	 * Constructor for a new RowAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>RowAction</code> control allows to display multiple action items which can be selected by the user.
	 * If more action items are available as the available space allows to display an overflow mechanism is provided.
	 * This control must only be used in the context of the <code>sap.ui.table.Table</code> control to define row actions.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.45.0
	 * @alias sap.ui.table.RowAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RowAction = Control.extend("sap.ui.table.RowAction", /** @lends sap.ui.table.RowAction.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {
			/**
			 * Whether the control should be visible on the screen. If set to <code>false</code>, the control is hidden.
			 */
			visible : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "items",
		aggregations : {
			/**
			 * The action items which should be displayed.
			 */
			items : {type : "sap.ui.table.RowActionItem", multiple : true},

			/*
			 * Hidden aggregation for the internally used icon controls.
			 */
			_icons : {type : "sap.ui.core.Icon", multiple : true, visibility: "hidden"},

			/*
			 * Hidden aggregation for the internally used menu control.
			 */
			_menu : {type : "sap.ui.unified.Menu", multiple : false, visibility: "hidden"}
		},
		events : {
		}

	}});

	RowAction.prototype.init = function() {
		var fnSetTooltip = function(vTooltip) {
			this.setAggregation("tooltip", vTooltip, true);
			this.setSrc(this.getSrc()); //Updates the title property
			return this;
		};

		var that = this;
		var oIcon = new Icon(this.getId() + "-icon0", {decorative: false, press: function(oEvent){that._handlePress(oEvent, true);}});
		oIcon.addStyleClass("sapUiTableActionIcon");
		oIcon.setTooltip = fnSetTooltip;
		this.addAggregation("_icons", oIcon);
		oIcon = new Icon(this.getId() + "-icon1", {decorative: false, press: function(oEvent){that._handlePress(oEvent, false);}});
		oIcon.addStyleClass("sapUiTableActionIcon");
		oIcon.setTooltip = fnSetTooltip;
		this.addAggregation("_icons", oIcon);

		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");

		this._iLen = 0;
		this._iCount = 2;
	};

	RowAction.prototype.onAfterRendering = function() {
		this._updateIcons();
	};

	RowAction.prototype._handlePress = function(oEvent, bFirst) {
		if (bFirst) {
			if (this._iLen == 1 || (this._iLen > 1 && this._iCount == 2)) {
				this._getVisibleItems()[0]._doFirePress();
			} else if (this._iLen > 1 && this._iCount == 1) {
				this._openMenu(bFirst);
			}
		} else {
			if (this._iLen == 2 && this._iCount == 2) {
				this._getVisibleItems()[1]._doFirePress();
			} else if (this._iLen > 2 && this._iCount == 2) {
				this._openMenu(bFirst);
			}
		}
	};

	RowAction.prototype._openMenu = function(bFirst) {
		var oMenu = this.getAggregation("_menu");
		if (!oMenu) {
			oMenu = new Menu();
			this.setAggregation("_menu", oMenu, true);
		}
		oMenu.removeAllItems();

		var aItems = this.getItems();
		for (var i = bFirst ? 0 : 1; i < aItems.length; i++) {
			oMenu.addItem(aItems[i]._getMenuItem());
		}

		oMenu.open(false, this, Popup.Dock.EndTop, Popup.Dock.EndBottom, this.getAggregation("_icons")[bFirst ? 0 : 1]);
	};

	RowAction.prototype._updateIcons = function(bForce) {
		var aItems = this._getVisibleItems(bForce);
		var aIcons = this.getAggregation("_icons");
		var $Icons = this.$().children();
		if (this._iLen == 0 || this._iCount == 0) {
			$Icons.toggleClass("sapUiTableActionHidden", true);
		} else if (this._iLen == 1 && this._iCount > 0) {
			aItems[0]._syncIcon(aIcons[0]);
			jQuery($Icons.get(0)).toggleClass("sapUiTableActionHidden", false);
			jQuery($Icons.get(1)).toggleClass("sapUiTableActionHidden", true);
		} else if (this._iLen == 2 && this._iCount == 2) {
			aItems[0]._syncIcon(aIcons[0]);
			aItems[1]._syncIcon(aIcons[1]);
			$Icons.toggleClass("sapUiTableActionHidden", false);
		} else if (this._iLen > 2 && this._iCount == 2) {
			aItems[0]._syncIcon(aIcons[0]);
			aIcons[1].setSrc("sap-icon://drop-down-list");
			aIcons[1].setTooltip(this._oResBundle.getText("TBL_ROW_ACTION_MORE"));
			$Icons.toggleClass("sapUiTableActionHidden", false);
		} else { // this._iLen > 2 && this._iCount == 1
			aIcons[0].setSrc("sap-icon://drop-down-list");
			aIcons[0].setTooltip(this._oResBundle.getText("TBL_ROW_ACTION_MORE"));
			jQuery($Icons.get(0)).toggleClass("sapUiTableActionHidden", false);
			jQuery($Icons.get(1)).toggleClass("sapUiTableActionHidden", true);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible, true);
		this.$().toggleClass("sapUiTableActionHidden", !bVisible);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.setTooltip = function(vTooltip) {
		this.setAggregation("tooltip", vTooltip, true);
		var sTooltip = this.getTooltip_AsString();
		if (!sTooltip) {
			this.$().removeAttr("title");
		} else {
			this.$().attr("title", sTooltip);
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.insertItem = function(oItem, iIndex) {
		this.insertAggregation("items", oItem, iIndex, true);
		this._updateIcons(true);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.addItem = function(oItem) {
		this.addAggregation("items", oItem, true);
		this._updateIcons(true);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.removeItem = function(vItem) {
		var oRemovedItem = this.removeAggregation("items", vItem, true);
		this._updateIcons(true);
		return oRemovedItem;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.removeAllItems = function() {
		var aRemovedItems = this.removeAllAggregation("items", true);
		this._updateIcons(true);
		return aRemovedItems;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	RowAction.prototype.destroyItems = function() {
		this.destroyAggregation("items", true);
		this._updateIcons(true);
		return this;
	};

	RowAction.prototype._getVisibleItems = function(bForce) {
		if (!this._aVisibleItems || bForce) {
			this._aVisibleItems = [];
			this._iLen = 0;

			var aItems = this.getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getVisible()) {
					this._aVisibleItems.push(aItems[i]);
					this._iLen++;
				}
			}
		}
		return this._aVisibleItems;
	};

	RowAction.prototype._getRow = function() {
		return this.getParent();
	};

	RowAction.prototype._getCount = function() {
		return this._iCount;
	};

	RowAction.prototype._setCount = function(iCount) {
		if (iCount < 0) {
			this._iCount = 0;
		} else if (iCount > 2) {
			this._iCount = 2;
		} else {
			this._iCount = iCount;
		}
		this._updateIcons();
	};

	return RowAction;

});
