/*!
 * ${copyright}
 */

// Provides control sap.m.Input.
sap.ui.define([
	'./InputBase',
	'sap/ui/core/Element',
	'sap/ui/core/Item',
	'sap/ui/core/LabelEnablement',
	'sap/ui/core/AccessKeysEnablement',
	'sap/ui/core/library',
	'./ColumnListItem',
	'./GroupHeaderListItem',
	'sap/ui/core/SeparatorItem',
	'./Table',
	'./library',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'./SuggestionsPopover',
	'./Toolbar',
	'./ToolbarSpacer',
	'./Button',
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/containsOrEquals",
	"sap/base/assert",
	"sap/base/util/deepEqual",
	"sap/m/inputUtils/wordStartsWithValue",
	"sap/m/inputUtils/inputsDefaultFilter",
	"sap/m/inputUtils/highlightDOMElements",
	"sap/m/inputUtils/typeAhead",
	"sap/ui/events/KeyCodes",
	"sap/m/inputUtils/filterItems",
	"sap/m/inputUtils/ListHelpers",
	"sap/m/inputUtils/calculateSelectionStart",
	"sap/m/inputUtils/selectionRange",
	"./InputRenderer",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Lib",
	// provides jQuery.fn.selectText
	"sap/ui/dom/jquery/selectText"
],
function(
	InputBase,
	Element,
	Item,
	LabelEnablement,
	AccessKeysEnablement,
	CoreLibrary,
	ColumnListItem,
	GroupHeaderListItem,
	SeparatorItem,
	Table,
	library,
	IconPool,
	Device,
	SuggestionsPopover,
	Toolbar,
	ToolbarSpacer,
	Button,
	ResizeHandler,
	containsOrEquals,
	assert,
	deepEqual,
	wordStartsWithValue,
	inputsDefaultFilter,
	highlightDOMElements,
	typeAhead,
	KeyCodes,
	filterItems,
	ListHelpers,
	calculateSelectionStart,
	selectionRange,
	InputRenderer,
	ManagedObject,
	ManagedObjectObserver,
	Library
) {
	"use strict";
	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.InputTextFormatMode
	var InputTextFormatMode = library.InputTextFormatMode;

	// shortcut for sap.m.InputType
	var InputType = library.InputType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.ListSeparators
	var ListSeparators = library.ListSeparators;

	/**
	 * Constructor for a new <code>Input</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Allows the user to enter and edit text or numeric values in one line.
	 *
	 * <h3>Overview</h3>
	 *
	 * You can enable the autocomplete suggestion feature and the value help option to easily enter a valid value.
	 *
	 * <h3>Guidelines</h3>
	 *
	 * <ul>
	 * <li> Always provide a meaningful label for any input field </li>
	 * <li> Limit the length of the input field. This will visually emphasize the constraints for the field. </li>
	 * <li> Do not use the <code>placeholder</code> property as a label.</li>
	 * <li> Use the <code>description</code> property only for small fields with no placeholders (i.e. for currencies).</li>
	 * </ul>
	 *
	 * <h3>Structure</h3>
	 *
	 * The controls inherits from {@link sap.m.InputBase} which controls the core properties like:
	 * <ul>
	 * <li> editable / read-only </li>
	 * <li> enabled / disabled</li>
	 * <li> placeholder</li>
	 * <li> text direction</li>
	 * <li> value states</li>
	 * </ul>
	 * To aid the user during input, you can enable value help (<code>showValueHelp</code>) or autocomplete (<code>showSuggestion</code>).
	 * <strong>Value help</strong> will open a new dialog where you can refine your input.
	 * <strong>Autocomplete</strong> has three types of suggestions:
	 * <ul>
	 * <li> Single value - a list of suggestions of type <code>sap.ui.core.Item</code> or <code>sap.ui.core.ListItem</code> </li>
	 * <li> Two values - a list of two suggestions (ID and description) of type <code>sap.ui.core.Item</code> or <code>sap.ui.core.ListItem</code> </li>
	 * <li> Tabular suggestions of type <code>sap.m.ColumnListItem</code> </li>
	 * </ul>
	 * The suggestions are stored in two aggregations <code>suggestionItems</code> (for single and double values) and <code>suggestionRows</code> (for tabular values).
	 *
	 * <h3>Usage</h3>
	 *
	 * <b>When to use:</b>
	 * Use the control for short inputs like emails, phones, passwords, fields for assisted value selection.
	 *
	 * <b>When not to use:</b>
	 * Don't use the control for long texts, dates, designated search fields, fields for multiple selection.
	 *
	 * <h3>Known Restrictions</h3>
	 *
	 * If <code>showValueHelp</code> or if <code>showSuggestion</code> is <code>true</code>, the native browser autofill will not fire a change event.
	 *
	 * <h4>Note:</h4>
	 * The control has the following behavior regarding the <code>selectedKey</code> and <code>value</code> properties:
	 * <ul>
	 * <li> On initial loading, if the control has a <code>selectedKey</code> set which corresponds to a matching item, and a set <code>value</code>, the <code>value</code> will be updated to the matching item's text. </li>
	 * <li> If a <code>selectedKey</code> is set and the user types an input which corresponds to an item's text, the <code>selectedKey</code> will be updated with the matching item's key. </li>
	 * <li> If a <code>selectedKey</code> is set and the user types an input which does not correspond to any item's text, the <code>selectedKey</code> will be set to an empty string ("") </li>
	 * <li> If a <code>selectedKey</code> is set and the user selects an item, the <code>selectedKey</code> will be updated to match the selected item's key. </li>
	 * <li> If a <code>selectedKey</code> is bound and the user types before the data is loaded, the user's input will be overwritten by the binding update. </li>
	 * </ul>
	 *
	 * @extends sap.m.InputBase
	 * @implements sap.ui.core.IAccessKeySupport
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Input
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/input-field/ Input}
	 */
	var Input = InputBase.extend("sap.m.Input", /** @lends sap.m.Input.prototype */ {
		metadata : {
			interfaces : [
				"sap.ui.core.IAccessKeySupport",
				"sap.m.IToolbarInteractiveControl"
			],
			library : "sap.m",
			properties : {
				/**
				 * HTML type of the internal <code>input</code> tag (e.g. Text, Number, Email, Phone).
				 * The particular effect of this property differs depending on the browser and the current language settings,
				 * especially for the type Number.<br>
				 * This parameter is intended to be used with touch devices that use different soft keyboard layouts depending on the given input type.<br>
				 * Only the default value <code>sap.m.InputType.Text</code> may be used in combination with data model formats.
				 * <code>sap.ui.model</code> defines extended formats that are mostly incompatible with normal HTML
				 * representations for numbers and dates.
				 */
				type : {type : "sap.m.InputType", group : "Data", defaultValue : InputType.Text},

				/**
				 * Maximum number of characters. Value '0' means the feature is switched off.
				 * This parameter is not compatible with the input type <code>sap.m.InputType.Number</code>.
				 * If the input type is set to <code>Number</code>, the <code>maxLength</code> value is ignored.
				 * If the <code>maxLength</code> is set after there is already a longer value, this value will not get truncated.
				 * The <code>maxLength</code> property has effect only when the value is modified by user interaction.
				 */
				maxLength : {type : "int", group : "Behavior", defaultValue : 0},

				/**
				 * If set to true, a value help indicator will be displayed inside the control. When clicked the event "valueHelpRequest" will be fired.
				 * @since 1.16
				 */
				showValueHelp : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Set custom value help icon.
				 * @since 1.84.0
				 */
				valueHelpIconSrc : {type : "sap.ui.core.URI", group : "Behavior", defaultValue : "sap-icon://value-help"},

				/**
				 * If this is set to true, suggest event is fired when user types in the input. Changing the suggestItems aggregation in suggest event listener will show suggestions within a popup. When runs on phone, input will first open a dialog where the input and suggestions are shown. When runs on a tablet, the suggestions are shown in a popup next to the input.
				 * @since 1.16.1
				 */
				showSuggestion : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Defines whether to filter the provided suggestions before showing them to the user.
				 */
				filterSuggests : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * If set, this parameter will control the horizontal size of the suggestion list to display more data. By default, the suggestion list has a minimum width equal to the input field's width and a maximum width of 640px.
				 * This property allows the suggestion list to contract or expand based on available space, potentially exceeding 640px.
				 * <b>Note:</b> If the actual width of the input field exceeds the specified parameter value, the value will be ignored.
				 * @since 1.21.1
				 */
				maxSuggestionWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

				/**
				 * Minimum length of the entered text in input before suggest event is fired. The default value is 1 which means the suggest event is fired after user types in input.
				 *
				 * <b>Note:</b> When it's set to 0, suggest event is fired when input with no text gets focus. In this case no suggestion popup will open.
				 * @since 1.21.2
				 */
				startSuggestion : {type : "int", group : "Behavior", defaultValue : 1},

				/**
				 * For tabular suggestions, this flag will show/hide the button at the end of the suggestion table that triggers the event "valueHelpRequest" when pressed. The default value is true.
				 *
				 * <b>Note:</b> If suggestions are not tabular or no suggestions are used, the button will not be displayed and this flag is without effect.
				 * @since 1.22.1
				 */
				showTableSuggestionValueHelp : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * The description is a text after the input field, e.g. units of measurement, currencies.
				 */
				description: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * This property only takes effect if the description property is set. It controls the distribution of space between the input field and the description text. The default value is 50% leaving the other 50% for the description.
				 */
				fieldWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: '50%' },

				/**
				 * Indicates when the value gets updated with the user changes: At each keystroke (true) or first when the user presses enter or tabs out (false).
				 *
				 * <b>Note:</b> When set to true and the value of the Input control is bound to a model, the change event becomes obsolete and will not be fired, as the value in the model will be updated each time the user provides input. In such cases, subscription to the liveChange event is more appropriate, as it corresponds to the way the underlying model gets updated.
				 * @since 1.24
				 */
				valueLiveUpdate : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Defines the key of the selected item.
				 *
				 * <b>Note:</b> If duplicate keys exist, the first item matching the key is used.
				 * @since 1.44
				 */
				selectedKey: {type: "string", group: "Data", defaultValue: ""},

				/**
				 * Defines the display text format mode.
				 * @since 1.44
				 */
				textFormatMode: {type: "sap.m.InputTextFormatMode", group: "Misc", defaultValue: InputTextFormatMode.Value},

				/**
				 * Defines the display text formatter function.
				 * @since 1.44
				 */
				textFormatter: {type: "function", group: "Misc", defaultValue: null},

				/**
				 * Defines the validation callback function called when a suggestion row gets selected.
				 * @since 1.44
				 */
				suggestionRowValidator: {type: "function", group: "Misc", defaultValue: null},

				/**
				 * Specifies whether the suggestions highlighting is enabled.
				 * <b>Note:</b> Due to performance constraints, the functionality will be disabled above 200 items.
				 * <b>Note:</b> Highlighting in table suggestions will work only for cells containing sap.m.Label or sap.m.Text controls.
				 *
				 * @since 1.46
				 */
				enableSuggestionsHighlighting: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Enables the <code>autoPopinMode</code> of <code>sap.m.Table</code>, when the input has tabular suggestions.
				 * <b>Note:</b> The <code>autoPopinMode</code> overwrites the <code>demandPopin</code> and the
				 * <code>minScreenWidth</code> properties of the <code>sap.m.Column</code>.
				 * When setting, <code>enableTableAutoPopinMode</code>, from true to false,
				 * the application must reconfigure the <code>demandPopin</code> and
				 * <code>minScreenWidth</code> properties of the <code>sap.m.Column</code> control by itself.
				 * @since 1.89
				 */
				enableTableAutoPopinMode: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Specifies whether autocomplete is enabled.
				 * Works only if "showSuggestion" property is set to true.
				 * <b>Note:</b> The autocomplete feature is disabled on Android devices due to a OS specific issue.
				 * @since 1.61
				 */
				autocomplete: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Specifies whether clear icon is shown.
				 * Pressing the icon will clear input's value and fire the liveChange event.
				 * @since 1.94
				 */
				showClearIcon: { type: "boolean", defaultValue: false },

				/**
				 * Specifies whether the clear icon should be shown/hidden on user interaction.
				 * @private
				 */
				effectiveShowClearIcon: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * Specifies whether to display separators in tabular suggestions.
				 * @private
				 * @ui5-private sap.ui.comp.smartfield.SmartField
				 */
				separateSuggestions: { type: "boolean", defaultValue: true, visibility: "hidden" },

				/**
				 * Indicates whether the access keys ref of the control should be highlighted.
				 * NOTE: this property is used only when access keys feature is turned on.
				 *
				 * @private
				 */
				highlightAccKeysRef: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * Indicates which keyboard key should be pressed to focus the access key ref
				 * NOTE: this property is used only when access keys feature is turned on.
				 *
				 * @private
				 */
				accesskey: { type: "string", defaultValue: "", visibility: "hidden" }
			},
			defaultAggregation : "suggestionItems",
			aggregations : {

				/**
				 * Defines the items displayed in the suggestion popup. Changing this aggregation
				 * (by calling <code>addSuggestionItem</code>, <code>insertSuggestionItem</code>,
				 * <code>removeSuggestionItem</code>, <code>removeAllSuggestionItems</code>, or
				 * <code>destroySuggestionItems</code>) after <code>Input</code> is rendered
				 * opens/closes the suggestion popup.
				 *
				 * To display suggestions with two text values, add <code>sap.ui.core.ListItem</code>
				 * as <code>SuggestionItems</code> (since 1.21.1). For the selected
				 * <code>ListItem</code>, only the first value is returned to the input field.
				 *
				 * <b>Note:</b> Only <code>text</code> and <code>additionalText</code> property values
				 * of the item are displayed. For example, if an <code>icon</code> is set, it is
				 * ignored. To display more information per item (including icons), you can use the
				 * <code>suggestionRows</code> aggregation.
				 *
				 * <b>Note:</b> Disabled items are not visualized in the list with the suggestions,
				 * however they can still be accessed through the aggregation.
				 * <b>Note:</b> If <code>suggestionItems</code> & <code>suggestionRows</code> are set in parallel, the last aggeragtion to come would overwrite the previous ones.
				 *
				 * @since 1.16.1
				 */
				suggestionItems : {type : "sap.ui.core.Item", multiple : true, singularName : "suggestionItem"},

				/**
				 * The suggestionColumns and suggestionRows are for tabular input suggestions. This aggregation allows for binding the table columns; for more details see the aggregation "suggestionRows".
				 * @since 1.21.1
				 */
				suggestionColumns : {type : "sap.m.Column", multiple : true, singularName : "suggestionColumn", bindable : "bindable", forwarding: {getter:"_getSuggestionsTable", aggregation: "columns"}},

				/**
				 * The suggestionColumns and suggestionRows are for tabular input suggestions. This aggregation allows for binding the table cells.
				 * The items of this aggregation are to be bound directly or to set in the suggest event method.
				 * <b>Note:</b> If <code>suggestionItems</code> & <code>suggestionRows</code> are set in parallel, the last aggeragtion to come would overwrite the previous ones.
				 * @since 1.21.1
				 */
				suggestionRows : {type : "sap.m.ITableItem", multiple : true, singularName : "suggestionRow", bindable : "bindable", forwarding: {getter: "_getSuggestionsTable", aggregation: "items"}},

				/**
				 * The suggestion popup (can be a Dialog or Popover); aggregation needed to also propagate the model and bindings to the content of the popover
				 */
				_suggestionPopup : {type : "sap.ui.core.Control", multiple: false, visibility: "hidden"},

				/**
				 * The icon on the right side of the Input
				 */
				_valueHelpIcon : {type : "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			},
			associations: {

				/**
				 * Sets or retrieves the selected item from the suggestionItems.
				 * @since 1.44
				 */
				selectedItem: {type: "sap.ui.core.Item", multiple: false},

				/**
				 * Sets or retrieves the selected row from the suggestionRows.
				 * @since 1.44
				 */
				selectedRow: {type: "sap.m.ColumnListItem", multiple: false}
			},
			events : {

				/**
				 * Fired when the value of the input is changed by user interaction - each keystroke, delete, paste, etc.
				 *
				 * <b>Note:</b> Browsing autocomplete suggestions does not fire the event.
				 */
				liveChange : {
					parameters : {
						/**
						 * The current value of the input, after a live change event.
						 */
						value : {type : "string"},

						/**
						 * Indicates that ESC key triggered the event. <b>Note:</b> This parameter will not be sent unless the ESC key is pressed.
						 * @since 1.48
						 */
						escPressed : {type : "boolean"},

						/**
						 * The value of the input before pressing ESC key. <b>Note:</b> This parameter will not be sent unless the ESC key is pressed.
						 * @since 1.48
						 */
						previousValue : {type : "string"}
					}
				},

				/**
				 * When the value help indicator is clicked, this event will be fired.
				 * @since 1.16
				 */
				valueHelpRequest : {
					parameters : {

						/**
						 * The event parameter is set to true, when the button at the end of the suggestion table is clicked, otherwise false. It can be used to determine whether the "value help" trigger or the "show all items" trigger has been pressed.
						 */
						fromSuggestions : {type : "boolean"},

						/**
						 * The event parameter is set to true, when the event is fired after keyboard interaction, otherwise false.
						 */
						fromKeyboard: {type: "boolean"}
					}
				},

				/**
				 * This event is fired when user types in the input and showSuggestion is set to true. Changing the suggestItems aggregation will show the suggestions within a popup.
				 * @since 1.16.1
				 */
				suggest : {
					parameters : {

						/**
						 * The current value which has been typed in the input.
						 */
						suggestValue : {type : "string"},

						/**
						 * The suggestion list is passed to this event for convenience. If you use list-based or tabular suggestions, fill the suggestionList with the items you want to suggest. Otherwise, directly add the suggestions to the "suggestionItems" aggregation of the input control.
						 */
						suggestionColumns : {type : "sap.m.ListBase"}
					}
				},

				/**
				 * This event is fired when suggestionItem shown in suggestion popup are selected. This event is only fired when showSuggestion is set to true and there are suggestionItems shown in the suggestion popup.
				 * @since 1.16.3
				 */
				suggestionItemSelected : {
					parameters : {

						/**
						 * This is the item selected in the suggestion popup for one and two-value suggestions. For tabular suggestions, this value will not be set.
						 */
						selectedItem : {type : "sap.ui.core.Item"},

						/**
						 * This is the row selected in the tabular suggestion popup represented as a ColumnListItem. For one and two-value suggestions, this value will not be set.
						 *
						 * <b>Note:</b> The row result function to select a result value for the string is already executed at this time. To pick different value for the input field or to do follow up steps after the item has been selected.
						 * @since 1.21.1
						 */
						selectedRow : {type : "sap.m.ColumnListItem"}
					}
				},

				/**
				 * This event is fired when user presses the <kbd>Enter</kbd> key on the input.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>The event is fired independent of whether there was a change before or not. If a change was performed, the event is fired after the change event.</li>
				 * <li>The event is also fired when an item of the select list is selected via <kbd>Enter</kbd>.</li>
				 * <li>The event is only fired on an input which allows text input (<code>editable</code>, <code>enabled</code> and not <code>valueHelpOnly</code>).</li>
				 * </ul>
				 *
				 * @since 1.33.0
				 */
				submit : {
					parameters: {

						/**
						 * The new value of the input.
						 */
						value: { type: "string" }
					}
				}
			},
			designtime: "sap/m/designtime/Input.designtime"
		},

		renderer: InputRenderer
	});


	IconPool.insertFontFaceStyle();

	/**
	 * The default filter function for tabular suggestions. It checks whether some item text begins with the typed value.
	 *
	 * @private
	 * @param {string} sValue the current filter string.
	 * @param {sap.m.ColumnListItem} oColumnListItem The filtered list item.
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items.
	 */
	Input._DEFAULTFILTER_TABULAR = function(sValue, oColumnListItem) {
		var aCells = oColumnListItem.getCells(),
			i = 0;

		for (; i < aCells.length; i++) {

			if (aCells[i].getText) {
				if (wordStartsWithValue(aCells[i].getText(), sValue)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * The default result function for tabular suggestions. It returns the value of the first cell with a "text" property.
	 *
	 * @private
	 * @param {sap.m.ColumnListItem} oColumnListItem The selected list item.
	 * @returns {string} The value to be displayed in the input field.
	 */
	Input._DEFAULTRESULT_TABULAR = function (oColumnListItem) {
		// If there are groups, the GroupHeaderListItems are also passed but they should be skipped by this function
		if (!oColumnListItem || oColumnListItem.isA("sap.m.GroupHeaderListItem")) {
			return "";
		}

		var aCells = oColumnListItem.getCells(),
			i = 0;

		for (; i < aCells.length; i++) {
			// take first cell with a text method and compare value
			if (aCells[i].getText) {
				return aCells[i].getText();
			}
		}
		return "";
	};

	/**
	 * Initializes the control.
	 *
	 * @private
	 */
	Input.prototype.init = function() {
		InputBase.prototype.init.call(this);

		// Counter for concurrent issues with setValue:
		this._iSetCount = 0;

		// TypeAhead's suggested text. It's always executed in the context of the "root" Input and never in the Dialog's instance!
		this._sProposedItemText = null;

		this._oRb = Library.getResourceBundleFor("sap.m");

		// Instantiate the SuggestionsPopover only for the main input.
		// If there's a Dialog where the Input gets duplicated, we should not recreate the Popover.
		if (this.getId().indexOf("popup-input") === -1) {
			this._createSuggestionsPopover();
		}

		// We need to set this to empty string as we are comparing it with sValue in the before rendering
		// phase of the life cycle. Without this line, initially the condition fails and fires liveChange event
		// even though there is no user input (check Input.prototype.onsapright).
		this._setTypedInValue("");
		this._bDoTypeAhead = false;
		this._isValueInitial = false;
		this._previousInputType = this.getType();

		// indicates whether input is clicked (on mobile) or the clear button
		// used for identifying whether dialog should be open.
		this._bClearButtonPressed = false;

		// indicates whether input's popover has finished opening
		// we asume that after open its content has been rendered => we don't have the power user scenario
		this._bAfterOpenFinisihed = false;

		AccessKeysEnablement.registerControl(this);
	};

	var setRefLabelsHighlightAccKeysRef = function (bHighlightAccKeysRef) {
		var aRefLabels = LabelEnablement.getReferencingLabels(this);

		aRefLabels.forEach(function(sLabelId) {
			Element.getElementById(sLabelId).setProperty("highlightAccKeysRef", bHighlightAccKeysRef);
		}, this);
	};

	Input.prototype.getAccessKeysFocusTarget = function () {
		return this.getFocusDomRef();
	};

	Input.prototype.onAccKeysHighlightStart = function () {
		setRefLabelsHighlightAccKeysRef.call(this, true);
	};

	Input.prototype.onAccKeysHighlightEnd = function () {
		setRefLabelsHighlightAccKeysRef.call(this, false);
	};

	/**
	 * Destroys the Input.
	 *
	 * @private
	 */
	Input.prototype.exit = function() {

		InputBase.prototype.exit.call(this);

		this._deregisterEvents();

		// clear delayed calls
		this.cancelPendingSuggest();

		if (this._iRefreshListTimeout) {
			clearTimeout(this._iRefreshListTimeout);
			this._iRefreshListTimeout = null;
		}

		this._destroySuggestionsTable();

		if (this._getSuggestionsPopover()) {
			this._oSuggestionPopup = null;
			this._oSuggPopover.destroy();
			this._oSuggPopover = null;
		}

		// Unregister custom events handlers after migration to semantic rendering
		this.$().off("click");
	};

	/*
	 * Overwrites the onBeforeRendering.
	 */
	Input.prototype.onBeforeRendering = function() {
		var sSelectedKey = this.getSelectedKey(),
			bShowValueHelpIcon = this.getShowValueHelp() && this.getEnabled() && this.getEditable(),
			bShowClearIcon = this.getProperty("effectiveShowClearIcon") && this.getEnabled() && this.getEditable(),
			oIcon = this._oValueHelpIcon,
			oSuggestionsPopover = this._getSuggestionsPopover(),
			bSuggestionsPopoverIsOpen = oSuggestionsPopover && this._isSuggestionsPopoverOpen(),
			oPopupInput = oSuggestionsPopover && oSuggestionsPopover.getInput(),
			sValueStateHeaderText = bSuggestionsPopoverIsOpen ?  oSuggestionsPopover._getValueStateHeader().getText() : null,
			sValueStateHeaderValueState = bSuggestionsPopoverIsOpen ?  oSuggestionsPopover._getValueStateHeader().getValueState() : "";

		InputBase.prototype.onBeforeRendering.call(this);

		if (!this.getDomRef() && this.getValue()) {
			this._isValueInitial = true;
		}

		if (this.getShowClearIcon()) {
			this._getClearIcon().setProperty("visible", bShowClearIcon);
		} else if (this._oClearButton) {
			this._getClearIcon().setProperty("visible", false);
		}

		this._deregisterEvents();

		if (sSelectedKey && !this.getSelectedItem() && this.getSuggestionItemByKey(sSelectedKey)) {
			this.setSelectedKey(sSelectedKey);
		}

		if (this.getShowSuggestion()) {
			if (this.getShowTableSuggestionValueHelp()) {
				this._addShowMoreButton();
			} else {
				this._removeShowMoreButton();
			}

			// setting the property "type" of the Input inside the Suggestion popover
			if (oPopupInput) {
				oPopupInput.setType(this.getType());
			}
		}

		if (bShowValueHelpIcon) {
			// ensure the creation of an icon
			oIcon = this._getValueHelpIcon();
			oIcon.setVisible(true);
		} else if (oIcon) {
			// if the icon should not be shown and has never be initialized - do nothing
			oIcon.setVisible(false);
		}

		if (!this.getWidth()) {
			this.setWidth("100%");
		}

		if (this._hasTabularSuggestions()) {
			this._getSuggestionsTable().setAutoPopinMode(this.getEnableTableAutoPopinMode());
			this._getSuggestionsTable().setContextualWidth(this.getEnableTableAutoPopinMode() ? "Auto" : "Inherit");
		}

		if (bSuggestionsPopoverIsOpen && ((this.getValueStateText() && sValueStateHeaderText !== this.getValueStateText()) ||
			(this.getValueState() !== sValueStateHeaderValueState) ||
			(this.getFormattedValueStateText()))) {
			/* If new value state, value state plain text or FormattedText is set
			while the suggestions popover is open update the value state header.
			If the input has FormattedText aggregation while the suggestions popover is open then
			it's new, because the old is already switched to have the value state header as parent */
			this._updateSuggestionsPopoverValueState();
		}
	};

	Input.prototype.onAfterRendering = function() {
		InputBase.prototype.onAfterRendering.call(this);

		if ((this._isValueInitial || this.getType() !== this._previousInputType ) && this.getType() === InputType.Password ) {
			this.getDomRef("inner").value = this.getProperty("value");
			this._isValueInitial = false;
		}

		this._previousInputType = this.getType();
	};

	/**
	 * Returns input display text.
	 *
	 * @private
	 * @param {sap.ui.core.Item} oItem The displayed item.
	 * @returns {string} The key for the text format mode.
	 */
	Input.prototype._getDisplayText = function(oItem) {

		var fTextFormatter = this.getTextFormatter();
		if (fTextFormatter) {
			return fTextFormatter(oItem);
		}

		var sText = oItem.getText(),
			sKey = oItem.getKey(),
			textFormatMode = this.getTextFormatMode();

		switch (textFormatMode) {
			case InputTextFormatMode.Key:
				return sKey;
			case InputTextFormatMode.ValueKey:
				return sText + ' (' + sKey + ')';
			case InputTextFormatMode.KeyValue:
				return '(' + sKey + ') ' + sText;
			default:
				return sText;
		}
	};

	/**
	 * Handles value updates.
	 *
	 * @private
	 * @param {string} newValue The new selected value.
	 */
	Input.prototype._onValueUpdated = function (newValue) {
		if (this._bSelectingItem || newValue === this._sSelectedValue) {
			return;
		}

		var sKey = this.getSelectedKey(),
			bHasSelectedItem,
			oSuggestionsPopover = this._getSuggestionsPopover(),
			oList = oSuggestionsPopover && oSuggestionsPopover.getItemsContainer();

		if (!this._hasTabularSuggestions() && sKey === '') {
			return;
		}

		if (this._hasTabularSuggestions()) {
			bHasSelectedItem = this._getSuggestionsTable() && !!this._getSuggestionsTable().getSelectedItem();
		} else {
			bHasSelectedItem = oList && !!oList.getSelectedItem();
		}

		if (bHasSelectedItem) {
			return;
		}

		this.setProperty("selectedKey", '', true);
		this.setAssociation("selectedRow", null, true);
		this.setAssociation("selectedItem", null, true);
	};

	/**
	 * Updates and synchronizes the <code>selectedItem</code> association and <code>selectedKey</code> properties.
	 *
	 * @private
	 * @param {sap.ui.core.Item | null} oItem Selected item.
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction.
	 */
	Input.prototype.setSelectionItem = function (oItem, bInteractionChange) {

		this._bSelectingItem = true;

		if (!oItem) {
			this.setAssociation("selectedItem", null, true);
			this.setValue('');
			return;
		}

		var iCount = this._iSetCount,
			sNewValue;

		this.setAssociation("selectedItem", oItem, true);
		this.setProperty("selectedKey", oItem.getKey(), true);

		// fire suggestion item select event
		if (bInteractionChange) {
			this.fireSuggestionItemSelected({
				selectedItem: oItem
			});
		}

		// choose which field should be used for the value
		if (iCount !== this._iSetCount) {
			// if the event handler modified the input value we take this one as new value
			sNewValue = this.getValue();
		} else {
			sNewValue = this._getDisplayText(oItem);
		}

		this._sSelectedValue = sNewValue;
		this.setSelectionUpdatedFromList(false);
		this.updateInputField(sNewValue);

		// don't continue if the input is destroyed after firing change event through updateInputField
		if (this.bIsDestroyed) {
			return;
		}

		if (!(this.isMobileDevice() && this.isA("sap.m.MultiInput"))) {
			this._closeSuggestionPopup();
		}

		this._bSelectingItem = false;
		this._resetTypeAhead();
	};


	/**
	 * Adds a sap.m.GroupHeaderListItem item to the aggregation named <code>suggestionRows</code>.
	 *
	 * @param {sap.ui.core.Item} oGroup Item of that group
	 * @param {sap.ui.core.SeparatorItem} oHeader The item to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
	 * @returns {sap.m.GroupHeaderListItem} The group header
	 * @private
	 */
	Input.prototype.addSuggestionRowGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		oHeader = oHeader || new GroupHeaderListItem({
			title: ManagedObject.escapeSettingsValue(oGroup.text) || ManagedObject.escapeSettingsValue(oGroup.key)
		});

		this._createSuggestionPopupContent(true);
		this.addAggregation("suggestionRows", oHeader, bSuppressInvalidate);
		return oHeader;
	};


	/**
	 * Adds a sap.ui.core.SeparatorItem item to the aggregation named <code>suggestions</code>.
	 *
	 * @param {sap.ui.core.Item} oGroup Item of that group
	 * @param {sap.ui.core.SeparatorItem} oHeader The item to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be suppressed
	 * @returns {sap.m.GroupHeaderListItem} The group header
	 * @private
	 */
	Input.prototype.addSuggestionItemGroup = function(oGroup, oHeader, bSuppressInvalidate) {
		oHeader = oHeader || new SeparatorItem({
			text: ManagedObject.escapeSettingsValue(oGroup.text) || ManagedObject.escapeSettingsValue(oGroup.key)
		});

		this._createSuggestionPopupContent(false);
		this.addAggregation("suggestionItems", oHeader, bSuppressInvalidate);
		return oHeader;
	};

	/**
	 * Sets the <code>selectedItem</code> association.
	 *
	 *
	 * @public
	 * @param {sap.ui.core.ID|sap.ui.core.Item|null} [oItem=null] New value for the <code>selectedItem</code> association.
	 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the
	 * <code>selectedItem</code> association.
	 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedItem = function(oItem) {

		if (typeof oItem === "string") {
			oItem = Element.getElementById(oItem);
		}

		if (oItem !== null && !(oItem instanceof Item)) {
			return this;
		}

		this.setSelectionItem(oItem);
		return this;
	};

	/**
	 * Sets the <code>selectedKey</code> property.
	 *
	 * Default value is an empty string <code>""</code> or <code>undefined</code>.
	 *
	 * @public
	 * @param {string} sKey New value for property <code>selectedKey</code>.
	 * If the provided <code>sKey</code> is an empty string <code>""</code> or <code>undefined</code>,
	 * the selection is cleared.
	 * If duplicate keys exist, the first item matching the key is selected.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedKey = function(sKey) {
		sKey = this.validateProperty("selectedKey", sKey);
		this.setProperty("selectedKey", sKey, true);

		if (this._hasTabularSuggestions()) {
			return this;
		}

		if (!sKey) {
			this.setSelectionItem();
			return this;
		}

		var oItem = this.getSuggestionItemByKey(sKey);
		this.setSelectionItem(oItem);

		return this;
	};

	/**
	 * Gets the item with the given key from the aggregation <code>suggestionItems</code>.
	 * <b>Note:</b> If duplicate keys exist, the first item matching the key is returned.
	 *
	 * @public
	 * @param {string} sKey An item key that specifies the item to retrieve.
	 * @returns {sap.ui.core.Item} Suggestion item.
	 * @since 1.44
	 */
	Input.prototype.getSuggestionItemByKey = function(sKey) {
		var aItems = this.getSuggestionItems() || [],
			oItem,
			i;

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			if (oItem.getKey() === sKey) {
				return oItem;
			}
		}
	};

	/**
	 * Gets <code>sap.m.FormattedText</code> aggregation based on its current parent.
	 * If the SuggestionPopover is open that is the <code>sap.m.ValueStateHeader</code>, otherwise is the Input itself.
	 *
	 * @private
	 * @returns {sap.m.FormattedText} Aggregation used for value state message that can contain links.
	 * @since 1.78
	 */
	Input.prototype._getFormattedValueStateText = function () {
		var bSuggestionsPopoverIsOpen = this._isSuggestionsPopoverOpen(),
			oValueStateHeaderFormattedText = bSuggestionsPopoverIsOpen ?
				this._getSuggestionsPopover()._getValueStateHeader().getFormattedText() : null;

		if (bSuggestionsPopoverIsOpen && oValueStateHeaderFormattedText) {
			return oValueStateHeaderFormattedText;
		} else {
			return InputBase.prototype.getFormattedValueStateText.call(this);
		}
	};


	/**
	 * Updates and synchronizes the <code>selectedRow</code> association and <code>selectedKey</code> properties.
	 *
	 * @private
	 * @param {sap.m.ColumnListItem} oListItem Selected item.
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction.
	 */
	Input.prototype.setSelectionRow = function (oListItem, bInteractionChange) {
		if (!oListItem) {
			this.setAssociation("selectedRow", null, true);
			return;
		}

		this._bSelectingItem = true;

		var oItem,
			fSuggestionRowValidator = this.getSuggestionRowValidator();

		if (fSuggestionRowValidator) {
			oItem = fSuggestionRowValidator(oListItem);
			if (!(oItem instanceof Item)) {
				oItem = null;
			}
		}

		var iCount = this._iSetCount,
			sKey = "",
			sNewValue;

		this.setAssociation("selectedRow", oListItem, true);

		if (oItem) {
			sKey = oItem.getKey();
		}

		this.setProperty("selectedKey", sKey, true);

		// fire suggestion item select event
		if (bInteractionChange) {
			this.fireSuggestionItemSelected({
				selectedRow: oListItem
			});
		}

		// choose which field should be used for the value
		if (iCount !== this._iSetCount) {
			// if the event handler modified the input value we take this one as new value
			sNewValue = this.getValue();
		} else {
			// for tabular suggestions we call a result filter function
			if (oItem) {
				sNewValue = this._getDisplayText(oItem);
			} else {
				sNewValue = this._getRowResultFunction()(oListItem);
			}
		}

		this._sSelectedValue = sNewValue;
		this.setSelectionUpdatedFromList(false);
		this.updateInputField(sNewValue);

		// don't continue if the input is destroyed after firing change event through updateInputField
		if (this.bIsDestroyed) {
			return;
		}

		if (!(this.isMobileDevice() && this.isA("sap.m.MultiInput") && this._isMultiLineMode)) {
			this._closeSuggestionPopup();
		}

		this._bSelectingItem = false;
		this._resetTypeAhead();
	};

	/**
	 * Sets the <code>selectedRow</code> association.
	 * Default value is <code>null</code>.
	 *
	 * @public
	 * @param {sap.ui.core.ID|sap.m.ColumnListItem|null} oListItem New value for the <code>selectedRow</code> association.
	 * If an ID of a <code>sap.m.ColumnListItem</code> is given, the item with this ID becomes the
	 * <code>selectedRow</code> association.
	 * Alternatively, a <code>sap.m.ColumnListItem</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedRow = function(oListItem) {

		if (typeof oListItem === "string") {
			oListItem = Element.getElementById(oListItem);
		}

		if (oListItem !== null && !(oListItem instanceof ColumnListItem)) {
			return this;
		}

		this.setSelectionRow(oListItem);
		return this;
	};

	/**
	 * Returns/Instantiates the value help icon control when needed.
	 *
	 * @private
	 * @returns {object} Value help icon of the input.
	 */
	Input.prototype._getValueHelpIcon = function () {
		var that = this,
			sIconSrc = this.getValueHelpIconSrc();

		// for backward compatibility - leave this method to return the instance
		if (!this._oValueHelpIcon) {
			this._oValueHelpIcon = this.addEndIcon({
				id: this.getId() + "-vhi",
				src: sIconSrc,
				useIconTooltip: false,
				alt: this._oRb.getText("INPUT_VALUEHELP_BUTTON"),
				decorative: false,
				noTabStop: true,
				press: function (oEvent) {
					var oParent = this.getParent();

					oParent.focus();

					that.bValueHelpRequested = true;

					that._fireValueHelpRequest(false, false);
				}
			});
		} else if (this._oValueHelpIcon.getSrc() !== sIconSrc) {
			this._oValueHelpIcon.setSrc(sIconSrc);
		}

		return this._oValueHelpIcon;
	};

	Input.prototype._getClearIcon = function () {
		var that = this;

		if (this._oClearButton) {
			return this._oClearButton;
		}

		this._oClearButton = this.addEndIcon({
			src: IconPool.getIconURI("decline"),
			noTabStop: true,
			visible: false,
			alt: this._oRb.getText("INPUT_CLEAR_ICON_ALT"),
			useIconTooltip: false,
			decorative: false,
			press: function () {
				if (that.getValue() !== "") {
					that.setValue("");

					that.fireChange({
						value: ""
					});

					that.fireLiveChange({
						value: ""
					});

					that._bClearButtonPressed = true;

					setTimeout(function() {
						if (Device.system.desktop) {
							that.focus();
							that._closeSuggestionPopup();
						}
					}, 0);
				}
			}
		}, 0);

		return this._oClearButton;
	};
	/**
	 * Fire valueHelpRequest event.
	 *
	 * @private
	 */
	Input.prototype._fireValueHelpRequest = function(bFromSuggestions, bFromKeyboard) {

		// The goal is to provide a value in the value help event, which can be used to filter the opened Value Help Dialog.
		var sTypedInValue = "";

		if (this.getShowSuggestion() && !this.isMobileDevice()) {
			sTypedInValue = this._getTypedInValue() || "";
		} else {
			sTypedInValue = this.getDOMValue();
		}

		this.fireValueHelpRequest({
			fromSuggestions: bFromSuggestions,
			fromKeyboard: bFromKeyboard,
			_userInputValue: sTypedInValue // NOTE: Private parameter for the SmartControls which need only the value entered by the user.
		});
	};

	/**
	 * Fire valueHelpRequest event on tap.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Ontap event.
	 */
	Input.prototype.ontap = function(oEvent) {
		InputBase.prototype.ontap.call(this, oEvent);

		if (this.shouldSuggetionsPopoverOpenOnMobile(oEvent)) {
				this._openSuggestionsPopover();
		}

		this._bClearButtonPressed = false;
	};

	/**
	 * A helper function calculating if the SuggestionsPopover should be opened on mobile.
	 *
	 * @protected
	 * @param {jQuery.Event} oEvent Ontap event.
	 * @returns {boolean} If the popover should be opened.
	 */
	Input.prototype.shouldSuggetionsPopoverOpenOnMobile = function(oEvent) {
		return this.isMobileDevice()
			&& this.getEditable()
			&& this.getEnabled()
			&& this.getShowSuggestion()
			&& (!this._bClearButtonPressed)
			&& oEvent.target.id !== this.getId() + "-vhi";
	};

	/**
	 * Sets a custom filter function for suggestions. The default is to check whether the first item text begins with the typed value. For one and two-value suggestions this callback function will operate on sap.ui.core.Item types, for tabular suggestions the function will operate on sap.m.ColumnListItem types.
	 *
	 * @public
	 * @param {function(string=, sap.ui.core.Item=, boolean=):boolean|undefined|function} fnFilter The filter function is called when displaying suggestion items and has two input parameters: the first one is the string that is currently typed in the input field and the second one is the item that is being filtered. Returning true will add this item to the popup, returning false will not display it.
	 * @returns {this} this pointer for chaining
	 * @since 1.16.1
	 */
	Input.prototype.setFilterFunction = function(fnFilter) {
		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnFilter = inputsDefaultFilter;
			return this;
		}
		// set custom function
		assert(typeof (fnFilter) === "function", "Input.setFilterFunction: first argument fnFilter must be a function on " + this);
		this._fnFilter = fnFilter;
		return this;
	};

	/**
	 * Returns a custom or default filter function for list or tabular suggestions.
	 *
	 * If no custom filter is set, default filtering is set depending on the type of the suggestions.
	 *
	 * @private
	 * @param {boolean} bForceDefaultFiltering Whether or not to apply the default filter even if custom one is set
	 *
	 * @returns {function} The default filter function depending on the type of the suggestions.
	 */
	Input.prototype._getFilterFunction = function(bForceDefaultFiltering) {
		if (typeof this._fnFilter === "function" && !bForceDefaultFiltering) {
			return this._fnFilter;
		}

		return !this._hasTabularSuggestions() ? inputsDefaultFilter : Input._DEFAULTFILTER_TABULAR;
	};

	/**
	 * Sets a custom result filter function for tabular suggestions to select the text that is passed to the input field. Default is to check whether the first cell with a "text" property begins with the typed value. For one value and two-value suggestions this callback function is not called.
	 *
	 * @public
	 * @param {function(string=, sap.ui.core.Item=, boolean=):boolean|undefined|function} fnFilter The result function is called with one parameter: the sap.m.ColumnListItem that is selected. The function must return a result string that will be displayed as the input field's value.
	 * @returns {this} this pointer for chaining
	 * @since 1.21.1
	 */
	Input.prototype.setRowResultFunction = function(fnFilter) {
		var sSelectedRow;

		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnRowResultFilter = Input._DEFAULTRESULT_TABULAR;
			return this;
		}
		// set custom function
		assert(typeof (fnFilter) === "function", "Input.setRowResultFunction: first argument fnFilter must be a function on " + this);
		this._fnRowResultFilter = fnFilter;

		sSelectedRow = this.getSelectedRow();
		if (sSelectedRow) {
			this.setSelectedRow(sSelectedRow);
		}

		return this;
	};

	/**
	 * Returns a custom or default filter function for tabular suggestions to select the text that is passed to the input field.
	 *
	 * If no custom filter is set or default filtering is forced, this function will apply the default filter to the column item.
	 *
	 * @private
	 * @param {boolean} bForceDefaultFiltering Whether or not to apply the default filter even if custom one is set
	 *
	 * @returns {function} The row filtering function(s) to execute on the selected row item.
	 */
	Input.prototype._getRowResultFunction = function(bForceDefaultFiltering) {
		if (typeof this._fnRowResultFilter === "function" && !bForceDefaultFiltering) {
			return this._fnRowResultFilter;
		}

		return Input._DEFAULTRESULT_TABULAR;
	};

	/**
	 * Closes the suggestion list.
	 *
	 * @public
	 * @since 1.48
	 */
	Input.prototype.closeSuggestions = function() {
		this._closeSuggestionPopup();
	};

	/**
	 * Selects the text of the InputDomRef in the given range.
	 *
	 * @private
	 * @param {int} iStart Start of selection.
	 * @param {iEnd} iEnd End of selection.
	 * @returns {this} this Input instance for chaining.
	 */
	Input.prototype._doSelect = function(iStart, iEnd) {
		var oDomRef = this._$input[0];
		if (oDomRef) {
			// if no Dom-Ref - no selection (Maybe popup closed)
			var $Ref = this._$input;
			oDomRef.focus();
			$Ref.selectText(iStart ? iStart : 0, iEnd ? iEnd : $Ref.val().length);
		}
		return this;
	};

	/**
	 *  Helper method for distinguishing between incremental and non-incremental types of input.
	 *
	 * @private
	 * @returns {boolean} Is it incremental type.
	 */
	Input.prototype._isIncrementalType = function () {
		var sTypeOfInput = this.getType();
		if (sTypeOfInput === "Number" || sTypeOfInput === "Date" ||
			sTypeOfInput === "Datetime" || sTypeOfInput === "Month" ||
			sTypeOfInput === "Time" || sTypeOfInput === "Week") {
			return true;
		}
		return false;
	};

	/**
	 * Keyboard handler for escape key.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapescape = function(oEvent) {
		if (this._isSuggestionsPopoverOpen()) {
			// mark the event as already handled
			oEvent.originalEvent._sapui_handledByControl = true;
			this._revertPopupSelection();

			// revert autocompleted value on desktop
			if (this._getTypedInValue() !== this.getValue()) {
				this.setValue(this._getTypedInValue());
			}
			return; // override InputBase.onsapescape()
		}

		if (this.getValueLiveUpdate()) {
			// When valueLiveUpdate is true call setProperty to return back the last value.
			this.setProperty("value", this.getLastValue(), true);
		}

		if (InputBase.prototype.onsapescape) {
			InputBase.prototype.onsapescape.apply(this, arguments);
		}
	};

	/**
	 * Keyboard handler for enter key.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapenter = function(oEvent) {
		const bPopupOpened = this._isSuggestionsPopoverOpen();
		const bFocusInPopup = !this.hasStyleClass("sapMFocus") && bPopupOpened;
		const aItems = this._hasTabularSuggestions() ? this.getSuggestionRows() : this.getSuggestionItems();
		const oSuggestionsPopover = this._getSuggestionsPopover();
		const oSelectedItem = oSuggestionsPopover?.getItemsContainer()?.getSelectedItem();
		const oFocusedItem = bFocusInPopup && oSuggestionsPopover.getFocusedListItem();
		const sText = oSelectedItem?.getTitle?.() || oSelectedItem?.getCells?.()[0]?.getText?.() || "";
		const bPendingSuggest = !!this._iSuggestDelay && !sText.toLowerCase().includes(this._getTypedInValue().toLowerCase());
		const bFireSubmit = this.getEnabled() && this.getEditable();
		let iValueLength;

		// when enter is pressed before the timeout of suggestion delay, suggest event is cancelled
		this.cancelPendingSuggest();

		bFocusInPopup && this.setSelectionUpdatedFromList(true);

		// prevent closing of popover, when Enter is pressed on a group header
		if (this._bDoTypeAhead && oFocusedItem && oFocusedItem.isA("sap.m.GroupHeaderListItem")) {
			return;
		}

		if (this._bDoTypeAhead && bPopupOpened && !this.isComposingCharacter() && !bPendingSuggest) {
			if (this._hasTabularSuggestions()) {
				oSelectedItem && this.setSelectionRow(oSelectedItem, true);
			} else {
				oSelectedItem && this.setSelectionItem(ListHelpers.getItemByListItem(aItems, oSelectedItem), true);
			}
		}

		if (bPopupOpened && !this.isComposingCharacter()) {
			this._closeSuggestionPopup();
			iValueLength = this.getDOMValue() ? this.getDOMValue().length : null;
			this.selectText(iValueLength, iValueLength); // Remove text selection
		}

		!bFocusInPopup && InputBase.prototype.onsapenter.apply(this, arguments);

		if (bFireSubmit) {
			this.fireSubmit({value: this.getValue()});
		}

		if (!this.isMobileDevice()) {
			this._resetTypeAhead();
		}
	};

	/**
	 * Keyboard handler for the onFocusLeave event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapfocusleave = function(oEvent) {
		var oSuggPopover = this._getSuggestionsPopover(),
			oPopup = oSuggPopover && oSuggPopover.getPopover(),
			bIsPopover = oPopup && oPopup.isA("sap.m.Popover"),
			oFocusedControl = oEvent.relatedControlId && Element.getElementById(oEvent.relatedControlId),
			oFocusDomRef = oFocusedControl && oFocusedControl.getFocusDomRef(),
			bFocusInPopup = oPopup
				&& oFocusDomRef
				&& containsOrEquals(oPopup.getDomRef(), oFocusDomRef);

		if (bIsPopover) {
			if (bFocusInPopup && !oSuggPopover.getValueStateActiveState()) {
				// set the flag that the focus is currently in the Popup
				this._bPopupHasFocus = true;
				if (Device.system.desktop && deepEqual(oPopup.getFocusDomRef(), oFocusDomRef) || oFocusedControl.isA("sap.m.GroupHeaderListItem")) {
					// force the focus to stay in the Input field when scrollbar
					// is moving
					this.focus();
				}
			} else {
				// When the input still has the value of the last jQuery.val call, a change event has to be
				// fired manually because browser doesn't fire an input event in this case.
				if (this.getDOMValue() === this._sSelectedSuggViaKeyboard) {
					this._sSelectedSuggViaKeyboard = null;
				}
			}
		}

		// Inform InputBase to fire the change event on Input only when focus doesn't go into the suggestion popup
		if (!bFocusInPopup) {
			InputBase.prototype.onsapfocusleave.apply(this, arguments);
		}

		this.bValueHelpRequested = false;

		if (!this._getProposedItemText() || this.isMobileDevice()) {
			return;
		}

		if (this.getShowSuggestion() && this._bAfterOpenFinisihed) {
			// Ensure that the selected item is going to be updated after
			// the closing of the popup when there is a proposed item due
			// to the typeahead, but no direct navigation is performed
			this.setSelectionUpdatedFromList(true);
		} else {
			// Update selections for poweruser -
			// the user has typed and focused out before the popup is opened,
			// but there is a proposed item due to the typeahead
			var oSelectedItem = this.getSuggestionItems()
				.filter(function (oItem) {
					return oItem.getText() === this._getProposedItemText();
				}.bind(this))[0];

			if (oSelectedItem) {
				this.setSelectionItem(oSelectedItem, true);
				this.selectText(0, 0);
			}
		}
	};

	/**
	 * Keyboard handler for the onMouseDown event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onmousedown = function(oEvent) {
		if (this._isSuggestionsPopoverOpen()) {
			oEvent.stopPropagation();
		}
	};

	/**
	 * Handles the <code>sappageup</code>, <code>sappagedown</code>, <code>saphome</code>, <code>sapend</code>,
	 * <code>sapup</code> and <code>sapdown</code> pseudo events when the Page Up/Page Down/Home/End key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	["onsapup", "onsapdown", "onsappageup", "onsappagedown", "onsaphome", "onsapend"].forEach(function(sName){
		Input.prototype[sName] = function (oEvent) {
			if ((sName === "onsapup" || sName === "onsapdown") && this.isComposingCharacter()) {
				return;
			}

			if (this.getShowSuggestion()){
				this._getSuggestionsPopover().handleListNavigation(this, oEvent);

				if (this._isIncrementalType()) {
					oEvent.setMarked();
				}

				this.setSelectionUpdatedFromList(true);
			}
		};
	});

	/**
	 * Determines whether the selection is updated from the list, while navigating.
	 * This is needed, since otherwise a double selection update will be done,
	 * when closing the picker.
	 *
	 * @param {boolean} bUpdated True, if the selection is updated from the list.
	 * @private
	 */
	Input.prototype.setSelectionUpdatedFromList = function (bUpdated) {
		this._bSelectionUpdatedFromList = bUpdated;
	};

	/**
	 * Gets the selection updated from list state.
	 *
	 * @private
	 */
	Input.prototype.getSelectionUpdatedFromList = function () {
		return this._bSelectionUpdatedFromList;
	};

	/**
	 * Updates the selection, when the picker closes and there is selected item/row in the list/table.
	 *
	 * @param {sap.m.StandardListItem | sap.m.ColumnListItem | sap.m.GroupHeaderListItem} oSelectedItem The selected from navigation item
	 * @private
	 */
	Input.prototype.updateSelectionFromList = function (oSelectedItem) {
		if (this._hasTabularSuggestions() && (this.getSelectedRow() !== oSelectedItem)) {
			this.setSelectionRow(oSelectedItem, true);
		} else {
			var oNewItem = ListHelpers.getItemByListItem(this.getSuggestionItems(), oSelectedItem);
			oNewItem && (this.getSelectedItem() !== oNewItem.getId()) && this.setSelectionItem(oNewItem, true);
		}

		this.setSelectionUpdatedFromList(false);
	};

	/**
	 * Removes events from the input.
	 *
	 * @private
	 */
	Input.prototype._deregisterEvents = function() {
		this._deregisterPopupResize();

		if (this.isMobileDevice() && this._getSuggestionsPopover() && this._getSuggestionsPopover().getPopover()) {
			this.$().off("click");
		}
	};

	/**
	 * Update suggestion items.
	 *
	 * @public
	 * @return {this} this Input instance for chaining.
	 */
	Input.prototype.updateSuggestionItems = function() {
		this._bSuspendInvalidate = true;
		this.updateAggregation("suggestionItems");

		if (this.checkMatchingSuggestionItems(this.getValue()) && this._isSuggestionsPopoverOpen()) {
			this._handleTypeAhead(this);
		}

		this._synchronizeSuggestions();
		this._bSuspendInvalidate = false;
		return this;
	};

	/**
	 * Invalidates the control.
	 * @override
	 * @protected
	 */
	Input.prototype.invalidate = function() {
		if (!this._bSuspendInvalidate) {
			InputBase.prototype.invalidate.apply(this, arguments);
		}
	};

	/**
 * Cancels any pending suggestions.
 *
 * @public
 */
	Input.prototype.cancelPendingSuggest = function() {
		if (this._iSuggestDelay) {
			clearTimeout(this._iSuggestDelay);
			this._iSuggestDelay = null;
		}
	};

	/**
	 * Triggers suggestions.
	 *
	 * @private
	 * @param {string} sValue User input.
	 */
	Input.prototype._triggerSuggest = function(sValue) {
		var oList = this._getSuggestionsPopover().getItemsContainer();

		this.cancelPendingSuggest();
		this._bShouldRefreshListItems = true;

		if (!sValue) {
			sValue = "";
		}

		if (sValue.length >= this.getStartSuggestion()) {
			this._iSuggestDelay = setTimeout(function(){

				// when using non ASCII characters the value might be the same as previous
				// don't re populate the suggestion items in this case
				if (this._sPrevSuggValue !== sValue) {

					this._bBindingUpdated = false;
					this.fireSuggest({
						suggestValue: sValue
					});
					// if binding is updated during suggest event, the list items don't need to be refreshed here
					// because they will be refreshed in updateItems function.
					// This solves the popup blinking problem
					if (!this._bBindingUpdated) {
						this._refreshItemsDelayed();
					}

					this._sPrevSuggValue = sValue;
				}
			}.bind(this), 300);
		} else if (this.isMobileDevice()) {
			if (oList instanceof Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				oList.addStyleClass("sapMInputSuggestionTableHidden");
			} else if (oList && oList.destroyItems) {
				oList.destroyItems();
			}
		} else if (this._isSuggestionsPopoverOpen()) {

			// when compose a non ASCII character, in Chrome the value is updated in the next browser tick cycle
			setTimeout(function () {
				var sNewValue = this.getDOMValue() || '';
				if (sNewValue.length < this.getStartSuggestion()) {
					this._closeSuggestionPopup();
				}
			}.bind(this), 0);
		}
	};

	/**
	 * Checks if suggestions should be triggered.
	 *
	 * @private
	 * @returns {boolean} Determines if suggestions should be triggered.
	 */
	Input.prototype._shouldTriggerSuggest = function () {
		return !this._bPopupHasFocus && !this.getStartSuggestion() && !this.getValue() && this.getShowSuggestion();
	};

	/**
	 * Event handler for browsers' <code>change</code> event.
	 *
	 * @since 1.73
	 * @public
	 * @param {jQuery.Event} oEvent The event.
	 */
	Input.prototype.onchange = function (oEvent) {
		if (this.getShowValueHelp() || this.getShowSuggestion() || this.getProperty("effectiveShowClearIcon")) {
			// can not handle browser change if value help or suggestions is enabled
			// because change is fired before the value help is opened or when a link in suggestions is clicked
			return;
		}

		this.onChange(oEvent);
	};

	/**
	 * Event handler for user input.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent User input.
	 */
	Input.prototype.oninput = function (oEvent) {
		InputBase.prototype.oninput.call(this, oEvent);
		if (oEvent.isMarked("invalid")) {
			return;
		}

		var sValue = this.getDOMValue(),
			oSuggestionsPopover,
			oList,
			oSelectedItem;

		if (this.getValueLiveUpdate()) {
			this.setProperty("value", sValue, true);
		}

		this.fireLiveChange({
			value: sValue,
			// backwards compatibility
			newValue: sValue
		});

		// always focus input field when typing in it
		this.addStyleClass("sapMFocus");

		// No need to fire suggest event when suggestion feature isn't enabled or runs on the phone.
		// Because suggest event should only be fired by the input in dialog when runs on the phone.
		if (this.getShowSuggestion() && !this.isMobileDevice()) {
			oSuggestionsPopover = this._getSuggestionsPopover();
			oList = oSuggestionsPopover.getItemsContainer();
			this._triggerSuggest(sValue);

			// If the visual focus is on a selected item, or if it is on a value state containing a link
			if (oList && !oSuggestionsPopover.getValueStateActiveState()) {
				oSelectedItem = oList && oList.getSelectedItem();
				oList.removeStyleClass("sapMListFocus");
				oSelectedItem && oSelectedItem.removeStyleClass("sapMLIBFocused");
			} else if (oSuggestionsPopover.getValueStateActiveState() && document.activeElement.tagName !== "A") {
				oSuggestionsPopover._getValueStateHeader().removeStyleClass("sapMPseudoFocus");
			}
		}

		this._handleTypeAhead(this);
	};

	Input.prototype.onkeydown = function (oEvent) {
		// disable the typeahead feature for android devices due to an issue on android soft keyboard, which always returns keyCode 229
		this._bDoTypeAhead = !Device.os.android && this.getAutocomplete() && (oEvent.which !== KeyCodes.BACKSPACE) && (oEvent.which !== KeyCodes.DELETE);
	};

	Input.prototype.onkeyup = function (oEvent) {
		var sValue = this.getValue();
		var sLastValue = this.getLastValue();
		var bIsNavigationKey = (oEvent.which === KeyCodes.ARROW_DOWN) || (oEvent.which === KeyCodes.ARROW_UP);
		var oSuggestionsPopover, oItemsContainer, oSelectedItem;

		if (!this._bDoTypeAhead && !sValue) {
			this.getShowSuggestion() && this.setSelectedKey(null);
			(sLastValue !== sValue) && this.setLastValue(sLastValue);
		} else if (!this._bDoTypeAhead && !bIsNavigationKey && sValue) {
			oSuggestionsPopover = this.getShowSuggestion() && this._getSuggestionsPopover();
			oItemsContainer = oSuggestionsPopover && oSuggestionsPopover.getItemsContainer();
			oSelectedItem = oItemsContainer && oItemsContainer.getSelectedItem();

			this._setProposedItemText(null);
			if (oSelectedItem) {
				oSelectedItem.setSelected(false);
			}
		}

		this.getShowClearIcon() && this.setProperty("effectiveShowClearIcon", !!sValue);
	};

	/**
	 * Gets the input value.
	 *
	 * @public
	 * @returns {string} Value of the input.
	 */
	Input.prototype.getValue = function () {
		return this.getDomRef("inner") && this._$input ? this.getDOMValue() : this.getProperty("value");
	};

	/**
	 * Refreshes delayed items.
	 *
	 * @private
	 */
	Input.prototype._refreshItemsDelayed = function () {
		clearTimeout(this._iRefreshListTimeout);

		this._iRefreshListTimeout = setTimeout(this._refreshListItems.bind(this), 0);
	};

	/**
	 * Clears the items from the <code>SuggestionsPopover</code>.
	 * For List items destroys, and for tabular ones removes the items.
	 *
	 * @private
	 */
	Input.prototype._clearSuggestionPopupItems = function () {
		var oList = this._getSuggestionsPopover().getItemsContainer();
		if (!oList) {
			return;
		}

		// only destroy items in simple suggestion mode
		if (oList instanceof Table) {
			oList.removeSelections(true);
		} else {
			// TODO: avoid flickering when !bFilter
			oList.destroyItems();
		}
	};

	/**
	 * Hides the <code>SuggestionsPopover</code> and adjusts the corresponding acc
	 * @private
	 */
	Input.prototype._hideSuggestionPopup = function () {
		var oSuggestionsPopover = this._getSuggestionsPopover(),
			oPopup = oSuggestionsPopover.getPopover(),
			oList = oSuggestionsPopover.getItemsContainer();

		// when the input has no value, close the Popup when not runs on the phone because the opened dialog on phone shouldn't be closed.
		if (!this.isMobileDevice()) {
			if (this._isSuggestionsPopoverOpen()) {
				this._sCloseTimer = setTimeout(function () {
					this.cancelPendingSuggest();
					if (this._getTypedInValue()) {
						this.setDOMValue(this._getTypedInValue());
					}
					oPopup.close();
				}.bind(this), 0);
			}
		} else if (this._hasTabularSuggestions() && oList) { // hide table on phone when there are no items to display
			oList.addStyleClass("sapMInputSuggestionTableHidden");
		}

		this.$("inner").removeAttr("aria-activedescendant");
	};

	/**
	 * Opens the <code>SuggestionsPopover</code> and adjusts the corresponding acc
	 *
	 * @param {boolean} bOpenCondition Additional open condition
	 * @private
	 */
	Input.prototype._openSuggestionPopup = function (bOpenCondition) {
		if (!this.isMobileDevice()) {
			if (this._sCloseTimer) {
				clearTimeout(this._sCloseTimer);
				this._sCloseTimer = null;
			}
			if (!this._isSuggestionsPopoverOpen() && !this._sOpenTimer && bOpenCondition !== false && this.getShowSuggestion()) {
				this._sOpenTimer = setTimeout(function () {
					this._sOpenTimer = null;
					this._getSuggestionsPopover() && this._openSuggestionsPopover();
				}.bind(this), 0);
			}
		}
	};

	/**
	 * Applies Suggestion Accessibility
	 *
	 * Adds the aria-desribedby text with the number of available suggestions.
	 *
	 * @param {int} iNumItems
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Input.prototype._applySuggestionAcc = function(iNumItems) {
		var sAriaText = "",
			oRb = this._oRb;

		// Timeout is used because sometimes when we have suggestions
		// that are fetched from the backend and filtered with a delay this function
		// could be called twice - the first time with no available results.
		// In that case the second DOM update of the invisible text element
		// do not occur if it is synchronous. BCP #2070466087
		setTimeout(function () {
			// add items to list
			if (iNumItems === 1) {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_ONE_HIT");
			} else if (iNumItems > 1) {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_MORE_HITS", [iNumItems]);
			} else {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_NO_HIT");
			}

			// update Accessibility text for suggestion
			this._oInvisibleMessage?.announce(sAriaText, CoreLibrary.InvisibleMessageMode.Polite);
		}.bind(this), 0);
	};

	/**
	 * Helper function that refreshes list all items.
	 *
	 * @returns {boolean|null|undefined} false, null or undefined
	 */
	Input.prototype._refreshListItems = function () {
		var bShowSuggestion = this.getShowSuggestion(),
			sTypedChars = this._bDoTypeAhead ? this._getTypedInValue() : (this.getDOMValue() || ""),
			oFilterResults,
			iSuggestionsLength;

		if (!bShowSuggestion ||
			!this._bShouldRefreshListItems ||
			!this.getDomRef() ||
			(!this.isMobileDevice() && !this.$().hasClass("sapMInputFocused"))) {

			return null;
		}

		this._clearSuggestionPopupItems();

		// hide suggestions list/table if the number of characters is smaller than limit
		if (sTypedChars.length < this.getStartSuggestion()) {
			this._hideSuggestionPopup();
			return false;
		}

		oFilterResults = this._getFilteredSuggestionItems(sTypedChars);
		iSuggestionsLength = oFilterResults.items.length;

		var bOpenSuggestionsPopup = iSuggestionsLength > 0;

		if (bOpenSuggestionsPopup) {
			this._openSuggestionPopup(this.getValue().length >= this.getStartSuggestion());
		} else {
			this._hideSuggestionPopup();
		}

		this._applySuggestionAcc(iSuggestionsLength);
	};

	/**
	 * Adds suggestion item.
	 *
	 * @public
	 * @param {sap.ui.core.Item} oItem Suggestion item.
	 * @return {this} this Input instance for chaining.
	 */
	Input.prototype.addSuggestionItem = function (oItem) {
		this.addAggregation("suggestionItems", oItem, true);

		this._synchronizeSuggestions();
		this._createSuggestionPopupContent();

		return this;
	};

	Input.prototype.updateSuggestionRows = function () {
		this._bSuspendInvalidate = true;
		this.updateAggregation("suggestionRows");
		this._synchronizeSuggestions();

		if (this.checkMatchingTabularSuggestionItems(this.getValue()) && this._isSuggestionsPopoverOpen()) {
			this._handleTypeAhead(this);
		}

		this._bSuspendInvalidate = false;
		return this;
	};

	/**
	 * Inserts suggestion item.
	 *
	 * @public
	 * @param {sap.ui.core.Item} oItem Suggestion item.
	 * @param {int} iIndex Index to be inserted.
	 * @returns {this} this Input instance for chaining.
	 */
	Input.prototype.insertSuggestionItem = function (oItem, iIndex) {
		this.insertAggregation("suggestionItems", iIndex, oItem, true);

		this._synchronizeSuggestions();
		this._createSuggestionPopupContent();

		return this;
	};

	/**
	 * Removes suggestion item.
	 *
	 * @public
	 * @param {sap.ui.core.Item} oItem Suggestion item.
	 * @returns {boolean} Determines whether the suggestion item has been removed.
	 */
	Input.prototype.removeSuggestionItem = function (oItem) {
		var res = this.removeAggregation("suggestionItems", oItem, true);
		this._synchronizeSuggestions();
		return res;
	};

	/**
	 * Removes all suggestion items.
	 *
	 * @public
	 * @returns {boolean} Determines whether the suggestion items are removed.
	 */
	Input.prototype.removeAllSuggestionItems = function () {
		var res = this.removeAllAggregation("suggestionItems", true);
		this._synchronizeSuggestions();
		return res;
	};

	/**
	 * Destroys suggestion items.
	 *
	 * @public
	 * @return {this} this Input instance for chaining.
	 */
	Input.prototype.destroySuggestionItems = function () {
		this.destroyAggregation("suggestionItems", true);
		this._synchronizeSuggestions();
		return this;
	};

	Input.prototype.bindAggregation = function () {
		if (arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns" || arguments[0] === "suggestionItems") {
			this._createSuggestionPopupContent(arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns");
			this._bBindingUpdated = true;
		}
		return InputBase.prototype.bindAggregation.apply(this, arguments);
	};

	/**
	 * Closes suggestion popup.
	 *
	 * @private
	 */
	Input.prototype._closeSuggestionPopup = function () {

		this._bShouldRefreshListItems = false;
		this.cancelPendingSuggest();
		this._isSuggestionsPopoverOpen() && this._getSuggestionsPopover().getPopover().close();

		// Ensure the valueStateMessage is opened after the suggestion popup is closed.
		// Only do this for desktop (not required for mobile) when the focus is on the input.
		if (!this.isMobileDevice() && this.$().hasClass("sapMInputFocused")) {
			this.openValueStateMessage();
		}
		this.$("inner").removeAttr("aria-activedescendant");

		this._sPrevSuggValue = null;
	};

	/**
	 * Synchronize the displayed suggestion items and sets the correct selectedItem/selectedRow
	 * @private
	 */
	Input.prototype._synchronizeSuggestions = function () {
		var oSuggestionsPopover = this._getSuggestionsPopover(),
			oPopupInput = oSuggestionsPopover && oSuggestionsPopover.getInput(),
			oPopupInputDomRef = oPopupInput && oPopupInput.getFocusDomRef();

		// Trigger the ListItems refresh only when the focus is on the input field or the device is phone.
		// In all other cases this instantiates list population and it might not be needed at all.
		if (document.activeElement === this.getFocusDomRef() || document.activeElement === oPopupInputDomRef) {
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
		}

		if (!this.getDomRef() || this._isSuggestionsPopoverOpen()) {
			return;
		}

		this._synchronizeSelection();
	};

	/**
	 * Synchronizes the selectedItem/selectedRow, depending on the selectedKey
	 * @private
	 */
	Input.prototype._synchronizeSelection = function () {
		var sSelectedKey = this.getSelectedKey();
		if (!sSelectedKey) {
			return;
		}

		if (this.getValue() && !this.getSelectedItem() && !this.getSelectedRow()) {
			return;
		}

		this.setSelectedKey(sSelectedKey);
	};

	/**
	 * Event handler for the onFocusIn event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent On focus in event.
	 */
	Input.prototype.onfocusin = function(oEvent) {
		InputBase.prototype.onfocusin.apply(this, arguments);
		this.addStyleClass("sapMInputFocused");

		// Close the ValueStateMessage when the suggestion popup is being opened.
		// Only do this in case a popup is used.
		if (!this.isMobileDevice() && this._isSuggestionsPopoverOpen()) {
			this.closeValueStateMessage();
		}

		// fires suggest event when startSuggestion is set to 0 and input has no text
		if (this._shouldTriggerSuggest()) {
			this._triggerSuggest(this.getValue());
		}
		this._bPopupHasFocus = undefined;

		this._sPrevSuggValue = null;
	};

	/**
	 * Called when the composition of a passage of text has been completed or cancelled.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	Input.prototype.oncompositionend = function (oEvent) {
		InputBase.prototype.oncompositionend.apply(this, arguments);

		if (!Device.browser.firefox) {
			this._handleTypeAhead(this);
		}
	};

	/**
	 * We check both the main and the inner (mobile) input for stored typeahead information
	 * as the _handleTypeAhead could be called in both contexts depending on the different cases.
	 *
	 * For example when we have delayed (dynamically) loaded items on mobile devices the typeahead
	 * information is stored on the inner dialog's input on user interaction, but when the items
	 * are updated it is async and the typeahead is handled by the main sap.m.Input instance
	 *
	 * @param {sap.m.Input} oInput Input's instance to which the type ahead would be applied. For example: this OR Dialog's Input instance.
	 * @returns {null|boolean} Should type-ahead be performed or null if no type-ahead info is available.
	 * @private
	 */
	Input.prototype._getEffectiveTypeAhead = function () {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		var oPopupInput = oSuggestionsPopover && oSuggestionsPopover.getInput();

		if (!this.isMobileDevice() || this._bDoTypeAhead !== null) {
			return this._bDoTypeAhead && document.activeElement === this.getFocusDomRef();
		}

		return oPopupInput._bDoTypeAhead && (!!oPopupInput && document.activeElement === oPopupInput.getFocusDomRef());
	};

	/**
	 * Handles Input's specific type ahead logic.
	 *
	 * @param {sap.m.Input} oInput Input's instance to which the type ahead would be applied. For example: this OR Dialog's Input instance.
	 * @returns {null|object} Map object containing type-ahead info or null if no type-ahead is performed.
	 * @private
	 */
	Input.prototype._handleTypeAhead = function (oInput) {
		var sValue = this.getValue();
		var oDomRef = oInput.getFocusDomRef();
		var mTypeAheadInfo = {
			value: "",
			selectedItem: null
		};
		var oListDelegate;
		var oList = oInput._getSuggestionsPopover() && oInput._getSuggestionsPopover().getItemsContainer();
		var bDoTypeAhead = this._getEffectiveTypeAhead();

		if (oDomRef.selectionStart !== oDomRef.selectionEnd) {
			this._setTypedInValue(oDomRef.value.substring(0, oDomRef.selectionStart));
		} else {
			this._setTypedInValue(oDomRef.value);
		}

		// check if typeahead is already performed
		if ((oInput && oInput.getValue().toLowerCase()) === (this._getProposedItemText() && this._getProposedItemText().toLowerCase())) {
			return;
		}

		oInput._setProposedItemText(null);

		const bExactMatch = this._hasTabularSuggestions() ? this.checkMatchingTabularSuggestionItems(sValue) : this.checkMatchingSuggestionItems(sValue);

		if (!bDoTypeAhead && !bExactMatch) {
			return;
		}

		var bHasTabularSuggestions = oInput._hasTabularSuggestions(),
			aItems = bHasTabularSuggestions ? oInput.getSuggestionRows() : oInput.getSuggestionItems(),
			fnExtractText = function (oItem) {
				if (!oItem) {
					return "";
				}
				return bHasTabularSuggestions ? oInput._getRowResultFunction()(oItem) : oItem.getText();
			};

		// If there are no items yet - perform the type-ahead on a later stage.
		// Attach a listener to the list for when they are available, in case they are being dynamically loaded.
		if (this.isMobileDevice() && oList && !aItems.length) {
			oListDelegate = {
				onBeforeRendering: function() {
					if (oList.getItems().length) {
						this._handleTypeAhead(oInput);
					}
				},
				onAfterRendering: function() {
					if (oList.getItems().length) {
						oList.removeDelegate(oListDelegate);
					}
				}
			};
			oList.addDelegate(oListDelegate, this);

			return;
		}

		var aItemsToSelect = typeAhead(sValue, this, aItems, function (oItem) {
			return this._formatTypedAheadValue(fnExtractText(oItem));
		}.bind(this));

		mTypeAheadInfo.value = fnExtractText(aItemsToSelect[0]);
		mTypeAheadInfo.selectedItem = aItemsToSelect[0];

		oInput._setProposedItemText(mTypeAheadInfo.value);

		// This method could be called multiple times in cases when the items are loaded with delay (dynamically)
		// and also in the context of the dialog's inner input when on mobile so we have to keep the typeahead info
		this._mTypeAheadInfo = mTypeAheadInfo;

		return mTypeAheadInfo;
	};

	/**
	 * Resets properties, that are related to type ahead, to their initial state.
	 *
	 * @param oInput {sap.m.Input} The _sProposedItemText property is always attached to the "root" input and the one in the Dialog should consider root's property.
	 * @private
	 */
	Input.prototype._resetTypeAhead = function (oInput) {
		oInput = oInput || this;

		oInput._setProposedItemText(null);
		this._setTypedInValue('');
	};

	/**
	 * Finalizes autocomplete and fires liveChange event eventually.
	 *
	 * @protected
	 * @override
	 */
	Input.prototype.onsapright = function () {
		var sValue = this.getValue(),
			oDomRef = this.getFocusDomRef();

		if (!this.getAutocomplete()) {
			return;
		}

		if (!this._getTypedInValue().length) {
			return;
		}

		if (this._getTypedInValue() !== sValue) {
			this._setTypedInValue(oDomRef.value.substring(0, oDomRef.selectionStart));

			this.fireLiveChange({
				value: sValue,
				// backwards compatibility
				newValue: sValue
			});
		}
	};

	/**
	 * Formats the input value
	 * in a way that it preserves character casings typed by the user
	 * and appends suggested value with casings as they are in the
	 * corresponding suggestion item.
	 *
	 * @private
	 * @param {string} sNewValue Value which will be formatted.
	 * @returns {string} The new formatted value.
	 */
	Input.prototype._formatTypedAheadValue = function (sNewValue) {
		var sTypedInValue = this._getTypedInValue();
		if (sNewValue.toLowerCase().indexOf(sTypedInValue.toLowerCase()) === 0) {
			return sTypedInValue.concat(sNewValue.substring(sTypedInValue.length, sNewValue.length));
		} else {
			return sNewValue;
		}
	};

	/**
	 * Register F4 to trigger the valueHelpRequest event
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapshow = function (oEvent) {
		if (!this.getEnabled() || !this.getEditable() || !this.getShowValueHelp()) {
			return;
		}

		this.bValueHelpRequested = true;
		this._fireValueHelpRequest(false, true);
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Input.prototype.onsaphide = Input.prototype.onsapshow;

	/**
	 * Event handler for the onFocusOut event.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onfocusout = function (oEvent) {
		InputBase.prototype.onfocusout.apply(this, arguments);
		this.removeStyleClass("sapMInputFocused");
	};

	/**
	 * Check for tabular suggestions in the input.
	 *
	 * @private
	 * @returns {boolean} Determines if the Input has tabular suggestions.
	 */
	Input.prototype._hasTabularSuggestions = function() {
		return !!(this.getAggregation("suggestionColumns") && this.getAggregation("suggestionColumns").length);
	};

	/**
	 * Gets suggestion table with lazy loading.
	 *
	 * @private
	 * @returns {sap.m.Table|null} Suggestion table or <code>null</code> in case the control is currently being destroyed.
	 */
	Input.prototype._getSuggestionsTable = function () {
		// this._bIsBeingDestroyed was added here, as if the Input is in process of destruction
		// and there is no suggestions table created, there is no need to create one.
		// In case there was suggestions table present, it was already destroyed by the 'exit' method.
		if (this._bIsBeingDestroyed) {
			return null;
		}

		if (!this._oSuggestionsTable) {
			this._oSuggestionsTable = this._createSuggestionsTable();
		}

		return this._oSuggestionsTable;
	};

	Input.prototype._destroySuggestionsTable = function () {
		if (this._oSuggestionsTable) {
			this._oSuggestionsTable.destroy();
			this._oSuggestionsTable = null;
		}
	};

	/**
	 * Creates the suggestions table
	 *
	 * @private
	 * @returns {sap.m.Table} The newly created suggestions table.
	 */
	Input.prototype._createSuggestionsTable = function () {
		var oTableObserver;
		var oSuggestionsTable = new Table(this.getId() + "-popup-table", {
			mode: ListMode.SingleSelectMaster,
			showNoData: false,
			showSeparators: this.getProperty("separateSuggestions") ? ListSeparators.Inner : ListSeparators.None,
			width: "100%",
			enableBusyIndicator: false,
			rememberSelections : false,
			itemPress: function (oEvent) {
				if (Device.system.desktop) {
					this.focus();
				}
				var oSelectedListItem = oEvent.getParameter("listItem");
				this.setSelectionRow(oSelectedListItem, true);
			}.bind(this),
			sticky: [library.Sticky.ColumnHeaders]
		});

		oSuggestionsTable.addEventDelegate({
			onAfterRendering: function () {
				var aTableCellsDomRef;

				if (!this.getEnableSuggestionsHighlighting()) {
					return;
				}

				aTableCellsDomRef = oSuggestionsTable.$().find('tbody .sapMText, tbody .sapMLabel');

				highlightDOMElements(aTableCellsDomRef, this._getTypedInValue());
			}
		}, this);

		// initially hide the table on phone
		if (this.isMobileDevice()) {
			oSuggestionsTable.addStyleClass("sapMInputSuggestionTableHidden");
		}

		oSuggestionsTable.updateItems = function() {
			Table.prototype.updateItems.apply(this, arguments);
			this._refreshItemsDelayed();
			return this;
		};

		oTableObserver = new ManagedObjectObserver(function (oChange) {
			var sMutation = oChange.mutation;
			var vItem = oChange.child;
			var bSuggestionRow = oChange.name === "items";

			switch (sMutation) {
				case "insert":
					if (bSuggestionRow) {
						vItem.setType(ListType.Active);
						this._createSuggestionPopupContent(true);
						this._synchronizeSuggestions();
					}
					break;
				case "remove":
					if (bSuggestionRow) {
						this._synchronizeSuggestions();
					}
					break;
				default:
					break;
			}
		}.bind(this));

		oTableObserver.observe(oSuggestionsTable, {
			aggregations: ["items", "columns"]
		});

		return oSuggestionsTable;
	};

	/**
	 * Clones input.
	 *
	 * @public
	 * @returns {this} Cloned input.
	 */
	Input.prototype.clone = function() {
		var oInputClone = InputBase.prototype.clone.apply(this, arguments);

		oInputClone.setRowResultFunction(this._fnRowResultFilter);

		// because of the "selectedKey", the input value can be reset,
		// make sure it is the same as the original
		oInputClone.setValue(this.getValue());

		return oInputClone;
	};

	/* =========================================================== */
	/*           end: forward aggregation methods to table         */
	/* =========================================================== */

	/**
	 * Setter for property <code>value</code>.
	 *
	 * Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sValue New value for property <code>value</code>.
	 * @return {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	Input.prototype.setValue = function(sValue) {
		this._iSetCount++;
		InputBase.prototype.setValue.call(this, sValue);
		this._onValueUpdated(sValue);
		this._setTypedInValue("");

		this.setProperty("effectiveShowClearIcon", !!sValue);

		return this;
	};

	/**
	 * Sets the inner input DOM value.
	 *
	 * @protected
	 * @param {string} value Dom value which will be set.
	 */
	Input.prototype.setDOMValue = function(value) {
		this._$input.val(value);
	};

	/**
	 * Gets the inner input DOM value.
	 *
	 * @protected
	 * @returns {any} The value of the input.
	 */
	Input.prototype.getDOMValue = function() {
		return this._$input.val();
	};

	Input.prototype._getInputValue = function() {
		var sValue = InputBase.prototype._getInputValue.apply(this, arguments);

		return sValue;
	};

	/**
	 * Updates the inner input field.
	 *
	 * @param {string} sNewValue Dom value which will be set.
	 * @protected
	 */
	Input.prototype.updateInputField = function(sNewValue) {
		if (this.isMobileDevice() && this._isSuggestionsPopoverOpen()) {
			this.updateInputFieldOnMobile(sNewValue);
		} else {
			this.updateInputFieldOnDesktop(sNewValue);
		}
	};

	Input.prototype.updateInputFieldOnMobile = function(sNewValue) {
		this._getSuggestionsPopover().getInput()
			.setValue(sNewValue)
			._doSelect();
	};

	Input.prototype.updateInputFieldOnDesktop = function(sNewValue) {
		// call _getInputValue to apply the maxLength to the typed value
		sNewValue = this._getInputValue(sNewValue);

		if (sNewValue !== this.getValue() && sNewValue === this.getLastValue()) {
			this.setProperty("value", sNewValue);
		}

		this.setDOMValue(sNewValue);
		this.onChange(null, null, sNewValue);
	};
	/**
	 * Gets accessibility information for the input.
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {sap.ui.core.AccessibilityInfo} Accessibility information.
	 */
	Input.prototype.getAccessibilityInfo = function() {
		var oInfo = InputBase.prototype.getAccessibilityInfo.apply(this, arguments);

		oInfo.description = ((oInfo.description || "") + " " + this.getDescription()).trim();
		return oInfo;
	};

	/**
	 * Getter for property <code>valueStateText</code>.
	 * The text which is shown in the value state message popup. If not specfied a default text is shown. This property is already available for sap.m.Input since 1.16.0.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>valueStateText</code>
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#getValueStateText
	 * @function
	 */

	/**
	 * Setter for property <code>valueStateText</code>.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @param {string} sValueStateText new value for property <code>valueStateText</code>
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#setValueStateText
	 * @function
	 */

	/**
	 * Getter for property <code>showValueStateMessage</code>.
	 * Whether the value state message should be shown. This property is already available for sap.m.Input since 1.16.0.
	 *
	 * Default value is <code>true</code>
	 *
	 * @return {boolean} the value of property <code>showValueStateMessage</code>
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#getShowValueStateMessage
	 * @function
	 */

	/**
	 * Setter for property <code>showValueStateMessage</code>.
	 *
	 * Default value is <code>true</code>
	 *
	 * @param {boolean} bShowValueStateMessage  new value for property <code>showValueStateMessage</code>
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.16
	 * @name sap.m.Input#setShowValueStateMessage
	 * @function
	 */

	/**
	 * Hook method to prevent the change event from being fired when the text input field loses focus.
	 *
	 * @param {jQuery.Event} [oEvent] The event object.
	 * @returns {boolean} Whether or not the change event should be prevented.
	 * @protected
	 * @since 1.46
	 */
	Input.prototype.preventChangeOnFocusLeave = function(oEvent) {
		return this.bFocusoutDueRendering || this.bValueHelpRequested;
	};

	/**
	 * Gets show more button from SuggestionsPopover's Popover/Dialog.
	 *
	 * @private
	 * @return {sap.m.Button} Show more button.
	 */
	Input.prototype._getShowMoreButton = function() {
		return this._getSuggestionsPopover().getShowMoreButton();
	};

	/**
	 * Show more button press handler.
	 *
	 * @private
	 */
	Input.prototype._getShowMoreButtonPress = function() {
		var sTempTypedInValue,
			sTypedInValue = this._getTypedInValue();

		if (this.getShowTableSuggestionValueHelp()) {

			// request for value help interrupts autocomplete
			if (sTypedInValue) {
				sTempTypedInValue = sTypedInValue;
				this.updateDomValue(sTempTypedInValue);
				this._resetTypeAhead();
				// Resetting the Suggestions popover clears the typed in value.
				// However, we need to keep it in this case as the fireValueHelpRequest will need to pass this information.
				this._setTypedInValue(sTempTypedInValue);
			}

			this._fireValueHelpRequest(true, false);
			this._closeSuggestionPopup();
		}
	};

	/**
	 * Adds a show more button to the footer of the tabular suggestion popup/dialog.
	 *
	 * @private
	 * @param{boolean} [bTabular] optional parameter to force override the tabular suggestions check
	 */
	Input.prototype._addShowMoreButton = function() {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		var oPopup = oSuggestionsPopover && oSuggestionsPopover.getPopover();

		if (!oPopup || !this._hasTabularSuggestions() || this._getShowMoreButton()) {
			return;
		}

		var oShowMoreButton = new Button({
			text : this._oRb.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
			press : this._getShowMoreButtonPress.bind(this)
		});

		if (oPopup.isA("sap.m.Dialog")) {
			oSuggestionsPopover.setShowMoreButton(oShowMoreButton);
		} else {
			oSuggestionsPopover.setShowMoreButton(new Toolbar({
				content: [new ToolbarSpacer(), oShowMoreButton]
			}));
		}
	};

	/**
	 * Removes the show more button from the footer of the tabular suggestion popup/dialog.
	 *
	 * @private
	 */
	Input.prototype._removeShowMoreButton = function() {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		var oPopup = oSuggestionsPopover && oSuggestionsPopover.getPopover();

		if (oPopup && this._hasTabularSuggestions() && this._getShowMoreButton()) {
			oSuggestionsPopover.removeShowMoreButton();
		}
	};

	Input.prototype._hasShowSelectedButton = function () {return false;};

	/**
	 * Helper function that creates content for the suggestion popup.
	 *
	 * @param {boolean} bTabular Determines whether the popup content is a table or a list.
	 * @private
	 */
	Input.prototype._createSuggestionPopupContent = function (bTabular) {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		var oItemsContainer = oSuggestionsPopover.getItemsContainer();

		// After rebinding where the ListItems are replaced with Table rows and vice versa,
		// it's mandatory to destroy the underlying container and rebuild it anew.
		if (oItemsContainer &&
			((oItemsContainer.isA("sap.m.Table") && !bTabular) || (oItemsContainer.isA("sap.m.List") && bTabular))) {

			oItemsContainer.destroy();
			oItemsContainer = null;
			this._destroySuggestionsTable();
		}

		// only initialize the content once
		if (this._bIsBeingDestroyed || !oSuggestionsPopover || oItemsContainer) {
			return;
		}

		oSuggestionsPopover.initContent(this.getId(), bTabular ? this._getSuggestionsTable() : null);

		if (!this._hasTabularSuggestions() && !bTabular) {
			this._decorateSuggestionsPopoverList(oSuggestionsPopover.getItemsContainer());
		} else {
			this._decorateSuggestionsPopoverTable();
		}
	};

	/**
	 * Decorates SuggestionsPopover list.
	 *
	 * @param oList {sap.m.List}
	 * @private
	 */
	Input.prototype._decorateSuggestionsPopoverList = function (oList) {
		if (!oList || !oList.isA("sap.m.List")) {
			return;
		}
		oList.addEventDelegate({
			onAfterRendering: function () {
				var aListItemsDomRef, sInputValue;

				if (!this.getEnableSuggestionsHighlighting()) {
					return;
				}

				aListItemsDomRef = oList.$().find('.sapMSLIInfo [id$=-infoText], .sapMSLITitleOnly [id$=-titleText]');
				sInputValue = this._bDoTypeAhead ? this._getTypedInValue() : this.getValue();
				sInputValue = (sInputValue || "").toLowerCase();

				highlightDOMElements(aListItemsDomRef, sInputValue);
			}
		}, this);

		oList.attachItemPress(function (oEvent) {
			if (Device.system.desktop) {
				this.focus();
			}
			var oListItem = oEvent.getParameter("listItem");

			if (!oListItem.isA("sap.m.GroupHeaderListItem")) {
				this.setSelectionItem(ListHelpers.getItemByListItem(this.getSuggestionItems(), oListItem), true);
			}
		}, this);
	};

	/**
	 * Decorates SuggestionsPopover table and makes adjustments to the formatting functions.
	 *
	 * @private
	 */
	Input.prototype._decorateSuggestionsPopoverTable = function () {

		if (this.getShowTableSuggestionValueHelp()) {
			this._addShowMoreButton();
		}
	};

	/**
	 * Modifies Dialog's Input instance
	 *
	 * @param oInput {sap.m.Input}
	 * @returns {sap.m.Input}
	 * @private
	 * @ui5-restricted
	 */
	Input.prototype._decoratePopupInput = function (oInput) {
		if (!oInput) {
			return;
		}

		oInput.setValueLiveUpdate(true);
		oInput.setValueState(this.getValueState());
		oInput.setShowValueHelp(this.getShowValueHelp());

		oInput.attachValueHelpRequest(function () {
			// it is the same behavior as by ShowMoreButton:
			this.fireValueHelpRequest({fromSuggestions: true});
			this._getSuggestionsPopover().iPopupListSelectedIndex = -1;
			this._closeSuggestionPopup();
		}.bind(this));

		oInput.attachLiveChange(function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			// call _getInputValue to apply the maxLength to the typed value
			this.setDOMValue(this._getInputValue(this._getSuggestionsPopover().getInput().getValue()));

			this._triggerSuggest(sValue);

			// make sure the live change handler on the original input is also called
			this.fireLiveChange({
				value: sValue,

				// backwards compatibility
				newValue: sValue
			});
		}.bind(this));

		oInput._handleTypeAhead = function () {
			Input.prototype._handleTypeAhead.call(oInput, this);
		}.bind(this);

		oInput._resetTypeAhead = function () {
			Input.prototype._resetTypeAhead.call(oInput, this);
		}.bind(this);

		oInput.addEventDelegate({
			onsapenter: function () {
				this.setValue(this._getProposedItemText());
			}
		}, this);

		return oInput;
	};

	Input.prototype.forwardEventHandlersToSuggPopover = function (oSuggPopover) {
		oSuggPopover.setOkPressHandler(this._closeSuggestionPopup.bind(this));
		oSuggPopover.setCancelPressHandler(this._revertPopupSelection.bind(this));
	};


	Input.prototype._revertPopupSelection = function () {
		var oSuggestionPopover = this._getSuggestionsPopover(),
			oPopupInput = oSuggestionPopover && oSuggestionPopover.getInput();

		this._setProposedItemText(null);
		this.setSelectionUpdatedFromList(false);

		// revert the typed in value on mobile to prevent change on close
		if (this.isMobileDevice()) {
			oPopupInput && oPopupInput.setDOMValue(this.getLastValue());
		}

		this._closeSuggestionPopup();
	};

	/**
	 * Lazily retrieves the <code>SuggestionsPopover</code>.
	 *
	 * @returns {sap.m.SuggestionsPopover} A suggestion popover instance.
	 * @private
	 */
	Input.prototype._getSuggestionsPopover = function () {
		return this._oSuggPopover;
	};

	Input.prototype._createSuggestionsPopover = function () {
		var oSuggPopover = this._oSuggPopover = new SuggestionsPopover(this);

		oSuggPopover.decorateParent(this);
		oSuggPopover.setInputLabels(this.getLabels.bind(this));
		this._createSuggestionsPopoverPopup();

		this.forwardEventHandlersToSuggPopover(oSuggPopover);

		oSuggPopover.attachEvent(SuggestionsPopover.M_EVENTS.SELECTION_CHANGE, function (oEvent) {
			var oItem = oEvent.getParameter("newItem"),
				sNewValue = this.calculateNewValue(oItem),
				bIsGroupItem = oItem && oItem.isA("sap.m.GroupHeaderListItem"),
				oFocusDomRef = this.getFocusDomRef(),
				sTypedValue = oFocusDomRef && oFocusDomRef.value.substring(0, oFocusDomRef.selectionStart),
				oPreviousItem = oEvent.getParameter("previousItem"),
				bPreviosFocusOnGroup = oPreviousItem && oPreviousItem.isA("sap.m.GroupHeaderListItem"),
				iSelectionStart = calculateSelectionStart(selectionRange(oFocusDomRef, bPreviosFocusOnGroup), sNewValue, sTypedValue, bPreviosFocusOnGroup);

			if (!oItem || bIsGroupItem) { // When out of the list or a GroupHeader item, reset to user's input
				this.setDOMValue(sTypedValue);
			} else { // Replace the value and highlight it
				this.setDOMValue(sNewValue);

				// If the matched item starts with user input's value, highlight only the remaining part. Otherwise, the whole item.
				iSelectionStart = (iSelectionStart === 0 && sNewValue.indexOf(sTypedValue) === 0) ? sTypedValue.length : iSelectionStart;
				this._doSelect(iSelectionStart);
			}

			// memorize the value set by calling jQuery.val, because browser doesn't fire a change event when the value is set programmatically.
			this._sSelectedSuggViaKeyboard = sNewValue;
		}, this);

		if (this.getShowTableSuggestionValueHelp()) {
			this._addShowMoreButton();
		}

		return this._oSuggPopover;
	};

	/**
	 * Calculates the correct input value to be applied, depending on the newly selected suggestion.
	 *
	 * @param {sap.m.GroupHeaderListItem | sap.m.StandardListItem | sap.m.ColumnListItem} oListItem The selected item
	 * @returns {string} The input value to be applied
	 * @private
	 */
	Input.prototype.calculateNewValue = function (oListItem) {
		if (!oListItem || (oListItem && oListItem.isA("sap.m.GroupHeaderListItem"))) {
			return "";
		}

		if (oListItem.isA("sap.m.ColumnListItem")) {
			return this._getInputValue(this._getRowResultFunction()(oListItem));
		}

		if (oListItem.isA("sap.m.StandardListItem")) {
			return this._getInputValue(oListItem.getTitle());
		}
	};

	/**
	 * Creates a suggestion popover popup.
	 *
	 * @private
	 */
	Input.prototype._createSuggestionsPopoverPopup = function () {
		var oSuggPopover = this._getSuggestionsPopover();
		var oPopover;
		oSuggPopover.createSuggestionPopup(this, { showSelectedButton: this._hasShowSelectedButton() }, Input);
		this._decoratePopupInput(oSuggPopover.getInput());

		oPopover = oSuggPopover.getPopover();
		oPopover.attachBeforeOpen(function () {
			this.closeValueStateMessage();
			this._updateSuggestionsPopoverValueState();
		}, this);

		oPopover.attachBeforeClose(function () {
			this._updateSuggestionsPopoverValueState();
		}, this);

		oPopover.attachAfterOpen(function () {
			var mTypeAheadInfo;
			var oSuggPopover = this.getShowSuggestion() && this._getSuggestionsPopover();
			var oList = oSuggPopover && oSuggPopover.getItemsContainer();
			var oItemToBeSelected;

			mTypeAheadInfo = this._handleTypeAhead(this);

			// In case the items were provided on a later stage and the type-ahead was called
			// when the items were refreshed, there will be no selected item / row in the list,
			// no matter that we use the first matching item to auto-complete the user's input.
			// This will, later on, result in no item being added in the selectedItem/Row association.
			// Here we need to make sure that the first item (which's text was already used) is indeed selected.
			if (!(this._getProposedItemText() && oList && !oList.getSelectedItem() && mTypeAheadInfo && mTypeAheadInfo.selectedItem)) {
				return;
			}

			oItemToBeSelected = this._hasTabularSuggestions() ? mTypeAheadInfo.selectedItem : ListHelpers.getListItem(mTypeAheadInfo.selectedItem);
			oItemToBeSelected.setSelected(true);
			this.setSelectionUpdatedFromList(true);
		}, this);

		if (this.isMobileDevice()) {
			oPopover
				.attachBeforeClose(function () {
					// call _getInputValue to apply the maxLength to the typed value
					this.setDOMValue(this
						._getInputValue(oSuggPopover.getInput()
							.getValue()));
					this.onChange();
				}, this)
				.attachAfterClose(function() {
					var oList = oSuggPopover.getItemsContainer();

					if (!oList) {
						return;
					}

					var oSelectedItem = oList && oList.getSelectedItem();

					if (this._getProposedItemText() && oSelectedItem) {
						this.setSelectionUpdatedFromList(true);
					}

					if (this.getSelectionUpdatedFromList()) {
						this.updateSelectionFromList(oSelectedItem);
					}

					if (Table && !(oList instanceof Table)) {
						oList.destroyItems();
					} else {
						oList.removeSelections(true);
					}
				}, this)
				.attachAfterOpen(function () {
					this._triggerSuggest(this.getValue());
					this._refreshListItems();
				}, this)
				.attachBeforeOpen(function() {
						var oSuggestionsInput = oSuggPopover.getInput();
					// set the same placeholder and maxLength as the original input
					["placeholder",
						"maxLength",
						"value",
						"showClearIcon",
						"effectiveShowClearIcon"
					].forEach(function(sPropName) {
						oSuggestionsInput.setProperty(sPropName, this.getProperty(sPropName));
					}, this);
				}, this);
		} else {
			oPopover
				.attachAfterClose(function() {
					const oList = oSuggPopover.getItemsContainer();
					const oDomRef = this.getDomRef();
					const oSuggestionsPopover = this._getSuggestionsPopover();
					const oSelectedItem = oSuggestionsPopover?.getItemsContainer()?.getSelectedItem();
					const sText = oSelectedItem?.getTitle?.() || oSelectedItem?.getCells?.()[0]?.getText?.() || "";
					const bPendingSuggest = !!this._iSuggestDelay && !sText.toLowerCase().includes(this.getValue().toLowerCase());

					if (bPendingSuggest) {
						return;
					}

					if (this.getSelectionUpdatedFromList()) {
						this.updateSelectionFromList(oSelectedItem);
					}

					if (!oList) {
						return;
					}

					this._bAfterOpenFinisihed = false;

					// only destroy items in simple suggestion mode
					if (oList instanceof Table) {
						oSelectedItem?.removeStyleClass("sapMLIBFocused");
						oList.removeSelections(true);
					} else {
						oList.destroyItems();
					}

					this._deregisterPopupResize();

					if (oDomRef && oDomRef.contains(document.activeElement)) {
						this.addStyleClass("sapMFocus");
					}
				}, this)
				.attachBeforeOpen(function () {
					oSuggPopover._sPopoverContentWidth = this.getMaxSuggestionWidth();

					oSuggPopover.resizePopup(this);
					this._registerPopupResize();
					this._bAfterOpenFinisihed = false;
				}, this);

			oPopover.addEventDelegate({
				onAfterRendering: function() {
					var iInputWidth = this.getDomRef().getBoundingClientRect().width;
					var sPopoverMaxWidth = getComputedStyle(this.getDomRef()).getPropertyValue("--sPopoverMaxWidth");

					this._bAfterOpenFinisihed = true;

					if (this.getMaxSuggestionWidth()) {
						return;
					}

					if (iInputWidth <= parseInt(sPopoverMaxWidth) && !Device.system.phone) {
						oSuggPopover.getPopover().addStyleClass("sapMSuggestionPopoverDefaultWidth");
					} else {
						oSuggPopover.getPopover().getDomRef().style.setProperty("max-width", iInputWidth + "px");
						oSuggPopover.getPopover().addStyleClass("sapMSuggestionPopoverInputWidth");

					}

					oSuggPopover.getPopover().getDomRef().style.setProperty("min-width", iInputWidth + "px");

				}
			}, this);
		}

		// add popup to a hidden aggregation to also propagate the model and bindings to the content of the popover
		this.setAggregation("_suggestionPopup", oPopover);

		this._oSuggestionPopup = oPopover; // for backward compatibility (used in some other controls)
	};

	/**
	 * Registers Popover resize handler
	 *
	 * @private
	 */
	Input.prototype._registerPopupResize = function () {
		var oSuggestionsPopover = this._getSuggestionsPopover();
		this._sPopupResizeHandler = ResizeHandler.register(this, oSuggestionsPopover.resizePopup.bind(oSuggestionsPopover, this));
	};

	/**
	 * Removes Popover's resize handler
	 *
	 * @private
	 */
	Input.prototype._deregisterPopupResize = function () {
		if (this._sPopupResizeHandler) {
			this._sPopupResizeHandler = ResizeHandler.deregister(this._sPopupResizeHandler);
		}
	};

	/**
	 * Opens the <code>SuggestionsPopover</code> with the available items.
	 * <b>Note:</b> When <code>valueHelpOnly</code> property is set to true, the <code>SuggestionsPopover</code> will not open.
	 *
	 * @param {function|undefined} fnFilter Function to filter the items shown in the SuggestionsPopover
	 * @returns {void}
	 *
	 * @since 1.64
	 * @public
	 */
	Input.prototype.showItems = function (fnFilter) {
		var oFilterResults, iSuggestionsLength,
			fnFilterStore = this._getFilterFunction(),
			bShowItems = !this.getEnabled() || !this.getEditable();

		// in case of a non-editable or disabled, the popup cannot be opened
		if (bShowItems) {
			return;
		}

		// Replace the filter with provided one or show all the items
		this.setFilterFunction(fnFilter || function () {
			return true;
		});

		this._clearSuggestionPopupItems();

		oFilterResults = this._getFilteredSuggestionItems(this.getDOMValue());
		iSuggestionsLength = oFilterResults.items.length;

		if (iSuggestionsLength > 0) {
			this._openSuggestionPopup();
		} else {
			this._hideSuggestionPopup();
		}

		this._applySuggestionAcc(iSuggestionsLength);

		this.setFilterFunction(fnFilterStore); // Restore filtering function
	};

	Input.prototype.shouldValueStateMessageBeOpened = function() {
		var bShouldValueStateMessageBeOpened = InputBase.prototype.shouldValueStateMessageBeOpened.apply(this, arguments);

		if (!bShouldValueStateMessageBeOpened || this._isSuggestionsPopoverOpen()) {
			return false;
		}

		return true;
	};

	/**
	 * Checks if the suggestion popover is currently opened.
	 *
	 * @return {boolean} whether the suggestions popover is currently opened
	 * @private
	 */
	Input.prototype._isSuggestionsPopoverOpen = function () {
		return this._getSuggestionsPopover()?.isOpen();
	};

	/**
	 * Opens the suggestions popover
	 *
	 * @private
	 */
	Input.prototype._openSuggestionsPopover = function () {
		this.closeValueStateMessage();
		this._updateSuggestionsPopoverValueState();
		this._getSuggestionsPopover().getPopover().open();
	};

	/**
	 * Updates the suggestions popover value state
	 *
	 * @private
	 */
	Input.prototype._updateSuggestionsPopoverValueState = function() {
		var oSuggPopover = this._getSuggestionsPopover(),
			sValueState = this.getValueState(),
			bNewValueState = this.getValueState() !== oSuggPopover._getValueStateHeader().getValueState(),
			oNewFormattedValueStateText = this.getFormattedValueStateText(),
			sValueStateText = this.getValueStateText();

		if (!oSuggPopover) {
			return;
		}

		/*  If open and no new FormattedText or value state is set to the Input then this is called
		onBeforeClose of the SuggestionsPopover. Switch the value state aggregation's
		parent from the ValueStateHeader to the Input control */
		if (this._isSuggestionsPopoverOpen() && !oNewFormattedValueStateText && !bNewValueState) {
			this.setFormattedValueStateText(oSuggPopover._getValueStateHeader().getFormattedText());
		}

		oSuggPopover.updateValueState(sValueState, (oNewFormattedValueStateText || sValueStateText), this.getShowValueStateMessage());

		if (this.isMobileDevice()) {
			oSuggPopover.getInput().setValueState(sValueState);
		}
	};

	Input.prototype.setShowValueHelp = function (bShowValueHelp) {
		var oSuggestionsPopoverInput = this._getSuggestionsPopover() &&
			this._getSuggestionsPopover().getInput();

		this.setProperty("showValueHelp", bShowValueHelp);
		if (oSuggestionsPopoverInput) {
			oSuggestionsPopoverInput.setShowValueHelp(bShowValueHelp);
		}

		return this;
	};

	/* =========================================================== */
	/* Filtering                                                   */
	/* =========================================================== */

	/**
	 * Gets filtered items.
	 * Table/List item agnostic.
	 *
	 * @param {string} sValue The value, to be used as a filter
	 * @returns {Object} A filtering result object, containing the matching items and list groups
	 * @private
	 */
	Input.prototype._getFilteredSuggestionItems = function (sValue) {
		var oFilterResults,
			oSuggestionsPopover = this._getSuggestionsPopover(),
			oList = oSuggestionsPopover.getItemsContainer(),
			oPopupInput = oSuggestionsPopover && oSuggestionsPopover.getInput(),
			bDoTypeAhead = false;

		// Check if the typeahead should be performed in case of newly fetched items
		// We check both the main input and the input of the inner dialog when on mobile devices
		// because type ahead handling is being called in both context depending on whether it
		// is called after input event or newly loaded items
		if (this.isMobileDevice()) {
			bDoTypeAhead = (!oPopupInput._getProposedItemText() && !oPopupInput._mTypeAheadInfo) || (oPopupInput._mTypeAheadInfo && !oPopupInput._mTypeAheadInfo.value);
		} else {
			bDoTypeAhead = (this._getProposedItemText() && !this._mTypeAheadInfo) || (this._mTypeAheadInfo && !this._mTypeAheadInfo.value);
		}

		if (bDoTypeAhead) {
			this._handleTypeAhead(this);
		}

		if (this._hasTabularSuggestions()) {
			// show list on phone (is hidden when search string is empty)
			if (this.isMobileDevice() && oList) {
				oList.removeStyleClass("sapMInputSuggestionTableHidden");
			}

			oFilterResults = this.filterTabularItems(this.getSuggestionRows(), sValue);
		} else {
			oFilterResults = filterItems(
				this, // control instance
				this.getSuggestionItems(), // array of items to be filtered
				sValue, // the value, to be used as a filter
				this.getFilterSuggests(), // boolean that determines if the suggestions should be filtered
				true, // filter also by secondary values
				this._getFilterFunction() // the filter function
			);
			this._mapItems(oFilterResults);
		}
		return oFilterResults;
	};

	/**
	 * Filters tabular suggestions.
	 *
	 * @private
	 * @param {Array} aTabularRows Array of table rows
	 * @param {string} sValue The value, to be used as a filter
	 * @returns {Object} A filtering result object, containing the matching items and list groups
	 */
	Input.prototype.filterTabularItems = function (aTabularRows, sValue) {
		var bShowItem,
			bFilter = this.getFilterSuggests(),
			aFilteredItems = [],
			aGroups = [],
			bIsAnySuggestionAlreadySelected = false,
			fnFilter = this._getFilterFunction();

		// filter tabular items
		aTabularRows.forEach(function(oTabularRow) {
			if (oTabularRow.isA("sap.m.GroupHeaderListItem")) {
				aGroups.push({
					header: oTabularRow,
					visible: false
				});
			} else {
				bShowItem = !bFilter || fnFilter(sValue, oTabularRow);

				oTabularRow.setVisible(bShowItem);
				bShowItem && aFilteredItems.push(oTabularRow);

				if (!bIsAnySuggestionAlreadySelected && bShowItem && this._getProposedItemText() === this._getRowResultFunction()(oTabularRow)) {
					// Setting the row to selected only works in case the items were there prior the user's input
					// as otherwise there will be no proposed text.
					// In case the items became available on a later stage, the typeahead functionality will set the selected row.
					oTabularRow.setSelected(true);
					bIsAnySuggestionAlreadySelected = true;
				}

				if (aGroups.length && bShowItem) {
					aGroups[aGroups.length - 1].visible = true;
				}
			}
		}, this);

		aGroups.forEach(function(oGroup){
			oGroup.header.setVisible(oGroup.visible);
		});

		this._getSuggestionsTable().invalidate();

		return {
			items: aFilteredItems,
			groups: aGroups
		};
	};

	/**
	 * Calls the mapping method, sets the list selection and updates the visibility of groups headers.
	 *
	 * @param {Object} oFilterResults A filtering result object, containing the matching items and list groups
	 * @private
	 */
	Input.prototype._mapItems = function (oFilterResults) {
		var aItems = this.getSuggestionItems(),
			aFilteredItems = oFilterResults.items,
			aGroups = oFilterResults.groups,
			aMappedGroups = aGroups.map(function (aGroupItem) { return aGroupItem.header; }),
			bIsAnySuggestionAlreadySelected = false,
			oList = this._getSuggestionsPopover().getItemsContainer(),
			oListItem, iGroupItemIndex;

		aItems
			.filter(function (oItem) {
				return (aFilteredItems.indexOf(oItem) > -1) ||
					(aMappedGroups.indexOf(oItem) > -1);
			})
			.map(function (oItem) {
				oListItem = ListHelpers.createListItemFromCoreItem(oItem, true);

				if (oListItem?.isA("sap.m.GroupHeaderListItem")) {
					oList.addItemGroup(null, oListItem);
				} else {
					oList.addItem(oListItem);
				}

				if (!bIsAnySuggestionAlreadySelected && this._getProposedItemText() === oItem.getText()) {
					// Setting the item to selected only works in case the items were there prior the user's input
					// as otherwise there will be no proposed text.
					// In case the items became available on a later stage, the typeahead functionality will set the selected item.
					oListItem.setSelected(true);
					bIsAnySuggestionAlreadySelected = true;
				}

				return oItem;
			}, this)
			.filter(function (oItem) {
				return aMappedGroups.indexOf(oItem) > -1;
			})
			.forEach(function (oGroupItem) {
				iGroupItemIndex = aMappedGroups.indexOf(oGroupItem);

				if (iGroupItemIndex > -1) {
					oListItem = ListHelpers.getListItem(oGroupItem);
					oListItem && oListItem.setVisible(aGroups[iGroupItemIndex].visible);
				}
			});
	};

	/**
	 * Setter for the _sTypedInValue property representing the user's input.
	 *
	 * @private
	 * @param {string} sValue The new value for the property.
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	Input.prototype._setTypedInValue = function (sValue) {
		this._sTypedInValue = sValue;
		return this;
	};

	/**
	 * Getter for the _sTypedInValue property representing the user's input.
	 *
	 * @private
	 * @returns {string} The user's input.
	 */
	Input.prototype._getTypedInValue = function () {
		return this._sTypedInValue;
	};

	/**
	 * Setter for the separateSuggestions property representing whether to display separators in tabular suggestions.
	 *
	 * @private
	 * @ui5-restricted sap.ui.comp.providers.ValueListProvider
	 * @param {boolean} bValue The new value for the property.
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	Input.prototype._setSeparateSuggestions = function (bValue) {
		var oSuggestionsTable = this._getSuggestionsTable();

		this.setProperty("separateSuggestions", bValue);

		if (oSuggestionsTable) {
			oSuggestionsTable.setShowSeparators(bValue ? ListSeparators.Inner : ListSeparators.None);
		}

		return this;
	};

	/**
	 * Setter for the _sProposedItemText property, representing the text extracted from the proposed item/row.
	 *
	 * @private
	 * @param {string} sProposedText The new proposed text, extracted from the item/row.
	 * @returns {this} <code>this</code> to allow method chaining.
	 */
	Input.prototype._setProposedItemText = function (sProposedText) {
		this._sProposedItemText = sProposedText;
		return this;
	};

	/**
	 * Getter for the _sProposedItemText property representing the text extracted from the proposed item/row.
	 *
	 * @private
	 * @returns {string} The text extracted from the proposed item/row.
	 */
	Input.prototype._getProposedItemText = function () {
		return this._sProposedItemText;
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	Input.prototype._getToolbarInteractive = function () {
		return true;
	};

	// support for SemanticFormElement
	Input.prototype.getFormFormattedValue = function() {
		var sValue = this.getValue();
		var sDescription = this.getDescription();

		if (sValue && sDescription) {
			return sValue + " " + sDescription;
		} else {
			return sDescription || sValue;
		}
	};

	Input.prototype.getFormObservingProperties = function() {
		return ["value", "description"];
	};


	/**
	 * Check if the current value is matching with a suggestion item.
	 *
	 * @private
	 */
	Input.prototype.checkMatchingSuggestionItems =  function(sCurrentValue) {
		return this.getSuggestionItems().some((item) => (item.getText?.().toLowerCase() === sCurrentValue.toLowerCase()) && !item.isA("sap.ui.core.SeparatorItem"));
	};

	/**
	 * Check if the current value is matching with a tabular suggestion item.
	 *
	 * @private
	 */
	Input.prototype.checkMatchingTabularSuggestionItems =  function(sCurrentValue) {
		return this.getSuggestionRows().some((row) => row.getCells?.()[0]?.getText?.().toLowerCase() === sCurrentValue.toLowerCase() && !row.isA("sap.m.GroupHeaderListItem"));
	};

	return Input;
});