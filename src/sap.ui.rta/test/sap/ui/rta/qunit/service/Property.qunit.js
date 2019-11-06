/* global QUnit*/
QUnit.dump.maxDepth = 50;

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/Util",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/FlexController",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/Control",
	"sap/m/Page",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon-4"
],
	function(
	RuntimeAuthoring,
	DtUtil,
	DesignTime,
	FlexController,
	VerticalLayout,
	Control,
	Page,
	UIComponent,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that RuntimeAuthoring and Property service are created", {
		before: function(assert) {
			var oPage;

			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							}
						}
					}
				},
				createContent : function() {
					oPage = new Page("mainPage");
					return oPage;
				}
			});

			sandbox.stub(FlexController.prototype, "getResetAndPublishInfo").resolves({
				isResetEnabled : false,
				isPublishEnabled : false
			});

			this.oComp = new MockComponent("testComponent");

			// --Root control 1
			//	page
			//		verticalLayout
			//		button

			this.oControl = new Control("mockControl");

			this.oLayout = new VerticalLayout("layout1",{
				content : [this.oControl]
			});

			oPage.addContent(this.oLayout);

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oPage
			});

			// mock designtime metadata
			sandbox.stub(DesignTime.prototype, "getDesignTimeMetadataFor")
				.callThrough()
				.withArgs(this.oControl).returns({
					name: {
						singular: function () {
							return "Singular Control Name";
						},
						plural: function () {
							return "Plural Control Name";
						}
					},
					getLabel: function (oControl) {
						return oControl.getId() === "mockControl" ? "Vertical Layout Label" : "";
					},
					links: {
						developer: [
							{
								href: "links1.html",
								text: function (oControl) {
									return oControl.getId() === "mockControl" ? "Links 1 Text" : "";
								}
							}
						],
						guidelines: [
							{
								href: "links2.html",
								text: function () {
									return new Promise(function (fnResolve) {
										setTimeout(fnResolve.bind(null, "Links 2 Text"), 100);
									});
								}
							}
						]
					},
					properties: {
						"dtMetadataProperty1": {
							// dt-metadata property ignored
							mockKey1: "dtMetadataProperty1",
							ignore: true
						},
						"dtMetadataProperty2": {
							// dt-metadata property not ignored
							mockKey2: "dtMetadataProperty2"
						},
						"metadataProperty2": {
							// metadata property ignored
							ignore: true
						},
						"virtualProperty1": {
							// virtual property not ignored
							virtual: true,
							name: "Virtual Property Name 1",
							group: "Virtual Property Group 1",
							get: function (oControl) {
								return oControl.getId() === "mockControl" ? "Virtual property value 1" : "";
							},
							ignore: function (oControl) {
								return oControl.getId() !== "mockControl"; // false
							},
							possibleValues: [
								{
									"possibleKey1": {
										"displayName": "Possible Value 1"
									}
								},
								{
									"possibleKey2": {
										"displayName": "Possible Value 2"
									}
								}
							],
							type: "Virtual property type"
						},
						"virtualProperty2": {
							// virtual property ignored
							virtual: true,
							name: "Virtual Property Name 2",
							group: "Virtual Property Group 2",
							get: function (oControl) {
								return oControl.getId() === "mockControl" ? "Virtual property value 2" : "";
							},
							ignore: function (oControl) {
								return oControl.getId() === "mockControl"; // true
							},
							possibleValues: [{
								possibleKey3: {
									displayName: "Possible Value 3"
								}
							}],
							type: "Virtual property type"
						},
						"virtualProperty3": {
							// virtual property not ignored
							virtual: true,
							name: "Virtual Property Name 3",
							group: "Virtual Property Group 3",
							get: function (oControl) {
								return oControl.getId() === "mockControl" ? "Virtual property value 3" : "";
							},
							possibleValues: function (oControl) {
								return oControl.getId() === "mockControl"
									? [
										{
											"possibleKey4": {
												"displayName": "Possible Value 4"
											}
										},
										{
											"possibleKey5": {
												"displayName": "Possible Value 5"
											}
										}
									]
									: "";
							},
							type: "Virtual property type"
						}
					},
					annotations: {
						"annotation1": {
							// annotation not ignored
							namespace: "com.sap.mock.vocabularies",
							annotation: "annotation1",
							whiteList: {
								properties: [
									"Property1", "Property2", "Property3"
								]
							},
							ignore: function (oControl) {
								return oControl.getId() !== "mockControl"; // false
							},
							appliesTo: ["Page/Button"],
							links: {
								developer: [
									{
										href: "annotation1.html",
										text: function (oControl) {
											return oControl.getId() === "mockControl" ? "Annotation 1 Text 1" : "";
										}
									},
									{
										href: "annotation2.html",
										text: "Annotation 1 Text 2"
									}
								]
							}
						},
						"annotation2": {
							// annotation ignored
							namespace: "com.sap.mock.vocabularies",
							annotation: "annotation2",
							whiteList: {
								properties: [
									"Property1", "Property2", "Property3"
								]
							},
							ignore: function (oControl) {
								return oControl.getId() === "mockControl"; // true
							},
							appliesTo: ["Page/Button"],
							links: {
								developer: [
									{
										href: "annotation2.html",
										text: "Annotation 2 Text 1"
									}
								]
							}
						}
					}
				});

			var mControlMetadata = this.oControl.getMetadata();

			// control metadata property values
			sandbox.stub(this.oControl, "getProperty")
				.withArgs("metadataProperty1").returns("metadataPropertyValue1")
				.withArgs("metadataProperty3").returns("metadataPropertyValue3");

			// control metadata properties
			sandbox.stub(mControlMetadata, "getAllProperties").returns({
				"metadataProperty1" : {
					type: "metadataPropertyType1",
					name: "metadataPropertyName1",
					defaultValue: "metadataPropertyDefaultValue1",
					deprecated: true,
					group: "metadataPropertyGroup1",
					visibility: "public"
				},
				"metadataProperty2" : {
					type: "metadataPropertyType2",
					name: "metadataPropertyName2",
					defaultValue: "metadataPropertyDefaultValue2",
					deprecated: true,
					group: "metadataPropertyGroup2",
					visibility: "public"
				},
				"metadataProperty3" : {
					type: "metadataPropertyType3",
					name: "metadataPropertyName3",
					defaultValue: "metadataPropertyDefaultValue2",
					deprecated: false,
					group: "metadataPropertyGroup3",
					visibility: "private"
				}
			});

			// control binding info
			sandbox.stub(this.oControl, "getBindingInfo")
				.callThrough()
				.withArgs("metadataProperty1").returns(
					{
						parts: [
							{
								path: "path1",
								model: "model1"
							},
							{
								path: "path2",
								model: "model2"
							}
						],
						bindingString: "bindingString",
						binding: {
							getOriginalValue: function () {
								return "Original Binding Value";
							},
							getValue: function () {
								return "Binding Value";
							}
						}
					}
				)
				.withArgs("metadataProperty3").returns(
					{
						parts: [
							{
								path: "path3",
								model: "model3"
							}
						],
						binding: {
							getValue: function () {
								return "Binding Value";
							}
						}
					}
				);

			this.oRta.start();

			return this.oRta.getService("property").then(function (oService) {
				this.oProperty = oService;
				return jQuery.getJSON("test-resources/sap/ui/rta/qunit/service/Property.json", function (oExpectedPropertyData) {
					this.oExpectedPropertyData = oExpectedPropertyData;
				}.bind(this));
			}.bind(this));

		},
		after: function() {
			sandbox.restore();
			return this.oRta.stop().then(function () {
				this.oComp.destroy();
				delete this.oExpectedPropertyData;
			}.bind(this));
		}
	}, function() {
		QUnit.test("when property service get() is called for a control", function (assert) {
			return this.oProperty.get(this.oControl.getId()).then(function(oPropertyData) {
				assert.deepEqual(this.oExpectedPropertyData, oPropertyData, "then the correct result object received from the service");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});