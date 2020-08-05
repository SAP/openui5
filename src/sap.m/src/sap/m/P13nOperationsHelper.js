/*
 * ! ${copyright}
 */

sap.ui.define([
	"./library"
], function(
	library
) {
	"use strict";

	/**
	 * @private
	 * @ui5-restricted sap.m.P13nFilterPanel
	 * @since 1.74
	 * @alias sap.m.P13nOperationsHelper
	 */
	var P13nOperationsHelper = function () {
		this.init();
	};

	var Operation = library.P13nConditionOperation;

	P13nOperationsHelper.prototype.oIncludeOperations = {
		"default": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"string": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.StartsWith,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"date": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"time": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"datetime": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numeric": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numc": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"boolean": [
			Operation.EQ
		]
	};
	P13nOperationsHelper.prototype.oExcludeOperationsDefault = {
		"default": [
				Operation.EQ
			]
	};
	P13nOperationsHelper.prototype.oExcludeOperationsExtended = {
		"default": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"string": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.StartsWith,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"date": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"time": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"datetime": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numeric": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numc": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"boolean": [
			Operation.EQ
		]
	};

	P13nOperationsHelper.prototype.init = function () {
		this.oExcludeOperations = this.oExcludeOperationsDefault;
	};

	P13nOperationsHelper.prototype.setUseExcludeOperationsExtended = function () {
		this.oExcludeOperations = this.oExcludeOperationsExtended;
	};

	P13nOperationsHelper.prototype.getIncludeOperationsByType = function (sType) {
		if (!sType) {
			sType = "default";
		}
		// Return a copy of the operations list so it could be modified later per field
		return this.oIncludeOperations[sType].map(function (sOperation) {return sOperation;});
	};

	P13nOperationsHelper.prototype.getExcludeOperationsByType = function (sType) {
		if (!sType) {
			sType = "default";
		}
		// Return a copy of the operations list so it could be modified later per field
		return this.oExcludeOperations[sType].map(function (sOperation) {return sOperation;});
	};

	P13nOperationsHelper.prototype.getIncludeTypes = function () {
		return Object.keys(this.oIncludeOperations);
	};

	P13nOperationsHelper.prototype.getExcludeTypes = function () {
		return Object.keys(this.oExcludeOperations);
	};

	return P13nOperationsHelper;

}, /* bExport= */true);
