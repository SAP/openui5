/*global QUnit */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler"
], function(Control, ResizeHandler) {
	"use strict";

	// Initialization
	var oResizeHandler = null;
	var oPlugin = {};
	oPlugin.startPlugin = function(oCore, bInit) {
		oResizeHandler = oCore.oResizeHandler;
	};
	oPlugin.stopPlugin = function(oCore) {};
	sap.ui.getCore().registerPlugin(oPlugin);

	var lastResizeTarget = null;
	var lastResizeTargetCtrl = null;
	var lastSize = null;

	function _register(oRef) {
		var sResizeListenerId = ResizeHandler.register(oRef, doOnResize);
		lastResizeTarget = null;
		lastResizeTargetCtrl = null;
		lastSize = null;
		return sResizeListenerId;
	}

	function doOnResize(oEvent) {
		lastResizeTarget = oEvent.target;
		lastResizeTargetCtrl = oEvent.control;
		lastSize = oEvent.size;
		QUnit.config.current.assert.ok(true, "ResizeHandler called");
	}

	function setStyle(id, style) {
		document.getElementById(id).setAttribute("style", style);
	}

	var TestControl = Control.extend("TestControl", {
		metadata : {
			properties : {
				"height" : {type: "sap.ui.core.CSSSize", defaultValue: "100px"},
				"width" : {type: "sap.ui.core.CSSSize", defaultValue: "100px"}
			}
		},

		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl)
					.style("width", oControl.getWidth())
					.style("height", oControl.getHeight())
					.class("ResizeAreaContainer")
					.openEnd();

					oRm.openStart("div", oControl.getId() + "-inner")
						.class("ResizeArea")
						.openEnd()
						.close("div");

				oRm.close("div");
			}
		}
	});

	var control = new TestControl("TestControl", {width: "100px", height: "100px"});
	control.placeAt("content");


	// Test functions

	QUnit.module("Basic");

	QUnit.test("Check ResizeHandler initialized", function(assert) {
		assert.ok(oResizeHandler, "ResizeHandler initialized");
	});

	QUnit.test("Check Register/Deregister", function(assert) {
		var oDomRef = document.getElementById("resizeArea");
		var currentNumberOfEventListeners = oResizeHandler.aResizeListeners.length;
		var sResizeListenerId = ResizeHandler.register(oDomRef, doOnResize);
		assert.equal(oResizeHandler.aResizeListeners.length, currentNumberOfEventListeners + 1, "Number of event listeners after registration");
		var bIsRegistered = false;
		oResizeHandler.aResizeListeners.forEach(function(oResizeListener) {
			if (oResizeListener.sId == sResizeListenerId) {
				bIsRegistered = true;
				assert.ok(oResizeListener.oDomRef == oDomRef, "Registered DOM Ref correct");
				assert.ok(oResizeListener.fHandler == doOnResize, "Registered Handler correct");
				return false; //break the loop
			}
		});
		assert.ok(bIsRegistered, "Listener registered correctly");
		ResizeHandler.deregister(sResizeListenerId);
		assert.equal(oResizeHandler.aResizeListeners.length, currentNumberOfEventListeners, "Number of event listeners after de-registration");
	});


	QUnit.module("DOM Element Resize");

	QUnit.test("Check DOM Resize", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);

		setStyle("resizeAreaContainer", "width:150px;height:150px;");

		setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});



	QUnit.test("Check DOM Resize width +1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:151px;height:150px;");
		setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width -1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:150px;height:150px;");
		window.setTimeout(function(){
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize height +1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:150px;height:151px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize height -1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:150px;height:150px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height +1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:151px;height:151px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height -1", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:150px;height:150px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height +101", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:251px;height:251px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize width and height -101", function(assert) {
		var done = assert.async();
		assert.expect(2);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		setStyle("resizeAreaContainer", "width:150px;height:150px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("DetachListener", function(assert) {
		var done = assert.async();
		assert.expect(1);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		ResizeHandler.deregister(sResizeListenerId);
		setStyle("resizeAreaContainer", "width:151px;height:150px;");
		setTimeout(function() {
			assert.ok(lastResizeTarget == null, "Listener should be NOT be called on DOM Resize after deregistering: " + lastResizeTarget);
			done();
		}, 300);
	});

	QUnit.test("Check DOM Resize while setting display:none", function(assert) {
		var done = assert.async();
		assert.expect(7);
		var oResizeAreaDom = document.getElementById("resizeArea");
		var sResizeListenerId = _register(oResizeAreaDom);
		assert.equal(oResizeAreaDom.offsetHeight, 150, "height should be 150px");

		// now make the parent invisible
		setStyle("resizeAreaContainer", "width:151px;height:150px;display:none;");
		assert.equal(oResizeAreaDom.offsetHeight, 0, "height should be 0px when the parent is display:none");

		setTimeout(function() {
			assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize due to display:none");
			lastResizeTarget = null;

			// now make the parent visible again
			setStyle("resizeAreaContainer", "width:151px;height:150px;");
			assert.equal(oResizeAreaDom.offsetHeight, 150, "height should be 150px again when the parent is display:block");

			setTimeout(function() {
				assert.ok(lastResizeTarget == oResizeAreaDom, "Listener should be called on DOM Resize due to display:none");
				ResizeHandler.deregister(sResizeListenerId);
				done();
			}, 300);
		}, 300);
	});


	QUnit.module("Control Resize");

	QUnit.test("Check Control Resize - With Rerendering", function(assert) {
		var done = assert.async();
		assert.expect(3);
		var sResizeListenerId = _register(control);

		control.setWidth("150px");
		control.setHeight("150px");
		sap.ui.getCore().applyChanges();

		setTimeout(function() {
			assert.ok(lastResizeTargetCtrl == control, "Listener should be called on DOM Resize");
			assert.ok(lastSize && lastSize.width == 150 && lastSize.height == 150, "New Size given");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check Control Resize - Dom Changes", function(assert) {
		var done = assert.async();
		assert.expect(3);
		var sResizeListenerId = _register(control);

		control.$().attr("style", "width:151px;height:149px;");

		setTimeout(function() {
			assert.ok(lastResizeTargetCtrl == control, "Listener should be called on DOM Resize");
			assert.ok(lastSize && lastSize.width == 151 && lastSize.height == 149, "New Size given");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("Check Control Resize - Destroy", function(assert) {
		assert.expect(3);
		assert.ok(oResizeHandler.aResizeListeners.length == 0, "Number of Handlers before registration");
		_register(control);
		assert.ok(oResizeHandler.aResizeListeners.length == 1, "Number of Handlers after registration");
		control.destroy();
		assert.ok(oResizeHandler.aResizeListeners.length == 0, "Number of Handlers after destroy");
	});

	QUnit.module("Suspend/Resume resize listeners");

	QUnit.test("Suspend", function (assert) {

		var oResizeAreaDom = document.getElementById("resizeArea"),
			oResizeAreaContainerDom = document.getElementById("resizeAreaContainer"),
			iResizeAreaContainerWidth = oResizeAreaContainerDom.offsetWidth,
			sResizeListenerId = _register(oResizeAreaDom),
			done = assert.async();

		assert.expect(1);

		ResizeHandler.suspend(document.body);

		// resize while suspended
		oResizeAreaContainerDom.style.width = ++iResizeAreaContainerWidth + "px";

		setTimeout(function() {
			assert.strictEqual(lastResizeTarget, null, "Listener should not be called on DOM Resize");
			ResizeHandler.deregister(sResizeListenerId);
			ResizeHandler.resume(document.body);
			done();
		}, 300);
	});

	QUnit.test("Resume", function (assert) {

		var oResizeAreaDom = document.getElementById("resizeArea"),
			oResizeAreaContainerDom = document.getElementById("resizeAreaContainer"),
			iResizeAreaContainerWidth = oResizeAreaContainerDom.offsetWidth,
			sResizeListenerId = _register(oResizeAreaDom),
			done = assert.async();

		assert.expect(3);

		ResizeHandler.suspend(document.body);

		// resize while suspended
		oResizeAreaContainerDom.style.width = ++iResizeAreaContainerWidth + "px";

		ResizeHandler.resume(document.body);

		setTimeout(function() {
			assert.strictEqual(lastResizeTarget, oResizeAreaDom, "Listener should be called after DOM Resize");
			assert.strictEqual(lastSize.width, oResizeAreaContainerDom.offsetWidth, "New size given");
			ResizeHandler.deregister(sResizeListenerId);
			done();
		}, 300);
	});

	QUnit.test("it should call the callback function (registered via .isSuspended(oDomRef, fnCallback)) once " +
				"the DOM element is resumed after it was previously suspended", function(assert) {

		// arrange
		var oResizeAreaDomRef = document.getElementById("resizeArea"),
			sResizeListenerId = _register(oResizeAreaDomRef),
			oSpy = this.spy();

		ResizeHandler.suspend(oResizeAreaDomRef);
		ResizeHandler.isSuspended(oResizeAreaDomRef, oSpy);

		// act
		ResizeHandler.resume(oResizeAreaDomRef);

		// assert
		assert.strictEqual(oSpy.callCount, 1, "it should call the callback");

		// cleanup
		ResizeHandler.deregister(sResizeListenerId);
	});

});
