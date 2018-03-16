/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.Label.
sap.ui.define([
    'jquery.sap.global',
    './library',
    'sap/ui/core/Control',
    'sap/ui/core/Popup',
    'sap/ui/core/LabelEnablement',
    "./LabelRenderer"
],
	function(jQuery, library, Control, Popup, LabelEnablement, LabelRenderer) {
	"use strict";



	/**
	 * Constructor for a new Label.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * The control is used for labeling other controls. The API provides formatting options, for example, for bold display or alignment. A label can have an icon.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.commons.ToolbarItem, sap.ui.core.Label
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.Label</code> control.
	 * @alias sap.ui.commons.Label
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Label = Control.extend("sap.ui.commons.Label", /** @lends sap.ui.commons.Label.prototype */ { metadata : {

		interfaces : [
			"sap.ui.commons.ToolbarItem",
			"sap.ui.core.Label"
		],
		library : "sap.ui.commons",
		properties : {

			/**
			 *
			 * Defines whether the labels are in bold format.
			 */
			design : {type : "sap.ui.commons.LabelDesign", group : "Appearance", defaultValue : sap.ui.commons.LabelDesign.Standard},

			/**
			 * Determines the text direction - right-to-left (RTL) and left-to-right (LTR).
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * Specifies whether a line wrapping width shall be displayed when the text value is longer than the width is.
			 */
			wrapping : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines the control width as common CSS-size (for example, px or % as unit).
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * Determines the text to be displayed.
			 */
			text : {type : "string", group : "Misc", defaultValue : ''},

			/**
			 * Determines the icon to be displayed in the control.
			 * This can be a URI to an image or an icon font URI.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * Determines the alignment of the text. Available options are <code>Begin</code>, <code>Center</code>, <code>End</code>, <code>Left</code>, and <code>Right</code>.
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin},

			/**
			 * Allows to enforce the required indicator even when the associated control doesn't have a getRequired method (a required property) or when the flag is not set.
			 * If the associated control has a required property, the values of both required flags are combined with the OR operator, so a Label can't override a required=true value.
			 * @since 1.11.0
			 */
			required : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Determines whether the required indicator is at the beginning of the label (if set) or at the end (if not set).
			 * @since 1.14.0
			 */
			requiredAtBegin : {type : "boolean", group : "Misc", defaultValue : null}
		},
		associations : {

			/**
			 * Defines the association to the labeled control.
			 * By default, the label is set the for the attribute to the ID of the labeled control.
			 * This can be changed with the implementation of function getIdForLabel on the labelled control.
			 */
			labelFor : {type : "sap.ui.core.Control", multiple : false}
		}
	}});

	Label.prototype.onAfterRendering = function () {

		var oFor = this._getLabeledControl();

		if (oFor) {
			if (this.getTooltip_AsString() == "" || !(this.getTooltip() instanceof sap.ui.core.TooltipBase)) {
				// no own tooltip use RichTooltip of labeled control if available
				if (oFor.getTooltip() instanceof sap.ui.core.TooltipBase) {
					this.oForTooltip = oFor.getTooltip();
					this.addDelegate(this.oForTooltip);
				}
			}

			this._oFor = oFor;
		}
	};

	Label.prototype.onBeforeRendering = function () {

		if (this.oForTooltip) {
			this.removeDelegate(this.oForTooltip);
			this.oForTooltip = null;
		}

		if (this._oFor) {
			this._oFor = undefined;
		}
	};

	Label.prototype.exit = function() {
		if (this.oForTooltip) {
			this.removeDelegate(this.oForTooltip);
			this.oForTooltip = null;
		}

		if (this._oFor) {
			this._oFor = undefined;
		}
	};

	/**
	 * Sets a new value for property requiredAtBegin.
	 *
	 * The property is renamed, but deprecated set and get functions for the
	 * old name are added so that existing applications will still run.
	 *
	 * @deprecated
	 * @param {Boolean} bReqiuredAtBegin new value for property requiredAtBegin.
	 * @returns {Object} Result of function execution.
	 */
	Label.prototype.setReqiuredAtBegin = function(bReqiuredAtBegin){
		return this.setRequiredAtBegin(bReqiuredAtBegin);
	};

	/**
	 * Gets a new value for property requiredAtBegin.
	 *
	 * The property is renamed, but deprecated set and get functions for the
	 * old name are added so that existing applications will still run.
	 *
	 * @deprecated
	 * @returns {Object} Result of function execution.
	 */
	Label.prototype.getReqiuredAtBegin = function(){
		return this.getRequiredAtBegin();
	};

	/**
	 * Returns the labeled control instance (if existing).
	 *
	 * @return {sap.ui.core.Control} The labeled control instance (if existing)
	 * @private
	 */
	Label.prototype._getLabeledControl = function() {
		var sId = this.getLabelForRendering();
		if (!sId) {
			return null;
		}
		return sap.ui.getCore().byId(sId);
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	Label.prototype.getAccessibilityInfo = function() {
		return {description: this.getText()};
	};

	//Enrich Label functionality
	LabelEnablement.enrich(Label.prototype);

	return Label;

}, /* bExport= */ true);
