/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/binding/ObjectBinding"
], function (
	ObjectBinding
) {
	"use strict";

	/**
	 * Resolves bindings in one run
	 *
	 * @param {object} oJson - JSON object
	 * @param {map} mModels - List of models to process bindings, e.g. { "i18n": oModelObject, ... }
	 * @param {map} [mContexts] - List of binding contexts
	 * @param {string[]} [aIgnoreList] - List of properties to ignore when resolving bindings
	 * @returns {object} - JSON with resolved bindings (only for available models)
	 *
	 * @function
	 * @experimental
	 * @since 1.75
	 * @private
	 */
	return function (oJson, mModels, mContexts, aIgnoreList) {
		var oObjectBinding = new ObjectBinding();
		mContexts = mContexts || {};
		aIgnoreList = aIgnoreList || [];

		aIgnoreList.forEach(function (sPropertyName) {
			oObjectBinding.addToIgnore(sPropertyName);
		});

		Object.keys(mModels).forEach(function (sKey) {
			oObjectBinding.setModel(
				mModels[sKey],
				sKey === "" ? undefined : sKey
			);
		});

		Object.keys(mContexts).forEach(function (sKey) {
			oObjectBinding.setBindingContext(
				mContexts[sKey],
				sKey === "" ? undefined : sKey
			);
		});

		oObjectBinding.setObject(oJson);

		var oResolvedJson = oObjectBinding.getObject();

		oObjectBinding.destroy();

		return oResolvedJson;
	};
});
