/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Interface ILinkHandler.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>ILinkHandler</code> defines an interface which is used by <code>sap.ui.mdc.base.FieldInfo</code>.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @abstract
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.ILinkHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ILinkHandler = Element.extend("sap.ui.mdc.link.ILinkHandler", /** @lends sap.ui.mdc.link.ILinkHandler.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Callback which allows to define a new items array based on <code>items</code> aggregation and links coming from fiori launchpad.
				 */
				modifyItemsCallback: {
					type: "function"
				}
			},
			defaultAggregation: "items",
			aggregations: {
				items: {
					type: "sap.ui.mdc.link.LinkItem",
					multiple: true,
					singularName: "item"
				}
			},
			associations: {
				/**
				 * Mostly the source control is used in order to get the AppComponent which is required for
				 * link personalization. Additionally the source control is used to get the binding context.
				 */
				sourceControl: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		}
	});
	/**
	 * @returns {Promise} Result of Promise is <code>true</code> if potential links exist
	 * @abstract
	 */
	ILinkHandler.prototype.hasPotentialLinks = function() {
		throw new Error("sap.ui.mdc.link.ILinkHandler: method hasPotentialLinks must be redefined");
	};
	/**
	 * Returns determined links.
	 * @abstract
	 */
	ILinkHandler.prototype.determineItems = function() {
		throw new Error("sap.ui.mdc.link.ILinkHandler: method determineItems must be redefined");
	};

	return ILinkHandler;

});
