/*!
 * ${copyright}
 */

// Provides control sap.m.Title.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/Device', './library'],
	function(jQuery, Control, Device, library) {
	"use strict";
	
	/**
	 * Constructor for a new Title Text Control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Title control is used for header texts and title.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IShrinkable
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.27.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Title
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Title = Control.extend("sap.m.Title", /** @lends sap.m.Title.prototype */ { metadata : {
		
		library : "sap.m",
		interfaces : [
		     "sap.ui.core.IShrinkable"
		],
		properties : {
			
			/**
			 * Title Text to be displayed
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},
	
			/**
			 * Defines the semantic level of the title. Using 'Auto' no explicit level information is written.
			 */
			level : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : sap.ui.core.TitleLevel.Auto},
			
			/**
			 * Sets the style of the Title. Using 'Auto' the style is automatically set based on the current position of the title and the current theming.
			 */
			titleStyle : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : sap.ui.core.TitleLevel.Auto},
			
			/**
			 * Defines the width of the Title.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},
	
			/**
			 * Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Initial}
			
		},
		associations : {

			/**
			 * Association to a generic title description.
			 * If such a title element is associated the properties text, level and tooltip (text only) of this element are consumed.
			 * The corresponding properties of the title control are ignored.
			 */
			title : {type : "sap.ui.core.Title", multiple : false}
		}
	
	}});
	
	// Returns the instance of the associated sap.ui.core.Title if exists
	Title.prototype._getTitle = function(){
		var sTitle = this.getTitle();
		
		if (sTitle) {
			var oTitle = sap.ui.getCore().byId(sTitle);
			if (oTitle && oTitle instanceof sap.ui.core.Title) {
				return oTitle;
			}
		}
		
		return null;
	};
	
	Title.prototype._onTitleChanged = function(){
		this.invalidate();
	};
	
	Title.prototype.setTitle = function(vTitle){
		var that = this;
		
		var oOldTitle = this._getTitle();
		if (oOldTitle) {
			oOldTitle.invalidate = oOldTitle.__sapui5_title_originvalidate;
			oOldTitle.exit = oOldTitle.__sapui5_title_origexit;
			delete oOldTitle.__sapui5_title_origexit;
			delete oOldTitle.__sapui5_title_originvalidate;
		}
		
		this.setAssociation("title", vTitle);
		
		var oNewTitle = this._getTitle();
		if (oNewTitle) {
			oNewTitle.__sapui5_title_originvalidate = oNewTitle.invalidate;
			oNewTitle.__sapui5_title_origexit = oNewTitle.exit;
			oNewTitle.exit = function() {
				that._onTitleChanged();
				if (this.__sapui5_title_origexit) {
					this.__sapui5_title_origexit.apply(this, arguments);
				}
			};
			oNewTitle.invalidate = function() {
				that._onTitleChanged();
				this.__sapui5_title_originvalidate.apply(this, arguments);
			};
		}
		
		return this;
	};

	
	return Title;

}, /* bExport= */ true);