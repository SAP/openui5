/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuTextFieldItem.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	'sap/ui/core/ValueStateSupport',
	'./MenuItemBase',
	'./library',
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/base/Log',
	'sap/ui/events/PseudoEvents',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/IconPool', // required by RenderManager#icon
	'sap/ui/dom/jquery/cursorPos' // provides jQuery.fn.cursorPos
],
	function(
		Localization,
		Library,
		ValueStateSupport,
		MenuItemBase,
		library,
		coreLibrary,
		Device,
		Log,
		PseudoEvents,
		InvisibleText
	) {
	"use strict";



	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;



	/**
	 * Constructor for a new MenuTextFieldItem element.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Special menu item which contains a label and a text field. This menu item is e.g. helpful for filter implementations.
	 * The aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 * @extends sap.ui.unified.MenuItemBase
	 * @implements sap.ui.unified.IMenuItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.21.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.MenuTextFieldItem
	 */
	var MenuTextFieldItem = MenuItemBase.extend("sap.ui.unified.MenuTextFieldItem", /** @lends sap.ui.unified.MenuTextFieldItem.prototype */ { metadata : {

		interfaces: [
			"sap.ui.unified.IMenuItem"
		],
		library : "sap.ui.unified",
		properties : {

			/**
			 * Defines the label of the text field of the item.
			 */
			label : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Defines the icon of the {@link sap.ui.core.IconPool sap.ui.core.IconPool} or an image which should be displayed on the item.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * Defines the value of the text field of the item.
			 */
			value : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the value state of the text field of the item. This allows you to visualize e.g. warnings or errors.
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : ValueState.None}
		}
	}});



	MenuTextFieldItem.prototype.render = function(oRenderManager, oItem, oMenu, oInfo){
		var rm = oRenderManager,
			bIsEnabled = oMenu.checkEnabled(oItem),
			itemId = oItem.getId(),
			oIcon;

		rm.openStart("li", oItem);
		if (oItem.getVisible()) {
			rm.attr("tabindex", "0");
		}
		rm.class("sapUiMnuItm").class("sapUiMnuTfItm");

		if (oInfo.iItemNo == 1) {
			rm.class("sapUiMnuItmFirst");
		} else if (oInfo.iItemNo == oInfo.iTotalItems) {
			rm.class("sapUiMnuItmLast");
		}
		if (!bIsEnabled) {
				rm.class("sapUiMnuItmDsbl");
		}
		if (oItem.getStartsSection()) {
			rm.class("sapUiMnuItmSepBefore");
		}

		// ARIA
		if (oInfo.bAccessible) {
			rm.attr("role", "menuitem");
			rm.attr("aria-posinset", oInfo.iItemNo);
			rm.attr("aria-setsize", oInfo.iTotalItems);
			rm.attr("aria-disabled", !bIsEnabled);
		}

		rm.openEnd();

		if (oItem.getIcon()) {
			// icon/check column
			rm.openStart("div").class("sapUiMnuItmIco").openEnd();

			oIcon = oItem._getIcon();

			rm.renderControl(oIcon);

			rm.close("div");
		}

		// Text filed column
		rm.openStart("div", itemId + "-txt").class("sapUiMnuItmTxt").openEnd();
		rm.openStart("label", itemId + "-lbl").class("sapUiMnuTfItemLbl").openEnd();
		rm.text(oItem.getLabel());
		rm.close("label");
		rm.openStart("div", itemId + "-str").class("sapUiMnuTfItmStretch").openEnd().close("div"); // Helper to strech the width if needed
		rm.openStart("div").class("sapUiMnuTfItemWrppr").openEnd();
		rm.voidStart("input", itemId + "-tf").attr("tabindex", "-1");
		rm.attr("role", "textbox");
		if (oItem.getValue()) {
			rm.attr("value", oItem.getValue());
		}
		rm.class("sapUiMnuTfItemTf").class(bIsEnabled ? "sapUiMnuTfItemTfEnbl" : "sapUiMnuTfItemTfDsbl");
		if (!bIsEnabled) {
			rm.attr("disabled", "disabled");
		}
		if (oInfo.bAccessible) {
			rm.accessibilityState(oItem, {
				disabled: null, // Prevent aria-disabled as a disabled attribute is enough
				describedby: oItem._fnInvisibleDescriptionFactory(oInfo).getId(),
				labelledby: itemId + "-lbl"
			});
		}
		rm.voidEnd().close("div").close("div");

		rm.close("li");
	};

	MenuTextFieldItem.prototype.exit = function() {
		if (this._invisibleDescription) {
			this._fnInvisibleDescriptionFactory().destroy();
			this._invisibleDescription = null;
		}
	};

	MenuTextFieldItem.prototype.hover = function(bHovered, oMenu){
		this.$().toggleClass("sapUiMnuItmHov", bHovered);

		if (bHovered) {
			oMenu.closeSubmenu(false, true);
		}
	};

	MenuTextFieldItem.prototype.focus = function(oMenu){
		if (this.getVisible() && this.getEnabled()) {
			this.$("tf").get(0).focus();
		} else {
			this.$().trigger("focus");
		}
	};

	MenuTextFieldItem.prototype.onAfterRendering = function(){
		this.setValueState(this.getValueState());
	};


	//************ Event Handling *************


	MenuTextFieldItem.prototype.onsapup = function(oEvent){
		this.getParent().onsapprevious(oEvent);
	};


	MenuTextFieldItem.prototype.onsapdown = function(oEvent){
		this.getParent().onsapnext(oEvent);
	};


	MenuTextFieldItem.prototype.onsaphome = function(oEvent){
		if (this._checkCursorPosForNav(false)) {
			this.getParent().onsaphome(oEvent);
		}
	};


	MenuTextFieldItem.prototype.onsapend = function(oEvent){
		if (this._checkCursorPosForNav(true)) {
			this.getParent().onsapend(oEvent);
		}
	};


	MenuTextFieldItem.prototype.onsappageup = function(oEvent){
		this.getParent().onsappageup(oEvent);
	};


	MenuTextFieldItem.prototype.onsappagedown = function(oEvent){
		this.getParent().onsappagedown(oEvent);
	};


	MenuTextFieldItem.prototype.onsapescape = function(oEvent){
		this.getParent().onsapescape(oEvent);
	};


	MenuTextFieldItem.prototype.onkeydown = function(oEvent){
		oEvent.stopPropagation(); //Avoid bubbling key events to the Menu -> Events are only selectively forwarded
	};


	MenuTextFieldItem.prototype.onclick = function(oEvent){
		this.getParent().closeSubmenu(false, true);
		if (!Device.system.desktop) {
			this.focus();
		}
		oEvent.stopPropagation();
	};


	MenuTextFieldItem.prototype.onkeyup = function(oEvent){
		//like sapenter but on keyup -> see Menu.prototype.onkeyup
		if (!PseudoEvents.events.sapenter.fnCheck(oEvent) && oEvent.key !== "Enter") {
			return;
		}
		var sValue = this.$("tf").val();
		this.setValue(sValue);
		this.getParent().selectItem(this);
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};


	// ************ Overridden API functions *************

	/**
	 * The aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 *
	 * @return {sap.ui.unified.Menu}
	 * @public
	 * @name sap.ui.unified.MenuTextFieldItem#getSubmenu
	 * @deprecated As of version 1.21, the aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 * @function
	 * @ui5-not-supported
	 */

	/**
	 * The aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 *
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.unified.MenuTextFieldItem#destroySubmenu
	 * @deprecated As of version 1.21, the aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 * @ui5-not-supported
	 * @function
	 */

	/**
	 * The aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 *
	 * @param {sap.ui.unified.Menu} oMenu The menu to which the sap.ui.unified.Submenu should be set
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.21, the aggregation <code>submenu</code> (inherited from parent class) is not supported for this type of menu item.
	 * @ui5-not-supported
	 */
	MenuTextFieldItem.prototype.setSubmenu = function(oMenu){
		Log.warning("The aggregation 'submenu' is not supported for this type of menu item.", "", "sap.ui.unified.MenuTextFieldItem");
		return this;
	};


	MenuTextFieldItem.prototype.setLabel = function(sLabel){
		this.setProperty("label", sLabel, true);
		this.$("lbl").text(sLabel);
		return this;
	};


	MenuTextFieldItem.prototype.setValue = function(sValue){
		this.setProperty("value", sValue, true);
		this.$("tf").val(sValue);
		//this._adaptSizes();
		return this;
	};


	MenuTextFieldItem.prototype.setValueState = function(sValueState){
		this.setProperty("valueState", sValueState, true);
		var $tf = this.$("tf");
		$tf.toggleClass("sapUiMnuTfItemTfErr", sValueState == ValueState.Error);
		$tf.toggleClass("sapUiMnuTfItemTfWarn", sValueState == ValueState.Warning);
		var sTooltip = ValueStateSupport.enrichTooltip(this, this.getTooltip_AsString());
		if (sTooltip) {
			this.$().attr("title", sTooltip);
		}
		return this;
	};


	//************ Private Helpers *************


	MenuTextFieldItem.prototype.getFocusDomRef = function () {
		var $FocusRef = this.$("tf");
		return $FocusRef.length ? $FocusRef.get(0) : null;
	};

	MenuTextFieldItem.prototype._checkCursorPosForNav = function(bForward) {
		var bRtl = Localization.getRTL();
		var bBack = bForward ? bRtl : !bRtl;
		var $input = this.$("tf");
		var iPos = $input.cursorPos();
		var iLen = $input.val().length;
		if (bRtl) {
			iPos = iLen - iPos;
		}
		if ((!bBack && iPos != iLen) || (bBack && iPos != 0)) {
			return false;
		}
		return true;
	};

	MenuTextFieldItem.prototype._fnInvisibleDescriptionFactory = function(oInfo) {
		var sCountInfo, sTypeInfo, oUnifiedBundle;

		if (!this._invisibleDescription) {
			oUnifiedBundle = Library.getResourceBundleFor("sap.ui.unified");
			sCountInfo = oUnifiedBundle.getText("UNIFIED_MENU_ITEM_COUNT_TEXT", [oInfo.iItemNo, oInfo.iTotalItems]);
			sTypeInfo = oUnifiedBundle.getText("UNIFIED_MENU_ITEM_HINT_TEXT");
			this._invisibleDescription = new InvisibleText({
				text: sCountInfo + " " + sTypeInfo
			}).toStatic();
		}

		return this._invisibleDescription;
	};

	return MenuTextFieldItem;

});