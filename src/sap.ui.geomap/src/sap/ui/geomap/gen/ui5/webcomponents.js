/*!
 * ${copyright}
 */
sap.ui.define(
  ["sap/ui/geomap/thirdparty/webcomponents", "sap/ui/base/DataType", "sap/ui/geomap/gen/ui5/webcomponents_base"],
  function (WebCPackage, DataType) {
    "use strict";
    const { registerEnum } = DataType;

    // re-export package object
    const pkg = Object.assign({}, WebCPackage);

    // export the UI5 metadata along with the package
    pkg["_ui5metadata"] = {
      name: "sap/ui/geomap/gen/ui5/webcomponents",
      version: "2.27.2",
      dependencies: ["sap.ui.core"],
      types: [
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarColorScheme",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarGroupType",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarShape",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarSize",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BackgroundDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BarAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BarDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BorderDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BreadcrumbsDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BreadcrumbsSeparator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BusyIndicatorSize",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BusyIndicatorTextPlacement",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonBadgeDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonType",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CalendarLegendItemType",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CalendarSelectionMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CalendarWeekNumbering",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CarouselArrowsPlacement",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CarouselPageIndicatorType",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ComboBoxFilter",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ExpandableTextOverflowMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.FormAccessibleMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.FormItemSpacing",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.Highlight",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.IconDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.IconMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.InputSuggestionsFilter",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.InputType",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.InteractiveAreaSize",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.LinkAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.LinkDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListGrowingMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListItemAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListItemType",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListSelectionMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListSeparator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.MenuItemGroupCheckMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.MessageStripDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.NotificationListGrowingMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.OverflowMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PanelAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopoverHorizontalAlign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopoverPlacement",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopoverVerticalAlign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopupAccessibleRole",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.Priority",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.RatingIndicatorSize",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SegmentedButtonSelectionMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SelectTextSeparator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SemanticColor",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SwitchDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TabLayout",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableCellHorizontalAlign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableGrowingMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableOverflowMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableSelectionBehavior",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableSelectionMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableSelectionMultiHeaderSelector",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TagDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TagSize",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TextEmptyIndicatorMode",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TitleLevel",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToastPlacement",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToolbarAlign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToolbarDesign",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToolbarItemOverflowBehavior",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.types.WrappingType"
      ],
      interfaces: [
        "sap.ui.geomap.gen.ui5.webcomponents.dist.AvatarGroup.IAvatarGroupItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Button.IButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Calendar.ICalendarSelectedDates",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ColorPalette.IColorPaletteItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ComboBox.IComboBoxItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DynamicDateRange.IDynamicDateRangeOption",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Form.IFormItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Icon.IIcon",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Input.IInputSuggestionItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Menu.IMenuItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MultiComboBox.IMultiComboBoxItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SegmentedButton.ISegmentedButtonItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Select.IOption",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Select.IOptionGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TabContainer.ITab",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Table.ITableFeature",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Table.ITableGrowing",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarItem.IToolbarItemContent"
      ],
      controls: [
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Avatar",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.AvatarBadge",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.AvatarGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Bar",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Breadcrumbs",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.BreadcrumbsItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.BusyIndicator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Button",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ButtonBadge",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Calendar",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.CalendarDate",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.CalendarDateRange",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.CalendarLegend",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.CalendarLegendItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Card",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.CardHeader",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Carousel",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.CheckBox",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ColorPalette",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ColorPaletteItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ColorPalettePopover",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ColorPicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ComboBox",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ComboBoxItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ComboBoxItemCustom",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ComboBoxItemGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DatePicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DateRangePicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DateTimeInput",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DateTimePicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DayPicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Dialog",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DropIndicator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.DynamicDateRange",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ExpandableText",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.FileUploader",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Form",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.FormGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.FormItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Icon",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Input",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.InputIcon",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Label",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Link",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.List",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ListItemCustom",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ListItemGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ListItemGroupHeader",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ListItemStandard",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Menu",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MenuItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MenuItemGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MenuSeparator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MessageStrip",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MonthPicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MultiComboBox",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MultiComboBoxItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MultiComboBoxItemCustom",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MultiComboBoxItemGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.MultiInput",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.NumberInput",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Option",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.OptionCustom",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.OptionGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Panel",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Popover",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ProgressIndicator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.RadioButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.RangeSlider",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.RatingIndicator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ResponsivePopover",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SegmentedButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SegmentedButtonItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Select",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Slider",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SliderHandle",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SliderTooltip",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SpecialCalendarDate",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SplitButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.StepInput",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SuggestionItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SuggestionItemCustom",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SuggestionItemGroup",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.SuggestionListItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Switch",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Tab",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TabContainer",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TabSeparator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Table",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableCell",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableGroupRow",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableGrowing",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableHeaderCell",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableHeaderCellActionAI",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableHeaderRow",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableRow",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableRowAction",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableRowActionNavigation",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableSelection",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableSelectionMulti",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableSelectionSingle",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TableVirtualizer",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Tag",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Text",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TextArea",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TimePicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TimePickerClock",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TimeSelectionClocks",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TimeSelectionInputs",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Title",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Toast",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToggleButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToggleSpinButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Token",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Tokenizer",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Toolbar",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarButton",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarSelect",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarSelectOption",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarSeparator",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.ToolbarSpacer",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.Tree",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TreeItem",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.TreeItemCustom",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.YearPicker",
        "sap.ui.geomap.gen.ui5.webcomponents.dist.YearRangePicker"
      ],
      elements: [],
      rootPath: "../"
    };

    // Enums
    /**
     * Different types of AvatarColorScheme.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/AvatarColorScheme
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.AvatarColorScheme
     * @public
     * @since 1.155
     */
    pkg["AvatarColorScheme"] = {
      /**
       * Accent1
       *
       * @public
       * @since 1.155
       */
      Accent1: "Accent1",
      /**
       * Accent10
       *
       * @public
       * @since 1.155
       */
      Accent10: "Accent10",
      /**
       * Accent2
       *
       * @public
       * @since 1.155
       */
      Accent2: "Accent2",
      /**
       * Accent3
       *
       * @public
       * @since 1.155
       */
      Accent3: "Accent3",
      /**
       * Accent4
       *
       * @public
       * @since 1.155
       */
      Accent4: "Accent4",
      /**
       * Accent5
       *
       * @public
       * @since 1.155
       */
      Accent5: "Accent5",
      /**
       * Accent6
       *
       * @public
       * @since 1.155
       */
      Accent6: "Accent6",
      /**
       * Accent7
       *
       * @public
       * @since 1.155
       */
      Accent7: "Accent7",
      /**
       * Accent8
       *
       * @public
       * @since 1.155
       */
      Accent8: "Accent8",
      /**
       * Accent9
       *
       * @public
       * @since 1.155
       */
      Accent9: "Accent9",
      /**
       * Auto
       *
       * @public
       * @since 1.155
       */
      Auto: "Auto",
      /**
       * Placeholder
       *
       * @public
       * @since 1.155
       */
      Placeholder: "Placeholder",
      /**
       * Transparent
       *
       * @public
       * @since 1.155
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarColorScheme",
      pkg["AvatarColorScheme"]
    );
    /**
     * Different types of AvatarGroupType.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/AvatarGroupType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.AvatarGroupType
     * @public
     * @since 1.155
     */
    pkg["AvatarGroupType"] = {
      /**
       * The avatars are displayed as partially overlapped on top of each other and the entire group has one click or tap area.
       *
       * @public
       * @since 1.155
       */
      Group: "Group",
      /**
       * The avatars are displayed side-by-side and each avatar has its own click or tap area.
       *
       * @public
       * @since 1.155
       */
      Individual: "Individual"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarGroupType",
      pkg["AvatarGroupType"]
    );
    /**
     * Different Avatar modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/AvatarMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.AvatarMode
     * @public
     * @since 1.155
     */
    pkg["AvatarMode"] = {
      /**
       * Decorative mode.
       * Configures the component to internally render role&#x3D;&quot;presentation&quot; and aria-hidden&#x3D;&quot;true&quot;,
       * making it purely decorative without semantic content or interactivity.
       *
       * @public
       * @since 1.155
       */
      Decorative: "Decorative",
      /**
       * Image mode (by default).
       * Configures the component to internally render role&#x3D;&quot;img&quot;.
       *
       * @public
       * @since 1.155
       */
      Image: "Image",
      /**
       * Interactive mode.
       * Configures the component to internally render role&#x3D;&quot;button&quot;.
       * This mode also supports focus and enables keyboard interaction.
       *
       * @public
       * @since 1.155
       */
      Interactive: "Interactive"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarMode", pkg["AvatarMode"]);
    /**
     * Different types of AvatarShape.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/AvatarShape
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.AvatarShape
     * @public
     * @since 1.155
     */
    pkg["AvatarShape"] = {
      /**
       * Circular shape.
       *
       * @public
       * @since 1.155
       */
      Circle: "Circle",
      /**
       * Square shape.
       *
       * @public
       * @since 1.155
       */
      Square: "Square"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarShape",
      pkg["AvatarShape"]
    );
    /**
     * Different types of AvatarSize.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/AvatarSize
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.AvatarSize
     * @public
     * @since 1.155
     */
    pkg["AvatarSize"] = {
      /**
       * component size - 5rem
       * font size - 2.5rem
       *
       * @public
       * @since 1.155
       */
      L: "L",
      /**
       * component size - 4rem
       * font size - 2rem
       *
       * @public
       * @since 1.155
       */
      M: "M",
      /**
       * component size - 3rem
       * font size - 1.5rem
       *
       * @public
       * @since 1.155
       */
      S: "S",
      /**
       * component size - 7rem
       * font size - 3rem
       *
       * @public
       * @since 1.155
       */
      XL: "XL",
      /**
       * component size - 2rem
       * font size - 1rem
       *
       * @public
       * @since 1.155
       */
      XS: "XS"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.AvatarSize", pkg["AvatarSize"]);
    /**
     * Defines background designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BackgroundDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BackgroundDesign
     * @public
     * @since 1.155
     */
    pkg["BackgroundDesign"] = {
      /**
       * A solid background color dependent on the theme.
       *
       * @public
       * @since 1.155
       */
      Solid: "Solid",
      /**
       * A translucent background depending on the opacity value of the theme.
       *
       * @public
       * @since 1.155
       */
      Translucent: "Translucent",
      /**
       * Transparent background.
       *
       * @public
       * @since 1.155
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BackgroundDesign",
      pkg["BackgroundDesign"]
    );
    /**
     * ListItem accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BarAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BarAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["BarAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;none&quot;.
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Represents the ARIA role &quot;toolbar&quot;.
       *
       * @public
       * @since 1.155
       */
      Toolbar: "Toolbar"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BarAccessibleRole",
      pkg["BarAccessibleRole"]
    );
    /**
     * Different types of Bar design
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BarDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BarDesign
     * @public
     * @since 1.155
     */
    pkg["BarDesign"] = {
      /**
       * Floating Footer type - there is visible border on all sides
       *
       * @public
       * @since 1.155
       */
      FloatingFooter: "FloatingFooter",
      /**
       * Footer type
       *
       * @public
       * @since 1.155
       */
      Footer: "Footer",
      /**
       * Default type
       *
       * @public
       * @since 1.155
       */
      Header: "Header",
      /**
       * Subheader type
       *
       * @public
       * @since 1.155
       */
      Subheader: "Subheader"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.BarDesign", pkg["BarDesign"]);
    /**
     * Defines border designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BorderDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BorderDesign
     * @public
     * @since 1.155
     */
    pkg["BorderDesign"] = {
      /**
       * Specifies no border.
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * A solid border color dependent on the theme.
       *
       * @public
       * @since 1.155
       */
      Solid: "Solid"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BorderDesign",
      pkg["BorderDesign"]
    );
    /**
     * Different  Breadcrumbs designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BreadcrumbsDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BreadcrumbsDesign
     * @public
     * @since 1.155
     */
    pkg["BreadcrumbsDesign"] = {
      /**
       * All items are displayed as links.
       *
       * @public
       * @since 1.155
       */
      NoCurrentPage: "NoCurrentPage",
      /**
       * Shows the current page as the last item in the trail.
       * The last item contains only plain text and is not a link.
       *
       * @public
       * @since 1.155
       */
      Standard: "Standard"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BreadcrumbsDesign",
      pkg["BreadcrumbsDesign"]
    );
    /**
     * Different Breadcrumbs separators.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BreadcrumbsSeparator
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BreadcrumbsSeparator
     * @public
     * @since 1.155
     */
    pkg["BreadcrumbsSeparator"] = {
      /**
       * The separator appears as &quot;\&quot;.
       *
       * @public
       * @since 1.155
       */
      BackSlash: "BackSlash",
      /**
       * The separator appears as &quot;\\&quot;.
       *
       * @public
       * @since 1.155
       */
      DoubleBackSlash: "DoubleBackSlash",
      /**
       * The separator appears as &quot;&gt;&gt;&quot;.
       *
       * @public
       * @since 1.155
       */
      DoubleGreaterThan: "DoubleGreaterThan",
      /**
       * The separator appears as &quot;//&quot; .
       *
       * @public
       * @since 1.155
       */
      DoubleSlash: "DoubleSlash",
      /**
       * The separator appears as &quot;&gt;&quot;.
       *
       * @public
       * @since 1.155
       */
      GreaterThan: "GreaterThan",
      /**
       * The separator appears as &quot;/&quot;.
       *
       * @public
       * @since 1.155
       */
      Slash: "Slash"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BreadcrumbsSeparator",
      pkg["BreadcrumbsSeparator"]
    );
    /**
     * Different BusyIndicator sizes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BusyIndicatorSize
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BusyIndicatorSize
     * @public
     * @since 1.155
     */
    pkg["BusyIndicatorSize"] = {
      /**
       * large size
       *
       * @public
       * @since 1.155
       */
      L: "L",
      /**
       * medium size
       *
       * @public
       * @since 1.155
       */
      M: "M",
      /**
       * small size
       *
       * @public
       * @since 1.155
       */
      S: "S"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BusyIndicatorSize",
      pkg["BusyIndicatorSize"]
    );
    /**
     * Different BusyIndicator text placements.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/BusyIndicatorTextPlacement
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.BusyIndicatorTextPlacement
     * @public
     * @since 1.155
     */
    pkg["BusyIndicatorTextPlacement"] = {
      /**
       * The text will be displayed at the bottom of the busy indicator.
       *
       * @public
       * @since 1.155
       */
      Bottom: "Bottom",
      /**
       * The text will be displayed on top of the busy indicator.
       *
       * @public
       * @since 1.155
       */
      Top: "Top"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.BusyIndicatorTextPlacement",
      pkg["BusyIndicatorTextPlacement"]
    );
    /**
     * Button accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ButtonAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ButtonAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["ButtonAccessibleRole"] = {
      /**
       * Represents Default (button) ARIA role.
       *
       * @public
       * @since 1.155
       */
      Button: "Button",
      /**
       * Represents the ARIA role &quot;link&quot;.
       *
       * @public
       * @since 1.155
       */
      Link: "Link"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonAccessibleRole",
      pkg["ButtonAccessibleRole"]
    );
    /**
     * Determines where the badge will be placed and how it will be styled.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ButtonBadgeDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ButtonBadgeDesign
     * @public
     * @since 1.155
     */
    pkg["ButtonBadgeDesign"] = {
      /**
       * The badge is displayed as an attention dot.
       *
       * @public
       * @since 1.155
       */
      AttentionDot: "AttentionDot",
      /**
       * The badge is displayed after the text, inside the button.
       *
       * @public
       * @since 1.155
       */
      InlineText: "InlineText",
      /**
       * The badge is displayed at the top-end corner of the button.
       *
       * **Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
       *
       * @public
       * @since 1.155
       */
      OverlayText: "OverlayText"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonBadgeDesign",
      pkg["ButtonBadgeDesign"]
    );
    /**
     * Different Button designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ButtonDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ButtonDesign
     * @public
     * @since 1.155
     */
    pkg["ButtonDesign"] = {
      /**
       * attention type
       *
       * @public
       * @since 1.155
       */
      Attention: "Attention",
      /**
       * default type (no special styling)
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * emphasized type
       *
       * @public
       * @since 1.155
       */
      Emphasized: "Emphasized",
      /**
       * reject style (red button)
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * accept type (green button)
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive",
      /**
       * transparent type
       *
       * @public
       * @since 1.155
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonDesign",
      pkg["ButtonDesign"]
    );
    /**
     * Determines if the button has special form-related functionality.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ButtonType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ButtonType
     * @public
     * @since 1.155
     */
    pkg["ButtonType"] = {
      /**
       * The button does not do anything special when inside a form
       *
       * @public
       * @since 1.155
       */
      Button: "Button",
      /**
       * The button acts as a reset button (resets a form)
       *
       * @public
       * @since 1.155
       */
      Reset: "Reset",
      /**
       * The button acts as a submit button (submits a form)
       *
       * @public
       * @since 1.155
       */
      Submit: "Submit"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.ButtonType", pkg["ButtonType"]);
    /**
     * Enum for calendar legend items' types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/CalendarLegendItemType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.CalendarLegendItemType
     * @public
     * @since 1.155
     */
    pkg["CalendarLegendItemType"] = {
      /**
       * Set when no type is set.
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Represents the &quot;NonWorking&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      NonWorking: "NonWorking",
      /**
       * Represents the &quot;Type01&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type01: "Type01",
      /**
       * Represents the &quot;Type02&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type02: "Type02",
      /**
       * Represents the &quot;Type03&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type03: "Type03",
      /**
       * Represents the &quot;Type04&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type04: "Type04",
      /**
       * Represents the &quot;Type05&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type05: "Type05",
      /**
       * Represents the &quot;Type06&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type06: "Type06",
      /**
       * Represents the &quot;Type07&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type07: "Type07",
      /**
       * Represents the &quot;Type08&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type08: "Type08",
      /**
       * Represents the &quot;Type09&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type09: "Type09",
      /**
       * Represents the &quot;Type10&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type10: "Type10",
      /**
       * Represents the &quot;Type11&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type11: "Type11",
      /**
       * Represents the &quot;Type12&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type12: "Type12",
      /**
       * Represents the &quot;Type13&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type13: "Type13",
      /**
       * Represents the &quot;Type14&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type14: "Type14",
      /**
       * Represents the &quot;Type15&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type15: "Type15",
      /**
       * Represents the &quot;Type16&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type16: "Type16",
      /**
       * Represents the &quot;Type17&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type17: "Type17",
      /**
       * Represents the &quot;Type18&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type18: "Type18",
      /**
       * Represents the &quot;Type19&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type19: "Type19",
      /**
       * Represents the &quot;Type20&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Type20: "Type20",
      /**
       * Represents the &quot;Working&quot; item in the calendar legend.
       *
       * @public
       * @since 1.155
       */
      Working: "Working"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CalendarLegendItemType",
      pkg["CalendarLegendItemType"]
    );
    /**
     * Different Calendar selection mode.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/CalendarSelectionMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.CalendarSelectionMode
     * @public
     * @since 1.155
     */
    pkg["CalendarSelectionMode"] = {
      /**
       * Several dates can be selected
       *
       * @public
       * @since 1.155
       */
      Multiple: "Multiple",
      /**
       * A range defined by a start date and an end date can be selected
       *
       * @public
       * @since 1.155
       */
      Range: "Range",
      /**
       * Only one date can be selected at a time
       *
       * @public
       * @since 1.155
       */
      Single: "Single"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CalendarSelectionMode",
      pkg["CalendarSelectionMode"]
    );
    /**
     * The <code>CalendarWeekNumbering</code> enum defines how to calculate calendar weeks. Each
     * value defines:
     * - The first day of the week,
     * - The first week of the year.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/CalendarWeekNumbering
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.CalendarWeekNumbering
     * @public
     * @since 1.155
     */
    pkg["CalendarWeekNumbering"] = {
      /**
       * The default calendar week numbering:
       *
       * The framework determines the week numbering scheme; currently it is derived from the
       * active format locale. Future versions of ui5-webcomponents might select a different week numbering
       * scheme.
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * Official calendar week numbering in most of Europe (ISO 8601 standard):
       * Monday is first day of the week, the week containing January 4th is first week of the year.
       *
       * @public
       * @since 1.155
       */
      ISO_8601: "ISO_8601",
      /**
       * Official calendar week numbering in much of the Middle East (Middle Eastern calendar):
       * Saturday is first day of the week, the week containing January 1st is first week of the year.
       *
       * @public
       * @since 1.155
       */
      MiddleEastern: "MiddleEastern",
      /**
       * Official calendar week numbering in the United States, Canada, Brazil, Israel, Japan, and
       * other countries (Western traditional calendar):
       * Sunday is first day of the week, the week containing January 1st is first week of the year.
       *
       * @public
       * @since 1.155
       */
      WesternTraditional: "WesternTraditional"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CalendarWeekNumbering",
      pkg["CalendarWeekNumbering"]
    );
    /**
     * Different Carousel arrows placement.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/CarouselArrowsPlacement
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.CarouselArrowsPlacement
     * @public
     * @since 1.155
     */
    pkg["CarouselArrowsPlacement"] = {
      /**
       * Carousel arrows are placed on the sides of the current Carousel page.
       *
       * @public
       * @since 1.155
       */
      Content: "Content",
      /**
       * Carousel arrows are placed on the sides of the page indicator of the Carousel.
       *
       * @public
       * @since 1.155
       */
      Navigation: "Navigation"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CarouselArrowsPlacement",
      pkg["CarouselArrowsPlacement"]
    );
    /**
     * Different Carousel page indicator types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/CarouselPageIndicatorType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.CarouselPageIndicatorType
     * @public
     * @since 1.155
     */
    pkg["CarouselPageIndicatorType"] = {
      /**
       * The page indicator will be visualized as dots if there are fewer than 9 pages.
       * If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * The page indicator will display the current page and the total number of pages. (e.g. X of Y)
       *
       * @public
       * @since 1.155
       */
      Numeric: "Numeric"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.CarouselPageIndicatorType",
      pkg["CarouselPageIndicatorType"]
    );
    /**
     * Different filtering types of the ComboBox.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ComboBoxFilter
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ComboBoxFilter
     * @public
     * @since 1.155
     */
    pkg["ComboBoxFilter"] = {
      /**
       * Defines contains filtering.
       *
       * @public
       * @since 1.155
       */
      Contains: "Contains",
      /**
       * Removes any filtering applied while typing
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Defines filtering by starting symbol of item&#x27;s text.
       *
       * @public
       * @since 1.155
       */
      StartsWith: "StartsWith",
      /**
       * Defines filtering by first symbol of each word of item&#x27;s text.
       *
       * @public
       * @since 1.155
       */
      StartsWithPerTerm: "StartsWithPerTerm"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ComboBoxFilter",
      pkg["ComboBoxFilter"]
    );
    /**
     * Overflow Mode.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ExpandableTextOverflowMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ExpandableTextOverflowMode
     * @public
     * @since 1.155
     */
    pkg["ExpandableTextOverflowMode"] = {
      /**
       * Overflowing text is appended in-place.
       *
       * @public
       * @since 1.155
       */
      InPlace: "InPlace",
      /**
       * Full text is displayed in a popover.
       *
       * @public
       * @since 1.155
       */
      Popover: "Popover"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ExpandableTextOverflowMode",
      pkg["ExpandableTextOverflowMode"]
    );
    /**
     * Accessibility modes of the Form.
     *
     * Based on the mode, the Form and its items will render different HTML elements and ARIA attributes,
     * which are appropriate for the use-case.
     *
     * **Usage:**
     * - "Display" mode should be used when the form consists of non-editable (e.g. texts) form items.
     * - "Edit" mode should be used when the form consists of editable (e.g. input fields) form items.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/FormAccessibleMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.FormAccessibleMode
     * @public
     * @since 1.155
     */
    pkg["FormAccessibleMode"] = {
      /**
       * Display mode.
       *
       * @public
       * @since 1.155
       */
      Display: "Display",
      /**
       * Edit mode.
       *
       * @public
       * @since 1.155
       */
      Edit: "Edit"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.FormAccessibleMode",
      pkg["FormAccessibleMode"]
    );
    /**
     * Different spacing of the form items.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/FormItemSpacing
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.FormItemSpacing
     * @public
     * @since 1.155
     */
    pkg["FormItemSpacing"] = {
      /**
       * Large spacing (larger vertical space between form items).
       *
       * @public
       * @since 1.155
       */
      Large: "Large",
      /**
       * Normal spacing (smaller vertical space between form items).
       *
       * @public
       * @since 1.155
       */
      Normal: "Normal"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.FormItemSpacing",
      pkg["FormItemSpacing"]
    );
    /**
     * Different types of Highlight .
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/Highlight
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.Highlight
     * @public
     * @since 1.155
     */
    pkg["Highlight"] = {
      /**
       * Critical
       *
       * @public
       * @since 1.155
       */
      Critical: "Critical",
      /**
       * Information
       *
       * @public
       * @since 1.155
       */
      Information: "Information",
      /**
       * Negative
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * None
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Positive
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.Highlight", pkg["Highlight"]);
    /**
     * Different Icon semantic designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/IconDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.IconDesign
     * @public
     * @since 1.155
     */
    pkg["IconDesign"] = {
      /**
       * Contrast design
       *
       * @public
       * @since 1.155
       */
      Contrast: "Contrast",
      /**
       * Critical design
       *
       * @public
       * @since 1.155
       */
      Critical: "Critical",
      /**
       * Default design (brand design)
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * info type
       *
       * @public
       * @since 1.155
       */
      Information: "Information",
      /**
       * Negative design
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * Neutral design
       *
       * @public
       * @since 1.155
       */
      Neutral: "Neutral",
      /**
       * Design that indicates an icon which isn&#x27;t interactive
       *
       * @public
       * @since 1.155
       */
      NonInteractive: "NonInteractive",
      /**
       * Positive design
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.IconDesign", pkg["IconDesign"]);
    /**
     * Different Icon modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/IconMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.IconMode
     * @public
     * @since 1.155
     */
    pkg["IconMode"] = {
      /**
       * Decorative mode.
       * Configures the component to internally render role&#x3D;&quot;presentation&quot; and aria-hidden&#x3D;&quot;true&quot;,
       * making it purely decorative without semantic content or interactivity.
       *
       * @public
       * @since 1.155
       */
      Decorative: "Decorative",
      /**
       * Image mode (by default).
       * Configures the component to internally render role&#x3D;&quot;img&quot;.
       *
       * @public
       * @since 1.155
       */
      Image: "Image",
      /**
       * Interactive mode.
       * Configures the component to internally render role&#x3D;&quot;button&quot;.
       * This mode also supports focus and press handling to enhance interactivity.
       *
       * @public
       * @since 1.155
       */
      Interactive: "Interactive"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.IconMode", pkg["IconMode"]);
    /**
     * Different filtering types of the Input.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/InputSuggestionsFilter
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.InputSuggestionsFilter
     * @public
     * @since 1.155
     */
    pkg["InputSuggestionsFilter"] = {
      /**
       * Defines contains filtering.
       *
       * @public
       * @since 1.155
       */
      Contains: "Contains",
      /**
       * Removes any filtering applied while typing
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Defines filtering by starting symbol of item&#x27;s text.
       *
       * @public
       * @since 1.155
       */
      StartsWith: "StartsWith",
      /**
       * Defines filtering by first symbol of each word of item&#x27;s text.
       *
       * @public
       * @since 1.155
       */
      StartsWithPerTerm: "StartsWithPerTerm"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.InputSuggestionsFilter",
      pkg["InputSuggestionsFilter"]
    );
    /**
     * Different input types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/InputType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.InputType
     * @public
     * @since 1.155
     */
    pkg["InputType"] = {
      /**
       * Used for input fields that must contain an e-mail address.
       *
       * @public
       * @since 1.155
       */
      Email: "Email",
      /**
       * Defines a numeric input field.
       *
       * @public
       * @since 1.155
       */
      Number: "Number",
      /**
       * Defines a password field.
       *
       * @public
       * @since 1.155
       */
      Password: "Password",
      /**
       * Used for input fields that should contain a search term.
       *
       * @public
       * @since 1.155
       */
      Search: "Search",
      /**
       * Used for input fields that should contain a telephone number.
       *
       * @public
       * @since 1.155
       */
      Tel: "Tel",
      /**
       * Defines a one-line text input field:
       *
       * @public
       * @since 1.155
       */
      Text: "Text",
      /**
       * Used for input fields that should contain a URL address.
       *
       * @public
       * @since 1.155
       */
      URL: "URL"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.InputType", pkg["InputType"]);
    /**
     * Defines the area size around the component that the user can select.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/InteractiveAreaSize
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.InteractiveAreaSize
     * @public
     * @since 1.155
     */
    pkg["InteractiveAreaSize"] = {
      /**
       * Enlarged target area size (up to 24px in height) provides users with an enhanced dedicated space to interact with the component.
       *
       * @public
       * @since 1.155
       */
      Large: "Large",
      /**
       * The default target area size (the area taken by the component itself without any extra invisible touch area).
       *
       * @public
       * @since 1.155
       */
      Normal: "Normal"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.InteractiveAreaSize",
      pkg["InteractiveAreaSize"]
    );
    /**
     * Link accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/LinkAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.LinkAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["LinkAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;button&quot;.
       *
       * @public
       * @since 1.155
       */
      Button: "Button",
      /**
       * Represents Default (link) ARIA role.
       *
       * @public
       * @since 1.155
       */
      Link: "Link"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.LinkAccessibleRole",
      pkg["LinkAccessibleRole"]
    );
    /**
     * Different link designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/LinkDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.LinkDesign
     * @public
     * @since 1.155
     */
    pkg["LinkDesign"] = {
      /**
       * default type (no special styling)
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * emphasized type
       *
       * @public
       * @since 1.155
       */
      Emphasized: "Emphasized",
      /**
       * subtle type (appears as regular text, rather than a link)
       *
       * @public
       * @since 1.155
       */
      Subtle: "Subtle"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.LinkDesign", pkg["LinkDesign"]);
    /**
     * List accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ListAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ListAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["ListAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;list&quot;. (by default)
       *
       * @public
       * @since 1.155
       */
      List: "List",
      /**
       * Represents the ARIA role &quot;listbox&quot;.
       *
       * @public
       * @since 1.155
       */
      ListBox: "ListBox",
      /**
       * Represents the ARIA role &quot;menu&quot;.
       *
       * @public
       * @since 1.155
       */
      Menu: "Menu",
      /**
       * Represents the ARIA role &quot;tree&quot;.
       *
       * @public
       * @since 1.155
       */
      Tree: "Tree"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListAccessibleRole",
      pkg["ListAccessibleRole"]
    );
    /**
     * Different list growing modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ListGrowingMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ListGrowingMode
     * @public
     * @since 1.155
     */
    pkg["ListGrowingMode"] = {
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
       * at the bottom.
       *
       * @public
       * @since 1.155
       */
      Button: "Button",
      /**
       * Component&#x27;s growing is not enabled.
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon scroll.
       *
       * @public
       * @since 1.155
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListGrowingMode",
      pkg["ListGrowingMode"]
    );
    /**
     * ListItem accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ListItemAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ListItemAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["ListItemAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;listitem&quot;. (by default)
       *
       * @public
       * @since 1.155
       */
      ListItem: "ListItem",
      /**
       * Represents the ARIA role &quot;menuitem&quot;.
       *
       * @public
       * @since 1.155
       */
      MenuItem: "MenuItem",
      /**
       * Represents the ARIA role &quot;none&quot;.
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Represents the ARIA role &quot;option&quot;.
       *
       * @public
       * @since 1.155
       */
      Option: "Option",
      /**
       * Represents the ARIA role &quot;treeitem&quot;.
       *
       * @public
       * @since 1.155
       */
      TreeItem: "TreeItem"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListItemAccessibleRole",
      pkg["ListItemAccessibleRole"]
    );
    /**
     * Different list item types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ListItemType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ListItemType
     * @public
     * @since 1.155
     */
    pkg["ListItemType"] = {
      /**
       * Indicates that the item is clickable via active feedback when item is pressed.
       *
       * @public
       * @since 1.155
       */
      Active: "Active",
      /**
       * Enables detail button of the list item that fires detail-click event.
       *
       * @public
       * @since 1.155
       */
      Detail: "Detail",
      /**
       * Indicates the list item does not have any active feedback when item is pressed.
       *
       * @public
       * @since 1.155
       */
      Inactive: "Inactive",
      /**
       * Indicates the list item does not have any active feedback when item is pressed,
       * but the item can still be selected when a selection mode is active
       * (via the item body, Space/Enter, or the checkbox/radio).
       * The &#x60;item-click&#x60; event is not fired for items of this type.
       *
       * @public
       * @since 1.155
       */
      InactiveSelectable: "InactiveSelectable",
      /**
       * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
       *
       * @public
       * @since 1.155
       */
      Navigation: "Navigation"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListItemType",
      pkg["ListItemType"]
    );
    /**
     * Different list selection modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ListSelectionMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ListSelectionMode
     * @public
     * @since 1.155
     */
    pkg["ListSelectionMode"] = {
      /**
       * Delete mode (only one list item can be deleted via provided delete button)
       *
       * @public
       * @since 1.155
       */
      Delete: "Delete",
      /**
       * Multi selection mode (more than one list item can be selected).
       *
       * @public
       * @since 1.155
       */
      Multiple: "Multiple",
      /**
       * Default mode (no selection).
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Right-positioned single selection mode (only one list item can be selected).
       *
       * @public
       * @since 1.155
       */
      Single: "Single",
      /**
       * Selected item is highlighted and selection is changed upon arrow navigation
       * (only one list item can be selected - this is always the focused item).
       *
       * @public
       * @since 1.155
       */
      SingleAuto: "SingleAuto",
      /**
       * Selected item is highlighted but no selection element is visible
       * (only one list item can be selected).
       *
       * @public
       * @since 1.155
       */
      SingleEnd: "SingleEnd",
      /**
       * Left-positioned single selection mode (only one list item can be selected).
       *
       * @public
       * @since 1.155
       */
      SingleStart: "SingleStart"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListSelectionMode",
      pkg["ListSelectionMode"]
    );
    /**
     * Different types of list items separators.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ListSeparator
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ListSeparator
     * @public
     * @since 1.155
     */
    pkg["ListSeparator"] = {
      /**
       * Separators between the items including the last and the first one.
       *
       * @public
       * @since 1.155
       */
      All: "All",
      /**
       * Separators between the items.
       * Note: This enumeration depends on the theme.
       *
       * @public
       * @since 1.155
       */
      Inner: "Inner",
      /**
       * No item separators.
       *
       * @public
       * @since 1.155
       */
      None: "None"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ListSeparator",
      pkg["ListSeparator"]
    );
    /**
     * Menu item group check modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/MenuItemGroupCheckMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.MenuItemGroupCheckMode
     * @public
     * @since 1.155
     */
    pkg["MenuItemGroupCheckMode"] = {
      /**
       * Multiple items check mode (multiple items in a group can be checked at a time)
       *
       * @public
       * @since 1.155
       */
      Multiple: "Multiple",
      /**
       * default type (items in a group cannot be checked)
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Single item check mode (only one item in a group can be checked at a time)
       *
       * @public
       * @since 1.155
       */
      Single: "Single"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.MenuItemGroupCheckMode",
      pkg["MenuItemGroupCheckMode"]
    );
    /**
     * MessageStrip designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/MessageStripDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.MessageStripDesign
     * @public
     * @since 1.155
     */
    pkg["MessageStripDesign"] = {
      /**
       * Message uses custom color set 1
       *
       * @public
       * @since 1.155
       */
      ColorSet1: "ColorSet1",
      /**
       * Message uses custom color set 2
       *
       * @public
       * @since 1.155
       */
      ColorSet2: "ColorSet2",
      /**
       * Message is a warning
       *
       * @public
       * @since 1.155
       */
      Critical: "Critical",
      /**
       * Message should be just an information
       *
       * @public
       * @since 1.155
       */
      Information: "Information",
      /**
       * Message is an error
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * Message is a success message
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.MessageStripDesign",
      pkg["MessageStripDesign"]
    );
    /**
     * Different notification list growing modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/NotificationListGrowingMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.NotificationListGrowingMode
     * @public
     * @since 1.155
     */
    pkg["NotificationListGrowingMode"] = {
      /**
       * Component&#x27;s &quot;load-more&quot; is fired upon pressing a &quot;More&quot; button.
       * at the bottom.
       *
       * @public
       * @since 1.155
       */
      Button: "Button",
      /**
       * Component&#x27;s growing is not enabled.
       *
       * @public
       * @since 1.155
       */
      None: "None"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.NotificationListGrowingMode",
      pkg["NotificationListGrowingMode"]
    );
    /**
     * Tabs overflow mode in TabContainer.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/OverflowMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.OverflowMode
     * @public
     * @since 1.155
     */
    pkg["OverflowMode"] = {
      /**
       * End type is used if there should be only one overflow with hidden the tabs at the end of the tab container.
       *
       * @public
       * @since 1.155
       */
      End: "End",
      /**
       * StartAndEnd type is used if there should be two overflows on both ends of the tab container.
       *
       * @public
       * @since 1.155
       */
      StartAndEnd: "StartAndEnd"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.OverflowMode",
      pkg["OverflowMode"]
    );
    /**
     * Panel accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/PanelAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.PanelAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["PanelAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;complementary&quot;.
       * A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
       *
       * @public
       * @since 1.155
       */
      Complementary: "Complementary",
      /**
       * Represents the ARIA role &quot;Form&quot;.
       * A landmark region that contains a collection of items and objects that, as a whole, create a form.
       *
       * @public
       * @since 1.155
       */
      Form: "Form",
      /**
       * Represents the ARIA role &quot;Region&quot;.
       * A section of a page, that is important enough to be included in a page summary or table of contents.
       *
       * @public
       * @since 1.155
       */
      Region: "Region"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PanelAccessibleRole",
      pkg["PanelAccessibleRole"]
    );
    /**
     * Popover horizontal align types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/PopoverHorizontalAlign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.PopoverHorizontalAlign
     * @public
     * @since 1.155
     */
    pkg["PopoverHorizontalAlign"] = {
      /**
       * Popover is centered.
       *
       * @public
       * @since 1.155
       */
      Center: "Center",
      /**
       * Popover is aligned with the end of the target.
       *
       * @public
       * @since 1.155
       */
      End: "End",
      /**
       * Popover is aligned with the start of the target.
       *
       * @public
       * @since 1.155
       */
      Start: "Start",
      /**
       * Popover is stretched.
       *
       * @public
       * @since 1.155
       */
      Stretch: "Stretch"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopoverHorizontalAlign",
      pkg["PopoverHorizontalAlign"]
    );
    /**
     * Popover placements.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/PopoverPlacement
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.PopoverPlacement
     * @public
     * @since 1.155
     */
    pkg["PopoverPlacement"] = {
      /**
       * Popover will be placed at the bottom of the reference element.
       *
       * @public
       * @since 1.155
       */
      Bottom: "Bottom",
      /**
       * Popover will be placed at the end of the reference element.
       *
       * @public
       * @since 1.155
       */
      End: "End",
      /**
       * Popover will be placed at the start of the reference element.
       *
       * @public
       * @since 1.155
       */
      Start: "Start",
      /**
       * Popover will be placed at the top of the reference element.
       *
       * @public
       * @since 1.155
       */
      Top: "Top"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopoverPlacement",
      pkg["PopoverPlacement"]
    );
    /**
     * Popover vertical align types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/PopoverVerticalAlign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.PopoverVerticalAlign
     * @public
     * @since 1.155
     */
    pkg["PopoverVerticalAlign"] = {
      /**
       * Popover will be placed at the bottom of the reference control.
       *
       * @public
       * @since 1.155
       */
      Bottom: "Bottom",
      /**
       * Center
       *
       * @public
       * @since 1.155
       */
      Center: "Center",
      /**
       * Popover will be streched
       *
       * @public
       * @since 1.155
       */
      Stretch: "Stretch",
      /**
       * Popover will be placed at the top of the reference control.
       *
       * @public
       * @since 1.155
       */
      Top: "Top"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopoverVerticalAlign",
      pkg["PopoverVerticalAlign"]
    );
    /**
     * Popup accessible roles.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/PopupAccessibleRole
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.PopupAccessibleRole
     * @public
     * @since 1.155
     */
    pkg["PopupAccessibleRole"] = {
      /**
       * Represents the ARIA role &quot;alertdialog&quot;.
       *
       * @public
       * @since 1.155
       */
      AlertDialog: "AlertDialog",
      /**
       * Represents the ARIA role &quot;dialog&quot;.
       *
       * @public
       * @since 1.155
       */
      Dialog: "Dialog",
      /**
       * Represents no ARIA role.
       *
       * @public
       * @since 1.155
       */
      None: "None"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.PopupAccessibleRole",
      pkg["PopupAccessibleRole"]
    );
    /**
     * Different types of Priority.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/Priority
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.Priority
     * @public
     * @since 1.155
     */
    pkg["Priority"] = {
      /**
       * High priority.
       *
       * @public
       * @since 1.155
       */
      High: "High",
      /**
       * Low priority.
       *
       * @public
       * @since 1.155
       */
      Low: "Low",
      /**
       * Medium priority.
       *
       * @public
       * @since 1.155
       */
      Medium: "Medium",
      /**
       * Default, none priority.
       *
       * @public
       * @since 1.155
       */
      None: "None"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.Priority", pkg["Priority"]);
    /**
     * Types of icon sizes used in the RatingIndicator.
     * Provides predefined size categories to ensure consistent scaling and spacing of icons.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/RatingIndicatorSize
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.RatingIndicatorSize
     * @public
     * @since 1.155
     */
    pkg["RatingIndicatorSize"] = {
      /**
       * Large size for prominent or spacious layouts.
       *
       * @public
       * @since 1.155
       */
      L: "L",
      /**
       * Medium size, used as the default option.
       * Offers a balanced appearance for most scenarios.
       *
       * @public
       * @since 1.155
       */
      M: "M",
      /**
       * Small size for compact layouts.
       *
       * @public
       * @since 1.155
       */
      S: "S"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.RatingIndicatorSize",
      pkg["RatingIndicatorSize"]
    );
    /**
     * Different SegmentedButton selection modes.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/SegmentedButtonSelectionMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.SegmentedButtonSelectionMode
     * @public
     * @since 1.155
     */
    pkg["SegmentedButtonSelectionMode"] = {
      /**
       * Multiple items can be selected at a time. All items can be deselected.
       *
       * @public
       * @since 1.155
       */
      Multiple: "Multiple",
      /**
       * There is always one selected. Selecting one deselects the previous one.
       *
       * @public
       * @since 1.155
       */
      Single: "Single"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SegmentedButtonSelectionMode",
      pkg["SegmentedButtonSelectionMode"]
    );
    /**
     * Defines the separator types for Select component two-column layout.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/SelectTextSeparator
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.SelectTextSeparator
     * @public
     * @since 1.155
     */
    pkg["SelectTextSeparator"] = {
      /**
       * Will show bullet(·) as separator on two columns layout when Select is in read-only mode.
       *
       * @public
       * @since 1.155
       */
      Bullet: "Bullet",
      /**
       * Will show N-dash(–) as separator on two columns layout when Select is in read-only mode.
       *
       * @public
       * @since 1.155
       */
      Dash: "Dash",
      /**
       * Will show vertical line(|) as separator on two columns layout when Select is in read-only mode.
       *
       * @public
       * @since 1.155
       */
      VerticalLine: "VerticalLine"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SelectTextSeparator",
      pkg["SelectTextSeparator"]
    );
    /**
     * Different types of SemanticColor.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/SemanticColor
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.SemanticColor
     * @public
     * @since 1.155
     */
    pkg["SemanticColor"] = {
      /**
       * Critical color
       *
       * @public
       * @since 1.155
       */
      Critical: "Critical",
      /**
       * Default color (brand color)
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * Negative color
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * Neutral color.
       *
       * @public
       * @since 1.155
       */
      Neutral: "Neutral",
      /**
       * Positive color
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SemanticColor",
      pkg["SemanticColor"]
    );
    /**
     * Different types of Switch designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/SwitchDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.SwitchDesign
     * @public
     * @since 1.155
     */
    pkg["SwitchDesign"] = {
      /**
       * Defines the Switch as Graphical
       *
       * @public
       * @since 1.155
       */
      Graphical: "Graphical",
      /**
       * Defines the Switch as Textual
       *
       * @public
       * @since 1.155
       */
      Textual: "Textual"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.SwitchDesign",
      pkg["SwitchDesign"]
    );
    /**
     * Tab layout of TabContainer.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TabLayout
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TabLayout
     * @public
     * @since 1.155
     */
    pkg["TabLayout"] = {
      /**
       * Inline type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed horizotally.
       *
       * @public
       * @since 1.155
       */
      Inline: "Inline",
      /**
       * Standard type, the tab &quot;main text&quot; and &quot;additionalText&quot; are displayed vertically.
       *
       * @public
       * @since 1.155
       */
      Standard: "Standard"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.TabLayout", pkg["TabLayout"]);
    /**
     * Alignment of the &lt;ui5-table-cell&gt; component.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TableCellHorizontalAlign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TableCellHorizontalAlign
     * @public
     * @since 1.155
     */
    pkg["TableCellHorizontalAlign"] = {
      /**
       * Center
       *
       * @public
       * @since 1.155
       */
      Center: "Center",
      /**
       * End
       *
       * @public
       * @since 1.155
       */
      End: "End",
      /**
       * Left
       *
       * @public
       * @since 1.155
       */
      Left: "Left",
      /**
       * Right
       *
       * @public
       * @since 1.155
       */
      Right: "Right",
      /**
       * Start
       *
       * @public
       * @since 1.155
       */
      Start: "Start"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableCellHorizontalAlign",
      pkg["TableCellHorizontalAlign"]
    );
    /**
     * Growing mode of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TableGrowingMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TableGrowingMode
     * @public
     * @since 1.155
     */
    pkg["TableGrowingMode"] = {
      /**
       * Renders a growing button, which can be pressed to load more data.
       *
       * @public
       * @since 1.155
       */
      Button: "Button",
      /**
       * Scroll to load more data.
       *
       * **Note:** If the table is not scrollable, a growing button will be rendered instead to ensure growing functionality.
       *
       * @public
       * @since 1.155
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableGrowingMode",
      pkg["TableGrowingMode"]
    );
    /**
     * Overflow mode of the `ui5-table` component.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TableOverflowMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TableOverflowMode
     * @public
     * @since 1.155
     */
    pkg["TableOverflowMode"] = {
      /**
       * Pops in columns, that do not fit into the table anymore.
       *
       * @public
       * @since 1.155
       */
      Popin: "Popin",
      /**
       * Shows a scrollbar, when the table cannot fit all columns.
       *
       * @public
       * @since 1.155
       */
      Scroll: "Scroll"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableOverflowMode",
      pkg["TableOverflowMode"]
    );
    /**
     * Selection behavior of the `ui5-table` selection components.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TableSelectionBehavior
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TableSelectionBehavior
     * @public
     * @since 1.155
     */
    pkg["TableSelectionBehavior"] = {
      /**
       * Rows can only be selected by clicking directly on the row, as the row selector column is hidden.
       *
       * **Note:** In this mode, the &#x60;row-click&#x60; event of the &#x60;ui5-table&#x60; component is not fired.
       *
       * @public
       * @since 1.155
       */
      RowOnly: "RowOnly",
      /**
       * Rows can only be selected by using the row selector column.
       *
       * @public
       * @since 1.155
       */
      RowSelector: "RowSelector"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableSelectionBehavior",
      pkg["TableSelectionBehavior"]
    );
    /**
     * Selection modes of the &lt;ui5-table&gt; component.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TableSelectionMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TableSelectionMode
     * @public
     * @since 1.155
     */
    pkg["TableSelectionMode"] = {
      /**
       * Multi selection mode (more than one table row can be selected).
       *
       * @public
       * @since 1.155
       */
      Multiple: "Multiple",
      /**
       * Default mode (no selection).
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * Single selection mode (only one table row can be selected).
       *
       * @public
       * @since 1.155
       */
      Single: "Single"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableSelectionMode",
      pkg["TableSelectionMode"]
    );
    /**
     * Selectors of the table header row in multi-selection scenarios.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TableSelectionMultiHeaderSelector
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TableSelectionMultiHeaderSelector
     * @public
     * @since 1.155
     */
    pkg["TableSelectionMultiHeaderSelector"] = {
      /**
       * Renders an icon in the table header row that removes the selection of all rows.
       *
       * @public
       * @since 1.155
       */
      ClearAll: "ClearAll",
      /**
       * Renders a checkbox in the table header row that toggles the selection of all rows.
       *
       * @public
       * @since 1.155
       */
      SelectAll: "SelectAll"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TableSelectionMultiHeaderSelector",
      pkg["TableSelectionMultiHeaderSelector"]
    );
    /**
     * Defines tag design types.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TagDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TagDesign
     * @public
     * @since 1.155
     */
    pkg["TagDesign"] = {
      /**
       * Critical design
       *
       * @public
       * @since 1.155
       */
      Critical: "Critical",
      /**
       * Information design
       *
       * @public
       * @since 1.155
       */
      Information: "Information",
      /**
       * Negative design
       *
       * @public
       * @since 1.155
       */
      Negative: "Negative",
      /**
       * Neutral design
       *
       * @public
       * @since 1.155
       */
      Neutral: "Neutral",
      /**
       * Positive design
       *
       * @public
       * @since 1.155
       */
      Positive: "Positive",
      /**
       * Set1 of generic indication colors that are intended for industry-specific use cases
       *
       * @public
       * @since 1.155
       */
      Set1: "Set1",
      /**
       * Set2 of generic indication colors that are intended for industry-specific use cases
       *
       * @public
       * @since 1.155
       */
      Set2: "Set2"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.TagDesign", pkg["TagDesign"]);
    /**
     * Predefined sizes for the tag.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TagSize
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TagSize
     * @public
     * @since 1.155
     */
    pkg["TagSize"] = {
      /**
       * Large size of the tag
       *
       * @public
       * @since 1.155
       */
      L: "L",
      /**
       * Small size of the tag
       *
       * @public
       * @since 1.155
       */
      S: "S"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.TagSize", pkg["TagSize"]);
    /**
     * Empty Indicator Mode.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TextEmptyIndicatorMode
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TextEmptyIndicatorMode
     * @public
     * @since 1.155
     */
    pkg["TextEmptyIndicatorMode"] = {
      /**
       * Empty indicator is never rendered.
       *
       * @public
       * @since 1.155
       */
      Off: "Off",
      /**
       * Empty indicator is rendered always when the component&#x27;s content is empty.
       *
       * @public
       * @since 1.155
       */
      On: "On"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.TextEmptyIndicatorMode",
      pkg["TextEmptyIndicatorMode"]
    );
    /**
     * Different types of Title level.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/TitleLevel
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.TitleLevel
     * @public
     * @since 1.155
     */
    pkg["TitleLevel"] = {
      /**
       * Renders &#x60;h1&#x60; tag.
       *
       * @public
       * @since 1.155
       */
      H1: "H1",
      /**
       * Renders &#x60;h2&#x60; tag.
       *
       * @public
       * @since 1.155
       */
      H2: "H2",
      /**
       * Renders &#x60;h3&#x60; tag.
       *
       * @public
       * @since 1.155
       */
      H3: "H3",
      /**
       * Renders &#x60;h4&#x60; tag.
       *
       * @public
       * @since 1.155
       */
      H4: "H4",
      /**
       * Renders &#x60;h5&#x60; tag.
       *
       * @public
       * @since 1.155
       */
      H5: "H5",
      /**
       * Renders &#x60;h6&#x60; tag.
       *
       * @public
       * @since 1.155
       */
      H6: "H6"
    };
    registerEnum("sap.ui.geomap.gen.ui5.webcomponents.dist.types.TitleLevel", pkg["TitleLevel"]);
    /**
     * Toast placement.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ToastPlacement
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ToastPlacement
     * @public
     * @since 1.155
     */
    pkg["ToastPlacement"] = {
      /**
       * Toast is placed at the &#x60;BottomCenter&#x60; position of its container.
       * Default placement (no selection)
       *
       * @public
       * @since 1.155
       */
      BottomCenter: "BottomCenter",
      /**
       * Toast is placed at the &#x60;BottomEnd&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      BottomEnd: "BottomEnd",
      /**
       * Toast is placed at the &#x60;BottomStart&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      BottomStart: "BottomStart",
      /**
       * Toast is placed at the &#x60;MiddleCenter&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      MiddleCenter: "MiddleCenter",
      /**
       * Toast is placed at the &#x60;MiddleEnd&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      MiddleEnd: "MiddleEnd",
      /**
       * Toast is placed at the &#x60;MiddleStart&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      MiddleStart: "MiddleStart",
      /**
       * Toast is placed at the &#x60;TopCenter&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      TopCenter: "TopCenter",
      /**
       * Toast is placed at the &#x60;TopEnd&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      TopEnd: "TopEnd",
      /**
       * Toast is placed at the &#x60;TopStart&#x60; position of its container.
       *
       * @public
       * @since 1.155
       */
      TopStart: "TopStart"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToastPlacement",
      pkg["ToastPlacement"]
    );
    /**
     * Defines which direction the items of ui5-toolbar will be aligned.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ToolbarAlign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ToolbarAlign
     * @public
     * @since 1.155
     */
    pkg["ToolbarAlign"] = {
      /**
       * Toolbar items are situated at the &#x60;end&#x60; of the Toolbar
       *
       * @public
       * @since 1.155
       */
      End: "End",
      /**
       * Toolbar items are situated at the &#x60;start&#x60; of the Toolbar
       *
       * @public
       * @since 1.155
       */
      Start: "Start"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToolbarAlign",
      pkg["ToolbarAlign"]
    );
    /**
     * Defines the available toolbar designs.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ToolbarDesign
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ToolbarDesign
     * @public
     * @since 1.155
     */
    pkg["ToolbarDesign"] = {
      /**
       * The toolbar and its content will be displayed with solid background.
       *
       * @public
       * @since 1.155
       */
      Solid: "Solid",
      /**
       * The toolbar and its content will be displayed with transparent background.
       *
       * @public
       * @since 1.155
       */
      Transparent: "Transparent"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToolbarDesign",
      pkg["ToolbarDesign"]
    );
    /**
     * Defines the priority of the toolbar item to go inside overflow popover.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/ToolbarItemOverflowBehavior
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.ToolbarItemOverflowBehavior
     * @public
     * @since 1.155
     */
    pkg["ToolbarItemOverflowBehavior"] = {
      /**
       * When set, the item will be always part of the overflow part of ui5-toolbar.
       *
       * @public
       * @since 1.155
       */
      AlwaysOverflow: "AlwaysOverflow",
      /**
       * The item is presented inside the toolbar and goes in the popover, when there is not enough space.
       *
       * @public
       * @since 1.155
       */
      Default: "Default",
      /**
       * When set, the item will never go to the overflow popover.
       *
       * @public
       * @since 1.155
       */
      NeverOverflow: "NeverOverflow"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.ToolbarItemOverflowBehavior",
      pkg["ToolbarItemOverflowBehavior"]
    );
    /**
     * Different types of wrapping.
     *
     * @enum {string}
     * @alias module:sap/ui/geomap/gen/ui5/webcomponents/dist/types/WrappingType
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents dist.types.WrappingType
     * @public
     * @since 1.155
     */
    pkg["WrappingType"] = {
      /**
       * The text will be truncated with an ellipsis.
       *
       * @public
       * @since 1.155
       */
      None: "None",
      /**
       * The text will wrap. The words will not be broken based on hyphenation.
       *
       * @public
       * @since 1.155
       */
      Normal: "Normal"
    };
    registerEnum(
      "sap.ui.geomap.gen.ui5.webcomponents.dist.types.WrappingType",
      pkg["WrappingType"]
    );

    // Interfaces
    /**
     * Interface for components that represent an avatar and may be slotted in numerous higher-order components such as `ui5-avatar-group`
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/AvatarGroup.IAvatarGroupItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IAvatarGroupItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be used as a button inside numerous higher-order components
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Button.IButton
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IButton
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside a `ui5-calendar`.
     *
     * **Note:** Use with `ui5-date` or `ui5-date-range` as calendar date selection types.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Calendar.ICalendarSelectedDates
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents ICalendarSelectedDates
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be used inside a `ui5-color-palette` or `ui5-color-palette-popover`
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/ColorPalette.IColorPaletteItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IColorPaletteItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside a `ui5-combobox`
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/ComboBox.IComboBoxItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IComboBoxItem
     * @public
     * @since 1.155
     */
    /**
     * Represents a dynamic date range option used by the `ui5-dynamic-date-range` component.
     *
     * Represents a dynamic date range option used for handling dynamic date ranges.
     * This interface defines the structure and behavior required for implementing
     * dynamic date range options, including formatting, parsing, validation, and
     * conversion of date range values.
     *
     *  * Properties:
     * - `icon`: The icon associated with the dynamic date range option, typically used for UI representation.
     * - `operator`: A unique operator identifying the dynamic date range option.
     * - `text`: The display text for the dynamic date range option.
     * - `template` (optional): A JSX template for rendering the dynamic date range option.
     *
     * Methods:
     * - `format(value: DynamicDateRangeValue): string`: Formats the given dynamic date range value into a string representation.
     * - `parse(value: string): DynamicDateRangeValue | undefined`: Parses a string into a dynamic date range value.
     * - `toDates(value: DynamicDateRangeValue): Array<Date>`: Converts a dynamic date range value into an array of `Date` objects.
     * - `handleSelectionChange?(event: CustomEvent): DynamicDateRangeValue | undefined`: (Optional) Handles selection changes in the UI of the dynamic date range option.
     * - `isValidString(value: string): boolean`: Validates whether a given string is a valid representation of the dynamic date range value.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/DynamicDateRange.IDynamicDateRangeOption
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IDynamicDateRangeOption
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that can be slotted inside `ui5-form` as items.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Form.IFormItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IFormItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that represent an icon, usable in numerous higher-order components
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Icon.IIcon
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IIcon
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that represent a suggestion item, usable in `ui5-input`
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Input.IInputSuggestionItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IInputSuggestionItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside a `ui5-menu`.
     *
     * **Note:** Use with `ui5-menu-item` or `ui5-menu-separator`. Implementing the interface does not guarantee that any other classes can work with the `ui5-menu`.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Menu.IMenuItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IMenuItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside a `ui5-multi-combobox` as items
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/MultiComboBox.IMultiComboBoxItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IMultiComboBoxItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside `ui5-segmented-button` as items
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/SegmentedButton.ISegmentedButtonItem
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents ISegmentedButtonItem
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside `ui5-select` as options
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Select.IOption
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IOption
     * @public
     * @since 1.155
     */
    /**
     * Interface for group containers slotted inside `ui5-select`
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Select.IOptionGroup
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IOptionGroup
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that may be slotted inside `ui5-tabcontainer` as items
     *
     * **Note:** Use directly `ui5-tab` or `ui5-tab-seprator`. Implementing the interface does not guarantee that the class can work as a tab.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/TabContainer.ITab
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents ITab
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that can be slotted inside the `features` slot of the `ui5-table`.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Table.ITableFeature
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents ITableFeature
     * @public
     * @since 1.155
     */
    /**
     * Interface for components that can be slotted inside the `features` slot of the `ui5-table`
     * and provide growing/data loading functionality.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/Table.ITableGrowing
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents ITableGrowing
     * @public
     * @since 1.155
     */
    /**
     * Interface for the slotted item in `ui5-toolbar-item`.
     *
     * It could be any HTMLElement or UI5 Web Component with option to specify custom overflow closing events and overflow behavior.
     * Components that also implement `IToolbarArrowNavProvider` can report their internal navigation boundary
     * state to the toolbar for caret-aware arrow-key handling.
     *
     * @interface
     * @name module:sap/ui/geomap/gen/ui5/webcomponents/dist/ToolbarItem.IToolbarItemContent
     * @ui5-module-override sap/ui/geomap/gen/ui5/webcomponents IToolbarItemContent
     * @public
     * @since 1.155
     */

    // marker to threat this as an ES module to support named exports
    pkg.__esModule = true;

    return pkg;
  }
);
