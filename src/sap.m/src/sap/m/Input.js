/*!
 * ${copyright}
 */

// Provides control sap.m.Input.
sap.ui.define([
	'./InputBase',
	'./Popover',
	'sap/ui/core/Item',
	'./ColumnListItem',
	'./Table',
	'./library',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'sap/ui/core/Control',
	'./SuggestionsPopover',
	"sap/ui/dom/containsOrEquals",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "selectText"
	"sap/ui/dom/jquery/selectText"
],
function(
	InputBase,
	Popover,
	Item,
	ColumnListItem,
	Table,
	library,
	IconPool,
	Device,
	Control,
	SuggestionsPopover,
	containsOrEquals,
	assert,
	jQuery
) {
	"use strict";
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
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/input-field/ Input}
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
			description: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * This property only takes effect if the description property is set. It controls the distribution of space between the input field and the description text. The default value is 50% leaving the other 50% for the description.
			 */
			fieldWidth: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: '50%' },

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
	 * Initializes the control.
	 *
	 * @private
	 */
	Input.prototype.init = function() {
		InputBase.prototype.init.call(this);
		this._fnFilter = SuggestionsPopover._DEFAULTFILTER;

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

		if (this._oSuggPopover) {
			this._oSuggPopover.destroy();
			this._oSuggPopover = null;
		}
	};

	/**
	 * Overwrites the onBeforeRendering.
	 *
	 * @public
	 */
	Input.prototype.onBeforeRendering = function() {
		var sSelectedKey = this.getSelectedKey(),
			bShowIcon = this.getShowValueHelp() && this.getEnabled() && this.getEditable(),
			aEndIcons = this.getAggregation("_endIcon") || [],
			oIcon = aEndIcons[0];

		InputBase.prototype.onBeforeRendering.call(this);

		this._deregisterEvents();

		if (sSelectedKey) {
			this.setSelectedKey(sSelectedKey);
		}

		if (this.getShowSuggestion()) {
			if (this.getShowTableSuggestionValueHelp()) {
				this._oSuggPopover._addShowMoreButton();
			} else {
				this._oSuggPopover._removeShowMoreButton();
			}
		}

		if (bShowIcon) {

			// ensure the creation of an icon
			oIcon = this._getValueHelpIcon();
			oIcon.setProperty("visible", true, true);
		} else {

			// if the icon should not be shown and has never be initialized - do nothing
			if (oIcon) {
				oIcon.setProperty("visible", false, true);
			}
		}
	};

	/**
	 * Overwrites the onAfterRendering.
	 *
	 * @public
	 */
	Input.prototype.onAfterRendering = function() {

		InputBase.prototype.onAfterRendering.call(this);

		if (this._bUseDialog && this.getEditable() && this.getEnabled()) {
			// click event has to be used in order to focus on the input in dialog
			// do not open suggestion dialog by click over the value help icon
			this.$().on("click", jQuery.proxy(function (oEvent) {
				if (this._onclick) {
					this._onclick(oEvent);
				}

				if (this.getShowSuggestion() && this._oSuggPopover && oEvent.target.id != this.getId() + "-vhi") {
					this._oSuggPopover._oPopover.open();
				}
			}, this));
		}
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
			bHasSelectedItem;

		if (sKey === '') {
			return;
		}

		if (this._hasTabularSuggestions()) {
			bHasSelectedItem = this._oSuggPopover._oSuggestionTable && !!this._oSuggPopover._oSuggestionTable.getSelectedItem();
		} else {
			bHasSelectedItem = this._oSuggPopover._oList && !!this._oSuggPopover._oList.getSelectedItem();
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

		var oSelectedItem = this._oSuggPopover._oList.getSelectedItem();
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
				sNewValue = this._fnRowResultFilter ? this._fnRowResultFilter(oListItem) : SuggestionsPopover._DEFAULTRESULT_TABULAR(oListItem);
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
	 * @private
	 * @returns {object} Value help icon of the input.
	 */
	Input.prototype._getValueHelpIcon = function () {
		var that = this,
			aEndIcons = this.getAggregation("_endIcon") || [],
			oValueStateIcon = aEndIcons[0];

		// for backward compatibility - leave this method to return the instance
		if (!oValueStateIcon) {
			oValueStateIcon = this.addEndIcon({
				id: this.getId() + "-vhi",
				src: IconPool.getIconURI("value-help"),
				useIconTooltip: false,
				noTabStop: true,
				press: function (oEvent) {
					// if the property valueHelpOnly is set to true, the event is triggered in the ontap function
					if (!that.getValueHelpOnly()) {
						var oParent = this.getParent(),
							$input;

						if (Device.support.touch) {
							// prevent opening the soft keyboard
							$input = oParent.$('inner');
							$input.attr('readonly', 'readonly');
							oParent.focus();
							$input.removeAttr('readonly');
						} else {
							oParent.focus();
						}

						that.bValueHelpRequested = true;
						that.fireValueHelpRequest({ fromSuggestions: false });
					}
				}
			});
		}

		return oValueStateIcon;
	};

	/**
	 * Fire valueHelpRequest event if conditions for ValueHelpOnly property are met.
	 *
	 * @private
	 */
	Input.prototype._fireValueHelpRequestForValueHelpOnly = function() {
		// if all the named properties are set to true, the control triggers "valueHelpRequest" for all user interactions
		if (this.getEnabled() && this.getEditable() && this.getShowValueHelp() && this.getValueHelpOnly()) {
			if (Device.system.phone) {
				this.focus();
			}
			this.fireValueHelpRequest({fromSuggestions: false});
		}
	};

	/**
	 * Fire valueHelpRequest event on tap.
	 *
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
	 * @public
	 * @return {string} The current width or 100% as default.
	 */
	Input.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	/**
	 * Sets a custom filter function for suggestions. The default is to check whether the first item text begins with the typed value. For one and two-value suggestions this callback function will operate on sap.ui.core.Item types, for tabular suggestions the function will operate on sap.m.ColumnListItem types.
	 *
	 * @public
	 * @param {function} fnFilter The filter function is called when displaying suggestion items and has two input parameters: the first one is the string that is currently typed in the input field and the second one is the item that is being filtered. Returning true will add this item to the popup, returning false will not display it.
	 * @returns {sap.m.Input} this pointer for chaining
	 * @since 1.16.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Input.prototype.setFilterFunction = function(fnFilter) {
		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnFilter = SuggestionsPopover._DEFAULTFILTER;
			return this;
		}
		// set custom function
		assert(typeof (fnFilter) === "function", "Input.setFilterFunction: first argument fnFilter must be a function on " + this);
		this._fnFilter = fnFilter;
		return this;
	};

	/**
	 * Sets a custom result filter function for tabular suggestions to select the text that is passed to the input field. Default is to check whether the first cell with a "text" property begins with the typed value. For one value and two-value suggestions this callback function is not called.
	 *
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
			this._fnRowResultFilter = SuggestionsPopover._DEFAULTRESULT_TABULAR;
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
	 * Helper method for keyboard navigation in suggestion items.
	 *
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
		var lastValue;

		if (this._isSuggestionsPopoverOpen()) {
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

		if (this.getValueLiveUpdate()) {
			// When valueLiveUpdate is true call setProperty to return back the last value.
			this.setProperty("value", this._lastValue, true);
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

		// when enter is pressed before the timeout of suggestion delay, suggest event is cancelled
		this.cancelPendingSuggest();

		if (this._isSuggestionsPopoverOpen()) {
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
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapfocusleave = function(oEvent) {
		var oPopup = this._oSuggPopover && this._oSuggPopover._oPopover;

		if (oPopup instanceof Popover) {
			if (oEvent.relatedControlId && containsOrEquals(oPopup.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
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
				&& containsOrEquals(oPopup.getDomRef(), oFocusedControl.getFocusDomRef())
			)) {
			InputBase.prototype.onsapfocusleave.apply(this, arguments);
		}

		this.bValueHelpRequested = false;
	};

	/**
	 * Keyboard handler for the onMouseDown event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onmousedown = function(oEvent) {
		var oPopup = this._oSuggPopover && this._oSuggPopover._oPopover;

		if ((oPopup instanceof Popover) && oPopup.isOpen()) {
			oEvent.stopPropagation();
		}
	};

	/**
	 * Removes events from the input.
	 *
	 * @private
	 */
	Input.prototype._deregisterEvents = function() {
		if (this._oSuggPopover) {
			this._oSuggPopover._deregisterResize();
		}

		if (this._bUseDialog && this._oSuggPopover && this._oSuggPopover._oPopover) {
			this.$().off("click");
		}
	};

	/**
	 * Update suggestion items.
	 *
	 * @public
	 * @return {sap.m.Input} this Input instance for chaining.
	 */
	Input.prototype.updateSuggestionItems = function() {
		this._bSuspendInvalidate = true;
		this.updateAggregation("suggestionItems");
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
			Control.prototype.invalidate.apply(this, arguments);
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
		} else if (this._bUseDialog) {
			if (this._oSuggPopover._oList instanceof Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				this._oSuggPopover._oList.addStyleClass("sapMInputSuggestionTableHidden");
			} else if (this._oSuggPopover._oList && this._oSuggPopover._oList.destroyItems) {
				this._oSuggPopover._oList.destroyItems();
			}
		} else if (this._isSuggestionsPopoverOpen()) {

			// when compose a non ASCII character, in Chrome the value is updated in the next browser tick cycle
			setTimeout(function () {
				var sNewValue = this.getDOMValue() || '';
				if (sNewValue < this.getStartSuggestion()) {
					this._iPopupListSelectedIndex = -1;
					this._closeSuggestionPopup();
				}
			}.bind(this), 0);
		}
	};

	(function(){
		/**
		 * Shows suggestions.
		 *
		 * @public
		 * @param {boolean} bValue Show suggestions.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.setShowSuggestion = function(bValue){
			this.setProperty("showSuggestion", bValue, true);
			this._iPopupListSelectedIndex = -1;
			if (bValue) {
				this._oSuggPopover = this._getSuggestionsPopover();
				if (!this._oSuggPopover._oPopover){
					this._oSuggPopover._createSuggestionPopup();
					this._synchronizeSuggestions();
					this._oSuggPopover._createSuggestionPopupContent();
				}
			} else {
				this._oSuggPopover && this._oSuggPopover._destroySuggestionPopup();
			}
			return this;
		};

		/**
		 * Shows value help suggestions in table.
		 *
		 * @public
		 * @param {boolean} bValue Show suggestions.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.setShowTableSuggestionValueHelp = function(bValue) {
			this.setProperty("showTableSuggestionValueHelp", bValue, true);

			if (!(this._oSuggPopover && this._oSuggPopover._oPopover)) {
				return this;
			}

			if (bValue) {
				this._oSuggPopover._addShowMoreButton();
			} else {
				this._oSuggPopover._removeShowMoreButton();
			}
			return this;
		};

		/**
		 * Event handler for user input.
		 *
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
				this.setProperty("value", value, true);
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
		 * @public
		 * @return {sap.m.Input} Value of the input.
		 */
		Input.prototype.getValue = function(){
			return this.getDomRef("inner") && this._$input ? this.getDOMValue() : this.getProperty("value");
		};

		/**
		 * Refreshes delayed items.
		 *
		 * @public
		 */
		Input.prototype._refreshItemsDelayed = function() {
			clearTimeout(this._iRefreshListTimeout);

			this._iRefreshListTimeout = setTimeout(function () {
				if (this._oSuggPopover) {
					this._oSuggPopover._refreshListItems();
				}
			}.bind(this), 0);
		};

		/**
		 * Adds suggestion item.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.addSuggestionItem = function(oItem) {
			this.addAggregation("suggestionItems", oItem, true);

			if (!this._oSuggPopover) {
				this._getSuggestionsPopover();
			}

			this._synchronizeSuggestions();
			this._oSuggPopover._createSuggestionPopupContent();

			return this;
		};

		/**
		 * Inserts suggestion item.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @param {int} iIndex Index to be inserted.
		 * @returns {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.insertSuggestionItem = function(oItem, iIndex) {
			this.insertAggregation("suggestionItems", iIndex, oItem, true);

			if (!this._oSuggPopover) {
				this._getSuggestionsPopover();
			}

			this._synchronizeSuggestions();
			this._oSuggPopover._createSuggestionPopupContent();

			return this;
		};

		/**
		 * Removes suggestion item.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @returns {boolean} Determines whether the suggestion item has been removed.
		 */
		Input.prototype.removeSuggestionItem = function(oItem) {
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
		Input.prototype.removeAllSuggestionItems = function() {
			var res = this.removeAllAggregation("suggestionItems", true);
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Destroys suggestion items.
		 *
		 * @public
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.destroySuggestionItems = function() {
			this.destroyAggregation("suggestionItems", true);
			this._synchronizeSuggestions();
			return this;
		};

		/**
		 * Adds suggestion row.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion item.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.addSuggestionRow = function(oItem) {
			oItem.setType(ListType.Active);
			this.addAggregation("suggestionRows", oItem);
			this._synchronizeSuggestions();
			this._oSuggPopover._createSuggestionPopupContent();
			return this;
		};

		/**
		 * Inserts suggestion row.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion row
		 * @param {int} iIndex Row index.
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.insertSuggestionRow = function(oItem, iIndex) {
			oItem.setType(ListType.Active);
			this.insertAggregation("suggestionRows", oItem, iIndex);
			this._synchronizeSuggestions();
			this._oSuggPopover._createSuggestionPopupContent();
			return this;
		};

		/**
		 * Removes suggestion row.
		 *
		 * @public
		 * @param {sap.ui.core.Item} oItem Suggestion row.
		 * @returns {boolean} Determines whether the suggestion row is removed.
		 */
		Input.prototype.removeSuggestionRow = function(oItem) {
			var res = this.removeAggregation("suggestionRows", oItem);
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Removes all suggestion rows.
		 *
		 * @public
		 * @returns {boolean} Determines whether the suggestion rows are removed.
		 */
		Input.prototype.removeAllSuggestionRows = function() {
			var res = this.removeAllAggregation("suggestionRows");
			this._synchronizeSuggestions();
			return res;
		};

		/**
		 * Destroys all suggestion rows.
		 *
		 * @public
		 * @return {sap.m.Input} this Input instance for chaining.
		 */
		Input.prototype.destroySuggestionRows = function() {
			this.destroyAggregation("suggestionRows");
			this._synchronizeSuggestions();
			return this;
		};

		Input.prototype.bindAggregation = function() {
			if (arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns" || arguments[0] === "suggestionItems") {
				this._getSuggestionsPopover()._createSuggestionPopupContent(arguments[0] === "suggestionRows" || arguments[0] === "suggestionColumns");
				this._bBindingUpdated = true;
			}
			return InputBase.prototype.bindAggregation.apply(this, arguments);
		};

		/**
		 * Closes suggestion popup.
		 *
		 * @private
		 */
		Input.prototype._closeSuggestionPopup = function() {

			if (this._oSuggPopover && this._oSuggPopover.isOpen()) {
				this._bShouldRefreshListItems = false;
				this.cancelPendingSuggest();
				this._oSuggPopover._oPopover.close();

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
		 * Synchronize the displayed suggestion items and sets the correct selectedItem/selectedRow
		 * @private
		 */
		Input.prototype._synchronizeSuggestions = function() {
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();

			if (!this.getDomRef() || this._isSuggestionsPopoverOpen()) {
				return;
			}

			this._synchronizeSelection();
		};

		/**
		 * Synchronizes the selectedItem/selectedRow, depending on the selectedKey
		 * @private
		 */
		Input.prototype._synchronizeSelection = function() {
			var sSelectedKey = this.getSelectedKey();
			if (!sSelectedKey) {
				return;
			}

			if (this.getValue() && !this.getSelectedItem() && !this.getSelectedRow()) {
				return;
			}

			this.setSelectedKey(sSelectedKey);
		};
	})();

	/**
	 * Event handler for the onFocusIn event.
	 *
	 * @public
	 * @param {jQuery.Event} oEvent On focus in event.
	 */
	Input.prototype.onfocusin = function(oEvent) {
		InputBase.prototype.onfocusin.apply(this, arguments);
		this.$().addClass("sapMInputFocused");

		// Close the ValueStateMessage when the suggestion popup is being opened.
		// Only do this in case a popup is used.
		if (!this._bUseDialog && this._isSuggestionsPopoverOpen()) {
			this.closeValueStateMessage();
		}

		// fires suggest event when startSuggestion is set to 0 and input has no text
		if (!this._bPopupHasFocus && !this.getStartSuggestion() && !this.getValue() && this.getShowSuggestion()) {
			this._triggerSuggest(this.getValue());
		}
		this._bPopupHasFocus = undefined;

		this._sPrevSuggValue = null;
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
		this.fireValueHelpRequest({fromSuggestions: false});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Input.prototype.onsaphide = Input.prototype.onsapshow;

	/**
	 * Event handler for input select.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Keyboard event.
	 */
	Input.prototype.onsapselect = function(oEvent) {
		this._fireValueHelpRequestForValueHelpOnly();
	};

	/**
	 * Event handler for the onFocusOut event.
	 *
	 * @private
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
	 * @returns {sap.m.Table} Suggestion table.
	 */
	Input.prototype._getSuggestionsTable = function () {
		return this._getSuggestionsPopover()._getSuggestionsTable();
	};

	/**
	 * Clones input.
	 *
	 * @public
	 * @returns {sap.m.Input} Cloned input.
	 */
	Input.prototype.clone = function() {
		var oInputClone = Control.prototype.clone.apply(this, arguments),
			bindingInfo;

		// add suggestion columns
		bindingInfo = this.getBindingInfo("suggestionColumns");
		if (bindingInfo) {
			oInputClone.bindAggregation("suggestionColumns", jQuery.extend({}, bindingInfo));
		}

		// add suggestion rows
		bindingInfo = this.getBindingInfo("suggestionRows");
		if (bindingInfo) {
			oInputClone.bindAggregation("suggestionRows", jQuery.extend({}, bindingInfo));
		}

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
		if (this._isSuggestionsPopoverOpen() && this._bUseDialog) {
			this._oSuggPopover._oPopupInput.setValue(sNewValue);
			this._oSuggPopover._oPopupInput._doSelect();
		} else {
			// call _getInputValue to apply the maxLength to the typed value
			sNewValue = this._getInputValue(sNewValue);
			this.setDOMValue(sNewValue);
			this.onChange(null, null, sNewValue);
		}
	};

	/**
	 * Checks if the suggestion popover is currently opened.
	 *
	 * @return {boolean} whether the suggestions popover is currently opened
	 * @private
	 */
	Input.prototype._isSuggestionsPopoverOpen = function() {
		return this._oSuggPopover && this._oSuggPopover.isOpen();
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

	/**
	 * Lazily retrieves the <code>SuggestionsPopover</code>.
	 *
	 * @returns {sap.m.SuggestionsPopover}
	 * @private
	 */
	Input.prototype._getSuggestionsPopover = function () {
		if (!this._oSuggPopover) {
			this._oSuggPopover = new SuggestionsPopover(this);
			this._oSuggPopover._createSuggestionPopup(); // TODO move this call to SuggestionsPopover constructor
			this._oSuggestionPopup = this._oSuggPopover._oPopover; // for backward compatibility (used in some other controls)
		}

		return this._oSuggPopover;
	};


	return Input;

});