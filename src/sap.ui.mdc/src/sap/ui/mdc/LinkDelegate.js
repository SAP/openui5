/*
 * ! ${copyright}
 */
sap.ui.define(['sap/ui/mdc/BaseDelegate'], function(BaseDelegate) {
	"use strict";
	/**
	 * Base delegate for {@link sap.ui.mdc.Link}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.Link}.
	 * <b>Note:</b>
	 * The class is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.74
	 * @alias sap.ui.mdc.LinkDelegate
	 */
	var LinkDelegate = Object.assign({}, BaseDelegate, {
		/**
		 * Retrieves and returns the relevant {@link sap.ui.mdc.link.LinkItem} for the <code>Link</code> control.
		 * @public
		 * @param {Object} oPayload Payload of the <code>Link</code> control given by the application
		 * @param {Object} oBindingContext Binding context of the <code>Link</code> control
		 * @param {Object} oInfoLog InfoLog of the <code>Link</code> control
		 * @returns {Promise} Once resolved, <code>null</code> or an array of {@link sap.ui.mdc.link.LinkItem} is returned
		 * Once resolved, <code>null</code> or an array of {@link sap.ui.mdc.link.LinkItem} is returned. If <code>null</code> is returned, the link won't cache <code>LinkItem</code>.
		 */
		fetchLinkItems: function(oPayload, oBindingContext, oInfoLog) {
			return Promise.resolve(null);
		},
		/**
		 * @typedef {Object} sap.ui.mdc.LinkDelegate.LinkType
		 * @property {Number} type 0 (Text) | 1 (Direct Link) | 2 (Popup)
		 * If <code>oLinkType.type</code> is 0, the link is rendered as a text.
		 * If <code>oLinkType.type</code> is 1, the link is rendered as a link. When pressed the link triggers a direct navigation instead.
		 * If <code>oLinkType.type</code> is 2, the link is rendered as a link and opens a popover (default).
		 * @property {sap.ui.mdc.link.LinkItem} directLink Instance of {@link sap.ui.mdc.link.LinkItem} which is used for direct navigation
		 */
		/**
		 * Calculates and returns the type of link that is displayed.
		 * @param {Object} oPayload Payload of the <code>Link</code> given by the application
		 * @returns {Promise} Once resolved, a {@link sap.ui.mdc.LinkDelegate.LinkType} is returned
		 */
		fetchLinkType: function(oPayload) {
			return Promise.resolve({
				type: 2,
				directLink: undefined
			});
		},
		/**
		 * Retrieves and returns the relevant <code>additionalContent</code> for the <code>Link</code> control as an array.
		 * @public
		 * @param {Object} oPayload Payload of the <code>Link</code> control given by the application
		 * @param {Object} oBindingContext Binding context of the <code>Link</code> control
		 * @param {Object} oLink Instance of the <code>Link</code> control
		 * @returns {Promise} Once resolved, an array of {@link sap.ui.core.Control} is returned
		 */
		fetchAdditionalContent: function(oPayload, oBindingContext, oLink) {
			return Promise.resolve([]);
		},
		/**
		 * Enables the modification of the {@link sap.ui.mdc.link.LinkItem} instances before the popover opens. This enables additional parameters
		 * to be added to the link.
		 * @param {Object} oPayload Payload of the <code>Link</code> control given by the application
		 * @param {Object} oBindingContext Binding context of the <code>Link</code> control
		 * @param {sap.ui.mdc.link.LinkItem} aLinkItems The {@link sap.ui.mdc.link.LinkItem} instances of the link that can be modified
		 * @returns {Promise} Once resolved, an array of link items is returned
		 */
		modifyLinkItems: function(oPayload, oBindingContext, aLinkItems) {
			return Promise.resolve(aLinkItems);
		},
		/**
		 * Allows for interception before the actual navigation takes place.
		 * @param {Object} oPayload Payload of the <code>Link</code> control given by the application
		 * @param {Object} oEvent The <code>pressLink</code> event which is fired by the <code>Link</code> control
		 * @returns {Promise} Once resolved, it returns a Boolean value which determines whether the navigation takes place
		 */
		beforeNavigationCallback: function(oPayload, oEvent) {
			return Promise.resolve(true);
		}
	});
	return LinkDelegate;
}, /* bExport= */ true);
