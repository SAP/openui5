/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], (
	JsControlTreeModifier,
	ControlVariantsUtils,
	FlexObjectFactory,
	ManifestUtils,
	FlexObjectManager,
	Storage,
	Layer,
	Utils
) => {
	"use strict";

	/**
	 * description
	 *
	 * @namespace
	 * @alias module:sap/ui/fl/write/api/BusinessNetworkAPI
	 * @since 1.135
	 * @version ${version}
	 * @private
	 * @ui5-restricted SAP Business Network
	 */
	const BusinessNetworkAPI = {};

	/**
	 * Creates a FlVariant with the passed properties. This API does not need the running application but
	 * expects the properties to identify the application to be passed.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.variantManagementReference - Reference to the variant management control
	 * @param {string} mPropertyBag.variantName - Name of the new variant
	 * @param {string} mPropertyBag.reference - Flex reference of the app the variant belongs to
	 * @param {string} [mPropertyBag.id] - Id of the new variant
	 * @param {string} [mPropertyBag.variantReference] - Reference to the variant the new one should be based on
	 * @param {sap.ui.fl.Layer} [mPropertyBag.layer="CUSTOMER"] - Layer of the new variant
	 * @param {string} [mPropertyBag.generator="BusinessNetworkAPI.createVariant"] - Generator of the new variant
	 * @param {string} [mPropertyBag.author] - Author of the variant
	 * @returns {Promise<object[]>} Resolves with an array of the saved json objects
	 * @private
	 * @ui5-restricted SAP Business Network
	 */
	BusinessNetworkAPI.createAndSaveVariant = async function(mPropertyBag) {
		const mProperties = {
			id: mPropertyBag.id,
			variantManagementReference: mPropertyBag.variantManagementReference,
			variantReference: mPropertyBag.variantReference || mPropertyBag.variantManagementReference,
			variantName: mPropertyBag.variantName,
			layer: mPropertyBag.layer || Layer.CUSTOMER,
			user: mPropertyBag.author || ControlVariantsUtils.DEFAULT_AUTHOR,
			reference: mPropertyBag.reference,
			generator: mPropertyBag.generator || "BusinessNetworkAPI.createVariant"
		};

		const aFlexObjects = [FlexObjectFactory.createFlVariant(mProperties).convertToFileContent()];

		const oResponse = await Storage.write({
			layer: mProperties.layer,
			flexObjects: aFlexObjects,
			reference: mPropertyBag.reference
		});
		return oResponse.response;
	};

	/**
	 * Creates a new variant and a setDefault change for the passed variant management control.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.variants.VariantManagement} mPropertyBag.control - Variant Management control instance
	 * @param {string} mPropertyBag.variantName - Name of the new variant
	 * @param {string} [mPropertyBag.id] - Id of the new variant
	 * @param {string} [mPropertyBag.variantReference] - Reference to the variant the new one should be based on.
	 * If non is given, the new variant will be based on the standard variant
	 * @param {sap.ui.fl.Layer} [mPropertyBag.layer="USER"] - Layer of the new variant
	 * @param {string} [mPropertyBag.generator="BusinessNetworkAPI.createDefaultVariant"] - Generator of the new variant
	 * @returns {object[]} Array including the new variant and the setDefault change
	 * @private
	 * @ui5-restricted SAP Business Network
	 */
	BusinessNetworkAPI.createDefaultVariant = function(mPropertyBag) {
		const oAppComponent = Utils.getAppComponentForControl(mPropertyBag.control);
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const sVariantManagementReference = oAppComponent.getLocalId(mPropertyBag.control.getId()) || mPropertyBag.control.getId();
		const mProperties = {
			id: mPropertyBag.id,
			variantManagementReference: sVariantManagementReference,
			variantReference: mPropertyBag.variantReference || sVariantManagementReference,
			variantName: mPropertyBag.variantName,
			reference: sReference,
			layer: mPropertyBag.layer || Layer.USER,
			generator: mPropertyBag.generator || "BusinessNetworkAPI.createDefaultVariant"
		};
		const aFlexObjects = [FlexObjectFactory.createFlVariant(mProperties)];
		aFlexObjects.push(FlexObjectFactory.createVariantManagementChange({
			changeType: "setDefault",
			layer: mProperties.layer,
			generator: mProperties.generator,
			reference: sReference,
			selector: JsControlTreeModifier.getSelector(mPropertyBag.control, oAppComponent),
			content: {
				defaultVariant: mProperties.variantReference
			}
		}));
		FlexObjectManager.addDirtyFlexObjects(sReference, aFlexObjects);
		return aFlexObjects;
	};

	/**
	 * Saves all the changes.
	 *
	 * @param {sap.ui.core.Element} oControl - Control instance
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} All saved Flex objects
	 * @private
	 * @ui5-restricted SAP Business Network
	 */
	BusinessNetworkAPI.save = function(oControl) {
		return FlexObjectManager.saveFlexObjects({
			selector: oControl,
			includeCtrlVariants: true
		});
	};

	return BusinessNetworkAPI;
});
