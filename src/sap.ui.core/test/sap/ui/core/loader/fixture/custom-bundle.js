/*eslint-disable no-console, semi-spacing*/
/*global busyWait*/
sap.ui.require.preload({
"fixture/deepDependencies/deep1.js":function(){"use strict";console.time("deep1-root");sap.ui.define(["./deep2"], function() {console.time("deep1-fn");busyWait(20);console.timeEnd("deep1-fn");});console.timeEnd("deep1-root");},
"fixture/deepDependencies/deep2.js":function(){"use strict";console.time("deep2-root");sap.ui.define(["./deep3"], function() {console.time("deep2-fn");busyWait(20);console.timeEnd("deep2-fn");});console.timeEnd("deep2-root");},
"fixture/deepDependencies/deep3.js":function(){"use strict";console.time("deep3-root");sap.ui.define(["./deep4"], function() {console.time("deep3-fn");busyWait(20);console.timeEnd("deep3-fn");});console.timeEnd("deep3-root");},
"fixture/deepDependencies/deep4.js":function(){"use strict";console.time("deep4-root");sap.ui.define(["./deep5"], function() {console.time("deep4-fn");busyWait(20);console.timeEnd("deep4-fn");});console.timeEnd("deep4-root");},
"fixture/deepDependencies/deep5.js":function(){"use strict";console.time("deep5-root");sap.ui.define(["./deep6"], function() {console.time("deep5-fn");busyWait(20);console.timeEnd("deep5-fn");});console.timeEnd("deep5-root");},
"fixture/deepDependencies/deep6.js":function(){"use strict";console.time("deep6-root");sap.ui.define(["./deep7"], function() {console.time("deep6-fn");busyWait(20);console.timeEnd("deep6-fn");});console.timeEnd("deep6-root");},
"fixture/deepDependencies/deep7.js":function(){"use strict";console.time("deep7-root");sap.ui.define(["./deep8"], function() {console.time("deep7-fn");busyWait(20);console.timeEnd("deep7-fn");});console.timeEnd("deep7-root");},
"fixture/deepDependencies/deep8.js":function(){"use strict";console.time("deep8-root");sap.ui.define([], function() {console.time("deep8-fn");busyWait(20);console.timeEnd("deep8-fn");});console.timeEnd("deep8-root");},
"fixture/broadDependencies/broad1.js":function(){"use strict";console.time("broad1-root");sap.ui.define(["./broad2", "./broad3", "./broad4", "./broad5", "./broad6", "./broad7", "./broad8"], function() {console.time("broad1-fn");busyWait(20);console.timeEnd("broad1-fn");});console.timeEnd("broad1-root");},
"fixture/broadDependencies/broad2.js":function(){"use strict";console.time("broad2-root");sap.ui.define([], function() {console.time("broad2-fn");busyWait(20);console.timeEnd("broad2-fn");});console.timeEnd("broad2-root");},
"fixture/broadDependencies/broad3.js":function(){"use strict";console.time("broad3-root");sap.ui.define([], function() {console.time("broad3-fn");busyWait(20);console.timeEnd("broad3-fn");});console.timeEnd("broad3-root");},
"fixture/broadDependencies/broad4.js":function(){"use strict";console.time("broad4-root");sap.ui.define([], function() {console.time("broad4-fn");busyWait(20);console.timeEnd("broad4-fn");});console.timeEnd("broad4-root");},
"fixture/broadDependencies/broad5.js":function(){"use strict";console.time("broad5-root");sap.ui.define([], function() {console.time("broad5-fn");busyWait(20);console.timeEnd("broad5-fn");});console.timeEnd("broad5-root");},
"fixture/broadDependencies/broad6.js":function(){"use strict";console.time("broad6-root");sap.ui.define([], function() {console.time("broad6-fn");busyWait(20);console.timeEnd("broad6-fn");});console.timeEnd("broad6-root");},
"fixture/broadDependencies/broad7.js":function(){"use strict";console.time("broad7-root");sap.ui.define([], function() {console.time("broad7-fn");busyWait(20);console.timeEnd("broad7-fn");});console.timeEnd("broad7-root");},
"fixture/broadDependencies/broad8.js":function(){"use strict";console.time("broad8-root");sap.ui.define([], function() {console.time("broad8-fn");busyWait(20);console.timeEnd("broad8-fn");});console.timeEnd("broad8-root");}
});
