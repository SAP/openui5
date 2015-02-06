/*!
 * ${copyright}
 */

// Provides control sap.m.CheckBox.
sap.ui.define(['jquery.sap.global', './Label', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator'],
	function(jQuery, Label, library, Control, EnabledPropagator) {
	"use strict";



	/**
	 * Constructor for a new CheckBox.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * CheckBox control
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.CheckBox
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CheckBox = Control.extend("sap.m.CheckBox", /** @lends sap.m.CheckBox.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Contains the state of the control whether it is flagged with a check mark, or not
			 */
			selected : {type : "boolean", group : "Data", defaultValue : false},

			/**
			 * Using this property, the control could be disabled, if required.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The 'name' property to be used in the HTML code, for example for HTML forms that send data to the server via submit.
			 */
			name : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the text displayed next to the check box
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},

			/**
			 * Aligns the text of the checkbox. Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin},

			/**
			 * Width of Label
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

			/**
			 * this is a flag to switch on activeHandling, when it is switched off, there will not be visual changes on active state. Default value is 'true'
			 */
			activeHandling : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Specifies whether the user shall be allowed to select the check box
			 * @since 1.25
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true}
		},
		associations : {

			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events : {

			/**
			 * Event is triggered when the control status is changed by the user by selecting or deselecting the checkbox.
			 */
			select : {
				parameters : {

					/**
					 * Checks whether the CheckBox is flagged or not flagged.
					 */
					selected : {type : "boolean"}
				}
			}
		}
	}});

	EnabledPropagator.call(CheckBox.prototype);


	CheckBox.prototype.init = function() {
		this.addActiveState(this);
		jQuery.sap.require("sap.ui.core.IconPool");
		sap.ui.core.IconPool.insertFontFaceStyle();
	};
	
	CheckBox.prototype.onAfterRendering = function() {
		if (!this.getText() && !this.$().attr("aria-labelledby")) {
			this.$().attr("aria-label", " ");
		}
	};

	/**
	 * Called when the control is touched.
	 *
	 * @private
	 */
	CheckBox.prototype.ontouchstart = function(oEvent) {
		//for control who need to know if they should handle events from the CheckBox control
		oEvent.originalEvent._sapui_handledByControl = true;
	};

	CheckBox.prototype.setSelected = function(bSelected) {
		bSelected = !!bSelected;
		if (bSelected == this.getSelected()) {
			return this;
		}
		this.$("CbBg").toggleClass("sapMCbMarkChecked", bSelected);
		this.$().attr("aria-checked", bSelected);
		var oCheckBox = this.getDomRef("CB");
		if (oCheckBox) {
			bSelected ? oCheckBox.setAttribute('checked', 'checked') : oCheckBox.removeAttribute('checked');
		}
		this.setProperty("selected", bSelected, true);
		return this;
	};

	/**
	 * Function is called when CheckBox is tapped.
	 *
	 * @private
	 */
	CheckBox.prototype.ontap = function(oEvent) {
		if (this.getEnabled() && this.getEditable()) {
			var bSelected = !this.getSelected();
			this.setSelected(bSelected);
			this.fireSelect({selected:bSelected});
		}
	};

	/**
	 * add ActiveState to non-supported mobile platform
	 * @private
	 */

	CheckBox.prototype.addActiveState = function(oControl) {
		if (sap.ui.Device.os.blackberry || (sap.ui.Device.os.android && (sap.ui.Device.os.versionStr.match(/[23]\./)))) {
			oControl.addDelegate({
				ontouchstart: function(oEvent){
					jQuery(oControl.getDomRef()).addClass("sapMActive");
				},
				ontouchend: function(oEvent){
					jQuery(oControl.getDomRef()).removeClass("sapMActive");
				}
			});
		}
	};

	/**
	 * sets a property of the label, and creates the label if it has not been initialized
	 * @private
	 */
	CheckBox.prototype._setLabelProperty = function (sPropertyName, vPropertyValue, bSupressRerendering) {
		var bHasLabel = !!this._oLabel,
			sUpperPropertyName = jQuery.sap.charToUpperCase(sPropertyName, 0);

		this.setProperty(sPropertyName, vPropertyValue, bHasLabel && bSupressRerendering);

		if (!bHasLabel) {
			this._oLabel = new Label(this.getId() + "-label", {labelFor: this.getId()})
								.addStyleClass("sapMCbLabel")
								.setParent(this, null, true);
		}

		this._oLabel["set" + sUpperPropertyName](this["get" + sUpperPropertyName]()); // e.g. this._oLabel.setText(value);

		return this;
	};

	CheckBox.prototype.setText = function(sText){
		this._setLabelProperty("text", sText, true);
	};

	CheckBox.prototype.setWidth = function(sWidth){
		this._setLabelProperty("width", sWidth, true);
	};

	CheckBox.prototype.setTextDirection = function(sDirection){
		this._setLabelProperty("textDirection", sDirection);
	};

	CheckBox.prototype.setTextAlign = function(sAlign){
		this._setLabelProperty("textAlign", sAlign);
	};

	CheckBox.prototype.exit = function() {
		delete this._iTabIndex;
		if (this._oLabel) {
			this._oLabel.destroy();
		}
	};

	/**
	 * Event handler called when the space key is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	CheckBox.prototype.onsapspace = function(oEvent) {
		this.ontap(oEvent);
		// stop browsers default behavior
		if (oEvent) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Event handler called when the enter key is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	CheckBox.prototype.onsapenter = function(oEvent) {
		this.ontap(oEvent);
	};

	/**
	 * Sets the tab index of the control
	 *
	 * @param {int} iTabIndex  greater than or equal -1
	 * @return {sap.m.CheckBox}
	 * @since 1.16
	 * @protected
	 */
	CheckBox.prototype.setTabIndex = function(iTabIndex) {
		this._iTabIndex = iTabIndex;
		this.$("CbBg").attr("tabindex", iTabIndex);
		return this;
	};



	/**
	 * Gets the tab index of the control
	 *
	 * @return {integer} tabIndex for Checkbox
	 * @since 1.22
	 * @protected
	 */
	CheckBox.prototype.getTabIndex = function() {
		if ( this.hasOwnProperty("_iTabIndex") ) {
			return this._iTabIndex;
		}
		return this.getEnabled() ? 0 : -1 ;
	};



	return CheckBox;

}, /* bExport= */ true);
