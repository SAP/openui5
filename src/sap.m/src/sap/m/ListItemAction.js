/*!
 * ${copyright}
 */
sap.ui.define([
	"./library",
	"./ListItemActionBase",
	"./Button",
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/core/IconPool",
	"sap/ui/core/ShortcutHintsMixin"
],
	function(library, ListItemActionBase, Button, Device, Lib, IconPool, ShortcutHintsMixin) {
	"use strict";

	const ListItemActionType = library.ListItemActionType;
	const ButtonType = library.ButtonType;

	let oMenu = null;
	let MenuItemConstructor;
	let MenuConstructor;

	/**
	 * Constructor for a new action for list items.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.ListItemAction</code> control provides the option to define actions directly related to list items.
	 *
	 * @extends sap.ui.core.ListItemActionBase
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.137
	 * @alias sap.m.ListItemAction
	 */
	var ListItemAction = ListItemActionBase.extend("sap.m.ListItemAction", /** @lends sap.m.ListItemAction.prototype */ { metadata : {
		library : "sap.m",
		properties : {
			/**
			 * Defines the type of the action.
			 */
			type : {type : "sap.m.ListItemActionType", group : "Appearance", defaultValue : ListItemActionType.Custom}
		}
	}});

	ListItemAction._showMenu = async function(aActions, oOpener) {
		if (!MenuConstructor) {
			await (function() {
				return new Promise((resolve) => {
					sap.ui.require(["sap/m/Menu", "sap/m/MenuItem"], function(Menu, MenuItem) {
						MenuItemConstructor = MenuItem;
						MenuConstructor = Menu;
						resolve();
					});
				});
			})();
		}

		oMenu ??= new MenuConstructor({
			itemSelected: function(oEvent) {
				const oItem = oEvent.getParameter("item");
				const oAction = oItem.data("action");
				oAction._onActionPress();
			}
		});

		oMenu.destroyItems();
		aActions.forEach((oAction) => {
			const oActionInfo = oAction._getActionInfo();
			const oMenuItem = new MenuItemConstructor({
				text: oActionInfo.text,
				icon: oActionInfo.icon
			});
			oMenuItem.data("action", oAction);
			oMenu.addItem(oMenuItem);
		});
		oMenu.openBy(oOpener);
	};

	ListItemAction.prototype.init = function() {
		this._oAction = null;
	};

	ListItemAction.prototype.invalidate = function() {
		var oParent = this.getParent();
		if (oParent && oParent.bOutput) {
			ListItemActionBase.prototype.invalidate.apply(this, arguments);
		}
	};

	ListItemAction.prototype.setType = function(sType) {
		this.setProperty("type", sType);
		if (this._oAction) {
			this._oAction.destroy();
			this._oAction = null;
		}
		return this;
	};

	ListItemAction.prototype.setText = function(sText) {
		this.setProperty("text", sText, true);
		if (this._oAction && this.getType() === ListItemActionType.Custom) {
			this._oAction.setTooltip(sText);
		}
		return this;
	};

	ListItemAction.prototype.setIcon = function(sIcon) {
		this.setProperty("icon", sIcon, true);
		if (this._oAction && this.getType() === ListItemActionType.Custom) {
			this._oAction.setIcon(sIcon);
		}
		return this;
	};

	ListItemAction.prototype.exit = function() {
		this._oAction = null;
	};

	ListItemAction.prototype._onActionPress = function() {
		const oItem = this.getParent();
		const oList = oItem.getParent();
		oList._onItemActionPress(oItem, this);
	};

	ListItemAction.prototype._getActionInfo = function() {
		const oRB = Lib.getResourceBundleFor("sap.m");
		switch (this.getType()) {
			case ListItemActionType.Edit:
				return {
					icon: IconPool.getIconURI("edit"),
					text: oRB.getText("LIST_ITEM_EDIT"),
					shortcut: Device.os.macintosh ? "LIST_ITEM_EDIT_SHORTCUT_MAC" : "LIST_ITEM_EDIT_SHORTCUT"
				};
			case ListItemActionType.Delete:
				return {
					icon: IconPool.getIconURI("decline"),
					text: oRB.getText("LIST_ITEM_DELETE"),
					shortcut: "LIST_ITEM_DELETE_SHORTCUT"
				};
			default:
				return {
					icon: this.getIcon(),
					text: this.getText()
				};
		}
	};

	ListItemAction.prototype._getAction = function() {
		if (!this.getVisible()) {
			return null;
		}

		if (this._oAction) {
			return this._oAction;
		}

		const sType = this.getType().toLowerCase();
		const sActionId = this.getId() + "-" + sType;
		const mActionInfo = this._getActionInfo();

		this._oAction = new Button(sActionId, {
			icon: mActionInfo.icon,
			tooltip: mActionInfo.text,
			press: [this._onActionPress, this],
			type: ButtonType.Transparent
		});

		if (mActionInfo.shortcut) {
			ShortcutHintsMixin.addConfig(this._oAction, {
				messageBundleKey: mActionInfo.shortcut
			}, this._oAction);
		}

		this._oAction.useEnabledPropagator(false);
		this._oAction.addStyleClass("sapMLIAction");
		this.addDependent(this._oAction);
		return this._oAction;
	};

	return ListItemAction;
});
