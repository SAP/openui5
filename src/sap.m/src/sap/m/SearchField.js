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
		jQuery
	) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	SearchFieldRenderer.oSearchFieldToolTips = {
		SEARCH_BUTTON_TOOLTIP: oResourceBundle.getText("SEARCHFIELD_SEARCH_BUTTON_TOOLTIP"),
		RESET_BUTTON_TOOLTIP: oResourceBundle.getText("SEARCHFIELD_RESET_BUTTON_TOOLTIP"),
		REFRESH_BUTTON_TOOLTIP: oResourceBundle.getText("SEARCHFIELD_REFRESH_BUTTON_TOOLTIP")
	};

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
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SearchField = Control.extend("sap.m.SearchField", /** @lends sap.m.SearchField.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		properties : {

			/**
			 * Input Value.
			 */
			value : {type : "string", group : "Data", defaultValue : null, bindable : "bindable"},

			/**
			 * Defines the CSS width of the input. If not set, width is 100%.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

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
			 * Text shown when no value available. Default placeholder text is the word "Search" in the current local language (if supported) or in English.
			 */
			placeholder : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Set to false to hide the magnifier icon.
			 * @deprecated Since version 1.16.0.
			 * This parameter is deprecated. Use "showSearchButton" instead.
			 */
			showMagnifier : {type : "boolean", group : "Misc", defaultValue : true, deprecated: true},

			/**
			 * Set to true to display a refresh button in place of the search icon. By pressing the refresh button or F5 key on keyboard, the user can reload the results list without changing the search string.
			 * @since 1.16
			 */
			showRefreshButton : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Tooltip text of the refresh button. If it is not set, the  Default tooltip text is the word "Refresh" in the current local language (if supported) or in English. Tooltips are not displayed on touch devices.
			 * @since 1.16
			 */
			refreshButtonTooltip : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Set to true to show the search button with the magnifier icon.
			 * If false, both the search and refresh buttons are not displayed even if the "showRefreshButton" property is true.
			 * @since 1.23
			 */
			showSearchButton : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If true, a <code>suggest</code> event is fired when user types in the input and when the input is focused.
			 * On a phone device, a full screen dialog with suggestions is always shown even if the suggestions list is empty.
			 * @since 1.34
			 */
			enableSuggestions : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Normally, search text is selected for copy when the SearchField is focused by keyboard navigation. If an application re-renders the SearchField during the liveChange event, set this property to false to disable text selection by focus.
			 * @since 1.20
			 * @deprecated Since version 1.38.
			 * This parameter is deprecated and has no effect in run time. The cursor position of a focused search field is restored after re-rendering automatically.
			 */
			selectOnFocus : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true}
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
					clearButtonPressed : {type : "boolean"}
				}
			},

			/**
			 * This event is fired when the value of the search field is changed by a user - e.g. at each key press. Do not invalidate or re-render a focused search field, especially during the liveChange event.
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
	}});

	EnabledPropagator.call(SearchField.prototype);

	IconPool.insertFontFaceStyle();
	SearchField.prototype.init = function() {

		// Default placeholder: "Search"
		this.setProperty("placeholder", oResourceBundle.getText("FACETFILTER_SEARCH"),true);

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

	// returns correct the width that applied by design
	SearchField.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};

	SearchField.prototype._hasPlaceholder = (function () {
		return "placeholder" in document.createElement("input");
	}());

	/**
	 * Returns the inner <input> elment.
	 *
	 * @private
	 */
	SearchField.prototype.getInputElement = function () {
		return this.getDomRef("I");
	};

	SearchField.prototype.onBeforeRendering = function() {
		var inputElement = this.getInputElement();

		if (inputElement) {
			this.$().find(".sapMSFB").off();
			this.$().off();
			jQuery(this.getDomRef("F")).off();
			jQuery(inputElement).off();
		}
	};

	SearchField.prototype.onAfterRendering = function() {

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
			.on("focus", this.onFocus.bind(this))
			.on("blur", this.onBlur.bind(this));

		jQuery(this.getDomRef("F"))
			.on("click", this.onFormClick.bind(this));

		if (Device.system.desktop || Device.system.combi) {
			// Listen to native touchstart/mousedown.
			this.$().on("touchstart mousedown", this.onButtonPress.bind(this));

			// FF does not set :active by preventDefault, use class:
			if (Device.browser.firefox) {
				this.$().find(".sapMSFB").on("mouseup mouseout", function(oEvent){
					jQuery(oEvent.target).removeClass("sapMSFBA");
				});
			}
		} else if (window.PointerEvent) {
			// IE Mobile sets active element to the reset button, save the previous reference// TODO remove after 1.62 version
			jQuery(this._resetElement).on("touchstart", function(){
				this._active = document.activeElement;
			}.bind(this));
		}

		var oCore = sap.ui.getCore();

		if (!oCore.isThemeApplied()) {
			oCore.attachThemeChanged(this._handleThemeLoad, this);
		}
	};

	SearchField.prototype._handleThemeLoad = function() {
		if (this._oSuggest) {
			this._oSuggest.setPopoverMinWidth();
		}
		var oCore = sap.ui.getCore();
		oCore.detachThemeChanged(this._handleThemeLoad, this);
	};

	SearchField.prototype.clear = function(oOptions) {

		// in case of escape, revert to the original value, otherwise clear with ""
		var value = oOptions && oOptions.value || "";

		if (!this.getInputElement() || this.getValue() === value) {
			return;
		}

		this.setValue(value);
		updateSuggestions(this);
		this.fireLiveChange({newValue: value});
		this.fireSearch({
			query: value,
			refreshButtonPressed: false,
			clearButtonPressed: !!(oOptions && oOptions.clearButton)
		});
	};
	/**
	 *  Destroys suggestion object if exists
	 */
	SearchField.prototype.exit = function () {
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

	SearchField.prototype.ontouchend = function(oEvent) {

		if (oEvent.originalEvent.button === 2) {
			return; // no action on the right mouse button
		}

		var oSrc = oEvent.target,
			oInputElement = this.getInputElement();

		if (oSrc.id == this.getId() + "-reset") {

			closeSuggestions(this);
			this._bSuggestionSuppressed = true; // never open suggestions after reset

			var bEmpty = !this.getValue();
			this.clear({ clearButton: true });

			// When a user presses "x":
			// - always focus input on desktop
			// - focus input only if the soft keyboard is already opened on touch devices (avoid keyboard jumping)
			// When there was no "x" visible (bEmpty):
			// - always focus
			var active = document.activeElement;
			if (((Device.system.desktop
				|| bEmpty
				|| /(INPUT|TEXTAREA)/i.test(active.tagName) || active ===  this._resetElement && this._active === oInputElement) // IE Mobile// TODO remove after 1.62 version
				) && (active !== oInputElement)) {
				oInputElement.focus();
			}
		} else 	if (oSrc.id == this.getId() + "-search") {

			closeSuggestions(this);

			// focus input only if the button with the search icon is pressed
			if (Device.system.desktop && !this.getShowRefreshButton() && (document.activeElement !== oInputElement)) {
				oInputElement.focus();
			}
			this.fireSearch({
				query: this.getValue(),
				refreshButtonPressed: !!(this.getShowRefreshButton() && !this.$().hasClass("sapMFocus")),
				clearButtonPressed: false
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
		this.setValue(value);
		this.fireSearch({
			query: value,
			refreshButtonPressed: false,
			clearButtonPressed: false
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
	 * Process the change event. Update value and do not fire any control events
	 * because the user has focused another control on the page without intention to do a search.
	 * @private
	 */
	SearchField.prototype.onChange = function(event) {
		this.setValue(this.getInputElement().value);
	};

	/**
	 * Process the input event (key press or paste). Update value and fire the liveChange event.
	 * @param {oEvent} jQuery Event
	 * @private
	 */
	SearchField.prototype.onInput = function(oEvent) {
		var value = this.getInputElement().value;

		// IE fires an input event when an empty input with a placeholder is focused or loses focus.// TODO remove after 1.62 version
		// Check if the value has changed, before firing the liveChange event.
		if (value != this.getValue()) {
			this.setValue(value);
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
						this.setValue(suggestionItem.getSuggestionText());
					}
				}

				this.fireSearch({
					query: this.getValue(),
					suggestionItem: suggestionItem,
					refreshButtonPressed: this.getShowRefreshButton() && event.which === KeyCodes.F5,
					clearButtonPressed: false
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
	 * Highlights the background on focus and sets tooltips
	 *
	 * @param {object} oEvent jQuery event
	 */
	SearchField.prototype.onFocus = function(oEvent) {

		// IE does not really focuses inputs and does not blur them if the document itself is not focused// TODO remove after 1.62 version
		if (Device.browser.internet_explorer && !document.hasFocus()) {// TODO remove after 1.62 version
			return;
		}

		this.$().toggleClass("sapMFocus", true);

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
		this._setToolTips(oEvent.type);
	};

	/**
	 * Restores the background color on blur and sets tooltips
	 *
	 * @param {object} oEvent jQuery event
	 */
	SearchField.prototype.onBlur = function(oEvent) {

		this.$().toggleClass("sapMFocus", false);

		if (this._bSuggestionSuppressed) {
			this._bSuggestionSuppressed = false; // void the reset button handling
		}

		this._setToolTips(oEvent.type);
	};

	/**
	 * Sets the tooltip according to the current state of <code>sap.m.SearchField</code>
	 *
	 * @param {string} sTypeEvent type of event
	 * @private
	 */
	SearchField.prototype._setToolTips = function(sTypeEvent) {

		var $searchSelector = this.$("search"),
			$resetSelector = this.$("reset");
		// restore tooltip of the refresh button
		if (this.getShowRefreshButton()) {
			//onFocus: only search button is shown
			if (sTypeEvent === "focus") {
				$searchSelector.attr("title", SearchFieldRenderer.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP);
			} else if (sTypeEvent === "blur"){
				//onBlur: 'Search' button becomes 'Refresh' button
				var sRefreshToolTipValue = this.getRefreshButtonTooltip(),
					sTooltip = sRefreshToolTipValue === "" ? SearchFieldRenderer.oSearchFieldToolTips.REFRESH_BUTTON_TOOLTIP : sRefreshToolTipValue;
				if (sTooltip) {
					$searchSelector.attr("title", sTooltip);
				}
			}
		}

		// "reset" button becomes "search" button on blur
		if (this.getValue() === "" ) {
			$resetSelector.attr("title", SearchFieldRenderer.oSearchFieldToolTips.SEARCH_BUTTON_TOOLTIP);
		} else {
			$resetSelector.attr("title", SearchFieldRenderer.oSearchFieldToolTips.RESET_BUTTON_TOOLTIP);
		}
	};

	SearchField.prototype.setValue = function(value) {
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
		this._setToolTips();
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
				oSF.setValue(oSF.getSuggestionItems()[index].getSuggestionText());
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
	 * Function returns DOM element which acts as reference point for the opening suggestion menu
	 *
	 * @protected
	 * @since 1.34
	 * @returns {domRef} the DOM element at which to open the suggestion list
	 */
	SearchField.prototype.getPopupAnchorDomRef = function() {
		return this.getDomRef("F"); // the form element inside the search  field is the anchor
	};

	/**
	 * Close the suggestions list.
	 *
	 * @param {sap.m.SearchField} oSF a SearchField instance
	 */
	function closeSuggestions(oSF) {
		oSF._oSuggest && oSF._oSuggest.close();
	}

	/**
	 * Close the suggestions list.
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
	 * @param {boolean | undefined} bShow set to <code>true</code> to display suggestions and <code>false</code> to hide them. Default value is <code>true</code>.
	 * An empty suggestion list is not shown on desktop and tablet devices.<br>
	 *
	 * This method may be called only as a response to the <code>suggest</code> event to ensure that the suggestion list is shown
	 * at the moment when the user expects it.
	 *
	 * @returns {sap.m.SearchField} <code>this</code> to allow method chaining
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

	/* =========================================================== */
	/*           begin: aggregation methods overrides		       */
	/* =========================================================== */

	// Suppress invalidate by changes in the suggestionItems aggregation.
	var SUGGESTION_ITEMS = "suggestionItems";

	SearchField.prototype.insertSuggestionItem = function(oObject, iIndex, bSuppressInvalidate) {
		updateSuggestions(this);
		return Control.prototype.insertAggregation.call(this, SUGGESTION_ITEMS, oObject, iIndex, true);
	};

	SearchField.prototype.addSuggestionItem = function(oObject, bSuppressInvalidate) {
		updateSuggestions(this);
		return Control.prototype.addAggregation.call(this, SUGGESTION_ITEMS, oObject, true);
	};

	SearchField.prototype.removeSuggestionItem = function(oObject, bSuppressInvalidate) {
		updateSuggestions(this);
		return Control.prototype.removeAggregation.call(this, SUGGESTION_ITEMS, oObject, true);
	};

	SearchField.prototype.removeAllSuggestionItems = function(bSuppressInvalidate) {
		updateSuggestions(this);
		return Control.prototype.removeAllAggregation.call(this, SUGGESTION_ITEMS, true);
	};

	/* =========================================================== */
	/*           end: aggregation methods overrides		           */
	/* =========================================================== */

	return SearchField;

});