/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/AnalyticsCloudHelper",
	"sap/ui/integration/Host"
], function (
	AnalyticsCloudHelper,
	Host
) {
	"use strict";

	QUnit.module("Widget loading", {
		beforeEach: function () {
			this.fnIncludeScriptStub = sinon.stub(AnalyticsCloudHelper, "_includeScript");
			this.fnIncludeScriptStub.callsFake(() => {
				sap.sac = {
					api: {
						widget: {
							setup: sinon.stub(),
							renderWidget: sinon.stub()
						}
					}
				};

				return Promise.resolve();
			});
		},
		afterEach: function () {
			this.fnIncludeScriptStub.restore();
			AnalyticsCloudHelper._pInitialize = null;
			delete sap.sac.api.widget;
		}
	});

	QUnit.test("loadWidget", async function (assert) {
		// Act
		await AnalyticsCloudHelper.loadWidget();

		// Assert
		assert.ok(this.fnIncludeScriptStub.calledOnce, "Script was included.");
		assert.ok(this.fnIncludeScriptStub.calledWith(AnalyticsCloudHelper.WIDGET_SCRIPT_SRC), "Src was correct.");
		assert.ok(sap.sac.api.widget.setup.calledOnce, "sap.sac.api.widget.setup was called.");
	});

	QUnit.test("loadWidget called 2 times", async function (assert) {
		// Act
		await AnalyticsCloudHelper.loadWidget();
		await AnalyticsCloudHelper.loadWidget();

		// Assert
		assert.ok(this.fnIncludeScriptStub.calledOnce, "Script was included only once.");

		assert.ok(sap.sac.api.widget.setup.calledOnce, "sap.sac.api.widget.setup was called only once.");
	});

	QUnit.test("Host can override the widget src", async function (assert) {
		// Arrange
		const oHost = new Host();

		oHost.getAnalyticsCloudWidgetSrc = () => {
			return "dummy-src";
		};

		// Act
		await AnalyticsCloudHelper.loadWidget(oHost);

		// Assert
		assert.ok(this.fnIncludeScriptStub.calledWith("dummy-src"), "Src was overridden successfully");

		// Clean up
		oHost.destroy();
	});
});
