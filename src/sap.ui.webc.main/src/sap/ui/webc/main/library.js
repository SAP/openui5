/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.webc.main
 */
sap.ui.define([
		"sap/ui/webc/common/library",
		"sap/ui/core/Lib",
		"./thirdparty/Assets",
		"./library.config"
	], // library dependency
	function(commonLibrary, Library) {

		"use strict";

		/**
		 * SAPUI5 library with controls based on UI5 Web Components
		 *
		 * @namespace
		 * @alias sap.ui.webc.main
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		var thisLib = Library.init({
			name: "sap.ui.webc.main",
			version: "${version}",
			dependencies: ["sap.ui.core", "sap.ui.webc.common"],
			noLibraryCSS: true,
			designtime: "sap/ui/webc/main/designtime/library.designtime",
			interfaces: [
				"sap.ui.webc.main.IAvatar",
				"sap.ui.webc.main.IBreadcrumbsItem",
				"sap.ui.webc.main.IButton",
				"sap.ui.webc.main.ICalendarDate",
				"sap.ui.webc.main.ICardHeader",
				"sap.ui.webc.main.IColorPaletteItem",
				"sap.ui.webc.main.IComboBoxItem",
				"sap.ui.webc.main.IIcon",
				"sap.ui.webc.main.IInput",
				"sap.ui.webc.main.IInputSuggestionItem",
				"sap.ui.webc.main.IListItem",
				"sap.ui.webc.main.IMenuItem",
				"sap.ui.webc.main.IMultiComboBoxItem",
				"sap.ui.webc.main.ISegmentedButtonItem",
				"sap.ui.webc.main.ISelectMenuOption",
				"sap.ui.webc.main.ISelectOption",
				"sap.ui.webc.main.ITab",
				"sap.ui.webc.main.ITableCell",
				"sap.ui.webc.main.ITableColumn",
				"sap.ui.webc.main.ITableRow",
				"sap.ui.webc.main.IToken",
				"sap.ui.webc.main.IToolbarItem",
				"sap.ui.webc.main.IToolbarSelectOption",
				"sap.ui.webc.main.ITreeItem"
			],
			types: [
				"sap.ui.webc.main.AvatarColorScheme",
				"sap.ui.webc.main.AvatarGroupType",
				"sap.ui.webc.main.AvatarShape",
				"sap.ui.webc.main.AvatarSize",
				"sap.ui.webc.main.BackgroundDesign",
				"sap.ui.webc.main.BorderDesign",
				"sap.ui.webc.main.BreadcrumbsDesign",
				"sap.ui.webc.main.BreadcrumbsSeparatorStyle",
				"sap.ui.webc.main.BusyIndicatorSize",
				"sap.ui.webc.main.ButtonDesign",
				"sap.ui.webc.main.ButtonType",
				"sap.ui.webc.main.CalendarSelectionMode",
				"sap.ui.webc.main.CarouselArrowsPlacement",
				"sap.ui.webc.main.CarouselPageIndicatorStyle",
				"sap.ui.webc.main.ComboBoxFilter",
				"sap.ui.webc.main.HasPopup",
				"sap.ui.webc.main.IconDesign",
				"sap.ui.webc.main.InputType",
				"sap.ui.webc.main.LinkDesign",
				"sap.ui.webc.main.ListGrowingMode",
				"sap.ui.webc.main.ListItemType",
				"sap.ui.webc.main.ListMode",
				"sap.ui.webc.main.ListSeparators",
				"sap.ui.webc.main.MessageStripDesign",
				"sap.ui.webc.main.PanelAccessibleRole",
				"sap.ui.webc.main.PopoverHorizontalAlign",
				"sap.ui.webc.main.PopoverPlacementType",
				"sap.ui.webc.main.PopoverVerticalAlign",
				"sap.ui.webc.main.PopupAccessibleRole",
				"sap.ui.webc.main.Priority",
				"sap.ui.webc.main.SegmentedButtonMode",
				"sap.ui.webc.main.SemanticColor",
				"sap.ui.webc.main.SwitchDesign",
				"sap.ui.webc.main.TabContainerBackgroundDesign",
				"sap.ui.webc.main.TabLayout",
				"sap.ui.webc.main.TableColumnPopinDisplay",
				"sap.ui.webc.main.TableGrowingMode",
				"sap.ui.webc.main.TableMode",
				"sap.ui.webc.main.TableRowType",
				"sap.ui.webc.main.TabsOverflowMode",
				"sap.ui.webc.main.TitleLevel",
				"sap.ui.webc.main.ToastPlacement",
				"sap.ui.webc.main.ToolbarAlign",
				"sap.ui.webc.main.ToolbarItemOverflowBehavior",
				"sap.ui.webc.main.WrappingType"
			],
			controls: [
				"sap.ui.webc.main.Avatar",
				"sap.ui.webc.main.AvatarGroup",
				"sap.ui.webc.main.Badge",
				"sap.ui.webc.main.Breadcrumbs",
				"sap.ui.webc.main.BreadcrumbsItem",
				"sap.ui.webc.main.BusyIndicator",
				"sap.ui.webc.main.Button",
				"sap.ui.webc.main.Calendar",
				"sap.ui.webc.main.CalendarDate",
				"sap.ui.webc.main.Card",
				"sap.ui.webc.main.CardHeader",
				"sap.ui.webc.main.Carousel",
				"sap.ui.webc.main.CheckBox",
				"sap.ui.webc.main.ColorPalette",
				"sap.ui.webc.main.ColorPaletteItem",
				"sap.ui.webc.main.ColorPalettePopover",
				"sap.ui.webc.main.ColorPicker",
				"sap.ui.webc.main.ComboBox",
				"sap.ui.webc.main.ComboBoxGroupItem",
				"sap.ui.webc.main.ComboBoxItem",
				"sap.ui.webc.main.CustomListItem",
				"sap.ui.webc.main.DatePicker",
				"sap.ui.webc.main.DateRangePicker",
				"sap.ui.webc.main.DateTimePicker",
				"sap.ui.webc.main.Dialog",
				"sap.ui.webc.main.FileUploader",
				"sap.ui.webc.main.GroupHeaderListItem",
				"sap.ui.webc.main.Icon",
				"sap.ui.webc.main.Input",
				"sap.ui.webc.main.Label",
				"sap.ui.webc.main.Link",
				"sap.ui.webc.main.List",
				"sap.ui.webc.main.Menu",
				"sap.ui.webc.main.MenuItem",
				"sap.ui.webc.main.MessageStrip",
				"sap.ui.webc.main.MultiComboBox",
				"sap.ui.webc.main.MultiComboBoxGroupItem",
				"sap.ui.webc.main.MultiComboBoxItem",
				"sap.ui.webc.main.MultiInput",
				"sap.ui.webc.main.Option",
				"sap.ui.webc.main.Panel",
				"sap.ui.webc.main.Popover",
				"sap.ui.webc.main.ProgressIndicator",
				"sap.ui.webc.main.RadioButton",
				"sap.ui.webc.main.RangeSlider",
				"sap.ui.webc.main.RatingIndicator",
				"sap.ui.webc.main.ResponsivePopover",
				"sap.ui.webc.main.SegmentedButton",
				"sap.ui.webc.main.SegmentedButtonItem",
				"sap.ui.webc.main.Select",
				"sap.ui.webc.main.SelectMenu",
				"sap.ui.webc.main.SelectMenuOption",
				"sap.ui.webc.main.Slider",
				"sap.ui.webc.main.SplitButton",
				"sap.ui.webc.main.StandardListItem",
				"sap.ui.webc.main.StepInput",
				"sap.ui.webc.main.SuggestionGroupItem",
				"sap.ui.webc.main.SuggestionItem",
				"sap.ui.webc.main.Switch",
				"sap.ui.webc.main.Tab",
				"sap.ui.webc.main.TabContainer",
				"sap.ui.webc.main.Table",
				"sap.ui.webc.main.TableCell",
				"sap.ui.webc.main.TableColumn",
				"sap.ui.webc.main.TableGroupRow",
				"sap.ui.webc.main.TableRow",
				"sap.ui.webc.main.TabSeparator",
				"sap.ui.webc.main.TextArea",
				"sap.ui.webc.main.TimePicker",
				"sap.ui.webc.main.Title",
				"sap.ui.webc.main.Toast",
				"sap.ui.webc.main.ToggleButton",
				"sap.ui.webc.main.Token",
				"sap.ui.webc.main.Toolbar",
				"sap.ui.webc.main.ToolbarButton",
				"sap.ui.webc.main.ToolbarSelect",
				"sap.ui.webc.main.ToolbarSelectOption",
				"sap.ui.webc.main.ToolbarSeparator",
				"sap.ui.webc.main.ToolbarSpacer",
				"sap.ui.webc.main.Tree",
				"sap.ui.webc.main.TreeItem",
				"sap.ui.webc.main.TreeItemCustom"
			],
			elements: [],
			extensions: {
				flChangeHandlers: {
					"sap.ui.webc.main.Avatar": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Badge": "sap/ui/webc/main/flexibility/Badge",
					"sap.ui.webc.main.BreadcrumbsItem": "sap/ui/webc/main/flexibility/BreadcrumbsItem",
					"sap.ui.webc.main.BusyIndicator": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Button": "sap/ui/webc/main/flexibility/Button",
					"sap.ui.webc.main.Card": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Carousel": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.CheckBox": "sap/ui/webc/main/flexibility/CheckBox",
					"sap.ui.webc.main.CustomListItem": {
						"hideControl": "default",
						"unhideControl": "default",
						"moveControls": "default"
					},
					"sap.ui.webc.main.DatePicker": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.DateTimePicker": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Dialog": "sap/ui/webc/main/flexibility/Dialog",
					"sap.ui.webc.main.Input": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Label": "sap/ui/webc/main/flexibility/Label",
					"sap.ui.webc.main.Link": "sap/ui/webc/main/flexibility/Link",
					"sap.ui.webc.main.List": "sap/ui/webc/main/flexibility/List",
					"sap.ui.webc.main.MultiInput": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Panel": "sap/ui/webc/main/flexibility/Panel",
					"sap.ui.webc.main.Popover": "sap/ui/webc/main/flexibility/Popover",
					"sap.ui.webc.main.RadioButton": "sap/ui/webc/main/flexibility/RadioButton",
					"sap.ui.webc.main.RangeSlider": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.RatingIndicator": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.ResponsivePopover": "sap/ui/webc/main/flexibility/ResponsivePopover",
					"sap.ui.webc.main.Slider": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.StandardListItem": "sap/ui/webc/main/flexibility/StandardListItem",
					"sap.ui.webc.main.Tab": "sap/ui/webc/main/flexibility/Tab",
					"sap.ui.webc.main.TabContainer": "sap/ui/webc/main/flexibility/TabContainer",
					"sap.ui.webc.main.Table": {
						"hideControl": "default",
						"unhideControl": "default"
					},
					"sap.ui.webc.main.Title": "sap/ui/webc/main/flexibility/Title"
				}
			}
		});

		/**
		 * Interface for components that represent an avatar and may be slotted in numerous higher-order components such as <code>ui5-avatar-group</code>
		 *
		 * @name sap.ui.webc.main.IAvatar
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-breadcrumbs</code> as options
		 *
		 * @name sap.ui.webc.main.IBreadcrumbsItem
		 * @interface
		 * @public
		 * @since 1.95.0
		 * @experimental Since 1.95.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be used as a button inside numerous higher-order components
		 *
		 * @name sap.ui.webc.main.IButton
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be used as dates inside <code>ui5-calendar</code>
		 *
		 * @name sap.ui.webc.main.ICalendarDate
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-card</code> as header
		 *
		 * @name sap.ui.webc.main.ICardHeader
		 * @interface
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be used inside a <code>ui5-color-palette</code> or <code>ui5-color-palette-popover</code>
		 *
		 * @name sap.ui.webc.main.IColorPaletteItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a <code>ui5-combobox</code>
		 *
		 * @name sap.ui.webc.main.IComboBoxItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that represent an icon, usable in numerous higher-order components
		 *
		 * @name sap.ui.webc.main.IIcon
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that represent an input, usable in numerous higher-order components
		 *
		 * @name sap.ui.webc.main.IInput
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that represent a suggestion item, usable in <code>ui5-input</code>
		 *
		 * @name sap.ui.webc.main.IInputSuggestionItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a <code>ui5-list</code> as items
		 *
		 * @name sap.ui.webc.main.IListItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-menu</code> as items
		 *
		 * @name sap.ui.webc.main.IMenuItem
		 * @interface
		 * @public
		 * @since 1.102.0
		 * @experimental Since 1.102.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a <code>ui5-multi-combobox</code> as items
		 *
		 * @name sap.ui.webc.main.IMultiComboBoxItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-segmented-button</code> as items
		 *
		 * @name sap.ui.webc.main.ISegmentedButtonItem
		 * @interface
		 * @public
		 * @since 1.95.0
		 * @experimental Since 1.95.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-select-menu</code> as options
		 *
		 * @name sap.ui.webc.main.ISelectMenuOption
		 * @interface
		 * @public
		 * @since 1.120.0
		 * @experimental Since 1.120.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-select</code> as options
		 *
		 * @name sap.ui.webc.main.ISelectOption
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside <code>ui5-tabcontainer</code>
		 *
		 * @name sap.ui.webc.main.ITab
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a <code>ui5-table-row</code> as cells
		 *
		 * @name sap.ui.webc.main.ITableCell
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a <code>ui5-table</code> as columns
		 *
		 * @name sap.ui.webc.main.ITableColumn
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that may be slotted inside a <code>ui5-table</code> as rows
		 *
		 * @name sap.ui.webc.main.ITableRow
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for components that represent a token and are usable in components such as <code>ui5-multi-input</code>
		 *
		 * @name sap.ui.webc.main.IToken
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for toolbar items for the purpose of <code>ui5-toolbar</code>
		 *
		 * @name sap.ui.webc.main.IToolbarItem
		 * @interface
		 * @public
		 * @since 1.120.0
		 * @experimental Since 1.120.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for toolbar select items for the purpose of <code>ui5-toolbar-select</code>
		 *
		 * @name sap.ui.webc.main.IToolbarSelectOption
		 * @interface
		 * @public
		 * @since 1.120.0
		 * @experimental Since 1.120.0 This API is experimental and might change significantly.
		 */

		/**
		 * Interface for tree items for the purpose of <code>ui5-tree</code>
		 *
		 * @name sap.ui.webc.main.ITreeItem
		 * @interface
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */

		/**
		 * Different types of AvatarColorScheme.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.AvatarColorScheme = {

			/**
			 *
			 * @public
			 */
			Accent1: "Accent1",

			/**
			 *
			 * @public
			 */
			Accent10: "Accent10",

			/**
			 *
			 * @public
			 */
			Accent2: "Accent2",

			/**
			 *
			 * @public
			 */
			Accent3: "Accent3",

			/**
			 *
			 * @public
			 */
			Accent4: "Accent4",

			/**
			 *
			 * @public
			 */
			Accent5: "Accent5",

			/**
			 *
			 * @public
			 */
			Accent6: "Accent6",

			/**
			 *
			 * @public
			 */
			Accent7: "Accent7",

			/**
			 *
			 * @public
			 */
			Accent8: "Accent8",

			/**
			 *
			 * @public
			 */
			Accent9: "Accent9",

			/**
			 *
			 * @public
			 */
			Placeholder: "Placeholder"
		};


		/**
		 * Different types of AvatarGroupType.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.AvatarGroupType = {

			/**
			 * The avatars are displayed as partially overlapped on top of each other and the entire group has one click or tap area.
			 * @public
			 */
			Group: "Group",

			/**
			 * The avatars are displayed side-by-side and each avatar has its own click or tap area.
			 * @public
			 */
			Individual: "Individual"
		};


		/**
		 * Different types of AvatarShape.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.AvatarShape = {

			/**
			 * Circular shape.
			 * @public
			 */
			Circle: "Circle",

			/**
			 * Square shape.
			 * @public
			 */
			Square: "Square"
		};


		/**
		 * Different types of AvatarSize.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.AvatarSize = {

			/**
			 * component size - 5rem font size - 2.5rem
			 * @public
			 */
			L: "L",

			/**
			 * component size - 4rem font size - 2rem
			 * @public
			 */
			M: "M",

			/**
			 * component size - 3rem font size - 1.5rem
			 * @public
			 */
			S: "S",

			/**
			 * component size - 7rem font size - 3rem
			 * @public
			 */
			XL: "XL",

			/**
			 * component size - 2rem font size - 1rem
			 * @public
			 */
			XS: "XS"
		};


		/**
		 * Defines background designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.BackgroundDesign = {

			/**
			 * A solid background color dependent on the theme.
			 * @public
			 */
			Solid: "Solid",

			/**
			 * A translucent background depending on the opacity value of the theme.
			 * @public
			 */
			Translucent: "Translucent",

			/**
			 * Transparent background.
			 * @public
			 */
			Transparent: "Transparent"
		};


		/**
		 * Defines border designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.BorderDesign = {

			/**
			 * Specifies no border.
			 * @public
			 */
			None: "None",

			/**
			 * A solid border color dependent on the theme.
			 * @public
			 */
			Solid: "Solid"
		};


		/**
		 * Different Breadcrumbs designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.95.0
		 * @experimental Since 1.95.0 This API is experimental and might change significantly.
		 */
		thisLib.BreadcrumbsDesign = {

			/**
			 * All items are displayed as links.
			 * @public
			 */
			NoCurrentPage: "NoCurrentPage",

			/**
			 * Shows the current page as the last item in the trail. The last item contains only plain text and is not a link.
			 * @public
			 */
			Standard: "Standard"
		};


		/**
		 * Different Breadcrumbs separator styles.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.95.0
		 * @experimental Since 1.95.0 This API is experimental and might change significantly.
		 */
		thisLib.BreadcrumbsSeparatorStyle = {

			/**
			 * The separator appears as "\".
			 * @public
			 */
			BackSlash: "BackSlash",

			/**
			 * The separator appears as "\\".
			 * @public
			 */
			DoubleBackSlash: "DoubleBackSlash",

			/**
			 * The separator appears as ">>".
			 * @public
			 */
			DoubleGreaterThan: "DoubleGreaterThan",

			/**
			 * The separator appears as "//" .
			 * @public
			 */
			DoubleSlash: "DoubleSlash",

			/**
			 * The separator appears as ">".
			 * @public
			 */
			GreaterThan: "GreaterThan",

			/**
			 * The separator appears as "/".
			 * @public
			 */
			Slash: "Slash"
		};


		/**
		 * Different BusyIndicator sizes.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.BusyIndicatorSize = {

			/**
			 * large size
			 * @public
			 */
			Large: "Large",

			/**
			 * medium size
			 * @public
			 */
			Medium: "Medium",

			/**
			 * small size
			 * @public
			 */
			Small: "Small"
		};


		/**
		 * Different Button designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.ButtonDesign = {

			/**
			 * attention type
			 * @public
			 */
			Attention: "Attention",

			/**
			 * default type (no special styling)
			 * @public
			 */
			Default: "Default",

			/**
			 * emphasized type
			 * @public
			 */
			Emphasized: "Emphasized",

			/**
			 * reject style (red button)
			 * @public
			 */
			Negative: "Negative",

			/**
			 * accept type (green button)
			 * @public
			 */
			Positive: "Positive",

			/**
			 * transparent type
			 * @public
			 */
			Transparent: "Transparent"
		};


		/**
		 * Determines if the button has special form-related functionality.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.120.0
		 * @experimental Since 1.120.0 This API is experimental and might change significantly.
		 */
		thisLib.ButtonType = {

			/**
			 * The button does not do anything special when inside a form
			 * @public
			 */
			Button: "Button",

			/**
			 * The button acts as a reset button (resets a form)
			 * @public
			 */
			Reset: "Reset",

			/**
			 * The button acts as a submit button (submits a form)
			 * @public
			 */
			Submit: "Submit"
		};


		/**
		 * Different Calendar selection mode.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.CalendarSelectionMode = {

			/**
			 * Several dates can be selected
			 * @public
			 */
			Multiple: "Multiple",

			/**
			 * A range defined by a start date and an end date can be selected
			 * @public
			 */
			Range: "Range",

			/**
			 * Only one date can be selected at a time
			 * @public
			 */
			Single: "Single"
		};


		/**
		 * Different Carousel arrows placement.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.CarouselArrowsPlacement = {

			/**
			 * Carousel arrows are placed on the sides of the current Carousel page.
			 * @public
			 */
			Content: "Content",

			/**
			 * Carousel arrows are placed on the sides of the page indicator of the Carousel.
			 * @public
			 */
			Navigation: "Navigation"
		};


		/**
		 * Different Carousel page indicator styles.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.CarouselPageIndicatorStyle = {

			/**
			 * The page indicator will be visualized as dots if there are fewer than 9 pages. If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)
			 * @public
			 */
			Default: "Default",

			/**
			 * The page indicator will display the current page and the total number of pages. (e.g. X of Y)
			 * @public
			 */
			Numeric: "Numeric"
		};


		/**
		 * Different filtering types of the ComboBox.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.ComboBoxFilter = {

			/**
			 * Defines contains filtering.
			 * @public
			 */
			Contains: "Contains",

			/**
			 * Removes any filtering applied while typing
			 * @public
			 */
			None: "None",

			/**
			 * Defines filtering by starting symbol of item's text.
			 * @public
			 */
			StartsWith: "StartsWith",

			/**
			 * Defines filtering by first symbol of each word of item's text.
			 * @public
			 */
			StartsWithPerTerm: "StartsWithPerTerm"
		};


		/**
		 * Different types of HasPopup.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.HasPopup = {

			/**
			 * Dialog popup type.
			 * @public
			 */
			Dialog: "Dialog",

			/**
			 * Grid popup type.
			 * @public
			 */
			Grid: "Grid",

			/**
			 * ListBox popup type.
			 * @public
			 */
			ListBox: "ListBox",

			/**
			 * Menu popup type.
			 * @public
			 */
			Menu: "Menu",

			/**
			 * Tree popup type.
			 * @public
			 */
			Tree: "Tree"
		};


		/**
		 * Different Icon semantic designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.IconDesign = {

			/**
			 * Contrast design
			 * @public
			 */
			Contrast: "Contrast",

			/**
			 * Critical design
			 * @public
			 */
			Critical: "Critical",

			/**
			 * Default design (brand design)
			 * @public
			 */
			Default: "Default",

			/**
			 * info type
			 * @public
			 */
			Information: "Information",

			/**
			 * Negative design
			 * @public
			 */
			Negative: "Negative",

			/**
			 * Neutral design
			 * @public
			 */
			Neutral: "Neutral",

			/**
			 * Design that indicates an icon which isn't interactive
			 * @public
			 */
			NonInteractive: "NonInteractive",

			/**
			 * Positive design
			 * @public
			 */
			Positive: "Positive"
		};


		/**
		 * Different input types.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.InputType = {

			/**
			 * Used for input fields that must contain an e-mail address.
			 * @public
			 */
			Email: "Email",

			/**
			 * Defines a numeric input field.
			 * @public
			 */
			Number: "Number",

			/**
			 * Defines a password field.
			 * @public
			 */
			Password: "Password",

			/**
			 * Used for input fields that should contain a telephone number.
			 * @public
			 */
			Tel: "Tel",

			/**
			 * Defines a one-line text input field:
			 * @public
			 */
			Text: "Text",

			/**
			 * Used for input fields that should contain a URL address.
			 * @public
			 */
			URL: "URL"
		};


		/**
		 * Different link designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.LinkDesign = {

			/**
			 * default type (no special styling)
			 * @public
			 */
			Default: "Default",

			/**
			 * emphasized type
			 * @public
			 */
			Emphasized: "Emphasized",

			/**
			 * subtle type (appears as regular text, rather than a link)
			 * @public
			 */
			Subtle: "Subtle"
		};


		/**
		 * Different list growing modes.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.ListGrowingMode = {

			/**
			 * Component's "load-more" is fired upon pressing a "More" button. at the bottom.
			 * @public
			 */
			Button: "Button",

			/**
			 * Component's growing is not enabled.
			 * @public
			 */
			None: "None",

			/**
			 * Component's "load-more" is fired upon scroll.
			 * @public
			 */
			Scroll: "Scroll"
		};


		/**
		 * Different list item types.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.ListItemType = {

			/**
			 * Indicates that the item is clickable via active feedback when item is pressed.
			 * @public
			 */
			Active: "Active",

			/**
			 * Enables detail button of the list item that fires detail-click event.
			 * @public
			 */
			Detail: "Detail",

			/**
			 * Indicates the list item does not have any active feedback when item is pressed.
			 * @public
			 */
			Inactive: "Inactive",

			/**
			 * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
			 * @public
			 */
			Navigation: "Navigation"
		};


		/**
		 * Different list modes.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.ListMode = {

			/**
			 * Delete mode (only one list item can be deleted via provided delete button)
			 * @public
			 */
			Delete: "Delete",

			/**
			 * Multi selection mode (more than one list item can be selected).
			 * @public
			 */
			MultiSelect: "MultiSelect",

			/**
			 * Default mode (no selection).
			 * @public
			 */
			None: "None",

			/**
			 * Right-positioned single selection mode (only one list item can be selected).
			 * @public
			 */
			SingleSelect: "SingleSelect",

			/**
			 * Selected item is highlighted and selection is changed upon arrow navigation (only one list item can be selected - this is always the focused item).
			 * @public
			 */
			SingleSelectAuto: "SingleSelectAuto",

			/**
			 * Left-positioned single selection mode (only one list item can be selected).
			 * @public
			 */
			SingleSelectBegin: "SingleSelectBegin",

			/**
			 * Selected item is highlighted but no selection element is visible (only one list item can be selected).
			 * @public
			 */
			SingleSelectEnd: "SingleSelectEnd"
		};


		/**
		 * Different types of list items separators.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.ListSeparators = {

			/**
			 * Separators between the items including the last and the first one.
			 * @public
			 */
			All: "All",

			/**
			 * Separators between the items. Note: This enumeration depends on the theme.
			 * @public
			 */
			Inner: "Inner",

			/**
			 * No item separators.
			 * @public
			 */
			None: "None"
		};


		/**
		 * MessageStrip designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.MessageStripDesign = {

			/**
			 * Message should be just an information
			 * @public
			 */
			Information: "Information",

			/**
			 * Message is an error
			 * @public
			 */
			Negative: "Negative",

			/**
			 * Message is a success message
			 * @public
			 */
			Positive: "Positive",

			/**
			 * Message is a warning
			 * @public
			 */
			Warning: "Warning"
		};


		/**
		 * Panel accessible roles.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.PanelAccessibleRole = {

			/**
			 * Represents the ARIA role "complementary". A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
			 * @public
			 */
			Complementary: "Complementary",

			/**
			 * Represents the ARIA role "Form". A landmark region that contains a collection of items and objects that, as a whole, create a form.
			 * @public
			 */
			Form: "Form",

			/**
			 * Represents the ARIA role "Region". A section of a page, that is important enough to be included in a page summary or table of contents.
			 * @public
			 */
			Region: "Region"
		};


		/**
		 * Popover horizontal align types.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.PopoverHorizontalAlign = {

			/**
			 * Popover is centered.
			 * @public
			 */
			Center: "Center",

			/**
			 * Popover is aligned with the left side of the target. When direction is RTL, it is right aligned.
			 * @public
			 */
			Left: "Left",

			/**
			 * Popover is aligned with the right side of the target. When direction is RTL, it is left aligned.
			 * @public
			 */
			Right: "Right",

			/**
			 * Popover is stretched.
			 * @public
			 */
			Stretch: "Stretch"
		};


		/**
		 * Popover placement types.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.PopoverPlacementType = {

			/**
			 * Popover will be placed at the bottom of the reference element.
			 * @public
			 */
			Bottom: "Bottom",

			/**
			 * Popover will be placed at the left side of the reference element.
			 * @public
			 */
			Left: "Left",

			/**
			 * Popover will be placed at the right side of the reference element.
			 * @public
			 */
			Right: "Right",

			/**
			 * Popover will be placed at the top of the reference element.
			 * @public
			 */
			Top: "Top"
		};


		/**
		 * Popover vertical align types.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.PopoverVerticalAlign = {

			/**
			 * Popover will be placed at the bottom of the reference control.
			 * @public
			 */
			Bottom: "Bottom",

			/**
			 *
			 * @public
			 */
			Center: "Center",

			/**
			 * Popover will be streched
			 * @public
			 */
			Stretch: "Stretch",

			/**
			 * Popover will be placed at the top of the reference control.
			 * @public
			 */
			Top: "Top"
		};


		/**
		 * Popup accessible roles.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.PopupAccessibleRole = {

			/**
			 * Represents the ARIA role "alertdialog".
			 * @public
			 */
			AlertDialog: "AlertDialog",

			/**
			 * Represents the ARIA role "dialog".
			 * @public
			 */
			Dialog: "Dialog",

			/**
			 * Represents no ARIA role.
			 * @public
			 */
			None: "None"
		};


		/**
		 * Different types of Priority.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.Priority = {

			/**
			 * High priority.
			 * @public
			 */
			High: "High",

			/**
			 * Low priority.
			 * @public
			 */
			Low: "Low",

			/**
			 * Medium priority.
			 * @public
			 */
			Medium: "Medium",

			/**
			 * Default, none priority.
			 * @public
			 */
			None: "None"
		};


		/**
		 * Different SegmentedButton modes.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.SegmentedButtonMode = {

			/**
			 * Multiple items can be selected at a time. All items can be deselected.
			 * @public
			 */
			MultiSelect: "MultiSelect",

			/**
			 * There is always one selected. Selecting one deselects the previous one.
			 * @public
			 */
			SingleSelect: "SingleSelect"
		};


		/**
		 * Different types of SemanticColor.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.SemanticColor = {

			/**
			 * Critical color
			 * @public
			 */
			Critical: "Critical",

			/**
			 * Default color (brand color)
			 * @public
			 */
			Default: "Default",

			/**
			 * Negative color
			 * @public
			 */
			Negative: "Negative",

			/**
			 * Neutral color.
			 * @public
			 */
			Neutral: "Neutral",

			/**
			 * Positive color
			 * @public
			 */
			Positive: "Positive"
		};


		/**
		 * Different types of Switch designs.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.SwitchDesign = {

			/**
			 * Defines the Switch as Graphical
			 * @public
			 */
			Graphical: "Graphical",

			/**
			 * Defines the Switch as Textual
			 * @public
			 */
			Textual: "Textual"
		};


		/**
		 * Background design for the header and content of TabContainer.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.TabContainerBackgroundDesign = {

			/**
			 * A Solid background color.
			 * @public
			 */
			Solid: "Solid",

			/**
			 * A Translucent background color.
			 * @public
			 */
			Translucent: "Translucent",

			/**
			 * A Transparent background color.
			 * @public
			 */
			Transparent: "Transparent"
		};


		/**
		 * Tab layout of TabContainer.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.TabLayout = {

			/**
			 * Inline type, the tab "main text" and "additionalText" are displayed horizotally.
			 * @public
			 */
			Inline: "Inline",

			/**
			 * Standard type, the tab "main text" and "additionalText" are displayed vertically.
			 * @public
			 */
			Standard: "Standard"
		};


		/**
		 * Table cell popin display.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.115.0
		 * @experimental Since 1.115.0 This API is experimental and might change significantly.
		 */
		thisLib.TableColumnPopinDisplay = {

			/**
			 * default type
			 * @public
			 */
			Block: "Block",

			/**
			 * inline type (the title and value are displayed on the same line)
			 * @public
			 */
			Inline: "Inline"
		};


		/**
		 * Different table growing modes.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.TableGrowingMode = {

			/**
			 * Component <code>load-more</code> is fired upon pressing a "More" button at the bottom.
			 * @public
			 */
			Button: "Button",

			/**
			 * Component growing is not enabled.
			 * @public
			 */
			None: "None",

			/**
			 * Component <code>load-more</code> is fired upon scroll.
			 * @public
			 */
			Scroll: "Scroll"
		};


		/**
		 * Different table modes.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.TableMode = {

			/**
			 * Multi selection mode (more than one table row can be selected).
			 * @public
			 */
			MultiSelect: "MultiSelect",

			/**
			 * Default mode (no selection).
			 * @public
			 */
			None: "None",

			/**
			 * Single selection mode (only one table row can be selected).
			 * @public
			 */
			SingleSelect: "SingleSelect"
		};


		/**
		 * Different table row types.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.TableRowType = {

			/**
			 * Indicates that the table row is clickable via active feedback when item is pressed.
			 * @public
			 */
			Active: "Active",

			/**
			 * Indicates that the table row does not have any active feedback when item is pressed.
			 * @public
			 */
			Inactive: "Inactive"
		};


		/**
		 * Tabs overflow mode in TabContainer.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.99.0
		 * @experimental Since 1.99.0 This API is experimental and might change significantly.
		 */
		thisLib.TabsOverflowMode = {

			/**
			 * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
			 * @public
			 */
			End: "End",

			/**
			 * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
			 * @public
			 */
			StartAndEnd: "StartAndEnd"
		};


		/**
		 * Different types of Title level.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.TitleLevel = {

			/**
			 * Renders <code>h1</code> tag.
			 * @public
			 */
			H1: "H1",

			/**
			 * Renders <code>h2</code> tag.
			 * @public
			 */
			H2: "H2",

			/**
			 * Renders <code>h3</code> tag.
			 * @public
			 */
			H3: "H3",

			/**
			 * Renders <code>h4</code> tag.
			 * @public
			 */
			H4: "H4",

			/**
			 * Renders <code>h5</code> tag.
			 * @public
			 */
			H5: "H5",

			/**
			 * Renders <code>h6</code> tag.
			 * @public
			 */
			H6: "H6"
		};


		/**
		 * Toast placement.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.ToastPlacement = {

			/**
			 * Toast is placed at the <code>BottomCenter</code> position of its container. Default placement (no selection)
			 * @public
			 */
			BottomCenter: "BottomCenter",

			/**
			 * Toast is placed at the <code>BottomEnd</code> position of its container.
			 * @public
			 */
			BottomEnd: "BottomEnd",

			/**
			 * Toast is placed at the <code>BottomStart</code> position of its container.
			 * @public
			 */
			BottomStart: "BottomStart",

			/**
			 * Toast is placed at the <code>MiddleCenter</code> position of its container.
			 * @public
			 */
			MiddleCenter: "MiddleCenter",

			/**
			 * Toast is placed at the <code>MiddleEnd</code> position of its container.
			 * @public
			 */
			MiddleEnd: "MiddleEnd",

			/**
			 * Toast is placed at the <code>MiddleStart</code> position of its container.
			 * @public
			 */
			MiddleStart: "MiddleStart",

			/**
			 * Toast is placed at the <code>TopCenter</code> position of its container.
			 * @public
			 */
			TopCenter: "TopCenter",

			/**
			 * Toast is placed at the <code>TopEnd</code> position of its container.
			 * @public
			 */
			TopEnd: "TopEnd",

			/**
			 * Toast is placed at the <code>TopStart</code> position of its container.
			 * @public
			 */
			TopStart: "TopStart"
		};


		/**
		 * Defines which direction the items of ui5-toolbar will be aligned.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.120.0
		 * @experimental Since 1.120.0 This API is experimental and might change significantly.
		 */
		thisLib.ToolbarAlign = {

			/**
			 * Toolbar items are situated at the <code>end</code> of the Toolbar
			 * @public
			 */
			End: "End",

			/**
			 * Toolbar items are situated at the <code>start</code> of the Toolbar
			 * @public
			 */
			Start: "Start"
		};


		/**
		 * Defines the priority of the toolbar item to go inside overflow popover.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.120.0
		 * @experimental Since 1.120.0 This API is experimental and might change significantly.
		 */
		thisLib.ToolbarItemOverflowBehavior = {

			/**
			 *
			 * @public
			 */
			AlwaysOverflow: "AlwaysOverflow",

			/**
			 * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
			 * @public
			 */
			Default: "Default",

			/**
			 * When set, the item will never go to the overflow popover.
			 * @public
			 */
			NeverOverflow: "NeverOverflow"
		};


		/**
		 * Different types of wrapping.
		 *
		 * @enum {string}
		 * @public
		 * @since 1.92.0
		 * @experimental Since 1.92.0 This API is experimental and might change significantly.
		 */
		thisLib.WrappingType = {

			/**
			 * The text will be truncated with an ellipsis.
			 * @public
			 */
			None: "None",

			/**
			 * The text will wrap. The words will not be broken based on hyphenation.
			 * @public
			 */
			Normal: "Normal"
		};

		return thisLib;

	});