/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Menu.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/Popup', './MenuItemBase', './library', 'jquery.sap.script'],
	function(jQuery, Control, Popup, MenuItemBase, library/* , jQuerySap */) {
	"use strict";



	/**
	 * Constructor for a new Menu.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A container for menu items. When the space in the browser is not large enough to display all defined items, a scroll bar is provided.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.Menu
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Menu = Control.extend("sap.ui.unified.Menu", /** @lends sap.ui.unified.Menu.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 *
			 * Disabled menus have other colors than enabled ones, depending on customer settings.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 *
			 * The label/description provided for screen readers
			 * @deprecated Since version 1.27.0
			 * Please use association ariaLabelledBy instead.
			 */
			ariaDescription : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 *
			 * Max. number of items to be displayed before an overflow mechanimn appears. Values smaller than 1 mean infinite number of visible items.
			 * The menu can not become larger than the screen height.
			 */
			maxVisibleItems : {type : "int", group : "Behavior", defaultValue : 0},

			/**
			 *
			 * The number of items to be shifted up or down upon Page-up or Page-up key navigation. Values smaller than 1 mean infinite number of page items.
			 * @since 1.25.0
			 */
			pageSize : {type : "int", group : "Behavior", defaultValue : 5}
		},
		defaultAggregation : "items",
		aggregations : {

			/**
			 * Aggregation of menu items
			 */
			items : {type : "sap.ui.unified.MenuItemBase", multiple : true, singularName : "item"}
		},
		associations : {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.26.3
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 *
			 * Provides the application an alternative option to listen to select events. This event is only fired on the root menu of a menu hierarchy.
			 * Note that there is also a select event available for MenuItem; if the current event is used, the select event of a MenuItem becomes redundant.
			 */
			itemSelect : {
				parameters : {

					/**
					 * The selected item
					 */
					item : {type : "sap.ui.unified.MenuItemBase"}
				}
			}
		}
	}});







	(function(window) {


	Menu.prototype.init = function(){
		var that = this;
		this.bOpen = false;
		this.oOpenedSubMenu = null;
		this.oHoveredItem = null;
		this.oPopup = null; // Will be created lazily
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

	/**
	 * Does all the cleanup when the Menu is to be destroyed.
	 * Called from Element's destroy() method.
	 * @private
	 */
	Menu.prototype.exit = function(){
		if (this.oPopup) {
			this.oPopup.detachOpened(this._menuOpened, this);
			this.oPopup.detachClosed(this._menuClosed, this);
			this.oPopup.destroy();
			delete this.oPopup;
		}

		jQuery.sap.unbindAnyEvent(this.fAnyEventHandlerProxy);
		if (this._bOrientationChangeBound) {
			jQuery(window).unbind("orientationchange", this.fOrientationChangeHandler);
			this._bOrientationChangeBound = false;
		}

		// Cleanup
		this._resetDelayedRerenderItems();
	};

	/**
	 * Called when the control or its children are changed.
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
	};

	/**
	 * Called when the rendering is complete
	 * @private
	 */
	Menu.prototype.onAfterRendering = function() {
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
	};

	Menu.prototype.onThemeChanged = function(){
		if (this.getDomRef() && this.getPopup().getOpenState() === sap.ui.core.OpenState.OPEN) {
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

	Menu.prototype._delayedRerenderItems = function(){
		if (!this.getDomRef()) {
			return;
		}
		this._resetDelayedRerenderItems();

		this._itemRerenderTimer = jQuery.sap.delayedCall(0, this, function(){
			var oDomRef = this.getDomRef();
			if (oDomRef) {
				var oRm = sap.ui.getCore().createRenderManager();
				sap.ui.unified.MenuRenderer.renderItems(oRm, this);
				oRm.flush(oDomRef);
				oRm.destroy();
				this.onAfterRendering();
				this.getPopup()._applyPosition(this.getPopup()._oLastPosition);
			}
		});
	};

	Menu.prototype._resetDelayedRerenderItems = function(){
		if (this._itemRerenderTimer) {
			jQuery.sap.clearDelayedCall(this._itemRerenderTimer);
			delete this._itemRerenderTimer;
		}
	};



	/**
	 * Opens the menu
	 *
	 * @param {boolean} bWithKeyboard
	 *
	 *         An indicator whether the first item shall be highlighted, or not. It is highlighted in the case that the menu is opened via keyboard.
	 * @param {object} oOpenerRef
	 *
	 *         DOMNode or sap.ui.core.Element that opens the menu; the DOMNode or sap.ui.core.Element will be focused again after the menu is closed. This parameter is optional.
	 * @param {sap.ui.core.Dock} sMy
	 *
	 *         The popup content's reference position for docking.
	 *         See also sap.ui.core.Popup.Dock and sap.ui.core.Popup.open.
	 * @param {sap.ui.core.Dock} sAt
	 *
	 *         The 'of' element's reference point for docking to.
	 *         See also sap.ui.core.Popup.Dock and sap.ui.core.Popup.open.
	 * @param {object} oOf
	 *
	 *         The DOM element or sap.ui.core.Element to dock to.
	 *         See also sap.ui.core.Popup.open.
	 * @param {string} sOffset
	 *
	 *         The offset relative to the docking point, specified as a string with space-separated pixel values (e.g. "0 10" to move the popup 10 pixels to the right).
	 *         See also sap.ui.core.Popup.open.
	 * @param {sap.ui.core.Collision} sCollision
	 *
	 *         The collision defines how the position of an element should be adjusted in case it overflows the window in some direction.
	 *         See also sap.ui.core.Popup.open.
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Menu.prototype.open = function(bWithKeyboard, oOpenerRef, my, at, of, offset, collision){
		if (this.bOpen) {
			return;
		}

		setItemToggleState(this, true);

		this.bOpen = true;
		this.oOpenerRef = oOpenerRef;

		// Open the sap.ui.core.Popup
		this.getPopup().open(0, my, at, of, offset || "0 0", collision || "_sapUiCommonsMenuFlip _sapUiCommonsMenuFlip", true);

		// Set the tab index of the menu and focus
		var oDomRef = this.getDomRef();
		jQuery(oDomRef).attr("tabIndex", 0).focus();

		// Mark the first item when using the keyboard
		if (bWithKeyboard) {
			this.setHoveredItem(this.getNextSelectableItem(-1));
		}

		jQuery.sap.bindAnyEvent(this.fAnyEventHandlerProxy);
		if (sap.ui.Device.support.orientation && this.getRootMenu() === this) {
			jQuery(window).bind("orientationchange", this.fOrientationChangeHandler);
			this._bOrientationChangeBound = true;
		}
	};

	/**
	 * This function is called when the Menu was opened.
	 *
	 * @since 1.17.0
	 * @private
	 */
	Menu.prototype._menuOpened = function() {
		fnIe8RepaintBug(this);
	};


	/**
	 * Closes the menu
	 *
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Menu.prototype.close = function() {
		if (!this.bOpen || Menu._dbg /*Avoid closing for debugging purposes*/) {
			return;
		}

		setItemToggleState(this, false);

		// Remove fixed flag if it existed
		delete this._bFixed;

		jQuery.sap.unbindAnyEvent(this.fAnyEventHandlerProxy);
		if (this._bOrientationChangeBound) {
			jQuery(window).unbind("orientationchange", this.fOrientationChangeHandler);
			this._bOrientationChangeBound = false;
		}

		this.bOpen = false;
		// Close all sub menus if there are any
		if (this.oOpenedSubMenu) {
			this.oOpenedSubMenu.close();
		}

		// Reset the hover state
		this.setHoveredItem();

		// Reset the tab index of the menu and focus the opener (if there is any)
		jQuery(this.getDomRef()).attr("tabIndex", -1);

		// Close the sap.ui.core.Popup
		this.getPopup().close(0);

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
			if (!this.ignoreOpenerDOMRef) {
				try {
					this.oOpenerRef.focus();
				} catch (e) {
					jQuery.sap.log.warning("Menu.close cannot restore the focus on opener " + this.oOpenerRef + ", " + e);
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
		//right or down (RTL: left or down)
		if (oEvent.keyCode != jQuery.sap.KeyCodes.ARROW_DOWN) {
			//Go to sub menu if available
			if (this.oHoveredItem && this.oHoveredItem.getSubmenu() && this.checkEnabled(this.oHoveredItem)) {
				this.openSubmenu(this.oHoveredItem, true);
			}
			return;
		}

		//Go to the next selectable item
		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1;
		this.setHoveredItem(this.getNextSelectableItem(iIdx));

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapprevious = function(oEvent){
		//left or up (RTL: right or up)
		if (oEvent.keyCode != jQuery.sap.KeyCodes.ARROW_UP) {
			//Go to parent menu if this is a sub menu
			if (this.isSubMenu()) {
				this.close();
			}
			oEvent.preventDefault();
			oEvent.stopPropagation();
			return;
		}

		//Go to the previous selectable item
		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1;
		this.setHoveredItem(this.getPreviousSelectableItem(iIdx));

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsaphome = function(oEvent){
		//Go to the first selectable item
		this.setHoveredItem(this.getNextSelectableItem(-1));

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapend = function(oEvent){
		//Go to the last selectable item
		this.setHoveredItem(this.getPreviousSelectableItem(this.getItems().length));

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsappagedown = function(oEvent) {
		if (this.getPageSize() < 1) {
			this.onsapend(oEvent);
			return;
		}
		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1;
		iIdx += this.getPageSize();

		if (iIdx >= this.getItems().length) {
			this.onsapend(oEvent);
			return;
		}
		this.setHoveredItem(this.getNextSelectableItem(iIdx - 1)); //subtract 1 to preserve computed page offset because getNextSelectableItem already offsets 1 item down

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsappageup = function(oEvent) {
		if (this.getPageSize() < 1) {
			this.onsaphome(oEvent);
			return;
		}

		var iIdx = this.oHoveredItem ? this.indexOfAggregation("items", this.oHoveredItem) : -1;
		iIdx -= this.getPageSize();
		if (iIdx < 0) {
			this.onsaphome(oEvent);
			return;
		}
		this.setHoveredItem(this.getPreviousSelectableItem(iIdx + 1)); //add 1 to preserve computed page offset because getPreviousSelectableItem already offsets one item up

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsapselect = function(oEvent){
		this._sapSelectOnKeyDown = true;
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onkeyup = function(oEvent){
		//like sapselect but on keyup:
		//Using keydown has the following side effect:
		//If the selection leads to a close of the menu and the focus is restored to the caller (e.g. a button)
		//the keyup is fired on the caller (in case of a button a click event is fired there in FF -> Bad!)
		//The attribute _sapSelectOnKeyDown is used to avoid the problem the other way round (Space is pressed
		//on Button which opens the menu and the space keyup immediately selects the first item)
		if (!this._sapSelectOnKeyDown) {
			return;
		} else {
			this._sapSelectOnKeyDown = false;
		}
		if (!jQuery.sap.PseudoEvents.sapselect.fnCheck(oEvent)) {
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
		this.close();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Menu.prototype.onsaptabnext = Menu.prototype.onsapescape;
	Menu.prototype.onsaptabprevious = Menu.prototype.onsapescape;

	Menu.prototype.onmouseover = function(oEvent){
		if (!sap.ui.Device.system.desktop) {
			return;
		}
		var oItem = this.getItemByDomRef(oEvent.target);
		if (!this.bOpen || !oItem || oItem == this.oHoveredItem) {
			return;
		}

		if (this.oOpenedSubMenu && jQuery.sap.containsOrEquals(this.oOpenedSubMenu.getDomRef(), oEvent.target)) {
			return;
		}

		this.setHoveredItem(oItem);

		if (this.oOpenedSubMenu && !this.oOpenedSubMenu._bFixed) {
			this.oOpenedSubMenu.close();
			this.oOpenedSubMenu = null;
		}

		if (jQuery.sap.checkMouseEnterOrLeave(oEvent, this.getDomRef())) {
			this.getDomRef().focus();
		}

		if (this.checkEnabled(oItem)) {
			this.openSubmenu(oItem, false, true);
		}
	};

	Menu.prototype.onmouseout = function(oEvent){
		if (!sap.ui.Device.system.desktop) {
			return;
		}
		fnIe8RepaintBug(this);

		if (jQuery.sap.checkMouseEnterOrLeave(oEvent, this.getDomRef())) {
			if (!this.oOpenedSubMenu || !this.oOpenedSubMenu.getParent() === this.oHoveredItem) {
				this.setHoveredItem(null);
			}
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
			touchEnabled = this.getPopup().touchEnabled;

		if (oEvent.type == "mousedown" || oEvent.type == "touchstart") {
			// Suppress the delayed mouse event from mobile browser
			if (touchEnabled && (oEvent.isMarked("delayedMouseEvent") || oEvent.isMarked("cancelAutoClose"))) {
				return;
			}
			var that = this;
			while (that && !isInMenuHierarchy) {
				if (jQuery.sap.containsOrEquals(that.getDomRef(), oEvent.target)) {
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
							|| jQuery.sap.containsOrEquals(that.getDomRef(), jQuery.sap.byId(oEvent.relatedControlId).get(0))) {
						isInMenuHierarchy = true;
					}
					that = that.oOpenedSubMenu;
				}
			}
		}

		if (!isInMenuHierarchy) {
			this.ignoreOpenerDOMRef = true;
			this.close();
			this.ignoreOpenerDOMRef = false;
		}
	};

	Menu.prototype.getItemByDomRef = function(oDomRef){
		var oItems = this.getItems(),
			iLength = oItems.length;
		for (var i = 0;i < iLength;i++) {
			var oItem = oItems[i],
				oItemRef = oItem.getDomRef();
			if (jQuery.sap.containsOrEquals(oItemRef, oDomRef)) {
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
			if (!sap.ui.Device.system.desktop && this.oOpenedSubMenu === oSubMenu) {
				this.oOpenedSubMenu.close();
				this.oOpenedSubMenu = null;
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
			this.oPopup.attachOpened(this._menuOpened, this);
			this.oPopup.attachClosed(this._menuClosed, this);
		}
		return this.oPopup;
	};

	Menu.prototype.setHoveredItem = function(oItem){
		if (this.oHoveredItem) {
			this.oHoveredItem.hover(false, this);
		}

		if (!oItem) {
			this.oHoveredItem = null;
			jQuery(this.getDomRef()).removeAttr("aria-activedescendant");
			return;
		}

		this.oHoveredItem = oItem;
		oItem.hover(true, this);
		this._setActiveDescendant(this.oHoveredItem);

		this.scrollToItem(this.oHoveredItem);
	};

	Menu.prototype._setActiveDescendant = function(oItem){
		if (sap.ui.getCore().getConfiguration().getAccessibility() && oItem) {
			var that = this;
			that.$().removeAttr("aria-activedescendant");
			setTimeout(function(){
				//Setting active descendant must be a bit delayed. Otherwise the screenreader does not announce it.
				if (that.oHoveredItem === oItem) {
					that.$().attr("aria-activedescendant", that.oHoveredItem.getId());
				}
			}, 10);
		}
	};

	Menu.prototype.openSubmenu = function(oItem, bWithKeyboard, bWithHover){
		var oSubMenu = oItem.getSubmenu();
		if (!oSubMenu) {
			return;
		}

		if (this.oOpenedSubMenu && this.oOpenedSubMenu !== oSubMenu) {
			// Another sub menu is open and has not been fixed. Close it at first.
			this.oOpenedSubMenu.close();
			this.oOpenedSubMenu = null;
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
			oSubMenu.open(bWithKeyboard, this, eDock.BeginTop, eDock.EndTop, oItem, "0 0");
		}
	};

	/**
	 * Scrolls an item into the visual viewport.
	 *
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
		jQuery.sap.byId(this.getPopup().getId()).mousedown();
	};

	Menu.prototype.checkEnabled = function(oItem){
		fnIe8RepaintBug(this);
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
		var res = sap.ui.core.Control.prototype.focus.apply(this, arguments);
		this._setActiveDescendant(this.oHoveredItem);
		return res;
	};


	///////////////////////////////////////// Hidden Functions /////////////////////////////////////////

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


	//IE 8 repainting bug when hovering over MenuItems with IconFont
	var fnIe8RepaintBug = function() {};
	if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 9) {
		fnIe8RepaintBug = function(oMenu, iDelay) {
			if (iDelay === undefined) {
				iDelay = 50;
			}


			/* In case of perdormance issues, the commented code around the delayedCall might help:
			jQuery.sap.clearDelayedCall(oMenu.data("delayedRepaintId"));
			var iDelayedId =  */
			jQuery.sap.delayedCall(iDelay, oMenu, function() {
				var $Elem = this.$(); // this is the Menu instance from the oMenu argument
				if ($Elem.length > 0) {
					var oDomRef = $Elem[0].firstChild;
					sap.ui.core.RenderManager.forceRepaint(oDomRef);
				}
			});
			/* oMenu.data("delayedRepaintId", iDelayedId); */
		};
	}


	//**********************************************

	/*!
	 * The following code is taken from
	 * jQuery UI 1.10.3 - 2013-11-18
	 * jquery.ui.position.js
	 *
	 * http://jqueryui.com
	 * Copyright 2013 jQuery Foundation and other contributors; Licensed MIT
	 */

	//TODO: Get rid of this coding when jQuery UI 1.8 is no longer supported and the framework was switched to jQuery UI 1.9 ff.

	function _migrateDataTojQueryUI110(data){
		var withinElement = jQuery(window);
		data.within = {
			element: withinElement,
			isWindow: true,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.width(),
			height: withinElement.height()
		};
		data.collisionPosition = {
			marginLeft: 0,
			marginTop: 0
		};
		return data;
	}

	var _pos_jQueryUI110 = {
		fit: {
			left: function( position, data ) {
				var within = data.within,
					withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
					outerWidth = within.width,
					collisionPosLeft = position.left - data.collisionPosition.marginLeft,
					overLeft = withinOffset - collisionPosLeft,
					overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
					newOverRight;

				// element is wider than within
				if ( data.collisionWidth > outerWidth ) {
					// element is initially over the left side of within
					if ( overLeft > 0 && overRight <= 0 ) {
						newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
						position.left += overLeft - newOverRight;
					// element is initially over right side of within
					} else if ( overRight > 0 && overLeft <= 0 ) {
						position.left = withinOffset;
					// element is initially over both left and right sides of within
					} else {
						if ( overLeft > overRight ) {
							position.left = withinOffset + outerWidth - data.collisionWidth;
						} else {
							position.left = withinOffset;
						}
					}
				// too far left -> align with left edge
				} else if ( overLeft > 0 ) {
					position.left += overLeft;
				// too far right -> align with right edge
				} else if ( overRight > 0 ) {
					position.left -= overRight;
				// adjust based on position and margin
				} else {
					position.left = Math.max( position.left - collisionPosLeft, position.left );
				}
			},
			top: function( position, data ) {
				var within = data.within,
					withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
					outerHeight = data.within.height,
					collisionPosTop = position.top - data.collisionPosition.marginTop,
					overTop = withinOffset - collisionPosTop,
					overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
					newOverBottom;

				// element is taller than within
				if ( data.collisionHeight > outerHeight ) {
					// element is initially over the top of within
					if ( overTop > 0 && overBottom <= 0 ) {
						newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
						position.top += overTop - newOverBottom;
					// element is initially over bottom of within
					} else if ( overBottom > 0 && overTop <= 0 ) {
						position.top = withinOffset;
					// element is initially over both top and bottom of within
					} else {
						if ( overTop > overBottom ) {
							position.top = withinOffset + outerHeight - data.collisionHeight;
						} else {
							position.top = withinOffset;
						}
					}
				// too far up -> align with top
				} else if ( overTop > 0 ) {
					position.top += overTop;
				// too far down -> align with bottom edge
				} else if ( overBottom > 0 ) {
					position.top -= overBottom;
				// adjust based on position and margin
				} else {
					position.top = Math.max( position.top - collisionPosTop, position.top );
				}
			}
		},
		flip: {
			left: function( position, data ) {
				var within = data.within,
					withinOffset = within.offset.left + within.scrollLeft,
					outerWidth = within.width,
					offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
					collisionPosLeft = position.left - data.collisionPosition.marginLeft,
					overLeft = collisionPosLeft - offsetLeft,
					overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
					/*eslint-disable no-nested-ternary */
					myOffset = data.my[ 0 ] === "left" ?
						-data.elemWidth :
						data.my[ 0 ] === "right" ?
							data.elemWidth :
							0,
					atOffset = data.at[ 0 ] === "left" ?
						data.targetWidth :
						data.at[ 0 ] === "right" ?
							-data.targetWidth :
							0,
					/*eslint-enable no-nested-ternary */
					offset = -2 * data.offset[ 0 ],
					newOverRight,
					newOverLeft;

				if ( overLeft < 0 ) {
					newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
					if ( newOverRight < 0 || newOverRight < Math.abs( overLeft ) ) {
						position.left += myOffset + atOffset + offset;
					}
				} else if ( overRight > 0 ) {
					newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
					if ( newOverLeft > 0 || Math.abs( newOverLeft ) < overRight ) {
						position.left += myOffset + atOffset + offset;
					}
				}
			},
			top: function( position, data ) {
				var within = data.within,
					withinOffset = within.offset.top + within.scrollTop,
					outerHeight = within.height,
					offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
					collisionPosTop = position.top - data.collisionPosition.marginTop,
					overTop = collisionPosTop - offsetTop,
					overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
					top = data.my[ 1 ] === "top",
					/*eslint-disable no-nested-ternary */
					myOffset = top ?
						-data.elemHeight :
						data.my[ 1 ] === "bottom" ?
							data.elemHeight :
							0,
					atOffset = data.at[ 1 ] === "top" ?
						data.targetHeight :
						data.at[ 1 ] === "bottom" ?
							-data.targetHeight :
							0,
					/*eslint-enable no-nested-ternary */
					offset = -2 * data.offset[ 1 ],
					newOverTop,
					newOverBottom;
				if ( overTop < 0 ) {
					newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
					if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < Math.abs( overTop ) ) ) {
						position.top += myOffset + atOffset + offset;
					}
				} else if ( overBottom > 0 ) {
					newOverTop = position.top -  data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
					if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || Math.abs( newOverTop ) < overBottom ) ) {
						position.top += myOffset + atOffset + offset;
					}
				}
			}
		},
		flipfit: {
			left: function() {
				_pos_jQueryUI110.flip.left.apply( this, arguments );
				_pos_jQueryUI110.fit.left.apply( this, arguments );
			},
			top: function() {
				_pos_jQueryUI110.flip.top.apply( this, arguments );
				_pos_jQueryUI110.fit.top.apply( this, arguments );
			}
		}
	};

	jQuery.ui.position._sapUiCommonsMenuFlip = {
		left: function(position, data){

			if (jQuery.ui.position.flipfit) { //jQuery UI 1.9 ff.
				jQuery.ui.position.flipfit.left.apply(this, arguments);
				return;
			}

			//jQuery UI 1.8
			data = _migrateDataTojQueryUI110(data);
			_pos_jQueryUI110.flipfit.left.apply(this, arguments);
		},
		top: function(position, data){

			if (jQuery.ui.position.flipfit) { //jQuery UI 1.9 ff.
				jQuery.ui.position.flipfit.top.apply(this, arguments);
				return;
			}

			//jQuery UI 1.8
			data = _migrateDataTojQueryUI110(data);
			_pos_jQueryUI110.flipfit.top.apply(this, arguments);
		}
	};

	//******************** jQuery UI 1.10.3 End **************************


	})(window);


	return Menu;

}, /* bExport= */ true);
