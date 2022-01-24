/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONListBinding"
], function (
	JSONListBinding
) {
	"use strict";

	/**
	 * Creates a new PagingModelListBinding object.
	 *
	 * @class
	 *
	 * Extends the JSONModel to provide pagination.
	 *
	 * @extends sap.ui.model.json.JSONListBinding
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.model.PagingModelListBinding
	 */
	var PagingModelListBinding = JSONListBinding.extend("sap.ui.integration.model.PagingModelListBinding", {});

	PagingModelListBinding.prototype.update = function () {
		JSONListBinding.prototype.update.call(this);

		if (this._iStartIndex !== undefined) {
			this.aIndices = this.aIndices.slice(this._iStartIndex, this._iEndIndex);
		}
	};

	return PagingModelListBinding;
});
