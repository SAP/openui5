/* global QUnit */
sap.ui.define(["sap/ui/fl/write/_internal/delegates/ODataV4ReadDelegate"], function(ReadDelegate) {
	"use strict";

	QUnit.module("ReadDelegate Tests", {
		before: function() {
			var oTestContext = {
				testGetAllAnnotations: function(oItem) {
					var oAnnotations = {};
					var sProperty;

					for (sProperty in oItem) {
						if (sProperty.indexOf("@") >= 0) {
							oAnnotations[sProperty] = oItem[sProperty];
						}
					}
					return oAnnotations;
				},

				testGetObject: function(sPath) {
					var oItem = oTestContext.getModel().getData();
					var aParts;
					var sPart;
					var iIndex;
					var sProp;

					if (sPath) {
						sPath = sPath.replace("testService1.", ""); // ignore service name
						aParts = sPath.split("/");
						while (aParts.length) {
							sPart = aParts.shift();
							if (sPart) {
								iIndex = sPart.indexOf("@");
								if (iIndex >= 0) {
									// has annotation?
									sProp = sPart.substr(0, iIndex);
									oItem = oItem[sProp]; // e.g. property
									if (sProp === "$Path") {
										// resolve path
										oItem = oTestContext.testGetObject(`/TestEntityT1/${oItem}`);
									}
									sPart = sPart.substr(iIndex); // annotation
									if (oItem) {
										oItem = sPart === "@" ? oTestContext.testGetAllAnnotations(oItem) : oItem[sPart];
									}
								} else {
									oItem = oItem[sPart];
								}
							}
						}
					}
					return oItem;
				},

				oMetaModel: {
					_testInfo: "MetaModel",
					createBindingContext: function(sPath) {
						// e.g. "/TestEntityT1" or "/TestEntityT1/TestProperty1"
						var oItem = oTestContext.testGetObject(sPath);
						var oContext = null;

						if (oItem.$kind === "EntityType") {
							oContext = {
								_testInfo: `Context: ${sPath}`,
								getPath: function() {
									return "/TestEntityT1";
								},
								getObject: function(sPath) {
									return oTestContext.testGetObject(sPath);
								},
								getModel: function() {
									return oTestContext.oMetaModel;
								}
							};
						} else if (oItem.$kind === "Property") {
							oContext = {
								_testInfo: `Context: ${sPath}`,
								getPath: function() {
									return "/TestEntityT1/TestProperty1";
								},
								getObject: function(sInnerPath) {
									var sFinalPath = sPath;
									if (sInnerPath) {
										if (sInnerPath.startsWith("/")) {
											sFinalPath = sInnerPath;
										} else {
											sFinalPath += `/${sInnerPath}`;
										}
									}
									return oTestContext.testGetObject(sFinalPath);
								},
								getModel: function() {
									return oTestContext.oMetaModel;
								}
							};
						}
						return oContext;
					},
					getMetaContext: function(sPath) {
						return {
							_testInfo: `MetaContext: ${sPath}`,
							getObject: function(sPath) {
								// e.g. "testService1.TestEntityT1" or undefined
								return oTestContext.testGetObject(sPath);
							}
						};
					},
					getObject: function(sPath) {
						// e.g. "/testService1.TestEntityT1/TestProperty1@"
						return oTestContext.testGetObject(sPath);
					},
					requestObject: function(sPath) {
						// e.g. "/TestEntityT1/TestProperty1@com.sap.vocabularies.Common.v1.ValueList"
						return oTestContext.testGetObject(sPath);
					}
				},

				oModel: {
					oData: null,
					_testInfo: "Model",
					getMetaModel: function() {
						return oTestContext.oMetaModel;
					},
					isA: function(sClass) {
						return sClass === "sap.ui.model.odata.v4.ODataModel";
					},
					getData: function() {
						return this.oData;
					},
					setData: function(oData) {
						this.oData = oData;
					}
				},

				getModel: function() {
					return oTestContext.oModel;
				}
			};
			this.oTestContext = oTestContext;
		},
		beforeEach: function() {},
		afterEach: function() {},
		after: function() {}
	});

	function stringifySortedObjectProperties(oObj) {
		return Object.getOwnPropertyNames(oObj)
		.sort()
		.map(function(sKey) {
			return [sKey, oObj[sKey]].join("=");
		})
		.join(",");
	}

	function getPropertyBagForGetPropertyInfo(oTestContext) {
		var oPropertyBag = {
			element: {
				_testInfo: "Control",
				oBinding: {
					getPath: function() {
						return "/TestEntityT1(ID=...,IsActiveEntity=...)";
					},
					getProperty: function(sPath) {
						return oTestContext.testGetObject(`/TestEntityT1/${sPath}`);
					}
				},
				getModel: function() {
					return oTestContext.getModel();
				},
				getBinding: function() {
					return {};
				},
				getBindingContext: function() {
					return this.oBinding;
				}
			},
			aggregationName: "aggregation",
			payload: {}
		};
		return oPropertyBag;
	}

	QUnit.test("Delegate: getPropertyInfo: fields", function(assert) {
		var oTestContext = this.oTestContext;
		var done = assert.async();
		var oTestMetadata1 = {
			$Type: "testService1.TestEntityT1",
			TestEntityT1: {
				$kind: "EntityType",
				TestProperty1: {
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.Common.v1.Label": "Label for TestProperty1",
					"@com.sap.vocabularies.Common.v1.ValueList": {
						_testInfo: "@ValueList"
					}
				},
				TestProperty2NoLabel: {
					$kind: "Property",
					$Type: "Edm.String"
				},
				TestProperty3DataFieldDefault: {
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.UI.v1.DataFieldDefault": {
						Label: "Label for TestProperty3DataFieldDefault"
					}
				},
				TestProperty4Complex: {
					// complex property is unsupported
					$kind: "Property",
					$Type: "No_Edm"
				},
				TestProperty5Hidden: {
					// hidden property is hideFromReveal
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.UI.v1.Hidden": true
				},

				TestPropertyTrue: true,

				TestProperty6HiddenViaPath: {
					// hidden property is hideFromReveal
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.UI.v1.Hidden": { $Path: "TestPropertyTrue" }
				},
				TestProperty7FcHidden: {
					// property hidden by field control is hideFromReveal
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.Common.v1.FieldControl": {
						$EnumMember: "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
					}
				},

				TestFieldControlProperty0: 0,

				TestProperty8FcPath0: {
					// property is supported
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.Common.v1.FieldControl": {
						Path: "TestFieldControlProperty0"
					}
				},

				TestFieldControlProperty1: 1,

				TestProperty9FcPath1: {
					// property is hideFromReveal
					$kind: "Property",
					$Type: "Edm.String",
					"@com.sap.vocabularies.Common.v1.FieldControl": {
						Path: "TestFieldControlProperty1"
					}
				},

				TestNavigationProperty1: {
					$kind: "NavigationProperty"
				},
				TestNavigationProperty1TestProperty9: {
					// a property which starts with a NavigationProperty is unsupported
					$kind: "Property",
					$Type: "Edm.String"
				}
			}
		};
		var oExpectedForAll = {
			entityType: "testService1.TestEntityT1"
		};
		var aExpectedResults = [
			{
				name: "TestProperty1",
				label: "Label for TestProperty1",
				hideFromReveal: undefined
			},
			{
				name: "TestProperty2NoLabel",
				label: "[LABEL_MISSING: TestProperty2NoLabel]",
				hideFromReveal: undefined
			},
			{
				name: "TestProperty3DataFieldDefault",
				label: "Label for TestProperty3DataFieldDefault",
				hideFromReveal: undefined
			},
			{
				name: "TestProperty4Complex",
				label: "[LABEL_MISSING: TestProperty4Complex]",
				hideFromReveal: undefined,
				unsupported: true
			},
			{
				name: "TestProperty5Hidden",
				label: "[LABEL_MISSING: TestProperty5Hidden]",
				hideFromReveal: true
			},
			{
				name: "TestProperty6HiddenViaPath",
				label: "[LABEL_MISSING: TestProperty6HiddenViaPath]",
				hideFromReveal: true
			},
			{
				name: "TestProperty7FcHidden",
				label: "[LABEL_MISSING: TestProperty7FcHidden]",
				hideFromReveal: true
			},
			{
				name: "TestProperty8FcPath0",
				label: "[LABEL_MISSING: TestProperty8FcPath0]",
				hideFromReveal: true
			},
			{
				name: "TestProperty9FcPath1",
				label: "[LABEL_MISSING: TestProperty9FcPath1]",
				hideFromReveal: false
			},
			{
				name: "TestNavigationProperty1TestProperty9",
				label: "[LABEL_MISSING: TestNavigationProperty1TestProperty9]",
				hideFromReveal: undefined,
				unsupported: true
			}
		];
		var oPropertyBag;

		oTestContext.getModel().setData(oTestMetadata1);
		oPropertyBag = getPropertyBagForGetPropertyInfo(oTestContext);

		ReadDelegate.getPropertyInfo(oPropertyBag).then(function(aPropertyInfo) {
			var i;
			var sExpected;
			var oInfo;
			var sResult;

			for (i = 0; i < aPropertyInfo.length; i++) {
				oInfo = Object.assign({}, oExpectedForAll, aExpectedResults[i]);
				oInfo.bindingPath = oInfo.name;
				sExpected = stringifySortedObjectProperties(oInfo);

				oInfo = aPropertyInfo[i];
				sResult = stringifySortedObjectProperties(oInfo);

				assert.strictEqual(sResult, sExpected, `getPropertyInfo: ${oInfo.name} (hideFromReveal=${oInfo.hideFromReveal} unsupported=${oInfo.unsupported})`);
			}
			done();
		});
	});
});
