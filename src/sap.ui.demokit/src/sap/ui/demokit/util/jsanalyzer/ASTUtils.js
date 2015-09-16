/*!
 * ${copyright}
 */

// Provides implementation of sap.ui.demokit.util.jsanalyzer.ASTUtils
sap.ui.define(['jquery.sap.global', 'sap/ui/demokit/js/esprima'],
	function(jQuery, esprima_) {
	"use strict";

	/*global esprima */

	var Syntax = esprima.Syntax;

	function unlend(node) {
		if ( node.type == Syntax.AssignmentExpression && node.left.type == Syntax.Identifier && node.right.type == Syntax.ObjectExpression ) {
			//console.log("lends found, skipped to " + node.type);
			return node.right;
		}
		return node;
	}
	
	/**
	 * Creates a map of property values from an AST 'object literal' node.
	 *
	 * The values in the map are again AST 'property' nodes (representing key/value pairs).
	 * It would be more convenient to just return the values, but the property node is needed
	 * to find the corresponding (preceding) documentation comment.
	 *
	 * If a defaultKey is given, then a simple literal value instead of an object literal is also accepted. 
	 * It will be interpreted as the value of a property with the name specified as defaultKey.
	 * <pre>
	 *    "value" 
	 * </pre>
	 * is a shorthand notation of 
	 * <pre>
	 *   {
	 *     'defaultKey': "value"
	 *   }
	 * </pre>
	 * @param {object} node Esprima compatible node of a syntax tree
	 * @param {string} defaultKey When no object is given but only a literla, then the literal is assumed to be the value of the defaultKey 
	 * @returns {Map<string,Property>} Map of "Property" objects keyed by the property key
	 */
	function createPropertyMap(node, defaultKey) {

		var result;

		if ( node != null ) {

			//if ( node.type === Syntax.Property ) {
			//	node = node.value;
			//	//console.log("property found, skipped to " + node.type);
			//}

			// special handling of the synthetic ___ = {} assignments that JSDoc3 creates for @lends statements -> reduce them to the object literal (right hand side of assignment)
			node = unlend(node);

			// if, instead of an object literal only a literal is given and there is a defaultKey, then wrap the literal in a map
			if ( node.type === Syntax.Literal && defaultKey != null ) {
				result = {};
				result[defaultKey] = { type: Syntax.Property, value: node };
				return result;
			}

			if ( node.type != Syntax.ObjectExpression ) {
				// something went wrong, it's not an object literal
				jQuery.sap.log.error("not an object literal:" + node.type + ":" + node.value);
				// console.log(node.toSource());
				return;
			}

			// invariant: node.type == Syntax.ObjectExpression
			result = {};
			for (var i = 0; i < node.properties.length; i++) {
				var prop = node.properties[i];
				var name;
				//console.log("objectproperty " + prop.type);
				if ( prop.key.type === Syntax.Identifier ) {
					name = prop.key.name;
				} else if ( prop.key.type === Syntax.Literal ) {
					name = String(prop.key.value);
				} else {
					name = prop.key.toSource();
				}
				//console.log("objectproperty " + prop.type + ":" + name);
				result[name] = prop;
			}
		}
		return result;
	}

	var astNodeInfos = {
		AssignmentExpression: [ 'left', 'right' ],
		ArrayExpression: [ 'elements' ],
		BlockStatement: [ 'body' ],
		BinaryExpression: [ 'left', 'right' ],
		BreakStatement: [],
		CallExpression: [ 'callee', 'arguments' ],
		CatchClause: [],
		ConditionalExpression: [ 'test', 'consequent', 'alternate' ],
		ContinueStatement: [],
		DoWhileStatement: [ 'body', 'test' ],
		DebuggerStatement: [],
		EmptyStatement: [],
		ExpressionStatement: [ 'expression' ],
		ForStatement: [ 'init', 'test', 'update', 'body' ],
		ForInStatement: [ 'left', 'right', 'body' ],
		FunctionDeclaration: [ 'id', 'params', 'body' ],
		FunctionExpression: [ 'id', 'params', 'body' ],
		Identifier: [],
		IfStatement: [ 'test', 'consequent', 'alternate' ],
		Literal: [],
		LabeledStatement: [ 'body' ],
		LogicalExpression: [ 'left', 'right' ],
		MemberExpression: [ 'object', 'property' ],
		NewExpression: [ 'callee', 'arguments' ],
		ObjectExpression: [ 'properties' ],
		Program: [ 'body' ],
		Property: [ 'key', 'value' ],
		ReturnStatement: [ 'argument' ],
		SequenceExpression: [ 'expressions' ],
		SwitchStatement: [ 'discriminant', 'cases' ],
		SwitchCase: [ 'test', 'consequent' ],
		ThisExpression: [],
		ThrowStatement: [ 'argument' ],
		TryStatement: [ '' ], // TODO
		UnaryExpression: [ 'argument' ],
		UpdateExpression: [ 'argument' ],
		VariableDeclaration: [ 'declarations' ],
		VariableDeclarator: [ 'id', 'init' ],
		WhileStatement: [ 'test', 'body' ],
		WithStatement: [ 'object', 'body' ]
	};

	function visit(root, delegate, args) {
	
		function _visit(node) {
	
			// call the delegate before the children
			if ( delegate["*"] ) {
				delegate["*"].call(delegate, node, args);
			}
			if ( delegate[node.type] ) {
				delegate[node.type].call(delegate, node, args);
			}
			
			// visit children
			var aChildNames = astNodeInfos[node.type];
			if ( aChildNames ) {
				for (var i = 0; i < aChildNames.length; i++) {
					var aChildNodes = node[aChildNames[i]];
					if ( jQuery.isArray(aChildNodes) ) {
						for ( var j = 0; j < aChildNodes.length; j++) {
							if ( aChildNodes[j] ) {
								_visit(aChildNodes[j]);
							}
						}
					} else if ( aChildNodes ) {
						_visit(aChildNodes);
					}
				}
			} else {
				jQuery.sap.log.warning("don't know how to handle " + node.type);
			}
	
			// call the delegate
			if ( delegate["after:" + node.type] ) {
				delegate["after:" + node.type].call(delegate, node, args);
			}
			if ( delegate["after:*"] ) {
				delegate["after:*"].call(delegate, node, args);
			}
			
		}
		
		_visit(root);
	}

	return {
		createPropertyMap: createPropertyMap,
		unlend: unlend,
		visit : visit
	};
	
}, /* export= */ true);

