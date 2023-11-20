/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.Exact.
sap.ui.define([
    'sap/ui/commons/Button',
    'sap/ui/commons/Menu',
    'sap/ui/commons/SearchField',
    'sap/ui/commons/TextView',
    'sap/ui/core/Control',
    './ExactArea',
    './ExactAttribute',
    './ExactBrowser',
    './library',
    './ExactRenderer',
    'sap/ui/commons/library'
],
	function(
		Button,
		Menu,
		SearchField,
		TextView,
		Control,
		ExactArea,
		ExactAttribute,
		ExactBrowser,
		library,
		ExactRenderer,
		commonsLibrary
	) {
	"use strict";



	// shortcut for sap.ui.commons.TextViewDesign
	var TextViewDesign = commonsLibrary.TextViewDesign;



	/**
	 * Constructor for a new Exact.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A comprehensive UI design approach with graphical and functional elements for searching data, exploring data, and acting on the data
	 * ("Explore and Act (Exact) Pattern").
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since version 1.2.
	 * API is not yet finished and might change completely
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.ux3.Exact
	 */
	var Exact = Control.extend("sap.ui.ux3.Exact", /** @lends sap.ui.ux3.Exact.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.ux3",
		properties : {

			/**
			 * A title text which is displayed above the result section
			 */
			resultText : {type : "string", group : "Misc", defaultValue : null}
		},
		defaultAggregation : "attributes",
		aggregations : {

			/**
			 * Defines the 'Settings' button in the browse section tool bar
			 */
			settingsMenu : {type : "sap.ui.commons.Menu", multiple : false, forwarding: {idSuffix: "-browser", aggregation: "optionsMenu"}},

			/**
			 * The attributes which shall be available to refine the search
			 */
			attributes : {type : "sap.ui.ux3.ExactAttribute", multiple : true, singularName : "attribute", forwarding: {idSuffix: "-browser", aggregation: "attributes"}},

			/**
			 * Controls managed by the Exact control
			 */
			controls : {type : "sap.ui.core.Control", multiple : true, singularName : "control", visibility : "hidden"}
		},
		events : {

			/**
			 * Event is fired when the search button is clicked
			 */
			search : {
				parameters : {

					/**
					 * The query string which was entered in the search field.
					 */
					query : {type : "string"}
				}
			},

			/**
			 * Event which is fired when an attribute is selected or unselected.
			 */
			refineSearch : {
				parameters : {

					/**
					 * The query string which was entered in the search field
					 */
					query : {type : "string"},

					/**
					 * The attribute which was selected or unselected recently
					 */
					changedAttribute : {type : "sap.ui.ux3.ExactAttribute"},

					/**
					 * Array of all selected ExcatAttribute.
					 */
					allSelectedAttributes : {type : "object"}
				}
			}
		}
	}});



	/**
	 * Does the setup when the Exact is created.
	 * @private
	 */
	Exact.prototype.init = function(){
		var that = this;

		//Init the used subcontrols
		//Init Search Area
		this._searchArea = new ExactArea(this.getId() + "-searchArea", {toolbarVisible: false});
		this._searchArea.addStyleClass("sapUiUx3ExactSearchArea");
		this.addAggregation("controls", this._searchArea);

		this._search_input = new SearchField(this.getId() + "-searchTF", {enableListSuggest: false});
		this._search_input.attachSearch(function(oEvent){
			_handleSearch(that, oEvent);
		});
		this._search_input.addStyleClass("sapUiUx3ExactSearchText");
		this._searchArea.addContent(this._search_input);

		//Init Browse Area
		this._browser = new ExactBrowser(this.getId() + "-browser", {title: "Attributes"}); //TODO: I18n
		this._browser.addStyleClass("sapUiUx3ExactBrowseArea");
		this.addAggregation("controls", this._browser);
		this._browser.attachAttributeSelected(function(oEvent){
			_handleAttributeSelected(that, oEvent);
		});

		//Init Result Area
		this._resultArea = new ExactArea(this.getId() + "-resultArea");
		this.addAggregation("controls", this._resultArea);

		this._resultText = new TextView(this.getId() + "-resultAreaTitle", {design: TextViewDesign.Bold});
		this._resultText.addStyleClass("sapUiUx3ExactViewTitle");
		this.addAggregation("controls", this._resultText);

		this._bDetailsVisible = false;
	};


	//*** Overridden API functions ***

	Exact.prototype.getResultText = function() {
		return this._resultText.getText();
	};


	Exact.prototype.setResultText = function(sResultText) {
		this._resultText.setText(sResultText);
		return this;
	};


	/**
	 * Returns the ExactArea representing the result section. Arbitrary content can be added here.
	 *
	 * @type sap.ui.ux3.ExactArea
	 * @public
	 */
	Exact.prototype.getResultArea = function() {
		return this._resultArea;
	};


	/**
	 * Returns the SearchField control which is used by the Exact control.
	 *
	 * @type sap.ui.commons.SearchField
	 * @public
	 */
	Exact.prototype.getSearchField = function() {
		return this._search_input;
	};


	//*** Behavior functions ***





	//*** Private helper functions ***


	//Handles the search event
	var _handleSearch = function(oThis, oEvent){
		oThis._sSearchQuery = oEvent.getParameter("query"); //Store the value until next Search
		oThis.fireSearch({query: oThis._sSearchQuery});
		oThis._bDetailsVisible = true;
		oThis.invalidate();
	};


	//Handles attribute selections
	var _handleAttributeSelected = function(oThis, oEvent){
		oThis.fireRefineSearch({
			query: oThis._sSearchQuery,
			changedAttribute: oEvent.getParameter("attribute"),
			allSelectedAttributes: oEvent.getParameter("allAttributes")
		});
	};


	return Exact;

});
