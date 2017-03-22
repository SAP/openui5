sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/UIComponent",
		"sap/ui/thirdparty/sinon"
	],
	function(jQuery, UIComponent, sinon) {
		"use strict";

		return UIComponent.extend("sap.ui.core.sample.View.async.Component", {

			metadata: {
				dependencies: {
					libs: [
						"sap.ui.core",
						"sap.m"
					]
				},
				config: {
					sample: {
						files: [
							"Sample.view.xml",
							"Sample.controller.js"
						]
					}
				}
			},
			createContent: function(oController) {
				//Add jsview when async loading of resources via sap.ui.require is established

				// *** Sample.controller.js: ***
				// sap.ui.core.mvc.JSView._unregisterView("sap.ui.core.sample.View.async.Async");
				// oSampleView.byId("js_sample").destroy();
				// jQuery.sap.unloadResources("sap/ui/core/sample/View/async/Async.view.js", false, true, true);
				return sap.ui.jsview("sap.ui.core.sample.View.async.Root", true);
			},
			init: function() {
				var aTypes, xhr, mResponses, fnDelay, iNow;
				fnDelay = function() {
					return Math.floor(Math.random() * 2500);
				};
				iNow = Date.now();
				aTypes = ["xml", "js", "json", "html"];
				mResponses = {};

				// delay sync request execution
				function forceDelay(delay) {
					var start = Date.now(), now = 0;
					while (now - start < delay) {
						now = Date.now();
					}
				}

				aTypes.forEach(function(sType) {
					// preload the view source
					jQuery.ajax({
						url: "./test-resources/sap/ui/core/demokit/sample/View/async/Async.view." + sType,
						dataType: "text",
						success: function(data) {
							mResponses[sType] = data;
						},
						async: false
					});
				});

				// fake an asynchronous resource request to have control over the delay
				xhr = sinon.useFakeXMLHttpRequest();
				xhr.useFilters = true;
				xhr.addFilter(function(method, url) {
					return url.indexOf("demokit/sample/View/async/Async.view.") == -1;
				});

				xhr.onCreate = function(request) {
					request.onSend = function() {
						var sType = request.url.split('.').pop();
						if (request.async) {
							setTimeout(function() {
								request.respond(200, {
									"Content-Type": "application/" + (sType == "js" ? "javascript" : sType),
									"Cache-Control": "no-cache, no-store, must-revalidate",
									"Pragma": "no-cache",
									"Expires": "0"
								}, mResponses[sType]);
							}, fnDelay());
						} else {
							forceDelay(fnDelay());
							request.respond(200, {
								"Content-Type": "application/" + (sType == "js" ? "javascript" : sType),
								"Cache-Control": "no-cache, no-store, must-revalidate",
								"Pragma": "no-cache",
								"Expires": "0"
							}, mResponses[sType]);
						}
					};
				};

				UIComponent.prototype.init.apply(this);
			}

		});
	});
