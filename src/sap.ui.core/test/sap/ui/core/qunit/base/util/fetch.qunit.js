/*global QUnit sinon */
sap.ui.define(["sap/base/util/fetch"], function(fetch) {
	"use strict";

	QUnit.module("sap/base/util/fetch", {
		beforeEach: function() {
			this.xhr = sinon.useFakeXMLHttpRequest();
	        var requests = this.requests = [];

	        this.xhr.onCreate = function (xhr) {
	            requests.push(xhr);
	        };
		},
		afterEach: function() {
			this.xhr.restore();
		}
	});

	QUnit.test("Basic '200' Response", function(assert) {
		var pFetch = fetch("/foo").then(function(response) {
			assert.equal(1, this.requests.length, "One XMLHttpRequest should be triggered.");

			// SimpleResponse properties
			assert.ok(response, "The fetch() call should resolve with a SimpleResponse object.");
			assert.ok(response.ok, "The Status of the request should be 'ok'.");
			assert.ok(response.headers instanceof Headers, "The 'SimpleResponse.headers' property should contain an instance of Headers.");
			assert.equal(response.headers.get("Content-Type"), "application/json", "The 'Content-Type' header should be correct.");
			assert.notOk(response.xhr, "XHR object should not be exposed.");

			// SimpleRespone methods
			var pText = response.text().then(function(responseText) {
				assert.equal(responseText, '{ "id": 1, "name": "Alexa", "age": "18" }', "The response text should be correct.");
			});
			var pJson = response.json().then(function(oData) {
				assert.equal(oData.id, 1, "The response data should be parsed correctly.");
				assert.equal(oData.name, "Alexa", "The response data should be parsed correctly.");
				assert.equal(oData.age, 18, "The response data should be parsed correctly.");
			});

			assert.ok(pText instanceof Promise, "The 'response.text()' call should return a Promise.");
			assert.ok(pJson instanceof Promise, "The 'response.json()' call should return a Promise.");

		}.bind(this));

		assert.ok(pFetch instanceof Promise, "The 'fetch()' call should return a Promise.");

		this.requests[0].respond(200, { "Content-Type": "application/json" }, '{ "id": 1, "name": "Alexa", "age": "18" }');

		return pFetch;
	});

	QUnit.test("Basic '404' Response", function(assert) {
		var pFetch = fetch("/foo").then(function(response) {
			assert.ok(response, "The fetch() call should resolve with a SimpleResponse object.");
			assert.equal(response.ok, false, "The 'SimpleResponse.ok' property should return 'false'.");
		});

		assert.ok(pFetch instanceof Promise, "The 'fetch()' call should return a Promise.");

		this.requests[0].respond(404, {}, "[]");

		return pFetch;
	});

	QUnit.test("Error-handling: Wrong credentials for cookie handling", function(assert) {
		// accepted values are: "omit", "same-origin", "include" (case-sensitive)

		assert.throws(fetch("/foo", {
			credentials: "Omit"
		}), TypeError, "A 'TypeError' should be thrown. ");

		assert.throws(fetch("/foo", {
			credentials: "Include"
		}), TypeError, "A 'TypeError' should be thrown.");

		assert.throws(fetch("/foo", {
			credentials: "Same-Origin"
		}), TypeError, "A 'TypeError' should be thrown.");

		assert.throws(fetch("/foo", {
			credentials: "some-other"
		}), TypeError, "A 'TypeError' should be thrown.");
	});

	QUnit.test("Error-handling: Resource URL must not contain credentials", function(assert) {
		assert.throws(fetch("username:password@https://foo"), TypeError, "A 'TypeError' should be thrown.");
	});

	QUnit.test("Error-handling: Aborting the request", function(assert) {
		var oAbortController = new AbortController();
		var pFetch = fetch("", {
			signal: oAbortController.signal
		}).catch(function(error) {
			assert.ok(error instanceof DOMException, "A 'DOMException' should be thrown: '" + error.message + "'");
		});

		oAbortController.abort();

		return pFetch;
	});

	QUnit.test("Error-handling: 'GET' or 'HEAD' request must not contain request body", function(assert){
		assert.throws(fetch("/foo", {
			body: {"foo": "bar"},
			method: "GET"
		}), TypeError, "A 'TypeError' should be thrown.");

		assert.throws(fetch("/foo", {
			body: {"foo": "bar"},
			method: "HEAD"
		}), TypeError, "A 'TypeError' should be thrown.");
	});

	QUnit.test("Run tests for valid response headers", function(assert) {
		var fnOrigin = this.xhr.prototype.getAllResponseHeaders;

		// BCP: 2370067548
		// Whitespaces after the colon ":" are optional
		this.xhr.prototype.getAllResponseHeaders = function() {
			return "Header-with-whitespace: someValue,\r\nHeader-without-whitespace:someValue";
		};
		var pFetch = fetch("/foo").then(function() {
			assert.ok(true, "Parsing headers w/ and w/o whitespaces shouldn't fail.");
			this.xhr.prototype.getAllResponseHeaders = fnOrigin;
		}.bind(this))
		.catch(function(err) {
			assert.ok(false, "The test shouldn't fail");
		});

		this.requests[0].respond(200, { "Content-Type": "application/json" }, '{ "id": 1, "name": "Alexa", "age": "18" }');

		return pFetch;
	});
});
