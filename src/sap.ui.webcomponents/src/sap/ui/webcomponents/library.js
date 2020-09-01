/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.webcomponents.
 */
sap.ui.define([], // library dependency
	function() {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.webcomponents",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		noLibraryCSS: true,
		designtime: "sap/ui/webcomponents/designtime/library.designtime",
		interfaces: [

		],
		types: [
			"sap.ui.webcomponents.BusyIndicatorSize",
			"sap.ui.webcomponents.ButtonDesign",
			"sap.ui.webcomponents.InputType",
			"sap.ui.webcomponents.ListItemType",
			"sap.ui.webcomponents.ListMode",
			"sap.ui.webcomponents.ListSeparators",
			"sap.ui.webcomponents.PopoverPlacementType",
			"sap.ui.webcomponents.PopoverHorizontalAlign",
			"sap.ui.webcomponents.PopoverVerticalAlign"
		],
		controls: [
			"sap.ui.webcomponents.BusyIndicator",
			"sap.ui.webcomponents.Button",
			"sap.ui.webcomponents.CustomListItem",
			"sap.ui.webcomponents.DatePicker",
			"sap.ui.webcomponents.Dialog",
			"sap.ui.webcomponents.GroupHeaderListItem",
			"sap.ui.webcomponents.Icon",
			"sap.ui.webcomponents.Input",
			"sap.ui.webcomponents.List",
			"sap.ui.webcomponents.Option",
			"sap.ui.webcomponents.ProductSwitch",
			"sap.ui.webcomponents.ProductSwitchItem",
			"sap.ui.webcomponents.Select",
			"sap.ui.webcomponents.StandardListItem",
			"sap.ui.webcomponents.SuggestionItem",
			"sap.ui.webcomponents.Switch",
			"sap.ui.webcomponents.Table",
			"sap.ui.webcomponents.TableColumn",
			"sap.ui.webcomponents.TableRow",
			"sap.ui.webcomponents.TableCell",
			"sap.ui.webcomponents.Title",
			"sap.ui.webcomponents.Tree",
			"sap.ui.webcomponents.TreeItem"
		],
		elements: [
		],
		extensions: {
		}
	});

	/**
	 * SAPUI5 library with webcomponent-based controls
	 *
	 * @namespace
	 * @alias sap.ui.webcomponents
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.ui.webcomponents;

	thisLib.BusyIndicatorSize = {
		/**
		 * small size
		 * @public
		 * @type {Small}
		 */
		Small: "Small",

		/**
		 * medium size
		 * @public
		 * @type {Medium}
		 */
		Medium: "Medium",

		/**
		 * large size
		 * @public
		 * @type {Large}
		 */
		Large: "Large"
	};

	thisLib.ButtonDesign = {
		/**
		 * default type (no special styling)
		 * @public
		 * @type {Default}
		 */
		Default: "Default",

		/**
		 * accept type (green button)
		 * @public
		 * @type {Positive}
		 */
		Positive: "Positive",

		/**
		 * reject style (red button)
		 * @public
		 * @type {Negative}
		 */
		Negative: "Negative",

		/**
		 * transparent type
		 * @public
		 * @type {Transparent}
		 */
		Transparent: "Transparent",

		/**
		 * emphasized type
		 * @public
		 * @type {Emphasized}
		 */
		Emphasized: "Emphasized",
	};

	thisLib.InputType = {
		/**
		 * <ui5-input type="text"></ui5-input> defines a one-line text input field:
		 * @public
		 * @type {Text}
		 */
		Text: "Text",

		/**
		 * The <ui5-input type="email"></ui5-input> is used for input fields that must contain an e-mail address.
		 * @public
		 * @type {Email}
		 */
		Email: "Email",

		/**
		 * The <ui5-input type="number"></ui5-input> defines a numeric input field.
		 * @public
		 * @type {Number}
		 */
		Number: "Number",

		/**
		 * <ui5-input type="password"></ui5-input> defines a password field.
		 * @public
		 * @type {Password}
		 */
		Password: "Password",

		/**
		 * The <ui5-input type="url"></ui5-input> is used for input fields that should contain a telephone number.
		 * @public
		 * @type {Tel}
		 */
		Tel: "Tel",

		/**
		 * The <i5-input type="url"></ui5-input> is used for input fields that should contain a URL address.
		 * @public
		 * @type {URL}
		 */
		URL: "URL"
	};

	thisLib.ListItemType = {
		/**
		 * Indicates the list item does not have any active feedback when item is pressed.
		 * @public
		 * @type {Inactive}
		 */
		Inactive: "Inactive",

		/**
		 * Indicates that the item is clickable via active feedback when item is pressed.
		 * @public
		 * @type {Active}
		 */
		Active: "Active",

		/**
		 * Enables detail button of the list item that fires detail-click event.
		 * @public
		 * @type {Detail}
		 */
		Detail: "Detail"
	};

	thisLib.ListMode = {

		/**
		 * Default mode (no selection).
		 * @public
		 * @type {None}
		 */
		None: "None",

		/**
		 * Right-positioned single selection mode (only one list item can be selected).
		 * @public
		 * @type {SingleSelect}
		 */
		SingleSelect: "SingleSelect",

		/**
		 * Left-positioned single selection mode (only one list item can be selected).
		 * @public
		 * @type {SingleSelectBegin}
		 */
		SingleSelectBegin: "SingleSelectBegin",

		/**
		 * Selected item is highlighted but no selection element is visible
		 * (only one list item can be selected).
		 * @public
		 * @type {SingleSelectEnd}
		 */
		SingleSelectEnd: "SingleSelectEnd",

		/**
		 * Selected item is highlighted and selection is changed upon arrow navigation
		 * (only one list item can be selected - this is always the focused item).
		 * @public
		 * @type {SingleSelectAuto}
		 */
		SingleSelectAuto: "SingleSelectAuto",

		/**
		 * Multi selection mode (more than one list item can be selected).
		 * @public
		 * @type {MultiSelect}
		 */
		MultiSelect: "MultiSelect",

		/**
		 * Delete mode (only one list item can be deleted via provided delete button)
		 * @public
		 * @type {Delete}
		 */
		Delete: "Delete",
	};

	thisLib.ListSeparators = {
		/**
		 * Separators between the items including the last and the first one.
		 * @public
		 * @type {All}
		 */
		All: "All",
		/**
		 * Separators between the items.
		 * <b>Note:</b> This enumeration depends on the theme.
		 * @public
		 * @type {Inner}
		 */
		Inner: "Inner",
		/**
		 * No item separators.
		 * @public
		 * @type {None}
		 */
		None: "None",
	};

	thisLib.PopoverPlacementType = {
		/**
		 * Popover will be placed at the left side of the reference element.
		 * @public
		 * @type {Left}
		 */
		Left: "Left",

		/**
		 * Popover will be placed at the right side of the reference element.
		 * @public
		 * @type {Right}
		 */
		Right: "Right",

		/**
		 * Popover will be placed at the top of the reference element.
		 * @public
		 * @type {Bottom}
		 */
		Top: "Top",

		/**
		 * Popover will be placed at the bottom of the reference element.
		 * @public
		 * @type {Bottom}
		 */
		Bottom: "Bottom",
	};

	thisLib.PopoverHorizontalAlign = {
		/**
		 * Popover is centered
		 * @public
		 * @type {Center}
		 */
		Center: "Center",

		/**
		 * Popover opens on the left side of the target
		 * @public
		 * @type {Left}
		 */
		Left: "Left",

		/**
		 * Popover opens on the right side of the target
		 * @public
		 * @type {Right}
		 */
		Right: "Right",

		/**
		 * Popover is stretched
		 * @public
		 * @type {Stretch}
		 */
		Stretch: "Stretch",
	};

	thisLib.PopoverVerticalAlign = {
		/**
		 *
		 * @public
		 * @type {Center}
		 */
		Center: "Center",

		/**
		 * Popover will be placed at the top of the reference control.
		 * @public
		 * @type {Top}
		 */
		Top: "Top",

		/**
		 * Popover will be placed at the bottom of the reference control.
		 * @public
		 * @type {Bottom}
		 */
		Bottom: "Bottom",

		/**
		 * Popover will be streched
		 * @public
		 * @type {Stretch}
		 */
		Stretch: "Stretch",
	};

	return thisLib;

});
