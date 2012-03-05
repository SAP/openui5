/*
 * Copyright 2012 by SAP AG, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP AG, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.sonar.javascript;

import java.util.Arrays;
import java.util.List;

import org.sonar.api.SonarPlugin;

import com.sap.ui5.sonar.javascript.jscoverage.JSCoverageSensor;
import com.sap.ui5.sonar.javascript.jslint.JSLintExtensionRepository;
import com.sap.ui5.sonar.javascript.jslint.JSLintSensor;


/**
 * The class <b><code>JavaScriptPlugin</code></b> is the entry point where to
 * register the set of extensions (sensors, decorators, ...)
 * <br>
 * @author D039071@exchange.sap.corp
 * @author <code>Revision Author: ($Author: D039071 $)</code>
 * @version 1.0 - 04.03.2012 08:12:30
 * @version <code>Revision Version: ($Revision: #1 $)</code>
 * @version <code>Revision Date: ($Date: 2012/01/01 $)</code>
 */
public final class JavaScriptPlugin extends SonarPlugin {

	/* CLASS ANOTATION FOR CONFIGURATION
	@Properties({
	    @Property(
	        key = JavaScriptPlugin.REPORT_PATH,
	        name = "Report Path",
	        description = "Path (absolute or relative) to Cobertura xml report file.")})
	//public static final String REPORT_PATH = "sonar.sapui5.jsCoverage.reportPath";
	*/
	
  // This is where you're going to declare all your Sonar extensions
  /* (non-Javadoc)
   * @see org.sonar.api.Plugin#getExtensions()
   */
  @SuppressWarnings({ "rawtypes", "unchecked" })
	public List getExtensions() {
    return Arrays.asList(JSCoverageSensor.class, JSLintExtensionRepository.class, JSLintSensor.class);
  } // method: getExtensions

  
	/* (non-Javadoc)
	 * @see org.sonar.api.SonarPlugin#toString()
	 */
	@Override
	public String toString() {
		return this.getClass().getSimpleName();
	} // method: toString
  
  
} // class: JavaScriptPlugin