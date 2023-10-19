/* global QUnit */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/changeHandler/UpdateIFrame",
	"sap/ui/fl/util/IFrame",
	"sap/ui/fl/Utils",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	JsControlTreeModifier,
	XmlTreeModifier,
	Component,
	UIChange,
	UpdateIFrame,
	IFrame,
	Utils,
	VerticalLayout,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oComponent;
	var oComponentPromise = Component.create({
		name: "testComponentAsync",
		id: "testComponentAsync"
	}).then(function(oComponentInstance) {
		oComponent = oComponentInstance;
	});

	var sProtocol = "https";
	var sOpenUI5Url = `${sProtocol}://openu5/`;
	var sSapUI5Url = `${sProtocol}://sapui5/`;
	var sBoundUrl = "{model>/protocol}://{model>/flavor}/";
	var sDefaultSize = "500px";

	var mPropertyBag = {modifier: JsControlTreeModifier, appComponent: oComponent};

	QUnit.module("Given that update change handlers for an IFrame is created", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.oIFrame = new IFrame(oComponent.createId("iframe"), {
				width: sDefaultSize,
				height: sDefaultSize,
				url: sOpenUI5Url,
				_settings: {
					url: sOpenUI5Url
				}
			});

			this.oModel = new JSONModel({
				width: sDefaultSize,
				height: sDefaultSize,
				protocol: sProtocol,
				flavor: "sapui5"
			});
			this.oIFrame.setModel(this.oModel, "model");

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			var oChangeJson = {
				selector: JsControlTreeModifier.getSelector(this.oIFrame, oComponent)
			};

			this.mSapUI5UrlChange = {
				content: {
					url: sSapUI5Url
				}
			};

			this.oChange = new UIChange(oChangeJson);
			return this.oIFrame._oSetUrlPromise;
		},
		afterEach() {
			this.oIFrame.destroy();
			this.oModel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier are called", function(assert) {
			UpdateIFrame.completeChangeContent(this.oChange, this.mSapUI5UrlChange, mPropertyBag);

			return UpdateIFrame.applyChange(this.oChange, this.oIFrame, mPropertyBag)
			.then(function() {
				return this.oIFrame._oSetUrlPromise;
			}.bind(this))
			.then(function() {
				assert.strictEqual(this.oIFrame.getUrl(), sSapUI5Url, "then the IFrame url changes");
			}.bind(this));
		});

		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier are called and then reverted", function(assert) {
			var originalUrl = this.oIFrame.getUrl();

			UpdateIFrame.completeChangeContent(this.oChange, this.mSapUI5UrlChange, mPropertyBag);

			return UpdateIFrame.applyChange(this.oChange, this.oIFrame, mPropertyBag)
			.then(UpdateIFrame.revertChange.bind(UpdateIFrame, this.oChange, this.oIFrame, mPropertyBag))
			.then(function() {
				return this.oIFrame._oSetUrlPromise;
			}.bind(this))
			.then(function() {
				assert.strictEqual(this.oIFrame.getUrl(), originalUrl, "then the IFrame url is the same as before");
			}.bind(this));
		});

		QUnit.test("when an useLegacyNavigation update is reverted", async function(assert) {
			UpdateIFrame.completeChangeContent(
				this.oChange,
				{
					content: { useLegacyNavigation: true }
				},
				mPropertyBag
			);

			await UpdateIFrame.applyChange(this.oChange, this.oIFrame, mPropertyBag);
			await UpdateIFrame.revertChange(this.oChange, this.oIFrame, mPropertyBag);

			assert.strictEqual(
				this.oIFrame.getUseLegacyNavigation(),
				false,
				"then the useLegacyNavigation flag is the same as before"
			);
		});

		QUnit.test("when completeChangeContent & applyChange with JsControlTreeModifier and binding value are called", function(assert) {
			this.mSapUI5UrlChange.content.url = sBoundUrl;

			UpdateIFrame.completeChangeContent(this.oChange, this.mSapUI5UrlChange, mPropertyBag);

			return UpdateIFrame.applyChange(this.oChange, this.oIFrame, mPropertyBag)
			.then(function() {
				var oBindingInfo = this.oIFrame.getBindingInfo("url");
				assert.strictEqual(oBindingInfo.parts[0].path, "/protocol", "then the property value binding path has changed as expected");
				assert.strictEqual(oBindingInfo.parts[0].model, "model", "and the property value binding model has changed as expected");
				assert.strictEqual(this.oIFrame.getUrl(), sSapUI5Url, "and the property value is correct");
			}.bind(this));
		});

		QUnit.test("when a value is bound, completeChangeContent & applyChange with JsControlTreeModifier are called and then reverted", async function(assert) {
			this.oIFrame.applySettings({
				url: sBoundUrl,
				_settings: {
					url: sBoundUrl
				}
			});
			assert.strictEqual(this.oIFrame.getUrl(), sSapUI5Url, "the initial bound value is correct");
			this.mSapUI5UrlChange.content.url = sOpenUI5Url;

			UpdateIFrame.completeChangeContent(this.oChange, this.mSapUI5UrlChange, mPropertyBag);

			await UpdateIFrame.applyChange(this.oChange, this.oIFrame, mPropertyBag);
			await UpdateIFrame.revertChange(this.oChange, this.oIFrame, mPropertyBag);
			const oBindingInfo = this.oIFrame.getBindingInfo("url");
			assert.strictEqual(oBindingInfo.parts[0].path, "/protocol", "then the property value binding path does not change");
			assert.strictEqual(oBindingInfo.parts[0].model, "model", "and the property value binding model does not change");
			assert.strictEqual(this.oIFrame.getUrl(), sSapUI5Url, "and the property value is still correct");
		});

		QUnit.test("when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later", function(assert) {
			this.myLayoutId = "myLayout";
			this.oLayout = new VerticalLayout(oComponent.createId(this.myLayoutId), {
				content: [this.oIFrame]
			});

			var oDOMParser = new DOMParser();
			var oXmlString =
					`<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.ui.fl.util'>` +
						`<layout:VerticalLayout id='${this.oLayout.getId()}'>` +
							`<layout:content>` +
								`<IFrame id='${this.oIFrame.getId()}' url='${sOpenUI5Url}'>` +
								`</IFrame>` +
							`</layout:content>` +
						`</layout:VerticalLayout>` +
					`</mvc:View>`;

			var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
			this.oXmlView = oXmlDocument.documentElement;
			[this.oXmlLayout] = this.oXmlView.childNodes;
			[this.oXmlIFrame] = this.oXmlLayout.childNodes[0].childNodes;
			UpdateIFrame.completeChangeContent(this.oChange, this.mSapUI5UrlChange, mPropertyBag);

			return UpdateIFrame.applyChange(this.oChange, this.oXmlIFrame, {modifier: XmlTreeModifier})
			.then(function() {
				assert.equal(this.oXmlIFrame.getAttribute("url"), sSapUI5Url, "then the IFrame url changes");
				return UpdateIFrame.revertChange(this.oChange, this.oXmlIFrame, {modifier: XmlTreeModifier});
			}.bind(this))
			.then(function() {
				assert.equal(this.oXmlIFrame.getAttribute("url"), sOpenUI5Url, "then the IFrame url does not change");

				this.oLayout.destroy();
			}.bind(this));
		});

		// DISABLE since I have a question about this test
		// QUnit.test("when completeChangeContent & applyChange with XmlTreeModifier are called, and reverted later in XML and JS (on IFrame with binding)", function (assert) {
		// 	this.myLayoutId = "myLayout";
		// 	this.oLayout = new VerticalLayout(oComponent.createId(this.myLayoutId), {
		// 		content : [this.oIFrame]
		// 	});
		// 	this.oIFrame.applySettings({
		// 		url: sBoundUrl
		// 	});
		//
		// 	var oDOMParser = new DOMParser();
		// 	var oXmlString =
		// 		"<mvc:View xmlns:mvc='sap.ui.core.mvc' xmlns:layout='sap.ui.layout' xmlns='sap.ui.fl.util'>" +
		// 			"<layout:VerticalLayout id='" + this.oLayout.getId() + "'>" +
		// 				"<layout:content>" +
		// 					"<IFrame id='" + this.oIFrame.getId() + "' url='" + sBoundUrl + "'>" +
		// 					"</IFrame>" +
		// 				"</layout:content>" +
		// 			"</layout:VerticalLayout>" +
		// 		"</mvc:View>";
		//
		// 	var oXmlDocument = oDOMParser.parseFromString(oXmlString, "application/xml");
		// 	this.oXmlView = oXmlDocument.documentElement;
		// 	this.oXmlLayout = this.oXmlView.childNodes[0];
		// 	this.oXmlIFrame = this.oXmlLayout.childNodes[0].childNodes[0];
		//
		// 	this.mSapUI5UrlChange.settings.url = sOpenUI5Url;
		// 	UpdateIFrame.completeChangeContent(this.oChange, this.mSapUI5UrlChange, mPropertyBag);
		// 	UpdateIFrame.applyChange(this.oChange, this.oXmlIFrame, {modifier: XmlTreeModifier});
		// 	assert.equal(this.oXmlIFrame.getAttribute("url"), sOpenUI5Url, "then the iframe url changes");
		// 	// On BaseRename, this throws an error, not here.
		// 	UpdateIFrame.revertChange(this.oChange, this.oXmlIFrame, {modifier: XmlTreeModifier});
		// 	assert.equal(this.oXmlIFrame.getAttribute("url"), sBoundUrl, "but it can be reverted");
		//
		// 	// the revert data are saved on the change; set button text also on button control
		// 	this.oIFrame.setUrl(sOpenUI5Url);
		// 	UpdateIFrame.revertChange(this.oChange, this.oIFrame, {modifier: JsControlTreeModifier});
		// 	assert.equal(this.oButton.getUrl(), sSapUI5Url, "the url binding got reset and the value is correct");
		//
		// 	this.oLayout.destroy();
		// });

		QUnit.test("when completeChangeContent is called without a setting", function(assert) {
			assert.throws(
				UpdateIFrame.completeChangeContent.bind(this, this.oChange, {}, mPropertyBag),
				"then an error is thrown");
		});

		QUnit.test("when completeChangeContent is called without a value", function(assert) {
			delete this.mSapUI5UrlChange.content.url;

			assert.throws(
				UpdateIFrame.completeChangeContent.bind(this, this.oChange, this.mSapUI5UrlChange, mPropertyBag),
				"then an error is thrown");
		});
	});

	// TODO: Negative test to check if the error is properly raised when change is incomplete

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
