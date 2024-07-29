/*!
 * ${copyright}
 */

// Provides control sap.m.GenericTag.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/events/KeyCodes",
	'./library',
	"sap/ui/core/library",
	"sap/ui/core/Icon",
	"./GenericTagRenderer"
], function(Control, KeyCodes, library, coreLibrary, Icon, GenericTagRenderer) {
	"use strict";

	//shortcut for sap.m.GenericTagValueState
	var GenericTagDesign = library.GenericTagDesign,

		//shortcut for sap.m.GenericTagValueState
		GenericTagValueState = library.GenericTagValueState,

		// shortcut for sap.ui.core.ValueState
		ValueState = coreLibrary.ValueState,

		// map of the icon types, relative to the status message
		Icons = {
			Error: "sap-icon://error",
			Warning: "sap-icon://alert",
			Success: "sap-icon://sys-enter-2",
			Information: "sap-icon://information"
		};

	/**
	 * Constructor for a new <code>sap.m.GenericTag</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.GenericTag</code> control displays app-specific, essential
	 * information.
	 * <h3>Structure</h3>
	 * The control consists of four different parts:
	 * <ul>
	 * <li>Status indicator with semantic colors (required)</li>
	 * <li>Icon that is displayed in the same color as the status indicator (optional)</li>
	 * <li>Text that is truncated automatically (required)</li>
	 * <li>Content area that can display either a control of type {@link sap.m.ObjectNumber} or a warning icon (optional)</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.62.0
	 * @alias sap.m.GenericTag
	 */
	var GenericTag = Control.extend("sap.m.GenericTag", /** @lends sap.m.GenericTag.prototype */ {
		metadata: {
			library : "sap.m",
			interfaces : [
				"sap.m.IOverflowToolbarContent",
				"sap.m.IToolbarInteractiveControl",
				"sap.m.IOverflowToolbarFlexibleContent"
			],
			properties : {
				/**
				 * Defines the text rendered by the control. It's a value-descriptive text rendered on one line.
				 */
				text: { type : "string", defaultValue: ""},
				/**
				 * Determines the control status that is represented in different colors,
				 * including the color bar and the color and type of the displayed icon.
				 */
				status: { type : "sap.ui.core.ValueState", defaultValue : ValueState.None },
				/**
				 * Determines the visual mode of the control.
				 */
				design: { type : "sap.m.GenericTagDesign", defaultValue : GenericTagDesign.Full },
				/**
				 * Determines the state of the control.
				 *
				 * <b>Note:</b> When the error state is set, a warning type of icon is displayed that
				 * overrides the control set through the <code>value</code> aggregation.
				 */
				valueState: {type : "sap.m.GenericTagValueState", defaultValue : GenericTagValueState.None }
			},
			defaultAggregation: "value",
			associations : {
				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledBy).
	 			 * @since 1.97.0
				 */
				ariaLabelledBy: {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			aggregations: {
				/**
				 * Numeric value rendered by the control.
				 */
				value: { type: "sap.m.ObjectNumber", multiple: false },
				/**
				 * Icon indicating the status of the control.
				 */
				_statusIcon : { type:  "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				/**
				 * Icon for visualization when error is thrown.
				 */
				_errorIcon : { type:  "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			},
			events : {
				/**
				 * Fired when the user clicks/taps on the control.
				 */
				press: {}
			}
		},

		renderer: GenericTagRenderer
	});

	/**
	 * Classname to be used, when control is inside OverflowToolbar
	 *
	 */

	GenericTag.CLASSNAME_OVERFLOW_TOOLBAR = "sapMGenericTagOverflowToolbar";
	/**
	 * Sets the <code>status</code> property.
	 *
	 * Default value is <code>None</code>.
	 * @param {sap.ui.core.ValueState} sStatus New value for property <code>status</code>.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */

	GenericTag.prototype.setStatus = function(sStatus) {

		this.setProperty("status", sStatus, false);
		this._getStatusIcon().setSrc(sStatus !== ValueState.None ? Icons[sStatus] : null);

		return this;
	};

	GenericTag.prototype.setValue = function(oValue) {
		var oPreviousValue = this.getValue();
		if (oPreviousValue) {
			oValue.detachEvent("_change", this._fireValueChanged, this);
		}

		this.setAggregation("value", oValue);
		oValue.attachEvent("_change", this._fireValueChanged, this);

		this._fireValueChanged();

		return this;
	};

	// Fires invalidation event for OverflowToolbar
	GenericTag.prototype._fireValueChanged = function() {
		this.fireEvent("_valueChanged");
	};

	/**
	 * Gets the GenericTag's status icon.
	 *
	 * @returns {sap.m.Icon} Status icon
	 * @private
	 */
	GenericTag.prototype._getStatusIcon = function() {
		var oStatusIcon = this.getAggregation("_statusIcon");

		if (!oStatusIcon) {
			oStatusIcon = new Icon(this.getId() + "-statusIcon").addStyleClass("sapMGenericTagIcon");
			this.setAggregation("_statusIcon", oStatusIcon);
		}

		return oStatusIcon;
	};

	/**
	 * Gets the GenericTag's error icon.
	 *
	 * @returns {sap.m.Icon} Error icon
	 * @private
	 */
	GenericTag.prototype._getErrorIcon = function() {
		var oErrorIcon = this.getAggregation("_errorIcon");

		if (!oErrorIcon) {
			oErrorIcon = new Icon(this.getId() + "-errorIcon", {src: Icons[ValueState.Error]})
				.addStyleClass("sapMGenericTagErrorIcon");
			this.setAggregation("_errorIcon", oErrorIcon);
		}

		return oErrorIcon;
	};

	/**
	 * Handle the touch start event on the <code>GenericTag</code>.
	 * Fires the <code>GenericTag</code> press event.
	 *
	 * @private
	 */
	GenericTag.prototype.ontouchstart = function(){
		this._toggleActiveGenericTag(true);
	};

	/**
	 * Handle the touch end event on the <code>GenericTag</code>.
	 *
	 * @private
	 */
	GenericTag.prototype.ontouchend = function(){
		this._toggleActiveGenericTag(false);
	};

	/**
	 * Handle the touch cancel event on the <code>GenericTag</code>.
	 *
	 * @private
	 */
	GenericTag.prototype.ontouchcancel = function(){
		this._toggleActiveGenericTag(false);
	};

	/**
	 * Handle the key down event for SPACE and ENTER.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	GenericTag.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			this._toggleActiveGenericTag(true);
		}

		if (oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
			this._bShouldInterupt = this._bSpacePressed;
		}

		// Prevent browser scrolling in case of SPACE key
		if (oEvent.which === KeyCodes.SPACE) {
			this._bSpacePressed = true;

			oEvent.preventDefault();
		}

		if (oEvent.which === KeyCodes.ENTER) {
			this._firePress(oEvent);
		}
	};

	/**
	 * Handle the key up event for SPACE.
	 * @param {jQuery.Event} oEvent - the keyboard event.
	 * @private
	 */
	GenericTag.prototype.onkeyup = function(oEvent){
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.ENTER) {
			this._toggleActiveGenericTag(false);
		}

		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bShouldInterupt) {
				this._firePress(oEvent);
			}
			this._bShouldInterupt = false;
			this._bSpacePressed = false;
		}
	};

	/**
	 * Handle the click event happening in the <code>GenericTag</code>.
	 *
	 * @private
	 */
	GenericTag.prototype.onclick = function(oEvent) {
		this._firePress(oEvent);
	};

	/**
	 * Ensure that the active GenericTag state is removed by focus loss.
	 *
	 * @private
	 */
	GenericTag.prototype.onfocusout = function() {
		this._toggleActiveGenericTag(false);
	};

	/**
	 * @private
	 */
	GenericTag.prototype._firePress = function(oEvent) {
		oEvent.setMarked();

		this.firePress();
	};

	GenericTag.prototype._toggleActiveGenericTag = function(bToggle){
		this.toggleStyleClass("sapMGenericTagActive", bToggle);
	};

	/**
	 * Used for OverflowToolbar functionality.
	 * @private
	 */

	GenericTag.prototype._onBeforeEnterOverflow = function(oControl) {
		oControl.addStyleClass(GenericTag.CLASSNAME_OVERFLOW_TOOLBAR);
	};

	/**
	 * Used for OverflowToolbar functionality.
	 * @private
	 */

	GenericTag.prototype._onAfterExitOverflow = function(oControl) {
		oControl.removeStyleClass(GenericTag.CLASSNAME_OVERFLOW_TOOLBAR);
	};

	/**
	 * Sets the behavior of the <code>GenericTag</code> inside an <code>OverflowToolbar</code> configuration.
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 *
	 * @public
	 * @returns {sap.m.OverflowToolbarConfig} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	GenericTag.prototype.getOverflowToolbarConfig = function() {
		var oConfig = {
			canOverflow: true,
			invalidationEvents: ["_valueChanged"]
		};

		oConfig.onBeforeEnterOverflow = this._onBeforeEnterOverflow;

		oConfig.onAfterExitOverflow = this._onAfterExitOverflow;

		return oConfig;
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	GenericTag.prototype._getToolbarInteractive = function () {
		return true;
	};


	return GenericTag;
});