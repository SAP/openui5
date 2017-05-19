/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/View', // sap.ui.view()
	'sap/ui/core/mvc/ViewType',
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/test/TestUtils',
	'sap/ui/thirdparty/sinon'
], function(jQuery, View, ViewType, UIComponent, JSONModel, ODataModel, TestUtils, sinon) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.mdc.sample.fragmenttable.v2.Component", {
		metadata: "json",
		exit: function() {
			var i;

			for (i = 0; i < this.aMockServers.length; i++) {
				this.aMockServers[i].destroy();
			}
			this.oSandbox.restore();
		},
		oSettingsModel: null,
		init: function() {
			// initialization has to be done here because parent.init() calls createContent()
			this.aMockServers = [];
			this.oSandbox = sinon.sandbox.create();
			sap.ui.getCore().loadLibrary("sap.ui.mdc");
			UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Default implementation to invoke a proxy for the given absolute path.
		 *
		 * <b>Custom extension point ("hook") intended to be overridden!</b>
		 *
		 * @param {string} sAbsolutePath
		 *   some absolute path
		 * @returns {string}
		 *   the absolute path transformed in a way that invokes a proxy
		 */
		proxy: function(sAbsolutePath) {
			if (location.hostname !== "localhost") {
				alert("Cannot use a proxy for hosts other than localhost!"); // eslint-disable-line
				return sAbsolutePath;
			}

			// for local testing prefix with proxy
			return "proxy" + sAbsolutePath;
		},
		setup: function(oViewSettings, oPlaceHolder) {
			var oModel = oViewSettings.models[undefined];
			oModel.getMetaModel().loaded().then(function() {
				oViewSettings.preprocessors.xml.models = {undefined: oModel, json: oViewSettings.models["json"]};
				oViewSettings.async = true;
				if (window.localStorage.getItem("viewCache") !== "false") {
					//oViewSettings.cache = { keys : [window.localStorage.getItem("viewCacheId")]};
				}
				sap.ui.view(oViewSettings).loaded().then(
					function(oView) {
						sap.ui.getCore().getMessageManager().registerObject(oView, true);
						oPlaceHolder.addContent(oView);
					}
				);
			});
		},
		createContent: function() {

			//register new table
			jQuery.sap.require("sap.ui.core.FragmentControl");
			sap.ui.core.util.XMLPreprocessor.plugIn(function(oNode, oVisitor) {
				sap.ui.core.FragmentControl.initialTemplating(oNode, oVisitor, "sap.ui.mdc.sample.templates.Table");
			},"sap.ui.mdc.sample.templates","Table");

			var topPath = window.location.pathname;
			var urlPrePrefix = topPath.split("/")[1];
			var urlPrefix = "/" + urlPrePrefix + "/test-resources";

			jQuery.sap.require("sap.ui.core.util.MockServer");
			this.oMockServer = new sap.ui.core.util.MockServer({
				rootUri: "internal.v2/"
			});
			this.oMockServer.simulate(urlPrefix + "/sap/ui/mdc/internal/sample/data/v2/metadata.xml", urlPrefix + "/sap/ui/mdc/internal/sample/data/v2/");
			this.oMockServer.start();
			var oModel = new sap.ui.model.odata.v2.ODataModel("internal.v2", {
				defaultBindingMode: "TwoWay"
			});


			this.oSettingsModel = new JSONModel({});
			this.oSettingsModel.setProperty("/editable", false);


			var oViewSettings = {
				type: ViewType.XML,
				viewName: "sap.ui.mdc.sample.fragmenttable.v2.Test",
				id:"myView1",
				models: {
					undefined: oModel,
					settingsmodel: this.oSettingsModel,
					json: new sap.ui.model.json.JSONModel({header: "Test", type: "ResponsiveTable", binding: "{path:'/ProductCollection'}"})
				},
				preprocessors: {
					xml: {
						models: {

						},
						bindingContexts: {

						}
					}
				}
			};
			var oPlaceHolder = new sap.m.ScrollContainer();
			this.setup(oViewSettings, oPlaceHolder);
			return oPlaceHolder;
		}
	});

	return Component;
});
