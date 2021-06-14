sap.ui.define(['exports', './dom', './parts', './template-factory'], function (exports, dom, parts$1, templateFactory) { 'use strict';

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const parts = new WeakMap();
    const render = (result, container, options) => {
        let part = parts.get(container);
        if (part === undefined) {
            dom.removeNodes(container, container.firstChild);
            parts.set(container, part = new parts$1.NodePart(Object.assign({ templateFactory: templateFactory.templateFactory }, options)));
            part.appendInto(container);
        }
        part.setValue(result);
        part.commit();
    };

    exports.parts = parts;
    exports.render = render;

    Object.defineProperty(exports, '__esModule', { value: true });

});
