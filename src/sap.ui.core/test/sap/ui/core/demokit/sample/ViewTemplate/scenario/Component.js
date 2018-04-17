/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the GWSAMPLE_BASIC
 *   OData service.
 * @version @version@
 */
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/View', // sap.ui.view()
		'sap/ui/core/mvc/ViewType',
		'sap/ui/core/sample/common/Component',
		'sap/ui/core/util/MockServer',
		'sap/ui/core/util/XMLPreprocessor',
		'sap/ui/model/odata/ODataModel',
		'sap/ui/model/odata/v2/ODataModel',
		'jquery.sap.script'
	], function (jQuery, View, ViewType, BaseComponent, MockServer, XMLPreprocessor, ODataModel,
		ODataModel2/*, jQuerySapScript*/) {
	"use strict";

	/*
	 * Plug-in a visitor for XMLPreprocessor to replace
	 * <sap.ui.core.sample.ViewTemplate.scenario:Form binding="..." title="...">
	 * with
	 * <sap.ui.layout.form:SimpleForm binding="...">
	 *   <sap.ui.layout.form:title>
	 *     <sap.ui.core.Title text="..."/>
	 *   </sap.ui.layout.form:title>
	 *   <!-- children -->
	 * </sap.ui.layout.form:SimpleForm>
	 *
	 * @param {Element} oForm
	 *   The <sap.ui.core.sample.ViewTemplate.scenario:Form> element
	 * @param {object} oInterface
	 *   Visitor callbacks
	 */
	XMLPreprocessor.plugIn(function (oForm, oInterface) {
		var sBinding = oForm.getAttribute("binding"),
			oChild,
			oDocument = oForm.ownerDocument,
			oSimpleForm = oDocument.createElementNS("sap.ui.layout.form", "SimpleForm"),
			oTitle = oDocument.createElementNS("sap.ui.core", "Title"),
			oTitleAggregation = oDocument.createElementNS("sap.ui.layout.form", "title");

		if (sBinding) {
			oSimpleForm.setAttribute("binding", sBinding);
		}
		oSimpleForm.setAttribute("layout", "ResponsiveGridLayout");
		oSimpleForm.appendChild(oTitleAggregation);
		oTitleAggregation.appendChild(oTitle);
		oTitle.setAttribute("text", oForm.getAttribute("title"));
		while ((oChild = oForm.firstChild)) {
			oSimpleForm.appendChild(oChild);
		}

		oForm.parentNode.insertBefore(oSimpleForm, oForm);
		oForm.parentNode.removeChild(oForm);

		oInterface.visitNode(oSimpleForm);
	}, "sap.ui.core.sample.ViewTemplate.scenario", "Form");

	var Component = BaseComponent.extend("sap.ui.core.sample.ViewTemplate.scenario.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var sAnnotationUri,
				sAnnotationUri2,
				sServiceUri,
				sMockServerBaseUri
					= "test-resources/sap/ui/core/demokit/sample/ViewTemplate/scenario/data/",
				oUriParameters = jQuery.sap.getUriParameters(),
				fnModel = oUriParameters.get("oldOData") === "true" ? ODataModel : ODataModel2,
				oModel;

			// GWSAMPLE_BASIC with external annotations
			sAnnotationUri = "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2"
				+ "/Annotations(TechnicalName='ZANNO4SAMPLE_ANNO_MDL',Version='0001')/$value";
			sAnnotationUri2 = "/sap(====)/bc/bsp/sap/zanno_gwsample/annotations.xml";
			sServiceUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";

			if (oUriParameters.get("realOData") === "true") {
				sServiceUri = this.proxy(sServiceUri);
			} else {
				this.aMockServers.push(new MockServer({rootUri : sServiceUri}));
				this.aMockServers[0].simulate(/*TODO sServiceUri?!*/sMockServerBaseUri
					+ "metadata.xml", {
					sMockdataBaseUrl : sMockServerBaseUri,
					bGenerateMissingMockData : true
				});
				this.aMockServers[0].start();
			}

			// yet another mock server to handle annotations
			this.aMockServers.push(new MockServer({
				requests : [{
					method : "GET",
					//TODO have MockServer fixed and pass just the URL!
					path : new RegExp(MockServer.prototype._escapeStringForRegExp(sAnnotationUri)),
					response : function(oXHR) {
						oXHR.respondFile(200, {}, sMockServerBaseUri + "annotations.xml");
					}
				}, {
					method : "GET",
					//TODO have MockServer fixed and pass just the URL!
					path : new RegExp(MockServer.prototype._escapeStringForRegExp(sAnnotationUri2)),
					response : function(oXHR) {
						oXHR.respondFile(200, {}, sMockServerBaseUri + "annotations2.xml");
					}
				}]
			}));
			this.aMockServers[this.aMockServers.length - 1].start();

			oModel = new fnModel(sServiceUri, {
				annotationURI : [sAnnotationUri, sAnnotationUri2],
				json : true,
				loadMetadataAsync : true,
				skipMetadataAnnotationParsing : true
			});

			return sap.ui.view({
					async : true,
					type : ViewType.XML,
					viewName : "sap.ui.core.sample.ViewTemplate.scenario.Main",
					models : oModel
				});
		}
	});

	return Component;
});
