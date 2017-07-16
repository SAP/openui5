/*!
 * ${copyright}
 */

// Provides control sap.m.Input.
sap.ui.define(['jquery.sap.global', './Bar', './Dialog', './InputBase', './List', './Popover',
		'sap/ui/core/Item', './ColumnListItem', './StandardListItem', './DisplayListItem', 'sap/ui/core/ListItem',
		'./Table', './Toolbar', './ToolbarSpacer', './library', 'sap/ui/core/IconPool', 'sap/ui/core/InvisibleText'],
	function(jQuery, Bar, Dialog, InputBase, List, Popover,
			Item, ColumnListItem, StandardListItem, DisplayListItem, ListItem,
			Table, Toolbar, ToolbarSpacer, library, IconPool, InvisibleText) {
	"use strict";



	/**
	 * Constructor for a new Input.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <strong><em>Overview</em></strong>
	 * <br /><br />
	 * A text input field allows you to enter and edit text or numeric values in one line.
	 * To easily enter a valid value, you can enable the autocomplete suggestion feature and the value help option.
	 * <br><br>
	 * <strong>Guidelines:</strong>
	 * <ul>
	 * <li> Always provide a meaningful label for any input field </li>
	 * <li> Limit the length of the input field. This will visually emphasise the constraints for the field. </li>
	 * <li> Do not use the <code>placeholder</code> property as a label.</li>
	 * <li> Use the <code>description</code> property only for small fields with no placeholders (i.e. for currencies).</li>
	 * </ul>
	 * <strong><em>Structure</em></strong>
	 * <br><br>
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
	 * <br><br>
	 * <strong><em>Usage</em></strong>
	 * <br><br>
	 * <strong>When to use:</strong>
	 * Use the control for short inputs like emails, phones, passwords, fields for assisted value selection.
	 *
	 * <strong>When not to use:</strong>
	 * Don't use the control for long texts, dates, designated search fields, fields for multiple selection.
	 * <br><br>
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
			type : {type : "sap.m.InputType", group : "Data", defaultValue : sap.m.InputType.Text},

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
			textFormatMode: {type: "sap.m.InputTextFormatMode", group: "Misc", defaultValue: sap.m.InputTextFormatMode.Value},
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
			suggestionColumns : {type : "sap.m.Column", multiple : true, singularName : "suggestionColumn", bindable : "bindable"},

			/**
			 * The suggestionColumns and suggestionRows are for tabular input suggestions. This aggregation allows for binding the table cells.
			 * The items of this aggregation are to be bound directly or to set in the suggest event method.
			 * Note: If this aggregation is filled, the aggregation suggestionItems will be ignored.
			 * @since 1.21.1
			 */
			suggestionRows : {type : "sap.m.ColumnListItem", multiple : true, singularName : "suggestionRow", bindable : "bindable"},

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
		}
	}});


	IconPool.insertFontFaceStyle();

	/**
	 * Returns true if some word from the text starts with specific value.
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
	 * @param {string} sValue the current filter string
	 * @param {sap.ui.core.Item} oItem the filtered list item
	 * @private
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items
	 */
	Input._DEFAULTFILTER = function(sValue, oItem) {

		if (oItem instanceof ListItem && Input._wordStartsWithValue(oItem.getAdditionalText(), sValue)) {
			return true;
		}

		return Input._wordStartsWithValue(oItem.getText(), sValue);
	};

	/**
	 * The default filter function for tabular suggestions. It checks whether some item text begins with the typed value.
	 * @param {string} sValue the current filter string
	 * @param {sap.m.ColumnListItem} oColumnListItem the filtered list item
	 * @private
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items
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
	 * The default result function for tabular suggestions. It returns the value of the first cell with a "text" property
	 * @param {sap.m.ColumnListItem} oColumnListItem the selected list item
	 * @private
	 * @returns {string} the value to be displayed in the input field
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
	 * Initializes the control
	 * @private
	 */
	Input.prototype.init = function() {
		InputBase.prototype.init.call(this);
		this._fnFilter = Input._DEFAULTFILTER;

		// Show suggestions in a dialog on phones:
		this._bUseDialog = sap.ui.Device.system.phone;

		// Show suggestions in a full screen dialog on phones:
		this._bFullScreen = sap.ui.Device.system.phone;

		// Counter for concurrent issues with setValue:
		this._iSetCount = 0;

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		// Init static hidden text for ARIA
		if (!Input._sAriaPopupLabelId) {
			Input._sAriaPopupLabelId = new InvisibleText({
				text: this._oRb.getText("INPUT_AVALIABLE_VALUES")
			}).toStatic().getId();
		}
	};

	/**
	 * Destroys the control
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
	 * Resizes the popup to the input width and makes sure that the input is never bigger as the popup
	 * @private
	 */
	Input.prototype._resizePopup = function() {
		var that = this;

		if (this._oList && this._oSuggestionPopup) {
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

	Input.prototype.onBeforeRendering = function() {
		InputBase.prototype.onBeforeRendering.call(this);
		this._deregisterEvents();
	};

	Input.prototype.onAfterRendering = function() {
		var that = this;

		InputBase.prototype.onAfterRendering.call(this);

		if (!this._bFullScreen) {
			this._resizePopup();
			this._sPopupResizeHandler = sap.ui.core.ResizeHandler.register(this.getDomRef(), function() {
				that._resizePopup();
			});
		}

		if (this._bUseDialog && this.getEditable()) {
			// click event has to be used in order to focus on the input in dialog
			// do not open suggestion dialog by click over the value help icon
			this.$().on("click", jQuery.proxy(function (oEvent) {
				if (this._onclick) {
					this._onclick(oEvent);
				}

				if (this.getShowSuggestion() && this._oSuggestionPopup && oEvent.target.id != this.getId() + "-vhi") {
					this._oSuggestionPopup.open();
				}
			}, this));
		}
	};

	/**
	 * Returns input display text.
	 * @private
	 *
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
			case sap.m.InputTextFormatMode.Key:
				return sKey;
			case sap.m.InputTextFormatMode.ValueKey:
				return sText + ' (' + sKey + ')';
			case sap.m.InputTextFormatMode.KeyValue:
				return '(' + sKey + ') ' + sText;
			default:
				return sText;
		}
	};

	/**
	 * Handles value updates.
	 * @private
	 *
	 */
	Input.prototype._onValueUpdated = function (newValue) {
		if (this._bSelectingItem || newValue === this._sSelectedValue) {
			return;
		}

		var sKey = this.getSelectedKey();

		if (sKey === '') {
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
	 * Updates and synchronizes the <code>selectedItem</code> association
	 * and <code>selectedKey</code> properties.
	 *
	 * @param {sap.ui.core.Item | null} oItem Selected item
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction
	 *
	 * @private
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

		// update the input field
		if (this._bUseDialog) {
			this._oPopupInput.setValue(sNewValue);
			this._oPopupInput._doSelect();
		} else {
			// call _getInputValue to apply the maxLength to the typed value
			this._$input.val(this._getInputValue(sNewValue));
			this.onChange();
		}

		this._iPopupListSelectedIndex = -1;

		if (!(this._bUseDialog && this instanceof sap.m.MultiInput && this._isMultiLineMode)) {
			this._closeSuggestionPopup();
		}

		if (!sap.ui.Device.support.touch) {
			this._doSelect();
		}

		this._bSelectingItem = false;
	};

	/**
	 * Sets the <code>selectedItem</code> association.
	 *
	 * Default value is <code>null</code>.
	 *
	 * @param {string | sap.ui.core.Item | null} oItem New value for the <code>selectedItem</code> association.
	 * If an ID of a <code>sap.ui.core.Item</code> is given, the item with this ID becomes the
	 * <code>selectedItem</code> association.
	 * Alternatively, a <code>sap.ui.core.Item</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 *
	 * @returns {sap.m.Input} <code>this</code> to allow method chaining.
	 * @public
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
	 * @param {string} sKey New value for property <code>selectedKey</code>.
	 * If the provided <code>sKey</code> is an empty string <code>""</code> or <code>undefined</code>,
	 * the selection is cleared.
	 * If duplicate keys exist, the first item matching the key is selected.
	 *
	 * @returns {sap.m.Input} <code>this</code> to allow method chaining.
	 * @public
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
		this.setSelectionItem(oItem);

		return this;
	};

	/**
	 * Gets the item with the given key from the aggregation <code>suggestionItems</code>.
	 *
	 * <b>Note:</b> If duplicate keys exist, the first item matching the key is returned.
	 *
	 * @param {string} sKey An item key that specifies the item to retrieve.
	 * @returns {sap.ui.core.Item | undefined}
	 * @public
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
	 * Updates and synchronizes the <code>selectedRow</code> association
	 * and <code>selectedKey</code> properties.
	 *
	 * @param {sap.m.ColumnListItem | null} oListItem Selected item
	 * @param {boolean} bInteractionChange Specifies if the change is triggered by user interaction
	 *
	 * @private
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
				sNewValue = this._fnRowResultFilter(oListItem);
			}
		}

		this._sSelectedValue = sNewValue;

		// update the input field
		if (this._bUseDialog) {
			this._oPopupInput.setValue(sNewValue);
			this._oPopupInput._doSelect();
		} else {
			// call _getInputValue to apply the maxLength to the typed value
			this._$input.val(this._getInputValue(sNewValue));
			this.onChange();
		}
		this._iPopupListSelectedIndex = -1;

		if (!(this._bUseDialog && this instanceof sap.m.MultiInput && this._isMultiLineMode)) {
			this._closeSuggestionPopup();
		}

		if (!sap.ui.Device.support.touch) {
			this._doSelect();
		}

		this._bSelectingItem = false;
	};

	/**
	 * Sets the <code>selectedRow</code> association.
	 *
	 * Default value is <code>null</code>.
	 *
	 * @param {string | sap.m.ColumnListItem | null} oListItem New value for the <code>selectedRow</code> association.
	 * If an ID of a <code>sap.m.ColumnListItem</code> is given, the item with this ID becomes the
	 * <code>selectedRow</code> association.
	 * Alternatively, a <code>sap.m.ColumnListItem</code> instance may be given or <code>null</code> to clear
	 * the selection.
	 *
	 * @returns {sap.m.Input} <code>this</code> to allow method chaining.
	 * @public
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
	 * Returns/Instantiates the value help icon control when needed
	 * @private
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
				that.fireValueHelpRequest({fromSuggestions: false});
			}
		});

		this.setAggregation("_valueHelpIcon", valueHelpIcon);

		return valueHelpIcon;
	};

	/**
	 * Fire valueHelpRequest event if conditions for ValueHelpOnly property are met
	 * @private
	 */
	Input.prototype._fireValueHelpRequestForValueHelpOnly = function() {
		// if all the named properties are set to true, the control triggers "valueHelpRequest" for all user interactions
		if (this.getEnabled() && this.getEditable() && this.getShowValueHelp() && this.getValueHelpOnly()) {
			this.fireValueHelpRequest({fromSuggestions: false});
		}
	};

	/**
	 * Fire valueHelpRequest event on tap
	 * @public
	 * @param {jQuery.Event} oEvent
	 */
	Input.prototype.ontap = function(oEvent) {
		InputBase.prototype.ontap.call(this, oEvent);
		this._fireValueHelpRequestForValueHelpOnly();
	};

	/**
	 * Defines the width of the input. Default value is 100%
	 * @public
	 * @param {string} sWidth
	 */
	Input.prototype.setWidth = function(sWidth) {
		return InputBase.prototype.setWidth.call(this, sWidth || "100%");
	};

	/**
	 * Returns the width of the input.
	 * @public
	 * @return {string} The current width or 100% as default
	 */
	Input.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	/**
	 * Sets a custom filter function for suggestions. The default is to check whether the first item text begins with the typed value. For one and two-value suggestions this callback function will operate on sap.ui.core.Item types, for tabular suggestions the function will operate on sap.m.ColumnListItem types.
	 * @param {function} fnFilter The filter function is called when displaying suggestion items and has two input parameters: the first one is the string that is currently typed in the input field and the second one is the item that is being filtered. Returning true will add this item to the popup, returning false will not display it.
	 * @returns {sap.m.Input} this pointer for chaining
	 * @since 1.16.1
	 * @public
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
	 * @param {function} fnFilter The result function is called with one parameter: the sap.m.ColumnListItem that is selected. The function must return a result string that will be displayed as the input field's value.
	 * @returns {sap.m.Input} this pointer for chaining
	 * @public
	 * @since 1.21.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Input.prototype.setRowResultFunction = function(fnFilter) {
		// reset to default function when calling with null or undefined
		if (fnFilter === null || fnFilter === undefined) {
			this._fnRowResultFilter = Input._DEFAULTRESULT_TABULAR;
			return this;
		}
		// set custom function
		jQuery.sap.assert(typeof (fnFilter) === "function", "Input.setRowResultFunction: first argument fnFilter must be a function on " + this);
		this._fnRowResultFilter = fnFilter;
		return this;
	};

	/**
	 * Closes the suggestion list.
	 * @public
	 * @since 1.48
	 */
	Input.prototype.closeSuggestions = function() {
		this._closeSuggestionPopup();
	};

	Input.prototype.setShowValueHelp = function(bShowValueHelp) {

		this.setProperty("showValueHelp", bShowValueHelp);

		if (bShowValueHelp && !Input.prototype._sAriaValueHelpLabelId) {
			// create an F4 ARIA announcement and remember its ID for later use in the renderer:
			Input.prototype._sAriaValueHelpLabelId = new InvisibleText({
				text: this._oRb.getText("INPUT_VALUEHELP")
			}).toStatic().getId();
		}
		return this;

	};

	Input.prototype.setValueHelpOnly = function(bValueHelpOnly) {

		this.setProperty("valueHelpOnly", bValueHelpOnly);

		if (bValueHelpOnly && !Input.prototype._sAriaInputDisabledLabelId) {
			// create an F4 ARIA announcement and remember its ID for later use in the renderer:
			Input.prototype._sAriaInputDisabledLabelId = new InvisibleText({
				text: this._oRb.getText("INPUT_DISABLED")
			}).toStatic().getId();
		}
		return this;

	};

	/**
	 * Selects the text of the InputDomRef in the given range
	 * @param {int} [iStart=0] start position of the text selection
	 * @param {int} [iEnd=<length of text>] end position of the text selection
	 * @return {sap.m.Input} this Input instance for chaining
	 * @private
	 */
	Input.prototype._doSelect = function(iStart, iEnd) {
		if (sap.ui.Device.support.touch) {
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

	// helper method for keyboard navigation in suggestion items
	Input.prototype._isSuggestionItemSelectable = function(oItem) {
		// CSN# 1390866/2014: The default for ListItemBase type is "Inactive", therefore disabled entries are only supported for single and two-value suggestions
		// for tabular suggestions: only check visible
		// for two-value and single suggestions: check also if item is not inactive
		return oItem.getVisible() && (this._hasTabularSuggestions() || oItem.getType() !== sap.m.ListType.Inactive);
	};

	Input.prototype._onsaparrowkey = function(oEvent, sDir, iItems) {
		if (!this.getEnabled() || !this.getEditable()) {
			return;
		}
		if (!this._oSuggestionPopup || !this._oSuggestionPopup.isOpen()) {
			return;
		}
		if (sDir !== "up" && sDir !== "down") {
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

		if (sap.ui.Device.system.desktop) {
			this._scrollToItem(iSelectedIndex);
		}

		// make sure the value doesn't exceed the maxLength
		if (sap.m.ColumnListItem && aListItems[iSelectedIndex] instanceof sap.m.ColumnListItem) {
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
		this._$input.val(sNewValue);

		// memorize the value set by calling jQuery.val, because browser doesn't fire a change event when the value is set programmatically.
		this._sSelectedSuggViaKeyboard = sNewValue;

		this._doSelect();
		this._iPopupListSelectedIndex = iSelectedIndex;
	};

	Input.prototype.onsapup = function(oEvent) {
		this._onsaparrowkey(oEvent, "up", 1);
	};

	Input.prototype.onsapdown = function(oEvent) {
		this._onsaparrowkey(oEvent, "down", 1);
	};

	Input.prototype.onsappageup = function(oEvent) {
		this._onsaparrowkey(oEvent, "up", 5);
	};

	Input.prototype.onsappagedown = function(oEvent) {
		this._onsaparrowkey(oEvent, "down", 5);
	};

	Input.prototype.onsaphome = function(oEvent) {

		if (this._oList) {
			this._onsaparrowkey(oEvent, "up", this._oList.getItems().length);
		}

	};

	Input.prototype.onsapend = function(oEvent) {

		if (this._oList) {
			this._onsaparrowkey(oEvent, "down", this._oList.getItems().length);
		}

	};

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

	Input.prototype.onsapenter = function(oEvent) {
		if (InputBase.prototype.onsapenter) {
			InputBase.prototype.onsapenter.apply(this, arguments);
		}

		// when enter is pressed before the timeout of suggestion delay, suggest event is cancelled
		this.cancelPendingSuggest();

		if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
			var oSelectedItem = this._oList.getSelectedItem();
			if (oSelectedItem) {
				if (this._hasTabularSuggestions()){
					this.setSelectionRow(oSelectedItem, true);
				} else {
					this.setSelectionItem(oSelectedItem._oItem, true);
				}
			} else {
				if (this._iPopupListSelectedIndex >= 0) {
					this._fireSuggestionItemSelectedEvent();
					this._doSelect();

					this._iPopupListSelectedIndex = -1;
				}
				this._closeSuggestionPopup();
			}
		}

		if (this.getEnabled() && this.getEditable() && !(this.getValueHelpOnly() && this.getShowValueHelp())) {
			this.fireSubmit({value: this.getValue()});
		}
	};

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
				if (this._$input.val() === this._sSelectedSuggViaKeyboard) {
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
	};

	Input.prototype.onmousedown = function(oEvent) {
		var oPopup = this._oSuggestionPopup;

		if ((oPopup instanceof Popover) && oPopup.isOpen()) {
			oEvent.stopPropagation();
		}
	};

	Input.prototype._deregisterEvents = function() {
		if (this._sPopupResizeHandler) {
			sap.ui.core.ResizeHandler.deregister(this._sPopupResizeHandler);
			this._sPopupResizeHandler = null;
		}

		if (this._bUseDialog && this._oSuggestionPopup) {
			this.$().off("click");
		}
	};

	Input.prototype.updateSuggestionItems = function() {
		this.updateAggregation("suggestionItems");
		this._bShouldRefreshListItems = true;
		this._refreshItemsDelayed();
		return this;
	};

	Input.prototype.cancelPendingSuggest = function() {
		if (this._iSuggestDelay) {
			jQuery.sap.clearDelayedCall(this._iSuggestDelay);
			this._iSuggestDelay = null;
		}
	};

	Input.prototype._triggerSuggest = function(sValue) {

		this.cancelPendingSuggest();
		this._bShouldRefreshListItems = true;

		if (!sValue) {
			sValue = "";
		}

		if (sValue.length >= this.getStartSuggestion()) {
			this._iSuggestDelay = jQuery.sap.delayedCall(300, this, function(){
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
			});
		} else if (this._bUseDialog) {
			if (this._oList instanceof Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				this._oList.addStyleClass("sapMInputSuggestionTableHidden");
			} else if (this._oList && this._oList.destroyItems) {
				this._oList.destroyItems();
			}
		} else if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
			this._iPopupListSelectedIndex = -1;
			this._closeSuggestionPopup();
		}
	};

	(function(){
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

		Input.prototype._getButtonToolbar = function() {
			var oShowMoreButton = this._getShowMoreButton();

			return this._oButtonToolbar || (this._oButtonToolbar = new Toolbar({
				content: [
					new ToolbarSpacer(),
					oShowMoreButton
				]
			}));
		};

		/*
		 * Adds a more button to the footer of the tabular suggestion popup/dialog
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

		/*
		 * Removes the more button from the footer of the tabular suggestion popup/dialog
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

		Input.prototype.oninput = function(oEvent) {
			InputBase.prototype.oninput.call(this, oEvent);
			if (oEvent.isMarked("invalid")) {
				return;
			}

			var value = this._$input.val();

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

		Input.prototype.getValue = function(){
			return this.getDomRef("inner") && this._$input ? this._$input.val() : this.getProperty("value");
		};

		Input.prototype._refreshItemsDelayed = function() {
			jQuery.sap.clearDelayedCall(this._iRefreshListTimeout);
			this._iRefreshListTimeout = jQuery.sap.delayedCall(0, this, refreshListItems, [ this ]);
		};

		Input.prototype.addSuggestionItem = function(oItem) {
			this.addAggregation("suggestionItems", oItem, true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		Input.prototype.insertSuggestionItem = function(oItem, iIndex) {
			this.insertAggregation("suggestionItems", iIndex, oItem, true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		Input.prototype.removeSuggestionItem = function(oItem) {
			var res = this.removeAggregation("suggestionItems", oItem, true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		Input.prototype.removeAllSuggestionItems = function() {
			var res = this.removeAllAggregation("suggestionItems", true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		Input.prototype.destroySuggestionItems = function() {
			this.destroyAggregation("suggestionItems", true);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return this;
		};

		Input.prototype.addSuggestionRow = function(oItem) {
			oItem.setType(sap.m.ListType.Active);
			this.addAggregation("suggestionRows", oItem);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		Input.prototype.insertSuggestionRow = function(oItem, iIndex) {
			oItem.setType(sap.m.ListType.Active);
			this.insertAggregation("suggestionRows", iIndex, oItem);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			createSuggestionPopupContent(this);
			return this;
		};

		Input.prototype.removeSuggestionRow = function(oItem) {
			var res = this.removeAggregation("suggestionRows", oItem);
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		Input.prototype.removeAllSuggestionRows = function() {
			var res = this.removeAllAggregation("suggestionRows");
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return res;
		};

		Input.prototype.destroySuggestionRows = function() {
			this.destroyAggregation("suggestionRows");
			this._bShouldRefreshListItems = true;
			this._refreshItemsDelayed();
			return this;
		};

		/**
		 * Forwards aggregations with the name of items or columns to the internal table.
		 * @overwrite
		 * @public
		 * @param {string} sAggregationName the name for the binding
		 * @param {object} oBindingInfo the configuration parameters for the binding
		 * @returns {sap.m.Input} this pointer for chaining
		 */
		Input.prototype.bindAggregation = function() {
			var args = Array.prototype.slice.call(arguments);

			if (args[0] === "suggestionRows" || args[0] === "suggestionColumns" || args[0] === "suggestionItems") {
				createSuggestionPopupContent(this, args[0] === "suggestionRows" || args[0] === "suggestionColumns");
				this._bBindingUpdated = true;
			}

			// propagate the bind aggregation function to list
			this._callMethodInManagedObject.apply(this, ["bindAggregation"].concat(args));
			return this;
		};

		Input.prototype._lazyInitializeSuggestionPopup = function() {
			if (!this._oSuggestionPopup) {
				createSuggestionPopup(this);
			}
		};

		Input.prototype._closeSuggestionPopup = function() {

			if (this._oSuggestionPopup) {
				this._bShouldRefreshListItems = false;
				this.cancelPendingSuggest();
				this._oSuggestionPopup.close();
				this.$("SuggDescr").text(""); // initialize suggestion ARIA text
				this.$("inner").removeAttr("aria-haspopup");
				this.$("inner").removeAttr("aria-activedescendant");
			}

		};

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
						oInput._$input.val(oInput
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
					showHeader : false,
					placement : sap.m.PlacementType.Vertical,
					initialFocus : oInput
				}).attachAfterClose(function() {
					if (oInput._iPopupListSelectedIndex  >= 0) {
						oInput._fireSuggestionItemSelectedEvent();
					}
					// only destroy items in simple suggestion mode
					if (oInput._oList instanceof Table) {
						oInput._oList.removeSelections(true);
					} else {
						oInput._oList.destroyItems();
					}
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
					oInput._$input.val(oInput
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
			oInput._oSuggestionPopup.addAriaLabelledBy(Input._sAriaPopupLabelId);

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

		function createSuggestionPopupContent(oInput, bTabular) {
			// only initialize the content once
			if (oInput._oList) {
				return;
			}

			if (!oInput._hasTabularSuggestions() && !bTabular) {
				oInput._oList = new List(oInput.getId() + "-popup-list", {
					width : "100%",
					showNoData : false,
					mode : sap.m.ListMode.SingleSelectMaster,
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
				sTypedChars = oInput._$input.val() || "",
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

						oListItem.setType(oItem.getEnabled() ? sap.m.ListType.Active : sap.m.ListType.Inactive);
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
							oInput._resizePopup();
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
	 * @private
	 */
	Input.prototype._createHighlightedText = function(label) {
		var text = label.innerText,
			value = this.getValue().toLowerCase(),
			count = value.length,
			lowerText = text.toLowerCase(),
			subString,
			newText = '';

		if (!Input._wordStartsWithValue(text, value)) {
			return text;
		}

		var index = lowerText.indexOf(value);

		// search for the first word which starts with these characters
		if (index > 0) {
			index = lowerText.indexOf(' ' + value) + 1;
		}

		if (index > -1) {
			newText += text.substring(0, index);
			subString = text.substring(index, index + count);
			newText += '<span class="sapMInputHighlight">' + subString + '</span>';
			newText += text.substring(index + count);
		} else {
			newText = text;
		}

		return newText;
	};

	/**
	 * Highlights matched text in the suggestion list.
	 * @private
	 *
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
	 * @private
	 *
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

	Input.prototype.onfocusin = function(oEvent) {
		InputBase.prototype.onfocusin.apply(this, arguments);
		this.$().addClass("sapMInputFocused");

		// fires suggest event when startSuggestion is set to 0 and input has no text
		if (!this._bPopupHasFocus && !this.getStartSuggestion() && !this.getValue()) {
			this._triggerSuggest(this.getValue());
		}
		this._bPopupHasFocus = undefined;
	};

	/**
	 * Register F4 to trigger the valueHelpRequest event
	 * @private
	 */
	Input.prototype.onsapshow = function (oEvent) {
		if (!this.getEnabled() || !this.getEditable() || !this.getShowValueHelp()) {
			return;
		}

		this.fireValueHelpRequest({fromSuggestions: false});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	Input.prototype.onsaphide = Input.prototype.onsapshow;

	Input.prototype.onsapselect = function(oEvent) {
		this._fireValueHelpRequestForValueHelpOnly();
	};

	Input.prototype.onfocusout = function(oEvent) {
		InputBase.prototype.onfocusout.apply(this, arguments);
		this.$().removeClass("sapMInputFocused");
		this.closeValueStateMessage(this);
	};

	Input.prototype._hasTabularSuggestions = function() {
		return !!(this.getAggregation("suggestionColumns") && this.getAggregation("suggestionColumns").length);
	};

	/* lazy loading of the suggestions table */
	Input.prototype._getSuggestionsTable = function() {
		var that = this;

		if (!this._oSuggestionTable) {
			this._oSuggestionTable = new Table(this.getId() + "-popup-table", {
				mode: sap.m.ListMode.SingleSelectMaster,
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

	Input.prototype._fireSuggestionItemSelectedEvent = function () {
		if (this._iPopupListSelectedIndex >= 0) {
			var oSelectedListItem = this._oList.getItems()[this._iPopupListSelectedIndex];
			if (oSelectedListItem) {
				if (sap.m.ColumnListItem && oSelectedListItem instanceof sap.m.ColumnListItem) {
					this.fireSuggestionItemSelected({selectedRow : oSelectedListItem});
				} else {
					this.fireSuggestionItemSelected({selectedItem : oSelectedListItem._oItem});
				}
			}
			this._iPopupListSelectedIndex = -1;
		}
	};

	/* =========================================================== */
	/*           begin: forward aggregation methods to table       */
	/* =========================================================== */

	/*
	 * Forwards a function call to a managed object based on the aggregation name.
	 * If the name is items, it will be forwarded to the table, otherwise called
	 * locally
	 * @private
	 * @param {string} sFunctionName the name of the function to be called
	 * @param {string} sAggregationName the name of the aggregation asociated
	 * @returns {any} the return type of the called function
	 */
	Input.prototype._callMethodInManagedObject = function(sFunctionName, sAggregationName) {
		var aArgs = Array.prototype.slice.call(arguments),
			oSuggestionsTable;

		if (sAggregationName === "suggestionColumns") {
			// apply to the internal table (columns)
			oSuggestionsTable = this._getSuggestionsTable();
			return oSuggestionsTable[sFunctionName].apply(oSuggestionsTable, ["columns"].concat(aArgs.slice(2)));
		} else if (sAggregationName === "suggestionRows") {
			// apply to the internal table (rows = table items)
			oSuggestionsTable = this._getSuggestionsTable();
			return oSuggestionsTable[sFunctionName].apply(oSuggestionsTable, ["items"].concat(aArgs.slice(2)));
		} else {
			// apply to this control
			return sap.ui.core.Control.prototype[sFunctionName].apply(this, aArgs .slice(1));
		}
	};

	Input.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		return this._callMethodInManagedObject("validateAggregation", sAggregationName, oObject, bMultiple);
	};

	Input.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("setAggregation", sAggregationName,	oObject, bSuppressInvalidate);
		return this;
	};

	Input.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
		return this._callMethodInManagedObject("getAggregation", sAggregationName, oDefaultForCreation);
	};

	Input.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		return this._callMethodInManagedObject("indexOfAggregation", sAggregationName, oObject);
	};

	Input.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		this._callMethodInManagedObject("insertAggregation", sAggregationName, oObject, iIndex, bSuppressInvalidate);
		return this;
	};

	Input.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		this._callMethodInManagedObject("addAggregation", sAggregationName,oObject, bSuppressInvalidate);
		return this;
	};

	Input.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAggregation", sAggregationName, oObject, bSuppressInvalidate);
	};

	Input.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		return this._callMethodInManagedObject("removeAllAggregation", sAggregationName, bSuppressInvalidate);
	};

	Input.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		this._callMethodInManagedObject("destroyAggregation", sAggregationName, bSuppressInvalidate);
		return this;
	};

	Input.prototype.getBinding = function(sAggregationName) {
		return this._callMethodInManagedObject("getBinding", sAggregationName);
	};

	Input.prototype.getBindingInfo = function(sAggregationName) {
		return this._callMethodInManagedObject("getBindingInfo", sAggregationName);
	};

	Input.prototype.getBindingPath = function(sAggregationName) {
		return this._callMethodInManagedObject("getBindingPath", sAggregationName);
	};

	Input.prototype.clone = function() {
		var oInputClone = sap.ui.core.Control.prototype.clone.apply(this, arguments),
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
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
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



	return Input;

}, /* bExport= */ true);
