/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.GridData.
sap.ui.define(['sap/ui/core/LayoutData', './library'],
	function(LayoutData, library) {
	"use strict";



	/**
	 * Constructor for a new <code>GridData</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Defines layout data for the {@link sap.ui.layout.Grid}.
	 *
	 * <b>Note:</b> When <code>GridData</code> is used for controls inside a form,
	 * the <code>linebreak</code> property has to be set to <code>true</code> if the
	 * next form element has to be displayed on a new line. Otherwise the <code>GridData</code>
	 * overrides the layout provided by the <code>Form</code>.
	 *
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.15.0
	 * @see {@link topic:43ae317cf39640a88bc8be979d2671df Grid}
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 * @alias sap.ui.layout.GridData
	 */
	var GridData = LayoutData.extend("sap.ui.layout.GridData", /** @lends sap.ui.layout.GridData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {
			/**
			 * A string type that represents the span values of the <code>Grid</code> for large, medium and small screens.
			 *
			 * Allowed values are separated by space with case insensitive Letters XL, L, M or S followed by number of columns from 1 to 12
			 * that the container has to take, for example: <code>L2 M4 S6</code>, <code>M12</code>,
			 * <code>s10</code> or <code>l4 m4</code>.
			 *
			 * <b>Note:</b> The parameters must be provided in the order <large medium small>.
			 */
			span : {type : "sap.ui.layout.GridSpan", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines a span value for extra large screens.
			 * This value overwrites the value for extra large screens defined in the <code>span</code> property.
			 */
			spanXL : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines a span value for large screens.
			 * This value overwrites the value for large screens defined in the <code>span</code> property.
			 */
			spanL : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines a span value for medium size screens.
			 * This value overwrites the value for medium screens defined in the <code>span</code> property.
			 */
			spanM : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines a span value for small screens.
			 * This value overwrites the value for small screens defined in the <code>span</code> property.
			 */
			spanS : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * A string type that represents the indent values of the <code>Grid</code> for large, medium and small screens.
			 *
			 * Allowed values are separated by space with case insensitive Letters XL, L, M or S followed by number of columns from 1 to 11
			 * that the container has to take, for example, <code>L2 M4 S6</code>, <code>M11</code>, <code>s10</code>
			 * or <code>l4 m4</code>.
			 *
			 * <b>Note:</b> The parameters must be provided in the order <large medium small>.
			 */
			indent : {type : "sap.ui.layout.GridIndent", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines an indent value for extra large screens.
			 * This value overwrites the value for extra large screens defined in the <code>indent</code> property.
			 */
			indentXL : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines an indent value for large screens.
			 * This value overwrites the value for large screens defined in the <code>indent</code> property.
			 */
			indentL : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines an indent value for medium size screens.
			 * This value overwrites the value for medium screens defined in the <code>indent</code> property.
			 */
			indentM : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Optional. Defines an indent value for small screens.
			 * This value overwrites the value for small screens defined in the <code>indent</code> property.
			 */
			indentS : {type : "int", group : "Behavior", defaultValue : null},

			/**
			 * Defines if this control is visible on extra Large screens.
			 */
			visibleXL : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Defines if this control is visible on large screens.
			 */
			visibleL : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Defines if this control is visible on medium screens.
			 */
			visibleM : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Defines if this control is visible on small screens.
			 */
			visibleS : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Optional. Moves a cell backwards with as many columns as specified.
			 */
			moveBackwards : {type : "sap.ui.layout.GridIndent", group : "Misc", defaultValue : null},

			/**
			 * Optional. Moves a cell forwards with as many columns as specified.
			 */
			moveForward : {type : "sap.ui.layout.GridIndent", group : "Misc", defaultValue : null},

			/**
			 * Optional. If set to <code>true</code>, the control causes a line break on all-size screens
			 * within the <code>Grid</code> and becomes the first within the next line.
			 */
			linebreak : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Optional. If set to <code>true</code>, the control causes a line break on extra large screens
			 * within the <code>Grid</code> and becomes the first within the next line.
			 */
			linebreakXL : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Optional. If set to <code>true</code>, the control causes a line break on large screens
			 * within the <code>Grid</code> and becomes the first within the next line.
			 */
			linebreakL : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Optional. If set to <code>true</code>, the control causes a line break on medium screens
			 * within the <code>Grid</code> and becomes the first within the next line.
			 */
			linebreakM : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Optional. If set to <code>true</code>, the control causes a line break on small screens
			 * within the <code>Grid</code> and becomes the first within the next line.
			 */
			linebreakS : {type : "boolean", group : "Misc", defaultValue : false}
		}
	}});

	(function() {
		GridData.prototype._setStylesInternal = function(sStyles) {
			if (sStyles && sStyles.length > 0) {
				this._sStylesInternal = sStyles;
			} else {
				this._sStylesInternal = undefined;
			}
		};

		/*
		 * Get span information for the large screens
		 * @return {int} the value of the span
		 * @private
		 */
		GridData.prototype._getEffectiveSpanXLarge = function() {

			var iSpan = this.getSpanXL();
			if (iSpan && (iSpan > 0) && (iSpan < 13)) {
				return iSpan;
			}

			var SPANPATTERN = /XL([1-9]|1[0-2])(?:\s|$)/i;

			var aSpan = SPANPATTERN.exec(this.getSpan());

			if (aSpan) {
				var span = aSpan[0];
				if (span) {
					span = span.toUpperCase();
					if (span.substr(0,2) === "XL") {
						return parseInt(span.substr(2));
					}
				}
			}
			return undefined;
		};


		/*
		 * Get span information for the large screens
		 * @return {int} the value of the span
		 * @private
		 */
		GridData.prototype._getEffectiveSpanLarge = function() {

			var iSpan = this.getSpanL();
			if (iSpan && (iSpan > 0) && (iSpan < 13)) {
				return iSpan;
			}

			var SPANPATTERN = /\bL([1-9]|1[0-2])(?:\s|$)/i;

			var aSpan = SPANPATTERN.exec(this.getSpan());

			if (aSpan) {
				var span = aSpan[0];
				if (span) {
					span = span.toUpperCase();
					if (span.substr(0,1) === "L") {
						return parseInt(span.substr(1));
					}
				}
			}
			return undefined;
		};

		/*
		 * Get span information for the medium screens
		 * @return {int} the value of the span
		 * @private
		 */
		GridData.prototype._getEffectiveSpanMedium = function() {
			var iSpan = this.getSpanM();
			if (iSpan && (iSpan > 0) && (iSpan < 13)) {
				return iSpan;
			}

			var SPANPATTERN = /M([1-9]|1[0-2])(?:\s|$)/i;

			var aSpan = SPANPATTERN.exec(this.getSpan());

			if (aSpan) {
				var span = aSpan[0];
				if (span) {
					span = span.toUpperCase();
					if (span.substr(0,1) === "M") {
						return parseInt(span.substr(1));
					}
				}
			}
			return undefined;
		};

		/*
		 * Get span information for the small screens
		 * @return {int} the value of the span
		 * @private
		 */
		GridData.prototype._getEffectiveSpanSmall = function() {
			var iSpan = this.getSpanS();
			if (iSpan && (iSpan > 0) && (iSpan < 13)) {
				return iSpan;
			}


			var SPANPATTERN = /S([1-9]|1[0-2])(?:\s|$)/i;

			var aSpan = SPANPATTERN.exec(this.getSpan());

			if (aSpan) {
				var span = aSpan[0];
				if (span) {
					span = span.toUpperCase();
					if (span.substr(0,1) === "S") {
						return parseInt(span.substr(1));
					}
				}
			}
			return undefined;
		};

		GridData.prototype.init = function() {
			// Identifier for explicit changed line break property for XL size
			this._bLinebreakXLChanged = false;
		};

		// Finds out if the line break for XL was explicitly set
		GridData.prototype.setLinebreakXL = function(bLinebreak) {
			//set property XL
			this.setProperty("linebreakXL", bLinebreak);
			this._bLinebreakXLChanged = true;
			return this;
		};

		// Internal function. Informs the Grid Renderer if the line break property for XL size was changed explicitly
		GridData.prototype._getLinebreakXLChanged = function() {
			return this._bLinebreakXLChanged;
		};
	}());


	return GridData;

});