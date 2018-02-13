/*!
 * ${copyright}
 */

// Provides control sap.m.PagingButton.
sap.ui.define([
	'jquery.sap.global',
	'./Button',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'./PagingButtonRenderer'
],
	function(jQuery, Button, Control, IconPool, PagingButtonRenderer) {
		"use strict";

		/**
		 * Constructor for a new PagingButton.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Enables users to navigate between items/entities.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.30
		 * @alias sap.m.PagingButton
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var PagingButton = Control.extend("sap.m.PagingButton", {

			metadata: {
				library: "sap.m",
				properties: {

					/**
					 * Determines the total count of items/entities that the control navigates through.
					 * The minimum number of items/entities is 1.
					 */
					count: {type: "int", group: "Data", defaultValue: 1},

					/**
					 * Determines the current position in the items/entities that the control navigates through.
					 * Starting (minimum) number is 1.
					 */
					position: {type: "int", group: "Data", defaultValue: 1},

					/**
					 * Determines the tooltip of the next button.
					 * @since 1.36
					 */
					nextButtonTooltip: {type: "string", group: "Appearance", defaultValue: ""},

					/**
					 * Determines the tooltip of the previous button.
					 * @since 1.36
					 */
					previousButtonTooltip: {type: "string", group: "Appearance", defaultValue: ""}
				},
				aggregations: {
					previousButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
					nextButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
				},
				events: {

					/**
					 * Fired when the current position is changed.
					 */
					positionChange: {
						parameters: {

							/**
							 * The number of the new position.
							 */
							newPosition: {type: "int"},

							/**
							 * The number of the old position.
							 */
							oldPosition: {type: "int"}
						}
					}
				}
			}
		});

		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		PagingButton.prototype.init = function () {
			this._attachPressEvents();
		};

		PagingButton.prototype.onBeforeRendering = function () {
			this._enforceValidPosition(this.getPosition());
			this._updateButtonState();
		};

		/**
		 * Lazily retrieves the <code>nextButton</code>.
		 * @private
		 * @returns {sap.m.Button}
		 */
		PagingButton.prototype._getNextButton = function () {
			if (!this.getAggregation("nextButton")) {
				this.setAggregation("nextButton", new Button({
					tooltip: this.getNextButtonTooltip() || resourceBundle.getText("PAGINGBUTTON_NEXT"),
					icon: IconPool.getIconURI("slim-arrow-down"),
					enabled: false,
					id: this.getId() + "-nextButton"
				}));
			}

			return this.getAggregation("nextButton");
		};

		/**
		 * Lazily retrieves the <code>previousButton</code>.
		 * @private
		 * @returns {sap.m.Button}
		 */
		PagingButton.prototype._getPreviousButton = function () {
			if (!this.getAggregation("previousButton")) {
				this.setAggregation("previousButton", new Button({
					tooltip: this.getPreviousButtonTooltip() || resourceBundle.getText("PAGINGBUTTON_PREVIOUS"),
					icon: IconPool.getIconURI("slim-arrow-up"),
					enabled: false,
					id: this.getId() + "-previousButton"
				}));
			}

			return this.getAggregation("previousButton");
		};

		/**
		 * Attaches the press handlers for both buttons.
		 * @private
		 */
		PagingButton.prototype._attachPressEvents = function () {
			this._getPreviousButton().attachPress(this._handlePositionChange.bind(this, false));
			this._getNextButton().attachPress(this._handlePositionChange.bind(this, true));
		};

		/**
		 * Handles the position change.
		 * @param {boolean} bIncrease Indicates the direction of the change of position
		 * @returns {sap.m.PagingButton} Reference to the control instance for chaining
		 */
		PagingButton.prototype._handlePositionChange = function (bIncrease) {
			var iOldPosition = this.getPosition(),
				iNewPosition = bIncrease ? iOldPosition + 1 : iOldPosition - 1;

			this.setPosition(iNewPosition);
			this.firePositionChange({newPosition: iNewPosition, oldPosition: iOldPosition});
			this._updateButtonState();
			return this;
		};

		/**
		 * Sets the appropriate state (enabled/disabled) for the buttons based on the total count / position.
		 * @returns {sap.m.PagingButton} Reference to the control instance for chaining
		 */
		PagingButton.prototype._updateButtonState = function () {
			var iTotalCount = this.getCount(),
				iCurrentPosition = this.getPosition();

			this._getPreviousButton().setEnabled(iCurrentPosition > 1);
			this._getNextButton().setEnabled(iCurrentPosition < iTotalCount);
			return this;
		};

		PagingButton.prototype.setPosition = function (iPosition) {
			return this._validateProperty("position", iPosition);
		};

		PagingButton.prototype.setCount = function (iCount) {
			return this._validateProperty("count", iCount);
		};

		PagingButton.prototype.setPreviousButtonTooltip = function (sTooltip) {
			this._getPreviousButton().setTooltip(sTooltip);
			return this.setProperty("previousButtonTooltip", sTooltip, true);
		};

		PagingButton.prototype.setNextButtonTooltip = function (sTooltip) {
			this._getNextButton().setTooltip(sTooltip);
			return this.setProperty("nextButtonTooltip", sTooltip, true);
		};

		/**
		 * Validates both the <code>count</code> and <code>position</code>
		 * properties and ensures they are correct.
		 * @param {string} sProperty The property to be checked
		 * @param {number} iValue 	The value to be checked
		 * @returns {sap.m.PagingButton} Reference to the control instance for chaining
		 */
		PagingButton.prototype._validateProperty = function (sProperty, iValue) {
			if (iValue < 1) {
				jQuery.sap.log.warning("Property '" + sProperty + "' must be greater or equal to 1", this);
				return this;
			}

			return this.setProperty(sProperty, iValue);
		};

		/**
		 * Validates the position property to ensure that it's not set higher than the total count.
		 * @private
		 * @param {number} iPosition
		 * @returns {sap.m.PagingButton} Reference to the control instance for chaining
		 */
		PagingButton.prototype._enforceValidPosition = function (iPosition) {
			var iCount = this.getCount();

			if (iPosition > iCount) {
				jQuery.sap.log.warning("Property position must be less or equal to the total count");
				this.setPosition(iCount);
			}

			return this;
		};

		return PagingButton;

	});
