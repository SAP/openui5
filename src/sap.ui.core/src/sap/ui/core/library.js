/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.core.
 */
sap.ui.define([
	'sap/ui/base/DataType',
	'sap/ui/core/Lib',
	'sap/ui/core/message/MessageType',
	'sap/ui/core/mvc/ViewType', // provides sap.ui.core.mvc.ViewType
	'./CalendarType' // provides sap.ui.core.CalendarType
],
	function(DataType, Library, MessageType, ViewType, CalendarType) {
	 "use strict";

	 /**
	  * The SAPUI5 Core Runtime.
	  *
	  * Contains the UI5 Core and all its components, base classes for Controls,
	  * Components and the Model View Controller classes.
	  *
	  * @namespace
	  * @alias sap.ui.core
	  * @author SAP SE
	  * @version ${version}
	  * @since 0.8
	  * @public
	  */
	 var thisLib = Library.init({
		 name: "sap.ui.core",
		 version: "${version}",
		 designtime: "sap/ui/core/designtime/library.designtime",
		 apiVersion: 2,
		 types: [

			 // builtin types
			 "any",
			 "boolean",
			 "float",
			 "int",
			 "object",
			 "string",
			 "void",

			 // simple types and enums
			 "sap.ui.core.AbsoluteCSSSize",
			 "sap.ui.core.AccessibleRole",
			 "sap.ui.core.AccessibleLandmarkRole",
			 "sap.ui.core.aria.HasPopup",
			 "sap.ui.core.BarColor",
			 "sap.ui.core.BusyIndicatorSize",
			 "sap.ui.core.CalendarType",
			 "sap.ui.core.CSSColor",
			 "sap.ui.core.CSSSize",
			 "sap.ui.core.CSSSizeShortHand",
			 "sap.ui.core.Collision",
			 "sap.ui.core.ComponentLifecycle",
			 "sap.ui.core.Design",
			 "sap.ui.core.Dock",
			 "sap.ui.core.HorizontalAlign",
			 "sap.ui.core.ID",
			 "sap.ui.core.IconColor",
			 "sap.ui.core.ImeMode",
			 "sap.ui.core.IndicationColor",
			 "sap.ui.core.ItemSelectionMode",
			 "sap.ui.core.MessageType",
			 "sap.ui.core.OpenState",
			 "sap.ui.core.Orientation",
			 "sap.ui.core.Percentage",
			 "sap.ui.core.Priority",
			 "sap.ui.core.ScrollBarAction",
			 "sap.ui.core.Scrolling",
			 "sap.ui.core.SortOrder",
			 "sap.ui.core.TextAlign",
			 "sap.ui.core.TextDirection",
			 "sap.ui.core.TitleLevel",
			 "sap.ui.core.URI",
			 "sap.ui.core.ValueState",
			 "sap.ui.core.VerticalAlign",
			 "sap.ui.core.Wrapping",
			 "sap.ui.core.InvisibleMessageMode",
			 "sap.ui.core.dnd.DropEffect",
			 "sap.ui.core.dnd.DropLayout",
			 "sap.ui.core.dnd.DropPosition",
			 "sap.ui.core.mvc.ViewType",
			 "sap.ui.core.routing.HistoryDirection"
		 ],
		 interfaces: [
			 "sap.ui.core.IShrinkable",
			 "sap.ui.core.Label",
			 "sap.ui.core.ILabelable",
			 "sap.ui.core.PopupInterface",
			 "sap.ui.core.Toolbar",
			 "sap.ui.core.IContextMenu",
			 "sap.ui.core.IFormContent",
			 "sap.ui.core.dnd.IDragInfo",
			 "sap.ui.core.dnd.IDropInfo",
			 "sap.ui.core.IDScope",
			 "sap.ui.core.ITitleContent",
			 "sap.ui.core.IAsyncContentCreation",
			 "sap.ui.core.IPlaceholderSupport",
			 "sap.ui.core.IColumnHeaderMenu"
		 ],
		 controls: [
		  "sap.ui.core.ComponentContainer",
		  "sap.ui.core.Control",
		  "sap.ui.core.HTML",
		  "sap.ui.core.Icon",
		  "sap.ui.core.InvisibleText",
		  "sap.ui.core.TooltipBase",
		  "sap.ui.core.mvc.View",
		  "sap.ui.core.mvc.XMLView"
		 ],
		 elements: [
		  "sap.ui.core.CustomData",
		  "sap.ui.core.Element",
		  "sap.ui.core.Item",
		  "sap.ui.core.LayoutData",
		  "sap.ui.core.ListItem",
		  "sap.ui.core.SeparatorItem",
		  "sap.ui.core.Title",
		  "sap.ui.core.VariantLayoutData",
		  "sap.ui.core.dnd.DragDropBase",
		  "sap.ui.core.dnd.DragInfo",
		  "sap.ui.core.dnd.DropInfo",
		  "sap.ui.core.dnd.DragDropInfo",
		  "sap.ui.core.InvisibleMessage"
		 ],
		 extensions: {
			 "sap.ui.support" : {
				 diagnosticPlugins: [
				  "sap/ui/core/support/plugins/TechInfo",
				  "sap/ui/core/support/plugins/ControlTree",
				  "sap/ui/core/support/plugins/Debugging",
				  "sap/ui/core/support/plugins/Trace",
				  "sap/ui/core/support/plugins/Selector",
				  "sap/ui/core/support/plugins/Breakpoint",
				  "sap/ui/core/support/plugins/LocalStorage",
				  "sap/ui/core/support/plugins/Interaction",
				  "sap/ui/core/support/plugins/Performance"
				 ],
				 //Configuration used for rule loading of Support Assistant
				 publicRules:true,
				 internalRules:true
			 }
		 }
	 });

	 /**
	  * @classdesc A string type that represents non-relative CSS size values.
	  *
	  * This is a subtype of the <code>'&lt;length&gt; type'</code> defined in the CSS specifications.
	  * Allowed values are only absolute CSS sizes like &quot;1px&quot; or &quot;2em&quot;. Percentage
	  * sizes like &quot;50%&quot; and the special values &quot;auto&quot; and &quot;inherit&quot; are
	  * NOT allowed. Mathematical expressions using the CSS3 <code>calc(<i>expression</i>)</code> operator
	  * are allowed as long as they do not use percentage sizes.
	  *
	  * Note that CSS might not allow all these values for every CSS property representing a size.
	  * So even if a value is accepted by <code>sap.ui.core.AbsoluteCSSSize</code>, it still might have no effect
	  * in a specific context. In other words: UI5 controls usually don't extend the range of allowed
	  * values in CSS.
	  *
	  *
	  * <b>Units</b>
	  *
	  * Valid font-relative units are <code>em, ex</code> and <code>rem</code>. Supported absolute units
	  * are <code>cm, mm, in, pc, pt</code> and <code>px</code>. Other units are not supported.
	  *
	  *
	  * <b>Mathematical Expressions</b>
	  *
	  * Expressions inside the <code>calc()</code> operator are only roughly checked for validity.
	  * Not every value that this type accepts is a valid expression in the sense of the CSS spec.
	  * But vice versa, any expression that is valid according to the spec should be accepted by this type.
	  * The current implementation is based on the
	  * {@link http://dev.w3.org/csswg/css-values-3/#calc-syntax CSS3 Draft specification from 22 April 2015}.
	  *
	  * Noteworthy details:
	  * <ul>
	  * <li>whitespace is mandatory around a '-' or '+' operator and optional otherwise</li>
	  * <li>parentheses are accepted but not checked for being balanced (a restriction of regexp based checks)</li>
	  * <li>semantic constraints like type restrictions are not checked</li>
	  * </ul>
	  *
	  * Future versions of UI5 might check <code>calc()</code> expressions in more detail, so applications should
	  * not assume that a value, that is invalid according to the CSS spec but currently accepted by this type
	  * still will be accepted by future versions of this type.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.AbsoluteCSSSize = DataType.createType('sap.ui.core.AbsoluteCSSSize', {
			 isValid : function(vValue) {
				 // Note: the following regexp by intention is a single regexp literal.
				 // It could be made much more readable by constructing it out of (reused) sub-expressions (strings)
				 // but this would not be parseable by the metamodel recovery tooling that is used inside SAP
				 return /^([-+]?(0*|([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]))|calc\(\s*(\(\s*)*[-+]?(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC])?)(\s*(\)\s*)*(\s[-+]\s|[*\/])\s*(\(\s*)*([-+]?(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC])?)))*\s*(\)\s*)*\))$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );

	 /**
	  * Defines the accessible roles for ARIA support. This enumeration is used with the AccessibleRole control property.
	  * For more information, goto "Roles for Accessible Rich Internet Applications (WAI-ARIA Roles)" at the www.w3.org homepage.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.AccessibleRole = {

		 /**
		  * A message with an alert or error information.
		  *
		  * @public
		  */
		 Alert : "Alert",

		 /**
		  * A separate window with an alert or error information.
		  *
		  * @public
		  */
		 AlertDialog : "AlertDialog",

		 /**
		  * A software unit executing a set of tasks for the user.
		  * @public
		  */
		 Application : "Application",

		 /**
		  * Usually defined as the advertisement at the top of a web page.
		  * The banner content typically contains the site or company logo, or other key advertisements.
		  *
		  * @public
		  */
		 Banner : "Banner",

		 /**
		  * Allows user-triggered actions.
		  *
		  * @public
		  */
		 Button : "Button",

		 /**
		  * A control that has three possible values: true, false, mixed.
		  * @public
		  */
		 Checkbox : "Checkbox",

		 /**
		  * A table cell containing header information for a column.
		  * @public
		  */
		 ColumnHeader : "ColumnHeader",

		 /**
		  * Allows selecting an item from a list, or to enter data directly in the input field.
		  * @public
		  */
		 Combobox : "Combobox",

		 /**
		  * Information about the content on the page. Examples are footnotes, copyrights, or links to privacy statements.
		  *
		  * @public
		  */
		 ContentInfo : "ContentInfo",

		 /**
		  * The content of the associated element represents a definition.
		  * If there is a definition element within the content, this one represents the term being defined.
		  *
		  * @public
		  */
		 Definition : "Definition",

		 /**
		  * Descriptive content for a page element.
		  * @public
		  */
		 Description : "Description",

		 /**
		  * A small window that is designed to interrupt the current application processing
		  * in order to inform the user and to get some response.
		  * @public
		  */
		 Dialog : "Dialog",

		 /**
		  * A list of references to members of a single group.
		  *
		  * @public
		  */
		 Directory : "Directory",

		 /**
		  * Content that contains related information, such as a book.
		  * @public
		  */
		 Document : "Document",

		 /**
		  * Contains cells of tabular data arranged in rows and columns, for example in a table.
		  * @public
		  */
		 Grid : "Grid",

		 /**
		  * A table cell in a grid where the cells can be active, editable, and selectable.
		  * Cells may have functional relationships to controls, for example.
		  * @public
		  */
		 GridCell : "GridCell",

		 /**
		  * A section of user interface objects.
		  * @public
		  */
		 Group : "Group",

		 /**
		  * A heading for a section of the page.
		  * @public
		  */
		 Heading : "Heading",

		 /**
		  * A container for a collection of elements that form an image.
		  * @public
		  */
		 Img : "Img",

		 /**
		  * An interactive reference to a resource.
		  * @public
		  */
		 Link : "Link",

		 /**
		  * A container for non-interactive list items which are the children of the list.
		  * @public
		  */
		 List : "List",

		 /**
		  * A widget that allows the user to select one or more items from a list.
		  * The items within the list are static and can contain images.
		  * @public
		  */
		 Listbox : "Listbox",

		 /**
		  * A single item in a list.
		  * @public
		  */
		 ListItem : "ListItem",

		 /**
		  * An area where new information is added, or old information disappears.
		  * Information types are chat logs, messaging, or error logs, for example.
		  * The log contains a sequence: New information is always added to the end of the log.
		  * @public
		  */
		 Log : "Log",

		 /**
		  * Defines the main content of a document.
		  *
		  * @public
		  */
		 Main : "Main",

		 /**
		  * Is used to scroll text across the page.
		  *
		  * @public
		  */
		 Marquee : "Marquee",

		 /**
		  * Offers a list of choices to the user.
		  *
		  * @public
		  */
		 Menu : "Menu",

		 /**
		  * A container for menu items where each item may activate a submenu.
		  *
		  * @public
		  */
		 Menubar : "Menubar",

		 /**
		  * A child in a menu.
		  * @public
		  */
		 MenuItem : "MenuItem",

		 /**
		  * A checkable menu item (tri-state).
		  * @public
		  */
		 MenuItemCheckbox : "MenuItemCheckbox",

		 /**
		  * A menu item which is part of a group of menuitemradio roles.
		  * @public
		  */
		 MenuItemRadio : "MenuItemRadio",

		 /**
		  * A collection of links suitable for use when navigating the document or related documents.
		  * @public
		  */
		 Navigation : "Navigation",

		 /**
		  * The content is parenthetic or ancillary to the main content of the resource.
		  * @public
		  */
		 Note : "Note",

		 /**
		  * A selectable item in a list represented by a select.
		  *
		  * @public
		  */
		 Option : "Option",

		 /**
		  * An element whose role is presentational does not need to be mapped to the accessibility API.
		  * @public
		  */
		 Presentation : "Presentation",

		 /**
		  * Shows the execution progress in applications providing functions that take a long time.
		  * @public
		  */
		 ProgressBar : "ProgressBar",

		 /**
		  * An option in single-select list. Only one radio control in a radiogroup can be selected at the same time.
		  *
		  * @public
		  */
		 Radio : "Radio",

		 /**
		  * A group of radio controls.
		  * @public
		  */
		 RadioGroup : "RadioGroup",

		 /**
		  * A large section on the web page.
		  * @public
		  */
		 Region : "Region",

		 /**
		  * A row of table cells.
		  * @public
		  */
		 Row : "Row",

		 /**
		  * A table cell containing header information for a row.
		  * @public
		  */
		 RowHeader : "RowHeader",

		 /**
		  * A search section of a web document. In many cases, this is a form used to submit search requests about the site,
		  * or a more general Internet wide search service.
		  * @public
		  */
		 Search : "Search",

		 /**
		  * A unique section of the document. In the case of a portal, this may include time display, weather forecast,
		  * or stock price.
		  * @public
		  */
		 Secondary : "Secondary",

		 /**
		  * Indicates that the element contains content that is related to the main content of the page.
		  * @public
		  */
		 SeeAlso : "SeeAlso",

		 /**
		  * A line or bar that separates sections of content.
		  * @public
		  */
		 Separator : "Separator",

		 /**
		  * A user input where the user selects an input in a given range. This form of range expects an analogous keyboard
		  * interface.
		  * @public
		  */
		 Slider : "Slider",

		 /**
		  * Allows users to select a value from a list of given entries where exactly one value is displayed at runtime, and
		  * the other ones can be displayed by scrolling using the arrow up and arrow down key.
		  *
		  * @public
		  */
		 SpinButton : "SpinButton",

		 /**
		  * A container for processing advisory information.
		  * @public
		  */
		 Status : "Status",

		 /**
		  * A header for a tab panel.
		  * @public
		  */
		 Tab : "Tab",

		 /**
		  * A list of tabs which are references to tab panels.
		  *
		  * @public
		  */
		 Tablist : "Tablist",

		 /**
		  * A container for the resources associated with a tab.
		  * @public
		  */
		 Tabpanel : "Tabpanel",

		 /**
		  * Inputs that allow free-form text as their value.
		  * @public
		  */
		 Textbox : "Textbox",

		 /**
		  * A numerical counter which indicates an amount of elapsed time from a start point,
		  * or of the time remaining until a certain end point.
		  * @public
		  */
		 Timer : "Timer",

		 /**
		  * A collection of commonly used functions represented in compact visual form.
		  * @public
		  */
		 Toolbar : "Toolbar",

		 /**
		  * A popup that displays a description for an element when the user passes over or rests on that element.
		  * Supplement to the normal tooltip processing of the user agent.
		  *
		  * @public
		  */
		 Tooltip : "Tooltip",

		 /**
		  * A form of a list (tree) having groups (subtrees) inside groups (subtrees), where the sub trees can be collapsed and expanded.
		  *
		  * @public
		  */
		 Tree : "Tree",

		 /**
		  * A grid whose rows are expandable and collapsable in the same manner as the ones of trees.
		  * @public
		  */
		 TreeGrid : "TreeGrid",

		 /**
		  * A tree node
		  * @public
		  */
		 TreeItem : "TreeItem"

	 };
	 DataType.registerEnum("sap.ui.core.AccessibleRole", thisLib.AccessibleRole);

	 /**
	  * Defines the accessible landmark roles for ARIA support. This enumeration is used with the AccessibleRole control property.
	  * For more information, go to "Roles for Accessible Rich Internet Applications (WAI-ARIA Roles)" at the www.w3.org homepage.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.AccessibleLandmarkRole = {

		 /**
		  * No explicit role is applicable.
		  *
		  * The interpretation of this value depends on the control / element which defines a property with this type.
		  * Normally this value means that no accessible landmark should be written.
		  *
		  * @public
		  */
		 None : "None",

		 /**
		  * Represents the ARIA role <code>banner</code>.
		  *
		  * A banner usually appears at the top of the page and typically spans the full width.
		  *
		  * @public
		  */
		 Banner : "Banner",

		 /**
		  * Represents the ARIA role <code>main</code>.
		  *
		  * The main content of a page.
		  *
		  * @public
		  */
		 Main : "Main",

		 /**
		  * Represents the ARIA role <code>region</code>.
		  *
		  * A section of a page, that is important enough to be included in a page summary or table of contents.
		  *
		  * @public
		  */
		 Region : "Region",

		 /**
		  * Represents the ARIA role <code>navigation</code>.
		  *
		  * A region that contains a collection of items and objects that, as a whole, combine to create a navigation facility.
		  *
		  * @public
		  */
		 Navigation : "Navigation",

		 /**
		  * Represents the ARIA role <code>search</code>.
		  *
		  * A region that contains a collection of items and objects that, as a whole, combine to create a search facility.
		  *
		  * @public
		  */
		 Search : "Search",

		 /**
		  * Represents the ARIA role <code>complementary</code>.
		  *
		  * A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
		  *
		  * @public
		  */
		 Complementary : "Complementary",

		 /**
		  * Represents the ARIA role <code>form</code>.
		  *
		  * A region that contains a collection of items and objects that, as a whole, combine to create a form.
		  *
		  * @public
		  */
		 Form : "Form",

		 /**
		  * Represents the ARIA role <code>contentinfo</code>.
		  *
		  * A region that contains information about the content on the page.
		  *
		  * @public
		  */
		 ContentInfo : "ContentInfo"

	 };
	 DataType.registerEnum("sap.ui.core.AccessibleLandmarkRole", thisLib.AccessibleLandmarkRole);

	 thisLib.aria = thisLib.aria || {};

	 /**
	  * Types of popups to set as aria-haspopup attribute.
	  * Most of the values (except "None") of the enumeration are taken from the ARIA specification:
	  * https://www.w3.org/TR/wai-aria/#aria-haspopup
	  *
	  * @enum {string}
	  * @public
	  * @since 1.84
	  */
	 thisLib.aria.HasPopup = {

		 /**
		  * None - the aria-haspopup attribute will not be rendered.
		  * @public
		  */
		 None : "None",

		 /**
		  * Menu popup type.
		  * @public
		  */
		 Menu : "Menu",

		 /**
		  * ListBox popup type.
		  * @public
		  */
		 ListBox : "ListBox",

		 /**
		  * Tree popup type.
		  * @public
		  */
		 Tree : "Tree",

		 /**
		  * Grid popup type.
		  * @public
		  */
		 Grid : "Grid",

		 /**
		  * Dialog popup type.
		  * @public
		  */
		 Dialog : "Dialog"

	 };
	 DataType.registerEnum("sap.ui.core.aria.HasPopup", thisLib.aria.HasPopup);

	 /**
	  * The object contains accessibility information for a control.
	  *
	  * @typedef {object} sap.ui.core.AccessibilityInfo
	  *
	  * @property {string} [role]
	  * 	The WAI-ARIA role which is implemented by the control.
	  * @property {string} [type]
	  * 	A translated text that represents the control type. Might correlate with the role.
	  * @property {string} [description]
	  * 	Describes the most relevant control state (e.g. the input's value) - it should be a translated text.
	  * 	<b>Note:</b> The type and the enabled/editable state shouldn`t be handled here.
	  * @property {boolean} [focusable]
	  * 	Whether the control can get the focus.
	  * @property {boolean | null} [enabled]
	  * 	 Whether the control is enabled. If not relevant, it shouldn`t be set or <code>null</code> can be provided.
	  * @property {boolean | null} [editable]
	  * 	Whether the control is editable. If not relevant, it shouldn`t be set or <code>null</code> can be provided.
	  * @property {boolean | null} [readonly]
	  * 	Whether the control is readonly. If not relevant, it shouldn`t be set or <code>null</code> can be provided.
	  * @property {sap.ui.core.Element[]} [children]
	  * 	A list of elements or controls that are aggregated by the given control (e.g. when the control is a layout).
	  * 	Primitive values in the list will be ignored.
	  * 	<b>Note:</b> Children should only be provided when it is helpful to understand the accessibility context
	  * 	(e.g. a form control shouldn`t provide details of its internals (fields, labels, ...) but a layout should).
	  * @protected
	  * @since 1.110
	  */

	 /**
	  * The object contains focus information for input controls.
	  *
	  * @typedef {object} sap.ui.core.FocusInfo
	  *
	  * @property {string} [id]
	  * 	The ID of the focused control.
	  * @property {int} [cursorPos]
	  * 	The position of the cursor.
	  * @property {int} [selectionStart]
	  * 	The start position of selection.
	  * @property {int} [selectionEnd]
	  * 	The end position of selection.
	  * @property {boolean | undefined} [preventScroll]
	  * 	Prevents scrolling.
	  * @protected
	  * @since 1.111
	  */

	 /**
	  * Configuration options for the colors of a progress bar.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.BarColor = {

		 /**
		  * Color: blue (#b8d0e8)
		  * @public
		  */
		 NEUTRAL : "NEUTRAL",

		 /**
		  * Color: green (#b5e7a8)
		  * @public
		  */
		 POSITIVE : "POSITIVE",

		 /**
		  * Color: yellow (#faf2b0)
		  * @public
		  */
		 CRITICAL : "CRITICAL",

		 /**
		  * Color: red (#ff9a90)
		  * @public
		  */
		 NEGATIVE : "NEGATIVE"

	 };
	 DataType.registerEnum("sap.ui.core.BarColor", thisLib.BarColor);

	 /**
	  * Configuration options for the <code>BusyIndicator</code> size.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.BusyIndicatorSize = {
		 /**
		  * Type: automatic size detection
		  * @public
		  */
		 Auto : "Auto",

		 /**
		  * Type: small size
		  * @public
		  */
		 Small : "Small",

		 /**
		  * Type: Medium size
		  * @public
		  */
		 Medium : "Medium",

		 /**
		  * Type: Large size
		  * @public
		  */
		 Large : "Large",

		 /**
		  * Type: Medium size, specifically if the BusyIndicator is displayed over a page section
		  * @public
		  */
		 Section : "Section"
	 };
	 DataType.registerEnum("sap.ui.core.BusyIndicatorSize", thisLib.BusyIndicatorSize);

	 // this assignment here is kept so that imports via the library module continue to work
	 // even when the export via globals is abandoned
	 thisLib.CalendarType = CalendarType;

	 /**
	  * @classdesc A string type that represents CSS color values (CSS Color Level 3).
	  *
	  * <b>Allowed values are:</b>
	  * <ul>
	  *   <li>Hex colors like <code>#666666</code> or <code>#fff</code>,</li>
	  *   <li>HSL/RGB values with or without transparency, like <code>hsla(90,10%,30%,0.5)</code> or <code>rgb(0,0,0)</code>,</li>
	  *   <li>CSS color names like <code>darkblue</code>, or special values like <code>inherit</code> and <code>transparent</code>,</li>
	  *   <li>an empty string, which has the same effect as setting no color.</li>
	  * </ul>
	  * For more information about the CSS Level 3 color specification, see {@link https://www.w3.org/TR/css-color-3/#css-system}.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.CSSColor = DataType.createType('sap.ui.core.CSSColor', {
			 isValid : function(vValue) {
				 // Note: the following regexp by intention is a single regexp literal.
				 // It could be made much more readable by constructing it out of (reused) sub-expressions (strings)
				 // but this would not be parseable by the metamodel recovery tooling that is used inside SAP
				 return /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgb\(\s*((1?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))|([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*(,\s*((1?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))|([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*){2}\)|rgba\((\s*((1?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))|([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*,){3}\s*(0(\.[0-9]+)?|1(\.0+)?)\s*\)|hsl\(\s*([0-2]?[0-9]?[0-9]|3([0-5][0-9]|60))\s*(,\s*(([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*){2}\)|hsla\(\s*([0-2]?[0-9]?[0-9]|3([0-5][0-9]|60))\s*,(\s*(([0-9]?[0-9](\.[0-9]+)?|100(\.0+)?)%)\s*,){2}\s*(0(\.[0-9]+)?|1(\.0+)?)\s*\)|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgrey|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silverskyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen|transparent|inherit|)$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * @classdesc A string type that represents CSS size values.
	  *
	  * The CSS specifications calls this the <code>'&lt;length&gt; type'</code>.
	  * Allowed values are CSS sizes like "1px" or "2em" or "50%". The special values <code>auto</code>
	  * and <code>inherit</code> are also accepted as well as mathematical expressions using the CSS3
	  * <code>calc(<i>expression</i>)</code> operator. Furthermore, length units representing a percentage of the
	  * current viewport dimensions: width (vw), height (vh), the smaller of the two (vmin), or the larger of the two (vmax)
	  * can also be defined as a CSS size.
	  *
	  * Note that CSS does not allow all these values for every CSS property representing a size.
	  * E.g. <code>padding-left</code> doesn't allow the value <code>auto</code>. So even if a value is
	  * accepted by <code>sap.ui.core.CSSSize</code>, it still might have no effect in a specific context.
	  * In other words: UI5 controls usually don't extend the range of allowed values in CSS.
	  *
	  *
	  * <b>Units</b>
	  *
	  * Valid font-relative units are <code>em, ex</code> and <code>rem</code>. Viewport relative units
	  * <code>vw, vh, vmin, vmax</code> are also valid. Supported absolute units are <code>cm, mm, in, pc, pt</code>
	  * and <code>px</code>.Other units are not supported yet.
	  *
	  *
	  * <b>Mathematical Expressions</b>
	  *
	  * Expressions inside the <code>calc()</code> operator are only roughly checked for validity.
	  * Not every value that this type accepts might be a valid expression in the sense of the CSS spec.
	  * But vice versa, any expression that is valid according to the spec should be accepted by this type.
	  * The current implementation is based on the
	  * {@link http://dev.w3.org/csswg/css-values-3/#calc-syntax CSS3 Draft specification from 22 April 2015}.
	  *
	  * Noteworthy details:
	  * <ul>
	  * <li>whitespace is mandatory around a '-' or '+' operator and optional otherwise</li>
	  * <li>parentheses are accepted but not checked for being balanced (a restriction of regexp based checks)</li>
	  * <li>semantic constraints like type restrictions are not checked</li>
	  * </ul>
	  *
	  * Future versions of UI5 might check <code>calc()</code> expressions in more detail, so applications should
	  * not assume that a value, that is invalid according to the CSS spec but currently accepted by this type
	  * still will be accepted by future versions of this type.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.CSSSize = DataType.createType('sap.ui.core.CSSSize', {
			 isValid : function(vValue) {
				 // Note: the following regexp by intention is a single regexp literal.
				 // It could be made much more readable by constructing it out of (reused) sub-expressions (strings)
				 // but this would not be parseable by the metamodel recovery tooling that is used inside SAP
				 return /^(auto|inherit|[-+]?(0*|([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|[vV][wW]|[vV][hH]|[vV][mM][iI][nN]|[vV][mM][aA][xX]|%))|calc\(\s*(\(\s*)*[-+]?(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|[vV][wW]|[vV][hH]|[vV][mM][iI][nN]|[vV][mM][aA][xX]|%)?)(\s*(\)\s*)*(\s[-+]\s|[*\/])\s*(\(\s*)*([-+]?(([0-9]+|[0-9]*\.[0-9]+)([rR][eE][mM]|[eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|[vV][wW]|[vV][hH]|[vV][mM][iI][nN]|[vV][mM][aA][xX]|%)?)))*\s*(\)\s*)*\))$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * @classdesc This type checks the short hand form of a margin or padding definition.
	  *
	  * E.g. "1px 1px" or up to four CSSSize values are allowed or tHe special keyword <code>inherit</code>.
	  *
	  *
	  * @since 1.11.0
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.CSSSizeShortHand = DataType.createType('sap.ui.core.CSSSizeShortHand', {
			 isValid : function(vValue) {
				 // Note: the following regexp by intention is a single regexp literal.
				 // It could be made much more readable by constructing it out of (reused) sub-expressions (strings)
				 // but this would not be parseable by the metamodel recovery tooling that is used inside SAP
				 return /^(inherit|(auto|[-+]?(0*|(\d+|\d*\.\d+)([eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|%))){1}(\s(auto|[-+]?(0*|(\d+|\d*\.\d+)([eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|%)))){0,3})$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * @classdesc Collision behavior: horizontal/vertical.
	  *
	  * Defines how the position of an element should be adjusted in case it overflows the window in some direction.
	  * For both directions this can be "flip", "fit", "flipfit" or "none".
	  * If only one behavior is provided it is applied to both directions.
	  *
	  * Examples: "flip", "fit none", "flipfit fit"
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.Collision = DataType.createType('sap.ui.core.Collision', {
			 isValid : function(vValue) {
				 return /^((flip|fit|flipfit|none)( (flip|fit|flipfit|none))?)$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * Font design for texts.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.Design = {

		 /**
		  * Standard font
		  * @public
		  */
		 Standard : "Standard",

		 /**
		  * Mono space font
		  * @public
		  */
		 Monospace : "Monospace"

	 };
	 DataType.registerEnum("sap.ui.core.Design", thisLib.Design);


	 /**
	  * @classdesc Docking position: horizontal/vertical.
	  *
	  * Defines a position on the element which is used for aligned positioning of another element (e.g. the left top
	  * corner of a popup is positioned at the left bottom corner of the input field). For the horizontal position possible values
	  * are "begin", "left", "center", "right" and "end", where left/right always are left and right, or begin/end which are
	  * dependent on the text direction. For the vertical position possible values are "top", "center" and "bottom".
	  * Examples: "left top", "end bottom", "center center".
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.Dock = DataType.createType('sap.ui.core.Dock', {
			 isValid : function(vValue) {
				 return /^((begin|left|center|right|end) (top|center|bottom))$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * Configuration options for horizontal alignments of controls.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.HorizontalAlign = {

		 /**
		  * Locale-specific positioning at the beginning of the line
		  * @public
		  */
		 Begin : "Begin",

		 /**
		  * Locale-specific positioning at the end of the line
		  * @public
		  */
		 End : "End",

		 /**
		  * Hard option for left alignment
		  * @public
		  */
		 Left : "Left",

		 /**
		  * Hard option for right alignment
		  * @public
		  */
		 Right : "Right",

		 /**
		  * Centered alignment of text
		  * @public
		  */
		 Center : "Center"

	 };
	 DataType.registerEnum("sap.ui.core.HorizontalAlign", thisLib.HorizontalAlign);

	 // expose ID type for compatibility reasons
	 thisLib.ID = DataType.getType('sap.ui.core.ID');

	 /**
	  * Interface for the controls which are suitable to shrink.
	  *
	  * This means the control should still look fine when it gets smaller than its normal size,
	  * e.g. Text controls which can show ellipsis in case of shrink.
	  *
	  * Note: This marker interface can be implemented by controls to give a hint to the container.
	  * The control itself does not need to implement anything. A parent control that respects this interface
	  * will apply the "flex-shrink" as a CSS property which determines how much the item will shrink relative
	  * to the rest of the items in the container when negative free space is distributed.
	  *
	  * @since 1.26
	  * @name sap.ui.core.IShrinkable
	  * @interface
	  * @public
	  */


	 /**
	  * Semantic Colors of an icon.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.IconColor = {

		 /**
		  * Default color (brand color)
		  * @public
		  */
		 Default : "Default",

		 /**
		  * Positive color
		  * @public
		  */
		 Positive : "Positive",

		 /**
		  * Negative color
		  * @public
		  */
		 Negative : "Negative",

		 /**
		  * Critical color
		  * @public
		  */
		 Critical : "Critical",

		 /**
		  * Neutral color.
		  * @public
		  */
		 Neutral : "Neutral",

		 /**
		  * Contrast color.
		  * @public
		  */
		 Contrast : "Contrast",

		 /**
		  * Color that indicates an icon which isn't interactive
		  * @public
		  * @since 1.76
		  */
		 NonInteractive : "NonInteractive",

		 /**
		  * Color for icon used in a Tile
		  * @public
		  * @since 1.76
		  */
		 Tile : "Tile",

		 /**
		  * Color for icon used as a marker
		  * @public
		  * @since 1.76
		  */
		 Marker : "Marker"

	 };
	 DataType.registerEnum("sap.ui.core.IconColor", thisLib.IconColor);


	 /**
	  * State of the Input Method Editor (IME) for the control.
	  *
	  * Depending on its value, it allows users to enter and edit for example Chinese characters.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.ImeMode = {

		 /**
		  * The value is automatically computed by the user agent.
		  * @public
		  */
		 Auto : "Auto",

		 /**
		  * IME is used for entering characters.
		  * @public
		  */
		 Active : "Active",

		 /**
		  * IME is not used for entering characters.
		  * @public
		  */
		 Inactive : "Inactive",

		 /**
		  * IME is disabled.
		  * @public
		  */
		 Disabled : "Disabled"

	 };
	 DataType.registerEnum("sap.ui.core.ImeMode", thisLib.ImeMode);

	 /**
	  * Marker interface for controls which are suitable for use as label.
	  *
	  * @name sap.ui.core.Label
	  * @interface
	  * @public
	  */

	 /**
	  * Defines a control, which can specify if it can be bound to a label
	  *
	  * @since 1.121.0
	  * @name sap.ui.core.ILabelable
	  * @interface
	  * @private
	  * @ui5-restricted sap.ui.mdc
	  */

	 /**
	  * Returns if the control can be bound to a label
	  *
	  * @returns {boolean} <code>true</code> if the control can be bound to a label
	  * @private
	  * @ui5-restricted sap.ui.mdc
	  * @function
	  * @since 1.121.0
	  * @name sap.ui.core.ILabelable.hasLabelableHTMLElement
	  */

	 /**
	  * Colors to highlight certain UI elements.
	  *
	  * In contrast to the <code>ValueState</code>, the semantic meaning must be defined by the application.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.62.0
	  * @see {@link fiori:/how-to-use-semantic-colors/ Semantic Colors}
	  */
	 thisLib.IndicationColor = {

		 /**
		  * Indication Color 1
		  * @public
		  */
		 Indication01 : "Indication01",

		 /**
		  * Indication Color 2
		  * @public
		  */
		 Indication02 : "Indication02",

		 /**
		  * Indication Color 3
		  * @public
		  */
		 Indication03 : "Indication03",

		 /**
		  * Indication Color 4
		  * @public
		  */
		 Indication04 : "Indication04",

		 /**
		  * Indication Color 5
		  * @public
		  */
		 Indication05 : "Indication05",

		 /**
		  * Indication Color 6
		  * @public
		  * @since 1.75
		  */
		 Indication06 : "Indication06",

		 /**
		  * Indication Color 7
		  * @public
		  * @since 1.75
		  */
		 Indication07 : "Indication07",

		 /**
		  * Indication Color 8
		  * @public
		  * @since 1.75
		  */
		 Indication08 : "Indication08",

		 /**
		  * Indication Color 9
		  * @public
		  * @since 1.120
		  */
		 Indication09 : "Indication09",

		 /**
		  * Indication Color 10
		  * @public
		  * @since 1.120
		  */
		 Indication10 : "Indication10",

		 /**
		  * Indication Color 11
		  * @public
		  * @since 1.120
		  */
		 Indication11 : "Indication11",

		 /**
		  * Indication Color 12
		  * @public
		  * @since 1.120
		  */
		 Indication12 : "Indication12",

		 /**
		  * Indication Color 13
		  * @public
		  * @since 1.120
		  */
		 Indication13 : "Indication13",

		 /**
		  * Indication Color 14
		  * @public
		  * @since 1.120
		  */
		 Indication14 : "Indication14",

		 /**
		  * Indication Color 15
		  * @public
		  * @since 1.120
		  */
		 Indication15 : "Indication15",

		 /**
		  * Indication Color 16
		  * @public
		  * @since 1.120
		  */
		 Indication16 : "Indication16",

		 /**
		  * Indication Color 17
		  * @public
		  * @since 1.120
		  */
		 Indication17 : "Indication17",

		 /**
		  * Indication Color 18
		  * @public
		  * @since 1.120
		  */
		 Indication18 : "Indication18",

		 /**
		  * Indication Color 19
		  * @public
		  * @since 1.120
		  */
		 Indication19 : "Indication19",

		 /**
		  * Indication Color 20
		  * @public
		  * @since 1.120
		  */
		 Indication20 : "Indication20"
	 };
	 DataType.registerEnum("sap.ui.core.IndicationColor", thisLib.IndicationColor);

	 /**
	  * Defines the different possible states of an element that can be open or closed and does not only
	  * toggle between these states, but also spends some time in between (e.g. because of an animation).
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.OpenState = {

		 /**
		  * Open and currently not changing states.
		  * @public
		  */
		 OPEN : "OPEN",

		 /**
		  * Closed and currently not changing states.
		  * @public
		  */
		 CLOSED : "CLOSED",

		 /**
		  * Already left the CLOSED state, is not OPEN yet, but in the process of getting OPEN.
		  * @public
		  */
		 OPENING : "OPENING",

		 /**
		  * Still open, but in the process of going to the CLOSED state.
		  * @public
		  */
		 CLOSING : "CLOSING"

	 };
	 DataType.registerEnum("sap.ui.core.OpenState", thisLib.OpenState);

	 /**
	  * Orientation of a UI element.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.22
	  */
	 thisLib.Orientation = {

		 /**
		  * Arrange Horizontally
		  * @public
		  */
		 Horizontal : "Horizontal",

		 /**
		  * Arrange Vertically
		  * @public
		  */
		 Vertical : "Vertical"

	 };
	 DataType.registerEnum("sap.ui.core.Orientation", thisLib.Orientation);

	 /**
	  * @classdesc A string type that represents a percentage value.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.Percentage = DataType.createType('sap.ui.core.Percentage', {
			 isValid : function(vValue) {
				 return /^([0-9][0-9]*(\.[0-9]+)?%)$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * Priorities for general use.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.Priority = {

		 /**
		  * Default, none priority
		  * @public
		  */
		 None: "None",

		 /**
		  * Low priority
		  * @public
		  */
		 Low: "Low",

		 /**
		  * Medium priority
		  * @public
		  */
		 Medium: "Medium",

		 /**
		  * High priority
		  * @public
		  */
		 High: "High"
	 };
	 DataType.registerEnum("sap.ui.core.Priority", thisLib.Priority);


	 /**
	  * Marker interface for controls that are not rendered "embedded" into other controls but need to be opened/closed.
	  *
	  * Such controls are handled differently during rendering.
	  *
	  * @since 1.19.0
	  * @name sap.ui.core.PopupInterface
	  * @interface
	  * @public
	  */


	 /**
	  * Actions are: Click on track, button, drag of thumb, or mouse wheel click.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.ScrollBarAction = {

		 /**
		  * Single step scrolling caused by clicking an arrow button or arrow key.
		  * @public
		  */
		 Step : "Step",

		 /**
		  * Range scrolling caused by clicking track area or using page up or page down key.
		  * @public
		  */
		 Page : "Page",

		 /**
		  * Scrolling done by mouse wheel
		  * @public
		  */
		 MouseWheel : "MouseWheel",

		 /**
		  * Scrolling done by dragging the scroll bar's paint thumb
		  * @public
		  */
		 Drag : "Drag"

	 };
	 DataType.registerEnum("sap.ui.core.ScrollBarAction", thisLib.ScrollBarAction);

	 /**
	  * Defines the possible values for horizontal and vertical scrolling behavior.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.Scrolling = {

		 /**
		  * No scroll bar provided even if the content is larger than the available space.
		  * @public
		  */
		 None : "None",

		 /**
		  * A scroll bar is shown if the content requires more space than the given space (rectangle) provides.
		  * @public
		  */
		 Auto : "Auto",

		 /**
		  * A scroll bar is always shown even if the space is large enough for the current content.
		  * @public
		  */
		 Scroll : "Scroll",

		 /**
		  * No scroll bar is shown, and the content stays in the given rectangle.
		  * @public
		  */
		 Hidden : "Hidden"

	 };
	 DataType.registerEnum("sap.ui.core.Scrolling", thisLib.Scrolling);

	 /**
	  * Sort order of a column.
	  *
	  * @version ${version}
	  * @enum {string}
	  * @public
	  * @since 1.61.0
	  */
	 thisLib.SortOrder = {

		 /**
		  * Sorting is not applied.
		  * @public
		  */
		 None : "None",

		 /**
		  * Sorting is done in ascending order.
		  * @public
		  */
		 Ascending : "Ascending",

		 /**
		  * Sorting is done in descending order.
		  * @public
		  */
		 Descending : "Descending"

	 };
	 DataType.registerEnum("sap.ui.core.SortOrder", thisLib.SortOrder);


	 /**
	  * Configuration options for text alignments.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.TextAlign = {

		 /**
		  * Locale-specific positioning at the beginning of the line.
		  * @public
		  */
		 Begin : "Begin",

		 /**
		  * Locale-specific positioning at the end of the line.
		  * @public
		  */
		 End : "End",

		 /**
		  * Hard option for left alignment.
		  * @public
		  */
		 Left : "Left",

		 /**
		  * Hard option for right alignment.
		  * @public
		  */
		 Right : "Right",

		 /**
		  * Centered text alignment.
		  * @public
		  */
		 Center : "Center",

		 /**
		  * Sets no text align, so the browser default is used.
		  * @public
		  * @since 1.26.0
		  */
		 Initial : "Initial"

	 };
	 DataType.registerEnum("sap.ui.core.TextAlign", thisLib.TextAlign);


	 /**
	  * Configuration options for the direction of texts.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.TextDirection = {

		 /**
		  * Specifies left-to-right text direction.
		  * @public
		  */
		 LTR : "LTR",

		 /**
		  * Specifies right-to-left text direction.
		  * @public
		  */
		 RTL : "RTL",

		 /**
		  * Inherits the direction from its parent control/container.
		  * @public
		  */
		 Inherit : "Inherit"

	 };
	 DataType.registerEnum("sap.ui.core.TextDirection", thisLib.TextDirection);


	 /**
	  * Level of a title.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.9.1
	  */
	 thisLib.TitleLevel = {

		 /**
		  * The level of the title is choosen by the control rendering the title.
		  * @public
		  */
		 Auto : "Auto",

		 /**
		  * The Title is of level 1.
		  * @public
		  */
		 H1 : "H1",

		 /**
		  * The Title is of level 2
		  * @public
		  */
		 H2 : "H2",

		 /**
		  * The Title is of level 3
		  * @public
		  */
		 H3 : "H3",

		 /**
		  * The Title is of level 4
		  * @public
		  */
		 H4 : "H4",

		 /**
		  * The Title is of level 5
		  * @public
		  */
		 H5 : "H5",

		 /**
		  * The Title is of level 6
		  * @public
		  */
		 H6 : "H6"

	 };
	 DataType.registerEnum("sap.ui.core.TitleLevel", thisLib.TitleLevel);

	 /**
	  *
	  * 	Marker interface for toolbar controls.
	  *
	  *
	  * @since 1.21.0
	  * @name sap.ui.core.Toolbar
	  * @interface
	  * @public
	  */

	 /**
	  * Marker interface for subclasses of <code>sap.ui.core.UIComponent</code>.
	  *
	  * Implementing this interface allows a {@link sap.ui.core.UIComponent} to be created fully asynchronously.
	  * This interface will implicitly set the component's rootView and router configuration to async.
	  * Nested views will also be handled asynchronously.
	  * Additionally the error handling during the processing of views is stricter and will fail if a view definition contains
	  * errors, e.g. broken binding strings.
	  *
	  * <b>Note:</b> Nested components (via {@link sap.ui.core.ComponentContainer}) are not handled asynchronously by default.
	  *
	  * When implementing this interface the {@link sap.ui.core.Component.create Component.create} factory's result Promise
	  * will resolve once the defined <code>rootView</code> is fully processed.
	  *
	  * An asynchronous component can also return a Promise in its {@link sap.ui.core.UIComponent#createContent createContent} function.
	  * This Promise will also be chained into the {@link sap.ui.core.Component.create Component.create} factory's result Promise.
	  *
	  * See {@link sap.ui.core.UIComponent#createContent} for more details and usage samples.
	  *
	  * @name sap.ui.core.IAsyncContentCreation
	  * @interface
	  * @public
	  * @since 1.89.0
	  */

	 /**
	  * Marker interface for container controls.
	  *
	  * Implementing this interface allows a container control to display a {@link sap.ui.core.Placeholder}.
	  * This requires the container control to implement the <code>showPlaceholder</code> and <code>hidePlaceholder</code>
	  * methods.
	  *
	  * Optionally, the <code>needPlaceholder</code> method can be implemented to defined, whether a placeholder is needed or not.
	  * If implemented, this method must return a <code>boolean</code>. Depending on the return value, <code>showPlaceholder</code>
	  * will be called or not.
	  *
	  * @name sap.ui.core.IPlaceholderSupport
	  * @interface
	  * @public
	  * @since 1.92.0
	  */

	 /**
	  * Marker interface for controls that can serve as a menu for a table column header.
	  *
	  * Implementation of this interface should include the <code>openBy</code>, <code>close</code>, <code>isOpen</code> and
	  * <code>getAriaHasPopupType</code> methods and fire the <code>beforeOpen</code> and <code>afterClose</code> events.
	  *
	  * Refer to the base class {@link sap.m.table.columnmenu.MenuBase} for a detailed API description.
	  *
	  * @name sap.ui.core.IColumnHeaderMenu
	  * @interface
	  * @public
	  * @since 1.98
	  *
	  */

	 /**
	  * Opens the menu using the column header.
	  * @param {sap.ui.core.Control|HTMLElement} oAnchor Specifies the element where the menu is placed.
	  *
	  * @public
	  * @function
	  * @since 1.98
	  * @name sap.ui.core.IColumnHeaderMenu.openBy
	  */

	 /**
	  * Closes the menu.
	  *
	  * @public
	  * @function
	  * @since 1.126
	  * @name sap.ui.core.IColumnHeaderMenu.close
	  */

	 /**
	  * Determines whether the menu is open.
	  *
	  * @param {sap.ui.core.Element} openBy The element for which the menu is opened. If it is an <code>HTMLElement</code>,
	  * the closest control is passed for this event (if it exists).
	  * @returns {boolean} <code>true</code> if the menu is open, <code>false</code> otherwise
	  *
	  * @public
	  * @function
	  * @since 1.126
	  * @name sap.ui.core.IColumnHeaderMenu.isOpen
	  */

	 /**
	  * Returns the <code>sap.ui.core.aria.HasPopup</code> type of the menu.
	  *
	  * @returns {sap.ui.core.aria.HasPopup} <code>sap.ui.core.aria.HasPopup</code> type of the menu
	  *
	  * @public
	  * @function
	  * @since 1.98.0
	  * @name sap.ui.core.IColumnHeaderMenu.getAriaHasPopupType
	  */

	 /**
	  * Fires before the menu is opened.
	  *
	  * @public
	  * @event
	  * @since 1.126
	  * @name sap.ui.core.IColumnHeaderMenu.beforeOpen
	  */

	 /**
	  * Fires after the menu is closed.
	  *
	  * @public
	  * @event
	  * @since 1.126
	  * @name sap.ui.core.IColumnHeaderMenu.afterClose
	  */

	 /**
	  * Implementing this interface allows a control to be accessible via access keys.
	  *
	  * @name sap.ui.core.IAccessKeySupport
	  * @interface
	  * @public
	  * @experimental As of version 1.104
	  * @since 1.104
	  */

	 /**
	  * Returns a refence to DOM element to be focused during Access key navigation.
	  * If not implemented getFocusDomRef() method is used.
	  *
	  * @public
	  * @function
	  * @experimental As of version 1.104
	  * @since 1.104
	  * @name sap.ui.core.IAccessKeySupport.getAccessKeysFocusTarget?
	  */

	 /**
	  * If implemented called when access keys feature is enabled and highlighting is ongoing
	  *
	  * @public
	  * @function
	  * @experimental As of version 1.104
	  * @since 1.104
	  * @name sap.ui.core.IAccessKeySupport.onAccKeysHighlightStart?
	  */

	 /**
	  * If implemented called when access keys feature is enabled and highlighting is over
	  *
	  * @public
	  * @function
	  * @experimental As of version 1.104
	  * @since 1.104
	  * @name sap.ui.core.IAccessKeySupport.onAccKeysHighlightEnd?
	  */

	 /**
	  * Marker interface for controls that can serve as a context menu.
	  *
	  * Implementation of this interface should implement the <code>openAsContextMenu</code> method.
	  *
	  * @name sap.ui.core.IContextMenu
	  * @interface
	  * @public
	  */

	 /**
	  * Opens the control by given opener ref.
	  * @param {jQuery.Event | {left: float, top: float, offsetX: float, offsetY: float}} oEvent
	  *   An <code>oncontextmenu</code> event object or an object with properties left, top, offsetX, offsetY
	  * @param {sap.ui.core.Element|HTMLElement} oOpenerRef
	  *   The element which will get the focus back again after the menu was closed
	  *
	  * @public
	  * @function
	  * @name sap.ui.core.IContextMenu.openAsContextMenu
	  */

	 /**
	  * Marker interface for drag configuration providing information about the source of the drag operation.
	  *
	  * @since 1.52.0
	  * @name sap.ui.core.dnd.IDragInfo
	  * @interface
	  * @public
	  */

	 /**
	  * Marker interface for drop configuration providing information about the target of the drop operation.
	  *
	  * @since 1.52.0
	  * @name sap.ui.core.dnd.IDropInfo
	  * @interface
	  * @public
	  */

	 /**
	  * Marker interface to flag controls that provide access to substructures from a byId method.
	  *
	  * @since 1.56.0
	  * @name sap.ui.core.IDScope
	  * @interface
	  * @private
	  * @ui5-restricted
	  */

	 /**
	  * Marker interface for a ControllerExtension.
	  *
	  * @since 1.56.0
	  * @name sap.ui.core.mvc.IControllerExtension
	  * @interface
	  * @public
	  */

	 /**
	  * Marker interface for controls that can be used as content of <code>sap.ui.layout.form.Form</code>
	  * or <code>sap.ui.layout.form.SimpleForm</code>.
	  *
	  * If the control's width must not be adjusted by the <code>Form</code> control to meet the cell's width, the
	  * control must implement the <code>getFormDoNotAdjustWidth</code> function and return <code>true</code>.
	  *
	  * @since 1.48.0
	  * @name sap.ui.core.IFormContent
	  * @interface
	  * @public
	  */

	 /**
	  *
	  * Marker interface for controls that can be used in <code>content</code> aggregation of the <code>sap.m.Title</code> control.
	  *
	  * @since 1.87
	  * @name sap.ui.core.ITitleContent
	  * @interface
	  * @public
	  */



	 /**
	  * Whether a control wants to keep its original width even when used in a <code>Form</code>.
	  *
	  * In the <code>Form</code> control, all content controls are positioned on a grid cell base. By default,
	  * the controls use the full width of the used grid cell. But for some controls (like image controls),
	  * this is not the desired behavior. In this case the control must keep its original width.
	  *
	  * This is an optional method. When not defined, the width of the control might be adjusted.
	  *
	  * @returns {boolean} true if the <code>Form</code> is not allowed to adjust the width of the control to use the cell's width
	  * @since 1.48.0
	  * @public
	  * @function
	  * @name sap.ui.core.IFormContent.getFormDoNotAdjustWidth?
	  */

	 /**
	  * Marker interface for controls that can be used as content of <code>sap.ui.layout.form.SemanticFormElement</code>.
	  *
	  * If the value-holding property of the control is not <code>value</code or <code>text</code>, the name of the
	  * value-holding property must be returned in the <code>getFormValueProperty</code> function.
	  *
	  * If the value of the control needs some special output formatting (to show a description instead of a key), this
	  * formatted text needs to be returned in the <code>getFormFormattedValue</code> function.
	  *
	  * @since 1.86.0
	  * @name sap.ui.core.ISemanticFormContent
	  * @interface
	  * @public
	  */

	 /**
	  * Returns the formatted value of a control used in a <code>SemanticFormElement</code>.
	  *
	  * In the <code>SemanticFormElement</code> element, the assigned fields are rendered in edit mode. In display mode, a text
	  * is rendered that concatenates the values of all assigned fields. In some cases the displayed text does not match the value
	  * of the field and needs some formatting. In other cases the control does not have a <code>value</code> property,
	  * so the <code>SemanticFormElement</code> element cannot determine the value.
	  *
	  * This is an optional method. If not defined, the <code>value</code> property or the <code>text</code> property is used to determine the value.
	  *
	  * @returns {string|Promise<string>} Formatted value or a <code>Promise</code> returning the formatted value if resolved
	  * @since 1.86.0
	  * @public
	  * @function
	  * @name sap.ui.core.ISemanticFormContent.getFormFormattedValue?
	  */

	 /**
	  * Returns the name of the value-holding property of a control used in a <code>SemanticFormElement</code>.
	  *
	  * In the <code>SemanticFormElement</code> element, the assigned fields are rendered in edit mode. In display mode, a text
	  * is rendered that concatenates the values of all assigned fields.
	  * So the concatenated text needs to be updated if the value of a control changes. If a control does not have a <code>value</code> property,
	  * the <code>SemanticFormElement</code> element needs to know the propery it has to listen for changes.
	  *
	  * This is an optional method. If not defined, the <code>value</code> property or the <code>text</code> property is used to determine the value.
	  *
	  * @returns {string} Name of the value-holding property
	  * @since 1.86.0
	  * @public
	  * @function
	  * @name sap.ui.core.ISemanticFormContent.getFormValueProperty?
	  */

	 /**
	  * Returns the names of the properties of a control that might update the rendering in a <code>SemanticFormElement</code>.
	  *
	  * In the <code>SemanticFormElement</code> element, the assigned fields are rendered in edit mode. In display mode, depending on <code>getFormRenderAsControl</code>,
	  * either a text is rendered, which concatenates the values of all assigned fields, or the control is rendered.
	  * So if a property of the control changes that might lead to a different rendering (some controls have a special rendering in display mode), the
	  * <code>SemanticFormElement</code> needs to check the rendering.
	  *
	  * This is an optional method. If not defined, no check for updates (only for property defined in <code>getFormValueProperty</code>) is done once the control has been assigned.
	  *
	  * @returns {string[]} Name of the properties
	  * @since 1.117.0
	  * @public
	  * @function
	  * @name sap.ui.core.ISemanticFormContent.getFormObservingProperties?
	  */

	 /**
	  * If set to <code>true</code>, the <code>SemanticFormElement</code> also renders the control in display mode, if the used <code>FormLayout</code> supports this.
	  *
	  * This is an optional method. If not defined, just the text is rendered.
	  *
	  * @returns {string} Name of the value-holding property
	  * @since 1.117.0
	  * @public
	  * @function
	  * @name sap.ui.core.ISemanticFormContent.getFormRenderAsControl?
	  */

	 /**
	  * @classdesc A string type that represents an RFC 3986 conformant URI.
	  *
	  * @final
	  * @namespace
	  * @public
	  */
	 thisLib.URI = DataType.createType('sap.ui.core.URI', {
			 isValid : function(vValue) {
				 return /^((([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?)$/.test(vValue);
			 }
		 },
		 DataType.getType('string')
	 );


	 /**
	  * Marker for the correctness of the current value.
	  *
	  * @enum {string}
	  * @public
	  * @see {@link fiori:/how-to-use-semantic-colors/ Semantic Colors}
	  * @since 1.0
	  */
	 thisLib.ValueState = {

		 /**
		  * State is not valid.
		  * @public
		  */
		 Error : "Error",

		 /**
		  * State is valid but with a warning.
		  * @public
		  */
		 Warning : "Warning",

		 /**
		  * State is valid.
		  * @public
		  */
		 Success : "Success",

		 /**
		  * State is informative.
		  * @public
		  * @since 1.61
		  */
		 Information : "Information",

		 /**
		  * State is not specified.
		  * @public
		  */
		 None : "None"

	 };
	 DataType.registerEnum("sap.ui.core.ValueState", thisLib.ValueState);


	 /**
	  * Configuration options for vertical alignments, for example of a layout cell content within the borders.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.VerticalAlign = {

		 /**
		  *
		  * Content is aligned at the bottom.
		  *
		  * @public
		  */
		 Bottom : "Bottom",

		 /**
		  *
		  * Content is centered vertically .
		  *
		  * @public
		  */
		 Middle : "Middle",

		 /**
		  *
		  * Content is aligned at the top.
		  *
		  * @public
		  */
		 Top : "Top",

		 /**
		  *
		  * Content respect the parent's vertical alignment.
		  *
		  * @public
		  */
		 Inherit : "Inherit"

	 };
	 DataType.registerEnum("sap.ui.core.VerticalAlign", thisLib.VerticalAlign);

	 /**
	  * Configuration options for text wrapping.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.Wrapping = {

		 /**
		  * The standard browser behavior is considered for wrapping.
		  * @public
		  */
		 None : "None",

		 /**
		  * The text is actually on the same line but displayed within several lines.
		  * @public
		  */
		 Soft : "Soft",

		 /**
		  * Inserts actual line breaks in the text at the wrap point.
		  * @public
		  */
		 Hard : "Hard",

		 /**
		  * Wrapping shall not be allowed.
		  * @public
		  */
		 Off : "Off"

	 };
	 DataType.registerEnum("sap.ui.core.Wrapping", thisLib.Wrapping);


	 thisLib.dnd = thisLib.dnd || {};

	 /**
	  * Configuration options for drop positions.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.52.0
	  */
	 thisLib.dnd.DropPosition = {

		 /**
		  * Drop on the control.
		  * @public
		  */
		 On : "On",

		 /**
		  * Drop between the controls.
		  * @public
		  */
		 Between : "Between",

		 /**
		  * Drop on the control or between the controls.
		  * @public
		  */
		 OnOrBetween : "OnOrBetween"
	 };
	 DataType.registerEnum("sap.ui.core.dnd.DropPosition", thisLib.dnd.DropPosition);

	 /**
	  * Drop positions relative to a dropped element.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.100.0
	  */
	 thisLib.dnd.RelativeDropPosition = {

		 /**
		  * Drop on the control.
		  * @public
		  */
		 On : "On",

		 /**
		  * Drop before the control.
		  * @public
		  */
		 Before : "Before",

		 /**
		  * Drop after the control.
		  * @public
		  */
		 After : "After"
	 };
	 DataType.registerEnum("sap.ui.core.dnd.RelativeDropPosition", thisLib.dnd.RelativeDropPosition);

	 /**
	  * Configuration options for the layout of the droppable controls.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.52.0
	  */
	 thisLib.dnd.DropLayout = {
		 /**
		  * Default {@link sap.ui.core.Element.extend layout} definition of the aggregations.
		  * @public
		  */
		 Default: "Default",

		 /**
		  * Droppable controls are arranged vertically.
		  * @public
		  */
		 Vertical : "Vertical",

		 /**
		  * Droppable controls are arranged horizontally.
		  * @public
		  */
		 Horizontal : "Horizontal"
	 };
	 DataType.registerEnum("sap.ui.core.dnd.DropLayout", thisLib.dnd.DropLayout);

	 /**
	  * Configuration options for visual drop effects that are given during a drag and drop operation.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.52.0
	  */
	 thisLib.dnd.DropEffect = {

		 /**
		  * A copy of the source item is made at the new location.
		  * @public
		  */
		 Copy : "Copy",

		 /**
		  * An item is moved to a new location.
		  * @public
		  */
		 Move : "Move",

		 /**
		  * A link is established to the source at the new location.
		  * @public
		  */
		 Link : "Link",

		 /**
		  * The item cannot be dropped.
		  * @public
		  */
		 None : "None"
	 };
	 DataType.registerEnum("sap.ui.core.dnd.DropEffect", thisLib.dnd.DropEffect);

	 thisLib.mvc = thisLib.mvc || {};

	 /**
	  * Defines the selection mode of the menu items.
	  *
	  * @enum {string}
	  * @public
	  * @name sap.ui.core.ItemSelectionMode
	  * @since 1.127.0
	  */
	 thisLib.ItemSelectionMode = {

		 /**
		  * No selection mode.
		  * @public
		  */
		 None : "None",

		 /**
		  * Single selection mode (only one menu item can be selected).
		  * @public
		  */
		 SingleSelect : "SingleSelect",

		 /**
		  * Multi selection mode (more than one menu item can be selected).
		  * @public
		  */
		 MultiSelect : "MultiSelect"

	 };
	 DataType.registerEnum("sap.ui.core.ItemSelectionMode", thisLib.ItemSelectionMode);

	 /**
	  * Specifies possible message types.
	  *
	  * @enum {string}
	  * @public
	  * @name sap.ui.core.MessageType
	  * @borrows module:sap/ui/core/message/MessageType.Information as Information
	  * @borrows module:sap/ui/core/message/MessageType.Error as Error
	  * @borrows module:sap/ui/core/message/MessageType.Warning as Warning
	  * @borrows module:sap/ui/core/message/MessageType.Success as Success
	  * @borrows module:sap/ui/core/message/MessageType.None as None
	  */
	 thisLib.MessageType = MessageType;

	 DataType.registerEnum("sap.ui.core.MessageType", thisLib.MessageType);

	 /**
	  * Specifies possible view types.
	  *
	  * @enum {string}
	  * @public
	  * @alias sap.ui.core.mvc.ViewType
	  */
	 thisLib.mvc.ViewType = ViewType;

	 thisLib.routing = thisLib.routing || {};

	 /**
	  * Enumeration for different HistoryDirections.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.routing.HistoryDirection = {

		 /**
		  * The page has already been navigated to and it was the successor of the previous page.
		  * @public
		  */
		 Forwards : "Forwards",

		 /**
		  * The page has already been navigated to and it was the predecessor of the previous page.
		  * @public
		  */
		 Backwards : "Backwards",

		 /**
		  * A new entry is added to the history.
		  * @public
		  */
		 NewEntry : "NewEntry",

		 /**
		  * A navigation took place, but it could be any of the other three states.
		  * @public
		  */
		 Unknown : "Unknown"

	 };

	 /**
	  * Enumeration for different lifecycle behaviors of components created by the
	  * <code>ComponentContainer</code>.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.ComponentLifecycle =  {

		 /**
		  * Legacy lifecycle means that the <code>ComponentContainer</code> takes care
		  * to destroy the component which is associated with the
		  * <code>ComponentContainer</code> once the <code>ComponentContainer</code> is destroyed,
		  * but not when a new component is associated.
		  * @public
		  */
		 Legacy : "Legacy",

		 /**
		  * Application managed lifecycle means that the application takes care
		  * to destroy the components associated with the <code>ComponentContainer</code>.
		  * @public
		  */
		 Application : "Application",

		 /**
		  * Container managed lifecycle means that the <code>ComponentContainer</code> takes
		  * care to destroy the components associated with the <code>ComponentContainer</code>
		  * once the <code>ComponentContainer</code> is destroyed or a new component is associated.
		  * @public
		  */
		 Container : "Container"

	 };
	 DataType.registerEnum("sap.ui.core.ComponentLifecycle", thisLib.ComponentLifecycle);

	 /**
	  * Enumeration for different mode behaviors of the <code>InvisibleMessage</code>.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.78
	  */
	 thisLib.InvisibleMessageMode =  {

		 /**
		  * Indicates that updates to the region should be presented at the next graceful opportunity,
		  * such as at the end of reading the current sentence, or when the user pauses typing.
		  * @public
		  */
		 Polite : "Polite",

		 /**
		  * Indicates that updates to the region have the highest priority and should be presented to the user immediately.
		  * @public
		  */
		 Assertive : "Assertive"

	 };
	 DataType.registerEnum("sap.ui.core.InvisibleMessageMode", thisLib.InvisibleMessageMode);

	 return thisLib;
	});
