/*
 * ! ${copyright}
 */

// Provides class sap.ui.rta.plugin.ContextMenu.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/Plugin',
	'sap/ui/dt/ContextMenuControl',
	'sap/ui/dt/OverlayRegistry'
], function(
	jQuery,
	Plugin,
	ContextMenuControl,
    OverlayRegistry
) {
	"use strict";

	/**
	 * Constructor for a new ContextMenu.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ContextMenu registers event handler to open the context menu. Menu entries can dynamically be added
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.ContextMenu
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ContextMenu = Plugin.extend("sap.ui.dt.plugin.ContextMenu", /** @lends sap.ui.rta.plugin.ContextMenu.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {
				contextElement : {
					type : "object"
				},
				styleClass: {
					type: "string"
				}
			},
			associations: {},
			events: {
				openedContextMenu: {},
				// TODO check if needed and how contextMenuControl handles it...
				closedContextMenu: {}
			}
		}
	});

	/**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ContextMenu.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachBrowserEvent("contextmenu", this._onContextMenu, this);
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	ContextMenu.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("contextmenu", this._onContextMenu, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
	};

	ContextMenu.prototype.init = function() {
		this._aMenuItems = [];
	};

	ContextMenu.prototype.exit = function() {
		delete this._aMenuItems;
		if (this._oContextMenuControl) {
			this._oContextMenuControl.destroy();
			delete this._oContextMenuControl;
		}
	};

	/**
	 * Add menu items in the following format
	 *
	 * @param {object} mMenuItem json object with the menu item settings
	 * @param {string} mMenuItem.id id, which corresponds to the text key
	 * @param {string} aMenuItems.text menu item text (translated)
	 * @param {function} mMenuItem.handler event handler if menu is selected, the element for which the menu was opened is passed to the handler
	 * @param {function} mMenuItem.startSection? function to determine if a new section should be started, the element for which the menu was opened
	 *        is passed to the handler, default false
	 * @param {function} mMenuItem.available? function to determine if the menu entry should be shown, the element for which the menu should be opened
	 *        is passed, default true
	 * @param {function} mMenuItem.enabled? function to determine if the menu entry should be enabled, the element for which the menu should be opened
	 *        is passed, default true
	 * @param {boolean} bRetrievedFromPlugin flag to mark if a menu item was retrieved from a plugin (in runtime)
	 */
	ContextMenu.prototype.addMenuItem = function(mMenuItem, bRetrievedFromPlugin) {
		var mMenuItemEntry = {
			menuItem : mMenuItem,
			fromPlugin : !!bRetrievedFromPlugin
		};
		this._aMenuItems.push(mMenuItemEntry);
	};

	/**
	 * Open the context menu with the items that have been added before or
	 * will be returned by the plugins.
	 * @param  {sap.ui.base.Event} oOriginalEvent Event that triggered the menu to open
	 * @param  {sap.ui.dt.ElementOverlay} oTargetOverlay Overlay where the menu was triggered
	 */
	ContextMenu.prototype.open = function(oOriginalEvent, oTargetOverlay) {
		this.setContextElement(oTargetOverlay.getElement());

		//Remove all previous entries retrieved by plugins (the list should always be rebuilt)
		this._aMenuItems = this._aMenuItems.filter(function(mMenuItemEntry){
			return !mMenuItemEntry.fromPlugin;
		});

		var aPlugins = this.getDesignTime().getPlugins();
		aPlugins.forEach(function(oPlugin){
			var aPluginMenuItems = oPlugin.getMenuItems(oTargetOverlay) || [];
			aPluginMenuItems.forEach(function(mMenuItem){
				this.addMenuItem(mMenuItem, true);
			}.bind(this));
		}.bind(this));

		var aMenuItems = this._aMenuItems.map(function(mMenuItemEntry){
			return mMenuItemEntry.menuItem;
		});

		aMenuItems = this._sortMenuItems(aMenuItems);

		this._oContextMenuControl = new ContextMenuControl();
		this._oContextMenuControl.addStyleClass(this.getStyleClass());
		this._oContextMenuControl.setMenuItems(aMenuItems, oTargetOverlay);
		this._oContextMenuControl.setOverlayDomRef(oTargetOverlay);
		this._oContextMenuControl.attachItemSelect(this._onItemSelected, this);
		this._oContextMenuControl.openMenu(oOriginalEvent, oTargetOverlay);
		this.fireOpenedContextMenu();
	};

	/**
	 * Collect menu items sorted by rank (entries without rank come first)
	 * @param  {object[]} aMenuItems List of menu items
	 * @return {object[]}            Returned a sorted list of menu items; higher rank come later
	 */
	ContextMenu.prototype._sortMenuItems = function(aMenuItems){
		return aMenuItems.sort(function(mFirstEntry, mSecondEntry){
			// Both entries do not have rank, do not change the order
			if (!mFirstEntry.rank && !mSecondEntry.rank){
				return 0;
			}
			// One entry does not have rank, push it to the front
			if (!mFirstEntry.rank && mSecondEntry.rank){
				return -1;
			}
			if (mFirstEntry.rank && !mSecondEntry.rank){
				return 1;
			}
			return mFirstEntry.rank - mSecondEntry.rank;
		});
	};

	/**
	 * Called when a context menu item gets selected by user
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @override
	 * @private
	 */
	ContextMenu.prototype._onItemSelected = function(oEvent) {
		var aSelection = [],
			oEventItem = oEvent.getParameter("item"),
			oContextElement = this.getContextElement(),
			sId = oEventItem.data("id");

		var aMenuItems = this._aMenuItems.map(function(mMenuItemEntry){
			return mMenuItemEntry.menuItem;
		});

		aMenuItems.some(function(oItem) {
			if (sId === oItem.id) {
				aSelection = this.getSelectedOverlays();

				jQuery.sap.assert(aSelection.length > 0, "sap.ui.rta - Opening context menu, with empty selection - check event order");

				if (!oEventItem.getSubmenu()) {
					var mPropertiesBag = {};
					mPropertiesBag.eventItem = oEventItem;
					mPropertiesBag.contextElement = oContextElement;
					oItem.handler(aSelection, mPropertiesBag);
				}
				return true;
			}
		}, this);
	};

	/**
	 * Handle context menu event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._onContextMenu = function(oEvent) {
		// hide browser-context menu
		oEvent.preventDefault();
		document.activeElement.blur();

		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		var sTargetClasses = oEvent.target.className;

		if (oOverlay && oOverlay.isSelectable() && sTargetClasses.indexOf("sapUiDtOverlay") > -1) {
			if (!oOverlay.isSelected()) {
				oOverlay.setSelected(true);
			}

			this.open(oEvent, oOverlay);
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._onKeyDown = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);

		if ((oEvent.keyCode === jQuery.sap.KeyCodes.F10) && (oEvent.shiftKey === true) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			// hide browser-context menu
			oEvent.preventDefault();
			oEvent.stopPropagation();
			if (oOverlay && oOverlay.isSelectable()) {
				if (!oOverlay.isSelected()) {
					oOverlay.setSelected(true);
				}
				var iWidth = oOverlay.$().width() / 2;
				var iHeight = oOverlay.$().height() / 2;
				var iTop = oOverlay.$().offset().top;
				var iLeft = oOverlay.$().offset().left;

				this.open({
					pageX: iLeft + iWidth,
					pageY: iTop + iHeight
				}, oOverlay);
			}
		}
	};

	return ContextMenu;
}, /* bExport= */true);
