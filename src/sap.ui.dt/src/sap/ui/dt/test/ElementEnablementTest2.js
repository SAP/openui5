/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.test.ElementEnablementTest.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/test/Element',
	'sap/ui/fl/registry/ChangeRegistry'
],
function(jQuery, ManagedObject, ElementTest, ChangeRegistry) {
	"use strict";


	/**
	 * Constructor for an ElementEnablementTest.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementEnablementTest class allows to create a design time test
	 * which tests a given element on compatibility with the sap.ui.dt.DesignTime.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.dt.test.ElementEnablementTest2
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementEnablementTest2 = ManagedObject.extend("sap.ui.dt.test.ElementEnablementTest2", /** @lends sap.ui.dt.test.ElementEnablementTest.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				type : {
					type : "string"
				}
			}
		}
	});


	/**
	 * Called when the ElementEnablementTest is initialized
	 * @protected
	 */
	ElementEnablementTest2.prototype.init = function() {

	};


	/**
	 * Called when the ElementEnablementTest is destroyed
	 * @protected
	 */
	ElementEnablementTest2.prototype.exit = function() {

	};


	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	ElementEnablementTest2.prototype.run = function() {
		return this._setup().then(function(oData) {

			var sActions;
			this._mResult = {
					name : this.getType(),
					actions : undefined
			};

			if (!this._bError) {
				sActions = this._testActions(oData);
			}

			if (sActions) {
				this._mResult.actions = sActions;
			}

			return this._mResult;
		}.bind(this));
	};


	/**
	 * @private
	 */
	ElementEnablementTest2.prototype._setup = function() {
		window.clearTimeout(this._iTimeout);
		this._bNotSupported = false;
		this._bError = false;

		var oElement = jQuery.sap.getObject(this.getType());
		return oElement.getMetadata().loadDesignTime().catch(function(oError){
			this._bError = true;
		}.bind(this));
	};


	/**
	 * @private
	 */
	ElementEnablementTest2.prototype._testActions = function(oData) {

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
				for (var sAction in oData.actions) {
					aActions[i] = sAction;
						mActions[i] = {
							action : sAction,
							aggregation : "self"
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
					for (var sAction in oAggr.actions) {
						i = aActions.indexOf(sAction);
						if (i === -1) {
							aActions.push(sAction);
							i = aActions.indexOf(sAction);
							mActions[i] = {
								action : sAction,
								aggregation : sAggregation
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


	return ElementEnablementTest2;
}, /* bExport= */ true);
