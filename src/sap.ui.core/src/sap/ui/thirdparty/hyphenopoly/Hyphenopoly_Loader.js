/**
 * @license Hyphenopoly_Loader 3.4.0 - client side hyphenation
 * ©2019  Mathias Nater, Zürich (mathiasnater at gmail dot com)
 * https://github.com/mnater/Hyphenopoly
 *
 * Released under the MIT license
 * http://mnater.github.io/Hyphenopoly/LICENSE
 * Modifications SAP SE or an SAP affiliate company and OpenUI5 contributors. All rights reserved.
 */

/* globals Hyphenopoly:readonly */
/**
 * Wrap all code in an iife to keep a scope. Important objects are parameters
 * of this iife to keep codesize low.
 * @param {Object} w shorthand for window
 * @param {Object} d shorthand for document
 * @param {Object} H shorthand for Hyphenopoly
 * @param {Object} o shorthand for object
 */
(function H9YL(w, d, H, o) {

    "use strict";

    var store = sessionStorage;
    var wa = w.WebAssembly;
    var lcFallbacks = new Map();
    var lcRequire = new Map();

    /**
     * Create Object without standard Object-prototype
     * @returns {Object} empty object
     */
    function empty() {
        return o.create(null);
    }


    /**
     * Shorthand for Object.keys(obj).forEach(function () {})
     * @param {Object} obj the object to iterate
     * @param {function} fn the function to execute
     * @returns {undefined}
     */
    function eachKey(obj, fn) {
        o.keys(obj).forEach(fn);
    }

    /**
     * Set H.cf (Hyphenopoly.clientFeatures) either by reading out previously
     * computed settings from sessionStorage or creating an template object.
     * This is in an iife to keep complexity low.
     */
    (function configFeat() {
        if (H.cacheFeatureTests && store.getItem("Hyphenopoly_Loader")) {
            H.cf = JSON.parse(store.getItem("Hyphenopoly_Loader"));
        } else {
            H.cf = {
                "langs": empty(),
                "polyfill": false,
                "wasm": null
            };
        }
    }());

    /**
     * Set H.paths defaults or overwrite with user settings.
     * This is in an iife to keep complexity low.
     */
    (function configPaths() {
        var maindir = (d.currentScript)
            ? d.currentScript.src.replace(/Hyphenopoly_Loader.js/i, "")
            : "../";
        var patterndir = maindir + "patterns/";
        if (H.paths) {
            H.paths.maindir = H.paths.maindir || maindir;
            H.paths.patterndir = H.paths.patterndir || patterndir;
        } else {
            H.paths = o.create({
                "maindir": maindir,
                "patterndir": patterndir
            });
        }
    }());

    /**
     * Set some H.setup fields to defaults or overwrite with user settings.
     * This is in an iife to keep complexity low.
     */
    (function configSetup() {
        if (H.setup) {
            H.setup.selectors = H.setup.selectors || {".hyphenate": {}};
            H.setup.timeout = H.setup.timeout || 1000;
            H.setup.hide = H.setup.hide || "all";
        } else {
            H.setup = {
                "hide": "all",
                "selectors": {".hyphenate": {}},
                "timeout": 1000
            };
        }
    }());

    /**
     * Copy required languages to local lcRequire and
     * eventually fallbacks to local lcFallbacks.
     * This is in an iife to keep complexity low.
     */
    (function configRequire() {
        eachKey(H.require, function copyRequire(k) {
            // eslint-disable-next-line security/detect-object-injection
            lcRequire.set(k.toLowerCase(), H.require[k]);
        });
        if (H.fallbacks) {
            eachKey(H.fallbacks, function copyFallbacks(k) {
                lcFallbacks.set(
                    k.toLowerCase(),
                    // eslint-disable-next-line security/detect-object-injection
                    H.fallbacks[k].toLowerCase()
                );
            });
        }
    }());

    /**
     * Define function H.toggle.
     * This function hides or unhides (depending of the parameter state)
     * the whole document (H.setup.hide == "all") or
     * each selected element (H.setup.hide == "element") or
     * text of each selected element (H.setup.hide == "text")
     * @param {string} state State: either on (visible) or off (hidden)
     */
    H.toggle = function toggle(state) {
        if (state === "on") {
            var stylesNode = d.getElementById("H9Y_Styles");
            if (stylesNode) {
                stylesNode.parentNode.removeChild(stylesNode);
            }
        } else {
            var vis = " {visibility: hidden !important}\n";
            var sc = d.createElement("style");
            var myStyle = "";
            sc.id = "H9Y_Styles";
            switch (H.setup.hide) {
            case "all":
                myStyle = "html" + vis;
                break;
            case "element":
                eachKey(H.setup.selectors, function eachSelector(sel) {
                    myStyle += sel + vis;
                });
                break;
            case "text":
                eachKey(H.setup.selectors, function eachSelector(sel) {
                    myStyle += sel + " {color: transparent !important}\n";
                });
                break;
            // No Default
            }
            sc.appendChild(d.createTextNode(myStyle));
            d.head.appendChild(sc);
        }
    };

    /**
     * Setup basic event system. Some events are defined but the definition of
     * what happens when they are triggered is deferred to Hyphenopoly.js
     * This is in an iife to keep complexity low.
     */
    (function setupEvents() {
        // Events known to the system
        var definedEvents = new Map();
        // Default events, execution deferred to Hyphenopoly.js
        var deferred = [];

        /*
         * Register for custom event handlers, where event is not yet defined
         * these events will be correctly registered in Hyphenopoly.js
         */
        var tempRegister = [];

        /**
         * Create Event Object
         * @param {string} name The Name of the event
         * @param {function} defFunc The default method of the event
         * @param {boolean} cancellable Is the default cancellable
         * @returns {undefined}
         */
        function define(name, defFunc, cancellable) {
            definedEvents.set(name, {
                "cancellable": cancellable,
                "default": defFunc,
                "register": []
            });
        }

        define(
            "timeout",
            function def(e) {
                H.toggle("on");
                w.console.info(
                    "Hyphenopolys 'FOUHC'-prevention timed out after %dms",
                    e.delay
                );
            },
            false
        );

        define(
            "error",
            function def(e) {
                switch (e.lvl) {
                case "info":
                    w.console.info(e.msg);
                    break;
                case "warn":
                    w.console.warn(e.msg);
                    break;
                default:
                    w.console.error(e.msg);
                }
            },
            true
        );

        define(
            "contentLoaded",
            function def(e) {
                deferred.push({
                    "data": e,
                    "name": "contentLoaded"
                });
            },
            false
        );

        define(
            "engineLoaded",
            function def(e) {
                deferred.push({
                    "data": e,
                    "name": "engineLoaded"
                });
            },
            false
        );

        define(
            "hpbLoaded",
            function def(e) {
                deferred.push({
                    "data": e,
                    "name": "hpbLoaded"
                });
            },
            false
        );

        define(
            "loadError",
            function def(e) {
                deferred.push({
                    "data": e,
                    "name": "loadError"
                });
            },
            false
        );

        define(
            "tearDown",
            null,
            true
        );

        /**
         * Dispatch event <name> with arguments <data>
         * @param {string} name The name of the event
         * @param {Object|undefined} data Data of the event
         * @returns {undefined}
         */
        function dispatch(name, data) {
            data = data || empty();
            var defaultPrevented = false;
            definedEvents.get(name).register.forEach(
                function call(currentHandler) {
                    data.preventDefault = function preventDefault() {
                        if (definedEvents.get(name).cancellable) {
                            defaultPrevented = true;
                        }
                    };
                    currentHandler(data);
                }
            );
            if (
                !defaultPrevented &&
                definedEvents.get(name).default
            ) {
                definedEvents.get(name).default(data);
            }
        }

        /**
         * Add EventListender <handler> to event <name>
         * @param {string} name The name of the event
         * @param {function} handler Function to register
         * @param {boolean} defer If the registration is deferred
         * @returns {undefined}
         */
        function addListener(name, handler, defer) {
            if (definedEvents.has(name)) {
                definedEvents.get(name).register.push(handler);
            } else if (defer) {
                tempRegister.push({
                    "handler": handler,
                    "name": name
                });
            } else {
                H.events.dispatch(
                    "error",
                    {
                        "lvl": "warn",
                        "msg": "unknown Event \"" + name + "\" discarded"
                    }
                );
            }
        }

        if (H.handleEvent) {
            eachKey(H.handleEvent, function add(name) {
                /* eslint-disable security/detect-object-injection */
                addListener(name, H.handleEvent[name], true);
                /* eslint-enable security/detect-object-injection */
            });
        }

        H.events = empty();
        H.events.deferred = deferred;
        H.events.tempRegister = tempRegister;
        H.events.dispatch = dispatch;
        H.events.define = define;
        H.events.addListener = addListener;
    }());

    /**
     * Feature test for wasm.
     * @returns {boolean} support
     */
    function runWasmTest() {
        /*
         * Wasm feature test with iOS bug detection
         * (https://bugs.webkit.org/show_bug.cgi?id=181781)
         */
        if (
            typeof wa === "object" &&
            typeof wa.Instance === "function"
        ) {
            // #### BEGIN MODIFIED BY SAP
            // modification adds try-catch block to enable fallback to asm.js in restricted environments
            try {
                /* eslint-disable array-element-newline */
                var module = new wa.Module(Uint8Array.from([
                    0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127,
                    3, 2, 1, 0, 5, 3, 1, 0, 1, 7, 5, 1, 1, 116, 0, 0,
                    10, 16, 1, 14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2,
                    0, 11
                ]));
                /* eslint-enable array-element-newline */
                return (new wa.Instance(module).exports.t(4) !== 0);
            } catch (e) {
                return false;
            }
            // #### END MODIFIED BY SAP
        }
        return false;
    }

    /**
     * Load script by adding <script>-tag
     * @param {string} path Where the script is stored
     * @param {string} filename Filename of the script
     * @returns {undefined}
     */
    function loadScript(path, filename) {
        var script = d.createElement("script");
        script.src = path + filename;
        if (filename === "hyphenEngine.asm.js") {
            script.addEventListener("load", function listener() {
                H.events.dispatch("engineLoaded", {"msg": "asm"});
            });
        }
        d.head.appendChild(script);
    }

    var loadedBins = new Map();

    /**
     * Load binary files either with fetch (on new browsers that support wasm)
     * or with xmlHttpRequest
     * @param {string} path Where the script is stored
     * @param {string} fne Filename of the script with extension
     * @param {string} name Name of the ressource
     * @param {Object} msg Message
     * @returns {undefined}
     */
    function loadBinary(path, fne, name, msg) {
        /**
         * Get bin file using fetch
         * @param {string} p Where the script is stored
         * @param {string} f Filename of the script with extension
         * @param {string} n Name of the ressource
         * @param {Object} m Message
         * @returns {undefined}
         */
        function fetchBinary(p, f, n, m) {
            // #### BEGIN MODIFIED BY SAP
            // modification is to not include credentials in the fetch request
            w.fetch(p + f)
            // #### END MODIFIED BY SAP
            .then(
                function resolve(response) {
                    if (response.ok) {
                        if (n === "hyphenEngine") {
                            H.bins.set(n, response.arrayBuffer().then(
                                function getModule(buf) {
                                    return new wa.Module(buf);
                                }
                            ));
                            H.events.dispatch("engineLoaded", {"msg": m});
                        } else {
                            var files = loadedBins.get(f);
                            files.forEach(function eachHpb(rn) {
                                H.bins.set(
                                    rn,
                                    (files.length > 1)
                                        ? response.clone().arrayBuffer()
                                        : response.arrayBuffer()
                                );
                                H.events.dispatch(
                                    "hpbLoaded",
                                    {"msg": rn}
                                );
                            });
                        }
                    } else {
                        H.events.dispatch("loadError", {
                            "file": f,
                            "msg": m,
                            "name": n,
                            "path": p
                        });
                    }
                }
            );
        }

        /**
         * Get bin file using XHR
         * @param {string} p Where the script is stored
         * @param {string} f Filename of the script with extension
         * @param {string} n Name of the ressource
         * @param {Object} m Message
         * @returns {undefined}
         */
        function requestBinary(p, f, n, m) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function onload() {
                if (xhr.status === 200) {
                    loadedBins.get(f).
                        forEach(function eachHpb(rn) {
                            H.bins.set(
                                rn,
                                xhr.response
                            );
                            H.events.dispatch(
                                "hpbLoaded",
                                {"msg": rn}
                            );
                        });
                } else {
                    H.events.dispatch("loadError", {
                        "file": f,
                        "msg": m,
                        "name": n,
                        "path": p
                    });
                }
            };
            xhr.open("GET", p + f);
            xhr.responseType = "arraybuffer";
            xhr.send();
        }
        if (!loadedBins.has(fne)) {
            loadedBins.set(fne, [msg]);
            if (H.cf.wasm) {
                fetchBinary(path, fne, name, msg);
            } else {
                requestBinary(path, fne, name, msg);
            }
        } else if (name !== "hyphenEngine") {
            loadedBins.get(fne).push(msg);
        }
    }

    /**
     * Pre-Allocate memory for (w)asm
     * Default is 32 wasm Pages (). For languages with larger .hpb
     * files a higher value is needed.
     * Get the value from baseData.heapSize in Hyphenopoly.js
     * @param {string} lang Language
     * @returns {undefined}
     */
    function allocateMemory(lang) {
        var specVal = new Map(
            [["de", 54], ["hu", 205], ["nb-no", 91], ["nl", 41]]
        );
        var wasmPages = specVal.get(lang) || 32;
        H.specMems = H.specMems || new Map();
        if (H.cf.wasm) {
            H.specMems.set(lang, new wa.Memory({
                "initial": wasmPages,
                "maximum": 256
            }));
        } else {
            /* eslint-disable no-bitwise */
            var asmPages = (2 << Math.floor(
                Math.log(wasmPages) * Math.LOG2E
            )) << 16;
            /* eslint-enable no-bitwise */
            H.specMems.set(lang, new ArrayBuffer(asmPages));
        }
    }

    (function testClientFeatures() {
        var tester = (function tester() {
            var  fakeBody = null;
            /* eslint-disable array-element-newline */
            var css = [
                "visibility:hidden",
                "-moz-hyphens:auto",
                "-webkit-hyphens:auto",
                "-ms-hyphens:auto",
                "hyphens:auto",
                "width:48px",
                "font-size:12px",
                "line-height:12px",
                "border:none",
                "padding:0",
                "word-wrap:normal"
            ].join(";");
            /* eslint-enable array-element-newline */

            /**
             * Create and append div with CSS-hyphenated word
             * @param {string} lang Language
             * @returns {undefined}
             */
            function create(lang) {
                /* eslint-disable security/detect-object-injection */
                if (H.cf.langs[lang]) {
                    return;
                }
                /* eslint-enable security/detect-object-injection */
                fakeBody = fakeBody || d.createElement("body");
                var testDiv = d.createElement("div");
                testDiv.lang = lang;
                testDiv.style.cssText = css;
                testDiv.appendChild(
                    d.createTextNode(lcRequire.get(lang).toLowerCase())
                );
                fakeBody.appendChild(testDiv);
            }

            /**
             * Append fakeBody with tests to target (document)
             * @param {Object} target Where to append fakeBody
             * @returns {Object|null} The body element or null, if no tests
             */
            function append(target) {
                if (fakeBody) {
                    target.appendChild(fakeBody);
                    return fakeBody;
                }
                return null;
            }

            /**
             * Remove fakeBody
             * @returns {undefined}
             */
            function clear() {
                if (fakeBody) {
                    fakeBody.parentNode.removeChild(fakeBody);
                }
            }
            return {
                "append": append,
                "clear": clear,
                "create": create
            };
        }());

        /**
         * Checks if hyphens (ev.prefixed) is set to auto for the element.
         * @param {Object} elm - the element
         * @returns {Boolean} result of the check
         */
        function checkCSSHyphensSupport(elm) {
            return (
                elm.style.hyphens === "auto" ||
                elm.style.webkitHyphens === "auto" ||
                elm.style.msHyphens === "auto" ||
                elm.style["-moz-hyphens"] === "auto"
            );
        }

        /**
         * Expose the hyphenate-function of a specific language to
         * Hyphenopoly.hyphenators.<language>
         *
         * Hyphenopoly.hyphenators.<language> is a Promise that fullfills
         * to hyphenate(entity, sel) as soon as the ressources are loaded
         * and the engine is ready.
         * If Promises aren't supported (e.g. IE11) a error message is produced.
         *
         * @param {string} lang - the language
         * @returns {undefined}
         */
        function exposeHyphenateFunction(lang) {
            /* eslint-disable security/detect-object-injection */
            H.hyphenators = H.hyphenators || empty();
            if (!H.hyphenators[lang]) {
                if (w.Promise) {
                    H.hyphenators[lang] = new Promise(function pro(rs, rj) {
                        H.events.addListener(
                            "engineReady",
                            function handler(e) {
                                if (e.msg === lang) {
                                    rs(H.createHyphenator(e.msg));
                                }
                            },
                            true
                        );
                        H.events.addListener(
                            "loadError",
                            function handler(e) {
                                if (e.name === lang || e.name === "hyphenEngine") {
                                    rj(new Error("File " + e.file + " can't be loaded from " + e.path));
                                }
                            },
                            false
                        );
                    });
                    H.hyphenators[lang].catch(function catchPromiseError(e) {
                        H.events.dispatch(
                            "error",
                            {
                                "lvl": "error",
                                "msg": e.message
                            }
                        );
                    });
                } else {
                    H.hyphenators[lang] = {

                        /**
                         * Fires an error message, if then is called
                         * @returns {undefined}
                         */
                        "then": function () {
                            H.events.dispatch(
                                "error",
                                {"msg": "Promises not supported in this engine. Use a polyfill."}
                            );
                        }
                    };
                }
            }
            /* eslint-enable security/detect-object-injection */
        }

        /**
         * Load .hpb files
         * @param {string} lang The language
         * @returns {undefined}
         */
        function loadPattern(lang) {
            var filename = lang + ".hpb";
            var langFallback = lang;
            H.cf.polyfill = true;
            // eslint-disable-next-line security/detect-object-injection
            H.cf.langs[lang] = "H9Y";
            if (lcFallbacks && lcFallbacks.has(lang)) {
                langFallback = lcFallbacks.get(lang);
                filename = langFallback + ".hpb";
            }
            H.bins = H.bins || new Map();
            loadBinary(H.paths.patterndir, filename, langFallback, lang);
        }

        if (H.cf.wasm === null) {
            H.cf.wasm = runWasmTest();
        }
        lcRequire.forEach(function eachReq(value, lang) {
            if (value === "FORCEHYPHENOPOLY" ||
                // eslint-disable-next-line security/detect-object-injection
                (H.cf.langs[lang] && H.cf.langs[lang] === "H9Y")
            ) {
                loadPattern(lang);
            } else {
                tester.create(lang);
            }
        });

        var testContainer = tester.append(d.documentElement);
        if (testContainer !== null) {
            var nl = testContainer.querySelectorAll("div");
            Array.prototype.forEach.call(nl, function eachNode(n) {
                if (checkCSSHyphensSupport(n) && n.offsetHeight > 12) {
                    H.cf.langs[n.lang] = "CSS";
                } else {
                    loadPattern(n.lang);
                }
            });
            tester.clear();
        }
        if (H.cf.polyfill) {
            loadScript(H.paths.maindir, "Hyphenopoly.js");
            if (H.cf.wasm) {
                loadBinary(
                    H.paths.maindir,
                    "hyphenEngine.wasm",
                    "hyphenEngine",
                    "wasm"
                );
            } else {
                loadScript(H.paths.maindir, "hyphenEngine.asm.js");
            }
            eachKey(H.cf.langs, function prepareEach(lang) {
                /* eslint-disable security/detect-object-injection */
                if (H.cf.langs[lang] === "H9Y") {
                    allocateMemory(lang);
                    exposeHyphenateFunction(lang);
                }
                /* eslint-enable security/detect-object-injection */
            });
        }
    }());

    /**
     * Hides the specified elements and starts the process by
     * dispatching a "contentLoaded"-event in Hyphenopoly
     * @returns {undefined}
     */
    function handleDCL() {
        if (H.setup.hide.match(/^(?:element|text)$/)) {
            H.toggle("off");
        }
        H.events.dispatch(
            "contentLoaded",
            {"msg": ["contentLoaded"]}
        );
    }

    if (H.cf.polyfill) {
        if (H.setup.hide === "all") {
            H.toggle("off");
        }
        if (H.setup.hide !== "none") {
            H.setup.timeOutHandler = w.setTimeout(function timedOut() {
                H.toggle("on");
                H.events.dispatch("timeout", {"delay": H.setup.timeout});
            }, H.setup.timeout);
        }
        if (d.readyState === "loading") {
            d.addEventListener(
                "DOMContentLoaded",
                handleDCL,
                {
                    "once": true,
                    "passive": true
                }
            );
        } else {
            handleDCL();
        }
    } else {
        H.events.dispatch("tearDown", {});
        w.Hyphenopoly = null;
    }

    if (H.cacheFeatureTests) {
        store.setItem(
            "Hyphenopoly_Loader",
            JSON.stringify(H.cf)
        );
    }
}(window, document, Hyphenopoly, Object));
