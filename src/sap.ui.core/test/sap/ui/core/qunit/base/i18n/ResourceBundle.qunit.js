/*global sinon, QUnit */
sap.ui.define(["sap/base/i18n/ResourceBundle", "sap/base/util/Properties"], function(ResourceBundle, Properties) {
	"use strict";

	QUnit.module("sap/base/i18n/ResourceBundle");

	QUnit.test("create invalid url", function(assert) {
		assert.throws(ResourceBundle.create, new Error("resource URL '' has unknown type (should be one of .properties,.hdbtextbundle)"), "creation fails without valid url");
	});

	QUnit.test("create", function(assert) {
		var done = assert.async();

		var oEmptyProps = createFakeProperties({number: "47"});

		var oStub = sinon.stub(Properties, "create").returns(Promise.resolve(oEmptyProps));

		ResourceBundle.create({url: 'my.properties', async: true}).then(function(oResourceBundle) {
			assert.deepEqual(oResourceBundle.aPropertyFiles[0], oEmptyProps, "properties are correctly loaded");
			oStub.restore();
			done();
		});

	});


	function createFakeProperties(obj) {
		return {
			getProperty: function(sKey) {
				return obj[sKey];
			}
		};
	}

	function createFakePropertiesPromise(obj) {
		return Promise.resolve(createFakeProperties(obj));
	}

	/**
	 *
	 * @param sinon
	 * @return {*} ResourceBundle containing CustomBundle1 and CustomBundle2
	 */
	function createResourceBundleWithCustomBundles(sinon) {
		var oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({number: "47", mee: "yo"}));

		var oResourceBundle1;
		var oResourceBundleCustom1;
		var oResourceBundleCustom2;
		return ResourceBundle.create({url: 'my.properties', locale: "en", async: true})
		.then(function(oResourceBundle) {
			oResourceBundle1 = oResourceBundle;
			oStub.restore();
			oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({number: "45", mec1: "ya"}));

			return ResourceBundle.create({url: 'custom1.properties', locale: "en", async: true});
		})
		.then(function(oResourceBundle) {
			oResourceBundleCustom1 = oResourceBundle;
			oStub.restore();
			oStub = sinon.stub(Properties, "create").returns(createFakePropertiesPromise({number: "46", mec2: "ye"}));

			return ResourceBundle.create({url: 'custom2.properties', locale: "en", async: true});
		})
		.then(function(oResourceBundle) {
			oResourceBundleCustom2 = oResourceBundle;
			oResourceBundle1._enhance(oResourceBundleCustom1);
			oResourceBundle1._enhance(oResourceBundleCustom2);
			oStub.restore();
			return oResourceBundle1;
		});
	}

	QUnit.test("multiple resource bundles using _enhance", function(assert) {
		var done = assert.async();

		createResourceBundleWithCustomBundles(sinon)
		.then(function(oResourceBundle) {
			assert.ok(oResourceBundle, "enhancing a resourceBundle works");
			done();
		});
	});


	QUnit.test("getText (multiple resource bundles) checking that nextLocale is loaded", function(assert) {
		var done = assert.async();

		createResourceBundleWithCustomBundles(sinon)
		.then(function(oResourceBundle) {

			var oSpy = sinon.spy(Properties, "create");

			// no loading of fallback locale is triggered since all keys are within properties.
			assert.equal(oResourceBundle.getText("number"), "46", "Found in last added custom bundle (custom bundle 2)");
			assert.equal(oResourceBundle.getText("mee"), "yo", "Found in bundle");
			assert.equal(oResourceBundle.getText("mec1"), "ya", "Found in custom bundle 1");
			assert.equal(oResourceBundle.getText("mec2"), "ye", "Found in custom bundle 2");
			assert.equal(oSpy.callCount, 0);

			// fallback locale is loaded since key is not within properties.
			assert.equal(oResourceBundle.getText("unknown"), "unknown", "Not present in any bundle");
			assert.equal(oSpy.callCount, 3, "fallback locale was triggered for every bundle");
			oSpy.restore();
			done();
		});

	});

	QUnit.test("getText ignore key fallback (last fallback)", function(assert) {
		var done = assert.async();

		createResourceBundleWithCustomBundles(sinon)
		.then(function(oResourceBundle) {

			var oSpy = sinon.spy(Properties, "create");

			// Correct behavior for a found text
			assert.equal(oResourceBundle.getText("number", [], true), "46", "Correct behavior for a found text with key fallback activated.");
			assert.equal(oResourceBundle.getText("number", [], false), "46", "Correct behavior for a found text with key fallback deactivated.");

			// Correct behavior for a not found text
			assert.equal(oResourceBundle.getText("not_there", [], true), undefined, "Correct behavior for a not found text with key fallback activated.");
			assert.equal(oResourceBundle.getText("not_there", [], false), "not_there", "Correct behavior for a not found text with key fallback deactivated.");

			oSpy.restore();
			done();
		});

	});

});
