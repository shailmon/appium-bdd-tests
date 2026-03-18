import { Before, BeforeAll, After, AfterStep, AfterAll, Status } from '@cucumber/cucumber';
import allureReporter from '@wdio/allure-reporter';
import { driver } from '@wdio/globals';

BeforeAll(async () => {
  // Global setup if needed
});

Before(async (scenario) => {
  allureReporter.addFeature(scenario.gherkinDocument.feature?.name || 'Unknown Feature');
  allureReporter.addDescription(`Scenario: ${scenario.pickle.name}`, 'text');
});

AfterStep(async (step) => {
  // Take screenshot if step failed
  if (step.result.status === Status.FAILED) {
    const screenshot = await driver.takeScreenshot();
    allureReporter.addAttachment('Screenshot on failure', Buffer.from(screenshot, 'base64'), 'image/png');
  } else {
    // Take screenshot on critical steps even if passed (e.g. login, checkout)
    const stepText = step.pickleStep.text.toLowerCase();
    if (stepText.includes('login') || stepText.includes('submit') || stepText.includes('otp')) {
      const screenshot = await driver.takeScreenshot();
      allureReporter.addAttachment(`Screenshot after: ${step.pickleStep.text}`, Buffer.from(screenshot, 'base64'), 'image/png');
    }
  }
});

After(async () => {
  // Clean up scenario state if needed
});

AfterAll(async () => {
  // Global teardown if needed
});
