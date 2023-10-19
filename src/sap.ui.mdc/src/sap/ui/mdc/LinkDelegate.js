/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/mdc/BaseDelegate', 'sap/ui/mdc/enums/LinkType'], function(BaseDelegate, LinkType) {
	"use strict";
	/**
	 * Base delegate for {@link sap.ui.mdc.Link}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.Link}.
	 * <b>Note:</b>
	 * The delegate is experimental and the API/behaviour is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/LinkDelegate
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @since 1.74
	 * @public
	 */
	const LinkDelegate = Object.assign({}, BaseDelegate);

	/**
	 * Retrieves and returns the relevant {@link sap.ui.mdc.link.LinkItem} for the <code>Link</code> control.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.model.Context|null|undefined} oBindingContext Binding context of the <code>Link</code> control
	 * @param {sap.ui.mdc.link.Log} oInfoLog InfoLog of the <code>Link</code> control
	 * @returns {Promise<null|sap.ui.mdc.link.LinkItem[]>} Once resolved, <code>null</code> or an array of {@link sap.ui.mdc.link.LinkItem} is returned
	 * If <code>null</code> is returned, the link won't cache <code>LinkItem</code>.
	 */
	LinkDelegate.fetchLinkItems = function(oLink, oBindingContext, oInfoLog) {
		return Promise.resolve(null);
	};

	/**
	 * Calculates and returns the type of link that is displayed.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @returns {Promise<sap.ui.mdc.link.LinkTypeWrapper>} Once resolved, a {@link sap.ui.mdc.link.LinkTypeWrapper} containing an initial {@link sap.ui.mdc.link.LinkType} and an optional <code>Promise</code> are returned.
	 * The optional <code>Promise</code> also returns a {@link sap.ui.mdc.link.LinkType} object.
	 * Once the optional <code>Promise</code> has been resolved, the returned {@link sap.ui.mdc.link.LinkType} overwrites the <code>initialType</code>.
	 */
	LinkDelegate.fetchLinkType = function(oLink) {
		return Promise.resolve({
			initialType: {
				type: LinkType.Popover,
				directLink: undefined
			},
			runtimeType: null
		});
	};

	/**
	 * Retrieves and returns the relevant <code>additionalContent</code> for the <code>Link</code> control as an array.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code> control
	 * @returns {Promise<sap.ui.core.Control[]>} Once resolved, an array of {@link sap.ui.core.Control} is returned
	 */
	LinkDelegate.fetchAdditionalContent = function(oLink) {
		return Promise.resolve([]);
	};

	/**
	 * Enables the modification of the {@link sap.ui.mdc.link.LinkItem} instances before the popover opens. This enables additional parameters
	 * to be added to the link.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.model.Context|null|undefined} oBindingContext Binding context of the <code>Link</code> control
	 * @param {sap.ui.mdc.link.LinkItem} aLinkItems The {@link sap.ui.mdc.link.LinkItem} instances of the link that can be modified
	 * @returns {Promise<sap.ui.mdc.link.LinkItem[]>} Once resolved, an array of link items is returned
	 */
	 LinkDelegate.modifyLinkItems = function(oLink, oBindingContext, aLinkItems) {
		return Promise.resolve(aLinkItems);
	};

	/**
	 * Allows for interception before the actual navigation takes place.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.base.Event} oEvent The <code>pressLink</code> event that is fired by the <code>Link</code> control
	 * @returns {Promise<boolean>} Once resolved, it returns a Boolean value that determines whether the navigation takes place
	 */
	 LinkDelegate.beforeNavigationCallback = function(oLink, oEvent) {
		return Promise.resolve(true);
	};

	return LinkDelegate;
});
