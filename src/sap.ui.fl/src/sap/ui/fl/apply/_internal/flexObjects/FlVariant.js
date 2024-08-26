/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/Variant"
], function(
	ControlVariantUtils,
	Variant
) {
	"use strict";

	/**
	 * Flexibility variant class. Stores variant content, changes and related information.
	 *
	 * @param {object} mPropertyBag - Initial object properties
	 *
	 * @class FlVariant instance
	 * @extends sap.ui.fl.apply._internal.flexObjects.Variant
	 * @alias sap.ui.fl.apply._internal.flexObjects.FlVariant
	 * @since 1.104
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlVariant = Variant.extend("sap.ui.fl.apply._internal.flexObjects.FlVariant", /* @lends sap.ui.fl.apply._internal.flexObjects.FlVariant.prototype */ {
		metadata: {
			properties: {
				/**
				 * ID of the base variant this variant was created from.
				 */
				variantReference: {
					type: "string"
				},
				/**
				 * Local ID of the variant management control this variant belongs to.
				 * TODO: move variantManagementReference to selector (is always the local ID)
				 */
				variantManagementReference: {
					type: "string"
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			let [sId, mSettings] = aArgs;
			if (typeof sId !== "string" && sId !== undefined) {
				mSettings = sId;
				sId = mSettings && mSettings.id;
			}
			mSettings.fileType = "ctrl_variant";
			if (mSettings.favorite === undefined) {
				mSettings.favorite = true;
			}

			Variant.apply(this, aArgs);

			if (!this.getName() && mSettings.content && mSettings.content.title) {
				this.setName(mSettings.content.title);
			}

			var oSupportInfo = this.getSupportInformation();
			if (this.getId() === this.getVariantManagementReference()) {
				this.setStandardVariant(true);
				if (!oSupportInfo.user) {
					oSupportInfo.user = ControlVariantUtils.DEFAULT_AUTHOR;
					this.setSupportInformation(oSupportInfo);
				}
			}
		}
	});

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	FlVariant.getMappingInfo = function() {
		return {
			...Variant.getMappingInfo(),
			variantReference: "variantReference",
			variantManagementReference: "variantManagementReference"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	FlVariant.prototype.getMappingInfo = function() {
		return FlVariant.getMappingInfo();
	};

	FlVariant.prototype.cloneFileContentWithNewId = function(...aArgs) {
		var mFileContent = Variant.prototype.cloneFileContentWithNewId.apply(this, aArgs);
		return mFileContent;
	};

	return FlVariant;
});