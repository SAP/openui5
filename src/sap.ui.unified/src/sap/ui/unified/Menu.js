/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Menu.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/Popup',
	'./MenuItemBase',
	'./library',
	'sap/ui/core/library',
	'sap/ui/unified/MenuRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/events/ControlEvents",
	"sap/ui/events/PseudoEvents",
	"sap/ui/events/checkMouseEnterOrLeave"
], function(
	Element,
	Control,
	Device,
	Popup,
	MenuItemBase,
	library,
	coreLibrary,
	MenuRenderer,
	containsOrEquals,
	jQuery,
	KeyCodes,
	Log,
	ControlEvents,
	PseudoEvents,
	checkMouseEnterOrLeave
) {
	"use strict";

	// shortcut for sap.ui.core.Popup.Dock
	var Dock = Popup.Dock;

	// shortcut for sap.ui.core.OpenState
	var OpenState = coreLibrary.OpenState;

	/**
	 * Constructor for a new Menu control.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A menu is an interactive element which provides a choice of different actions to the user. These actions (items) can also be organized in submenus.
	 * Like other dialog-like controls, the menu is not rendered within the control hierarchy. Instead it can be opened at a specified position via a function call.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IContextMenu
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.21.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.Menu
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) design time meta model
	 */
	var Menu = Control.extend("sap.ui.unified.Menu", /** @lends sap.ui.unified.Menu.prototype */ { metadata : {
		interfaces: [
			"sap.ui.core.IContextMenu"
		],
		library : "sap.ui.unified",
		properties : {

			/**
			 * When a menu is disabled none of its items can be selected by the user.
			 * The enabled property of an item (@link sap.ui.unified.MenuItemBase#getEnabled) has no effect when the menu of the item is disabled.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Accessible label / description of the menu for assistive technologies like screenreaders.
			 * @deprecated as of version 1.27.0, replaced by <code>ariaLabelledBy</code> association
			 */
			ariaDescription : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 * The maximum number of items which are displayed before an overflow mechanism takes effect.
			 * A value smaller than 1 means an infinite number of visible items.
			 * The overall height of the menu is limited by the height of the screen. If the maximum possible height is reached, an
			 * overflow takes effect, even if the maximum number of visible items is not yet reached.
			 */
			maxVisibleItems : {type : "int", group : "Behavior", defaultValue : 0},

			/**
			 * The keyboard can be used to navigate through the items of a menu. Beside the arrow keys for single steps and the <i>Home</i> / <i>End</i> keys for jumping
			 * to the first / last item, the <i>Page Up</i> / <i>Page Down</i> keys can be used to jump an arbitrary number of items up or down. This number can be defined via the <code>pageSize</code> property.
			 * For values smaller than 1, paging behaves in a similar way to when using the <i>Home</i> / <i>End</i> keys. If the value equals 1, the paging behavior is similar to that of the arrow keys.
			 * @since 1.25.0
			 */
			pageSize : {type : "int", group : "Behavior", defaultValue : 5}
		},
		defaultAggregation : "items",
		aggregations : {

			/**
			 * The available actions to be displayed as items of the menu.
			 */
			items : {type : "sap.ui.unified.MenuItemBase", multiple : true, singularName : "item"}
		},
		associations : {

			/**
			 * Reference to accessible labels (ids of existing DOM elements or controls) for assistive technologies like screenreaders.
			 * @see "WAI-ARIA Standard (attribute aria-labelledby)"
			 * @since 1.26.3
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * Fired on the root menu of a menu hierarchy whenever a user selects an item within the menu or within one of its direct or indirect submenus.
			 * <b>Note:</b> There is also a select event available for each single menu item. This event and the event of the menu items are redundant.
			 */
			itemSelect : {
				parameters : {

					/**
					 * The action (item) which was selected by the user.
					 */
					item : {type : "sap.ui.unified.MenuItemBase"}
				}
			}
		}
	}});







	(function(window) {

	Menu.prototype.bCozySupported = true;
	Menu._DELAY_SUBMENU_TIMER = 300;
	Menu._DELAY_SUBMENU_TIMER_EXT = 400;

	Menu.prototype.init = function(){
		var that = this;
		this.bOpen = false;
		this.oOpenedSubMenu = null;
		this.oHoveredItem = null;
		this.oPopup = null; // Will be created lazily
		this._bOpenedAsContextMenu = false; // defines whether the menu is opened as a context menu
		this.fAnyEventHandlerProxy = jQuery.proxy(function(oEvent){
			var oRoot = this.getRootMenu();
			if (oRoot != this || !this.bOpen || !this.getDomRef() || (oEvent.type != "mousedown" && oEvent.type != "touchstart")) {
				return;
			}
			oRoot.handleOuterEvent(this.getId(), oEvent); //TBD: standard popup autoclose
		}, this);
		this.fOrientationChangeHandler = function(){
			that.close();
		};
		this.bUseTopStyle = false;
	};

	/*
	 * Allows for any custom function to be called back when accessibility attributes
	 * of the menu are about to be rendered.
	 * The function is called once per MenuItem.
	 *
	 * @param {function} fn The callback function
	 * @private
	 * @ui5-restricted sap.m.Menu
	 * @returns void
	 */
	Menu.prototype._setCustomEnhanceAccStateFunction = function(fn) {
		this._fnCustomEnhanceAccStateFunction = fn;
	};

	/*
	 * Enables any consumer of the menu to enhance its accessibility state by calling
	 * back its custom provided function Menu#_setCustomEnhanceAccStateFunction.
	 *
	 * @overrides sap.ui.core.Element.prototype.enhanceAccessibilityState
	 */
	Menu.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		var bIsAccFunctionValid = typeof this._fnCustomEnhanceAccStateFunction === "function";

		return bIsAccFunctionValid ? this._fnCustomEnhanceAccStateFunction(oElement, mAriaProps) : mAriaProps;
	};

	/**
	 * Does all the cleanup when the Menu is to be destroyed.
	 * Called from Element's destroy() method.
	 * @private
	 */
	Menu.prototype.exit = function(){
		if (this.oPopup) {
			this.oPopup.detachClosed(this._menuClosed, this);
			this.oPopup.destroy();
			delete this.oPopup;
		}

		ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
		if (this._bOrientationChangeBound) {
			jQuery(window).unbind("orientationchange", this.fOrientationChangeHandler);
			this._bOrientationChangeBound = false;
		}

		// Cleanup
		this._resetDelayedRerenderItems();
		this._detachResizeHandler();
	};

	/**
	 * Called when the control or its children are changed.
	 * @param {sap.ui.core.Control} The originating control
	 * @private
	 */
	Menu.prototype.invalidate = function(oOrigin){
		if (oOrigin instanceof MenuItemBase && this.getDomRef()) {
			this._delayedRerenderItems();
		} else {
			Control.prototype.invalidate.apply(this, arguments);
		}
	};

	/**
	 * Called before rendering starts by the renderer
	 * @private
	 */
	Menu.prototype.onBeforeRendering = function() {
		this._resetDelayedRerenderItems();
		this.$().unbind("mousemove");
	};

	/**
	 * Called when the rendering is complete
	 * @private
	 */
	Menu.prototype.onAfterRendering = function() {
		if (this.$().parent().attr("id") != "sap-ui-static") {
			Log.error("sap.ui.unified.Menu: The Menu is popup based and must not be rendered directly as content of the page.");
			this.close();
			this.$().remove();
		}

		var aItems = this.getItems();

		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].onAfterRendering && aItems[i].getDomRef()) {
				aItems[i].onAfterRendering();
			}
		}

		if (this.oHoveredItem) {
			this.oHoveredItem.hover(true, this);
		}

		checkAndLimitHeight(this);
		this.$().bind("mousemove", this._focusMenuItem.bind(this));
	};

	/**
	 * Called when mouse cursor is moved over the menu items
	 * @private
	 */
	Menu.prototype._focusMenuItem = function(oEvent) {
		if (!Device.system.desktop) {
			return;
		}
		var oItem = this.getItemByDomRef(oEvent.target);
		if (!this.bOpen || !oItem) {
			return;
		}

		if (this.oOpenedSubMenu && containsOrEquals(this.oOpenedSubMenu.getDomRef(), oEvent.target)) {
			return;
		}

		this.setHoveredItem(oItem);
		oItem && oItem.focus(this);

		this._openSubMenuDelayed(oItem);
	};

	/**
	 * Called whenever the theme is changed
	 * @private
	 */
	Menu.prototype.onThemeChanged = function(){
		if (this.getDomRef() && this.getPopup().getOpenState() === OpenState.OPEN) {
			checkAndLimitHeight(this);
			this.getPopup()._applyPosition(this.getPopup()._oLastPosition);
		}
	};


	//****** API Methods ******

	Menu.prototype.setPageSize = function(iSize){
		return this.setProperty("pageSize", iSize, true); /*No rerendering required*/
	};

	Menu.prototype.addItem = function(oItem){
		this.addAggregation("items", oItem, !!this.getDomRef());
		this._delayedRerenderItems();
		return this;
	};

	Menu.prototype.insertItem = function(oItem, idx){
		this.insertAggregation("items", oItem, idx, !!this.getDomRef());
		this._delayedRerenderItems();
		return this;
	};

	Menu.prototype.removeItem = function(oItem){
		this.removeAggregation("items", oItem, !!this.getDomRef());
		this._delayedRerenderItems();
		return this;
	};

	Menu.prototype.removeAllItems = function(){
		var oRes = this.removeAllAggregation("items", !!this.getDomRef());
		this._delayedRerenderItems();
		return oRes;
	};

	Menu.prototype.destroyItems = function(){
		this.destroyAggregation("items", !!this.getDomRef());
		this._delayedRerenderItems();
		return this;
	};

	/**
	 * @private
	 */
	Menu.prototype._delayedRerenderItems = function(){
		if (!this.getDomRef()) {
			return;
		}
		this._resetDelayedRerenderItems();
		this._discardOpenSubMenuDelayed();

		this._itemRerenderTimer = setTimeout(function(){
			var oDomRef = this.getDomRef();
			if (oDomRef) {
				var oRm = sap.ui.getCore().createRenderManager();
				MenuRenderer.renderItems(oRm, this);
				oRm.flush(oDomRef);
				oRm.destroy();
				this.onAfterRendering();
				this.getPopup()._applyPosition(this.getPopup()._oLastPosition);
			}
		}.bind(this), 0);
	};

	/**
	 * @private
	 */
	Menu.prototype._resetDelayedRerenderItems = function(){
		if (this._itemRerenderTimer) {
			clearTimeout(this._itemRerenderTimer);
			delete this._itemRerenderTimer;
		}
	};

	/**
	 * Called when the resize handler should be detached (e.g. on exit and close).
	 * @private
	 */
	Menu.prototype._detachResizeHandler = function(){
		// detach listener in case it is not detached in close
		// in IE when destroy is called both close and exit were called and detach was called twice
		if (this._hasResizeListener) {
			Device.resize.detachHandler(this._handleResizeChange, this);
			this._hasResizeListener = false;
		}
	};

	/**
	 * Opens the menu at the specified position.
	 *
	 * The position of the menu is defined relative to an element in the visible DOM by specifying
	 * the docking location of the menu and of the related element.
	 *
	 * See {@link sap.ui.core.Popup#open Popup#open} for further details about popup positioning.
	 *
	 * @param {boolean} bWithKeyboard Indicates whether or not the first item shall be highlighted when the menu is opened (keyboard case)
	 * @param {sap.ui.core.Element|Element} oOpenerRef The element which will get the focus back again after the menu was closed
	 * @param {sap.ui.core.Dock} my The reference docking location of the menu for positioning the menu on the screen
	 * @param {sap.ui.core.Dock} at The 'of' element's reference docking location for positioning the menu on the screen
	 * @param {sap.ui.core.Element|Element} of The menu is positioned relatively to this element based on the given dock locations
	 * @param {string} [offset] The offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "10 0" to move the popup 10 pixels to the right)
	 * @param {sap.ui.core.Collision} [collision] The collision defines how the position of the menu should be adjusted in case it overflows the window in some direction
	 *
	 * @type {void}
	 * @public
	 * @ui5-metamodel This method will also be described in the UI5 (legacy) design time meta model
	 */
	Menu.prototype.open = function(bWithKeyboard, oOpenerRef, my, at, of, offset, collision){
		var oNextSelectableItem;

		if (this.bOpen) {
			return;
		}

		setItemToggleState(this, true);


		this.oOpenerRef = oOpenerRef;
		this.bIgnoreOpenerDOMRef = false;

		// Open the sap.ui.core.Popup
		this.getPopup().open(0, my, at, of, offset || "0 0", collision || "flipfit flipfit", function(oPopupPosition) {
			var oOfDom = this.getPopup()._getOfDom(of);
			if (!oOfDom || !jQuery(oOfDom).is(":visible") || !_isElementInViewport(oOfDom)) {
				// close the menu if the opener is not visible or not in the viewport anymore
				this.close();
			} else {
				// else the Menu should follow the opener
				// for example in ObjectPage, where we have scrolling, but the opener button is sticked
				this.getPopup()._applyPosition(oPopupPosition.lastPosition);
			}
		}.bind(this));
		this.bOpen = true;

		Device.resize.attachHandler(this._handleResizeChange, this);
		// mark that the resize handler is attach so we know to detach it later on
		this._hasResizeListener = true;

		// Mark the first item when using the keyboard
		if (bWithKeyboard || this.getRootMenu().getId() === this.getId()) {
			oNextSelectableItem = this.getNextSelectableItem(-1);
			this.setHoveredItem(oNextSelectableItem);
			oNextSelectableItem && oNextSelectableItem.focus(this);
		}

		ControlEvents.bindAnyEvent(this.fAnyEventHandlerProxy);
		if (Device.support.orientation && this.getRootMenu() === this) {
			jQuery(window).bind("orientationchange", this.fOrientationChangeHandler);
			this._bOrientationChangeBound = true;
		}
	};

	Menu.prototype._handleResizeChange = function() {
		this.getPopup()._applyPosition(this.getPopup()._oLastPosition);
	};

	/**
	 * Opens the menu as a context menu.
	 * @param {jQuery.Event | object} oEvent The event object or an object containing offsetX, offsetY
	 * values and left, top values of the element's position
	 * @param {sap.ui.core.Element|HTMLElement} oOpenerRef - Might be UI5 Element or DOM Element
	 * @public
	 */
	Menu.prototype.openAsContextMenu = function(oEvent, oOpenerRef) {
			var iOffsetX, iOffsetY, bRTL, eDock, oOpenerRefOffset;

			oOpenerRef = oOpenerRef instanceof Element ? oOpenerRef.getDomRef() : oOpenerRef;

			if (oEvent instanceof jQuery.Event) {
				oOpenerRefOffset = jQuery(oOpenerRef).offset();
				iOffsetX = oEvent.pageX - oOpenerRefOffset.left;
				iOffsetY = oEvent.pageY - oOpenerRefOffset.top;
				this._iX = oEvent.clientX;
				this._iY = oEvent.clientY;
			} else {
				// for explicit position coordinates
				iOffsetX = oEvent.offsetX || 0;
				iOffsetY = oEvent.offsetY || 0;
				this._iX = oEvent.left || 0;
				this._iY = oEvent.top || 0;
			}

			bRTL = sap.ui.getCore().getConfiguration().getRTL();
			eDock = Dock;

			if (bRTL) {
				iOffsetX = oOpenerRef.clientWidth - iOffsetX;
			}
			this._bOpenedAsContextMenu = true;
			this.open(true, oOpenerRef, eDock.BeginTop, eDock.BeginTop, oOpenerRef, iOffsetX + " " + iOffsetY, 'fit');
	};

	Menu.prototype._handleOpened = function () {
		var $Menu, $Window, iCalcedX, iCalcedY,
			iRight, iBottom, bRTL, bRecalculate,
			iMenuWidth, iMenuHeight;

		if (!this._bOpenedAsContextMenu) {
			return;
		}

		$Menu = this.$();
		$Window = jQuery(window);
		iCalcedX = this._iX;
		iCalcedY = this._iY;
		iRight = $Window.scrollLeft() + $Window.width();
		iBottom = $Window.scrollTop() + $Window.height();
		bRTL = sap.ui.getCore().getConfiguration().getRTL();
		bRecalculate = false;
		iMenuWidth = $Menu.width();
		iMenuHeight = $Menu.height();

		if (iCalcedY + iMenuHeight > iBottom) {
			iCalcedY = iCalcedY - iMenuHeight;
			bRecalculate = true;
		}

		if (bRTL) {
			if ((iRight - iCalcedX) + iMenuWidth > iRight) {
				iCalcedX = iRight - (iCalcedX + iMenuWidth);
				bRecalculate = true;
			} else {
				iCalcedX = iRight - iCalcedX;
				bRecalculate = true;
			}
		} else {
			if (iCalcedX + iMenuWidth > iRight) {
				iCalcedX = iCalcedX - iMenuWidth;
				bRecalculate = true;
			}
		}

		// set the flag to initial state as same menu could be used as a context menu or a normal menu
		this._bOpenedAsContextMenu = false;

		bRecalculate && this.oPopup.setPosition("begin top", "begin top", $Window, iCalcedX + " " + iCalcedY, "flipfit");
	};

	/**
	 * Closes the menu.
	 *
	 * @type {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Menu.prototype.close = function(bWithKeyboard) {
		if (!this.bOpen || Menu._dbg /*Avoid closing for debugging purposes*/) {
			return;
		}

		this._discardOpenSubMenuDelayed();

		setItemToggleState(this, false);

		// Remove fixed flag if it existed
		delete this._bFixed;

		ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
		if (this._bOrientationChangeBound) {
			jQuery(window).unbind("orientationchange", this.fOrientationChangeHandler);
			this._bOrientationChangeBound = false;
		}

		this.bOpen = false;
		// Close all sub menus if there are any
		this.closeSubmenu();

		// Reset the hover state
		this.setHoveredItem();

		if (!bWithKeyboard) {
			this.bIgnoreOpenerDOMRef = true;
		}
		// Close the sap.ui.core.Popup
		this.getPopup().close(0);

		this._detachResizeHandler();

		//Remove the Menus DOM after it is closed
		this._resetDelayedRerenderItems();
		this.$().remove();
		this.bOutput = false;

		if (this.isSubMenu()) {
			this.getParent().getParent().oOpenedSubMenu = null;
		}
	};

	/**
	 * This function is called when the Menu was closed.
	 *
	 * @since 1.17.0
	 * @private
	 */
	Menu.prototype._menuClosed = function() {
		//TBD: standard popup autoclose: this.close(); //Ensure proper cleanup
		if (this.oOpenerRef) {
			if (!this.bIgnoreOpenerDOMRef) {
				try {
					this.oOpenerRef.focus();
				} catch (e) {
					Log.warning("Menu.close cannot restore the focus on opener " + this.oOpenerRef + ", " + e);
				}
			}
			this.oOpenerRef = undefined;
		}
	};

	//****** Event Handlers ******

	Menu.prototype.onclick = function(oEvent){
		this.selectItem(this.getItemByDomRef(oEvent.target), false, !!(oEvent.metaKey || oEvent.ctrlKey));
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};


	Menu.prototype.onsapnext = function(oEvent){
		var iIdx,
			oNextSelectableItem,
			oSubMenu = this.oHoveredItem ? this.oHoveredItem.getSubmenu() : undefined;

		//right or down (RTL: left or down)
		if (oEvent.keyCode != KeyCodes.ARROW_DOWN) {
			//Go to sub menu if available
			if (oSubMenu && this.checkEnabled(this.oHoveredItem)) {
				if (oSubMenu.bOpen) {
					oNextSelectableItem = oSubMenu.getNextSelectableItem(-1);
					oSubMenu.setHoveredItem(oNextSelectableItem);
					oNextSelectableItem && oNextSelectableItem.focus(this);
				} else {
					this.openSubmenu(this.oHoveredItem, true);
				}
			}
			return;
		}

		if (oSubMenu && oSubMenu.bOpen) {
			this.closeSubmenu(false, true);
		}

		//Go to the next selectable item
		iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1;
		oNextSelectableItem = this.getNextSelectableItem(iIdx);
		this.setHoveredItem(oNextSelectableItem);
		oNextSelectableItem && oNextSelectableItem.focus(this);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapnextmodifiers = Menu.prototype.onsapnext;

	Menu.prototype.onsapprevious = function(oEvent){
		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1,
			oPrevSelectableItem = this.getPreviousSelectableItem(iIdx),
			oSubMenu = this.oHoveredItem ? this.oHoveredItem.getSubmenu() : null;

		//left or up (RTL: right or up)
		if (oEvent.keyCode != KeyCodes.ARROW_UP) {
			//Go to parent menu if this is a sub menu
			if (this.isSubMenu()) {
				this.close(true);
			}
			oEvent.preventDefault();
			oEvent.stopPropagation();
			return;
		}

		if (oSubMenu && oSubMenu.bOpen) {
			this.closeSubmenu(false, true);
		}

		//Go to the previous selectable item
		this.setHoveredItem(oPrevSelectableItem);
		oPrevSelectableItem && oPrevSelectableItem.focus(this);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsappreviousmodifiers = Menu.prototype.onsapprevious;

	Menu.prototype.onsaphome = function(oEvent){
		var oNextSelectableItem = this.getNextSelectableItem(-1);
		//Go to the first selectable item
		this.setHoveredItem(oNextSelectableItem);
		oNextSelectableItem && oNextSelectableItem.focus(this);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapend = function(oEvent){
		var oPrevSelectableItem = this.getPreviousSelectableItem(this.getItems().length);

		//Go to the last selectable item
		this.setHoveredItem(oPrevSelectableItem);
		oPrevSelectableItem && oPrevSelectableItem.focus(this);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsappagedown = function(oEvent) {
		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1,
			oNextSelectableItem;

		if (this.getPageSize() < 1) {
			this.onsapend(oEvent);
			return;
		}
		iIdx += this.getPageSize();
		if (iIdx >= this.getItems().length) {
			this.onsapend(oEvent);
			return;
		}
		oNextSelectableItem = this.getNextSelectableItem(iIdx - 1);
		this.setHoveredItem(oNextSelectableItem); //subtract 1 to preserve computed page offset because getNextSelectableItem already offsets 1 item down
		oNextSelectableItem && oNextSelectableItem.focus(this);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsappageup = function(oEvent) {
		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1,
			oPrevSelectableItem;

		if (this.getPageSize() < 1) {
			this.onsaphome(oEvent);
			return;
		}
		iIdx -= this.getPageSize();
		if (iIdx < 0) {
			this.onsaphome(oEvent);
			return;
		}

		oPrevSelectableItem = this.getPreviousSelectableItem(iIdx + 1);
		this.setHoveredItem(oPrevSelectableItem); //add 1 to preserve computed page offset because getPreviousSelectableItem already offsets one item up
		oPrevSelectableItem && oPrevSelectableItem.focus(this);

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapselect = function(oEvent){
		this._sapSelectOnKeyDown = true;
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onkeyup = function(oEvent){
		// focus menuItems
		if (this.oHoveredItem && (jQuery(oEvent.target).prop("tagName") != "INPUT")) {
			var oDomRef = this.oHoveredItem.getDomRef();
			jQuery(oDomRef).focus();
		}

		//like sapselect but on keyup:
		//Using keydown has the following side effect:
		//If the selection leads to a close of the menu and the focus is restored to the caller (e.g. a button)
		//the keyup is fired on the caller (in case of a button a click event is fired there in FF -> Bad!)
		//The attribute _sapSelectOnKeyDown is used to avoid the problem the other way round (Space is pressed
		//on Button which opens the menu and the space keyup immediately selects the first item)
		//The device checks are made, because of the new functionality of iOS13, that brings desktop view on tablet
		if (!this._sapSelectOnKeyDown && ( oEvent.key !== KeyCodes.Space || (!sap.ui.Device.os.macintosh && window.navigator.maxTouchPoints <= 1))) {
			return;
		} else {
			this._sapSelectOnKeyDown = false;
		}
		if (!PseudoEvents.events.sapselect.fnCheck(oEvent) && oEvent.key !== "Enter") {
			return;
		}
		this.selectItem(this.oHoveredItem, true, false);
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapbackspace = function(oEvent){
		if (jQuery(oEvent.target).prop("tagName") != "INPUT") {
			oEvent.preventDefault(); //CSN 4537657 2012: Stop browser history navigation
		}
	};
	Menu.prototype.onsapbackspacemodifiers = Menu.prototype.onsapbackspace;

	Menu.prototype.onsapescape = function(oEvent){
		this.close(true);
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsaptabnext = function(oEvent){
		if (this.isSubMenu()){
			oEvent.preventDefault();
		}
		this.close(true);
		oEvent.stopPropagation();
	};

	Menu.prototype.onsaptabprevious = Menu.prototype.onsaptabnext;

	Menu.prototype._openSubMenuDelayed = function(oItem){
		if (!oItem) {
			return;
		}
		this._discardOpenSubMenuDelayed();
		this._delayedSubMenuTimer = setTimeout(function(){
			this.checkEnabled(oItem) && this.closeSubmenu(false, true);
			if (this.checkEnabled(oItem) && oItem.getSubmenu()) {
				this.setHoveredItem(oItem);
				oItem && oItem.focus(this);
				this.openSubmenu(oItem, false, true);
			}
		}.bind(this), oItem.getSubmenu() && this.checkEnabled(oItem) ? Menu._DELAY_SUBMENU_TIMER : Menu._DELAY_SUBMENU_TIMER_EXT);
	};

	Menu.prototype._discardOpenSubMenuDelayed = function(oItem){
		if (this._delayedSubMenuTimer) {
			clearTimeout(this._delayedSubMenuTimer);
			this._delayedSubMenuTimer = null;
		}
	};

	Menu.prototype.onmouseout = function(oEvent){
		if (!Device.system.desktop) {
			return;
		}

		if (checkMouseEnterOrLeave(oEvent, this.getDomRef())) {
			if (!this.oOpenedSubMenu || !(this.oOpenedSubMenu.getParent() === this.oHoveredItem)) {
				this.setHoveredItem(this.oHoveredItem);

			}
			this._discardOpenSubMenuDelayed();
		}
	};

	/**
	 * Handles the onsapfocusleave event
	 * @param {jQuery.Event} oEvent The browser event
	 * @private
	 */
	Menu.prototype.onsapfocusleave = function(oEvent){
		// Only the deepest opened sub menu should handle the event or ignore the event from an item
		if (this.oOpenedSubMenu || !this.bOpen) {
			return;
		}
		this.getRootMenu().handleOuterEvent(this.getId(), oEvent); //TBD: standard popup autoclose
	};

	//****** Helper Methods ******

	Menu.prototype.handleOuterEvent = function(oMenuId, oEvent){
		//See sap.ui.core.Popup implementation: Target is to use autoclose mechanismn of the popup
		//but currently there autoclose only works for 2 hierarchy levels and not for n as needed by the menu
		//-> This function and all its callers are obsolete when switching later to standard popup autoclose
		//   (all needed further code locations for that change are marked with "TBD: standard popup autoclose")
		var isInMenuHierarchy = false,
		// before we were relaying on Popup.touchEnabled, but the logic in the Popup was changed
		// and touchEnabled wasn't valid anymore for Combi devices, which caused the Menu to close automatically right after it was opened
		// check for if the device is combi was added because of change in the Chrome70 browser version where the touch events are "disabled" by default
		// e.g. document.ontouchstart returns false
		touchEnabled = Device.support.touch || Device.system.combi;

		this.bIgnoreOpenerDOMRef = false;

		if (oEvent.type == "mousedown" || oEvent.type == "touchstart") {
			// Suppress the delayed mouse event from mobile browser
			if (touchEnabled && (oEvent.isMarked("delayedMouseEvent") || oEvent.isMarked("cancelAutoClose"))) {
				return;
			}
			var that = this;
			while (that && !isInMenuHierarchy) {
				if (containsOrEquals(that.getDomRef(), oEvent.target)) {
					isInMenuHierarchy = true;
				}
				that = that.oOpenedSubMenu;
			}
		} else if (oEvent.type == "sapfocusleave") {
			if (touchEnabled) {
				return;
			}
			if (oEvent.relatedControlId) {
				var that = this;
				while (that && !isInMenuHierarchy) {
					if ((that.oOpenedSubMenu && that.oOpenedSubMenu.getId() == oEvent.relatedControlId)
							|| containsOrEquals(that.getDomRef(), jQuery(document.getElementById(oEvent.relatedControlId)).get(0))) {
						isInMenuHierarchy = true;
					}
					that = that.oOpenedSubMenu;
				}
			}
			if (!isInMenuHierarchy) {
				this.bIgnoreOpenerDOMRef = true;
			}
		}

		if (!isInMenuHierarchy) {
			this.close();
		}
	};

	Menu.prototype.getItemByDomRef = function(oDomRef){
		var oItems = this.getItems(),
			iLength = oItems.length;
		for (var i = 0;i < iLength;i++) {
			var oItem = oItems[i],
				oItemRef = oItem.getDomRef();
			if (containsOrEquals(oItemRef, oDomRef)) {
				return oItem;
			}
		}
		return null;
	};

	Menu.prototype.selectItem = function(oItem, bWithKeyboard, bCtrlKey){
		if (!oItem || !(oItem instanceof MenuItemBase && this.checkEnabled(oItem))) {
			return;
		}

		var oSubMenu = oItem.getSubmenu();

		if (!oSubMenu) {
			// This is a normal item -> Close all menus and fire event.
			this.getRootMenu().close();
		} else {
			if (!Device.system.desktop && this.oOpenedSubMenu === oSubMenu) {
				this.closeSubmenu();
			} else {
				// Item with sub menu was triggered -> Open sub menu and fire event.
				this.openSubmenu(oItem, bWithKeyboard);
			}
		}

		oItem.fireSelect({item: oItem, ctrlKey: bCtrlKey});
		this.getRootMenu().fireItemSelect({item: oItem});
	};

	Menu.prototype.isSubMenu = function(){
		return this.getParent() && this.getParent().getParent && this.getParent().getParent() instanceof Menu;
	};

	Menu.prototype.getRootMenu = function(){
		var that = this;
		while (that.isSubMenu()) {
			that = that.getParent().getParent();
		}
		return that;
	};

	Menu.prototype.getMenuLevel = function(){
		var iLevel = 1;
		var that = this;
		while (that.isSubMenu()) {
			that = that.getParent().getParent();
			iLevel++;
		}
		return iLevel;
	};

	Menu.prototype.getPopup = function (){
		if (!this.oPopup) {
			this.oPopup = new Popup(this, false, true, false); // content, modal, shadow, autoclose (TBD: standard popup autoclose)
			this.oPopup.setDurations(0, 0);
			this.oPopup.attachClosed(this._menuClosed, this);

			this.oPopup.attachOpened(this._handleOpened, this);
		}
		return this.oPopup;
	};

	Menu.prototype.setHoveredItem = function(oItem){
		if (this.oHoveredItem) {
			this.oHoveredItem.hover(false, this);
		}

		if (!oItem) {
			this.oHoveredItem = null;
			return;
		}

		this.oHoveredItem = oItem;
		oItem.hover(true, this);

		this.scrollToItem(this.oHoveredItem);
	};

	/**
	 * Opens the submenu of the given item (if any).
	 *
	 * @param {Object} oItem The item opener
	 * @param {boolean} bWithKeyboard Whether the submenu is opened via keyboard
	 * @param {boolean} bWithHover Whether the submenu is opened on hover or not (click)
	 *
	 * @private
	 */
	Menu.prototype.openSubmenu = function(oItem, bWithKeyboard, bWithHover){
		var oSubMenu = oItem.getSubmenu();
		if (!oSubMenu) {
			return;
		}

		if (this.oOpenedSubMenu && this.oOpenedSubMenu !== oSubMenu) {
			// Another sub menu is open and has not been fixed. Close it at first.
			this.closeSubmenu();
		}

		if (this.oOpenedSubMenu) {
			// Already open. Keep open, bring to front and fix/unfix menu...

			// Fix/Unfix Menu if clicked. Do not change status if just hovering over
			this.oOpenedSubMenu._bFixed =
				   (bWithHover && this.oOpenedSubMenu._bFixed)
				|| (!bWithHover && !this.oOpenedSubMenu._bFixed);

			this.oOpenedSubMenu._bringToFront();
		} else {
			// Open the sub menu
			this.oOpenedSubMenu = oSubMenu;
			var eDock = Popup.Dock;
			oSubMenu.open(bWithKeyboard, oItem, eDock.BeginTop, eDock.EndTop, oItem, "-4 4");
		}
	};

	/**
	 * Closes an open submenu (if any) of this menu.
	 *
	 * @param {boolean} bIfNotFixedOnly If true, the submenu is only close if it is not fixed (opened via hover and not via click)
	 * @param {boolean} bIgnoreOpenerDOMRef If true, the focus is not set back to the opener dom ref (item) of the submenu
	 *
	 * @private
	 */
	Menu.prototype.closeSubmenu = function(bIfNotFixedOnly, bIgnoreOpenerDOMRef){
		if (this.oOpenedSubMenu) {
			if (bIfNotFixedOnly && this.oOpenedSubMenu._bFixed) {
				return;
			}
			if (bIgnoreOpenerDOMRef) {
				this.oOpenedSubMenu.bIgnoreOpenerDOMRef = true;
			}
			this.oOpenedSubMenu.close();
			this.oOpenedSubMenu = null;
		}
	};

	/**
	 * Scrolls an item into the visual viewport.
	 *
	 * @param {Object} oItem The item to be scrolled to
	 * @private
	 */
	Menu.prototype.scrollToItem = function(oItem) {

		var oMenuRef = this.getDomRef(),
		oItemRef = oItem ? oItem.getDomRef() : null;

		if (!oItemRef || !oMenuRef) {
			return;
		}

		var iMenuScrollTop = oMenuRef.scrollTop,
		iItemOffsetTop = oItemRef.offsetTop,
		iMenuHeight = jQuery(oMenuRef).height(),
		iItemHeight = jQuery(oItemRef).height();

		if (iMenuScrollTop > iItemOffsetTop) { // scroll up
			oMenuRef.scrollTop = iItemOffsetTop;
		} else if ((iItemOffsetTop + iItemHeight) > (iMenuScrollTop + iMenuHeight)) { // scroll down
			oMenuRef.scrollTop = Math.ceil(iItemOffsetTop + iItemHeight - iMenuHeight);
		}
	};

	/**
	 * Brings this menu to the front of the menu stack.
	 * This simulates a mouse-event and raises the z-index which is internally tracked by the Popup.
	 *
	 * @private
	 */
	Menu.prototype._bringToFront = function() {
		// This is a hack. We "simulate" a mouse-down-event on the submenu so that it brings itself
		// to the front.
		jQuery(document.getElementById(this.getPopup().getId())).mousedown();
	};

	Menu.prototype.checkEnabled = function(oItem){
		return oItem && oItem.getEnabled() && this.getEnabled();
	};

	Menu.prototype.getNextSelectableItem = function(iIdx){
		var oItem = null;
		var aItems = this.getItems();

		// At first, start with the next index
		for (var i = iIdx + 1; i < aItems.length; i++) {
			if (aItems[i].getVisible() && this.checkEnabled(aItems[i])) {
				oItem = aItems[i];
				break;
			}
		}

		// If nothing found, start from the beginning
		if (!oItem) {
			for (var i = 0; i <= iIdx; i++) {
				if (aItems[i].getVisible() && this.checkEnabled(aItems[i])) {
					oItem = aItems[i];
					break;
				}
			}
		}

		return oItem;
	};

	Menu.prototype.getPreviousSelectableItem = function(iIdx){
		var oItem = null;
		var aItems = this.getItems();

		// At first, start with the previous index
		for (var i = iIdx - 1; i >= 0; i--) {
			if (aItems[i].getVisible() && this.checkEnabled(aItems[i])) {
				oItem = aItems[i];
				break;
			}
		}

		// If nothing found, start from the end
		if (!oItem) {
			for (var i = aItems.length - 1; i >= iIdx; i--) {
				if (aItems[i].getVisible() && this.checkEnabled(aItems[i])) {
					oItem = aItems[i];
					break;
				}
			}
		}

		return oItem;
	};

	Menu.prototype.setRootMenuTopStyle = function(bUseTopStyle){
		this.getRootMenu().bUseTopStyle = bUseTopStyle;
		Menu.rerenderMenu(this.getRootMenu());
	};


	Menu.rerenderMenu = function(oMenu){
		var aItems = oMenu.getItems();
		for (var i = 0; i < aItems.length; i++) {
			var oSubMenu = aItems[i].getSubmenu();
			if (oSubMenu) {
				Menu.rerenderMenu(oSubMenu);
			}
		}

		oMenu.invalidate();
		oMenu.rerender();
	};

	Menu.prototype.focus = function(){
		if (this.bOpen) {
			Control.prototype.focus.apply(this, arguments);
		}
	};

	/**
	 * Checks whether the Menu should run with cozy design.
	 * This function must only be called on the root menu (getRootMenu) to get proper results.
	 *
	 * @returns {boolean} Whether the Menu should is run in cozy design mode
	 * @private
	 */
	Menu.prototype.isCozy = function(){
		if (!this.bCozySupported) {
			return false;
		}

		if (this.hasStyleClass("sapUiSizeCozy")) {
			return true;
		}

		if (checkCozyMode(this.oOpenerRef)) {
			return true;
		}

		if (checkCozyMode(this.getParent())) {
			return true;
		}

		return false;
	};


	///////////////////////////////////////// Hidden Functions /////////////////////////////////////////

	function checkCozyMode(oRef) {
		if (!oRef) {
			return false;
		}
		oRef = oRef.$ ? oRef.$() : jQuery(oRef);
		return oRef.closest(".sapUiSizeCompact,.sapUiSizeCondensed,.sapUiSizeCozy").hasClass("sapUiSizeCozy");
	}

	function setItemToggleState(oMenu, bOpen){
		var oParent = oMenu.getParent();
		if (oParent && oParent instanceof MenuItemBase) {
			oParent.onSubmenuToggle(bOpen);
		}
	}


	function checkAndLimitHeight(oMenu) {
		var iMaxVisibleItems = oMenu.getMaxVisibleItems(),
			iMaxHeight = document.documentElement.clientHeight - 10,
			$Menu = oMenu.$();

		if (iMaxVisibleItems > 0) {
			var aItems = oMenu.getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getDomRef()) {
					iMaxHeight = Math.min(iMaxHeight, aItems[i].$().outerHeight(true) * iMaxVisibleItems);
					break;
				}
			}
		}

		if ($Menu.outerHeight(true) > iMaxHeight) {
			$Menu.css("max-height", iMaxHeight + "px").toggleClass("sapUiMnuScroll", true);
		} else {
			$Menu.css("max-height", "").toggleClass("sapUiMnuScroll", false);
		}
	}

	function _isElementInViewport(oDomElement) {
		var mRect;

		if (!oDomElement) {
			return false;
		}

		if (oDomElement instanceof jQuery) {
			oDomElement = oDomElement.get(0);
		}

		mRect = oDomElement.getBoundingClientRect();

		return (
			mRect.top >= 0 &&
			mRect.left >= 0 &&
			mRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			mRect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	})(window);


	return Menu;

});