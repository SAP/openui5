/*!
 * ${copyright}
 */

// Provides control sap.m.SearchField.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	'./Suggest',
	'sap/ui/Device',
	'./SearchFieldRenderer',
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos"
],
	function(
		library,
		Control,
		EnabledPropagator,
		IconPool,
		Suggest,
		Device,
		SearchFieldRenderer,
		KeyCodes,
		jQuery,
		Library
	) {
	"use strict";

	/**
	* Constructor for a new SearchField.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* An input field to search for a specific item.
	* <h3>Overview</h3>
	* A search field is needed when the user needs to find specific information in large amounts of data.
	* The search field is also the control of choice for filtering down
	* a given amount of information.
	* <h3>Structure</h3>
	* The search input field can be used in two ways:
	* <ul>
	* <li>Manual search - The search is triggered after the user presses the search button.
	* Manual search uses a “starts with” approach.</li>
	* <li>Live search (search-as-you-type) - The search is triggered after each button press.
	* A suggestion list is shown below the search field.  Live search uses a “contains” approach.</li>
	* </ul>
	* <h3>Usage</h3>
	* <h4>When to use:</h4>
	* <ul>
	* <li> Use live search whenever possible. </li>
	* <li> Use a manual search only if the amount of data is too large and if your app would otherwise run
	* into performance issues. </li>
	* </ul>
	* <h3>Responsive Behavior</h3>
	* On mobile devices, there is no refresh button in the search field. "Pull Down to Refresh" is used instead.
	* The "Pull Down to Refresh" arrow icon is animated and spins to signal that the user should release it.
	*
	* @extends sap.ui.core.Control
	* @implements sap.ui.core.IFormContent
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @alias sap.m.SearchField
	* @see {@link fiori:https://experience.sap.com/fiori-design-web/search/ Search Field}
	*/
	var SearchField = Control.extend("sap.m.SearchField", /** @lends sap.m.SearchField.prototype */ {
		metadata : {

			interfaces : [
				"sap.ui.core.IFormContent",
				"sap.f.IShellBar",
				"sap.m.IToolbarInteractiveControl"
			],
			library : "sap.m",
			properties : {
				/**
				 * Input Value.
				 */
				value : {type : "string", group : "Data", defaultValue : null, bindable : "bindable"},

				/**
				 * Defines the CSS width of the input. If not set, width is 100%.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null },

				/**
				 * Boolean property to enable the control (default is true).
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Invisible inputs are not rendered.
				 */
				visible : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Maximum number of characters. Value '0' means the feature is switched off.
				 */
				maxLength : {type : "int", group : "Behavior", defaultValue : 0},

				/**
				 * Text shown when no value available. If no placeholder value is set, the word "Search" in the current local language (if supported) or in English will be displayed as a placeholder (property value will still be <code>null</code> in that case).
				 */
				placeholder : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Set to <code>true</code> to display a refresh button in place of the search icon. By pressing the refresh button or F5 key on keyboard, the user can reload the results list without changing the search string.
				 * Note: if "showSearchButton" property is set to <code>false</code>, both the search and refresh buttons are not displayed even if the "showRefreshButton" property is true.
				 * @since 1.16
				 */
				showRefreshButton : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Set to <code>true</code> to show the search button with the magnifier icon.
				 * If <code>false</code>, both the search and refresh buttons are not displayed even if the "showRefreshButton" property is <code>true</code>.
				 * @since 1.23
				 */
				showSearchButton : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * If <code>true</code>, a <code>suggest</code> event is fired when user types in the input and when the input is focused.
				 * On a phone device, a full screen dialog with suggestions is always shown even if the suggestions list is empty.
				 * @since 1.34
				 */
				enableSuggestions : {type : "boolean", group : "Behavior", defaultValue : false}
			},
			associations : {

				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			defaultAggregation : "suggestionItems",
			designtime: "sap/m/designtime/SearchField.designtime",
			aggregations : {

				/**
				 * <code>SuggestionItems</code> are the items which will be shown in the suggestions list.
				 * The following properties can be used:
				 * <ul>
				 * <li><code>key</code> is not displayed and may be used as internal technical field</li>
				 * <li><code>text</code> is displayed as normal suggestion text</li>
				 * <li><code>icon</code></li>
				 * <li><code>description</code> - additional text may be used to visually display search item type or category</li>
				 * </ul>
				 *
				 * @since 1.34
				 */
				suggestionItems : {type : "sap.m.SuggestionItem", multiple : true, singularName : "suggestionItem"}
			},
			events : {

				/**
				 * Event which is fired when the user triggers a search.
				 */
				search : {
					parameters : {

						/**
						 * The search query string.
						 */
						query : {type : "string"},

						/**
						 * Suggestion list item in case if the user has selected an item from the suggestions list.
						 * @since 1.34
						 */
						suggestionItem : {type : "sap.m.SuggestionItem"},

						/**
						 * Indicates if the user pressed the refresh icon.
						 * @since 1.16
						 */
						refreshButtonPressed : {type : "boolean"},
						/**
						 * Indicates if the user pressed the clear icon.
						 * @since 1.34
						 */
						clearButtonPressed : {type : "boolean"},
						/**
						 * Indicates if the user pressed the search button.
						 * @since 1.114
						 */
						searchButtonPressed : {type : "boolean"},

						/**
						 * Indicates that ESC key triggered the event.
						 * <b>Note:</b> This parameter will not be sent unless the ESC key is pressed.
						 * @since 1.115
						 */
						escPressed : {type : "boolean"}
					}
				},

				/**
				 * This event is fired when the user changes the value of the search field. Unlike the <code>liveChange</code> event, the <code>change</code> event is not fired for each key press.
				 * @since 1.77
				 */
				change: {
					parameters: {

						/**
						 The new value of the control.
						 */
						value: { type: "string" }
					}
				},

				/**
				 * This event is fired each time when the value of the search field is changed by the user - e.g. at each key press. Do not invalidate a focused search field, especially during the liveChange event.
				 * @since 1.9.1
				 */
				liveChange : {
					parameters : {

						/**
						 * Current search string.
						 */
						newValue : {type : "string"}
					}
				},

				/**
				 * This event is fired when the search field is initially focused or its value is changed by the user.
				 * This event means that suggestion data should be updated, in case if suggestions are used.
				 * Use the value parameter to create new suggestions for it.
				 * @since 1.34
				 */
				suggest : {
					parameters : {
						/**
						 * Current search string of the search field.
						 */
						suggestValue : {type : "string"}
					}
				}
			}
		},

		renderer: SearchFieldRenderer
	});

	EnabledPropagator.call(SearchField.prototype);
	IconPool.insertFontFaceStyle();

	SearchField.prototype.init = function() {
		// last changed value
		this._lastValue = "";
	};

	SearchField.prototype.getFocusDomRef = function() {
		return this.getInputElement();
	};

	SearchField.prototype.getFocusInfo = function() {
		var oFocusInfo = Control.prototype.getFocusInfo.call(this),
			oInput = this.getDomRef("I");
		if (oInput) {
			// remember the current cursor position
			jQuery.extend(oFocusInfo, {
				cursorPos: jQuery(oInput).cursorPos()
			});
		}
		return oFocusInfo;
	};

	SearchField.prototype.applyFocusInfo = function(oFocusInfo) {
		Control.prototype.applyFocusInfo.call(this, oFocusInfo);
		if ("cursorPos" in oFocusInfo) {
			this.$("I").cursorPos(oFocusInfo.cursorPos);
		}
		return this;
	};

	SearchField.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	/**
	 * Returns the inner <input> element.
	 *
	 * @private
	 */
	SearchField.prototype.getInputElement = function () {
		return this.getDomRef("I");
	};

	SearchField.prototype.onBeforeRendering = function() {
		this._unregisterEventListeners();
		updateSuggestions(this);
	};

	SearchField.prototype.onAfterRendering = function() {
		this._lastValue = this.getValue();

		// DOM element for the embedded HTML input:
		var inputElement = this.getInputElement();
		// DOM element for the reset button:
		this._resetElement = this.getDomRef("reset");

		// Bind events
		//  search: user has pressed "Enter" button -> fire search event, do search
		//  change: user has focused another control on the page -> do not trigger a search action
		//  input:  key press or paste/cut -> fire liveChange event
		jQuery(inputElement)
			.on("input", this.onInput.bind(this))
			.on("search", this.onSearch.bind(this))
			.on("change", this.onChange.bind(this))
			.on("focus", this.onFocus.bind(this))
			.on("blur", this.onBlur.bind(this));

		jQuery(this.getDomRef("F"))
			.on("click", this.onFormClick.bind(this))
			.on("submit", function (e) {
				e.preventDefault();
			});

		if (Device.system.desktop || Device.system.combi) {
			// Listen to native touchstart/mousedown.
			this.$().on("touchstart mousedown", this.onButtonPress.bind(this));

			// FF does not set :active by preventDefault, use class:
			if (Device.browser.firefox) {
				this.$().find(".sapMSFB").on("mouseup mouseout", function(oEvent){
					jQuery(oEvent.target).removeClass("sapMSFBA");
				});
			}
		}
	};

	SearchField.prototype.onThemeChanged = function() {
		if (this._oSuggest) {
			this._oSuggest.setPopoverMinWidth();
		}
	};

	/**
	 * Clears the value
	 * @private
	 * @param {object} [oOptions] Options
	 * @param {string} [oOptions.value=""] The new value to be set
	 * @param {boolean} [oOptions.clearButton] Whether the clear button was pressed
	 */
	SearchField.prototype.clear = function(oOptions) {

		// in case of escape, revert to the original value, otherwise clear with ""
		var value = oOptions && oOptions.value || "";
		var bClearButtonPressed = !!(oOptions && oOptions.clearButton);

		if (!this.getInputElement() || this.getValue() === value) {
			return;
		}

		this._updateValue(value);
		updateSuggestions(this);
		this.fireLiveChange({newValue: value});
		this._fireChangeEvent();

		var mParams = {
			query: value,
			refreshButtonPressed: false,
			clearButtonPressed: bClearButtonPressed,
			searchButtonPressed: false
		};

		if (!bClearButtonPressed) {
			mParams.escPressed = true;
		}

		this.fireSearch(mParams);
	};

	/**
	 *  Destroys suggestion object if exists
	 */
	SearchField.prototype.exit = function () {
		this._unregisterEventListeners();

		if (this._oSuggest) {
			this._oSuggest.destroy(true);
			this._oSuggest = null;
		}
	};

	SearchField.prototype.onButtonPress = function(oEvent) {

		if (oEvent.originalEvent.button === 2) {
			return; // no action on the right mouse button
		}

		var inputElement = this.getInputElement();

		// do not remove focus from the inner input but allow it to react on clicks
		if (document.activeElement === inputElement && oEvent.target !== inputElement) {
			oEvent.preventDefault();
		}
		// FF does not set :active by preventDefault, use class:
		if (Device.browser.firefox){
			var button = jQuery(oEvent.target);
			if (button.hasClass("sapMSFB")) {
				button.addClass("sapMSFBA");
			}
		}
	};

	SearchField.prototype.ontouchstart = function(oEvent) {
		this._oTouchStartTarget = oEvent.target;
	};

	SearchField.prototype.ontouchend = function(oEvent) {

		if (oEvent.originalEvent.button === 2) {
			return; // no action on the right mouse button
		}

		var oSrc = oEvent.target,
			bValidTouchStartTarget = true,
			oInputElement = this.getInputElement();

		// If touch started on SearchField, check the start target.
		if (this._oTouchStartTarget) {
			bValidTouchStartTarget = this._oTouchStartTarget === oSrc;
			this._oTouchStartTarget = null;
		}

		if (oSrc.id == this.getId() + "-reset" && bValidTouchStartTarget) {

			closeSuggestions(this);
			this._bSuggestionSuppressed = true; // never open suggestions after reset

			var bEmpty = !this.getValue();

			// When a user presses "x":
			// - always focus input on desktop
			// - focus input only if the soft keyboard is already opened on touch devices (avoid keyboard jumping)
			// When there was no "x" visible (bEmpty):
			// - always focus
			var active = document.activeElement;
			if ((Device.system.desktop
				|| bEmpty
				|| /(INPUT|TEXTAREA)/i.test(active.tagName) || active === this._resetElement)
				&& (active !== oInputElement)) {
				oInputElement.focus();
			}

			this.clear({ clearButton: true });
		} else if (oSrc.id == this.getId() + "-search" && bValidTouchStartTarget) {

			closeSuggestions(this);

			// focus input only if the button with the search icon is pressed
			if (Device.system.desktop && !this.getShowRefreshButton() && (document.activeElement !== oInputElement)) {
				oInputElement.focus();
			}
			var bRefreshButtonPressed = !!(this.getShowRefreshButton() && !this.hasStyleClass("sapMFocus"));
			this._fireChangeEvent();
			this.fireSearch({
				query: this.getValue(),
				refreshButtonPressed: bRefreshButtonPressed,
				clearButtonPressed: false,
				searchButtonPressed: !bRefreshButtonPressed
			});
		} else {
			// focus by form area touch outside of the input field
			this.onmouseup(oEvent);
		}
	};

	SearchField.prototype.onmouseup = function(oEvent) {
		// on phone if the input is on focus and user taps again on it
		if (Device.system.phone &&
			this.getEnabled() &&
			oEvent.target.tagName == "INPUT" &&
			document.activeElement === oEvent.target &&
			!suggestionsOn(this)) {
			this.onFocus(oEvent);
		}
	};

	SearchField.prototype.onFormClick = function(oEvent) {
		// focus if mouse-clicked on the form outside of the input
		if (this.getEnabled() && oEvent.target.tagName == "FORM") {
			this.getInputElement().focus();
		}
	};

	/**
	 * Process the search event
	 *
	 * When a user deletes the search string using the "x" button,
	 * change event is not fired.
	 * Call setValue() to ensure that the value property is updated.
	 *
	 * @private
	 */
	SearchField.prototype.onSearch = function(event) {
		var value = this.getInputElement().value;
		this._updateValue(value);
		this._fireChangeEvent();
		this.fireSearch({
			query: value,
			refreshButtonPressed: false,
			clearButtonPressed: false,
			searchButtonPressed: false
		});

		// If the user has pressed the search button on the soft keyboard - close it,
		// but only in case of soft keyboard:
		if (!Device.system.desktop) {
			this._blur();
		}
	};

	/**
	 * Blur the input field
	 *
	 * @private
	 */
	SearchField.prototype._blur = function() {
		var that = this;
		window.setTimeout( function(){
			var inputElement = that.getInputElement();
			if (inputElement) {
				inputElement.blur();
			}
		}, 13);
	};

	/**
	 * Process the <code>change</code> event
	 * @private
	 */
	SearchField.prototype.onChange = function(event) {
		this._fireChangeEvent();
	};

	/**
	 * Handles the <code>sapfocusleave</code> event of the input.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	SearchField.prototype.onsapfocusleave = function(oEvent) {
		// because the internal input HTML element is in a Form,
		// we need to call preventDefault() when Enter is pressed,
		// but this breaks the firing of the standard "input.onchange" event in this case:
		// "type something - Enter - Ctrl+A - Ctrl+X - Tab"
		// for that we're calling the following method here
		this._fireChangeEvent();
	};

	/**
	 * Fires the <code>change</code> event if needed
	 * @private
	 */
	SearchField.prototype._fireChangeEvent = function() {

		var value = this.getInputElement().value;

		if (this._lastValue === value) {
			return;
		}

		this._lastValue = value;

		this.fireChange({
			value: value
		});
	};

	/**
	 * Process the input event (key press or paste). Update value and fire the liveChange event.
	 * @param {jQuery.Event} oEvent jQuery Event
	 * @private
	 */
	SearchField.prototype.onInput = function() {
		var value = this.getInputElement().value;

		this._updateValue(value);
		this.fireLiveChange({newValue: value});
		if (this.getEnableSuggestions()) {
			if (this._iSuggestDelay) {
				clearTimeout(this._iSuggestDelay);
			}

			this._iSuggestDelay = setTimeout(function(){
				this.fireSuggest({suggestValue: value});
				updateSuggestions(this);
				this._iSuggestDelay = null;
			}.bind(this), 400);
		}
	};

	/**
	 * Handle the key down event.
	 *
	 * @param {jQuery.Event} event The keyboard event.
	 * @private
	 */
	SearchField.prototype.onkeydown = function(event) {
		var selectedIndex;
		var suggestionItem;
		var value;

		switch (event.which) {
			case KeyCodes.F5:
			case KeyCodes.ENTER:
				// show search button active state
				this.$("search").toggleClass("sapMSFBA", true);

				// do not refresh browser window
				event.stopPropagation();
				event.preventDefault();

				if (suggestionsOn(this)) {
					// always close suggestions by Enter and F5:
					closeSuggestions(this);

					// take over the value from the selected suggestion list item, if any is selected:
					if ((selectedIndex = this._oSuggest.getSelected()) >= 0) {
						suggestionItem = this.getSuggestionItems()[selectedIndex];
						this._updateValue(suggestionItem.getSuggestionText());
					}
				}

				this._fireChangeEvent();
				this.fireSearch({
					query: this.getValue(),
					suggestionItem: suggestionItem,
					refreshButtonPressed: this.getShowRefreshButton() && event.which === KeyCodes.F5,
					clearButtonPressed: false,
					searchButtonPressed: false
				});
				break;
			case KeyCodes.ESCAPE:
				// Escape button:
				//   - close suggestions ||
				//   - restore the original value ||
				//   - clear the value ||
				//   - close the parent dialog
				if (suggestionsOn(this)) {
					closeSuggestions(this);
					event.setMarked(); // do not close the parent dialog
				} else {
					value = this.getValue();
					if (value === this._sOriginalValue) {
						this._sOriginalValue = ""; // clear the field if the value was original
					}
					this.clear({ value: this._sOriginalValue });
					if (value !== this.getValue()) {
						event.setMarked(); // if changed, do not close the parent dialog because the user has not finished yet
					}
				}
				// Chrome fires input event on escape,
				// prevent it to avoid doubled change/liveChange:
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle the key up event.
	 *
	 * @param {jQuery.Event} event The keyboard event.
	 * @private
	 */
	SearchField.prototype.onkeyup = function(event) {

		if (event.which === KeyCodes.F5 ||
			event.which === KeyCodes.ENTER) {
			// hide search button active state
			this.$("search").toggleClass("sapMSFBA", false);
		}
	};

	/**
	 * Highlights the background on focus
	 *
	 * @param {object} oEvent jQuery event
	 */
	SearchField.prototype.onFocus = function(oEvent) {
		this.addStyleClass("sapMFocus");

		// Remember the original value for the case when the user presses ESC
		this._sOriginalValue = this.getValue();

		if (this.getEnableSuggestions()) {
			// suggest event must be fired by first focus too
			if (!this._bSuggestionSuppressed) {
				this.fireSuggest({suggestValue: this.getValue()});
			} else {
				this._bSuggestionSuppressed = false;
			}
		}
	};

	/**
	 * Restores the background color on blur
	 *
	 * @param {object} oEvent jQuery event
	 */
	SearchField.prototype.onBlur = function(oEvent) {

		this.removeStyleClass("sapMFocus");

		if (this._bSuggestionSuppressed) {
			this._bSuggestionSuppressed = false; // void the reset button handling
		}
	};

	SearchField.prototype._updateValue = function(value) {
		value = value || "";
		var inputElement = this.getInputElement();
		if (inputElement) {

			if (inputElement.value !== value) {
				inputElement.value = value;
			}

			var $this = this.$();
			if ($this.hasClass("sapMSFVal") == !value) {
				$this.toggleClass("sapMSFVal", !!value);
			}
		}

		this.setProperty("value", value, true);
		return this;
	};

	SearchField.prototype._unregisterEventListeners = function () {
		var inputElement = this.getInputElement();

		if (inputElement) {
			this.$().find(".sapMSFB").off();
			this.$().off();
			jQuery(this.getDomRef("F")).off();
			jQuery(inputElement).off();
		}
	};

	/* =========================================================== */
	/* Suggestions: keyboard navigation                            */
	/* =========================================================== */

	/**
	 * Handle when F4 or Alt + DOWN arrow are pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsapshow = function(oEvent) {
		if (this.getEnableSuggestions()) {
			if (suggestionsOn(this)) {
				closeSuggestions(this); // UX requirement
			} else {
				this.fireSuggest({suggestValue: this.getValue()});
			}
		}
	};

	/**
	 * Handle when Alt + UP arrow are pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 * @function
	 */
	SearchField.prototype.onsaphide = function(oEvent) {
		this.suggest(false);
	};

	function selectSuggestionItem(oSF, oEvent, iIndex, bRelative) {
		var index;
		if (suggestionsOn(oSF)) {
			index = oSF._oSuggest.setSelected(iIndex, bRelative);
			if (index >= 0) {
				oSF._updateValue(oSF.getSuggestionItems()[index].getSuggestionText());
			}
			oEvent.preventDefault();
		}
	}

	/**
	 * Handles the <code>sapdown</code> pseudo event when keyboard DOWN arrow key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsapdown = function(oEvent) {
		selectSuggestionItem(this, oEvent, 1, true);
	};

	/**
	 * Handles the <code>sapup</code> pseudo event when keyboard UP arrow key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsapup = function(oEvent) {
		selectSuggestionItem(this, oEvent, -1, true);
	};

	/**
	 * Handles the <code>saphome</code> pseudo event when keyboard Home key is pressed.
	 * The first selectable item is selected.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsaphome = function(oEvent) {
		selectSuggestionItem(this, oEvent, 0, false);
	};

	/**
	 * Handles the <code>sapend</code> pseudo event when keyboard End key is pressed.
	 * The last selectable item is selected.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsapend = function(oEvent) {
		var iLastIndex = this.getSuggestionItems().length - 1;
		selectSuggestionItem(this, oEvent, iLastIndex, false);
	};

	/**
	 * Handles the <code>sappagedown</code> pseudo event when keyboard page down key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsappagedown = function(oEvent) {
		selectSuggestionItem(this, oEvent, 10, true);
	};

	/**
	 * Handles the <code>sappageup</code> pseudo event when keyboard page up key is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsappageup = function(oEvent) {
		selectSuggestionItem(this, oEvent, -10, true);
	};

	/* =========================================================== */
	/* Suggestions: helper functions                               */
	/* =========================================================== */

	/**
	 * Applies Suggestion Acc
	 *
	 * @private
	 */
	SearchField.prototype._applySuggestionAcc = function () {
		var sAriaText = "",
			iNumItems = this.getSuggestionItems().length,
			oRb = Library.getResourceBundleFor("sap.m");

		// add items to list
		if (iNumItems === 1) {
			sAriaText = oRb.getText("INPUT_SUGGESTIONS_ONE_HIT");
		} else if (iNumItems > 1) {
			sAriaText = oRb.getText("INPUT_SUGGESTIONS_MORE_HITS", [iNumItems]);
		} else {
			sAriaText = oRb.getText("INPUT_SUGGESTIONS_NO_HIT");
		}

		// update Accessibility text for suggestion
		this.$("SuggDescr").text(sAriaText);
	};

	/**
	 * Function returns DOM element which acts as reference point for the opening suggestion menu
	 *
	 * @protected
	 * @since 1.34
	 * @returns {Element} the DOM element at which to open the suggestion list
	 */
	SearchField.prototype.getPopupAnchorDomRef = function() {
		return this.getDomRef("F"); // the form element inside the search  field is the anchor
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
	SearchField.prototype._getToolbarInteractive = function () {
		return true;
	};

	/**
	 * Closes the suggestions list.
	 *
	 * @param {sap.m.SearchField} oSF a SearchField instance
	 */
	function closeSuggestions(oSF) {
		oSF._oSuggest && oSF._oSuggest.close();
	}

	/**
	 * Opens the suggestions list.
	 *
	 * @param {sap.m.SearchField} oSF a SearchField instance
	 */
	function openSuggestions(oSF) {
		if (oSF.getEnableSuggestions()) {
			if (!oSF._oSuggest) {
				oSF._oSuggest = new Suggest(oSF);
			}
			oSF._oSuggest.open();
		}
	}

	/**
	 * Check if the suggestions list is opened.
	 *
	 * @param {sap.m.SearchField} oSF a SearchField instance
	 */
	function suggestionsOn(oSF) {
		return oSF._oSuggest && oSF._oSuggest.isOpen();
	}

	/**
	 * Toggle visibility of the suggestion list.
	 *
	 * @param {boolean} [bShow=true] If the value is <code>true</code> the suggestions are displayed.
	 * If the value is <code>false</code> the suggestions are hidden.
	 * An empty suggestion list is not shown on desktop and tablet devices.<br>
	 *
	 * This method may be called only as a response to the <code>suggest</code> event to ensure that the suggestion list is shown
	 * at the moment when the user expects it.
	 *
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.34
	 */
	SearchField.prototype.suggest = function(bShow) {
		if (this.getEnableSuggestions()) {
			bShow = bShow === undefined || !!bShow;
			if (bShow && (this.getSuggestionItems().length || Device.system.phone)) {
				openSuggestions(this);
			} else {
				closeSuggestions(this);
			}
		}
		return this;
	};

	function updateSuggestions(oSF) {
		oSF._oSuggest && oSF._oSuggest.update();
	}

	return SearchField;
});