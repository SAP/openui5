/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/m/Button', 'sap/m/SearchField', 'sap/m/library', 'sap/ui/core/Core'],
    function(Control, Button, SearchField, mobileLibrary, Core) {
    "use strict";

		/**
		 * @private
		 * @ui5-restricted sdk
		 */
        var Search = Control.extend("sap.ui.documentation.Search", {
            metadata : {
                library : "sap.ui.documentation",
                properties : {
                    isOpen : {type : "boolean", group : "Appearance", defaultValue : false},
                    width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null}
                },
                aggregations : {
                    _openingButton : {type: "sap.m.Button", multiple: false},
                    _closingButton : {type: "sap.m.Button", multiple: false},
                    _searchField : {type: "sap.m.SearchField", multiple: false}
                },
                events : {
                    /**
                     * Event which is fired when the user triggers a search.
                     */
                    toggle: {
                        isOpen: {type: "boolean"}
                    },
                    search: {
                        parameters: {

                            /**
                             * The search query string.
                             */
                            query: {type: "string"},

                            /**
                             * Suggestion list item in case if the user has selected an item from the suggestions list.
                             * @since 1.34
                             */
                            suggestionItem: {type: "sap.m.SuggestionItem"},

                            /**
                             * Indicates if the user pressed the refresh icon.
                             * @since 1.16
                             */
                            refreshButtonPressed: {type: "boolean"},
                            /**
                             * Indicates if the user pressed the clear icon.
                             * @since 1.34
                             */
                            clearButtonPressed: {type: "boolean"}
                        }
                    }
                }
			},
            renderer: {
				apiVersion: 2,

				render: function(rm, oControl) {

                var sWidth = oControl.getWidth(),
                    oOpeningBtn,
                    oClosingButton,
                    oSearchField;

				rm.openStart("div", oControl);
                rm.style("width", sWidth);
                rm.class("sapUiDocumentationSearch");
                rm.openEnd();

                if (oControl.getIsOpen()) {
                    oSearchField = oControl._lazyLoadSearchField(true);
                    oClosingButton = oControl._lazyLoadClosingButton(true);
                    rm.renderControl(oSearchField);
                    rm.renderControl(oClosingButton);
                } else {
                    oOpeningBtn = oControl._lazyLoadOpeningButton(true);
                    rm.renderControl(oOpeningBtn);
                }
                rm.close("div");
            }
        }});

        Search.prototype.onAfterRendering = function() {
            if (this.getIsOpen()) {
                this._maximizeSearchField();
            }
        };

        Search.prototype._maximizeSearchField = function() {
            return this._resizeSearchField("100%");
        };

        Search.prototype._minimizeSearchField = function() {
            return this._resizeSearchField("10%");
        };

        /**
         * Changes the size of the aggregated searchField input control
         * The size will be changed with an animation, as the css declares a transition for "max-width"
         * @private
         * @returns {Promise} promise that will be resolved when the requested size is achieved
         */
        Search.prototype._resizeSearchField = function(sWidth) {

            return new Promise(function(resolve, reject) {
                var $searchField = this.$("searchField");

                if (!$searchField.length) {
                    reject();
                }

                if ($searchField.css("max-width") === sWidth) {
                    resolve();
                }

                // the css declares a transition for "max-width", so resolve at transition end
                $searchField.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function() {
                    resolve();
                });
                $searchField.css("max-width", sWidth);

            }.bind(this));
        };

        Search.prototype._toggleOpen = function(bOpen) {
            this.setIsOpen(bOpen);
            this.fireToggle({isOpen: bOpen});
        };

        Search.prototype._lazyLoadOpeningButton = function(bSuppressInvalidate) {
            if (!this.getAggregation("_openingButton")) {
                var oBtn = new Button(this.getId() + "-openingBtn", {
                    icon: "sap-icon://search",
                    type: mobileLibrary.ButtonType.Transparent,
                    press: function() {
                        this._toggleOpen(true);
                    }.bind(this)
                });
                oBtn.addStyleClass("sdkHeaderSearchButton"); //TODO
                this.setAggregation("_openingButton", oBtn, bSuppressInvalidate);
            }
            return this.getAggregation("_openingButton");
        };

        Search.prototype._lazyLoadClosingButton = function(bSuppressInvalidate) {
            if (!this.getAggregation("_closingButton")) {
                var oBtn = new Button(this.getId() + "-closingBtn", {
                    text: Core.getLibraryResourceBundle("sap.ui.documentation").getText("APP_SEARCH_FIELD_CLOSE"),
                    type: mobileLibrary.ButtonType.Transparent,
                    press: function() {

                        this._minimizeSearchField().then(function() {
                            this._toggleOpen(false);
                        }.bind(this));

                    }.bind(this)
                });
                this.setAggregation("_closingButton", oBtn, bSuppressInvalidate);
            }
            return this.getAggregation("_closingButton");
        };

        Search.prototype._lazyLoadSearchField = function(bSuppressInvalidate) {
            if (!this.getAggregation("_searchField")) {
                var oSrch = new SearchField(this.getId() + "-searchField", {
                    showSearchButton: true,
                    search: function(oEvent) {

                        var oParameters = oEvent.getParameters();
                        oParameters.id = this.getId();
                        this.fireSearch(oParameters);
                    }.bind(this)
                });
                oSrch.addStyleClass("sdkHeaderSearchField");
                this.setAggregation("_searchField", oSrch, bSuppressInvalidate);
            }
            return this.getAggregation("_searchField");
        };

        return Search;
});