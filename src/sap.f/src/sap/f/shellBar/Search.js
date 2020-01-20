
/*!
 * ${copyright}
 */

// Provides control sap.f.shellBar.Search
sap.ui.define(['sap/ui/core/Control',
	'sap/f/shellBar/SearchRenderer',
	'sap/m/SearchField',
	'sap/m/OverflowToolbarButton',
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"./Accessibility",
	"sap/m/library"],
	function (Control, SearchRenderer, SearchField, OverflowToolbarButton, OverflowToolbarLayoutData, Button, KeyCodes, Accessibility, mLibrary) {
		"use strict";

		// shortcut for sap.m.ButtonType
		var ButtonType = mLibrary.ButtonType;

		// shortcut for sap.m.OverflowToolbarPriority
		var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

		/**
		 * Constructor for a new <code>Search</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Private control used by the <code>ShellBar</code> control.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.67
		 * @alias sap.f.shallBar.Search
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Search = Control.extend("sap.f.shellBar.Search", {
			metadata: {
				interfaces: [
					"sap.m.IOverflowToolbarContent"
				],
				library: "sap.f",
				properties: {
					isOpen: { type: "boolean", defaultValue: false },
					phoneMode: { type: "boolean", defaultValue: false },
					width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: null }
				},
				aggregations: {
					_searchField: { type: "sap.m.SearchField", multiple: false },
					_searchButton: { type: "sap.m.OverflowToolbarButton", multiple: false },
					_cancelButton: { type: "sap.m.Button", multiple: false }
				},
				events: {
					search: {
						parameters: {
							query: { type: "string" },
							clearButtonPressed: { type: "boolean" }
						}
					},
					liveChange: {
						parameters: {
							newValue: { type: "string" }
						}
					},
					suggest: {
						parameters: {
							suggestValue: { type: "string" }
						}
					}
				}
			},
			renderer: SearchRenderer
		});

		Search.prototype.init = function () {
			this._sOldValue = "";
			this._shouldFocusSearch = false;
			this._layoutDataWhenOpen = new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.NeverOverflow
			});
			this._layoutDataWhenClosed = new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.Low
			});
			this._oAcc = new Accessibility();
		};

		Search.prototype.onBeforeRendering = function () {
			this._switchOpenStateOnSearch();
		};

		Search.prototype.onAfterRendering = function () {
			setTimeout(function () {
				if (this._shouldFocusSearch) {
					this._getSearchField().getFocusDomRef().focus();
					this._shouldFocusSearch = false;
				}
			}.bind(this), 0);
		};

		Search.prototype.exit = function () {
			if (this._layoutDataWhenOpen) {
				this._layoutDataWhenOpen.destroy();
			}

			if (this._layoutDataWhenClosed) {
				this._layoutDataWhenClosed.destroy();
			}
		};

		/**
		 * GETTERS
		 */

		Search.prototype._getSearchField = function () {
			var oSearchField = this.getAggregation("_searchField");

			if (!oSearchField) {
				oSearchField = new SearchField({
					showSearchButton: false,
					search: this._onSearch.bind(this),
					liveChange: this._onLiveChange.bind(this),
					suggest: this._onSuggest.bind(this)
				});

				this.setAggregation("_searchField", oSearchField);
			}

			return oSearchField;
		};

		Search.prototype._getSearchButton = function () {
			var oSearchButton = this.getAggregation("_searchButton");

			if (!oSearchButton) {
				oSearchButton = new OverflowToolbarButton({
					text: "Search",
					icon: "sap-icon://search",
					type: ButtonType.Transparent,
					press: this._onPressSearchButtonHandler.bind(this),
					tooltip: this._oAcc.getEntityTooltip("SEARCH")
				});

				this.setAggregation("_searchButton", oSearchButton);
			}

			return oSearchButton;
		};

		Search.prototype._getCancelButton = function () {
			var oCancelButton = this.getAggregation("_cancelButton");

			if (!oCancelButton) {
				oCancelButton = new Button({
					text: "Cancel",
					type: ButtonType.Transparent,
					press: this._onPressCancelButtonHandler.bind(this)
				});

				oCancelButton.addStyleClass("sapFShellBarSearchCancelButton");
				this.setAggregation("_cancelButton", oCancelButton);
			}

			return oCancelButton;
		};

		/**
		 * FUNCTIONS
		 */

		Search.prototype.toggleVisibilityOfSearchField = function () {
			var bIsOpen = this.getIsOpen();

			this.setIsOpen(!bIsOpen);

			this._shouldFocusSearch = !bIsOpen;

			this.fireEvent("_updateVisualState", { isOpen: !bIsOpen });
		};

		Search.prototype._switchOpenStateOnSearch = function () {
			var oLayoutData;

			if (this.getIsOpen()) {
				oLayoutData = this._layoutDataWhenOpen;
			} else if (!this._bInOverflow) {
				oLayoutData = this._layoutDataWhenClosed;
			}

			if (!oLayoutData || this.getLayoutData() === oLayoutData) {
				return;
			}

			this.setLayoutData(oLayoutData);
		};

		/**
		 * EVENT HANDLERS
		 */
		Search.prototype._onPressSearchButtonHandler = function () {
			var oSearch = this._getSearchField();

			if (oSearch.getValue() && this.getIsOpen()) {
				this.fireSearch({
					query: oSearch.getValue(),
					clearButtonPressed: false
				});
			} else {
				this.toggleVisibilityOfSearchField();
			}
		};

		Search.prototype._onPressCancelButtonHandler = function () {
			this.toggleVisibilityOfSearchField();
		};

		Search.prototype._onSearch = function (oEvent) {
			var oNewEventParams = oEvent.getParameters();

			oNewEventParams.id = this.getId();

			if (oEvent.getParameter("clearButtonPressed")) {
				this._shouldCloseOnNextEscape = false;
			}

			this.fireSearch(oNewEventParams);
		};

		Search.prototype._onLiveChange = function (oEvent) {
			var oNewEventParams = oEvent.getParameters();

			delete oNewEventParams.refreshButtonPressed;
			delete oNewEventParams.suggestionItem;
			oNewEventParams.id = this.getId();

			this._shouldCloseOnNextEscape = !oNewEventParams.newValue;

			this.fireLiveChange(oNewEventParams);
		};

		Search.prototype._onSuggest = function (oEvent) {
			var oNewEventParams = oEvent.getParameters();

			oNewEventParams.id = this.getId();

			this.fireSuggest(oNewEventParams);
		};

		Search.prototype.onkeyup = function (oEvent) {
			var oSearchField = this._getSearchField();

			if (oEvent.keyCode === KeyCodes.ESCAPE) {
				// if suggestion popover is open
				if (oSearchField._oSuggest && oSearchField._oSuggest.isOpen()) {
					return;
				}

				if (this._shouldCloseOnNextEscape) {
					this._shouldCloseOnNextEscape = false;
					return;
				}

				this.toggleVisibilityOfSearchField();
			}
		};

		/**
		 * OVERFLOW TOOLBAR settings
		 */
		Search.prototype._onBeforeEnterOverflow = function () {
			var oSearchButton = this._getSearchButton();

			this._bInOverflow = true;
			oSearchButton._bInOverflow = true;
			oSearchButton.addStyleClass("sapFShellBarSearchOverflowToolbar");

			this._switchOpenStateOnSearch();
		};

		Search.prototype._onAfterExitOverflow = function () {
			var oSearchButton = this._getSearchButton();

			this._bInOverflow = false;
			oSearchButton._bInOverflow = false;
			oSearchButton.removeStyleClass("sapFShellBarSearchOverflowToolbar");
		};

		Search.prototype.getOverflowToolbarConfig = function () {
			var oConfig = {
				canOverflow: true
			};

			oConfig.onBeforeEnterOverflow = this._onBeforeEnterOverflow.bind(this);
			oConfig.onAfterExitOverflow = this._onAfterExitOverflow.bind(this);

			return oConfig;
		};

		return Search;

	});
