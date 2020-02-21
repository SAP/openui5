/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.m.
 */
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/base/DataType',
	'sap/ui/base/EventProvider',
	'sap/ui/core/Control',
	'sap/base/util/ObjectPath',
	// library dependency
	'sap/ui/core/library',
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery",
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/util/defineLazyProperty",
	"sap/base/security/encodeCSS",
	"./AvatarShape",
	"./AvatarSize",
	"./AvatarType",
	"./AvatarColor",
	"./AvatarImageFitType",
	// referenced here to enable the Support feature
	'./Support'
],
	function(
	Device,
	DataType,
	EventProvider,
	Control,
	ObjectPath,
	CoreLibrary,
	capitalize,
	jQuery,
	assert,
	Log,
	defineLazyProperty,
	encodeCSS,
	AvatarShape,
	AvatarSize,
	AvatarType,
	AvatarColor,
	AvatarImageFitType
) {

	"use strict";


	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.m",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		designtime: "sap/m/designtime/library.designtime",
		types: [
			"sap.m.AvatarImageFitType",
			"sap.m.AvatarShape",
			"sap.m.AvatarSize",
			"sap.m.AvatarType",
			"sap.m.AvatarColor",
			"sap.m.BackgroundDesign",
			"sap.m.BarDesign",
			"sap.m.BreadcrumbsSeparatorStyle",
			"sap.m.ButtonType",
			"sap.m.CarouselArrowsPlacement",
			"sap.m.DateTimeInputType",
			"sap.m.DeviationIndicator",
			"sap.m.DialogRoleType",
			"sap.m.DialogType",
			"sap.m.DraftIndicatorState",
			"sap.m.FacetFilterListDataType",
			"sap.m.FacetFilterType",
			"sap.m.FlexAlignContent",
			"sap.m.FlexAlignItems",
			"sap.m.FlexAlignSelf",
			"sap.m.FlexDirection",
			"sap.m.FlexJustifyContent",
			"sap.m.FlexRendertype",
			"sap.m.FlexWrap",
			"sap.m.FrameType",
			"sap.m.GenericTagDesign",
			"sap.m.GenericTagValueState",
			"sap.m.GenericTileMode",
			"sap.m.GenericTileScope",
			"sap.m.HeaderLevel",
			"sap.m.IBarHTMLTag",
			"sap.m.IconTabDensityMode",
			"sap.m.IconTabFilterDesign",
			"sap.m.IconTabHeaderMode",
			"sap.m.ImageMode",
			"sap.m.InputTextFormatMode",
			"sap.m.InputType",
			"sap.m.LabelDesign",
			"sap.m.LightBoxLoadingStates",
			"sap.m.LinkConversion",
			"sap.m.ListGrowingDirection",
			"sap.m.ListHeaderDesign",
			"sap.m.ListKeyboardMode",
			"sap.m.ListMode",
			"sap.m.ListSeparators",
			"sap.m.ListType",
			"sap.m.LoadState",
			"sap.m.MenuButtonMode",
			"sap.m.ObjectHeaderPictureShape",
			"sap.m.ObjectMarkerType",
			"sap.m.ObjectMarkerVisibility",
			"sap.m.OverflowToolbarPriority",
			"sap.m.P13nPanelType",
			"sap.m.P13nConditionOperation",
			"sap.m.PageBackgroundDesign",
			"sap.m.PanelAccessibleRole",
			"sap.m.PDFViewerDisplayType",
			"sap.m.PlacementType",
			"sap.m.PlanningCalendarBuiltInView",
			"sap.m.PlanningCalendarStickyMode",
			"sap.m.PopinDisplay",
			"sap.m.PopinLayout",
			"sap.m.QuickViewGroupElementType",
			"sap.m.RatingIndicatorVisualMode",
			"sap.m.ScreenSize",
			"sap.m.SelectionDetailsActionLevel",
			"sap.m.SelectListKeyboardNavigationMode",
			"sap.m.SelectType",
			"sap.m.Size",
			"sap.m.SplitAppMode",
			"sap.m.StandardTileType",
			"sap.m.StepInputStepModeType",
			"sap.m.StepInputValidationMode",
			"sap.m.Sticky",
			"sap.m.StringFilterOperator",
			"sap.m.SwipeDirection",
			"sap.m.SwitchType",
			"sap.m.TileSizeBehavior",
			"sap.m.TimePickerMaskMode",
			"sap.m.TitleAlignment",
			"sap.m.ToolbarDesign",
			"sap.m.ToolbarStyle",
			"sap.m.UploadState",
			"sap.m.ValueColor",
			"sap.m.ValueCSSColor",
			"sap.m.VerticalPlacementType",
			"sap.m.WrappingType",
			"sap.m.semantic.SemanticRuleSetType"
		],
		interfaces: [
			"sap.m.IBar",
			"sap.m.IBreadcrumbs",
			"sap.m.IconTab",
			"sap.m.IScale",
			"sap.m.semantic.IGroup",
			"sap.m.semantic.IFilter",
			"sap.m.semantic.ISort",
			"sap.m.ObjectHeaderContainer",
			"sap.m.IOverflowToolbarContent",
			"sap.m.IOverflowToolbarFlexibleContent",
			"sap.m.IHyphenation"
		],
		controls: [
			"sap.m.ActionListItem",
			"sap.m.ActionSelect",
			"sap.m.ActionSheet",
			"sap.m.App",
			"sap.m.Avatar",
			"sap.m.Bar",
			"sap.m.BusyDialog",
			"sap.m.BusyIndicator",
			"sap.m.Button",
			"sap.m.Breadcrumbs",
			"sap.m.Carousel",
			"sap.m.CheckBox",
			"sap.m.ColumnHeaderPopover",
			"sap.m.ColumnListItem",
			"sap.m.ColorPalette",
			"sap.m.ColorPalettePopover",
			"sap.m.ComboBox",
			"sap.m.ComboBoxTextField",
			"sap.m.ComboBoxBase",
			"sap.m.CustomListItem",
			"sap.m.CustomTile",
			"sap.m.CustomTreeItem",
			"sap.m.DatePicker",
			"sap.m.DateRangeSelection",
			"sap.m.DateTimeField",
			"sap.m.DateTimeInput",
			"sap.m.DateTimePicker",
			"sap.m.Dialog",
			"sap.m.DisplayListItem",
			"sap.m.DraftIndicator",
			"sap.m.FacetFilter",
			"sap.m.FacetFilterItem",
			"sap.m.FacetFilterList",
			"sap.m.FeedContent",
			"sap.m.FeedInput",
			"sap.m.FeedListItem",
			"sap.m.FlexBox",
			"sap.m.FormattedText",
			"sap.m.GenericTag",
			"sap.m.GenericTile",
			"sap.m.GroupHeaderListItem",
			"sap.m.GrowingList",
			"sap.m.HBox",
			"sap.m.HeaderContainer",
			"sap.m.IconTabBar",
			"sap.m.IconTabBarSelectList",
			"sap.m.IconTabHeader",
			"sap.m.Image",
			"sap.m.ImageContent",
			"sap.m.Input",
			"sap.m.InputBase",
			"sap.m.InputListItem",
			"sap.m.Label",
			"sap.m.LightBox",
			"sap.m.Link",
			"sap.m.List",
			"sap.m.ListBase",
			"sap.m.ListItemBase",
			"sap.m.MaskInput",
			"sap.m.Menu",
			"sap.m.MenuButton",
			"sap.m.MessagePage",
			"sap.m.MessagePopover",
			"sap.m.MessageView",
			"sap.m.MessageStrip",
			"sap.m.MultiComboBox",
			"sap.m.MultiEditField",
			"sap.m.MultiInput",
			"sap.m.NavContainer",
			"sap.m.NewsContent",
			"sap.m.NumericContent",
			"sap.m.NotificationListBase",
			"sap.m.NotificationListItem",
			"sap.m.NotificationListGroup",
			"sap.m.PagingButton",
			"sap.m.PlanningCalendarLegend",
			"sap.m.ObjectAttribute",
			"sap.m.ObjectHeader",
			"sap.m.ObjectIdentifier",
			"sap.m.ObjectListItem",
			"sap.m.ObjectMarker",
			"sap.m.ObjectNumber",
			"sap.m.ObjectStatus",
			"sap.m.OverflowToolbar",
			"sap.m.OverflowToolbarButton",
			"sap.m.OverflowToolbarToggleButton",
			"sap.m.P13nColumnsPanel",
			"sap.m.P13nGroupPanel",
			"sap.m.P13nSelectionPanel",
			"sap.m.P13nDimMeasurePanel",
			"sap.m.P13nConditionPanel",
			"sap.m.P13nDialog",
			"sap.m.P13nFilterPanel",
			"sap.m.P13nPanel",
			"sap.m.P13nSortPanel",
			"sap.m.Page",
			"sap.m.Panel",
			"sap.m.PDFViewer",
			"sap.m.PlanningCalendar",
			"sap.m.PlanningCalendarHeader",
			"sap.m.Popover",
			"sap.m.ProgressIndicator",
			"sap.m.PullToRefresh",
			"sap.m.QuickView",
			"sap.m.QuickViewBase",
			"sap.m.QuickViewCard",
			"sap.m.QuickViewPage",
			"sap.m.RadioButton",
			"sap.m.RadioButtonGroup",
			"sap.m.RangeSlider",
			"sap.m.RatingIndicator",
			"sap.m.ResponsivePopover",
			"sap.m.ScrollContainer",
			"sap.m.SearchField",
			"sap.m.SegmentedButton",
			"sap.m.Select",
			"sap.m.SelectDialog",
			"sap.m.SelectList",
			"sap.m.SelectionDetails",
			"sap.m.Shell",
			"sap.m.SimpleFixFlex",
			"sap.m.SinglePlanningCalendar",
			"sap.m.SinglePlanningCalendarGrid",
			"sap.m.SinglePlanningCalendarMonthGrid",
			"sap.m.Slider",
			"sap.m.SliderTooltip",
			"sap.m.SliderTooltipBase",
			"sap.m.SliderTooltipContainer",
			"sap.m.SlideTile",
			"sap.m.StepInput",
			"sap.m.SplitApp",
			"sap.m.SplitContainer",
			"sap.m.StandardListItem",
			"sap.m.StandardTreeItem",
			"sap.m.StandardTile",
			"sap.m.Switch",
			"sap.m.Table",
			"sap.m.TableSelectDialog",
			"sap.m.TabContainer",
			"sap.m.TabStrip",
			"sap.m.Text",
			"sap.m.TextArea",
			"sap.m.Tile",
			"sap.m.TileContainer",
			"sap.m.TileContent",
			"sap.m.TimePicker",
			"sap.m.TimePickerSliders",
			"sap.m.Title",
			"sap.m.ToggleButton",
			"sap.m.Token",
			"sap.m.Tokenizer",
			"sap.m.Toolbar",
			"sap.m.ToolbarSpacer",
			"sap.m.ToolbarSeparator",
			"sap.m.Tree",
			"sap.m.TreeItemBase",
			"sap.m.UploadCollection",
			"sap.m.UploadCollectionToolbarPlaceholder",
			"sap.m.upload.UploadSet",
			"sap.m.VBox",
			"sap.m.ViewSettingsDialog",
			"sap.m.WheelSlider",
			"sap.m.WheelSliderContainer",
			"sap.m.Wizard",
			"sap.m.WizardStep",
			"sap.m.semantic.DetailPage",
			"sap.m.semantic.SemanticPage",
			"sap.m.semantic.ShareMenuPage",
			"sap.m.semantic.FullscreenPage",
			"sap.m.semantic.MasterPage"
		],
		elements: [
			"sap.m.Column",
			"sap.m.ColumnPopoverActionItem",
			"sap.m.ColumnPopoverCustomItem",
			"sap.m.ColumnPopoverItem",
			"sap.m.ColumnPopoverSortItem",
			"sap.m.FlexItemData",
			"sap.m.FeedListItemAction",
			"sap.m.IconTabFilter",
			"sap.m.IconTabSeparator",
			"sap.m.LightBoxItem",
			"sap.m.OverflowToolbarLayoutData",
			"sap.m.MaskInputRule",
			"sap.m.MenuItem",
			"sap.m.MessageItem",
			"sap.m.MessagePopoverItem",
			"sap.m.PageAccessibleLandmarkInfo",
			"sap.m.P13nFilterItem",
			"sap.m.P13nItem",
			"sap.m.PlanningCalendarRow",
			"sap.m.PlanningCalendarView",
			"sap.m.P13nColumnsItem",
			"sap.m.P13nDimMeasureItem",
			"sap.m.P13nGroupItem",
			"sap.m.P13nSortItem",
			"sap.m.QuickViewGroup",
			"sap.m.QuickViewGroupElement",
			"sap.m.ResponsiveScale",
			"sap.m.SegmentedButtonItem",
			"sap.m.SelectionDetailsItem",
			"sap.m.SelectionDetailsItemLine",
			"sap.m.SinglePlanningCalendarDayView",
			"sap.m.SinglePlanningCalendarWeekView",
			"sap.m.SinglePlanningCalendarWorkWeekView",
			"sap.m.SinglePlanningCalendarView",
			"sap.m.SuggestionItem",
			"sap.m.TabContainerItem",
			"sap.m.TabStripItem",
			"sap.m.ToolbarLayoutData",
			"sap.m.UploadCollectionItem",
			"sap.m.UploadCollectionParameter",
			"sap.m.upload.Uploader",
			"sap.m.upload.UploadSetItem",
			"sap.m.ViewSettingsCustomItem",
			"sap.m.ViewSettingsCustomTab",
			"sap.m.ViewSettingsFilterItem",
			"sap.m.ViewSettingsItem",
			"sap.m.plugins.DataStateIndicator",
			"sap.m.plugins.PluginBase",
			"sap.m.semantic.AddAction",
			"sap.m.semantic.CancelAction",
			"sap.m.semantic.DeleteAction",
			"sap.m.semantic.DiscussInJamAction",
			"sap.m.semantic.EditAction",
			"sap.m.semantic.FavoriteAction",
			"sap.m.semantic.FilterAction",
			"sap.m.semantic.FilterSelect",
			"sap.m.semantic.FlagAction",
			"sap.m.semantic.ForwardAction",
			"sap.m.semantic.GroupAction",
			"sap.m.semantic.GroupSelect",
			"sap.m.semantic.MainAction",
			"sap.m.semantic.MessagesIndicator",
			"sap.m.semantic.MultiSelectAction",
			"sap.m.semantic.NegativeAction",
			"sap.m.semantic.OpenInAction",
			"sap.m.semantic.PositiveAction",
			"sap.m.semantic.PrintAction",
			"sap.m.semantic.SaveAction",
			"sap.m.semantic.SemanticButton",
			"sap.m.semantic.SemanticControl",
			"sap.m.semantic.SemanticSelect",
			"sap.m.semantic.SemanticToggleButton",
			"sap.m.semantic.SendEmailAction",
			"sap.m.semantic.SendMessageAction",
			"sap.m.semantic.ShareInJamAction",
			"sap.m.semantic.SortAction",
			"sap.m.semantic.SortSelect"
		],
		extensions: {
			flChangeHandlers: {
				"sap.m.ActionSheet": {
					"moveControls": "default"
				},
				"sap.m.Avatar": "sap/m/flexibility/Avatar",
				"sap.m.Bar": "sap/m/flexibility/Bar",
				"sap.m.Button": "sap/m/flexibility/Button",
				"sap.m.CheckBox": "sap/m/flexibility/CheckBox",
				"sap.m.ColumnListItem": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.CustomListItem": {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				},
				"sap.m.DatePicker": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.Dialog": "sap/m/flexibility/Dialog",
				"sap.m.FlexBox": {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				},
				"sap.m.HBox": {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				},
				"sap.m.IconTabBar": {
					"moveControls": "default"
				},
				"sap.m.IconTabFilter": "sap/m/flexibility/IconTabFilter",
				"sap.m.Image": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.Input": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.InputBase": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.InputListItem": "sap/m/flexibility/InputListItem",
				"sap.m.Label": "sap/m/flexibility/Label",
				"sap.m.MultiInput": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.ListItemBase": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.Link": "sap/m/flexibility/Link",
				"sap.m.List": {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				},
				"sap.m.ListBase": {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				},
				"sap.m.MaskInput": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.MenuButton": "sap/m/flexibility/MenuButton",
				"sap.m.OverflowToolbar":"sap/m/flexibility/OverflowToolbar",
				"sap.m.OverflowToolbarButton": "sap/m/flexibility/OverflowToolbarButton",
				"sap.m.Page": "sap/m/flexibility/Page",
				"sap.m.Panel": "sap/m/flexibility/Panel",
				"sap.m.Popover": "sap/m/flexibility/Popover",
				"sap.m.RadioButton": "sap/m/flexibility/RadioButton",
				"sap.m.RatingIndicator": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.RangeSlider": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.ScrollContainer": {
					"hideControl": "default",
					"moveControls": "default",
					"unhideControl": "default"
				},
				"sap.m.Slider": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.StandardListItem":"sap/m/flexibility/StandardListItem",
				"sap.m.Table": "sap/m/flexibility/Table",
				"sap.m.Column": {
					"hideControl": "default",
					"unhideControl": "default"
				},
				"sap.m.Text": "sap/m/flexibility/Text",
				"sap.m.Title": "sap/m/flexibility/Title",
				"sap.m.Toolbar": "sap/m/flexibility/Toolbar",
				"sap.m.VBox": {
					"hideControl": "default",
					"unhideControl": "default",
					"moveControls": "default"
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true,
				internalRules:true
			}
		}
	});

	/* eslint-disable no-undef */
	/**
	 * The main UI5 control library, with responsive controls that can be used in touch devices as well as desktop browsers.
	 *
	 * @namespace
	 * @alias sap.m
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.m;
	/* eslint-disable no-undef */


	/**
	 * Available Background Design.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.BackgroundDesign = {

		/**
		 * A solid background color dependent on the theme.
		 * @public
		 */
		Solid : "Solid",

		/**
		 * Transparent background.
		 * @public
		 */
		Transparent : "Transparent",

		/**
		 * A translucent background depending on the opacity value of the theme.
		 * @public
		 */
		Translucent : "Translucent"

	};


	/**
	 * Types of the Bar design.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.20
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.BarDesign = {

		/**
		 * The Bar can be inserted into other controls and if the design is "Auto" then it inherits the design from parent control.
		 * @public
		 */
		Auto : "Auto",

		/**
		 * The bar will be styled like a header of the page.
		 * @public
		 */
		Header : "Header",

		/**
		 * The bar will be styled like a subheader of the page.
		 * @public
		 */
		SubHeader : "SubHeader",

		/**
		 * The bar will be styled like a footer of the page.
		 * @public
		 */
		Footer : "Footer"

	};

	/**
	 * Variations of the {@link sap.m.Breadcrumbs} separators.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.69
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */

	thisLib.BreadcrumbsSeparatorStyle = {
		/**
		 * The separator will appear as "/"
		 * @public
		 */

		Slash: "Slash",

		/**
		 * The separator will appear as "\"
		 * @public
		 */

		BackSlash: "BackSlash",

		/**
		 * The separator will appear as "//"
		 * @public
		 */

		DoubleSlash: "DoubleSlash",

		/**
		 * The separator will appear as "\\"
		 * @public
		 */

		DoubleBackSlash: "DoubleBackSlash",

		/**
		 * The separator will appear as ">"
		 * @public
		 */

		GreaterThan: "GreaterThan",

		/**
		 * The separator will appear as ">>"
		 * @public
		 */

		DoubleGreaterThan: "DoubleGreaterThan"

	};

	/**
	 * Different predefined button types for the {@link sap.m.Button sap.m.Button}.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ButtonType = {

		/**
		 * Default type (no special styling)
		 * @public
		 */
		Default : "Default",

		/**
		 * Back type (back navigation button for header)
		 * @public
		 */
		Back : "Back",

		/**
		 * Accept type
		 * @public
		 */
		Accept : "Accept",

		/**
		 * Reject style
		 * @public
		 */
		Reject : "Reject",

		/**
		 * Transparent type
		 * @public
		 */
		Transparent : "Transparent",

		/**
		 * Ghost type
		 * @public
		 */
		Ghost : "Ghost",

		/**
		 * Up type (up navigation button for header)
		 * @public
		 */
		Up : "Up",

		/**
		 * Unstyled type (no styling)
		 * @public
		 */
		Unstyled : "Unstyled",

		/**
		 * Emphasized type
		 * @public
		 */
		Emphasized : "Emphasized",

		/**
		 * Critical type
		 *
		 * <b>Note:</b> To be used only in controls of type <code>sap.m.Button</code>. When the
		 * button opens a <code>sap.m.MessagePopover</code> list, use this <code>ButtonType</code>
		 * if the message with the highest severity is <code>Warning</code> type.
		 *
		 * @public
		 * @since 1.73
		 */
		Critical : "Critical",

		/**
		 * Negative type
		 *
		 * <b>Note:</b> To be used only in controls of type <code>sap.m.Button</code>. When the
		 * button opens a <code>sap.m.MessagePopover</code> list, use this <code>ButtonType</code>
		 * if the message with the highest severity is <code>Error</code> type.
		 *
		 * @public
		 * @since 1.73
		 */
		Negative : "Negative",

		/**
		 * Success type
		 *
		 * <b>Note:</b> To be used only in controls of type <code>sap.m.Button</code>. When the
		 * button opens a <code>sap.m.MessagePopover</code> list, use this <code>ButtonType</code>
		 * if the message with the highest severity is <code>Success</code> type.
		 *
		 * @public
		 * @since 1.73
		 */
		Success : "Success",

		/**
		 * Neutral type
		 *
		 * <b>Note:</b> To be used only in controls of type <code>sap.m.Button</code>. When the
		 * button opens a <code>sap.m.MessagePopover</code> list, use this <code>ButtonType</code>
		 * if the message with the highest severity is <code>Information</code> type.
		 *
		 * @public
		 * @since 1.73
		 */
		Neutral : "Neutral"
	};

	/**
	 * Carousel arrows align.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.CarouselArrowsPlacement = {
		/**
		 * Carousel arrows are placed on the sides of the current Carousel page.
		 * @public
		 */
		Content : "Content",

		/**
		 * Carousel arrows are placed on the sides of the page indicator of the Carousel.
		 * @public
		 */
		PageIndicator : "PageIndicator"
	};

	/**
	 * A list of the default built-in views in a {@link sap.m.PlanningCalendar}, described by their keys.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.50
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PlanningCalendarBuiltInView = {

		/**
		 * Represents the key of the built-in view, in which the intervals have the size of one hour.
		 * @public
		 */
		Hour : "Hour",

		/**
		 * Represents the key of the built-in view, in which the intervals have the size of one day.
		 * @public
		 */
		Day : "Day",

		/**
		 * Represents the key of the built-in view, in which the intervals have the size of one month.
		 * @public
		 */
		Month : "Month",

		/**
		 * Represents the key of the built-in view, in which the intervals have the size of one day
		 * where 7 days are displayed, starting with the first day of the week.
		 * @public
		 */
		Week : "Week",

		/**
		 * Represents the key of the built-in view, in which the intervals have the size of one day
		 * where 31 days are displayed, starting with the first day of the month.
		 * @public
		 */
		OneMonth : "One Month"

	};

	/**
	 * A subset of DateTimeInput types that fit to a simple API returning one string.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.32.8. Instead, use dedicated <code>sap.m.DatePicker</code> and/or <code>sap.m.TimePicker</code> controls.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.DateTimeInputType = {

		/**
		 * An input control for specifying a date value. The user can select a month, day of the month, and year.
		 * @public
		 * @deprecated Since version 1.22.0. Instead, use dedicated <code>sap.m.DatePicker</code> control.
		 */
		Date : "Date",

		/**
		 * An input control for specifying a date and time value. The user can select a month, day of the month, year, and time of day.
		 * @public
		 * @deprecated Since version 1.32.8. Instead, use dedicated <code>sap.m.DatePicker</code> and <code>sap.m.TimePicker</code> controls.
		 */
		DateTime : "DateTime",

		/**
		 * An input control for specifying a time value. The user can select the hour, minute, and optionally AM or PM.
		 * @public
		 * @deprecated Since version 1.32.8. Instead, use dedicated <code>sap.m.TimePicker</code> control.
		 */
		Time : "Time"

	};


	/**
	 * Enum for the type of {@link sap.m.Dialog} control.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.DialogType = {

		/**
		 * This is the default value for Dialog type.
		 *
		 * The Standard Dialog in iOS has a header on the top. The Left and the Right buttons are put inside the header.
		 * In Android, the Left and the Right buttons are put at the bottom of the Dialog.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Dialog with type Message looks the same as the Standard Dialog in Android.
		 * It puts the Left and the Right buttons at the bottom of the Dialog in iOS.
		 * @public
		 */
		Message : "Message"

	};

	/**
	 * Enum for the ARIA role of {@link sap.m.Dialog} control.
	 *
	 * @enum {string}
	 * @since 1.65
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.DialogRoleType = {

		/**
		 * Represents the ARIA role <code>dialog</code>.
		 * @public
		 */
		Dialog : "dialog",

		/**
		 * Represents the ARIA role <code>alertdialog</code>.
		 * @public
		 */
		AlertDialog : "alertdialog"
	};

	/**
	 * Enum of the available deviation markers for the NumericContent control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.34
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.DeviationIndicator = {

		/**
		 * The actual value is more than the target value.
		 * @public
		 */
		Up : "Up",

		/**
		 * The actual value is less than the target value.
		 * @public
		 */
		Down : "Down",

		/**
		 * No value.
		 * @public
		 */
		None : "None"

	};


	/**
	 * Enum for the state of {@link sap.m.DraftIndicator} control.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.DraftIndicatorState = {

		/**
		 * This is the default value for DraftIndicatorState type. This state has no visual information displayed.
		 * @public
		 */
		Clear: "Clear",

		/**
		 * Indicates that the draft currently is being saved
		 * @public
		 */
		Saving: "Saving",

		/**
		 * Indicates that the draft is already saved
		 * @public
		 */
		Saved: "Saved"

	};


	/**
	 * FacetFilterList data types.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FacetFilterListDataType = {

		/**
		 * An input control for specifying a date value. The user can select a month, day of the month, and year.
		 * @public
		 */
		Date : "Date",

		/**
		 * An input control for specifying a date and time value. The user can select a month, day of the month, year, and time of day.
		 * @public
		 */
		DateTime : "DateTime",

		/**
		 * An input control for specifying a time value. The user can select the hour, minute, and optionally AM or PM.
		 * @public
		 */
		Time : "Time",

		/**
		 * >An input control for specifying an Integer value
		 * @public
		 */
		Integer : "Integer",

		/**
		 * An input control for specifying a Float value
		 * @public
		 */
		Float : "Float",

		/**
		 * An input control for specifying a String value
		 * @public
		 */
		String : "String",

		/**
		 * An input control for specifying a Boolean value
		 * @public
		 */
		Boolean : "Boolean"

	};


	/**
	 * Used by the FacetFilter control to adapt its design according to type.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FacetFilterType = {

		/**
		 * Forces FacetFilter to display facet lists as a row of buttons, one button per facet.
		 *
		 * The FacetFilter will automatically adapt to the Light type when it detects smart phone sized displays.
		 * @public
		 */
		Simple : "Simple",

		/**
		 * Forces FacetFilter to display in light mode.
		 * @public
		 */
		Light : "Light"

	};


	/**
	 * Available options for the layout of all elements along the cross axis of the flexbox layout.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexAlignItems = {

		/**
		 * The cross-start margin edges of the flex items are placed flush with the cross-start edge of the line.
		 * @public
		 */
		Start : "Start",

		/**
		 * The cross-start margin edges of the flex items are placed flush with the cross-end edge of the line.
		 * @public
		 */
		End : "End",

		/**
		 * The flex item's margin boxes are centered in the cross axis within the line.
		 * @public
		 */
		Center : "Center",

		/**
		 * If the flex item's inline axes are the same as the cross axis, this value is identical to "Start".
		 *
		 * Otherwise, it participates in baseline alignment: all participating box items on the line are aligned
		 * such that their baselines align, and the item with the largest distance between its baseline and
		 * its cross-start margin edge is placed flush against the cross-start edge of the line.
		 * @public
		 */
		Baseline : "Baseline",

		/**
		 * Make the cross size of the item's margin boxes as close to the same size as the line as possible.
		 * @public
		 */
		Stretch : "Stretch",

		/**
		 * Inherits the value from its parent.
		 * @public
		 */
		Inherit : "Inherit"

	};


	/**
	 * Available options for the layout of individual elements along the cross axis of the flexbox layout overriding the default alignment.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexAlignSelf = {

		/**
		 * Takes up the value of alignItems from the parent FlexBox
		 * @public
		 */
		Auto : "Auto",

		/**
		 * The cross-start margin edges of the flex item is placed flush with the cross-start edge of the line.
		 * @public
		 */
		Start : "Start",

		/**
		 * The cross-start margin edges of the flex item is placed flush with the cross-end edge of the line.
		 * @public
		 */
		End : "End",

		/**
		 * The flex item's margin box is centered in the cross axis within the line.
		 * @public
		 */
		Center : "Center",

		/**
		 * If the flex item's inline axis is the same as the cross axis, this value is identical to "Start".
		 *
		 * Otherwise, it participates in baseline alignment: all participating box items on the line are aligned
		 * such that their baselines align, and the item with the largest distance between its baseline and
		 * its cross-start margin edge is placed flush against the cross-start edge of the line.
		 * @public
		 */
		Baseline : "Baseline",

		/**
		 * Make the cross size of the item's margin box as close to the same size as the line as possible.
		 * @public
		 */
		Stretch : "Stretch",

		/**
		 * Inherits the value from its parent.
		 * @public
		 */
		Inherit : "Inherit"

	};


	/**
	 * Available directions for flex layouts.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexDirection = {

		/**
		 * Flex items are laid out along the direction of the inline axis (text direction).
		 * @public
		 */
		Row : "Row",

		/**
		 * Flex items are laid out along the direction of the block axis (usually top to bottom).
		 * @public
		 */
		Column : "Column",

		/**
		 * Flex items are laid out along the reverse direction of the inline axis (against the text direction).
		 * @public
		 */
		RowReverse : "RowReverse",

		/**
		 * Flex items are laid out along the reverse direction of the block axis (usually bottom to top).
		 * @public
		 */
		ColumnReverse : "ColumnReverse",

		/**
		 * Inherits the value from its parent.
		 * @public
		 */
		Inherit : "Inherit"

	};


	/**
	 * Available options for the layout of elements along the main axis of the flexbox layout.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexJustifyContent = {

		/**
		 * Flex items are packed toward the start of the line.
		 * @public
		 */
		Start : "Start",

		/**
		 * Flex items are packed toward the end of the line.
		 * @public
		 */
		End : "End",

		/**
		 * Flex items are packed toward the center of the line.
		 * @public
		 */
		Center : "Center",

		/**
		 * Flex items are evenly distributed in the line.
		 * @public
		 */
		SpaceBetween : "SpaceBetween",

		/**
		 * Flex items are evenly distributed in the line, with half-size spaces on either end.
		 * <b>Note:</b> This value behaves like SpaceBetween in Internet Explorer 10.
		 * @public
		 */
		SpaceAround : "SpaceAround",

		/**
		 * Inherits the value from its parent.
		 * @public
		 */
		Inherit : "Inherit"

	};


	/**
	 * Available options for the wrapping behavior of a flex container.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexWrap = {

		/**
		 * The flex container is single-line.
		 * @public
		 */
		NoWrap : "NoWrap",

		/**
		 * The flex container is multi-line.
		 * @public
		 */
		Wrap : "Wrap",

		/**
		 * The flex container is multi-line with the cross-axis start and end being swapped.
		 * @public
		 */
		WrapReverse : "WrapReverse"

	};


	/**
	 * Available options for the layout of container lines along the cross axis of the flexbox layout.
	 *
	 * <b>Note:</b> This property has no effect in Internet Explorer 10.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexAlignContent = {

		/**
		 * Lines are packed toward the start of the line.
		 * @public
		 */
		Start : "Start",

		/**
		 * Lines are packed toward the end of the line.
		 * @public
		 */
		End : "End",

		/**
		 * Line are packed toward the center of the line.
		 * @public
		 */
		Center : "Center",

		/**
		 * Lines are evenly distributed in the line.
		 * @public
		 */
		SpaceBetween : "SpaceBetween",

		/**
		 * Lines are evenly distributed in the line, with half-size spaces on either end.
		 * <b>Note:</b> This value behaves like SpaceBetween in Internet Explorer 10.
		 * @public
		 */
		SpaceAround : "SpaceAround",

		/**
		 * Lines stretch to take up the remaining space.
		 * @public
		 */
		Stretch : "Stretch",

		/**
		 * Inherits the value from its parent.
		 * @public
		 */
		Inherit : "Inherit"

	};

	/**
	 * Determines the type of HTML elements used for rendering controls.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FlexRendertype = {

		/**
		 * The UI5 controls are wrapped in DIV elements.
		 * @public
		 */
		Div : "Div",

		/**
		 * The UI5 controls are wrapped in LI elements, the surrounding Flex Box is an unordered list (UL).
		 * @public
		 */
		List : "List",

		/**
		 * The UI5 controls are not wrapped in an additional HTML element, the surrounding Flex Box is a DIV element.
		 * @public
		 * @since 1.42.1
		 */
		Bare : "Bare"
	};


	/**
	 * Enum for possible frame size types for sap.m.TileContent and sap.m.GenericTile control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.34.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.FrameType = {

		/**
		 * The 1x1 frame type.
		 * @public
		 */
		OneByOne : "OneByOne",

		/**
		 * The 2x1 frame type.
		 * @public
		 */
		TwoByOne : "TwoByOne",

		/**
		 * The 2/3 frame type.
		 * @deprecated since 1.48.0
		 * @protected
		 */
		TwoThirds : "TwoThirds",

		/**
		 * The Auto frame type that adjusts the size of the control to the content.
		 * Support for this type in sap.m.GenericTile is deprecated since 1.48.0.
		 * @protected
		 */
		Auto : "Auto"

	};

	/**
	 * Enumeration for possible link-to-anchor conversion strategy.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.45.5
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.LinkConversion = {

		/**
		 * Default mode (no conversion).
		 * @public
		 */
		None: "None",

		/**
		 * Valid links with protocols, such as http, https, ftp.
		 * @public
		 */
		ProtocolOnly: "ProtocolOnly",

		/**
		 * Valid links with protocols, such as http, https, ftp and those starting with the string "www".
		 * @public
		 */
		All: "All"
	};

	/**
	 * Defines how the input display text should be formatted.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.44.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.InputTextFormatMode = {

		/**
		 * Text
		 * @public
		 */
		Value: "Value",

		/**
		 * Key
		 * @public
		 */
		Key: "Key",

		/**
		 * A value-key pair formatted like "text (key)"
		 * @public
		 */
		ValueKey: "ValueKey",

		/**
		 * A key-value pair formatted like "(key) text"
		 * @public
		 */
		KeyValue: "KeyValue"
	};

	/**
	 * Design modes for the <code>GenericTag</code> control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.62.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.GenericTagDesign = {
		/**
		 * Everything from the control is rendered.
		 * @public
		 */
		Full : "Full",
		/**
		 * Everything from the control is rendered except the status icon.
		 * @public
		 */
		StatusIconHidden : "StatusIconHidden"
	};

	/**
	 * Value states for the <code>GenericTag</code> control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.62.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.GenericTagValueState = {
		/**
		 * The value is rendered in its normal state.
		 * @public
		 */
		None : "None",
		/**
		 * Warning icon is rendered that overrides the control set in the <code>value</code>
		 * aggregation of the <code>GenericTag</code> control.
		 * @public
		 */
		Error : "Error"
	};

	/**
	 * Defines the mode of GenericTile.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.38.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.GenericTileMode = {

		/**
		 * Default mode (Two lines for the header and one line for the subtitle).
		 * @public
		 */
		ContentMode : "ContentMode",

		/**
		 * Header mode (Four lines for the header and one line for the subtitle).
		 * @public
		 */
		HeaderMode : "HeaderMode",

		/**
		 * Line mode (Implemented for both, cozy and compact densities).
		 *
		 * Generic Tile is displayed as in-line element, header and subheader are displayed in one line.
		 * In case the texts need more than one line, the representation depends on the used density.
		 * <b>Cozy:</b> The text will be truncated and the full text is shown in a tooltip as soon as the tile is hovered (desktop only).
		 * <b>Compact:</b> Header and subheader are rendered continuously spanning multiple lines, no tooltip is provided).
		 * @since 1.44.0
		 * @public
		 */
		LineMode : "LineMode"
	};

	/**
	 * Defines the scopes of GenericTile enabling the developer to implement different "flavors" of tiles.
	 *
	 * @enum {string}
	 * @since 1.46.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 * @public
	 */
	thisLib.GenericTileScope = {
		/**
		 * Default scope (The default scope of the tile, no action icons are rendered).
		 * @public
		 */
		Display: "Display",

		/**
		 * Action scope (Possible footer and Error State information is overlaid, "Remove" and "More" icons are added to the tile).
		 * @public
		 */
		Actions: "Actions"
	};

	/**
	 * Describes the behavior of tiles when displayed on a small-screened phone (374px wide and lower).
	 *
	 * @enum {string}
	 * @since 1.56.0
	 * @ui5-metamodel This enumeration will also be described in the SAPUI5 (legacy) designtime metamodel
	 * @public
	 */
	thisLib.TileSizeBehavior = {
		/**
		 * Default behavior: Tiles adapt to the size of the screen, getting smaller on small screens.
		 * @public
		 */
		Responsive: "Responsive",
		/**
		 * Tiles are small all the time, regardless of the actual screen size.
		 * @public
		 */
		Small: "Small"
	};

	/**
	 * Different levels for headers.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.HeaderLevel = {

		/**
		 * Header level 1
		 * @public
		 */
		H1 : "H1",

		/**
		 * Header level 2
		 * @public
		 */
		H2 : "H2",

		/**
		 * Header level 3
		 * @public
		 */
		H3 : "H3",

		/**
		 * Header level 4
		 * @public
		 */
		H4 : "H4",

		/**
		 * Header level 5
		 * @public
		 */
		H5 : "H5",

		/**
		 * Header level 6
		 * @public
		 */
		H6 : "H6"

	};


	/**
	 *
	 * Interface for controls which are suitable as a Header, Subheader or Footer of a Page.
	 * If the control does not want to get a context base style class, it has to implement the isContextSensitive method and return false
	 *
	 *
	 * @since 1.22
	 * @name sap.m.IBar
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Interface for controls which have the meaning of a breadcrumbs navigation.
	 *
	 * @since 1.52
	 * @name sap.m.IBreadcrumbs
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 *
	 * Interface for controls which are suitable as a Scale for the Slider/RangeSlider.
	 * Implementation of this interface should implement the following methods:
	 * <ul>
	 * <li><code>getTickmarksBetweenLabels</code></li>
	 * <li><code>calcNumberOfTickmarks</code></li>
	 * <li><code>handleResize</code></li>
	 * <li><code>getLabel</code></li>
	 * </ul>
	 *
	 * @since 1.46
	 * @name sap.m.IScale
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Returns the number of tickmarks, which should be placed between labels.
	 *
	 * <b>Note:</b> There would always be a tickmark in the beginning and in the end of the slider,
	 * regardless of the value that this method returns.
	 *
	 * @param {object} mOptions The option array
	 * @returns {int} The number of tickmarks
	 *
	 * @function
	 * @name sap.m.IScale.getTickmarksBetweenLabels
	 * @public
	 */

	/**
	 * Returns how many tickmarks would be drawn on the screen.
	 *
	 * <b>Note:</b> There would always be a tickmark in the beginning and in the end of the slider,
	 * regardless of the value this method returns. The start and the end tickmark are taken into account
	 * for the later calculations.
	 *
	 * @param {object} mOptions The option array
	 * @returns {int} The number of tickmarks
	 *
	 * @function
	 * @name sap.m.IScale.calcNumberOfTickmarks
	 * @public
	 */

	/**
	 * Called, when the slider is getting resized.
	 *
	 * The Slider/RangeSlider control could be accessed via the oEvent.control parameter.
	 *
	 * Implementing this method is optional.
	 *
	 * @param {jQuery.Event} oEvent The event object passed.
	 *
	 * @function
	 * @name sap.m.IScale.handleResize?
	 * @public
	 */

	/**
	 * Provides a custom tickmark label.
	 *
	 * This method is optional. If it is not provided, the slider values will be placed as labels.
	 * If provided, the value of the tickmark labels and accessibility attributes
	 * (aria-valuenow and aria-valuetext) of the slider are changed accordingly.
	 *
	 * @param {float} fValue Value represented by the tickmark
	 * @param {sap.m.Slider|sap.m.RangeSlider} oSlider Slider control that asks for a label
	 * @returns {string | number} The label that should be placed in the current position.
	 *
	 * @function
	 * @name sap.m.IScale.getLabel?
	 * @public
	 */

	/**
	 * Allowed tags for the implementation of the IBar interface.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.22
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.IBarHTMLTag = {

		/**
		 * Renders as a div element.
		 * @public
		 */
		Div : "Div",

		/**
		 * Renders as a header element.
		 * @public
		 */
		Header : "Header",

		/**
		 * Renders as a footer element.
		 * @public
		 */
		Footer : "Footer"

	};


	/**
	 *
	 * Represents an interface for controls, which are suitable as items for the sap.m.IconTabBar.
	 *
	 * @name sap.m.IconTab
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Marker interface for controls which are suitable as items of the group aggregation of sap.m.Semantic.MasterPage.
	 *
	 * @name sap.m.semantic.IGroup
	 * @interface
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Marker interface for controls which are suitable as items of the filter aggregation of sap.m.Semantic.MasterPage.
	 *
	 * @name sap.m.semantic.IFilter
	 * @interface
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Marker interface for controls which are suitable as items of the sort aggregation of sap.m.Semantic.MasterPage.
	 *
	 * @name sap.m.semantic.ISort
	 * @interface
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 *
	 *   Interface for controls which can have special behavior inside <code>sap.m.OverflowToolbar</code>.
	 *   Controls that implement this interface must provide a <code>getOverflowToolbarConfig</code> method
	 *   that accepts no arguments and returns an object with the following fields:
	 *   <ul>
	 *       <li><code>canOverflow</code> - A boolean that tells whether the control can move to the overflow menu or not.
	 *
	 *       <b>Note:</b> Even if <code>canOverflow</code> is set to <code>false</code>, the <code>propsUnrelatedToSize</code> field is taken into account,
	 *       allowing to optimize the behavior of controls that do not need to overflow, but are used in an <code>sap.m.OverflowToolbar</code> regardless.</li>
	 *
	 *       <li><code>autoCloseEvents</code> - An array of strings, listing all of the control's events that should trigger the closing of the overflow menu, when fired.</li>
	 *
	 *       <li><code>invalidationEvents</code> - An array of strings, listing all of the control's events that should trigger the invalidation of the <code>sap.m.OverflowToolbar</code>, when fired.</li>
	 *
	 *       <li><code>propsUnrelatedToSize</code> - An array of strings, listing all of the control's properties that, when changed, should not cause the overflow toolbar to invalidate.
	 *
	 *       <b>Note:</b> By default <code>sap.m.OverflowToolbar</code> invalidates whenever any property of a child control changes. This is to ensure that whenever the size of a child control changes, the overflow toolbar's layout is recalculated.
	 *       Some properties however do not affect control size, making it unnecessary to invalidate the overflow toolbar when they change. You can list them here for optimization purposes.</li>
	 *
	 *       <li><code>onBeforeEnterOverflow(oControl)</code> - A callback function that will be invoked before moving the control into the overflow menu. The control instance will be passed as an argument.
	 *
	 *       <b>Note:</b> The context of the function is not the control instance (use the <code>oControl</code> parameter for this purpose), but rather an internal helper object, associated with the current <code>sap.m.OverflowToolbar</code> instance.
	 *       This object only needs to be manipulated in special cases (e.g. when you want to store state on it, rather than on the control instance).</li>
	 *
	 *       <li><code>onAfterExitOverflow(oControl)</code> - A callback function that will be invoked after taking the control out of the overflow menu (before moving it back to the toolbar itself). The control instance will be passed as an argument.
	 *
	 *       <b>Note:</b> See: <code>onBeforeEnterOverflow</code> for details about the function's context.</li>
	 *
	 *       <li><code>getCustomImportance()</code> - A function that, if provided, will be called to determine the priority of the control.
	 *       This function must return a value of type <code>sap.m.OverflowToolbarPriority</code>. The string "Medium" is also accepted and interpreted as priority between <code>Low</code> and <code>High</code>.
	 *
	 *       <b>Note:</b> Normally priority in <code>sap.m.OverflowToolbar</code> is managed with the <code>priority</code> property of <code>sap.m.OverflowToolbarLayoutData</code>.
	 *       However, some controls may have other means of defining priority, such as dedicated properties or other types of layout data for that purpose.
	 *       In summary, implementing this function allows a control to override the default priority logic (<code>sap.m.OverflowToolbarLayoutData</code>) by providing its own.</li>
	 *   </ul>
	 *
	 *   <b>Important:</b> In addition, the control can implement a CSS class, scoped with the <code>.sapMOverflowToolbarMenu-CTX</code> context selector, that will be applied whenever the control is inside the overflow menu.
	 *   For example, to make your control take up the whole width of the overflow menu, you can add a context class to your control's base CSS file like this:
	 *
	 *   <pre>
	 *       .sapMOverflowToolbarMenu-CTX .sapMyControlClass {
	 *       	width: 100%;
	 *       }
	 *   </pre>
	 *
	 * @since 1.52
	 * @name sap.m.IOverflowToolbarContent
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Marker interface for flexible controls that have a special behavior inside <code>sap.m.OverflowToolbar</code>.
	 *
	 * @since 1.67
	 * @name sap.m.IOverflowToolbarFlexibleContent
	 * @interface
	 * @private
	 * @ui5-restricted sap.m.GenericTag
	 */

	/**
	 * Represents an Interface for controls that can have their text hyphenated.
	 * Those controls can use <code>HyphenationSupport</code> mixin.
	 *
	 * @name sap.m.IHyphenation
	 * @interface
	 * @private
	 * @ui5-restricted
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Checks if the control should wrap.
	 *
	 * @returns {boolean} True if the control should wrap
	 *
	 * @function
	 * @name sap.m.IHyphenation.getWrapping
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Checks how the control should wrap.
	 *
	 * @returns {sap.m.WrappingType} What is the text wrapping type.
	 *
	 * @function
	 * @name sap.m.IHyphenation.getWrappingType
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Gets the map of texts to be hyphenated and rendered.
	 * For example, for <code>sap.m.Text</code> this would be the <code>text</code> property.
	 *
	 * @returns {Object<string,string>} The texts map which should be hyphenated
	 *
	 * @function
	 * @name sap.m.IHyphenation.getTextsToBeHyphenated
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Gets the DOM element reference map where the hyphenated texts should be placed.
	 * This is used to optimize performance and prevent flickering for hyphenated controls during the initial loading of hyphenation.
	 * For example, for <code>sap.m.Text</code> this would be the inner DOM element.
	 *
	 * If a DOM ref is not returned, the control will be invalidated.
	 *
	 * @returns {map|null} The map of dom refs for each corresponding hyphenated text
	 *
	 * @function
	 * @name sap.m.IHyphenation.getDomRefsForHyphenatedTexts
	 * @private
	 * @ui5-restricted
	 */

	/**
	 * Specifies <code>IconTabBar</code> header mode.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.IconTabHeaderMode = {

		/**
		 * Standard. In this mode when the <code>count</code> and the <code>text</code> are set, they are displayed in two separate lines.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Inline. In this mode when the <code>count</code> and the <code>text</code> are set, they are displayed in one line.
		 * @public
		 */
		Inline : "Inline"
	};

	/**
	 * Specifies <code>IconTabBar</code> tab density mode.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.IconTabDensityMode = {

		/**
		 * Inherit. In this mode the global configuration of the density mode will be applied.
		 * @public
		 */
		Inherit : "Inherit",

		/**
		 * Compact. In this mode the tabs will be set explicitly to compact mode independent of what mode is applied globally.
		 * @public
		 */
		Compact : "Compact",

		/**
		 * Cozy. In this mode the tabs will be set explicitly to compact mode independent of what mode is applied globally.
		 * @public
		 */
		Cozy : "Cozy"
	};

	/**
	 * Available Filter Item Design.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.IconTabFilterDesign = {

		/**
		 * A horizontally layouted design providing more space for texts.
		 * @public
		 */
		Horizontal : "Horizontal",

		/**
		 * A vertically layouted design using minimum horizontal space.
		 * @public
		 */
		Vertical : "Vertical"

	};

	/**
	* Determines how the source image is used on the output DOM element.
	*
	* @enum {string}
	* @public
	* @since 1.30.0
	* @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	*/
	thisLib.ImageMode = {

		/**
		* The image is rendered with 'img' tag and the 'src' property is set to the src attribute on the output DOM element.
		* @public
		*/
		Image: "Image",

		/**
		* The image is rendered with 'span' tag and the 'src' property is set to the 'background-image' CSS style on the output DOM element
		* @public
		*/
		Background: "Background"

	};

	/**
	* Enumeration of possible size settings.
	*
	* @enum {string}
	* @public
	* @since 1.34.0
	* @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	*/
	thisLib.Size = {

		/**
		 * Extra small size.
		 * @public
		 */
		XS : "XS",

		/**
		 * Small size.
		 * @public
		 */
		S : "S",

		/**
		 * Medium size.
		 * @public
		 */
		M : "M",

		/**
		 * Large size.
		 * @public
		 */
		L : "L",

		/**
		 * The size depends on the device it is running on. It is medium size for desktop and tablet and small size for phone.
		 * @public
		 */
		Auto : "Auto",

		/**
		 * The width and height of the control are determined by the width and height of the container the control is placed in.
		 * Please note: it is decided by the control whether or not sap.m.Size.Responsive is supported.
		 * @public
		 * @since 1.44.0
		 */
		Responsive : "Responsive"
	};

	/**
	 * Enumeration of possible value color settings.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ValueColor = {

		/**
		 * Neutral value color.
		 * @public
		 */
		Neutral : "Neutral",

		/**
		 * Good value color.
		 * @public
		 */
		Good : "Good",

		/**
		 * Critical value color.
		 * @public
		 */
		Critical : "Critical",

		/**
		 * Error value color.
		 * @public
		 */
		Error : "Error"

	};

	/**
	 * @classdesc A string type that represents CSS color values, sap.m.ValueColor or less parameter values.
	 *
	 * Allowed values are {@link sap.ui.core.CSSColor}, {@link sap.m.ValueColor} or a less parameter name (string).
	 * In case the less parameter color cannot be determined, the validation fails. You need to check if less parameters are supported on control level.
	 * An empty string is also allowed and has the same effect as setting no color.
	 *
	 * @final
	 * @namespace
	 * @public
	 * @ui5-metamodel This simple type also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ValueCSSColor = DataType.createType('sap.m.ValueCSSColor', {
		isValid : function (vValue) {
			var bResult = thisLib.ValueColor.hasOwnProperty(vValue);
			if (bResult) {
				return bResult;
			} else { // seems to be a less parameter or sap.ui.core.CSSColor
				bResult = CoreLibrary.CSSColor.isValid(vValue);
				if (bResult) {
					return bResult;
				} else {
					var Parameters = sap.ui.requireSync("sap/ui/core/theming/Parameters");
					return CoreLibrary.CSSColor.isValid(Parameters.get(vValue));
				}
			}
		}
	}, DataType.getType('string'));

	/**
	 * A subset of input types that fits to a simple API returning one string.
	 *
	 * Not available on purpose: button, checkbox, hidden, image, password, radio, range, reset, search, submit.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.InputType = {

		/**
		 * default (text)
		 * @public
		 */
		Text : "Text",

		/**
		 * An input control for specifying a date value. The user can select a month, day of the month, and year.
		 * @public
		 * @deprecated Since version 1.9.1.
		 * Please use dedicated {@link sap.m.DatePicker} to create date input.
		 */
		Date : "Date",

		/**
		 * An input control for specifying a date and time value. The user can select a month, day of the month, year, and time of day.
		 * @public
		 * @deprecated Since version 1.9.1.
		 * Please use dedicated {@link sap.m.DateTimePicker} control to create date-time input.
		 */
		Datetime : "Datetime",

		/**
		 * An input control for specifying a date and time value where the format depends on the locale.
		 * @public
		 * @deprecated Since version 1.9.1.
		 * Please use dedicated {@link sap.m.DateTimePicker} control create date-time input.
		 */
		DatetimeLocale : "DatetimeLocale",

		/**
		 * A text field for specifying an email address. Brings up a keyboard optimized for email address entry.
		 * @public
		 */
		Email : "Email",

		/**
		 * An input control for selecting a month.
		 * @public
		 * @deprecated Since version 1.9.1.
		 * There is no cross-platform support. Please do not use this Input type.
		 */
		Month : "Month",

		/**
		 * A text field for specifying a number. Brings up a number pad keyboard. Specifying an input type of \d* or [0-9]* is equivalent to using this type.
		 * @public
		 */
		Number : "Number",

		/**
		 * A text field for specifying a phone number. Brings up a phone pad keyboard.
		 * @public
		 */
		Tel : "Tel",

		/**
		 * An input control for specifying a time value. The user can select the hour, minute, and optionally AM or PM.
		 * @public
		 * @deprecated Since version 1.9.1.
		 * Please use dedicated {@link sap.m.TimePicker} control to create time input.
		 */
		Time : "Time",

		/**
		 * A text field for specifying a URL. Brings up a keyboard optimized for URL entry.
		 * @public
		 */
		Url : "Url",

		/**
		 * An input control for selecting a week.
		 * @public
		 * @deprecated Since version 1.9.1.
		 * There is no cross-platform support. Please do not use this Input type.
		 */
		Week : "Week",

		/**
		 * Password input where the user entry cannot be seen.
		 * @public
		 */
		Password : "Password"

	};


	/**
	 * Available label display modes.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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
	 * Defines the different header styles.
	 *
	 * @enum {string}
	 * @public
	 * @deprecated Since version 1.16.
	 * Has no functionality since 1.16.
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ListHeaderDesign = {

		/**
		 * Standard header style
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Plain header style
		 * @public
		 */
		Plain : "Plain"

	};


	/**
	 * Defines the mode of the list.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ListMode = {

		/**
		 * Default mode (no selection).
		 * @public
		 */
		None : "None",

		/**
		 * Right-positioned single selection mode (only one list item can be selected).
		 * @public
		 */
		SingleSelect : "SingleSelect",

		/**
		 * Left-positioned single selection mode (only one list item can be selected).
		 * @public
		 */
		SingleSelectLeft : "SingleSelectLeft",

		/**
		 * Selected item is highlighted but no selection control is visible (only one list item can be selected).
		 * @public
		 */
		SingleSelectMaster : "SingleSelectMaster",

		/**
		 * Multi selection mode (more than one list item can be selected).
		 * @public
		 */
		MultiSelect : "MultiSelect",

		/**
		 * Delete mode (only one list item can be deleted via provided delete button)
		 * @public
		 */
		Delete : "Delete"

	};

	/**
	 * Defines the keyboard handling behavior of the <code>sap.m.List</code> or <code>sap.m.Table</code>.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.38.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ListKeyboardMode = {

		/**
		 * This default mode is suitable if the number of items is unlimited or if there is no editable field
		 * within the item.
		 *
		 * While the last/first interactive element within an item has the focus, pressing tab/shift+tab moves
		 * the focus to the next/previous element in the tab chain after/before the <code>sap.m.List</code>
		 * or <code>sap.m.Table</code>.
		 * @public
		 */
		Navigation : "Navigation",

		/**
		 * This mode is suitable if the number of items is limited and if there are editable fields within the item.
		 *
		 * While the last/first interactive element within an item has the focus, pressing tab/shift+tab moves
		 * the focus to the next/previous element in the tab chain after/before the item </code>.
		 * @public
		 */
		Edit : "Edit"

	};

	/**
	 * Defines the growing direction of the <code>sap.m.List</code> or <code>sap.m.Table</code>.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.40.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ListGrowingDirection = {

		/**
		 * User has to scroll down to load more items or the growing button is displayed at the bottom.
		 * @public
		 */
		Downwards : "Downwards",

		/**
		 * User has to scroll up to load more items or the growing button is displayed at the top.
		 *
		 * <b>Note:</b> If this option is active, there should not be any other control than <code>sap.m.List</code>
		 * inside its <code>ScollContainer</code>.
		 * @public
		 */
		Upwards : "Upwards"

	};

	/**
	 * Defines which separator style will be applied for the items.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ListSeparators = {

		/**
		 * Separators between the items including the last and the first one.
		 * @public
		 */
		All : "All",

		/**
		 * Separators between the items.
		 * <b>Note:</b> This enumeration depends on the theme.
		 * @public
		 */
		Inner : "Inner",

		/**
		 * No item separators.
		 * @public
		 */
		None : "None"

	};


	/**
	 * Defines the visual indication and behaviour of the list items.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ListType = {

		/**
		 * Indicates the list item does not have any active feedback when item is pressed.
		 * <b>Note:</b> <code>Inactive</code> type cannot be used to disable list items.
		 * @public
		 */
		Inactive : "Inactive",

		/**
		 * Enables detail button of the list item that fires <code>detailPress</code> event.
		 * Also see {@link sap.m.ListItemBase#attachDetailPress}.
		 * @public
		 */
		Detail : "Detail",

		/**
		 * Indicates the list item is navigable to show extra information about the item.
		 * @public
		 */
		Navigation : "Navigation",

		/**
		 * Indicates that the item is clickable via active feedback when item is pressed.
		 * @public
		 */
		Active : "Active",

		/**
		 * Enables {@link sap.m.ListType.Detail} and {@link sap.m.ListType.Active} enumerations together.
		 * @public
		 */
		DetailAndActive : "DetailAndActive"

	};

	/**
	 * Defines the keyboard navigation mode.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.38
	 * @ui5-metamodel This enumeration will also be described in the UI5 (legacy) design time meta model.
	 */
	thisLib.SelectListKeyboardNavigationMode = {

		/**
		 * Keyboard navigation is disabled.
		 * @public
		 */
		None: "None",

		/**
		 * Keyboard navigation is delimited at the last item or first item of the list.
		 * @public
		 */
		Delimited: "Delimited"
	};

	/**
	 * Enumeration of possible load statuses.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.34.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.LoadState = {

		/**
		 * The control is loading.
		 * @public
		 */
		Loading : "Loading",

		/**
		 * The control has loaded.
		 * @public
		 */
		Loaded : "Loaded",

		/**
		 * The control failed to load.
		 * @public
		 */
		Failed : "Failed",

		/**
		 * The control is disabled.
		 * @public
		 */
		Disabled : "Disabled"
	};

	/**
	 * Different modes for a MenuButton (predefined types).
	 *
	 * @enum {string}
	 * @since 1.38.0
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.MenuButtonMode = {

		/**
		 * Default regular type (Menu button appears as a regular button, pressing opens a menu)
		 * @public
		 */
		Regular: "Regular",

		/**
		 * Split type (Menu button appears as a split button, pressing fires the default action a menu,
		 * pressing the arrow part opens a menu)
		 * @public
		 */
		Split: "Split"
	};

	/**
	 * Defines the priorities of the controls within {@link sap.m.OverflowToolbar}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.32
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.OverflowToolbarPriority = {

		/**
		 * Forces <code>OverflowToolbar</code> items to remain always in the toolbar.
		 * @public
		 */
		NeverOverflow : "NeverOverflow",

		/**
		 * Deprecated - Use <code>sap.m.OverflowToolbarPriority.NeverOverflow</code> instead.
		 * @deprecated Since version 1.48
		 * @public
		 */
		Never : "Never",

		/**
		 * Items with priority <code>High</code> overflow after the items with lower priority.
		 * @public
		 */
		High : "High",

		/**
		 * Items with priority <code>Low</code> overflow before the items with higher priority,
		 * such as <code>High</code> priority items.
		 * @public
		 */
		Low : "Low",

		/**
		 * Items with priority <code>Disappear</code> overflow before the items with higher priority,
		 * such as <code>Low</code> and <code>High</code>, and remain hidden in the overflow area.
		 * @public
		 */
		Disappear : "Disappear",

		/**
		 * Forces <code>OverflowToolbar</code> items to remain always in the overflow area.
		 * @public
		 */
		AlwaysOverflow : "AlwaysOverflow",

		/**
		 * Deprecated - Use <code>sap.m.OverflowToolbarPriority.AlwaysOverflow</code> instead
		 * @deprecated Since version 1.48
		 * @public
		 */
		Always : "Always"

	};

	/**
	 * Marker interface for controls which are suitable as items for the ObjectHeader.
	 *
	 * @name sap.m.ObjectHeaderContainer
	 * @interface
	 * @public
	 * @ui5-metamodel This interface also will be described in the UI5 (legacy) designtime metamodel
	 */

	/**
	 * Used by the <code>ObjectHeader</code> control to define which shape to use for the image.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration will also be described in the UI5 (legacy) designtime metamodel
	 * @since 1.61
	 */
	thisLib.ObjectHeaderPictureShape = {

		/**
		 * Circle shape for the images in the <code>ObjectHeader</code>.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Square shape for the images in the <code>ObjectHeader</code>.
		 * @public
		 */
		Square: "Square"

	};

	/**
	 * Type of panels used in the personalization dialog.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.P13nPanelType = {

		/**
		 * Panel type for sorting.
		 * @public
		 */
		sort : "sort",

		/**
		 * Panel type for filtering.
		 * @public
		 */
		filter : "filter",

		/**
		 * Panel type for grouping.
		 * @public
		 */
		group : "group",

		/**
		 * Panel type for column settings.
		 * @public
		 */
		columns : "columns",

		/**
		 * Panel type for dimension and measure settings.
		 * @public
		 */
		dimeasure: "dimeasure",

		/**
		 * Panel type for selection settings in general.
		 *
		 * @private
		 */
		selection: "selection"

	};

	/**
	 * @enum {string}
	 * @public
	 * @experimental since version 1.26 !!! THIS TYPE IS ONLY FOR INTERNAL USE !!!
	 */
	thisLib.P13nConditionOperation = {
		// filter operations
		BT: "BT",
		EQ: "EQ",
		Contains: "Contains",
		StartsWith: "StartsWith",
		EndsWith: "EndsWith",
		LT: "LT",
		LE: "LE",
		GT: "GT",
		GE: "GE",
		Initial: "Initial",
		Empty: "Empty",
		NotEmpty: "NotEmpty",

		// sort operations
		Ascending: "Ascending",
		Descending: "Descending",

		// group operations
		GroupAscending: "GroupAscending",
		GroupDescending: "GroupDescending",
		//
		// calculation operations
		Total: "Total",
		Average: "Average",
		Minimum: "Minimum",
		Maximum: "Maximum"
	};

	/**
	 * Available Page Background Design.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PageBackgroundDesign = {

		/**
		 * Standard Page background color.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Page background color when a List is set as the Page content.
		 * @public
		 */
		List : "List",

		/**
		 * A solid background color dependent on the theme.
		 * @public
		 */
		Solid : "Solid",

		/**
		 * Transparent background for the page.
		 * @public
		 */
		Transparent : "Transparent"

	};

	/**
	 * Available Panel Accessible Landmark Roles.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PanelAccessibleRole = {

		/**
		 * Represents the ARIA role <code>complementary</code>.
		 * A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
		 * @public
		 */
		Complementary : "Complementary",

		/**
		 * Represents the ARIA role <code>Form</code>.
		 * A landmark region that contains a collection of items and objects that, as a whole, create a form.
		 * @public
		 */
		Form: "Form",

		/**
		 * Represents the ARIA role <code>Region</code>.
		 * A section of a page, that is important enough to be included in a page summary or table of contents.
		 * @public
		 */
		Region: "Region"
	};

	/**
	 * PDF viewer display types.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PDFViewerDisplayType = {
		/**
		 * The PDF viewer switches between the <code>Link</code> display type and the <code>Embedded</code> display type,
		 * depending on the device being used.
		 *
		 * @public
		 */
		Auto: "Auto",

		/**
		 * The PDF viewer appears embedded in the parent container and displays the PDF file.
		 *
		 * @public
		 */
		Embedded: "Embedded",

		/**
		 * The PDF viewer appears as a toolbar with a download button that can be used to download the PDF file or
		 * open it in a new tab.
		 *
		 * @public
		 */
		Link: "Link"
	};

	/**
	 * Types for the placement of Popover control.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PlacementType = {

		/**
		 * Popover will be placed at the left side of the reference control.
		 * @public
		 */
		Left : "Left",

		/**
		 * Popover will be placed at the right side of the reference control.
		 * @public
		 */
		Right : "Right",

		/**
		 * Popover will be placed at the top of the reference control.
		 * @public
		 */
		Top : "Top",

		/**
		 * Popover will be placed at the bottom of the reference control.
		 * @public
		 */
		Bottom : "Bottom",

		/**
		 * Popover will be placed at the top or bottom of the reference control.
		 * @public
		 */
		Vertical : "Vertical",

		/**
		 * Deprecated - use <code>sap.m.PlacementType.VerticalPreferredTop</code> type.
		 * @deprecated Since version 1.36. Instead, use <code>sap.m.PlacementType.VerticalPreferredTop</code> type.
		 * @public
		 * @since 1.29
		 */
		VerticalPreferedTop : "VerticalPreferedTop",

		/**
		 * Popover will be placed at the top or bottom of the reference control but will try to position on the
		 * top side if the space is greater than the Popover's height.
		 * @public
		 * @since 1.36
		 */
		VerticalPreferredTop : "VerticalPreferredTop",

		/**
		 * Deprecated - use <code>sap.m.PlacementType.VerticalPreferredBottom</code> type.
		 * @deprecated Since version 1.36. Instead, use <code>sap.m.PlacementType.VerticalPreferredBottom</code> type.
		 * @public
		 * @since 1.29
		 */
		VerticalPreferedBottom : "VerticalPreferedBottom",

		/**
		 * Popover will be placed at the top or bottom of the reference control but will try to position on the
		 * bottom side if the space is greater than the Popover's height.
		 * @public
		 * @since 1.36
		 */
		VerticalPreferredBottom : "VerticalPreferredBottom",

		/**
		 * Popover will be placed at the right or left side of the reference control.
		 * @public
		 */
		Horizontal : "Horizontal",

		/**
		 * Deprecated - use <code>sap.m.PlacementType.HorizontalPreferredRight</code> type.
		 * @deprecated Since version 1.36. Instead, use <code>sap.m.PlacementType.HorizontalPreferredRight</code> type.
		 * @public
		 * @since 1.29
		 */
		HorizontalPreferedRight : "HorizontalPreferedRight",

		/**
		 * Popover will be placed at the right or left side of the reference control but will try to position on the
		 * right side if the space is greater than the Popover's width.
		 * @public
		 * @since 1.36
		 */
		HorizontalPreferredRight : "HorizontalPreferredRight",

		/**
		 * Deprecated - use <code>sap.m.PlacementType.HorizontalPreferredLeft</code> type.
		 * @deprecated Since version 1.36. Instead, use <code>sap.m.PlacementType.HorizontalPreferredLeft</code> type.
		 * @public
		 * @since 1.29
		 */
		HorizontalPreferedLeft : "HorizontalPreferedLeft",

		/**
		 * Popover will be placed at the right or left side of the reference control but will try to position on the
		 * left side if the space is greater than the Popover's width.
		 * @public
		 * @since 1.36
		 */
		HorizontalPreferredLeft : "HorizontalPreferredLeft",

		/**
		 * Popover will be placed to the left of the reference control. If the available space is less than the Popover's width,
		 * it will appear to the right of the same reference control left border.
		 * @public
		 * @since 1.38
		 */
		PreferredLeftOrFlip : "PreferredLeftOrFlip",

		/**
		 * Popover will be placed to the right of the reference control. If the available space is less than the Popover's width,
		 * it will appear to the left of the same reference control right border.
		 * @public
		 * @since 1.38
		 */
		PreferredRightOrFlip : "PreferredRightOrFlip",

		/**
		 * Popover will be placed to the top of the reference control. If the available space is less than the Popover's height,
		 * it will appear to the bottom of the same reference control top border.
		 * @public
		 * @since 1.38
		 */
		PreferredTopOrFlip : "PreferredTopOrFlip",

		/**
		 * Popover will be placed to the bottom of the reference control. If the available space is less than the Popover's height,
		 * it will appear to the top of the same reference control bottom border.
		 * @public
		 * @since 1.38
		 */
		PreferredBottomOrFlip : "PreferredBottomOrFlip",

		/**
		 * Popover will be placed automatically at the reference control.
		 * @public
		 */
		Auto : "Auto"

	};

	/**
	 * QuickViewGroupElement is a combination of one label and another control (Link or Text) associated to this label.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.QuickViewGroupElementType = {

		/**
		 * Displays a phone number link for direct dialing
		 * @public
		 */
		phone : "phone",

		/**
		 * Displays a phone number link for direct dialing and an icon for sending a text message
		 * @public
		 */
		mobile : "mobile",

		/**
		 * Displays an e-mail link
		 * @public
		 */
		email : "email",

		/**
		 * Displays a regular HTML link
		 * @public
		 */
		link : "link",

		/**
		 * Displays text
		 * @public
		 */
		text : "text",

		/**
		 * Displays a link for navigating to another QuickViewPage
		 * @public
		 */
		pageLink : "pageLink"

	};

	/**
	 * Types for the placement of message Popover control.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.VerticalPlacementType = {

		/**
		* Popover will be placed at the top of the reference control.
		* @public
		*/
		Top : "Top",

		/**
		* Popover will be placed at the bottom of the reference control.
		* @public
		*/
		Bottom : "Bottom",

		/**
		* Popover will be placed at the top or bottom of the reference control.
		* @public
		*/
		Vertical : "Vertical"
	};

	/**
	 * Defines the display of table pop-ins.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.13.2
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PopinDisplay = {

		/**
		 * Inside the table popin, header is displayed at the first line and cell content is displayed at the next line.
		 * @public
		 */
		Block : "Block",

		/**
		 * Inside the table popin, cell content is displayed next to the header in the same line.
		 * <b>Note:</b> If there is not enough space for the cell content then it jumps to the next line.
		 * @public
		 */
		Inline : "Inline",


		/**
		 * Inside the table popin, only the cell content will be visible.
		 * @public
		 * @since 1.28
		 */
		WithoutHeader : "WithoutHeader"
	};

	/**
	 * Defines the layout options of the table popins.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.52
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.PopinLayout = {

		/**
		 * Sets block layout for rendering the table popins. The elements inside the popin container are rendered one below the other.
		 * <b>Note:</b> This option enables the former rendering behavior of the table popins.
		 * @public
		 * @since 1.52
		 */
		Block : "Block",

		/**
		 * Sets grid layout for rendering the table popins.
		 * The grid width for each table popin is small, hence this allows more content to be rendered in a single popin row.
		 * This value defines small grid width for the table popins.
		 *
		 * <b>Note:</b> This feature is currently not supported with Internet Explorer and Edge (version lower than 16) browsers.
		 * @public
		 * @since 1.52
		 */
		GridSmall: "GridSmall",

		/**
		 * Sets grid layout for rendering the table popins.
		 * The grid width for each table popin is comparatively larger than <code>GridSmall</code>, hence this allows less content to be rendered in a single popin row.
		 *
		 * <b>Note:</b> This feature is currently not supported with Internet Explorer and Edge (version lower than 16) browsers.
		 * @public
		 * @since 1.52
		 */
		GridLarge: "GridLarge"
	};

	/**
	 * Defines which area of the control remains fixed at the top of the page during vertical scrolling
	 * as long as the control is in the viewport.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.54
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.Sticky = {
		/**
		 * The column headers remain in a fixed position.
		 * @public
		 */
		ColumnHeaders: "ColumnHeaders",

		/**
		 * The header toolbar remains in a fixed position.
		 * @public
		 * @since 1.56
		 */
		HeaderToolbar: "HeaderToolbar",

		/**
		 * The info toolbar remains in a fixed position.
		 * @public
		 * @since 1.56
		 */
		InfoToolbar: "InfoToolbar"
	};

	/**
	 * Possible values for the visualization of float values in the RatingIndicator control.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
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
		Half : "Half"

	};


	/**
	 * Breakpoint names for different screen sizes.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ScreenSize = {

		/**
		 * 240px wide
		 * @public
		 */
		Phone : "Phone",

		/**
		 * 600px wide
		 * @public
		 */
		Tablet : "Tablet",

		/**
		 * 1024px wide
		 * @public
		 */
		Desktop : "Desktop",

		/**
		 * 240px wide
		 * @public
		 */
		XXSmall : "XXSmall",

		/**
		 * 320px wide
		 * @public
		 */
		XSmall : "XSmall",

		/**
		 * 480px wide
		 * @public
		 */
		Small : "Small",

		/**
		 * 560px wide
		 * @public
		 */
		Medium : "Medium",

		/**
		 * 768px wide
		 * @public
		 */
		Large : "Large",

		/**
		 * 960px wide
		 * @public
		 */
		XLarge : "XLarge",

		/**
		 * 1120px wide
		 * @public
		 */
		XXLarge : "XXLarge"

	};

	/**
	 * Enumeration for different action levels in sap.m.SelectionDetails control.
	 *
	 * @enum {string}
	 * @protected
	 * @since 1.48
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SelectionDetailsActionLevel = {

		/**
		 * Action on SelectionDetailsItem level.
		 * @protected
		 */
		Item : "Item",

		/**
		 * Action on SelectionDetails list level.
		 * @protected
		 */
		List : "List",

		/**
		 * ActionGroup on SelectionDetails list level.
		 * @protected
		 */
		Group : "Group"
	};

	/**
	 * Enumeration for different Select types.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.16
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SelectType = {

		/**
		 * Will show the text.
		 * @public
		 */
		Default : "Default",

		/**
		 * Will show only the specified icon.
		 * @public
		 */
		IconOnly : "IconOnly"

	};


	/**
	 * The mode of SplitContainer or SplitApp control to show/hide the master area.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SplitAppMode = {

		/**
		 * Master will automatically be hidden in portrait mode.
		 * @public
		 */
		ShowHideMode : "ShowHideMode",

		/**
		 * Master will always be shown but in a compressed version when in portrait mode.
		 * @public
		 */
		StretchCompressMode : "StretchCompressMode",

		/**
		 * Master will be shown inside a Popover when in portrait mode
		 * @public
		 */
		PopoverMode : "PopoverMode",

		/**
		 * Master area is hidden initially both in portrait and landscape.
		 *
		 * Master area can be opened by clicking on the top left corner button or swiping right.
		 * Swipe is only enabled on mobile devices. Master will keep the open state when changing
		 * the orientation of the device.
		 * @public
		 */
		HideMode : "HideMode"

	};


	/**
	 * Types for StandardTile.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.StandardTileType = {

		/**
		 * Tile representing that something needs to be created
		 * @public
		 */
		Create : "Create",

		/**
		 * Monitor tile
		 * @public
		 */
		Monitor : "Monitor",

		/**
		 * Default type
		 * @public
		 */
		None : "None"

	};


	thisLib.semantic = thisLib.semantic || {};

	/**
	 * Declares the type of semantic ruleset that will govern the styling and positioning of semantic content.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.44
	 */
	thisLib.semantic.SemanticRuleSetType = {

		/**
		 * The default ruleset type, for which the Share Menu is always in the footer of the page.
		 * @public
		 */
		Classic : "Classic",

		/**
		 * Offers an optimized user experience, with displaying the Share Menu in the header, rather than the footer, for Fullscreen mode.
		 * @public
		 */
		Optimized : "Optimized"

	};


	/**
	 * Predefined types for ObjectMarker.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ObjectMarkerType = {

		/**
		 * Flagged type
		 * @public
		 */
		Flagged : "Flagged",

		/**
		 * Favorite type
		 * @public
		 */
		Favorite : "Favorite",

		/**
		 * Draft type
		 * @public
		 */
		Draft : "Draft",

		/**
		 * Locked type
		 * @public
		 */
		Locked : "Locked",

		/**
		 * Unsaved type
		 * @public
		 */
		Unsaved : "Unsaved",

		/**
		 * LockedBy type
		 * Use when you need to display the name of the user who locked the object.
		 * @public
		 */
		LockedBy : "LockedBy",

		/**
		 * UnsavedBy type
		 * Use when you need to display the name of the user whose changes were unsaved.
		 * @public
		 */
		UnsavedBy : "UnsavedBy"
	};


	/**
	 * Predefined visibility for ObjectMarker.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ObjectMarkerVisibility = {

		/**
		 * Shows only icon
		 * @public
		 */
		IconOnly : "IconOnly",

		/**
		 * Shows only text
		 * @public
		 */
		TextOnly : "TextOnly",

		/**
		 * Shows icon and text
		 * @public
		 */
		IconAndText : "IconAndText"

	};


	/**
	 * Directions for swipe event.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SwipeDirection = {

		/**
		 * Swipe from left to right
		 * @deprecated As of version 1.72, replaced by {@link BeginToEnd}
		 * @public
		 */
		LeftToRight : "LeftToRight",

		/**
		 * Swipe from right to left.
		 * @deprecated As of version 1.72, replaced by {@link EndToBegin}
		 * @public
		 */
		RightToLeft : "RightToLeft",

		/**
		 * Swipe from the beginning to the end - left to right in LTR languages and right to left in RTL languages.
		 * @public
		 * @since 1.72
		 */
		BeginToEnd : "BeginToEnd",

		/**
		 * Swipe from the end to the beginning - right to left in LTR languages and left to right in RTL languages.
		 * @public
		 * @since 1.72
		 */
		EndToBegin : "EndToBegin",

		/**
		 * Both directions (left to right or right to left)
		 * @public
		 */
		Both : "Both"

	};


	/**
	 * Enumeration for different switch types.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.SwitchType = {

		/**
		 * Will show "ON" and "OFF" translated to the current language or the custom text if provided
		 * @public
		 */
		Default : "Default",

		/**
		 * Switch with accept and reject icons
		 * @public
		 */
		AcceptReject : "AcceptReject"

	};


	/**
	 * Types of the Toolbar Design.
	 *
	 * To preview the different combinations of <code>sap.m.ToolbarDesign</code> and <code>sap.m.ToolbarStyle</code>,
	 * see the <b>OverflowToolbar - Design and styling</b> sample of the {@link sap.m.OverflowToolbar} control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.16.8
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ToolbarDesign = {

		/**
		 * The toolbar can be inserted into other controls and if the design is "Auto" then it inherits the design from parent control.
		 * @public
		 */
		Auto : "Auto",

		/**
		 * The toolbar and its content will be displayed transparent.
		 * @public
		 */
		Transparent : "Transparent",

		/**
		 * The toolbar appears smaller than the regular size to show information(e.g: text, icon).
		 * @public
		 */
		Info : "Info",

		/**
		 * The toolbar has a solid background. Its content will be rendered in a standard way.
		 * @public
		 * @since 1.22
		 */
		Solid : "Solid"

	};

	/**
	 * Types of visual styles for the {@link sap.m.Toolbar}.
	 *
	 * <b>Note:</b> Keep in mind that the styles are theme-dependent and can differ based on the currently used theme.
	 *
	 * To preview the different combinations of <code>sap.m.ToolbarDesign</code> and <code>sap.m.ToolbarStyle</code>,
	 * see the <b>OverflowToolbar - Design and styling</b> sample of the {@link sap.m.OverflowToolbar} control.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.54
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.ToolbarStyle = {

		/**
		 * Default visual style dependent on the used theme.
		 * @public
		 */
		Standard : "Standard",

		/**
		 * Simplified visual style dependent on the used theme.
		 *
		 * <b>Note:</b> For the Belize themes, the <code>sap.m.Toolbar</code> is displayed with no border.
		 * @public
		 */
		Clear : "Clear"

	};

	/**
	 * Different modes for the <code>sap.m.TimePicker</code> mask.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.54
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.TimePickerMaskMode = {
		/**
		 * <code>MaskInput</code> is enabled for the <code>sap.m.TimePicker</code>.
		 * @public
		 */
		On: "On",

		/**
		 * <code>MaskInput</code> is disabled for the <code>sap.m.TimePicker</code>.
		 * @public
		 */
		Off: "Off"
	};

	/**
	 * Types of string filter operators.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.42
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.StringFilterOperator = {

		/**
		 * Checks if the text is equal with the search string.
		 * @public
		 */
		Equals : "Equals",

		/**
		 * Checks if the text contains the search string.
		 * @public
		 */
		Contains : "Contains",

		/**
		 * Checks if the text starts with the search string.
		 * @public
		 */
		StartsWith : "StartsWith",

		/**
		 * Checks if any word in the text starts with the search string.
		 * @public
		 */
		AnyWordStartsWith : "AnyWordStartsWith"
	};

	/*global Element: true */

	/**
	 * Types of LightBox loading stages.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.40
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.LightBoxLoadingStates = {

		/**
		 * The LightBox image is still loading.
		 * @public
		 */
		Loading : "LOADING",
		/**
		 * The LightBox image has loaded.
		 * @public
		 */
		Loaded : "LOADED",

		/**
		 * The LightBox image has timed out, could not load.
		 * @public
		 */
		TimeOutError : "TIME_OUT_ERROR",

		/**
		 * The LightBox image could not load.
		 * @public
		 */
		Error : "ERROR"
	};

	/**
	 * Available validation modes for {@link sap.m.StepInput}.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.StepInputValidationMode = {

		/**
		 * Validation happens on <code>FocusOut</code>.
		 * @public
		 */
		FocusOut : "FocusOut",

		/**
		 * Validation happens on <code>LiveChange</code>.
		 * @public
		 */
		LiveChange : "LiveChange"

	};

	/**
	 * Available step modes for {@link sap.m.StepInput}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.54
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.StepInputStepModeType = {
		/**
		 * Choosing increase/decrease button will add/subtract the <code>step</code> value
		 * to/from the current value. For example, if <code>step</code> is 5, current
		 * <code>value</code> is 17 and increase button is chosen, the result will be 22 (5+17).
		 *
		 * <b>Note:</b> Using keyboard PageUp/PageDown will add/subtract the <code>step</code>
		 * multiplied by the <code>largerStep</code> values to/from the current
		 * <code>value</code>. For example, if <code>step</code> is 5, <code>largerStep</code>
		 * is 3, current <code>value</code> is 17 and PageUp is chosen, the result would be 32 (5*3+17).
		 *
		 * For more information, see {@link sap.m.StepInput}'s <code>step</code>,
		 * <code>largerStep</code> and <code>stepMode</code> properties.
		 * @public
		 */
		AdditionAndSubtraction: "AdditionAndSubtraction",
		 /**
		 * Pressing increase/decrease button will increase/decrease the current
		 * <code>value</code> to the closest number that is divisible by the
		 * <code>step</code>.
		 *
		 * For example, if <code>step</code> is 5, current <code>value</code> is 17 and
		 * increase button is chosen, the result will be 20 as it is the closest larger number
		 * that is divisible by 5.
		 *
		 * <b>Note:</b> Using keyboard PageUp/PageDown will increase/decrease the current
		 * <code>value</code> to the closest number that is divisible by the multiplication of
		 * the <code>step</code> and the <code>largerStep</code> values. For example, if
		 * <code>step</code> is 5, <code>largerStep</code> is 3, current <code>value</code> is
		 * 17 and PageUp is chosen, the result would be 30 as it is the closest larger number
		 * that is divisible by 15.
		 *
		 * The logic above will work only if both <code>step</code> and
		 * <code>largerStep</code> are integers.
		 *
		 * For more information, see {@link sap.m.StepInput}'s <code>step</code>,
		 * <code>largerStep</code> and <code>stepMode</code> properties.
		 * @public
		 */
		Multiple: "Multiple"
	};

	/**
	 * States of the upload process for {@link sap.m.UploadCollectionItem}.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.UploadState = {
		/**
		 * The file has been uploaded successfuly.
		 * @public
		 */
		Complete: "Complete",
		/**
		 * The file cannot be uploaded due to an error.
		 * @public
		 */
		Error: "Error",
		/**
		 * The file is awaiting an explicit command to start being uploaded.
		 * @public
		 */
		Ready: "Ready",
		/**
		 * The file is currently being uploaded.
		 * @public
		 */
		Uploading: "Uploading"
	};

	/**
	 * Available wrapping types for text controls that can be wrapped that enable you
	 * to display the text as hyphenated.
	 *
	 * For more information about text hyphenation, see
	 * {@link sap.ui.core.hyphenation.Hyphenation} and
	 * {@link topic:6322164936f047de941ec522b95d7b70 Text Controls Hyphenation}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.60
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.WrappingType = {
		/**
		 * Normal text wrapping will be used. Words won't break based on hyphenation.
		 * @public
		 */
		Normal : "Normal",

		/**
		 * Hyphenation will be used to break words on syllables where possible.
		 * @public
		 */
		Hyphenated : "Hyphenated"
	};

	/**
	 * Available sticky modes for the {@link sap.m.SinglePlanningCalendar}
	 *
	 * @enum {string}
	 * @public
	 * @since 1.62
	 * @ui5-metamodel This enumeration also will be described in tge UI5 (legacy) designtime metamodel
	 */
	thisLib.PlanningCalendarStickyMode = {
		/**
		 * Nothing will stick at the top.
		 * @public
		 */
		None: "None",

		/**
		 * Actions toolbar, navigation toolbar and the column headers will be sticky.
		 * @public
		 */
		All: "All",

		/**
		 * Only the navigation toolbar and column headers will be sticky.
		 * @public
		 */
		NavBarAndColHeaders: "NavBarAndColHeaders"
	};

	/**
	 * Declares the type of title alignment for some controls
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	thisLib.TitleAlignment = {

		/**
		 * The default type (if specified in the theme)
		 * @public
		 */
		Auto : "Auto",

		/**
		 * Explicitly sets the alignment to the start (left or right depending on LTR/RTL)
		 * @public
		 */
		Start : "Start",

		/**
		 * Explicitly sets the alignment to the start (left or right depending on LTR/RTL)
		 * @public
		 */
		Center : "Center"

	};

	thisLib.AvatarShape = AvatarShape;
	thisLib.AvatarSize = AvatarSize;
	thisLib.AvatarType = AvatarType;
	thisLib.AvatarColor = AvatarColor;
	thisLib.AvatarImageFitType = AvatarImageFitType;


		//lazy imports for MessageToast
	sap.ui.lazyRequire("sap.m.MessageToast", "show");

	// requires for routing
	sap.ui.lazyRequire("sap.m.routing.RouteMatchedHandler");
	sap.ui.lazyRequire("sap.m.routing.Router");
	sap.ui.lazyRequire("sap.m.routing.Target");
	sap.ui.lazyRequire("sap.m.routing.TargetHandler");
	sap.ui.lazyRequire("sap.m.routing.Targets");

	//enable ios7 support
	if (Device.os.ios && Device.os.version >= 7 && Device.os.version < 8 && Device.browser.name === "sf") {
		sap.ui.requireSync("sap/m/ios7");
	}

	//Internal: test the whole page with compact design
	if (/sap-ui-xx-formfactor=compact/.test(location.search)) {
		jQuery("html").addClass("sapUiSizeCompact");
		thisLib._bSizeCompact = true;
	}

	//Internal: test the whole page with compact design
	if (/sap-ui-xx-formfactor=condensed/.test(location.search)) {
		jQuery("html").addClass("sapUiSizeCondensed");
		thisLib._bSizeCondensed = true;
	}

	// central mobile functionality that should not go into the UI5 Core can go from here
	// ----------------------------------------------------------------------------------

	/**
	 * Returns invalid date value of UI5.
	 *
	 * @deprecated Since 1.12 UI5 returns null for invalid date
	 * @returns {null} <code>null</code> as value for an invalid date
	 * @public
	 * @since 1.10
	 */
	thisLib.getInvalidDate = function() {
		return null;
	};


	/**
	 * Finds default locale settings once and returns always the same.
	 *
	 * We should not need to create new instance to get same locale settings
	 * This method keeps the locale instance in the scope and returns the same after first run
	 *
	 * @returns {sap.ui.core.Locale} Locale instance
	 * @public
	 * @since 1.10
	 */
	thisLib.getLocale = function() {
		var oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();

		thisLib.getLocale = function() {
			return oLocale;
		};

		return oLocale;
	};

	/**
	 * Finds default locale data once and returns always the same.
	 *
	 * @returns {sap.ui.core.LocaleData} LocaleData instance
	 * @public
	 * @since 1.10
	 */
	thisLib.getLocaleData = function() {
		var oLocaleData = sap.ui.requireSync("sap/ui/core/LocaleData").getInstance(thisLib.getLocale());

		thisLib.getLocaleData = function() {
			return oLocaleData;
		};

		return oLocaleData;
	};

	/**
	 * Checks if the given parameter is a valid JsDate Object.
	 *
	 * @param {any} value Any variable to test.
	 * @returns {boolean} Whether the given parameter is a valid JsDate Object.
	 * @public
	 * @since 1.10
	 */
	thisLib.isDate = function(value) {
		return value && Object.prototype.toString.call(value) == "[object Date]" && !isNaN(value);
	};

	/**
	 * Search given control's parents and try to find iScroll.
	 *
	 * @param {sap.ui.core.Control} oControl Control to start the search at
	 * @returns {Object|undefined} iScroll reference or undefined if cannot find
	 * @public
	 * @since 1.11
	 */
	thisLib.getIScroll = function(oControl) {
		if (typeof window.iScroll != "function" || !(oControl instanceof Control)) {
			return;
		}

		var parent, scroller;
		/*eslint-disable no-cond-assign */
		for (parent = oControl; parent = parent.oParent;) {
			scroller = parent.getScrollDelegate ? parent.getScrollDelegate()._scroller : null;
			if (scroller && scroller instanceof window.iScroll) {
				return scroller;
			}
		}
		/*eslint-enable no-cond-assign */
	};


	/**
	 * Search given control's parents and try to find a ScrollDelegate.
	 *
	 * @param {sap.ui.core.Control} oControl Starting point for the search
	 * @param {boolean} bGlobal Whether the search should stop on component level (<code>false</code>) or not
	 * @returns {Object|undefined} ScrollDelegate or undefined if it cannot be found
	 * @public
	 * @since 1.11
	 */
	thisLib.getScrollDelegate = function(oControl, bGlobal) {
		if (!(oControl instanceof Control)) {
			return;
		}

		var UIComponent = sap.ui.require("sap/ui/core/UIComponent");

		function doGetParent(c) {
			if (!c) {
				return;
			}
			return bGlobal && UIComponent && (c instanceof UIComponent) ? c.oContainer : c.oParent;
		}

		/*eslint-disable no-cond-assign */
		for (var parent = oControl; parent = doGetParent(parent);) {
			if (parent && typeof parent.getScrollDelegate == "function") {
				return parent.getScrollDelegate();
			}
		}
		/*eslint-enable no-cond-assign */
	};

	/**
	 * screen size definitions in pixel
	 * if you change any value here, please also change
	 * 	1. the documentation of sap.m.ScreenSize
	 *  2. media queries in list.css
	 *
	 * @private
	 * @since 1.12
	 */
	thisLib.ScreenSizes = {
		phone : 240,
		tablet : 600,
		desktop : 1024,
		xxsmall : 240,
		xsmall : 320,
		small : 480,
		medium : 560,
		large : 768,
		xlarge : 960,
		xxlarge : 1120
	};

	/**
	 * Base font-size.
	 * @private
	 * @since 1.12
	 */
	defineLazyProperty(thisLib, "BaseFontSize", function () {
		// jQuery(...).css() is executed only on "BaseFontSize" property access.
		// This avoids accessing the DOM during library evaluation
		// which might be too early, e.g. when the library is loaded within the head element.
		thisLib.BaseFontSize = jQuery(document.documentElement).css("font-size") || "16px";
		return thisLib.BaseFontSize;
	});

	/**
	 * Hide the soft keyboard.
	 *
	 * @public
	 * @since 1.20
	 */
	thisLib.closeKeyboard = function() {
		var activeElement = document.activeElement;
		if (!Device.system.desktop && activeElement && /(INPUT|TEXTAREA)/i.test(activeElement.tagName)) {
			activeElement.blur();
		}
	};


	/**
	 * Touch helper.
	 *
	 * @namespace
	 * @public
	 **/
	thisLib.touch = thisLib.touch || {};

	/**
	 * Given a list of touch objects, find the touch that matches the given one.
	 *
	 * @param {TouchList} oTouchList The list of touch objects to search.
	 * @param {Touch | number} oTouch A touch object to find or a Touch.identifier that uniquely identifies the current finger in the touch session.
	 * @returns {object | undefined} The touch matching if any.
	 * @public
	*/
	thisLib.touch.find = function(oTouchList, oTouch) {
		var i,
			iTouchListLength;

		if (!oTouchList) {
			return;
		}

		if (oTouch && typeof oTouch.identifier !== "undefined") {
			oTouch = oTouch.identifier;
		} else if (typeof oTouch !== "number") {
			assert(false, 'sap.m.touch.find(): oTouch must be a touch object or a number');
			return;
		}

		iTouchListLength = oTouchList.length;

		// A TouchList is an object not an array, so we shouldn't use
		// Array.prototype.forEach, etc.
		for (i = 0; i < iTouchListLength; i++) {
			if (oTouchList[i].identifier === oTouch) {
				return oTouchList[i];
			}
		}

		// if the given touch object or touch identifier is not found in the touches list, then return undefined
	};

	/**
	 * Given a list of touches, count the number of touches related with the given element.
	 *
	 * @param {TouchList} oTouchList The list of touch objects to search.
	 * @param {jQuery | Element | string} vElement A jQuery element or an element reference or an element id.
	 * @returns {number} The number of touches related with the given element.
	 * @public
	*/
	thisLib.touch.countContained = function(oTouchList, vElement) {
		var i,
			iTouchCount = 0,
			iTouchListLength,
			iElementChildrenL,
			$TouchTarget;

		if (!oTouchList) {
			return 0;
		}

		if (vElement instanceof Element) {
			vElement = jQuery(vElement);
		} else if (typeof vElement === "string") {
			vElement = jQuery(document.getElementById(vElement));
		} else if (!(vElement instanceof jQuery)) {
			assert(false, 'sap.m.touch.countContained(): vElement must be a jQuery object or Element reference or a string');
			return 0;
		}

		iElementChildrenL = vElement.children().length;
		iTouchListLength = oTouchList.length;

		// A TouchList is an object not an array, so we shouldn't use
		// Array.prototype.forEach, etc.
		for (i = 0; i < iTouchListLength; i++) {
			$TouchTarget = jQuery(oTouchList[i].target);

			// If the current target has only one HTML element or
			// has an HTML element ancestor that match with the given element id.
			if ((iElementChildrenL === 0  && $TouchTarget.is(vElement)) ||
				(vElement[0].contains($TouchTarget[0]))) {

				iTouchCount++;
			}
		}

		return iTouchCount;
	};

	/**
	 * URL (Uniform Resource Locator) Helper.
	 *
	 * This helper can be used to trigger a native application (e.g. email, sms, phone) from the browser.
	 * That means we are restricted of browser or application implementation. e.g.
	 * <ul>
	 * <li>Some browsers do not let you pass more than 2022 characters in the URL</li>
	 * <li>MAPI (Outlook) limit is 2083, max. path under Internet Explorer is 2048</li>
	 * <li>Different Internet Explorer versions have a different limitation (IE9 approximately 1000 characters)</li>
	 * <li>MS mail app under Windows 8 cuts mail links after approximately 100 characters</li>
	 * <li>Safari gets a confirmation from user before opening a native application and can block other triggers if the user cancels it</li>
	 * <li>Some mail applications(Outlook) do not respect all encodings (e.g. Cyrillic texts are not encoded correctly)</li>
	 * </ul>
	 *
	 * <b>Note:</b> all the given limitation lengths are for URL encoded text (e.g a space character will be encoded as "%20").
	 *
	 * @see {@link topic:4f1c1075d88c41a5904389fa12b28f6b URL Helper}
	 *
	 * @namespace
	 * @since 1.10
	 * @public
	 */
	thisLib.URLHelper = (function() {

		function isValidString(value) {
			return value && Object.prototype.toString.call(value) == "[object String]";
		}

		function formatTel(sTel) {
			if (!isValidString(sTel)) {
				return "";
			}
			return sTel.replace(/[^0-9\+\*#]/g, "");
		}

		function formatMessage(sText) {
			if (!isValidString(sText)) {
				return "";
			}
			// line breaks in the  body of a message MUST be encoded with "%0D%0A"
			// space character in the  body of a message MUST be encoded with "%20"
			// see http://www.ietf.org/rfc/rfc2368.txt for details
			sText = sText.split(/\r\n|\r|\n/g).join("\r\n");
			return encodeURIComponent(sText);
		}

		return jQuery.extend(new EventProvider(), /** @lends sap.m.URLHelper */ {
			/**
			 * Sanitizes the given telephone number and returns a URI using the <code>tel:</code> scheme.
			 *
			 * @param {string} [sTel] Telephone number
			 * @returns {string} Telephone URI using the <code>tel:</code> scheme
			 * @public
			 */
			normalizeTel: function(sTel) {
				return "tel:" + formatTel(sTel);
			},

			/**
			 * Sanitizes the given telephone number and returns a URI using the <code>sms:</code> scheme.
			 *
			 * @param {string} [sTel] Telephone number
			 * @returns {string} SMS URI using the <code>sms:</code> scheme
			 * @public
			 */
			normalizeSms: function(sTel) {
				return "sms:" + formatTel(sTel);
			},

			/**
			 * Builds Email URI from given parameter.
			 * Trims spaces from email addresses.
			 *
			 * @param {string} [sEmail] Destination email address
			 * @param {string} [sSubject] Subject of the email address
			 * @param {string} [sBody] Default message text
			 * @param {string} [sCC] Carbon Copy email address
			 * @param {string} [sBCC] Blind carbon copy email address
			 * @returns {string} Email URI using the <code>mailto:</code> scheme
			 * @public
			 */
			normalizeEmail: function(sEmail, sSubject, sBody, sCC, sBCC) {
				var aParams = [],
					sURL = "mailto:",
					encode = encodeURIComponent;

				// Within mailto URLs, the characters "?", "=", "&" are reserved
				isValidString(sEmail) && (sURL += encode(jQuery.trim(sEmail)));
				isValidString(sSubject) && aParams.push("subject=" + encode(sSubject));
				isValidString(sBody) && aParams.push("body=" + formatMessage(sBody));
				isValidString(sBCC) && aParams.push("bcc=" + encode(jQuery.trim(sBCC)));
				isValidString(sCC) && aParams.push("cc=" + encode(jQuery.trim(sCC)));

				if (aParams.length) {
					sURL += "?" + aParams.join("&");
				}
				return sURL;
			},

			/**
			 * Redirects to the given URL.
			 *
			 * This method fires "redirect" event before opening the URL.
			 *
			 * @param {string} sURL Uniform resource locator
			 * @param {boolean} [bNewWindow] Opens URL in a new browser window or tab. Please note that, opening a new window/tab can be ignored by browsers (e.g. on Windows Phone) or by popup blockers.
			 * NOTE: On Windows Phone the URL will be enforced to open in the same window if opening in a new window/tab fails (because of a known system restriction on cross-window communications). Use sap.m.Link instead (with blank target) if you necessarily need to open URL in a new window.
			 *
			 * @public
			 */
			redirect: function (sURL, bNewWindow) {
				assert(isValidString(sURL), this + "#redirect: URL must be a string" );
				this.fireEvent("redirect", sURL);
				if (!bNewWindow) {
					window.location.href = sURL;
				} else {
					var oWindow = window.open(sURL, "_blank");
					if (!oWindow) {
						Log.error(this + "#redirect: Could not open " + sURL);
						if (Device.os.windows_phone || (Device.browser.edge && Device.browser.mobile)) {
							Log.warning("URL will be enforced to open in the same window as a fallback from a known Windows Phone system restriction. Check the documentation for more information.");
							window.location.href = sURL;
						}
					}
				}
			},

			/**
			 * Adds an event listener for the <code>redirect</code> event.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {Object} [oListener] The object that wants to be notified when the event occurs.
			 * @returns {sap.m.URLHelper} The URLHelper instance
			 * @public
			 */
			attachRedirect: function (fnFunction, oListener) {
				return this.attachEvent("redirect", fnFunction, oListener);
			},

			/**
			 * Detach an already registered listener of the <code>redirect</code> event.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {Object} [oListener] The object, that wants to be notified, when the event occurs.
			 * @returns {sap.m.URLHelper} The URLHelper instance
			 * @public
			 */
			detachRedirect: function (fnFunction, oListener) {
				return this.detachEvent("redirect", fnFunction, oListener);
			},

			/**
			 * Trigger telephone app to call the given telephone number.
			 *
			 * @param {string} [sTel] Telephone number
			 * @public
			 */
			triggerTel: function(sTel) {
				this.redirect(this.normalizeTel(sTel));
			},

			/**
			 * Trigger SMS application to send SMS to given telephone number.
			 *
			 * @param {string} [sTel] Telephone number
			 * @public
			 */
			triggerSms: function(sTel) {
				this.redirect(this.normalizeSms(sTel));
			},

			/**
			 * Trigger email application to send email.
			 * Trims spaces from email addresses.
			 *
			 * @param {string} [sEmail] Destination email address
			 * @param {string} [sSubject] Subject of the email address
			 * @param {string} [sBody] Default message text
			 * @param {string} [sCC] Carbon Copy email address
			 * @param {string} [sBCC] Blind carbon copy email address
			 * @public
			 */
			triggerEmail: function(sEmail, sSubject, sBody, sCC, sBCC) {
				this.redirect(this.normalizeEmail.apply(0, arguments));
			},

			toString : function() {
				return "sap.m.URLHelper";
			}
		});

	}());


	/**
	 * Helper for rendering themable background.
	 *
	 * @namespace
	 * @since 1.12
	 * @protected
	 */
	thisLib.BackgroundHelper = {
		/**
		 * Adds CSS classes and styles to the given RenderManager, depending on the given configuration for background color and background image.
		 * To be called by control renderers supporting the global themable background image within their root tag, before they call writeClasses() and writeStyles().
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager
		 * @param {sap.ui.core.CSSColor} [sBgColor] A configured custom background color for the control, if any
		 * @param {sap.ui.core.URI} [sBgImgUrl] The configured custom background image for the control, if any
		 *
		 * @protected
		 */
		addBackgroundColorStyles: function(rm, sBgColor, sBgImgUrl, sCustomBGClass) {
			rm.class(sCustomBGClass || "sapUiGlobalBackgroundColor");

			if (sBgColor && !DataType.getType("sap.ui.core.CSSColor").isValid(sBgColor)) {
				Log.warning(sBgColor + " is not a valid sap.ui.core.CSSColor type");
				sBgColor = "";
			}
			if (sBgColor || sBgImgUrl) { // when an image or color is configured, the gradient needs to be removed, so the color can be seen behind the image
				rm.style("background-image", "none");
				rm.style("filter", "none");
			}
			if (sBgColor) {
				rm.style("background-color", sBgColor);
			}
		},


		/*
		 * @protected
		 * @returns
		 */
		/* currently not needed
		isThemeBackgroundImageModified: function() {
			var Parameters = sap.ui.requireSync("sap/ui/core/theming/Parameters");
			var sBgImgUrl = Parameters.get('sapUiGlobalBackgroundImage'); // the global background image from the theme
			if (sBgImgUrl && sBgImgUrl !== "''") {
				var sBgImgUrlDefault = Parameters.get('sapUiGlobalBackgroundImageDefault');
				if (sBgImgUrl !== sBgImgUrlDefault) {
					return true;
				}
			}
			return false;
		},
		*/

		/**
		 * Renders an HTML tag into the given RenderManager which carries the background image which is either configured and given or coming from the current theme.
		 * Should be called right after the opening root tag has been completed, so this is the first child element inside the control.
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager
		 * @param {sap.ui.core.Control} oControl Control within which the tag will be rendered; its ID will be used to generate the element ID
		 * @param {string|string[]}  vCssClass A CSS class or an array of CSS classes to add to the element
		 * @param {sap.ui.core.URI}  [sBgImgUrl] The image of a configured background image; if this is not given, the theme background will be used and also the other settings are ignored.
		 * @param {boolean} [bRepeat] Whether the background image should be repeated/tiled (or stretched)
		 * @param {float}   [fOpacity] The background image opacity, if any
		 *
		 * @protected
		 */
		renderBackgroundImageTag: function(rm, oControl, vCssClass, sBgImgUrl, bRepeat, fOpacity) {
			rm.openStart("div", oControl.getId() + "-BG");

			if (Array.isArray(vCssClass)) {
				for (var i = 0; i < vCssClass.length; i++) {
					rm.class(vCssClass[i]);
				}
			} else {
				rm.class(vCssClass);
			}

			rm.class("sapUiGlobalBackgroundImage"); // this adds the background image from the theme

			if (sBgImgUrl) { // use the settings only if a background image is configured
				rm.style("display", "block"); // enforce visibility even if a parent has also a background image
				rm.style("background-image", "url(" + encodeCSS(sBgImgUrl) + ")");

				rm.style("background-repeat", bRepeat ? "repeat" : "no-repeat");
				if (!bRepeat) {
					rm.style("background-size", "cover");
					rm.style("background-position", "center");
				} else { // repeat
					rm.style("background-position", "left top");
				}

			} //else {
				// the theme defines the background
			//}

			if (fOpacity !== 1) {
				if (fOpacity > 1) { // greater than 1 enforces 1
					fOpacity = 1;
				}
				rm.style("opacity", fOpacity);
			}

			// no custom class from the control's custom class
			// If a class is added using addStyleClass, this class will be output to this background image div without the 'false' param.
			rm.openEnd();
			rm.close("div");
		}
	};

	/**
	 * Helper for Images.
	 *
	 * @namespace
	 * @since 1.12
	 * @protected
	 */
	thisLib.ImageHelper = (function() {

		/**
		 * Checks if value is not undefined, in which case the
		 * setter function for a given property is called.
		 * Returns true if value is set, false otherwise.
		 *
		 * @private
		 */
		function checkAndSetProperty(oControl, property, value) {
			if (value !== undefined) {
				var fSetter = oControl['set' + capitalize(property)];
				if (typeof (fSetter) === "function") {
					fSetter.call(oControl, value);
					return true;
				}
			}
			return false;
		}
		/** @lends sap.m.ImageHelper */
		var oImageHelper = {
			/**
			 * Creates or updates an image control.
			 *
			 * @param {string} sImgId UD of the image to be dealt with.
			 * @param {sap.m.Image} oImageControl The image to update. If undefined, a new image will be created.
			 * @param {sap.ui.core.Control} oParent oImageControl's parentControl.
			 * @param {object} mProperties Settings for the image control; the <code>src</code> property
			 * MUST be contained; the keys of the object must be valid names of image settings
			 * @param {string[]} aCssClassesToAdd Array of CSS classes which will be added if the image needs to be created.
			 * @param {string[]} aCssClassesToRemove All CSS classes that oImageControl has and which are contained in this array
			 * are removed before adding the CSS classes listed in aCssClassesToAdd.
			 * @returns {sap.m.Image|sap.ui.core.Icon} The new or updated image control or icon
			 *
			 * @protected
			 */
			getImageControl: function(sImgId, oImage, oParent, mProperties, aCssClassesToAdd, aCssClassesToRemove) {
				assert( mProperties.src , "sap.m.ImageHelper.getImageControl: mProperties do not contain 'src'");

				// make sure, image is rerendered if icon source has changed
				if (oImage && (oImage.getSrc() != mProperties.src)) {
					oImage.destroy();
					oImage = undefined;
				}
				// update or create image control
				if (oImage && (oImage instanceof sap.m.Image || oImage instanceof sap.ui.core.Icon)) {
					//Iterate through properties
					for (var key in mProperties) {
						checkAndSetProperty(oImage, key,  mProperties[key]);
					}
				} else {
					var Image = sap.ui.require("sap/m/Image") || sap.ui.requireSync("sap/m/Image");
					//add 'id' to properties. This is required by utility method 'createControlByURI'
					var mSettings = Object.assign({}, mProperties, {id: sImgId});
					oImage = sap.ui.core.IconPool.createControlByURI(mSettings, Image);
					//Set the parent so the image gets re-rendered, when the parent is
					oImage.setParent(oParent, null, true);
				}

				//Remove existing style classes which are contained in aCssClassesToRemove
				//(the list of CSS classes allowed for deletion) to have them updated later on
				//Unfortunately, there is no other way to do this but remove
				//each class individually
				if (aCssClassesToRemove) {
					for (var l = 0, removeLen = aCssClassesToRemove.length; l !== removeLen; l++) {
						oImage.removeStyleClass(aCssClassesToRemove[l]);
					}
				}
				//Add style classes if necessary
				if (aCssClassesToAdd) {
					for (var k = 0, len = aCssClassesToAdd.length; k !== len; k++) {
						oImage.addStyleClass(aCssClassesToAdd[k]);
					}
				}
				return oImage;
			}
		};
		return oImageHelper;
	}());

	/**
	 * Helper for Popups.
	 *
	 * @namespace
	 * @since 1.16.7
	 * @protected
	 */
	thisLib.PopupHelper = {
		/**
		 * Converts the given percentage value to an absolute number based on the given base size.
		 *
		 * @param {string} sPercentage A percentage value in string format, for example "25%"
		 * @param {float} fBaseSize A float number which the calculation is based on.
		 * @returns {int} The calculated size string with "px" as unit or null when the format of given parameter is wrong.
		 *
		 * @protected
		 */
		calcPercentageSize: function(sPercentage, fBaseSize){
			if (typeof sPercentage !== "string") {
				Log.warning("sap.m.PopupHelper: calcPercentageSize, the first parameter" + sPercentage + "isn't with type string");
				return null;
			}

			if (sPercentage.indexOf("%") <= 0) {
				Log.warning("sap.m.PopupHelper: calcPercentageSize, the first parameter" + sPercentage + "is not a percentage string (for example '25%')");
				return null;
			}

			var fPercent = parseFloat(sPercentage) / 100,
				fParsedBaseSize = parseFloat(fBaseSize);

			return Math.floor(fPercent * fParsedBaseSize) + "px";
		}
	};

	/**
	 * Suggestion helper for <code>sap.m.Input</code> fields when used with an OData model.
	 *
	 * Creates a multi-column suggest list for an <code>sap.m.Input</code> field based on a <code>ValueList</code>
	 * annotation. The <code>ValueList</code> annotation will be resolved via the binding information of the input field.
	 *
	 * If the annotation describes multiple input parameters, the suggest provider will resolve all of these relative
	 * to the context of the input field and use them for the suggest query. The suggest provider will write all
	 * values that are described as output parameters back to the model (relative to the context of the input field).
	 * This can only be done if the model runs in "TwoWay" binding mode. Both features can be switched off via the
	 * <code>bResolveInput/bResolveOutput</code> parameter of the suggest function.
	 *
	 * @namespace
	 * @since 1.21.2
	 * @public
	 */
	thisLib.InputODataSuggestProvider = (function(){
		var _fnSuggestionItemSelected = function(oEvent) {
			var oCtrl = oEvent.getSource();
			var mValueListAnnotation = oCtrl.data(oCtrl.getId() + "-#valueListAnnotation");
			var oModel = oCtrl.getModel();
			var oInputBinding = oCtrl.getBinding("value");
			var sInputPath = oModel.resolve(oInputBinding.getPath(), oInputBinding.getContext());

			if (!mValueListAnnotation) {
				return;
			}
			var oRow = oEvent.getParameter("selectedRow");
			jQuery.each(oRow.getCells(), function(iIndex, oCell) {
				var oCellBinding =  oCell.getBinding("text");
				jQuery.each(mValueListAnnotation.outParameters, function(sKey, oObj) {
					if (!oObj.displayOnly && oObj.value == oCellBinding.getPath()) {
						var oValue = oCellBinding.getValue();
						var sValuePath = oModel.resolve(sKey, oInputBinding.getContext());
						if (oValue && sValuePath !== sInputPath) {
							oModel.setProperty(sValuePath, oValue);
						}
					}
				});
			});
			return true;
		};
		var _setValueListAnnotationData = function(oCtrl, bResolveOutput) {
			var oModel = oCtrl.getModel();
			var oMetadata = oModel.oMetadata;

			var sPath = oModel.resolve(oCtrl.getBindingPath("value"), oCtrl.getBindingContext());

			var mValueListAnnotation = {};
			mValueListAnnotation.searchSupported = false;
			mValueListAnnotation.collectionPath = "";
			mValueListAnnotation.outParameters = {};
			mValueListAnnotation.inParameters = {};
			mValueListAnnotation.selection = [];

			var oAnnotation = oModel.getProperty(sPath + "/#com.sap.vocabularies.Common.v1.ValueList");
			if (!oAnnotation) {
				return false;
			}
			var sProperty = sPath.substr(sPath.lastIndexOf('/') + 1);
			mValueListAnnotation.inProperty = sProperty;

			jQuery.each(oAnnotation.record, function(i, aPropertyValues){
				jQuery.each(aPropertyValues, function(j, oPropertyValue){
					if (oPropertyValue.property === "SearchSupported" && oPropertyValue.bool) {
						mValueListAnnotation.searchSupported = true;
					}
					if (oPropertyValue.property === "CollectionPath") {
						mValueListAnnotation.collectionPath = oPropertyValue.string;
					}
					if (oPropertyValue.property === "Parameters") {
						jQuery.each(oPropertyValue.collection.record, function(k, oRecord) {
							if (oRecord.type === "com.sap.vocabularies.Common.v1.ValueListParameterIn") {
								var sLocalProperty;
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "LocalDataProperty") {
										sLocalProperty = oPropVal.propertyPath;
									}
								});
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "ValueListProperty") {
										mValueListAnnotation.inParameters[sLocalProperty] = {value:oPropVal.string};
									}
								});
							} else if (oRecord.type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut") {
								var sLocalProperty;
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "LocalDataProperty") {
										sLocalProperty = oPropVal.propertyPath;
									}
								});
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "ValueListProperty") {
										mValueListAnnotation.outParameters[sLocalProperty] = {value:oPropVal.string};
										mValueListAnnotation.inParameters[sLocalProperty] = {value:oPropVal.string};
									}
								});
							} else if (oRecord.type === "com.sap.vocabularies.Common.v1.ValueListParameterOut") {
								var sLocalProperty;
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "LocalDataProperty") {
										sLocalProperty = oPropVal.propertyPath;
									}
								});
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "ValueListProperty") {
										mValueListAnnotation.outParameters[sLocalProperty] = {value:oPropVal.string};
									}
								});
							} else if (oRecord.type === "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly") {
								var sLocalProperty;
								jQuery.each(oRecord.propertyValue, function(m, oPropVal) {
									if (oPropVal.property === "ValueListProperty") {
										mValueListAnnotation.outParameters[oPropVal.string] = {value:oPropVal.string, displayOnly:true};
									}
								});
							}
						});
					}
				});
			});
			mValueListAnnotation.resultEntity = oMetadata._getEntityTypeByPath("/" + mValueListAnnotation.collectionPath);
			mValueListAnnotation.listItem = new sap.m.ColumnListItem();
			jQuery.each(mValueListAnnotation.outParameters, function(sKey, oObj) {
				mValueListAnnotation.listItem.addCell(new sap.m.Text({text:"{" + oObj.value + "}", wrapping:false}));
				oCtrl.addSuggestionColumn(new sap.m.Column({header: new sap.m.Text({text:"{/#" + mValueListAnnotation.resultEntity.name + "/" + oObj.value + "/@sap:label}", wrapping:false})}));
				mValueListAnnotation.selection.push(oObj.value);
			});
			oCtrl.data(oCtrl.getId() + "-#valueListAnnotation",mValueListAnnotation);
			if (bResolveOutput) {
				oCtrl.attachSuggestionItemSelected(_fnSuggestionItemSelected);
			}
		};
		/** @lends sap.m.InputODataSuggestProvider */
		var oInputODataSuggestProvider = {

			/**
			 * @param {sap.ui.base.Event} oEvent
			 * @param {boolean} bResolveInput SuggestProvider resolves all input parameters for the data query
			 * @param {boolean} bResolveOutput SuggestProvider writes back all output parameters.
			 * @param {int} iLength If iLength is provided only these number of entries will be requested.
			 * @public
			 */
			suggest: function(oEvent, bResolveInput, bResolveOutput, iLength){
				var mValueListAnnotation,
					oCtrl = oEvent.getSource();

				bResolveInput = bResolveInput === undefined ? true : bResolveInput;
				bResolveOutput = bResolveOutput === undefined ? true : bResolveOutput;

				if (!oCtrl.data(oCtrl.getId() + "-#valueListAnnotation")) {
					_setValueListAnnotationData(oCtrl, bResolveOutput);
				}
				mValueListAnnotation = oCtrl.data(oCtrl.getId() + "-#valueListAnnotation");

				if (!mValueListAnnotation) {
					return;
				}
				var _fnButtonHandler = function(oEvent) {
					var iBindingLength = this.getLength();
					if (iBindingLength && iBindingLength <= iLength) {
						oCtrl.setShowTableSuggestionValueHelp(false);
					} else {
						oCtrl.setShowTableSuggestionValueHelp(true);
					}
				};
				if (mValueListAnnotation.searchSupported) {
					var aFilters = [];
					var sSearchFocus, oCustomParams = {};
					if (bResolveInput) {
						jQuery.each(mValueListAnnotation.inParameters, function(sKey, oObj) {
							if (sKey == mValueListAnnotation.inProperty) {
								sSearchFocus = oObj.value;
							} else if (bResolveInput) {
								var oValue = oCtrl.getModel().getProperty(sKey,oCtrl.getBinding("value").getContext());
								if (oValue) {
									aFilters.push(new sap.ui.model.Filter(oObj.value, sap.ui.model.FilterOperator.StartsWith,oValue));
								}
							}
						});
					}
					oCustomParams.search = oEvent.getParameter("suggestValue");

					if (mValueListAnnotation.inParameters.length) {
						if (sSearchFocus) {
							oCustomParams["search-focus"] = sSearchFocus;
						} else {
							assert(false, 'no search-focus defined');
						}
					}

					oCtrl.bindAggregation("suggestionRows",{
						path:"/" + mValueListAnnotation.collectionPath,
						length: iLength,
						filters: aFilters,
						parameters: {
							select: mValueListAnnotation.selection.join(','),
							custom: oCustomParams
						},
						events: {
							dataReceived: _fnButtonHandler
						},
						template: mValueListAnnotation.listItem
					});
				} else {
					//create filter array
					var aFilters = [];
					jQuery.each(mValueListAnnotation.inParameters, function(sKey, oObj) {
						if (sKey == mValueListAnnotation.inProperty) {
							aFilters.push(new sap.ui.model.Filter(oObj.value, sap.ui.model.FilterOperator.StartsWith,oEvent.getParameter("suggestValue")));
						} else if (bResolveInput) {
							var oValue = oCtrl.getModel().getProperty(sKey,oCtrl.getBinding("value").getContext());
							if (oValue) {
								aFilters.push(new sap.ui.model.Filter(oObj.value, sap.ui.model.FilterOperator.StartsWith,oValue));
							}
						}
					});
					oCtrl.bindAggregation("suggestionRows",{
						path:"/" + mValueListAnnotation.collectionPath,
						filters: aFilters,
						template: mValueListAnnotation.listItem,
						length: iLength,
						parameters: {
							select: mValueListAnnotation.selection.join(',')
						},
						events: {
							dataReceived: _fnButtonHandler
						}
					});
				}
			}
		};
		return oInputODataSuggestProvider;
	}());

	// implement Form helper factory with m controls
	// possible is set before layout lib is loaded.
	ObjectPath.set("sap.ui.layout.form.FormHelper", {
		createLabel: function(sText, sId){
			return new sap.m.Label(sId, {text: sText});
		},
		createButton: function(sId, fnPressFunction, fnCallback){
			var that = this;
			var _createButton = function(Button){
				var oButton = new Button(sId, {type: thisLib.ButtonType.Transparent});
				oButton.attachEvent('press', fnPressFunction, that); // attach event this way to have the right this-reference in handler
				fnCallback.call(that, oButton);
			};
			var fnButtonClass = sap.ui.require("sap/m/Button");
			if (fnButtonClass) {
				// already loaded -> execute synchronously
				_createButton(fnButtonClass);
			} else {
				sap.ui.require(["sap/m/Button"], _createButton);
			}
		},
		setButtonContent: function(oButton, sText, sTooltip, sIcon, sIconHovered){
			oButton.setText(sText);
			oButton.setTooltip(sTooltip);
			oButton.setIcon(sIcon);
			oButton.setActiveIcon(sIconHovered);
		},
		addFormClass: function(){ return "sapUiFormM"; },
		setToolbar: function(oToolbar){
			var oOldToolbar = this.getToolbar();
			if (oOldToolbar && oOldToolbar.setDesign) {
				// check for setDesign because we don't know what kind of custom toolbars might be used.
				oOldToolbar.setDesign(oOldToolbar.getDesign(), true);
			}
			if (oToolbar && oToolbar.setDesign) {
				oToolbar.setDesign(sap.m.ToolbarDesign.Transparent, true);
			}
			return oToolbar;
		},
		bArrowKeySupport: false, /* disables the keyboard support for arrow keys */
		bFinal: true
	});

	//implement FileUploader helper factory with m controls
	ObjectPath.set("sap.ui.unified.FileUploaderHelper", {
		createTextField: function(sId){
			var oTextField = new sap.m.Input(sId);
			return oTextField;
		},
		setTextFieldContent: function(oTextField, sWidth){
			oTextField.setWidth(sWidth);
		},
		createButton: function(sId){
			var oButton = new sap.m.Button(sId);
			return oButton;
		},
		addFormClass: function(){ return "sapUiFUM"; },
		bFinal: true
	});

	// implements ColorPicker helper factory with common controls
	ObjectPath.set("sap.ui.unified.ColorPickerHelper", {
		isResponsive: function () {
			return true;
		},
		factory: {
			createLabel: function (mConfig) {
				return new sap.m.Label(mConfig);
			},
			createInput: function (sId, mConfig) {
				return new sap.m.InputBase(sId, mConfig);
			},
			createSlider: function (sId, mConfig) {
				return new sap.m.Slider(sId, mConfig);
			},
			createRadioButtonGroup: function (mConfig) {
				return new sap.m.RadioButtonGroup(mConfig);
			},
			createRadioButtonItem: function (mConfig) {
				return new sap.m.RadioButton(mConfig);
			},
			createButton: function (sId, mConfig) {
				return new sap.m.Button(sId, mConfig);
			}
		},
		bFinal: true
	});

	//implement table helper factory with m controls
	//possible is set before layout lib is loaded.
	ObjectPath.set("sap.ui.table.TableHelper", {
		createLabel: function(mConfig){
			return new sap.m.Label(mConfig);
		},
		createTextView: function(mConfig){
			return new sap.m.Label(mConfig);
		},
		addTableClass: function() { return "sapUiTableM"; },
		bFinal: true /* This table helper wins, even when commons helper was set before */
	});

	ObjectPath.set("sap.ui.layout.GridHelper", {
		getLibrarySpecificClass: function () {
			return "";
		},
		bFinal: true
	});

	/* Android and Blackberry browsers do not scroll a focused input into the view correctly after resize */
	if (Device.os.blackberry || Device.os.android && Device.os.version >= 4) {
		jQuery(window).on("resize", function(){
			var oActive = document.activeElement;
			var sTagName = oActive ? oActive.tagName : "";
			if (sTagName == "INPUT" || sTagName == "TEXTAREA") {
				setTimeout(function(){
					oActive.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
	}

	// ES6 constant represents the maximum safe integer
	if (!Number.MAX_SAFE_INTEGER) {
		Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
	}

	return thisLib;
});
