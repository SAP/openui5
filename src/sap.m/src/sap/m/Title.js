/*!
 * ${copyright}
 */

 /**
  * @typedef {Object} sap.m.Title
  * @typedef {Object} sap.ui.core.Title
  */
// Provides control sap.m.Title.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'./library',
	'sap/ui/core/library',
	'./TitleRenderer'
],
	function(jQuery, Control, library, coreLibrary, TitleRenderer) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new Title control.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The Title control represents a single line of text with explicit header / title semantics.
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
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/title/ Title}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Title = Control.extend("sap.m.Title", /** @lends sap.m.Title.prototype */ { metadata : {

		library : "sap.m",
		interfaces : [
			 "sap.ui.core.IShrinkable"
		],
		properties : {

			/**
			 * Defines the text which should be displayed as a title.
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Defines the semantic level of the title.
			 * This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation.
			 * Depending on this setting either an HTML h1-h6 element is used or when using level <code>Auto</code> no explicit level information is written (HTML5 header element).
			 * This property does not influence the style of the control. Use the property <code>titleStyle</code> for this purpose instead.
			 */
			level : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

			/**
			 * Defines the style of the title.
			 * When using the <code>Auto</code> styling, the appearance of the title depends on the current position of the title (e.g. inside a <code>Toolbar</code>).
			 * This default behavior can be overridden by setting a different style explicitly.
			 * The actual appearance of the title and the different styles always depends on the theme being used.
			 */
			titleStyle : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

			/**
			 * Defines the width of the title.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Defines the alignment of the text within the title. <b>Note:</b> This property only has an effect if the overall width of the title control is
			 * larger than the displayed text.
			 */
			textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Initial},

			/**
			 * Enables text wrapping.
			 * <b>Note:</b> Wrapping must only be activated if the surrounding container allows flexible heights.
			 * @since 1.52
			 */
			wrapping : {type : "boolean", group : "Appearance", defaultValue : false}

		},
		associations : {

			/**
			 * Defines a relationship to a generic title description.
			 * If such a title element is associated, the properties text, level and tooltip (text only) of this element are consumed.
			 * The corresponding properties of the title control are ignored.
			 */
			title : {type : "sap.ui.core.Title", multiple : false}
		},
		designtime: "sap/m/designtime/Title.designtime"

	}});

	/**
	 * Sets text within the title.
	 *
	 * @name sap.m.Title.setText
	 * @method
	 * @public
	 * @param {string} sText Text that will be set for the title.
	 * @returns {sap.m.Title} this Title reference for chaining.
	 */
	Title.prototype.setText = function(sText) {
		var oRef = this.getDomRef("inner");
		var bPatchDom = oRef && !this._getTitle();
		this.setProperty("text", sText, bPatchDom);
		if (bPatchDom) {
			oRef.innerHTML = jQuery.sap.encodeHTML(this.getText() || "");
		}
		return this;
	};


	/**
	 * Gets the currently set title.
	 *
	 * @name sap.m.Title._getTitle
	 * @method
	 * @private
	 * @returns {sap.m.Title} Instance of the associated sap.ui.core.Title if exists.
	 */
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

	/**
	 * Title on change handler.
	 *
	 * @name sap.m.Title._onTitleChanged
	 * @method
	 * @private
	 */
	Title.prototype._onTitleChanged = function(){
		this.invalidate();
	};

	/**
	 * Sets the title for a <code>sap.m.Title</code> or <code>sap.ui.core.Title</code>
	 *
	 * @name sap.m.Title.setTitle
	 * @method
	 * @public
	 * @param {sap.m.Title|sap.ui.core.Title} vTitle Given variant of the a title which can be <code>sap.m.Title</code> or <code>sap.ui.core.Title</code>.
	 * @returns {sap.m.Title} this Title reference for chaining.
	 */
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

	/**
	 * Gets the accessibility information for the <code>sap.m.Title</code> control.
	 *
	 * @name sap.m.Title.getAccessibilityInfo
	 * @method
	 * @protected
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	Title.prototype.getAccessibilityInfo = function() {
		var oTitle = this._getTitle() || this;
		return {
			role: "heading",
			description: oTitle.getText(),
			focusable: false
		};
	};

	return Title;

});