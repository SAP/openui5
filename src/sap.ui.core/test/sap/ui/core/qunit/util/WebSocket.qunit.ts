import WebSocket from "sap/ui/core/ws/WebSocket";
import Device from "sap/ui/Device";
import URI from "sap/ui/thirdparty/URI";
QUnit.test("Constructor with url only", function (assert) {
    assert.expect(1);
    var theEx;
    try {
        new WebSocket("wss://" + document.location.host + "/foo/bar");
    }
    catch (ex) {
        theEx = ex;
    }
    if (Device.support.websocket) {
        assert.ok(theEx === undefined, "No exception was thrown.");
    }
    else {
        assert.equal(theEx.message, "Browser does not support WebSockets.", "No WebSocket support. Correct exception message.");
    }
});
QUnit.test("Constructor with url and single protocol", function (assert) {
    assert.expect(1);
    var theEx;
    try {
        new WebSocket("wss://" + document.location.host + "/foo/bar", "my-protocol");
    }
    catch (ex) {
        theEx = ex;
    }
    if (Device.support.websocket) {
        assert.ok(theEx === undefined, "No exception was thrown.");
    }
    else {
        assert.equal(theEx.message, "Browser does not support WebSockets.", "No WebSocket support. Correct exception message.");
    }
});
QUnit.test("Constructor with url and multiple protocols", function (assert) {
    assert.expect(1);
    var theEx;
    try {
        new WebSocket("wss://" + document.location.host + "/foo/bar", ["my-first-protocol", "my-second-protocol"]);
    }
    catch (ex) {
        theEx = ex;
    }
    if (Device.support.websocket) {
        assert.ok(theEx === undefined, "No exception was thrown.");
    }
    else {
        assert.equal(theEx.message, "Browser does not support WebSockets.", "No WebSocket support. Correct exception message.");
    }
});
QUnit.test("No url in constructor", function (assert) {
    assert.expect(2);
    var theEx;
    try {
        new WebSocket();
    }
    catch (ex) {
        theEx = ex;
    }
    assert.ok(theEx !== undefined, "No Url provided. Exception was raised.");
    if (Device.support.websocket) {
        assert.equal(theEx.message, "sUrl must be a string.", "Correct exception message.");
    }
    else {
        assert.equal(theEx.message, "Browser does not support WebSockets.", "Correct exception message.");
    }
});
QUnit.test("Wrong protocol parameter in constructor", function (assert) {
    assert.expect(2);
    var theEx;
    try {
        new WebSocket("ws://hostname:1234/foo/bar", { wrong: "type" });
    }
    catch (ex) {
        theEx = ex;
    }
    assert.ok(theEx !== undefined, "Wrong protocol parameter. Exception was raised.");
    if (Device.support.websocket) {
        assert.equal(theEx.message, "aProtocols must be a string, array of strings or undefined.", "Correct exception message.");
    }
    else {
        assert.equal(theEx.message, "Browser does not support WebSockets.", "Correct exception message.");
    }
});
QUnit.test("Resolve URLs", function (assert) {
    assert.expect(4);
    var _resolveFullUrl = WebSocket.prototype._resolveFullUrl;
    assert.equal(_resolveFullUrl.call(null, "ws://hostname:1234/foo/bar"), "ws://hostname:1234/foo/bar", "resolved full URL (ws://)");
    assert.equal(_resolveFullUrl.call(null, "wss://hostname:1234/foo/bar"), "wss://hostname:1234/foo/bar", "resolved full URL (wss://)");
    var oBaseUri = new URI(document.baseURI);
    oBaseUri.search("").protocol(oBaseUri.protocol() === "https" ? "wss" : "ws");
    assert.equal(_resolveFullUrl.call(null, "/foo/bar"), new URI("/foo/bar").absoluteTo(oBaseUri).toString(), "resolved absolute URL");
    assert.equal(_resolveFullUrl.call(null, "../foo/bar"), new URI("../foo/bar").absoluteTo(oBaseUri).toString(), "resolved relative URL");
});