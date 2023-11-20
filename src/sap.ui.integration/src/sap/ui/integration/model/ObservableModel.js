/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/ClientPropertyBinding",
	"./PagingModelListBinding"
], function (
	JSONModel,
	ClientPropertyBinding,
	PagingModelListBinding
) {
	"use strict";

	/**
	 * Creates a new ObservableModel object.
	 *
	 * @class
	 *
	 * Extends the JSONModel to provide easy to use change event.
	 *
	 * @extends sap.ui.model.json.JSONModel
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.model.ObservableModel
	 */
	var ObservableModel = JSONModel.extend("sap.ui.integration.model.ObservableModel", {
		constructor: function (oData, bObserve) {
			JSONModel.apply(this, arguments);

			this._observedBinding = new ClientPropertyBinding(this, "/", this.getContext("/"));
			this._observedBinding.attachChange(this._handleChange.bind(this));

			this._fireChangeBound = this._fireChange.bind(this);
		}
	});

	/**
	 * @inheritdoc
	 */
	ObservableModel.prototype.destroy = function () {
		this._observedBinding.destroy();
		this._observedBinding = null;

		clearTimeout(this._iFireChangeCallId);
	};

	/**
	 * Handles the change event coming from <code>ClientPropertyBinding</code> change.
	 */
	ObservableModel.prototype._handleChange = function () {
		this._scheduleFireChange();
	};

	/**
	 * Schedule the firing of <code>change</code> event.
	 * This prevents multiple firing of the change event when there are multiple changes in the same tick.
	 * @private
	 */
	ObservableModel.prototype._scheduleFireChange = function () {
		if (this._iFireChangeCallId) {
			clearTimeout(this._iFireChangeCallId);
		}

		this._iFireChangeCallId = setTimeout(this._fireChangeBound, 0);
	};

	/**
	 * Fire the <code>change</code> event.
	 * @private
	 */
	ObservableModel.prototype._fireChange = function () {
		this.fireEvent("change");
	};

	ObservableModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = this._oListBinding  = new PagingModelListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	ObservableModel.prototype.sliceData = function (iStartIndex, iEndIndex) {
		this._oListBinding._iStartIndex = iStartIndex;
		this._oListBinding._iEndIndex = iEndIndex;
		this._oListBinding.checkUpdate(true);
	};

	return ObservableModel;
});
