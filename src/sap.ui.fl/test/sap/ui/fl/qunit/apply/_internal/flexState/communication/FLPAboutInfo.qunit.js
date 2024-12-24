/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/apply/_internal/flexState/communication/FLPAboutInfo",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Lib,
	FlexRuntimeInfoAPI,
	FLPAboutInfo,
	FlexState,
	ManifestUtils,
	FlexUtils,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sAdaptationId = "id_1231231_123";
	const sDefaultAdaptationId = "DEFAULT";
	const sAdaptationTitle = "Adaptation Title";
	const oComponentInstance = {
		getId: () => {
			return "sample.component.id";
		},
		getComponentData: () => {
			return {};
		},
		getManifest: () => {
			return {};
		},
		getManifestObject: () => {
			return {};
		},
		_componentConfig: {
			asyncHints: {}
		}
	};
	const mockedAppLifecycleService = {
		attachAppLoaded: () => { },
		setAppInfo: (oAppInfo) => Promise.resolve(oAppInfo),
		getCurrentApplication: () => {
			return {
				componentInstance: {
					getId: () => {
						return "sample.component.id";
					}
				}
			};
		}
	};

	function generateTestDescription(oTestSetup, bViaOnAppLoaded) {
		let sTestname = `when homePage is ${oTestSetup.isHomePage} and onAppLoaded is triggered`;
		sTestname += bViaOnAppLoaded ? " via onAppLoadedListener" : " via existing currentApplication";
		sTestname += oTestSetup.isUI5Application ? " for an UI5 application" : " for a non UI5 application";
		return sTestname;
	}

	/**
	 * Stubs the settings for context-based adaptation in the FlexRuntimeInfoAPI and Settings.
	 *
	 * @param {object} oTestSetup - The test setup configuration.
	 * @param {boolean} oTestSetup.isDefaultAdaptation - Indicates if the default adaptation ID should be used.
	 * @param {boolean} oTestSetup.isContextBasedEnabled - Indicates if context-based adaptation is enabled.
	 * @param {boolean} oTestSetup.isHomePage - Indicates if it is the home page.
	 * @param {boolean} oTestSetup.isUI5Application - Indicates if it is a UI5 application.
	 */
	function setIsContextBasedAdaptationEnabledSettingsStub(oTestSetup) {
		sandbox.stub(FlexRuntimeInfoAPI, "getContextBasedAdaptationId").returns(
			oTestSetup.isDefaultAdaptation ? sDefaultAdaptationId : sAdaptationId
		);
		sandbox.stub(FlexRuntimeInfoAPI, "getContextBasedAdaptationTitle").returns(sAdaptationTitle);
	}

	/**
	 * Creates a mocked event object for the "onAppLoaded" event.
	 *
	 * @param {boolean} isHomePage - Indicates if the current application is the home page.
	 * @param {boolean} isUI5ApplicationType - Indicates if the application type is UI5.
	 * @returns {object} Mocked event object with a method to get the current application.
	 */
	function getMockedOnAppLoadedEvent(isHomePage, isUI5ApplicationType) {
		return {
			getParameters: () => {
				return {
					homePage: isHomePage,
					applicationType: isUI5ApplicationType ? "UI5" : "",
					getAllAppInfo: () => Promise.resolve({
						technicalAppComponentId: {
							value: "sample.app.id"
						}
					}),
					componentInstance: oComponentInstance
				};
			}
		};
	}

	/**
	 * Prepares a mocked version of the getCurrentApplication method for the App Lifecycle Service.
	 *
	 * @param {Object} oMockedLifecyleSerive - The mocked lifecycle service object to be extended.
	 * @param {Object} oTestSetup - The test setup object containing configuration for the mock.
	 * @param {boolean} oTestSetup.isHomePage - Indicates if the current application is the home page.
	 * @param {boolean} oTestSetup.isUI5Application - Indicates if the current application is a UI5 application.
	 * @returns {object} The extended lifecycle service object with the mocked getCurrentApplication method.
	 */
	function prepareMockedGetCurrentApplicationAppLifecycleService(oMockedLifecyleSerive, oTestSetup) {
		return {...oMockedLifecyleSerive, getCurrentApplication: () => {
			return {
				homePage: oTestSetup.isHomePage,
				applicationType: oTestSetup.isUI5Application ? "UI5" : "",
				getAllAppInfo: () => {
					return Promise.resolve({
						technicalAppComponentId: {
							value: "sample.app.id"
						}
					});
				},
				componentInstance: oComponentInstance
			};
		}};
	}

	/**
	 * Verifies the behavior of the App Lifecycle Service on application load.
	 *
	 * @param {object} assert - The QUnit assert object used for making assertions.
	 * @param {boolean} bSetAppInfoCalled - Indicates whether the setAppInfo method is expected to be called.
	 * @param {object} mockedAppLifecycleService - The mocked App Lifecycle Service object.
	 * @param {object} mockedAppLifecycleService.attachAppLoaded - The attachAppLoaded method of the mocked service.
	 * @param {object} mockedAppLifecycleService.setAppInfo - The setAppInfo method of the mocked service.
	 */
	function verifyAppLifecycleServiceBehaviorOnAppLoad(assert, bSetAppInfoCalled, mockedAppLifecycleService) {
		const sSetAppInfoAssertionCalled = bSetAppInfoCalled ? "setAppInfo is called" : "setAppInfo is not called";
		assert.strictEqual(mockedAppLifecycleService.attachAppLoaded.calledOnce, true, "attachAppLoaded is called once");
		assert.strictEqual(mockedAppLifecycleService.setAppInfo.called, bSetAppInfoCalled, sSetAppInfoAssertionCalled);
	}

	/**
	 * Determines if the application info should be called based on the test setup.
	 *
	 * @param {object} oTestSetup - The test setup object.
	 * @param {boolean} oTestSetup.isHomePage - Indicates if the current page is the home page.
	 * @param {boolean} oTestSetup.isUI5Application - Indicates if the current application is a UI5 application.
	 * @param {boolean} oTestSetup.isDefaultAdaptation - Indicates if the default adaptation is being used.
	 * @returns {boolean} - Returns true if the application info should be called, otherwise false.
	 */
	function shouldAppInfoShouldBeCalled(oTestSetup) {
		return !oTestSetup.isHomePage && oTestSetup.isUI5Application && !oTestSetup.isDefaultAdaptation;
	}

	QUnit.module("setAppInfo", {
		beforeEach() {
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ushell/api/BootstrapObserver"],
					stub: {
						ready() {
							return Promise.resolve();
						}
					}
				}
			]);
			sandbox.stub(Lib, "isLoaded").returns(true);
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(ManifestUtils, "getFlexReference").returns("sample.reference");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		[
			{ isHomePage: true, isUI5Application: true },
			{ isHomePage: true, isUI5Application: false },
			{ isHomePage: false, isUI5Application: true },
			{ isHomePage: false, isUI5Application: true, isDefaultAdaptation: true },
			{ isHomePage: false, isUI5Application: false },
			{ isHomePage: true, isUI5Application: true },
			{ isHomePage: true, isUI5Application: false },
			{ isHomePage: false, isUI5Application: true },
			{ isHomePage: false, isUI5Application: false }
		].forEach((oTestSetup) => {
			let sTestname = generateTestDescription(oTestSetup, true);
			QUnit.test(sTestname, (assert) => {
				const done = assert.async();
				const bSetAppInfoShouldBeCalled = shouldAppInfoShouldBeCalled(oTestSetup);
				const oAttachAppLoadedSpy = sandbox.stub(mockedAppLifecycleService, "attachAppLoaded");
				sandbox.stub(FlexUtils, "getUShellService").resolves(mockedAppLifecycleService);
				sandbox.spy(mockedAppLifecycleService, "setAppInfo");
				setIsContextBasedAdaptationEnabledSettingsStub(oTestSetup);
				// eslint-disable-next-line max-nested-callbacks
				oAttachAppLoadedSpy.callsFake(async () => {
					await FLPAboutInfo.onAppLoadedListener(
						getMockedOnAppLoadedEvent(oTestSetup.isHomePage, oTestSetup.isUI5Application),
						mockedAppLifecycleService
					);
					verifyAppLifecycleServiceBehaviorOnAppLoad(assert, bSetAppInfoShouldBeCalled, mockedAppLifecycleService);
					if (bSetAppInfoShouldBeCalled) {
						const oAppInfo = mockedAppLifecycleService.setAppInfo.getCall(0).args[0];
						assert.strictEqual(oAppInfo.info.customProperties["ui5.flex.adaptation"].value, `${sAdaptationTitle} (${sAdaptationId})`);
					}
					done();
				});
				FLPAboutInfo.initialize();
			});

			sTestname = generateTestDescription(oTestSetup, false);
			QUnit.test(sTestname, (assert) => {
				const done = assert.async();
				const bSetAppInfoShouldBeCalled = shouldAppInfoShouldBeCalled(oTestSetup);
				const copiedMockedAppLifecycleService =
					prepareMockedGetCurrentApplicationAppLifecycleService(mockedAppLifecycleService, oTestSetup);
				const oAttachAppLoadedSpy = sandbox.stub(copiedMockedAppLifecycleService, "attachAppLoaded");
				sandbox.stub(FlexUtils, "getUShellService").resolves(copiedMockedAppLifecycleService);
				sandbox.spy(copiedMockedAppLifecycleService, "setAppInfo");
				setIsContextBasedAdaptationEnabledSettingsStub(oTestSetup);
				// eslint-disable-next-line max-nested-callbacks
				oAttachAppLoadedSpy.callsFake(() => {
					verifyAppLifecycleServiceBehaviorOnAppLoad(assert, bSetAppInfoShouldBeCalled, copiedMockedAppLifecycleService);
					if (bSetAppInfoShouldBeCalled) {
						const oAppInfo = copiedMockedAppLifecycleService.setAppInfo.getCall(0).args[0];
						assert.strictEqual(oAppInfo.info.customProperties["ui5.flex.adaptation"].value, `${sAdaptationTitle} (${sAdaptationId})`);
					}
					done();
				});
				FLPAboutInfo.initialize();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});