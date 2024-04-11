/*!
 * ${copyright}
 */

// Provides control sap.ui.table.RowAction
sap.ui.define([
	"./library",
	"./utils/TableUtils",
	"./RowActionRenderer",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/unified/Menu",
	"sap/ui/core/Popup"
], function(
	library,
	TableUtils,
	RowActionRenderer,
	Control,
	Icon,
	Menu,
	Popup
) {
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
	 * @since 1.45
	 * @alias sap.ui.table.RowAction
	 */
	const RowAction = Control.extend("sap.ui.table.RowAction", /** @lends sap.ui.table.RowAction.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				/**
				 * Whether the control should be visible on the screen. If set to <code>false</code>, the control is hidden.
				 */
				visible: {type: "boolean", group: "Misc", defaultValue: true}
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * The action items which should be displayed.
				 */
				items: {type: "sap.ui.table.RowActionItem", multiple: true},

				/*
				 * Hidden aggregation for the internally used icon controls.
				 */
				_icons: {type: "sap.ui.core.Icon", multiple: true, visibility: "hidden"},

				/*
				 * Hidden aggregation for the internally used menu control.
				 */
				_menu: {type: "sap.ui.unified.Menu", multiple: false, visibility: "hidden"}
			},
			events: {}
		},
		renderer: RowActionRenderer
	});

	RowAction.prototype.init = function() {
		/*
		 * Enables or disables the fixed layout.
		 * If enabled, the position of the icons is stable.
		 *
		 * @type {boolean}
		 */
		this._bFixedLayout = true;

		this._aActions = ["", ""];
		this._iLastCloseTime = 0;

		this.addAggregation("_icons", new Icon(this.getId() + "-icon0", {
				decorative: false,
				press: [this._onIconPress, this]
			})
			.addStyleClass("sapUiTableActionIcon"))
			.addDelegate({
				onAfterRendering: function() {
					const oIconDomRef = this.getAggregation("_icons")[0].getDomRef();

					if (this._aActions[0] === "menu") {
						oIconDomRef.setAttribute("aria-haspopup", "menu");
					} else {
						oIconDomRef.removeAttribute("aria-haspopup");
					}
				}
			}, this);

		this.addAggregation("_icons", new Icon(this.getId() + "-icon1", {
				decorative: false,
				press: [this._onIconPress, this]
			})
			.addStyleClass("sapUiTableActionIcon"))
			.addDelegate({
				onAfterRendering: function() {
					const oIconDomRef = this.getAggregation("_icons")[1].getDomRef();

					if (this._aActions[1] === "menu") {
						oIconDomRef.setAttribute("aria-haspopup", "menu");
					} else {
						oIconDomRef.removeAttribute("aria-haspopup");
					}
				}
			}, this);
	};

	RowAction.prototype.onBeforeRendering = function() {
		const oRow = this.getRow();
		const oTable = oRow ? oRow.getTable() : null;
		const aIcons = this.getAggregation("_icons");
		const aItems = this.getItems();
		const aVisibleItems = this._getVisibleItems();
		const iVisibleItems = aVisibleItems.length;
		const iSize = this._getSize();
		const sHeaderLabelId = oTable ? oTable.getId() + "-rowacthdr" : "";

		if (this._bFixedLayout && iVisibleItems === 1 && iSize === 2 && aItems.length > 1 && aVisibleItems[0] === aItems[1]) {
			aVisibleItems[0]._syncIcon(aIcons[1]);
			this._aActions = ["", "action_fixed"];
		} else if (iVisibleItems === 0 || iSize === 0) {
			this._aActions = ["", ""];
		} else if (iVisibleItems === 1 && iSize > 0) {
			aVisibleItems[0]._syncIcon(aIcons[0]);
			this._aActions = ["action", ""];
		} else if (iVisibleItems === 2 && iSize === 2) {
			aVisibleItems[0]._syncIcon(aIcons[0]);
			aVisibleItems[1]._syncIcon(aIcons[1]);
			this._aActions = ["action", "action"];
		} else if (iVisibleItems > 2 && iSize === 2) {
			aVisibleItems[0]._syncIcon(aIcons[0]);
			aIcons[1].setSrc("sap-icon://overflow");
			aIcons[1].setTooltip(TableUtils.getResourceText("TBL_ROW_ACTION_MORE"));
			this._aActions = ["action", "menu"];
		} else { // iVisibleItems > 2 && iSize === 1
			aIcons[0].setSrc("sap-icon://overflow");
			aIcons[0].setTooltip(TableUtils.getResourceText("TBL_ROW_ACTION_MORE"));
			this._aActions = ["menu", ""];
		}

		aIcons.forEach(function(oIcon, iIndex) {
			oIcon.removeAllAriaLabelledBy();
			oIcon.removeStyleClass("sapUiTableActionHidden");

			if (sHeaderLabelId) {
				oIcon.addAriaLabelledBy(sHeaderLabelId);
			}

			if (this._aActions[iIndex] === "") {
				oIcon.addStyleClass("sapUiTableActionHidden");
			}
		}.bind(this));
	};

	/*
	 * @override
	 * @inheritDoc
	 */
	RowAction.prototype.getAccessibilityInfo = function() {
		const oRow = this.getRow();
		const iVisibleItems = this._getVisibleItems().length;
		const iSize = this._getSize();
		const bActive = this.getVisible() && iVisibleItems > 0 && iSize > 0
					  && (!oRow || (!oRow.isContentHidden() && !oRow.isGroupHeader() && !oRow.isSummary()));
		let sText;

		if (bActive) {
			sText = TableUtils.getResourceText(iVisibleItems === 1
											   ? "TBL_ROW_ACTION_SINGLE_ACTION"
											   : "TBL_ROW_ACTION_MULTIPLE_ACTION", [iVisibleItems]);
		} else {
			sText = TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION");
		}

		return {
			focusable: bActive,
			enabled: bActive,
			description: sText
		};
	};

	/**
	 * Gets the visible items. Only takes into account the visibility of the items, not whether, for example, the content of the row is hidden.
	 *
	 * @returns {sap.ui.table.RowActionItem[]} Returns the visible items.
	 * @private
	 */
	RowAction.prototype._getVisibleItems = function() {
		return this.getItems().filter(function(oItem) {
			return oItem.getVisible();
		});
	};

	/**
	 * Gets the instance of the row this control belongs to.
	 *
	 * @returns {sap.ui.table.Row|null} Row instance this control belongs to, or <code>null</code> if not a child of a row.
	 * @private
	 */
	RowAction.prototype.getRow = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Row") ? oParent : null;
	};

	/**
	 * Returns the size indicating the number of icons that can be displayed.
	 *
	 * @returns {int} The number of icons.
	 * @private
	 */
	RowAction.prototype._getSize = function() {
		const oRow = this.getRow();
		const oTable = oRow ? oRow.getTable() : null;
		return oTable ? oTable.getRowActionCount() : 2;
	};

	/**
	 * Press Event handler for the inner icons.
	 *
	 * @param {sap.ui.base.Event} oEvent The press event of the icon
	 * @private
	 */
	RowAction.prototype._onIconPress = function(oEvent) {
		const oIcon = oEvent.getSource();
		const iIconIndex = this.indexOfAggregation("_icons", oIcon);
		const sAction = this._aActions[iIconIndex];

		if (sAction === "action") {
			this._getVisibleItems()[iIconIndex]._firePress();
		} else if (sAction === "action_fixed") {
			this._getVisibleItems()[0]._firePress();
		} else if (sAction === "menu") {
			let oMenu = this.getAggregation("_menu");
			if (!oMenu) {
				oMenu = new Menu();
				this.setAggregation("_menu", oMenu, true);
				oMenu.getPopup().attachClosed(function() {
					this._iLastCloseTime = Date.now();
				}, this);
			}
			oMenu.removeAllItems();

			if (Date.now() - this._iLastCloseTime < 500) {
				//Skip menu opening when the menu was closed directly before
				return;
			}

			const aItems = this.getItems();
			for (let i = iIconIndex; i < aItems.length; i++) {
				oMenu.addItem(aItems[i]._getMenuItem());
			}

			oMenu.open(null, oIcon, Popup.Dock.EndTop, Popup.Dock.EndBottom, oIcon);
		}
	};

	return RowAction;
});