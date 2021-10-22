/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a QUnit.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The QUnit report can be used to run qunit tests based on the design time test results.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.enablement.report.QUnitReport
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var QUnitReport = ManagedObject.extend("sap.ui.dt.enablement.report.QUnitReport", /** @lends sap.ui.dt.enablement.report.QUnitReport.prototype */ {
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {
				data: {
					type: "object"
				}
			}
		},

		/**
		 * Called when the QUnit is initialized
		 * @protected
		 */
		init: function() {
			if (!QUnit) {
				throw new Error("QUnit is required for this report.");
			}
		},

		/**
		 * Sets the data to use as a base for the QUnit tests.
		 * @param {object} oData the data to display
		 *
		 * @public
		 */
		setData: function(oData) {
			if (oData) {
				var aChildren = oData.children;
				aChildren.forEach(function(oGroup) {
					this._createModule(oGroup);
				}, this);
			}
			this.setProperty("data", oData);
		},

		/**
		 * @private
		 */
		_createModule: function(oGroup) {
			QUnit.module(oGroup.message);
			oGroup.children.forEach(function(oGroup) {
				this._createTest(oGroup);
			}, this);
		},

		/**
		 * @private
		 */
		_createTest: function(oGroup) {
			QUnit.test(oGroup.name + ": " + oGroup.message, function (assert) {
				oGroup.children.forEach(function(oGroup) {
					this._createAssertion(assert, oGroup);
				}, this);
			}.bind(this));
		},

		/**
		 * @private
		 */
		_createAssertion: function(assert, oGroup) {
			if (oGroup.children.length > 0) {
				oGroup.children.forEach(function(oTest) {
					assert.ok(oTest.result, oGroup.name + ": " + oTest.message);
				});
			} else {
				assert.ok(true, oGroup.name + ": " + oGroup.message);
			}
		}
	});

	return QUnitReport;
});