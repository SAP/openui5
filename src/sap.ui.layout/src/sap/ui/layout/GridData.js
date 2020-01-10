/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.GridData.
sap.ui.define(['sap/ui/core/LayoutData', './library', "sap/base/Log"],
	function(LayoutData, library, Log) {
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GridData = LayoutData.extend("sap.ui.layout.GridData", /** @lends sap.ui.layout.GridData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * A string type that represents the span values of the <code>Grid</code> for large, medium and small screens.
			 *
			 * Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 12
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
			 * Allowed values are separated by space Letters L, M or S followed by number of columns from 1 to 11
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
			linebreakS : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Deprecated. Defines a span value for large screens.
			 * This value overwrites the value for large screens defined in the <code>span</code> property.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>spanL</code> property instead.
			 */
			spanLarge : {type : "int", group : "Behavior", defaultValue : null, deprecated: true},

			/**
			 * Deprecated. Defines a span value for medium screens.
			 * This value overwrites the value for medium screens defined in the <code>span</code> property.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>spanM</code> property instead.
			 */
			spanMedium : {type : "int", group : "Behavior", defaultValue : null, deprecated: true},

			/**
			 * Deprecated. Defines a span value for small screens.
			 * This value overwrites the value for small screens defined in the <code>span</code> property.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>spanS</code> property instead.
			 */
			spanSmall : {type : "int", group : "Behavior", defaultValue : null, deprecated: true},

			/**
			 * Deprecated. Defines an indent value for large screens.
			 * This value overwrites the value for large screens defined in the <code>indent</code> property.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>indentL</code> property instead.
			 */
			indentLarge : {type : "int", group : "Behavior", defaultValue : null, deprecated: true},

			/**
			 * Deprecated. Defines an indent value for medium screens.
			 * This value overwrites the value for medium screens defined in the <code>indent</code> property.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>indentM</code> property instead.
			 */
			indentMedium : {type : "int", group : "Behavior", defaultValue : null, deprecated: true},

			/**
			 * Deprecated. Defines an indent value for small screens.
			 * This value overwrites the value for small screens defined in the <code>indent</code> property.
			 *
			 * @deprecated As of version 1.17.1. Use <code>indentS</code> property instead.
			 */
			indentSmall : {type : "int", group : "Behavior", defaultValue : null, deprecated: true},

			/**
			 * Deprecated. Defines if this control is visible on large screens.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>visibleL</code> property instead.
			 */
			visibleOnLarge : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

			/**
			 * Deprecated. Defines if this control is visible on medium screens.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>visibleM</code> property instead.
			 */
			visibleOnMedium : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

			/**
			 * Deprecated. Defines if this control is visible on small screens.
			 *
			 * @deprecated As of version 1.17.1. Use the <code>visibleS</code> property instead.
			 */
			visibleOnSmall : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true}
		}
	}});

	/**
	 * This file defines behavior for the control
	 */
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

		// Deprecated properties handling
		//Setter
		GridData.prototype.setSpanLarge = function(iSpan) {
			this.setSpanL(iSpan);
			Log.warning("Deprecated property spanLarge is used, please use spanL instead.");
			return this;
		};

		GridData.prototype.setSpanMedium = function(iSpan) {
			Log.warning("Deprecated property spanMedium is used, please use spanM instead.");
			return this.setSpanM(iSpan);
		};

		GridData.prototype.setSpanSmall = function(iSpan) {
			Log.warning("Deprecated property spanSmall is used, please use spanS instead.");
			return this.setSpanS(iSpan);
		};

		GridData.prototype.setIndentLarge = function(iIndent) {
			Log.warning("Deprecated property indentLarge is used, please use indentL instead.");
			return this.setIndentL(iIndent);
		};

		GridData.prototype.setIndentMedium = function(iIndent) {
			Log.warning("Deprecated property indentMedium is used, please use indentM instead.");
			return this.setIndentM(iIndent);
		};

		GridData.prototype.setIndentSmall = function(iIndent) {
			Log.warning("Deprecated property indentSmall is used, please use indentS instead.");
			return this.setIndentS(iIndent);
		};

		GridData.prototype.setVisibleOnLarge = function(bVisible) {
			Log.warning("Deprecated property visibleOnLarge is used, please use visibleL instead.");
			return this.setVisibleL(bVisible);
		};

		GridData.prototype.setVisibleOnMedium = function(bVisible) {
			Log.warning("Deprecated property visibleOnMedium is used, please use visibleM instead.");
			return this.setVisibleM(bVisible);
		};

		GridData.prototype.setVisibleOnSmall = function(bVisible) {
			Log.warning("Deprecated property visibleOnSmall is used, please use visibleS instead.");
			return this.setVisibleS(bVisible);
		};


		// Getter
		GridData.prototype.getSpanLarge = function() {
			Log.warning("Deprecated property spanLarge is used, please use spanL instead.");
			return this.getSpanL();
		};

		GridData.prototype.getSpanMedium = function() {
			Log.warning("Deprecated property spanMedium is used, please use spanM instead.");
			return this.getSpanM();
		};

		GridData.prototype.getSpanSmall = function() {
			Log.warning("Deprecated property spanSmall is used, please use spanS instead.");
			return this.getSpanS();
		};

		GridData.prototype.getIndentLarge = function() {
			Log.warning("Deprecated property indentLarge is used, please use indentL instead.");
			return this.getIndentL();
		};

		GridData.prototype.getIndentMedium = function() {
			Log.warning("Deprecated property indentMedium is used, please use indentM instead.");
			return this.getIndentM();
		};

		GridData.prototype.getIndentSmall = function() {
			Log.warning("Deprecated property indentSmall is used, please use indentS instead.");
			return this.getIndentS();
		};

		GridData.prototype.getVisibleOnLarge = function() {
			Log.warning("Deprecated property visibleOnLarge is used, please use visibleL instead.");
			return this.getVisibleL();
		};

		GridData.prototype.getVisibleOnMedium = function() {
			Log.warning("Deprecated property visibleOnMedium is used, please use visibleM instead.");
			return this.getVisibleM();
		};

		GridData.prototype.getVisibleOnSmall = function() {
			Log.warning("Deprecated property visibleOnSmall is used, please use visibleS instead.");
			return this.getVisibleS();
		};

	}());


	return GridData;

});