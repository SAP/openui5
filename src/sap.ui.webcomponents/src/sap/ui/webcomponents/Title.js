/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Title.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"sap/ui/core/library",
	"./thirdparty/ui5-wc-bundles/Title"
], function(WebComponent, coreLibrary) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>Title</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.Title
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Title = WebComponent.extend("sap.ui.webcomponents.Title", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-title",
			properties: {

				/**
				 * Defines the text which should be displayed as a title.
				 */
				text : {type : "string", group : "Appearance", defaultValue : null, mapping: "textContent"},

				/**
				 * Defines the semantic level of the title.
				 * This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation.
				 * Depending on this setting either an HTML h1-h6 element is used or when using level <code>Auto</code> no explicit level information is written (HTML5 header element).
				 * This property does not influence the style of the control. Use the property <code>titleStyle</code> for this purpose instead.
				 */
				level : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

				/**
				 * DDefines whether the text can wrap.
				 */
				wrap : {type: "boolean", group : "Appearance", defaultValue: false}
			}
		}
	});

	return Title;
});
