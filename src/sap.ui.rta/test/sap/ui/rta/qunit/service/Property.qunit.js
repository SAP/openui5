/* global QUnit, Map*/
QUnit.dump.maxDepth = 50;

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/Control",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/sinon-4"
],
function(
	RuntimeAuthoring,
	ElementDesignTimeMetadata,
	DesignTime,
	PersistenceWriteAPI,
	VerticalLayout,
	Control,
	Page,
	Button,
	UIComponent,
	ComponentContainer,
	FakeLrepConnectorSessionStorage,
	_omit,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	FakeLrepConnectorSessionStorage.enableFakeConnector();

// TODO: split big monolithic test into simple parts - 1 feature = 1 test case, not all at once!
	QUnit.module("Given that RuntimeAuthoring and Property service are created", {
		before: function () {
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app" : {
							applicationVersion : {
								version : "1.2.3"
							},
							id: "MockAppId"
						}
					}
				},
				createContent : function() {
					return new Page("mainPage");
				}
			});

			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oComp = new MockComponent("testComponent");

			var oPage = this.oComp.getRootControl();

		// --Root control 1
		//	page
		//		verticalLayout
		//		button
			oPage.addContent(
			this.oLayout = new VerticalLayout("layout1", {
				content: [
					// FIXME: don't create an instance of an abstract class!
					this.oControl = new Control("mockControl")
				]
			})
		);

			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComp
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();


			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oPage
			});

			this.oMockDesignTime = {
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
						},
						{
							href: "notSerializable.html",
							text: function (oControl) {
								if (oControl.getId() === "mockControl") {
									return {
										prop: {
											subProp: function () {} // NOT_SERIALIZABLE inside sub object property
										}
									};
								}
								throw new Error("invalid Control");
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
					dtMetadataProperty1: {
					// dt-metadata property ignored
						mockKey1: "dtMetadataProperty1",
						ignore: true
					},
					dtMetadataProperty2: {
					// dt-metadata property not ignored
						mockKey2: "dtMetadataProperty2"
					},
					dtMetadataProperty3: {
						// dt-metadata property not serializable
						mockKey3: {subProp: function () {}} // NOT_SERIALIZABLE inside sup property
					},
					metadataProperty2: {
					// metadata property ignored
						ignore: true
					},
					virtualProperty1: {
					// virtual property not ignored
						virtual: true,
						name: "Virtual Property Name 1",
						group: "Virtual Property Group 1",
						nullable: true,
						get: function (oControl) {
							return oControl.getId() === "mockControl" ? "Virtual property value 1" : "";
						},
						ignore: function (oControl) {
							return oControl.getId() !== "mockControl"; // false
						},
						possibleValues: [
							{
								possibleKey1: {
									displayName: "Possible Value 1"
								}
							},
							{
								possibleKey2: {
									displayName: "Possible Value 2"
								}
							}
						],
						type: "Virtual property type"
					},
					virtualProperty2: {
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
					virtualProperty3: {
					// virtual property not ignored
						virtual: true,
						name: "Virtual Property Name 3",
						group: "Virtual Property Group 3",
						nullable: false,
						get: function () {
							return null;
						},
						possibleValues: function (oControl) {
							if (oControl.getId() === "mockControl") {
								var mPossibleValues1 = new Map();
								mPossibleValues1.set("possibleKey4", {displayName: "Possible Value 4"});
								var oPossibleValues2 = {
									possibleKey5: {
										displayName: "Possible Value 5"
									}
								};
								return [mPossibleValues1, oPossibleValues2];
							}
							throw Error("Invalid Control");
						},
						type: "Virtual property type"
					},
					virtualProperty4: {
						// virtual property consisting of non serializable properties
						virtual: true,
						name: "Virtual Property Name 4",
						group: "Virtual Property Group 4",
						nullable: false,
						get: function () {
							var mMap = new Map();
							mMap.set("prop", {subProp: function() {}});
							return mMap; // NOT_SERIALIZABLE inside map
						},
						possibleValues: function (oControl) {
							return oControl.getId() === "mockControl"
								? [
									{
										possibleKey4: {
											displayName: function() {} // NOT_SERIALIZABLE direct
										}
									}
								]
								: "";
						},
						type: "Virtual property type"
					}
				},
				annotations: {
					annotation1: {
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
								},
								{
									href: "notSerializable.html",
									text: function (oControl) {
										if (oControl.getId() === "mockControl") {
											return ["serializable", function () {}]; // NOT_SERIALIZABLE inside array
										}
										throw new Error("incorrect control");
									}
								}
							]
						}
					},
					annotation2: {
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
			};

			var mControlMetadata = this.oControl.getMetadata();

		// control metadata property values
			sandbox.stub(this.oControl, "getProperty")
			.withArgs("metadataProperty1").returns("metadataPropertyValue1")
			.withArgs("metadataProperty2").returns("metadataPropertyValue2")
			.withArgs("metadataProperty3").returns({subProp: function() {}}); // NOT_SERIALIZABLE inside sub property

		// control metadata properties
			sandbox.stub(mControlMetadata, "getAllProperties").returns({
				metadataProperty1 : {
					type: "metadataPropertyType1",
					name: "metadataPropertyName1",
					defaultValue: "metadataPropertyDefaultValue1",
					deprecated: true,
					group: "metadataPropertyGroup1",
					visibility: "public"
				},
				metadataProperty2 : {
					type: "metadataPropertyType2",
					name: "metadataPropertyName2",
					defaultValue: "metadataPropertyDefaultValue2",
					deprecated: true,
					group: "metadataPropertyGroup2",
					visibility: "public"
				},
				metadataProperty3 : {
					type: "metadataPropertyType3",
					name: "metadataPropertyName3",
					defaultValue: "metadataPropertyDefaultValue2",
					deprecated: false,
					group: "metadataPropertyGroup3",
					visibility: "private"
				}
			});

		// mock designtime metadata
			sandbox.stub(DesignTime.prototype, "getDesignTimeMetadataFor")
			.callThrough()
			.withArgs(this.oControl).returns(this.oMockDesignTime);

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

		QUnit.test("when property service get() is called with designtimeMetadata.getLabel() returning a non-serializable value", function (assert) {
			// modify property service return object
			var oExpectedPropertyDataWithMockedLabel = Object.assign({}, this.oExpectedPropertyData, {label: "[NOT SERIALIZABLE]"});
			// mock getLabel() in designtime metadata
			var oDtObjProperties = Object.assign({}, this.oMockDesignTime);
			oDtObjProperties.getLabel = function() {
				return ["property1", {}, function() {}];
			};

			var fnElementDesignTimeMetadataStub = sandbox.stub(ElementDesignTimeMetadata.prototype, "getData").returns(oDtObjProperties);

			return this.oProperty.get(this.oControl.getId()).then(function (oPropertyData) {
				assert.deepEqual(oExpectedPropertyDataWithMockedLabel, oPropertyData, "then the correct result object received from the service");
				fnElementDesignTimeMetadataStub.restore();
			});
		});

		QUnit.test("when property service get() is called for a control with designTime properties wrapped in a function", function (assert) {
			// wrap properties in a function
			var oDtObjProperties = Object.assign({}, this.oMockDesignTime);
			oDtObjProperties.properties = sandbox.stub().returns(this.oMockDesignTime.properties);

			var fnElementDesignTimeMetadataStub = sandbox.stub(ElementDesignTimeMetadata.prototype, "getData").returns(oDtObjProperties);

			return this.oProperty.get(this.oControl.getId()).then(function(oPropertyData) {
				assert.deepEqual(this.oExpectedPropertyData, oPropertyData, "then the correct result object received from the service");
				assert.ok(oDtObjProperties.properties.calledWith(this.oControl), "then the control was passed to the designTimeMetadata's properties function");
				fnElementDesignTimeMetadataStub.restore();
			}.bind(this));
		});

		QUnit.test("when property service get() is called for a control with designTime properties wrapped in a function returning an undefined value", function (assert) {
			// wrap properties in a function
			var oDtObjProperties = Object.assign({}, this.oMockDesignTime);
			oDtObjProperties.properties = sandbox.stub();

			var fnElementDesignTimeMetadataStub = sandbox.stub(ElementDesignTimeMetadata.prototype, "getData").returns(oDtObjProperties);
			// removing DT Properties from response, which are not calculated because of the undefined return value
			var oExpectedResultWithoutDtProperties = Object.assign(
				{},
				_omit(this.oExpectedPropertyData.properties, ["dtMetadataProperty1", "dtMetadataProperty2", "dtMetadataProperty3", "virtualProperty1", "virtualProperty2", "virtualProperty3", "virtualProperty4"])
			);
			// this property was changed within DT properties; restoring to default
			oExpectedResultWithoutDtProperties["metadataProperty2"].ignore = false;

			return this.oProperty.get(this.oControl.getId()).then(function(oPropertyData) {
				assert.deepEqual(oExpectedResultWithoutDtProperties, oPropertyData.properties, "then the correct properties received from the service");
				assert.ok(oDtObjProperties.properties.calledWith(this.oControl), "then the control was passed to the designTimeMetadata's properties function");
				fnElementDesignTimeMetadataStub.restore();
			}.bind(this));
		});
	});

	QUnit.module("get()", function () {
		QUnit.test("when control's bindings are not initialized", function (assert) {
			var oButton = new Button('button', {
				visible: false,
				text: "{i18n>ButtonName}"
			});
			var oPage = new Page('page', {
				content: [
					oButton
				]
			});

			oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oPage
			});

			oRta.start();

			return oRta.getService("property").then(function (oService) {
				return oService.get(oButton.getId()).then(function (mResult) {
					var mBinding = mResult.properties.text.binding;
					assert.strictEqual(mBinding.parts[0].model, "i18n");
					assert.strictEqual(mBinding.parts[0].path, "ButtonName");
					assert.strictEqual(mBinding.bindingValues, undefined);
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});