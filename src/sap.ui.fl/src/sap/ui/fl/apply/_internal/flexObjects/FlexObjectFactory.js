/* !
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/base/util/ObjectPath",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_pick,
	ObjectPath,
	Core,
	CompVariant,
	FlexObject,
	Layer,
	flUtils
) {
	"use strict";

	/**
	 * @enum {string}
	 * Valid flex object types.
	 *
	 * @alias sap.ui.fl.apply._internal.flexObjects.FlexObjectFactory.FLEX_OBJECT_TYPES
	 * @private
	 */
	var FLEX_OBJECT_TYPES = {
		BASE_FLEX_OBJECT: FlexObject,
		COMP_VARIANT_OBJECT: CompVariant
	};

	function getFlexObjectClass(oNewFileContent) {
		if (oNewFileContent.fileType === "variant") {
			return FLEX_OBJECT_TYPES.COMP_VARIANT_OBJECT;
		}
		return FLEX_OBJECT_TYPES.BASE_FLEX_OBJECT;
	}

	/**
	 * Helper class to create any flex object.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexObjects.FlexObjectFactory
	 * @since 1.100
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlexObjectFactory = {};

	/**
	 * Creates a new flex object.
	 *
	 * @param {object} oFileContent - File content
	 * @param {class} [ObjectClass] - Object class to be instantiated
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created flex object
	 */
	FlexObjectFactory.createFromFileContent = function (oFileContent, ObjectClass) {
		var oNewFileContent = Object.assign({}, oFileContent);
		var FlexObjectClass = ObjectClass || getFlexObjectClass(oNewFileContent);
		if (!FlexObjectClass) {
			throw new Error("Unknown file type");
		}
		oNewFileContent.support = Object.assign(
			{
				generator: "FlexObjectFactory.createFromFileContent",
				sapui5Version: Core.getConfiguration().getVersion().toString()
			},
			oNewFileContent.support || {}
		);
		var oMappingInfo = FlexObjectClass.getMappingInfo();
		var mCreationInfo = FlexObject.mapFileContent(oNewFileContent, oMappingInfo);
		var mProperties = Object.entries(mCreationInfo).reduce(function (mPropertyMap, aProperty) {
			ObjectPath.set(aProperty[0].split('.'), aProperty[1], mPropertyMap);
			return mPropertyMap;
		}, {});
		var oFlexObject = new FlexObjectClass(mProperties);
		return oFlexObject;
	};

	/**
	 * Creates a new flex object of type <code>CompVariant</code>.
	 *
	 * @param {object} oFileContent - File content
	 * @param {string} oFileContent.type - Defines the flex object type - should be variant for CompVariants
	 * @param {string} [oFileContent.fileName] - Acts as the unique identifier on the storage
	 * @param {string} [oFileContent.id] - Unique identifier at runtime
	 *
	 * For the properties below, refer to <code>sap.ui.fl.apply._internal.flexObjects.FlexObject</code>
	 * @param {object} [oFileContent.content] - see above
	 * @param {object} [oFileContent.layer] - see above
	 * @param {object} [oFileContent.texts] - see above
	 * @param {string} [oFileContent.reference] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata</code>
	 * @param {string} [oFileContent.packageName] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata</code>
	 * @param {string} [oFileContent.creation] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata</code>
	 * @param {string} [oFileContent.originalLanguage] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.sourceSystem] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.sourceClient] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.command] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.generator] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 *
	 * For the properties below, refer to <code>sap.ui.fl.apply._internal.flexObjects.Variant</code>
	 * @param {string} [oFileContent.variantId] - see above
	 * @param {object} [oFileContent.favorite] - see above
	 * @param {object} [oFileContent.contexts] - see above
	 * @param {object} [oFileContent.executeOnSelection] - see above
	 *
	 * @param {string} [oFileContent.persistencyKey] - see <code>sap.ui.fl.apply._internal.flexObjects.CompVariant</code>
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} Created comp variant object
	 */
	FlexObjectFactory.createCompVariant = function (oFileContent) {
		var sFileName = oFileContent.fileName
			|| oFileContent.id
			|| flUtils.createDefaultFileName(oFileContent.fileType);

		var mCompVariantContent = {
			id: sFileName,
			variantId: oFileContent.variantId || sFileName,
			content: oFileContent.content || {},
			contexts: oFileContent.contexts || {},
			layer: oFileContent.layer,
			favorite: oFileContent.favorite,
			texts: oFileContent.texts,
			persistencyKey: oFileContent.persistencyKey
				|| ObjectPath.get("selector.persistencyKey", oFileContent),
			persisted: oFileContent.persisted,
			supportInformation: {
				service: oFileContent.ODataService,
				command: oFileContent.command,
				generator: oFileContent.generator || "FlexObjectFactory.createCompVariant",
				user: ObjectPath.get("support.user", oFileContent),
				sapui5Version: Core.getConfiguration().getVersion().toString(),
				sourceSystem: oFileContent.sourceSystem,
				sourceClient: oFileContent.sourceClient,
				originalLanguage: oFileContent.originalLanguage
			},
			flexObjectMetadata: {
				changeType: oFileContent.type,
				reference: oFileContent.reference,
				packageName: oFileContent.packageName,
				creation: oFileContent.creation
			}
		};

		if (oFileContent.layer === Layer.VENDOR || oFileContent.layer === Layer.CUSTOMER_BASE) {
			mCompVariantContent.favorite = true;
		}
		if (oFileContent.executeOnSelection !== undefined) {
			mCompVariantContent.executeOnSelection = oFileContent.executeOnSelection;
		} else {
			// Legacy changes contains 'executeOnSelect' information inside content structure
			mCompVariantContent.executeOnSelection = mCompVariantContent.content && (
				mCompVariantContent.content.executeOnSelect ||
				mCompVariantContent.content.executeOnSelection
			);
		}

		return new CompVariant(mCompVariantContent);
	};

	return FlexObjectFactory;
});