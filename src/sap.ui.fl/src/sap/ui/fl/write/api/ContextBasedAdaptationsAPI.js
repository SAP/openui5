/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions"
], function (
	uid,
	ManifestUtils,
	FlexUtils,
	Storage,
	Versions
) {
	"use strict";

	/**
	 * Provides an API for creating and managing context based adaptation.
	 *
	 * @namespace sap.ui.fl.write.api.ContextBasedAdaptationsAPI
	 * @experimental Since 1.106
	 * @since 1.106
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	var ContextBasedAdaptationsAPI = /** @lends sap.ui.fl.write.api.ContextBasedAdaptationsAPI */ {};

	function getFlexReferenceForControl(oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);

		if (!sReference) {
			throw Error("The application ID could not be determined");
		}
		return FlexUtils.normalizeReference(sReference);
	}

	/**
	 * Create new context based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} [mPropertyBag.layer] - Layer
	 * @returns {Promise} Promise that resolves with the context based adaptation
	 *
	 */
	ContextBasedAdaptationsAPI.create = function (mPropertyBag) {
		mPropertyBag.parameters.id = uid();
		mPropertyBag.parameters.reference = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.create({
			layer: mPropertyBag.layer,
			flexObject: mPropertyBag.parameters,
			reference: mPropertyBag.reference,
			parentVersion: Versions.getVersionsModel({layer: mPropertyBag.layer, reference: mPropertyBag.parameters.reference}).getProperty("/displayedVersion")
		});
	};

	return ContextBasedAdaptationsAPI;
});