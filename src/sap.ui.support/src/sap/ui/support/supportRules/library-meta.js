/*!
 * ${copyright}
 */

/**
 * Stores metadata about the libraries which have internal and public rules
 */
sap.ui.define([], function () {
	"use strict";

	return {
		"sap.m": {
			"publicRules": true,
			"internalRules": true
		},
		"sap.f": {
			"internalRules": true
		},
		"sap.ui.layout": {
			"publicRules": true,
			"internalRules": true
		},
		"sap.ui.table": {
			"publicRules": true
		},
		"sap.ui.fl": {
			"publicRules": true
		},
		"sap.ui.core": {
			"publicRules": true,
			"internalRules": true
		},
		"sap.ui.support": {
			"internalRules": true
		},
		"sap.ui.unified": {
			"publicRules": true
		},
		"sap.uxap": {
			"publicRules": true,
			"internalRules": true
		},
		"sap.ui.comp": {
			"publicRules": true,
			"internalRules": true
		},
		"sap.ui.richtexteditor": {
			"internalRules": true
		},
		"sap.suite.ui.generic.template": {
			"publicRules": true
		}
	};
});