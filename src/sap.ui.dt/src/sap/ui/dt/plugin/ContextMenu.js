/*
 * ! ${copyright}
 */

// Provides class sap.ui.rta.plugin.ContextMenu.
sap.ui.define([
	'jquery.sap.global', 'sap/ui/dt/Plugin', 'sap/ui/dt/ContextMenuControl'
], function(jQuery, Plugin, ContextMenuControl) {
	"use strict";

	/**
	 * Constructor for a new ContextMenu.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ContextMenu registers event handler to open the context menu. Menu entries can dynamically be added
	 * @extends sap.ui.core.ManagedObject
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
			properties: {},
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
		delete this._oElement;
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
	 */
	ContextMenu.prototype.addMenuItem = function(mMenuItem) {
		this._aMenuItems.push(mMenuItem);
	};

	ContextMenu.prototype.open = function(oOriginalEvent, oTargetOverlay) {
		this._oElement = oTargetOverlay.getElementInstance();

		this._oContextMenuControl = new ContextMenuControl();
		this._oContextMenuControl.setMenuItems(this._aMenuItems, this._oElement);
		this._oContextMenuControl.setOverlayDomRef(oTargetOverlay);
		this._oContextMenuControl.attachItemSelect(this._onItemSelected, this);

		this._oContextMenuControl.openMenu({
			pageX: oOriginalEvent.pageX,
			pageY: oOriginalEvent.pageY
		});

		this.fireOpenedContextMenu();
	};

	/**
	 * Called when an context menu item gets selected by user
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @override
	 * @private
	 */
	ContextMenu.prototype._onItemSelected = function(oEvent) {
		var that = this;
		var sId = oEvent.getParameter("item").data("id");
		this._aMenuItems.some(function(oItem) {
			if (sId === oItem.id) {
				oItem.handler(that._oElement);
				return true;
			}
		});
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
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);

		if (oOverlay && oOverlay.isSelectable()) {
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
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);

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
