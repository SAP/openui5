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
	 * @param {object} oElement element for which the menu should be opened
	 * @private
	 */
	ContextMenuControl.prototype.setMenuItems = function(aMenuItems, oElement) {
		var that = this;

		this.destroyItems();

		aMenuItems.forEach(function(oItem) {
			if (!oItem.available || oItem.available(oElement)) {
				var bEnabled = !oItem.enabled || oItem.enabled(oElement);
				var oMenuItem = new MenuItem({
					text: oItem.text,
					enabled: bEnabled
				});
				oMenuItem.data({
					id: oItem.id
				});
				if ((oItem.startSection && typeof (oItem.startSection) === "boolean" ) || (typeof (oItem.startSection) === "function" && oItem.startSection(oElement))) {
					oMenuItem.setStartsSection(true);
				}
				that.addItem(oMenuItem);
			}
		});
		return this;
	};

	/**
	 * Method for calculating the x, y-offset for opening the context menu at the current mouse position
	 * 
	 * @param {number} iPageX mouse x position
	 * @param {number} iPageY mouse y position
	 */
	ContextMenuControl.prototype._open = function(iPageX, iPageY) {

		// first check if there are some context menu entries
		if (this.getItems().length === 0) {
			return;
		}

		// calculate the offset (depending on context-menu size)
		var mouseX = iPageX;
		var mouseY = iPageY;
		var X = mouseX;
		var Y = mouseY;
		var bodyX = jQuery('body').width();
		var bodyY = jQuery('body').height();

		if (!this.getDomRef()) {
			this.open(false, undefined, undefined, undefined, undefined, -2000 + " " + -2000, "none");
		}

		var ContextMenuControlWidth = this.$().context.clientWidth;
		var ContextMenuControlHeight = this.$().context.clientHeight;
		var xFlipOffset = (bodyX - mouseX < ContextMenuControlWidth) ? ContextMenuControlWidth : 0;
		var yFlipOffset = (bodyY - mouseY < ContextMenuControlHeight) ? ContextMenuControlHeight : 0;

		X = ((bodyX / 2 - mouseX) * -1) + ContextMenuControlWidth / 2 + 2 - xFlipOffset;
		Y = ((bodyY / 2 - mouseY) * -1) + ContextMenuControlHeight / 2 + 2 - yFlipOffset;

		var yOffset = mouseY - ContextMenuControlHeight;
		if (yOffset < 0 && yFlipOffset !== 0) {
			Y = Y - yOffset;
		}

		this.close();
		this.open(true, this._oOverlayDomRef, undefined, undefined, document.body, X + " " + Y, "flip");
	};

	/**
	 * Handler Method for event open menu
	 * 
	 * @param {object} oContextInfo Information on the context
	 */
	ContextMenuControl.prototype.openMenu = function(oContextInfo) {
		this._open(oContextInfo.pageX, oContextInfo.pageY);
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
