/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package com.sap.ui5.tools.maven;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * The class <b><code>Maven2OsgiConverter</code></b> is used to convert the 
 * Maven version into an OSGi version.
 * <br>
 * <b>Excerpts copied from Apache Felix - Maven Bundle Plugin</b> 
 * <br>
 * @author <a href="mailto:carlos@apache.org">Carlos Sanchez</a>
 * @version $Id: //tc1/phoenix/dev/tools/maven/infrastructure/_version_tool/src/main/java/com/sap/ui5/tools/maven/Maven2OsgiConverter.java#1 $
 * <br>
 * @see org.apache.maven.shared.osgi.DefaultMaven2OsgiConverter
 * 
 */
public class Maven2OsgiConverter {


	static final Pattern FUZZY_VERSION = Pattern.compile("(\\d+)(\\.(\\d+)(\\.(\\d+))?)?([^a-zA-Z0-9](.*))?", Pattern.DOTALL);
	static final Pattern MAVEN_VERSION = Pattern.compile("(\\d+)(\\.(\\d+)(\\.(\\d+))?)?(-(.*))?", Pattern.DOTALL);

	
	public static boolean isMavenVersion(String version) {
    Matcher m = MAVEN_VERSION.matcher(version);
    return m.matches();
	} // method: isMavenVersion
	
	
	/**
	 * returns the Maven version for the given OSGi version
	 * @param osgiVersion OSGi version
	 * @return Maven version
	 */
	public static String getMavenVersion(String osgiVersion) {
		String mavenVersion = cleanupVersion(osgiVersion, '-');
		if (mavenVersion.endsWith("-qualifier"))
			mavenVersion = mavenVersion.replace("-qualifier", "-SNAPSHOT");
		return mavenVersion;
	} // method: getMavenVersion
	
	/**
	 * returns the OSGi version for the given Maven version
	 * @param mavenVersion Maven version
	 * @return OSGi version
	 */
	public static String getOsgiVersion(String mavenVersion) {
		String osgiVersion = cleanupVersion(mavenVersion, '.');
		if (osgiVersion.endsWith(".SNAPSHOT"))
			osgiVersion = osgiVersion.replace(".SNAPSHOT", ".qualifier");
		return osgiVersion;
	} // method: getOsgiVersion
	
	
  /**
   * Clean up version parameters. Other builders use more fuzzy definitions of
   * the version syntax. This method cleans up such a version to match an OSGi
   * version.
   *
   * @param VERSION_STRING
   * @return
   */
  static String cleanupVersion(String version, char modifierSeparator) {
      StringBuffer result = new StringBuffer();
      Matcher m = FUZZY_VERSION.matcher(version);
      if (m.matches()) {
          String major = m.group(1);
          String minor = m.group(3);
          String micro = m.group(5);
          String qualifier = m.group(7);

          if (major != null) {
              result.append(major);
              if (minor != null) {
                  result.append(".");
                  result.append(minor);
                  if (micro != null) {
                      result.append(".");
                      result.append(micro);
                      if (qualifier != null) {
                          result.append(modifierSeparator);
                          cleanupModifier(result, qualifier);
                      }
                  } else if (qualifier != null) {
                      result.append(".0");
                      result.append(modifierSeparator);
                      cleanupModifier(result, qualifier);
                  } else {
                      result.append(".0");
                  }
              } else if (qualifier != null) {
                  result.append(".0.0");
                  result.append(modifierSeparator);
                  cleanupModifier(result, qualifier);
              } else {
                  result.append(".0.0");
              }
          }
      } else {
          result.append("0.0.0");
          result.append(modifierSeparator);
          cleanupModifier(result, version);
      }
      return result.toString();
  }

  static void cleanupModifier(StringBuffer result, String modifier) {
      for (int i = 0; i < modifier.length(); i++) {
          char c = modifier.charAt(i);
          if ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z')
                  || (c >= 'A' && c <= 'Z') || c == '_' || c == '-')
              result.append(c);
          else
              result.append('_');
      }
  }

  
} // class: Maven2OsgiConverter