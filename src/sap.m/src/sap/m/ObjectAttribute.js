/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectAttribute.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/m/Text',
	'./ObjectAttributeRenderer'
],
function(jQuery, library, Control, coreLibrary, Text, ObjectAttributeRenderer) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;



	/**
	 * Constructor for a new <code>ObjectAttribute</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ObjectAttribute</code> control displays a text field that can be normal or active.
	 * The <code>ObjectAttribute</code> fires a <code>press</code> event when the user chooses the active text.
	 *
	 * <b>Note:</b> If property <code>active</code> is set to <code>true</code>, only the value of the
	 * <code>text</code> property is styled and acts as a link. In this case the <code>text</code>
	 * property must also be set, as otherwise there will be no link displayed for the user.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.ObjectAttribute
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectAttribute = Control.extend("sap.m.ObjectAttribute", /** @lends sap.m.ObjectAttribute.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/ObjectAttribute.designtime",
		properties : {

			/**
			 * Defines the ObjectAttribute title.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the ObjectAttribute text.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Indicates if the <code>ObjectAttribute</code> text is selectable for the user.
			 *
			 * <b>Note:</b> As of version 1.48, only the value of the <code>text</code> property becomes active (styled and acts like a link) as opposed to both the <code>title</code> and <code>text</code> in the previous versions. If you set this property to <code>true</code>, you have to also set the <code>text</code> property.
			 */
			active : {type : "boolean", group : "Misc", defaultValue : null},

			/**
			 * Determines the direction of the text, not including the title.
			 * Available options for the text direction are LTR (left-to-right) and RTL (right-to-left). By default the control inherits the text direction from its parent control.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
		},
		aggregations : {

			/**
			 * When the aggregation is set, it replaces the text, active and textDirection properties. This also ignores the press event. The provided control is displayed as an active link.
			 * <b>Note:</b> It will only allow sap.m.Text and sap.m.Link controls.
			 */
			customContent : {type : "sap.ui.core.Control", multiple : false},

			/**
			 * Text control to display title and text property.
			 */
			_textControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fires when the user clicks on active text.
			 */
			press : {
				parameters : {

					/**
					 * DOM reference of the ObjectAttribute's text to be used for positioning.
					 */
					domRef : {type : "string"}
				}
			}
		}
	}});

	/**
	 *  Initializes member variables.
	 *
	 * @private
	 */
	ObjectAttribute.prototype.init = function() {
		this.setAggregation('_textControl', new Text());
	};

	/**
	 * Delivers text control with updated title, text and maxLines properties.
	 *
	 * @private
	 */
	ObjectAttribute.prototype._getUpdatedTextControl = function() {
		var oAttrAggregation = this.getAggregation('customContent') || this.getAggregation('_textControl'),
			sTitle = this.getTitle(),
			sText = this.getAggregation('customContent') ? this.getAggregation('customContent').getText() : this.getText(),
			sTextDir = this.getTextDirection(),
			oParent = this.getParent(),
			bPageRTL = sap.ui.getCore().getConfiguration().getRTL(),
			iMaxLines = ObjectAttributeRenderer.MAX_LINES.MULTI_LINE,
			bWrap = true,
			oppositeDirectionMarker = '';

		if (sTextDir === TextDirection.LTR && bPageRTL) {
			oppositeDirectionMarker = '\u200e';
		}
		if (sTextDir === TextDirection.RTL && !bPageRTL) {
			oppositeDirectionMarker = '\u200f';
		}
		sText = oppositeDirectionMarker + sText + oppositeDirectionMarker;
		if (sTitle) {
			sText = sText.replace(new RegExp(sTitle + ":\\s+", "gi"), "");
			sText = sTitle + ": " + sText;
		}
		oAttrAggregation.setProperty('text', sText, true);

		//if attribute is used inside responsive ObjectHeader or in ObjectListItem - only 1 line
		if (oParent instanceof sap.m.ObjectListItem) {
			bWrap = false;
			iMaxLines = ObjectAttributeRenderer.MAX_LINES.SINGLE_LINE;
		}

		this._setControlWrapping(oAttrAggregation, bWrap, iMaxLines);

		return oAttrAggregation;
	};

	/**
	 * Sets the appropriate property to the customContent aggregation.
	 *
	 * @private
	 */
	ObjectAttribute.prototype._setControlWrapping = function(oAttrAggregation, bWrap, iMaxLines) {
		if (oAttrAggregation instanceof sap.m.Link) {
			oAttrAggregation.setProperty('wrapping', bWrap, true);
		}
		if (oAttrAggregation instanceof Text) {
			oAttrAggregation.setProperty('maxLines', iMaxLines, true);
		}
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectAttribute.prototype.ontap = function(oEvent) {
		//event should only be fired if the click is on the text
		if (this._isSimulatedLink() && (oEvent.target.id != this.getId())) {
			this.firePress({
				domRef : this.getDomRef()
			});
		}
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectAttribute.prototype.onsapenter = function(oEvent) {
		if (this._isSimulatedLink()) {
			this.firePress({
				domRef : this.getDomRef()
			});

			// mark the event that it is handled by the control
			oEvent.setMarked();
		}
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectAttribute.prototype.onsapspace = function(oEvent) {
		this.onsapenter(oEvent);
	};

	/**
	 * Checks if ObjectAttribute is empty.
	 *
	 * @private
	 * @returns {boolean} true if ObjectAttribute's text is empty or only consists of whitespaces
	 */
	ObjectAttribute.prototype._isEmpty = function() {
		if (this.getAggregation('customContent') && !(this.getAggregation('customContent') instanceof sap.m.Link || this.getAggregation('customContent') instanceof Text)) {
			jQuery.sap.log.warning("Only sap.m.Link or sap.m.Text are allowed in \"sap.m.ObjectAttribute.customContent\" aggregation");
			return true;
		}

		return !(this.getText().trim() || this.getTitle().trim());
	};

	/**
	 * Called when the control is touched.
	 * @param {object} oEvent The fired event
	 * @private
	 */
	ObjectAttribute.prototype.ontouchstart = function(oEvent) {
		if (this._isSimulatedLink()) {
			// for control who need to know if they should handle events from the ObjectAttribute control
			oEvent.originalEvent._sapui_handledByControl = true;
		}
	};

	/**
	 * Defines to which DOM reference the Popup should be docked.
	 *
	 * @protected
	 * @return {DomNode} The DOM reference that Popup should dock to
	 */
	ObjectAttribute.prototype.getPopupAnchorDomRef = function() {
		return this.getDomRef("text");
	};

	ObjectAttribute.prototype._isSimulatedLink = function () {
		return (this.getActive() && this.getText() !== "") && !this.getAggregation('customContent');
	};

	return ObjectAttribute;

});
