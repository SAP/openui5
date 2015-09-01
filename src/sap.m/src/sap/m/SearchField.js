/*!
 * ${copyright}
 */

// Provides control sap.m.SearchField.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/ui/core/InvisibleText', 'sap/ui/core/theming/Parameters', './Suggest'],
	function(jQuery, library, Control, EnabledPropagator, IconPool, InvisibleText, Parameters, Suggest) {
	"use strict";


	
	/**
	 * Constructor for a new SearchField.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Enables users to input a search string.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.SearchField
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SearchField = Control.extend("sap.m.SearchField", /** @lends sap.m.SearchField.prototype */ { metadata : {
	
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
			 * Tooltip text of the refresh button. If it is not set, the tooltip of the SearchField (if any) is displayed. Tooltips are not displayed on touch devices.
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
			 */
			selectOnFocus : {type : "boolean", group : "Behavior", defaultValue : true}
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
	
	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	// create an F5 ARIA announcement and remember its ID for later use in the renderer:
	SearchField.prototype._sAriaF5LabelId = new sap.ui.core.InvisibleText({
		text: oRb.getText("SEARCHFIELD_ARIA_F5")
	}).toStatic().getId();

	SearchField.prototype.init = function() {
	
		// IE9 does not fire input event when characters are deleted in an input field, use keyup instead
		this._inputEvent = sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10 ? "keyup" : "input";

		// Default placeholder: "Search"
		this.setProperty("placeholder", oRb.getText("FACETFILTER_SEARCH"),true);
	};
	
	SearchField.prototype.getFocusDomRef = function() {
		return this._inputElement;
	};
	
	// returns correct the width that applied by design
	SearchField.prototype.getWidth = function() {
		return this.getProperty("width") || "100%";
	};
	
	SearchField.prototype._hasPlacehoder = (function () {
		return "placeholder" in document.createElement("input");
	}());
	
	SearchField.prototype.onBeforeRendering = function() {
		if (this._inputElement) {
			if (sap.ui.Device.browser.firefox) {
				this.$().find(".sapMSFB").unbind();
			}
			this.$().unbind();
			jQuery(this._inputElement).unbind();
			this._inputElement = null;
		}
	};
	
	SearchField.prototype.onAfterRendering = function() {
	
		// DOM element for the embedded HTML input:
		this._inputElement = this.getDomRef("I");
	
		// Bind events
		//  search: user has pressed "Enter" button -> fire search event, do search
		//  change: user has focused another control on the page -> do not trigger a search action
		//  input:  key press or paste/cut -> fire liveChange event
		jQuery(this._inputElement)
			.bind(this._inputEvent, jQuery.proxy(this.onInput,  this))
			.bind("search", jQuery.proxy(this.onSearch, this))
			.bind("change", jQuery.proxy(this.onChange, this))
			.bind("focus",  jQuery.proxy(this.onFocus,  this))
			.bind("blur",   jQuery.proxy(this.onBlur,  this));
		
		if (sap.ui.Device.system.desktop || sap.ui.Device.system.combi) {
			// Listen to native touchstart/mousedown.
			this.$().bind("touchstart mousedown", jQuery.proxy(this.onButtonPress,  this));

			// FF does not set :active by preventDefault, use class:
			if (sap.ui.Device.browser.firefox) { 
				this.$().find(".sapMSFB").bind("mouseup mouseout", function(oEvent){
					jQuery(oEvent.target).removeClass("sapMSFBA");
				});
			}
		}
	};
	
	SearchField.prototype.clear = function(oOptions) {
		if (!this._inputElement || this.getValue() === "") {
			return;
		}
	
		this.setValue("");
		updateSuggestions(this);
		this.fireLiveChange({newValue: ""});
		this.fireSearch({
			query: "",
			refreshButtonPressed: false,
			clearButtonPressed: !!(oOptions && oOptions.clearButton)
		});
	};
	
	SearchField.prototype.onButtonPress = function(oEvent) {
	
		if (oEvent.originalEvent.button === 2) {
			return; // no action on the right mouse button
		}

		// do not remove focus from the inner input but allow it to react on clicks
		if (document.activeElement === this._inputElement && oEvent.target !== this._inputElement) {
			oEvent.preventDefault();
		}
		// FF does not set :active by preventDefault, use class:
		if (sap.ui.Device.browser.firefox){
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
	
		var oSrc = oEvent.target;
	
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
			if ((sap.ui.Device.system.desktop || bEmpty || /(INPUT|TEXTAREA)/i.test(active.tagName) ) && (active !== this._inputElement)) {
				this._inputElement.focus();
			}
		} else 	if (oSrc.id == this.getId() + "-search") {

			closeSuggestions(this);

			// focus input only if the button with the search icon is pressed
			if (sap.ui.Device.system.desktop && !this.getShowRefreshButton() && (document.activeElement !== this._inputElement)) {
				this._inputElement.focus();
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
	
		// focus if mouse-clicked on the form outside of the input
		if (this.getEnabled() && oEvent.target.tagName == "FORM") {
			this._inputElement.focus();
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
		var value = this._inputElement.value;
		this.setValue(value);
		this.fireSearch({query: value});
	
		// If the user has pressed the search button on the soft keyboard - close it,
		// but only in case of soft keyboard:
		if (!sap.ui.Device.system.desktop) {
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
			if (that._inputElement) {
				that._inputElement.blur();
			}
		}, 13);
	};
	
	/**
	 * Process the change event. Update value and do not fire any control events
	 * because the user has focused another control on the page without intention to do a search.
	 * @private
	 */
	SearchField.prototype.onChange = function(event) {
		this.setValue(this._inputElement.value);
	};
	
	/**
	 * Process the input event (key press or paste). Update value and fire the liveChange event.
	 * @private
	 */
	SearchField.prototype.onInput = function(event) {
		var value = this._inputElement.value;
	
		// IE fires an input event when an empty input with a placeholder is focused or loses focus.
		// Check if the value has changed, before firing the liveChange event.
		if (value != this.getValue()) {
			this.setValue(value);
			this.fireLiveChange({newValue: value});

			if (this.getEnableSuggestions()) {
				this.fireSuggest({suggestValue: value});
				updateSuggestions(this);
			}
		}
	};
	
	/**
	 * Handle the key down event for F5 on all browsers.
	 *
	 * @param {jQuery.Event}
	 *            event - the keyboard event.
	 * @private
	 */
	SearchField.prototype.onkeydown = function(event) {
		if (event.which === jQuery.sap.KeyCodes.F5 || event.which === jQuery.sap.KeyCodes.ENTER) {
	
			// show search button active state
			this.$("search").toggleClass("sapMSFBA", true);

			// do not refresh browser window
			event.stopPropagation();
			event.preventDefault();
		}
		if (event.which === jQuery.sap.KeyCodes.ESCAPE && suggestionsOn(this)) {
			// close picker
			closeSuggestions(this);
	
			// do not reset the search field value
			event.stopPropagation();
			event.preventDefault();
		}
	};
	
	/**
	 * Handle the key up event for F5 on all browsers.
	 *
	 * @param {jQuery.Event}
	 *            event - the keyboard event.
	 * @private
	 */
	SearchField.prototype.onkeyup = function(event) {
		var selectedIndex;

		if (event.which === jQuery.sap.KeyCodes.F5 || event.which === jQuery.sap.KeyCodes.ENTER) {
	
			// hide search button active state
			this.$("search").toggleClass("sapMSFBA", false);

			if (suggestionsOn(this)) {
				// always close suggestions by Enter and F5:
				closeSuggestions(this);

				// take over the value from the selected suggestion list item, if any is selected:
				if ((selectedIndex = this._oSuggest.getSelected()) >= 0) {
					this.setValue(this.getSuggestionItems()[selectedIndex].getSuggestionText());
				}
			}

			this.fireSearch({
				query: this.getValue(),
				refreshButtonPressed : this.getShowRefreshButton() && event.which === jQuery.sap.KeyCodes.F5
			});
		}
	};
	
	/**
	 * highlight the background on focus.
	 *
	 * @private
	 */
	SearchField.prototype.onFocus = function(event) {

		// IE does not really focuses inputs and does not blur them if the document itself is not focused
		if (sap.ui.Device.browser.internet_explorer && !document.hasFocus()) {
			return;
		}

		this.$().toggleClass("sapMFocus", true);

		// clear tooltip of the refresh button
		if (this.getShowRefreshButton()) {
			this.$("search").removeAttr("title");
		} 
		// Some applications do re-render during the liveSearch event.
		// The input is focused and most browsers select the input text for copy.
		// Any following key press deletes the whole selection.
		// Disable selection by focus:
		var input = this._inputElement;
		if (input && input.value && !this.getSelectOnFocus()) {
			input.setSelectionRange(input.value.length,input.value.length);
		}

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
	 * Restore the background color on blur.
	 *
	 * @private
	 */
	SearchField.prototype.onBlur = function(oEvent) {
		var tooltip;
		
		this.$().toggleClass("sapMFocus", false);
		
		// restore toltip of the refresh button
		if (this.getShowRefreshButton()) {
			tooltip = this.getRefreshButtonTooltip();
			if (tooltip) {
				this.$("search").attr("title", tooltip);
			}
		} 
	};
	
	SearchField.prototype.setValue = function(value) {
		value = value || "";
		if (this._inputElement) {
	
			if (this._inputElement.value !== value) {
				this._inputElement.value = value;
			}
	
			var $this = this.$();
			if ($this.hasClass("sapMSFVal") == !value) {
				$this.toggleClass("sapMSFVal", !!value);
			}
		}
	
		this.setProperty("value", value, true);
		return this;
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
	 * The first selectable item is selected.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	SearchField.prototype.onsapend = function(oEvent) {
		selectSuggestionItem(this, oEvent, -1, false);
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
			if (bShow && (this.getSuggestionItems().length || sap.ui.Device.system.phone)) {
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

}, /* bExport= */ true);
