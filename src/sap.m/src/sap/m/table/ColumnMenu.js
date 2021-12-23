/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/ResponsivePopover",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/library",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/base/strings/capitalize",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/p13n/Container",
	"sap/m/table/ColumnMenuRenderer"
], function (
	ResponsivePopover,
	Button,
	Toolbar,
	ToolbarSpacer,
	library,
	Control,
	Core,
	jQuery,
	capitalize,
	AbstractContainerItem,
	Container,
	ColumnMenuRenderer
) {
	"use strict";

	/**
	 * Constructor for a new ColumnMenu.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control is a popover, intended to be used by a table.
	 * It serves as a entry point for the table personalization via the column headers.
	 * The ColumnMenu is separated into two sections: quick actions and menu items.
	 *
	 * The top section of the popover contains contextual quick actions for the column the menu was triggered from.
	 * The lower section contains menu items, which consist of generic and global table settings.
	 *
	 * There are control- and application-specific quick actions and menu items.
	 * Applications are able to add their own quick actions, actions and items.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.ColumnMenu
	 */
	var ColumnMenu = Control.extend("sap.m.table.ColumnMenu", {
		metadata: {
			library: "sap.m",
			interfaces: ["sap.ui.core.IColumnHeaderMenu"],
			aggregations: {
				quickActions: { type: "sap.m.table.QuickActionBase" },
				items: { type: "sap.m.table.ItemBase" },
				_quickActions: { type: "sap.m.table.QuickActionBase", visibility: "hidden" },
				_items: { type: "sap.m.table.ItemBase", visibility: "hidden" }
			}
		}
	});

	var DEFAULT_KEY = "$default";
	var ARIA_POPUP_TYPE = sap.ui.core.aria.HasPopup.Dialog;

	ColumnMenu.prototype.applySettings = function (mSettings) {
		// Only works in JS views, but that's fine. This is only convenience for controls.
		if (mSettings) {
			this._addAllToPrivateAggregation(mSettings, "_quickActions");
			this._addAllToPrivateAggregation(mSettings, "_items");
		}
		Control.prototype.applySettings.apply(this, arguments);
	};

	/**
	 * Opens the popover at the specified target.
	 *
	 * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement, where the popover will be placed at.
	 * @public
	 */
	ColumnMenu.prototype.openBy = function(oAnchor) {
		if (!this.getParent()) {
			Core.getUIArea(Core.getStaticAreaRef()).addContent(this, true);
		}

		this._initPopover();

		if (!this._oItemsContainer) {
			this._initItemsContainer();
		}

		this._oPopover.openBy(oAnchor);
	};

	/**
	 * Returns the <code>sap.ui.core.aria.HasPopup<\code> type of the menu.
	 *
	 * @returns {sap.ui.core.aria.HasPopup} <code>sap.ui.core.aria.HasPopup<\code> type of the menu
	 * @public
	 * @since 1.98.0
	 */
	ColumnMenu.prototype.getAriaHasPopupType = function () {
		return ARIA_POPUP_TYPE;
	};

	/**
	 * Closes the popover.
	 *
	 * @public
	 */
	ColumnMenu.prototype.close = function () {
		this._previousView = null;
		if (this._oPopover) {
			this._oPopover.close();
		}
	};

	ColumnMenu.prototype.exit = function () {
		Control.prototype.exit.apply(this, arguments);
		if (this._oPopover) {
			delete this._oPopover;
		}
		if (this._oItemsContainer) {
			delete this._oItemsContainer;
		}
	};

	ColumnMenu.prototype._addAllToPrivateAggregation = function (mSettings, sAggregationName) {
		if (mSettings[sAggregationName]) {
			mSettings[sAggregationName].forEach(function (oItem) {
				this.addAggregation(sAggregationName, oItem);
			}.bind(this));
			delete mSettings[sAggregationName];
		}
	};

	ColumnMenu.prototype._initPopover = function () {
		if (this._oPopover) {
			return;
		}

		this._oPopover = new ResponsivePopover({
			showArrow: false,
			showHeader: false,
			placement: library.PlacementType.Bottom,
			content: new AssociativeControl({control: this, height: true}),
			contentWidth: "500px",
			horizontalScrolling: false,
			verticalScrolling: false,
			afterClose: [this.close, this]
		});
		this.addDependent(this._oPopover);

		this._oPopover.addEventDelegate({
			"onAfterRendering": this._focusItem
		}, this);

		if (this.getItems().length == 0 && !this.getAggregation("_items")) {
			this._oPopover.attachAfterOpen(this._focusInitialQuickAction.bind(this));
		}
	};

	ColumnMenu.prototype._initItemsContainer = function () {
		var aControlMenuItems = (this.getAggregation("_items") || []).reduce(function (aItems, oItem) {
			return aItems.concat(oItem.getEffectiveItems());
		}, []);
		var aApplicationMenuItems = this.getItems().reduce(function (aItems, oItem) {
			return aItems.concat(oItem.getEffectiveItems());
		}, []);

		if (!this._oItemsContainer) {
			this._createItemsContainer();
		}

		aControlMenuItems.forEach(function (oColumnMenuItem, iIndex) {
			this._addView(oColumnMenuItem);
			iIndex == 0 && this._oItemsContainer.addSeparator();
		}.bind(this));
		aApplicationMenuItems.forEach(function (oColumnMenuItem, iIndex) {
			this._addView(oColumnMenuItem);
			iIndex == 0 && this._oItemsContainer.addSeparator();
		}.bind(this));
	};

	var AssociativeControl = Control.extend("sap.m.table.AssociativeControl", {
		metadata: {
			"final": true,
			properties: {
				height: {type: "boolean", defaultValue: false}
			},
			associations: {
				control: {type: "sap.ui.core.Control"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oControl.getHeight() && oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(sap.ui.getCore().byId(oControl.getControl()));
				oRm.close("div");
			}
		}
	});

	ColumnMenu.prototype._addView = function (oColumnMenuItem) {
		var oItem = new AbstractContainerItem({
			content: new AssociativeControl({
				control: oColumnMenuItem.getContent(),
				height: true
			}),
			key: oColumnMenuItem.getId(),
			text: oColumnMenuItem.getLabel(),
			icon: oColumnMenuItem.getIcon()
		});

		this._oItemsContainer.addView(oItem);
		this._setItemVisibility(oColumnMenuItem, oColumnMenuItem.getVisible());
	};

	ColumnMenu.prototype._createItemsContainer = function () {
		var oColumnMenu = this;

		this._oBtnCancel =  new Button({
			text: this._getResourceText("table.COLUMNMENU_CANCEL"),
			press: function () {
				var sKey = oColumnMenu._oItemsContainer.getCurrentViewKey();
				if (oColumnMenu._fireEvent(Core.byId(sKey), "cancel")) {
					oColumnMenu.close();
					oColumnMenu.exit();
				}
			}
		});
		this._oBtnOk = new Button({
			text: this._getResourceText("table.COLUMNMENU_CONFIRM"),
			press: function () {
				var sKey = oColumnMenu._oItemsContainer.getCurrentViewKey();
				if (oColumnMenu._fireEvent(Core.byId(sKey), "confirm")) {
					oColumnMenu.close();
				}
			}
		});

		oColumnMenu._oItemsContainer = new Container({
			listLayout: true,
			defaultView: DEFAULT_KEY,
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					this._oBtnOk,
					this._oBtnCancel
				]
			}),
			beforeViewSwitch: function (oEvent) {
				var mParameters = oEvent.getParameters();

				if (mParameters.target !== "$default") {
					var oContainerItem = oColumnMenu._oItemsContainer.getView(mParameters.target);
					var oColumnMenuItem = oColumnMenu._getItemFromContainerItem(oContainerItem);
					if (oColumnMenuItem && oColumnMenuItem.firePress && !oColumnMenu._fireEvent(oColumnMenuItem, "press")) {
						oEvent.preventDefault();
						return;
					}
				}
			},
			afterViewSwitch: function (oEvent) {
				var mParameters = oEvent.getParameters();
				this.oLayout.setShowFooter(mParameters.target !== "$default");

				oColumnMenu._previousView = mParameters.source;
				if (mParameters.target !== "$default") {
					var oContainerItem = oColumnMenu._oItemsContainer.getView(mParameters.target);
					if (oContainerItem) {
						var oItem = oColumnMenu._getItemFromContainerItem(oContainerItem);
						oColumnMenu._updateButtonState(oItem);
					} else {
						var oContainerItem = oColumnMenu._oItemsContainer.getView(mParameters.target);
						var oItem = oColumnMenu._getItemFromContainerItem(oContainerItem);
						oItem && oItem.focus();
						this._oPopover && this._oPopover.invalidate();
					}
				}
			}
		});
		oColumnMenu._oItemsContainer.getHeader().addContentRight(new Button({
			text: this._getResourceText("table.COLUMNMENU_RESET"),
			press: function () {
				oColumnMenu._fireEvent(Core.byId(oColumnMenu._oItemsContainer.getCurrentViewKey()), "reset", false);
			}
		}));
		this._oPopover.addDependent(oColumnMenu._oItemsContainer);
		oColumnMenu.addDependent(oColumnMenu._oItemsContainer);
	};

	ColumnMenu.prototype._fireEvent = function (oColumnMenuEntry, sEventType, bAllowPreventDefault) {
		var fnHook = oColumnMenuEntry["on" + capitalize(sEventType)];
		if (bAllowPreventDefault !== false) {
			var oEvent = jQuery.Event(sEventType);
			fnHook.call(oColumnMenuEntry, oEvent);
			return !oEvent.isDefaultPrevented();
		} else {
			fnHook.call(oColumnMenuEntry);
			return true;
		}
	};

	ColumnMenu.prototype._getResourceText = function(sText, vValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return sText ? this.oResourceBundle.getText(sText, vValue) : this.oResourceBundle;
	};

	ColumnMenu.prototype._getItemFromContainerItem = function (oContainerItem) {
		// Low performance as linear search has to be done
		var oItem = this.getAggregation("_items") && this.getAggregation("_items").find(function(item) {
			return item.getId() == oContainerItem.getKey();
		});
		if (!oItem) {
			oItem = this.getAggregation("items") && this.getAggregation("items").find(function(item) {
				return item.getId() == oContainerItem.getKey();
			});
		}
		return oItem;
	};

	ColumnMenu.prototype._updateButtonState = function (oItem) {
		this._oItemsContainer.getHeader().getContentRight()[0].setEnabled(oItem.getButtonSettings()["reset"]["enabled"]);
		this._oItemsContainer.getHeader().getContentRight()[0].setVisible(oItem.getButtonSettings()["reset"]["visible"]);
		this._oBtnOk.setVisible(oItem.getButtonSettings()["confirm"]["visible"]);
		this._oBtnCancel.setVisible(oItem.getButtonSettings()["cancel"]["visible"]);
	};

	ColumnMenu.prototype._focusItem = function () {
		if (this._previousView == DEFAULT_KEY) {
			this._oItemsContainer._getNavBackBtn().focus();
		} else {
			var oItem = this._oItemsContainer._getNavigationList().getItems().find(function (oItem) {
				return oItem.getVisible() && oItem._key === this._previousView;
			}.bind(this));
			oItem && oItem.focus();
		}
	};

	ColumnMenu.prototype._focusInitialQuickAction = function () {
		// Does not work with content, which contains multiple items
		if (this.getItems().length == 0 && !this.getAggregation("_items")) {
			var aQuickActions = [];
			if (this.getAggregation("_quickActions")) {
				aQuickActions = this.getAggregation("_quickActions")[0].getEffectiveQuickActions();
			} else if (this.getQuickActions().length > 0) {
				aQuickActions = this.getQuickActions()[0].getEffectiveQuickActions();
			}
			aQuickActions.length > 0 && aQuickActions[0].getContent().focus();
		}
	};

	ColumnMenu.prototype._setItemVisibility = function (oItem, bVisible) {
		var oList = this._oItemsContainer._getNavigationList().getItems();
		var oListItem = oList.find(function (oListItem) {
			return oListItem._key == oItem.getId();
		});
		oListItem && oListItem.setVisible(bVisible);
	};

	return ColumnMenu;
});