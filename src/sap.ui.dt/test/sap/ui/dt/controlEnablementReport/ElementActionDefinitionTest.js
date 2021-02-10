/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/util/ObjectPath"
], function (
	ManagedObject,
	ObjectPath
) {
	"use strict";

	/**
	 * Constructor for an ElementActionDefinitionTest.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementActionDefinitionTest class allows to create a design time test
	 * which tests a given element on compatibility with the sap.ui.dt.DesignTime.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 */
	var ElementActionDefinitionTest = ManagedObject.extend("controlEnablementReport.ElementActionDefinitionTest", /** @lends sap.ui.dt.test.ElementActionDefinitionTest.prototype */ {
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {
				type: {
					type: "string"
				}
			}
		}
	});

	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	ElementActionDefinitionTest.prototype.run = function() {
		return this._setup().then(function(oData) {
			var sActions;
			this._mResult = {
				name: this.getType(),
				actions: undefined
			};

			if (!this._bError) {
				sActions = this._testActions(oData);
			}

			if (sActions) {
				this._mResult.actions = sActions;
			}

			return this._mResult;
		}.bind(this))
		.catch(function() {
			// do nothing
		});
	};


	/**
	 * @private
	 */
	ElementActionDefinitionTest.prototype._setup = function() {
		window.clearTimeout(this._iTimeout);
		this._bNotSupported = false;
		this._bError = false;

		var oElement = ObjectPath.get(this.getType() || "");
		try {
			return oElement.getMetadata().loadDesignTime();
		} catch (e) {
			this._bError = true;
			return Promise.reject(e);
		}
	};


	/**
	 * @private
	 */
	ElementActionDefinitionTest.prototype._testActions = function(oData) {
		var sActionsResult;
		var sPropagate;
		var mActions = [];
		var aActions = [];
		var bActions = false;
		var bAggregations = false;
		var i = 0;

		if (!oData || (!oData.actions && !oData.aggregations)) {
			this._bNotSupported = true;
		} else {
			if (oData.actions) {
				for (var sDataAction in oData.actions) {
					aActions[i] = sDataAction;
					mActions[i] = {
						action: sDataAction,
						aggregation: "self"
					};
					i = i + 1;
				}
				bActions = true;
			}

			if (oData.aggregations) {
				for (var sAggregation in oData.aggregations) {
					var oAggr = oData.aggregations[sAggregation];
					if (oAggr.propagateMetadata) {
						sPropagate = (sPropagate) ? sPropagate + ", " + sAggregation : "propagate (" + sAggregation;
					}
					for (var sAggregationAction in oAggr.actions) {
						i = aActions.indexOf(sAggregationAction);
						if (i === -1) {
							aActions.push(sAggregationAction);
							i = aActions.indexOf(sAggregationAction);
							mActions[i] = {
								action: sAggregationAction,
								aggregation: sAggregation
							};
						} else {
							mActions[i].aggregation = mActions[i].aggregation + ", " + sAggregation;
						}
						bAggregations = true;
					}
				}
			}

			if (!bActions && !bAggregations) {
				this._bNotSupported = true;
				return sActionsResult;
			}

			mActions.forEach(function(oAction) {
				sActionsResult = (sActionsResult) ? sActionsResult + ", " : "";
				sActionsResult = sActionsResult + oAction.action + " (" + oAction.aggregation + ")";
			});

			if (sPropagate) {
				sPropagate = sPropagate + ")";
				sActionsResult = sActionsResult + " + " + sPropagate;
			}

			return sActionsResult;
		}
	};

	return ElementActionDefinitionTest;
});