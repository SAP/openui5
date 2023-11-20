/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.define(["sap/m/imageUtils/getCacheBustedUrl"], function (getCacheBustedUrl) {
	"use strict";

	QUnit.module('getCacheBustedUrl - valid inputs');

	QUnit.test('should add cache-busting query parameter to an absolute URL without query parameters', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.test('should add cache-busting query parameter to a relative URL without query parameters', function (assert) {
		// Arrange
		var sUrl = 'my-image.png',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.test('should add cache-busting query parameter to an absolute URL with query parameters', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png?foo=bar',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.ok(oUrl.searchParams.has('foo'), 'URL has original query parameter');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.test('should add cache-busting query parameter to a relative URL with query parameters', function (assert) {
		// Arrange
		var sUrl = 'my-image.png?foo=bar',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.ok(oUrl.searchParams.has('foo'), 'URL has original query parameter');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.test('should add cache-busting query parameter to URL with unusual characters', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image%5B123%5D.png',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.test('should replace existing cache-busting query parameter', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png?x-cache-bust=123',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.notEqual(oUrl.searchParams.get(sParamName), '123', 'cache-busting query parameter is replaced');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.test('should preserve fragment identifier when present', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png#fragment',
			sParamName = 'x-cache-bust',
			sParamValue = '1234567890';

		// Act
		var oUrl = new URL(getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName,
			sParamValue: sParamValue
		}));

		// Assert
		assert.ok(oUrl.searchParams.has(sParamName), 'URL has cache-busting query parameter');
		assert.equal(oUrl.hash, '#fragment', 'URL has preserved fragment identifier');
		assert.strictEqual(oUrl.searchParams.get(sParamName), sParamValue, 'URL has correct cache-busting query parameter value');
	});

	QUnit.module('getCacheBustedUrl - invalid inputs');

	QUnit.test('should return the original URL if cache-busting parameter name is empty', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png',
			sParamName = '';

		// Act
		var sResult = getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName
		});

		// Assert
		assert.strictEqual(sResult, sUrl, 'the original URL is returned');
	});

	QUnit.test('should return the original URL if cache-busting parameter name is null', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png',
			sParamName = null;

		// Act
		var sResult = getCacheBustedUrl({
			sUrl: sUrl,
			sParamName: sParamName
		});

		// Assert
		assert.strictEqual(sResult, sUrl, 'the original URL is returned');
	});

	QUnit.test('should return the original URL if cache-busting parameter name is undefined', function (assert) {
		// Arrange
		var sUrl = 'https://example.com/my-image.png';

		// Act
		var sResult = getCacheBustedUrl({
			sUrl: sUrl
		});

		// Assert
		assert.strictEqual(sResult, sUrl, 'the original URL is returned');
	});

	QUnit.start();
});