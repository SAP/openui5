/*!
 * ${copyright}
 */

// Provides control sap.f.SearchManager.
sap.ui.define(['sap/ui/core/Element', 'sap/ui/base/ManagedObjectObserver', './shellBar/Search'],
	function (Element, ManagedObjectObserver, Search) {
		"use strict";

		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		/**
		 * Constructor for a new <code>SearchManager</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Defines specific properties of the search that are applied to <code>sap.f.ShellBar</code>.
		 *
		 * @extends sap.ui.core.Element
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.67
		 * @alias sap.f.SearchManager
		 */

		var SearchManager = Element.extend("sap.f.SearchManager", /** @lends sap.f.SearchManager.prototype */ {
			metadata: {
				library: "sap.f",
				properties: {
					/**
					 * Defines the input value.
					 */
					value: { type: "string", group: "Data", defaultValue: null, bindable: "bindable" },

					/**
					 * Defines the text that is displayed when no value is available.
					 * The default placeholder text is the word "Search" in the current local
					 * language (if supported) or in English.
					 */
					placeholder: { type: "string", group: "Misc", defaultValue: null },

					/**
					 * Determines the maximum number of characters. Value '0' means the feature is switched off.
					 */
					maxLength: { type: "int", group: "Behavior", defaultValue: 0 },

					/**
					 * Determines whether the control is enabled.
					 */
					enabled: { type: "boolean", group: "Behavior", defaultValue: true },

					/**
					 * If true, a <code>suggest</code> event is fired when user types in the input and when the input is focused.
					 * On a phone device, a full screen dialog with suggestions is always shown even if the suggestions list is empty.
					 */
					enableSuggestions: { type: "boolean", group: "Behavior", defaultValue: false }
				},
				aggregations: {
					/**
					 * <code>SuggestionItems</code> are the items which are displayed in the suggestions list.
					 * The following properties can be used:
					 * <ul>
					 * <li><code>key</code> - it is not displayed and may be used as internal technical field</li>
					 * <li><code>text</code> - it is displayed as normal suggestion text</li>
					 * <li><code>icon</code></li>
					 * <li><code>description</code> - additional text that may be used to visually display search item type or category</li>
					 * </ul>
					 */
					suggestionItems: {
						type: "sap.m.SuggestionItem", multiple: true,
						forwarding: {
							getter: "_getSearchField",
							aggregation: "suggestionItems"
						},
						singularName: "suggestionItem"
					}
				},
				events: {
					/**
					 * Fired when the user triggers a search.
					 */
					search: {
						parameters: {
							/**
							 * The search query string.
							 */
							query: { type: "string" },
							/**
							 * Indicates if the user pressed the clear icon.
							 */
							clearButtonPressed: { type: "boolean" }
						}
					},
					/**
					 * Fired when the value of the search field is changed by the user, for example
					 * at each key press.
					 *
					 * <b>Note:</b> Do not invalidate or re-render a focused search field, especially
					 * during the <code>liveChange</code> event.
					 */
					liveChange: {
						parameters: {
							/**
							 * Current search string.
							 */
							newValue: { type: "string" }
						}
					},

					/**
					 * Fired when the search field is initially focused or its value is changed by the user.
					 * This event means that suggestion data should be updated, in case if suggestions are used.
					 * Use the value parameter to create new suggestions for it.
					 */
					suggest: {
						parameters: {
							/**
							 * Current search string of the search field.
							 */
							suggestValue: { type: "string" }
						}
					}
				}
			}
		});

		SearchManager.prototype.init = function () {
			// Default placeholder: "Search"
			this.setProperty("placeholder", oResourceBundle.getText("FACETFILTER_SEARCH"), true);

			this._oConfigObserver = new ManagedObjectObserver(this._synchronizePropertiesWithConfig.bind(this));

			this._oConfigObserver.observe(this, {
				properties: Object.keys(this.getMetadata().getProperties())
			});

			this._initShellBarManagedSearch();
		};

		SearchManager.prototype._synchronizePropertiesWithConfig = function () {
			var oSearchField = this._oSearch._getSearchField(),
				oSearchFieldMetadata = oSearchField.getMetadata(),
				oConfigMetadata = this.getMetadata(),
				bKnownProperty,
				vNewValue;

			Object.keys(oConfigMetadata.getAllProperties()).forEach(function (sProperty) {
				bKnownProperty = oSearchFieldMetadata.hasProperty(sProperty);

				if (bKnownProperty) {
					vNewValue = oConfigMetadata.getProperty(sProperty).get(this);

					oSearchFieldMetadata.getProperty(sProperty).set(oSearchField, vNewValue);
				}
			}, this);
		};

		SearchManager.prototype._initShellBarManagedSearch = function () {
			if (!this._oSearch) {
				this._oSearch = new Search({
					search: this._onSearch.bind(this),
					liveChange: this._onLiveChange.bind(this),
					suggest: this._onSuggest.bind(this)
				});
			}
		};

		SearchManager.prototype.exit = function () {
			if (this._oConfigObserver) {
				this._oConfigObserver.disconnect();
				this._oConfigObserver = null;
			}

			if (this._oSearch) {
				this._oSearch.destroy();
			}
		};

		SearchManager.prototype._onLiveChange = function (oEvent) {
			var oNewEventParams = oEvent.getParameters(),
				newValue = oEvent.getParameter("newValue");

			oNewEventParams.id = this.getId();

			this.setProperty("value", newValue, true);
			this.fireLiveChange(oNewEventParams);
		};

		SearchManager.prototype._onSearch = function (oEvent) {
			var oNewEventParams = oEvent.getParameters();

			oNewEventParams.id = this.getId();

			this.fireSearch(oNewEventParams);
		};

		SearchManager.prototype._onSuggest = function (oEvent) {
			var oNewEventParams = oEvent.getParameters();

			oNewEventParams.id = this.getId();

			this.fireSuggest(oNewEventParams);
		};

		SearchManager.prototype.suggest = function (bShow) {
			this._getSearchField().suggest(bShow);
		};

		SearchManager.prototype._getSearchField = function () {
			return this._oSearch._getSearchField();
		};

		return SearchManager;
	});
