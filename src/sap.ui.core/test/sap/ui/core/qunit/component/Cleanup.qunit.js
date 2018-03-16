sap.ui.define([
	'jquery.sap.global'
], function(jQuery) {

	"use strict";

	/*global sinon, QUnit */

	// Configs for manifest and appdescriptor
	var oManifest = {
		"sap.app": {
			"id": "test3",
			"type": "application",
			"applicationVersion": {
				"version": "1.0.0"
			}
		},
		"sap.ui5": {
			"resources": {
				"css": [
					{
						"uri": "style3.css"
					}
				]
			}
		}
	};

	var oManifestAppdescr = {
		"sap.app": {
			"id": "test3-variant",
			"type": "application",
			"applicationVersion": {
				"version": "1.0.0"
			}
		},
		"sap.ui5": {
			"componentName": "test3",
			"resources": {
				"css": [
					{
						"uri": "style4.css"
					}
				]
			},
			"extends": {
				"component": "test3",
				"extensions": {
					"sap.ui.viewExtensions": {
						"": {}
					}
				}
			}
		}
	};

	var oManifestAppdescr1 = jQuery.extend(true, {}, oManifestAppdescr, {
		"sap.ui5": {
			"componentName": "test3",
			"resources": {
				"css": [
					{
						"uri": "style3.css"
					}
				]
			}
		}
	});

	// use the fake server to load manifest from the model above
	var oServer = sinon.fakeServer.create();

	oServer.xhr.useFilters = true;
	oServer.xhr.addFilter(function(method, url) {
		return !(method === "GET" && /manifest(1)?\.(json|appdescr)\?sap-language\=EN/i.test(url));
	});

	oServer.autoRespond = true;
	oServer.respondWith("GET", "manifest.json?sap-language=EN", [
		200,
		{
			"Content-Type": "application/json"
		},
		JSON.stringify(oManifest)
	]);
	oServer.respondWith("GET", "manifest.appdescr?sap-language=EN", [
		200,
		{
			"Content-Type": "application/json"
		},
		JSON.stringify(oManifestAppdescr)
	]);
	oServer.respondWith("GET", "manifest1.appdescr?sap-language=EN", [
		200,
		{
			"Content-Type": "application/json"
		},
		JSON.stringify(oManifestAppdescr1)
	]);

	QUnit.module("Basic");

	// declare components
	sap.ui.define("test1/Component", ['sap/ui/core/UIComponent'], function(UIComponent) {
		return UIComponent.extend("test1.Component", {
			metadata : {
				includes : [ "style1.css" ]
			}
		});
	}, true);

	sap.ui.define("test2/Component", ['sap/ui/core/UIComponent'], function(UIComponent) {
		return UIComponent.extend("test2.Component", {
			metadata : {
				includes : [ "style2.css" ]
			}
		});
	}, true);

	sap.ui.define("test3/Component", ['sap/ui/core/UIComponent'], function(UIComponent) {
		return UIComponent.extend("test3.Component", {
			metadata : {
				includes : [ "style3.css" ]
			}
		});
	}, true);

	sap.ui.define("test4/Component", ['sap/ui/core/UIComponent'], function(UIComponent) {
		return UIComponent.extend("test4.Component", {
			metadata : {
				includes : [ "style3.css" ]
			}
		});
	}, true);

	sap.ui.define("test5/Component", ['sap/ui/core/UIComponent'], function(UIComponent) {
		return UIComponent.extend("test5.Component", {
			metadata : {
				includes : [ "style5.css" ]
			}
		});
	}, true);

	sap.ui.define("test6/Component", ['test5/Component'], function(Test5Component) {
		return Test5Component.extend("test6.Component", {
			metadata : {
				includes : [ "style6.css" ]
			}
		});
	}, true);

	sap.ui.define("test7/Component", ['test5/Component'], function(Test5Component) {
		return Test5Component.extend("test7.Component", {
			metadata : {
				includes : [ "style7.css" ]
			}
		});
	}, true);

	// Start testing
	QUnit.test("Test cleanup of CSS styles after adding and removing", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/core/Component'], function(Component) {

			Promise.resolve(true).then(function() {

				// Create a new component "test1" with style1.css
				return sap.ui.component({
					name: "test1"
				});

			}).then(function(oComponent) {

				// style1.css should be included
				assert.equal(jQuery("link[href$='/style1.css']").length, 1, "style1.css should be available.");
				return oComponent;

			}).then(function(oComponent) {

				// Destroy "test1" component and validate that style1.css has been removed
				oComponent.destroy();
				assert.equal(jQuery("link[href$='/style1.css']").length, 0, "style1.css should be removed.");
				return true;

			}).then(function() {

				// Create a new component "test2" with style2.css
				return sap.ui.component({
					name: "test2"
				});

			}).then(function(oComponent) {

				var $link = jQuery("link[href$='/style2.css']");

				// style2.css should be included
				assert.equal($link.length, 1, "style2.css should be available.");

				// Adopting href of style2.css to add a URL parameter
				// (which could happen when someone is hooking into jQuery.sap.includeStyleSheet to add cachebuster params)
				$link.attr("href", $link.attr("href").replace("/style2.css", "/style2.css?foo"));

				return oComponent;

			}).then(function(oComponent) {

				// Destroy "test2" component and validate that style2.css has been removed
				oComponent.destroy();
				assert.equal(jQuery("link[href$='/style2.css']").length, 0, "style2.css should be removed.");
				assert.equal(jQuery("link[href$='/style2.css?foo']").length, 0, "style2.css should be removed.");
				return true;

			}).then(function() {

				// Create a new component "test3" with style3.css
				return sap.ui.component({
					name: "test3"
				});

			}).then(function(oComponent) {

				// style3.css should be included
				assert.equal(jQuery("link[href$='/style3.css']").length, 1, "style3.css should be available.");
				return oComponent;

			}).then(function(oComponent) {

				// Destroy "test3" component and validate that style3.css has been removed
				oComponent.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
				return true;

			}).then(function() {

				// Create a new component "test3" with style3.css from Manifest (oManifest)
				return sap.ui.component({
					manifestUrl: "manifest.json",
					async: true
				});

			}).then(function(oComponent) {

				// style3.css should be included
				assert.equal(jQuery("link[href$='/style3.css']").length, 1, "style3.css should be available.");
				return oComponent;

			}).then(function(oComponent) {

				// Destroy "test3" component (created from Manifest) and validate that style3.css has been removed
				oComponent.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
				return true;

			}).then(function() {

				// Create new component "test3" with style4.css from Manifest Variant (oManifestAppdescr)
				return sap.ui.component({
					manifestUrl: "manifest.appdescr",
					async: true
				});

			}).then(function(oComponent) {

				// style4.css and style3.css should be included
				assert.equal(jQuery("link[href$='/style4.css']").length, 1, "style4.css should be available.");
				assert.equal(jQuery("link[href$='/style3.css']").length, 0, "style3.css should not be available.");
				return oComponent;

			}).then(function(oComponent) {

				// Destroy "test3" component (created from Manifest Variant) and validate that style4.css and style3.css has been removed
				oComponent.destroy();
				assert.equal(jQuery("link[href$='/style4.css']").length, 0, "style4.css should be removed.");
				return true;

			}).then(function() {

				// Create a new component "test3" and ...
				var oComponent3 = sap.ui.component({
					name: "test3"
				});

				// ... create a new component "test4"
				var oComponent4 = sap.ui.component({
					name: "test4"
				});

				return [oComponent3, oComponent4];

			}).then(function(aComponents) {

				var oComponent3 = aComponents[0],
					oComponent4 = aComponents[1];

				// style3.css should be loaded twice since Component 3 and 4 includes this CSS
				assert.equal(jQuery("link[href$='/style3.css']").length, 2, "style3.css should be available twice.");

				// Destroy component "test4" and style3.css should be still available once
				oComponent4.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 1, "style3.css should be available once.");

				// Destroy component "test3" and style3.css should be completely removed
				oComponent3.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
				return true;

			}).then(function() {

				// Create a new component "test3" and ...
				return sap.ui.component({
					name: "test3"
				});

			}).then(function(oComponent3) {

				// style3.css should be loaded once
				assert.equal(jQuery("link[href$='/style3.css']").length, 1, "style3.css should be available.");

				// Create new component variant with style3.css from Manifest Variant (oManifestAppdescr1)
				return Promise.all([oComponent3, sap.ui.component({
					manifestUrl: "manifest1.appdescr",
					async: true
				})]);

			}).then(function(aComponents) {

				// style3.css should be loaded twice
				assert.equal(jQuery("link[href$='/style3.css']").length, 2, "style3.css should be available twice.");

				// Destroy component variant and style3.css should be still available once
				var oComponent3Variant = aComponents[1];
				oComponent3Variant.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 1, "style3.css should be once.");

				// Destroy component "test3" and style3.css should be removed
				var oComponent3 = aComponents[0];
				oComponent3.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
				return true;

			}).then(function() {

				// create two components with the same stylesheet (test3 and test4)
				return Promise.all([
					sap.ui.component({
						name: "test3",
						async: true
					}),
					sap.ui.component({
						name: "test4",
						async: true
					})
				]);

			}).then(function(aComponents) {

				// style3.css should be loaded twice
				assert.equal(jQuery("link[href$='/style3.css']").length, 2, "style3.css should be available twice.");

				// Destroy component "test3" and style3.css should be available once
				var oComponent3 = aComponents[0];
				oComponent3.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 1, "style3.css should be once.");

				// Destroy component "test4" and style3.css should be removed
				var oComponent4 = aComponents[1];
				oComponent4.destroy();
				assert.equal(jQuery("link[href$='/style3.css']").length, 0, "style3.css should be removed.");

				done();
			});

		});
	});

	QUnit.test("Test cleanup of CSS styles after adding and removing extended component", function(assert) {
		var done = assert.async();
		sap.ui.require(['sap/ui/core/Component'], function(Component) {

			Promise.resolve(true).then(function() {

				// Create a new component "test6" with style6.css and inherited style5.css
				return sap.ui.component({
					name: "test6"
				});

			}).then(function(oComponent) {

				var $style5 = jQuery("link[href$='/style5.css']");
				var $style6 = jQuery("link[href$='/style6.css']");

				// style5.css and style6.css should be included
				assert.equal($style5.length, 1, "style5.css should be available.");
				assert.equal($style6.length, 1, "style6.css should be available.");

				// Adopting href of style5.css and style6.css to add a URL parameter
				// (which could happen when someone is hooking into jQuery.sap.includeStyleSheet to add cachebuster params)
				$style5.attr("href", $style5.attr("href").replace("/style5.css", "/style5.css?foo5"));
				$style6.attr("href", $style6.attr("href").replace("/style6.css", "/style6.css?foo6"));

				assert.equal(jQuery("link[href$='/style5.css?foo5']").length, 1, "style5.css url should be changed.");
				assert.equal(jQuery("link[href$='/style6.css?foo6']").length, 1, "style6.css url should be changed.");

				return oComponent;

			}).then(function(oComponent) {

				// Destroy "test5" component and validate that style5.css and style6.css have been removed
				oComponent.destroy();
				assert.equal(jQuery("link[href$='/style5.css']").length, 0, "style5.css should be removed.");
				assert.equal(jQuery("link[href$='/style6.css']").length, 0, "style6.css should be removed.");
				assert.equal(jQuery("link[href$='/style5.css?foo5']").length, 0, "style5.css should be removed.");
				assert.equal(jQuery("link[href$='/style6.css?foo6']").length, 0, "style6.css should be removed.");

				return true;

			}).then(function() {

				// Create a new component "test6" and ...
				var oComponent6 = sap.ui.component({
					name: "test6"
				});

				// ... create a new component "test7"
				var oComponent7 = sap.ui.component({
					name: "test7"
				});

				return [oComponent6, oComponent7];

			}).then(function(aComponents) {

				// style5.css, style6.css and style7.css should be included
				assert.equal(jQuery("link[href$='/style5.css']").length, 1, "style5.css should be available.");
				assert.equal(jQuery("link[href$='/style6.css']").length, 1, "style6.css should be available.");
				assert.equal(jQuery("link[href$='/style7.css']").length, 1, "style7.css should be available.");

				return aComponents;

			}).then(function(aComponents) {

				var oComponent6 = aComponents[0],
				    oComponent7 = aComponents[1];

				// destroy component "test7" and just style7.css should be removed
				oComponent7.destroy();
				assert.equal(jQuery("link[href$='/style5.css']").length, 1, "style5.css should be available.");
				assert.equal(jQuery("link[href$='/style6.css']").length, 1, "style6.css should be available.");
				assert.equal(jQuery("link[href$='/style7.css']").length, 0, "style7.css should be removed.");

				// destroy component "test7" and all css files should be removed
				oComponent6.destroy();
				assert.equal(jQuery("link[href$='/style5.css']").length, 0, "style5.css should be removed.");
				assert.equal(jQuery("link[href$='/style6.css']").length, 0, "style6.css should be removed.");
				assert.equal(jQuery("link[href$='/style7.css']").length, 0, "style7.css should be removed.");

				done();

			});

		});
	});

});