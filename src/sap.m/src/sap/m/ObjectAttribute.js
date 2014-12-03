/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectAttribute.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";


	
	/**
	 * Constructor for a new ObjectAttribute.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectAttribute displays a text field that can be normal or active. Object attribute fires a press event when the user selects active text.
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
		properties : {

			/**
			 * The object attribute title.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * The object attribute text.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Indicates if the object attribute text is selectable by the user.
			 */
			active : {type : "boolean", group : "Misc", defaultValue : null}
		},
		aggregations : {
	
			/**
			 * Text control to display title and text property
			 */
			_textControl : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
		},
		events : {
	
			/**
			 * Event is fired when the user clicks active text
			 */
			press : {
				parameters : {
	
					/**
					 * Dom reference of the object attributes' text to be used for positioning.
					 */
					domRef : {type : "string"}
				}
			}
		}
	}});
	
	///**
	// * This file defines behavior for the control,
	// */
	
	/**
	 *  Initialize member variables
	 * 
	 * @private
	 */
	ObjectAttribute.prototype.init = function() {
		this.setAggregation('_textControl', new sap.m.Text());
	};
	
	/**
	 * Delivers text control with updated title, text and maxLines property
	 * 
	 * @private
	 */
	ObjectAttribute.prototype._getUpdatedTextControl = function() {
		var oTextControl = this.getAggregation('_textControl');
		var oParent = this.getParent();
		var oMaxLinesConst = {
			singleLine : 1,
			multiLine : 2
		};
		var iMaxLines = oMaxLinesConst.multiLine;
		oTextControl.setProperty('text', (this.getTitle() ? this.getTitle() + ": " : "") + this.getText(), true);
		//if attribute is used inside responsive ObjectHeader or in ObjectListItem - only 1 line
		if (oParent && ((oParent instanceof sap.m.ObjectHeader && oParent.getResponsive()) || oParent instanceof sap.m.ObjectListItem)) {
			iMaxLines = oMaxLinesConst.singleLine;
		}
		oTextControl.setProperty('maxLines', iMaxLines, true);
		return oTextControl;
	};
	
	/**
	 * @private
	 */
	ObjectAttribute.prototype.ontap = function(oEvent) {
		//event should only be fired if the click is on the text
		if (!!this.getActive() && (oEvent.target.id != this.getId())) {
			this.firePress({
				domRef : this.getDomRef()
			});
		}
	};
	
	/**
	 * @private
	 */
	sap.m.ObjectAttribute.prototype.onsapenter = function(oEvent) {
		if (!!this.getActive()) {
			this.firePress({
				domRef : this.getDomRef()
			});
		}
	};

	/**
	 * @private
	 */
	sap.m.ObjectAttribute.prototype.onsapspace = function(oEvent) {
		this.onsapenter(oEvent);
	};
	
	/**
	 * See 'return'.
	 * 
	 * @private
	 * @returns {boolean} true if attribute's text is empty or only consists of whitespaces.
	 */
	ObjectAttribute.prototype._isEmpty = function() {
		return !(this.getText().trim() || this.getTitle().trim());
	};
	
	/**
	 * Function is called when the control is touched.  
	 *
	 * @private
	 */
	ObjectAttribute.prototype.ontouchstart = function(oEvent) {
		if (!!this.getActive()) {
			// for control who need to know if they should handle events from the ObjectAttribute control
			oEvent.originalEvent._sapui_handledByControl = true;
		}
	};
	

	return ObjectAttribute;

}, /* bExport= */ true);
