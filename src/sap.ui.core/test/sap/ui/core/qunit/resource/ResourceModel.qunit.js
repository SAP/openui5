sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/Device",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Supportability",
	"sap/ui/model/BindingMode",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/testlib/TestButton"
], function(Log, Localization, ResourceBundle, Device, SyncPromise, Supportability, BindingMode,
		ResourceModel, TestButton) {
	/*global sinon, QUnit*/
	/*eslint no-new: 0 */
	"use strict";

	var sClassname = "sap.ui.model.resource.ResourceModel",
		sDefaultLanguage = Localization.getLanguage();

	var oModel, oLabel, oLabel2,
		sCustomMessagesProperties
			= "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
		sMessagesProperties = "test-resources/sap/ui/core/qunit/testdata/messages.properties",
		sOtherMessagesProperties
			= "test-resources/sap/ui/core/qunit/testdata/messages_other.properties";

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle loaded via name", {
		beforeEach: function() {
			Localization.setLanguage("en");
			oModel = new ResourceModel({bundleName: "testdata.messages"});
		},
		afterEach: function() {
			oModel.destroy();
			oModel = undefined;
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//model created
	QUnit.test("Model instantiated successful", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{TEST_TEXT}"});
		oLabel.placeAt("qunit-fixture");

		assert.ok(oModel, "model must exist after creation");
		assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");
		oLabel.destroy();
	});

	//setProperty must not exist!
	QUnit.test("set Property must have no effect", function(assert) {
		assert.ok(!oModel.setProperty, "set Property method should not be defined");
	});

	//getProperty()/binding
	QUnit.test("test model getProperty and via binding", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{TEST_TEXT}"});
		oLabel.placeAt("qunit-fixture");
		oLabel.setModel(oModel);
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
		assert.equal(oLabel.getText(), "A text en");
		oLabel.destroy();
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: "
			+ "Resources bundle loaded via name / set Model with alias", {
		beforeEach: function() {
			Localization.setLanguage("en");
			oModel = new ResourceModel({bundleName: "testdata.messages"});
		},
		afterEach: function() {
			oModel.destroy();
			oModel = undefined;
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//model created
	QUnit.test("Model instantiated successful", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("qunit-fixture");

		assert.ok(oModel, "model must exist after creation");
		assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");
		oLabel.destroy();
	});

	//setProperty must not exist!
	QUnit.test("set Property must have no effect", function(assert) {
		assert.ok(!oModel.setProperty, "set Property method should not be defined");
	});

	//getProperty()/binding
	QUnit.test("test model getProperty and via binding", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("qunit-fixture");
		oLabel.setModel(oModel, "i18n");
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
		assert.equal(oLabel.getText(), "A text en");
		oLabel.destroy();
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle loaded via url", {
		beforeEach: function() {
			Localization.setLanguage("en");
			this.stub(Supportability, "collectOriginInfo").returns(true);
			oModel = new ResourceModel({bundleUrl: sMessagesProperties});
		},
		afterEach: function() {
			oModel.destroy();
			oModel = undefined;
			Localization.setLanguage(sDefaultLanguage);
		}
	});
	//model created
	QUnit.test("Model instantiated successful", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("qunit-fixture");

		assert.ok(oModel, "model must exist after creation");
		assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");

		assert.ok(oModel.mSupportedBindingModes.OneWay, "OneWay is an allowed binding mode");
		assert.ok(!oModel.mSupportedBindingModes.TwoWay, "TwoWay is a not an allowed binding mode");
		assert.ok(!oModel.bAsync && oModel.mSupportedBindingModes.OneTime, "OneTime is an allowed binding mode with synchronous models");

		oLabel.destroy();
	});
	//setProperty must not exist!
	QUnit.test("set Property must have no effect", function(assert) {
		assert.ok(!oModel.setProperty, "set Property method should not be defined");
	});
	//getProperty()/binding
	QUnit.test("test model getProperty and via binding", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("qunit-fixture");
		oLabel.setModel(oModel, "i18n");
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
		assert.equal(oLabel.getText(), "A text en");
		oLabel.destroy();
	});
	//CompositeBinding
	QUnit.test("test composite bindings", function(assert) {
		oLabel2 = new TestButton("myLabel2", {text: {parts: [{path: "i18n>TEST_TEXT"}, {path: "i18n>TEST_TEXT"}]}});
		oLabel2.placeAt("qunit-fixture");
		oLabel2.setModel(oModel, "i18n");

		assert.ok(oLabel2, "Label with composite binding must be created");
		assert.equal(oLabel2.getText(), "A text en A text en", "Text msut be: 'A text en A text en'");
		oLabel2.destroy();
	});
	//origin info
	QUnit.test("test model origin info", function(assert) {
		var value = oModel.getProperty("TEST_TEXT"),
			info = value.originInfo;
		assert.equal(info.source, "Resource Bundle");
		assert.equal(info.url, sMessagesProperties);
		assert.equal(info.key, "TEST_TEXT");
	});

	QUnit.test("Model instantiated successfully, named model", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.setModel(oModel, "i18n");
		var oClone = oLabel.clone();
		assert.equal(oLabel.getModel("i18n"), oModel, "model must exist in origin (precondition)");
		assert.equal(oClone.getModel("i18n"), oModel, "model must be the same for a clone");
		oLabel.destroy();
		oClone.destroy();
		oModel.destroy();
	});

	QUnit.test("Model instantiated successfully, cloned before named model is set", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		var oClone = oLabel.clone();
		oClone.setModel(oModel, "i18n");
		assert.equal(oClone.getText(), "A text en", "binding must lead to the expected result after a clone");
		oLabel.destroy();
		oClone.destroy();
		oModel.destroy();
	});

	QUnit.test("Model enhancement", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
		oModel.enhance({bundleUrl: sCustomMessagesProperties});
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
	});

	QUnit.test("Model enhancement (with bundle)", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
		var oBundle = ResourceBundle.create({url: sCustomMessagesProperties});
		oModel.enhance(oBundle);
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle passed as parameter", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		prepare: function(opts) {
			// Load the bundle beforehand
			this.oBundle = ResourceBundle.create({url: sMessagesProperties});

			// Create the model with the existing bundle
			this.oModel = new ResourceModel({
				bundle: this.oBundle,
				enhanceWith: opts && opts.enhanceWith
			});
		},
		afterEach: function() {
			this.oBundle = null;
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Basic", function(assert) {
		this.prepare();

		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");

	});

	QUnit.test("Model enhancement", function(assert) {
		this.prepare();

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

		this.oModel.enhance({bundleUrl: sCustomMessagesProperties});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		this.oModel.enhance({bundleUrl: sOtherMessagesProperties});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
	});

	QUnit.test("Model enhancement (with bundle)", function(assert) {
		this.prepare();

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

		var oCustomBundle = ResourceBundle.create({url: sCustomMessagesProperties});
		this.oModel.enhance(oCustomBundle);

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		oCustomBundle = ResourceBundle.create({url: sOtherMessagesProperties});
		this.oModel.enhance(oCustomBundle);

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
	});

	QUnit.test("Model enhancement (constructor)", function(assert) {

		// ensure that the order is guaranteed how the texts are enhanced:
		// the latter bundles override the texts of the first ones
		this.prepare({
			enhanceWith: [{bundleUrl: sCustomMessagesProperties}, {bundleUrl: sOtherMessagesProperties}]
		});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
	});

	QUnit.test("Binding", function(assert) {
		this.prepare();

		var oButton = new TestButton({
			text: "{i18n>TEST_TEXT}"
		});
		oButton.setModel(this.oModel, "i18n");

		assert.equal(oButton.getText(), "A text en", "Texts available immediately");

		oButton.destroy();
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle passed as parameter -"
			+ "Language change on enhanced model", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		prepare: function(opts) {
			// Load the bundle beforehand
			if (opts && typeof opts.bundle === "function") {
				this.oBundle = opts.bundle.apply(this);
			} else {
				this.oBundle = ResourceBundle.create({url: sMessagesProperties});
			}

			if (opts && typeof opts.model === "function") {
				this.oModel = opts.model.apply(this);
			} else {
				// Create the model with the existing bundle
				this.oModel = new ResourceModel({
					bundle: this.oBundle
				});
			}

			this.oButton = new TestButton({
				text: "{i18n>TEST_TEXT}"
			});
			// localizationChange is only fired on models set to a ManagedObject
			this.oButton.setModel(this.oModel, "i18n");

			// Spy on "localizationChange" method
			this.localizationChangeSpy = this.spy(this.oModel, "_handleLocalizationChange");
		},
		testEnhanceAndLanguageChange: function(assert) {
			assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			this.oModel.enhance({bundleUrl: sCustomMessagesProperties});

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

			Localization.setLanguage("de");

			assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
			assert.notEqual(this.oModel.getResourceBundle(), this.oBundle, "A new bundle has been created");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are now in 'de'");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are now in 'de'");
		},
		testEnhanceAndLanguageChangeWithFixedLocale: function(assert) {
			assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

			this.oModel.enhance({bundleUrl: sCustomMessagesProperties, bundleLocale: "de"});

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

			Localization.setLanguage("it");

			assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
			assert.notEqual(this.oModel.getResourceBundle(), this.oBundle, "A new bundle has been created");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");
		},
		afterEach: function() {
			this.oButton.destroy();
			this.oBundle = null;
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("bundle", function(assert) {
		this.prepare();

		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

		this.oModel.enhance({bundleUrl: sCustomMessagesProperties});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		Localization.setLanguage("de");

		assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
		assert.notEqual(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is recreated");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts are in 'de'");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text");
	});

	QUnit.test("bundle, bundleUrl", function(assert) {
		this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleUrl to allow re-loading the bundle on localizationChange
					bundleUrl: sMessagesProperties
				});
			}
		});

		this.testEnhanceAndLanguageChange(assert);
	});

	QUnit.test("bundle, bundleName", function(assert) {
		this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleName to allow re-loading the bundle on localizationChange
					bundleName: "testdata.messages"
				});
			}
		});

		this.testEnhanceAndLanguageChange(assert);
	});

	QUnit.test("bundle, bundleName, bundleUrl", function(assert) {
		this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleName and bundleUrl to allow re-loading the bundle on localizationChange
					// "bundleUrl" should be ignored as "bundleName" is present
					bundleName: "testdata.messages",
					bundleUrl: "should be ignored!"
				});
			}
		});

		this.testEnhanceAndLanguageChange(assert);
	});

	QUnit.test("bundle, bundleLocale", function(assert) {
		this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de"
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Locale should not be used at all as there is no "bundleName" or "bundleUrl"
					bundleLocale: "de"
				});
			}
		});

		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

		this.oModel.enhance({bundleUrl: sCustomMessagesProperties, bundleLocale: "de"});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		Localization.setLanguage("it");

		assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");
	});

	QUnit.test("bundle, bundleLocale, bundleUrl", function(assert) {
		this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de"
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleUrl and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleUrl: sMessagesProperties
				});
			}
		});

		this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
	});

	QUnit.test("bundle, bundleLocale, bundleName", function(assert) {
		this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de"
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleName and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleName: "testdata.messages"
				});
			}
		});

		this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
	});

	QUnit.test("bundle, bundleLocale, bundleName, bundleUrl)", function(assert) {
		this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de"
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleUrl, bundleName and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleName: "testdata.messages",
					bundleUrl: sMessagesProperties
				});
			}
		});

		this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Async -"
			+ "Resources bundle passed as parameter", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		prepare: function(opts) {
			// Load the bundle beforehand
			return ResourceBundle.create({
				url: sMessagesProperties,
				async: true
			}).then(function (oBundle) {
				this.oBundle = oBundle;

				// Create the model with the existing bundle
				this.oModel = new ResourceModel({
					bundle: this.oBundle,
					enhanceWith: opts && opts.enhanceWith,
					async: true
				});

			}.bind(this));
		},
		afterEach: function() {
			this.oBundle = null;
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Basic", function(assert) {
		return this.prepare().then(function () {
			var pBundle = this.oModel.getResourceBundle();
			assert.ok(pBundle instanceof Promise, "getResourceBundle returns a Promise");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are already available");

			return pBundle.then(function (oModelBundle) {
				assert.equal(oModelBundle, this.oBundle, "The passed bundle is returned by the model");
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Model enhancement", function(assert) {
		return this.prepare().then(function () {

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({bundleUrl: sCustomMessagesProperties});

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT is still the same after calling enhance");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM is still the same after calling enhance");

			assert.ok(pEnhance instanceof Promise, "enhance returns a Promise");

			return pEnhance.then(function () {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Model enhancement (with bundle)", function(assert) {
		return this.prepare().then(function () {

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			return ResourceBundle.create({
				url: sCustomMessagesProperties,
				async: true
			}).then(function (oCustomBundle) {

				this.oModel.enhance(oCustomBundle);

				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Model enhancement (constructor)", function(assert) {

		// ensure that the order is guaranteed how the texts are enhanced:
		// the latter bundles override the texts of the first ones
		return this.prepare({
			enhanceWith: [{bundleUrl: sCustomMessagesProperties}, {bundleUrl: sOtherMessagesProperties}]
		}).then(function () {
			return this.oModel._pEnhanced;
		}.bind(this)).then(function () {
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
			assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
		}.bind(this));

	});

	QUnit.test("Binding", function(assert) {
		return this.prepare().then(function () {

			var oButton = new TestButton({
				text: "{i18n>TEST_TEXT}"
			});
			oButton.setModel(this.oModel, "i18n");

			assert.equal(oButton.getText(), "A text en", "Texts available immediately");

			oButton.destroy();
		}.bind(this));
	});

	QUnit.module("sap.ui.model.resource.ResourceModel Async: Resources bundle passed as parameter -"
			+ " Language change on enhanced model", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		prepare: function(opts) {
			// Load the bundle beforehand
			var p;
			if (opts && typeof opts.bundle === "function") {
				p = opts.bundle.apply(this);
			} else {
				p = ResourceBundle.create({
					url: sMessagesProperties,
					async: true
				});
			}
			this.oButton = new TestButton({
				text: "{i18n>TEST_TEXT}"
			});

			return p.then(function (oBundle) {
				this.oBundle = oBundle;
				if (opts && typeof opts.model === "function") {
					this.oModel = opts.model.apply(this);
				} else {
					// Create the model with the existing bundle
					this.oModel = new ResourceModel({
						bundle: this.oBundle,
						async: true
					});
				}

				// localizationChange is only fired on models set to a ManagedObject
				this.oButton.setModel(this.oModel, "i18n");

				// Spy on "localizationChange" method
				this.localizationChangeSpy = this.spy(this.oModel, "_handleLocalizationChange");
				this.oRecreateSpy = this.spy(oBundle, "_recreate");
			}.bind(this));
		},
		testEnhanceAndLanguageChange: function(assert) {
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({bundleUrl: sCustomMessagesProperties});

			return pEnhance.then(function () {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

				Localization.setLanguage("de");

				assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");

				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle should still be in 'en'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "Texts from enhancement are still in 'en'");

				return this.oModel.getResourceBundle();
			}.bind(this)).then(function () {
				return this.oRecreateSpy.getCall(0).returnValue;
			}.bind(this)).then(function () {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are now in 'de'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "Texts from enhancement are now in 'de'");
			}.bind(this));
		},
		testEnhanceAndLanguageChangeWithFixedLocale: function(assert) {
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({
				bundleUrl: sCustomMessagesProperties,
				bundleLocale: "de"
			});

			return pEnhance.then(function () {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

				Localization.setLanguage("it");

				assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");

				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");

				return this.oModel.getResourceBundle();
			}.bind(this)).then(function (oModelBundle) {
				return this.oRecreateSpy.getCall(0).returnValue;
			}.bind(this)).then(function () {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "Texts from enhancement are still in 'de'");
			}.bind(this));
		},
		afterEach: function() {
			this.oBundle = null;
			if (this.oButton) {
				this.oButton.destroy();
			}
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("bundle", function(assert) {
		return this.prepare().then(function () {
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({bundleUrl: sCustomMessagesProperties});

			return pEnhance.then(function () {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

				Localization.setLanguage("de");

				assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are still in 'en'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "Texts from enhancement are still in 'en'");

				return this.oModel.getResourceBundle();
			}.bind(this)).then(function () {
				return this.oRecreateSpy.getCall(0).returnValue;
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("bundle, bundleUrl", function(assert) {
		return this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					async: true,
					// Also provide bundleUrl to allow re-loading the bundle on localizationChange
					bundleUrl: sMessagesProperties
				});
			}
		}).then(function () {
			return this.testEnhanceAndLanguageChange(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleName", function(assert) {
		return this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					async: true,
					// Also provide bundleName to allow re-loading the bundle on localizationChange
					bundleName: "testdata.messages"
				});
			}
		}).then(function () {
			return this.testEnhanceAndLanguageChange(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleName, bundleUrl", function(assert) {
		return this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					async: true,
					// Also provide bundleName and bundleUrl to allow re-loading the bundle on localizationChange
					// "bundleUrl" should be ignored as "bundleName" is present
					bundleName: "testdata.messages",
					bundleUrl: "should be ignored!"
				});
			}
		}).then(function () {
			return this.testEnhanceAndLanguageChange(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleLocale", function(assert) {

		// Load bundle beforehand
		var oBundle = ResourceBundle.create({
			url: sMessagesProperties,
			locale: "de"
		});

		// Create the model with the existing bundle
		var oModel = new ResourceModel({
			bundle: oBundle,
			async: true,
			// Locale should not be used at all as there is no "bundleName" or "bundleUrl"
			bundleLocale: "de"
		});

		const oButton = new TestButton({
			text: "{i18n>TEST_TEXT}"
		});
		// localizationChange is only fired on models set to a ManagedObject
		oButton.setModel(oModel, "i18n");

		// Spy on "localizationChange" method
		var localizationChangeSpy = this.spy(oModel, "_handleLocalizationChange");

		assert.equal(oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

		var pEnhance = oModel.enhance({bundleUrl: sCustomMessagesProperties, bundleLocale: "de"});

		return pEnhance.then(function () {
			assert.equal(oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

			Localization.setLanguage("it");

			assert.equal(localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");

			assert.equal(oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");

			return oModel.getResourceBundle();
		}).then(function (oModelBundle) {
			assert.equal(oModelBundle, oBundle, "The passed bundle is still returned by the model");

			oButton.destroy();
			oModel.destroy();
			Localization.setLanguage("en");
		});
	});

	QUnit.test("bundle, bundleLocale, bundleUrl", function(assert) {
		return this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de",
					async: true
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					async: true,
					// Also provide bundleUrl and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleUrl: sMessagesProperties
				});
			}
		}).then(function () {
			return this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleLocale, bundleName", function(assert) {
		return this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de",
					async: true
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					async: true,
					// Also provide bundleName and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleName: "testdata.messages"
				});
			}
		}).then(function () {
			return this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleLocale, bundleName, bundleUrl", function(assert) {
		return this.prepare({
			bundle: function() {
				return ResourceBundle.create({
					url: sMessagesProperties,
					locale: "de",
					async: true
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					async: true,
					// Also provide bundleUrl, bundleName and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleName: "testdata.messages",
					bundleUrl: sMessagesProperties
				});
			}
		}).then(function () {
			return this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
		}.bind(this));
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Async", {
		beforeEach: function() {
			Localization.setLanguage("en");
			oLabel = new TestButton("myLabel", {text: "{async>TEST_TEXT}"});
			oLabel.placeAt("qunit-fixture");
			oLabel2 = new TestButton("myLabel2", {text: "{async>TEST_TEXT}"});
			oLabel2.placeAt("qunit-fixture");
			oModel = new ResourceModel({bundleName: "testdata.messages", async: true});
			oLabel.setModel(oModel, "async");
			oLabel2.setModel(oModel, "async");
		},
		afterEach: function() {
			oModel.destroy();
			oModel = undefined;
			oLabel.destroy();
			oLabel2.destroy();
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//we can't run this test in firefox properly as then is called synchronously in firefox
	if (!Device.browser.firefox) {
		QUnit.test("Test async mode", function(assert) {
			assert.ok(oModel, "model must exist after creation");
			assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");

			assert.ok(oModel.bAsync, "model is in async mode");
			assert.equal(oModel.sDefaultBindingMode, BindingMode.OneWay, "Default binding mode is OneWay");
			assert.ok(oModel.mSupportedBindingModes.OneWay, "OneWay is an allowed binding mode");
			assert.ok(!oModel.mSupportedBindingModes.TwoWay, "TwoWay is a not an allowed binding mode");
			assert.ok(oModel.bAsync && !oModel.mSupportedBindingModes.OneTime, "OneTime is a not allowed binding mode with asynchronous models");

			assert.equal(oLabel.getText(), "", "Initially no texts available");
			assert.equal(oModel.getProperty("TEST_TEXT"), null, "Initially getProperty returns null");

			var oPromise = oModel.getResourceBundle();
			assert.ok(oPromise instanceof Promise, "getResourceBundle returns Promise");

			return oPromise.then(function (oBundle) {
				assert.equal(oLabel.getText(), "A text en", "Texts available after async load");
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "getProperty returns text after async load");
				assert.ok(oBundle == oModel._oResourceBundle, "A text en", "Bundle available after async load");
			});
		});
	}
	QUnit.test("Enhancement after load", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");

		return oModel.getResourceBundle().then(function (/* ignored oBundle */) {
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
			var oPromise = oModel.enhance({bundleUrl: sCustomMessagesProperties});
			return oPromise.then(function () {
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
			});
		});
	});

	QUnit.test("Enhancement after load (with bundle)", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");

		return oModel.getResourceBundle().then(function (/* ignored oBundle */) {
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
			var oBundle = ResourceBundle.create({url: sCustomMessagesProperties});
			var oPromise = oModel.enhance(oBundle);
			return oPromise.then(function () {
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
			});
		});
	});

	QUnit.test("Enhancement before load", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");
		var oPromise = oModel.enhance({bundleUrl: sCustomMessagesProperties});
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "text TEST_TEXT of enhanced model is still null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "text TEST_TEXT_CUSTOM of enhanced model is still null");

		return Promise.all([oModel.getResourceBundle(), oPromise]).then(function () {
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct after async load");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct after async load");
		});
	});

	//we can't run this test in firefox properly as then is called synchronously in firefox
	if (!Device.browser.firefox) {
		QUnit.test("Enhancement before load (with bundle)", function(assert) {
			assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");
			var oBundle = ResourceBundle.create({url: sCustomMessagesProperties});
			var oPromise = oModel.enhance(oBundle);
			assert.equal(oModel.getProperty("TEST_TEXT"), null, "text TEST_TEXT of enhanced model is still null");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "text TEST_TEXT_CUSTOM of enhanced model is still null");

			return Promise.all([oModel.getResourceBundle(), oPromise]).then(function () {
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct after async load");
				assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct after async load");
			});
		});
	}

	QUnit.test("Events", function(assert) {
		var done = assert.async();
		assert.equal(oLabel2.getText(), "", "Initially no texts available");
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "Initially getProperty returns null");

		oLabel2.getBinding("text").attachChange(function() {
			assert.equal(oLabel2.getText(), "A text en", "Binding Change: Texts available after async load");
		});

		oModel.attachRequestCompleted(function() {
			assert.equal(oLabel2.getText(), "A text en", "RequestCompleted: Texts available after async load");
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "RequestCompleted: getProperty returns text after async load");
			done();
		});
	});


	QUnit.test("OneWay Binding and Language Change (Asynchronous)", function(assert) {
		var done = assert.async();
		var oBtn = new TestButton({
			text: "{async5>TEST_TEXT}"
		});
		oBtn.placeAt("qunit-fixture");

		var oAsyncModel = new ResourceModel({
			bundleName: "testdata.messages",
			async: true
		});
		oBtn.setModel(oAsyncModel, "async5");


		var iChangeCount = 0;
		oBtn.getBinding("text").attachChange(function() {
			if (iChangeCount++ === 0) {
				assert.equal(oBtn.getText(), "A text en", "Binding Change: Texts available after sync load");
				Localization.setLanguage("de");
			} else {
				assert.equal(oBtn.getText(), "Ein Text de", "Binding Change: Texts available after sync load");
				oBtn.destroy();
				oAsyncModel.destroy();
				done();
			}
		});

	});

	QUnit.test("OneWay Binding and Language Change (Synchronous)", function(assert) {
		Localization.setLanguage("en");

		var oBtn = new TestButton({
			text: "{sync5>TEST_TEXT}"
		});
		oBtn.placeAt("qunit-fixture");

		var oSyncModel = new ResourceModel({
			bundleName: "testdata.messages",
			async: false
		});
		oBtn.setModel(oSyncModel, "sync5");

		assert.equal(oBtn.getText(), "A text en", "Binding Change: Texts available after sync load");
		Localization.setLanguage("de");

		assert.equal(oBtn.getText(), "Ein Text de", "Binding Change: Texts available after sync load");
		oBtn.destroy();
		oSyncModel.destroy();

	});

	QUnit.module("sap.ui.model.resource.ResourceModel: constructor enhanceWith parameter", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Model enhancement with bundleUrl and enhanceWith with configurations",
			function(assert) {
		// code under test
		var oModel = new ResourceModel({
				bundleUrl: sMessagesProperties,
				bundleLocale: "en",
				enhanceWith: [{
					bundleUrl: sCustomMessagesProperties
				}, {
					bundleUrl: sOtherMessagesProperties
				}]
			});

		// assertions
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en",
			"text TEST_TEXT of enhanced model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text",
			"text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(oModel.getProperty("TEST_TEXT_OTHER"), "Another text",
			"text TEST_TEXT_OTHER of enhanced model is correct");

		// cleanup
		oModel.destroy();
	});

	QUnit.test("Model enhancement with bundleUrl and enhanceWith with configurations async",
			function(assert) {
		// code under test
		var oModel = new ResourceModel({
				bundleUrl: sMessagesProperties,
				bundleLocale: "en",
				enhanceWith: [
					{bundleUrl: sCustomMessagesProperties},
					{bundleUrl: sOtherMessagesProperties}
				],
				async: true
			});

		return oModel.getResourceBundle().then(function () {
			// assertions
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en",
				"text TEST_TEXT of enhanced model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text",
				"text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
			assert.equal(oModel.getProperty("TEST_TEXT_OTHER"), "Another text",
				"text TEST_TEXT_OTHER of enhanced model is correct");

			// cleanup
			oModel.destroy();
		});
	});

	QUnit.test("Model enhancement with bundleUrl and enhanceWith with ResourceBundles",
			function(assert) {
		// code under test
		var oModel = new ResourceModel({
				bundleUrl: sMessagesProperties,
				bundleLocale: "en",
				enhanceWith: [
					ResourceBundle.create({
						locale: "en",
						bundleUrl: sCustomMessagesProperties
					}),
					ResourceBundle.create({
						locale: "en",
						bundleUrl: sOtherMessagesProperties
					})
				]
			});

		// assertions
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en",
			"text TEST_TEXT of enhanced model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text",
			"text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(oModel.getProperty("TEST_TEXT_OTHER"), "Another text",
			"text TEST_TEXT_OTHER of enhanced model is correct");

		// cleanup
		oModel.destroy();
	});

	QUnit.test("Model enhancement with bundleUrl and enhanceWith with ResourceBundles async",
			function(assert) {
		// code under test
		var oModel = new ResourceModel({
				bundleUrl: sMessagesProperties,
				bundleLocale: "en",
				enhanceWith: [
					ResourceBundle.create({
						locale: "en",
						bundleUrl: sCustomMessagesProperties
					}),
					ResourceBundle.create({
						locale: "en",
						bundleUrl: sOtherMessagesProperties
					})
				],
				async: true
			});

		return oModel._pEnhanced.then(function () {
			// assertions
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en",
				"text TEST_TEXT of enhanced model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text",
				"text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
			assert.equal(oModel.getProperty("TEST_TEXT_OTHER"), "Another text",
				"text TEST_TEXT_OTHER of enhanced model is correct");

			// cleanup
			oModel.destroy();
		});
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: constructor enhanceWith error handling", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("invalid parameter terminologies async", function(assert) {
		var oBundle = ResourceBundle.create({
				locale: "en",
				bundleUrl: sMessagesProperties
			}),
			oModel;

		// code under test
		oModel = new ResourceModel({
			bundle: oBundle,
			enhanceWith: [
				{bundleUrl: sCustomMessagesProperties},
				{bundleUrl: sOtherMessagesProperties, terminologies: {}}
			],
			async: true
		});

		return oModel._pEnhanced.then(function () {
			assert.ok(false, "Should not reach this code");

			// cleanup
			oModel.destroy();
		}, function (oError) {
			assert.equal(oError.message, "'terminologies' parameter is not supported for enhancement");

			// cleanup
			oModel.destroy();
		});
	});

	QUnit.test("invalid parameter terminologies in enhanceWith with parameter bundle", function(assert) {
		var oBundle = ResourceBundle.create({
				locale: "en",
				bundleUrl: sMessagesProperties
			});

		// code under test
		assert.throws(function () {
			new ResourceModel({
				bundle: oBundle,
				enhanceWith: [
					{bundleUrl: sCustomMessagesProperties},
					{bundleUrl: sOtherMessagesProperties, terminologies: {}}
				]
			});
		},
		Error("'terminologies' parameter is not supported for enhancement"),
		"'terminologies' parameter is not supported for enhancement");
	});

	QUnit.test("invalid parameter terminologies with enhanceWith containing bundles", function(assert) {
		var oBundle = ResourceBundle.create({
			locale: "en",
			bundleUrl: sCustomMessagesProperties
		});

		// code under test
		assert.throws(function () {
			new ResourceModel({
				bundleUrl: sMessagesProperties,
				terminologies: {},
				enhanceWith: [
					oBundle
				]
			});
		},
		Error("'terminologies' parameter and 'activeTerminologies' parameter are not supported in configuration when enhanceWith contains ResourceBundles"),
		"correct error message");
	});


	QUnit.module("sap.ui.model.resource.ResourceModel: enhance error handling", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("invalid parameter terminologies async", function(assert) {
		var oBundle = ResourceBundle.create({
				locale: "en",
				bundleUrl: sMessagesProperties
			}),
			oResourceModel = new ResourceModel({
				bundle: oBundle,
				async: true
			});

		// code under test
		assert.throws(function () {
			oResourceModel.enhance({bundleUrl: sOtherMessagesProperties, terminologies: {}});
		},
		Error("'terminologies' parameter is not supported for enhancement"),
		"'terminologies' parameter is not supported for enhancement");
	});

	QUnit.test("invalid parameter terminologies", function(assert) {
		var oBundle = ResourceBundle.create({
				locale: "en",
				bundleUrl: sMessagesProperties
			}),
			oResourceModel = new ResourceModel({
				bundle: oBundle
			});

		// code under test
		assert.throws(function () {
			oResourceModel.enhance({bundleUrl: sOtherMessagesProperties, terminologies: {}});
		},
		Error("'terminologies' parameter is not supported for enhancement"),
		"'terminologies' parameter is not supported for enhancement");
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Parameters passed to ResourceBundle", {
		beforeEach: function () {
			Localization.setLanguage("en");
			this.stub(Supportability, "collectOriginInfo").returns(true);
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("supportedLocales parameter", function() {
		var aSupportedLocales = ["de", "fr", "de_CH"],
			oResourceModel;

		// the supportedLocales parameter should be passed through
		this.mock(ResourceBundle).expects("create").withExactArgs({
				async: undefined,
				bundleLocale: "de",
				bundleName: "testdata.messages",
				bundleUrl: sMessagesProperties,
				includeInfo: true,
				locale: "de",
				supportedLocales: aSupportedLocales
			})
			.returns("~custom");

		// code under test
		oResourceModel = new ResourceModel({
			bundleName: "testdata.messages",
			bundleUrl: sMessagesProperties,
			bundleLocale: "de",
			supportedLocales: aSupportedLocales
		});

		// cleanup
		oResourceModel.destroy();
	});

	QUnit.test("fallbackLocale parameter", function(assert) {
		var sFallbackLocale = "de_CH",
			oResourceModel;

		// the fallbackLocale parameter should be passed through
		this.mock(ResourceBundle).expects("create").withExactArgs({
				async: undefined,
				bundleLocale: "de",
				bundleName: "testdata.messages",
				bundleUrl: sMessagesProperties,
				fallbackLocale: sFallbackLocale,
				includeInfo: true,
				locale: "de"
			})
			.returns("~custom");

		// code under test
		oResourceModel = new ResourceModel({
			bundleName: "testdata.messages",
			bundleUrl: sMessagesProperties,
			bundleLocale: "de",
			fallbackLocale: sFallbackLocale
		});

		// cleanup
		oResourceModel.destroy();
	});

	QUnit.test("terminologies parameter", function(assert) {
		var mTerminologies = {},
			oResourceModel;

		// the terminologies parameter should be passed through
		this.mock(ResourceBundle).expects("create").withExactArgs({
				async: undefined,
				bundleLocale: "de",
				bundleName: "testdata.messages",
				bundleUrl: sMessagesProperties,
				includeInfo: true,
				locale: "de",
				terminologies: mTerminologies
			})
			.returns("~custom");

		// code under test
		oResourceModel = new ResourceModel({
			bundleName: "testdata.messages",
			bundleUrl: sMessagesProperties,
			bundleLocale: "de",
			terminologies: mTerminologies
		});

		// cleanup
		oResourceModel.destroy();
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: private functions", {
		beforeEach: function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			Localization.setLanguage("en");
			this.stub(Supportability, "collectOriginInfo").returns(true);
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("loadResourceBundle", function() {
		var mTerminologies = {},
			aActiveTerminologies = [];

		// the terminologies and activeTerminologies parameters should be passed through
		this.mock(ResourceBundle).expects("create").withExactArgs({
				activeTerminologies: aActiveTerminologies,
				async: false,
				bundleLocale: "de",
				bundleName: "testdata.messages",
				bundleUrl: sMessagesProperties,
				includeInfo: true,
				locale: "de",
				terminologies: mTerminologies
			})
			.returns("~custom");

		// code under test
		ResourceModel.loadResourceBundle({
			activeTerminologies: aActiveTerminologies,
			bundleLocale: "de",
			bundleName: "testdata.messages",
			bundleUrl: sMessagesProperties,
			terminologies: mTerminologies
		}, false);
	});

	QUnit.test("_sanitizeBundleName", function(assert){
		// input ".testdata.messages"
		this.oLogMock.expects("error").withExactArgs("Incorrect resource bundle name " +
			"\".testdata.messages\"",
		"Leading slashes or dots in resource bundle names are ignored, since such names are " +
			"invalid UI5 module names. Please check whether the resource bundle " +
			"\".testdata.messages\" is actually needed by your application.",
			sClassname);

		// code under test
		assert.equal(ResourceModel._sanitizeBundleName(".testdata.messages"), "testdata.messages");

		// input "/testdata.messages"
		this.oLogMock.expects("error").withExactArgs("Incorrect resource bundle name " +
			"\"/testdata.messages\"",
		"Leading slashes or dots in resource bundle names are ignored, since such names are " +
			"invalid UI5 module names. Please check whether the resource bundle " +
			"\"/testdata.messages\" is actually needed by your application.",
			sClassname);

		// code under test
		assert.equal(ResourceModel._sanitizeBundleName("/testdata.messages"), "testdata.messages");

		// input "i18n.testdata.messages"
		this.oLogMock.expects("error").never();

		// code under test
		assert.equal(ResourceModel._sanitizeBundleName("i18n.testdata.messages"), "i18n.testdata.messages",
			"sanitized bundle name for input which does not need to be sanitized");
	});

	//*********************************************************************************************
[true, false].forEach(function (bAsync) {
	[true, false].forEach(function (bRecreateAsync) {
	QUnit.test("_handleLocalizationChange: bAsync=" + bAsync + ", bRecreateAsync=" + bRecreateAsync, function (assert) {
		var oCallbacks = {
				fnErrorHandler: function () {},
				fnFinallyHandler: function () {},
				fnThenGetResourceBundle: function () {},
				fnThenRecreateBundle: function () {}
			},
			oResourceModel = {
				getResourceBundle: function () {}
			};

		this.mock(oResourceModel).expects("getResourceBundle")
			.withExactArgs()
			.returns("~resourceBundleOrPromise");
		var oCatchHandlerExpectation = this.mock(oCallbacks).expects("fnErrorHandler")
				.withExactArgs(sinon.match.func);
		var oGetResourceBundleSuccessHandlerExpectation = this.mock(oCallbacks).expects("fnThenGetResourceBundle")
			.withExactArgs(sinon.match.func)
			.returns({
				"catch": oCallbacks.fnErrorHandler
			});
		var oSyncPromiseMock = this.mock(SyncPromise);
		oSyncPromiseMock.expects("resolve").atLeast(0).callThrough(); // framework might use SyncPromise too
		oSyncPromiseMock.expects("resolve").withExactArgs("~resourceBundleOrPromise")
			.returns({
				then: oCallbacks.fnThenGetResourceBundle
			});

		// code under test
		ResourceModel.prototype._handleLocalizationChange.call(oResourceModel);

		var oError = new Error("~error");
		this.oLogMock.expects("error")
			.withExactArgs("Failed to reload bundles after localization change", sinon.match.same(oError),
				sClassname);

		// code under test - call error handler
		oCatchHandlerExpectation.args[0][0](oError);

		oResourceModel.bAsync = bAsync;
		oResourceModel.oData = {bundleName: "~bundleName", bundleUrl: "~bundleUrl"};
		this.mock(ResourceModel).expects("_sanitizeBundleName")
			.withExactArgs("~bundleName")
			.exactly(bAsync ? 1 : 0)
			.returns("~sanitizedBundleName");
		this.mock(ResourceBundle).expects("_getUrl")
			.withExactArgs("~bundleUrl", "~sanitizedBundleName")
			.exactly(bAsync ? 1 : 0)
			.returns("~url");
		var oEventParameters = {async: true, url: "~url"};
		oResourceModel.fireRequestSent = function () {};
		this.mock(oResourceModel).expects("fireRequestSent").withExactArgs(oEventParameters)
			.exactly(bAsync ? 1 : 0);
		var oResourceBundle = {
				_recreate: function () {}
			};
		var vRecreateResult = bRecreateAsync ? Promise.resolve("~recreateResult") : "~recreateResult";
		this.mock(oResourceBundle).expects("_recreate").withExactArgs().returns(vRecreateResult);
		var oFinallyHandlerExpectation = this.mock(oCallbacks).expects("fnFinallyHandler")
				.withExactArgs(sinon.match.func)
				.returns("~waitForFinally");
		var oRecreateSuccessHandlerExpextation = this.mock(oCallbacks).expects("fnThenRecreateBundle")
			.withExactArgs(sinon.match.func)
			.returns({
				"finally": oCallbacks.fnFinallyHandler
			});
		oSyncPromiseMock.expects("resolve").withExactArgs(vRecreateResult)
			.returns({
				then: oCallbacks.fnThenRecreateBundle
			});

		// code under test - call success handler after resource bundle is fetched
		assert.strictEqual(oGetResourceBundleSuccessHandlerExpectation.args[0][0](oResourceBundle),
			"~waitForFinally");

		assert.strictEqual(oResourceModel._oPromise, bRecreateAsync ? vRecreateResult : undefined);

		oResourceModel._reenhance = function () {};
		this.mock(oResourceModel).expects("_reenhance").withExactArgs();
		oResourceModel.checkUpdate = function () {};
		this.mock(oResourceModel).expects("checkUpdate").withExactArgs(true);

		// code under test - recreation successful
		oRecreateSuccessHandlerExpextation.args[0][0]("~newBundle");

		assert.notOk(oResourceModel.hasOwnProperty("_oPromise"));
		assert.strictEqual(oResourceModel._oResourceBundle, "~newBundle");

		oResourceModel.fireRequestCompleted = function () {};
		this.mock(oResourceModel).expects("fireRequestCompleted").withExactArgs(oEventParameters)
			.exactly(bAsync ? 1 : 0);

		// code under test - finally handler
		oFinallyHandlerExpectation.args[0][0]();
	});
	});
});

	QUnit.module("sap.ui.model.resource.ResourceModel: Exotic scenarios", {
		beforeEach: function () {
			Localization.setLanguage("en");
		},
		afterEach: function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Invalid resource bundle name", function(assert){
		var fnToUrlSpy = this.spy(sap.ui.require, "toUrl");
		var oModel = new ResourceModel({
			bundleName: ".testdata.messages"
		});
		assert.ok(oModel.getMetadata().isA("sap.ui.model.resource.ResourceModel"), "Model created");
		assert.ok(fnToUrlSpy.calledWith("testdata/messages"), "sap.ui.require.toUrl was called without a leading slash.");
		oModel = new ResourceModel({
			bundleName: "/testdata/messages"
		});
		assert.ok(oModel.getMetadata().isA("sap.ui.model.resource.ResourceModel"), "Model created");
		assert.ok(fnToUrlSpy.calledWith("testdata/messages"), "sap.ui.require.toUrl was called without a leading slash.");

		oModel = new ResourceModel({
			bundleName: "../.test-resources/sap/ui/core/qunit/testdata/messages"
		});
		assert.ok(oModel.getMetadata().isA("sap.ui.model.resource.ResourceModel"), "Model created");
		assert.ok(fnToUrlSpy.calledWith("testdata/messages"), "sap.ui.require.toUrl was called without a leading slash.");

		fnToUrlSpy.restore();
	});
});