/*!
 * ${copyright}
 */

// Provides control sap.m.ListItemBase.
sap.ui.define([
	"jquery.sap.global",
	"sap/base/events/KeyCodes",
	"sap/ui/model/BindingMode",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/Icon",
	"./library",
	"./Button",
	"./CheckBox",
	"./RadioButton",
	"./ListItemBaseRenderer"
],
function(
	jQuery,
	KeyCodes,
	BindingMode,
	Device,
	Control,
	IconPool,
	Icon,
	library,
	Button,
	CheckBox,
	RadioButton,
	ListItemBaseRenderer
) {
	"use strict";


	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListType
	var ListItemType = library.ListType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;


	/**
	 * Constructor for a new ListItemBase.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * ListItemBase contains the base features of all specific list items.
	 * <b>Note:</b> If not mentioned otherwise in the individual subclasses, list items must only be used in the <code>items</code> aggregation of <code>sap.m.ListBase</code> controls.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.ListItemBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListItemBase = Control.extend("sap.m.ListItemBase", /** @lends sap.m.ListItemBase.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the visual indication and behavior of the list items, e.g. <code>Active</code>, <code>Navigation</code>, <code>Detail</code>.
			 */
			type : {type : "sap.m.ListType", group : "Misc", defaultValue : ListItemType.Inactive},

			/**
			 * Whether the control should be visible on the screen. If set to false, a placeholder is rendered instead of the real control.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Activates the unread indicator for the list item, if set to <code>true</code>.
			 * <b>Note:</b> This flag is ignored when the <code>showUnread</code> property of the parent is set to <code>false</code>.
			 */
			unread : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Defines the selected state of the list items.
			 * <b>Note:</b> Binding the <code>selected</code> property in single selection modes may cause unwanted results if you have more than one selected items in your binding.
			 */
			selected : {type : "boolean", defaultValue : false},

			/**
			 * Defines the counter value of the list items.
			 */
			counter : {type : "int", group : "Misc", defaultValue : null},

			/**
			 * Defines the highlight state of the list items.
			 * @since 1.44.0
			 */
			highlight : {type : "sap.ui.core.MessageType", group : "Appearance", defaultValue : "None"}
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.28.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events : {

			/**
			 * Fires when the user taps on the control.
			 * @deprecated Since version 1.20.0. Instead, use <code>press</code> event.
			 */
			tap : {deprecated: true},

			/**
			 * Fires when the user taps on the detail button of the control.
			 * @deprecated Since version 1.20.0. Instead, use <code>detailPress</code> event.
			 */
			detailTap : {deprecated: true},

			/**
			 * Fires when the user clicks on the control.
			 * <b>Note:</b> This event is not fired when the parent <code>mode</code> is <code>SingleSelectMaster</code> or when the <code>includeItemInSelection</code> property is set to <code>true</code>.
			 * If there is an interactive element that handles its own <code>press</code> event then the list item's <code>press</code> event is not fired.
			 * Also see {@link sap.m.ListBase#attachItemPress}.
			 */
			press : {},

			/**
			 * Fires when the user clicks on the detail button of the control.
			 */
			detailPress : {}
		},
		designtime: "sap/m/designtime/ListItemBase.designtime"
	}});

	ListItemBase.getAccessibilityText = function(oControl, bDetectEmpty) {
		if (!oControl || !oControl.getVisible || !oControl.getVisible()) {
			return "";
		}

		var oAccInfo;
		if (oControl.getAccessibilityInfo) {
			oAccInfo = oControl.getAccessibilityInfo();
		}
		if (!oAccInfo || !oControl.getAccessibilityInfo) {
			oAccInfo = this.getDefaultAccessibilityInfo(oControl.getDomRef());
		}

		oAccInfo = jQuery.extend({
			type: "",
			description: "",
			children: []
		}, oAccInfo);

		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sText = oAccInfo.type + " " + oAccInfo.description + " ",
			sTooltip = oControl.getTooltip_AsString();

		if (oAccInfo.enabled === false) {
			sText += oBundle.getText("CONTROL_DISABLED") + " ";
		}
		if (oAccInfo.editable === false) {
			sText += oBundle.getText("CONTROL_READONLY") + " ";
		}
		if (!oAccInfo.type && sTooltip && sText.indexOf(sTooltip) == -1) {
			sText = sTooltip + " " + sText;
		}

		oAccInfo.children.forEach(function(oChild) {
			sText += ListItemBase.getAccessibilityText(oChild) + " ";
		});

		sText = sText.trim();
		if (bDetectEmpty && !sText) {
			sText = oBundle.getText("CONTROL_EMPTY");
		}

		return sText;
	};

	ListItemBase.getDefaultAccessibilityInfo = function(oDomRef) {
		if (!oDomRef) {
			return null;
		}

		var Node = window.Node,
			NodeFilter = window.NodeFilter,
			oTreeWalker = document.createTreeWalker(oDomRef, NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT, function(oNode) {
				if (oNode.type === Node.ELEMENT_NODE) {
					if (oNode.classList.contains("sapUiInvisibleText")) {
						return NodeFilter.FILTER_SKIP;
					}

					if (oNode.getAttribute("aria-hidden") == "true" ||
						oNode.style.visibility == "hidden" ||
						oNode.style.display == "none") {
						return NodeFilter.FILTER_REJECT;
					}

					return NodeFilter.FILTER_SKIP;
				}

				return NodeFilter.FILTER_ACCEPT;
			}, false);

		var aText = [];
		while (oTreeWalker.nextNode()) {
			var oNode = oTreeWalker.currentNode;
			if (oNode.nodeType === Node.TEXT_NODE) {
				var sText = (oNode.nodeValue || "").trim();
				if (sText) {
					aText.push(sText);
				}
			}
		}

		return {
			description: aText.join(" ")
		};
	};

	// icon URI configuration
	ListItemBase.prototype.DetailIconURI = IconPool.getIconURI("edit");
	ListItemBase.prototype.DeleteIconURI = IconPool.getIconURI("sys-cancel");
	ListItemBase.prototype.NavigationIconURI = IconPool.getIconURI("slim-arrow-right");

	// defines the root tag name for rendering purposes
	ListItemBase.prototype.TagName = "li";

	// internal active state of the listitem
	ListItemBase.prototype.init = function() {
		this._active = false;
		this._bGroupHeader = false;
		this._bNeedsHighlight = false;
	};

	ListItemBase.prototype.onAfterRendering = function() {
		this.informList("DOMUpdate", true);
		this._checkHighlight();
	};

	/*
	 * Returns the binding context path via checking the named model of parent
	 *
	 * @protected
	 * @since 1.16.3
	 */
	ListItemBase.prototype.getBindingContextPath = function(sModelName) {
		var oList = this.getList();
		if (oList && !sModelName) {
			sModelName = (oList.getBindingInfo("items") || {}).model;
		}

		var oContext = this.getBindingContext(sModelName);
		if (oContext) {
			return oContext.getPath();
		}
	};

	/*
	 * Returns whether selected property is two-way bound or not
	 * @protected
	 */
	ListItemBase.prototype.isSelectedBoundTwoWay = function() {
		var oBinding = this.getBinding("selected");
		if (oBinding && oBinding.getBindingMode() == BindingMode.TwoWay) {
			return true;
		}
	};

	/*
	 * Returns the responsible list control
	 *
	 * @returns {sap.m.ListBase|undefined}
	 * @protected
	 */
	ListItemBase.prototype.getList = function() {
		var oParent = this.getParent();
		if (oParent instanceof sap.m.ListBase) {
			return oParent;
		}
	};

	/*
	 * Returns the property of the responsible list container according to given parameter.
	 *
	 * @param {string} sProperty property name
	 * @param {*} [vFallbackValue] fallback value when list is not found
	 * @return {*}
	 * @protected
	 */
	ListItemBase.prototype.getListProperty = function(sProperty, vFallbackValue) {
		var oList = this.getList();
		if (oList) {
			sProperty = jQuery.sap.charToUpperCase(sProperty);
			return oList["get" + sProperty]();
		}

		return vFallbackValue;
	};

	/*
	 * Informs the responsible list for item events
	 *
	 * @param {string} sEvent the name of the event
	 * @param {*} [vParam1] first additional parameter
	 * @param {*} [vParam2] second additional parameter
	 * @protected
	 */
	ListItemBase.prototype.informList = function(sEvent, vParam1, vParam2) {
		var oList = this.getList();
		if (oList) {
			var sMethod = "onItem" + sEvent;
			if (oList[sMethod]) {
				oList[sMethod](this, vParam1, vParam2);
			}
		}
	};

	ListItemBase.prototype.informSelectedChange = function(bSelected) {
		var oList = this.getList();
		if (oList) {
			oList.onItemSelectedChange(this, bSelected);
			this.bSelectedDelayed = undefined;
		} else {
			this.bSelectedDelayed = bSelected;
		}
	};

	ListItemBase.prototype.getAccessibilityType = function(oBundle) {
		return oBundle.getText("ACC_CTR_TYPE_OPTION");
	};

	ListItemBase.prototype.getGroupAnnouncement = function() {
		return this.$().prevAll(".sapMGHLI:first").text();
	};

	ListItemBase.prototype.getAccessibilityDescription = function(oBundle) {
		var aOutput = [],
			sType = this.getType(),
			sHighlight = this.getHighlight(),
			sTooltip = this.getTooltip_AsString();

		if (this.getSelected()) {
			aOutput.push(oBundle.getText("LIST_ITEM_SELECTED"));
		}

		if (sHighlight != "None") {
			aOutput.push(oBundle.getText("LIST_ITEM_STATE_" + sHighlight.toUpperCase()));
		}

		if (this.getUnread() && this.getListProperty("showUnread")) {
			aOutput.push(oBundle.getText("LIST_ITEM_UNREAD"));
		}

		if (this.getCounter()) {
			aOutput.push(oBundle.getText("LIST_ITEM_COUNTER", this.getCounter()));
		}

		if (sType == ListItemType.Navigation) {
			aOutput.push(oBundle.getText("LIST_ITEM_NAVIGATION"));
		} else {
			if (sType == ListItemType.Detail || sType == ListItemType.DetailAndActive) {
				aOutput.push(oBundle.getText("LIST_ITEM_DETAIL"));
			}
			if (sType == ListItemType.Active || sType == ListItemType.DetailAndActive) {
				aOutput.push(oBundle.getText("LIST_ITEM_ACTIVE"));
			}
		}

		aOutput.push(this.getGroupAnnouncement() || "");

		if (this.getContentAnnouncement) {
			aOutput.push((this.getContentAnnouncement(oBundle) || "").trim());
		}

		if (sTooltip) {
			aOutput.push(sTooltip);
		}

		return aOutput.join(" ");
	};

	ListItemBase.prototype.getAccessibilityInfo = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return {
			type: this.getAccessibilityType(oBundle),
			description: this.getAccessibilityDescription(oBundle),
			focusable: true
		};
	};

	/**
	 * Returns the accessibility announcement for the content.
	 *
	 * Hook for the subclasses.
	 *
	 * @returns {string}
	 * @protected
	 * @name sap.m.ListItemBase.prototype.getContentAnnouncement
	 * @function
	 */

	/*
	 * Returns the mode of the current item according to list mode
	 * Subclasses can overwrite this if item should not have any mode
	 * Default empty mode is used when list mode is not yet known
	 *
	 * @returns {sap.m.ListMode|""}
	 * @protected
	 */
	ListItemBase.prototype.getMode = function() {
		return this.getListProperty("mode", "");
	};

	/*
	 * Updates the accessibility state of the control.
	 *
	 * @param {Object} [mAccessibility] a map of accessibility properties
	 * @protected
	 */
	ListItemBase.prototype.updateAccessibilityState = function(mAccessibility) {
		var $This = this.$();
		if (!$This.length) {
			return;
		}

		var $Items = $This.parent().children(".sapMLIB");
		$This.attr(jQuery.extend({
			"aria-setsize": $Items.length,
			"aria-posinset": $Items.index($This) + 1
		}, mAccessibility));
	};

	/**
	 * Returns the delete icon when mode is Delete
	 *
	 * @return {sap.ui.core.Icon}
	 * @private
	 */
	ListItemBase.prototype.getDeleteControl = function(bCreateIfNotExist) {
		if (!bCreateIfNotExist || this._oDeleteControl) {
			return this._oDeleteControl;
		}

		this._oDeleteControl = new Button({
			id: this.getId() + "-imgDel",
			icon: this.DeleteIconURI,
			type: ButtonType.Transparent,
			tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_ITEM_DELETE")
		}).addStyleClass("sapMLIBIconDel sapMLIBSelectD").setParent(this, null, true).attachPress(function(oEvent) {
			this.informList("Delete");
		}, this);

		this._oDeleteControl._bExcludeFromTabChain = true;

		return this._oDeleteControl;
	};

	/**
	 * Returns the detail icon when item type is Detail|DetailAndActive
	 *
	 * @return {sap.ui.core.Icon}
	 * @private
	 */
	ListItemBase.prototype.getDetailControl = function(bCreateIfNotExist) {
		if (!bCreateIfNotExist || this._oDetailControl) {
			return this._oDetailControl;
		}

		this._oDetailControl = new Button({
			id: this.getId() + "-imgDet",
			icon: this.DetailIconURI,
			type: ButtonType.Transparent,
			tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("LIST_ITEM_EDIT")
		}).addStyleClass("sapMLIBType sapMLIBIconDet").setParent(this, null, true).attachPress(function() {
			this.fireDetailTap();
			this.fireDetailPress();
		}, this);

		this._oDetailControl._bExcludeFromTabChain = true;

		return this._oDetailControl;
	};

	/**
	 * Returns the navigation icon when item type is Navigation
	 *
	 * @return {sap.ui.core.Icon}
	 * @private
	 */
	ListItemBase.prototype.getNavigationControl = function(bCreateIfNotExist) {
		if (!bCreateIfNotExist || this._oNavigationControl) {
			return this._oNavigationControl;
		}

		this._oNavigationControl = new Icon({
			id: this.getId() + "-imgNav",
			src: this.NavigationIconURI,
			useIconTooltip: false,
			noTabStop: true
		}).setParent(this, null, true).addStyleClass("sapMLIBType sapMLIBImgNav");

		return this._oNavigationControl;
	};

	/**
	 * Returns RadioButton control when mode is one of Single Selection type
	 *
	 * @return {sap.m.RadioButton}
	 * @private
	 */
	ListItemBase.prototype.getSingleSelectControl = function(bCreateIfNotExist) {
		if (!bCreateIfNotExist || this._oSingleSelectControl) {
			bCreateIfNotExist && this._oSingleSelectControl.setSelected(this.getSelected());
			return this._oSingleSelectControl;
		}

		this._oSingleSelectControl = new RadioButton({
			id: this.getId() + "-selectSingle",
			groupName: this.getListProperty("id") + "_selectGroup",
			activeHandling: false,
			selected: this.getSelected()
		}).addStyleClass("sapMLIBSelectS").setParent(this, null, true).setTabIndex(-1).attachSelect(function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.setSelected(bSelected);
			this.informList("Select", bSelected);
		}, this);

		return this._oSingleSelectControl;
	};

	/**
	 * Returns CheckBox control when mode is MultiSelection
	 *
	 * @return {sap.m.CheckBox}
	 * @private
	 */
	ListItemBase.prototype.getMultiSelectControl = function(bCreateIfNotExist) {
		if (!bCreateIfNotExist || this._oMultiSelectControl) {
			bCreateIfNotExist && this._oMultiSelectControl.setSelected(this.getSelected());
			return this._oMultiSelectControl;
		}

		this._oMultiSelectControl = new CheckBox({
			id: this.getId() + "-selectMulti",
			activeHandling: false,
			selected: this.getSelected()
		}).addStyleClass("sapMLIBSelectM").setParent(this, null, true).setTabIndex(-1).attachSelect(function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.setSelected(bSelected);
			this.informList("Select", bSelected);
		}, this);

		return this._oMultiSelectControl;
	};

	/**
	 * Returns responsible control depends on the mode
	 *
	 * @returns {sap.ui.core.Control}
	 * @private
	 */
	ListItemBase.prototype.getModeControl = function(bCreateIfNotExist) {
		var sMode = this.getMode();

		if (!sMode || sMode == ListMode.None) {
			return;
		}

		if (sMode == ListMode.Delete) {
			return this.getDeleteControl(bCreateIfNotExist);
		}

		if (sMode == ListMode.MultiSelect) {
			return this.getMultiSelectControl(bCreateIfNotExist);
		}

		return this.getSingleSelectControl(bCreateIfNotExist);
	};

	/**
	 * Returns item type icon
	 *
	 * @returns {sap.ui.core.Icon}
	 * @private
	 */
	ListItemBase.prototype.getTypeControl = function(bCreateIfNotExist) {
		var sType = this.getType();

		if (sType == ListItemType.Detail || sType == ListItemType.DetailAndActive) {
			return this.getDetailControl(bCreateIfNotExist);
		}

		if (sType == ListItemType.Navigation) {
			return this.getNavigationControl(bCreateIfNotExist);
		}
	};

	/**
	 * Destroys generated mode/type controls
	 *
	 * @param {String[]} aControls array of control names
	 * @private
	 */
	ListItemBase.prototype.destroyControls = function(aControls) {
		aControls.forEach(function(sControl) {
			sControl = "_o" + sControl + "Control";
			if (this[sControl]) {
				this[sControl].destroy("KeepDom");
				this[sControl] = null;
			}
		}, this);
	};

	/**
	 * Determines whether item has any action or not.
	 * @private
	 */
	ListItemBase.prototype.isActionable = function() {
		return this.getListProperty("includeItemInSelection") ||
				this.getMode() == ListMode.SingleSelectMaster || (
					this.getType() != ListItemType.Inactive &&
					this.getType() != ListItemType.Detail
				);
	};

	ListItemBase.prototype.exit = function() {
		this._oLastFocused = null;
		this._checkHighlight(false);
		this.setActive(false);
		this.destroyControls([
			"Delete",
			"SingleSelect",
			"MultiSelect",
			"Detail",
			"Navigation"
		]);
	};

	/**
	 * Determines whether item is selectable or not.
	 * By default, when item should be in selectable mode
	 *
	 * Subclasses can overwrite in case of unselectable item.
	 * @returns {Boolean}
	 * @private
	 */
	ListItemBase.prototype.isSelectable = function() {
		var sMode = this.getMode();
		return !(sMode == ListMode.None || sMode == ListMode.Delete);
	};

	ListItemBase.prototype.getSelected = function() {
		if (this.isSelectable()) {
			return this.getProperty("selected");
		}
		return false;
	};

	/**
	 * Returns the state of the item selection as a boolean
	 *
	 * @public
	 * @return boolean
	 * @deprecated Since version 1.10.2.
	 * API Change makes this method unnecessary. Use getSelected method instead.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ListItemBase.prototype.isSelected = ListItemBase.prototype.getSelected;

	ListItemBase.prototype.setSelected = function(bSelected, bDontNotifyParent) {
		// do not handle when item is not selectable or in same status
		bSelected = this.validateProperty("selected", bSelected);
		if (!this.isSelectable() || bSelected == this.getSelected()) {
			return this;
		}

		// notify parent about the selection first
		if (!bDontNotifyParent) {
			this.informSelectedChange(bSelected);
		}

		// update the selection control status
		var oSelectionControl = this.getModeControl();
		if (oSelectionControl) {
			oSelectionControl.setSelected(bSelected);
		}

		// run the hook to update dom state
		this.updateSelectedDOM(bSelected, this.$());

		// set the property and do not invalidate
		this.setProperty("selected", bSelected, true);

		return this;
	};

	// Updates the selected state of the DOM
	ListItemBase.prototype.updateSelectedDOM = function(bSelected, $This) {
		$This.toggleClass("sapMLIBSelected", bSelected);
		$This.attr("aria-selected", bSelected);
	};

	ListItemBase.prototype.setParent = function(oParent) {
		Control.prototype.setParent.apply(this, arguments);
		if (!oParent) {
			this._bGroupHeader = false;
			return;
		}

		this.informList("Inserted", this.bSelectedDelayed);
		return this;
	};

	ListItemBase.prototype.setBindingContext = function() {
		Control.prototype.setBindingContext.apply(this, arguments);
		this.informList("BindingContextSet");
		return this;
	};

	/**
	 * Determines whether group header item or not.
	 *
	 * @return {Boolean}
	 */
	ListItemBase.prototype.isGroupHeader = function() {
		return this._bGroupHeader;
	};

	/**
	 * Determines whether item is in SingleSelectMaster mode or
	 * other selection modes when includeItemInSelection is true
	 *
	 * @return {Boolean}
	 */
	ListItemBase.prototype.isIncludedIntoSelection = function() {
		var sMode = this.getMode();
		return (sMode == ListMode.SingleSelectMaster || (
				 this.getListProperty("includeItemInSelection") && (
					sMode == ListMode.SingleSelectLeft ||
					sMode == ListMode.SingleSelect ||
					sMode == ListMode.MultiSelect)
				));
	};

	// informs the list when item's highlight is changed
	ListItemBase.prototype._checkHighlight = function(bNeedsHighlight) {
		if (bNeedsHighlight == undefined) {
			bNeedsHighlight = (this.getVisible() && this.getHighlight() != "None");
		}

		if (this._bNeedsHighlight != bNeedsHighlight) {
			this._bNeedsHighlight = bNeedsHighlight;
			this.informList("HighlightChange", bNeedsHighlight);
		}
	};

	/**
	 * Determines whether item needs icon to render type or not
	 *
	 * @return {Boolean}
	 */
	ListItemBase.prototype.hasActiveType = function() {
		var sType = this.getType();
		return (sType == ListItemType.Active ||
				sType == ListItemType.Navigation ||
				sType == ListItemType.DetailAndActive);
	};

	ListItemBase.prototype.setActive = function(bActive) {
		if (bActive == this._active) {
			return this;
		}

		if (bActive && this.getListProperty("activeItem")) {
			return this;
		}

		var $This = this.$();
		this._active = bActive;
		this._activeHandling($This);

		if (this.getType() == ListItemType.Navigation) {
			this._activeHandlingNav($This);
		}

		if (bActive) {
			this._activeHandlingInheritor($This);
		} else {
			this._inactiveHandlingInheritor($This);
		}

		this.informList("ActiveChange", bActive);
	};

	ListItemBase.prototype.ontap = function(oEvent) {

		// do not handle already handled events
		if (this._eventHandledByControl || window.getSelection().toString()) {
			return;
		}

		// if includeItemInSelection all tap events will be used for the mode select and delete
		// SingleSelectMaster always behaves like includeItemInSelection is set
		if (this.isIncludedIntoSelection()) {

			// update selected property
			if (this.getMode() == ListMode.MultiSelect) {
				this.setSelected(!this.getSelected());
				this.informList("Select", this.getSelected());
			} else if (!this.getSelected()) {
				this.setSelected(true);
				this.informList("Select", true);
			}
		} else if (this.hasActiveType()) {

			// if a fast tap happens deactivate the touchstart/touchend timers and their logic
			window.clearTimeout(this._timeoutIdStart);
			window.clearTimeout(this._timeoutIdEnd);

			// active feedback
			this.setActive(true);

			// even though the tabindex=-1, list items are not focusable on iPhone
			if (Device.os.ios) {
				this.focus();
			}

			jQuery.sap.delayedCall(180, this, function() {
				this.setActive(false);
			});

			jQuery.sap.delayedCall(0, this, function() {
				this.fireTap();
				this.firePress();
			});
		}

		// tell the parent, item is pressed
		this.informList("Press", oEvent.srcControl);
	};

	ListItemBase.prototype.ontouchstart = function(oEvent) {
		this._eventHandledByControl = oEvent.isMarked();

		var oTargetTouch = oEvent.targetTouches[0];
		this._touchedY = oTargetTouch.clientY;
		this._touchedX = oTargetTouch.clientX;

		// active handling if not handled already by control
		// several fingers could be used
		if (this._eventHandledByControl ||
			oEvent.touches.length != 1 ||
			!this.hasActiveType()) {
			return;
		}

		// timeout regarding active state when scrolling
		this._timeoutIdStart = jQuery.sap.delayedCall(100, this, function() {
			this.setActive(true);
		});
	};

	// handle touchmove to prevent active state when scrolling
	ListItemBase.prototype.ontouchmove = function(oEvent) {

		if ((this._active || this._timeoutIdStart) &&
			(Math.abs(this._touchedY - oEvent.targetTouches[0].clientY) > 10 || Math.abs(this._touchedX - oEvent.targetTouches[0].clientX) > 10)) {

			// there is movement and therefore no tap...remove active styles
			clearTimeout(this._timeoutIdStart);
			this._timeoutIdStart = null;
			this._timeoutIdEnd = null;
			this.setActive(false);
		}
	};

	ListItemBase.prototype.ontouchend = function(oEvent) {

		// several fingers could be used
		if (oEvent.targetTouches.length == 0 && this.hasActiveType()) {
			this._timeoutIdEnd = jQuery.sap.delayedCall(100, this, function() {
				this.setActive(false);
			});
		}
	};

	// During native scrolling: Chrome sends touchcancel and no touchend thereafter
	ListItemBase.prototype.ontouchcancel = ListItemBase.prototype.ontouchend;

	// toggle active styles for navigation items
	ListItemBase.prototype._activeHandlingNav = function() {};

	// hook method for active handling...inheritors should overwrite this method
	ListItemBase.prototype._activeHandlingInheritor = function() {};

	// hook method for inactive handling...inheritors should overwrite this method
	ListItemBase.prototype._inactiveHandlingInheritor = function() {};

	// switch background style... toggle active feedback
	ListItemBase.prototype._activeHandling = function($This) {
		$This.toggleClass("sapMLIBActive", this._active);

		if (Device.system.desktop && this.isActionable()) {
			$This.toggleClass("sapMLIBHoverable", !this._active);
		}
	};

	/* Keyboard Handling */
	ListItemBase.prototype.onsapspace = function(oEvent) {

		// handle only the events that are coming from ListItemBase
		if (oEvent.srcControl !== this) {
			return;
		}

		// prevent default not to scroll down
		oEvent.preventDefault();

		// allow only for selectable items
		if (oEvent.isMarked() || !this.isSelectable()) {
			return;
		}

		// update selected property
		if (this.getMode() == ListMode.MultiSelect) {
			this.setSelected(!this.getSelected());
			this.informList("Select", this.getSelected());
		} else if (!this.getSelected()) {
			this.setSelected(true);
			this.informList("Select", true);
		}

		// event is handled
		oEvent.setMarked();
	};

	ListItemBase.prototype.onsapenter = function(oEvent) {
		var oList = this.getList();
		if (oEvent.isMarked() || !oList) {
			return;
		}

		// exit from edit mode
		if (oEvent.srcControl !== this && oList.getKeyboardMode() == ListKeyboardMode.Edit) {
			oList.setKeyboardMode(ListKeyboardMode.Navigation);
			this._switchFocus(oEvent);
			return;
		}

		// handle only item events
		if (oEvent.srcControl !== this) {
			return;
		}

		if (this.isIncludedIntoSelection()) {

			// support old bug and mimic space key handling and
			// do not fire item's press event when item is included into selection
			this.onsapspace(oEvent);

		} else if (this.hasActiveType()) {

			// active feedback
			oEvent.setMarked();
			this.setActive(true);

			jQuery.sap.delayedCall(180, this, function() {
				this.setActive(false);
			});

			// fire own press event
			jQuery.sap.delayedCall(0, this, function() {
				this.fireTap();
				this.firePress();
			});
		}

		// let the parent know item is pressed
		oList.onItemPress(this, oEvent.srcControl);
	};

	ListItemBase.prototype.onsapdelete = function(oEvent) {
		if (oEvent.isMarked() ||
			oEvent.srcControl !== this ||
			this.getMode() != ListMode.Delete) {
			return;
		}

		this.informList("Delete");
		oEvent.preventDefault();
		oEvent.setMarked();
	};

	ListItemBase.prototype._switchFocus = function(oEvent) {
		var oList = this.getList();
		if (!oList) {
			return;
		}

		var $Tabbables = this.getTabbables();
		if (oEvent.srcControl !== this) {
			oList._iLastFocusPosOfItem = $Tabbables.index(oEvent.target);
			this.focus();
		} else if ($Tabbables.length) {
			var iFocusPos = oList._iLastFocusPosOfItem || 0;
			iFocusPos = $Tabbables[iFocusPos] ? iFocusPos : -1;
			$Tabbables.eq(iFocusPos).focus();
		}

		oEvent.preventDefault();
		oEvent.setMarked();
	};

	ListItemBase.prototype.onkeydown = function(oEvent) {
		// check whether event is marked or not
		if (oEvent.isMarked()) {
			return;
		}

		// switch focus to row and focused item with F7
		if (oEvent.which == KeyCodes.F7) {
			this._switchFocus(oEvent);
			return;
		}

		// F2 fire detail event or switch keyboard mode
		if (oEvent.which == KeyCodes.F2) {
			if (oEvent.srcControl === this &&
				this.getType().indexOf("Detail") == 0 &&
				this.hasListeners("detailPress") ||
				this.hasListeners("detailTap")) {
				this.fireDetailTap();
				this.fireDetailPress();
				oEvent.preventDefault();
				oEvent.setMarked();
			} else {
				var oList = this.getList();
				if (oList) {
					this.$().prop("tabIndex", -1);
					oList.setKeyboardMode(oList.getKeyboardMode() == ListKeyboardMode.Edit ? ListKeyboardMode.Navigation : ListKeyboardMode.Edit);
					this._switchFocus(oEvent);
				}
			}
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
		var oList = this.getList();
		if (!oList || oEvent.isMarked() || oList.getKeyboardMode() == ListKeyboardMode.Edit) {
			return;
		}

		// if tab key is pressed while the last tabbable element of the list item
		// has been focused, we forward tab to the last pseudo element of the table
		var oLastTabbableDomRef = this.getTabbables().get(-1) || this.getDomRef();
		if (oEvent.target === oLastTabbableDomRef) {
			oList.forwardTab(true);
			oEvent.setMarked();
		}
	};

	// handle the SHIFT-TAB key
	ListItemBase.prototype.onsaptabprevious = function(oEvent) {
		var oList = this.getList();
		if (!oList || oEvent.isMarked() || oList.getKeyboardMode() == ListKeyboardMode.Edit) {
			return;
		}

		// if shift-tab is pressed while the list item has been focused,
		// we forward tab to the root element of the list
		if (oEvent.target === this.getDomRef()) {
			oList.forwardTab(false);
			oEvent.setMarked();
		}
	};

	// handle propagated focus to make the item row focusable
	ListItemBase.prototype.onfocusin = function(oEvent) {
		var oList = this.getList();
		if (!oList || oEvent.isMarked()) {
			return;
		}

		if (oEvent.srcControl === this) {
			oList.onItemFocusIn(this);
			return;
		}

		if (oList.getKeyboardMode() == ListKeyboardMode.Edit ||
			!jQuery(oEvent.target).is(":sapFocusable")) {
			return;
		}

		// inform the list async that this item should be focusable
		jQuery.sap.delayedCall(0, oList, "setItemFocusable", [this]);
		oEvent.setMarked();
	};

	// inform the list for the vertical navigation
	ListItemBase.prototype.onsapup = function(oEvent) {
		if (oEvent.isMarked() ||
			oEvent.srcControl === this ||
			this.getListProperty("keyboardMode") === ListKeyboardMode.Navigation) {
			return;
		}

		this.informList("ArrowUpDown", oEvent);
	};

	ListItemBase.prototype.oncontextmenu = function(oEvent) {
		// context menu is not required on the group header.
		if (this._bGroupHeader) {
			return;
		}

		// allow the context menu to open on the SingleSelect or MultiSelect control
		// is(":focusable") check is required as IE sets activeElement also to text controls
		if (jQuery(document.activeElement).is(":focusable") &&
			document.activeElement !== this.getDomRef() &&
			oEvent.srcControl !== this.getModeControl()) {
			return;
		}

		this.informList("ContextMenu", oEvent);
	};

	// inform the list for the vertical navigation
	ListItemBase.prototype.onsapdown = ListItemBase.prototype.onsapup;

	return ListItemBase;

});
