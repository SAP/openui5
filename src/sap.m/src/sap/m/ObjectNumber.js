/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectNumber.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/Renderer'],
	function(jQuery, library, Control, Renderer) {
	"use strict";


	/**
	 * Constructor for a new ObjectNumber.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectNumber displays number and number unit properties for an object. The number can be displayed using semantic
	 * colors to provide addition meaning about the object to the user.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectNumber
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectNumber = Control.extend("sap.m.ObjectNumber", /** @lends sap.m.ObjectNumber.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Number field of the object number
			 */
			number : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Number units qualifier
			 * @deprecated Since version 1.16.1.
			 *
			 * Replaced by unit property due to the number before unit is redundant.
			 */
			numberUnit : {type : "string", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * Indicates if the object number should appear emphasized
			 */
			emphasized : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * The object number's value state. Setting this state will cause the number to be rendered in state-specific colors (only blue-crystal theme).
			 */
			state : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : sap.ui.core.ValueState.None},

			/**
			 * Number units qualifier. If numberUnit and unit are both set, the unit value is used.
			 * @since 1.16.1
			 */
			unit : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Available options for the number and unit text direction are LTR and RTL. By default the control inherits the text direction from its parent control.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * Sets the horizontal alignment of the number and unit.
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin}
		}
	}});

	/**
	 * String to prefix css class for number status to be used in
	 * controler and renderer
	 *
	 * @private
	 */
	ObjectNumber.prototype._sCSSPrefixObjNumberStatus = 'sapMObjectNumberStatus';

	/**
	 * API method to set the object number's value state
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.ValueState} sState
	 * @returns {ObjectNumber}
	 */
	ObjectNumber.prototype.setState = function(sState) {
		//remove the current value state css class
		this.$().removeClass(this._sCSSPrefixObjNumberStatus + this.getState());

		//do suppress rerendering
		this.setProperty("state", sState, true);

		//now set the new css state class
		this.$().addClass(this._sCSSPrefixObjNumberStatus + this.getState());

		return this;
	};

	/**
	 * API method to set the text alignment of the control without rerendering the whole object number
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.TextAlign} sAlign the new value
	 */
	ObjectNumber.prototype.setTextAlign = function(sAlign) {
		var sAlignVal = Renderer.getTextAlign(sAlign, this.getTextDirection());

		//do suppress rerendering
		this.setProperty("textAlign", sAlign, true);

		sAlignVal = sAlignVal || sAlign;
		this.$().css("text-align", sAlign);
	};

	return ObjectNumber;

}, /* bExport= */ true);
