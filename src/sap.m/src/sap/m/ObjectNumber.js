/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectNumber.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/Renderer',
	'sap/ui/core/library',
	'./ObjectNumberRenderer'
],
	function(library, Control, Renderer, coreLibrary, ObjectNumberRenderer) {
	"use strict";


	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	/**
	 * Constructor for a new ObjectNumber.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ObjectNumber control displays number and number unit properties for an object. The number can be displayed using semantic
	 * colors to provide additional meaning about the object to the user.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectNumber
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-display-elements/#-object-status Object Number}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectNumber = Control.extend("sap.m.ObjectNumber", /** @lends sap.m.ObjectNumber.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		designtime: "sap/m/designtime/ObjectNumber.designtime",
		properties : {

			/**
			 * Defines the number field.
			 */
			number : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the number units qualifier.
			 * @deprecated as of version 1.16.1, replaced by <code>unit</code> property
			 */
			numberUnit : {type : "string", group : "Misc", defaultValue : null, deprecated: true},

			/**
			 * Indicates if the object number should appear emphasized.
			 */
			emphasized : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Determines the object number's value state. Setting this state will cause the number to be rendered in state-specific colors.
			 */
			state : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : ValueState.None},

			/**
			 * Defines the number units qualifier. If numberUnit and unit are both set, the unit value is used.
			 * @since 1.16.1
			 */
			unit : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Available options for the number and unit text direction are LTR(left-to-right) and RTL(right-to-left). By default, the control inherits the text direction from its parent control.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Sets the horizontal alignment of the number and unit.
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin}
		},
		associations : {

			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"}
		}
	}});

	/**
	 * String to prefix CSS class for number status to be used in.
	 * controler and renderer
	 *
	 * @private
	 */
	ObjectNumber.prototype._sCSSPrefixObjNumberStatus = 'sapMObjectNumberStatus';

	/**
	 * Sets the ObjectNumber's value state.
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.ValueState} sState The state to be set to
	 * @returns {sap.m.ObjectNumber} this pointer for chaining
	 */
	ObjectNumber.prototype.setState = function(sState) {
		// no rerendering only when the current and new state are different from ValueState.None
		// otherwise we have to rerender the control so we can have invisible text rendered and aria-labelledby set correctly
		if (this.getState() !== ValueState.None && sState !== ValueState.None) {
			//remove the current value state css class
			this.$().removeClass(this._sCSSPrefixObjNumberStatus + this.getState());

			//do suppress rerendering
			this.setProperty("state", sState, true);

			//now set the new css state class
			this.$().addClass(this._sCSSPrefixObjNumberStatus + this.getState());

			// update ARIA text
			this._updateACCState();
		} else {
			this.setProperty("state", sState, false);
		}

		return this;
	};

	/**
	 * Sets the text alignment of the control without re-rendering the whole ObjectNumber.
	 *
	 * @override
	 * @public
	 * @param {sap.ui.core.TextAlign} sAlign The new value
	 * @returns {sap.m.ObjectNumber} <code>this</code> pointer for chaining
	 */
	ObjectNumber.prototype.setTextAlign = function(sAlign) {
		var sAlignVal = Renderer.getTextAlign(sAlign, this.getTextDirection());

		//do suppress rerendering
		this.setProperty("textAlign", sAlign, true);

		sAlignVal = sAlignVal || sAlign;
		this.$().css("text-align", sAlign);
		return this;
	};

	// updates inner html of the span which contains the state text read by the screen reader
	ObjectNumber.prototype._updateACCState = function() {

		return this.$("state").text(this._getStateText());

	};

	// returns translated text for the state
	ObjectNumber.prototype._getStateText = function() {

		var sARIAStateText,
			oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			switch (this.getState()) {
				case ValueState.Error:
					sARIAStateText = oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_ERROR");
					break;
				case ValueState.Warning:
					sARIAStateText = oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_WARNING");
					break;
				case ValueState.Success:
					sARIAStateText = oRB.getText("OBJECTNUMBER_ARIA_VALUE_STATE_SUCCESS");
					break;
			}

		return sARIAStateText;
	};

	return ObjectNumber;

});
