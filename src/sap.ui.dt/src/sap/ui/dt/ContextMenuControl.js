/*
 * ! ${copyright}
 */
/* global Promise */
// Provides control sap.ui.rta.ContextMenuControl.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/unified/Menu', 'sap/ui/unified/MenuItem'
], function(jQuery, library, Menu, MenuItem) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.dt.ContextMenuControl control.
	 *
	 * @class Context - Menu for Design time
	 * @extends sap.ui.unified.Menu
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.ContextMenuControl
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ContextMenuControl = Menu.extend("sap.ui.dt.ContextMenuControl", {
		metadata: {
			library: "sap.ui.dt",
			properties: {},
			associations: {},
			events: {}
		},
		renderer: {}
	// Standard renderer method is not overridden
	});

	/**
	 * Initialize the context menu
	 *
	 * @private
	 */
	ContextMenuControl.prototype.init = function() {
		Menu.prototype.init.apply(this, arguments);
		this._fnOnKeyDown = this._onKeyDown.bind(this);
		jQuery(document).keydown(this._fnOnKeyDown);
		this.attachBrowserEvent("contextmenu", this._onContextMenu, this);
		this._oOverlayDomRef = document.body;
	};

	/**
	 * Exit method. Called when the object gets destroyed
	 */
	ContextMenuControl.prototype.exit = function() {
		Menu.prototype.exit.apply(this, arguments);
		jQuery(document).off("keydown", this._fnOnKeyDown);
		delete this._fnOnKeyDown;
		this.detachBrowserEvent("contextmenu");
	};

	/**
	 * Set overlay which invoked the context menu
	 *
	 * @param {sap.ui.core.Element} oOverlay variable object instance of the overlay
	 */
	ContextMenuControl.prototype.setOverlayDomRef = function(oOverlay) {
		this._oOverlayDomRef = oOverlay.getDomRef();
	};

	/**
	 * Creates the context menu items based on the currently associated element
	 *
	 * @param {array} aMenuItems array with menu item settings
	 * @param {string} aMenuItems.id id, which corresponds to the text key
	 * @param {string} aMenuItems.text menu item text (translated)
	 * @param {function} aMenuItems.handler event handler if menu is selected, the element for which the menu was opened is passed to the handler
	 * @param {boolean|function} aMenuItems.startSection?, default false
	 * @param {function} aMenuItems.available? function to determine if the menu entry should be shown, the element for which the menu should be
	 *        opened is passed, default true
	 * @param {function} aMenuItems.enabled? function to determine if the menu entry should be enabled, the element for which the menu should be
	 *        opened is passed, default true
	 * @param {object} oTargetOverlay overlay for which the menu should be opened
	 * @private
	 */
	ContextMenuControl.prototype.setMenuItems = function(aMenuItems, oTargetOverlay) {
		this.destroyItems();

		aMenuItems.forEach(function(oItem) {
			if (!oItem.available || oItem.available(oTargetOverlay)) {
				var bEnabled = !oItem.enabled || oItem.enabled(oTargetOverlay);

				var sText = oItem.text;
				if (typeof oItem.text === "function") {
					sText = oItem.text(oTargetOverlay);
				}

				var oMenuItem = new MenuItem({
					text: sText,
					enabled: bEnabled
				});
				oMenuItem.data({
					id: oItem.id
				});
				if ((oItem.startSection && typeof (oItem.startSection) === "boolean" ) || (typeof (oItem.startSection) === "function" && oItem.startSection(oTargetOverlay.getElementInstance()))) {
					oMenuItem.setStartsSection(true);
				}
				this.addItem(oMenuItem);
			}
		}, this);
		return this;
	};

	/**
	 * Handler Method for event open menu
	 *
	 * @param {object} oOriginalEvent Original Event invoking Context menu
	 * @param {object} oTargetOverlay Overlay invoking the context menu
	 */
	ContextMenuControl.prototype.openMenu = function(oOriginalEvent, oTargetOverlay) {
		// first check if there are some context menu entries
		if (this.getItems().length === 0 || !oTargetOverlay.getDomRef()) {
			return;
		}
		this.openAsContextMenu(oOriginalEvent, oTargetOverlay);
	};

	/**
	 * Handle keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenuControl.prototype._onKeyDown = function(oEvent) {
		if (!this.bOpen) {
			jQuery(document).off("keydown", this._fnOnKeyDown);
			delete this._fnOnKeyDown;
			return;
		}
		if ((oEvent.keyCode === jQuery.sap.KeyCodes.F10) && (oEvent.shiftKey === true) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Handle Context Menu
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenuControl.prototype._onContextMenu = function(oEvent) {
		if (!this.bOpen) {
			this.detachBrowserEvent("contextmenu");
			return;
		}
		if (oEvent.preventDefault) {
			oEvent.preventDefault();
		}
	};

	return ContextMenuControl;

}, /* bExport= */true);
