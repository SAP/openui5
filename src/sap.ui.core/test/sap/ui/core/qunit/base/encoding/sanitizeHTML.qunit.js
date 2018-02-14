/*global QUnit */
sap.ui.define(["sap/base/encoding/sanitizeHTML"], function(sanitizeHTML) {
	"use strict";

	QUnit.module("Sanitize check");

	QUnit.test("valid HTML5", function(assert) {

		var sHTML = "<div><article></article><progress></progress></div>";
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = "<table><tr><td></td></tr></table>";
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = "<div><input><audio></audio></div>";
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><img draggable="true"><video></video></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

	});

	QUnit.test("obsolete HTML4 (not valid)", function(assert) {

		var sHTML = "<div><font></font><center></center></div>";
		var sResultHTML = "<div></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<table><tr><td><frame></frame></td></tr></table>";
		sResultHTML = "<table><tr><td></td></tr></table>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><dir></dir></div>";
		sResultHTML = "<div></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><img><nobr>Some Text</nobr></div>";
		sResultHTML = "<div><img>Some Text</div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

	});

	QUnit.test("dangerous code (not valid)", function(assert) {

		var sHTML = "<table><tr><td><script>alert('XSS attack');</" + "script></td></tr></table>";
		var sResultHTML = "<table><tr><td></td></tr></table>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><object></object><audio></audio></div>";
		sResultHTML = "<div><audio></audio></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<div><title></title><audio></audio></div>";
		sResultHTML = "<div><audio></audio></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

		sHTML = "<html><head></head><body><div></div></body></html>";
		sResultHTML = "<div></div>";
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

	});

	QUnit.test("valid URLs", function(assert) {

		var sHTML = '<div><a href="http://anonymous.org">Some Link</a></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<table><tr><td><a href="http://www.sap.com">SAP</a></td></tr></table>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><a href="https://sdn.sap.com">SDN</a><audio></audio></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

		sHTML = '<div><img draggable="true"><a href="http://www.sap.com/index.epx">SAP with path</a><video></video></div>';
		assert.equal(sanitizeHTML(sHTML), sHTML, sHTML + " valid");

	});

	QUnit.test("invalid URLs (not valid)", function(assert) {

		var sHTML = '<div><a href="xxxxx%%%%%%-----------;;;;;;">Some Link</a></div>';
		var sResultHTML = '<div><a>Some Link</a></div>';
		assert.equal(sanitizeHTML(sHTML), sResultHTML, sHTML + " not valid");

	});

});