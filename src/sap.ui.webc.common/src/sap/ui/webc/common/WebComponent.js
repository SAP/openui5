/*!
 * ${copyright}
 */

// Provides the base class for all Web Component wrappers.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./WebComponentMetadata",
	"sap/ui/core/webc/WebComponentRenderer"
],
function(
	CoreWebComponent,
	WebComponentMetadata,
	CoreWebComponentRenderer
) {
	"use strict";

	/**
	 * Constructs and initializes a Web Component Wrapper with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class Base Class for Web Components.
	 * Web Components are agnostic UI elements which can be integrated into the UI5
	 * programming model by using this wrapper control. This wrapper control takes
	 * care to propagate the properties, the aggregations and the events. It also
	 * ensures to render the control and put the aggregated controls in the dedicated
	 * slots of the Web Component.
	 *
	 * @extends sap.ui.core.webc.WebComponent
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.92.0
	 * @alias sap.ui.webc.common.WebComponent
	 * @experimental Since 1.92.0 The API might change. It is not intended for productive usage yet!
	 * @deprecated Since 1.118.0 Use sap.ui.core.webc.WebComponent instead!
	 */
	var WebComponent = CoreWebComponent.extend("sap.ui.webc.common.WebComponent", {

		constructor : function(sId, mSettings) {
			CoreWebComponent.apply(this, arguments);
		},

		renderer: CoreWebComponentRenderer

	}, /* Metadata constructor */ WebComponentMetadata);

	/**
	 * @typedef {sap.ui.core.webc.WebComponent.MetadataOptions} sap.ui.webc.common.WebComponent.MetadataOptions
	 *
	 * The structure of the "metadata" object which is passed when inheriting from sap.ui.core.Element using its static "extend" method.
	 * See {@link sap.ui.core.Element.extend} for details on its usage.
	 *
	 * @public
	 */

	/**
	 * Defines a new subclass of WebComponent with the name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.ManagedObject.extend} already accepts,
	 * plus the <code>dnd</code> property in the metadata object literal to configure drag-and-drop behavior
	 * (see {@link sap.ui.core.webc.WebComponent.MetadataOptions MetadataOptions} for details). Objects describing aggregations can also
	 * have a <code>dnd</code> property when used for a class extending <code>WebComponent</code>
	 * (see {@link sap.ui.base.ManagedObject.MetadataOptions.AggregationDnD AggregationDnD}).
	 *
	 * Example:
	 * <pre>
	 * WebComponent.extend('sap.mylib.MyElement', {
	 *   metadata : {
	 *     library : 'sap.mylib',
	 *     tag : 'my-webcomponent',
	 *     properties : {
	 *       value : 'string',
	 *       width : {
	 *         type: 'sap.ui.core.CSSSize',
	 *         mapping: 'style'
	 *       }
	 *     },
	 *     defaultAggregation: "content",
	 *     aggregations : {
	 *       content : {
	 *         type: 'sap.ui.core.Control',
	 *         multiple : true
	 *       },
	 *       header : {
	 *         type : 'sap.ui.core.Control',
	 *         multiple : false,
	 *         slot: 'header'
	 *       }
	 *     }
	 *   }
	 * });
	 * </pre>
	 *
	 * @param {string} sClassName Name of the class to be created
	 * @param {object} [oClassInfo] Object literal with information about the class
	 * @param {sap.ui.webc.common.WebComponent.MetadataOptions} [oClassInfo.metadata] the metadata object describing the class: tag, properties, aggregations, events etc.
	 * @param {function} [FNMetaImpl] Constructor function for the metadata object. If not given, it defaults to <code>sap.ui.core.ElementMetadata</code>.
	 * @returns {function} Created class / constructor function
	 *
	 * @public
	 * @static
	 * @name sap.ui.webc.common.WebComponent.extend
	 * @function
	 */

	return WebComponent;
});
