/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Title.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/Title"
], function(WebComponent, library) {
	"use strict";

	var TitleLevel = library.TitleLevel;
	var WrappingType = library.WrappingType;

	/**
	 * Constructor for a new <code>Title</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Title</code> component is used to display titles inside a page. It is a simple, large-sized text with explicit header/title semantics.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Title
	 */
	var Title = WebComponent.extend("sap.ui.webc.main.Title", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-title-ui5",
			properties: {

				/**
				 * Defines the component level. Available options are: <code>"H6"</code> to <code>"H1"</code>.
				 */
				level: {
					type: "sap.ui.webc.main.TitleLevel",
					defaultValue: TitleLevel.H2
				},

				/**
				 * Defines the content of the control
				 */
				text: {
					type: "string",
					defaultValue: "",
					mapping: "textContent"
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines how the text of a component will be displayed when there is not enough space. <br>
				 * <b>Note:</b> for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
				 */
				wrappingType: {
					type: "sap.ui.webc.main.WrappingType",
					defaultValue: WrappingType.None
				}
			},
			designtime: "sap/ui/webc/main/designtime/Title.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Title;
});
