/*!
 * ${copyright}
 */

// Provides control sap.m.DynamicDateRange.
sap.ui.define([
	'sap/base/Log',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	"sap/ui/core/Lib",
	'sap/ui/core/ListItem',
	'sap/ui/core/library',
	'sap/ui/core/Renderer',
	'sap/ui/core/message/MessageMixin',
	'sap/m/DynamicDateFormat',
	'sap/ui/core/IconPool',
	'sap/ui/core/Icon',
	'sap/ui/core/LabelEnablement',
	"sap/ui/core/date/UniversalDate",
	'sap/ui/core/format/DateFormat',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/Device',
	'./Label',
	'./GroupHeaderListItem',
	'./StandardListItem',
	'./StandardListItemRenderer',
	'./Button',
	'./List',
	'./Input',
	'./InputRenderer',
	'./Toolbar',
	'./ResponsivePopover',
	'./Page',
	'./NavContainer',
	'./DynamicDateRangeRenderer',
	'./StandardDynamicDateOption',
	'./library',
	'sap/ui/thirdparty/jquery',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/core/CustomData',
	/* jQuery Plugin "firstFocusableDomRef"*/
	"sap/ui/dom/jquery/Focusable"
], function(
	Log,
	InvisibleText,
	Element,
	Control,
	Library,
	ListItem,
	coreLibrary,
	Renderer,
	MessageMixin,
	DynamicDateFormat,
	IconPool,
	Icon,
	LabelEnablement,
	UniversalDate,
	DateFormat,
	ManagedObjectObserver,
	Device,
	Label,
	GroupHeaderListItem,
	StandardListItem,
	StandardListItemRenderer,
	Button,
	List,
	Input,
	InputRenderer,
	Toolbar,
	ResponsivePopover,
	Page,
	NavContainer,
	DynamicDateRangeRenderer,
	StandardDynamicDateOption,
	library,
	jQuery,
	CalendarUtils,
	CustomData
) {
		"use strict";

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState,
			ToolbarDesign = library.ToolbarDesign,
			ToolbarStyle = library.ToolbarStyle,
			ListType = library.ListType,
			ListMode = library.ListMode,
			ListSeparators = library.ListSeparators,
			oResourceBundle = Library.getResourceBundleFor("sap.m");

			var oStandardOptionsObjects = {
				"TODAY": new StandardDynamicDateOption({ key: "TODAY", valueTypes: [] }),
				"YESTERDAY": new StandardDynamicDateOption({ key: "YESTERDAY", valueTypes: [] }),
				"TOMORROW": new StandardDynamicDateOption({ key: "TOMORROW", valueTypes: [] }),
				"FIRSTDAYWEEK": new StandardDynamicDateOption({ key: "FIRSTDAYWEEK", valueTypes: [] }),
				"LASTDAYWEEK": new StandardDynamicDateOption({ key: "LASTDAYWEEK", valueTypes: [] }),
				"FIRSTDAYMONTH":new StandardDynamicDateOption({ key: "FIRSTDAYMONTH", valueTypes: [] }),
				"LASTDAYMONTH":new StandardDynamicDateOption({ key: "LASTDAYMONTH", valueTypes: [] }),
				"FIRSTDAYQUARTER":new StandardDynamicDateOption({ key: "FIRSTDAYQUARTER", valueTypes: [] }),
				"LASTDAYQUARTER":new StandardDynamicDateOption({ key: "LASTDAYQUARTER", valueTypes: [] }),
				"FIRSTDAYYEAR":new StandardDynamicDateOption({ key: "FIRSTDAYYEAR", valueTypes: [] }),
				"LASTDAYYEAR":new StandardDynamicDateOption({ key: "LASTDAYYEAR", valueTypes: [] }),
				"THISWEEK": new StandardDynamicDateOption({ key: "THISWEEK", valueTypes: [] }),
				"THISMONTH": new StandardDynamicDateOption({ key: "THISMONTH", valueTypes: [] }),
				"THISQUARTER": new StandardDynamicDateOption({ key: "THISQUARTER", valueTypes: [] }),
				"THISYEAR": new StandardDynamicDateOption({ key: "THISYEAR", valueTypes: [] }),
				"LASTWEEK": new StandardDynamicDateOption({ key: "LASTWEEK", valueTypes: [] }),
				"LASTMONTH": new StandardDynamicDateOption({ key: "LASTMONTH", valueTypes: [] }),
				"LASTQUARTER": new StandardDynamicDateOption({ key: "LASTQUARTER", valueTypes: [] }),
				"LASTYEAR": new StandardDynamicDateOption({ key: "LASTYEAR", valueTypes: [] }),
				"NEXTWEEK": new StandardDynamicDateOption({ key: "NEXTWEEK", valueTypes: [] }),
				"NEXTMONTH": new StandardDynamicDateOption({ key: "NEXTMONTH", valueTypes: [] }),
				"NEXTQUARTER": new StandardDynamicDateOption({ key: "NEXTQUARTER", valueTypes: [] }),
				"NEXTYEAR": new StandardDynamicDateOption({ key: "NEXTYEAR", valueTypes: [] }),
				"LASTMINUTES": new StandardDynamicDateOption({ key: "LASTMINUTES", valueTypes: ["int"] }),
				"LASTHOURS": new StandardDynamicDateOption({ key: "LASTHOURS", valueTypes: ["int"] }),
				"LASTDAYS": new StandardDynamicDateOption({ key: "LASTDAYS", valueTypes: ["int"] }),
				"LASTWEEKS": new StandardDynamicDateOption({ key: "LASTWEEKS", valueTypes: ["int"] }),
				"LASTMONTHS": new StandardDynamicDateOption({ key: "LASTMONTHS", valueTypes: ["int"] }),
				"LASTQUARTERS": new StandardDynamicDateOption({ key: "LASTQUARTERS", valueTypes: ["int"] }),
				"LASTYEARS": new StandardDynamicDateOption({ key: "LASTYEARS", valueTypes: ["int"] }),
				"NEXTMINUTES": new StandardDynamicDateOption({ key: "NEXTMINUTES", valueTypes: ["int"] }),
				"NEXTHOURS": new StandardDynamicDateOption({ key: "NEXTHOURS", valueTypes: ["int"] }),
				"NEXTDAYS": new StandardDynamicDateOption({ key: "NEXTDAYS", valueTypes: ["int"] }),
				"NEXTWEEKS": new StandardDynamicDateOption({ key: "NEXTWEEKS", valueTypes: ["int"] }),
				"NEXTMONTHS": new StandardDynamicDateOption({ key: "NEXTMONTHS", valueTypes: ["int"] }),
				"NEXTQUARTERS": new StandardDynamicDateOption({ key: "NEXTQUARTERS", valueTypes: ["int"] }),
				"NEXTYEARS": new StandardDynamicDateOption({ key: "NEXTYEARS", valueTypes: ["int"] }),
				"FROM": new StandardDynamicDateOption({ key: "FROM", valueTypes: ["date"] }),
				"TO": new StandardDynamicDateOption({ key: "TO", valueTypes: ["date"] }),
				"FROMDATETIME": new StandardDynamicDateOption({ key: "FROMDATETIME", valueTypes: ["datetime"] }),
				"TODATETIME": new StandardDynamicDateOption({ key: "TODATETIME", valueTypes: ["datetime"] }),
				"YEARTODATE": new StandardDynamicDateOption({ key: "YEARTODATE", valueTypes: [] }),
				"DATETOYEAR": new StandardDynamicDateOption({ key: "DATETOYEAR", valueTypes: [] }),
				"TODAYFROMTO": new StandardDynamicDateOption({ key: "TODAYFROMTO", valueTypes: ["int", "int"] }),
				"QUARTER1": new StandardDynamicDateOption({ key: "QUARTER1", valueTypes: [] }),
				"QUARTER2": new StandardDynamicDateOption({ key: "QUARTER2", valueTypes: [] }),
				"QUARTER3": new StandardDynamicDateOption({ key: "QUARTER3", valueTypes: [] }),
				"QUARTER4": new StandardDynamicDateOption({ key: "QUARTER4", valueTypes: [] }),
				"SPECIFICMONTH": new StandardDynamicDateOption({ key: "SPECIFICMONTH", valueTypes: ["int"] }),
				"SPECIFICMONTHINYEAR": new StandardDynamicDateOption({ key: "SPECIFICMONTHINYEAR", valueTypes: ["int", "int"] }),
				"DATERANGE": new StandardDynamicDateOption({ key: "DATERANGE", valueTypes: ["date", "date"] }),
				"DATE": new StandardDynamicDateOption({ key: "DATE", valueTypes: ["date"] }),
				"DATETIME": new StandardDynamicDateOption({ key: "DATETIME", valueTypes: ["datetime"] }),
				"DATETIMERANGE": new StandardDynamicDateOption({ key: "DATETIMERANGE", valueTypes: ["datetime", "datetime"] })
			};

			var aStandardOptionsKeys = [
				"DATE",
				"TODAY",
				"YESTERDAY",
				"TOMORROW",
				"FIRSTDAYWEEK",
				"LASTDAYWEEK",
				"FIRSTDAYMONTH",
				"LASTDAYMONTH",
				"FIRSTDAYQUARTER",
				"LASTDAYQUARTER",
				"FIRSTDAYYEAR",
				"LASTDAYYEAR",
				"DATERANGE",
				"DATETIMERANGE",
				"FROM",
				"TO",
				"FROMDATETIME",
				"TODATETIME",
				"YEARTODATE",
				"DATETOYEAR",
				"LASTMINUTES",
				"LASTHOURS",
				"LASTDAYS",
				"LASTWEEKS",
				"LASTMONTHS",
				"LASTQUARTERS",
				"LASTYEARS",
				"NEXTMINUTES",
				"NEXTHOURS",
				"NEXTDAYS",
				"NEXTWEEKS",
				"NEXTMONTHS",
				"NEXTQUARTERS",
				"NEXTYEARS",
				"TODAYFROMTO",
				"THISWEEK",
				"LASTWEEK",
				"NEXTWEEK",
				"SPECIFICMONTH",
				"SPECIFICMONTHINYEAR",
				"THISMONTH",
				"LASTMONTH",
				"NEXTMONTH",
				"THISQUARTER",
				"LASTQUARTER",
				"NEXTQUARTER",
				"QUARTER1",
				"QUARTER2",
				"QUARTER3",
				"QUARTER4",
				"THISYEAR",
				"LASTYEAR",
				"NEXTYEAR",
				"DATETIME"
			];

			var oDynamicDateRangeGroups = {

				SingleDates: 1,

				DateRanges: 2,

				Weeks: 3,

				Month: 4,

				Quarters: 5,

				Years: 6
			};

		/**
		 * Constructor for a new DynamicDateRange.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A control base type.
		 *
		 * <h3>Overview</h3>
		 *
		 * The dynamic date range is a control that offers a choice of absolute and relative dates,
		 * using different offset from the current date. The list of values offered must be defined by the application.
		 *
		 * <h3>Usage</h3>
		 *
		 * The control usage is recommended when:
		 * <ul>
		 * <li>Flexibility of choosing from absolute or relative dates and date ranges.</li>
		 * <li>The relative representation of a date should be reused. (For example, show values from today regardless of when you open the application)</li>
		 * </ul>
		 *
		 * The <code>DynamicDateRange</code> control supports a number of standard options:
		 * see {@link sap.m.StandardDynamicDateRangeKeys}.
		 * A custom option could be defined by extending the <code>sap.m.DynamicDateOption</code> class and
		 * adding an instance of this class into the <code>sap.m.DynamicDateRange</code> customOptions aggregation.
		 * In order for a specific option to be used its key should be added into the <code>standardOptions</code> property
		 * of the control. No options are added by default.
		 *
		 * <b>Note:</b> Property binding with the <code>value</code> and <code>formatter</code> properties is not supported.
		 * Instead, you should use their public getter and setter methods.
		 *
		 * Suggestions are available when the user types in the control input field.
		 *
		 * <h3>Responsive behavior</h3>
		 *
		 * On mobile devices, when user taps on the <code>DynamicDateRange</code> input icon a full screen dialog
		 * is opened. The dialog is closed via a date time period value selection or by pressing the "Cancel" button.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.92.0
		 * @alias sap.m.DynamicDateRange
		 * @extends sap.ui.core.Control
		 */
		var DynamicDateRange = Control.extend("sap.m.DynamicDateRange", /** @lends sap.m.DynamicDateRange.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Defines the control value. The object has two properties
					 * 'operator' - a string, the key of a DynamicDateOption and
					 * 'values' - an array of parameters for the same option.
					 * The control uses a special wrong-value object, when the input receives
					 * an unrecognized string - { operator: "PARSEERROR", values: [...]}
					 *
					 *  <b>Note:</b> Data binding for the <code>value</code> property is not supported. Instead,
					 *  you should use DynamicDateRange's <code>getValue</code> and <code>setValue</code> methods.
					 *
					 * @since 1.92
					 * @private
					 * @ui5-restricted sap.m.DynamicDateRange
					 */
					value: { type: "object", group: "Data"},

					/**
					 * Defines the width of the control.
					 *
					 * @since 1.92
					 */
					width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

					/**
					 * Indicates whether the user can interact with the control or not.
					 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
					 *
					 * @since 1.92
					 */
					enabled: { type: "boolean", group: "Behavior", defaultValue: true },

					/**
					 * Accepts the core enumeration ValueState.type that supports <code>None</code>, <code>Error</code>, <code>Warning</code> and <code>Success</code>.
					 * ValueState is managed internally only when validation is triggered by user interaction.
					 *
					 * @since 1.92
					 */
					valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },

					/**
					 * Defines the name of the control for the purposes of form submission.
					 *
					 * @since 1.92
					 */
					name: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Defines a short hint intended to aid the user with data entry when the control has no value.
					 *
					 * @since 1.92
					 */
					placeholder: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Defines whether the control can be modified by the user or not.
					 * <b>Note:</b> A user can tab to the non-editable control, highlight it, and copy the text from it.
					 *
					 * @since 1.92
					 */
					editable: { type: "boolean", group: "Behavior", defaultValue: true },

					/**
					 * Defines the text that appears in the value state message popup.
					 *
					 * @since 1.92
					 */
					valueStateText: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Indicates that user input is required. This property is only needed for accessibility purposes when a single relationship between
					 * the field and a label (see aggregation <code>labelFor</code> of <code>sap.m.Label</code>) cannot be established
					 * (e.g. one label should label multiple fields).
					 * @since 1.92
					 */
					required : {type : "boolean", group : "Misc", defaultValue : false},

					/**
					 * Disable list group headers.
					 *
					 * @since 1.92
					 */
					enableGroupHeaders: { type: "boolean", group: "Behavior", defaultValue: true },

					/**
					 * An instance of sap.m.DynamicDateFormat or a user defined format object with the
					 * corresponding formatting and parsing functionality.
					 *
					 * <b>Note:</b> Data binding for the <code>formatter</code> property is not supported. Instead,
					 * you should use DynamicDateRange's <code>getFormatter</code> and <code>setFormatter</code> methods.
					 *
					 * @since 1.92
					 * @private
					 * @ui5-restricted sap.m.DynamicDateRange
					 */
					formatter: { type: "object" },

					/**
					 * Array of standard option keys
					 *
					 * @since 1.92
					 */
					standardOptions: {
						type: "string[]", group: "Behavior",
						defaultValue: [
							"DATE",
							"TODAY",
							"YESTERDAY",
							"TOMORROW",
							"FIRSTDAYWEEK",
							"LASTDAYWEEK",
							"FIRSTDAYMONTH",
							"LASTDAYMONTH",
							"FIRSTDAYQUARTER",
							"LASTDAYQUARTER",
							"FIRSTDAYYEAR",
							"LASTDAYYEAR",
							"DATERANGE",
							"DATETIMERANGE",
							"FROM",
							"TO",
							"FROMDATETIME",
							"TODATETIME",
							"YEARTODATE",
							"DATETOYEAR",
							"LASTMINUTES",
							"LASTHOURS",
							"LASTDAYS",
							"LASTWEEKS",
							"LASTMONTHS",
							"LASTQUARTERS",
							"LASTYEARS",
							"NEXTMINUTES",
							"NEXTHOURS",
							"NEXTDAYS",
							"NEXTWEEKS",
							"NEXTMONTHS",
							"NEXTQUARTERS",
							"NEXTYEARS",
							"TODAYFROMTO",
							"THISWEEK",
							"LASTWEEK",
							"NEXTWEEK",
							"SPECIFICMONTH",
							"SPECIFICMONTHINYEAR",
							"THISMONTH",
							"LASTMONTH",
							"NEXTMONTH",
							"THISQUARTER",
							"LASTQUARTER",
							"NEXTQUARTER",
							"QUARTER1",
							"QUARTER2",
							"QUARTER3",
							"QUARTER4",
							"THISYEAR",
							"LASTYEAR",
							"NEXTYEAR",
							"DATETIME"
						]
					},

					/**
					 * Determines whether the input field of the control is hidden or visible.
					 * When set to <code>true</code>, the input field becomes invisible and there is no way to open the value help popover.
					 * In that case it can be opened by another control through calling of control's <code>openBy</code> method, and
					 * the opening control's DOM reference must be provided as parameter.
					 *
					 * Note: Since the Dynamic Date Range is not responsible for accessibility attributes of the control which opens its popover,
					 * those attributes should be added by the application developer. The following is recommended to be added to the
					 * opening control: a text or tooltip that describes the action (example: "Open Dynamic Date Range"), and also aria-haspopup
					 * attribute with value of <code>true</code>.
					 *
					 * @since 1.105
					 */
					 hideInput: { type: "boolean", group: "Misc", defaultValue: false },

					  /**
					 * If set, the calendar week numbering is used for display.
					 * If not set, the calendar week numbering of the global configuration is used.
					 * @since 1.111.0
					 */

					calendarWeekNumbering : { type : "sap.ui.core.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null},

					/**
					 * Specifies whether clear icon is shown.
					 * Pressing the icon will clear input's value and fire the liveChange event.
					 * @since 1.117
					 */
					showClearIcon: { type: "boolean", defaultValue: false }
				},
				aggregations: {
					/**
					 * Custom options for the <code>DynamicDateRange</code>.
					 *
					 */
					customOptions: { type: "sap.m.DynamicDateOption", multiple: true },
					_input: { type: "sap.m.Input", multiple: false, visibility: "hidden" },
					_popup: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }
				},
				associations: {
					/**
					 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
					 * @since 1.92
					 */
					ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },
					/**
					 * Association to controls / IDs that describe this control (see WAI-ARIA attribute aria-describedby).
					 * @since 1.92
					 */
					ariaDescribedBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" }
				},
				events: {
					/**
					* Is fired when the text in the input field has changed and the focus leaves the input field or the Enter key is pressed.
					*/
					change: {
						parameters: {
							/**
							 * The current value of the control.
							 */
							value: { type: "object" },
							/**
							 * Whether the new value is valid.
							 */
							valid: { type: "boolean"}
						}
					}
				}
			},
			renderer: DynamicDateRangeRenderer
		});

		MessageMixin.call(DynamicDateRange.prototype);

		var aLastDateTimeOperators = [
			"LASTMINUTES",
			"LASTHOURS"
		];

		var aNextDateTimeOperators = [
			"NEXTMINUTES",
			"NEXTHOURS"
		];

		var aDateTimeOperators = aLastDateTimeOperators.concat(aNextDateTimeOperators);
		var aLastOptions = ["LASTMINUTES", "LASTHOURS", "LASTDAYS", "LASTWEEKS", "LASTMONTHS", "LASTQUARTERS", "LASTYEARS"];
		var aNextOptions = ["NEXTMINUTES", "NEXTHOURS", "NEXTDAYS", "NEXTWEEKS", "NEXTMONTHS", "NEXTQUARTERS", "NEXTYEARS"];

		DynamicDateRange.prototype.init = function() {
			var bValueHelpDecorative = !Device.support.touch || Device.system.desktop ? true : false;
			this._oInput = new DynamicDateRangeInput(this.getId() + "-input", {
				valueHelpIconSrc: IconPool.getIconURI("sap-icon://check-availability"),
				valueHelpRequest: this._toggleOpen.bind(this),
				showSuggestion: true,
				suggest: this._handleSuggest.bind(this)
			});

			this._oListItemDelegate = undefined;

			this._onBeforeInputRenderingDelegate = {
				onBeforeRendering: function() {
					this._oInput._getValueHelpIcon().setVisible(true);
				}
			};

			this._oInput._getValueHelpIcon().setDecorative(bValueHelpDecorative);

			this._oInput.addDelegate(this._onBeforeInputRenderingDelegate, this);

			this.setAggregation("_input", this._oInput, false);

			this._oInput._setControlOrigin(this);
			this._oInput.attachChange(this._handleInputChange, this);

			this.oValueObserver = new ManagedObjectObserver(function() {
				delete this.oBoundValueFormatter;
			}.bind(this));
			this.oValueObserver.observe(this, {
				bindings: ["value"]
			});
		};

		DynamicDateRange.prototype.exit = function() {
			this._oInput.removeDelegate(this._onBeforeInputRenderingDelegate);
			this._onBeforeInputRenderingDelegate = undefined;
			this.oValueObserver.destroy();

			this._infoDatesFooter = undefined;
			this.aInputControls = undefined;

			this._removeAllListItemDelegates();
		};

		DynamicDateRange.prototype._removeAllListItemDelegates = function() {
			if (this._oOptionsList) {
				this._oOptionsList.getItems().forEach(function(oItem) {
					oItem.removeDelegate(this._oListItemDelegate);
				}, this);
			}
		};

		/**
		 * Getter for the <code>value</code> of the control.
		 * @returns {sap.m.DynamicDateRangeValue} A <code>sap.m.DynamicDateRangeValue</code>
		 * @public
		 */
		DynamicDateRange.prototype.getValue = function() {
			return this.getProperty("value");
		};

		/**
		 * Getter for the <code>formatter</code> of the control.
		 * @returns {sap.m.DynamicDateFormat} A <code>sap.m.DynamicDateFormat</code>
		 * @public
		 */
		 DynamicDateRange.prototype.getFormatter = function() {
			return this.getProperty("formatter");
		};

		/**
		 * Setter for the <code>formatter</code> of the control.
		 * @returns {sap.m.DynamicDateFormat} A <code>sap.m.DynamicDateFormat</code>
		 * @param {sap.m.DynamicDateFormat} oFormatter A <code>sap.m.DynamicDateFormat</code>
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		 DynamicDateRange.prototype.setFormatter = function(oFormatter) {
			this.setProperty("formatter", oFormatter);

			return this;
		};

		/**
		 * Sets the tooltip for the <code>DynamicDateRange</code>.
		 * @param {sap.ui.core.TooltipBase|string} vTooltip The tooltip that should be shown.
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 * @override
		 */
		DynamicDateRange.prototype.setTooltip = function(vTooltip) {
			this._oInput.setTooltip(vTooltip);
			return Control.prototype.setTooltip.apply(this, arguments);
		};

		/**
		 * Sets the showClearIcon for the <code>DynamicDateRange</code>.
		 * @param {boolean} bShowClearIcon Whether to show clear icon.
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 * @override
		 */
		DynamicDateRange.prototype.setShowClearIcon = function(bShowClearIcon) {
			this.setProperty("showClearIcon", bShowClearIcon);
			this._oInput.setShowClearIcon(bShowClearIcon);
			return this;
		};

		DynamicDateRange.prototype.onBeforeRendering = function() {
			this._updateInputValue(this.getValue());
			this._oInput.setEditable(this.getEditable());
			this._oInput.setEnabled(this.getEnabled());
			this._oInput.setRequired(this.getRequired());
			this._oInput.setName(this.getName());
			this._oInput.setWidth(this.getWidth());
			this._oInput.setPlaceholder(this.getPlaceholder());
			this._oInput.setValueState(this.getValueState());
			this._oInput.setValueStateText(this.getValueStateText());

			this.setValue(this._substituteMissingValue(this.getValue()));
		};

		/**
		 * Setter for the <code>value</code> control property.
		 * @param {sap.m.DynamicDateRangeValue} oValue A <code>sap.m.DynamicDateRangeValue</code>
		 * @returns {this} Reference to <code>this</code> for method chaining
		 * @public
		 */
		DynamicDateRange.prototype.setValue = function(oValue) {
			var sOptionKey = oValue && oValue.operator;

			// substitute the semantically equivalent values
			oValue = this._substituteValue(oValue);

			this.setProperty("value", oValue);
			this._oSelectedOption = this.getOption(sOptionKey);

			// Forward Dynamic Date Range control property values to inner sap.m.Input instance.
			this._updateInputValue(oValue);

			return this;
		};

		DynamicDateRange.prototype._toggleOpen = function() {
			if (this._oPopup && this._oPopup.isOpen()) {
				this._closePopup();
			} else {
				this.open();
			}
		};

		/**
		 * Opens the value help dialog.
		 *
		 * @param {HTMLElement} oDomRef DOM reference of the opening control. On tablet or desktop, the popover is positioned relatively to this control.
		 * @returns {void}
		 * @since 1.92
		 * @public
		 */
		DynamicDateRange.prototype.open = function(oDomRef) {
			if (this.getEditable() && this.getEnabled()) {
				this._createPopup();
				this._createPopupContent();

				if (!this._oListItemDelegate) {
					this._oListItemDelegate = {
						// Handle when F4 or Alt + DOWN arrow are pressed.
						onsapshow: this._closePopup.bind(this),
						// Handle when Alt + UP arrow are pressed.
						onsaphide: this._closePopup.bind(this)
					};
				}

				//re-create items
				this._removeAllListItemDelegates();
				this._oOptionsList.destroyAggregation("items");

				this._collectValueHelpItems(this._getOptions(), true).map(function(vOption) {
					// check if it's a group header
					if (typeof (vOption) === "string") {
						return this._createHeaderListItem(vOption);
					}
					if (vOption.getKey() === "FROMDATETIME") {
						vOption._bAdditionalTimeText = !!this._findOption("FROM");
					} else if (vOption.getKey() === "TODATETIME") {
						vOption._bAdditionalTimeText = !!this._findOption("TO");
					} else if (vOption.getKey() === "DATETIMERANGE") {
						vOption._bAdditionalTimeText = !!this._findOption("DATERANGE");
					}
					return this._createListItem(vOption);
				}, this).forEach(function(oItem) {
					oItem.addDelegate(this._oListItemDelegate, this);
					this._oOptionsList.addItem(oItem);
				}, this);

				//reset value help page
				this._oNavContainer.to(this._oNavContainer.getPages()[0]);

				this._openPopup(oDomRef);
			}
		};

		/**
		 * Searches if there is an option with the given key included.
		 *
		 * @param {string} sKey option key to be searched against
		 * @returns  {object|undefined} object if the object exists
		 * @private
		 */
		DynamicDateRange.prototype._findOption = function(sKey) {
			return this._getOptions().find(function(oOption) {
				return oOption.getKey() === sKey;
			});
		};

		/**
		 * Appends an option key, identifying an additional standard option to be used by the control.
		 *
		 * @param {string} sKey option key
		 * @returns {void}
		 * @since 1.92
		 * @public
		 */
		DynamicDateRange.prototype.addStandardOption = function(sKey) {
			var aOptions = this.getStandardOptions();

			if (aOptions.indexOf(sKey) === -1) {
				aOptions.push(sKey);
			}

			this.setStandardOptions(aOptions);
		};

		DynamicDateRange.prototype.getFocusDomRef = function(){
			return this.getAggregation("_input") && this.getAggregation("_input").getFocusDomRef();
		};

		DynamicDateRange.prototype._updateInputValue = function(oValue) {
			var sInputValue;

			if (oValue && oValue.operator !== "PARSEERROR") {
				sInputValue = this._enhanceInputValue(this._formatValue(oValue), oValue);
				this._oInput.setValue(sInputValue);
			} else if (oValue === undefined) {
				this._oInput.setValue("");
			}
		};

		/**
		 * Handles suggestions when user types into the control input field.
		 *
		 * @param {sap.ui.base.Event} oEvent Input's suggest event
		 * @private
		 */
		DynamicDateRange.prototype._handleSuggest = function(oEvent) {
			this._bSuggestionMode = true;
			if (this._oPopup && this._oPopup.isOpen()) {
				this._closePopup();
			}

			var sQuery = oEvent.getParameter("suggestValue");

			this._oInput.removeAllSuggestionItems();

			// find all options that match the search string from the start
			var aSuggestionItems = this._getOptions().filter(function(option) {
				var oSuggestValue = { operator: option.getKey(), values: [] },
					aUITypes = option.getValueHelpUITypes(this);

				if (aUITypes.length && aUITypes[0].getType()) {
					return false;
				}

				var sSuggestedValue = this.getOption(oSuggestValue.operator)
					.format(oSuggestValue, this._getFormatter()).toLowerCase();
				var iIndexOfQuery = sSuggestedValue
					.indexOf(sQuery.toLowerCase());

				return iIndexOfQuery === 0 || (iIndexOfQuery > 0 && sSuggestedValue[iIndexOfQuery - 1] === " ");
			}, this);

			this._collectValueHelpItems(aSuggestionItems, true).forEach(function(option) {
				if (option.getKey) {
					var oSuggestValue = { operator: option.getKey(), values: [] };
					this._addSuggestionItem(oSuggestValue);
				} else {
					this._addSuggestionGroupItem(option);
				}
			}, this);

			var aMatchDigit = sQuery.match(/\d+/);
			if (!aMatchDigit) {
				this._bSuggestionMode = false;
				return;
			}

			// also add all options with one integer parameter if the term is an integer
			aSuggestionItems = this._getOptions().filter(function(option) {
				return option.getValueHelpUITypes(this).length === 1 && option.getValueHelpUITypes(this)[0].getType() === "int";
			}, this);

			this._collectValueHelpItems(aSuggestionItems, false).forEach(function(option) {
				if (option.getKey) {
					var oSuggestValue = {
						operator: option.getKey(),
						values: [
							parseInt(aMatchDigit[0])
						]
					};
					this._addSuggestionItem(oSuggestValue);
				} else {
					this._addSuggestionGroupItem(option);
				}
			}, this);
			this._bSuggestionMode = false;
		};

		/**
		 * Gets an option object by its key.
		 *
		 * @param {string} sKey The option key
		 * @returns {sap.m.DynamicDateOption} The option
		 * @public
		 */
		 DynamicDateRange.prototype.getOption = function(sKey) {
			return this._getOptions().find(function(option) {
				return option.getKey() === sKey;
			});
		};

		/**
		 * Calculates a date range from a provided object in the format of the DynamicDateRange's value.
		 *
		 * @param {sap.m.DynamicDateRangeValue} oValue A <code>sap.m.DynamicDateRangeValue</code>
		 * @returns {sap.ui.core.date.UniversalDate[]} An array of two date objects - start and end date
		 * @public
		 */
		DynamicDateRange.prototype.toDates = function(oValue) {
			var sKey = oValue.operator;
			return this.getOption(sKey).toDates(oValue, this.getCalendarWeekNumbering());
		};

		/**
		 * Returns enumeration containing the current groups in <code>sap.m.DynamicDateRange</code>
		 *
		 * @private
		 */
		DynamicDateRange.prototype._getGroups = function() {
			if (!this.oDynamicDateRangeGroups) {
				this.oDynamicDateRangeGroups = JSON.parse(JSON.stringify(oDynamicDateRangeGroups)); // making a copy of the object to break the reference
			}

			return this.oDynamicDateRangeGroups;
		};

		/**
		 * Returns the header of a custom group.
		 *
		 * @private
		 */
		DynamicDateRange.prototype._getCustomGroupHeader = function(sGroupName) {
			var oGroup = this._customGroupHeaders.find( (x) => {
				return x.name === sGroupName;
			});

			return oGroup.header;
		};

		/**
		 * Adds a group to the enumeration containing the current groups in <code>sap.m.DynamicDateRange</code>
		 * @param {string} sGroupName the name that the group will be selected by.
		 * @param {string} sGroupHeader the group header that will be presented in the list.
		 * @returns {void}
		 * @public
		 * @since 1.118
		 */
		DynamicDateRange.prototype.addGroup = function(sGroupName, sGroupHeader) {
			this._getGroups()[sGroupName] = Object.keys(this._getGroups()).length + 1;

			if (!this._customGroupHeaders) {
				this._customGroupHeaders = [];
			}

			this._customGroupHeaders.push({
				name: sGroupName,
				header: sGroupHeader
			});
		};

		/**
		 * Sets a new header to an existing custom group.
		 * @param {string} sGroupName the name that the group will be selected by.
		 * @param {string} sGroupHeader the group header that will be presented in the list.
		 * @returns {void}
		 * @public
		 */
		 DynamicDateRange.prototype.setGroupHeader = function(sGroupName, sGroupHeader) {
			this._customGroupHeaders.find((group) => group.name === sGroupName).header = sGroupHeader;
		};

		/**
		 * Removes all additionally added groups
		 * @returns {void}
		 * @public
		 */
		DynamicDateRange.prototype.removeCustomGroups = function() {
			const iCountOfStandardGroups = Object.keys(oDynamicDateRangeGroups).length;

			for (const group in this._getGroups()) {
				if (this._getGroups()[group] > iCountOfStandardGroups) {
				  delete this._getGroups()[group];
				}
			}

			delete this._customGroupHeaders;
		};

		/**
		 * Returns an array of <code>sap.m.DynamicDateOptions</code> (standard and custom) instances used in the control.
		 *
		 * @private
		 */
		DynamicDateRange.prototype._getOptions = function() {
			var aOptionKeys = this.getStandardOptions();
			var aOptions = aOptionKeys.map(function(sKey) {
					return oStandardOptionsObjects[sKey];
				}, this);

			// filter out the non-existent options (such option key is not known in the global util)
			var aStandardOptions = aOptions.filter(Boolean);

			var aCustomOptions = this.getAggregation("customOptions");

			if (aCustomOptions) {
				return aStandardOptions.concat(aCustomOptions);
			}

			return aStandardOptions;
		};

		DynamicDateRange.prototype._getValueHelpTypeForFormatter = function() {
			var	sOptionKey = this._oSelectedOption ? this._oSelectedOption.getKey() : '',
				aLastOptionsSelectedIndex = aLastOptions.indexOf(sOptionKey),
				aNextOptionsSelectedIndex = aNextOptions.indexOf(sOptionKey),
				aPopupContent = this._oNavContainer ? this._oNavContainer.getPages()[1].getContent()[3] || [] : [],
				aButtons = aPopupContent.getButtons ? aPopupContent.getButtons() : [],
				aSuggestionItems = this.getAggregation('_input').getAggregation('suggestionItems'),
				oValue = this.getValue(),
				aOptionKeys = this.getStandardOptions(),
				sActualSelectedOptionKey = "",
				aLastActualOrder = [],
				aNextActualOrder = [],
				oCustomData,
				aValueHelpTypes,
				sType,
				iButtonSelectedIndex,
				sSuggestionOptionKey;

			if (
				!oValue &&
				(!aButtons[0] || !aButtons[0].getDomRef()) &&
				aSuggestionItems && aSuggestionItems.length &&
				aSuggestionItems[aSuggestionItems.length - 1].getCustomData
			) {
				oCustomData = aSuggestionItems[aSuggestionItems.length - 1].getCustomData()[0];
			}

			if (
				this._bSuggestionMode &&
				aSuggestionItems && aSuggestionItems.length &&
				aSuggestionItems[aSuggestionItems.length - 1].getCustomData
			) {
					oCustomData = aSuggestionItems[aSuggestionItems.length - 1].getCustomData()[0];
			}

			aOptionKeys.forEach(function(sOption) {
				if (aLastOptions.indexOf(sOption) > -1) {
					aLastActualOrder.push(sOption);
				} else if (aNextOptions.indexOf(sOption) > -1) {
					aNextActualOrder.push(sOption);
				}
			});

			if (oCustomData) {
				sSuggestionOptionKey = oCustomData.getValue();
				aLastOptionsSelectedIndex = aLastDateTimeOperators.indexOf(sSuggestionOptionKey);
				aNextOptionsSelectedIndex = aNextDateTimeOperators.indexOf(sSuggestionOptionKey);
			}

			if (oCustomData && sSuggestionOptionKey) {
				if (aDateTimeOperators.indexOf(sSuggestionOptionKey) > -1) {
					sType = 'datetime';
					return sType;
				}
			}

			//if option requires extra formatting.
			if (
				this._oNavContainer && !aButtons.length ||
				(this._oNavContainer && aButtons.length && (aLastOptionsSelectedIndex > -1 || aNextOptionsSelectedIndex > -1))
			) {
				iButtonSelectedIndex = aButtons[0] ? aButtons[0].getParent().getSelectedIndex() : 0;
				if (aLastDateTimeOperators.indexOf(sOptionKey) > -1) {
					sActualSelectedOptionKey = aLastActualOrder[iButtonSelectedIndex];
				} else if (aNextDateTimeOperators.indexOf(sOptionKey) > -1) {
					sActualSelectedOptionKey = aNextActualOrder[iButtonSelectedIndex];
				}

				if (aDateTimeOperators.indexOf(sActualSelectedOptionKey) > -1) {
					sType = 'datetime';
					return sType;
				}
			}
			aValueHelpTypes = this._oSelectedOption ? this._oSelectedOption.getValueHelpUITypes() : [];

			return aValueHelpTypes && aValueHelpTypes.length ? aValueHelpTypes[0].getType() : "";
		};

		DynamicDateRange.prototype._getDatesLabelFormatter = function() {
			var oFormatOptions,
				sType = this._getValueHelpTypeForFormatter();

			switch (sType) {
				case "datetime":
					oFormatOptions = Object.create(this._getFormatter()._dateTimeFormatter.oFormatOptions);
					oFormatOptions.singleIntervalValue = true;
					oFormatOptions.interval = true;
					this._oDatesLabelFormatter = DateFormat.getDateTimeInstance(oFormatOptions);

					break;
				default:
					oFormatOptions = Object.create(this._getFormatter()._dateFormatter.oFormatOptions);
					oFormatOptions.singleIntervalValue = true;
					oFormatOptions.interval = true;
					this._oDatesLabelFormatter = DateFormat.getInstance(oFormatOptions);
			}

			return this._oDatesLabelFormatter;
		};

		DynamicDateRange.prototype._destroyInputControls = function() {
			if (!this.aInputControls) {
				return;
			}

			this.aInputControls.forEach(function(oCtrl) {
				oCtrl.destroy();
			});
			this.aInputControls = undefined;
		};

		/**
		 * Creates and adds a suggestion item to the internal input, based on a given value.
		 *
		 * @param {object} oSuggestValue A value object with the same interface as the control's value
		 * @private
		 */
		DynamicDateRange.prototype._addSuggestionItem = function(oSuggestValue) {
			var aValueDates = this.toDates(oSuggestValue, this.getCalendarWeekNumbering());
			var aResultingDates = [];
			for (var i = 0; i < aValueDates.length; i++) {
				aResultingDates[i] = aValueDates[i];
			}

			var oItem = new ListItem({
				text: this.getOption(oSuggestValue.operator).format(oSuggestValue, this._getFormatter()),
				additionalText: '',
				customData: [
					new CustomData({
						key : "operator",
						value: oSuggestValue.operator
					})
				]
			});

			this._oInput.addSuggestionItem(oItem);

			// Called after addSuggestionItem because the suggested items are needed in _getDatesLabelFormatter.
			oItem.setAdditionalText(this._getDatesLabelFormatter().format(aResultingDates));
		};

		/**
		 * Creates and adds a suggestion group item to the internal input, based on a given value.
		 *
		 * @param {string} sGroupValue The value to be set
		 * @private
		 */
		DynamicDateRange.prototype._addSuggestionGroupItem = function(sGroupValue) {
			this._oInput.addSuggestionItemGroup({text: sGroupValue});
		};

		/**
		 * Handles input field change.
		 *
		 * @param {sap.ui.base.Event} oEvent Change event object
		 * @private
		 */
		DynamicDateRange.prototype._handleInputChange = function(oEvent) {
			var sInputValue = oEvent.getParameter("value");

			var oVal = this._parseValue(this._stripValue(sInputValue));
			var oPrevValue = this.getValue();
			var bValid = sInputValue.trim() === "" || !!oVal;

			if (this._isDateRange(oVal)) {
				this._swapDates(oVal.values);
			}

			if (!bValid) {
				this.setValue({ operator: "PARSEERROR", values: [oResourceBundle.getText("DDR_WRONG_VALUE"), sInputValue] });
			} else {
				this.setValue(oVal);
			}

			this.fireChange({ value: this.getValue(), prevValue: oPrevValue, valid: bValid });
		};

		/**
		 * Checks if the <code>value</code> property operator corresponds to a date range.
		 * @param {sap.m.DynamicDateRangeValue} oValue A <code>sap.m.DynamicDateRangeValue</code>
		 * @returns {boolean} True in case of a date range
		 * @private
		 */
		DynamicDateRange.prototype._isDateRange = function(oValue) {
			return Boolean(oValue && (oValue.operator === "DATERANGE" || oValue.operator === "DATETIMERANGE"));
		};

		/**
		 * Swaps the start and end date of the value if the start date is after the end date.
		 * @param {Array<Date>} aValues An array of JS Dates
		 * @private
		 */
		DynamicDateRange.prototype._swapDates = function(aValues) {
			if (aValues.length > 1 && aValues[0].getTime() > aValues[1].getTime()) {
				aValues.reverse();
			}
		};

		DynamicDateRange.prototype._enhanceInputValue = function(sFormattedValue, oVal) {
			var oOption = this.getOption(oVal.operator);

			if (!oOption) {
				return null;
			}

			if (oOption.enhanceFormattedValue()
				|| (oVal.operator === "LASTDAYS" && oVal.values[0] <= 1)
				|| (oVal.operator === "NEXTDAYS" && oVal.values[0] <= 1)) {
				return sFormattedValue + " (" + this._toDatesString(oVal) + ")";
			}

			return sFormattedValue;
		};

		/**
		/* Removes the string found in brackets and trims the value.
		*/
		DynamicDateRange.prototype._stripValue = function(sValue) {
			var iOpeningBracket = sValue.indexOf("(");
			var iClosingBracket = sValue.lastIndexOf(")");
			var sResult = sValue;

			if (iOpeningBracket !== -1 && iClosingBracket !== -1 && iOpeningBracket < iClosingBracket) {
				sResult = sValue.slice(0, iOpeningBracket) + sValue.slice(iClosingBracket + 1);
				sResult = sResult.trim();
			}

			return sResult;
		};

		DynamicDateRange.prototype._toDatesString = function(oValue) {
			var aValueDates = this.toDates(oValue, this.getCalendarWeekNumbering());
			var aDates = [];
			for (var i = 0; i < aValueDates.length; i++) {
				aDates[i] = aValueDates[i];
			}
			return this._getDatesLabelFormatter().format(aDates);
		};

		DynamicDateRange.prototype._getPickerParser = function() {
			if (!this._calendarParser) {
				this._calendarParser = DateFormat.getDateTimeWithTimezoneInstance({ showTimezone: false });
			}
			return this._calendarParser;
		};

		DynamicDateRange.prototype._createPopup = function() {
			if (!this._oPopup) {
				this._oPopup = new ResponsivePopover(this.getId() + "-RP", {
					//read the documentation about those two - the page addapts its size to its container...
					contentHeight: '512px',
					contentWidth: '320px',
					showCloseButton: false,
					showArrow: false,
					showHeader: false,
					placement: library.PlacementType.VerticalPreferedBottom,
					ariaLabelledBy: [
						InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES")
					]
				});

				this._oPopup.addStyleClass("sapMDDRPopover");

				// This event handler prevents bubbling of the validationError events. In case when DynamicDateRange control is registered in the
				// Message Manager, it will not receive and add validationError message generated by the DynamicDateRange options, as there is
				// internal validation and it is not possible to set wrong value because in case of validation error, the Apply button is disabled.
				this._oPopup.attachValidationError(function(oEvent) {
					oEvent.bCancelBubble = true;
				});

				if (Device.system.phone) {
					this._oPopup.addStyleClass("sapUiNoContentPadding");
				} else {
					// We don't need the sap.m.Popover control to apply focus inside NavContainer pages,
					// as we apply custom focus handling logic.
					this._oPopup._oControl._getSingleNavContent = function() {
						return null;
					};
				}

				this._oPopup.attachAfterOpen(function() {
					var oToPage = this._oNavContainer.getPages()[0];
					this._applyNavContainerPageFocus(oToPage);
				}, this);

				this._oPopup.attachAfterClose(function() {
					this._oPreviousSelectedOption = this._oSelectedOption;
					this._setFooterVisibility(false);
				}, this);

				this._oPopup.setBeginButton(new Button({
					type: library.ButtonType.Emphasized,
					text: oResourceBundle.getText("DYNAMIC_DATE_RANGE_CONFIRM"),
					press: this._applyValue.bind(this)
				}));

				this._oPopup.setEndButton(new Button({
					text: oResourceBundle.getText("DYNAMIC_DATE_RANGE_CANCEL"),
					press: function() {
						this._oSelectedOption = this._oPreviousSelectedOption;
						this._oDatesLabelFormatter = null;
						this._closePopup();
					}.bind(this)
				}));

				this._setFooterVisibility(false);
				this._oPopup._getPopup().setAutoClose(true);

				// define a parent-child relationship between the control's and the _picker popup
				this.setAggregation("_popup", this._oPopup, true);
			}
		};

		/**
		 * Sorts, groups and reduces the items to be shown as suggestions.
		 *
		 * @param {array} aArray The array to be reworked
		 * @param {boolean} bReduce If reducing is needed
		 * @returns {array} The array with the objects to be displayed
		 * @private
		 */
		DynamicDateRange.prototype._collectValueHelpItems = function(aArray, bReduce) {
			var lastXOption;
			var nextXOption;
			var aGroupHeaders = [];

			// get the control options' metadata
			var aOptions = aArray;
			// sort by group
			aOptions.sort(function(a, b) {
				var iGroupA = Number(a.getGroup()) ? a.getGroup() : this._getGroups()[a.getGroup()];
				var iGroupB = Number(b.getGroup()) ? b.getGroup() : this._getGroups()[b.getGroup()];
				var iGroupDiff = iGroupA - iGroupB;

				if (iGroupDiff) {
					return iGroupDiff;
				}

				return aStandardOptionsKeys.indexOf(a.getKey()) - aStandardOptionsKeys.indexOf(b.getKey());
			}.bind(this));

			if (bReduce) {
				// for last x/next x options leave only the first of each, remove the rest
				aOptions = aOptions.reduce(function(aResult, oCurrent) {
					if (StandardDynamicDateOption.LastXKeys.indexOf(oCurrent.getKey()) !== -1) {
						if (lastXOption) {
							return aResult;
						}

						lastXOption = true;
					}

					if (StandardDynamicDateOption.NextXKeys.indexOf(oCurrent.getKey()) !== -1) {
						if (nextXOption) {
							return aResult;
						}

						nextXOption = true;
					}

					aResult.push(oCurrent);

					return aResult;
				}, []);
			}

			if (this.getEnableGroupHeaders()) {

				// insert a group header string before the options from each group
				aOptions = aOptions.reduce(function(aResult, oCurrent) {
					var iGroup = Number(oCurrent.getGroup()) ? oCurrent.getGroup() : this._getGroups()[oCurrent.getGroup()];
					var sGroupName = Object.keys(this._getGroups()).find((key) => this._getGroups()[key] === iGroup);
					var bGroupHasHeader = this._customGroupHeaders && this._customGroupHeaders.find((group) => group.name === sGroupName);
					var sGroupHeader = bGroupHasHeader ? this.getGroupHeader(sGroupName) : oCurrent.getGroupHeader();

					if (aGroupHeaders.indexOf(sGroupHeader) === -1) {
						aGroupHeaders.push(sGroupHeader);
						aResult.push(sGroupHeader);
					}

					aResult.push(oCurrent);

					return aResult;
				}.bind(this), []);
			}

			return aOptions;
		};

		/**
		 * Provides the option's group header text.
		 *
		 * @returns {string} A group header
		 * @public
		 * @since 1.118
		 */
		 DynamicDateRange.prototype.getGroupHeader = function(sGroupName) {
			var iGroupId = this._getGroups()[sGroupName];

			if (iGroupId >= this._getGroups()["SingleDates"] && iGroupId <= this._getGroups()["Years"]) {
				return oResourceBundle.getText("DDR_OPTIONS_GROUP_" + iGroupId);
			}

			return this._getCustomGroupHeader(sGroupName) ;
		};

		DynamicDateRange.prototype._createListItem = function(oOption) {
			var bIsFixedOption = this._isFixedOption(oOption);

			return new DynamicDateRangeListItem(this.getId() + "-option-" + oOption.getKey().replaceAll(" ", ""),  {
				type: bIsFixedOption ? ListType.Active : ListType.Navigation,
				title: oOption.getText(this),
				wrapping: true,
				optionKey: oOption.getKey(),
				press: this._handleOptionPress.bind(this)
			});
		};

		DynamicDateRange.prototype._createHeaderListItem = function(sHeader) {
			var oHeader = new GroupHeaderListItem();
			oHeader.setTitle(sHeader);
			oHeader._bGroupHeader = true;

			return oHeader;
		};

		DynamicDateRange.prototype._handleOptionPress = function(oEvent) {
			var sOptionKey = oEvent.getSource().getOptionKey(),
				oOption = this.getOption(sOptionKey);

			if (this._oPreviousSelectedOption && this._oPreviousSelectedOption.getKey() !== sOptionKey)	{
				this._oDatesLabelFormatter = null;
			}
			this._oPreviousSelectedOption = this._oSelectedOption;

			this._oSelectedOption = oOption;
			if (this._isFixedOption(oOption)) {
				this._applyValue();
			} else {
				//create a label with the resulting date range
				var oToolbar = this._createInfoDatesFooter();

				this._destroyInputControls();
				this.aInputControls = oOption.createValueHelpUI(this, this._updateInternalControls.bind(this));

				var oSecondPage = this._oNavContainer.getPages()[1];

				oSecondPage.removeAllContent();
				this.aInputControls.forEach(function(oControl) {
					oSecondPage.addContent(oControl);
				});

				oSecondPage.setFooter(oToolbar);
				oSecondPage.setTitle(oOption.getText(this));

				this._setFooterVisibility(true);
				this._updateInternalControls(oOption);

				this._oNavContainer.to(oSecondPage);
			}
		};

		DynamicDateRange.prototype._isFixedOption = function(oOption) {
			return !oOption.getValueHelpUITypes(this).length;
		};

		DynamicDateRange.prototype._createInfoDatesFooter = function() {
			this._infoDatesFooter = new Toolbar({
				design: ToolbarDesign.Info,
				style: ToolbarStyle.Clear,
				content: [
					new Label({
						text: oResourceBundle.getText("DDR_INFO_DATES_EMPTY_HINT")
					})
				]
			});

			return this._infoDatesFooter;
		};

		DynamicDateRange.prototype._getDatesLabel = function() {
			return this._infoDatesFooter.getContent()[0];
		};

		DynamicDateRange.prototype._updateDatesLabel = function() {
			var oOutputValue = this._oSelectedOption.getValueHelpOutput(this),
				aResultDates = [],
				sFormattedDates,
				sSelectedOptionKey;

			var aValueDates = this.toDates(oOutputValue, this.getCalendarWeekNumbering());

			if (!oOutputValue || !oOutputValue.operator || !this.getOption(oOutputValue.operator)) {
				return;
			}

			for (var i = 0; i < aValueDates.length; i++) {
				aResultDates[i] = CalendarUtils._createUTCDate(aValueDates[i], true);
			}

			if (this._isDateRange(oOutputValue)) {
				this._swapDates(aResultDates);
			}

			if (aResultDates) {
				sSelectedOptionKey = this._oSelectedOption.getKey();
				if (
					sSelectedOptionKey === "FROMDATETIME" ||
					sSelectedOptionKey === "TODATETIME" ||
					sSelectedOptionKey === "FROM" ||
					sSelectedOptionKey === "TO"
				) {
					aResultDates.push(null);
				}
				sFormattedDates = this._getDatesLabelFormatter().format(aResultDates, true);
				this._getDatesLabel().setText(oResourceBundle.getText("DDR_INFO_DATES", [sFormattedDates]));
			}
		};

		DynamicDateRange.prototype._setApplyButtonEnabled = function(bEnabled) {
			if (!this._oPopup) {
				return;
			}

			var oApplyButton = this._oPopup.getBeginButton();

			if (oApplyButton.getVisible()) {
				oApplyButton.setEnabled(bEnabled);
			}
		};

		/**
		 * Function triggered when an input control, which is part of a given option UI changes its state.
		 * @private
		 * @param {sap.m.DynamicDateOption} oOption the currently selected option.
		 */
		DynamicDateRange.prototype._updateInternalControls = function(oOption) {
			var bValidValueHelpUI = oOption.validateValueHelpUI(this);
			if (bValidValueHelpUI) {
				this._updateDatesLabel();
			}
			this._setApplyButtonEnabled(bValidValueHelpUI);
		};

		/**
		 * Shows or hides the popover footer.
		 *
		 * @param {boolean} bVisible When true, the popover footer and confirm button are visible
		 */
		DynamicDateRange.prototype._setFooterVisibility = function(bVisible) {
			var oPopover;

			if (!this._oPopup) {
				return;
			}

			oPopover = this._oPopup.getAggregation("_popup");

			if (Device.system.phone) {
				this._oPopup.getBeginButton().setVisible(bVisible);
			} else {
				oPopover.getFooter().setVisible(bVisible);
			}

			bVisible && oPopover.invalidate();

			return this;
		};

		DynamicDateRange.prototype._createPopupContent = function() {
			var oOptionsListPage = new Page({
					showHeader: false,
					showNavButton: false
				}),
				oValueHelpUiPage = new Page({
					showHeader: true,
					showNavButton: true
				}).addStyleClass("sapMDynamicDateRangePopover");

			oValueHelpUiPage.attachNavButtonPress(function() {
				this._setFooterVisibility(false);
				this._oNavContainer.back();
			}, this);

			if (Device.system.phone) {
				oOptionsListPage.setShowHeader(true);
				oOptionsListPage.setTitle(this._getOptionsPageTitleText());
			}

			if (!this._oOptionsList) {
				this._oOptionsList = new List({
					showSeparators: ListSeparators.None,
					mode: ListMode.SingleSelectMaster
				});
			}

			if (!this._oNavContainer) {
				this._oNavContainer = new NavContainer({
					autoFocus: false
				});

				this._oNavContainer.addPage(oOptionsListPage);
				this._oNavContainer.setInitialPage(oOptionsListPage);
				this._oNavContainer.addPage(oValueHelpUiPage);
				this._oNavContainer.attachAfterNavigate(this._navContainerAfterNavigate, this);
				this._oPopup.addContent(this._oNavContainer);
			}

			this._oNavContainer.getPages()[0].removeAllContent();
			this._oNavContainer.getPages()[0].addContent(this._oOptionsList);

			return this._oOptionsList;
		};

		/**
		 * Function which determines which DDR option should be focused. Also considers hidden options.
		 * @param {object} oValue The DynamicDateRange value.
		 */
		DynamicDateRange.prototype._determineOptionFocus = function (oValue) {
				var aOptions = this._oOptionsList.getItems(),
				oOption = aOptions.filter(
					function (oItem) { return oItem.getOptionKey && oItem.getOptionKey() === oValue.operator; }
				)[0];

			if (!oOption) {
				if (aLastOptions.indexOf(oValue.operator) > -1) {
					oOption = aOptions.filter(
						function (oItem) { return oItem.getOptionKey && oItem.getOptionKey() === aLastOptions[0];}
					)[0];
				} else if (aNextOptions.indexOf(oValue.operator) > -1) {
					oOption = aOptions.filter(
						function (oItem) { return oItem.getOptionKey && oItem.getOptionKey() === aNextOptions[0];}
					)[0];
				}
			}

			return oOption;
		};

		/**
		 * Applies focus to the navigated page.
		 *
		 * @param {sap.m.Page} oToPage the page receiving focus.
		 * @returns {void}
		 */
		DynamicDateRange.prototype._applyNavContainerPageFocus = function(oToPage) {
			var oValue = this.getValue(),
				oOptionsListPage = this._oNavContainer.getPages()[0],
				oElementToFocus;

			if (oToPage === oOptionsListPage && oValue) {
				oElementToFocus = this._determineOptionFocus(oValue) || oElementToFocus;
			}

			if (!oToPage.getDomRef()) {
				return;
			}

			if (!oElementToFocus) {
				// jQuery Plugin "firstFocusableDomRef"
				oElementToFocus = jQuery(oToPage.getDomRef().querySelector("section")).firstFocusableDomRef();
			}

			if (oValue && oValue.operator !== "PARSEERROR" && oElementToFocus) {
				oElementToFocus.setSelected && oElementToFocus.setSelected(true);
			}

			if (oElementToFocus) {
				oElementToFocus.focus();
			}

			this._reApplyFocusToElement(oToPage, oValue);
		};

		/**
		 * A hook that provides an option to reapply the focus to another element if needed.
		 *
		 * @ui5-restricted sap.ui.comp.config.condition.DateRangeType
		 * @private
		 */
		DynamicDateRange.prototype._reApplyFocusToElement = function (oToPage, oValue) {};

		/**
		 * Creates the title text for the options page.
		 *
		 * @returns {string} title text
		 */
		DynamicDateRange.prototype._getOptionsPageTitleText = function() {
			return LabelEnablement.getReferencingLabels(this)
				.concat(this.getAriaLabelledBy())
				.reduce(function(sAccumulator, sCurrent) {
					var oCurrentControl = Element.getElementById(sCurrent);
					return sAccumulator + " " + (oCurrentControl.getText ? oCurrentControl.getText() : "");
				}, "")
				.trim();
		};

		/**
		 * NavContainer after navigate handler function.
		 *
		 * @param {object} oEvent after navigate event object
		 * @returns {void}
		 */
		DynamicDateRange.prototype._navContainerAfterNavigate = function(oEvent) {
			var oOptionDetailsPage = this._oNavContainer.getPages()[1],
				oToPage = oEvent.getParameters()["to"];

			if (oToPage === oOptionDetailsPage) {
				this.aInputControls.forEach(function(oControl) {
					// jQuery Plugin "firstFocusableDomRef"
					if (oControl.$().firstFocusableDomRef()) {
						oControl.addAriaLabelledBy && oControl.addAriaLabelledBy(oToPage.getId() + "-title");

						if (!this._isCalendarBasedControl(oControl) && oControl.addAriaDescribedBy) {
							oControl.addAriaDescribedBy(oToPage.getFooter().getContent()[0]);
						}
					}
				}, this);
			}

			if (this._oPopup && this._oPopup.isOpen()) {
				// There is a custom initial focus handling logic for both options list page and option details page
				this._applyNavContainerPageFocus(oToPage);
			} else {
				this.focus();
			}
		};

		/**
		 * Check if a given control is sap.ui.unified.Calendar based control,
		 * as specific ARIA attributes need to be added in all other cases.
		 *
		 * @param {sap.ui.core.Control} oControl instance to check.
		 * @returns {boolean} when the given sap.ui.core.Control instance is an input control.
		 */
		DynamicDateRange.prototype._isCalendarBasedControl = function(oControl) {
			return oControl.isA("sap.ui.unified.Calendar") ||
				oControl.isA("sap.ui.unified.calendar.CustomMonthPicker") ||
				oControl.isA("sap.ui.unified.calendar.MonthPicker") ||
				oControl.isA("sap.ui.unified.calendar.YearPicker") ||
				oControl.isA("sap.ui.unified.calendar.YearRangePicker") ||
				oControl.isA("sap.ui.unified.calendar.Month");
		};

		/**
		 * Opens the value help popover. The popover is positioned relatively to the control given as <code>oDomRef</code> parameter on tablet or desktop
		 * and is full screen on phone. Therefore the control parameter is only used on tablet or desktop and is ignored on phone.
		 *
		 * Note: use this method to open the value help popover only when the <code>hideInput</code> property is set to <code>true</code>. Please consider
		 * opening of the value help popover by another control only in scenarios that comply with Fiori guidelines. For example, opening the value help
		 * popover by another popover is not recommended.
		 * The application developer should implement the following accessibility attributes to the opening control: a text or tooltip that describes
		 * the action (example: "Open Dynamic Date Range"), and aria-haspopup attribute with value of <code>true</code>.
		 *
		 * @since 1.105
		 * @param {HTMLElement} oDomRef DOM reference of the opening control. On tablet or desktop, the popover is positioned relatively to this control.
		 * @public
		 */
		DynamicDateRange.prototype.openBy = function(oDomRef) {
			this.open(oDomRef);
		};

		/**
		 * Opens the value help popup.
		 *
		 * @param {HTMLElement} oDomRef DOM reference of the opening control. On tablet or desktop, the value help popover is positioned relative to this control.
		 * @private
		 */
		 DynamicDateRange.prototype._openPopup = function(oDomRef) {
			if (!this._oPopup) {
				return;
			}

			this._oPopup._getPopup().setExtraContent([this._oInput.getDomRef()]);
			this._oPopup.openBy(oDomRef || this._oInput);
		};

		DynamicDateRange.prototype._applyValue = function() {
			this._oOutput = this._oSelectedOption.getValueHelpOutput(this);
			var aValueDates = this.toDates(this._oOutput, this.getCalendarWeekNumbering());
			for (var i = 0; i < aValueDates.length; i++) {
				if (this._oOutput.values[i] instanceof Date && aValueDates[i] instanceof UniversalDate) {
					this._oOutput.values[i] = aValueDates[i].getJSDate();
				}
			}

			if (this._isDateRange(this._oOutput)) {
				this._swapDates(this._oOutput.values);
			}

			var prevValue = this.getValue();
			this.setValue(this._oOutput);
			this.fireChange({ prevValue: prevValue, value: this.getValue(), valid: true });

			this._closePopup();
		};

		DynamicDateRange.prototype._closePopup = function() {
			this._setFooterVisibility(false);
			this._oNavContainer.to(this._oNavContainer.getPages()[0]);
			this._oPopup.close();
		};

		DynamicDateRange.prototype._getFormatter = function() {
			// get the passed formatter, if available,
			// otherwise make a new one with the binding format options,
			// use the default one as a fallback

			var oFormatter = this.getFormatter(),
				oBinding;

			if (oFormatter) {
				return oFormatter;
			}

			if (this.oBoundValueFormatter) {
				return this.oBoundValueFormatter;
			}

			oBinding = this.getBinding("value");

			if (oBinding && oBinding.getType()) {
				this.oBoundValueFormatter = DynamicDateFormat.getInstance(oBinding.getType().oFormatOptions);
				return this.oBoundValueFormatter;
			}

			if (!this.oDefaultFormatter) {
				this.oDefaultFormatter = DynamicDateFormat.getInstance();
			}

			return this.oDefaultFormatter;
		};

		DynamicDateRange.prototype._formatValue = function(oOutput) {
			var oOption = this.getOption(oOutput.operator);

			return oOption ? oOption.format(oOutput, this._getFormatter()) : "";
		};

		DynamicDateRange.prototype._parseValue = function(sInputValue) {
			var aResults = this.parse(sInputValue, this._getFormatter(), this._getOptions()).filter(function(oResult) {
				return this._getOptions().find(function(option){
					return option.getKey() === oResult.operator;
				});
			}, this);

			return aResults.length ? aResults[0] : null;
		};

		/**
		 * Parses a string to an array of objects in the DynamicDateRange's value format.
		 * Uses the provided formatter.
		 *
		 * @param {string} sValue The string to be parsed
		 * @param {sap.m.DynamicDateFormat} oFormatter A dynamic date formatter
		 * @param {array} aOptionKeys array of option names
		 * @returns {object[]} An array of value objects in the DynamicDateRange's value format
		 * @static
		 * @public
		 */
		 DynamicDateRange.prototype.parse = function(sValue, oFormatter) {
			if (typeof sValue !== 'string') {
				Log.error("DynamicDateFormat can only parse a String.");
				return [];
			}

			var aResults = [],
				oResult;

			var aOptions = this._getOptions();

			for (var i = 0; i < aOptions.length; i++) {
				oResult = aOptions[i] && aOptions[i].parse(sValue.trim(), oFormatter);

				if (oResult) {
					oResult.operator = aOptions[i].getKey();
					aResults.push(oResult);
				}
			}

			return aResults;
		};

		/**
		 * Some of the values are semantically equivalent to others.
		 * So we substitute them everywhere, if needed. Example: Last 1 days === Yesterday
		 * This substitution is performed only with options that are present in the options property.
		 *
		 * @param {object} oValue A valid control value
		 * @private
		 * @returns {object} A substituted value if needed, or the same value if not
		 */
		DynamicDateRange.prototype._substituteValue = function(oValue) {
			var sKey, aParams, oNewValue;

			if (!oValue || !oValue.operator || !oValue.values) {
				return oValue;
			}

			sKey = oValue.operator;
			aParams = oValue.values;

			if (sKey === "LASTDAYS" && aParams[0] === 1 && this.getStandardOptions().includes("YESTERDAY")) {
				oNewValue = {
					operator: "YESTERDAY",
					values: []
				};
			} else if (sKey === "NEXTDAYS" && aParams[0] === 1  && this.getStandardOptions().includes("TOMORROW")) {
				oNewValue = {
					operator: "TOMORROW",
					values: []
				};
			} else if ((sKey === "LASTDAYS" || sKey === "NEXTDAYS") && aParams[0] === 0) {
				oNewValue = {
					operator: "TODAY",
					values: []
				};
			}

			return oNewValue ? oNewValue : oValue;
		};

		/**
		 * Returns the DOMNode Id to be used for the "labelFor" attribute of the label.
		 *
		 * By default, this is the Id of the control itself.
		 *
		 * @return {string} Id to be used for the <code>labelFor</code>
		 * @public
		 */
		DynamicDateRange.prototype.getIdForLabel = function () {
			// The DynamicDateRangeInput inherits from the Input
			return this.getAggregation("_input").getIdForLabel();
		};

		/**
		 * Some of the values are semantically equivalent to others.
		 * Example: Last 1 days === Yesterday
		 * When we receive value that is not present in the options property, we try to replace it with another existing equivalent option.
		 *
		 * @param {object} oValue A valid control value
		 * @private
		 * @returns {object} A substituted value if needed, or the same value if not
		 */
		DynamicDateRange.prototype._substituteMissingValue = function(oValue) {
			var oNewValue = oValue;

			if (oValue  && oValue.operator === "YESTERDAY" && !this.getStandardOptions().includes("YESTERDAY") && this.getStandardOptions().includes("LASTDAYS")) {
				oNewValue = {
					operator: "LASTDAYS",
					values: [1]
				};
			} else if (oValue && oValue.operator === "TOMORROW"  && !this.getStandardOptions().includes("TOMORROW") && this.getStandardOptions().includes("NEXTDAYS")) {
				oNewValue = {
					operator: "NEXTDAYS",
					values: [1]
				};
			}

			return oNewValue;
		};

		/**
		 * Returns a date range from a provided object in the format of the DynamicDateRange's value.
		 * @example
		 * var aDates = DynamicDateRange.toDates({operator: StandardDynamicDateRangeKeys.TODAY, values: []});
		 * aDates[0].toString()
		 * // output: "Fri Mar 31 2023 00:00:00 GMT+0200 (Eastern European Standard Time)" - assuming TODAY is Mar 31, 2023, 2:37:00 PM in the configured time zone
		 *
		 * @param {sap.m.DynamicDateRangeValue} oValue A <code>sap.m.DynamicDateRangeValue</code>
	 	 * @param {string} sCalendarWeekNumbering The type of calendar week numbering
		 * @returns {Date[]} An array of two date objects - start and end date
		 * @static
		 * @public
		 */
		DynamicDateRange.toDates = function(oValue, sCalendarWeekNumbering) {
			return oStandardOptionsObjects[oValue.operator].toDates(oValue, sCalendarWeekNumbering).map(function (oDate) {
				if (oDate instanceof Date) {
					return oDate;
				}

				return oDate.getJSDate();
			});
		};

		var DynamicDateRangeInputRenderer = Renderer.extend(InputRenderer);

		DynamicDateRangeInputRenderer.apiVersion = 2;

		DynamicDateRangeInputRenderer.writeInnerAttributes = function(oRm, oControl) {
			if (oControl.getShowSuggestion() || oControl.getShowValueStateMessage()) {
				oRm.attr("autocomplete", "off");
			}

			var oDynamicDateRange = oControl._getControlOrigin ? oControl._getControlOrigin() : null,
				mAccAttributes = this.getAccessibilityState(oControl);

			if (oDynamicDateRange && oDynamicDateRange.isA("sap.m.DynamicDateRange")) {
				oRm.accessibilityState(oDynamicDateRange, mAccAttributes);
			}
			oRm.attr("type", "text");
		};

		/**
		 * Returns the accessibility state of the control.
		 * Hook for the subclasses.
		 *
		 * @param {sap.ui.core.Control} oControl an object representation of the control.
		 * @returns {Object}
		 */
		DynamicDateRangeInputRenderer.getAccessibilityState = function(oControl) {
			var mAccessibilityState = InputRenderer.getAccessibilityState(oControl),
				oDynamicDateRange = oControl._getControlOrigin(),
				aAriaLabelledByRefs = oDynamicDateRange.getAriaLabelledBy(),
				// If we don't check this manually, we won't have the labels, which were referencing the DynamicDateRange instance,
				// in aria-labelledby (which normally comes out of the box). This is because writeAccessibilityState
				// is called for the DynamicDateRangeInput, while any labels will be for the DynamicDateRange parent control.
				aReferencingLabels = LabelEnablement.getReferencingLabels(oDynamicDateRange),
				sDescribedBy = oDynamicDateRange.getAriaDescribedBy().join(" "),
				sResultingLabelledBy;

			sResultingLabelledBy = aReferencingLabels.concat(aAriaLabelledByRefs).join(" ");

			if (sDescribedBy){
				mAccessibilityState.describedby = sDescribedBy;
			}

			if (sResultingLabelledBy){
				mAccessibilityState.labelledby = sResultingLabelledBy;
			}

			mAccessibilityState.roledescription = oResourceBundle.getText("ACC_CTR_TYPE_DYNAMIC_DATE_RANGE");
			mAccessibilityState.role = this.getAriaRole();
			if (oControl.getEditable() && oControl.getEnabled()) {
				mAccessibilityState.haspopup = coreLibrary.aria.HasPopup.ListBox.toLowerCase();
			}
			mAccessibilityState.controls = oDynamicDateRange._oPopup && oDynamicDateRange._oPopup.getDomRef() ?
				oDynamicDateRange._oPopup.getDomRef().id : undefined;

			return mAccessibilityState;
		};

		var DynamicDateRangeInput = Input.extend("sap.m.internal.DynamicDateRangeInput", {
			metadata: {
				library: "sap.m"
			},
			renderer: DynamicDateRangeInputRenderer
		});

		/**
		 * Setter for the originating control.
		 *
		 * @param {sap.ui.core.Control} oControl origination control instance
		 * @returns {sap.ui.core.Control}
		 */
		DynamicDateRangeInput.prototype._setControlOrigin = function(oControl) {
			this._oOriginControl = oControl;
			return this._oOriginControl;
		};

		/**
		 * Getter for the originating control.
		 *
		 * @returns {sap.ui.core.Control}
		 */
		DynamicDateRangeInput.prototype._getControlOrigin = function() {
			return this._oOriginControl;
		};

		DynamicDateRangeInput.prototype.preventChangeOnFocusLeave = function(oEvent) {
			return this.bFocusoutDueRendering;
		};

		DynamicDateRangeInput.prototype.onsapshow = function(oEvent) {
			if (!this.getEnabled() || !this.getEditable()) {
				return;
			}

			this.bValueHelpRequested = true;
			this._fireValueHelpRequest(false);
			oEvent.preventDefault();
			oEvent.stopPropagation();
		};

		DynamicDateRangeInput.prototype.onsaphide = DynamicDateRangeInput.prototype.onsapshow;

		DynamicDateRangeInput.prototype.shouldSuggetionsPopoverOpenOnMobile = function(oEvent) {
			var bIsClickedOnIcon = oEvent.srcControl instanceof Icon;
			return this.isMobileDevice()
				&& this.getEditable()
				&& this.getEnabled()
				&& this.getShowSuggestion()
				&& !bIsClickedOnIcon
				&& (!this._bClearButtonPressed);
		};

		DynamicDateRangeInput.prototype.onfocusin = function (oEvent) {
			var oPopup = this._getControlOrigin()._oPopup;
			Input.prototype.onfocusin.apply(this, arguments);
			if (oPopup && oPopup.isOpen() && !Device.system.tablet && !Device.system.mobile) {
				this._getControlOrigin()._closePopup();
			}
		};

		var DynamicDateRangeListItem = StandardListItem.extend("sap.m.DynamicDateRangeListItem", {
			metadata: {
				library: "sap.m",
				properties: {
					optionKey: { type: "string", group: "Misc", defaultValue: null }
				}
			},
			renderer: StandardListItemRenderer
		});

		/* Override which enables DynamicDateRangeListItem selection */
		DynamicDateRangeListItem.prototype.hasActiveType = function() {
			return true;
		};

		/* Override which enables DynamicDateRangeListItem selection */
		DynamicDateRangeListItem.prototype.isIncludedIntoSelection = function() {
			return false;
		};

		/* Override which prevents DynamicDateRangeListItem selection by pressing SPACE */
		DynamicDateRangeListItem.prototype.onsapspace = function(oEvent) {
			oEvent.preventDefault();
		};

		// Overwrite the sap.m.StandardListItem.getNavigationControl method, in order to change the navigation icon URI
		DynamicDateRangeListItem.prototype.getNavigationControl = function() {
			var oNavControl = StandardListItem.prototype.getNavigationControl.apply(this, arguments),
				sOptionKey = this.getOptionKey(),
				bDateOption = ["SPECIFICMONTH", "DATE", "DATERANGE", "FROM", "TO"].includes(sOptionKey),
				bDateTimeOption = ["DATETIME", "DATETIMERANGE", "FROMDATETIME", "TODATETIME"].includes(sOptionKey),
				sNavgationIconURI;

			if (bDateOption || bDateTimeOption) {
				oNavControl.addStyleClass("sapMDDRDateOption");
				sNavgationIconURI = bDateOption ? IconPool.getIconURI("appointment-2") : IconPool.getIconURI("date-time");
			} else {
				sNavgationIconURI = IconPool.getIconURI("slim-arrow-right");
			}

			oNavControl.setSrc(sNavgationIconURI);

			return oNavControl;
		};

		return DynamicDateRange;
	});
