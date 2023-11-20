/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.MenuButton.
sap.ui.define([
    './Button',
    './Menu',
    './MenuItemBase',
    './library',
    './MenuButtonRenderer',
    'sap/ui/core/Popup',
    'sap/ui/events/checkMouseEnterOrLeave'
],
	function(Button, Menu, MenuItemBase, library, MenuButtonRenderer, Popup, checkMouseEnterOrLeave) {
	"use strict";

	// shortcut for sap.ui.core.Popup.Dock
	var Dock = Popup.Dock;

	/**
	 * Constructor for a new MenuButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Common button control that opens a menu when clicked by the user. The control provides an API for configuring the docking position
	 * of the menu.
	 * @extends sap.ui.commons.Button
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.MenuButton</code> control.
	 * @alias sap.ui.commons.MenuButton
	 */
	var MenuButton = Button.extend("sap.ui.commons.MenuButton", /** @lends sap.ui.commons.MenuButton.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * The position / edge (see sap.ui.core.Popup.Dock) of the button where the menu is docked. Default is 'begin bottom'.
			 */
			dockButton : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The position / edge (see sap.ui.core.Popup.Dock) of the menu which is docked to the button. Default is 'begin top'.
			 */
			dockMenu : {type : "string", group : "Misc", defaultValue : null}
		},
		defaultAggregation : "menu",
		aggregations : {

			/**
			 * Menu that shall be opened when the button is clicked
			 */
			menu : {type : "sap.ui.unified.Menu", multiple : false}
		},
		events : {

			/**
			 * Event that is fired when a menu item is selected by the user
			 */
			itemSelected : {
				parameters : {

					/**
					 * The ID of the selected item
					 */
					itemId : {type : "string"},

					/**
					 * The selected item
					 */
					item : {type : "sap.ui.unified.MenuItemBase"}
				}
			}
		}
	}});

	/*Ensure MenuItemBase is loaded (incl. loading of unified library)*/

	MenuButton.prototype.init = function() {
		this.addStyleClass("sapUiMenuButton");
		this.bWithKeyboard = false;
	};

	/**
	 * Function is called when button is clicked.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	MenuButton.prototype.onclick = function(oEvent) {
		if (this.getEnabled() && !this._bSkipOpen) {
			var oTooltip = this.getTooltip();
			if (oTooltip && oTooltip instanceof sap.ui.core.TooltipBase) {
				oTooltip._closeOrPreventOpen(); //CSN 1762131 2013
			}
			var sDockButton = this.getDockButton() ? this.getDockButton() : Dock.BeginBottom;
			var sDockMenu = this.getDockMenu() ? this.getDockMenu() : Dock.BeginTop;
			this.getMenu().open(this.bWithKeyboard, this, sDockMenu, sDockButton, this);
		}
		this.bWithKeyboard = false;
		this._bSkipOpen = false;
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Function is called when mouse key is clicked down.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	MenuButton.prototype.onmousedown = function(oEvent) {
		this.handleMouseDown(oEvent, false);
		this._bSkipOpen = this.getMenu() && this.getMenu().bOpen;
	};


	/**
	 * Function is called when mouse leaves the control.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	MenuButton.prototype.onmouseout = function(oEvent) {
		if (Button.prototype.onmouseout) {
			Button.prototype.onmouseout.apply(this, arguments);
		}
		if (this._bSkipOpen && checkMouseEnterOrLeave(oEvent, this.getDomRef())) {
			this._bSkipOpen = false;
		}
	};


	/**
	 * Function is called when enter key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	MenuButton.prototype.onsapenter = function(oEvent){
		//It is sufficient to set this flag here only. A click event to open the menu will follow.
		this.bWithKeyboard = true;
	};

	/**
	 * Function is called when space key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	MenuButton.prototype.onsapspace = function(oEvent){
		//It is sufficient to set this flag here only. A click event to open the menu will follow.
		this.bWithKeyboard = true;
	};

	/**
	 * Function is called when down key is pressed with a modifier key.
	 *
	 * @param {jQuery.Event} oEvent The fired event
	 * @private
	 */
	//Requested by UX, see CSN 0120061532 0001379793 2011
	MenuButton.prototype.onsapdownmodifiers = function(oEvent){
		if (oEvent.altKey) {
			this.bWithKeyboard = true;
			this.onclick(oEvent);
		}
	};

	MenuButton.prototype.clone = function(sIdSuffix, aLocalIds) {
		//Deregister event listener before cloning
		updateMenuEventRegistration(this);
		var oClone = Button.prototype.clone.apply(this, arguments);
		updateMenuEventRegistration(this, this.getMenu());
		return oClone;
	};

	/**
	 * Setter for the aggregated <code>menu</code>.
	 * @param {sap.ui.unified.Menu} oMenu The menu to be set to the menu aggregation
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuButton.prototype.setMenu = function(oMenu) {
		updateMenuEventRegistration(this, oMenu);
		this.setAggregation("menu", oMenu);
		return this;
	};

	/**
	 * Destroys the menu in the aggregation
	 * named <code>menu</code>.
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuButton.prototype.destroyMenu = function() {
		updateMenuEventRegistration(this, null);
		this.destroyAggregation("menu");
		return this;
	};

	//********** Private **********

	// Detaches the select event handler from the current menu and attaches it to the new menu
	var updateMenuEventRegistration = function(oThis, oNewMenu){
		var oMenu = oThis.getMenu();
		if (oMenu) {
			oMenu.detachItemSelect(oThis._fItemSelectHandler);
		}
		oThis._fItemSelectHandler = onItemSelected.bind(oThis);
		if (oNewMenu) {
			oNewMenu.attachItemSelect(oThis._fItemSelectHandler);
		}
	};

	//Function is called when an item in the menu was selected.
	var onItemSelected = function(oEvent){
		var oItem = oEvent.getParameter("item");
		this.fireItemSelected({itemId: oItem.getId(), item: oItem});
		this.firePress({itemId: oItem.getId(), item: oItem});
	};

	// Overwrite JSDoc for inherited press event to make clear that 'press' === 'itemSelected'

	/**
	 * Fired when an item from the menu was selected.
	 *
	 * @see sap.ui.commons.MenuButton#event:itemSelected
	 *
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 *
	 * @param {string} oControlEvent.getParameters.itemId The id of the selected item
	 * @param {sap.ui.commons.MenuItemBase} oControlEvent.getParameters.item The selected item
	 * @public
	 * @name sap.ui.commons.MenuButton#press
	 * @event
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link #event:press press} event of this
	 * <code>sap.ui.commons.MenuButton</code>.
	 *
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
	 * if specified, otherwise it will be bound to this <code>sap.ui.commons.MenuButton</code> itself.
	 *
	 * Event is fired when an item from the menu was selected.
	 *
	 * @see sap.ui.commons.MenuButton#attachItemSelected
	 *
	 * @param {object}
	 *            [oData] An application-specific payload object that will be passed to the event handler
	 *            along with the event object when firing the event
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object to call the event handler with. Defaults to this
	 *            <code>sap.ui.commons.MenuButton</code> itself
	 *
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @name sap.ui.commons.MenuButton#attachPress
	 * @function
	 */

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link #event:press press} event of this
	 * <code>sap.ui.commons.MenuButton</code>.
	 *
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @see sap.ui.commons.MenuButton#detachItemSelected
	 *
	 * @param {function}
	 *            fnFunction The function to be called, when the event occurs
	 * @param {object}
	 *            [oListener] Context object on which the given function had to be called
	 * @return {this} Reference to <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.commons.MenuButton#detachPress
	 * @function
	 */

	/**
	 * Fires event {@link #event:press press} to attached listeners.
	 *
	 * @see sap.ui.commons.MenuButton#fireItemSelected
	 *
	 * @param {object} [oParameters] Parameters to pass along with the event
	 * @return {this} Reference to <code>this</code> to allow method chaining
	 * @protected
	 * @name sap.ui.commons.MenuButton#firePress
	 * @function
	 */

	return MenuButton;

});
