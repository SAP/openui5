/*!
 * ${copyright}
 */

sap.ui.define([
], function(

) {
	"use strict";

	var ODataV4ModelHelper = {};

    /**
	 * Asynchronously retrieve a path to an odata v4 model entity / property
     * @param  {string} oModel identifier for odata v4 model
	 * @param  {string} sPath path to the property containing the desired value
	 * @returns {Promise} returns a promise resolving the requested path
	*/
	ODataV4ModelHelper.retrieveValueForPath = function (oModel, sPath) {
		var oOdataContextBinding = oModel.bindContext(sPath);
		return oOdataContextBinding.requestObject().then(function (oResult) {
			oOdataContextBinding.destroy();
			return oResult && oResult.value;
		});
	};

	ODataV4ModelHelper.retrieveUI5TypeForPath = function (oModel, sPath) {
		var oMetaModel = oModel.getMetaModel();
		return oMetaModel && oMetaModel.getUI5Type(sPath);
	};

	/**
	 * @param  {object} oOptions configuration for the condition to be created
	 * @param  {string} oOptions.model identifier for odata v4 model
	 * @param  {string} oOptions.keyPath path to the property containing the condition value
	 * @param  {string} oOptions.value value to be set on model
	 * @param  {boolean} oOptions.submit indicator for model to submit changes
	 * @returns {Promise<sap.ui.model.odata.v4.ODataContextBinding>} returns a promise resolving a <cod>ODataContextBinding</code>
	*/
	ODataV4ModelHelper.setProperty = function (oOptions) {
		var oOdataContextBinding = oOptions.model.bindContext(oOptions.keyPath, undefined);
		return oOdataContextBinding.requestObject().then(function (oResult) {
			oOdataContextBinding.oElementContext.setProperty("", oOptions.value);
			return oOptions.submit && ODataV4ModelHelper.submitODataV4Updates(oOptions.model).then(function () {
                return oOdataContextBinding;
            });
		});
	};

	/**
	* @param  {string} oModel identifier for odata v4 model
 	* @returns {Promise} returns promise
	*/
	ODataV4ModelHelper.submit = function (oModel) {
		return oModel.submitBatch(oModel.getUpdateGroupId());
	};

	return ODataV4ModelHelper;
});


