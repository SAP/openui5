/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle",
	"sap/ui/fl/apply/_internal/changes/descriptor/InlineApplier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/requireAsync"
], function(
	Log,
	Manifest,
	SetTitle,
	InlineApplier,
	ApplyStrategyFactory,
	sinon,
	requireAsync
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Runtime: applyChanges", {
		beforeEach(assert) {
			const done = assert.async();
			fetch("test-resources/sap/ui/fl/qunit/testResources/descriptorChanges/InlineApplierManifest.json")
			.then((oTestApplierManifestResponse) => {
				return oTestApplierManifestResponse.json();
			})
			.then((oTestApplierManifestResponseJSON) => {
				this.oManifest = new Manifest(oTestApplierManifestResponseJSON);
				done();
			});

			this.RuntimeStrategy = ApplyStrategyFactory.getRuntimeStrategy();
			this.BuildStrategy = {
				registry() {
					return requireAsync("sap/ui/fl/apply/_internal/changes/descriptor/RegistrationBuild");
				}
			};
			this.fnChangePageConfigurationSpy = sandbox.spy(SetTitle, "applyChange");
			this.fnLogSpy = sandbox.stub(Log, "error");
		},
		afterEach() {
			sandbox.restore();
		}
	}, () => {
		QUnit.test("when calling 'applyChanges' with one runtime descriptor change and one not implemented change", function(assert) {
			return InlineApplier.applyChanges(this.oManifest, this.RuntimeStrategy).then(() => {
				assert.equal(this.fnChangePageConfigurationSpy.callCount, 1, "ChangePageConfiguration.applyChange is called once");
				assert.equal(this.fnLogSpy.callCount, 1, "1 error logged");
			});
		});
	});

	QUnit.done(() => {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});