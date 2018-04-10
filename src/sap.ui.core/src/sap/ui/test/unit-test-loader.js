/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

/* global document, QUnit */

(function() {
	"use strict";

	var oScript = document.querySelector("script[data-sap-ui-unittest]"),
		oConfig = oScript && JSON.parse(oScript.getAttribute("data-sap-ui-unittest")) || {},
		pQUnit, pSinon, pSinonQUnitBridge, pCoverage;

	if ( oConfig.qunit !== false ) {
		if ( oConfig.qunit != null && typeof oConfig.qunit === 'object' ) {
			window.QUnit = window.QUnit || {};
			window.QUnit.config = oConfig.qunit;
			window.QUnit.config.autostart = false; // enforce autostart=false
		}
		pQUnit = new Promise(function(resolve, reject) {
			// includeStylesheet requires jQuery, so we don't use it here
			var oLink = document.createElement("link");
			oLink.rel = "stylesheet";
			oLink.href = sap.ui.require.toUrl("sap/ui/thirdparty/qunit-2.css");
			document.head.appendChild(oLink);
			sap.ui.require(["sap/ui/thirdparty/qunit-2"], function(QUnit) {
				resolve(QUnit);
			}, reject);
		}).then(function() {
			return new Promise(function(resolve, reject) {
				sap.ui.require(["sap/ui/thirdparty/qunit-reporter-junit"], function(QUnitReporter) {
					resolve(QUnitReporter);
				}, reject);
			});
		}).then(function() {
			return new Promise(function(resolve, reject) {
				sap.ui.require(["sap/ui/qunit/qunit-junit"], function(QUnitJUnit) {
					resolve(QUnitJUnit);
				}, reject);
			});
		});
	}

	if ( oConfig.sinon !== false ) {
		pSinon = new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/thirdparty/sinon-4"], function(sinon) {
				if ( oConfig.sinon != null && typeof oConfig.sinon === 'object' ) {
					// do nothing for now
				}
				resolve(sinon);
			}, reject);
		});

		if ( oConfig.sinon.qunitBridge && pQUnit ) {
			pSinonQUnitBridge = Promise.all([
				pQUnit,
				pSinon
			]).then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require(["sap/ui/qunit/sinon-qunit-bridge"], function(bridge) {
						resolve(bridge);
					}, reject);
				});
			});
		}
	}

	pCoverage = pQUnit.then(function() {
		if ( QUnit.urlParams.coverage ) {
			return new Promise(function(resolve, reject) {
				sap.ui.require(["sap/ui/thirdparty/blanket"], function(blanket) {
					resolve(blanket);
				}, reject);
			}).then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require(["sap/ui/qunit/qunit-coverage"], function(qcov) {
						resolve(qcov);
					}, reject);
				});
			});
		}
	});

	Promise.all([
		pQUnit,
		pSinon,
		pSinonQUnitBridge,
		pCoverage
	]).then(function() {
		sap.ui.require(["sap/ui/core/Core"], function(core) {
			core.boot();
			core.attachInit(function() {
				sap.ui.require(oConfig.tests, function() {
					QUnit.start();
				});
			});
		});
	});

}());