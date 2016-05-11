/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.test.ElementEnablementTest.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/test/Test',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/test/Element'
],
function(jQuery, Test, DesignTime, ElementTest) {
	"use strict";


	/**
	 * Constructor for an ElementEnablementTest.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementEnablementTest class allows to create a design time test
	 * which tests a given element on compatibility with the sap.ui.dt.DesignTime.
	 * @extends sap.ui.dt.test.Test
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.test.ElementEnablementTest
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementEnablementTest = Test.extend("sap.ui.dt.test.ElementEnablementTest", /** @lends sap.ui.dt.test.ElementEnablementTest.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				type : {
					type : "string"
				},
				create : {
					type : "function"
				}
			}
		}
	});


	/**
	 * Called when the ElementEnablementTest is initialized
	 * @protected
	 */
	ElementEnablementTest.prototype.init = function() {
		this._aAggregatedTestResult = null;
		this._aAggregatedInfoResult = null;
		this._sAggregation = null;
		this._$TestAreaDomRef = null;
	};


	/**
	 * Called when the ElementEnablementTest is destroyed
	 * @protected
	 */
	ElementEnablementTest.prototype.exit = function() {
		if (!this._bNoRenderer && !this._bErrorDuringRendering) {
			this._oDesignTime.destroy();
		}
		this._oElement.destroy();
		if (this._$TestAreaDomRef) {
			this._$TestAreaDomRef.remove();
			delete this._$TestAreaDomRef;
		}
	};


	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	ElementEnablementTest.prototype.run = function() {

		var that = this;
		return this._setup().then(function() {

			that._mResult = that.createSuite("Element Enablement Test");

			var mElementTest = that.addGroup(that._mResult.children,
				that.getType(),
				"Given that an DesignTime is created for " + that.getType()
			);

			that._testAggregations(mElementTest.children);

			that._mResult = that.aggregate(that._mResult);

			return that._mResult;
		});
	};


	/**
	 * @private
	 */
	ElementEnablementTest.prototype._createElement = function() {
		var sType = this.getType();
		var fnCreate = this.getCreate();
		var Element = jQuery.sap.getObject(sType);

		var oElement;

		if (fnCreate) {
			oElement = fnCreate();
		} else {
			oElement = new Element();
		}

		if (oElement.addStyleClass) {
			oElement.addStyleClass("minSize");
		}

		return oElement;
	};


	/**
	 * @private
	 */
	ElementEnablementTest.prototype._getTestArea = function() {
		if (!this._$TestAreaDomRef) {
			this._$TestAreaDomRef =  jQuery("<div id='" + this.getId() + "--testArea" + "'></div>").appendTo("body");
		}
		return this._$TestAreaDomRef;
	};


	/**
	 * @private
	 */
	ElementEnablementTest.prototype._setup = function() {
		var that = this;
		return new Promise(function(fnResolve, fnReject) {
			that._oElement = that._createElement();

			that._bNoRenderer = false;
			that._bErrorDuringRendering = false;

			try {
				that._oElement.getRenderer();
			} catch (oError) {
				that._bNoRenderer = true;
			}

			if (!that._bNoRenderer) {
				try {
					that._oElement.placeAt(that._getTestArea().get(0));
					sap.ui.getCore().applyChanges();
				} catch (oError) {
					that._bErrorDuringRendering = true;
				}

				if (!that._bErrorDuringRendering) {
					that._oDesignTime = new DesignTime({
						rootElements : [that._oElement]
					});

					that._oDesignTime.attachEventOnce("synced", function() {
						sap.ui.getCore().applyChanges();
						fnResolve();
					}, that);
				} else {
					fnResolve();
				}
			} else {
				fnResolve();
			}
		});
	};


	/**
	 * @private
	 */
	ElementEnablementTest.prototype._testAggregations = function(aTests) {

		var mAggregationsTests = this.addGroup(
			aTests,
			"Aggregations",
			"Each aggregation needs to be ignored or has a visible domRef maintained in the metadata"
		);


		if (this._bNoRenderer) {
			this.addTest(mAggregationsTests.children,
				true,
				"Control has no renderer",
				"Control has no renderer, not supported by the element test (requires a special element test)",
				Test.STATUS.UNKNOWN
			);
		} else if (this._bErrorDuringRendering) {

			this.addTest(mAggregationsTests.children,
				true,
				"Error during rendering",
				 "Element can't be rendered, not supported by the DesignTime (please, provide a create method for this element)",
				Test.STATUS.ERROR
			);
		} else {
			var mAggregationsTestInfo = ElementTest.getAggregationsInfo(this._oElement);

			for (var sAggregationName in mAggregationsTestInfo) {

				var mAggregationTestInfo = mAggregationsTestInfo[sAggregationName];

				var mAggregationTest = this.addGroup(mAggregationsTests.children,
					sAggregationName,
					(mAggregationTestInfo.ignored ? "Aggregation ignored" : "Aggregation tests")
				);

				if (!mAggregationTestInfo.ignored) {

					this.addTest(mAggregationTest.children,
						mAggregationTestInfo.overlayVisible,
						"Overlay Visible",
						"Overlay domRef is visible in DOM"
					);

					if (mAggregationTestInfo.domRefDeclared){
						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefDeclared,
							"Dom Ref Declared",
							"Declared DomRef found"
						);

						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefFound,
							"Dom Ref Found",
							"Declared DomRef is found"
						);

						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefVisible,
							"Dom Ref Visible",
							"Declared DomRef is visible"
						);

					} else {
						if (mAggregationTestInfo.overlayVisible) {

							this.addTest(mAggregationTest.children,
								mAggregationTestInfo.overlayGeometryCalculatedByChildren,
								"Overlay Geometry calculated by children",
								"Control might work based on DT Heuristic, but safer with domRefDeclared",
								Test.STATUS.PARTIAL_SUPPORTED
							);

						} else {

							this.addTest(mAggregationTest.children,
								false,
								"Overlay Dom Ref",
								"Overlay domRef is not declared and aggregation overlay is not visible (please, declare domRef for this aggregation)",
								Test.STATUS.PARTIAL_SUPPORTED
							);
						}
					}
					if (mAggregationTestInfo.overlayTooSmall) {
						this.addTest(mAggregationTest.children,
							true,
							"Overlay too small",
							"Aggregation Overlay is too small to be accessible",
							Test.STATUS.PARTIAL_SUPPORTED
						);
					}
				}
			}
		}
	};


	return ElementEnablementTest;
}, /* bExport= */ true);