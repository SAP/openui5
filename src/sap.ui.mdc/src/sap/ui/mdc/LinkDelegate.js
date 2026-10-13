/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/mdc/BaseDelegate',
	'sap/ui/mdc/enums/LinkType',
	'sap/ui/core/Lib'
], (BaseDelegate, LinkType, Lib) => {
	"use strict";
	/**
	 * Base delegate for {@link sap.ui.mdc.Link}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.Link}.
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/LinkDelegate
	 * @extends module:sap/ui/mdc/BaseDelegate
	 * @since 1.74
	 * @public
	 */
	const LinkDelegate = Object.assign({}, BaseDelegate);

	// Walks up the control tree to find the owning UI5 component.
	// Ported from sap/ui/fl/Utils#getComponentForControl to avoid a load-time
	// dependency on sap/ui/fl/Utils. sap/ui/core/Component is resolved synchronously via
	// sap.ui.require (it is always loaded) so it is not a load-time dependency either.
	function getComponentForControl(oControl) {
		const Component = sap.ui.require("sap/ui/core/Component");
		function getComponentIdForControl(oControl) {
			const sComponentId = Component.getOwnerIdFor(oControl);
			if (!sComponentId) {
				const oParent = oControl && oControl.getParent && oControl.getParent();
				if (oParent) {
					return getComponentIdForControl(oParent);
				}
			}
			return sComponentId || "";
		}

		if (oControl) {
			const sComponentId = getComponentIdForControl(oControl);
			if (sComponentId) {
				return Component.getComponentById(sComponentId);
			}
		}
		return undefined;
	}

	// Returns the component of type "application" for the given control.
	// Ported from sap/ui/fl/Utils#getAppComponentForControl; keeps the Fiori Elements
	// and OVP special cases so flex selectors stay stable.
	function getAppComponentForControl(oControl) {
		const Component = sap.ui.require("sap/ui/core/Component");
		let oComponent = oControl instanceof Component ? oControl : getComponentForControl(oControl);

		// special case for Fiori Elements to reach the real appComponent
		if (oComponent && oComponent.getAppComponent && oComponent.getAppComponent() instanceof Component) {
			return oComponent.getAppComponent();
		}

		// special case for OVP
		if (oComponent && oComponent.oComponentData && oComponent.oComponentData.appComponent) {
			return oComponent.oComponentData.appComponent;
		}

		if (oComponent && oComponent.getManifestEntry) {
			const oSapApp = oComponent.getManifestEntry("sap.app");
			if (oSapApp && oSapApp.type && oSapApp.type !== "application") {
				if (oComponent instanceof Component) {
					// walk up the tree to find the owning app component
					oComponent = getComponentForControl(oComponent);
				}
				return getAppComponentForControl(oComponent);
			}
		}

		return oComponent;
	}

	/**
	 * Retrieves and returns the relevant {@link sap.ui.mdc.link.LinkItem} for the <code>Link</code> control.
	 * <br>By default, this method returns a <code>Promise</code> that resolves into <code>null</code>.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.model.Context|null|undefined} oBindingContext Binding context of the <code>Link</code> control
	 * @returns {Promise<null|sap.ui.mdc.link.LinkItem[]>} Once resolved, <code>null</code> or an array of {@link sap.ui.mdc.link.LinkItem} is returned
	 * If <code>null</code> is returned, the link won't cache <code>LinkItem</code>.
	 */
	LinkDelegate.fetchLinkItems = function(oLink, oBindingContext) {
		return Promise.resolve(null);
	};

	/**
	 * Calculates and returns the type of link that is displayed.
	 * <br>By default, this method returns a <code>Promise</code> that resolves into a {@link sap.ui.mdc.link.LinkTypeWrapper LinkTypeWrapper}.
	 * The {@link sap.ui.mdc.link.LinkTypeWrapper LinkTypeWrapper} contains an <code>initialType</code> and a <code>runtimeType</code> {@link sap.ui.mdc.link.LinkType LinkType}.
	 * The <code>initialType</code> has a <code>type</code> property of type <code>Popover</code> and a <code>directLink</code> property of type <code>undefined</code>.
	 * The <code>runtimeType</code> is of type <code>null</code>.
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
	 * <br>By default, this method returns a <code>Promise</code> that resolves into an empty array.
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
	 * <br>By default, this method returns a <code>Promise</code> that resolves into the passed <code>aLinkItems</code> array.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.model.Context|null|undefined} oBindingContext Binding context of the <code>Link</code> control
	 * @param {sap.ui.mdc.link.LinkItem[]} aLinkItems Array of {@link sap.ui.mdc.link.LinkItem} instances of the link that can be modified
	 * @returns {Promise<sap.ui.mdc.link.LinkItem[]>} Once resolved, an array of link items is returned
	 */
	LinkDelegate.modifyLinkItems = function(oLink, oBindingContext, aLinkItems) {
		return Promise.resolve(aLinkItems);
	};

	/**
	 * Allows for interception before the actual navigation takes place.
	 * <br>By default, this method returns a <code>Promise</code> that resolves into <code>true</code>.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.base.Event} oEvent The <code>pressLink</code> event that is fired by the <code>Link</code> control
	 * @returns {Promise<boolean>} Once resolved, this method returns a <code>boolean<code> value that determines whether the navigation takes place
	 */
	LinkDelegate.beforeNavigationCallback = function(oLink, oEvent) {
		return Promise.resolve(true);
	};

	/**
	 * Allows to differenciate the created <code>Panel</code> of multiple <code>Link</code> instances for personalization reasons.
	 * Please provide different IDs for each <code>Link</code> as otherwise the personalization will have problems keeping the <code>Panel</code> controls apart.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @returns {string} The ID of the <code>Panel</code> that is created by the <code>Link</code>
	 */
	LinkDelegate.getPanelId = function(oLink) {
		let oField;
		if (oLink.getParent()) {
			oField = oLink.getParent();
		}
		let oControl = oLink._getSourceControl();
		if (!oControl) {
			//SapBaseLog.error("Invalid source control: " + this.getSourceControl() + ". The mandatory 'sourceControl' association should be defined due to personalization reasons, parent: " + oField + " used instead.");
			oLink.setSourceControl(oField);
			oControl = oField;
		}
		// sap/ui/fl is consulted only when it is already loaded: this keeps LinkDelegate free of a
		// load-time dependency on sap/ui/fl (so consumers can rely on the fl library-preload bundle).
		// When fl is not loaded, flexibility is not supported, so the non-component-scoped id is used.
		// FlexRuntimeInfoAPI is part of the sap.ui.fl library-preload, so once the library is loaded it
		// resolves synchronously via sap.ui.require. The change-handler registration that RTA depends on
		// is armed by sap/ui/fl itself (its init module), not by this eager import.
		const FlexRuntimeInfoAPI = Lib.isLoaded("sap.ui.fl") && sap.ui.require("sap/ui/fl/apply/api/FlexRuntimeInfoAPI");
		if (!FlexRuntimeInfoAPI || !FlexRuntimeInfoAPI.isFlexSupported({ element: oLink }) || !FlexRuntimeInfoAPI.isFlexSupported({ element: oControl })) {
			//SapBaseLog.error("Invalid component. The mandatory 'sourceControl' association should be assigned to the app component due to personalization reasons.");
			return oLink.getId() + "-idInfoPanel";
		} else {
			const oAppComponent = getAppComponentForControl(oControl) || getAppComponentForControl(oField);
			return oAppComponent.createId("idInfoPanel");
		}
	};

	/**
	 * Enables the modification of the {@link sap.m.ResponsivePopover#title} property and setting which <code>Control</code> should be added to the <code>ariaLabelledBy</code> association.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {sap.ui.mdc.link.Panel} oPanel Instance of the <code>Panel</code>
	 * @returns {Promise<{sTitle: string, oLabelledByControl: sap.ui.core.Control}>} Once resolved, an <code>Object</code> containing the title string and an <code>Control</code> which is referenced as arialabelledBy.
	 */
	LinkDelegate.fetchPopoverTitle = function(oLink, oPanel) {
		if (!oLink) {
			const sTitle = "";
			return Promise.resolve({ sTitle, undefined });
		}
		const sTitle = oLink.getParent()?.getValue();
		const oLabelledByControl = LinkDelegate._getLabelledByControl(oPanel);

		return Promise.resolve({ sTitle, oLabelledByControl });
	};

	LinkDelegate._getLabelledByControl = function(oPanel) {
		const aAdditionalContent = oPanel._getAdditionalContentArea().getItems();
		let oLabelledByControl = oPanel._getPersonalizationButton();
		if (aAdditionalContent.length > 0) {
			[oLabelledByControl] = aAdditionalContent;
		} else {
			const aLinkControls = oPanel._getLinkControls();
			if (aLinkControls.length > 0) {
				[oLabelledByControl] = aLinkControls;
			}
		}
		return oLabelledByControl;
	};

	return LinkDelegate;
});