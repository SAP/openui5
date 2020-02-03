/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/ObjectBinding"
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
	 * @returns {object} - JSON with resolved bindings (only for available models)
	 *
	 * @function
	 * @experimental
	 * @since 1.75
	 * @private
	 */
	return function (oJson, mModels, mContexts) {
		var oObjectBinding = new ObjectBinding();
		mContexts = mContexts || {};

		Object.keys(mModels).forEach(function (sKey) {
			oObjectBinding.setModel(mModels[sKey], sKey);
		});

		Object.keys(mContexts).forEach(function (sKey) {
			oObjectBinding.setBindingContext(mContexts[sKey], sKey);
		});

		oObjectBinding.setObject(oJson);

		var oResolvedJson = oObjectBinding.getObject();

		oObjectBinding.destroy();

		return oResolvedJson;
	};
});
