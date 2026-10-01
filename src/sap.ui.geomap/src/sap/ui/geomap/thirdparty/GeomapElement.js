sap.ui.define(['sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2'], (function (webcomponentsBase, Geomap) { 'use strict';

    /**
     * @class
     *
     * Base class for all map elements
     *
     * @constructor
     * @extends UI5Element
     * @experimental
     * @public
     */
    class GeomapElement extends webcomponentsBase.b {
        constructor() {
            super();
            this.disconnectFromMap();
            let deferredResolve;
            this._whenMapConnectedPromise = new Promise(resolve => {
                deferredResolve = resolve;
            });
            this._whenMapConnectedPromise._deferredResolve = deferredResolve;
        }
        async whenMapConnected() {
            return this._whenMapConnectedPromise;
        }
        async whenMapLoaded() {
            return this.map._ui5GeomapPromise;
        }
        async whenDrawConnected() {
            return this.draw && this.draw._ui5GeomapPromise;
        }
        connectToMap(map) {
            if (this.map instanceof Geomap.Map) {
                return;
            }
            this.map = map;
            this._whenMapConnectedPromise._deferredResolve();
        }
        connectToDraw(draw) {
            if (this.draw instanceof Geomap.to) {
                return;
            }
            this.draw = draw;
        }
        disconnectFromMap() {
            this.map = undefined;
            let deferredResolve;
            this._whenMapConnectedPromise = new Promise(resolve => {
                deferredResolve = resolve;
            });
            this._whenMapConnectedPromise._deferredResolve = deferredResolve;
        }
        onExitDOM() {
            this.disconnectFromMap();
        }
    }

    return GeomapElement;

}));
