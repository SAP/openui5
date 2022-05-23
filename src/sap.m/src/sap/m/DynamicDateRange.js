/*!
 * ${copyright}
 */

// Provides control sap.m.DynamicDateRange.
sap.ui.define([
	'sap/ui/core/InvisibleText',
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/ui/core/ListItem',
	'sap/ui/core/library',
	"sap/ui/core/Renderer",
	'sap/ui/core/message/MessageMixin',
	'sap/m/DynamicDateFormat',
	'sap/m/DynamicDateUtil',
	'sap/ui/core/IconPool',
	'sap/ui/core/Icon',
	"sap/ui/core/LabelEnablement",
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/format/TimezoneUtil',
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
	'sap/ui/dom/jquery/Focusable'], // provides jQuery.fn.firstFocusableDomRef
	function(
		InvisibleText,
		Element,
		Control,
		ListItem,
		coreLibrary,
		Renderer,
		MessageMixin,
		DynamicDateFormat,
		DynamicDateUtil,
		IconPool,
		Icon,
		LabelEnablement,
		DateFormat,
		TimezoneUtil,
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
		jQuery
	) {
		"use strict";

		// shortcut for sap.ui.core.ValueState
		var ValueState = coreLibrary.ValueState,
			ToolbarDesign = library.ToolbarDesign,
			ToolbarStyle = library.ToolbarStyle,
			ListType = library.ListType,
			ListMode = library.ListMode,
			ListSeparators = library.ListSeparators,
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

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
		 * A custom option could be defined by using the <code>sap.m.CustomDynamicDateOption</code> class and
		 * appending an instance of this class into the <code>sap.m.DynamicDateUtil</code> options.
		 * In order for a specific option to be used its key should be added into the <code>options</code> property
		 * of the control. No options are added by default.
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
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @extends sap.ui.core.Control
		 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
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
					 * @since 1.92
					 */
					value: { type: "object" },

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
					 * @since 1.92
					 */
					formatter: { type: "object" },

					/**
					 * Array of standard and custom option keys
					 *
					 * @since 1.92
					 */
					options: {
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
							"LASTDAYS",
							"LASTWEEKS",
							"LASTMONTHS",
							"LASTQUARTERS",
							"LASTYEARS",
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
					}
				},
				aggregations: {
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

		DynamicDateRange.prototype.init = function() {
			this._oInput = new DynamicDateRangeInput(this.getId() + "-input", {
				showValueHelp: true,
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

			this._oInput._getValueHelpIcon().setTooltip(oResourceBundle.getText("INPUT_VALUEHELP_BUTTON"));
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

			this.setValue(this._substitudeMissingValue(this.getValue()));
		};

		DynamicDateRange.prototype.setValue = function(oValue) {
			var sOptionKey = oValue && oValue.operator;

			// substutude the semantically equivalent values
			oValue = this._substitudeValue(oValue);

			this.setProperty("value", oValue);
			this._oSelectedOption = DynamicDateUtil.getOption(sOptionKey);

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
		 * @returns {void}
		 * @since 1.92
		 * @public
		 */
		DynamicDateRange.prototype.open = function() {
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

				this._openPopup();
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
		 * Appends an option key, identifying an additional option to be used by the control.
		 *
		 * @param {string} sKey option key
		 * @returns {void}
		 * @since 1.92
		 * @public
		 */
		DynamicDateRange.prototype.addOption = function(sKey) {
			var aOptions = this.getOptions();

			if (aOptions.indexOf(sKey) === -1) {
				aOptions.push(sKey);
			}

			this.setOptions(aOptions);
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

				var sSuggestedValue = DynamicDateUtil.getOption(oSuggestValue.operator)
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
		};

		/**
		 * Returns an array of <code>sap.m.StandardDynamicDateOption</code> instances used in the control.
		 *
		 * @private
		 */
		DynamicDateRange.prototype._getOptions = function() {
			var aOptionKeys = this.getOptions();
			var aOptions = aOptionKeys.map(function(sKey) {
					return DynamicDateUtil.getOption(sKey);
				}, this);

			// filter out the non-existent options (such option key is not known in the global util)
			return aOptions.filter(function(o) {
				return !!o;
			});
		};

		DynamicDateRange.prototype._getDatesLabelFormatter = function() {
			var oFormatOptions,
				aValueHelpTypes = this._oSelectedOption ? this._oSelectedOption.getValueHelpUITypes() : [],
				sType = aValueHelpTypes && aValueHelpTypes.length ? aValueHelpTypes[0].getType() : "";

			if (!this._oDatesLabelFormatter) {
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
			var aResultingDates = DynamicDateUtil.toDates(oSuggestValue).map(function(oDate) {
				return this._convertDate(oDate);
			}, this);

			var oItem = new ListItem({
				text: DynamicDateUtil.getOption(oSuggestValue.operator).format(oSuggestValue, this._getFormatter()),
				additionalText: this._getDatesLabelFormatter().format(aResultingDates)
			});

			this._oInput.addSuggestionItem(oItem);
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

			if (!bValid) {
				this.setValue({ operator: "PARSEERROR", values: [oResourceBundle.getText("DDR_WRONG_VALUE"), sInputValue] });
			} else {
				this.setValue(oVal);
			}

			this.fireChange({ value: this.getValue(), prevValue: oPrevValue, valid: bValid });
		};

		DynamicDateRange.prototype._enhanceInputValue = function(sFormattedValue, oVal) {
			if (DynamicDateUtil.getOption(oVal.operator).enhanceFormattedValue()
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
			var aDates = DynamicDateUtil.toDates(oValue).map(function(oDate) {
				return this._convertDate(oDate);
			}, this);

			return this._getDatesLabelFormatter().format(aDates);
		};

		DynamicDateRange.prototype._convertDate = function(oDate) {
			var sFormattedDate = this._getPickerParser().format(oDate, TimezoneUtil.getLocalTimezone());
			var oParts = this._getPickerParser().parse(
				sFormattedDate,
				sap.ui.getCore().getConfiguration().getTimezone()
			);
			var oNewDate = oParts ? new Date(oParts[0].getTime()) : oParts;

			return oNewDate;
		};

		DynamicDateRange.prototype._reverseConvertDate = function(oDate) {
			var sFormattedDate = this._getPickerParser().format(
				oDate,
				sap.ui.getCore().getConfiguration().getTimezone()
			);
			var oParts = this._getPickerParser().parse(
				sFormattedDate,
				TimezoneUtil.getLocalTimezone()
			);
			var oNewDate = oParts ? new Date(oParts[0].getTime()) : oParts;

			return oNewDate;
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
					this.invalidate();
				}, this);

				this._oPopup.attachAfterClose(function() {
					this._oPreviousSelectedOption = this._oSelectedOption;
					this._setFooterVisibility(false);
					this.invalidate();
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
			var aStandardDynamicDateRangeKeysArray = DynamicDateUtil.getStandardKeys();

			// sort by group
			aOptions.sort(function(a, b) {
				var iGroupDiff = a.getGroup() - b.getGroup();

				if (iGroupDiff) {
					return iGroupDiff;
				}

				return aStandardDynamicDateRangeKeysArray.indexOf(a.getKey()) - aStandardDynamicDateRangeKeysArray.indexOf(b.getKey());
			});

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
					var sGroupHeader = oCurrent.getGroupHeader();
					if (aGroupHeaders.indexOf(sGroupHeader) === -1) {
						aGroupHeaders.push(sGroupHeader);
						aResult.push(sGroupHeader);
					}

					aResult.push(oCurrent);

					return aResult;
				}, []);
			}

			return aOptions;
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
				oOption = DynamicDateUtil.getOption(sOptionKey);

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
				aResultDates,
				sFormattedDates;

			if (!oOutputValue || !oOutputValue.operator || !DynamicDateUtil.getOption(oOutputValue.operator)) {
				return;
			}

			aResultDates = DynamicDateUtil.toDates(oOutputValue).map(function(oDate) {
				return this._convertDate(oDate);
			}, this);

			if (aResultDates) {
				if (this._oSelectedOption.getKey() === "FROMDATETIME" || this._oSelectedOption.getKey() === "TODATETIME"
					|| this._oSelectedOption.getKey() === "FROM" || this._oSelectedOption.getKey() === "TO") {
					aResultDates.push(null);
				}
				sFormattedDates = this._getDatesLabelFormatter().format(aResultDates);
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

			oPopover.invalidate();

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
				oElementToFocus = this._oOptionsList.getItems().find(function(oListItem) {
					return oListItem.isA("sap.m.DynamicDateRangeListItem") &&
						(oListItem.getOptionKey() === oValue.operator);
				});
			}

			if (!oElementToFocus) {
				oElementToFocus = jQuery(oToPage.getDomRef().querySelector("section")).firstFocusableDomRef();
			}

			oElementToFocus.focus();
			oElementToFocus && oElementToFocus.setSelected && oElementToFocus.setSelected(true);

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
					var oCurrentControl = Element.registry.get(sCurrent);
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

		DynamicDateRange.prototype._openPopup = function() {
			if (!this._oPopup) {
				return;
			}

			this._oPopup._getPopup().setExtraContent([this._oInput.getDomRef()]);
			this._oPopup.openBy(this._oInput);
		};

		DynamicDateRange.prototype._applyValue = function() {
			this._oOutput = this._oSelectedOption.getValueHelpOutput(this);

			this._oOutput.values = this._oOutput.values.map(function(val) {
				if (val instanceof Date) {
					return this._convertDate(val);
				}

				return val;
			}, this);

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
			return DynamicDateUtil.getOption(oOutput.operator).format(oOutput, this._getFormatter());
		};

		DynamicDateRange.prototype._parseValue = function(sInputValue) {
			var aResults = DynamicDateUtil.parse(sInputValue, this._getFormatter(), this.getOptions()).filter(function(oResult) {
				return this.getOptions().indexOf(oResult.operator) !== -1;
			}, this);

			return aResults.length ? aResults[0] : null;
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
		DynamicDateRange.prototype._substitudeValue = function(oValue) {
			var sKey, aParams, oNewValue;

			if (!oValue || !oValue.operator || !oValue.values) {
				return oValue;
			}

			sKey = oValue.operator;
			aParams = oValue.values;

			if (sKey === "LASTDAYS" && aParams[0] === 1 && this.getOptions().includes("YESTERDAY")) {
				oNewValue = {
					operator: "YESTERDAY",
					values: []
				};
			} else if (sKey === "NEXTDAYS" && aParams[0] === 1  && this.getOptions().includes("TOMORROW")) {
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
		DynamicDateRange.prototype._substitudeMissingValue = function(oValue) {
			var oNewValue = oValue;

			if (oValue  && oValue.operator === "YESTERDAY" && !this.getOptions().includes("YESTERDAY") && this.getOptions().includes("LASTDAYS")) {
				oNewValue = {
					operator: "LASTDAYS",
					values: [1]
				};
			} else if (oValue && oValue.operator === "TOMORROW"  && !this.getOptions().includes("TOMORROW") && this.getOptions().includes("NEXTDAYS")) {
				oNewValue = {
					operator: "NEXTDAYS",
					values: [1]
				};
			}

			return oNewValue;
		};

		var DynamicDateRangeInputRenderer = Renderer.extend(InputRenderer);

		DynamicDateRangeInputRenderer.apiVersion = 2;

		DynamicDateRangeInputRenderer.writeInnerAttributes = function(oRm, oControl) {
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
			mAccessibilityState.haspopup = coreLibrary.aria.HasPopup.ListBox.toLowerCase();
			mAccessibilityState.autocomplete = "list";
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
			Input.prototype.onfocusin.apply(this, arguments);
			if (this._getControlOrigin()._oPopup && this._getControlOrigin()._oPopup.isOpen() && !this.isMobileDevice()) {
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
				aValueTypes = DynamicDateUtil.getOption(sOptionKey).getValueTypes(),
				bDateOption = ["SPECIFICMONTH", "DATE", "DATERANGE", "FROM", "TO"].includes(sOptionKey),
				bDateTimeOption = aValueTypes && aValueTypes.length && aValueTypes[0] === "datetime",
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
