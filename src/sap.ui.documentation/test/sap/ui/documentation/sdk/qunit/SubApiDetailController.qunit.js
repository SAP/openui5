/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/SubApiDetail.controller",
	"sap/ui/core/mvc/XMLView"
],
function (
	SubApiDetailController,
	XMLView
) {
	"use strict";

	var mockView = `<mvc:View
			height="100%"
			xmlns:mvc="sap.ui.core.mvc"
			xmlns="sap.m"
			xmlns:uxap="sap.uxap">

			<uxap:ObjectPageLayout id="mockObjectPage">
				<uxap:ObjectPageSection id="methods">
					<uxap:ObjectPageSubSection title="mockMethodName">
						<Text id="test" text="mock content"/>
					</uxap:ObjectPageSubSection>
				</uxap:ObjectPageSection>
			</uxap:ObjectPageLayout>
		</mvc:View>`;


	QUnit.module("ScrollToEntity", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			XMLView.create({
				id: "mockView",
				definition: mockView
			}).then(function(oView) {
				this.oMockView = oView;
				this.oController = new SubApiDetailController();
				this.oController.connectToView(oView);
				this.oController._objectPage = this.oController.byId("mockObjectPage");
				fnDone();
			}.bind(this));
		},
		afterEach: function () {
			this.oMockView.destroy();
			this.oController.destroy();
			this.oController = null;
		}
	});

	QUnit.test("scroll to method", function (assert) {
		var scrollToSectionSpy = this.spy(this.oController._objectPage, "scrollToSection");
		this.oController.scrollToEntity("methods", "mockMethodName");
		assert.ok(scrollToSectionSpy.calledOnce);
	});

	QUnit.test("scroll to static method of module", function (assert) {
		var scrollToSectionSpy = this.spy(this.oController._objectPage, "scrollToSection");
		this.oController.scrollToEntity("methods", "module:mockMethodName");
		assert.ok(scrollToSectionSpy.calledOnce);
	});
});