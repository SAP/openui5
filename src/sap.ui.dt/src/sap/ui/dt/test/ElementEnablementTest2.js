/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.test.ElementEnablementTest.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/test/BaseTest',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/test/Element',
	'sap/ui/fl/registry/ChangeRegistry'
],
function(jQuery, BaseTest, DesignTime, ElementTest, ChangeRegistry) {
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
	 * @extends sap.ui.dt.test.BaseTest
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.dt.test.ElementEnablementTest2
	 * @experimental Since 1.48. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementEnablementTest2 = BaseTest.extend("sap.ui.dt.test.ElementEnablementTest2", /** @lends sap.ui.dt.test.ElementEnablementTest.prototype */ {
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
				}
			}
		}
	});


	/**
	 * Called when the ElementEnablementTest is initialized
	 * @protected
	 */
	ElementEnablementTest2.prototype.init = function() {
		this._aAggregatedTestResult = null;
		this._aAggregatedInfoResult = null;
		this._sAggregation = null;
		this._$TestAreaDomRef = null;
	};


	/**
	 * Called when the ElementEnablementTest is destroyed
	 * @protected
	 */
	ElementEnablementTest2.prototype.exit = function() {
		if (this._oDesignTime) {
			this._oDesignTime.destroy();
		}
		window.clearTimeout(this._iTimeout);
		if (this._oElement) {
			this._oElement.destroy();
		}
		if (this._$TestAreaDomRef) {
			this._$TestAreaDomRef.remove();
			delete this._$TestAreaDomRef;
		}
	};


	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	ElementEnablementTest2.prototype.run = function() {
		return this._setup().then(function(oData) {

			this._mResult = this.createSuite();

			var mElementTest = this.addGroup(
				this._mResult.children,
				this.getType()
			);

			if (this._bNotSupported) {
				this.addTest(
					mElementTest.children,
					true,
					"Control not supported",
					BaseTest.STATUS.NOT_SUPPORTED
				);
			} else {
				this._testActions(mElementTest.children, oData);
				this._testAggregations(mElementTest.children);
			}

			this._mResult = this.aggregate(this._mResult);

			return this._mResult;
		}.bind(this));
	};


	/**
	 * @private
	 */
	ElementEnablementTest2.prototype._createElement = function() {
		var sType = this.getType();
		var fnCreate = this.getCreate();
		var Element = jQuery.sap.getObject(sType);

		var oElement;

		if (fnCreate) {
			oElement = fnCreate();
		} else {
			try {
				oElement = new Element();
			} catch (oError) {
				this._bNotSupported = true;
			}
		}

		if (!this._bNotSupported && oElement.addStyleClass) {
			try {
				oElement.addStyleClass("minSize");
			} catch (oError) {
				this._bDTError = true;
			}
		}

		return oElement;
	};


	/**
	 * @private
	 */
	ElementEnablementTest2.prototype._getTestArea = function() {
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
	ElementEnablementTest2.prototype._setup = function() {
		window.clearTimeout(this._iTimeout);
		this._bNoRenderer = false;
		this._bErrorDuringRendering = false;
		this._bNotSupported = false;
		this._bDTError = false;

		return Promise.resolve().then(function() {
			this._oElement = this._createElement();

			if (!this._bNotSupported) {
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
						return new Promise(function(fnResolve, fnReject){
							try {
								this._oDesignTime = new DesignTime({
									rootElements : [this._oElement]
								});
								this._oDesignTime.attachEventOnce("synced", function() {
									try {
										sap.ui.getCore().applyChanges();
										var oElementOverlay = this._oDesignTime.getElementOverlays()[0];
										var oDTMetadata = oElementOverlay.getDesignTimeMetadata();
										var oData = oDTMetadata.getData();
										fnResolve(oData);
									} catch (oError) {
										this._bDTError = true;
										fnReject(oError);
									}
								}, this);
							} catch (oError) {
								this._bDTError = true;
								fnResolve();
							}
						}.bind(this));
					}
				}
			}
		}.bind(this)
		).catch(function(oError){
			this._bDTError = true;
		}.bind(this));
	};

	var fnSetInterval = window.setInterval;
	window.setInterval = function(){
		var args = Array.prototype.slice.call(arguments);
		var fnOriginal = args[0];
		args[0] = function(){
			try {
				if (typeof (fnOriginal) === "string") {
					eval(fnOriginal);// eslint-disable-line no-eval
				} else {
					fnOriginal.apply(this, arguments);
				}
			} catch (oError){
				jQuery.sap.log.error("Error from setInterval", oError);
			}
		};
		fnSetInterval.apply(this, args);
	};

	var fnSetTimeout = window.setTimeout;
	window.setTimeout = function(){
		var args = Array.prototype.slice.call(arguments);
		var fnOriginal = args[0];
		args[0] = function(){
			try {
				if (typeof (fnOriginal) === "string") {
					eval(fnOriginal);// eslint-disable-line no-eval
				} else {
					fnOriginal.apply(this, arguments);
				}
			} catch (oError){
				jQuery.sap.log.error("Error from setTimeout", oError);
			}
		};
		fnSetTimeout.apply(this, args);
	};

	window.addEventListener("unhandledrejection", function(oEvent) {
		jQuery.sap.log.error("Error from unhandledrejection", oEvent.reason);
	// Prevent error output on the console:
		oEvent.preventDefault();
	});

	window.onerror = function(oError) {
		jQuery.sap.log.error("Error from window.onerror", oError);
		return true;
	};


	/**
	 * @private
	 */
	ElementEnablementTest2.prototype._testActions = function(aTests, oData) {

		var aActions = [];
		var aActionsTests = [];
		var aAggregationsTests = [];
		var bActions = false;
		var bAggregations = false;
		var bChangeHandler = false;
		var sChangeType;
		var i = 0;

		if (!oData) {
			this.addTest(
				aTests,
				true,
				"No DT Metadata",
				BaseTest.STATUS.NOT_SUPPORTED
			);
		} else if (!oData.actions && !oData.aggregations) {
			this.addTest(
				aTests,
				true,
				"No Actions",
				BaseTest.STATUS.NOT_SUPPORTED
			);
		} else {
			if (oData.actions) {
				for (var sActions in oData.actions) {
					aActions[i] = sActions;
					aActionsTests[i] = this.addGroup(
						aTests,
						sActions
					);
					sChangeType = oData.actions[sActions].changeType || oData.actions[sActions];
					if (ChangeRegistry.getInstance().hasChangeHandlerForControlAndChange(this.getType(), sChangeType)) {
						this.addTest(
							aActionsTests[i].children,
							true,
							"self",
							BaseTest.STATUS.SUPPORTED
						);
					} else {
						this.addTest(
							aActionsTests[i].children,
							true,
							"No Change Handler",
							BaseTest.STATUS.NOT_SUPPORTED
						);
					}
					i = i + 1;
				}
				bActions = true;
			}

			if (oData.aggregations) {
				for (var sAggregation in oData.aggregations) {
					var oAggr = oData.aggregations[sAggregation];
					for (var sActions in oAggr.actions) {
						i = aActions.indexOf(sActions);
						sChangeType = oAggr.actions[sActions].changeType || oAggr.actions[sActions];
						bChangeHandler = ChangeRegistry.getInstance().hasChangeHandlerForControlAndChange(this.getType(), sChangeType);
						if (!bChangeHandler) {
							if (i === -1) {
								aActions.push(sActions);
								i = aActions.indexOf(sActions);
								aActionsTests[i] = this.addGroup(
									aTests,
									sActions
								);
								this.addTest(
									aActionsTests[i].children,
									true,
									"No Change Handler",
									BaseTest.STATUS.NOT_SUPPORTED
								);
							}
						} else if (i > -1) {
							aAggregationsTests[i] = (aAggregationsTests[i]) ? aAggregationsTests[i] : this.addGroup(
								aActionsTests[i].children,
								"in Aggregation"
							);
							this.addTest(
								aAggregationsTests[i].children,
								true,
								sAggregation,
								BaseTest.STATUS.SUPPORTED
							);
						} else {
							aActions.push(sActions);
							i = aActions.indexOf(sActions);
							aActionsTests[i] = this.addGroup(
								aTests,
								sActions
							);
							aAggregationsTests[i] = this.addGroup(
								aActionsTests[i].children,
								"in Aggregation"
							);
							this.addTest(
								aAggregationsTests[i].children,
								true,
								sAggregation,
								BaseTest.STATUS.SUPPORTED
							);
						}
						bAggregations = true;
					}
				}
			}

			if (!bActions && !bAggregations) {
				this.addTest(
					aTests,
					true,
					"No Actions",
					BaseTest.STATUS.NOT_SUPPORTED
				);
			}
		}
	};


	/**
	 * @private
	 */
	ElementEnablementTest2.prototype._testAggregations = function(aTests) {

		var mAggregationsTests = this.addGroup(
			aTests,
			"Overlay Checks"
		);


		if (this._bNoRenderer) {
			this.addTest(mAggregationsTests.children,
				true,
				"Control has no renderer",
				BaseTest.STATUS.UNKNOWN
			);
		} else if (this._bErrorDuringRendering) {

			this.addTest(mAggregationsTests.children,
				true,
				"Error during rendering",
				BaseTest.STATUS.ERROR
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
						"Overlay Visible"
					);

					if (mAggregationTestInfo.domRefDeclared){
						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefDeclared,
							"Dom Ref Declared"
						);

						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefFound,
							"Dom Ref Found"
						);

						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.domRefVisible,
							"Dom Ref Visible"
						);
					} else if (mAggregationTestInfo.overlayVisible) {
						this.addTest(mAggregationTest.children,
							mAggregationTestInfo.overlayGeometryCalculatedByChildren,
							"Overlay Geometry calculated by children",
							BaseTest.STATUS.PARTIAL_SUPPORTED
						);
					} else {
						this.addTest(mAggregationTest.children,
							false,
							"Overlay Dom Ref",
							BaseTest.STATUS.PARTIAL_SUPPORTED
						);
					}
					if (mAggregationTestInfo.overlayTooSmall) {
						this.addTest(mAggregationTest.children,
							false,
							"Overlay too small",
							BaseTest.STATUS.PARTIAL_SUPPORTED
						);
					}
				}
			}
		}
	};


	return ElementEnablementTest2;
}, /* bExport= */ true);
