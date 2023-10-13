sap.ui.define([
	"sap/ui/test/generic/GenericTestCollection"
], function(GenericTestCollection) {
	"use strict";

	var oConfig = GenericTestCollection.createTestsuiteConfig({
		library: "sap.ui.core",
		objectCapabilities: {
			"sap.ui.core.ComponentContainer": {
				create: false
			},
			"sap.ui.core.UIComponent": {
				create: false
			},
			/**
			 * @deprecated since 1.56
			 */
			"sap.ui.core.XMLComposite": {
				create: false
			},
			/**
			 * @deprecated since 1.108
			 */
			"sap.ui.core.mvc.HTMLView": {
				create: false,
				apiVersion: 1
			},
			/**
			 * @deprecated since 1.120
			 */
			"sap.ui.core.mvc.JSONView": {
				create: false
			},
			/**
			 * @deprecated since 1.90
			 */
			"sap.ui.core.mvc.JSView": {
				create: false
			},
			"sap.ui.core.mvc.XMLView": {
				create: function (XMLView, mParameters) {
					var mParams = mParameters || {};
					mParams.definition = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">'
					+ '          <Button text="Press me"/>                     '
					+ '    </mvc:View>                                         ';
					return XMLView.create(mParams);
				}
			},
			/**
			 * @deprecated since 1.56
			 */
			"sap.ui.core.mvc.TemplateView": {
				create: false
			},
			"sap.ui.core.mvc.XMLAfterRenderingNotifier": {
				moduleName: "sap/ui/core/mvc/XMLView"
			},
			"sap.ui.core.mvc.View": {
				create: false
			},
			/**
			 * @deprecated since 1.56
			 */
			"sap.ui.core.tmpl.Template": {
				create: false
			},
			/**
			 * @deprecated since 1.56
			 */
			"sap.ui.core.tmpl.TemplateControl": {
				apiVersion: 1
			}
		}
	});

	return oConfig;
});