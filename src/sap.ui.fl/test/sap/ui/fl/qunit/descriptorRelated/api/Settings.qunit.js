sinon.config.useFakeTimers = false;
jQuery.sap.require("sap.ui.fl.descriptorRelated.api.Settings");
jQuery.sap.require("sap.ui.fl.Cache");

(function(Settings, Cache) {

	QUnit.module("sap.ui.fl.descriptorRelated.api.Settings", {
		beforeEach: function() {

			var oSettings = {
				"isKeyUser": false,
				"isAtoAvailable": false,
				"isAtoEnabled": false
			};
			this.cut = new Settings(oSettings);
		},
		afterEach: function() {
			delete Settings._oSettings;
			delete Settings._cachedSettingsPromise;
		}
	});

	QUnit.test("init", function(assert) {
		QUnit.ok(this.cut._oSettings);
	});

	QUnit.test("isKeyUser", function(assert) {
		QUnit.equal(this.cut._oSettings.isKeyUser, false);
		var bIsKeyUser = this.cut.isKeyUser();
		QUnit.equal(bIsKeyUser, false);
	});

	QUnit.test("isModelS", function(assert) {
		QUnit.equal(this.cut._oSettings.isAtoAvailable, false);
		var bIsModelS = this.cut.isModelS();
		QUnit.equal(bIsModelS, false);
	});

	QUnit.test("isAtoEnabled", function(assert) {
		QUnit.equal(this.cut._oSettings.isAtoEnabled, false);
		var bIsAtoEnabled = this.cut.isAtoEnabled();
		QUnit.equal(bIsAtoEnabled, false);
	});

	QUnit.test("load from cache", function(assert) {
		var done = assert.async();

		var oFileContent = {
			changes: {
				settings: {
					isKeyUser: true,
					isAtoAvailable: true
				}
			}
		};
		Cache._entries['dummy'] = {
			promise: Promise.resolve(oFileContent)
		};
		Settings.getInstance().then(function(oSettings) {
			QUnit.equal(oSettings.isKeyUser(), true);
			QUnit.equal(oSettings.isModelS(), true);
			Settings.getInstance().then(function(oSettings2) {
				QUnit.equal(oSettings, oSettings2);
				done();
			});
		});
	});


}(sap.ui.fl.descriptorRelated.api.Settings, sap.ui.fl.Cache));
