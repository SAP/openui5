/*!
 * ${copyright}
 */

// Provides control sap.m.Input.
sap.ui.define([
	'jquery.sap.global',
	'./Bar',
	'./Dialog',
	'./InputBase',
	'./List',
	'./Popover',
	'sap/ui/core/Item',
	'./ColumnListItem',
	'./StandardListItem',
	'./DisplayListItem',
	'sap/ui/core/ListItem',
	'./Table',
	'./Toolbar',
	'./ToolbarSpacer',
	'./library',
	'sap/ui/core/IconPool',
	'sap/ui/core/InvisibleText',
	'sap/ui/Device',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Control',
	'./InputRenderer'
],
function(
	jQuery,
	Bar,
	Dialog,
	InputBase,
	List,
	Popover,
	Item,
	ColumnListItem,
	StandardListItem,
	DisplayListItem,
	ListItem,
	Table,
	Toolbar,
	ToolbarSpacer,
	library,
	IconPool,
	InvisibleText,
	Device,
	ResizeHandler,
	Control,
	InputRenderer
) {
	"use strict";



	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.InputTextFormatMode
	var InputTextFormatMode = library.InputTextFormatMode;

	// shortcut for sap.m.InputType
	var InputType = library.InputType;



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
	 * @extends sap.m.InputBase
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Input
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Input = InputBase.extend("sap.m.Input", /** @lends sap.m.Input.prototype */ { metadata : {

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
			 */
			maxLength : {type : "int", group : "Behavior", defaultValue : 0},

			/**
			 * Only used if type=date and no datepicker is available.
			 * The data is displayed and the user input is parsed according to this format.
			 * NOTE: The value property is always of the form RFC 3339 (YYYY-MM-dd).
			 * @deprecated Since version 1.9.1.
			 * <code>sap.m.DatePicker</code>, <code>sap.m.TimePicker</code> or <code>sap.m.DateTimePicker</code> should be used for date/time inputs and formating.
			 */
			dateFormat : {type : "string", group : "Misc", defaultValue : 'YYYY-MM-dd', deprecated: true},

			/**
			 * If set to true, a value help indicator will be displayed inside the control. When clicked the event "valueHelpRequest" will be fired.
			 * @since 1.16
			 */
			showValueHelp : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If this is set to true, suggest event is fired when user types in the input. Changing the suggestItems aggregation in suggest event listener will show suggestions within a popup. When runs on phone, input will first open a dialog where the input and suggestions are shown. When runs on a tablet, the suggestions are shown in a popup next to the input.
			 * @since 1.16.1
			 */
			showSuggestion : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set to true, direct text input is disabled and the control will trigger the event "valueHelpRequest" for all user interactions. The properties "showValueHelp", "editable", and "enabled" must be set to true, otherwise the property will have no effect
			 * @since 1.21.0
			 */
			valueHelpOnly : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Defines whether to filter the provided suggestions before showing them to the user.
			 */
			filterSuggests : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set, the value of this parameter will control the horizontal size of the suggestion list to display more data. This allows suggestion lists to be wider than the input field if there is enough space available. By default, the suggestion list is always as wide as the input field.
			 * Note: The value will be ignored if the actual width of the input field is larger than the specified parameter value.
			 * @since 1.21.1
			 */
			maxSuggestionWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * Minimum length of the entered text in input before suggest event is fired. The default value is 1 which means the suggest event is fired after user types in input. When it's set to 0, suggest event is fired when input with no text gets focus.
			 * @since 1.21.2
			 */
			startSuggestion : {type : "int", group : "Behavior", defaultValue : 1},

			/**
			 * For tabular suggestions, this flag will show/hide the button at the end of the suggestion table that triggers the event "valueHelpRequest" when pressed. The default value is true.
			 *
			 * NOTE: If suggestions are not tabular or no suggestions are used, the button will not be displayed and this flag is without effect.
			 * @since 1.22.1
			 */
			showTableSuggestionValueHelp : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The description is a text after the input field, e.g. units of measurement, currencies.
			 */
			description : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * This property only takes effect if the description property is set. It controls the distribution of space between the input field and the description text. The default value is 50% leaving the other 50% for the description.
			 */
			fieldWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '50%'},

			/**
			 * Indicates when the value gets updated with the user changes: At each keystroke (true) or first when the user presses enter or tabs out (false).
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
			textFormatter: {type: "any", group: "Misc", defaultValue: ""},
			/**
			 * Defines the validation callback function called when a suggestion row gets selected.
			 * @since 1.44
			 */
			suggestionRowValidator: {type: "any", group: "Misc", defaultValue: ""},

			/**
			 * Specifies whether the suggestions highlighting is enabled.
			 * @since 1.46
			 */
			enableSuggestionsHighlighting: {type: "boolean", group: "Behavior", defaultValue: true}
		},
		defaultAggregation : "suggestionItems",
		aggregations : {

			/**
			 * SuggestItems are the items which will be shown in the suggestion popup. Changing this aggregation (by calling addSuggestionItem, insertSuggestionItem, removeSuggestionItem, removeAllSuggestionItems, destroySuggestionItems) after input is rendered will open/close the suggestion popup. o display suggestions with two text values, it is also possible to add sap.ui.core/ListItems as SuggestionItems (since 1.21.1). For the selected ListItem, only the first value is returned to the input field.
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
			 * Note: If this aggregation is filled, the aggregation suggestionItems will be ignored.
			 * @since 1.21.1
			 */
			suggestionRows : {type : "sap.m.ColumnListItem", multiple : true, singularName : "suggestionRow", bindable : "bindable", forwarding: {getter: "_getSuggestionsTable", aggregation: "items"}},

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
			 * This event is fired when the value of the input is changed - e.g. at each keypress
			 */
			liveChange : {
				parameters : {
					/**
					 * The new value of the input.
					 */
					value : {type : "string"},

					/**
					 * Indicate that ESC key triggered the event.
					 * @since 1.48
					 */
					escPressed : {type : "boolean"},

					/**
					 * The value of the input before pressing ESC key.
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
					fromSuggestions : {type : "boolean"}
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
					 * Note: The row result function to select a result value for the string is already executed at this time. To pick different value for the input field or to do follow up steps after the item has been selected.
					 * @since 1.21.1
					 */
					selectedRow : {type : "sap.m.ColumnListItem"}
				}
			},

			/**
			 * This event is fired when user presses the <code>Enter</code> key on the input.
			 *
			 * <b>Note:</b>
			 * The event is fired independent of whether there was a change before or not. If a change was performed the event is fired after the change event.
			 * The event is also fired when an item of the select list is selected via <code>Enter</code>.
			 * The event is only fired on an input which allows text input (<code>editable</code>, <code>enabled</code> and not <code>valueHelpOnly</code>).
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
	}});


	IconPool.insertFontFaceStyle();

	/**
	 * Returns true if some word from the text starts with specific value.
	 *
	 * @name sap.m.Input._wordStartsWithValue
	 * @method
	 * @private
	 * @param {string} sText The text of the word.
	 * @param {string} sValue The value which must be compared to the word.
	 * @returns {boolean} Indication if the word starts with the passed value.
	 */
	Input._wordStartsWithValue = function(sText, sValue) {

		var index;

		while (sText) {
			if (jQuery.sap.startsWithIgnoreCase(sText, sValue)) {
				return true;
			}

			index = sText.indexOf(' ');
			if (index == -1) {
				break;
			}

			sText = sText.substring(index + 1);
		}

		return false;
	};

	/**
	 * The default filter function for one and two-value. It checks whether the item text begins with the typed value.
	 *
	 * @name sap.m.Input._DEFAULTFILTER
	 * @private
	 * @param {string} sValue the current filter string.
	 * @param {sap.ui.core.Item} oItem the filtered list item.
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items.
	 */
	Input._DEFAULTFILTER = function(sValue, oItem) {

		if (oItem instanceof ListItem && Input._wordStartsWithValue(oItem.getAdditionalText(), sValue)) {
			return true;
		}

		return Input._wordStartsWithValue(oItem.getText(), sValue);
	};

	/**
	 * The default filter function for tabular suggestions. It checks whether some item text begins with the typed value.
	 *
	 * @name sap.m.Input._DEFAULTFILTER_TABULAR
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
				if (Input._wordStartsWithValue(aCells[i].getText(), sValue)) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * The default result function for tabular suggestions. It returns the value of the first cell with a "text" property.
	 *
	 * @name sap.m.Input._DEFAULTRESULT_TABULAR
	 * @private
	 * @param {sap.m.ColumnListItem} oColumnListItem The selected list item.
	 * @returns {string} The value to be displayed in the input field.
	 */
	Input._DEFAULTRESULT_TABULAR = function (oColumnListItem) {
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
	 * @name sap.m.Input.init
	 * @private
	 */
	Input.prototype.init = function() {
		InputBase.prototype.init.call(this);
		this._fnFilter = Input._DEFAULTFILTER;

		// Show suggestions in a dialog on phones:
		this._bUseDialog = Device.system.phone;

		// Show suggestions in a full screen dialog on phones:
		this._bFullScreen = Device.system.phone;

		// Counter for concurrent issues with setValue:
		this._iSetCount = 0;

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	};

	/**
	 * Destroys the Input.
	 *
	 * @name sap.m.Input.exit
	 * @private
	 */
	Input.prototype.exit = function() {

		this._deregisterEvents();

		// clear delayed calls
		this.cancelPendingSuggest();

		if (this._iRefreshListTimeout) {
			jQuery.sap.clearDelayedCall(this._iRefreshListTimeout);
			this._iRefreshListTimeout = null;
		}

		if (this._oSuggestionPopup) {
			this._oSuggestionPopup.destroy();
			this._oSuggestionPopup = null;
		}

		// CSN# 1404088/2014: list is not destroyed when it has not been attached to the popup yet
		if (this._oList) {
			this._oList.destroy();
			this._oList = null;
		}

		if (this._oSuggestionTable) {
			this._oSuggestionTable.destroy();
			this._oSuggestionTable = null;
		}

		if (this._oButtonToolbar) {
			this._oButtonToolbar.destroy();
			this._oButtonToolbar = null;
		}

		if (this._oShowMoreButton) {
			this._oShowMoreButton.destroy();
			this._oShowMoreButton = null;
		}
	};

	/**
	 * Resize the popup to the input width and makes sure that the input is never bigger than the popup.
	 *
	 * @name sap.m.Input._resizePopup
	 * @private
	 */
	Input.prototype._resizePopup = function(bForceResize) {
		var that = this;

		if (bForceResize) {
			this._shouldResizePopup = true;
		}

		if (this._oList && this._oSuggestionPopup && this._shouldResizePopup) {

			if (this.getMaxSuggestionWidth()) {
				this._oSuggestionPopup.setContentWidth(this.getMaxSuggestionWidth());
			} else {
				this._oSuggestionPopup.setContentWidth((this.$().outerWidth()) + "px");
			}

			// resize suggestion popup to minimum size of the input field
			setTimeout(function() {
				if (that._oSuggestionPopup && that._oSuggestionPopup.isOpen() && that._oSuggestionPopup.$().outerWidth() < that.$().outerWidth()) {
					that._oSuggestionPopup.setContentWidth((that.$().outerWidth()) + "px");
				}
			}, 0);
		}
	};

	/**
	 * Overwrites the onBeforeRendering.
	 *
	 * @name sap.m.Input.onBeforeRendering
	 * @public
	 */
	Input.prototype.onBeforeRendering = function() {
		var sSelectedKey = this.getSelectedKey();
		InputBase.prototype.onBeforeRendering.call(this);

		this._deregisterEvents();

		if (sSelectedKey) {
			this.setSelectedKey(sSelectedKey);
		}

		if (this.getShowSuggestion()) {
			if (this.getShowTableSuggestionValueHelp()) {
				this._addShowMoreButton();
			} else {
				this._removeShowMoreButton();
			}
		}
	};

	/**
	 * Overwrites the onAfterRendering.
	 *
	 * @name sap.m.Input.onAfterRendering
	 * @public
	 */
	Input.prototype.onAfterRendering = function() {
		var that = this;

		InputBase.prototype.onAfterRendering.call(this);

		if (!this._bFullScreen) {
			this._sPopupResizeHandler = ResizeHandler.register(this.getDomRef(), function() {
				that._resizePopup();
			});
		}

		if (this._bUseDialog && this.getEditable() && this.getEnabled()) {
			// click event has to be used in order to focus on the input in dialog
			// do not open suggestion dialog by click over the value help icon
			this.$().on("click", jQuery.proxy(function (oEvent) {
				if (this._onclick) {
					this._onclick(oEvent);
				}

				if (this.getShowSuggestion() && this._oSuggestionPopup && oEvent.target.id != this.getId() + "-vhi") {
					this._resizePopup(true);
					this._oSuggestionPopup.open();
				}
			}, this));
		}
	};

	/**
	 * Returns input display text.
	 *
	 * @name sap.m.Input._getDisplayText
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
	 * @name sap.m.Input._onValueUpdated
	 * @private
	 * @param {string} newValue The new selected value.
	 */
	Input.prototype._onValueUpdated = function (newValue) {
		if (this._bSelectingItem || newValue === this._sSelectedValue) {
			return;
		}

		var sKey = this.getSelectedKey(),
			bHasSelectedItem;

		if (sKey === '') {
			return;
		}

		if (this._hasTabularSuggestions()) {
			bHasSelectedItem = !!this._oSuggestionTable.getSelectedItem();
		} else {
			bHasSelectedItem = !!this._oList.getSelectedItem();
		}

		if (bHasSelectedItem) {
			return;
		}

		this.setProperty("selectedKey", '', true);
		this.setAssociation("selectedRow", null, true);
		this.setAssociation("selectedItem", null, true);

		this.fireSuggestionItemSelected({
			selectedItem: null,
			selectedRow: null
		});
	};

	/**
	 * Updates selectedItem or selectedRow from the suggestion list or table.
	 *
	 * @private
	 * @returns {boolean} Indicates if an item or row is selected
	 */
	Input.prototype._updateSelectionFromList = function () {
		if (this._iPopupListSelectedIndex  < 0) {
			return false;
		}

		var oSelectedItem = this._oList.getSelectedItem();
		if (oSelectedItem) {
			if (this._hasTabularSuggestions()) {
				this.setSelectionRow(oSelectedItem, true);
			} else {
				this.setSelectionItem(oSelectedItem._oItem, true);
			}
		}

		return true;
	};

	/**
	 * Updates and synchronizes the <code>selectedItem</code> association and <code>selectedKey</code> properties.
	 *
	 * @name sap.m.Input.setSelectionItem
	 * @private
	 * @param {sap.ui.core.Item | null} oItem Selected item.
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction.
	 */
	Input.prototype.setSelectionItem = function (oItem, bInteractionChange) {

		if (!oItem) {
			this.setAssociation("selectedItem", null, true);
			this.setProperty("selectedKey", '', true);

			this.setValue('');

			return;
		}

		this._bSelectingItem = true;

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

		this.updateInputField(sNewValue);

		this._iPopupListSelectedIndex = -1;

		if (!(this._bUseDialog && this instanceof sap.m.MultiInput && this._isMultiLineMode)) {
			this._closeSuggestionPopup();
		}

		if (!Device.support.touch) {
			this._doSelect();
		}

		this._bSelectingItem = false;
	};

	/**
	 * Sets the <code>selectedItem</code> association.
	 *
	 *
	 * @name sap.m.Input.setSelectedItem
	 * @public
	 * @param {sap.ui.core.Item} oItem New value for the <code>selectedItem</code> association.
	 * Default value is <code>null</code>.
	 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the
	 * <code>selectedItem</code> association.
	 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 * @returns {sap.m.Input} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedItem = function(oItem) {

		if (typeof oItem === "string") {
			oItem = sap.ui.getCore().byId(oItem);
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
	 * @name sap.m.Input.setSelectedKey
	 * @public
	 * @param {string} sKey New value for property <code>selectedKey</code>.
	 * If the provided <code>sKey</code> is an empty string <code>""</code> or <code>undefined</code>,
	 * the selection is cleared.
	 * If duplicate keys exist, the first item matching the key is selected.
	 * @returns {sap.m.Input} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedKey = function(sKey) {
		sKey = this.validateProperty("selectedKey", sKey);

		if (this._hasTabularSuggestions()) {
			this.setProperty("selectedKey", sKey, true);
			return this;
		}

		if (!sKey) {
			this.setSelectionItem();
			return this;
		}

		var oItem = this.getSuggestionItemByKey(sKey);

		if (oItem) {
			this.setSelectionItem(oItem);
		} else {
			this.setProperty("selectedKey", sKey, true);
		}

		return this;
	};

	/**
	 * Gets the item with the given key from the aggregation <code>suggestionItems</code>.
	 * <b>Note:</b> If duplicate keys exist, the first item matching the key is returned.
	 *
	 * @public
	 * @name sap.m.Input.getSuggestionItemByKey
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
	 * Updates and synchronizes the <code>selectedRow</code> association and <code>selectedKey</code> properties.
	 *
	 * @name sap.m.Input.setSelectionRow
	 * @private
	 * @param {sap.m.ColumnListItem} oListItem Selected item.
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction.
	 */
	Input.prototype.setSelectionRow = function (oListItem, bInteractionChange) {

		if (!oListItem) {
			this.setAssociation("selectedRow", null, true);
			this.setProperty("selectedKey", '', true);

			this.setValue('');

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
				sNewValue = this._fnRowResultFilter ? this._fnRowResultFilter(oListItem) : Input._DEFAULTRESULT_TABULAR(oListItem);
			}
		}

		this._sSelectedValue = sNewValue;

		this.updateInputField(sNewValue);

		this._iPopupListSelectedIndex = -1;

		if (!(this._bUseDialog && this instanceof sap.m.MultiInput && this._isMultiLineMode)) {
			this._closeSuggestionPopup();
		}

		if (!Device.support.touch) {
			this._doSelect();
		}

		this._bSelectingItem = false;
	};

	/**
	 * Sets the <code>selectedRow</code> association.
	 * Default value is <code>null</code>.
	 *
	 * @name sap.m.Input.setSelectedRow
	 * @public
	 * @param {sap.m.ColumnListItem} oListItem New value for the <code>selectedRow</code> association.
	 * If an ID of a <code>sap.m.ColumnListItem</code> is given, the item with this ID becomes the
	 * <code>selectedRow</code> association.
	 * Alternatively, a <code>sap.m.ColumnListItem</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 * @returns {sap.m.Input} <code>this</code> to allow method chaining.
	 * @since 1.44
	 */
	Input.prototype.setSelectedRow = function(oListItem) {

		if (typeof oListItem === "string") {
			oListItem = sap.ui.getCore().byId(oListItem);
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
	 * @name sap.m.Input._getValueHelpIcon
	 * @private
	 * @returns {object} Value help icon of the input.
	 */
	Input.prototype._getValueHelpIcon = function () {
		var that = this,
			valueHelpIcon = this.getAggregation("_valueHelpIcon"),
			sURI;

		if (valueHelpIcon) {
			return valueHelpIcon;
		}

		sURI = IconPool.getIconURI("value-help");
		valueHelpIcon = IconPool.createControlByURI({
			id: this.getId() + "-vhi",
			src: sURI,
			useIconTooltip: false,
			noTabStop: true
		});

		valueHelpIcon.addStyleClass("sapMInputValHelpInner");
		valueHelpIcon.attachPress(function (evt) {
			// if the property valueHelpOnly is set to true, the event is triggered in the ontap function
			if (!that.getValueHelpOnly()) {
				this.getParent().focus();
				that.bValueHelpRequested = true;
				that.fireValueHelpRequest({fromSuggestions: false});
			}
		});

		this.setAggregation("_valueHelpIcon", valueHelpIcon);

		return valueHelpIcon;
	};

	/**
	 * Fire valueHelpRequest event if conditions for ValueHelpOnly property are met.
	 *
	 * @name sap.m.Input._fireValueHelpRequestForValueHelpOnly
	 * @private
	 */
	Input.prototype._fireValueHelpRequestForValueHelpOnly = function() {
		// if all the named properties are set to true, the control triggers "valueHelpRequest" for all user interactions
		if (this.getEnabled() && this.getEditable() && this.getShowValueHelp() && this.getValueHelpOnly()) {
			this.fireValueHelpRequest({fromSuggestions: false});
		}
	};

	/**
	 * Fire valueHelpRequest event on tap.
	 *
	 * @name sap.m.Input.ontap
	 * @public
	 * @param {jQuery.Event} oEvent Ontap event.
	 */
	Input.prototype.ontap = function(oEvent) {
		InputBase.prototype.ontap.call(this, oEvent);
		this._fireValueHelpRequestForValueHelpOnly();
	};

	/**
	 * Defines the width of the input. Default value is 100%.
	 *
	 * @name sap.m.Input.setWidth
	 * @public
	 * @param {string} sWidth The new width of the input.
	 * @returns {void} Sets the width of the Input.
	 */
	Input.prototype.setWidth = function(sWidth) {
		return InputBase.prototype.setWidth.call(this, sWidth || "100%");
	};

	/**
	 * Returns the width of the input.
	 *
	 * @name sap.m.Input.getWidth
	 * @public
	 * @return {string} The current width or 100% as default.
	 */
	Input.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	/**
	 * Sets a custom filter function for suggestions. The default is to check whether the first item text begins with the typed value. For one and two-value suggestions this callback function will operate on sap.ui.core.Item types, for tabular suggestions the function will operate on sap.m.ColumnListItem types.
	 *
	 * @name sap.m.Input.setFilterFunction
	 * @public
	 * @param {function} fnFilter The filter function is called when displaying suggestion items and has two input parameters: the first one is the string that is currently typed in the input field and the second one is the item that is being filtered. Returning true will add this item to the popup, returning false will not display it.
	 * @returns {sap.m.Input} this pointer for chaining
	 * @since 1.16.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Input.prototype.setFilterFunction = function(fnFilter) {
		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnFilter = Input._DEFAULTFILTER;
			return this;
		}
		// set custom function
		jQuery.sap.assert(typeof (fnFilter) === "function", "Input.setFilterFunction: first argument fnFilter must be a function on " + this);
		this._fnFilter = fnFilter;
		return this;
	};

	/**
	 * Sets a custom result filter function for tabular suggestions to select the text that is passed to the input field. Default is to check whether the first cell with a "text" property begins with the typed value. For one value and two-value suggestions this callback function is not called.
	 *
	 * @name sap.m.Input.setRowResultFunction
	 * @method
	 * @public
	 * @param {function} fnFilter The result function is called with one parameter: the sap.m.ColumnListItem that is selected. The function must return a result string that will be displayed as the input field's value.
	 * @returns {sap.m.Input} this pointer for chaining
	 * @since 1.21.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Input.prototype.setRowResultFunction = function(fnFilter) {
		var sSelectedRow;

		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnRowResultFilter = Input._DEFAULTRESULT_TABULAR;
			return this;
		}
		// set custom function
		jQuery.sap.assert(typeof (fnFilter) === "function", "Input.setRowResultFunction: first argument fnFilter must be a function on " + this);
		this._fnRowResultFilter = fnFilter;

		sSelectedRow = this.getSelectedRow();
		if (sSelectedRow) {
			this.setSelectedRow(sSelectedRow);
		}

		return this;
	};

	/**
	 * Closes the suggestion list.
	 *
	 * @name sap.m.Input.closeSuggestions
	 * @method
	 * @public
	 * @since 1.48
	 */
	Input.prototype.closeSuggestions = function() {
		this._closeSuggestionPopup();
	};

	/**
	 * Selects the text of the InputDomRef in the given range.
	 *
	 * @name sap.m.Input._doSelect
	 * @private
	 * @param {int} iStart Start of selection.
	 * @param {iEnd} iEnd End of selection.
	 * @returns {sap.m.Input} this Input instance for chaining.
	 */
	Input.prototype._doSelect = function(iStart, iEnd) {
		if (Device.support.touch) {
			return;
		}
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
	 * Scrolls to item.
	 *
	 * @name sap.m.Input._scrollToItem
	 * @method
	 * @private
	 * @param {int} iIndex Index of the item to scroll to.
	 */
	Input.prototype._scrollToItem = function(iIndex) {
		var oPopup = this._oSuggestionPopup,
			oList = this._oList,
			oScrollDelegate,
			oPopupRect,
			oItemRect,
			iTop,
			iBottom;

		if (!(oPopup instanceof Popover) || !oList) {
			return;
		}
		oScrollDelegate = oPopup.getScrollDelegate();
		if (!oScrollDelegate) {
			return;
		}
		var oListItem = oList.getItems()[iIndex],
			oListItemDom = oListItem && oListItem.getDomRef();
		if (!oListItemDom) {
			return;
		}
		oPopupRect = oPopup.getDomRef("cont").getBoundingClientRect();
		oItemRect = oListItemDom.getBoundingClientRect();

		iTop = oPopupRect.top - oItemRect.top;
		iBottom = oItemRect.bottom - oPopupRect.bottom;
		if (iTop > 0) {
			oScrollDelegate.scrollTo(oScrollDelegate._scrollX, Math.max(oScrollDelegate._scrollY - iTop, 0));
		} else if (iBottom > 0) {
			oScrollDelegate.scrollTo(oScrollDelegate._scrollX, oScrollDelegate._scrollY + iBottom);
		}
	};

	/**
	 * Helper method for keyboard navigation in suggestion items.
	 *
	 * @name sap.m.Input._isSuggestionItemSelectable
	 * @method
	 * @private
	 * @param {sap.ui.core.Item} oItem Suggestion item.
	 * @returns {boolean} Is the suggestion item selectable.
	 */
	Input.prototype._isSuggestionItemSelectable = function(oItem) {
		// CSN# 1390866/2014: The default for ListItemBase type is "Inactive", therefore disabled entries are only supported for single and two-value suggestions
		// for tabular suggestions: only check visible
		// for two-value and single suggestions: check also if item is not inactive
		return oItem.getVisible() && (this._hasTabularSuggestions() || oItem.getType() !== ListType.Inactive);
	};

	/**
	 *  Helper method for distinguishing between incremental and non-incremental types of input.
	 *
	 * @name sap.m.Input._isIncrementalType
	 * @method
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
	 * Keyboard handler helper.
	 *
	 * @name sap.m.Input._onsaparrowkey
	 * @method
	 * @private
	 * @param {jQuery.Event} oEvent Arrow key event.
	 * @param {string} sDir Arrow direction.
	 * @param {int} iItems Items to be changed.
	 */
	Input.prototype._onsaparrowkey = function(oEvent, sDir, iItems) {
		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}
		if (sDir !== "up" && sDir !== "down") {
			return;
		}
		if (this._isIncrementalType()){
			oEvent.setMarked();
		}

		if (!this._oSuggestionPopup || !this._oSuggestionPopup.isOpen()) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		var bFirst = false,
			oList = this._oList,
			aItems = this.getSuggestionItems(),
			aListItems = oList.getItems(),
			iSelectedIndex = this._iPopupListSelectedIndex,
			sNewValue,
			iOldIndex = iSelectedIndex;

		if (sDir === "up" && iSelectedIndex === 0) {
			// if key is 'up' and selected Item is first -> do nothing
			return;
		}
		if (sDir == "down" && iSelectedIndex === aListItems.length - 1) {
			//if key is 'down' and selected Item is last -> do nothing
			return;
		}

		var iStopIndex;
		if (iItems > 1) {
			// if iItems would go over the borders, search for valid item in other direction
			if (sDir == "down" && iSelectedIndex + iItems >= aListItems.length) {
				sDir = "up";
				iItems = 1;
				aListItems[iSelectedIndex].setSelected(false);
				iStopIndex = iSelectedIndex;
				iSelectedIndex = aListItems.length - 1;
				bFirst = true;
			} else if (sDir == "up" && iSelectedIndex - iItems < 0){
				sDir = "down";
				iItems = 1;
				aListItems[iSelectedIndex].setSelected(false);
				iStopIndex = iSelectedIndex;
				iSelectedIndex = 0;
				bFirst = true;
			}
		}

		// always select the first item from top when nothing is selected so far
		if (iSelectedIndex === -1) {
			iSelectedIndex = 0;
			if (this._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
				// if first item is visible, don't go into while loop
				iOldIndex = iSelectedIndex;
				bFirst = true;
			} else {
				// detect first visible item with while loop
				sDir = "down";
			}
		}

		if (sDir === "down") {
			while (iSelectedIndex < aListItems.length - 1 && (!bFirst || !this._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
				aListItems[iSelectedIndex].setSelected(false);
				iSelectedIndex = iSelectedIndex + iItems;
				bFirst = true;
				iItems = 1; // if wanted item is not selectable just search the next one
				if (iStopIndex === iSelectedIndex) {
					break;
				}
			}
		} else {
			while (iSelectedIndex > 0 && (!bFirst || !aListItems[iSelectedIndex].getVisible() || !this._isSuggestionItemSelectable(aListItems[iSelectedIndex]))) {
				aListItems[iSelectedIndex].setSelected(false);
				iSelectedIndex = iSelectedIndex - iItems;
				bFirst = true;
				iItems = 1; // if wanted item is not selectable just search the next one
				if (iStopIndex === iSelectedIndex) {
					break;
				}
			}
		}

		if (!this._isSuggestionItemSelectable(aListItems[iSelectedIndex])) {
			// if no further visible item can be found -> do nothing (e.g. set the old item as selected again)
			if (iOldIndex >= 0) {
				aListItems[iOldIndex].setSelected(true).updateAccessibilityState();
				this.$("inner").attr("aria-activedescendant", aListItems[iOldIndex].getId());
			}
			return;
		} else {
			aListItems[iSelectedIndex].setSelected(true).updateAccessibilityState();
			this.$("inner").attr("aria-activedescendant", aListItems[iSelectedIndex].getId());
		}

		if (Device.system.desktop) {
			this._scrollToItem(iSelectedIndex);
		}

		// make sure the value doesn't exceed the maxLength
		if (ColumnListItem && aListItems[iSelectedIndex] instanceof ColumnListItem) {
			// for tabular suggestions we call a result filter function
			sNewValue = this._getInputValue(this._fnRowResultFilter(aListItems[iSelectedIndex]));
		} else {
			var bListItem = (aItems[0] instanceof ListItem ? true : false);
			if (bListItem) {
				// for two value suggestions we use the item label
				sNewValue = this._getInputValue(aListItems[iSelectedIndex].getLabel());
			} else {
				// otherwise we use the item title
				sNewValue = this._getInputValue(aListItems[iSelectedIndex].getTitle());
			}
		}

		// setValue isn't used because here is too early to modify the lastValue of input
		this.setDOMValue(sNewValue);

		// memorize the value set by calling jQuery.val, because browser doesn't fire a change event when the value is set programmatically.
		this._sSelectedSuggViaKeyboard = sNewValue;

		this._doSelect();
		this._iPopupListSelectedIndex = iSelectedIndex;
	};

	/**
	 * Keyboard handler for up arrow key.
	 *
	 * @name sap.m.Input.onsapup
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapup = function(oEvent) {
		this._onsaparrowkey(oEvent, "up", 1);
	};

	/**
	 * Keyboard handler for down arrow key.
	 *
	 * @name sap.m.Input.onsapdown
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapdown = function(oEvent) {
		this._onsaparrowkey(oEvent, "down", 1);
	};

	/**
	 * Keyboard handler for page up key.
	 *
	 * @name sap.m.Input.onsappageup
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsappageup = function(oEvent) {
		this._onsaparrowkey(oEvent, "up", 5);
	};

	/**
	 * Keyboard handler for page down key.
	 *
	 * @name sap.m.Input.onsappagedown
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsappagedown = function(oEvent) {
		this._onsaparrowkey(oEvent, "down", 5);
	};

	/**
	 * Keyboard handler for home key.
	 *
	 * @name sap.m.Input.onsaphome
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsaphome = function(oEvent) {

		if (this._oList) {
			this._onsaparrowkey(oEvent, "up", this._oList.getItems().length);
		}

	};

	/**
	 * Keyboard handler for end key.
	 *
	 * @name sap.m.Input.onsapend
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapend = function(oEvent) {

		if (this._oList) {
			this._onsaparrowkey(oEvent, "down", this._oList.getItems().length);
		}

	};

	/**
	 * Keyboard handler for escape key.
	 *
	 * @name sap.m.Input.onsapescape
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapescape = function(oEvent) {
		var lastValue;

		if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
			// mark the event as already handled
			oEvent.originalEvent._sapui_handledByControl = true;
			this._iPopupListSelectedIndex = -1;
			this._closeSuggestionPopup();

			// restore the initial value that was there before suggestion dialog
			if (this._sBeforeSuggest !== undefined) {
				if (this._sBeforeSuggest !== this.getValue()) {
					lastValue = this._lastValue;
					this.setValue(this._sBeforeSuggest);
					this._lastValue = lastValue; // override InputBase.onsapescape()
				}
				this._sBeforeSuggest = undefined;
			}
			return; // override InputBase.onsapescape()
		}

		if (InputBase.prototype.onsapescape) {
			InputBase.prototype.onsapescape.apply(this, arguments);
		}
	};

	/**
	 * Keyboard handler for enter key.
	 *
	 * @name sap.m.Input.onsapenter
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapenter = function(oEvent) {

		// when enter is pressed before the timeout of suggestion delay, suggest event is cancelled
		this.cancelPendingSuggest();

		if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
			if (!this._updateSelectionFromList()) {
				this._closeSuggestionPopup();
			}
		}

		if (InputBase.prototype.onsapenter) {
			InputBase.prototype.onsapenter.apply(this, arguments);
		}

		if (this.getEnabled() && this.getEditable() && !(this.getValueHelpOnly() && this.getShowValueHelp())) {
			this.fireSubmit({value: this.getValue()});
		}
	};

	/**
	 * Keyboard handler for the onFocusLeave event.
	 *
	 * @name sap.m.Input.onsapfocusleave
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapfocusleave = function(oEvent) {
		var oPopup = this._oSuggestionPopup;

		if (oPopup instanceof Popover) {
			if (oEvent.relatedControlId && jQuery.sap.containsOrEquals(oPopup.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
				// Force the focus to stay in input
				this._bPopupHasFocus = true;
				this.focus();
			} else {
				// When the input still has the value of the last jQuery.val call, a change event has to be
				// fired manually because browser doesn't fire an input event in this case.
				if (this.getDOMValue() === this._sSelectedSuggViaKeyboard) {
					this._sSelectedSuggViaKeyboard = null;
				}
			}
		}

		// Inform InputBase to fire the change event on Input only when focus doesn't go into the suggestion popup
		var oFocusedControl = sap.ui.getCore().byId(oEvent.relatedControlId);
		if (!(oPopup
				&& oFocusedControl
				&& jQuery.sap.containsOrEquals(oPopup.getDomRef(), oFocusedControl.getFocusDomRef())
			)) {
			InputBase.prototype.onsapfocusleave.apply(this, arguments);
		}

		this.bValueHelpRequested = false;
	};

	/**
	 * Keyboard handler for the onMouseDown event.
	 *
	 * @name sap.m.Input.onmousedown
	 * @method
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onmousedown = function(oEvent) {
		var oPopup = this._oSuggestionPopup;

		if ((oPopup instanceof Popover) && oPopup.isOpen()) {
			oEvent.stopPropagation();
		}
	};

	/**
	 * Removes events from the input.
	 *
	 * @name sap.m.Input._deregisterEvents
	 * @method
	 * @private
	 */
	Input.prototype._deregisterEvents = function() {
		if (this._sPopupResizeHandler) {
			ResizeHandler.deregister(this._sPopupResizeHandler);
			this._sPopupResizeHandler = null;
		}

		if (this._bUseDialog && this._oSuggestionPopup) {
			this.$().off("click");
		}
	};

	/**
	 * Update suggestion items.
	 *
	 * @name sap.m.Input.updateSuggestionItems
	 * @method
	 * @public
	 * @return {sap.m.Input} this Input instance for chaining.
	 */
	Input.prototype.updateSuggestionItems = function() {
		this._bSuspendInvalidate = true;
		this.updateAggregation("suggestionItems");
		this._bShouldRefreshListItems = true;
		this._refreshItemsDelayed();
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
			Control.prototype.invalidate.apply(this, arguments);
		}
	};

		/**
	 * Cancels any pending suggestions.
	 *
	 * @name sap.m.Input.cancelPendingSuggest
	 * @method
	 * @public
	 */
	Input.prototype.cancelPendingSuggest = function() {
		if (this._iSuggestDelay) {
			jQuery.sap.clearDelayedCall(this._iSuggestDelay);
			this._iSuggestDelay = null;
		}
	};

	/**
	 * Triggers suggestions.
	 *
	 * @name sap.m.Input._triggerSuggest
	 * @method
	 * @private
	 * @param {string} sValue User input.
	 */
	Input.prototype._triggerSuggest = function(sValue) {

		this.cancelPendingSuggest();
		this._bShouldRefreshListItems = true;

		if (!sValue) {
			sValue = "";
		}

		if (sValue.length >= this.getStartSuggestion()) {
			this._iSuggestDelay = jQuery.sap.delayedCall(300, this, function(){

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
			});
		} else if (this._bUseDialog) {
			if (this._oList instanceof Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				this._oList.addStyleClass("sapMInputSuggestionTableHidden");
			} else if (this._oList && this._oList.destroyItems) {
				this._oList.destroyItems();
			}
		} else if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {

			// when compose a non ASCII character, in Chrome the value is updated in the next browser tick cycle
			jQuery.sap.delayedCall(0, this, function () {
				var sNewValue = this.getDOMValue() || '';
				if (sNewValue < this.getStartSuggestion()) {
					this._iPopupListSelectedIndex = -1;
					this._closeSuggestionPopup();
				}
			});
		}
	};

	(function(){
		/**
		 * Shows suggestions.
		 *
		 * @name sap.m.Input.setShowSuggestion
		 * @method
		 * @public
		 * @param {boolean} bValue Show suggestions.
		 * @return {sap.m.Input} this Input instance for chaining.
	 	 */
		Input.prototype.setShowSuggestion = function(bValue){
			this.setProperty("showSuggestion", bValue, true);
			this._iPopupListSelectedIndex = -1;
			if (bValue) {
				this._lazyInitializeSuggestionPopup(this);
			} else {
				destroySuggestionPopup(this);
			}
			return this;
		};

		/**
		 * Shows value help suggestions in table.
		 *
		 * @name sap.m.Input.setShowTableSuggestionValueHelp
		 * @method
		 * @public
		 * @param {boolean} bValue Show suggestions.
		 * @return {sap.m.Input} this Input instance for chaining.
	 	 */
		Input.prototype.setShowTableSuggestionValueHelp = function(bValue) {
			this.setProperty("showTableSuggestionValueHelp", bValue, true);

			if (!this._oSuggestionPopup) {
				return this;
			}

			if (bValue) {
				this._addShowMoreButton();
			} else {
				this._removeShowMoreButton();
			}
			return this;
		};

		/**
		 * Gets show more button.
		 *
		 * @name sap.m.Input._getShowMoreButton
		 * @method
		 * @private
		 * @return {sap.m.Button} Show more button.
	 	 */
		Input.prototype._getShowMoreButton = function() {
			var that = this,
				oMessageBundle = this._oRb;

			return this._oShowMoreButton || (this._oShowMoreButton = new sap.m.Button({
				text : oMessageBundle.getText("INPUT_SUGGESTIONS_SHOW_ALL"),
				press : function() {
					if (that.getShowTableSuggestionValueHelp()) {
						that.fireValueHelpRequest({fromSuggestions: true});
						that._iPopupListSelectedIndex = -1;
						that._closeSuggestionPopup();
					}
				}
			}));
		};

		/**
		 * Gets button toolbar.
		 *
		 * @name sap.m.Input._getButtonToolbar
		 * @method
		 * @private
		 * @return {sap.m.Toolbar} Button toolbar.
	 	 */
		Input.prototype._getButtonToolbar = function() {
			var oShowMoreButton = this._getShowMoreButton();

			return this._oButtonToolbar || (this._oButtonToolbar = new Toolbar({
				content: [
					new ToolbarSpacer(),
					oShowMoreButton
				]
			}));
		};

		/**
		 * Adds a show more button to the footer of the tabular suggestion popup/dialog.
		 *
		 * @name sap.m.Input._addShowMoreButton
		 * @method
		 * @private
		 * @param{boolean} [bTabular] optional parameter to force override the tabular suggestions check
		 */
		Input.prototype._addShowMoreButton = function(bTabular) {
			if (!this._oSuggestionPopup || !bTabular && !this._hasTabularSuggestions()) {
				return;
			}

			if (this._oSuggestionPopup instanceof Dialog) {
				// phone variant, use endButton (beginButton is close)
				var oShowMoreButton = this._getShowMoreButton();
				this._oSuggestionPopup.setEndButton(oShowMoreButton);
			} else {
				var oButtonToolbar = this._getButtonToolbar();
				// desktop/tablet variant, use popover footer
				this._oSuggestionPopup.setFooter(oButtonToolbar);
			}
		};

		/**
		 * Removes the show more button from the footer of the tabular suggestion popup/dialog.
		 *
		 * @name sap.m.Input._removeShowMoreButton
		 * @method
		 * @private
		 */
		Input.prototype._removeShowMoreButton = function() {
			if (!this._oSuggestionPopup || !this._hasTabularSuggestions()) {
				return;
			}

			if (this._oSuggestionPopup instanceof Dialog) {
				this._oSuggestionPopup.setEndButton(null);
			} else {
				this._oSuggestionPopup.setFooter(null);
			}
		};

		/**
		 * Event handler for user input.
		 *
		 * @name sap.m.Input.oninput
		 * @method
		 * @public
		 * @param {jQuery.Event} oEvent User input.
		 */
		Input.prototype.oninput = function(oEvent) {
			InputBase.prototype.oninput.call(this, oEvent);
			if (oEvent.isMarked("invalid")) {
				return;
			}

			var value = this.getDOMValue();

			if (this.getValueLiveUpdate()) {
				this.setProperty("value",value, true);
				this._onValueUpdated(value);
			}

			this.fireLiveChange({
				value: value,
				// backwards compatibility
				newValue: value
			});

			// No need to fire suggest event when suggestion feature isn't enabled or runs on the phone.
			// Because suggest event should only be fired by the input in dialog when runs on the phone.
			if (this.getShowSuggestion() && !this._bUseDialog) {
				this._triggerSuggest(value);
			}
		};

		/**
		 * Gets the input value.
		 *
		 * @name sap.m.Input.getValue
		 * @method
		 * @public
		 * @return {sap.m.Input} Value of the input.
		 */
		Input.prototype.getValue = function(){
			return this.getDomRef("inner") && this._$input ? this.getDOMValue() : this.getProperty("value");
		};

		/**
		 * Refreshes delayed items.
		 *
		 * @name sap.m.Input._refreshItemsDelayed
		 * @method
		 * @public
		 */
		Input.prototype._refreshItemsDelayed = function() {
			jQuery.sap.clearDelayedCall(this._iRefreshListTimeout);
			this._iRefreshListTimeout = jQuery.sap.delayedCall(0, this, refreshListItems, [ this ]);
		};

		/**
		 * Adds suggestion item.
		 *
		 * @name sap.m.Input.addSuggestionItem
		 * @method
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.addSuggestionItem = function(oItem) {
			this.addAggregation("suggestionItems", oItem, true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		/**
		 * Inserts suggestion item.
		 *
		 * @name sap.m.Input.insertSuggestionItem
		 * @method
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @param {int} iIndex Index to be inserted.
		 * @returns {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.insertSuggestionItem = function(oItem, iIndex) {
			this.insertAggregation("suggestionItems", iIndex, oItem, true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		/**
		 * Removes suggestion item.
		 *
		 * @name sap.m.Input.removeSuggestionItem
		 * @method
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @returns {boolean} Determines whether the suggestion item has been removed.
		 */
		Input.prototype.removeSuggestionItem = function(oItem) {
			var res = this.removeAggregation("suggestionItems", oItem, true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		/**
		 * Removes all suggestion items.
		 *
		 * @name sap.m.Input.removeAllSuggestionItems
		 * @method
		 * @public
		 * @returns {boolean} Determines whether the suggestion items are removed.
		 */
		Input.prototype.removeAllSuggestionItems = function() {
			var res = this.removeAllAggregation("suggestionItems", true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		/**
		 * Destroys suggestion items.
		 *
		 * @name sap.m.Input.destroySuggestionItems
		 * @method
		 * @public
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.destroySuggestionItems = function() {
			this.destroyAggregation("suggestionItems", true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return this;
		};

		/**
		 * Adds suggestion row.
		 *
		 * @name sap.m.Input.addSuggestionRow
		 * @method
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.addSuggestionRow = function(oItem) {
			oItem.setType(ListType.Active);
			this.addAggregation("suggestionRows", oItem);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		/**
		 * Inserts suggestion row.
		 *
		 * @name sap.m.Input.insertSuggestionRow
		 * @method
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion row
		 * @param {int} iIndex Row index.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.insertSuggestionRow = function(oItem, iIndex) {
			oItem.setType(ListType.Active);
			this.insertAggregation("suggestionRows", iIndex, oItem);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		/**
		 * Removes suggestion row.
		 *
		 * @name sap.m.Input.removeSuggestionRow
		 * @method
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion row.
		 * @returns {boolean} Determines whether the suggestion row is removed.
		 */
		Input.prototype.removeSuggestionRow = function(oItem) {
			var res = this.removeAggregation("suggestionRows", oItem);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		/**
		 * Removes all suggestion rows.
		 *
		 * @name sap.m.Input.removeAllSuggestionRows
		 * @method
		 * @public
		 * @returns {boolean} Determines whether the suggestion rows are removed.
		 */
		Input.prototype.removeAllSuggestionRows = function() {
			var res = this.removeAllAggregation("suggestionRows");
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		/**
		 * Destroys all suggestion rows.
		 *
		 * @name sap.m.Input.destroySuggestionRows
		 * @method
		 * @public
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.destroySuggestionRows = function() {
			this.destroyAggregation("suggestionRows");
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return this;
		};

		Input.prototype.bindAggregation = function() {
			if (arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns" || arguments[0] === "suggestionItems") {
				createSuggestionPopupContent(this, arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns");
				this._bBindingUpdated = true;
			}
			return InputBase.prototype.bindAggregation.apply(this, arguments);
		};

		/**
		 * Initialize suggestion popup with lazy loading.
		 *
		 * @name sap.m.Input._lazyInitializeSuggestionPopup
		 * @private
		 * @method
		 */
		Input.prototype._lazyInitializeSuggestionPopup = function() {
			if (!this._oSuggestionPopup) {
				createSuggestionPopup(this);
			}
		};

		/**
		 * Closes suggestion popup.
		 *
		 * @name sap.m.Input._closeSuggestionPopup
		 * @private
		 * @method
		 */
		Input.prototype._closeSuggestionPopup = function() {

			if (this._oSuggestionPopup) {
				this._bShouldRefreshListItems = false;
				this.cancelPendingSuggest();
				this._oSuggestionPopup.close();

				// Ensure the valueStateMessage is opened after the suggestion popup is closed.
				// Only do this for desktop (not required for mobile) when the focus is on the input.
				if (!this._bUseDialog && this.$().hasClass("sapMInputFocused")) {
					this.openValueStateMessage();
				}
				this.$("SuggDescr").text(""); // initialize suggestion ARIA text
				this.$("inner").removeAttr("aria-haspopup");
				this.$("inner").removeAttr("aria-activedescendant");

				this._sPrevSuggValue = null;
			}

		};

		/**
		 * Helper function that creates suggestion popup.
		 *
		 * @name createSuggestionPopup
		 * @function
		 * @param {sap.m.Input} oInput Input instance where the popup will be created.
		 */
		function createSuggestionPopup(oInput) {
			var oMessageBundle = oInput._oRb;

			if (oInput._bUseDialog) {
				oInput._oPopupInput = new Input(oInput.getId() + "-popup-input", {
					width : "100%",
					valueLiveUpdate: true,
					showValueHelp: oInput.getShowValueHelp(),
					valueHelpRequest: function(oEvent) {
						// it is the same behavior as by ShowMoreButton:
						oInput.fireValueHelpRequest({fromSuggestions: true});
						oInput._iPopupListSelectedIndex = -1;
						oInput._closeSuggestionPopup();
					},
					liveChange : function(oEvent) {
						var sValue = oEvent.getParameter("newValue");
						// call _getInputValue to apply the maxLength to the typed value
						oInput.setDOMValue(oInput
								._getInputValue(oInput._oPopupInput
										.getValue()));

						oInput._triggerSuggest(sValue);

						// make sure the live change handler on the original input is also called
						oInput.fireLiveChange({
							value: sValue,

							// backwards compatibility
							newValue: sValue
						});
					}

				}).addStyleClass("sapMInputSuggInDialog");
			}

			oInput._oSuggestionPopup = !oInput._bUseDialog ?
				(new Popover(oInput.getId() + "-popup", {
					showArrow: false,
					showHeader: false,
					placement: PlacementType.Vertical,
					initialFocus: oInput,
					horizontalScrolling: true
				}).attachAfterClose(function() {

					oInput._updateSelectionFromList();

					// only destroy items in simple suggestion mode
					if (oInput._oList instanceof Table) {
						oInput._oList.removeSelections(true);
					} else {
						oInput._oList.destroyItems();
					}
					oInput._shouldResizePopup = false;
				}).attachBeforeOpen(function() {
					oInput._sBeforeSuggest = oInput.getValue();
				}))
			:
				(new Dialog(oInput.getId() + "-popup", {
					beginButton : new sap.m.Button(oInput.getId()
							+ "-popup-closeButton", {
						text : oMessageBundle.getText("MSGBOX_CLOSE"),
						press : function() {
							oInput._closeSuggestionPopup();
						}
					}),
					stretch : oInput._bFullScreen,
					contentHeight : oInput._bFullScreen ? undefined : "20rem",
					customHeader : new Bar(oInput.getId()
							+ "-popup-header", {
						contentMiddle : oInput._oPopupInput.addEventDelegate({onsapenter: function(){
							if (!(sap.m.MultiInput && oInput instanceof sap.m.MultiInput)) {
								oInput._closeSuggestionPopup();
							}
						}}, this)
					}),
					horizontalScrolling : false,
					initialFocus : oInput._oPopupInput
				}).attachBeforeOpen(function() {
					// set the same placeholder and maxLength as the original input
					oInput._oPopupInput.setPlaceholder(oInput.getPlaceholder());
					oInput._oPopupInput.setMaxLength(oInput.getMaxLength());
				}).attachBeforeClose(function(){
					// call _getInputValue to apply the maxLength to the typed value
					oInput.setDOMValue(oInput
							._getInputValue(oInput._oPopupInput
									.getValue()));
					oInput.onChange();

					if (oInput instanceof sap.m.MultiInput && oInput._bUseDialog) {
						oInput._onDialogClose();
					}

				}).attachAfterClose(function() {

					if (oInput instanceof sap.m.MultiInput && oInput._isMultiLineMode) {

						oInput._showIndicator();
					}

					// only destroy items in simple suggestion mode
					if (oInput._oList) {
						if (Table && !(oInput._oList instanceof Table)) {
							oInput._oList.destroyItems();
						} else {
							oInput._oList.removeSelections(true);
						}
					}


				}).attachAfterOpen(function() {
					var sValue = oInput.getValue();

					oInput._oPopupInput.setValue(sValue);
					oInput._triggerSuggest(sValue);
					refreshListItems(oInput);
				}));

			oInput._oSuggestionPopup.addStyleClass("sapMInputSuggestionPopup");
			oInput._oSuggestionPopup.addAriaLabelledBy(InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES"));

			// add popup as dependent to also propagate the model and bindings to the content of the popover
			oInput.addDependent(oInput._oSuggestionPopup);
			if (!oInput._bUseDialog) {
				overwritePopover(oInput._oSuggestionPopup, oInput);
			}

			if (oInput._oList) {
				oInput._oSuggestionPopup.addContent(oInput._oList);
			}

			if (oInput.getShowTableSuggestionValueHelp()) {
				oInput._addShowMoreButton();
			}
		}

		/**
		 * Helper function that creates content for the suggestion popup.
		 *
		 * @name createSuggestionPopupContent
		 * @function
		 * @param {sap.m.Input} oInput Input instance where the popup will be created.
		 * @param {boolean | null } bTabular Content for the popup.
		 */
		function createSuggestionPopupContent(oInput, bTabular) {
			// only initialize the content once
			if (oInput._bIsBeingDestroyed || oInput._oList) {
				return;
			}

			if (!oInput._hasTabularSuggestions() && !bTabular) {
				oInput._oList = new List(oInput.getId() + "-popup-list", {
					showNoData : false,
					mode : ListMode.SingleSelectMaster,
					rememberSelections : false,
					itemPress : function(oEvent) {
						var oListItem = oEvent.getParameter("listItem");
						oInput.setSelectionItem(oListItem._oItem, true);
					}
				});

				oInput._oList.addEventDelegate({
					onAfterRendering: oInput._highlightListText.bind(oInput)
				});

			} else {
				// tabular suggestions
				// if no custom filter is set we replace the default filter function here
				if (oInput._fnFilter === Input._DEFAULTFILTER) {
					oInput._fnFilter = Input._DEFAULTFILTER_TABULAR;
				}

				// if not custom row result function is set we set the default one
				if (!oInput._fnRowResultFilter) {
					oInput._fnRowResultFilter = Input._DEFAULTRESULT_TABULAR;
				}

				oInput._oList = oInput._getSuggestionsTable();

				if (oInput.getShowTableSuggestionValueHelp()) {
					oInput._addShowMoreButton(bTabular);
				}
			}

			if (oInput._oSuggestionPopup) {
				if (oInput._bUseDialog) {
					// oInput._oList needs to be manually rendered otherwise it triggers a rerendering of the whole
					// dialog and may close the opened on screen keyboard
					oInput._oSuggestionPopup.addAggregation("content", oInput._oList, true);
					var oRenderTarget = oInput._oSuggestionPopup.$("scrollCont")[0];
					if (oRenderTarget) {
						var rm = sap.ui.getCore().createRenderManager();
						rm.renderControl(oInput._oList);
						rm.flush(oRenderTarget);
						rm.destroy();
					}
				} else {
					oInput._oSuggestionPopup.addContent(oInput._oList);
				}
			}
		}

		/**
		 * Helper function that destroys suggestion popup.
		 *
		 * @name destroySuggestionPopup
		 * @function
		 * @param {sap.m.Input} oInput Input instance.
		 */
		function destroySuggestionPopup(oInput) {

			if (oInput._oSuggestionPopup) {

				// if the table is not removed before destroying the popup the table is also destroyed (table needs to stay because we forward the column and row aggregations to the table directly, they would be destroyed as well)
				if (oInput._oList instanceof Table) {
					oInput._oSuggestionPopup.removeAllContent();
					// also remove the button/toolbar aggregation
					oInput._removeShowMoreButton();
				}

				oInput._oSuggestionPopup.destroy();
				oInput._oSuggestionPopup = null;
			}
			// CSN# 1404088/2014: list is not destroyed when it has not been attached to the popup yet
			if (oInput._oList instanceof List) {
				oInput._oList.destroy();
				oInput._oList = null;
			}
		}

		/**
		 * Helper function that overwrites popover in the Input.
		 *
		 * @name overwritePopover
		 * @function
		 * @param {sap.m.Popover} oPopover Popover instance.
		 * @param {sap.m.Input} oInput Input instance.
		 */
		function overwritePopover(oPopover, oInput) {
			oPopover.open = function() {
				this.openBy(oInput, false, true);
			};

			// remove animation from popover
			oPopover.oPopup.setAnimations(function($Ref, iRealDuration, fnOpened) {
				fnOpened();
			}, function($Ref, iRealDuration, fnClosed) {
				fnClosed();
			});
		}

		/**
		 * Helper function that refreshes list all items.
		 *
		 * @name refreshListItems
		 * @function
		 * @param {sap.m.Input} oInput Input instance.
		 */
		function refreshListItems(oInput) {
			var bShowSuggestion = oInput.getShowSuggestion();
			var oRb = oInput._oRb;
			oInput._iPopupListSelectedIndex = -1;

			if (!bShowSuggestion ||
				!oInput._bShouldRefreshListItems ||
				!oInput.getDomRef() ||
				(!oInput._bUseDialog && !oInput.$().hasClass("sapMInputFocused"))) {
				return false;
			}

			var oItem,
				aItems = oInput.getSuggestionItems(),
				aTabularRows = oInput.getSuggestionRows(),
				sTypedChars = oInput.getDOMValue() || "",
				oList = oInput._oList,
				bFilter = oInput.getFilterSuggests(),
				aHitItems = [],
				iItemsLength = 0,
				oPopup = oInput._oSuggestionPopup,
				oListItemDelegate = {
					ontouchstart : function(oEvent) {
						(oEvent.originalEvent || oEvent)._sapui_cancelAutoClose = true;
					}
				},
				oListItem,
				i;

			// only destroy items in simple suggestion mode
			if (oInput._oList) {
				if (oInput._oList instanceof Table) {
					oList.removeSelections(true);
				} else {
					//TODO: avoid flickering when !bFilter
					oList.destroyItems();
				}
			}

			// hide suggestions list/table if the number of characters is smaller than limit
			if (sTypedChars.length < oInput.getStartSuggestion()) {
				// when the input has no value, close the Popup when not runs on the phone because the opened dialog on phone shouldn't be closed.
				if (!oInput._bUseDialog) {
					oInput._iPopupListSelectedIndex = -1;
					this.cancelPendingSuggest();
					oPopup.close();
				} else {
					// hide table on phone when value is empty
					if (oInput._hasTabularSuggestions() && oInput._oList) {
						oInput._oList.addStyleClass("sapMInputSuggestionTableHidden");
					}
				}

				oInput.$("SuggDescr").text(""); // clear suggestion text
				oInput.$("inner").removeAttr("aria-haspopup");
				oInput.$("inner").removeAttr("aria-activedescendant");
				return false;
			}

			if (oInput._hasTabularSuggestions()) {
				// show list on phone (is hidden when search string is empty)
				if (oInput._bUseDialog && oInput._oList) {
					oInput._oList.removeStyleClass("sapMInputSuggestionTableHidden");
				}

				// filter tabular items
				for (i = 0; i < aTabularRows.length; i++) {
					if (!bFilter || oInput._fnFilter(sTypedChars, aTabularRows[i])) {
						aTabularRows[i].setVisible(true);
						aHitItems.push(aTabularRows[i]);
					} else {
						aTabularRows[i].setVisible(false);
					}
				}

				oInput._oSuggestionTable.invalidate();
			} else {
				// filter standard items
				var bListItem = (aItems[0] instanceof ListItem ? true : false);
				for (i = 0; i < aItems.length; i++) {
					oItem = aItems[i];
					if (!bFilter || oInput._fnFilter(sTypedChars, oItem)) {
						if (bListItem) {
							oListItem = new DisplayListItem(oItem.getId() + "-dli");
							oListItem.setLabel(oItem.getText());
							oListItem.setValue(oItem.getAdditionalText());
						} else {
							oListItem = new StandardListItem(oItem.getId() + "-sli");
							oListItem.setTitle(oItem.getText());
						}

						oListItem.setType(oItem.getEnabled() ? ListType.Active : ListType.Inactive);
						oListItem._oItem = oItem;
						oListItem.addEventDelegate(oListItemDelegate);
						aHitItems.push(oListItem);
					}
				}
			}

			iItemsLength = aHitItems.length;
			var sAriaText = "";
			if (iItemsLength > 0) {
				// add items to list
				if (iItemsLength == 1) {
					sAriaText = oRb.getText("INPUT_SUGGESTIONS_ONE_HIT");
				} else {
					sAriaText = oRb.getText("INPUT_SUGGESTIONS_MORE_HITS", iItemsLength);
				}
				oInput.$("inner").attr("aria-haspopup", "true");

				if (!oInput._hasTabularSuggestions()) {
					for (i = 0; i < iItemsLength; i++) {
						oList.addItem(aHitItems[i]);
					}
				}

				if (!oInput._bUseDialog) {
					if (oInput._sCloseTimer) {
						clearTimeout(oInput._sCloseTimer);
						oInput._sCloseTimer = null;
					}

					if (!oPopup.isOpen() && !oInput._sOpenTimer && (this.getValue().length >= this.getStartSuggestion())) {
						oInput._sOpenTimer = setTimeout(function() {
							oInput._resizePopup(true);
							oInput._sOpenTimer = null;
							oPopup.open();
						}, 0);
					}
				}
			} else {
				sAriaText = oRb.getText("INPUT_SUGGESTIONS_NO_HIT");
				oInput.$("inner").removeAttr("aria-haspopup");
				oInput.$("inner").removeAttr("aria-activedescendant");

				if (!oInput._bUseDialog) {
					if (oPopup.isOpen()) {
						oInput._sCloseTimer = setTimeout(function() {
							oInput._iPopupListSelectedIndex = -1;
							oInput.cancelPendingSuggest();
							oPopup.close();
						}, 0);
					}
				} else {
					// hide table on phone when there are no items to display
					if (oInput._hasTabularSuggestions() && oInput._oList) {
						oInput._oList.addStyleClass("sapMInputSuggestionTableHidden");
					}
				}
			}

			// update Accessibility text for suggestion
			oInput.$("SuggDescr").text(sAriaText);
		}
	})();

	/**
	 * Creates highlighted text.
	 *
	 * @name sap.m.Input._createHighlightedText
	 * @private
	 * @method
	 * @param {sap.m.Label} label Label within the input.
	 * @returns {string} newText Created text.
	 */
	Input.prototype._createHighlightedText = function(label) {
		var text = label.innerText,
			value = this.getValue().toLowerCase(),
			count = value.length,
			lowerText = text.toLowerCase(),
			subString,
			newText = '';

		if (!Input._wordStartsWithValue(text, value)) {
			return jQuery.sap.encodeHTML(text);
		}

		var index = lowerText.indexOf(value);

		// search for the first word which starts with these characters
		if (index > 0) {
			index = lowerText.indexOf(' ' + value) + 1;
		}

		if (index > -1) {
			newText += jQuery.sap.encodeHTML(text.substring(0, index));
			subString = text.substring(index, index + count);
			newText += '<span class="sapMInputHighlight">' + jQuery.sap.encodeHTML(subString) + '</span>';
			newText += jQuery.sap.encodeHTML(text.substring(index + count));
		} else {
			newText = jQuery.sap.encodeHTML(text);
		}

		return newText;
	};

	/**
	 * Highlights matched text in the suggestion list.
	 *
	 * @name sap.m.Input._highlightListText
	 * @private
	 * @method
	 */
	Input.prototype._highlightListText = function() {

		if (!this.getEnableSuggestionsHighlighting()) {
			return;
		}

		var i,
			label,
			labels = this._oList.$().find('.sapMDLILabel, .sapMSLITitleOnly, .sapMDLIValue');

		for (i = 0; i < labels.length; i++) {
			label = labels[i];
			label.innerHTML = this._createHighlightedText(label);
		}
	};

	/**
	 * Highlights matched text in the suggestion table.
	 *
	 * @name sap.m.Input._highlightTableText
	 * @private
	 * @method
	 */
	Input.prototype._highlightTableText = function() {

		if (!this.getEnableSuggestionsHighlighting()) {
			return;
		}

		var i,
			label,
			labels = this._oSuggestionTable.$().find('tbody .sapMLabel');

		for (i = 0; i < labels.length; i++) {
			label = labels[i];
			label.innerHTML = this._createHighlightedText(label);
		}
	};

	/**
	 * Event handler for the onFocusIn event.
	 *
	 * @name sap.m.Input.onfocusin
	 * @public
	 * @method
	 * @param {jQuery.Event} oEvent On focus in event.
	 */
	Input.prototype.onfocusin = function(oEvent) {
		InputBase.prototype.onfocusin.apply(this, arguments);
		this.$().addClass("sapMInputFocused");

		// Close the ValueStateMessage when the suggestion popup is being opened.
		// Only do this in case a popup is used.
		if (!this._bUseDialog && this._oSuggestionPopup
			&& this._oSuggestionPopup.isOpen()) {
			this.closeValueStateMessage();
		}

		// fires suggest event when startSuggestion is set to 0 and input has no text
		if (!this._bPopupHasFocus && !this.getStartSuggestion() && !this.getValue()) {
			this._triggerSuggest(this.getValue());
		}
		this._bPopupHasFocus = undefined;

		this._sPrevSuggValue = null;
	};

	/**
	 * Register F4 to trigger the valueHelpRequest event
	 *
	 * @name sap.m.Input.onsapshow
	 * @private
	 * @method
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapshow = function (oEvent) {
		if (!this.getEnabled() || !this.getEditable() || !this.getShowValueHelp()) {
			return;
		}

		this.bValueHelpRequested = true;
		this.fireValueHelpRequest({fromSuggestions: false});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Input.prototype.onsaphide = Input.prototype.onsapshow;

	/**
	 * Event handler for input select.
	 *
	 * @name sap.m.Input.onsapselect
	 * @private
	 * @method
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapselect = function(oEvent) {
		this._fireValueHelpRequestForValueHelpOnly();
	};

	/**
	 * Event handler for the onFocusOut event.
	 *
	 * @name sap.m.Input.onfocusout
	 * @private
	 * @method
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onfocusout = function(oEvent) {
		InputBase.prototype.onfocusout.apply(this, arguments);
		this.$().removeClass("sapMInputFocused");
		this.closeValueStateMessage(this);
	};

	/**
	 * Check for tabular suggestions in the input.
	 *
	 * @name sap.m.Input._hasTabularSuggestions
	 * @private
	 * @method
	 * @returns {boolean} Determines if the Input has tabular suggestions.
	 */
	Input.prototype._hasTabularSuggestions = function() {
		return !!(this.getAggregation("suggestionColumns") && this.getAggregation("suggestionColumns").length);
	};

	/**
	 * Gets suggestion table with lazy loading.
	 *
	 * @name sap.m.Input._getSuggestionsTable
	 * @private
	 * @method
	 * @returns {sap.m.Table} Suggestion table.
	 */
	Input.prototype._getSuggestionsTable = function() {

		if (this._bIsBeingDestroyed) {
			return;
		}

		var that = this;

		if (!this._oSuggestionTable) {
			this._oSuggestionTable = new Table(this.getId() + "-popup-table", {
				mode: ListMode.SingleSelectMaster,
				showNoData: false,
				showSeparators: "All",
				width: "100%",
				enableBusyIndicator: false,
				rememberSelections : false,
				selectionChange: function (oEvent) {
					var oSelectedListItem = oEvent.getParameter("listItem");
					that.setSelectionRow(oSelectedListItem, true);
				}
			});

			this._oSuggestionTable.addEventDelegate({
				onAfterRendering: this._highlightTableText.bind(this)
			});

			// initially hide the table on phone
			if (this._bUseDialog) {
				this._oSuggestionTable.addStyleClass("sapMInputSuggestionTableHidden");
			}

			this._oSuggestionTable.updateItems = function() {
				Table.prototype.updateItems.apply(this, arguments);
				that._refreshItemsDelayed();
				return this;
			};
		}

		return this._oSuggestionTable;
	};

	/**
	 * Fires suggestion selected event.
	 *
	 * @name sap.m.Input._fireSuggestionItemSelectedEvent
	 * @private
	 * @method
	 */
	Input.prototype._fireSuggestionItemSelectedEvent = function () {
		if (this._iPopupListSelectedIndex >= 0) {
			var oSelectedListItem = this._oList.getItems()[this._iPopupListSelectedIndex];
			if (oSelectedListItem) {
				if (ColumnListItem && oSelectedListItem instanceof ColumnListItem) {
					this.fireSuggestionItemSelected({selectedRow : oSelectedListItem});
				} else {
					this.fireSuggestionItemSelected({selectedItem : oSelectedListItem._oItem});
				}
			}
			this._iPopupListSelectedIndex = -1;
		}
	};

	/**
	 * Clones input.
	 *
	 * @name sap.m.Input.clone
	 * @public
	 * @method
	 * @returns {sap.m.Input} Cloned input.
	 */
	Input.prototype.clone = function() {
		var oInputClone = Control.prototype.clone.apply(this, arguments),
			bindingInfo;

		// add suggestion columns
		bindingInfo = this.getBindingInfo("suggestionColumns");
		if (bindingInfo) {
			oInputClone.bindAggregation("suggestionColumns", jQuery.extend({}, bindingInfo));
		} else {
			this.getSuggestionColumns().forEach(function(oColumn){
				oInputClone.addSuggestionColumn(oColumn.clone(), true);
			});
		}

		// add suggestion rows
		bindingInfo = this.getBindingInfo("suggestionRows");
		if (bindingInfo) {
			oInputClone.bindAggregation("suggestionRows", jQuery.extend({}, bindingInfo));
		} else {
			this.getSuggestionRows().forEach(function(oRow){
				oInputClone.addSuggestionRow(oRow.clone(), true);
			});
		}

		oInputClone.setRowResultFunction(this._fnRowResultFilter);

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
	 * @return {sap.m.Input} <code>this</code> to allow method chaining.
	 * @public
	 */
	Input.prototype.setValue = function(sValue) {
		this._iSetCount++;
		InputBase.prototype.setValue.call(this, sValue);
		this._onValueUpdated(sValue);
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

	/**
	 * Updates the inner input field.
	 *
	 * @protected
	 */
	Input.prototype.updateInputField = function(sNewValue) {
		if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen() && this._bUseDialog) {
			this._oPopupInput.setValue(sNewValue);
			this._oPopupInput._doSelect();
		} else {
			// call _getInputValue to apply the maxLength to the typed value
			sNewValue = this._getInputValue(sNewValue);
			this.setDOMValue(sNewValue);
			this.onChange(null, null, sNewValue);
		}
	};

	/**
	 * Gets accessibility information for the input.
	 *
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {object} Accesibility information.
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
	 * @param {string} sValueStateText  new value for property <code>valueStateText</code>
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining
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
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining
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


	return Input;

});
