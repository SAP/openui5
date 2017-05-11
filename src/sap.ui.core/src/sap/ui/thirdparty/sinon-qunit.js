/**
 * sinon-qunit 2.0.0, 2014/05/29
 *
 * @author Christian Johansen (christian@cjohansen.no)
 *
 * (The BSD License)
 *
 * Copyright (c) 2010-2011, Christian Johansen, christian@cjohansen.no
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *	 * Redistributions of source code must retain the above copyright notice,
 *	   this list of conditions and the following disclaimer.
 *	 * Redistributions in binary form must reproduce the above copyright notice,
 *	   this list of conditions and the following disclaimer in the documentation
 *	   and/or other materials provided with the distribution.
 *	 * Neither the name of Christian Johansen nor the names of his contributors
 *	   may be used to endorse or promote products derived from this software
 *	   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*global sinon, QUnit, test*/
sinon.expectation.fail = sinon.assert.fail = function (msg) {
	// ##### BEGIN: MODIFIED BY SAP
	// use QUnit.assert.ok instead of QUnit.ok
	// see https://github.com/cjohansen/sinon-qunit/pull/17
	QUnit.assert.ok(false, msg);
	// ##### END: MODIFIED BY SAP
};

sinon.assert.pass = function (assertion) {
	// ##### BEGIN: MODIFIED BY SAP
	// use QUnit.assert.ok instead of QUnit.ok
	QUnit.assert.ok(true, assertion);
	// ##### END: MODIFIED BY SAP
};

sinon.config = {
	injectIntoThis: true,
	injectInto: null,
	properties: ["spy", "stub", "mock", "clock", "sandbox"],
	useFakeTimers: false,
	useFakeServer: false
};

(function (global) {
	var qTest = QUnit.test;

	// ##### BEGIN: MODIFIED BY SAP
	// QUnit 2.x only supports only signature QUnit.test(message, callback); there are no more 'expected' and 'async' parameters
	if ( qTest.length === 2 ) {
		QUnit.test = function(testName, callback) {
			return qTest(testName, sinon.test(callback));
		};
	} else {
	// ##### END: MODIFIED BY SAP
		QUnit.test = global.test = function (testName, expected, callback, async) {
			if (arguments.length === 2) {
				callback = expected;
				expected = null;
			}

			return qTest(testName, expected, sinon.test(callback), async);
		};
	// ##### BEGIN: MODIFIED BY SAP
	}
	// ##### END: MODIFIED BY SAP
}(this));