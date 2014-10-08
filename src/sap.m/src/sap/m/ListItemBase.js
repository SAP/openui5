/*!
 * ${copyright}
 */

// Provides control sap.m.ListItemBase.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/theming/Parameters'],
	function(jQuery, library, Control, Parameters) {
	"use strict";


	
	/**
	 * Constructor for a new ListItemBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ListItemBase contains the core features of all specific list items.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.ListItemBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListItemBase = Control.extend("sap.m.ListItemBase", /** @lends sap.m.ListItemBase.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * Type of the list item, defines the behaviour
			 */
			type : {type : "sap.m.ListType", group : "Misc", defaultValue : sap.m.ListType.Inactive},
	
			/**
			 * Invisible list items are not rendered
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},
	
			/**
			 * If the unread indicator is set on the list, this boolean defines if it will be shown on this list item. Default is false.
			 */
			unread : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * This property defines the select state of the list item when using Single/Multi-Selection.
			 * 
			 * Note: Binding the "selected" property in single selection mode, may cause unwanted results, if you have more than one selected item in your binding
			 */
			selected : {type : "boolean", defaultValue : false},
	
			/**
			 * Property sets a counter bubble with the integer given.
			 */
			counter : {type : "int", group : "Misc", defaultValue : null}
		},
		events : {
	
			/**
			 * tap event
			 * @deprecated Since version 1.20.0. 
			 * This event is deprecated, use the press event instead.
			 */
			tap : {deprecated: true}, 
	
			/**
			 * detail tap event
			 * @deprecated Since version 7.20.0. 
			 * This event is deprecated, use the detailPress event instead.
			 */
			detailTap : {deprecated: true}, 
	
			/**
			 * Event is fired when the user clicks on the control.
			 */
			press : {}, 
	
			/**
			 * Event is fired when the user clicks on the detail button of the control.
			 */
			detailPress : {}
		}
	}});
	
	
	/**
	 * returns the state of the item selection as a boolean
	 *
	 * @name sap.m.ListItemBase#isSelected
	 * @function
	 * @type boolean
	 * @public
	 * @deprecated Since version 1.10.2. 
	 * API Change makes this method unnecessary
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	// IE9 does not support flex-box: do special table-based rendering (see List_noFlex.css)
	ListItemBase.prototype._bNoFlex = !jQuery.support.hasFlexBoxSupport;
	
	// image path for different theme and OS
	ListItemBase.prototype._sImagePath = jQuery.sap.getModulePath("sap.m", "/") + "themes/" + sap.ui.getCore().getConfiguration().getTheme() + "/img/list/" + (jQuery.os.ios ? "ios" : "android") + "/";
	
	// mode of the list e.g. singleSelection, multi...
	// internal selected state of the listitem
	ListItemBase.prototype.init = function() {
		this._active = false;
		this._mode = "None";
	};
	
	/*
	 * Returns the binding context path via checking the named model of parent
	 *
	 * @protected
	 * @since 1.16.3
	 */
	ListItemBase.prototype.getBindingContextPath = function(sModelName) {
		if (this._listId && !sModelName) {
			sModelName = (sap.ui.getCore().byId(this._listId).getBindingInfo("items") || {}).model;
		}
	
		var oContext = this.getBindingContext(sModelName);
		if (oContext) {
			return oContext.getPath();
		}
	};
	
	// radiobutton for single selection
	ListItemBase.prototype._getRadioButton = function(oRadioButtonId, sGroupName) {
	
		// maybe mode is changed
		if (this.hasOwnProperty("_checkBox")) {
			this._checkBox.destroy();
			delete this._checkBox;
		}
	
		return this._radioButton || (this._radioButton = new sap.m.RadioButton(oRadioButtonId, {
			groupName : sGroupName,
			activeHandling : false,
			selected : this.getSelected()
		}).setParent(this, null, true).attachSelect(this._select)).setTabIndex(-1);
	};
	
	// checkbox for multiselection
	ListItemBase.prototype._getCheckBox = function(oBoxId) {
	
		// maybe mode is changed
		if (this.hasOwnProperty("_radioButton")) {
			this._radioButton.destroy();
			delete this._radioButton;
		}
	
		return this._checkBox || (this._checkBox = new sap.m.CheckBox(oBoxId, {
			activeHandling : false,
			selected : this.getSelected()
		}).setParent(this, null, true).attachSelect(this._select)).setTabIndex(-1);
	};
	
	ListItemBase.prototype.exit = function() {
		if (this._radioButton) {
			this._radioButton.destroy();
			delete this._radioButton;
		}
	
		if (this._checkBox) {
			this._checkBox.destroy();
			delete this._checkBox;
		}
	
		if (this._navImage) {
			this._navImage.destroy();
			delete this._navImage;
		}
	
		if (this._delIcon) {
			this._delIcon.destroy();
			delete this._delIcon;
		}
	
		if (this._navIcon) {
			this._navIcon.destroy();
			delete this._navIcon;
		}
	
		if (this._detailIcon) {
			this._detailIcon.destroy();
			delete this._detailIcon;
		}
	
		this._oLastFocused = null;
	};
	
	/*
	 * Determines whether item is selectable or not
	 * Subclasses can overwrite in case of unselectable.
	 */
	ListItemBase.prototype.isSelectable = function() {
		return true;
	};
	
	ListItemBase.prototype.isSelected = function() {
		if (this.isSelectable()) {
			return this.getProperty("selected");
		}
		return false;
	};
	
	ListItemBase.prototype.getSelected = function() {
		return this.isSelected();
	};
	
	ListItemBase.prototype.setVisible = function(bVisible) {
		// do not handle when old and the new value is same
		bVisible = this.validateProperty("visible", bVisible);
		if (this.getVisible() === bVisible) {
			return this;
		}
	
		// set the property and invalidate
		this.setProperty("visible", bVisible);
	
		// inform the list about the change
		if (this._listId) {
			var oList = sap.ui.getCore().byId(this._listId);
			oList.onItemVisibleChange(this, bVisible);
		}
	
		return this;
	};
	
	ListItemBase.prototype.setSelected = function(bSelect, bDontNotifyParent) {
		bSelect = this.validateProperty("selected", bSelect);
	
		// do not handle when item is not selectable or in same status
		if (!this.isSelectable() || bSelect === this.getSelected()) {
			return this;
		}
	
		// notify parent about the selection first
		if (!bDontNotifyParent && this._listId) {
			var oList = sap.ui.getCore().byId(this._listId);
			oList.onItemSetSelected(this, bSelect);
		}
	
		// update selection box
		if (this._checkBox) {
			this._checkBox.setSelected(bSelect);
		} else if (this._radioButton) {
			this._radioButton.setSelected(bSelect);
		}
	
		// update DOM
		if (this.getDomRef()) {
			this.$().toggleClass("sapMLIBSelected", bSelect);
		}
	
		// set the property and return
		return this.setProperty("selected", bSelect, true);
	};
	
	ListItemBase.prototype.setActive = function(bActive) {
		if (bActive != this._active) {
			this._active = bActive;
			this._activeHandling();
	
			if (this.getType() == "Navigation") {
				this._activeHandlingNav();
			}
	
			if (bActive) {
				this._activeHandlingInheritor();
			} else {
				this._inactiveHandlingInheritor();
			}
		}
	
		return this;
	};
	
	// somehow unread ignores css when changed directly in the dom...therefore rerendering reactivated
	ListItemBase.prototype.setUnread = function(bUnread) {
		this.setProperty("unread", bUnread);
		this.$().toggleClass("sapMLIBUnread", bUnread);
		return this;
	};
	
	ListItemBase.prototype._getNavImage = function(oImgId, oImgStyle, oSrc, oActiveSrc) {
	
		// no navigation image for android
		if (!jQuery.os.ios && this.getType() == "Navigation") {
			return null;
		}
	
		if (this.hasOwnProperty("_navImage")) {
			return this._navImage;
		}
	
		if (oActiveSrc) {
			oActiveSrc = this._sImagePath + oActiveSrc;
		}
	
		this._navImage = new sap.m.Image(oImgId, {
			src : this._sImagePath + oSrc,
			activeSrc : oActiveSrc,
			densityAware : false
		}).addStyleClass(oImgStyle, true).setParent(this, null, true);
		return this._navImage;
	};
	
	ListItemBase.prototype._getDelImage = function(oImgId, oImgStyle, oSrc) {
		return this._delImage || (this._delImage = new sap.m.Image(oImgId, {
			src : this._sImagePath + oSrc,
			densityAware: false
		}).addStyleClass(oImgStyle, true).setParent(this, null, true).attachPress(this._delete));
	};
	
	ListItemBase.prototype.ontap = function(oEvent) {
		var type = this.getType();
	
		if (this._mode === "SingleSelectMaster" || (this._includeItemInSelection && (this._mode === "SingleSelect" || this._mode === "SingleSelectLeft" || this._mode === "MultiSelect"))) {
	
			// if _includeItemInSelection all tap events will be used for the mode select and delete
			// SingleSelectMaster always behaves like includeItemInSelection is set
			switch (this._mode) {
				case "SingleSelect":
				case "SingleSelectLeft":
				case "SingleSelectMaster":
	
					// check if radiobutton fired the event and therefore do not set the select
					if (!this.getSelected() && oEvent.srcControl && oEvent.srcControl.getId() !== this._radioButton.getId()) {
						this.setSelected(true);
						this._listId && sap.ui.getCore().byId(this._listId)._selectTapped(this);
					}
	
					break;
				case "MultiSelect":
	
					// check if checkbox fired the event and therefore do not set the select
					if (oEvent.srcControl && oEvent.srcControl.getId() !== this._checkBox.getId()) {
						this.setSelected(!this.getSelected());
						this._listId && sap.ui.getCore().byId(this._listId)._selectTapped(this);
					}
	
					break;
			}
		} else {
			switch (type) {
				case "Active":
				case "Navigation":
	
					// if a fast tap happens deactivate the touchstart/touchend timers and their logic
					if ( this._isActivationHandled(oEvent) && !this._eventHandledByControl) {
						window.clearTimeout(this._timeoutIdStart);
						window.clearTimeout(this._timeoutIdEnd);
						this.setActive(true);
						jQuery.sap.delayedCall(180, this, function() {
							this.setActive(false);
						});
					}
	
					if (!this._eventHandledByControl) {
						jQuery.sap.delayedCall(50, this, function(){
							this.fireTap({});
							this.firePress({});
						});
					}
	
					break;
	
				case "Detail":
					if (oEvent.srcControl && oEvent.srcControl.getId() === (this.getId() + "-imgDet")) {
						this.fireDetailTap({});
						this.fireDetailPress({});
					}
	
					break;
	
				case "DetailAndActive":
					if (oEvent.srcControl && oEvent.srcControl.getId() === (this.getId() + "-imgDet")) {
						this.fireDetailTap({});
						this.fireDetailPress({});
					} else {
	
						// if a fast tap happens deactivate the touchstart/touchend timers and their logic
						if ( this._isActivationHandled(oEvent) && !this._eventHandledByControl) {
							window.clearTimeout(this._timeoutIdStart);
							window.clearTimeout(this._timeoutIdEnd);
							this.setActive(true);
							jQuery.sap.delayedCall(180, this, function() {
								this.setActive(false);
							});
						}
	
						if (!this._eventHandledByControl) {
							jQuery.sap.delayedCall(50, this, function(){
								this.fireTap({});
								this.firePress({});
							});
						}
					}
	
					break;
			}
		}
	
		// tell the list, item is pressed
		if (this._listId && type != "Inactive" && !this._eventHandledByControl) {
			sap.ui.getCore().byId(this._listId)._onItemPressed(this, oEvent);
		}
	};
	
	ListItemBase.prototype.ontouchstart = function(oEvent) {
		this._eventHandledByControl = oEvent.isMarked();
	
		this._touchedY = oEvent.targetTouches[0].clientY;
		this._touchedX = oEvent.targetTouches[0].clientX;
	
		// timeout regarding active state when scrolling
		this._timeoutIdStart = jQuery.sap.delayedCall(100, this, function() {
	
			// several fingers could be used
			// for selections with whole list item interaction and singleselectmaster active handling is disabled
			if (!(this._includeItemInSelection && (this._mode == "SingleSelect" || this._mode == "SingleSelectLeft" || this._mode == "MultiSelect")) && ((oEvent.touches && oEvent.touches.length === 1) || !oEvent.touches)) {
				var type = this.getType();
				switch (type) {
					case "Active":
					case "Navigation":
					case "DetailAndActive":
	
						if (this._isActivationHandled(oEvent) && !this._eventHandledByControl) {
							oEvent.setMarked();
							this.setActive(true);
						}
	
						break;
				}
			}
		});
	};
	
	// touch move to prevent active state when scrolling
	ListItemBase.prototype.ontouchmove = function(oEvent) {
		var bTouchMovement = ((Math.abs(this._touchedY - oEvent.targetTouches[0].clientY) > 10) || Math.abs(this._touchedX - oEvent.targetTouches[0].clientX) > 10);
	
		if ((this._active || this._timeoutIdStart) && bTouchMovement) {
	
			// there is movement and therefore no tap...remove active styles
			clearTimeout(this._timeoutIdStart);
			this.setActive(false);
			this._timeoutIdStart = null;
			this._timeoutIdEnd = null;
		}
	};
	
	ListItemBase.prototype.ontouchend = function(oEvent) {
	
		// several fingers could be used
		if (oEvent.targetTouches.length === 0) {
			switch (this.getType()) {
				case "Active":
				case "Navigation":
				case "DetailAndActive":
	
					// wait maybe it is a tap
					this._timeoutIdEnd = jQuery.sap.delayedCall(100, this, function() {
						this._event = oEvent;
						this.setActive(false);
					});
	
					break;
			}
		}
	};
	
	// During native scrolling: Chrome sends touchcancel and no touchend thereafter
	ListItemBase.prototype.ontouchcancel = ListItemBase.prototype.ontouchend;
	
	// toggle active styles for navigation items
	ListItemBase.prototype._activeHandlingNav = function() {
		if (sap.ui.Device.os.ios) {
			this.$("imgNav").toggleClass("sapMLIBImgNavActive", this._active);
		}
	};
	
	// hook method for active handling...inheritors should overwrite this method
	ListItemBase.prototype._activeHandlingInheritor = function() {
	};
	
	// hook method for inactive handling...inheritors should overwrite this method
	ListItemBase.prototype._inactiveHandlingInheritor = function() {
	};
	
	// switch background style... toggle active feedback
	ListItemBase.prototype._activeHandling = function() {
		this.$().toggleClass("sapMLIBActive", this._active);
		this.$("counter").toggleClass("sapMLIBActiveCounter", this._active);
	
		if (this.getUnread()) {
			this.$("unread").toggleClass("sapMLIBActiveUnread", this._active);
		}
	
		var oImgDet = sap.ui.getCore().byId(this.getId() + "-imgDet");
		if (oImgDet) {
			oImgDet.$().toggleClass("sapMLIBIconDetActive", this._active);
		}
	
		var oImgDel = sap.ui.getCore().byId(this.getId() + "-imgDel");
		if (oImgDel) {
			oImgDel.$().toggleClass("sapMLIBIconDelActive", this._active);
		}
	};
	
	// checks the source control from event, whether it is handling the active feedback by its own or not...
	// also delete and detail icons won't cause an active feedback
	ListItemBase.prototype._isActivationHandled = function(oEvent) {
		this._event = oEvent;
		var control = oEvent.srcControl;
	
		if (control && control.getId() != this.getId() + "-imgDel" && control.getId() != this.getId() + "-imgDet" && (!control.getActiveHandling || control.getActiveHandling && control.getActiveHandling() !== false)) {
			return true;
		}
	
		return false;
	};
	
	/* Keyboard Handling */
	ListItemBase.prototype.onsapspace = function(oEvent) {
		if (!this._listId ||
			oEvent.isMarked() ||
			!this.isSelectable() ||
			oEvent.srcControl !== this ||
			this._mode == "Delete" ||
			this._mode == "None") {
			return;
		}
	
		if (this._mode == "MultiSelect") {
			this.setSelected(!this.getSelected());
			sap.ui.getCore().byId(this._listId)._selectTapped(this);
		} else if (!this.getSelected()) {
			this.setSelected(true);
			sap.ui.getCore().byId(this._listId)._selectTapped(this);
		}
	
		// let the parent know and prevent default not to scroll down
		oEvent.preventDefault();
		oEvent.setMarked();
	};
	
	ListItemBase.prototype.onsapenter = function(oEvent) {
		if (!this._listId ||
			oEvent.isMarked() ||
			oEvent.srcControl !== this) {
			return;
		}
	
		// let the list know item is pressed
		if (this.getType() != "Inactive") {
			sap.ui.getCore().byId(this._listId)._onItemPressed(this, oEvent);
		}
	
		// support old bug!!!
		// do not fire item press event when item is included into selection
		if ((this._includeItemInSelection && this._mode != "None" && this._mode != "Delete") ||
			this._mode == "SingleSelectMaster") {
			this.onsapspace(oEvent);
			return;
		}
	
		switch (this.getType()) {
			case "Active":
			case "Navigation":
			case "DetailAndActive":
				oEvent.setMarked();
	
				// active feedback
				this.setActive(true);
				jQuery.sap.delayedCall(180, this, function() {
					this.setActive(false);
				});
	
				// fire own press event
				jQuery.sap.delayedCall(0, this, function() {
					this.fireTap({});
					this.firePress({});
				});
	
				break;
		}
	};
	
	ListItemBase.prototype.onsapdelete = function(oEvent) {
		if (!this._listId ||
			oEvent.isMarked() ||
			oEvent.srcControl !== this ||
			this._mode != "Delete") {
			return;
		}
	
		this._delete.call(this._delIcon || this._delImage);
		oEvent.preventDefault();
		oEvent.setMarked();
	};
	
	ListItemBase.prototype._switchFocus = function(oEvent) {
		if (oEvent.srcControl !== this) {
			this._oLastFocused = oEvent.target;
			this.getDomRef().focus();
		} else if (this._oLastFocused) {
			this._oLastFocused.focus();
		}
	};
	
	ListItemBase.prototype.onkeydown = function(oEvent) {
		// check whether event is marked or not
		var mKeyCodes = jQuery.sap.KeyCodes;
		if (oEvent.isMarked()) {
			return;
		}
	
		// switch focus to row and focused item with F7
		if (oEvent.which == mKeyCodes.F7) {
			this._switchFocus(oEvent);
			oEvent.preventDefault();
			oEvent.setMarked();
			return;
		}
	
		// handle only the events that are coming from ListItem
		if (oEvent.srcControl !== this) {
			return;
		}
	
		// Ctrl + A to select all
		if (oEvent.which == mKeyCodes.A && (oEvent.metaKey || oEvent.ctrlKey)) {
			sap.ui.getCore().byId(this._listId).selectAll(true);
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};
	
	/**
	 * Returns the tabbable DOM elements as a jQuery collection
	 *
	 * @returns {jQuery} jQuery object
	 * @protected
	 * @since 1.26
	 */
	ListItemBase.prototype.getTabbables = function() {
		return this.$().find(":sapTabbable");
	};
	
	// handle the TAB key
	ListItemBase.prototype.onsaptabnext = function(oEvent) {
		// check whether event is marked or not
		if (!this._listId || oEvent.isMarked()) {
			return;
		}
	
		// if tab key is pressed while the last tabbable element of the list item
		// has been focused, we forward tab to the last pseudo element of the table
		var oLastTabbableDomRef = this.getTabbables().get(-1) || this.getDomRef();
		if (oEvent.target === oLastTabbableDomRef) {
			sap.ui.getCore().byId(this._listId).forwardTab(true);
			oEvent.setMarked();
		}
	};
	
	// handle the SHIFT-TAB key
	ListItemBase.prototype.onsaptabprevious = function(oEvent) {
		// check whether event is marked or not
		if (!this._listId || oEvent.isMarked()) {
			return;
		}
	
		// if shift-tab is pressed while the list item has been focused,
		// we forward tab to the root element of the list
		if (oEvent.target === this.getDomRef()) {
			sap.ui.getCore().byId(this._listId).forwardTab(false);
			oEvent.setMarked();
		}
	};
	
	// handle propagated focus to make the item row focusable
	ListItemBase.prototype.onfocusin = function(oEvent) {
		if (!this._listId ||
			oEvent.isMarked() ||
			oEvent.srcControl === this ||
			!jQuery(oEvent.target).is(":sapFocusable")) {
			return;
		}
	
		// inform the list that this item should be focusable
		sap.ui.getCore().byId(this._listId).setItemFocusable(this);
		oEvent.setMarked();
	};

	return ListItemBase;

}, /* bExport= */ true);
