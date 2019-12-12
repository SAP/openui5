/*global QUnit*/
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/model/BindingMode",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/i18n/ResourceBundle",
	"sap/ui/testlib/TestButton"
], function(
	Device,
	BindingMode,
	ResourceModel,
	ResourceBundle,
	TestButton
) {
	"use strict";
	//add divs for control tests
	var oContent = document.createElement("div");
	oContent.id = "target1";
	document.body.appendChild(oContent);

	var oModel, oLabel, oLabel2, oDolly;

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle loaded via name", {
		beforeEach: function() {
			oModel = new ResourceModel({bundleName: "testdata.messages"});
			sap.ui.getCore().setModel(oModel);
		},
		afterEach: function() {
			sap.ui.getCore().setModel(null);
			oModel.destroy();
			oModel = undefined;
		}
	});

	//model created
	QUnit.test("Model instantiated successful", function(assert) {
		assert.expect(2);
		oLabel = new TestButton("myLabel", {text: "{TEST_TEXT}"});
		oLabel.placeAt("target1");

		assert.ok(oModel, "model must exist after creation");
		assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");
		oLabel.destroy();
	});

	//getProperty()
	QUnit.test("test model getProperty", function(assert) {
		assert.expect(1);
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
	});

	//setProperty must not exist!
	QUnit.test("set Property must have no effect", function(assert) {
		assert.ok(!oModel.setProperty, "set Property method should not be defined");
	});

	//getProperty()/binding
	QUnit.test("test model getProperty", function(assert) {
		assert.expect(2);
		oLabel = new TestButton("myLabel", {text: "{TEST_TEXT}"});
		oLabel.placeAt("target1");
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
		assert.equal(oLabel.getText(), "A text en");
		oLabel.destroy();
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: "
			+ "Resources bundle loaded via name / set Model with alias", {
		beforeEach: function() {
			oModel = new ResourceModel({bundleName: "testdata.messages"});
			sap.ui.getCore().setModel(oModel, "i18n");
		},
		afterEach: function() {
			sap.ui.getCore().setModel(null, "i18n");
			oModel.destroy();
			oModel = undefined;
		}
	});

	//model created
	QUnit.test("Model instantiated successful", function(assert) {
		assert.expect(2);
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("target1");

		assert.ok(oModel, "model must exist after creation");
		assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");
		oLabel.destroy();
	});

	//getProperty()
	QUnit.test("test model getProperty", function(assert) {
		assert.expect(1);
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
	});

	//setProperty must not exist!
	QUnit.test("set Property must have no effect", function(assert) {
		assert.ok(!oModel.setProperty, "set Property method should not be defined");
	});

	//getProperty()/binding
	QUnit.test("test model getProperty", function(assert) {
		assert.expect(2);
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("target1");
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
		assert.equal(oLabel.getText(), "A text en");
		oLabel.destroy();
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle loaded via url", {
		beforeEach: function() {
			oModel = new ResourceModel({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"});
			sap.ui.getCore().setModel(oModel, "i18n");
		},
		afterEach: function() {
			sap.ui.getCore().setModel(null, "i18n");
			oModel.destroy();
			oModel = undefined;
		}
	});
	//model created
	QUnit.test("Model instantiated successful", function(assert) {
		assert.expect(5);
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("target1");

		assert.ok(oModel, "model must exist after creation");
		assert.ok(oModel instanceof ResourceModel, "model must be instanceof sap.ui.model.resource.ResourceModel");

		assert.ok(oModel.mSupportedBindingModes.OneWay, "OneWay is an allowed binding mode");
		assert.ok(!oModel.mSupportedBindingModes.TwoWay, "TwoWay is a not an allowed binding mode");
		assert.ok(!oModel.bAsync && oModel.mSupportedBindingModes.OneTime, "OneTime is an allowed binding mode with synchronous models");

		oLabel.destroy();
	});
	//getProperty()
	QUnit.test("test model getProperty", function(assert) {
		assert.expect(1);
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
	});
	//setProperty must not exist!
	QUnit.test("set Property must have no effect", function(assert) {
		assert.ok(!oModel.setProperty, "set Property method should not be defined");
	});
	//getProperty()/binding
	QUnit.test("test model getProperty", function(assert) {
		assert.expect(2);
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.placeAt("target1");
		var value = oModel.getProperty("TEST_TEXT");
		assert.equal(value, "A text en");
		assert.equal(oLabel.getText(), "A text en");
		oLabel.destroy();
	});
	//CompositeBinding
	QUnit.test("test composite bindings", function(assert) {
		assert.expect(2);
		oLabel2 = new TestButton("myLabel2", {text: {parts: [{path: "i18n>TEST_TEXT"}, {path: "i18n>TEST_TEXT"}]}});
		oLabel2.placeAt("target1");

		assert.ok(oLabel2, "Label with composite binding must be created");
		assert.equal(oLabel2.getText(), "A text en A text en", "Text msut be: 'A text en A text en'");
		oLabel2.destroy();
	});
	//origin info
	QUnit.test("test model origin info", function(assert) {
		assert.expect(3);
		var value = oModel.getProperty("TEST_TEXT"),
			info = value.originInfo;
		assert.equal(info.source, "Resource Bundle");
		assert.equal(info.url, "test-resources/sap/ui/core/qunit/testdata/messages.properties");
		assert.equal(info.key, "TEST_TEXT");
	});

	QUnit.test("Model instantiated successful", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oLabel.setModel(oModel, "i18n");
		oDolly = oLabel.clone();
		assert.equal(oLabel.getModel("i18n"), oModel, "model must exist in origin (precondition)");
		assert.equal(oDolly.getModel("i18n"), oModel, "model must be the same for a clone");
		oLabel.destroy();
		oDolly.destroy();
		oModel.destroy();
	});

	QUnit.test("Model instantiated successful", function(assert) {
		oLabel = new TestButton("myLabel", {text: "{i18n>TEST_TEXT}"});
		oDolly = oLabel.clone();
		oDolly.setModel(oModel, "i18n");
		assert.equal(oDolly.getText(), "A text en", "binding must lead to the expected result after a clone");
		oLabel.destroy();
		oDolly.destroy();
		oModel.destroy();
	});

	QUnit.test("Model enhancement", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
		oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
	});

	QUnit.test("Model enhancement (with bundle)", function(assert) {
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
		var oBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
		oModel.enhance(oBundle);
		assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle passed as parameter", {
		prepare: function(opts) {
			sap.ui.getCore().getConfiguration().setLanguage("en");

			// Load the bundle beforehand
			this.oBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages.properties"});

			// Spy on resource bundle loading
			this.jQuerySapResources = this.spy(ResourceBundle, "create");

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
		}
	});

	QUnit.test("Basic", function(assert) {
		this.prepare();

		assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");

	});

	QUnit.test("Model enhancement", function(assert) {
		this.prepare();

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

		this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_other.properties"});

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
	});

	QUnit.test("Model enhancement (with bundle)", function(assert) {
		this.prepare();

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

		var oCustomBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
		this.oModel.enhance(oCustomBundle);

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		var oCustomBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages_other.properties"});
		this.oModel.enhance(oCustomBundle);

		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
		assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
	});

	QUnit.test("Model enhancement (constructor)", function(assert) {

		// ensure that the order is guaranteed how the texts are enhanced:
		// the latter bundles override the texts of the first ones
		this.prepare({
			enhanceWith: [{bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"}, {bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_other.properties"}]
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
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Resources bundle passed as parameter -"
			+ "Language change on enhanced model", {
		prepare: function(opts) {
			sap.ui.getCore().getConfiguration().setLanguage("en");

			// Load the bundle beforehand
			if (opts && typeof opts.bundle === "function") {
				this.oBundle = opts.bundle.apply(this);
			} else {
				this.oBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages.properties"});
			}

			// Spy on resource bundle loading
			this.jQuerySapResources = this.spy(ResourceBundle, "create");

			if (opts && typeof opts.model === "function") {
				this.oModel = opts.model.apply(this);
			} else {
				// Create the model with the existing bundle
				this.oModel = new ResourceModel({
					bundle: this.oBundle
				});
			}

			// localizationChange is only fired on models set to a ManagedObject or on the Core
			sap.ui.getCore().setModel(this.oModel, "i18n");

			// Spy on "localizationChange" method
			this.localizationChangeSpy = this.spy(this.oModel, "_handleLocalizationChange");
		},
		testEnhanceAndLanguageChange: function(assert) {
			assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
			assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});

			assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

			// Reset the jQuery.sap.resources callCount
			this.jQuerySapResources.reset();

			sap.ui.getCore().getConfiguration().setLanguage("de");

			assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
			assert.equal(this.jQuerySapResources.callCount, 2, "jQuery.sap.resources should be called twice after changing the language");
			assert.notEqual(this.oModel.getResourceBundle(), this.oBundle, "A new bundle has been created");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are now in 'de'");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are now in 'de'");
		},
		testEnhanceAndLanguageChangeWithFixedLocale: function(assert) {
			assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
			assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

			this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties", bundleLocale: "de"});

			assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

			// Reset the jQuery.sap.resources callCount
			this.jQuerySapResources.reset();

			sap.ui.getCore().getConfiguration().setLanguage("it");

			assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
			assert.equal(this.jQuerySapResources.callCount, 2, "jQuery.sap.resources should not be called after changing the language");
			assert.notEqual(this.oModel.getResourceBundle(), this.oBundle, "A new bundle has been created");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");
		},
		afterEach: function() {
			this.oBundle = null;
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
		}
	});

	QUnit.test("bundle", function(assert) {
		this.prepare();

		assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

		this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});

		assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		// Reset the jQuery.sap.resources callCount
		this.jQuerySapResources.reset();

		sap.ui.getCore().getConfiguration().setLanguage("de");

		assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
		assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called after changing the language");
		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is still returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are still in 'en'");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "Texts from enhancement are still in 'en'");
	});

	QUnit.test("bundle, bundleUrl", function(assert) {
		this.prepare({
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleUrl to allow re-loading the bundle on localizationChange
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"
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
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
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

		assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

		this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties", bundleLocale: "de"});

		assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

		// Reset the jQuery.sap.resources callCount
		this.jQuerySapResources.reset();

		sap.ui.getCore().getConfiguration().setLanguage("it");

		assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
		assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called after changing the language");
		assert.equal(this.oModel.getResourceBundle(), this.oBundle, "The passed bundle is still returned by the model");
		assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
		assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");
	});

	QUnit.test("bundle, bundleLocale, bundleUrl", function(assert) {
		this.prepare({
			bundle: function() {
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
					locale: "de"
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleUrl and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"
				});
			}
		});

		this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
	});

	QUnit.test("bundle, bundleLocale, bundleName", function(assert) {
		this.prepare({
			bundle: function() {
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
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
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
					locale: "de"
				});
			},
			model: function() {
				return new ResourceModel({
					bundle: this.oBundle,
					// Also provide bundleUrl, bundleName and bundleLocale to allow re-loading the bundle on localizationChange
					bundleLocale: "de",
					bundleName: "testdata.messages",
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"
				});
			}
		});

		this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Async -"
			+ "Resources bundle passed as parameter", {
		prepare: function(opts) {
			sap.ui.getCore().getConfiguration().setLanguage("en");

			// Load the bundle beforehand
			return jQuery.sap.resources({
				url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
				async: true
			}).then(function(oBundle) {
				this.oBundle = oBundle;

				// Spy on resource bundle loading
				this.jQuerySapResources = this.spy(ResourceBundle, "create");

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
		}
	});

	QUnit.test("Basic", function(assert) {
		return this.prepare().then(function() {

			assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");

			var pBundle = this.oModel.getResourceBundle();
			assert.ok(pBundle instanceof Promise, "getResourceBundle returns a Promise");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are already available");

			return pBundle.then(function(oModelBundle) {
				assert.equal(oModelBundle, this.oBundle, "The passed bundle is returned by the model");
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Model enhancement", function(assert) {
		return this.prepare().then(function() {

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT is still the same after calling enhance");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM is still the same after calling enhance");

			assert.ok(pEnhance instanceof Promise, "enhance returns a Promise");

			return pEnhance.then(function() {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Model enhancement (with bundle)", function(assert) {
		return this.prepare().then(function() {

			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			return jQuery.sap.resources({
				url: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
				async: true
			}).then(function(oCustomBundle) {

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
			enhanceWith: [{bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"}, {bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_other.properties"}]
		}).then(function() {
			return this.oModel._pEnhanced;
		}.bind(this)).then(function() {
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "An overridden modified text", "text TEST_TEXT_CUSTOM of enhanced model is correctly overridden");
			assert.equal(this.oModel.getProperty("TEST_TEXT_OTHER"), "Another text", "text TEST_TEXT_OTHER of enhanced model is correct");
		}.bind(this));

	});

	QUnit.test("Binding", function(assert) {
		return this.prepare().then(function() {

			var oButton = new TestButton({
				text: "{i18n>TEST_TEXT}"
			});
			oButton.setModel(this.oModel, "i18n");

			assert.equal(oButton.getText(), "A text en", "Texts available immediately");

		}.bind(this));
	});

	QUnit.module("sap.ui.model.resource.ResourceModel Async: Resources bundle passed as parameter -"
			+ " Language change on enhanced model", {
		prepare: function(opts) {
			sap.ui.getCore().getConfiguration().setLanguage("en");

			// Load the bundle beforehand
			var p;
			if (opts && typeof opts.bundle === "function") {
				p = opts.bundle.apply(this);
			} else {
				p = jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
					async: true
				});
			}

			return p.then(function(oBundle) {
				this.oBundle = oBundle;

				// Spy on resource bundle loading
				this.jQuerySapResources = this.spy(ResourceBundle, "create");

				if (opts && typeof opts.model === "function") {
					this.oModel = opts.model.apply(this);
				} else {
					// Create the model with the existing bundle
					this.oModel = new ResourceModel({
						bundle: this.oBundle,
						async: true
					});
				}

				// localizationChange is only fired on models set to a ManagedObject or on the Core
				sap.ui.getCore().setModel(this.oModel, "i18n");

				// Spy on "localizationChange" method
				this.localizationChangeSpy = this.spy(this.oModel, "_handleLocalizationChange");
			}.bind(this));
		},
		testEnhanceAndLanguageChange: function(assert) {
			assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});

			return pEnhance.then(function() {
				assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

				// Reset the jQuery.sap.resources callCount
				this.jQuerySapResources.reset();

				sap.ui.getCore().getConfiguration().setLanguage("de");

				assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");

				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle should still be in 'en'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "Texts from enhancement are still in 'en'");

				return this.oModel.getResourceBundle();
			}.bind(this)).then(function(oModelBundle) {
				assert.notEqual(oModelBundle, this.oBundle, "A new bundle has been created");

				assert.equal(this.jQuerySapResources.callCount, 2, "jQuery.sap.resources should be called twice after changing the language (async)");

				// Wait for enhanced bundle to be re-loaded (return value is a Promise)
				return this.jQuerySapResources.getCall(1).returnValue;
			}.bind(this)).then(function() {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are now in 'de'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are now in 'de'");
			}.bind(this));
		},
		testEnhanceAndLanguageChangeWithFixedLocale: function(assert) {
			assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({
				bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties",
				bundleLocale: "de"
			});

			return pEnhance.then(function() {
				assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

				// Reset the jQuery.sap.resources callCount
				this.jQuerySapResources.reset();

				sap.ui.getCore().getConfiguration().setLanguage("it");

				assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");

				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");

				return this.oModel.getResourceBundle();
			}.bind(this)).then(function(oModelBundle) {
				assert.notEqual(oModelBundle, this.oBundle, "A new bundle has been created");

				assert.equal(this.jQuerySapResources.callCount, 2, "jQuery.sap.resources should be called twice after changing the language (async)");

				// Wait for enhanced bundle to be re-loaded (return value is a Promise)
				return this.jQuerySapResources.getCall(1).returnValue;
			}.bind(this)).then(function() {
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");
			}.bind(this));
		},
		afterEach: function() {
			this.oBundle = null;
			if (this.oModel) {
				this.oModel.destroy();
				this.oModel = null;
			}
		}
	});

	QUnit.test("bundle", function(assert) {
		return this.prepare().then(function() {

			assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
			assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are available");
			assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");

			var pEnhance = this.oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});

			return pEnhance.then(function() {
				assert.equal(this.jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

				// Reset the jQuery.sap.resources callCount
				this.jQuerySapResources.reset();

				sap.ui.getCore().getConfiguration().setLanguage("de");

				assert.equal(this.localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
				assert.equal(this.jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called after changing the language");

				assert.equal(this.oModel.getProperty("TEST_TEXT"), "A text en", "Texts from the bundle are still in 'en'");
				assert.equal(this.oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "Texts from enhancement are still in 'en'");

				return this.oModel.getResourceBundle();
			}.bind(this)).then(function(oModelBundle) {
				assert.equal(oModelBundle, this.oBundle, "The passed bundle is still returned by the model");
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
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"
				});
			}
		}).then(function() {
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
		}).then(function() {
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
		}).then(function() {
			return this.testEnhanceAndLanguageChange(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleLocale", function(assert) {

		// Load bundle beforehand
		var oBundle = jQuery.sap.resources({
			url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
			locale: "de"
		});

		// Spy on resource bundle loading
		var jQuerySapResources = this.spy(ResourceBundle, "create");

		// Create the model with the existing bundle
		var oModel = new ResourceModel({
			bundle: oBundle,
			async: true,
			// Locale should not be used at all as there is no "bundleName" or "bundleUrl"
			bundleLocale: "de"
		});

		// localizationChange is only fired on models set to a ManagedObject or on the Core
		sap.ui.getCore().setModel(oModel, "i18n");

		// Spy on "localizationChange" method
		var localizationChangeSpy = this.spy(oModel, "_handleLocalizationChange");

		assert.equal(jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called when passing an existing resourcebundle");
		assert.equal(oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are available");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein angepasster Text", "text TEST_TEXT_CUSTOM of original model is correct");

		var pEnhance = oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties", bundleLocale: "de"});

		return pEnhance.then(function() {
			assert.equal(jQuerySapResources.callCount, 1, "jQuery.sap.resources should be called once when enhancing the model");
			assert.equal(oModel.getProperty("TEST_TEXT"), "Ein Text de", "text TEST_TEXT of enhanced model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "text TEST_TEXT_CUSTOM of enhanced model is correct");

			// Reset the jQuery.sap.resources callCount
			jQuerySapResources.reset();

			sap.ui.getCore().getConfiguration().setLanguage("it");

			assert.equal(localizationChangeSpy.callCount, 1, "_handleLocalizationChange should be called after changing the language");
			assert.equal(jQuerySapResources.callCount, 0, "jQuery.sap.resources should not be called after changing the language");

			assert.equal(oModel.getProperty("TEST_TEXT"), "Ein Text de", "Texts from the bundle are still in 'de'");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "Ein modifizierter Text", "Texts from enhancement are still in 'de'");

			return oModel.getResourceBundle();
		}).then(function(oModelBundle) {
			assert.equal(oModelBundle, oBundle, "The passed bundle is still returned by the model");

			oModel.destroy();
			sap.ui.getCore().getConfiguration().setLanguage("en");
		});
	});

	QUnit.test("bundle, bundleLocale, bundleUrl", function(assert) {
		return this.prepare({
			bundle: function() {
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
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
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"
				});
			}
		}).then(function() {
			return this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleLocale, bundleName", function(assert) {
		return this.prepare({
			bundle: function() {
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
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
		}).then(function() {
			return this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
		}.bind(this));
	});

	QUnit.test("bundle, bundleLocale, bundleName, bundleUrl", function(assert) {
		return this.prepare({
			bundle: function() {
				return jQuery.sap.resources({
					url: "test-resources/sap/ui/core/qunit/testdata/messages.properties",
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
					bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages.properties"
				});
			}
		}).then(function() {
			return this.testEnhanceAndLanguageChangeWithFixedLocale(assert);
		}.bind(this));
	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Async", {
		beforeEach: function() {
			oLabel = new TestButton("myLabel", {text: "{async>TEST_TEXT}"});
			oLabel.placeAt("target1");
			oLabel2 = new TestButton("myLabel2", {text: "{async>TEST_TEXT}"});
			oLabel2.placeAt("target1");
			oModel = new ResourceModel({bundleName: "testdata.messages", async: true});
			sap.ui.getCore().setModel(oModel, "async");
		},
		afterEach: function() {
			sap.ui.getCore().setModel(null, "async");
			oModel.destroy();
			oModel = undefined;
			oLabel.destroy();
			oLabel2.destroy();
		}
	});

	//we can't run this test in firefox properly as then is called synchronously in firefox
	if (!Device.browser.firefox) {
		QUnit.test("Test async mode", function(assert) {
			var done = assert.async();
			assert.expect(13);
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
			assert.ok(oPromise instanceof window.Promise, "getResourceBundle returns Promise");

			oPromise.then(function(oBundle) {
				assert.equal(oLabel.getText(), "A text en", "Texts available after async load");
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "getProperty returns text after async load");
				assert.ok(oBundle == oModel._oResourceBundle, "A text en", "Bundle available after async load");
				done();
			});
		});
	}
	QUnit.test("Enhancement after load", function(assert) {
		var done = assert.async();
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");

		oModel.getResourceBundle().then(function(oBundle) {
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
			var oPromise = oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
			oPromise.then(function() {
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
				done();
			});
		});
	});

	QUnit.test("Enhancement after load (with bundle)", function(assert) {
		var done = assert.async();
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");

		oModel.getResourceBundle().then(function(oBundle) {
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of original model is correct");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A custom text", "text TEST_TEXT_CUSTOM of original model is correct");
			var oBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
			var oPromise = oModel.enhance(oBundle);
			oPromise.then(function() {
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct");
				assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct");
				done();
			});
		});
	});

	QUnit.test("Enhancement before load", function(assert) {
		var done = assert.async();
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");
		var oPromise = oModel.enhance({bundleUrl: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
		assert.equal(oModel.getProperty("TEST_TEXT"), null, "text TEST_TEXT of enhanced model is still null");
		assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "text TEST_TEXT_CUSTOM of enhanced model is still null");

		Promise.all([oModel.getResourceBundle(), oPromise]).then(function(args) {
			assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct after async load");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct after async load");
			done();
		});
	});

	//we can't run this test in firefox properly as then is called synchronously in firefox
	if (!Device.browser.firefox) {
		QUnit.test("Enhancement before load (with bundle)", function(assert) {
			var done = assert.async();
			assert.equal(oModel.getProperty("TEST_TEXT"), null, "initial text TEST_TEXT of original model is null");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "initial text TEST_TEXT_CUSTOM of original model is null");
			var oBundle = jQuery.sap.resources({url: "test-resources/sap/ui/core/qunit/testdata/messages_custom.properties"});
			var oPromise = oModel.enhance(oBundle);
			assert.equal(oModel.getProperty("TEST_TEXT"), null, "text TEST_TEXT of enhanced model is still null");
			assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), null, "text TEST_TEXT_CUSTOM of enhanced model is still null");

			Promise.all([oModel.getResourceBundle(), oPromise]).then(function(args) {
				assert.equal(oModel.getProperty("TEST_TEXT"), "A text en", "text TEST_TEXT of enhanced model is correct after async load");
				assert.equal(oModel.getProperty("TEST_TEXT_CUSTOM"), "A modified text", "text TEST_TEXT_CUSTOM of enhanced model is correct after async load");
				done();
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
		assert.expect(2);
		var oBtn = new TestButton({
			text: "{async5>TEST_TEXT}"
		});
		oBtn.placeAt("target1");

		var oAsyncModel = new ResourceModel({
			bundleName: "testdata.messages",
			async: true
		});
		sap.ui.getCore().setModel(oAsyncModel, "async5");


		var iChangeCount = 0;
		oBtn.getBinding("text").attachChange(function() {
			if (iChangeCount++ === 0) {
				assert.equal(oBtn.getText(), "A text en", "Binding Change: Texts available after sync load");
				sap.ui.getCore().getConfiguration().setLanguage("de");
			} else {
				assert.equal(oBtn.getText(), "Ein Text de", "Binding Change: Texts available after sync load");

				oBtn.destroy();
				oAsyncModel.destroy();
				done();
			}
		});

	});

	QUnit.test("OneWay Binding and Language Change (Synchronous)", function(assert) {
		sap.ui.getCore().getConfiguration().setLanguage("en");

		var oBtn = new TestButton({
			text: "{sync5>TEST_TEXT}"
		});
		oBtn.placeAt("target1");

		var oSyncModel = new ResourceModel({
			bundleName: "testdata.messages",
			async: false
		});
		sap.ui.getCore().setModel(oSyncModel, "sync5");

		assert.equal(oBtn.getText(), "A text en", "Binding Change: Texts available after sync load");
		sap.ui.getCore().getConfiguration().setLanguage("de");

		assert.equal(oBtn.getText(), "Ein Text de", "Binding Change: Texts available after sync load");
		oBtn.destroy();
		oSyncModel.destroy();

	});

	QUnit.module("sap.ui.model.resource.ResourceModel: Exotic scenarios");

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