/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.m.
 */
sap.ui.define([
 "sap/base/i18n/Formatting",
 "sap/ui/core/Lib",
 "sap/ui/Device",
 "sap/ui/base/DataType",
 "sap/ui/base/EventProvider",
 "sap/ui/core/Control",
 "sap/ui/core/Locale",
 "sap/ui/util/openWindow",
 // library dependency
 "sap/ui/core/library",
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
 "./IllustratedMessageSize",
 "./IllustratedMessageType",
 "./upload/UploaderHttpRequestMethod",
 "sap/ui/core/theming/Parameters",
 "sap/ui/core/LocaleData",
 // referenced here to enable the Support feature
 "./Support"
],
	function(
	 Formatting,
	 Library,
	 Device,
	 DataType,
	 EventProvider,
	 Control,
	 Locale,
	 openWindow,
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
	 AvatarImageFitType,
	 IllustratedMessageSize,
	 IllustratedMessageType,
	 UploaderHttpRequestMethod,
	 Parameters,
	 LocaleData
	) {
	 "use strict";

	 /**
	  * The main UI5 control library, with responsive controls that can be used in touch devices as well as desktop browsers.
	  *
	  * @namespace
	  * @alias sap.m
	  * @author SAP SE
	  * @version ${version}
	  * @since 1.4
	  * @public
	  */
	 var thisLib = Library.init({
		 apiVersion: 2,
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
		  "sap.m.BadgeState",
		  "sap.m.BadgeAnimationType",
		  "sap.m.BarDesign",
		  "sap.m.BorderDesign",
		  "sap.m.BreadcrumbsSeparatorStyle",
		  "sap.m.ButtonAccessibleRole",
		  "sap.m.ButtonType",
		  "sap.m.CarouselArrowsPlacement",
		  "sap.m.DeviationIndicator",
		  "sap.m.DialogRoleType",
		  "sap.m.DialogType",
		  "sap.m.DraftIndicatorState",
		  "sap.m.DynamicDateRangeGroups",
		  "sap.m.EmptyIndicatorMode",
		  "sap.m.FacetFilterListDataType",
		  "sap.m.FacetFilterType",
		  "sap.m.FilterPanelField",
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
		  "sap.m.Priority",
		  "sap.m.GenericTileScope",
		  "sap.m.HeaderLevel",
		  "sap.m.IBarHTMLTag",
		  "sap.m.IconTabDensityMode",
		  "sap.m.IconTabFilterDesign",
		  "sap.m.IconTabFilterInteractionMode",
		  "sap.m.IconTabHeaderMode",
		  "sap.m.IllustratedMessageSize",
		  "sap.m.IllustratedMessageType",
		  "sap.m.ImageMode",
		  "sap.m.InputTextFormatMode",
		  "sap.m.InputType",
		  "sap.m.LabelDesign",
		  "sap.m.LightBoxLoadingStates",
		  "sap.m.LinkConversion",
		  "sap.m.LinkAccessibleRole",
		  "sap.m.ListGrowingDirection",
		  "sap.m.ListKeyboardMode",
		  "sap.m.ListMode",
		  "sap.m.ListSeparators",
		  "sap.m.ListType",
		  "sap.m.LoadState",
		  "sap.m.MenuButtonMode",
		  "sap.m.MultiSelectMode",
		  "sap.m.ObjectHeaderPictureShape",
		  "sap.m.ObjectMarkerType",
		  "sap.m.ObjectMarkerVisibility",
		  "sap.m.OverflowToolbarPriority",
		  "sap.m.P13nPopupMode",
		  "sap.m.P13nPanelType",
		  "sap.m.P13nConditionOperation",
		  "sap.m.PageBackgroundDesign",
		  "sap.m.PanelAccessibleRole",
		  "sap.m.PDFViewerDisplayType",
		  "sap.m.PlacementType",
		  "sap.m.CarouselPageIndicatorPlacementType",
		  "sap.m.PlanningCalendarBuiltInView",
		  "sap.m.PlanningCalendarStickyMode",
		  "sap.m.PopinDisplay",
		  "sap.m.PopinLayout",
		  "sap.m.QuickViewGroupElementType",
		  "sap.m.RatingIndicatorVisualMode",
		  "sap.m.ScreenSize",
		  "sap.m.CarouselScrollMode",
		  "sap.m.SelectColumnRatio",
		  "sap.m.SelectionDetailsActionLevel",
		  "sap.m.SelectListKeyboardNavigationMode",
		  "sap.m.SelectDialogInitialFocus",
		  "sap.m.SelectType",
		  "sap.m.Size",
		  "sap.m.SplitAppMode",
		  "sap.m.StandardDynamicDateRangeKeys",
		  "sap.m.StandardTileType",
		  "sap.m.StepInputStepModeType",
		  "sap.m.StepInputValidationMode",
		  "sap.m.Sticky",
		  "sap.m.StringFilterOperator",
		  "sap.m.SwipeDirection",
		  "sap.m.SwitchType",
		  "sap.m.TabsOverflowMode",
		  "sap.m.ContentConfigType",
		  "sap.m.TileInfoColor",
		  "sap.m.TileSizeBehavior",
		  "sap.m.TimePickerMaskMode",
		  "sap.m.TitleAlignment",
		  "sap.m.ExpandableTextOverflowMode",
		  "sap.m.TokenizerRenderMode",
		  "sap.m.ToolbarDesign",
		  "sap.m.ToolbarStyle",
		  "sap.m.UploadState",
		  "sap.m.UploadType",
		  "sap.m.ValueColor",
		  "sap.m.ValueCSSColor",
		  "sap.m.VerticalPlacementType",
		  "sap.m.WrappingType",
		  "sap.m.SinglePlanningCalendarSelectionMode",
		  "sap.m.WizardRenderMode",
		  "sap.m.ResetAllMode",
		  "sap.m.SharingMode",
		  "sap.m.plugins.CopyPreference",
		  "sap.m.plugins.ContextMenuScope",
		  "sap.m.semantic.SemanticRuleSetType",
		  "sap.m.table.columnmenu.Category",
		  "sap.m.upload.UploaderHttpRequestMethod",
		  "sap.m.UploadSetwithTableActionPlaceHolder"
		 ],
		 interfaces: [
			 "sap.m.IBar",
			 "sap.m.IBadge",
			 "sap.m.IBreadcrumbs",
			 "sap.m.ITableItem",
			 "sap.m.p13n.IContent",
			 "sap.m.IconTab",
			 "sap.m.IScale",
			 "sap.m.semantic.IGroup",
			 "sap.m.semantic.IFilter",
			 "sap.m.semantic.ISort",
			 "sap.m.ObjectHeaderContainer",
			 "sap.m.IOverflowToolbarContent",
			 "sap.m.IOverflowToolbarFlexibleContent",
			 "sap.m.IToolbarInteractiveControl",
			 "sap.m.IHyphenation"
		 ],
		 controls: [
		  "sap.m.ActionListItem",
		  "sap.m.ActionSheet",
		  "sap.m.ActionTile",
		  "sap.m.ActionTileContent",
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
		  "sap.m.TileAttribute",
		  "sap.m.CustomListItem",
		  "sap.m.CustomTreeItem",
		  "sap.m.DatePicker",
		  "sap.m.DateRangeSelection",
		  "sap.m.DateTimeField",
		  "sap.m.DateTimePicker",
		  "sap.m.Dialog",
		  "sap.m.DisplayListItem",
		  "sap.m.DraftIndicator",
		  "sap.m.DynamicDateRange",
		  "sap.m.ExpandableText",
		  "sap.m.AdditionalTextButton",
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
		  "sap.m.HBox",
		  "sap.m.HeaderContainer",
		  "sap.m.IconTabBar",
		  "sap.m.IconTabBarSelectList",
		  "sap.m.IconTabFilterExpandButtonBadge",
		  "sap.m.IconTabHeader",
		  "sap.m.IllustratedMessage",
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
		  "sap.m.MessagePopover",
		  "sap.m.MessageView",
		  "sap.m.MessageStrip",
		  "sap.m.MultiComboBox",
		  "sap.m.MultiInput",
		  "sap.m.NavContainer",
		  "sap.m.NewsContent",
		  "sap.m.NumericContent",
		  "sap.m.NotificationList",
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
		  "sap.m.OverflowToolbarMenuButton",
		  "sap.m.P13nSelectionPanel",
		  "sap.m.P13nConditionPanel",
		  "sap.m.P13nFilterPanel",
		  "sap.m.P13nPanel",
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
		  "sap.m.SelectDialogBase",
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
		  "sap.m.Switch",
		  "sap.m.Table",
		  "sap.m.TableSelectDialog",
		  "sap.m.TabContainer",
		  "sap.m.TabStrip",
		  "sap.m.Text",
		  "sap.m.TextArea",
		  "sap.m.TileContent",
		  "sap.m.TimePicker",
		  "sap.m.TimePickerInputs",
		  "sap.m.TimePickerClock",
		  "sap.m.TimePickerClocks",
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
		  "sap.m.upload.UploadSet",
		  "sap.m.upload.UploadSetToolbarPlaceholder",
		  "sap.m.upload.UploadSetwithTable",
		  "sap.m.upload.UploadSetwithTableItem",
		  "sap.m.VariantManagement",
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
		  "sap.m.semantic.MasterPage",
		  "sap.m.p13n.AbstractContainer",
		  "sap.m.p13n.BasePanel",
		  "sap.m.p13n.Container",
		  "sap.m.p13n.GroupPanel",
		  "sap.m.p13n.QueryPanel",
		  "sap.m.p13n.SelectionPanel",
		  "sap.m.p13n.SortPanel",
		  "sap.m.p13n.Popup",
		  "sap.m.table.columnmenu.Menu"
		 ],
		 elements: [
		  "sap.m.BadgeCustomData",
		  "sap.m.CarouselLayout",
		  "sap.m.Column",
		  "sap.m.ColumnPopoverActionItem",
		  "sap.m.ColumnPopoverCustomItem",
		  "sap.m.ColumnPopoverItem",
		  "sap.m.ColumnPopoverSortItem",
		  "sap.m.ContentConfig",
		  "sap.m.DynamicDateOption",
		  "sap.m.DynamicDateValueHelpUIType",
		  "sap.m.FlexItemData",
		  "sap.m.FeedListItemAction",
		  "sap.m.IconTabFilter",
		  "sap.m.IconTabSeparator",
		  "sap.m.ImageCustomData",
		  "sap.m.LightBoxItem",
		  "sap.m.LinkTileContent",
		  "sap.m.OverflowToolbarLayoutData",
		  "sap.m.MaskInputRule",
		  "sap.m.MenuItem",
		  "sap.m.MessageItem",
		  "sap.m.PageAccessibleLandmarkInfo",
		  "sap.m.P13nFilterItem",
		  "sap.m.P13nItem",
		  "sap.m.PlanningCalendarRow",
		  "sap.m.PlanningCalendarView",
		  "sap.m.QuickViewGroup",
		  "sap.m.QuickViewGroupElement",
		  "sap.m.ResponsiveScale",
		  "sap.m.SegmentedButtonItem",
		  "sap.m.SelectionDetailsItem",
		  "sap.m.SelectionDetailsItemLine",
		  "sap.m.SinglePlanningCalendarDayView",
		  "sap.m.SinglePlanningCalendarMonthView",
		  "sap.m.SinglePlanningCalendarWeekView",
		  "sap.m.SinglePlanningCalendarWorkWeekView",
		  "sap.m.SinglePlanningCalendarView",
		  "sap.m.StandardDynamicDateOption",
		  "sap.m.SuggestionItem",
		  "sap.m.TabContainerItem",
		  "sap.m.TabStripItem",
		  "sap.m.ToolbarLayoutData",
		  "sap.m.TileInfo",
		  "sap.m.upload.FilePreviewDialog",
		  "sap.m.upload.Uploader",
		  "sap.m.upload.UploaderTableItem",
		  "sap.m.upload.UploadSetItem",
		  "sap.m.upload.FilePreviewDialog",
		  "sap.m.VariantItem",
		  "sap.m.ViewSettingsCustomItem",
		  "sap.m.ViewSettingsCustomTab",
		  "sap.m.ViewSettingsFilterItem",
		  "sap.m.ViewSettingsItem",
		  "sap.m.plugins.CellSelector",
		  "sap.m.plugins.ColumnResizer",
		  "sap.m.plugins.CopyProvider",
		  "sap.m.plugins.DataStateIndicator",
		  "sap.m.plugins.PasteProvider",
		  "sap.m.plugins.PluginBase",
		  "sap.m.p13n.AbstractContainerItem",
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
		  "sap.m.semantic.SortSelect",
		  "sap.m.table.columnmenu.Entry",
		  "sap.m.table.columnmenu.ActionItem",
		  "sap.m.table.columnmenu.Item",
		  "sap.m.table.columnmenu.ItemBase",
		  "sap.m.table.columnmenu.QuickAction",
		  "sap.m.table.columnmenu.QuickActionBase",
		  "sap.m.plugins.UploadSetwithTable",
		  "sap.m.upload.UploadItemConfiguration",
		  "sap.m.upload.UploadItem"
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
				 "sap.m.ExpandableText": "sap/m/flexibility/ExpandableText",
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
				 "sap.m.IconTabBar": "sap/m/flexibility/IconTabBar",

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
				 "sap.m.SearchField": {
					 "hideControl": "default",
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
				 },
				 "sap.m.ObjectHeader": {
					 "moveControls": "default"
				 },
				 "sap.m.upload.UploadSetwithTable":"sap/m/upload/p13n/flexibility/UploadSetwithTable"
			 },
			 //Configuration used for rule loading of Support Assistant
			 "sap.ui.support": {
				 publicRules:true,
				 internalRules:true
			 }
		 }
	 });

	 thisLib.upload = thisLib.upload || {};

	 thisLib.upload.UploaderHttpRequestMethod = UploaderHttpRequestMethod;



	 /**
	  * Available Background Design.
	  *
	  * @enum {string}
	  * @public
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
	 *  Defines the placeholder type for the control to be replaced.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.120
	 */
	 thisLib.UploadSetwithTableActionPlaceHolder = {
		/**
		 * Placeholder for variant management.
		 * @deprecated As of version 1.124, the concept has been discarded.
		 * @public
		 */
		VariantManagementPlaceholder: "VariantManagementPlaceholder",
		/**
		 * Placeholder for personalization settings button.
		 * @deprecated As of version 1.124, the concept has been discarded.
		 * @public
		 */
		PersonalizationSettingsPlaceholder: "PersonalizationSettingsPlaceholder",
		/**
		 * Placeholder for upload button control.
		 * @public
		 */
		UploadButtonPlaceholder : "UploadButtonPlaceholder",
		/**
		 * Placeholder for cloud file picker button.
		 * @public
		*/
		CloudFilePickerButtonPlaceholder : "CloudFilePickerButtonPlaceholder"
	};

	 /**
	  * Types of state of {@link sap.m.BadgeEnabler} to expose its current state.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.81
	  */
	 thisLib.BadgeState = {

		 /**
		  * Informing interested parties that the badge has been updated.
		  * @public
		  */
		 Updated : "Updated",

		 /**
		  * Informing interested parties that the badge has appeared.
		  * @public
		  */
		 Appear : "Appear",

		 /**
		  * Informing interested parties that the badge has disappeared.
		  * @public
		  */
		 Disappear : "Disappear"

	 };

	 /**
	  * Types of animation performed by {@link sap.m.BadgeEnabler}.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.87
	  */
	 thisLib.BadgeAnimationType = {

		 /**
		  * Badge indicator will perform Appear,Update,and Disappear animation.
		  * @public
		  */
		 Full : "Full",

		 /**
		  * Badge indicator will perform only Update animation (suitable for controls, which invalidate often).
		  * @public
		  */
		 Update : "Update",

		 /**
		  * No animation is performed.
		  * @public
		  */
		 None : "None"

	 };

	 /**
	  * Modes in which a control will render empty indicator if its content is empty.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.87
	  */
	 thisLib.EmptyIndicatorMode = {

		 /**
		  * Empty indicator is rendered always when the control's content is empty.
		  * @public
		  */
		 On : "On",

		 /**
		  * Empty indicator is never rendered.
		  * @public
		  */
		 Off : "Off",

		 /**
		  * Empty indicator will be rendered depending on the context in which the control is placed.
		  * If one of the parents has the context class sapMShowEmpty-CTX then the empty indicator will be shown.
		  * @public
		  */
		 Auto : "Auto"

	 };

	 /**
	  * Types of badge rendering style.
	  *
	  * @enum {string}
	  * @private
	  */
	 thisLib.BadgeStyle = {
		 /**
		  * Default style. Use for badges which contain text or numbers.
		  *
		  * @private
		  */
		 Default: "Default",

		 /**
		  * Attention style. This badge is rendered as a single dot meant to grab attention.
		  *
		  * @private
		  */
		 Attention: "Attention"
	 };

	 /**
	  * Types of the Bar design.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.20
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
	  * Available Border Design.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.BorderDesign = {

		 /**
		  * A solid border color dependent on the theme.
		  * @public
		  */
		 Solid : "Solid",

		 /**
		  * Specifies no border.
		  * @public
		  */
		 None : "None"
	 };

	 /**
	  * Variations of the {@link sap.m.Breadcrumbs} separators.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.69
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
		 Neutral : "Neutral",

		 /**
		  * Attention type
		  *
		  * @public
		  * @since 1.77
		  */
		 Attention : "Attention"
	 };

	 /**
	  * Different predefined accessibility types for the {@link sap.m.Button}.
	  *
	  * @enum {string}
	  * @private
	  */
	 thisLib.ButtonAccessibilityType = {
		 /**
		  * Default type
		  *
		  * @private
		  */
		 Default: "Default",

		 /**
		  * Labelled type
		  *
		  * @private
		  */
		 Labelled: "Labelled",

		 /**
		  * Described type
		  *
		  * @private
		  */
		 Described: "Described",

		 /**
		  * Combined type
		  *
		  * @private
		  */
		 Combined: "Combined"
	 };

	 /**
	  * Carousel arrows align.
	  *
	  * @enum {string}
	  * @public
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
	  * Types for the placement of the page indicator of the Carousel control.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.CarouselPageIndicatorPlacementType = {

		 /**
		  * Page indicator will be placed at the top of the Carousel.
		  * @public
		  */
		 Top : "Top",

		 /**
		  * Page indicator will be placed at the bottom of the Carousel.
		  * @public
		  */
		 Bottom : "Bottom",

		 /**
		  * Page indicator will be placed over the Carousel content, top aligned.
		  * @public
		  */
		 OverContentTop : "OverContentTop",

		 /**
		  * Page indicator will be placed over the Carousel content, bottom aligned.
		  * @public
		  */
		 OverContentBottom : "OverContentBottom"
	 };

	 /**
	  * A list of the default built-in views in a {@link sap.m.PlanningCalendar}, described by their keys.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.50
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
	  * Enum for the type of {@link sap.m.Dialog} control.
	  *
	  * @enum {string}
	  * @public
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
	  * @typedef {object} sap.m.DynamicDateRangeValue
	  * @description Defines the <code>value</code> property of the DynamicDateRange control.
	  * 		The object has two properties:
	  * 			'operator' - a string, the key of a DynamicDateOption
	  * 			'values' - an array of parameters for the same option
	  * see {@link sap.m.DynamicDateRange}
	  *
	  * @property {string} operator
	  * 		The key of a DynamicDateOption.
	  * @property {Array<Date|int|string|any>} values
	  * 		An array of parameters for the same option.
	  *
	  * @public
	  * @since 1.111
	  */


	 /**
	  * FacetFilterList data types.
	  *
	  * @enum {string}
	  * @public
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
		  * If the flex item`s inline axes are the same as the cross axis, this value is identical to "Start".
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
	  * @enum {string}
	  * @public
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
	  */
	 thisLib.FrameType = {
	  /**
	   * The 2x2 frame type.
	   * @public
	   */
	  OneByOne : "OneByOne",

	  /**
	   * The 4x2 frame type.
	   * @public
	   */
	  TwoByOne : "TwoByOne",

	  /**
	   * The Auto frame type that adjusts the size of the control to the content.
	   * Support for this type in sap.m.GenericTile is deprecated since 1.48.0.
	   * @protected
	   */
	  Auto : "Auto",

	  /**
	   * The 4x1 frame type.
	   * <b>Note:</b> The 4x1 frame type is currently only supported for Generic tile.
	   * @public
	   * @since 1.83
	   */
	  TwoByHalf: "TwoByHalf",

	  /**
	   * The 2x1 frame type.
	   * <b>Note:</b> The 2x1 frame type is currently only supported for Generic tile.
	   * @public
	   * @since 1.83
	   */
	  OneByHalf: "OneByHalf",

	  /**
	   * The Stretch frame type adjusts the size of the control to the parent.
	   * @since 1.96
	   * @experimental
	   */
	  Stretch: "Stretch"
	 };

	 /**
	  * Enumeration for possible link-to-anchor conversion strategy.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.45.5
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
	  * Enumeration for possible Link accessibility roles.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.104.0
	  */
	 thisLib.LinkAccessibleRole = {

		/**
		 * Default mode.
		 * @public
		 */
		Default: "Default",

		/**
		 * Link will receive <code>role="Button"</code> attibute.
		 * @public
		 */
		Button: "Button"
	};

	 /**
	  * Enumeration for possible Button accessibility roles.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.114.0
	  */
	 thisLib.ButtonAccessibleRole = {

		/**
		 * Default mode.
		 * @public
		 */
		Default: "Default",

		/**
		 * Button will receive <code>role="Link"</code> attibute.
		 * @public
		 */
		Link: "Link"
	};

	 /**
	  * Defines how the input display text should be formatted.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.44.0
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
		  * Action Mode (Two lines for the header).
		  *
		  * Generic Tile renders buttons that are specified under 'actionButtons' aggregation
		  * @public
		  * @experimental since 1.96
		  */
		 ActionMode: "ActionMode",

		 /**
		  * Article Mode (Two lines for the header and one line for the subtitle).
		  *
		  * Enables Article Mode.
		  * @public
		  * @experimental since 1.96
		  */
		 ArticleMode: "ArticleMode",

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
		 LineMode : "LineMode",
		 /**
		  * Icon mode.
		  *
		  * GenericTile displays a combination of icon and header title.
		  *
		  * It is applicable only for the OneByOne FrameType and TwoByHalf FrameType.
		  * @public
		  * @since 1.96
		  * @experimental Since 1.96
		  */
		 IconMode : "IconMode"
	 };

	 /**
	  * Colors to highlight certain UI elements.
	  *
	  * In contrast to the <code>ValueState</code>, the semantic meaning must be defined by the application.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.124
	  * @see {@link fiori:/how-to-use-semantic-colors/ Semantic Colors}
	  */
	 thisLib.TileInfoColor = {

		 /**
		  * Indication Color 1
		  * @public
		  */
		 Indication1 : "Indication1",

		 /**
		  * Indication Color 2
		  * @public
		  */
		 Indication2 : "Indication2",

		 /**
		  * Indication Color 3
		  * @public
		  */
		 Indication3 : "Indication3",

		 /**
		  * Indication Color 4
		  * @public
		  */
		 Indication4 : "Indication4",

		 /**
		  * Indication Color 5
		  * @public
		  */
		 Indication5 : "Indication5",

		 /**
		  * Indication Color 6
		  * @public
		  */
		 Indication6 : "Indication6",

		 /**
		  * Indication Color 7
		  * @public
		  */
		 Indication7 : "Indication7",

		 /**
		  * Indication Color 8
		  * @public
		  */
		 Indication8 : "Indication8",

		 /**
		  * Indication Color 9
		  * @public
		  */
		 Indication9 : "Indication9",

		 /**
		  * Indication Color 10
		  * @public
		  */
		 Indication10 : "Indication10",
		 /**
		  * Critical Text Color
		  * @public
		  */
		 CriticalTextColor: "CriticalTextColor",
		 /**
		  * Warning Background Color
		  * @public
		  */
		 WarningBackground: "WarningBackground",
		 /**
		  * Warning Border Color
		  * @public
		  */
		 WarningBorderColor: "WarningBorderColor",
		 /**
		  * SAP Brand Color
		  * @public
		  */
		 BrandColor: "BrandColor",
		 /**
		  * Information Border Color
		  * @public
		  */
		 InformationBorderColor: "InformationBorderColor",
		 /**
		  * Information Background Color
		  * @public
		  */
		 InformationBackgroundColor: "InformationBackgroundColor",
		 /**
		  * Neutral Element Color
		  * @public
		  */
		 NeutralElementColor: "NeutralElementColor",
		 /**
		  * Neutral Background Color
		  * @public
		  */
		 NeutralBackgroundColor: "NeutralBackgroundColor",
		 /**
		  * Neutral Border Color
		  * @public
		  */
		 NeutralBorderColor: "NeutralBorderColor"

	 };

	 /**
	  * Defines the priority for the TileContent in ActionMode
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.Priority = {

		 /**
		  * It displays very high priority color for the GenericTag
		  * @public
		  */
		 VeryHigh : "VeryHigh",

		 /**
		  * It displays high priority color for the GenericTag
		  * @public
		  */
		 High : "High",

		 /**
		  * It displays medium priority color for the GenericTag
		  * @public
		  */
		 Medium: "Medium",

		 /**
		  * It displays low priority color for the GenericTag
		  * @public
		  */
		 Low: "Low",

		 /**
		  *The priority is not set
		  * @public
		  */
		 None : "None"
	 };

	 /**
	  * Defines the scopes of GenericTile enabling the developer to implement different "flavors" of tiles.
	  *
	  * @enum {string}
	  * @since 1.46.0
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
		 Actions: "Actions",
		 /**
		  * More action scope (Only the More icon is added to the tile)
		  * @since 1.76
		  * @public
		  */
		 ActionMore: "ActionMore",
		 /**
		  * Remove action scope (Only the Remove icon is added to the tile)
		  * @since 1.76
		  * @public
		  */
		 ActionRemove: "ActionRemove"
	 };

	 /**
	  * Specifies <code>IconTabBar</code> tab overflow mode.
	  * @enum {string}
	   * @since 1.90.0
	  * @public
	  */
	 thisLib.TabsOverflowMode = {
		 /**
		  * Default behavior: One overflow tab at the end of the header.
		  * @public
		  */
		 End: "End",
		 /**
		  * Two overflow tabs at both ends of the header to keep tabs order intact.
		  * @public
		  */
		 StartAndEnd: "StartAndEnd"
	 };

	 /**
	  * Defines the rendering type of the TileAttribute
	  *
	  * @enum {string}
	  * @since 1.122
	  * @experimental since 1.122
	  * @public
	  */
	 thisLib.ContentConfigType = {
		 /**
		  * Renders a text inside the TileAttribute
		  * @public
		  */
		 Text: "Text",
		 /**
		  * Renders a link inside the TileAttribute
		  * @public
		  */
		 Link: "Link"
	 };

	 /**
	  * Describes the behavior of tiles when displayed on a small-screened phone (374px wide and lower).
	  *
	  * @enum {string}
	  * @since 1.56.0
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
	  */

	 /**
	  * Interface for controls which implement the notification badge concept.
	  *
	  * @since 1.80
	  * @name sap.m.IBadge
	  * @interface
	  * @public
	  */

	 /**
	  * Interface for controls which have the meaning of a breadcrumbs navigation.
	  *
	  * @since 1.52
	  * @name sap.m.IBreadcrumbs
	  * @interface
	  * @public
	  */

	 /**
	  *
	  * Common interface for sap.m.ColumnListItem and sap.m.GroupHeaderListItem
	  *
	  * @since 1.119
	  * @name sap.m.ITableItem
	  * @interface
	  * @public
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
	  */

	 /**
	  * Returns the number of tickmarks, which should be placed between labels.
	  *
	  * @returns {int} The number of tickmarks
	  *
	  * @function
	  * @name sap.m.IScale.getTickmarksBetweenLabels
	  * @public
	  */

	 /**
	  * Returns how many tickmarks would be drawn on the screen. The start and the end tickmark should be specified in this method.
	  *
	  * @param {float} fSize - Size of the scale. This is the distance between the start and end point i.e. 0..100
	  * @param {float} fStep - The step walking from start to end.
	  * @param {int} iTickmarksThreshold - Limits the number of tickmarks.
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
	  */


	 /**
	  * Marker interface for controls which are suitable as items of the group aggregation of sap.m.Semantic.MasterPage.
	  *
	  * @name sap.m.semantic.IGroup
	  * @interface
	  * @public
	  */

	 /**
	  * Marker interface for controls which are suitable as items of the filter aggregation of sap.m.Semantic.MasterPage.
	  *
	  * @name sap.m.semantic.IFilter
	  * @interface
	  * @public
	  */


	 /**
	  * Marker interface for controls which are suitable as items of the sort aggregation of sap.m.Semantic.MasterPage.
	  *
	  * @name sap.m.semantic.ISort
	  * @interface
	  * @public
	  */

	 /**
	  *
	  * Interface for controls which can have special behavior inside <code>sap.m.OverflowToolbar</code>.
	  * Controls that implement this interface must provide a <code>getOverflowToolbarConfig</code> method
	  * that accepts no arguments and returns an object of type <code>sap.m.OverflowToolbarConfig</code>.
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
	  */

	 /**
	  * Returns the <code>sap.m.OverflowToolbar</code> configuration object.
	  *
	  * @returns {sap.m.OverflowToolbarConfig} Configuration object
	  *
	  * @function
	  * @name sap.m.IOverflowToolbarContent.getOverflowToolbarConfig
	  * @ui5-restricted
	  * @private
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
	  * Available Interaction Modes.
	  *
	  * @enum {string}
	  * @public
	  * @experimental Since 1.121. Behavior might change.
	  */
	 thisLib.IconTabFilterInteractionMode = {

		 /**
		  * The item is selectable if it has own content. Select event will not be fired if it has no own content.
		  * Note: When IconTabHeader is placed in ToolHeader the items will act as selectable items even if they don’t explicitly have content.
		  * @public
		  */
		 Auto : "Auto",

		 /**
		  * The item is selectable and select event will be fired.
		  * @public
		  */
		 Select : "Select",

		 /**
		  * The item is selectable (and select event is fired) only if it doesn't have any sub items. Select event will not be fired if it has sub items.
		  * @public
		  */
		 SelectLeavesOnly : "SelectLeavesOnly"
	 };


	 /**
	 * Determines how the source image is used on the output DOM element.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.30.0
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
		 Background: "Background",

		 /**
		 * The image is rendered with 'div' tag, containing the inline 'svg'
		 * <b>Note:</b> Please, be aware that this feature works under the Browser's Cross-Origin Resource Sharing (CORS) policy.
		 * This means that a web application using those APIs can only request resources from the same origin the application was loaded from unless the response from other origins includes the right CORS headers.
		 * @public
		 * @experimental since 1.106
		 */
		 InlineSvg: "InlineSvg"

	 };

	 /**
	 * Enumeration of possible size settings.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.34.0
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
		 Error : "Error",

		 /**
		  * None value color.
		  *
		  * <b>Note:</b> The None value color is set to prevent the display of tooltip
		  * 'Neutral' for numeric content.
		  *
		  * @public
		  * @since 1.84
		  */
		 None : "None"

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
	  */
	 thisLib.ValueCSSColor = DataType.createType("sap.m.ValueCSSColor", {
		 isValid : function (vValue) {
			 var bResult = thisLib.ValueColor.hasOwnProperty(vValue);
			 if (bResult) {
				 return bResult;
			 } else { // seems to be a less parameter or sap.ui.core.CSSColor
				 bResult = CoreLibrary.CSSColor.isValid(vValue);
				 if (bResult) {
					 return bResult;
				 } else {
					 return CoreLibrary.CSSColor.isValid(Parameters.get(vValue));
				 }
			 }
		 }
	 }, DataType.getType("string"));

	 /**
	  * @classdesc A string type that represents column ratio.
	  *
	  * Allowed values are strings that follow the number:number (3:2) format.
	  * @namespace
	  * @public
	  * @since 1.86
	  */
	 thisLib.SelectColumnRatio = DataType.createType("sap.m.SelectColumnRatio", {
		 isValid : function (vValue) {
			 return /^([0-9]+:[0-9]+)$/.test(vValue);
		 }
	 }, DataType.getType("string"));

	 /**
	  * Defines the control that will receive the initial focus in the
	  * <code>sap.m.SelectDialog</code> or <code>sap.m.TableSelectDialog</code>.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.117.0
	  */
	 thisLib.SelectDialogInitialFocus = {
		 /**
		  * Content list.
		  * @public
		  */
		 List: "List",

		 /**
		  * SearchField control
		  * @public
		  */
		 SearchField: "SearchField"
	 };

	 /**
	  * A subset of input types that fits to a simple API returning one string.
	  *
	  * Not available on purpose: button, checkbox, hidden, image, password, radio, range, reset, search, submit.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.InputType = {
	  /**
	   * default (text)
	   * @public
	   */
	  Text : "Text",

	  /**
	   * A text field for specifying an email address. Brings up a keyboard optimized for email address entry.
	   * @public
	   */
	  Email : "Email",

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
	   * A text field for specifying a URL. Brings up a keyboard optimized for URL entry.
	   * @public
	   */
	  Url : "Url",

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
	  * Defines the mode of the list.
	  *
	  * @enum {string}
	  * @public
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
	  */
	 thisLib.ListKeyboardMode = {

		 /**
		  * This default mode is suitable if the List or Table contains editable and/or non-editable fields.
		  *
		  * In this mode, the first focus goes to the first item.
		  * If the focus is on the item, or cell, pressing tab/shift+tab moves the focus to the next/previous element in the tab chain after/before
		  * the <code>sap.m.List</code> or <code>sap.m.Table</code> control.
		  * If the focus is on the interactive element, pressing tab/shift+tab moves the focus to the next/previous element in the tab chain after/before
		  * the focused interactive element.
		  * @public
		  */
		 Navigation : "Navigation",

		 /**
		  * This mode is suitable if there are only editable fields within the item.
		  *
		  * In this mode, the first focus goes to the first interactive element within the first item and this is the only difference between the <code>Edit</code>
		  * and <code>Navigation</code> mode.
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
	  * Defines the groups in {@link sap.m.DynamicDateRange}.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.118
	  */
	 thisLib.DynamicDateRangeGroups = {

		/**
		 * Group of options that provide selection of single dates.
		 * @public
		 */
		SingleDates: "SingleDates",

		/**
		 * Group of options that provide selection of date ranges.
		 * @public
		 */
		DateRanges: "DateRanges",

		/**
		 * Group of options that provide selection of week related ranges.
		 * @public
		 */
		Weeks: "Weeks",

		/**
		 * Group of options that provide selection of month related ranges.
		 * @public
		 */
		Month: "Month",

		/**
		 * Group of options that provide selection of quarter related ranges.
		 * @public
		 */
		Quarters: "Quarters",

		/**
		 * Group of options that provide selection of year related ranges.
		 * @public
		 */
		Years: "Years"
	};

	 /**
	  * Enumeration of possible load statuses.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.34.0
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
	  */
	 thisLib.MenuButtonMode = {

		 /**
		  * Default Regular type - MenuButton appears as a regular button, pressing it opens a menu.
		  * @public
		  */
		 Regular: "Regular",

		 /**
		  * Split type - MenuButton appears as a split button separated into two areas: the text and the arrow button. Pressing the
		  * text area fires the default (or last) action, pressing the arrow part opens a menu.
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
	  */
	 thisLib.OverflowToolbarPriority = {
	  /**
	   * Forces <code>OverflowToolbar</code> items to remain always in the toolbar.
	   * @public
	   */
	  NeverOverflow : "NeverOverflow",

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
	  AlwaysOverflow : "AlwaysOverflow"
	 };

	 /**
	  * @typedef {object} sap.m.OverflowToolbarConfig
	  * @description The object contains configuration information for the {@link sap.m.IOverflowToolbarContent} interface.
	  *
	  * @property {boolean} [canOverflow]
	  * 	A boolean that tells whether the control can move to the overflow menu or not.
	  * <ul><b>Notes:</b>
	  * <li>Even if <code>canOverflow</code> is set to <code>false</code>, the <code>propsUnrelatedToSize</code> field is taken into account,
	  * allowing to optimize the behavior of controls that do not need to overflow, but are used in an <code>sap.m.OverflowToolbar</code> regardless.</li>
	  * <li>If <code>canOverflow</code> is not provided, its default value is <code>false</code>. In this case, the control is shown in the content of the
	  * <code>sap.m.OverflowToolbar</code> but it's not possible to enter the overflow area.</li></ul>
	  * @property {string[]} [autoCloseEvents]
	  * 	An array of strings, listing all of the control's events that should trigger the closing of the overflow menu, when fired.
	  * @property {string[]} [invalidationEvents]
	  * 	An array of strings, listing all of the control's events that should trigger the invalidation of the <code>sap.m.OverflowToolbar</code>, when fired.
	  *	<b>Note:</b> By default <code>sap.m.OverflowToolbar</code> invalidates whenever any property of a child control changes. This is to ensure that whenever the size of a child control changes, the overflow toolbar's layout is recalculated.
	  *  Some properties however do not affect control size, making it unnecessary to invalidate the overflow toolbar when they change. You can list them here for optimization purposes.
	  * @property {string[]} [propsUnrelatedToSize]
	  * 	An array of strings, listing all of the control's properties that, when changed, should not cause the overflow toolbar to invalidate.
	  * @property {function} [onBeforeEnterOverflow]
	  * 	A callback function that will be invoked before moving the control into the overflow menu. The control instance will be passed as an argument.
	  *  <b>Note:</b> The context of the function is not the control instance (use the <code>oControl</code> parameter for this purpose), but rather an internal helper object, associated with the current <code>sap.m.OverflowToolbar</code> instance.
	  *  This object only needs to be manipulated in special cases (e.g. when you want to store state on it, rather than on the control instance).
	  * @property {function} [onAfterExitOverflow]
	  * 	A callback function that will be invoked after taking the control out of the overflow menu (before moving it back to the toolbar itself). The control instance will be passed as an argument.
	  *	<b>Note:</b> See: <code>onBeforeEnterOverflow</code> for details about the function's context.
	  * @property {function} [getCustomImportance]
	  * 	A function that, if provided, will be called to determine the priority of the control.
	  *  This function must return a value of type <code>sap.m.OverflowToolbarPriority</code>. The string "Medium" is also accepted and interpreted as priority between <code>Low</code> and <code>High</code>.
	  *  <b>Note:</b> Normally priority in <code>sap.m.OverflowToolbar</code> is managed with the <code>priority</code> property of <code>sap.m.OverflowToolbarLayoutData</code>.
	  *  However, some controls may have other means of defining priority, such as dedicated properties or other types of layout data for that purpose.
	  *  In summary, implementing this function allows a control to override the default priority logic (<code>sap.m.OverflowToolbarLayoutData</code>) by providing its own.
	  * @public
	  * @since 1.110
	  */

	 /**
	 * The object contains accessibility state for a control.
	 *
	 * @typedef {object} sap.m.InputBaseAccessibilityState
	 *
	 * @property {string} [role]
	 * 	The WAI-ARIA role which is implemented by the control.
	 * @property {boolean} [invalid]
	 * 	Whether the control is invalid.
	 * @property {string} [errormessage]
	 * 	The errormessage property.
	 * @property {{value: string, append: boolean}} [labelledby]
	 * 	The labelledby property.
	 * @property {{value: string, append: boolean}} [describedby]
	 * 	The describedby property.
	 * @property {boolean | null} [disabled]
	 * 	Whether the control is disabled. If not relevant, it shouldn`t be set or set as <code>null</code>.
	 * @property {boolean | null} [readonly]
	 * 	Whether the control is readonly. If not relevant, it shouldn`t be set or set as <code>null</code>.
	 * @protected
	 * @since 1.111
	 */

	 /**
	  * Marker interface for controls which are suitable as items for the ObjectHeader.
	  *
	  * @name sap.m.ObjectHeaderContainer
	  * @interface
	  * @public
	  */

	 /**
	  * Used by the <code>ObjectHeader</code> control to define which shape to use for the image.
	  *
	  * @author SAP SE
	  * @enum {string}
	  * @public
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
	  *
	  * Interface for P13nPopup which are suitable as content for the <code>sap.m.p13n.Popup</code>.
	  * Implementation of this interface should include the following methods:
	  *
	  * <ul>
	  * <li><code>getTitle</code></li>
	  * </ul>
	  *
	  * Implementation of this interface can optionally provide the following methods:
	  *
	  * <ul>
	  * <li><code>getVerticalScrolling</code></li>
	  * <li><code>onReset</code></li>
	  * </ul>
	  *
	  * @since 1.97
	  * @name sap.m.p13n.IContent
	  * @interface
	  * @public
	  */

	 /**
	  * Returns the title, which should be displayed in the P13nPopup to describe related content.
	  *
	  * @returns {string} The title for the corresponding content to be displayed in the <code>sap.m.p13n.Popup</code>.
	  *
	  * @function
	  * @name sap.m.p13n.IContent.getTitle
	  * @public
	  */

	 /**
	  * Optionally returns the enablement of the contents vertical scrolling in case only one panel is used to determine if the content provides its own
	  * scrolling capabilites.
	  *
	  * @returns {boolean} The enablement of the vertical scrolling enablement for the <code>sap.m.p13n.Popup</code>.
	  *
	  * @function
	  * @name sap.m.p13n.IContent.getVerticalScrolling?
	  * @public
	  */

	 /**
	  * Optional hook that will be executed when the panel is used by a <code>sap.m.p13n.Popup</code> that may trigger a reset on the panel
	  *
	  * @function
	  * @name sap.m.p13n.IContent.onReset?
	  * @public
	  */

	 /**
	  * Type of popup used in the <code>sap.m.p13n.Popup</code>.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.P13nPopupMode = {

		 /**
		  * Dialog type as popup type.
		  * @public
		  */
		 Dialog: "Dialog",

		 /**
		  * ResponsivePopover type as popup type.
		  * @public
		  */
		  ResponsivePopover: "ResponsivePopover"

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

		 // filter exclude operations
		 NotBT: "NotBT",
		 NotEQ: "NotEQ",
		 NotContains: "NotContains",
		 NotStartsWith: "NotStartsWith",
		 NotEndsWith: "NotEndsWith",
		 NotLT: "NotLT",
		 NotLE: "NotLE",
		 NotGT: "NotGT",
		 NotGE: "NotGE",
		 NotInitial: "NotInitial",
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

	 thisLib.P13nConditionOperationType = {
		 Include: "Include",
		 Exclude: "Exclude"
	 };

	 /**
	  * Available Page Background Design.
	  *
	  * @enum {string}
	  * @public
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
	   * Popover will be placed at the top or bottom of the reference control but will try to position on the
	   * top side if the space is greater than the Popover's height.
	   * @public
	   * @since 1.36
	   */
	  VerticalPreferredTop : "VerticalPreferredTop",

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
	   * Popover will be placed at the right or left side of the reference control but will try to position on the
	   * right side if the space is greater than the Popover's width.
	   * @public
	   * @since 1.36
	   */
	  HorizontalPreferredRight : "HorizontalPreferredRight",

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
	  * The option keys of all the standard options of a DynamicDateRange control.
	  *
	  * @public
	  * @enum {string}
	  */
	 thisLib.StandardDynamicDateRangeKeys = {

		 /**
		  * The date will be selected from a calendar.
		  * @public
		  */
		  DATE : "DATE",

		 /**
		  * The date and time will be selected from a calendar and time picker.
		  * @public
		  */
		  DATETIME : "DATETIME",

		  /**
		  * The date will be the day of selection.
		  * @public
		  */
		 TODAY : "TODAY",

		 /**
		  * The date will be the day before the day of selection.
		  * @public
		  */
		 YESTERDAY : "YESTERDAY",

		 /**
		  * The date will be the day after the day of selection.
		  * @public
		  */
		 TOMORROW : "TOMORROW",

		 /**
		  * The date will be the first day of the current week.
		  * @public
		  */
		 FIRSTDAYWEEK : "FIRSTDAYWEEK",

		 /**
		  * The date will be the last day of the current week.
		  * @public
		  */
		 LASTDAYWEEK : "LASTDAYWEEK",

		 /**
		  * The date will be the first day of the current month.
		  * @public
		  */
		 FIRSTDAYMONTH : "FIRSTDAYMONTH",

		 /**
		  * The date will be the last day of the current month.
		  * @public
		  */
		 LASTDAYMONTH : "LASTDAYMONTH",

		 /**
		  * The date will be the first day of the current quarter.
		  * @public
		  */
		 FIRSTDAYQUARTER : "FIRSTDAYQUARTER",

		 /**
		  * The date will be the last day of the current quarter.
		  * @public
		  */
		 LASTDAYQUARTER : "LASTDAYQUARTER",

		 /**
		  * The date will be the first day of the current year.
		  * @public
		  */
		 FIRSTDAYYEAR : "FIRSTDAYYEAR",

		 /**
		  * The date will be the last day of the current year.
		  * @public
		  */
		 LASTDAYYEAR : "LASTDAYYEAR",

		 /**
		  * The range will be selected from a calendar.
		  * @public
		  */
		 DATERANGE : "DATERANGE",

		 /**
		  * The range will be selected from two DateTimePicker controls.
		  * @public
		  */
		 DATETIMERANGE : "DATETIMERANGE",

		 /**
		  * The range will start from a date selected from a calendar.
		  * @public
		  */
		 FROM : "FROM",

		 /**
		  * The range will end in a date selected from a calendar.
		  * @public
		  */
		 TO : "TO",

		 /**
		  * The range will start from a date and time selected from a calendar and time picker.
		  * @public
		  */
		 FROMDATETIME : "FROMDATETIME",

		 /**
		  * The range will end in a date and time selected from a calendar and time picker.
		  * @public
		  */
		 TODATETIME : "TODATETIME",

		 /**
		  * The range will start from the first day of the current year and ends with the date selected from a calendar.
		  * @public
		  */
		 YEARTODATE : "YEARTODATE",

		 /**
		  * The range will start from the date selected from a calendar and ends with the last day of the current year.
		  * @public
		  */
		 DATETOYEAR : "DATETOYEAR",

		 /**
		  * The range will contain the last X minutes. The count of the minutes is selected from a StepInput.
		  * @public
		  */
		 LASTMINUTES : "LASTMINUTES",

		 /**
		  * The range will contain the last X hours. The count of the hours is selected from a StepInput.
		  * @public
		  */
		  LASTHOURS : "LASTHOURS",

		 /**
		  * The range will contain the last X days. The count of the days is selected from a StepInput.
		  * @public
		  */
		 LASTDAYS : "LASTDAYS",

		 /**
		  * The range will contain the last X weeks. The count of the weeks is selected from a StepInput.
		  * @public
		  */
		 LASTWEEKS : "LASTWEEKS",

		 /**
		  * The range will contain the last X months. The count of the months is selected from a StepInput.
		  * @public
		  */
		 LASTMONTHS : "LASTMONTHS",

		 /**
		  * The range will contain the last X quarters. The count of the quarters is selected from a StepInput.
		  * @public
		  */
		 LASTQUARTERS : "LASTQUARTERS",

		 /**
		  * The range will contain the last X years. The count of the years is selected from a StepInput.
		  * @public
		  */
		 LASTYEARS : "LASTYEARS",

		 /**
		  * The range will contain the next X minutes. The count of the minutes is selected from a StepInput.
		  * @public
		  */
		 NEXTMINUTES : "NEXTMINUTES",

		 /**
		  * The range will contain the next X hours. The count of the hours is selected from a StepInput.
		  * @public
		  */
		 NEXTHOURS : "NEXTHOURS",

		 /**
		  * The range will contain the next X days. The count of the days is selected from a StepInput.
		  * @public
		  */
		 NEXTDAYS : "NEXTDAYS",

		 /**
		  * The range will contain the next X weeks. The count of the weeks is selected from a StepInput.
		  * @public
		  */
		 NEXTWEEKS : "NEXTWEEKS",

		 /**
		  * The range will contain the next X months. The count of the months is selected from a StepInput.
		  * @public
		  */
		 NEXTMONTHS : "NEXTMONTHS",

		 /**
		  * The range will contain the next X quarters. The count of the quarters is selected from a StepInput.
		  * @public
		  */
		 NEXTQUARTERS: "NEXTQUARTERS",

		 /**
		  * The range will contain the next X years. The count of the years is selected from a StepInput.
		  * @public
		  */
		 NEXTYEARS : "NEXTYEARS",

		 /**
		  * The range will contain the last X days and the next Y days. The count of the days is selected from a StepInput.
		  * @public
		  */
		 TODAYFROMTO : "TODAYFROMTO",

		 /**
		  * The range will contain the days of the current week.
		  * @public
		  */
		 THISWEEK : "THISWEEK",

		 /**
		  * The range will contain the days of the last week.
		  * @public
		  */
		 LASTWEEK : "LASTWEEK",

		 /**
		  * The range will contain the days of the next week.
		  * @public
		  */
		 NEXTWEEK : "NEXTWEEK",

		 /**
		  * The range will contain a month selected from a MonthPicker.
		  * @public
		  */
		 SPECIFICMONTH : "SPECIFICMONTH",

		 /**
		  * The range will contain a month in exact year selected from a MonthPicker.
		  * @public
		  */
		 SPECIFICMONTHINYEAR : "SPECIFICMONTHINYEAR",

		 /**
		  * The range will contain the days in the current month.
		  * @public
		  */
		 THISMONTH : "THISMONTH",

		 /**
		  * The range will contain the days in the last month.
		  * @public
		  */
		 LASTMONTH : "LASTMONTH",

		 /**
		  * The range will contain the days in the next month.
		  * @public
		  */
		 NEXTMONTH : "NEXTMONTH",

		 /**
		  * The range will contain the days in the current quarter.
		  * @public
		  */
		 THISQUARTER : "THISQUARTER",

		 /**
		  * The range will contain the days in the last quarter.
		  * @public
		  */
		 LASTQUARTER : "LASTQUARTER",

		 /**
		  * The range will contain the days in the next quarter.
		  * @public
		  */
		 NEXTQUARTER : "NEXTQUARTER",

		 /**
		  * The range will contain the days in the first quarter.
		  * @public
		  */
		 QUARTER1 : "QUARTER1",

		 /**
		  * The range will contain the days in the second quarter.
		  * @public
		  */
		 QUARTER2 : "QUARTER2",

		 /**
		  * The range will contain the days in the third quarter.
		  * @public
		  */
		 QUARTER3 : "QUARTER3",

		 /**
		  * The range will contain the days in the fourth quarter.
		  * @public
		  */
		 QUARTER4 : "QUARTER4",

		 /**
		  * The range will contain the days in the current year.
		  * @public
		  */
		 THISYEAR: "THISYEAR",

		 /**
		  * The range will contain the days in the last year.
		  * @public
		  */
		 LASTYEAR : "LASTYEAR",

		 /**
		  * The range will contain the days in the next year.
		  * @public
		  */
		 NEXTYEAR : "NEXTYEAR"
	 };

	 /**
	  * QuickViewGroupElement is a combination of one label and another control (Link or Text) associated to this label.
	  *
	  * @enum {string}
	  * @public
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
	  * Defines how pages will be scrolled, when clicking the arrow.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.CarouselScrollMode = {

		 /**
		  * Pages will be scrolled one at a time
		  * @public
		  */
		 SinglePage : "SinglePage",

		 /**
		  * Pages will be scrolled, depending on the value of <code>visiblePagesCount</code>
		  * @public
		  */
		 VisiblePages : "VisiblePages"

	 };

	 /**
	  * Enumeration for different action levels in sap.m.SelectionDetails control.
	  *
	  * @enum {string}
	  * @protected
	  * @since 1.48
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


	 thisLib.table = thisLib.table || {};
	 thisLib.table.columnmenu = thisLib.table.columnmenu || {};

	 /**
	  * Categories of column menu entries.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.110
	  * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	  */
	 thisLib.table.columnmenu.Category = {

		 /**
		  * Sort category
		  * @public
		  */
		 Sort: "Sort",

		 /**
		  * Filter category
		  * @public
		  */
		 Filter: "Filter",

		 /**
		  * Group category
		  * @public
		  */
		 Group: "Group",

		 /**
		  * Aggregate category
		  * @public
		  */
		 Aggregate: "Aggregate",

		 /**
		  * Generic category
		  * @public
		  */
		 Generic: "Generic"
	 };


	 /**
	  * Predefined types for ObjectMarker.
	  *
	  * @enum {string}
	  * @public
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
	  */
	 thisLib.SwipeDirection = {
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
	  * Types of the <code>sap.m.Tokenizer</code> responsive modes.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.80
	  */
	 thisLib.TokenizerRenderMode = {

		 /**
		  * In <code>Loose</code> mode, the <code>sap.m.Tokenizer</code> will show all its tokens, even if this means that scrolling needs to be used.
		  * @public
		  */
		 Loose : "Loose",

		 /**
		  * In  <code>Narrow</code> mode, the <code>sap.m.Tokenizer</code> will show as many tokens as its width allows, as well as an n-More indicator with the count of the hidden tokens. The rest tokens will be hidden.
		  * @public
		  */
		 Narrow : "Narrow"
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
	  */
	 thisLib.TimePickerMaskMode = {
		 /**
		  * The mask is automatically enabled for all valid fixed-length time patterns, and it is disabled when the time format does not have a fixed length.
		  * @public
		  */
		 On: "On",

		 /**
		  * The mask will always be enforced for any time patterns.
		  * <b>Note:</b> The mask functions correctly only with fixed-length time formats.
		  * Using the <code>Enforce</code> value with time formats that do not have a fixed length may lead to unpredictable behavior.
		  */
		 Enforce: "Enforce",

		 /**
		  * The mask is disabled for the <code>sap.m.TimePicker</code>.
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
	  * States of the upload process of {@link sap.m.UploadCollectionItem}.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.UploadState = {
		 /**
		  * The file has been uploaded successfully.
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
	  * Type of the upload {@link sap.m.UploadSetItem}.
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.UploadType = {
		 /**
		  * The file has been uploaded from cloud.
		  * @public
		  */
		 Cloud: "Cloud",
		 /**
		  * The file has been uploaded from your system.
		  * @public
		  */
		 Native: "Native"
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
	  * Available selection modes for the {@link sap.m.SinglePlanningCalendar}
	  *
	  * @enum {string}
	  * @public
	  * @since 1.113
	  */
	 thisLib.SinglePlanningCalendarSelectionMode = {
		 /**
		  * Single date selection.
		  * @public
		  */
		 SingleSelect: "SingleSelect",

		 /**
		  * Мore than one date will be available to selection.
		  * @public
		  */
		 MultiSelect: "MultiSelect"
	 };

	 /**
	  * Available sticky modes for the {@link sap.m.SinglePlanningCalendar}
	  *
	  * @enum {string}
	  * @public
	  * @since 1.62
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
	  */
	 thisLib.TitleAlignment = {

		 /**
		  * Disables an automatic title alignment depending on theme
		  * Mostly used in sap.m.Bar
		  * @public
		  */
		 None : "None",

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
		  * Explicitly sets the alignment to the center
		  * @public
		  */
		 Center : "Center"

	 };

	 /**
	  * Expandable text overflow mode
	  *
	  * @enum {string}
	  * @public
	  */
	 thisLib.ExpandableTextOverflowMode = {
		 /**
		  * InPlace
		  * @public
		  */
		 InPlace: "InPlace",

		 /**
		  * Popover
		  * @public
		  */
		 Popover: "Popover"
	 };

	 /*
	  * Enums defined in separate modules
	  */
	 thisLib.AvatarShape = AvatarShape;
	 thisLib.AvatarSize = AvatarSize;
	 thisLib.AvatarType = AvatarType;
	 thisLib.AvatarColor = AvatarColor;
	 thisLib.AvatarImageFitType = AvatarImageFitType;

	 thisLib.IllustratedMessageSize = IllustratedMessageSize;
	 thisLib.IllustratedMessageType = IllustratedMessageType;

	 /**
	  * Wizard rendering mode.
	  *
	  * @enum {string}
	  * @since 1.83
	  * @public
	  */
	 thisLib.WizardRenderMode = {

		 /**
		  * Display all steps into a scroll section.
		  * @public
		  */
		 Scroll: "Scroll",

		 /**
		  * Display steps as separate, single pages.
		  * @public
		  */
		 Page: "Page"
	 };

	 /**
	  * Enumeration of the <code>ResetAllMode</code> that can be used in a <code>TablePersoController</code>.
	  * @enum {string}
	  * @public
	  */
	 thisLib.ResetAllMode = {

		 /**
		  * Default behavior of the <code>TablePersoDialog</code> Reset All button.
		  * @public
		  */
		 Default: "Default",

		 /**
		  * Resets the table to the default of the attached <code>PersoService</code>.
		  * @public
		  */
		 ServiceDefault: "ServiceDefault",

		 /**
		  * Resets the table to the result of <code>getResetPersData</code> of the attached <code>PersoService</code>.
		  * @public
		  */
		 ServiceReset: "ServiceReset"
	 };

	 /**
	  * Enumeration of the <code>SharingMode</code> that can be used in a <code>VariantItem</code>.
	  * @enum {string}
	  * @public
	  */
	 thisLib.SharingMode = {

		 /**
		  * Public mode of the <code>VariantItem</code>.
		  * @public
		  */
		 Public: "public",

		 /**
		  * Private mode of the <code>VariantItem</code>.
		  * @public
		  */
		 Private: "private"
	 };

	 /**
	  * Enumeration of the <code>multiSelectMode>/code> in <code>ListBase</code>.
	  * @enum {string}
	  * @public
	  * @since 1.93
	  */
	 thisLib.MultiSelectMode = {

		 /**
		  * The Select All functionality is available (default behavior).
		  * For a <code>sap.m.Table</code>, a Select All checkbox is rendered.
		  * @public
		  */
		 Default: "Default",

		 /**
		  * The Select All functionality is not available. Instead, it is only possible to remove the selection of all items.
		  * For a <code>sap.m.Table</code>, a Deselect All icon is rendered.
		  * @public
		  */
		 ClearAll: "ClearAll",

		 /**
		  * The Select All functionality is available.
		  * For a <code>sap.m.Table</code>, a Select All checkbox
		  * with a warning popover is rendered if not all items could be selected (for example, because of growing).
		  *
		  * @public
		  * @since 1.109
		  */
		 SelectAll: "SelectAll"
	 };

	 thisLib.plugins = thisLib.plugins || {};

	 /**
	  * Enumeration of the <code>copyPreference</code> in <code>CopyProvider</code>. Determines what is copied during a copy operation.
	  * @enum {string}
	  * @public
	  * @since 1.119
	  */
	 thisLib.plugins.CopyPreference = {
		 /**
		  * The entire selected scope is copied, including both row and cell selection.
		  * @public
		  */
		 Full: "Full",

		 /**
		  * If cells are selected, only the content of the selected cells is copied,
		  * regardless of any other rows or elements that might also be selected. If no cells are selected,
		  * the copy operation will default to copying the selected rows.
		  * @public
		  */
		 Cells: "Cells"
	 };

	 /**
	  * Defines the states of list items when the context menu is opened.
	  *
	  * @enum {string}
	  * @public
	  * @since 1.121
	  */
	 thisLib.plugins.ContextMenuScope = {

		 /**
		  * The scope is set to the default value where the focus is unaffected by the opening of the context menu.
		  * @public
		  */
		 Default: "Default",

		 /**
		  * The focus will be on the clicked item and also on other selected items, if the clicked item is selected.
		  * @public
		  */
		 Selection: "Selection"
	 };

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
		 var oLocale = new Locale(Formatting.getLanguageTag());

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
		 var oLocaleData = LocaleData.getInstance(thisLib.getLocale());

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
	  * @returns {Object|undefined} iScroll reference or <code>undefined</code> if cannot find
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
	  * @returns {Object|undefined} ScrollDelegate or <code>undefined</code> if it cannot be found
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
				 return parent.getScrollDelegate(oControl);
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
	  * @namespace sap.m.touch
	  * @public
	  **/
	 thisLib.touch = thisLib.touch || {};

	 /**
	  * Given a list of touch objects, find the touch that matches the given one.
	  *
	  * @param {TouchList} oTouchList The list of touch objects to search.
	  * @param {Touch | number} oTouch A touch object to find or a Touch.identifier that uniquely identifies the current finger in the touch session.
	  * @returns {object | undefined} The touch matching if any.
	  * @name sap.m.touch.find
	  * @function
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
			 assert(false, "sap.m.touch.find(): oTouch must be a touch object or a number");
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
	  * @name sap.m.touch.countContained
	  * @function
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
			 assert(false, "sap.m.touch.countContained(): vElement must be a jQuery object or Element reference or a string");
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
	  * <li>Different Internet Explorer versions have a different URL length limits (IE9 approximately 1000 characters)</li>
	  * <li>MS mail app under Windows 8 cuts mail links after approximately 100 characters</li>
	  * <li>Safari gets a confirmation from user before opening a native application and can block other triggers if the user cancels it</li>
	  * <li>Some mail applications(Outlook) do not respect all encodings (e.g. Cyrillic texts are not encoded correctly)</li>
	  * </ul>
	  *
	  * <b>Note:</b> all the given maximum lengths are for URL encoded text (e.g a space character will be encoded as "%20").
	  *
	  * It has been reported by some users that the content send through the <code>URLHelper</code> is not correctly displayed by the native applications (e.g. a native mail application).
	  *
	  * After sending the body to the application, <code>URLHelper</code> cannot affect its rendering and the application takes responsibility to correctly display the content.
	  * Inconsistencies between different native applications or operative systems (OS) can lead to different behaviors and differences in the displayed content.
	  *
	  * <b>Example:</b>
	  *
	  * What happens with a link added to the content of an email using the <code>URLHelper</code> ?
	  *
	  * Apart from the correct generation of URL, everything else is outside of the scope of <code>URLHelper</code> as responsibility from then on is passed to the browser and the native applications handling the URL.
	  * For instance, clicking on an email link should result in triggering an action in the default mail application for the user's OS and it is this application's responsibility to correctly handle the URL, given it is generated correctly.
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
				 isValidString(sEmail) && (sURL += encode(sEmail.trim()));
				 isValidString(sSubject) && aParams.push("subject=" + encode(sSubject));
				 isValidString(sBody) && aParams.push("body=" + formatMessage(sBody));
				 isValidString(sBCC) && aParams.push("bcc=" + encode(sBCC.trim()));
				 isValidString(sCC) && aParams.push("cc=" + encode(sCC.trim()));

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
					 openWindow(sURL, "_blank");
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
			  * @param {boolean} [bNewWindow] Opens email template in a new browser window or tab.
			  * @public
			  */
			 triggerEmail: function(sEmail, sSubject, sBody, sCC, sBCC, bNewWindow) {
				 bNewWindow = bNewWindow || false;
				 this.redirect(this.normalizeEmail.apply(0, [sEmail, sSubject, sBody, sCC, sBCC]), bNewWindow);
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
		  * To be called by control renderers supporting the global themable background image within their root tag, before they call openEnd, voidEnd, writeClasses() and writeStyles().
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
		  * @returns {string|null} The calculated size string with "px" as unit or <code>null</code> when the format of given parameter is wrong.
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

	 //implement table helper factory with m controls
	 //possible is set before layout lib is loaded.
	 /**
	  * An object type that represents sap.m.upload.FilterPanel fields properties.
	  * @typedef {object}
	  * @public
	  * @property {string} label field name.
	  * @property {string} path model path.
	  */
	 thisLib.FilterPanelField = DataType.createType("sap.m.FilterPanelField", {
		 isValid: function (oValue) {
			 var aValueKeys = Object.keys(oValue);
			 return ["label", "path"].every(function (sKey) {
				 return aValueKeys.indexOf(sKey) !== -1;
			 });
		 }
	 }, "object");

	 /* Android browsers do not scroll a focused input into the view correctly after resize */
	 if (Device.os.android) {
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

	 /**
	  * @typedef {object} sap.m.VariantManagementRename
	  * @description An object type that represents the {@link sap.m.VariantManagement} <code>manage</code>-event property <code>rename</code>.
	  * @public
	  * @property {string} key the variant key.
	  * @property {string} name the new title of the variant.
	  */

	 /**
	  * @typedef {object} sap.m.VariantManagementExe
	  * @description An object type that represents the {@link sap.m.VariantManagement} <code>manage</code>-event property <code>exe</code>.
	  * @public
	  * @property {string} key the variant key.
	  * @property {boolean} exe flag describing the associated Appy Automatically indicator.
	  */

	 /**
	  * @typedef {object} sap.m.VariantManagementFav
	  * @description An object type that represents the {@link sap.m.VariantManagement} <code>manage</code>-event property <code>fav</code>.
	  * @public
	  * @property {string} key the variant key.
	  * @property {boolean} visible flag describing the associated Favorite indicator.
	  */

	 // ES6 constant represents the maximum safe integer
	 if (!Number.MAX_SAFE_INTEGER) {
		 Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
	 }

	 /*
	  * Register all of the above defined enums.
	  * Some enums of the sap.m library are contained in a dedicated module
	  * and are registered there (e.g. "sap.m.IllustratedMessageType").
	  */
	 DataType.registerEnum("sap.m.BackgroundDesign", thisLib.BackgroundDesign);
	 DataType.registerEnum("sap.m.BadgeState", thisLib.BadgeState);
	 DataType.registerEnum("sap.m.BadgeAnimationType", thisLib.BadgeAnimationType);
	 DataType.registerEnum("sap.m.BarDesign", thisLib.BarDesign);
	 DataType.registerEnum("sap.m.BorderDesign", thisLib.BorderDesign);
	 DataType.registerEnum("sap.m.BreadcrumbsSeparatorStyle", thisLib.BreadcrumbsSeparatorStyle);
	 DataType.registerEnum("sap.m.ButtonAccessibleRole", thisLib.ButtonAccessibleRole);
	 DataType.registerEnum("sap.m.ButtonType", thisLib.ButtonType);
	 DataType.registerEnum("sap.m.CarouselArrowsPlacement", thisLib.CarouselArrowsPlacement);
	 DataType.registerEnum("sap.m.DeviationIndicator", thisLib.DeviationIndicator);
	 DataType.registerEnum("sap.m.DialogRoleType", thisLib.DialogRoleType);
	 DataType.registerEnum("sap.m.DialogType", thisLib.DialogType);
	 DataType.registerEnum("sap.m.DraftIndicatorState", thisLib.DraftIndicatorState);
	 DataType.registerEnum("sap.m.DynamicDateRangeGroups", thisLib.DynamicDateRangeGroups);
	 DataType.registerEnum("sap.m.EmptyIndicatorMode", thisLib.EmptyIndicatorMode);
	 DataType.registerEnum("sap.m.FacetFilterListDataType", thisLib.FacetFilterListDataType);
	 DataType.registerEnum("sap.m.FacetFilterType", thisLib.FacetFilterType);
	 DataType.registerEnum("sap.m.FilterPanelField", thisLib.FilterPanelField);
	 DataType.registerEnum("sap.m.FlexAlignContent", thisLib.FlexAlignContent);
	 DataType.registerEnum("sap.m.FlexAlignItems", thisLib.FlexAlignItems);
	 DataType.registerEnum("sap.m.FlexAlignSelf", thisLib.FlexAlignSelf);
	 DataType.registerEnum("sap.m.FlexDirection", thisLib.FlexDirection);
	 DataType.registerEnum("sap.m.FlexJustifyContent", thisLib.FlexJustifyContent);
	 DataType.registerEnum("sap.m.FlexRendertype", thisLib.FlexRendertype);
	 DataType.registerEnum("sap.m.FlexWrap", thisLib.FlexWrap);
	 DataType.registerEnum("sap.m.FrameType", thisLib.FrameType);
	 DataType.registerEnum("sap.m.GenericTagDesign", thisLib.GenericTagDesign);
	 DataType.registerEnum("sap.m.GenericTagValueState", thisLib.GenericTagValueState);
	 DataType.registerEnum("sap.m.GenericTileMode", thisLib.GenericTileMode);
	 DataType.registerEnum("sap.m.Priority", thisLib.Priority);
	 DataType.registerEnum("sap.m.GenericTileScope", thisLib.GenericTileScope);
	 DataType.registerEnum("sap.m.HeaderLevel", thisLib.HeaderLevel);
	 DataType.registerEnum("sap.m.IBarHTMLTag", thisLib.IBarHTMLTag);
	 DataType.registerEnum("sap.m.IconTabDensityMode", thisLib.IconTabDensityMode);
	 DataType.registerEnum("sap.m.IconTabFilterDesign", thisLib.IconTabFilterDesign);
	 DataType.registerEnum("sap.m.IconTabFilterInteractionMode", thisLib.IconTabFilterInteractionMode);
	 DataType.registerEnum("sap.m.IconTabHeaderMode", thisLib.IconTabHeaderMode);
	 DataType.registerEnum("sap.m.ImageMode", thisLib.ImageMode);
	 DataType.registerEnum("sap.m.InputTextFormatMode", thisLib.InputTextFormatMode);
	 DataType.registerEnum("sap.m.SelectDialogInitialFocus", thisLib.SelectDialogInitialFocus);
	 DataType.registerEnum("sap.m.InputType", thisLib.InputType);
	 DataType.registerEnum("sap.m.LabelDesign", thisLib.LabelDesign);
	 DataType.registerEnum("sap.m.LightBoxLoadingStates", thisLib.LightBoxLoadingStates);
	 DataType.registerEnum("sap.m.LinkConversion", thisLib.LinkConversion);
	 DataType.registerEnum("sap.m.LinkAccessibleRole", thisLib.LinkAccessibleRole);
	 DataType.registerEnum("sap.m.ListGrowingDirection", thisLib.ListGrowingDirection);
	 DataType.registerEnum("sap.m.ListKeyboardMode", thisLib.ListKeyboardMode);
	 DataType.registerEnum("sap.m.ListMode", thisLib.ListMode);
	 DataType.registerEnum("sap.m.ListSeparators", thisLib.ListSeparators);
	 DataType.registerEnum("sap.m.ListType", thisLib.ListType);
	 DataType.registerEnum("sap.m.LoadState", thisLib.LoadState);
	 DataType.registerEnum("sap.m.MenuButtonMode", thisLib.MenuButtonMode);
	 DataType.registerEnum("sap.m.MultiSelectMode", thisLib.MultiSelectMode);
	 DataType.registerEnum("sap.m.ObjectHeaderPictureShape", thisLib.ObjectHeaderPictureShape);
	 DataType.registerEnum("sap.m.ObjectMarkerType", thisLib.ObjectMarkerType);
	 DataType.registerEnum("sap.m.ObjectMarkerVisibility", thisLib.ObjectMarkerVisibility);
	 DataType.registerEnum("sap.m.OverflowToolbarPriority", thisLib.OverflowToolbarPriority);
	 DataType.registerEnum("sap.m.P13nPopupMode", thisLib.P13nPopupMode);
	 DataType.registerEnum("sap.m.P13nPanelType", thisLib.P13nPanelType);
	 DataType.registerEnum("sap.m.P13nConditionOperation", thisLib.P13nConditionOperation);
	 DataType.registerEnum("sap.m.PageBackgroundDesign", thisLib.PageBackgroundDesign);
	 DataType.registerEnum("sap.m.PanelAccessibleRole", thisLib.PanelAccessibleRole);
	 DataType.registerEnum("sap.m.PDFViewerDisplayType", thisLib.PDFViewerDisplayType);
	 DataType.registerEnum("sap.m.PlacementType", thisLib.PlacementType);
	 DataType.registerEnum("sap.m.PlanningCalendarBuiltInView", thisLib.PlanningCalendarBuiltInView);
	 DataType.registerEnum("sap.m.PlanningCalendarStickyMode", thisLib.PlanningCalendarStickyMode);
	 DataType.registerEnum("sap.m.PopinDisplay", thisLib.PopinDisplay);
	 DataType.registerEnum("sap.m.PopinLayout", thisLib.PopinLayout);
	 DataType.registerEnum("sap.m.QuickViewGroupElementType", thisLib.QuickViewGroupElementType);
	 DataType.registerEnum("sap.m.RatingIndicatorVisualMode", thisLib.RatingIndicatorVisualMode);
	 DataType.registerEnum("sap.m.ScreenSize", thisLib.ScreenSize);
	 DataType.registerEnum("sap.m.CarouselScrollMode", thisLib.CarouselScrollMode);
	 DataType.registerEnum("sap.m.SelectColumnRatio", thisLib.SelectColumnRatio);
	 DataType.registerEnum("sap.m.SelectionDetailsActionLevel", thisLib.SelectionDetailsActionLevel);
	 DataType.registerEnum("sap.m.SelectListKeyboardNavigationMode", thisLib.SelectListKeyboardNavigationMode);
	 DataType.registerEnum("sap.m.SelectType", thisLib.SelectType);
	 DataType.registerEnum("sap.m.Size", thisLib.Size);
	 DataType.registerEnum("sap.m.SplitAppMode", thisLib.SplitAppMode);
	 DataType.registerEnum("sap.m.StandardDynamicDateRangeKeys", thisLib.StandardDynamicDateRangeKeys);
	 DataType.registerEnum("sap.m.StandardTileType", thisLib.StandardTileType);
	 DataType.registerEnum("sap.m.StepInputStepModeType", thisLib.StepInputStepModeType);
	 DataType.registerEnum("sap.m.StepInputValidationMode", thisLib.StepInputValidationMode);
	 DataType.registerEnum("sap.m.Sticky", thisLib.Sticky);
	 DataType.registerEnum("sap.m.StringFilterOperator", thisLib.StringFilterOperator);
	 DataType.registerEnum("sap.m.SwipeDirection", thisLib.SwipeDirection);
	 DataType.registerEnum("sap.m.SwitchType", thisLib.SwitchType);
	 DataType.registerEnum("sap.m.TabsOverflowMode", thisLib.TabsOverflowMode);
	 DataType.registerEnum("sap.m.ContentConfigType", thisLib.ContentConfigType);
	 DataType.registerEnum("sap.m.TileSizeBehavior", thisLib.TileSizeBehavior);
	 DataType.registerEnum("sap.m.TimePickerMaskMode", thisLib.TimePickerMaskMode);
	 DataType.registerEnum("sap.m.TitleAlignment", thisLib.TitleAlignment);
	 DataType.registerEnum("sap.m.ExpandableTextOverflowMode", thisLib.ExpandableTextOverflowMode);
	 DataType.registerEnum("sap.m.TokenizerRenderMode", thisLib.TokenizerRenderMode);
	 DataType.registerEnum("sap.m.ToolbarDesign", thisLib.ToolbarDesign);
	 DataType.registerEnum("sap.m.ToolbarStyle", thisLib.ToolbarStyle);
	 DataType.registerEnum("sap.m.UploadState", thisLib.UploadState);
	 DataType.registerEnum("sap.m.UploadType", thisLib.UploadType);
	 DataType.registerEnum("sap.m.ValueColor", thisLib.ValueColor);
	 DataType.registerEnum("sap.m.ValueCSSColor", thisLib.ValueCSSColor);
	 DataType.registerEnum("sap.m.VerticalPlacementType", thisLib.VerticalPlacementType);
	 DataType.registerEnum("sap.m.WrappingType", thisLib.WrappingType);
	 DataType.registerEnum("sap.m.SinglePlanningCalendarSelectionMode", thisLib.SinglePlanningCalendarSelectionMode);
	 DataType.registerEnum("sap.m.WizardRenderMode", thisLib.WizardRenderMode);
	 DataType.registerEnum("sap.m.ResetAllMode", thisLib.ResetAllMode);
	 DataType.registerEnum("sap.m.SharingMode", thisLib.SharingMode);
	 DataType.registerEnum("sap.m.plugins.CopyPreference", thisLib.plugins.CopyPreference);
	 DataType.registerEnum("sap.m.plugins.ContextMenuScope", thisLib.plugins.ContextMenuScope);
	 DataType.registerEnum("sap.m.semantic.SemanticRuleSetType", thisLib.semantic.SemanticRuleSetType);
	 DataType.registerEnum("sap.m.table.columnmenu.Category", thisLib.table.columnmenu.Category);
	 DataType.registerEnum("sap.m.upload.UploaderHttpRequestMethod", thisLib.upload.UploaderHttpRequestMethod);
	 DataType.registerEnum("sap.m.UploadSetwithTableActionPlaceHolder", thisLib.UploadSetwithTableActionPlaceHolder);
	 DataType.registerEnum("sap.m.TileInfoColor", thisLib.TileInfoColor);

	 return thisLib;
	});
