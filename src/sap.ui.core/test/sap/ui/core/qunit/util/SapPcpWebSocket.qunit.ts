import SapPcpWebSocket from "sap/ui/core/ws/SapPcpWebSocket";
QUnit.test("Serialize Pcp-Fields", function (assert) {
    assert.expect(1);
    var _serializePcpFields = SapPcpWebSocket.prototype._serializePcpFields, _escape = SapPcpWebSocket.prototype._escape;
    var ws = {
        _escape: _escape
    };
    var serializedFields = _serializePcpFields.call(ws, {
        test: true,
        foo: "bar",
        count: 3,
        empty: ""
    }, typeof "", SapPcpWebSocket._MESSAGE);
    assert.equal(serializedFields, "pcp-action:MESSAGE\n" + "pcp-body-type:text\n" + "test:true\n" + "foo:bar\n" + "count:3\n" + "empty:\n" + "\n", "Output string equals expected string");
});
QUnit.test("Extract Pcp-Fields", function (assert) {
    assert.expect(6);
    var _extractPcpFields = SapPcpWebSocket.prototype._extractPcpFields, _unescape = SapPcpWebSocket.prototype._unescape;
    var ws = {
        _unescape: _unescape
    };
    var pcpFields = _extractPcpFields.call(ws, "pcp-action:MESSAGE\n" + "pcp-body-type:text\n" + "test:true\n" + "empty:\n" + "foo:bar\n" + "count:3\n" + "\n");
    assert.equal(pcpFields["count"], "3", "'count' field has the correct value");
    assert.equal(pcpFields["test"], "true", "'test' field has the correct value");
    assert.equal(pcpFields["empty"], "", "'empty' field has the correct value");
    assert.equal(pcpFields["foo"], "bar", "'foo' field has the correct value");
    assert.equal(pcpFields["pcp-action"], "MESSAGE", "'pcp-action' field has the correct value");
    assert.equal(pcpFields["pcp-body-type"], "text", "'pcp-body-type' field has the correct value");
});