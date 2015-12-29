package com.sap.openui5;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.net.JarURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;


/**
 * The <class>DiscoveryServlet</code> is used to inspect the resources of the
 * web application and in the JARs in the classpath. It can return the information
 * what kind of web application pages, test pages or libararies are part of the
 * current web application.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 *
 * @author Peter Muessig
 */
public class DiscoveryServlet extends HttpServlet {


  /** serial version UID */
  private static final long serialVersionUID = -2150070019181955209L;


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


  /* (non-Javadoc)
   * @see javax.servlet.GenericServlet#init()
   */
  @Override
  public void init() throws ServletException {

    long millis = System.currentTimeMillis();

    // lookup for the resources in the context path
    this.listContextResources("/", this.appResources);

    // lookup for the resources in the classpath
    try {
      this.listClasspathResources("/resources/", this.resources);
      this.listClasspathResources("/test-resources/", this.testResources);
    } catch (IOException ex) {
      throw new ServletException("Scan for classpath resources failed!", ex);
    }

    this.log("Resource lookup took: " + (System.currentTimeMillis() - millis) + "ms");

  } // method: init


  /* (non-Javadoc)
   * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    String path = request.getPathInfo();

    Map<String, Object> content = new HashMap<String, Object>();
    String contentType = "application/json";

    if ("/app_pages".equals(path)) {

      List<Entry> appPages = new ArrayList<Entry>();
      for (String resource : this.appResources) {
        if (PATTERN_APP_PAGES.matcher(resource).matches()) {
          appPages.add(new Entry(resource));
        }
      }
      content.put(path.substring(1), appPages);

    } else if ("/all_libs".equals(path)) {

      List<Entry> libs = this.getAllLibraries();
      content.put(path.substring(1), libs);

    } else if ("/all_tests".equals(path)) {

      List<Entry> libs = this.getAllLibraries();
      StringBuffer regexLibs = new StringBuffer();
      for (Entry lib : libs) {
        if (regexLibs.length() > 0) {
          regexLibs.append("|");
        }
        regexLibs.append(lib.entry);
      }
      Pattern p = Pattern.compile(MessageFormat.format("/test-resources" + REGEX_TESTPAGES, regexLibs.toString()), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);

      List<TestPage> pages = new ArrayList<TestPage>();
      for (String resource : this.testResources) {
        Matcher m = p.matcher(resource);
        if (m.matches()) {
          String lib = m.group(2).replace('/', '.');
          String name = m.group(3);
          String url = request.getContextPath() + resource;
          pages.add(new TestPage(lib, name, url));
        }
      }
      content.put(path.substring(1), pages);

    } else {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    response.setCharacterEncoding("UTF-8");
    response.setContentType(contentType);
    response.setStatus(HttpServletResponse.SC_OK);

    PrintWriter writer = response.getWriter();
    Gson gson = new Gson();
    writer.write(gson.toJson(content));
    writer.flush();
    writer.close();

  } // method: doGet

  private List<Entry> getAllLibraries() {
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
   * lists the resourcs in the web context (part of the WAR file)
   * @param path path to lookup
   * @param resources set of found resources
   */
  @SuppressWarnings("unchecked")
  private void listContextResources(String path, Set<String> resources) {
    Set<String> resourcePaths = this.getServletContext().getResourcePaths(path);
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
   * lists the resourcs in the classpath (part of the JAR files)
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


} // class: DiscoveryServlet
