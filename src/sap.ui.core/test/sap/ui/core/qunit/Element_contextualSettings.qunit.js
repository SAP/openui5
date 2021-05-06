/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Element"
], function(Device, Element) {
	"use strict";

	QUnit.module("Contextual Settings", {
		beforeEach: function() {
			this.element = new Element();
		},
		afterEach: function() {
			this.element.destroy();
		}
	});

	QUnit.test("Contextual width", function(assert) {

		assert.equal(this.element._getMediaContainerWidth(), undefined, "Container media width is undefined by default");

		this.element._applyContextualSettings({contextualWidth: 500});
		assert.equal(this.element._getMediaContainerWidth(), 500, "Container media width is defined, if contextualWidth was set");
	});

	QUnit.test("attach/detach - no contextual width", function(assert) {

		var deviceAttachHandlerSpy = this.spy(Device.media, "attachHandler");
		var deviceDetachHandlerSpy = this.spy(Device.media, "detachHandler");

		var fnHandler = this.spy();
		this.element._attachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(deviceAttachHandlerSpy.calledOnce, "Device.media is used when no contextual width is given");

		this.element._detachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(deviceDetachHandlerSpy.calledOnce, "Device.media is used when no contextual width is given");


		deviceAttachHandlerSpy.restore();
		deviceDetachHandlerSpy.restore();
	});

	QUnit.test("attach/detach - contextual width given", function(assert) {

		var deviceAttachHandlerSpy = this.spy(Device.media, "attachHandler");
		var deviceDetachHandlerSpy = this.spy(Device.media, "detachHandler");

		this.element._applyContextualSettings({contextualWidth: 500});

		var fnHandler = this.spy();
		this.element._attachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(!deviceAttachHandlerSpy.called, "Device.media is not used when contextual width is given");

		this.element._detachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(!deviceDetachHandlerSpy.called, "Device.media is not used when contextual width is given");

		deviceAttachHandlerSpy.restore();
		deviceDetachHandlerSpy.restore();
	});

	QUnit.test("attach/detach - Contextual width given after attach", function(assert) {

		var deviceAttachHandlerSpy = this.spy(Device.media, "attachHandler");
		var deviceDetachHandlerSpy = this.spy(Device.media, "detachHandler");

		var fnHandler = this.spy();
		this.element._attachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(deviceAttachHandlerSpy.calledOnce, "Device.media handler is attached");

		this.element._applyContextualSettings({contextualWidth: 500});
		assert.ok(deviceDetachHandlerSpy.calledOnce, "Applying contextual settings causes the Device.media handler to be detached");

		this.element._detachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.equal(deviceDetachHandlerSpy.callCount, 1, "Device.media detach handler is not called again");

		deviceAttachHandlerSpy.restore();
		deviceDetachHandlerSpy.restore();
	});

	QUnit.test("attach/detach - Contextual width removed after attach", function(assert) {

		var deviceAttachHandlerSpy = this.spy(Device.media, "attachHandler");
		var deviceDetachHandlerSpy = this.spy(Device.media, "detachHandler");

		this.element._applyContextualSettings({contextualWidth: 500});

		var fnHandler = this.spy();
		this.element._attachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(!deviceAttachHandlerSpy.called, "Initially Device.media handler is not attached");

		this.element._applyContextualSettings({});
		assert.ok(deviceAttachHandlerSpy.calledOnce, "Only after contextual settings are removed, Device.media handler is attached");

		this.element._detachMediaContainerWidthChange(fnHandler, this.element, "Std");
		assert.ok(deviceDetachHandlerSpy.called, "Device.media detach called");

		// Reapply contextual settings and attach the handler again
		this.element._applyContextualSettings({contextualWidth: 500});
		this.element._attachMediaContainerWidthChange(fnHandler, this.element, "Std");

		assert.equal(deviceAttachHandlerSpy.callCount, 1, "Device.media handler is not attached");

		deviceAttachHandlerSpy.restore();
		deviceDetachHandlerSpy.restore();
	});

	QUnit.test("_onContextualSettingsChanged - Listeners called on breakpoint changes only", function(assert) {

		var fnHandler1 = this.spy();
		var fnHandler2 = this.spy();
		this.element._applyContextualSettings({contextualWidth: 500});


		this.element._attachMediaContainerWidthChange(fnHandler1, this.element, "Std"); // points: [600, 1024]
		this.element._attachMediaContainerWidthChange(fnHandler2, this.element, "StdExt"); // points: [600, 1024, 1440]

		assert.equal(fnHandler1.callCount, 0, "Handler not called on attach");
		assert.equal(fnHandler2.callCount, 0, "Handler not called on attach");

		this.element._applyContextualSettings({contextualWidth: 501});
		assert.equal(fnHandler1.callCount, 0, "Handler not called on width change that doesn't cause a breakpoint switch");
		assert.equal(fnHandler2.callCount, 0, "Handler not called on width change that doesn't cause a breakpoint switch");

		this.element._applyContextualSettings({contextualWidth: 1100});
		assert.equal(fnHandler1.callCount, 1, "Handler called");
		assert.equal(fnHandler2.callCount, 1, "Handler called");

		this.element._applyContextualSettings({contextualWidth: 1500});
		assert.equal(fnHandler1.callCount, 1, "Handler not called - no breakpoint switch for it");
		assert.equal(fnHandler2.callCount, 2, "Handler called");

	});

	QUnit.test("_onContextualSettingsChanged - unknown device media range set", function(assert) {
		assert.expect(1);
		var fnHandler1 = this.spy();
		this.element._applyContextualSettings({contextualWidth: 500});
		this.element._attachMediaContainerWidthChange(fnHandler1, this.element, "UnknownRangeSet");
		this.element._applyContextualSettings({contextualWidth: 1100});
		assert.equal(fnHandler1.callCount, 0, "Handler not called on attach");
	});

});