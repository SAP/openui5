// replace placeholders (like @foo@)
module.exports = function(grunt, config) {

	return {

		target: {

			// replace patterns in all relevant files in the target resources dir
			src: [
				'target/openui5-*/resources/**/*.{js,css,less,json,xml,html}',
				'target/openui5-*/resources/**/.*'
			],

			// overwrite target files instead of copying into a dist dir
			overwrite: true,

			replacements: [

				// ${copyright} or @copyright@
				{
					from: /(?:\$\{copyright\}|@copyright@)/g,
					to:
						'UI development toolkit for HTML5 (OpenUI5)' + '\n' +
						' * (c) Copyright 2009-' + new Date().getFullYear() + ' SAP SE or an SAP affiliate company.' + '\n' +
						' * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.'
				},

				// ${version} or @version@
				{
					from: /(?:\$\{version\}|@version@)/g,
					to: '<%= package.version %>' // use version defined in package.json
				},

				// ${buildtime} or @buildtime@
				{
					from: /(?:\$\{buildtime\}|@buildtime@)/g,
					to: '<%= buildtime %>'
				},

				// ${lastchange} or @lastchange@
				{
					from: /(?:\$\{lastchange\}|@lastchange@)/g,
					to: '<%= lastchange %>'
				}

			]
		}

	};

};
