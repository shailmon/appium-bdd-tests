import { Before, BeforeAll, After, AfterStep, AfterAll, Status } from '@cucumber/cucumber';
import allureReporter from '@wdio/allure-reporter';
import { driver } from '@wdio/globals';

BeforeAll(async () => {
  // Global setup
});

Before(async (scenario) => {
  const featureName = scenario.gherkinDocument.feature?.name || 'Unknown Feature';
  const scenarioName = scenario.pickle.name;

  // Set the feature and story labels for clean BDD grouping in Allure
  allureReporter.addFeature(featureName);
  allureReporter.addStory(scenarioName);
  allureReporter.addLabel('suite', featureName);
  allureReporter.addDescription(
    `**Feature:** ${featureName}\n**Scenario:** ${scenarioName}`,
    'markdown'
  );
});

AfterStep(async (step) => {
  const stepText   = step.pickleStep.text;
  const stepStatus = step.result.status;
  const passed     = stepStatus === Status.PASSED;

  // Capture screenshot after every step
  const screenshot = await driver.takeScreenshot();
  const label = passed
    ? `✅ PASSED — ${stepText}`
    : `❌ FAILED — ${stepText}`;

  allureReporter.addAttachment(label, Buffer.from(screenshot, 'base64'), 'image/png');
});

After(async (scenario) => {
  const status = scenario.result?.status;
  if (status === Status.FAILED) {
    allureReporter.addLabel('testType', 'screenshotDiff');
  }
});

AfterAll(async () => {
  // Global teardown
});
