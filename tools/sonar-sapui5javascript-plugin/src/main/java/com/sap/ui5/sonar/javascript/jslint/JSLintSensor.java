/*
 * Copyright 2012 by SAP AG, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP AG, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.sonar.javascript.jslint;

import java.io.File;
import java.io.IOException;

import javax.xml.stream.XMLStreamException;

import org.apache.commons.io.FileUtils;
import org.apache.xerces.impl.xpath.regex.ParseException;
import org.codehaus.staxmate.in.SMHierarchicCursor;
import org.codehaus.staxmate.in.SMInputCursor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonar.api.batch.Sensor;
import org.sonar.api.batch.SensorContext;
import org.sonar.api.profiles.RulesProfile;
import org.sonar.api.resources.Project;
import org.sonar.api.resources.Resource;
import org.sonar.api.rules.RuleFinder;
import org.sonar.api.rules.Violation;
import org.sonar.api.utils.StaxParser;
import org.sonar.api.utils.XmlParserException;


/**
 * The class <b><code>JSCoverageSensor</code></b> is the sensor for reporting
 * JavaScript coverage results to Sonar.
 * <br>
 * @author D039071@exchange.sap.corp
 * @author <code>Revision Author: ($Author: D039071 $)</code>
 * @version 1.0 - 03.03.2012 23:08:12
 * @version <code>Revision Version: ($Revision: #1 $)</code>
 * @version <code>Revision Date: ($Date: 2012/01/01 $)</code>
 */
public class JSLintSensor implements Sensor {

	
	/** logger instance */
	private static Logger LOG = LoggerFactory.getLogger(JSLintSensor.class); 
	
	
	private RuleFinder ruleFinder;
	
	//private RulesProfile rulesProfile;
	
	
  /**
   * constructs the class <code>JSLintSensor</code>
   * @param ruleFinder reference to the <code>RuleFinder</code>
   * @param rulesProfile reference to the <code>RulesProfile</code>
   */
  public JSLintSensor(RuleFinder ruleFinder, RulesProfile rulesProfile) {
    this.ruleFinder = ruleFinder;
    //this.rulesProfile = rulesProfile;
  } // constructor

  
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return this.getClass().getSimpleName();
	} // method: toString
  
  
	/* (non-Javadoc)
	 * @see org.sonar.api.batch.CheckProject#shouldExecuteOnProject(org.sonar.api.resources.Project)
	 */
	public boolean shouldExecuteOnProject(Project project) {
		// This sensor is executed on any type of projects
		return true;
	} // method: analyse


	/* (non-Javadoc)
	 * @see org.sonar.api.batch.Sensor#analyse(org.sonar.api.resources.Project, org.sonar.api.batch.SensorContext)
	 */
	public void analyse(Project project, SensorContext sensorContext) {

		// read the parameters (both must be set)
    String path = (String) project.getProperty("sonar.jslint.reportPath");
    if (path == null) {
      // wasn't configured - skip
      return;
    }

    // find the coverage report => (no report => no coverage)
    File report = project.getFileSystem().resolvePath(path);
    if (!report.exists() || !report.isFile()) {
    	LOG.warn("Coverage \"sonar.jslint.reportPath\" not found at {}", report);
      return;
    }
		
    // parsing the report
    LOG.info("parsing {}", report);
    this.parseReport(report, sensorContext);

	} // method: analyse
	
	
  /**
   * parses the coverage report (xml file)
   * @param xmlFile coverage report
   * @param context sensor context
   */
  private void parseReport(File xmlFile, final SensorContext context) {

    try {
    	
      StaxParser parser = new StaxParser(new StaxParser.XmlStreamHandler() {
        public void stream(SMHierarchicCursor rootCursor) throws XMLStreamException {
          try {
            rootCursor.advance();
            collectFileMeasures(rootCursor.descendantElementCursor("file"), context);
          } catch (ParseException e) {
            throw new XMLStreamException(e);
          }
        }
      });
      
      parser.parse(xmlFile);
    } catch (XMLStreamException e) {
      throw new XmlParserException(e);
    }
    
  } // method: parseReport
  

  /**
   * parses the file measures
   * @param file reference to the file xml element
   * @param context sensor context
   * @throws ParseException
   * @throws XMLStreamException
   */
  @SuppressWarnings("rawtypes")
	private void collectFileMeasures(SMInputCursor file, SensorContext context) throws ParseException, XMLStreamException {
  	
    while (file.getNext() != null) {
    	
      // check the existence of the file (index and add the source)
    	String fileName = file.getAttrValue("name");
      File f = new File(fileName);
      if (f.exists()) {
      	
      	// index and add the file
        Resource fileResource = new org.sonar.api.resources.File(fileName);
        if (context.getResource(fileResource) == null) { 
          context.index(fileResource);
					try {
						String source = FileUtils.readFileToString(f, "UTF-8");
						context.saveSource(fileResource, source);
					} catch (IOException ex) {
						LOG.error("Failed to index and save file : \"" + f + "\"!", ex);
					}
        }
        
        // add the violations!
        SMInputCursor issue = file.childElementCursor("issue");
        while (issue.getNext() != null) {
        	Violation v = this.createVialoationFromIssue(issue, fileResource);
        	context.saveViolation(v);
        }
        
      }
      
    }
    
  } // method: collectModuleMeasures

  
  /**
   * parses the issue data
   * @param issue reference to the issue xml element
   * @param resource reference to the resource
   * @throws ParseException
   * @throws XMLStreamException
   */
  @SuppressWarnings("rawtypes")
	private Violation createVialoationFromIssue(SMInputCursor issue, Resource resource) throws ParseException, XMLStreamException {
  	
  	Violation v = Violation.create(ruleFinder.findByKey("JSLint", "GENERIC_RULE"), resource);
  	v.setLineId(Integer.parseInt(issue.getAttrValue("line")));
  	v.setMessage(issue.getAttrValue("reason"));
  	
  	return v;
  	
  } // method: createVialoationFromIssue
  
  
} // class: JSCoverageSensor