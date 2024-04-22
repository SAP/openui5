/*global QUnit, sinon, hasher */
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/core/mvc/View",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/Router",
	"sap/ui/model/json/JSONModel",
	"sap/m/App"
], function (future, Log, View, HashChanger, Router, JSONModel, App) {
	"use strict";

	function createXmlView () {
		var sXmlViewContent = [
			'<View xmlns="sap.ui.core.mvc">',
			'</View>'
		].join('');

		var oViewOptions = {
			definition: sXmlViewContent,
			type: "XML"
		};

		return View.create(oViewOptions);
	}

	QUnit.module("title history", {
		beforeEach: function () {
			// reset hash
			HashChanger.getInstance().setHash("");

			this.oApp = new App();

			this.getRouteMatchedSpy = function (oRouteMatchedSpies, sRouteName) {
				oRouteMatchedSpies[sRouteName] = sinon.spy(this.oRouter.getRoute(sRouteName), "_routeMatched");
				return oRouteMatchedSpies;
			}.bind(this);

			this.oDefaults = {
				// only shells will be used
				controlAggregation: "pages",
				viewName: "foo",
				controlId: this.oApp.getId(),
				async: true
			};

			return createXmlView().then(function(oView) {
				this.fnCreateViewStub = sinon.stub(View, "create").callsFake(function () {
					return oView;
				});
			}.bind(this));
		},
		afterEach: function () {
			this.fnCreateViewStub.restore();
			this.oRouter.destroy();
			for (var sKey in this.oRouteMatchedSpies) {
				this.oRouteMatchedSpies[sKey].restore();
			}
		}
	});

	QUnit.test("title history", function(assert) {
		// Arrange
		var done = assert.async(),
			oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			sProductDetailTitle = "PRODUCT_DETAIL",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetail"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetail: {
				title: sProductDetailTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		var that = this;

		sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
		that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
			assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
			assert.deepEqual(oParameters.history, [], "history state is currently empty");
			// Act
			that.oRouter.navTo("product");
			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [{
					hash: "",
					title: sHomeTitle
				}], "history state is currently empty");
				// Act
				that.oRouter.navTo("productDetail");
				sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
				that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
					// Assert
					assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
					assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
					assert.equal(oParameters.history.length, 2, "history was updated only once");
					assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
						hash: "product",
						title: sProductTitle
					}, "history state is currently empty");
					// Act
					window.history.go(-1);
					that.oRouter.getRoute("product").attachMatched(function() {
						sinon.assert.calledTwice(that.oRouteMatchedSpies["product"]);
						that.oRouteMatchedSpies["product"].returnValues[1].then(function() {
							// Assert
							assert.strictEqual(fnEventSpy.callCount, 4, "titleChanged event is fired again");
							assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
							assert.equal(oParameters.history.length, 1, "history was updated only once");
							assert.deepEqual(oParameters.history, [{
								hash: "",
								title: sHomeTitle
							}], "history state is currently empty");
							done();
						});
					});
				});
			});
		});
	});

	QUnit.test("avoid title history redundancy", function(assert) {
		// Arrange
		var that = this,
			oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			sProductDetailTitle = "PRODUCT_DETAIL",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetail"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetail: {
				title: sProductDetailTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		return Promise.resolve().then(function() {

			// Act
			that.oRouter.initialize();

			sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
			return that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
				assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [], "history state is currently empty");
			});

		}).then(function() {

			// Act
			that.oRouter.navTo("product");

			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			return that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [{
					hash: "",
					title: sHomeTitle
				}], "history state is correctly updated");
			});

		}).then(function() {

			// Act
			that.oRouter.navTo("productDetail");

			sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
			return that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
				assert.equal(oParameters.history.length, 2, "history was updated only once");
				assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
					hash: "product",
					title: sProductTitle
				}, "history state is correctly updated");
			});

		}).then(function() {

			// Act
			that.oRouter.navTo("home");

			sinon.assert.calledTwice(that.oRouteMatchedSpies["home"]);
			return that.oRouteMatchedSpies["home"].returnValues[1].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 4, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
				assert.equal(oParameters.history.length, 2, "history was updated only once");
				assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
					hash: "productDetail",
					title: sProductDetailTitle
				}, "history state is correctly updated");
			});

		});
	});

	QUnit.test("Replace the last history instead of inserting new one when hash is replaced", function(assert) {
		// Arrange
		var oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			sProductDetailTitle = "PRODUCT_DETAIL",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetail"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetail: {
				title: sProductDetailTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		var that = this;

		sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
		return that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			// Assert
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired");
			assert.strictEqual(oParameters.title, sHomeTitle, "Did pass title value to the event parameters");
			assert.deepEqual(oParameters.history, [], "history state is currently empty");

			// Act
			that.oRouter.navTo("product");
			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			return that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				// Assert
				assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired again");
				assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
				assert.deepEqual(oParameters.history, [{
					hash: "",
					title: sHomeTitle
				}], "history state is correctly updated");

				// Act
				that.oRouter.navTo("productDetail", null, true);
				sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
				return that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
					// Assert
					assert.strictEqual(fnEventSpy.callCount, 3, "titleChanged event is fired again");
					assert.strictEqual(oParameters.title, sProductDetailTitle, "Did pass title value to the event parameters");
					assert.equal(oParameters.history.length, 1, "history was updated only once");
					assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
						hash: "",
						title: sHomeTitle
					}, "history state is correctly updated");
				});
			});
		});
	});

	QUnit.test("titleChanged event is fired before next navigation shouldn't create new history entry", function(assert) {
		// Arrange
		var oParameters,
			sHomeTitle = "homeTitle",
			sNewTitle = "newTitle",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			}),
			oModel = new JSONModel({
				title: sHomeTitle
			});

		this.oApp.setModel(oModel);

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			}
		};

		this.oTargetConfig = {
			home: {
				title: "{/title}"
			}
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		sinon.assert.calledOnce(this.oRouteMatchedSpies["home"]);
		return this.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			assert.ok(fnEventSpy.calledOnce, "titleChanged event is fired");
			assert.equal(oParameters.title, sHomeTitle, "title parameter is set");
			assert.equal(oParameters.history.length, 0, "No new history entry is created");
			assert.equal(this.oRouter._aHistory[0].title, sHomeTitle, "title is updated in title history stack");

			oModel.setProperty("/title", sNewTitle);
			assert.ok(fnEventSpy.calledTwice, "titleChanged event is fired again");
			assert.equal(oParameters.title, sNewTitle, "title parameter is set");
			assert.equal(oParameters.history.length, 0, "No new history entry is created");
			assert.equal(this.oRouter._aHistory[0].title, sNewTitle, "title is updated in title history stack");
		}.bind(this));
	});

	QUnit.test("Back navigation from target w/o title should not remove history entry", function(assert) {
		// Arrange
		var done = assert.async(),
			oParameters,
			sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			},
			productDetail : {
				pattern : "productDetail",
				target: "productDetailNoTitle"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			},
			productDetailNoTitle: {
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		var that = this;

		// Act
		that.oRouter.initialize();
		sinon.assert.calledOnce(that.oRouteMatchedSpies["home"]);
		return that.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			that.oRouter.navTo("product");
			sinon.assert.calledOnce(that.oRouteMatchedSpies["product"]);
			return that.oRouteMatchedSpies["product"].returnValues[0].then(function() {
				that.oRouter.navTo("productDetail");
				sinon.assert.calledOnce(that.oRouteMatchedSpies["productDetail"]);
				return that.oRouteMatchedSpies["productDetail"].returnValues[0].then(function() {
					assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event is fired twice");
					window.history.go(-1);

					// Assert
					that.oRouter.attachRouteMatched(function() {
						assert.strictEqual(fnEventSpy.callCount, 2, "titleChanged event isn't fired again");
						assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
						assert.equal(oParameters.history.length, 1, "history entry was not removed");
						assert.deepEqual(oParameters.history[oParameters.history.length - 1], {
							hash: "",
							title: sHomeTitle
						}, "history state is correctly updated");
						done();
					});
				});
			});
		});
	});

	QUnit.test("getTitleHistory", function(assert) {
		// Arrange
		var sHomeTitle = "HOME";

		this.oRouterConfig = {
			home: {
				pattern: "",
				target: "home"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			}
		};
		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);
		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		// Act
		this.oRouter.initialize();
		sinon.assert.calledOnce(this.oRouteMatchedSpies["home"]);
		return this.oRouteMatchedSpies["home"].returnValues[0].then(function() {
			// Assert
			var aHistoryRef = {
				hash: "",
				title: "HOME"
			};
			assert.deepEqual(this.oRouter.getTitleHistory()[0], aHistoryRef);
		}.bind(this));

	});

	QUnit.test("home route declaration", function(assert) {
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			done = assert.async(),
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home : {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oOwner = {
			getManifestEntry: function() {
				return "HOME";
			},
			getId: function() {
				return "component1";
			}
		};


		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);
		this.oRouter._oOwner = this.oOwner;
		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		// Act
		this.oRouter.initialize();

		return this.oRouteMatchedSpies["product"].returnValues[0].then(function() {
			// Assert
			var aHistoryRef = {
				hash: "",
				isHome: true,
				title: "HOME"
			};

			assert.deepEqual(this.oRouter.getTitleHistory()[0], aHistoryRef, "Home route attached to history.");
			assert.strictEqual(this.oRouter.getTitleHistory().length, 2, "Product route attached to history");
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired.");
			assert.strictEqual(oParameters.title, sProductTitle, "Did pass title value to the event parameters");
			assert.deepEqual(oParameters.history[oParameters.history.length - 1], aHistoryRef, "history state is correctly updated");
			done();

		}.bind(this));
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Home Route declaration with dynamic parts (future=false)", function(assert) {
		future.active = false;
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			oParameters,
			fnEventSpy = this.spy(function (oEvent) {
				oParameters = oEvent.getParameters();
			});

		this.oRouterConfig = {
			home : {
				pattern: "home/{testid}",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};
		this.spy = sinon.spy(Log, "error");

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		hasher.setHash(this.oRouterConfig.product.pattern);

		// Act
		this.oRouter.initialize();

		return this.oRouteMatchedSpies["product"].returnValues[0].then(function() {
			// Assert
			assert.ok(this.spy.calledWith(sinon.match(/Routes with dynamic parts cannot be resolved as home route./)));
			assert.strictEqual(oParameters.history.length, 0, "Home route shouldn't be added to history.");
			assert.deepEqual(this.oRouter.getTitleHistory()[0], {
				hash: "/product",
				title: "PRODUCT"
			}, "Product route is added to history.");
			assert.strictEqual(fnEventSpy.callCount, 1, "titleChanged event is fired.");
			assert.strictEqual(oParameters.title, sProductTitle, "Did pass product title value to the event parameters");
			this.spy.restore();
			future.active = undefined;
		}.bind(this));
	});

	QUnit.test("Home Route declaration with dynamic parts (future=true)", function (assert) {
		future.active = true;
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			fnEventSpy = this.spy();

		this.oRouterConfig = {
			home: {
				pattern: "home/{testid}",
				target: "home"
			},
			product: {
				pattern: "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		this.oRouteMatchedSpies = Object.keys(this.oRouterConfig).reduce(this.getRouteMatchedSpy, {});

		this.oRouter.attachTitleChanged(fnEventSpy);

		hasher.setHash(this.oRouterConfig.product.pattern);

		// Act
		// Assert
		assert.throws(() => { this.oRouter.initialize(); }, new Error("Routes with dynamic parts cannot be resolved as home route."),
			"Throws error because home route cannot contain dynamic parts");
		assert.strictEqual(fnEventSpy.callCount, 0, "titleChanged event isn't fired.");
		future.active = undefined;
	});

	QUnit.test("App home indicator for later navigations", function(assert) {
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			done = assert.async();

		this.oRouterConfig = {
			home : {
				pattern: "",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter.attachTitleChanged(function(oEvent) {

			if (hasher.getHash() !== this.oRouterConfig.home.pattern) {
				hasher.setHash(this.oRouterConfig.home.pattern);
			} else {
				// Assert
				assert.strictEqual(arguments[0].mParameters.history.length, 2, "Home and Product route should be added to history.");
				assert.strictEqual(arguments[0].mParameters.isHome, true);
				assert.strictEqual(arguments[0].mParameters.history[0].isHome, true);
				assert.strictEqual(this.oRouter.getTitleHistory()[0].isHome, true);
				done();
			}

		}.bind(this));

		// Act
		this.oRouter.initialize();
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("App home indicator for later navigations with dynamic parts (future=false)", function(assert) {
		future.active = false;
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT",
			done = assert.async();

		this.oRouterConfig = {
			home : {
				pattern: "home/{testId}",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		hasher.setHash(this.oRouterConfig.product.pattern);

		this.oRouter.attachTitleChanged(function() {

			var oRefProductRoute = {
				"hash": "/product",
				"title": "PRODUCT"
			};

			var oRefHomeRoute = {
				"hash": "home/{testId}",
				"title": "HOME"
			};

			if (hasher.getHash() !== this.oRouterConfig.home.pattern) {
				hasher.setHash(this.oRouterConfig.home.pattern);
			} else {
				// Assert
				assert.strictEqual(arguments[0].mParameters.history.length, 1, "Product route should be added to history.");
				assert.deepEqual(this.oRouter.getTitleHistory()[0], oRefProductRoute);
				assert.deepEqual(this.oRouter.getTitleHistory()[1], oRefHomeRoute);
				assert.strictEqual(this.oRouter.getTitleHistory().length, 2, "Home route should be added to history.");
				future.active = undefined;
				done();
			}
		}.bind(this));

		// Act
		this.oRouter.initialize();
	});

	QUnit.test("App home indicator for later navigations with dynamic parts (future=true)", function(assert) {
		future.active = true;
		// Arrange
		var sHomeTitle = "HOME",
			sProductTitle = "PRODUCT";

		this.oRouterConfig = {
			home : {
				pattern: "home/{testId}",
				target: "home"
			},
			product : {
				pattern : "/product",
				target: "product"
			}
		};

		this.oTargetConfig = {
			home: {
				title: sHomeTitle
			},
			product: {
				title: sProductTitle
			}
		};

		this.oDefaults = {
			// only shells will be used
			controlAggregation: "pages",
			viewName: "foo",
			controlId: this.oApp.getId(),
			homeRoute: "home",
			async: true
		};

		this.oRouter = new Router(this.oRouterConfig, this.oDefaults, null, this.oTargetConfig);

		hasher.setHash(this.oRouterConfig.product.pattern);

		// Act
		// Assert
		assert.throws(() => { this.oRouter.initialize(); }, new Error("Routes with dynamic parts cannot be resolved as home route."),
			"Throws error because home route cannot contain dynamic parts");
	});
});
