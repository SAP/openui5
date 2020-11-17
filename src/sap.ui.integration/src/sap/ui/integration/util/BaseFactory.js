/*!
 * ${copyright}
 */
sap.ui.define([
	"./BindingHelper",
	"sap/base/util/merge",
	"sap/ui/base/Object"
], function (
	BindingHelper,
	merge,
	BaseObject
) {
	"use strict";

	/**
	 * Constructor for a new <code>BaseFactory</code>.
	 *
	 * @class
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.BaseFactory
	 * @abstract
	 */
	var BaseFactory = BaseObject.extend("sap.ui.integration.util.BaseFactory", {
		constructor: function (oCard) {
			BaseObject.call(this);

			this._oCard = oCard;
		}
	});

	/**
	 * Parses everything besides "data".
	 * @param {object} oManifestPart The manifest part (header, content, ...etc)
	 * @returns {object} The parsed configuration which contains binding infos.
	 */
	BaseFactory.prototype.createBindingInfos = function (oManifestPart) {
		var oResult = merge({}, oManifestPart),
			oDataSettings = oResult.data;

		// do not create binding info for data at this point, it will be done later
		delete oResult.data;
		oResult = BindingHelper.createBindingInfos(oResult, this._oCard.getBindingNamespaces());
		if (oDataSettings) {
			oResult.data = oDataSettings;
		}

		return oResult;
	};

	return BaseFactory;
});
