/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Model", "sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataPropertyBinding", "sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v2/ODataModel"
], function(Model, ODataContextBinding, ODataPropertyBinding, ODataModel, V2ODataModel) {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var TestControl = sap.ui.core.Element.extend("TestControl", {
		metadata: {
			properties: {
				text: "string"
			}
		}
	});

	//FIX4MASTER: Use mock instead of real service calls to other servers in unit tests
	//       (release build must not use other servers, stability requirements)
	function getServiceUrl(sUrl) {
		// if run locally, use proxy deployed with databinding web app on local Tomcat
		if (jQuery.sap.startsWith(document.location.pathname, "/testsuite")) {
			return "/databinding/proxy/http/services.odata.org/" + sUrl;
		}
		// if run on central build server, use proxy deployed with qunit-tests
		return "../../../../../../../proxy/http/services.odata.org/" + sUrl;
	}

	/**
	 * Create ODataModel for Northwind service. Both model and service are V2 unless the version
	 * parameter is set to V4.
	 * @param {string} sVersion - The OData version to use
	 */
	function createNorthwindModel(sVersion) {
		//TODO
		var sServiceUrl = getServiceUrl(
				(sVersion === "V4" ? "V4/" : "") + "Northwind/Northwind.svc"),
			fnConstructor = sVersion === "V4" ? ODataModel : V2ODataModel;

		return new fnConstructor(sServiceUrl, {useBatch : false});
	}

	//*********************************************************************************************
	module("sap.ui.model.odata.v4.ODataModel");

	//*********************************************************************************************
	test("basics", function () {
		ok(new ODataModel("foo") instanceof Model);
		throws(function () {
			new ODataModel();
		}, /Missing service URL/);
	});

	//*********************************************************************************************
	test("bindContext", function () {
		var oModel = new ODataModel("foo"),
			oContext = {},
			oBinding = oModel.bindContext("/path", oContext);

		ok(oBinding instanceof ODataContextBinding);
		strictEqual(oBinding.getModel(), oModel);
		strictEqual(oBinding.getContext(), oContext);
		strictEqual(oBinding.getPath(), "/path");

		//TODO add further tests once exact behavior of bindContext is clear
	});

	//*********************************************************************************************
	test("bindProperty", function () {
		var oModel = new ODataModel("foo"),
			oPropertyBinding = oModel.bindProperty("property");

		ok(oPropertyBinding instanceof ODataPropertyBinding);
		strictEqual(oPropertyBinding.getValue(), undefined);

		//TODO add further tests once exact behavior of bindProperty is clear
	});

// Integration tests: Feature parity v2.ODataModel and v4.ODataModel

	//*********************************************************************************************
	[V2ODataModel//TODO error handling for invalid URL , ODataModel
	].forEach(function (fnConstructor) {
		test("empty " + fnConstructor.getMetadata().getName()
				+ " model: property access from ManagedObject", function () {
			var oModel = new fnConstructor("foo"),
				oControl = new TestControl();

			oControl.setModel(oModel);
			oControl.bindElement("/entity");
			oControl.bindProperty("text", "property");
			strictEqual(oControl.getText(), undefined);
		});
	});

	//*********************************************************************************************
	test("Northwind V2: ODataModel.read", function (oAssert) {
		var oModel = createNorthwindModel("V2"),
			fnDone = oAssert.async();

		oModel.read("/Products(ProductID=1)", {
			success: function (oData) {
				strictEqual(oData.ProductName, "Chai");
				fnDone();
			},
			error : function(oError) {
				ok(false, oError.message + ", stack: " + oError.stack);
				fnDone();
			}
		});
	});

	//*********************************************************************************************
	test("Northwind V4: ODataModel.read", function () {
		var oModel = createNorthwindModel("V4"),
			oPromise;

		this.spy(odatajs.oData, "read");

		oPromise = oModel.read("/Products(ProductID=1)");
		oPromise.then(function (oData) {
			strictEqual(oData.ProductName, "Chai");
		});

		ok(jQuery.sap.endsWith(odatajs.oData.read.args[0][0],
				"/proxy/http/services.odata.org/V4/Northwind/Northwind.svc/Products(ProductID=1)",
			"URL for read"));
		return oPromise;
	});

	//*********************************************************************************************
	["V2", "V4"].forEach(function (sVersion) {
		test("Northwind " + sVersion + ": property access from ManagedObject", function (oAssert) {
			var oModel = createNorthwindModel(sVersion),
				oControl = new TestControl(),
				bDone = false,
				fnDone = oAssert.async();

			oControl.setModel(oModel);
			oControl.bindObject("/Products(ProductID=1)/");
			oControl.bindProperty("text", "ProductName");
			oControl.getBinding("text").attachChange(function () {
				//v2 model sends several change events with only the last one setting the final
				//property value. TODO check with SAPUI5 Core
				if (sVersion === "V2" && oControl.getText() === undefined) {
					return;
				}
				if (!bDone) {
					strictEqual(oControl.getText(), "Chai", "property value");
					fnDone();
				}
				if (sVersion === "V2") { //v2 sends several change events: ignore all but the 1st
					bDone = true;
				}
			});
		});
	});
});
