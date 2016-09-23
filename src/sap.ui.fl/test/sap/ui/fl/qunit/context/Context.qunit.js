jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.fl.context.BaseContextProvider");
jQuery.sap.require("sap.ui.fl.context.Context");


(function(BaseContextProvider, Context) {

	var mUserContext = {
		"settings" : {
			"language" : "DE",
			"TIME_ZONE" : "CEST"
		},
		"role" : "admin"
	};

	var mUserValueHelp = {
		"timezone" : {
			"text" : "Time Zone",
			"description" : "Time zones of a country the user lives in",
			"values" : [{
				"text" : "Central European Time ",
				"description" : "UTC+01:00 (CET)",
				"value" : "CET"
			}, {
				"text" : "The Pacific Time Zone",
				"description" : "The states on the Pacific coast, Nevada, and parts of Idaho",
				"value" : "PT"
			}]
		},
		"language" : {
			"text" : "Language",
			"description" : "Preferred language of the user",
			"values" : [{
				"text" : "German",
				"description" : "German language (Deutsch)",
				"value" : "DE"
			}, {
				"text" : "English",
				"description" : "American English",
				"value" : "EN_US"
			}]
		}
	};

	var mDeviceContext = {
		"agent" : "Safari",
		"screen_size" : "5K"
	};

	var mDeviceValueHelp = {
		"agent" : {
			"text" : "Agent",
			"description" : "Browser agent",
			"values" : [{
				"text" : "Safari",
				"description" : "Browser on OS x and IOs platform",
				"value" : "Safari"
			}, {
				"text" : "Chrome",
				"description" : "A web browser built for speed, simplicity, and security",
				"value" : "Chrome"
			}]
		}
	};

	var MockContextProvider = BaseContextProvider.extend("sap.ui.fl.context.MockContextProvider");
	var sUserContextText = "Context";
	var sUserDescription = "User context";
	var mContextConfigurationUser = {
		"user" : "sap/ui/fl/qunit/context/MockUserContextProvider",
		"device" : "sap/ui/fl/qunit/context/MockDeviceContextProvider"
	};

	/*
	 * Testing the correct API (set of methods) of BaseContextProvider
	 */
	var oBaseContextProvider;
	QUnit.module("Given the Abstract Context Provider", {
		beforeEach : function() {
			oBaseContextProvider = new BaseContextProvider();
		},
		afterEach : function() {
		}
	});

	QUnit.test("when creating a BaseContextProvider instance,", function(assert) {
		assert.ok(oBaseContextProvider, "then the instance is available");
	});

	QUnit.test("when searching it's API for method getText", function(assert) {
		assert.ok(oBaseContextProvider.getText, "then the method is available");
	});

	QUnit.test("when searching it's API for method getDescription", function(assert) {
		assert.ok(oBaseContextProvider.getDescription, "then the method is available");
	});

	QUnit.test("when searching it's API for method getValue", function(assert) {
		assert.ok(oBaseContextProvider.getValue, "then the method is available");
	});

	QUnit.test("when searching it's API for method getValueHelp", function(assert) {
		assert.ok(oBaseContextProvider.getValueHelp, "then the method is available");
	});

	/*
	 * Testing the functionality of a simple mocked context provider
	 */
	var oMockContextProvider;
	QUnit.module("Given an instance of the MockContextProvider", {
		beforeEach : function() {
			oMockContextProvider = new MockContextProvider({
				text : sUserContextText,
				description : sUserDescription
			});
		},
		afterEach : function() {
		}
	});

	QUnit.test("when calling getText(),", function(assert) {
		assert.ok(oMockContextProvider.getText() == sUserContextText, "then it returns the correct value");
	});

	QUnit.test("when calling getDescription(),", function(assert) {
		assert.ok(oMockContextProvider.getDescription() == sUserDescription, "then it returns the correct value");
	});

	/*
	 * Testing the API of Context
	 */
	var oContextWithUserConfiguration;
	QUnit.module("Given the Context API", {
		beforeEach : function() {
			oContextWithUserConfiguration = new Context({
				configuration : mContextConfigurationUser
			});
		},
		afterEach : function() {
		}
	});

	QUnit.test("when creating a Context instance,", function(assert) {
		assert.ok(oContextWithUserConfiguration, "then the instance is available");
	});

	QUnit.test("when calling getContextProviders,", function(assert) {
		assert.ok(oContextWithUserConfiguration.getContextProviders() instanceof Array, "then it returns an Array");
	});

	QUnit.test("when calling getConfiguration", function(assert) {
		assert.ok(oContextWithUserConfiguration.getConfiguration(), mContextConfigurationUser,
				" the correct configuration is returned");
	});

	QUnit.test("when calling getValue without an argument", function(assert) {
		return oContextWithUserConfiguration.getValue().then(function(mValue) {
			assert.deepEqual(mValue, {
				user : mUserContext,
				device : mDeviceContext,
			}, " then all values from all ContextProviders are returned with the domain as key");
		});
	});

	QUnit.test("when calling getValue with argument ['user']", function(assert) {
		return oContextWithUserConfiguration.getValue(["user"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				user : mUserContext
			}, " then only the data of 'user' is returned, with the domain request as prefix");
		});
	});


	QUnit.test("when calling getValue with a filtering argument ['user.settings.language']", function(assert) {
		return oContextWithUserConfiguration.getValue(["user.settings.language"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"user.settings.language" : mUserContext.settings.language
			}, " then only the language string is returned");
		});
	});

	QUnit.test("when calling getValue with a unkown argument ['user.unknownProperty']", function(assert) {
		return oContextWithUserConfiguration.getValue(["user.unknownProperty"]).then(function(mValue) {
			assert.deepEqual(mValue,{
				"user.unknownProperty" : undefined
			}, " then undefined is returned");
		});
	});

	QUnit.test("when calling getValue with a unkown argument 'user.unknown.secondLevelProperty'", function(assert) {
		return oContextWithUserConfiguration.getValue(["user.unknown.secondLevelProperty"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"user.unknown.secondLevelProperty" : undefined
			}, " then undefined is returned");
		});

	});

	QUnit.test("when calling getValue with the array with a single request ['device'] as parameter", function(assert) {
		return oContextWithUserConfiguration.getValue(["device"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				device : mDeviceContext
			} , " then data of the request is returned");
		});
	});

	QUnit.test("when calling getValue with a filtering array ['device', 'user.settings'] as parameter", function(assert) {
		return oContextWithUserConfiguration.getValue(["device", "user.settings"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"device" : mDeviceContext,
				"user.settings" : mUserContext.settings
			}, " then correct data is returned in a map with the request as key");
		});
	});

	QUnit.test("when calling getValue with a filtering request to the same provider twice ['device.agent', 'user.settings', 'user.role', 'unknownDomain', 'user.unknownProperty'] as parameter", function(assert) {
		return oContextWithUserConfiguration.getValue(["device.agent", "user.settings.language", "user.role", "unknownDomain", "user.unknownProperty"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"device.agent" : mDeviceContext.agent,
				"user.settings.language" : mUserContext.settings.language,
				"user.role" : mUserContext.role,
				'unknownDomain' : undefined,
				'user.unknownProperty' : undefined
			}, " then correct data is returned in a map with the requests as key");
		});
	});

	QUnit.test("when calling getValue with a partial domain 'dev'", function(assert) {
		return oContextWithUserConfiguration.getValue(["dev"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				device : mDeviceContext
			}, " then correct data is returned");
		});
	});

	QUnit.test("when calling getValueHelp without an argument", function(assert) {
		return oContextWithUserConfiguration.getValueHelp().then(function(mValue) {
			assert.deepEqual(mValue, {
				"device" : mDeviceValueHelp,
				"user" : mUserValueHelp
			}, " then all values from all ContextProviders are returned");
		});
	});

	QUnit.test("when calling getValueHelp with argument 'user'", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["user"]).then(function(mValue) {
			assert.deepEqual(mValue,{
				"user" : mUserValueHelp
			} , " then only the user help of 'user' is returned");
		});
	});

	QUnit.test("when calling getValueHelp with not existing domain", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["foobar"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				foobar : undefined
			}, " then nothing is returned");
		});
	});

	QUnit.test("when calling getValueHelp with the array ['device'] as parameter", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["device"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				device : mDeviceValueHelp
			}, " then correct data is returned");
		});
	});

	QUnit.test("when calling getValueHelp with a filtering array ['device', 'user.settings'] as parameter", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["device", "user.settings"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"device" : mDeviceValueHelp,
				"user.settings" : mUserValueHelp //mock provider doesn't filter, real one should
			}, " then filtered value help data is returned with the requests as key");
		});
	});

	QUnit.test("when calling getValueHelp with a partial domain 'us' ", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["us"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"user" : mUserValueHelp //mock provider doesn't filter, real one should
			}, " then correct data is returned");
		});
	});

	QUnit.test("when calling getValueHelp with a partial domain 'dev'", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["dev"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"device" : mDeviceValueHelp
			}, " then correct data is returned");
		});
	});

	QUnit.test("when calling getValueHelp with a partial domain in the array ['user']", function(assert) {
		return oContextWithUserConfiguration.getValueHelp(["user"]).then(function(mValue) {
			assert.deepEqual(mValue, {
				"user" : mUserValueHelp //mock provider doesn't filter, real one should
			}, " then correct data is returned");
		});
	});

	var oContextWithDefectConfiguration;
	var fnjQueryLogStub;
	QUnit.module("Given a context with defect configuration", {
		beforeEach : function() {
			oContextWithDefectConfiguration = new Context({
				configuration : {
					"device" : "path/to/module/forDeviceInformation"
				}
			});
			fnjQueryLogStub = sinon.spy(jQuery.sap.log, "error");
		},
		afterEach : function() {
			fnjQueryLogStub.restore();
		}
	});

	QUnit.test("when calling getValue", function(assert) {
		return oContextWithDefectConfiguration.getValue(["device"]).then(function(mValue) {
			assert.equal(fnjQueryLogStub.callCount, 1, " then the error gets logged but there is no exception");
		});
	});

}(sap.ui.fl.context.BaseContextProvider, sap.ui.fl.context.Context));
