/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/rta/util/ai/AIVisualization",
	"sap/ui/rta/util/ai/FrontendActionError",
	"sap/ui/rta/util/ai/FrontendActionResult",
	"sap/ui/rta/api/FrontendActionsAPI",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/service/Action",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	ElementOverlay,
	OverlayRegistry,
	DelegateMediatorAPI,
	SupportAPI,
	AIVisualization,
	FrontendActionError,
	FrontendActionResult,
	FrontendActionsAPI,
	RuntimeAuthoring,
	actionService,
	ReloadManager,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("FrontendActionError", {}, function() {
		QUnit.test("when constructed with a code and a message", function(assert) {
			const oError = new FrontendActionError(FrontendActionError.ErrorCodes.CONTROL_NOT_FOUND, "not there");
			assert.strictEqual(oError.getCode(), "CONTROL_NOT_FOUND", "then getCode returns the passed code");
			assert.strictEqual(oError.getMessage(), "not there", "then getMessage returns the passed message");
		});

		QUnit.test("when constructed without arguments", function(assert) {
			const oError = new FrontendActionError();
			assert.strictEqual(
				oError.getCode(),
				FrontendActionError.ErrorCodes.GENERIC_ERROR,
				"then the code defaults to GENERIC_ERROR"
			);
			assert.strictEqual(oError.getMessage(), null, "then the message defaults to null");
		});

		QUnit.test("when it is created", function(assert) {
			const oError = new FrontendActionError();
			assert.ok(Object.isFrozen(oError), "then the instance is frozen (immutable)");
		});

		QUnit.test("when reading the ErrorCodes enum", function(assert) {
			assert.deepEqual(
				FrontendActionError.ErrorCodes,
				{
					GENERIC_ERROR: "GENERIC_ERROR",
					CONTROL_NOT_FOUND: "CONTROL_NOT_FOUND",
					INVALID_PARAMETERS: "INVALID_PARAMETERS",
					USER_NOT_KEYUSER: "USER_NOT_KEYUSER"
				},
				"then it exposes exactly the documented codes with matching string values"
			);
		});
	});

	QUnit.module("FrontendActionResult", {}, function() {
		QUnit.test("when built through the success factory", function(assert) {
			const oResult = FrontendActionResult.success({ answer: 42 });
			assert.strictEqual(oResult.isSuccess, true, "then isSuccess is true");
			assert.deepEqual(oResult.payload, { answer: 42 }, "then the payload is carried");
			assert.strictEqual(oResult.error, null, "then there is no error");
			assert.ok(Object.isFrozen(oResult), "then the instance is frozen");
		});

		QUnit.test("when built through the success factory without a payload", function(assert) {
			const oResult = FrontendActionResult.success();
			assert.strictEqual(oResult.payload, null, "then the payload defaults to null");
		});

		QUnit.test("when built through the failure factory with a code and message", function(assert) {
			const oResult = FrontendActionResult.failure(FrontendActionError.ErrorCodes.INVALID_PARAMETERS, "bad input");
			assert.strictEqual(oResult.isSuccess, false, "then isSuccess is false");
			assert.strictEqual(oResult.payload, null, "then there is no payload");
			assert.ok(oResult.error instanceof FrontendActionError, "then the error is wrapped into a FrontendActionError");
			assert.strictEqual(oResult.error.getCode(), "INVALID_PARAMETERS", "then the wrapped error carries the code");
			assert.strictEqual(oResult.error.getMessage(), "bad input", "then the wrapped error carries the message");
		});

		QUnit.test("when built through the failure factory with a ready-made error", function(assert) {
			const oError = new FrontendActionError(FrontendActionError.ErrorCodes.USER_NOT_KEYUSER, "nope");
			const oResult = FrontendActionResult.failure(oError);
			assert.strictEqual(oResult.error, oError, "then the passed error is carried through unchanged (not re-wrapped)");
		});
	});

	QUnit.module("FrontendActionsAPI.setStatusReporter", {
		beforeEach() {
			sandbox.stub(AIVisualization, "removeBlockingOverlay");
		},
		afterEach() {
			FrontendActionsAPI.setStatusReporter();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when replacing a custom reporter", function(assert) {
			const oRemoveBlockingOverlaySpy = sandbox.spy();
			FrontendActionsAPI.setStatusReporter({ removeBlockingOverlay: oRemoveBlockingOverlaySpy });

			FrontendActionsAPI.setStatusReporter({});

			assert.strictEqual(oRemoveBlockingOverlaySpy.callCount, 1, "then the previous reporter is cleaned up");
		});

		QUnit.test("when resetting to the default reporter", function(assert) {
			const oRemoveBlockingOverlaySpy = sandbox.spy();
			FrontendActionsAPI.setStatusReporter({ removeBlockingOverlay: oRemoveBlockingOverlaySpy });

			FrontendActionsAPI.setStatusReporter();

			assert.strictEqual(oRemoveBlockingOverlaySpy.callCount, 1, "then the custom reporter is cleaned up");
		});

		QUnit.test("when installing the predefined NoopStatusReporter", function(assert) {
			assert.ok(FrontendActionsAPI.NoopStatusReporter, "then the predefined no-op reporter is exposed");
			assert.strictEqual(
				typeof FrontendActionsAPI.NoopStatusReporter.setStatus, "function",
				"then it carries the reporter hooks"
			);
			assert.ok(Object.isFrozen(FrontendActionsAPI.NoopStatusReporter), "then it is frozen against mutation");

			// Installing the no-op reporter must NOT route cleanup to the on-screen
			// visualization: the previous reporter is the noop, so its (no-op)
			// removeBlockingOverlay runs, not AIVisualization's.
			const oAIVisualizationRemoveSpy = AIVisualization.removeBlockingOverlay;
			FrontendActionsAPI.setStatusReporter(FrontendActionsAPI.NoopStatusReporter);
			oAIVisualizationRemoveSpy.resetHistory();
			FrontendActionsAPI.setStatusReporter({});

			assert.strictEqual(
				oAIVisualizationRemoveSpy.callCount, 0,
				"then replacing the no-op reporter does not touch the on-screen visualization"
			);
		});
	});

	// These guard tests MUST run before any startRTA populates the module-scoped
	// oRta — they assert the "RTA not started" behavior of a fresh module.
	QUnit.module("Given FrontendActionsAPI without a started RTA", {
		beforeEach() {
			// Silence the on-screen reporter so no DOM/timers are created.
			sandbox.stub(AIVisualization, "setStatus");
			sandbox.stub(AIVisualization, "highlightOverlay");
			sandbox.stub(AIVisualization, "removeBlockingOverlay");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		[
			{ name: "getOverlaysInformation", args: undefined },
			{ name: "callAction", args: { controlId: "c1", actionId: "a1" } },
			{ name: "getContext", args: { controlId: "c1", actionId: "a1" } },
			{ name: "saveChanges", args: undefined },
			{ name: "saveAndActivateChanges", args: { title: "v1" } }
		].forEach(function(oCase) {
			QUnit.test(`when ${oCase.name} is called before startRTA`, async function(assert) {
				const oResult = await FrontendActionsAPI[oCase.name](oCase.args);
				assert.strictEqual(oResult.isSuccess, false, "then a failure envelope is returned (no raw rejection)");
				assert.strictEqual(
					oResult.error.getCode(),
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					"then the error carries the GENERIC_ERROR code"
				);
				assert.ok(
					oResult.error.getMessage().includes("not started"),
					"then the message tells the driver RTA is not started"
				);
			});
		});

		QUnit.test("when cleanup is called", function(assert) {
			const oResult = FrontendActionsAPI.cleanup({ reason: "done" });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.deepEqual(oResult.payload, { cleaned: true }, "then the payload reports cleaned");
			assert.strictEqual(
				AIVisualization.removeBlockingOverlay.callCount, 1,
				"then the blocking overlay is removed"
			);
		});

		QUnit.test("when cleanup is called without arguments", function(assert) {
			FrontendActionsAPI.cleanup();
			assert.ok(true, "then it does not throw when called without arguments");
		});

		QUnit.test("when getApplicationInfo is called", async function(assert) {
			const oGetEntryStub = sandbox.stub();
			oGetEntryStub.withArgs("sap.app").returns({
				id: "test.app",
				title: "{{appTitle}}",
				applicationVersion: { version: "1.2.3" }
			});
			oGetEntryStub.withArgs("/sap.app/title").returns("Resolved App Title");
			sandbox.stub(SupportAPI, "getApplicationComponent").resolves({
				getManifestObject() {
					return { getEntry: oGetEntryStub };
				}
			});

			const oResult = await FrontendActionsAPI.getApplicationInfo();

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.strictEqual(oResult.payload.appTitle, "Resolved App Title", "then the resolved manifest title is returned");
			assert.strictEqual(oResult.payload.appId, "test.app", "then the application ID is returned");
			assert.strictEqual(oResult.payload.appVersion, "1.2.3", "then the application version is returned");
		});
	});

	let oComp;
	const oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture").then(function(oCompContainer) {
		oComp = oCompContainer.getComponentInstance();
	});

	// startRTA keeps the RTA instance module-private. To assert on it we wrap
	// RuntimeAuthoring#start and record `this` — the instance the API built — as
	// each start resolves. aStartedInstances[n] is the RTA of the (n+1)-th start.
	function trackStartedInstances() {
		const aStartedInstances = [];
		// Default behavior: record the instance and run the real start. Tests can
		// override a specific call via aStartedInstances.startStub.onFirstCall(),
		// but the instance is still recorded here so afterEach tears it down.
		const oStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start").callsFake(function(...aArgs) {
			if (!aStartedInstances.includes(this)) {
				aStartedInstances.push(this);
			}
			return oStartStub.wrappedMethod.apply(this, aArgs);
		});
		aStartedInstances.startStub = oStartStub;
		return aStartedInstances;
	}

	async function stopRta(oRta) {
		if (!oRta || typeof oRta.isDestroyed !== "function" || oRta.isDestroyed()) {
			return;
		}
		// A genuinely started RTA is torn down through its real stop lifecycle so
		// DesignTime/overlays and the toolbar are removed and FrontendActionsAPI's
		// stop handler resets its module state.
		if (oRta._sStatus === "STARTED") {
			const pStopped = new Promise((resolve) => {
				oRta.attachEventOnce("stop", resolve);
			});
			oRta.stop();
			await pStopped;
			// An instance started directly via `new RuntimeAuthoring().start()`
			// (rather than through startAdaptation) has no stop->destroy handler,
			// so stop() alone leaves its toolbar/overlays behind. Destroy it too.
			if (!oRta.isDestroyed()) {
				oRta.destroy();
			}
			return;
		}
		// Never-/half-started instances (e.g. one created by a stubbed start that
		// rejected, or one handed in via the softReloadDeferred) have no live stop
		// lifecycle. Destroy them directly — do NOT fireStop(), which would
		// double-trigger the destroy handler adaptationStarter attaches to its own
		// instance.
		oRta.destroy();
	}

	QUnit.module("Given FrontendActionsAPI drives a real RTA session", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			sandbox.stub(AIVisualization, "setStatus");
			sandbox.stub(AIVisualization, "highlightOverlay");
			sandbox.stub(AIVisualization, "removeBlockingOverlay");
			sandbox.stub(ReloadManager, "triggerReload").resolves();
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves();
			// startRTA resolves the root through SupportAPI — point it at the test component.
			this.oGetAppComponentStub = sandbox.stub(SupportAPI, "getApplicationComponent").resolves(oComp);
			this.aStartedInstances = trackStartedInstances();
		},
		async afterEach() {
			// Stop every live RTA the test started so the module state (oRta/
			// pRtaStart) resets and the DesignTime/overlays are torn down before
			// the next test.
			for (const oRta of this.aStartedInstances) {
				await stopRta(oRta);
			}
			// Backstop: RuntimeAuthoring#destroy normally clears this, but a
			// never-started instance adopted in a test would otherwise leak it.
			if (RuntimeAuthoring.getCurrentInstance()) {
				RuntimeAuthoring.getCurrentInstance().destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when startRTA is called", async function(assert) {
			const oResult = await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.deepEqual(oResult.payload, { rtaStarted: true }, "then the payload reports rtaStarted");
			assert.strictEqual(this.aStartedInstances.length, 1, "then exactly one RTA instance was started");
		});

		QUnit.test("when startRTA is called while RTA is already started", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oStartedRta = this.aStartedInstances[0];
			const oAttachEventOnceSpy = sandbox.spy(oStartedRta, "attachEventOnce");

			const oResult = await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.strictEqual(this.aStartedInstances.length, 1, "then no additional RTA instance is started");
			assert.strictEqual(oAttachEventOnceSpy.callCount, 0, "then no additional stop handler is attached");
		});

		QUnit.test("when RTA is stopped and startRTA is called again", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oFirstRta = this.aStartedInstances[0];

			await stopRta(oFirstRta);
			assert.strictEqual(oFirstRta.isDestroyed(), true, "then the first instance is destroyed on stop");

			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oSecondRta = this.aStartedInstances[1];

			assert.strictEqual(this.aStartedInstances.length, 2, "then a second RTA instance was started");
			assert.notStrictEqual(oSecondRta, oFirstRta, "then the stopped instance was not reused");
			assert.strictEqual(oSecondRta.isDestroyed(), false, "then the fresh instance is alive");
		});

		QUnit.test("when startRTA starts a fresh RTA", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oStartedRta = this.aStartedInstances[0];

			assert.strictEqual(
				oStartedRta.getNonInteractiveMode(), true,
				"then RTA is started in non-interactive mode so no dialog blocks the driver"
			);
			assert.ok(
				oStartedRta.getSoftReloadDeferred(),
				"then a softReloadDeferred is handed in so a soft reload during start can be awaited"
			);
		});

		QUnit.test("when RTA was already started manually before startRTA", async function(assert) {
			// Simulate the user having started RTA via the FLP "Adapt UI" entry.
			// Start it through the same tracked path so afterEach tears it down.
			const oExistingRta = new RuntimeAuthoring({ rootControl: oComp, nonInteractiveMode: true });
			this.aStartedInstances.push(oExistingRta);
			await oExistingRta.start();
			assert.strictEqual(RuntimeAuthoring.getCurrentInstance(), oExistingRta, "given RuntimeAuthoring registered the live instance");

			const oResult = await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.strictEqual(
				this.aStartedInstances.length, 1,
				"then no additional RTA instance is started (the running one is adopted)"
			);

			// The adopted instance drives the follow-up actions.
			const oOverlays = await FrontendActionsAPI.getOverlaysInformation();
			assert.strictEqual(oOverlays.isSuccess, true, "then subsequent actions run against the adopted instance");
		});

		QUnit.test("when startRTA is triggered while a soft reload happens during start", async function(assert) {
			// A soft reload (personalization/versioning) makes the initial start
			// reject with "Reload triggered"; the real, restarted instance arrives
			// through the softReloadDeferred instead. Stub start to resolve the
			// injected deferred with a live instance, then reject the first start.
			const oReloadedRta = new RuntimeAuthoring({ rootControl: oComp });
			this.aStartedInstances.push(oReloadedRta);
			const { aStartedInstances } = this;
			this.aStartedInstances.startStub.onFirstCall().callsFake(function() {
				aStartedInstances.push(this);
				this.getSoftReloadDeferred().resolve(oReloadedRta);
				return Promise.reject(new Error("Reload triggered"));
			});

			const oResult = await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.deepEqual(oResult.payload, { rtaStarted: true }, "then the payload reports rtaStarted");

			// FrontendActionsAPI adopted the reloaded instance and wired its own
			// stop handler to it; fire that so its module state (oRta/pRtaStart)
			// resets before the next test, then afterEach destroys the instance.
			oReloadedRta.fireStop();
		});

		QUnit.test("when getOverlaysInformation is called", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			const oResult = await FrontendActionsAPI.getOverlaysInformation();

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.ok(Array.isArray(oResult.payload.overlays), "then it carries an overlays array");
			assert.strictEqual(typeof oResult.payload.actionsCatalog, "object", "then it carries an actionsCatalog map");
			// Only actions whose plugin opted in via a non-empty description are
			// surfaced — every listed action id must resolve to a catalog entry.
			const aAllListedActionIds = oResult.payload.overlays.flatMap((oOverlay) => oOverlay.actionIds);
			aAllListedActionIds.forEach((sActionId) => {
				assert.ok(oResult.payload.actionsCatalog[sActionId], `then listed action '${sActionId}' has a catalog entry`);
			});
		});

		QUnit.test("when the first startRTA fails and startRTA is called again", async function(assert) {
			// Fail the underlying start once, then let it succeed. This exercises
			// the reset of the cached start promise: without it, the rejected
			// pRtaStart would be reused and every retry would fail forever.
			const oError = new Error("boom");
			this.oGetAppComponentStub.onFirstCall().rejects(oError);

			const oFailure = await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			assert.strictEqual(oFailure.isSuccess, false, "then the first call returns a failure envelope (no raw rejection)");
			assert.strictEqual(
				oFailure.error.getCode(),
				FrontendActionError.ErrorCodes.GENERIC_ERROR,
				"then the failure carries the GENERIC_ERROR code"
			);
			assert.strictEqual(oFailure.error.getMessage(), "boom", "then the failure carries the underlying error message");

			const oSuccess = await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			assert.strictEqual(oSuccess.isSuccess, true, "then the retry succeeds (the rejected start was not cached)");
			assert.deepEqual(oSuccess.payload, { rtaStarted: true }, "then the retry reports rtaStarted");
		});

		QUnit.test("when callAction is invoked with an unknown control", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			const oResult = await FrontendActionsAPI.callAction({ controlId: "does-not-exist", actionId: "CTX_RENAME" });

			assert.strictEqual(oResult.isSuccess, false, "then a failure envelope is returned instead of a raw rejection");
			assert.strictEqual(
				oResult.error.getCode(),
				FrontendActionError.ErrorCodes.GENERIC_ERROR,
				"then the failure carries the GENERIC_ERROR code"
			);
		});

		QUnit.test("when getContext is invoked with an unknown control", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });

			const oResult = await FrontendActionsAPI.getContext({ controlId: "does-not-exist", actionId: "CTX_RENAME" });

			assert.strictEqual(oResult.isSuccess, false, "then a failure envelope is returned");
			assert.strictEqual(
				oResult.error.getCode(),
				FrontendActionError.ErrorCodes.CONTROL_NOT_FOUND,
				"then the failure reports the missing control"
			);
		});

		QUnit.test("when callAction omits a required parameter (null payload)", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oAction = await findActionWithRequiredParam(this.aStartedInstances[0]);
			assert.ok(oAction, "given an editable control exposing an action with a required parameter");

			// A null payload must be normalized to {} so the required-parameter
			// check runs (rather than throwing on a property read of null), and
			// the driver gets a typed INVALID_PARAMETERS failure back.
			const oResult = await FrontendActionsAPI.callAction({
				controlId: oAction.controlId,
				actionId: oAction.actionId,
				payload: null
			});

			assert.strictEqual(oResult.isSuccess, false, "then a failure envelope is returned");
			assert.strictEqual(
				oResult.error.getCode(),
				FrontendActionError.ErrorCodes.INVALID_PARAMETERS,
				"then the failure reports the missing required parameter"
			);
			assert.ok(
				oResult.error.getMessage().includes(oAction.requiredParamName),
				"then the message names the missing parameter"
			);
		});
		QUnit.test("when getContext is called for an aggregation-relevant action, then aggregationsByClass is populated", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oAction = await findActionByAggregationRelevant(this.aStartedInstances[0], true);
			assert.ok(oAction, "given an editable control exposing an aggregation-relevant action");

			const oResult = await FrontendActionsAPI.getContext({ controlId: oAction.controlId, actionId: oAction.actionId });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.ok(
				Array.isArray(oResult.payload.aggregationsByClass) && oResult.payload.aggregationsByClass.length > 0,
				"then aggregationsByClass is non-empty for an aggregation-relevant action"
			);
		});

		QUnit.test("when getContext is called for an action without aggregationRelevant, then aggregationsByClass is empty", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oAction = await findActionByAggregationRelevant(this.aStartedInstances[0], false);
			assert.ok(oAction, "given an editable control exposing an action without aggregationRelevant");

			const oResult = await FrontendActionsAPI.getContext({ controlId: oAction.controlId, actionId: oAction.actionId });

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			assert.deepEqual(
				oResult.payload.aggregationsByClass,
				[],
				"then aggregationsByClass is empty for an action that does not need aggregation info"
			);
		});

		QUnit.test("when getContext is called and a delegate resolves the entity type, then contextEntityType is populated", async function(assert) {
			await FrontendActionsAPI.startRTA({ agentName: "TestAgent" });
			const oAction = await findActionByAggregationRelevant(this.aStartedInstances[0], false);
			assert.ok(oAction, "given an editable control exposing an action");

			const sExpectedEntityType = "com.sap.test.MyEntity";
			const oStub = sandbox.stub(DelegateMediatorAPI, "getReadDelegateForControl").resolves({
				instance: { getEntityTypeByPath: sinon.stub().resolves(sExpectedEntityType) }
			});

			const oResult = await FrontendActionsAPI.getContext({ controlId: oAction.controlId, actionId: oAction.actionId });
			oStub.restore();

			assert.strictEqual(oResult.isSuccess, true, "then a success envelope is returned");
			const oModels = oResult.payload.availableModels;
			const aModelsWithContext = Object.values(oModels).filter((oEntry) => oEntry.contextPath);
			aModelsWithContext.forEach((oEntry) => {
				assert.strictEqual(
					oEntry.contextEntityType,
					sExpectedEntityType,
					`then contextEntityType is populated from the delegate for model '${oEntry.modelName}'`
				);
			});
		});
	});

	// Locates an editable control exposing an action by its aggregationRelevant flag value.
	// Iterates the OverlayRegistry directly rather than getOverlaysInformation so it does
	// not depend on the on-screen filter.
	async function findActionByAggregationRelevant(oRta, bAggregationRelevant) {
		const oActionService = actionService(oRta);
		const aElementOverlays = OverlayRegistry.getOverlays()
		.filter((oOverlay) => oOverlay instanceof ElementOverlay && oOverlay.isEditable?.() && !oOverlay.getIsPartOfTemplate());
		for (const oOverlay of aElementOverlays) {
			const sControlId = oOverlay.getElement().getId();
			// eslint-disable-next-line no-await-in-loop
			const aActions = await oActionService.exports.get([sControlId]).catch(() => []);
			const oFound = aActions.find((oAction) => !!oAction.aggregationRelevant === bAggregationRelevant);
			if (oFound) {
				return { controlId: sControlId, actionId: oFound.id };
			}
		}
		return null;
	}

	// Locates an editable control exposing an action with a required parameter
	// (e.g. Rename's newValue), driving the same action-service lookup callAction
	// uses. Iterates the OverlayRegistry directly rather than
	// getOverlaysInformation so it does not depend on the on-screen filter, whose
	// result varies with the hidden qunit-fixture's layout geometry.
	async function findActionWithRequiredParam(oRta) {
		const oActionService = actionService(oRta);
		const aElementOverlays = OverlayRegistry.getOverlays()
		.filter((oOverlay) => oOverlay instanceof ElementOverlay && oOverlay.isEditable?.() && !oOverlay.getIsPartOfTemplate());
		for (const oOverlay of aElementOverlays) {
			const sControlId = oOverlay.getElement().getId();
			// eslint-disable-next-line no-await-in-loop
			const aActions = await oActionService.exports.get([sControlId]).catch(() => []);
			const oFound = aActions.find((oAction) => (oAction.parameters || []).some((oParam) => oParam.required));
			if (oFound) {
				const oRequired = oFound.parameters.find((oParam) => oParam.required);
				return { controlId: sControlId, actionId: oFound.id, requiredParamName: oRequired.name };
			}
		}
		return null;
	}

	QUnit.done(function() {
		oComp?.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
