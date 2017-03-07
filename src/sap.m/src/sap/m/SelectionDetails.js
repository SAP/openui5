/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetails.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/OverflowToolbarButton'],
	function(jQuery, library, Control, OverflowToolbarButton) {
	"use strict";

	/**
	 * Constructor for a new SelectionDetails.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The control provides a popover which displays the details of the items selected in the chart. This control should be used in toolbar suite.ui.commons.ChartContainer and sap.ui.comp.smartchart.SmartChart controls. At first the control is rendered as a button, that opens the popup after clicking on it.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @experimental Since 1.48.0 The control is currently under development. The API could be changed at any point in time. Please take this into account when using it.
	 * @alias sap.m.SelectionDetails
	 */
	var SelectionDetails = Control.extend("sap.m.SelectionDetails", /** @lends sap.m.SelectionDetails.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * The text to be displayed in the button. The value of this property is a translatable resource. It will be appended by the number of items selected on the chart, for example Details (3) for three selected items on the chart.
			 */
			text : {type : "string", group : "Appearance", defaultValue : "Details"}
		},
		defaultAggregation : "items",
		aggregations : {
				/**
				 * The items that are displayed on the first page
				 */
				"items" : {type : "sap.m.SelectionDetailsItem", multiple : true,  bindable : "bindable"},

				/**
				 * Hidden aggregation which contains the popover that is opened
				 */
				"_popover": {type : "sap.m.ResponsivePopover", multiple : false, visibility : "hidden"},

				/**
				 * Hidden aggregation which contains the button that opens the popover
				 *
				 */
				"_button": {type : "sap.m.OverflowToolbarButton", multiple : false, visibility : "hidden"}
		},
		events : {
			/**
			 * Event is fired before the popover has been opened
			 */
			beforeOpen : {},

			/**
			 * Event is fired before the popover has been closed
			 */
			beforeClose : {},

			/**
			 * Event is fired when the custom action is pressed on the SelectionDetailsItem belonging to the items aggregation
			 */
			navigate : {
				parameters : {
					/**
					 * The item on which the action has been pressed
					 */
					item : {type : "sap.m.SelectionDetailsItem"},

					/**
					 * The direction of navigation. Can be either 'forward' or 'backward'. Backward means that the navigation occured as a result of activating the back button on the current page
					 */
					direction : {type : "string"},

					/**
					 * The custom content, from which the navigation occurs. Null if navigating from first page
					 */
					contentFrom : {type : "sap.ui.core.Control"},

					/**
					 * The custom content, to which the navigation occurs. Null if navigating to first page
					 */
					contentTo : {type : "sap.ui.core.Control"}
				}
			},

			/**
			 * Event is fired when the custom action is pressed on the SelectionDetailsItem belonging to the items aggregation
			 */
			actionPress : {
				parameters : {

					/**
					 * The action that has to be processed once the action has been pressed
					 */
					action : {type : "sap.ui.core.Item"},

					/**
					 * The item on which the action has been pressed
					 */
					item : {type : "sap.m.SelectionDetailsItem"}
				}
			}
		}
	}});

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	SelectionDetails.prototype.init = function() {
		this.setAggregation("_button", new OverflowToolbarButton({
			id : this.getId() + "-button",
			press : [this._onToolbarButtonPress, this]
		}), true);
	};

	SelectionDetails.prototype.onBeforeRendering = function () {
		this.getAggregation("_button").setProperty("text", this.getText(), true);
	};

	/* =========================================================== */
	/* API methods                                                 */
	/* =========================================================== */
	/**
	 * Returns true if the SelectionDetails is open, otherwise false.
	 * @returns {boolean} True if the SelectionDetails is open, otherwise false.
	 * @public
	 */
	SelectionDetails.prototype.isOpen = function() {
		var oPopover = this.getAggregation("_popover");
		return oPopover ? oPopover.isOpen() : false;
	};

	/**
	 * Returns true if the SelectionDetails is enabled, otherwise false.
	 * @returns {boolean} True if the SelectionDetails contains items, otherwise false.
	 * @public
	 */
	SelectionDetails.prototype.isEnabled = function() {
		return this.getItems().length > 0;
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */
	/**
	 * Opens SelectionDetails as ResponsivePopover.
	 * @private
	 */
	SelectionDetails.prototype._handlePressLazy = function(NavContainer, ResponsivePopover, Page) {
		var oPopover = this.getAggregation("_popover"),
			oNavContainer;
		if (!oPopover) {
			oNavContainer = new NavContainer({
				pages: [
					new Page(this.getId() + "-initialPage", {
						content: [
						//first page content will come here in following pushes
						]
					})
				]
			});
			oPopover = new ResponsivePopover({
				placement: library.PlacementType.Bottom,
				content : oNavContainer
			});
			this.setAggregation("_popover", oPopover, true);
		}
		oPopover.openBy(this.getAggregation("_button"));
	};

	SelectionDetails.prototype._onToolbarButtonPress = function() {
		sap.ui.require(['sap/m/NavContainer', 'sap/m/ResponsivePopover', 'sap/m/Page'], this._handlePressLazy.bind(this));
	};

	return SelectionDetails;
});