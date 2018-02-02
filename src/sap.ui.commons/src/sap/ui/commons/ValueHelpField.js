/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ValueHelpField.
sap.ui.define([
    'jquery.sap.global',
    './TextField',
    './library',
    'sap/ui/core/IconPool',
    'sap/ui/core/theming/Parameters',
    "./ValueHelpFieldRenderer"
],
	function(jQuery, TextField, library, IconPool, Parameters, ValueHelpFieldRenderer) {
	"use strict";



	/**
	 * Constructor for a new ValueHelpField.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A TextField with an attached icon which triggeres an event.
	 * @extends sap.ui.commons.TextField
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.Input</code> control.
	 * @alias sap.ui.commons.ValueHelpField
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ValueHelpField = TextField.extend("sap.ui.commons.ValueHelpField", /** @lends sap.ui.commons.ValueHelpField.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * URL of the standard icon for the value help. If no parameter is supplied the default icon image will be shown.
			 * This can be a URI to an image or an icon font URI.
			 */
			iconURL : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * URL of the icon for the value help when hovered. If no parameter is supplied the standard icon image will be shown.
			 * If an icon font icon is used, this property is ignored.
			 */
			iconHoverURL : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * URL of the icon for the value help when disabled. If no parameter is supplied the default icon image will be shown.
			 * If an icon font icon is used, this property is ignored.
			 */
			iconDisabledURL : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null}
		},
		events : {

			/**
			 * Event which is fired when the ValueHelp is requested.
			 */
			valueHelpRequest : {}
		}
	}});


	ValueHelpField.prototype.onBeforeRendering = function() {
		this.sIconDsblUrl = "sap-icon://value-help";
		this.sIconRegularUrl = "sap-icon://value-help";
		this.sIconHoverUrl = "sap-icon://value-help";
	};

	ValueHelpField.prototype.onmouseover = function (oEvent) {

		if (oEvent.target.id == this.getId() + '-icon' && this.getEnabled() && this.getEditable() && !this.bIsIconURI) {
			if (this.getIconHoverURL()) {
				this.sIconHoverUrl = this.getIconHoverURL();
			} else if (this.getIconURL()) {
				this.sIconHoverUrl = this.sIconRegularUrl;
			} else {
				this.sIconHoverUrl = "sap-icon://value-help";
			}
			var oIcon = jQuery.sap.byId(oEvent.target.id);
			oIcon.attr( 'src', this.sIconHoverUrl );
		}
	};

	ValueHelpField.prototype.onmouseout = function (oEvent) {
		if (oEvent.target.id == this.getId() + '-icon' && this.getEnabled() && this.getEditable() && !this.bIsIconURI) {
			var oIcon = jQuery.sap.byId(oEvent.target.id);
			oIcon.attr( 'src', this.sIconRegularUrl );
		}
	};

	ValueHelpField.prototype.onclick = function(oEvent){
	if (oEvent.target.id == this.getId() + '-icon' && this.getEnabled() && this.getEditable()) {
			this.fireValueHelpRequest({/* no parameters */});
		}
	};

	ValueHelpField.prototype.setEnabled = function(bEnabled) {
		var bOldEnabled = this.getEnabled();
		TextField.prototype.setEnabled.apply(this, arguments);

		if (this.getDomRef() && bOldEnabled != bEnabled && !this.bIsIconURI) {
			var oIcon = this.$("icon");
			if (bEnabled) {
				oIcon.attr( 'src', this.sIconRegularUrl );
				oIcon.removeClass('sapUiTfValueHelpDsblIcon');
				oIcon.addClass('sapUiTfValueHelpRegularIcon');
			} else {
				oIcon.attr( 'src', this.sIconRegularUrl );
				oIcon.removeClass('sapUiTfValueHelpRegularIcon');
				oIcon.addClass('sapUiTfValueHelpDsblIcon');
			}
		}
	};

	ValueHelpField.prototype.setEditable = function(bEditable) {
		var bOldEditable = this.getEditable();
		TextField.prototype.setEditable.apply(this, arguments);

		if (this.getDomRef() && bOldEditable != bEditable && !this.bIsIconURI) {
			var oIcon = this.$("icon");
			if (bEditable) {
				oIcon.removeClass('sapUiTfValueHelpDsblIcon');
				oIcon.addClass('sapUiTfValueHelpRegularIcon');
			} else {
				oIcon.removeClass('sapUiTfValueHelpRegularIcon');
				oIcon.addClass('sapUiTfValueHelpDsblIcon');
			}
		}
	};

	/**
	 * Handle F4 event
	 * @param {jQuery.Event} oEvent the occurring event
	 * @protected
	 */
	ValueHelpField.prototype.onsapshow = function(oEvent) {
		this._checkChange(oEvent);
		this.fireValueHelpRequest({/* no parameters */});
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/*
	 * Extends the method inherited from sap.ui.core.Element by providing information on Search Help access
	 *
	 * @return {string} string tooltip or undefined
	 * @public
	 */
	ValueHelpField.prototype.getTooltip_AsString = function() {
		var sTooltipString = TextField.prototype.getTooltip_AsString.apply(this, arguments);
		if (this.getEnabled() && this.getEditable()) {
			var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
			// ResourceBundle always returns the key if the text is not found
			var sSearchHelp = rb.getText("VHF_TOOLTIP");
			return (sTooltipString ? sTooltipString + " - " : "") + sSearchHelp;
		} else {
			return sTooltipString;
		}
	};

	/**
	 * Called after the theme has been switched. Some adjustments required.
	 * @private
	 */
	ValueHelpField.prototype.onThemeChanged = function (oEvent) {
		if (this.getDomRef()) {
			this.invalidate();
		}
	};

	ValueHelpField.prototype.exit = function(){
		this.sIconRegularUrl = undefined;
		this.sIconHoverUrl = undefined;
		this.sIconDsblUrl = undefined;
	};

	return ValueHelpField;

}, /* bExport= */ true);
