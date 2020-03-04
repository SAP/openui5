/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Button",
	"sap/ui/commons/Label"
], function(createAndAppendDiv, Button, Label) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3"]);



	var oBtn = new Button("btn", {text:"Button 1"});
	oBtn.placeAt("uiArea1");
	var oBtn2 = new Button("btn2", {text:"Button 2"});
	oBtn2.placeAt("uiArea2");

	function myHandler1() {
		QUnit.config.current.assert.ok(true, "check in handler 1");
	}

	function myHandler2() {
		QUnit.config.current.assert.ok(true, "check in handler 2");
		QUnit.config.current.assert.ok(true, "second check in handler 2");
	}


	// make sure the methods exist
	QUnit.test("InitialCheck", function(assert) {
		assert.expect(4);
		assert.ok(oBtn.attachBrowserEvent, "oBtn.attachBrowserEvent should be an existing function");
		assert.equal(typeof (oBtn.attachBrowserEvent), "function", "oBtn.attachBrowserEvent should be an existing function");
		assert.ok(oBtn.detachBrowserEvent, "oBtn.detachBrowserEvent should be an existing function");
		assert.equal(typeof (oBtn.detachBrowserEvent), "function", "oBtn.detachBrowserEvent should be an existing function");
	});

	QUnit.test("Adding Handlers and Return Value", function(assert) {
		assert.expect(6);
		var result = oBtn.attachBrowserEvent("blur", myHandler1);

		assert.ok(result, "oBtn.attachBrowserEvent must return something");
		assert.ok((result === oBtn), "oBtn.attachBrowserEvent must return oBtn"); // equal does not work

		assert.ok(oBtn.aBindParameters, "oBtn.aBindParameters should exist");
		assert.equal(oBtn.aBindParameters.length, 1, "oBtn.aBindParameters should have one entry");
		assert.equal(oBtn.aBindParameters[0].sEventType, "blur", "oBtn.aBindParameters[0] event name should be 'blur'");
		assert.equal(oBtn.aBindParameters[0].fnHandler, myHandler1, "oBtn.aBindParameters[0] handler should be myHandler1");
	});

	QUnit.test("Removing Handlers and Return Value", function(assert) {
		assert.expect(4);
		var result = oBtn.detachBrowserEvent("blur", myHandler1);

		assert.ok(result, "oBtn.detachBrowserEvent must return something");
		assert.ok((result === oBtn), "oBtn.detachBrowserEvent must return oBtn"); // equal does not work

		assert.ok(oBtn.aBindParameters, "oBtn.aBindParameters should exist");
		assert.equal(oBtn.aBindParameters.length, 0, "oBtn.aBindParameters should have no entry");
	});

	QUnit.test("Adding Invalid Handlers", function(assert) {
		assert.expect(3);
		oBtn.attachBrowserEvent("blur", null);
		assert.equal(oBtn.aBindParameters.length, 0, "oBtn.aBindParameters should have no entry");

		oBtn.attachBrowserEvent("blur", false);
		assert.equal(oBtn.aBindParameters.length, 0, "oBtn.aBindParameters should have no entry");

		oBtn.attachBrowserEvent("blur", "burp");
		assert.equal(oBtn.aBindParameters.length, 0, "oBtn.aBindParameters should have no entry");
	});

	QUnit.test("Removing Invalid Handlers", function(assert) {
		assert.expect(2);
		oBtn.attachBrowserEvent("blur", myHandler1);

		oBtn.detachBrowserEvent("blur", null);
		assert.equal(oBtn.aBindParameters.length, 1, "oBtn.aBindParameters should have one entry");

		oBtn.detachBrowserEvent(null, myHandler1);
		assert.equal(oBtn.aBindParameters.length, 1, "oBtn.aBindParameters should have one entry");
	});

	QUnit.test("Removing Other Handlers", function(assert) {
		assert.expect(4);
		oBtn.attachBrowserEvent("blur", myHandler2);
		assert.equal(oBtn.aBindParameters.length, 2, "oBtn.aBindParameters should have two entries");

		oBtn.detachBrowserEvent("blur", myHandler2);
		assert.equal(oBtn.aBindParameters.length, 1, "oBtn.aBindParameters should have one entry");
		assert.equal(oBtn.aBindParameters[0].sEventType, "blur", "oBtn.aBindParameters[0] event name should be 'blur'");
		assert.equal(oBtn.aBindParameters[0].fnHandler, myHandler1, "oBtn.aBindParameters[0] handler should be myHandler1");
	});

	QUnit.test("Execution of a Handler", function(assert) {
		assert.expect(1);
		var done = assert.async();
		oBtn.getDomRef().focus();
		oBtn2.getDomRef().focus();

		setTimeout(function() {
			done();
		}, 1);
	});

	QUnit.test("Execution of multiple Handlers", function(assert) {
		assert.expect(3);
		var done = assert.async();
		oBtn.attachBrowserEvent("blur", myHandler2);
		oBtn.getDomRef().focus();
		oBtn2.getDomRef().focus();

		setTimeout(function() {
			done();
		}, 1);
	});

	QUnit.test("Execution of Handlers (no handlers, all removed)", function(assert) {
		assert.expect(1);
		var done = assert.async();
		oBtn.detachBrowserEvent("blur", myHandler1);
		oBtn.detachBrowserEvent("blur", myHandler2);
		oBtn.getDomRef().focus();
		oBtn2.getDomRef().focus();

		assert.ok(true, "Test without success message is boring. There should not be any check after this one.");

		setTimeout(function() {
			done();
		}, 1);
	});

	QUnit.test("Execution of a Handler after re-rendering", function(assert) {
		var done = assert.async();
		oBtn2.getDomRef().focus();

		// register handler first
		oBtn.attachBrowserEvent("blur", myHandler1);

		// re-render
		oBtn.getDomRef();
		oBtn.invalidate();
		sap.ui.getCore().applyChanges();
		var newBtn = oBtn.getDomRef();
		//assert.ok(oldBtn != newBtn, "Button should be re-rendered and replaced by a new DOM element");

		// now trigger the event
		newBtn.focus();
		oBtn2.getDomRef().focus();

		setTimeout(function() {
			oBtn.detachBrowserEvent("blur", myHandler1);
			done();
		}, 1);
	});

	var oBtn3;
	QUnit.test("Event Binding Before Rendering", function(assert) {
		assert.expect(1);
		var done = assert.async();
		// create third button and bind event
		oBtn3 = new Button("btn3", {text:"Button 3"});
		oBtn3.attachBrowserEvent("blur", myHandler1);

		// place and render button into page
		oBtn3.placeAt("uiArea3");
		sap.ui.getCore().applyChanges();

		// cause event
		oBtn3.getDomRef().focus();
		oBtn.getDomRef().focus();

		setTimeout(function() {
			done();
		}, 1);
	});

	var oLabel;
	var oListener1 = { getId : function() { return "l1"; } };
	var oListener2 = { getId : function() { return "l2"; } };
	var clicks, names;
	function clear() {
		clicks = 0;
		names = [];
	}
	clear();
	function clickHandler() {
		clicks++;
		names.push(this.getId ? this.getId() : "unknown");
	}

	QUnit.module("Context objects (oListener)", {
		beforeEach : function() {
			oLabel = new Label({id : "c0", text:"something"});
			oLabel.placeAt("uiArea1");
			sap.ui.getCore().applyChanges();
			clear();
		},
		afterEach : function() {
			oLabel.destroy();
			oLabel = undefined;
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("no (default) context", function(assert) {
		oLabel.attachBrowserEvent("click", clickHandler);
		assert.equal(clicks, 0, "no event handler called so far");

		oLabel.$().trigger("click");
		assert.equal(clicks, 1, "event handler called");
		assert.equal(names.sort().join(","), "c0", "control itself is used as this");
	});

	QUnit.test("specific context", function(assert) {
		oLabel.attachBrowserEvent("click", clickHandler, oListener1);
		assert.equal(clicks, 0, "no event handler called so far");

		oLabel.$().trigger("click");
		assert.equal(clicks, 1, "event handler called");
		assert.equal(names.sort().join(","), "l1", "given listener used as this");
	});

	QUnit.test("multiple contexts", function(assert) {
		oLabel.attachBrowserEvent("click", clickHandler, oListener1);
		oLabel.attachBrowserEvent("click", clickHandler);
		oLabel.attachBrowserEvent("click", clickHandler, oListener2);
		assert.equal(clicks, 0, "no event handler called so far");

		oLabel.$().trigger("click");
		assert.equal(clicks, 3, "event handler called");
		assert.equal(names.sort().join(","), "c0,l1,l2", "given listeners are used as this");
	});

	QUnit.test("deregistration with context", function(assert) {
		oLabel.attachBrowserEvent("click", clickHandler, oListener1);
		oLabel.$().trigger("click");
		assert.equal(clicks, 1, "event handler called once");

		oLabel.detachBrowserEvent("click", clickHandler, oListener1);
		oLabel.$().trigger("click");
		assert.equal(clicks, 1, "event handler only called once");
	});

	QUnit.test("deregistration with different context", function(assert) {
		oLabel.attachBrowserEvent("click", clickHandler, oListener1);
		oLabel.$().trigger("click");
		assert.equal(clicks, 1, "event handler called once");

		oLabel.detachBrowserEvent("click", clickHandler, oListener2);
		oLabel.$().trigger("click");
		assert.equal(clicks, 2, "event handler called twice");
	});

	QUnit.test("deregistration with multiple contexts", function(assert) {
		oLabel.attachBrowserEvent("click", clickHandler, oListener1);
		oLabel.attachBrowserEvent("click", clickHandler, oListener2);
		oLabel.$().trigger("click");
		assert.equal(clicks, 2, "all registered event handlers called");
		assert.equal(names.sort().join(","), "l1,l2", "given listeners are used as this");

		oLabel.detachBrowserEvent("click", clickHandler, oListener2);
		oLabel.$().trigger("click");
		assert.equal(clicks, 3, "only 1 remaining eh is called");
		assert.equal(names.sort().join(","), "l1,l1,l2", "given listeners are used as this");

		oLabel.detachBrowserEvent("click", clickHandler);
		oLabel.$().trigger("click");
		assert.equal(clicks, 4, "still 1 remaining eh is called");
		assert.equal(names.sort().join(","), "l1,l1,l1,l2", "given listeners are used as this");
	});

	/*
	 * TODO: jQuery.proxy is not supported yet
	 */
	QUnit.skip("Removing Handlers wrapped with jQuery.proxy()", function(assert) {
		assert.expect(2);
		var done = assert.async();
		assert.equal(oBtn3.aBindParameters.length, 1, "oBtn3.aBindParameters should have one entry");

		// remove the event, but the handler is wrapped with proxy()
		oBtn3.detachBrowserEvent("blur", jQuery.proxy(myHandler1));

		// verify we have removed the handler from the list
		assert.equal(oBtn3.aBindParameters.length, 0, "oBtn3.aBindParameters should have no entry");

		// trigger the browser event whose handler was supposedly unbound
		oBtn3.getDomRef().focus();
		oBtn.getDomRef().focus();

		// wait and verify the handler is not called
		setTimeout(function() {

			// re-render
			oBtn3.invalidate();
			sap.ui.getCore().applyChanges();

			// trigger event again
			oBtn3.getDomRef().focus();
			oBtn.getDomRef().focus();

			// wait and check whether handler is called
			setTimeout(function() {
				done();
			}, 1);
		}, 1);
	});


	// TODO unbind with jQuery.proxy
});