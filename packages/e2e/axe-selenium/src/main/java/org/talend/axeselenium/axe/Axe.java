package org.talend.axeselenium.axe;

import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.talend.axeselenium.Reporter;
import org.talend.axeselenium.Script;

import java.io.File;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

public class Axe {
    private WebDriver driver;
    private Script script;
    private Reporter reporter = new Reporter();

    public Axe(final WebDriver driver) {
        this.driver = driver;
        this.script = new Script(driver, Axe.class.getResource("axe.min.js"));
    }

    /**
     * Run WCAG 2.0 Level A scan.
     * @return the scan result JSON object.
     */
    public JSONObject runWCAG2a() {
        return runWCAG2a(null);
    }

    /**
     * Run WCAG 2.0 Level A scan on a specific element.
     * @return the scan result JSON object.
     */
    public JSONObject runWCAG2a(final WebElement element) {
        final Options options = Options.builder().runOnly("tag", "wcag2a").build();
        runAxeScript();
        return run(element, options);
    }

    /**
     * Run WCAG 2.0 Level AA scan.
     * @return the scan result JSON object.
     */
    public JSONObject runWCAG2aa() {
        return runWCAG2aa(null);
    }

    /**
     * Run WCAG 2.0 Level AA scan on a specific element.
     * @return the scan result JSON object.
     */
    public JSONObject runWCAG2aa(final WebElement element) {
        final Options options = Options.builder().runOnly("tag", "wcag2a", "wcag2aa").build();
        runAxeScript();
        return run(element, options);
    }

    /**
     * Run text-alternative category scan.
     * @return the scan result JSON object.
     */
    public JSONObject runNonTextContent() {
        return runNonTextContent(null);
    }

    /**
     * Run text-alternative category scan on a specific element.
     * @return the scan result JSON object.
     */
    public JSONObject runNonTextContent(final WebElement element) {
        runAxeScript();

        final Set<String> rules = new HashSet<>();
        rules.add("label");
        rules.add("button-name");
        rules.add("link-name");
        rules.add("hidden-content");
        rules.addAll(getRules("cat.name-role-value"));
        rules.addAll(getRules("cat.text-alternatives"));

        final Options options = Options.builder()
                .runOnly("rule", rules.toArray(new String[rules.size()]))
                .build();
        return run(element, options);
    }

    /**
     * Run a scan on the element (or document if not provided)
     * @param element the element to scan. "document" is scanned if element is null.
     * @param options axe-core options.
     * @return the scan result JSON object.
     */
    public JSONObject run(final WebElement element, final Options options) {
        final String axeOptions = options == null ? "{}" : options.toString();
        final String command = String.format(
                "const done = arguments[arguments.length - 1];\n" +
                "function handleResult(error, report) { if (error) { throw error; } return done(report); }\n" +
                "const targetElement = arguments[0] || document;\n" +
                "axe.run(targetElement, %s, handleResult);",
                axeOptions
        );
        final Object response = ((JavascriptExecutor) this.driver).executeAsyncScript(command, element);

        return new JSONObject((Map) response);
    }

    /**
     * Save scan result in ${reportFolder}/${name}.json.
     * Build a junit friendly violation report.
     * @param reportFolder The folder where to store the scan result.
     * @param name The result file name.
     * @param result The scan result.
     * @return the formatted violation report string, null if no violation.
     */
    public String reportViolations(final String reportFolder, final String name, final JSONObject result) {
        new File(reportFolder).mkdirs();
        final JSONArray violations = result.getJSONArray("violations");
        if (violations.length() > 0) {
            final String formattedViolations = reporter.report(violations);
            reporter.writeResults(reportFolder + '/' + name, result);
            reporter.writeResults(reportFolder + '/' + name, formattedViolations);
            return formattedViolations;
        }
        return null;
    }

    private void runAxeScript() {
        this.driver.manage().timeouts().setScriptTimeout(30, TimeUnit.SECONDS);
        this.script.runAxeScript();
    }

    private List<String> getRules(final String tag) {
        final String command = String.format("return axe.getRules(['%s'])", tag);
        final Object response = ((JavascriptExecutor) this.driver).executeScript(command);
        return ((List<Map>)response)
                .stream()
                .map(rule -> new JSONObject(rule).getString("ruleId"))
                .collect(toList());
    }
}
