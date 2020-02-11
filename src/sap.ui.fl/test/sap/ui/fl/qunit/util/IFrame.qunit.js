/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/fl/library",
	"sap/ui/fl/util/IFrame",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView"

], function(
	qutils,
	createAndAppendDiv,
	flexibleLibrary,
	IFrame,
	JSONModel,
	Core,
	XMLView
) {
	var sBlankUrl = "about:blank";
	var sProtocol = "https";
	var sFlavor = "openui5";
	var sServer = "hana.ondemand.com";
	var sOpenUI5Url = sProtocol + "://" + sFlavor + "." + sServer + "/";
	var sDefaultSize = "500px";
	var sUserFirstName = "John";
	var sUserLastName = "Doe";
	var sUserFullName = sUserFirstName + " " + sUserLastName;
	var sUserEmail = (sUserFirstName + "." + sUserLastName).toLowerCase() + "@sap.com";

	QUnit.module("Basic properties", {
		beforeEach : function () {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url
			});
		},
		afterEach : function () {
			this.oIFrame.destroy();
		}
	}, function () {
		QUnit.test("width", function (assert) {
			assert.equal(this.oIFrame.getWidth(), sDefaultSize, "Width is correct using 'equals()'!");
		});

		QUnit.test("height", function (assert) {
			assert.equal(this.oIFrame.getHeight(), sDefaultSize, "Height is correct using 'equals()'!");
		});

		QUnit.test("url", function (assert) {
			assert.equal(this.oIFrame.getUrl(), sOpenUI5Url, "Url is correct using 'equals()'!");
		});
	});

	QUnit.module("Visibility property set to false", {
		beforeEach : function() {
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				visible: false
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
		}
	}, function () {
		QUnit.test("IFrame should not be rendered", function (assert) {
			var $iframe = jQuery("#qunit-fixture iframe");
			assert.strictEqual($iframe.length, 0, "No iframe is being rendered");
		});
	});

	QUnit.module("Bindings", {
		beforeEach : function() {
			this.oIFrame = new IFrame({
				width: "{model>/width}",
				height: "{model>/height}",
				url: "{model>/protocol}://{model>/flavor}.{model>/server}/"
			});
			this.oModel = new JSONModel({
				width: sDefaultSize,
				height: sDefaultSize,
				protocol: sProtocol,
				flavor: "openui5",
				server: sServer
			});
			this.oIFrame.setModel(this.oModel, "model");
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oModel.destroy();
		}
	}, function () {
		QUnit.test("width", function (assert) {
			assert.equal(this.oIFrame.getWidth(), sDefaultSize, "Width is correct using 'equals()'!");
		});

		QUnit.test("height", function (assert) {
			assert.equal(this.oIFrame.getHeight(), sDefaultSize, "Height is correct using 'equals()'!");
		});

		QUnit.test("url", function (assert) {
			assert.equal(this.oIFrame.getUrl(), sOpenUI5Url, "Url is correct using 'equals()'!");
		});

		QUnit.test("url", function (assert) {
			assert.equal(this.oIFrame.getUrl(), sOpenUI5Url, "Url is correct using 'equals()'!");
		});

		QUnit.test("getFocusDomRef", function (assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var $iframe = jQuery("#qunit-fixture iframe");
			assert.strictEqual($iframe[0], oFocusDomRef, "Returns the iframe DOM element");
		});

		QUnit.test("URL should refresh if bound to a changing model without rewriting the iframe", function(assert) {
			var oFocusDomRef = this.oIFrame.getFocusDomRef();
			var sSapUI5Url = sProtocol + "://sapui5." + sServer + "/";

			this.oModel.setProperty("/flavor", "sapui5");
			sap.ui.getCore().applyChanges();

			assert.strictEqual(this.oIFrame.getUrl(), sSapUI5Url, "URL has changed to the expected one");
			assert.strictEqual(this.oIFrame.getFocusDomRef(), oFocusDomRef, "iframe DOM reference did not change");
			assert.strictEqual(oFocusDomRef.getAttribute("src"), sSapUI5Url, "iframe src has changed to the expected one");
		});
	});

	function mockUserInfoService (bEnabled, bNoEmail) {
		var oFormerUShell = sap.ushell;
		var fnGetService;
		if (bEnabled) {
			var vUserEmail;
			if (!bNoEmail) {
				vUserEmail = sUserEmail;
			}
			fnGetService = function (sServiceName) {
				if (sServiceName === "UserInfo") {
					return {
						getUser: function () {
							return {
								getEmail: function () { return vUserEmail; },
								getFullName: function () { return sUserFullName; },
								getFirstName: function () { return sUserFirstName; },
								getLastName: function () { return sUserLastName; }
							};
						}
					};
				}
			};
		} else {
			fnGetService = function () {
				return null;
			};
		}
		sap.ushell = {
			Container: {
				getService: fnGetService
			}
		};
		return {
			restore: function () {
				if (oFormerUShell) {
					sap.ushell = oFormerUShell;
				} else {
					delete sap.ushell;
				}
			}
		};
	}

	QUnit.module("UserInfo binding (UserInfo service available)", {
		beforeEach : function() {
			this.oUShellMock = mockUserInfoService(true);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), sOpenUI5Url + "?domain=sap.com", "URL is the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service available but no email)", {
		beforeEach : function() {
			this.oUShellMock = mockUserInfoService(true, /*bNoEmail*/ true);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), sOpenUI5Url + "?domain=", "URL is the expected one");
		});
	});

	QUnit.module("UserInfo binding (UserInfo service not available)", {
		beforeEach : function() {
			this.oUShellMock = mockUserInfoService(false);
			this.oIFrame = new IFrame({
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url + "?domain={$user>/domain}"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oIFrame.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("URL should not contain user information", function(assert) {
			assert.strictEqual(this.oIFrame.getUrl(), sOpenUI5Url + "?domain=", "URL is the expected one");
		});
	});

	QUnit.module("URL binding in XML view", {
		beforeEach : function (assert) {
			var done = assert.async();
			this.oUShellMock = mockUserInfoService(true);
			XMLView.create({
				definition: '<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.fl.util">' +
					'<IFrame id="iframe1" url="' + sOpenUI5Url + '" />' +
					'<IFrame id="iframe2" url="' + sOpenUI5Url + '?domain={$user>/domain}" />' +
					'<IFrame id="iframe3" url="' + sOpenUI5Url + '?domain={$user>/domain}&amp;{anyModel>/anyProperty}" />' +
					'<IFrame id="iframe4" url="{= \'' + sOpenUI5Url + '?domain=\' + ${$user>/domain} }" />' +
					'<IFrame id="iframe5" url="{= \'' + sOpenUI5Url + '?domain=\' + (${$user>/domain}.indexOf(\'sap.com\') !== -1 ? \'SAP\' : \'EXTERNAL\') }" />' +
				'</mvc:View>'
			}).then(function (oView) {
				this.myView = oView;
				this.myView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach : function () {
			this.myView.destroy();
			this.oUShellMock.restore();
		}
	}, function () {
		QUnit.test("Non bound URL should be kept as is", function(assert) {
			var iFrame = this.myView.byId("iframe1");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url, "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url, "Settings' URL is correct");
		});
		QUnit.test("Simple binding URL should be reverted back to binding in settings", function(assert) {
			var iFrame = this.myView.byId("iframe2");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url + "?domain=sap.com", "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain={$user>/domain}", "Settings' URL is correct");
		});
		QUnit.test("Simple binding URL (with unexpected reference) should be reverted back to binding in settings", function(assert) {
			var iFrame = this.myView.byId("iframe3");
			assert.strictEqual(iFrame.getUrl(), "", "Displayed URL is empty since the binding can't be resolved");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain={$user>/domain}&{anyModel>/anyProperty}", "Settings' URL is correct");
		});
		QUnit.test("Complex binding URL is 'converted' to simple binding ('simple' use case)", function(assert) {
			var iFrame = this.myView.byId("iframe4");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url + "?domain=sap.com", "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain={$user>/domain}", "Settings' URL is correct");
		});
		QUnit.test("Complex binding URL is 'converted' to simple binding ('advanced' use case)", function(assert) {
			var iFrame = this.myView.byId("iframe5");
			assert.strictEqual(iFrame.getUrl(), sOpenUI5Url + "?domain=SAP", "Displayed URL is correct");
			assert.strictEqual(iFrame.get_settings().url, sOpenUI5Url + "?domain=EXTERNAL", "Settings' URL looks corrupted");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
