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

	// Wait until the theme is changed
	function themeChanged() {
		return new Promise(function(resolve) {
			function onChanged() {
				sap.ui.getCore().detachThemeChanged(onChanged);
				resolve();
			}
			sap.ui.getCore().attachThemeChanged(onChanged);
		});
	}
	// Wait until the theme is applied
	function whenThemeApplied() {
		if (sap.ui.getCore().isThemeApplied()) {
			return Promise.resolve();
		} else {
			return themeChanged();
		}
	}

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
					type : "any" //function
				},
				timeout : {
					type : "int",
					defaultValue : 0
				},
				groupPostfix : {
					type : "string"
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
		if (this._oDesignTime) {
			this._oDesignTime.destroy();
		}
		window.clearTimeout(this._iTimeout);
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
		return this._setup().then(function() {

			this._mResult = this.createSuite("Element Enablement Test");

			var mElementTest = this.addGroup(
				this._mResult.children,
				this.getType(),
				"Given that a DesignTime is created for " + this.getType()
			);

			this._testAggregations(mElementTest.children);

			this._mResult = this.aggregate(this._mResult);

			return this._mResult;
		}.bind(this));
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
			this._$TestAreaDomRef =  jQuery("<div id='" + this.getId() + "--testArea" + "'></div>").css({
				height : "500px",
				width: "1000px"// test area needs a height, so that some controls render correctly
			}).appendTo("body");
		}
		return this._$TestAreaDomRef;
	};


	/**
	 * @private
	 */
	ElementEnablementTest.prototype._setup = function() {
		window.clearTimeout(this._iTimeout);
		this._bNoRenderer = false;
		this._bErrorDuringRendering = false;

		return new Promise(function(fnResolve, fnReject) {
			whenThemeApplied().then(function() {
				this._oElement = this._createElement();

				try {
					this._oElement.getRenderer();
				} catch (oError) {
					this._bNoRenderer = true;
				}

				if (!this._bNoRenderer) {
					try {
						this._oElement.placeAt(this._getTestArea().get(0));
						sap.ui.getCore().applyChanges();
					} catch (oError) {
						this._bErrorDuringRendering = true;
					}

					if (!this._bErrorDuringRendering) {
						this._oDesignTime = new DesignTime({
							rootElements : [this._oElement]
						});
						this._oDesignTime.attachEventOnce("synced", function() {
							if (this.getTimeout()) {
								this._iTimeout = window.setTimeout(function() {
									fnResolve();
								}, this.getTimeout());
							} else {
								fnResolve();
							}

						}, this);
					} else {
						fnResolve();
					}
				} else {
					fnResolve();
				}
			}.bind(this));
		}.bind(this));
	};


	/**
	 * @private
	 */
	ElementEnablementTest.prototype._testAggregations = function(aTests) {

		var mAggregationsTests = this.addGroup(
			aTests,
			"Aggregations",
			"Each aggregation needs to be ignored or has a visible domRef maintained in the metadata",
			this.getGroupPostfix()
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
							"DomRef is declared in design time metadata"
						);

						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefFound,
							"Dom Ref Found",
							"Declared DomRef is found in DOM"
						);

						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefVisible,
							"Dom Ref Visible",
							"Declared DomRef is visible"
						);
					} else if (mAggregationTestInfo.overlayVisible) {
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
					if (mAggregationTestInfo.overlayTooSmall) {
						this.addTest(mAggregationTest.children,
							false,
							"Overlay too small",
							"Aggregation Overlay is too small to be accessible, please ensure to render it big enough that it can be reach by a user. If content is needed, provide a create method for this element",
							Test.STATUS.PARTIAL_SUPPORTED
						);
					}
				}
			}
		}
	};


	return ElementEnablementTest;
}, /* bExport= */ true);
