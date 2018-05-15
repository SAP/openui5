/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/dt/MetadataPropagationUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"qunit/MetadataTestUtil",
	// controls
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/ui/layout/VerticalLayout",
	// should be last
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-ie",
	"sap/ui/thirdparty/sinon-qunit"
], function(
	MetadataPropagationUtil,
	OverlayRegistry,
	DesignTime,
	MetadataTestUtil,
	Button,
	Page,
	Text,
	Toolbar,
	VerticalLayout,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given empty propagation map (without 'propagateRelevantContainer' designTimeMetadata and without parent propagationInfos)", {
		beforeEach : function(assert) {
			this.oVerticalLayout = new VerticalLayout("layout");
			this.oPage = new Page("test-page");
			this.mAggregationData = {};
		},
		afterEach : function() {
			this.oVerticalLayout.destroy();
			this.oPage.destroy();
			sandbox.restore();
		}
	}, function() {

		QUnit.test("when propagateMetadataToAggregationOverlay is called", function(assert) {
			var fnParentPropagationInfoSpy = sandbox.spy(MetadataPropagationUtil, "_getParentPropagationInfo");
			var fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			var mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.mAggregationData, this.oVerticalLayout);
			assert.deepEqual(mResultData, this.mAggregationData, "then designtime metadata should not be changed");
			assert.notOk(mResultData.propagationInfos, "then no propagation infos are generated");
			assert.equal(fnParentPropagationInfoSpy.callCount, 1, "then _getParentPropagationInfo method should be called");
			assert.strictEqual(fnPropagateRelevantContainerSpy.withArgs({}, null).callCount, 0,
			"then '_setPropagationInfo' shouldn't be called");
		});

		QUnit.test("when '_setPropagationInfo' is called without attributes", function(assert) {
			assert.strictEqual(MetadataPropagationUtil._setPropagationInfo(), false,
				"then '_setPropagationInfo' should return false");
		});

		QUnit.test("when '_setPropagationInfo' is called with new relevantContainerPropagation object and without parentPropagation object", function(assert) {
			var oNewPropagationInfo = MetadataTestUtil.createPropagationInfoObject(true, this.oVerticalLayout, null);
			var oResult = MetadataPropagationUtil._setPropagationInfo(this.mAggregationData, oNewPropagationInfo, undefined);
			assert.strictEqual(oResult, this.mAggregationData,
				"then '_setPropagationInfo' should return metadata");
			assert.deepEqual(oResult.propagationInfos[0], oNewPropagationInfo,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains relevantContainer propagation object");
		});

		QUnit.test("when '_setPropagationInfo' is called with new relevantContainerPropagation object and with parentPropagation object", function(assert) {
			var aParentRelevantContainerPropagation = [ MetadataTestUtil.createPropagationInfoObject(true, this.oPage, null) ];
			var oNewPropagationInfo = MetadataTestUtil.createPropagationInfoObject(true, this.oVerticalLayout, null);
			var oResult = MetadataPropagationUtil._setPropagationInfo(this.mAggregationData, oNewPropagationInfo, aParentRelevantContainerPropagation);
			assert.strictEqual(oResult, this.mAggregationData,
				"then '_setPropagationInfo' should return metadata");
			assert.deepEqual(oResult.propagationInfos.length, 2,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains 2 objects");
			assert.deepEqual(oResult.propagationInfos[0], aParentRelevantContainerPropagation[0],
				"then after '_setPropagationInfo' is called, data of designtime metadata contains the parentRelevantContainer object");
			assert.deepEqual(oResult.propagationInfos[1], oNewPropagationInfo,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains also the oNewPropagationInfo object");
		});

		QUnit.test("when '_setPropagationInfo' is called without new relevantContainerPropagation object and with parentPropagation object", function(assert) {
			var aParentRelevantContainerPropagation = [ MetadataTestUtil.createPropagationInfoObject(true, this.oPage, null) ];
			var oResult = MetadataPropagationUtil._setPropagationInfo(this.mAggregationData, null, aParentRelevantContainerPropagation);
			assert.strictEqual(oResult, this.mAggregationData,
				"then '_setPropagationInfo' should return designTimeMetadata");
			assert.deepEqual(oResult.propagationInfos.length, 1,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains 1 objects");
			assert.deepEqual(oResult.propagationInfos[0], aParentRelevantContainerPropagation[0],
				"then after '_setPropagationInfo' is called, data of designtime metadata contains only the parentRelevantContainer object");
		});
	});

	QUnit.module("Given propagation map with 'propagateRelevantContainer' as boolean and without parent propagationInfos", {
		beforeEach : function(assert) {
			this.oPropObject = { propagateRelevantContainer: true };
			this.oButton = new Button("test-button2");
		},
		afterEach : function() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			var fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			var fnCurrentRelevantContainerPropagationSpy = sandbox.spy(MetadataPropagationUtil, "_getCurrentRelevantContainerPropagation");
			var fnCurrentDesigntimePropagationSpy = sandbox.spy(MetadataPropagationUtil, "_getCurrentDesigntimePropagation");
			var mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oPropObject, this.oButton);
			assert.equal(mResultData.propagationInfos[0].relevantContainerFunction(), true, "then relevantContainerFunction is set to the propagation info");
			assert.strictEqual(mResultData.propagationInfos[0].relevantContainerElement, this.oButton, "then relevantContainerElement is set to the propagation info");
			assert.strictEqual(fnCurrentRelevantContainerPropagationSpy.callCount, 1,
				"then '_getCurrentRelevantContainerPropagation' called once");
			assert.strictEqual(fnCurrentDesigntimePropagationSpy.callCount, 1,
				"then '_getCurrentDesigntimePropagation' called once");
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_setPropagationInfo' called once");
			var oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.ok(oSpyArgs[1],
				"then '_setPropagationInfo' called with new propagationInfo");
			assert.strictEqual(oSpyArgs[1].relevantContainerFunction(), true,
				"then relevantContainerFunction should return 'true'");
			assert.notOk(oSpyArgs[2],
				"then '_setPropagationInfo' called without propagationInfo from parent");
		});
	});

	QUnit.module("Given propagation map with 'propagateRelevantContainer' as function and without parent propagationInfos", {
		beforeEach : function(assert) {
			this.fnPropagateRelevantContainer = function() {
				return true;
			};
			this.oButton = new Button("test-button3");
			this.oPropObject = { propagateRelevantContainer: this.fnPropagateRelevantContainer };
		},
		afterEach : function() {
			this.oButton.destroy();
			sandbox.restore();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			var fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			var mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oPropObject, this.oButton);
			assert.equal(mResultData.propagationInfos[0].relevantContainerFunction, this.fnPropagateRelevantContainer, "then relevantContainerFunction is set to the propagation info");
			assert.strictEqual(mResultData.propagationInfos[0].relevantContainerElement, this.oButton, "then relevantContainerElement is set to the propagation info");
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_setPropagationInfo' called once");
			var oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.strictEqual(oSpyArgs[1].relevantContainerFunction, this.fnPropagateRelevantContainer,
				"then '_setPropagationInfo' called with propagatedRelevantContainer object");
			assert.notOk(oSpyArgs[2],
				"then '_setPropagationInfo' called without propagatedRelevantContainer object from parent");
		});
	});

	QUnit.module("Given propagation map with 'propagateRelevantContainer' as object and without parent propagationInfo", {
		beforeEach : function(assert) {
			this.oPropObject = { propagateRelevantContainer: {} };
			this.oButton = new Button("test-button4");
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			assert.throws(function() {
					MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oPropObject, this.oButton);
				}, /Wrong type: it should be either a function or a boolean value/,
				"then '_setPropagationInfo' should throw an exception");
		});
	});

	QUnit.module("Given propagation map with 'propagateMetadata' as function", {
		beforeEach : function(assert) {
			this.oElement = new VerticalLayout("layout");
			this.oMetadataFunction = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button");
		},
		afterEach : function(assert) {
			this.oElement.destroy();
			sandbox.restore();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			var fnPropagateRelevantContainerSpy = sandbox.spy(MetadataPropagationUtil, "_setPropagationInfo");
			var mResultData = MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oMetadataFunction, this.oElement);
			assert.strictEqual(mResultData.propagationInfos[0].metadataFunction, this.oMetadataFunction.propagateMetadata, "then metadata function propagated successfully");
			assert.strictEqual(fnPropagateRelevantContainerSpy.callCount, 1,
				"then '_setPropagationInfo' called once");
			var oSpyArgs = fnPropagateRelevantContainerSpy.args[0];
			assert.deepEqual(oSpyArgs[1].metadataFunction, this.oMetadataFunction.propagateMetadata,
				"then '_setPropagationInfo' called with propagationInfos object");
		});
	});

	QUnit.module("Given propagation map with 'propagateMetadata' as string", {
		beforeEach : function(assert) {
			this.oElement = new VerticalLayout("layout");
			this.oMetadataFunction = { propagateMetadata: "propagateMatadata" };
		},
		afterEach : function(assert) {
			this.oElement.destroy();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToAggregationOverlay' is called", function(assert) {
			assert.throws(function() {
				MetadataPropagationUtil.propagateMetadataToAggregationOverlay(this.oMetadataFunction, this.oElement);
			}, /Wrong type: it should be a function and it is:/,
			"then '_setPropagationInfo' should throw the following exception: wrong type: it should be a function...");
		});

	});

	QUnit.module("Given aggregationMetadata map without propagationInfos", {
		beforeEach : function(assert) {
			this.oButton = new Button("test-button8");
			this.mAggregationData = { test: "test" };
			this.mElementData = {};
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToElementOverlay' is called without AggregationMetadata map", function(assert) {
			assert.strictEqual(MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, undefined, this.oButton), this.mElementData,
				"then no relevant container added to the element");
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			var mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, this.mAggregationData, this.oButton);
			assert.strictEqual(mResultData, this.mElementData, "then designtimeMetadata is returned without changes");
		});
	});

	QUnit.module("Given aggregationMetadata map with valid propagation information for relevantContainer propagation", {
		beforeEach : function(assert) {

			this.oVerticalLayout = new VerticalLayout("layout1");
			this.oButton = new Button("test-button1");

			this.mAggregationData = {
				propagationInfos: [
					{
						relevantContainerElement: this.oVerticalLayout,
						relevantContainerFunction: function (oElement) {
							return true;
						}
					}
				]
			};
			this.mElementData = {};
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oVerticalLayout.destroy();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			var mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, this.mAggregationData, this.oButton);
			assert.strictEqual(mResultData.relevantContainer.getId(), this.oVerticalLayout.getId(), "then the returned data map contains the relevantContainer element");
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' with incomplete relevant container information is called", function(assert) {
			// manipulate propagation information
			delete this.mAggregationData.propagationInfos[0].relevantContainerFunction;
			var mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, this.mAggregationData, this.oButton);
			assert.strictEqual(mResultData, this.mElementData, "then designtimeMetadata is returned without changes");
			assert.strictEqual(mResultData.relevantContainer, undefined, "then the returned data map doesn't include the relevantContainer element");
		});
	});

	QUnit.module("Given aggregationMetadata map for metadata propagation", {
		beforeEach: function(assert){
			this.oButton = new Button("button");
			this.oElement = new VerticalLayout("vertlay", {
				content: [this.oButton]
			});

			this.oMetadataFunction = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button");
			this.mAggregationData = {
					propagationInfos: [MetadataTestUtil.createPropagationInfoObject(null, this.oElement, this.oMetadataFunction.propagateMetadata)]
				};
			this.mElementData = MetadataTestUtil.buildMetadataObject("contentValue", "testValue").data;
		},
		afterEach: function(assert){
			this.oElement.destroy();
			this.oButton.destroy();
		}
	}, function() {

		QUnit.test("when propagateMetadataToElementOverlay is called for button", function(assert) {
			var oAggregations = this.oMetadataFunction.propagateMetadata(this.oButton).aggregations;
			var mResultData = MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, this.mAggregationData, this.oButton);
			assert.notEqual(mResultData, this.mElementData, "then the metadata map was cloned and modificated");
			assert.deepEqual(mResultData.aggregations.content, oAggregations.content, "then the metadata was propagated successfully from the aggregation overlay");
			assert.deepEqual(mResultData.metadataContainer.getId(), this.oElement.getId(), "then relevant container is set inside metadataFunction while execution, as expected");
			assert.strictEqual(mResultData.aggregations.testAggregation, "testValue", "then default aggregation still exists");
		});
	});

	QUnit.module("Given aggregationMetadata map with actions delete for metadata propagation", {
		beforeEach: function(assert){
			this.oButton = new Button("button");
			this.oElement = new VerticalLayout("vertlay", {
				content: [this.oButton]
			});

			this.mPropagateMetadata = MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", undefined, null);
			this.mAggregationData = {
				propagationInfos: [MetadataTestUtil.createPropagationInfoObject(null, this.oElement, this.mPropagateMetadata.propagateMetadata)]
			};
			this.mElementData = MetadataTestUtil.buildMetadataObject({ actions: { myAction : "testAction" }}).data;
		},
		afterEach: function(assert){
			this.oElement.destroy();
			this.oButton.destroy();
		}
	}, function() {

		QUnit.test("when 'propagateMetadataToElementOverlay' is called", function(assert) {
			var mExtendedDesigntime = MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, this.mAggregationData, this.oButton);
			assert.equal(mExtendedDesigntime.actions, null, "then element actions in designtime were replaced with null value");
			assert.equal(mExtendedDesigntime.aggregations.content.actions, null, "then all element aggregation actions were replaced with null value");
		});

		QUnit.test("when 'propagateMetadataToElementOverlay' is called without aggregations defined", function(assert) {
			delete this.mElementData.aggregations;
			var mExtendedDesigntime = MetadataPropagationUtil.propagateMetadataToElementOverlay(this.mElementData, this.mAggregationData, this.oButton);
			var mExpectedAggregationData = this.mPropagateMetadata.propagateMetadata(this.oButton);
			assert.deepEqual(mExtendedDesigntime.aggregations, mExpectedAggregationData.aggregations, "then element designtime was extended empty aggregations object");
		});
	});

	QUnit.module("Given complex test with only 'propagateRelevantContainer' as function in the designTimeMetadata", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.fnPropagateRelevantContainer = function() {
				return true;
			};
			this.oMetadata = MetadataTestUtil.buildMetadataObject({ propagateRelevantContainer: this.fnPropagateRelevantContainer });
			this.oButton = new Button("test-button7");
			this.oPage = new Page({
				content: [this.oButton]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oPage],
				designTimeMetadata : { "sap.m.Page": this.oMetadata.data }
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oPage.destroy();
		}
	}, function() {

		QUnit.test("when overlay is created", function(assert) {
			var oContentAggregation = this.oPageOverlay.getAggregationOverlay("content");
			var mContentData = oContentAggregation.getDesignTimeMetadata().getData();
			assert.deepEqual(mContentData.propagationInfos.length, 1,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains 1 objects");
			assert.deepEqual(mContentData.propagationInfos[0].relevantContainerFunction, this.fnPropagateRelevantContainer,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains relevantContainer propagation function");
			assert.deepEqual(mContentData.propagationInfos[0].relevantContainerElement, this.oPage,
				"then after '_setPropagationInfo' is called, data of designtime metadata contains relevantContainer propagation element");
		});
	});

	QUnit.module("Given that a complex test has been created with different relevantContainer and metadata propagations", {
		beforeEach : function(assert) {

			// page				--> propagate relevant container for toolbar
			//					--> propagate metadata for toolbar
			//	verticalLayout 	--> propagate relevant container for buttons
			//					--> propagate metadata for buttons
			//		toolbar
			//			button1
			//			text
			//		button2
			// button3

			this.oMetadataForToolbar = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Toolbar");
			this.oMetadataForButton = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			jQuery.extend(this.oMetadataForToolbar, MetadataTestUtil.createPropagateMetadataObject("sap.m.Toolbar"));
			jQuery.extend(this.oMetadataForButton, MetadataTestUtil.createPropagateMetadataObject("sap.m.Button"));

			var oPageMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForToolbar);
			var oVerticalLayoutMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButton);

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

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPage],
				designTimeMetadata : {	"sap.m.Page": oPageMetadata.data,
										"sap.ui.layout.VerticalLayout": oVerticalLayoutMetadata.data }
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
		}
	}, function() {

		QUnit.test("when page overlay is created", function(assert) {
			var oContentAggregationOverlay = this.oPageOverlay.getAggregationOverlay("content");
			var oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

			assert.deepEqual(this.oPageOverlay.getRelevantContainer(), undefined,
				"then there is no propagated relevantContainer");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 1,
				"then the 'content' aggregation overlay contains only one propagationInfos");
		});

		QUnit.test("when verticalLayout overlay is created", function(assert) {
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

		QUnit.test("when toolbar overlay is created", function(assert) {
			var mData = this.oMetadataForToolbar.propagateMetadata(this.oToolbar);
			var oContentAggregationOverlay = this.oToolbarOverlay.getAggregationOverlay("content");
			var oContentDesignTimeMetadata = oContentAggregationOverlay.getDesignTimeMetadata();

			assert.deepEqual(this.oToolbarOverlay.getRelevantContainer().getId(), this.oPage.getId(),
				"then page element as relevant container is propagated");
			assert.deepEqual(oContentDesignTimeMetadata.getData().propagationInfos.length, 2,
				"then the 'content' aggregation overlay contains two propagationInfos");
			assert.deepEqual(this.oToolbarOverlay.getDesignTimeMetadata().getAggregation("content").testProp,
				mData.aggregations.content.testProp,
				"then designtime metadata for toolbar is propagated from the page");
		});

		QUnit.test("when text overlay is created", function(assert) {
			assert.deepEqual(this.oTextOverlay.getRelevantContainer(), this.oToolbar,
				"then the parent is returned as propagated container by default");
		});

		QUnit.test("when button overlays are created", function(assert) {
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
			assert.deepEqual(this.oButton3Overlay.getDesignTimeMetadata().getAggregation("content"), undefined,
				"then there is no designtime metadata propagation from vertical layout for button3");
		});
	});

	QUnit.module("Given a page with a vertical layout with toolbar, all containing propagateMetadata for button...", {
		beforeEach : function(assert) {

			// page				--> propagate metadata for buttons
			//	verticalLayout 	--> propagate metadata for buttons
			//		toolbar     --> propagate metadata for buttons
			//			button1

			this.oMetadataForButtonInPage = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			jQuery.extend(this.oMetadataForButtonInPage,
				MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "valueForPage", undefined, "propertyFromPage"));
			this.oMetadataForButtonInLayout = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			jQuery.extend(this.oMetadataForButtonInLayout,
				MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "valueForLayout", undefined, "propertyFromLayout"));
			this.oMetadataForButtonInToolbar = MetadataTestUtil.createPropagateRelevantContainerObject("sap.m.Button");
			jQuery.extend(this.oMetadataForButtonInToolbar,
				MetadataTestUtil.createPropagateMetadataObject("sap.m.Button", "valueForToolbar", undefined, "propertyFromToolbar"));

			var oPageMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButtonInPage);
			var oVerticalLayoutMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButtonInLayout);
			var oToolbarMetadata = MetadataTestUtil.buildMetadataObject(this.oMetadataForButtonInToolbar);

			this.oButton1 = new Button("button1");
			this.oToolbar = new Toolbar("toolbar1", {
				content: [this.oButton1]
			});
			this.oVerticalLayout = new VerticalLayout("layout", {
				content: [this.oToolbar]
			});
			this.oPage = new Page({
				content: [this.oVerticalLayout]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oPage],
				designTimeMetadata : {	"sap.m.Page": oPageMetadata.data,
										"sap.ui.layout.VerticalLayout": oVerticalLayoutMetadata.data,
										"sap.m.Toolbar": oToolbarMetadata.data }
			});

			var done = assert.async();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				this.oVerticalLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oToolbarOverlay = OverlayRegistry.getOverlay(this.oToolbar);
				this.oButton1Overlay = OverlayRegistry.getOverlay(this.oButton1);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oButton1Overlay.destroy();
			this.oToolbarOverlay.destroy();
			this.oVerticalLayoutOverlay.destroy();
			this.oPage.destroy();
			this.oDesignTime.destroy();
		}
	}, function() {

		QUnit.test("when button overlay is created", function(assert) {
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").testProp,
				"valueForPage",
				"then common property in all propagation levels is taken from the page (highest parent)");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").propertyFromPage,
				"propertyFromPage",
				"then the property set only on the page is propagated to the button");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").propertyFromLayout,
				"propertyFromLayout",
				"then the property set only on the layout is propagated to the button");
			assert.deepEqual(this.oButton1Overlay.getDesignTimeMetadata().getAggregation("content").propertyFromToolbar,
				"propertyFromToolbar",
				"then the property set only on the toolbar is propagated to the button");
		});
	});

	QUnit.start();
});