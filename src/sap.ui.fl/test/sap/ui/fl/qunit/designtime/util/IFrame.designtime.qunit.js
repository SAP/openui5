/* eslint-disable max-nested-callbacks */
/* global QUnit */

sap.ui.define([
	"sap/m/Label",
	"sap/ui/fl/designtime/util/IFrame.designtime",
	"sap/ui/fl/util/IFrame",
	"sap/ui/rta/plugin/iframe/AddIFrameDialog",
	"sap/ui/thirdparty/sinon-4"
], function(
	Label,
	IFrameDesigntime,
	IFrame,
	AddIFrameDialog,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given an IFrame with renameInfo, when the UpdateIFrame dialog gets opened and closed", {
		beforeEach() {
			this.oOpenDialogStub = sandbox.stub(AddIFrameDialog.prototype, "open");
			sandbox.stub(AddIFrameDialog, "buildUrlBuilderParametersFor").resolves({});
			this.oIFrame = new IFrame({
				width: "100px",
				height: "100px",
				url: "https://example.com",
				title: "myInitialTitle",
				renameInfo: {
					propertyName: "text",
					selectorControlId: "labelId",
					sourceControlId: "labelId"
				}
			});
			this.oLabel = new Label("labelId", {text: "myInitialTitle"});
			this.oIFrame.placeAt("qunit-fixture");
		},
		afterEach() {
			this.oIFrame.destroy();
			this.oLabel.destroy();
			sandbox.restore();
		}
	}, function() {
		[
			{
				testTitle: "everything changed",
				dialogReturn: {
					frameWidth: "50",
					frameWidthUnit: "px",
					frameHeight: "100",
					frameHeightUnit: "vh",
					frameUrl: "newUrl",
					title: "myNewTitle",
					advancedSettings: {
						additionalSandboxParameters: [],
						allowForms: true,
						allowPopups: true,
						allowScripts: true,
						allowModals: true,
						allowSameOrigin: true
					}

				},
				updateContent: {
					url: "newUrl",
					width: "50px",
					height: "100vh",
					advancedSettings: {
						additionalSandboxParameters: [],
						allowForms: true,
						allowPopups: true,
						allowScripts: true,
						allowModals: true,
						allowSameOrigin: true
					}
				},
				renameContent: {
					value: "myNewTitle"
				}
			},
			{
				testTitle: "only title changed",
				dialogReturn: {
					frameWidth: "100",
					frameWidthUnit: "px",
					frameHeight: "100",
					frameHeightUnit: "px",
					frameUrl: "https://example.com",
					title: "myNewTitle"
				},
				renameContent: {
					value: "myNewTitle"
				}
			},
			{
				testTitle: "only frameWidth changed",
				dialogReturn: {
					frameWidth: "50",
					frameWidthUnit: "px",
					frameHeight: "100",
					frameHeightUnit: "px",
					frameUrl: "https://example.com",
					title: "myInitialTitle"
				},
				updateContent: {
					url: "https://example.com",
					width: "50px",
					height: "100px"
				}
			},
			{
				testTitle: "only frameHeightUnit changed",
				dialogReturn: {
					frameWidth: "100",
					frameWidthUnit: "px",
					frameHeight: "100",
					frameHeightUnit: "%",
					frameUrl: "https://example.com",
					title: "myInitialTitle"
				},
				updateContent: {
					url: "https://example.com",
					width: "100px",
					height: "100%"
				}
			},
			{
				testTitle: "only advancedSettings changed",
				dialogReturn: {
					frameWidth: "100",
					frameWidthUnit: "px",
					frameHeight: "100",
					frameHeightUnit: "px",
					frameUrl: "https://example.com",
					title: "myInitialTitle",
					advancedSettings: {
						additionalSandboxParameters: ["allow-pointer-lock"],
						allowForms: true,
						allowPopups: true,
						allowScripts: true,
						allowModals: true,
						allowSameOrigin: true
					}
				},
				updateContent: {
					url: "https://example.com",
					width: "100px",
					height: "100px",
					advancedSettings: {
						additionalSandboxParameters: ["allow-pointer-lock"],
						allowForms: true,
						allowPopups: true,
						allowScripts: true,
						allowModals: true,
						allowSameOrigin: true
					}
				}
			},
			{
				testTitle: "nothing changed",
				dialogReturn: {
					frameWidth: "100",
					frameWidthUnit: "px",
					frameHeight: "100",
					frameHeightUnit: "px",
					frameUrl: "https://example.com",
					title: "myInitialTitle"
				}
			},
			{
				testTitle: "cancel was pressed",
				dialogReturn: undefined
			}
		].forEach(function(oTestInput) {
			QUnit.test(oTestInput.testTitle, function(assert) {
				this.oOpenDialogStub.resolves(oTestInput.dialogReturn);
				var oAction = IFrameDesigntime.actions.settings();
				return oAction.handler(this.oIFrame).then(function(aChanges) {
					var nChanges = 0;
					if (oTestInput.updateContent) {
						assert.deepEqual(
							aChanges[nChanges].changeSpecificData.content,
							oTestInput.updateContent,
							"the update content is correct"
						);
						assert.strictEqual(aChanges[nChanges].selectorControl, this.oIFrame, "the iFrame is set as selector");
						assert.strictEqual(aChanges[nChanges].changeSpecificData.changeType, "updateIFrame", "the changeType is set");
						nChanges++;
					}
					if (oTestInput.renameContent) {
						assert.deepEqual(
							aChanges[nChanges].changeSpecificData.content,
							oTestInput.renameContent,
							"the rename content is correct"
						);
						assert.strictEqual(aChanges[nChanges].selectorControl, this.oLabel, "the label is set as selector");
						assert.strictEqual(aChanges[nChanges].changeSpecificData.changeType, "rename", "the changeType is set");
						nChanges++;
					}
					assert.strictEqual(aChanges.length, nChanges, "the correct amount of changes is returned");
				}.bind(this));
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});