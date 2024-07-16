// Note: the HTML page 'XMLViewCache.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/model/json/JSONModel", "sap/ui/core/mvc/XMLView", "sap/ui/core/cache/CacheManager", "sap/ui/layout/HorizontalLayout", "sap/ui/layout/VerticalLayout", "sap/m/Button", "sap/m/Panel", "sap/m/Page", "sap/m/App", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/suite/ui/microchart/ComparisonMicroChartData", "sap/ui/performance/Measurement", "sap/ui/util/XMLHelper", "sap/ui/thirdparty/sinon"],
function(jQuery, JSONModel, XMLView, Cache, HLayout, VLayout, Button, Panel, Page, App, ComparisonMicroChart, ComparisonMicroChartData /*, sinon*/, Measurement, XMLHelper) {
	"use strict";

	var oModel = new JSONModel({
		cachedViewTime: 0,
		notCachedViewTime: 0
	});

	function createView(sId, mCacheConfig) {
		Measurement.start(sId, "create a view", "view_cache");
		var pView = XMLView.create({
			id: sId,
			viewName: "cache",
			preprocessors: {
				xml: {
					preprocessor: function(x) {
						return new Promise(function(resolve) {
							setTimeout(function() {
								if (mCacheConfig) {
									var s = XMLHelper.serialize(x);
									s = s.replace("no", "yes");
									s = s.replace("lateness", "physical-activity");
									x = XMLHelper.parse(s).documentElement;
								}
								resolve(x);
							}, 500);
						});
					}
				}
			},
			cache: mCacheConfig
		});
		pView.loaded().then(function() {
			Measurement.end(sId);
			var iDuration = Math.round(Measurement.getMeasurement(sId).duration);
			oModel.setProperty("/" + sId + "ViewTime", iDuration);
		});
		return pView;
	}

	// TODO: migration not possible. jQuery.sap.loadResource is deprecated and private.
	var fnLoadResource = jQuery.sap.loadResource;
	// TODO: migration not possible. jQuery.sap.loadResource is deprecated and private.
	jQuery.sap.loadResource = function () {
		if (arguments[0] == "cache.view.xml") {
			return new Promise(function(resolve) {
				setTimeout(function() {
					resolve(XMLHelper.parse(document.getElementById("viewsource").innerHTML));
				}, 50);
			});
		} else {
			return fnLoadResource.apply(this, arguments);
		}
	};

	new App().setModel(oModel).addPage(new Page("page", {
		title: "XMLView Cache",
		content: [ new VLayout({content: [
			new HLayout({ content: [
				new Button({
					text: "Reset Cache",
					icon: "sap-icon://refresh",
					press: function() {
						Cache.reset();
					}
				}).addStyleClass("sapUiResponsiveMargin"),
				new ComparisonMicroChart({ data: [
						new ComparisonMicroChartData({
							title: "cached view (ms)"
						}).bindProperty("value", {path: "/cachedViewTime"}),
						new ComparisonMicroChartData({
							title: "uncached view (ms)"
						}).bindProperty("value", {path: "/notCachedViewTime"})
				] }).addStyleClass("sapUiResponsiveMargin")
			] }),
			new HLayout({ content: [
					new Panel({
						id: "cachedPanel"
					}).addStyleClass("sapUiResponsiveMargin"),
					new Panel({
						id: "notCachedPanel"
					}).addStyleClass("sapUiResponsiveMargin")
			] })
		]})
	]})).placeAt("content");

	Measurement.setActive(true, "view_cache");

	createView("cached", {
		keys: ["staticCacheKeyForView"]
	}).placeAt("cachedPanel");

	createView("notCached").placeAt("notCachedPanel");
});