/*!
 * ${copyright}
 */

// Provides control sap.m.ListItemBase.
sap.ui.define([
	"sap/ui/base/DataType",
	"sap/ui/model/BindingMode",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/Icon",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/ShortcutHintsMixin",
	"./library",
	"./Button",
	"./CheckBox",
	"./RadioButton",
	"./ListItemBaseRenderer",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib",
	// jQuery custom selectors ":sapTabbable", ":sapFocusable"
	"sap/ui/dom/jquery/Selectors"
],
function(
	DataType,
	BindingMode,
	Device,
	Control,
	IconPool,
	Icon,
	InvisibleText,
	MessageType,
	ThemeParameters,
	ShortcutHintsMixin,
	library,
	Button,
	CheckBox,
	RadioButton,
	ListItemBaseRenderer,
	capitalize,
	jQuery,
	Library
) {
	"use strict";


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
	 */
	var ListItemBase = Control.extend("sap.m.ListItemBase", /** @lends sap.m.ListItemBase.prototype */ {
		metadata : {

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
				 *
				 * Valid values for the <code>highlight</code> property are values of the enumerations {@link sap.ui.core.MessageType} or
				 * {@link sap.ui.core.IndicationColor}.
				 *
				 * Accessibility support is provided through the associated {@link sap.m.ListItemBase#setHighlightText highlightText} property.
				 * If the <code>highlight</code> property is set to a value of {@link sap.ui.core.MessageType}, the <code>highlightText</code>
				 * property does not need to be set because a default text is used. However, the default text can be overridden by setting the
				 * <code>highlightText</code> property.
				 * In all other cases the <code>highlightText</code> property must be set.
				 *
				 * @since 1.44.0
				 */
				highlight : {type : "string", group : "Appearance", defaultValue : "None"},

				/**
				 * Defines the semantics of the {@link sap.m.ListItemBase#setHighlight highlight} property for accessibility purposes.
				 *
				 * @since 1.62
				 */
				highlightText : {type : "string", group : "Misc", defaultValue : ""},

				/**
				 * The navigated state of the list item.
				 *
				 * If set to <code>true</code>, a navigation indicator is displayed at the end of the list item.
				 * <b>Note:</b> This property must be set for <b>one</b> list item only.
				 *
				 * @since 1.72
				 */
				navigated : {type : "boolean", group : "Appearance", defaultValue : false}
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
			designtime: "sap/m/designtime/ListItemBase.designtime",
			dnd: true
		},

		renderer: ListItemBaseRenderer
	});

	ListItemBase.getAccessibilityText = function(oControl, bDetectEmpty, bHeaderAnnouncement) {
		var oBundle = Library.getResourceBundleFor("sap.m");

		if (!oControl || !oControl.getVisible || !oControl.getVisible()) {
			return bDetectEmpty ? oBundle.getText("CONTROL_EMPTY") : "";
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

		var sText = oAccInfo.type + " " + oAccInfo.description + " ",
			sTooltip = oControl.getTooltip_AsString();

		if (oAccInfo.required === true) {
			sText += oBundle.getText(bHeaderAnnouncement ? "CONTROL_IN_COLUMN_REQUIRED" : "ELEMENT_REQUIRED") + " ";
		}
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

		var aText = [],
			Node = window.Node,
			NodeFilter = window.NodeFilter,
			oTreeWalker = document.createTreeWalker(oDomRef, NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT);

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
	ListItemBase.prototype.NavigationIconURI = IconPool.getIconURI("slim-arrow-right");

	// defines the root tag name for rendering purposes
	ListItemBase.prototype.TagName = "li";

	// internal active state of the listitem
	ListItemBase.prototype.init = function() {
		this._active = false;
		this._bGroupHeader = false;
		this._bNeedsHighlight = false;
		this._bNeedsNavigated = false;
	};

	ListItemBase.prototype.onBeforeRendering = function() {
		this._oDomRef = this.getDomRef();
	};

	ListItemBase.prototype.onAfterRendering = function() {
		if (!this._oDomRef || this._oDomRef !== this.getDomRef()) {
			this.informList("DOMUpdate", true);
		}
		this._oDomRef = undefined;
		this._checkHighlight();
		this._checkNavigated();
	};

	ListItemBase.prototype.invalidate = function() {
		if (!this.bOutput) {
			return;
		}

		Control.prototype.invalidate.apply(this, arguments);
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
		if (oParent && oParent.isA("sap.m.ListBase")) {
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
			sProperty = capitalize(sProperty);
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
		return this.getListProperty("ariaRole") == "list" ? oBundle.getText("ACC_CTR_TYPE_LISTITEM") : "";
	};

	ListItemBase.prototype.getGroupAnnouncement = function() {
		return this.$().prevAll(".sapMGHLI:first").text();
	};

	ListItemBase.prototype.getAccessibilityDescription = function(oBundle) {
		var aOutput = [],
			sType = this.getType(),
			sHighlight = this.getHighlight(),
			bIsTree = this.getListProperty("ariaRole") === "tree";

		if (this.getSelected() && !bIsTree) {
			aOutput.push(oBundle.getText("LIST_ITEM_SELECTED"));
		}

		if (sHighlight !== MessageType.None) {
			var sHighlightText = this.getHighlightText();

			if (sHighlight in MessageType && !sHighlightText) {
				sHighlightText = oBundle.getText("LIST_ITEM_STATE_" + sHighlight.toUpperCase());
			}

			aOutput.push(sHighlightText);
		}

		if (this.getUnread() && this.getListProperty("showUnread")) {
			aOutput.push(oBundle.getText("LIST_ITEM_UNREAD"));
		}

		if (this.getCounter()) {
			aOutput.push(oBundle.getText("LIST_ITEM_COUNTER", [this.getCounter()]));
		}

		if (sType == ListItemType.Navigation) {
			aOutput.push(oBundle.getText("LIST_ITEM_NAVIGATION"));
		} else if (sType == ListItemType.Active || sType == ListItemType.DetailAndActive) {
				aOutput.push(oBundle.getText("LIST_ITEM_ACTIVE"));
			}

		var sGroupAnnouncement = this.getGroupAnnouncement() || "";
		if (sGroupAnnouncement) {
			aOutput.push(sGroupAnnouncement);
		}

		if (this.getContentAnnouncement) {
			var sContentAnnouncement = (this.getContentAnnouncement(oBundle) || "").trim();
			sContentAnnouncement && aOutput.push(sContentAnnouncement);
		}

		if (this.getListProperty("ariaRole") == "list" && !bIsTree && this.isSelectable() && !this.getSelected()) {
			aOutput.push(oBundle.getText("LIST_ITEM_NOT_SELECTED"));
		}

		//The dot is added  so the screenreader can pause
		return aOutput.join(" . ");
	};

	ListItemBase.prototype.getAccessibilityInfo = function() {
		var oBundle = Library.getResourceBundleFor("sap.m");
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

		if (!this.DeleteIconURI) {
			ListItemBase.prototype.DeleteIconURI = IconPool.getIconURI(
				ThemeParameters.get({name: "_sap_m_ListItemBase_DeleteIcon"}) || "decline"
			);
		}

		this._oDeleteControl = new Button({
			id: this.getId() + "-imgDel",
			icon: this.DeleteIconURI,
			type: ButtonType.Transparent,
			tooltip: Library.getResourceBundleFor("sap.m").getText("LIST_ITEM_DELETE")
		}).addStyleClass("sapMLIBIconDel sapMLIBSelectD").setParent(this, null, true).attachPress(function(oEvent) {
			this.informList("Delete");
		}, this);

		ShortcutHintsMixin.addConfig(
			this._oDeleteControl, {
				messageBundleKey: "LIST_ITEM_DELETE_SHORTCUT"
			},
		this._oDeleteControl);

		this._oDeleteControl.useEnabledPropagator(false);

		return this._oDeleteControl;
	};

	ListItemBase.prototype.onThemeChanged = function() {
		ListItemBase.prototype.DeleteIconURI = IconPool.getIconURI(
			ThemeParameters.get({name: "_sap_m_ListItemBase_DeleteIcon"})
		);
		if (this._oDeleteControl) {
			this._oDeleteControl.setIcon(this.DeleteIconURI);
		}
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
			tooltip: Library.getResourceBundleFor("sap.m").getText("LIST_ITEM_EDIT")
		}).addStyleClass("sapMLIBType sapMLIBIconDet").setParent(this, null, true).attachPress(function() {
			this.fireDetailPress();
		}, this);

		ShortcutHintsMixin.addConfig(
			this._oDetailControl, {
				messageBundleKey: Device.os.macintosh ? "LIST_ITEM_EDIT_SHORTCUT_MAC" : "LIST_ITEM_EDIT_SHORTCUT"
			},
		this._oDetailControl);

		this._oDetailControl.useEnabledPropagator(false);

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
			tooltip: Library.getResourceBundleFor("sap.m").getText("LIST_ITEM_NAVIGATION_ICON"),
			useIconTooltip: false,
			decorative: false,
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
			selected: this.getSelected(),
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "LIST_ITEM_SELECTION")
		}).addStyleClass("sapMLIBSelectS").setParent(this, null, true).attachSelect(function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.setSelected(bSelected);
			this.informList("Select", bSelected);
		}, this);

		// prevent disabling of internal controls by the sap.ui.core.EnabledPropagator
		this._oSingleSelectControl.useEnabledPropagator(false);

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
			selected: this.getSelected(),
			ariaLabelledBy: InvisibleText.getStaticId("sap.m", "LIST_ITEM_SELECTION")
		}).addStyleClass("sapMLIBSelectM").setParent(this, null, true).addEventDelegate({
			onkeydown: function (oEvent) {
				this.informList("KeyDown", oEvent);
			},
			onkeyup: function (oEvent) {
				this.informList("KeyUp", oEvent);
			}
		}, this).attachSelect(function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.setSelected(bSelected);
			this.informList("Select", bSelected);
		}, this);

		// prevent disabling of internal controls by the sap.ui.core.EnabledPropagator
		this._oMultiSelectControl.useEnabledPropagator(false);

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
	 * @param {string[]} aControls array of control names
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
	ListItemBase.prototype.isActionable = function(bCheckDevice) {
		if (bCheckDevice && !Device.system.desktop) {
			return false;
		}

		return this.isIncludedIntoSelection() || (
			this.getType() != ListItemType.Inactive &&
			this.getType() != ListItemType.Detail
		);
	};

	ListItemBase.prototype.exit = function() {
		this._oDomRef = null;
		this._oLastFocused = null;
		this._checkHighlight(false);
		this._checkNavigated(false);
		this.setActive(false);
		this.destroyControls([
			"Delete",
			"SingleSelect",
			"MultiSelect",
			"Detail",
			"Navigation"
		]);
	};

	ListItemBase.prototype.setHighlight = function(sValue) {
		if (sValue == null) {
			sValue = MessageType.None;
		} else if (!DataType.getType("sap.ui.core.MessageType").isValid(sValue) && !DataType.getType("sap.ui.core.IndicationColor").isValid(sValue)) {
			throw new Error('"' + sValue + '" is not a value of the enums sap.ui.core.MessageType or sap.ui.core.IndicationColor for property "highlight" of ' + this);
		}

		return this.setProperty("highlight", sValue);
	};

	/**
	 * Determines whether item is selectable or not.
	 * By default, when item should be in selectable mode
	 *
	 * Subclasses can overwrite in case of unselectable item.
	 * @returns {boolean}
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

		// let the list know the selected property is changed
		this.informList("AfterSelectedChange", bSelected);

		return this;
	};

	// Updates the selected state of the DOM
	ListItemBase.prototype.updateSelectedDOM = function(bSelected, $This) {
		$This.toggleClass("sapMLIBSelected", bSelected);

		if ($This.attr("role") !== "listitem") {
			$This.attr("aria-selected", bSelected);
		}
	};

	ListItemBase.prototype.setParent = function(oParent) {
		if (!oParent) {
			this.informList("Removed");
		}

		Control.prototype.setParent.apply(this, arguments);
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
	 * @return {boolean}
	 */
	ListItemBase.prototype.isGroupHeader = function() {
		return this._bGroupHeader;
	};

	/**
	 * This gets called from the ListBase for the GroupHeader items to inform the connected sub items
	 *
	 * @param {sap.m.ListItemBase} oLI The list item
	 */
	ListItemBase.prototype.setGroupedItem = function(oLI) {
		this._aGroupedItems = this._aGroupedItems || [];
		this._aGroupedItems.push(oLI.getId());
	};

	ListItemBase.prototype.getGroupedItems = function() {
		return this._aGroupedItems;
	};

	/**
	 * Determines whether item is in SingleSelectMaster mode or
	 * other selection modes when includeItemInSelection is true
	 *
	 * @return {boolean}
	 */
	ListItemBase.prototype.isIncludedIntoSelection = function() {
		if (!this.isSelectable()) {
			return false;
		}

		var sMode = this.getMode();
		return sMode == ListMode.SingleSelectMaster || (
			this.getListProperty("includeItemInSelection") && (
				sMode == ListMode.SingleSelectLeft ||
				sMode == ListMode.SingleSelect ||
				sMode == ListMode.MultiSelect
			)
		);
	};

	// informs the list when item's highlight is changed
	ListItemBase.prototype._checkHighlight = function(bNeedsHighlight) {
		if (bNeedsHighlight == undefined) {
			bNeedsHighlight = (this.getVisible() && this.getHighlight() != MessageType.None);
		}

		if (this._bNeedsHighlight != bNeedsHighlight) {
			this._bNeedsHighlight = bNeedsHighlight;
			this.informList("HighlightChange", bNeedsHighlight);
		}
	};

	ListItemBase.prototype._checkNavigated = function(bNeedsNavigated) {
		if (bNeedsNavigated == undefined) {
			bNeedsNavigated = (this.getVisible() && this.getNavigated());
		}

		if (this._bNeedsNavigated != bNeedsNavigated) {
			this._bNeedsNavigated = bNeedsNavigated;
			this.informList("NavigatedChange", bNeedsNavigated);
		}
	};

	/**
	 * Determines whether item needs icon to render type or not
	 *
	 * @return {boolean}
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

	/**
	 * Detect text selection.
	 *
	 * @param {HTMLElement} oDomRef DOM element of the control
	 * @returns {boolean} true if text selection is done within the control else false
	 * @private
	 */
	ListItemBase.detectTextSelection = function(oDomRef) {
		var oSelection = window.getSelection(),
			sTextSelection = oSelection.toString().replace("\n", "");

		return sTextSelection && (oDomRef !== oSelection.focusNode && oDomRef.contains(oSelection.focusNode));
	};

	ListItemBase.prototype.ontap = function(oEvent) {

		// do not handle already handled events
		if (this._eventHandledByControl) {
			return oEvent.setMarked();
		}

		// do not handle in case of text selection within the list item
		if (ListItemBase.detectTextSelection(this.getDomRef())) {
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

			// make sure that the list item is focused
			if (document.activeElement != this.getFocusDomRef()) {
				this.focus();
			}

			setTimeout(function() {
				this.setActive(false);
			}.bind(this), 180);

			setTimeout(function() {
				this.firePress();
			}.bind(this), 0);
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
			if (this.getListProperty("includeItemInSelection") && this.getList()._mRangeSelection) {
				// prevet text selection when rangeSelection is detected
				oEvent.preventDefault();
			}
			return;
		}

		// timeout regarding active state when scrolling
		this._timeoutIdStart = setTimeout(function() {
			this.setActive(true);
		}.bind(this), 100);
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
		if (this.hasActiveType()) {
			this._timeoutIdEnd = setTimeout(function() {
				this.setActive(false);
			}.bind(this), 100);
		}
	};

	// During native scrolling: Chrome sends touchcancel and no touchend thereafter
	ListItemBase.prototype.ontouchcancel = ListItemBase.prototype.ontouchend;

	// active handling should be removed when dragging an item is over
	ListItemBase.prototype.ondragend = ListItemBase.prototype.ontouchend;

	// toggle active styles for navigation items
	ListItemBase.prototype._activeHandlingNav = function() {};

	// hook method for active handling...inheritors should overwrite this method
	ListItemBase.prototype._activeHandlingInheritor = function() {};

	// hook method for inactive handling...inheritors should overwrite this method
	ListItemBase.prototype._inactiveHandlingInheritor = function() {};

	// switch background style... toggle active feedback
	ListItemBase.prototype._activeHandling = function($This) {
		$This.toggleClass("sapMLIBActive", this._active);

		if (this.isActionable(true)) {
			$This.toggleClass("sapMLIBHoverable", !this._active);
		}
	};

	/* Keyboard Handling */
	ListItemBase.prototype.onsapspace = function(oEvent) {

		// handle only the events that are coming from ListItemBase
		if (oEvent.srcControl !== this || oEvent.target !== this.getDomRef()) {
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

		// handle only item events
		if (oEvent.srcControl !== this || oEvent.target !== this.getDomRef()) {
			return;
		}

		if (this.isIncludedIntoSelection()) {

			// support old bug and mimic space key handling and
			// do not fire item's press event when item is included into selection
			oEvent.type = "sapspace";
			this.onsapspace(oEvent);

		} else if (this.hasActiveType()) {

			// active feedback
			oEvent.setMarked();
			this.setActive(true);

			setTimeout(function() {
				this.setActive(false);
			}.bind(this), 180);

			// fire own press event
			setTimeout(function() {
				this.firePress();
			}.bind(this), 0);
		}

		// let the parent know item is pressed
		oList.onItemPress(this, oEvent.srcControl);
	};

	ListItemBase.prototype.onsapdelete = function(oEvent) {
		if (oEvent.isMarked() ||
			oEvent.srcControl !== this ||
			this.getMode() != ListMode.Delete ||
			oEvent.target !== this.getDomRef()) {
			return;
		}

		this.informList("Delete");
		oEvent.preventDefault();
		oEvent.setMarked();
	};

	ListItemBase.prototype.onkeydown = function(oEvent) {
		// check whether event is marked or not
		if (oEvent.isMarked()) {
			return;
		}

		// Ctrl+E fires detail event or handle editing
		if (this.getType().startsWith("Detail") && oEvent.code == "KeyE" && (oEvent.metaKey || oEvent.ctrlKey)) {
			if (oEvent.target === this.getDomRef() && (this.hasListeners("detailPress") || this.hasListeners("detailTap"))) {
				this.fireDetailPress();
				oEvent.preventDefault();
				oEvent.setMarked();
			}
		}

		if (oEvent.srcControl !== this || oEvent.target !== this.getDomRef()) {
			return;
		}

		this.informList("KeyDown", oEvent);
	};

	ListItemBase.prototype.onkeyup = function(oEvent) {
		if (oEvent.isMarked() || oEvent.srcControl !== this || oEvent.target !== this.getDomRef()) {
			return;
		}

		this.informList("KeyUp", oEvent);
	};

	ListItemBase.prototype.onsapupmodifiers = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		this.informList("UpDownModifiers", oEvent, -1);
	};

	ListItemBase.prototype.onsapdownmodifiers = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		this.informList("UpDownModifiers", oEvent, 1);
	};

	/**
	 * Returns the tabbable DOM elements as a jQuery collection
	 *
	 * @param [bContentOnly] Whether only tabbables of the content area
	 * @returns {jQuery} jQuery object
	 * @protected
	 * @since 1.26
	 */
	ListItemBase.prototype.getTabbables = function(bContentOnly) {
		return this.$(bContentOnly ? "content" : "").find(":sapTabbable");
	};

	// handle propagated focus to make the item row focusable
	ListItemBase.prototype.onfocusin = function(oEvent) {
		const oList = this.getList();
		if (!oList || oEvent.isMarked()) {
			return;
		}

		this.informList("FocusIn", oEvent.srcControl, oEvent);
		oEvent.setMarked();
	};

	ListItemBase.prototype.onfocusout = function(oEvent) {
		if (oEvent.isMarked() || oEvent.srcControl !== this) {
			return;
		}

		this.informList("FocusOut", oEvent.srcControl);
		oEvent.setMarked();
	};

	// inform the list for the vertical navigation
	ListItemBase.prototype.onsapup = ListItemBase.prototype.onsapdown = function(oEvent) {
		if (oEvent.isMarked() ||
			oEvent.srcControl === this ||
			oEvent.target instanceof HTMLInputElement ||
			oEvent.target instanceof HTMLTextAreaElement ||
			oEvent.target.classList.contains("sapMTblCellFocusable")) {
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
		if (oEvent.srcControl == this.getModeControl() ||
			document.activeElement.matches(".sapMLIB,.sapMListTblCell,.sapMListTblSubRow,.sapMListTblSubCnt")) {
			this.informList("ContextMenu", oEvent);
		}
	};

	return ListItemBase;
});
