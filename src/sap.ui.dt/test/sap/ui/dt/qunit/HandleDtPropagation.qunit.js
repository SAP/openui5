/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.define([	"sap/ui/dt/ElementOverlay",
				"sap/ui/dt/AggregationOverlay",
				"sap/ui/dt/OverlayRegistry",
				"sap/ui/dt/ElementUtil",
				"sap/ui/dt/ElementDesignTimeMetadata",
				"sap/ui/dt/AggregationDesignTimeMetadata",
				"sap/ui/dt/DesignTime",
				"sap/m/Button",
				"sap/m/Page",
				"sap/m/Text",
				"sap/m/Toolbar",
				"sap/ui/layout/VerticalLayout"],
	function(ElementOverlay, AggregationOverlay, OverlayRegistry, ElementUtil,
			ElementDesignTimeMetadata, AggregationDesignTimeMetadata, DesignTime,
			Button, Page, Text, Toolbar, VerticalLayout) {
		"use strict";

		QUnit.start();

		var sandbox = sinon.sandbox.create();

		function _buildMetadataObject(vContent, vTestAggr) {
			var mData = {
				data: {
					aggregations: {
						content: vContent
					}
				}
			};
			if (vTestAggr) {
				mData.data.aggregations.testAggregation = vTestAggr;
			}
			return mData;
		}

		function _createNewAggregationDtMetadataInstance(oData) {
			return new AggregationDesignTimeMetadata({
				data: oData || {}
			});
		}

		function _createPropagationInfoObject(vPropagateFunction, oRelevantContainerElement, vMetadataFunction) {
			var mObj = {};
			if (vPropagateFunction) {
				mObj.relevantContainerFunction = vPropagateFunction;
			}
			if (oRelevantContainerElement) {
				mObj.relevantContainerElement = oRelevantContainerElement;
			}
			if (vMetadataFunction) {
				mObj.metadataFunction = vMetadataFunction;
			}
			return mObj;
		}

		function _createRelevantContainerObj(sInstanceOf) {
			return {
				propagateRelevantContainer: function (oElement) {
					var sType = oElement.getMetadata().getName();
					if (sType === sInstanceOf) {
						return true;
					}
					return false;
				}
			};
		}

		function _createPropagateMetadataObj(sInstanceOf, sTestValue) {
			return {
				propagateMetadata : function (oElement, oRelevantContainer) {
					if (oElement.getMetadata().getName() === sInstanceOf){
						return {
							aggregations : {
								content: {
									testProp : sTestValue || "testValue"
								}
							},
							metadataContainer: oRelevantContainer
						};
					}
				}
			};
		}

		QUnit.module("Given that an Overlay is created with 'propagateRelevantContainer' as boolean in the designtime Metadata without parent", {
			beforeEach : function(assert) {
				var oPropObject = { propagateRelevantContainer: true };
				this.oMetadata = _buildMetadataObject(oPropObject);
				this.oDesigntimeMetadata = _createNewAggregationDtMetadataInstance(oPropObject);
				this.oOverlay = new ElementOverlay({
					designTimeMetadata : new ElementDesignTimeMetadata(this.oMetadata)
				});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
			},
			afterEach : function() {
				this.oDesigntimeMetadata.destroy();
				this.oOverlay.destroy();
			}
		});

		QUnit.test("when '_handleDesigntimePropagation' is called", function(assert) {
			var fnPropagateRelevantContainerSpy = sinon.spy(this.oOverlay, "_propagateDesigntimeObj");
			var fnCurrentRelevantContainerPropagationSpy = sinon.spy(this.oOverlay, "_getCurrentRelevantContainerPropagation");
			var fnCurrentDesigntimePropagationSpy = sinon.spy(this.oOverlay, "_getCurrentDesigntimePropagation");
			// this.oOverlay._handleDesigntimePropagation(this.oDesigntimeMetadata);
			this.oOverlay._handleDesigntimePropagation(this.oDesigntimeMetadata);

			assert.strictEqual(fnCurrentRelevantContainerPropagationSpy.callCount, 1,
				"then '_getCurrentRelevantContainerPropagation' called once");
			assert.strictEqual(fnCurrentDesigntimePropagationSpy.callCount, 1,
				"then '_getCurrentDesigntimePropagation' called once");
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_propagateDesigntimeObj' called once");
			var oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.ok(oSpyArgs[1],
				"then '_propagateDesigntimeObj' called with new propagationInfo");
			assert.strictEqual(oSpyArgs[1].relevantContainerFunction(), true,
				"then relevantContainerFunction should return 'true'");
			assert.notOk(oSpyArgs[2],
				"then '_propagateDesigntimeObj' called without propagationInfo from parent");
		});

		QUnit.module("Given that an Overlay is created with 'propagateRelevantContainer' as function in the designtime Metadata", {
			beforeEach : function(assert) {
				this.fnPropagateRelevantContainer = function() {
					return true;
				};
				var oPropObject = { propagateRelevantContainer: this.fnPropagateRelevantContainer };
				this.oMetadata = _buildMetadataObject(oPropObject);
				this.oDesigntimeMetadata = _createNewAggregationDtMetadataInstance(oPropObject);
				this.oOverlay = new ElementOverlay({
					designTimeMetadata : new ElementDesignTimeMetadata(this.oMetadata)
				});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
			},
			afterEach : function() {
				this.oDesigntimeMetadata.destroy();
				this.oOverlay.destroy();
			}
		});

		QUnit.test("when '_handleDesigntimePropagation' is called with valid sAggregations property",
			function(assert) {
				var fnPropagateRelevantContainerSpy = sinon.spy(this.oOverlay, "_propagateDesigntimeObj");
				this.oOverlay._handleDesigntimePropagation(this.oDesigntimeMetadata);
				assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
					"then '_propagateDesigntimeObj' called once");
				var oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
				assert.strictEqual(oSpyArgs[1].relevantContainerFunction, this.fnPropagateRelevantContainer,
					"then '_propagateDesigntimeObj' called with propagatedRelevantContainer object");
				assert.notOk(oSpyArgs[2],
					"then '_propagateDesigntimeObj' called without propagatedRelevantContainer object from parent");
			});

		QUnit.module("Given that an Overlay is created with 'propagateRelevantContainer' as object in the designtime Metadata", {
			beforeEach : function(assert) {
				var oPropObject = { propagateRelevantContainer: {} };
				this.oMetadata = _buildMetadataObject(oPropObject);
				this.oDesigntimeMetadata = _createNewAggregationDtMetadataInstance(oPropObject);
				this.oOverlay = new ElementOverlay({
					designTimeMetadata : new ElementDesignTimeMetadata(this.oMetadata)
				});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
			},
			afterEach : function() {
				this.oDesigntimeMetadata.destroy();
				this.oOverlay.destroy();
			}
		});

		QUnit.test("when '_handleDesigntimePropagation' is called",
			function(assert) {
				assert.throws(function() {
						this.oOverlay._handleDesigntimePropagation(this.oDesigntimeMetadata);
					}, /wrong type: it should be either a function or a boolean value/,
					"then '_propagateDesigntimeObj' should throw an exception");
			});

		QUnit.module("Given that an Overlay is created without 'propagateRelevantContainer' in the designtime Metadata and without parent", {
			beforeEach : function(assert) {
				this.oMetadata = _buildMetadataObject({});
				this.oDesigntimeMetadata = _createNewAggregationDtMetadataInstance({});
				this.oOverlay = new ElementOverlay({
					designTimeMetadata : new ElementDesignTimeMetadata(this.oMetadata)
				});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
			},
			afterEach : function() {
				this.oDesigntimeMetadata.destroy();
				this.oOverlay.destroy();
			}
		});

		QUnit.test("when '_handleDesigntimePropagation' is called",
			function(assert) {
				var fnPropagateRelevantContainerSpy = sinon.spy(this.oOverlay, "_propagateDesigntimeObj");
				this.oOverlay._handleDesigntimePropagation(this.oDesigntimeMetadata);
				assert.strictEqual(fnPropagateRelevantContainerSpy.withArgs({}, null).callCount, 0,
					"then '_propagateDesigntimeObj' shouldn't be called");
			});

		QUnit.module("Given that an Overlay and designtime Metadata for aggregation have been created", {
			beforeEach : function(assert) {
				this.oButton = new Button();
				this.oPage = new Page();
				this.oDesigntimeMetadata = _createNewAggregationDtMetadataInstance();
				this.oOverlay = new ElementOverlay({});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
			},
			afterEach : function() {
				this.oButton.destroy();
				this.oPage.destroy();
				this.oDesigntimeMetadata.destroy();
				this.oOverlay.destroy();
			}
		});

		QUnit.test("when '_propagateDesigntimeObj' is called without attributes",
			function(assert) {
				assert.strictEqual(this.oOverlay._propagateDesigntimeObj(), false,
					"then '_propagateDesigntimeObj' should return false");
			});

		QUnit.test("when '_propagateDesigntimeObj' is called with new relevantContainerPropagation object and without parentPropagation object",
			function(assert) {
				var oNewPropagationInfo = _createPropagationInfoObject(true, this.oButton, null);
				assert.strictEqual(this.oDesigntimeMetadata.getData().propagationInfos, undefined,
					"then before '_propagateDesigntimeObj' is called, data of designtime metadata is undefined");
				assert.strictEqual(this.oOverlay._propagateDesigntimeObj(this.oDesigntimeMetadata, oNewPropagationInfo, undefined), true,
					"then '_propagateDesigntimeObj' should return true");
				assert.deepEqual(this.oDesigntimeMetadata.getData().propagationInfos[0], oNewPropagationInfo,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains relevantContainer propagation object");
			});

		QUnit.test("when '_propagateDesigntimeObj' is called with new relevantContainerPropagation object and with parentPropagation object",
			function(assert) {
				var aParentRelevantContainerPropagation = [ _createPropagationInfoObject(true, this.oPage, null) ];
				var oNewPropagationInfo = _createPropagationInfoObject(true, this.oButton, null);
				assert.strictEqual(this.oDesigntimeMetadata.getData().propagationInfos, undefined,
					"then before '_propagateDesigntimeObj' is called, data of designtime metadata is undefined");
				assert.strictEqual(this.oOverlay._propagateDesigntimeObj(this.oDesigntimeMetadata, oNewPropagationInfo, aParentRelevantContainerPropagation),
					true,
					"then '_propagateDesigntimeObj' should return true");
				assert.deepEqual(this.oDesigntimeMetadata.getData().propagationInfos.length, 2,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains 2 objects");
				assert.deepEqual(this.oDesigntimeMetadata.getData().propagationInfos[0], aParentRelevantContainerPropagation[0],
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains the parentRelevantContainer object");
				assert.deepEqual(this.oDesigntimeMetadata.getData().propagationInfos[1], oNewPropagationInfo,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains also the oNewPropagationInfo object");
			});

		QUnit.test("when '_propagateDesigntimeObj' is called without new relevantContainerPropagation object and with parentPropagation object",
			function(assert) {
				var aParentRelevantContainerPropagation = [ _createPropagationInfoObject(true, this.oPage, null) ];
				assert.strictEqual(this.oOverlay._propagateDesigntimeObj(this.oDesigntimeMetadata, null, aParentRelevantContainerPropagation),
					true,
					"then '_propagateDesigntimeObj' should return true");
				assert.deepEqual(this.oDesigntimeMetadata.getData().propagationInfos.length, 1,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains 1 objects");
				assert.deepEqual(this.oDesigntimeMetadata.getData().propagationInfos[0], aParentRelevantContainerPropagation[0],
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains only the parentRelevantContainer object");
			});

		QUnit.module("Given that an Overlay is created with 'propagateRelevantContainer' as function in the designtime Metadata", {
			beforeEach : function(assert) {
				this.fnPropagateRelevantContainer = function() {
					return true;
				};
				this.oMetadata = _buildMetadataObject({ propagateRelevantContainer: this.fnPropagateRelevantContainer });
				this.oPage = new Page();
				this.oOverlay = new ElementOverlay({
					designTimeMetadata : new ElementDesignTimeMetadata(this.oMetadata),
					element: this.oPage
				});
				this.oOverlay.placeInOverlayContainer();
				sap.ui.getCore().applyChanges();
			},
			afterEach : function() {
				this.oOverlay.destroy();
			}
		});

		QUnit.test("when overlay is created and without parent overlay",
			function(assert) {
				var oContentAggregation = this.oOverlay.getAggregationOverlay("content");
				var oContentDesignTimeMetadata = oContentAggregation.getDesignTimeMetadata();
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 1,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains 1 objects");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].relevantContainerFunction, this.fnPropagateRelevantContainer,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains relevantContainer propagation function");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].relevantContainerElement, this.oPage,
					"then after '_propagateDesigntimeObj' is called, data of designtime metadata contains relevantContainer propagation element");
			});

		QUnit.module("Given that an 'Overlay' and parent overlay is created", {
			beforeEach : function(assert) {
				this.oAggOverlay = new AggregationOverlay({
					aggregationName: "content",
					designTimeMetadata : new AggregationDesignTimeMetadata({})
				});

				this.oVerticalLayout = new VerticalLayout("layout1");

				this.oElemOverlay = new ElementOverlay({
					designTimeMetadata: new ElementDesignTimeMetadata({})
				});
			},
			afterEach : function() {
				this.oAggOverlay.destroy();
				this.oVerticalLayout.destroy();
				this.oElemOverlay.destroy();
			}
		});

		QUnit.test("when '_addPropagationInfos' is called without related parent overlay", function(assert) {
			this.oElemOverlay.setParent(this.oVerticalLayout);
			assert.strictEqual(this.oElemOverlay._addPropagationInfos({}), false,
				"then no relevant container added to the element");
		});

		QUnit.test("when '_addPropagationInfos' is called having parent without designTime", function(assert) {
			this.oElemOverlay.setParent(this.oVerticalLayout);
			assert.strictEqual(this.oElemOverlay._addPropagationInfos({}), false,
				"then no relevant container added to the element");
		});

		QUnit.test("when '_addPropagationInfos' is called having parent without propagationContainer in designTime", function(assert) {
			this.oElemOverlay.setParent(this.oAggOverlay);
			var oDesigntimeMetadata = this.oElemOverlay.getDesignTimeMetadata();
			assert.strictEqual(this.oElemOverlay._addPropagationInfos(oDesigntimeMetadata), false,
				"then 'false' should return");
			assert.strictEqual(this.oElemOverlay.getRelevantContainer(), undefined,
				"then no relevantContainer should be set");
		});

		QUnit.module("Given that an 'Overlay' and parent overlay with valid propagation container information is created ", {
			beforeEach : function(assert) {
				this.oVerticalLayout = new VerticalLayout("layout1");
				var mData = {
					propagationInfos: [
						{
							relevantContainerElement: this.oVerticalLayout,
							relevantContainerFunction: function (oElement) {
								return true;
							}
						}
					]
				};
				this.oParentElemOverlay = new ElementOverlay({
					designTimeMetadata: new ElementDesignTimeMetadata({}),
					element: this.oVerticalLayout
				});

				this.oAggOverlay = new AggregationOverlay({
					aggregationName: "content",
					designTimeMetadata: new AggregationDesignTimeMetadata({ data: mData })
				});

				this.oElemOverlay = new ElementOverlay({
					designTimeMetadata: new ElementDesignTimeMetadata({})
				});

				this.oAggOverlay.setParent(this.oParentElemOverlay);
				this.oElemOverlay.setParent(this.oAggOverlay);
			},
			afterEach : function() {
				this.oAggOverlay.destroy();
				this.oVerticalLayout.destroy();
				this.oElemOverlay.destroy();
			}
		});

		QUnit.test("when '_addPropagationInfos' is called", function(assert) {
			var oDesigntimeMetadata = this.oElemOverlay.getDesignTimeMetadata();
			assert.strictEqual(this.oElemOverlay._addPropagationInfos(oDesigntimeMetadata), true,
				"then 'true' should be returned");
			assert.strictEqual(this.oElemOverlay.getRelevantContainer(), this.oVerticalLayout,
				"then related relevantContainer should be set");
		});

		QUnit.test("when '_addPropagationInfos' with incomplete relevant container information is called", function(assert) {
			var oDesigntimeMetadata = this.oElemOverlay.getDesignTimeMetadata();
			var oRelevantContainer = this.oAggOverlay.getDesignTimeMetadata().getData().propagationInfos;
			delete oRelevantContainer[0].relevantContainerFunction;
			assert.strictEqual(this.oElemOverlay._addPropagationInfos(oDesigntimeMetadata), false,
				"then 'false' should be returned");
			assert.strictEqual(this.oElemOverlay.getRelevantContainer(), this.oVerticalLayout,
				"then related relevantContainer should be set");
		});

		QUnit.module("Given that propagateMetadata function is present in designTime", {
			beforeEach : function(assert) {
				this.oElement = new VerticalLayout("layout");

				this.oMtDtFunction = _createPropagateMetadataObj("sap.m.Button");
				this.oMetadata = _buildMetadataObject(this.oMtDtFunction);

				this.oOverlay = new ElementOverlay({
					designTimeMetadata : new ElementDesignTimeMetadata(this.oMetadata),
					element: this.oElement
				});

				this.oAggMetaDt = _createNewAggregationDtMetadataInstance(this.oMtDtFunction);
			},
			afterEach : function(assert) {
				this.oOverlay.destroy();
				this.oElement.destroy();
			}
		});

		QUnit.test("when _handleDesigntimePropagation is called to propagate metadata",
			function(assert) {
				var fnPropagateRelevantContainerSpy = sinon.spy(this.oOverlay, "_propagateDesigntimeObj");
				this.oOverlay._handleDesigntimePropagation(this.oAggMetaDt);
				assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
					"then '_propagateDesigntimeObj' called once");
				var oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
				assert.deepEqual(oSpyArgs[1].metadataFunction, this.oMtDtFunction.propagateMetadata,
					"then '_propagateDesigntimeObj' called with propagationInfos object");
				assert.ok(this.oOverlay._handleDesigntimePropagation(this.oAggMetaDt), "then metadata function propagated successfully");
			});

		QUnit.module("Given that propagationInfos object is present in designTime", {
			beforeEach : function(assert) {
				this.oButton = new Button("button");
				this.oElement = new VerticalLayout("vertlay", {
					content: [this.oButton]
				});

				this.oMtDtFunction = _createPropagateMetadataObj("sap.m.Button");
				this.oAggOverlay = new AggregationOverlay({
					designTimeMetadata: new AggregationDesignTimeMetadata({
						data: {
							propagationInfos: [_createPropagationInfoObject(null, null, this.oMtDtFunction.propagateMetadata)]
						}
					})
				});

				this.oElemDtMetaDt = new ElementDesignTimeMetadata(_buildMetadataObject("contentValue", "testValue"));
				this.oOverlayButton = new ElementOverlay({
					designTimeMetadata : this.oElemDtMetaDt,
					element: this.oButton
				});

				this.oOverlayButton.setParent(this.oAggOverlay);
			},
			afterEach : function(assert) {
				this.oElement.destroy();
			}
		});

		QUnit.test("when aggregationOverlay design time is set properly",
			function(assert) {
				var oAggregations = this.oMtDtFunction.propagateMetadata(this.oButton).aggregations;
				assert.ok(this.oOverlayButton._addPropagationInfos(this.oElemDtMetaDt), "then the metadata was propagated to the element designtime");
				assert.strictEqual(this.oOverlayButton.getDesignTimeMetadata().getData().aggregations.testAggregation, "testValue", "then default aggregation still exists");
				assert.deepEqual(this.oOverlayButton.getDesignTimeMetadata().getData().aggregations.content, oAggregations.content, "then the metadata was propagated successfully from the aggregation overlay");
			});

		QUnit.module("Given that an complex text has been created with different relevant container propagations in the designtime Metadata", {
			beforeEach : function(assert) {

				// page				--> propagate relevant container for toolbar
				//					--> propagate metadata for toolbar
				//	verticalLayout 	--> propagate relevant container for buttons
				//					--> propagate metadata for buttons
				//		toolbar
				//			button1
				//			text
				//		button2
				// butto3
				this.oMetadataForToolbar = _createRelevantContainerObj("sap.m.Toolbar");
				this.oMetadataForButton = _createRelevantContainerObj("sap.m.Button");
				jQuery.extend(this.oMetadataForToolbar, _createPropagateMetadataObj("sap.m.Toolbar"));
				jQuery.extend(this.oMetadataForButton, _createPropagateMetadataObj("sap.m.Button"));

				var oPageMetadata = _buildMetadataObject(this.oMetadataForToolbar);
				var oVerticalLayoutMetadata = _buildMetadataObject(this.oMetadataForButton);
				var oEmptyMetadata = _buildMetadataObject({});

				this.oButton1 = new Button("button1");
				this.oButton2 = new Button("button2");
				this.oButton3 = new Button("button3");
				this.oText = new Text("text1");
				this.oToolbar = new Toolbar("toolbar1", {
					content: [this.oButton1, this.oText]
				});
				this.oVerticalLayout = new VerticalLayout("layout", {
					content: [this.oToolbar, this.oButton2]
				});
				this.oPage = new Page({
					content: [this.oVerticalLayout, this.oButton3]
				}).placeAt("content");

				sap.ui.getCore().applyChanges();

				var fnLoadDtMetadataStub = sandbox.stub(ElementUtil, "loadDesignTimeMetadata");
				fnLoadDtMetadataStub.withArgs(this.oPage).returns(Promise.resolve(oPageMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oVerticalLayout).returns(Promise.resolve(oVerticalLayoutMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oToolbar).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oText).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton1).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton2).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oButton3).returns(Promise.resolve(oEmptyMetadata.data));

				this.oDesignTime = new DesignTime({
					rootElements : [this.oPage]
				});

				var done = assert.async();

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
					this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
					this.oTextOverlay = OverlayRegistry.getOverlay(this.oText);
					this.oToolbarOverlay = OverlayRegistry.getOverlay(this.oToolbar);
					this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
					this.oButton2Overlay = OverlayRegistry.getOverlay(this.oButton2);
					this.oButton3Overlay = OverlayRegistry.getOverlay(this.oButton3);
					done();
				}.bind(this));
			},
			afterEach : function() {
				this.oButton1Overlay.destroy();
				this.oButton2Overlay.destroy();
				this.oButton3Overlay.destroy();
				this.oTextOverlay.destroy();
				this.oToolbarOverlay.destroy();
				this.oVerticalLayoutOverlay.destroy();
				this.oPage.destroy();
				this.oDesignTime.destroy();
				sandbox.restore();
			}
		});

		QUnit.test("when page overlay is created",
			function(assert) {
				var oContentAggregationOverlay = this.oPageOverlay.getAggregationOverlay("content");
				var oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

				assert.deepEqual(this.oPageOverlay.getRelevantContainer(), undefined,
					"then there is no propagated relevantContainer");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 1,
					"then the 'content' aggregation overlay contains only one propagationInfos");
			});

		QUnit.test("when verticalLayout overlay is created",
			function(assert) {
				var oContentAggregationOverlay = this.oVerticalLayoutOverlay.getAggregationOverlay("content");
				var oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

				assert.deepEqual(this.oVerticalLayoutOverlay.getRelevantContainer(), this.oPage,
					"then there is no propagated relevantContainer for the verticalLayout");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 2,
					"then the 'content' aggregation overlay contains two propagationInfos");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].relevantContainerFunction,
					this.oMetadataForToolbar.propagateRelevantContainer,
					"then the 'content' aggregation overlay first propagationInfos contains the relevant container function related to the toolbar");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[1].relevantContainerFunction,
					this.oMetadataForButton.propagateRelevantContainer,
					"then the 'content' aggregation overlay second propagationInfos contains the relevant container function related to the button");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].relevantContainerElement,
					this.oPage,
					"then the 'content' aggregation overlay first propagationInfos contains the element related to the page");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[1].relevantContainerElement,
					this.oVerticalLayout,
					"then the 'content' aggregation overlay second propagationInfos contains the element related to the verticalLayout");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[0].metadataFunction,
					this.oMetadataForToolbar.propagateMetadata,
					"then the 'content' aggregation overlay first propagationInfos contains the metadata function related to the toolbar");
				assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos[1].metadataFunction,
					this.oMetadataForButton.propagateMetadata,
					"then the 'content' aggregation overlay second propagationInfos contains the metadata function related to the button");
			});

		QUnit.test("when toolbar overlay is created",
			function(assert) {
				var mData = this.oMetadataForToolbar.propagateMetadata(this.oToolbar);
				assert.deepEqual(this.oToolbarOverlay.getRelevantContainer(), this.oPage,
					"then page element as relevant container is propagated");
				assert.deepEqual(this.oToolbarOverlay.getDesignTimeMetadata().getAggregation("content"),
					mData.aggregations.content,
					"then designtime metadata for toolbar is propagated from the page");
			});

		QUnit.test("when text overlay is created",
			function(assert) {
				assert.deepEqual(this.oTextOverlay.getRelevantContainer(), this.oToolbar,
					"then the parent is returned as propagated container by default");
			});

		QUnit.test("when button overlays are created",
			function(assert) {
				var mData = this.oMetadataForButton.propagateMetadata(this.oButton1);
				assert.deepEqual(this.oButton1Overlay.getRelevantContainer(), this.oVerticalLayout,
					"then the button1 has verticalLayout as relevant container");
				assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content"),
					mData.aggregations.content,
					"then designtime metadata for button1 is propagated from the vertical layout");
				mData = this.oMetadataForButton.propagateMetadata(this.oButton2);
				assert.deepEqual(this.oButton2Overlay.getRelevantContainer(), this.oVerticalLayout,
					"then the button2 has verticalLayout as relevant container");
				assert.deepEqual(this.oButton2Overlay.getDesignTimeMetadata().getAggregation("content"),
					mData.aggregations.content,
					"then designtime metadata for button2 is propagated from the vertical layout");
				assert.deepEqual(this.oButton3Overlay.getRelevantContainer(), this.oPage,
					"then the button3 has page as relevant container by default");
				assert.deepEqual(this.oButton3Overlay.getDesignTimeMetadata().getAggregation("content"),
					{},
					"then there is no designtime metadata propagation from vertical layout for button3");
			});

		QUnit.module("Given exceptional control handling for metadata propagation", {
			beforeEach: function(assert){
				this.oButton = new Button("button");
				this.oElement = new VerticalLayout("vertlay", {
					content: [this.oButton]
				});

				this.oMtDtFunction = _createPropagateMetadataObj("sap.m.Button");

				this.oAggOverlay = new AggregationOverlay({
					designTimeMetadata: new AggregationDesignTimeMetadata({
						data: {
							propagationInfos: [_createPropagationInfoObject(null, this.oElement, this.oMtDtFunction.propagateMetadata)]
						}
					})
				});

				this.oElemDtMetaDt = new ElementDesignTimeMetadata(_buildMetadataObject({}));
				this.oOverlayButton = new ElementOverlay({
					designTimeMetadata : this.oElemDtMetaDt,
					element: this.oButton
				});

				this.oOverlayButton.setParent(this.oAggOverlay);
			},
			afterEach: function(assert){
				this.oElement.destroy();
				this.oAggOverlay.destroy();
				this.oOverlayButton.destroy();
			}
		});

		QUnit.test("when _addPropagationInfos is called for button",
			function(assert) {
				assert.ok(this.oOverlayButton._addPropagationInfos(this.oElemDtMetaDt),"then element designtime was injected successfully");
				assert.deepEqual(this.oOverlayButton.getDesignTimeMetadata().getData().metadataContainer.getId(), this.oElement.getId(), "then relevant container is set inside metadataFunction while execution, as expected");
			});

		QUnit.module("Given independent controls consisting of vertical layout and buttons", {
			beforeEach: function(assert){

				this.oButtonWithOverlay = new Button("button1");
				this.oButtonWithoutOverlay = new Button("button2");
				this.oElement = new VerticalLayout("vertlay");

				this.oDesignTime = new DesignTime({
					rootElements : [this.oElement]
				});

				this.oMtDtFunction = _createPropagateMetadataObj("sap.m.Button");

				var done = assert.async();

				this.oElemDtMetaDt = new ElementDesignTimeMetadata(_buildMetadataObject({}));

				this.oRelevantContainerFunction = _createRelevantContainerObj("sap.m.Button");

				//initialized control overlay
				this.oOverlayButton1 = new ElementOverlay({
					designTimeMetadata : this.oElemDtMetaDt,
					element: this.oButtonWithOverlay
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					var oElementOverlay = OverlayRegistry.getOverlay("vertlay");
					var oAggregationOverlay = oElementOverlay.getAggregationOverlay("content");
					var oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();
					var oAggregationData = oAggregationDtMetadata.getData();
					oAggregationData.propagationInfos = [_createPropagationInfoObject(this.oRelevantContainerFunction.propagateRelevantContainer, this.oElement, this.oMtDtFunction.propagateMetadata)];
					oAggregationDtMetadata.setData(oAggregationData);
					oElementOverlay._syncAggregationOverlay(oAggregationOverlay);
					oAggregationOverlay.attachVisibleChanged(oElementOverlay._onAggregationVisibleChanged, oElementOverlay);
					done();
				}.bind(this));

			},
			afterEach: function(assert){
				this.oButtonWithOverlay.destroy();
				this.oButtonWithoutOverlay.destroy();
				this.oElement.destroy();
				this.oOverlayButton1.destroy();
				this.oDesignTime.destroy();
			}
		});

		QUnit.test("when existing element is added and element overlay already exists",
			function(assert) {
				var mData = this.oMtDtFunction.propagateMetadata(this.oButtonWithOverlay);

				//case 1 when element overlay already exists
				this.oElement.addContent(this.oButtonWithOverlay);
				assert.deepEqual(this.oOverlayButton1.getDesignTimeMetadata().getData().aggregations.content, mData.aggregations.content,
					"designtime metadata was set successfully after adding the element with an existing overlay");

				this.oElement.addContent(this.oButtonWithoutOverlay);
			});

		QUnit.test("when existing element is added and element overlay does not exists",
			function(assert) {
				var done = assert.async();
				var mData = this.oMtDtFunction.propagateMetadata(this.oButtonWithOverlay);

				//case 2 when element overlay does not exist
				this.oDesignTime.attachElementOverlayCreated(function(oEvent){
					assert.deepEqual(oEvent.getParameter("elementOverlay").getDesignTimeMetadata().getData().aggregations.content, mData.aggregations.content,
						"designtime metadata was set successfully after adding the element without an existing overlay");
					done();
				});

				this.oElement.addContent(this.oButtonWithoutOverlay);
			});

		QUnit.module("Given two verticalLayouts with different designTimeMetadata", {
			beforeEach: function(assert){
				var done = assert.async();

				this.oMetadataForButton1 = _createPropagateMetadataObj("sap.m.Button", "vertlay1");
				this.oMetadataForButton2 = _createPropagateMetadataObj("sap.m.Button", "vertlay2");

				var oVerticalLayoutMetadata1 = _buildMetadataObject(this.oMetadataForButton1);
				var oVerticalLayoutMetadata2 = _buildMetadataObject(this.oMetadataForButton2);

				var oEmptyMetadata = _buildMetadataObject({});

				this.oButton1 = new Button("button1");
				this.oVerticalLayout1 = new VerticalLayout("vertlay1", {
					content: [this.oButton1]
				});

				this.oVerticalLayout2 = new VerticalLayout("vertlay2");
				this.oPage = new Page({
					content: [this.oVerticalLayout1, this.oVerticalLayout2]
				}).placeAt("content");

				sap.ui.getCore().applyChanges();

				var fnLoadDtMetadataStub = sandbox.stub(ElementUtil, "loadDesignTimeMetadata");
				fnLoadDtMetadataStub.withArgs(this.oPage).returns(Promise.resolve(oEmptyMetadata.data));
				fnLoadDtMetadataStub.withArgs(this.oVerticalLayout1).returns(Promise.resolve(oVerticalLayoutMetadata1.data));
				fnLoadDtMetadataStub.withArgs(this.oVerticalLayout2).returns(Promise.resolve(oVerticalLayoutMetadata2.data));
				fnLoadDtMetadataStub.withArgs(this.oButton1).returns(Promise.resolve(oEmptyMetadata.data));

				this.oDesignTime = new DesignTime({
					rootElements : [this.oPage]
				});

				this.oDesignTime.attachEventOnce("synced", function() {
					this.oVerticalLayout1Overlay = OverlayRegistry.getOverlay(this.oVerticalLayout1);
					this.oVerticalLayout2Overlay = OverlayRegistry.getOverlay(this.oVerticalLayout2);
					this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
					done();
				}.bind(this));

			},
			afterEach: function(assert){
				this.oButton1Overlay.destroy();
				this.oVerticalLayout1Overlay.destroy();
				this.oVerticalLayout2Overlay.destroy();
				this.oPage.destroy();
				this.oDesignTime.destroy();
				sandbox.restore();
			}
		});

		QUnit.test("when button is moved from verticalLayout1 to verticalLayout2",
			function(assert) {
				this.oVerticalLayout1.removeContent(this.oButton1);
				assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getData().aggregations.content,
					this.oMetadataForButton1.propagateMetadata(this.oButton1).aggregations.content,
					"then initially verticalLayout1 property is propagated");
				this.oVerticalLayout2.addContent(this.oButton1);
				assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getData().aggregations.content,
					this.oMetadataForButton2.propagateMetadata(this.oButton1).aggregations.content,
					"then after move verticalLayout2 property is propagated and replaced");
			});

});