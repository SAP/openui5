/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.commons.
 */
sap.ui.define(['sap/ui/base/DataType', 'sap/base/util/ObjectPath',
	'sap/ui/core/library', // library dependency
	'sap/ui/layout/library', // library dependency
	'sap/ui/unified/library'], // library dependency
	function(DataType, ObjectPath) {

	"use strict";

	/**
	 * Common basic controls, mainly intended for desktop scenarios
	 *
	 * @namespace
	 * @alias sap.ui.commons
	 * @author SAP SE
	 * @version ${version}
	 * @since 0.8
	 * @public
	 * @deprecated as of version 1.38
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.ui.commons",
		version: "${version}",
		dependencies : ["sap.ui.core","sap.ui.layout","sap.ui.unified"],
		types: [
			"sap.ui.commons.ButtonStyle",
			"sap.ui.commons.HorizontalDividerHeight",
			"sap.ui.commons.HorizontalDividerType",
			"sap.ui.commons.LabelDesign",
			"sap.ui.commons.MenuBarDesign",
			"sap.ui.commons.MessageType",
			"sap.ui.commons.PaginatorEvent",
			"sap.ui.commons.RatingIndicatorVisualMode",
			"sap.ui.commons.RowRepeaterDesign",
			"sap.ui.commons.SplitterSize",
			"sap.ui.commons.TextViewColor",
			"sap.ui.commons.TextViewDesign",
			"sap.ui.commons.TitleLevel",
			"sap.ui.commons.ToolbarDesign",
			"sap.ui.commons.ToolbarSeparatorDesign",
			"sap.ui.commons.TreeSelectionMode",
			"sap.ui.commons.TriStateCheckBoxState",
			"sap.ui.commons.enums.AreaDesign",
			"sap.ui.commons.enums.BorderDesign",
			"sap.ui.commons.enums.Orientation",
			"sap.ui.commons.form.GridElementCells",
			"sap.ui.commons.form.SimpleFormLayout",
			"sap.ui.commons.layout.BackgroundDesign",
			"sap.ui.commons.layout.BorderLayoutAreaTypes",
			"sap.ui.commons.layout.HAlign",
			"sap.ui.commons.layout.Padding",
			"sap.ui.commons.layout.Separation",
			"sap.ui.commons.layout.VAlign",
			"sap.ui.commons.ColorPickerMode"
		],
		interfaces: [
			"sap.ui.commons.FormattedTextViewControl",
			"sap.ui.commons.ToolbarItem"
		],
		controls: [
			"sap.ui.commons.Accordion",
			"sap.ui.commons.ApplicationHeader",
			"sap.ui.commons.AutoComplete",
			"sap.ui.commons.Button",
			"sap.ui.commons.Callout",
			"sap.ui.commons.CalloutBase",
			"sap.ui.commons.Carousel",
			"sap.ui.commons.CheckBox",
			"sap.ui.commons.ColorPicker",
			"sap.ui.commons.ComboBox",
			"sap.ui.commons.DatePicker",
			"sap.ui.commons.Dialog",
			"sap.ui.commons.DropdownBox",
			"sap.ui.commons.FileUploader",
			"sap.ui.commons.FormattedTextView",
			"sap.ui.commons.HorizontalDivider",
			"sap.ui.commons.Image",
			"sap.ui.commons.ImageMap",
			"sap.ui.commons.InPlaceEdit",
			"sap.ui.commons.Label",
			"sap.ui.commons.Link",
			"sap.ui.commons.ListBox",
			"sap.ui.commons.Menu",
			"sap.ui.commons.MenuBar",
			"sap.ui.commons.MenuButton",
			"sap.ui.commons.Message",
			"sap.ui.commons.MessageBar",
			"sap.ui.commons.MessageList",
			"sap.ui.commons.MessageToast",
			"sap.ui.commons.Paginator",
			"sap.ui.commons.Panel",
			"sap.ui.commons.PasswordField",
			"sap.ui.commons.ProgressIndicator",
			"sap.ui.commons.RadioButton",
			"sap.ui.commons.RadioButtonGroup",
			"sap.ui.commons.RangeSlider",
			"sap.ui.commons.RatingIndicator",
			"sap.ui.commons.ResponsiveContainer",
			"sap.ui.commons.RichTooltip",
			"sap.ui.commons.RoadMap",
			"sap.ui.commons.RowRepeater",
			"sap.ui.commons.SearchField",
			"sap.ui.commons.SegmentedButton",
			"sap.ui.commons.Slider",
			"sap.ui.commons.Splitter",
			"sap.ui.commons.Tab",
			"sap.ui.commons.TabStrip",
			"sap.ui.commons.TextArea",
			"sap.ui.commons.TextField",
			"sap.ui.commons.TextView",
			"sap.ui.commons.ToggleButton",
			"sap.ui.commons.Toolbar",
			"sap.ui.commons.Tree",
			"sap.ui.commons.TriStateCheckBox",
			"sap.ui.commons.ValueHelpField",
			"sap.ui.commons.form.Form",
			"sap.ui.commons.form.FormLayout",
			"sap.ui.commons.form.GridLayout",
			"sap.ui.commons.form.ResponsiveLayout",
			"sap.ui.commons.form.SimpleForm",
			"sap.ui.commons.layout.AbsoluteLayout",
			"sap.ui.commons.layout.BorderLayout",
			"sap.ui.commons.layout.HorizontalLayout",
			"sap.ui.commons.layout.MatrixLayout",
			"sap.ui.commons.layout.ResponsiveFlowLayout",
			"sap.ui.commons.layout.VerticalLayout"
		],
		elements: [
			"sap.ui.commons.AccordionSection",
			"sap.ui.commons.Area",
			"sap.ui.commons.FileUploaderParameter",
			"sap.ui.commons.MenuItem",
			"sap.ui.commons.MenuItemBase",
			"sap.ui.commons.MenuTextFieldItem",
			"sap.ui.commons.ResponsiveContainerRange",
			"sap.ui.commons.RoadMapStep",
			"sap.ui.commons.RowRepeaterFilter",
			"sap.ui.commons.RowRepeaterSorter",
			"sap.ui.commons.SearchProvider",
			"sap.ui.commons.Title",
			"sap.ui.commons.ToolbarSeparator",
			"sap.ui.commons.TreeNode",
			"sap.ui.commons.form.FormContainer",
			"sap.ui.commons.form.FormElement",
			"sap.ui.commons.form.GridContainerData",
			"sap.ui.commons.form.GridElementData",
			"sap.ui.commons.layout.BorderLayoutArea",
			"sap.ui.commons.layout.MatrixLayoutCell",
			"sap.ui.commons.layout.MatrixLayoutRow",
			"sap.ui.commons.layout.PositionContainer",
			"sap.ui.commons.layout.ResponsiveFlowLayoutData"
		]
	});


	/**
	 * different styles for a button.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.ButtonStyle = {

		/**
		 * Button is emphasized.
		 * @public
		 */
		Emph : "Emph",

		/**
		 * Accept button (normally green).
		 * @public
		 */
		Accept : "Accept",

		/**
		 * Reject button (normally red).
		 * @public
		 */
		Reject : "Reject",

		/**
		 * default style (no special styling).
		 * @public
		 */
		Default : "Default"

	};


	/**
	 * Different styles for a ColorPicker.
	 *
	 * This enum is an alias for {@link sap.ui.unified.ColorPickerMode} and was only kept
	 * for compatibility reasons. Please switch to the {@link sap.ui.unified.ColorPicker} API.
	 *
	 * @typedef {sap.ui.unified.ColorPickerMode}
	 * @public
	 * @deprecated Since version 1.48.0. Use {@link sap.ui.unified.ColorPickerMode} instead.
	 */
	thisLib.ColorPickerMode = sap.ui.unified.ColorPickerMode;

	/**
	 * Marker interface for common controls which are suitable for use within a FormattedTextView.
	 *
	 * @name sap.ui.commons.FormattedTextViewControl
	 * @interface
	 * @public
	 * @deprecated as of version 1.38
	 */


	/**
	 * Enumeration of possible HorizontalDivider height settings.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.HorizontalDividerHeight = {

		/**
		 * Divider gets no top and bottom margin.
		 * @public
		 */
		Ruleheight : "Ruleheight",

		/**
		 * Divider gets a small top and bottom margin.
		 * @public
		 */
		Small : "Small",

		/**
		 * Divider gets a medium top and bottom margin.
		 * @public
		 */
		Medium : "Medium",

		/**
		 * Divider gets a large top and bottom margin.
		 * @public
		 */
		Large : "Large"

	};


	/**
	 * Enumeration of possible HorizontalDivider types.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.HorizontalDividerType = {

		/**
		 * Type Area
		 * @public
		 */
		Area : "Area",

		/**
		 * Type Page
		 * @public
		 */
		Page : "Page"

	};


	/**
	 * Available label display modes.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.LabelDesign = {

		/**
		 * Displays the label in bold.
		 * @public
		 */
		Bold : "Bold",

		/**
		 * Displays the label in normal mode.
		 * @public
		 */
		Standard : "Standard"

	};


	/**
	 * Determines the visual design of a MenuBar. The feature might be not supported by all themes.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.MenuBarDesign = {

		/**
		 * The MenuBar appears in standard design.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * The MenuBar appears in header design.
		 * @public
		 */
		Header : "Header"

	};


	/**
	 * [Enter description for MessageType]
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.MessageType = {

		/**
		 * Error message
		 * @public
		 */
		Error : "Error",

		/**
		 * Warning message
		 * @public
		 */
		Warning : "Warning",

		/**
		 * Successful message
		 * @public
		 */
		Success : "Success"

	};


	/**
	 * Distinct paginator event types
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.PaginatorEvent = {

		/**
		 * First page event
		 * @public
		 */
		First : "First",

		/**
		 * Previous page event
		 * @public
		 */
		Previous : "Previous",

		/**
		 * Go to page event
		 * @public
		 */
		Goto : "Goto",

		/**
		 * Next page event
		 * @public
		 */
		Next : "Next",

		/**
		 * Last page event
		 * @public
		 */
		Last : "Last"

	};


	/**
	 * Possible values for the visualization of float values in the RatingIndicator Control.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.RatingIndicatorVisualMode = {

		/**
		 * Values are rounded to the nearest integer value (e.g. 1.7 -> 2).
		 * @public
		 */
		Full : "Full",

		/**
		 * Values are rounded to the nearest half value (e.g. 1.7 -> 1.5).
		 * @public
		 */
		Half : "Half",

		/**
		 * Values are not rounded.
		 * @public
		 */
		Continuous : "Continuous"

	};


	/**
	 * Determines the visual design of a RowRepeater.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.RowRepeaterDesign = {

		/**
		 * The RowRepeater header and footer elements, as well as the row container background, appear solid.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * The RowRepeater header and footer elements, as well as the row container background, appear transparent.
		 * @public
		 */
		Transparent : "Transparent",

		/**
		 * The RowRepeater will be displayed without header, toolbar or footer. Background will be transparent.
		 * @public
		 */
		BareShell : "BareShell"

	};


	/**
	 * @classdesc A string type that represents subset of CSS size values. For the Splitter only px and % are allowed.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.SplitterSize = DataType.createType('sap.ui.commons.SplitterSize', {
	    isValid : function(vValue) {
	      return /^((0*|([0-9]+|[0-9]*\.[0-9]+)([pP][xX]|%)))$/.test(vValue);
	    }

	  },
	  DataType.getType('string')
	);


	/**
	 * Semantic Colors of a text.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.TextViewColor = {

		/**
		 * Default color
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
		Critical : "Critical"

	};


	/**
	 * Designs for TextView.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.TextViewDesign = {

		/**
		 * Displays the text in standard letters.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Displays the text in bold letters
		 * @public
		 */
		Bold : "Bold",

		/**
		 * Displays the text in header 1 letters.
		 * @public
		 */
		H1 : "H1",

		/**
		 * Displays the text in header 2 letters.
		 * @public
		 */
		H2 : "H2",

		/**
		 * Displays the text in header 3 letters.
		 * @public
		 */
		H3 : "H3",

		/**
		 * Displays the text in header 4 letters.
		 * @public
		 */
		H4 : "H4",

		/**
		 * Displays the text in header 5 letters.
		 * @public
		 */
		H5 : "H5",

		/**
		 * Displays the text in header 6 letters.
		 * @public
		 */
		H6 : "H6",

		/**
		 * Displays the text in italic letters
		 * @public
		 */
		Italic : "Italic",

		/**
		 * Displays the text in smaller letters.
		 * @public
		 */
		Small : "Small",

		/**
		 * Displays the text in monospace letters.
		 * @public
		 */
		Monospace : "Monospace",

		/**
		 * underlined Text
		 * @public
		 */
		Underline : "Underline"

	};


	/**
	 * Level of a title.
	 *
	 * This is an alias for {@link sap.ui.core.TitleLevel} and only kept for compatibility reasons.
	 *
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0. Use {@link sap.ui.core.TitleLevel} instead.
	 * @public
	 * @typedef {sap.ui.core.TitleLevel}
	 */
	thisLib.TitleLevel = sap.ui.core.TitleLevel;


	/**
	 * Determines the visual design of a Toolbar.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.ToolbarDesign = {

		/**
		 * The toolbar elements such as buttons for example have their normal visual design, and the toolbar appears solid.
		 * The feature might be not supported by all themes.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * The controls included in the toolbar have a normal visual design where the toolbar appears transparent.
		 * The feature might be not supported by all themes.
		 *
		 * @public
		 */
		Transparent : "Transparent",

		/**
		 * The included controls have a very light appearance. The feature might be not supported by all themes.
		 * @public
		 */
		Flat : "Flat"

	};

	/**
	 * Marker interface for common controls which are suitable for use within a toolbar.
	 * The most prominent example of a toolbar item is a button which is mostly used with
	 * an icon instead of a text caption.
	 *
	 * Toolbar items must have a fixed height compatible with the toolbar being
	 * a single horizontal row. They can refer to the toolbar's marker class
	 * "sapUiTb" to adjust their own theming when used inside a toolbar.
	 *
	 * @name sap.ui.commons.ToolbarItem
	 * @interface
	 * @public
	 * @deprecated as of version 1.38
	 */


	/**
	 * Design of the Toolbar Separator.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.ToolbarSeparatorDesign = {

		/**
		 * Standard Separator between controls
		 * @public
		 */
		Standard : "Standard",

		/**
		 * 100% height Separator before and after specific controls
		 * @public
		 */
		FullHeight : "FullHeight"

	};


	/**
	 * Selection mode of the tree
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.TreeSelectionMode = {

		/**
		 * Select multiple rows at a time.
		 * @public
		 */
		Multi : "Multi",

		/**
		 * Select one row at a time.
		 * @public
		 */
		Single : "Single",

		/**
		 * No rows can be selected.
		 * @public
		 */
		None : "None",

		/**
		 * Behavior of the former Tree. It is possible to select a plurality of nodes via the API.
		 * @public
		 */
		Legacy : "Legacy"

	};


	/**
	 * States for TriStateCheckBox
	 *
	 * @enum {string}
	 * @public
	 * @since 1.7.2
	 * @deprecated as of version 1.38
	 */
	thisLib.TriStateCheckBoxState = {

		/**
		 * unchecked, default value for tri-state checkbox
		 * @public
		 */
		Unchecked : "Unchecked",

		/**
		 * mixed state for tri-state checkbox
		 * @public
		 */
		Mixed : "Mixed",

		/**
		 * checked value for tri-state checkbox
		 * @public
		 */
		Checked : "Checked"

	};

	/**
	 * @namespace
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.enums = thisLib.enums || {};

	/**
	 * Value set for the background design of areas
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.enums.AreaDesign = {

		/**
		 * Shows the area in a plain look
		 * @public
		 */
		Plain : "Plain",

		/**
		 * Shows the label in a filled look
		 * @public
		 */
		Fill : "Fill",

		/**
		 * Shows the background as transparent
		 * @public
		 */
		Transparent : "Transparent"

	};


	/**
	 * Value set for the border design of areas
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.enums.BorderDesign = {

		/**
		 * Draws the border as a box around the area
		 * @public
		 */
		Box : "Box",

		/**
		 * Suppresses the border
		 * @public
		 */
		None : "None"

	};


	/**
	 * Orientation of a UI element
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.enums.Orientation = {

		/**
		 * Horizontal orientation
		 * @public
		 */
		horizontal : "horizontal",

		/**
		 * Vertical orientation
		 * @public
		 */
		vertical : "vertical"

	};

	/**
	 * @namespace
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.form = thisLib.form || {};

	/**
	 * A string that defines the number of used cells in a GridLayout.
	 *
	 * This is an alias for {@link sap.ui.layout.form.GridElementCells} and only kept for compatibility reasons.
	 *
	 * @deprecated Since version 1.16.0. Use {@link sap.ui.layout.form.GridElementCells} instead.
	 * @typedef {sap.ui.layout.form.GridElementCells}
	 */
	thisLib.form.GridElementCells = sap.ui.layout.form.GridElementCells;


	/**
	 * Available FormLayouts used for the SimpleForm.
	 *
	 * This is an alias for {@link sap.ui.layout.form.SimpleFormLayout} and only kept for compatibility reasons.
	 *
	 * @deprecated Since version 1.16.0. Use {@link sap.ui.layout.form.SimpleFormLayout} instead.
	 * @public
	 * @typedef {sap.ui.layout.form.SimpleFormLayout}
	 */
	thisLib.form.SimpleFormLayout = sap.ui.layout.form.SimpleFormLayout;

	/**
	 * @namespace
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout = thisLib.layout || {};

	/**
	 * Background design (i.e. color), e.g. of a layout cell.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout.BackgroundDesign = {

		/**
		 *
		 * A background design suitable for borders.
		 *
		 * @public
		 */
		Border : "Border",

		/**
		 *
		 * An opaque background design that looks dark filled.
		 *
		 * @public
		 */
		Fill1 : "Fill1",

		/**
		 *
		 * An opaque background design that looks medium filled.
		 *
		 * @public
		 */
		Fill2 : "Fill2",

		/**
		 *
		 * An opaque background design that looks light filled.
		 *
		 * @public
		 */
		Fill3 : "Fill3",

		/**
		 *
		 * A background design suitable for headers.
		 *
		 * @public
		 */
		Header : "Header",

		/**
		 *
		 * A plain but opaque background design.
		 *
		 * @public
		 */
		Plain : "Plain",

		/**
		 *
		 * A transparent background.
		 *
		 * @public
		 */
		Transparent : "Transparent"

	};


	/**
	 * The type (=position) of a BorderLayoutArea
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout.BorderLayoutAreaTypes = {

		/**
		 * Value to identify the top area.
		 * @public
		 */
		top : "top",

		/**
		 * Value to identify the begin area.
		 * @public
		 */
		begin : "begin",

		/**
		 * Value to identify the center area.
		 * @public
		 */
		center : "center",

		/**
		 * Value to identify the end area.
		 * @public
		 */
		end : "end",

		/**
		 * Value to identify the bottom area.
		 * @public
		 */
		bottom : "bottom"

	};


	/**
	 * Horizontal alignment, e.g. of a layout cell's content within the cell's borders.
	 * Note that some values depend on the current locale's writing direction while
	 * others do not.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout.HAlign = {

		/**
		 *
		 * Aligned towards the beginning of a line, in the current locale's writing direction.
		 *
		 * @public
		 */
		Begin : "Begin",

		/**
		 *
		 * Horizontally centered.
		 *
		 * @public
		 */
		Center : "Center",

		/**
		 *
		 * Aligned towards the end of a line, in the current locale's writing direction.
		 *
		 * @public
		 */
		End : "End",

		/**
		 *
		 * Left aligned, regardless of the current locale's writing direction.
		 *
		 * @public
		 */
		Left : "Left",

		/**
		 *
		 * Right aligned, regardless of the current locale's writing direction.
		 *
		 * @public
		 */
		Right : "Right"

	};


	/**
	 * Padding, e.g. of a layout cell's content within the cell's borders.
	 * Note that all options except "None" include a padding of 2px at the top and
	 * bottom, and differ only in the presence of a 4px padding towards the beginning
	 * or end of a line, in the current locale's writing direction.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout.Padding = {

		/**
		 *
		 * No padding at all.
		 *
		 * @public
		 */
		None : "None",

		/**
		 *
		 * Top and bottom padding of 2px.
		 * Padding of 4px towards the beginning of a line, in the current locale's
		 * writing direction, but none towards its end.
		 *
		 * @public
		 */
		Begin : "Begin",

		/**
		 *
		 * Top and bottom padding of 2px.
		 * Padding of 4px towards the end of a line, in the current locale's
		 * writing direction, but none towards its beginning.
		 *
		 * @public
		 */
		End : "End",

		/**
		 *
		 * Top and bottom padding of 2px.
		 * Padding of 4px towards both the beginning and end of a line.
		 *
		 * @public
		 */
		Both : "Both",

		/**
		 *
		 * Top and bottom padding of 2px.
		 * No padding towards neither the beginning nor end of a line.
		 *
		 * @public
		 */
		Neither : "Neither"

	};


	/**
	 * Separation, e.g. of a layout cell from its neighbor, via a vertical gutter of
	 * defined width, with or without a vertical line in its middle.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout.Separation = {

		/**
		 *
		 * No gutter at all (0px), and without a vertical line, of course.
		 *
		 * @public
		 */
		None : "None",

		/**
		 *
		 * A small (17px) vertical gutter without a vertical line.
		 *
		 * @public
		 */
		Small : "Small",

		/**
		 *
		 * A small (17px) vertical gutter with a vertical line in its middle.
		 *
		 * @public
		 */
		SmallWithLine : "SmallWithLine",

		/**
		 *
		 * A medium (31px) vertical gutter without a vertical line.
		 *
		 * @public
		 */
		Medium : "Medium",

		/**
		 *
		 * A medium (31px) vertical gutter with a vertical line in its middle.
		 *
		 * @public
		 */
		MediumWithLine : "MediumWithLine",

		/**
		 *
		 * A large (63px) vertical gutter without a vertical line.
		 *
		 * @public
		 */
		Large : "Large",

		/**
		 *
		 * A large (63px) vertical gutter with a vertical line in its middle.
		 *
		 * @public
		 */
		LargeWithLine : "LargeWithLine"

	};


	/**
	 * Vertical alignment, e.g. of a layout cell's content within the cell's borders.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated as of version 1.38
	 */
	thisLib.layout.VAlign = {

		/**
		 *
		 * Aligned at the bottom.
		 *
		 * @public
		 */
		Bottom : "Bottom",

		/**
		 *
		 * Vertically centered.
		 *
		 * @public
		 */
		Middle : "Middle",

		/**
		 *
		 * Aligned at the top.
		 *
		 * @public
		 */
		Top : "Top"

	};

	// lazy imports for MessageBox
	sap.ui.lazyRequire("sap.ui.commons.MessageBox", "alert confirm show");

	// lazy imports for MenuItemBase which no longer is a control on its own
	sap.ui.lazyRequire("sap.ui.commons.MenuItemBase", "new extend getMetadata");

	thisLib.Orientation = {
		// Map the Orientation enum to new enums in core
		"Vertical"   : sap.ui.core.Orientation.Vertical,
		"Horizontal" : sap.ui.core.Orientation.Horizontal,
		// Map the Orientation enum to new enums with uppercase
		"vertical"   : sap.ui.core.Orientation.Vertical,
		"horizontal" : sap.ui.core.Orientation.Horizontal
	};

	//implement table helper factory with m controls
	//possible is set before layout lib is loaded.
	var oTableHelper = ObjectPath.get("sap.ui.table.TableHelper");
	if (!oTableHelper || !oTableHelper.bFinal) {
		ObjectPath.set("sap.ui.table.TableHelper", {
			createLabel: function(mConfig){
				return new sap.ui.commons.Label(mConfig);
			},
			createTextView: function(mConfig){
				if (mConfig && !mConfig.wrapping) {
					mConfig.wrapping = false;
				}
				return new sap.ui.commons.TextView(mConfig);
			},
			addTableClass: function() { return "sapUiTableCommons"; },
			bFinal: false /* to allow mobile to overwrite  */
		});
	}

	if (!sap.ui.layout.GridHelper || !sap.ui.layout.GridHelper.bFinal) {
		sap.ui.layout.GridHelper = {
			getLibrarySpecificClass: function () {
				return "sapUiRespGridOverflowHidden";
			},
			bFinal: false /* to allow mobile to overwrite  */
		};
	}

	return thisLib;

});
