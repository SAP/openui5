package com.sap.openui5;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.JarURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;


/**
 * The <class>DiscoveryService</code> is used to inspect the resources of the
 * web application and in the JARs in the classpath. It can return the information
 * what kind of web application pages, test pages or libararies are part of the
 * current web application.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 *
 * @author Peter Muessig
 */
public final class DiscoveryService implements ServletContextListener {


  /** context init parameter for application name (used for version information) */
  private static final String INIT_PARAM_APP_NAME = DiscoveryService.class.getName() + ".APP_NAME";


  /** default prefix for the classpath */
  private static final String CLASSPATH_PREFIX = "META-INF";

  /** regex to find the resources to include in the resources list (contains a placeholder for the path prefix) */
  private static final String REGEX_JAR_INCLUDE = "(?:" + CLASSPATH_PREFIX + "({0}([^/]+/?)))";

  /** regex to exclude dedicated resources from the WAR (META-INF, WEB-INF and OSGI-INF) */
  private static final String REGEX_WAR_EXCLUDE = "/(?:META|WEB|OSGI)-INF/";

  /** regex to identify the test pages (with a placeholder for the libraries) */
  private static final String REGEX_TESTPAGES = "(/({0})/(([A-Z0-9._%+-]+/)*([A-Z_0-9-\\.]+)\\.html))";

  /** pattern to identify the application pages */
  private static final Pattern PATTERN_APP_PAGES = Pattern.compile(
    ".+\\.html",
    Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

  /** pattern to identify the libraries */
  private static final Pattern PATTERN_LIBRARIES = Pattern.compile(
    "/([A-Z0-9._%+-/]+)/[A-Z0-9._]*\\.library",
    Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);


  /** list of application resources */
  private Set<String> appResources = new TreeSet<String>();

  /** list of resources */
  private Set<String> resources = new TreeSet<String>();

  /** list of test-resources */
  private Set<String> testResources = new TreeSet<String>();


  /** reference to the <code>ServletContext</code> */
  private ServletContext context;

  /** flag, whether the service has been initialized or not */
  private boolean initialized = false;

  /**
   * returns the instance of the <code>DiscoveryService</code> from the <code>ServletContext</code>
   * @param context the <code>ServletContext</code>
   * @return the <code>DiscoveryService</code>
   */
  public static DiscoveryService getInstance(ServletContext context) {
    return (DiscoveryService) context.getAttribute(DiscoveryService.class.getName());
  } // method: getInstance


  /**
   * initializes the <code>DiscoveryService</code> and performs a resource lookup
   * to create a map of app, runtime and test resources for resource determination
   */
  private synchronized void initialize() {
    if (!this.initialized) {
      long millis = System.currentTimeMillis();

      // lookup for the resources in the context path
      this.listContextResources("/", this.appResources);

      // lookup for the resources in the classpath
      try {
        this.listClasspathResources("/resources/", this.resources);
        this.listClasspathResources("/test-resources/", this.testResources);
      } catch (IOException ex) {
        throw new RuntimeException("Scan for classpath resources failed!", ex);
      }

      this.log("Resource lookup took: " + (System.currentTimeMillis() - millis) + "ms");
      this.initialized = true;
    }
  } // method: initialize


  /* (non-Javadoc)
   * @see javax.servlet.ServletContextListener#contextInitialized(javax.servlet.ServletContextEvent)
   */
  @Override
  public void contextInitialized(ServletContextEvent event) {
    this.context = event.getServletContext();
    this.context.setAttribute(DiscoveryService.class.getName(), this);
  } // method: contextInitialized


  /* (non-Javadoc)
   * @see javax.servlet.ServletContextListener#contextDestroyed(javax.servlet.ServletContextEvent)
   */
  @Override
  public void contextDestroyed(ServletContextEvent event) {
    this.context.removeAttribute(DiscoveryService.class.getName());
    this.context = null;
  } // method: contextDestroyed


  /**
   * logs the given message
   * @param msg the message to log
   */
  public void log(String msg) {
    this.context.log("DiscoveryService: "+ msg);
  } // method: log


  /**
   * logs the given message and exception
   * @param message the message
   * @param t the exception
   */
  public void log(String message, Throwable t) {
    this.context.log("DiscoveryService: " + message, t);
  } // method: log


  /**
   * returns the list of available libraries
   * @return the list of available libraries
   */
  public List<Entry> getAllLibraries() {
    this.initialize();
    List<Entry> libs = new ArrayList<Entry>();
    for (String resource : this.resources) {
      Matcher m = PATTERN_LIBRARIES.matcher(resource);
      if (m.matches()) {
        String lib = m.group(1);
        libs.add(new Entry(lib.substring("resources/".length())));
      }
    }
    return libs;
  } // method: getAllLibraries


  /**
   * returns the list of available application pages
   * @return the list of available application pages
   */
  public List<Entry> getAppPages() {
    this.initialize();
    List<Entry> appPages = new ArrayList<Entry>();
    for (String resource : this.appResources) {
      if (PATTERN_APP_PAGES.matcher(resource).matches()) {
        appPages.add(new Entry(resource));
      }
    }
    return appPages;
  } // method: getAppPages


  /**
   * returns the list of available test pages
   * @return the list of available test pages
   */
  public List<TestPage> getTestpages() {
    this.initialize();

    // create the regular expression to filter the test pages for all libraries
    List<Entry> libs = this.getAllLibraries();
    StringBuffer regexLibs = new StringBuffer();
    for (Entry lib : libs) {
      if (regexLibs.length() > 0) {
        regexLibs.append("|");
      }
      regexLibs.append(lib.entry);
    }
    Pattern p = Pattern.compile(MessageFormat.format("/test-resources" + REGEX_TESTPAGES, regexLibs.toString()), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

    // return the list of test pages
    List<TestPage> pages = new ArrayList<TestPage>();
    for (String resource : this.testResources) {
      Matcher m = p.matcher(resource);
      if (m.matches()) {
        String lib = m.group(2).replace('/', '.');
        String name = m.group(3);
        String url = this.context.getContextPath() + resource;
        pages.add(new TestPage(lib, name, url));
      }
    }
    return pages;

  } // method: getTestpages


  /**
   * returns the version information
   * @return the version information
   */
  public VersionInfo getVersionInfo() {
    this.initialize();
    List<Artifact> libraries = new ArrayList<DiscoveryService.Artifact>();
    for (Entry lib : this.getAllLibraries()) {
      libraries.add(new Artifact(lib.entry.replace('/', '.'), "${version}", "${buildtime}", "${lastchange}", ""));
    }
    String appName = this.context.getInitParameter(INIT_PARAM_APP_NAME);
    if (appName == null) {
      appName = this.context.getContextPath().substring(1);
    }
    return new VersionInfo(appName, "${version}", "${buildtime}", "${lastchange}", "", libraries);
  } // method: getVersionInfo


  /**
   * lists the resourcs in the web context (part of the WAR file)
   * @param path path to lookup
   * @param resources set of found resources
   */
  @SuppressWarnings("unchecked")
  private void listContextResources(String path, Set<String> resources) {
    Set<String> resourcePaths = this.context.getResourcePaths(path);
    Pattern p = Pattern.compile(REGEX_WAR_EXCLUDE, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    for (String resourcePath : resourcePaths) {
      Matcher m = p.matcher(resourcePath);
      if (!m.matches()) {
        if (resourcePath.endsWith("/")) {
          this.listContextResources(resourcePath, resources);
        } else {
          resources.add(resourcePath);
        }
      }
    }
  } // method: listContextResources


  /**
   * lists the resources in the classpath (part of the JAR files)
   * @param path path to lookup
   * @param resources set of found resources
   * @throws IOException
   */
  private void listClasspathResources(String path, Set<String> resources) throws IOException {

    // define the resource path to lookup
    String resourcePath = CLASSPATH_PREFIX + path;
    Pattern p = Pattern.compile(MessageFormat.format(REGEX_JAR_INCLUDE, path), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    Enumeration<URL> urls = Thread.currentThread().getContextClassLoader().getResources(resourcePath);
    Set<String> dirs = new TreeSet<String>();

    while (urls.hasMoreElements()) {
      URL url = urls.nextElement();
      URLConnection connection = url.openConnection();
      if (connection instanceof JarURLConnection) {
        // for JAR files we scan the content and check it by using a regex
        JarURLConnection jarConnection = (JarURLConnection) connection;
        JarFile jar = jarConnection.getJarFile();
        Enumeration<JarEntry> entries = jar.entries();
        while (entries.hasMoreElements()) {
          JarEntry entry = entries.nextElement();
          Matcher m = p.matcher(entry.toString());
          if (m.matches()) {
            if (entry.isDirectory()) {
              dirs.add(m.group(2));
            } else {
              resources.add(m.group(1));
            }
          }
        }
      } else {
        // unlikely the FileURLConnection is not providing a public API
        // therefore we need to do some dirty tricks for the file listing
        connection.connect();
        Object fieldFile = this.getDeclaredFieldValue(connection, "file");
        if (fieldFile instanceof File) {
          File file = (File) fieldFile;
          if (file != null && file.exists()) {
            if (file.isDirectory()) {
              File[] files = file.listFiles();
              for (File f : files) {
                if (f.isDirectory()) {
                  dirs.add(f.getName() + "/");
                } else {
                  resources.add(path + f.getName());
                }
              }
            }
          }
        } else {
          this.log("listClasspathResources: cannot list resources for path: \"" + path + "\"!");
        }
      }
    }

    // find the resources of the nested paths
    for (String dir : dirs) {
      this.listClasspathResources(path + dir, resources);
    }

  } // method: listClasspathResources


  /**
   * helper to access the value of declared fields which are normally not
   * accessible via public getter or setter functions
   * @param object object instance
   * @param fieldName name of the field to access
   * @return value of the field
   */
  private Object getDeclaredFieldValue(Object object, String fieldName) {
    try {
      Field field = object.getClass().getDeclaredField(fieldName);
      boolean isAccessible = field.isAccessible();
      if (!isAccessible) {
        field.setAccessible(true);
      }
      Object value = field.get(object);
      field.setAccessible(isAccessible);
      return value;
    } catch (Exception ex) {
      return null;
    }
  } // method: getDeclaredFieldValue


  /**
   * The class <code>Entry</code> is used to create a proper JSON
   * response with an array of entries for the app_pages and all_libs
   * requests.
   */
  static class Entry {

    String entry;

    Entry(String entry) {
      this.entry = entry;
    } // constructor

  } // class: Entry


  /**
   * The class <code>TestPage</code> is used to create a proper JSON
   * response with an array of test pages.
   */
  static class TestPage {

    String lib;

    String name;

    String url;

    TestPage(String lib, String name, String url) {
      this.lib = lib;
      this.name = name;
      this.url = url;
    } // constructor

  } // class: TestPage


  /**
   * The class <code>Artifact</code> is used to create a proper JSON
   * response for an artifact in the version information.
   */
  static class Artifact {

    String name;

    String version;

    String buildTimestamp;

    String scmRevision;

    String gav;

    Artifact(String name, String version, String buildTimestamp, String scmRevision, String gav) {
      this.name = name;
      this.version = version;
      this.buildTimestamp = buildTimestamp;
      this.scmRevision = scmRevision;
      this.gav = gav;
    } // constructor

  } // class: Artifact


  /**
   * The class <code>VersionInfo</code> is used to create a proper JSON
   * response for the version information <code>resources/sap-ui-version.json</code>.
   */
  static class VersionInfo extends Artifact {

    List<Artifact> libraries;

    VersionInfo(String name, String version, String buildTimestamp, String scmRevision, String gav, List<Artifact> libraries) {
      super(name, version, buildTimestamp, scmRevision, gav);
      if (libraries != null) {
        this.libraries = libraries;
      } else {
        this.libraries = new ArrayList<DiscoveryService.Artifact>();
      }
    } // constructor

  } // class: VersionInfo


} // class: DiscoveryService
