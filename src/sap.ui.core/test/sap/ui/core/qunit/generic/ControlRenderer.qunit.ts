import ControlIterator from "sap/ui/qunit/utils/ControlIterator";
import Device from "sap/ui/Device";
QUnit.module("ControlRenderer");
QUnit.test("check async loading", function (assert) {
    if (!Device.browser.chrome) {
        assert.ok(true, "should only be executed on Chrome since it is a generic, browser independent test");
        return;
    }
    var done = assert.async();
    var syncSpy = sinon.spy(sap.ui, "requireSync");
    var aNonExistingRenderers = [];
    ControlIterator.run(function (sControlName, oControlClass, oInfo) {
        if (oInfo.canRender) {
            var metadata = oControlClass.getMetadata();
            var rendererModuleName = metadata.getRendererName().replace(/\./g, "/");
            var renderer = sap.ui.require(rendererModuleName);
            if (!renderer) {
                try {
                    metadata.getRenderer();
                }
                catch (e) {
                    aNonExistingRenderers.push(rendererModuleName);
                }
            }
        }
    }, {
        librariesToTest: ControlIterator.aKnownOpenUI5Libraries,
        includeElements: false,
        done: function () {
            var aCalls = syncSpy.getCalls().map(function (o) {
                return o.args[0];
            });
            assert.deepEqual(aCalls.filter(function (r) {
                return r.endsWith("Renderer") && aNonExistingRenderers.indexOf(r) === -1;
            }), [], "Renderers should never be required using synchronously. Check the respective control and add a dependency to its renderer");
            done();
        }
    });
});