/*
 * Copyright 2012 by SAP AG, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP AG, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.sonar.javascript.jscoverage;

import java.io.File;
import java.io.IOException;
import java.util.Locale;
import java.util.Map;

import javax.xml.stream.XMLStreamException;

import org.apache.commons.io.FileUtils;
import org.apache.xerces.impl.xpath.regex.ParseException;
import org.codehaus.staxmate.in.SMHierarchicCursor;
import org.codehaus.staxmate.in.SMInputCursor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonar.api.batch.Sensor;
import org.sonar.api.batch.SensorContext;
import org.sonar.api.measures.CoverageMeasuresBuilder;
import org.sonar.api.measures.Measure;
import org.sonar.api.resources.Project;
import org.sonar.api.resources.Resource;
import org.sonar.api.utils.ParsingUtils;
import org.sonar.api.utils.StaxParser;
import org.sonar.api.utils.XmlParserException;

import com.google.common.collect.Maps;


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
public class JSCoverageSensor implements Sensor {

	
	/** logger instance */
	private static Logger LOG = LoggerFactory.getLogger(JSCoverageSensor.class); 
	
	
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
    String sourcePath = (String) project.getProperty("sonar.jscoverage.sourcePath");
    String path = (String) project.getProperty("sonar.jscoverage.reportPath");
    if (path == null || sourcePath == null) {
      // wasn't configured - skip
      return;
    }

		// find the sources (no sources => no coverage)
    File sourcesDir = project.getFileSystem().resolvePath(sourcePath);
  	if (!sourcesDir.exists() || !sourcesDir.isDirectory()) {
  		LOG.warn("Coverage \"sonar.jscoverage.sourcePath\" not found at {}", sourcePath);
  		return;
  	}

    // find the coverage report => (no report => no coverage)
    File report = project.getFileSystem().resolvePath(path);
    if (!report.exists() || !report.isFile()) {
    	LOG.warn("Coverage \"sonar.jscoverage.reportPath\" not found at {}", report);
      return;
    }
		
		// attach the sources
    LOG.info("attaching sources from {}", sourcePath);
		this.attachSources(sensorContext, sourcesDir, sourcesDir);
  	
    // parsing the report
    LOG.info("parsing {}", report);
    this.parseReport(report, sensorContext);

	} // method: analyse
	
	
	/**
	 * attaches the resources found in the coverage source path
	 * @param context sensor context
	 * @param sourcesDir source path
	 * @param baseDir base source path
	 */
	@SuppressWarnings("rawtypes")
	private void attachSources(SensorContext context, File sourcesDir, File baseDir) {
		
		// recursivly check the source path for JS files: index and attach them
		File[] childs = sourcesDir.listFiles();
		for (File child : childs) {

			if (child.isDirectory()) {
				this.attachSources(context, child, baseDir);
			} else if (child.getName().endsWith(".js")) {
				
				try {

					// make the resource path relative
					String fileName = child.getCanonicalPath().substring(baseDir.getCanonicalPath().length());
					fileName = fileName.replace('\\', '/');
					if (fileName.startsWith("/")) fileName = fileName.substring(1);
					
					// index and save the source of the file
					Resource file = new org.sonar.api.resources.File(fileName);
	        context.index(file);
					String source = FileUtils.readFileToString(child, "UTF-8");
					context.saveSource(file, source);
					
				} catch (IOException ex) {
					LOG.error("Failed to index and save file : \"" + child + "\"!", ex);
				}
				
			}
			
		}
		
	} // method: attachSources
	
	
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
            collectModuleMeasures(rootCursor.descendantElementCursor("module"), context);
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
   * parses the module measures
   * @param module reference to the module xml element
   * @param context sensor context
   * @throws ParseException
   * @throws XMLStreamException
   */
  @SuppressWarnings("rawtypes")
	private void collectModuleMeasures(SMInputCursor module, SensorContext context) throws ParseException, XMLStreamException {
  	
    while (module.getNext() != null) {
    	
    	// read the module measures
      Map<String, CoverageMeasuresBuilder> builderByFilename = Maps.newHashMap();
      String fileName = module.getAttrValue("filename");
      CoverageMeasuresBuilder builder = builderByFilename.get(fileName);
      if (builder==null) {
        builder = CoverageMeasuresBuilder.create();
        builderByFilename.put(fileName, builder);
      }
      collectModuleData(module, builder);

      // save the module measures (only for indexed resources!)
      for (Map.Entry<String, CoverageMeasuresBuilder> entry : builderByFilename.entrySet()) {
        String filename = entry.getKey(); 
        Resource file = new org.sonar.api.resources.File(filename);
        if (context.getResource(file) != null) { // exists/indexed?
          for (Measure measure : entry.getValue().createMeasures()) {
            context.saveMeasure(file, measure);
          }
        }
      }
      
    }
    
  } // method: collectModuleMeasures

  
  /**
   * parses the module data
   * @param module reference to the module xml element
   * @param builder reference to the coverage measure builder for the module
   * @throws ParseException
   * @throws XMLStreamException
   */
  private void collectModuleData(SMInputCursor module, CoverageMeasuresBuilder builder) throws ParseException, XMLStreamException {
  	
    SMInputCursor line = module.childElementCursor("lines").advance().childElementCursor("line");
    while (line.getNext() != null) {
      int lineId = Integer.parseInt(line.getAttrValue("number"));
      try {
				builder.setHits(lineId, (int) ParsingUtils.parseNumber(line.getAttrValue("hits"), Locale.ENGLISH));
			} catch (java.text.ParseException ex) {
				LOG.error("Failed to parse the hit count for line: \"" + lineId + "\" in module \"" + module.getAttrValue("filename") + "\"!", ex);
			}
    }
    
  } // method: collectModuleData
  
  
} // class: JSCoverageSensor