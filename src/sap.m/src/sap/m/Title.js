/*!
 * ${copyright}
 */

 /**
  * @typedef {Object} sap.m.Title
  * @typedef {Object} sap.ui.core.Title
  */
// Provides control sap.m.Title.
sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	'sap/ui/core/library',
	'./TitleRenderer',
	"sap/m/HyphenationSupport"
],
	function(Control, library, coreLibrary, TitleRenderer, HyphenationSupport) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new Title control.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A simple, large-sized text with explicit header / title semantics.
	 *
	 * <h3>Overview</h3>
 	 * The <code>Title</code> control is a simple, large-sized text containing additional
 	 * semantic information for accessibility purposes.
	 *
	 * As of version 1.52, you can truncate or wrap long titles if the screen is narrower
	 * than the full title by using the with the use of the <code>wrapping</code>
	 * property.
	 *
	 * As of version 1.60, you can hyphenate the label's text with the use of the
	 * <code>wrappingType</code> property. For more information, see
	 * {@link topic:6322164936f047de941ec522b95d7b70 Text Controls Hyphenation}.
	 *
 	 * <h3>Usage</h3>
 	 * <h4>When to use</h4>
	 * <ul>
	 * <li>If you want to set the title above a table or form.</li>
	 * <li>If you want to show text in the page header.</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li>If the text is inside a text block.</li>
	 * <li>If The text is inside a form element.</li>
	 * </ul>
	 *
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
			 "sap.ui.core.IShrinkable",
			 "sap.m.IHyphenation"
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
			wrapping : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the type of text wrapping to be used (hyphenated or normal).
			 *
			 * <b>Note:</b> This property takes effect only when the <code>wrapping</code>
			 * property is set to <code>true</code>.
			 *
			 * @since 1.60
			 */
			wrappingType : {type: "sap.m.WrappingType", group : "Appearance", defaultValue : WrappingType.Normal}

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

	/**
	 * Gets a map of texts which should be hyphenated.
	 *
	 * @private
	 * @returns {Object<string,string>} The texts to be hyphenated.
	 */
	Title.prototype.getTextsToBeHyphenated = function () {
		var oTitleAssociation = this._getTitle();
		return {
			"main": oTitleAssociation ? oTitleAssociation.getText() : this.getText()
		};
	};

	/**
	 * Gets the DOM refs where the hyphenated texts should be placed.
	 *
	 * @private
	 * @returns {map|null} The elements in which the hyphenated texts should be placed
	 */
	Title.prototype.getDomRefsForHyphenatedTexts = function () {
		var oDomRefs;
		if (!this._getTitle()) {
			oDomRefs = {
				"main": this.getDomRef("inner")
			};
		}
		return oDomRefs;
	};

	// Add hyphenation to Title functionality
	HyphenationSupport.mixInto(Title.prototype);

	return Title;

});
