sap.ui.define(['exports', '../lit-html', '../../directive-22e48b2f'], function (exports, litHtml, directive) { 'use strict';

    /**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    class ClassMapDirective extends directive.Directive {
        constructor(partInfo) {
            var _a;
            super(partInfo);
            if (partInfo.type !== directive.PartType.ATTRIBUTE ||
                partInfo.name !== 'class' ||
                ((_a = partInfo.strings) === null || _a === void 0 ? void 0 : _a.length) > 2) {
                throw new Error('`classMap()` can only be used in the `class` attribute ' +
                    'and must be the only part in the attribute.');
            }
        }
        render(classInfo) {
            return Object.keys(classInfo)
                .filter((key) => classInfo[key])
                .join(' ');
        }
        update(part, [classInfo]) {
            if (this._previousClasses === undefined) {
                this._previousClasses = new Set();
                for (const name in classInfo) {
                    if (classInfo[name]) {
                        this._previousClasses.add(name);
                    }
                }
                return this.render(classInfo);
            }
            const classList = part.element.classList;
            this._previousClasses.forEach((name) => {
                if (!(name in classInfo)) {
                    classList.remove(name);
                    this._previousClasses.delete(name);
                }
            });
            for (const name in classInfo) {
                const value = !!classInfo[name];
                if (value !== this._previousClasses.has(name)) {
                    if (value) {
                        classList.add(name);
                        this._previousClasses.add(name);
                    }
                    else {
                        classList.remove(name);
                        this._previousClasses.delete(name);
                    }
                }
            }
            return litHtml.noChange;
        }
    }
    const classMap = directive.directive(ClassMapDirective);

    exports.classMap = classMap;

    Object.defineProperty(exports, '__esModule', { value: true });

});
