import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $, $$ } from '@wdio/globals';
import { driver } from '@wdio/globals';
import allureReporter from '@wdio/allure-reporter';
import { Actions } from '../utils/actions';

// --- Launch Flow ---
Given(/^I launch the application$/, async () => {
    // The Appium driver automatically launches the app defined in capabilities
});

Given(/^I am on the home screen$/, async () => {
    // Handle both states: onboarding screen OR already on home feed
    try {
        const skipBtn = await $('//*[@text="Skip"] | //*[@text="Continue"]');
        const isVisible = await skipBtn.isDisplayed().catch(() => false);
        if (isVisible) {
            // Dismiss onboarding — tap Skip to go straight to home feed
            await skipBtn.click();
            await driver.pause(1500);
        }
    } catch (e) {
        // Already on home screen, no onboarding to dismiss
    }

    // Also dismiss the "Got it" tooltip if present
    try {
        const gotIt = await $('//*[@text="Got it"]');
        if (await gotIt.isDisplayed().catch(() => false)) {
            await gotIt.click();
            await driver.pause(1000);
        }
    } catch (e) {
        // No tooltip
    }

    // Validate we landed on the home/explore screen
    const searchBar = await $('id:org.wikipedia.alpha:id/search_container');
    await searchBar.waitForDisplayed({ timeout: 20000 });
});

When(/^I tap on "([^"]*)"$/, async (text: string) => {
    const selector = `//*[@text='${text}'] | //*[contains(@content-desc, '${text}')]`;
    const el = await $(selector);
    await el.waitForDisplayed({ timeout: 8000 });
    await el.click();
});

// --- Send Keys / Keyboard Input ---

// Send keys to a specific named field (by label, hint, content-desc or placeholder text)
When(/^I send keys "([^"]*)" to the "([^"]*)" field$/, async (value: string, fieldName: string) => {
    // Try finding by hint text, content-desc, or label
    const selector = [
        `//*[@hint='${fieldName}']`,                          // Android hint / placeholder
        `//*[@content-desc='${fieldName}']`,                  // Accessibility ID
        `//*[@text='${fieldName}']/following-sibling::*[1]`,  // Sibling of a label
        `//android.widget.EditText[@text='${fieldName}']`,    // EditText with matching text
    ].join(' | ');

    const field = await $(selector);
    await field.waitForDisplayed({ timeout: 8000 });
    await field.clearValue();
    await field.setValue(value);
});

// Send keys to whichever EditText is currently focused / visible
When(/^I send keys "([^"]*)" to the active input$/, async (value: string) => {
    await driver.pause(800); // Wait for keyboard/field to be ready
    const input = await $('android.widget.EditText');
    await input.waitForDisplayed({ timeout: 8000 });
    // Use addValue to avoid clearValue issues on fields that only show hint text
    await input.addValue(value);
});

// Append keys to the currently focused field (no clear)
When(/^I append "([^"]*)" to the active input$/, async (value: string) => {
    const input = await $('android.widget.EditText');
    await input.waitForDisplayed({ timeout: 8000 });
    await input.addValue(value);
});

// Press a specific key by name (e.g. Enter, Search, Back)
When(/^I press the "([^"]*)" key$/, async (keyName: string) => {
    const keyMap: Record<string, number> = {
        Enter: 66,
        Search: 84,
        Back: 4,
        Delete: 67,
        Tab: 61,
        Space: 62,
    };
    const keyCode = keyMap[keyName];
    if (!keyCode) throw new Error(`Unknown key: "${keyName}". Supported: ${Object.keys(keyMap).join(', ')}`);
    await driver.pressKeyCode(keyCode);
});

When(/^I tap on the search bar$/, async () => {
    const searchBar = await $('id:org.wikipedia.alpha:id/search_container');
    await searchBar.waitForDisplayed({ timeout: 15000 });
    await searchBar.click();
});

When(/^I type "([^"]*)" in the search field$/, async (searchText: string) => {
    // After tapping search bar, find the active text input
    const input = await $('android.widget.EditText');
    await input.waitForDisplayed({ timeout: 8000 });
    await input.clearValue();
    await input.setValue(searchText);
    await driver.pause(1500); // Wait for results to load
});

Then(/^I should see search results for "([^"]*)"$/, async (searchText: string) => {
    // Results appear as a list; validate at least one result with matching text
    const result = await $(`//*[contains(@text, '${searchText}')] | //*[contains(@content-desc, '${searchText}')]`);
    await result.waitForDisplayed({ timeout: 10000 });
    await expect(result).toBeDisplayed();
});

When(/^I tap on the first search result$/, async () => {
    // Wait for results list and tap the first item
    const firstResult = await $('androidx.recyclerview.widget.RecyclerView //android.view.ViewGroup');
    await firstResult.waitForDisplayed({ timeout: 8000 });
    await firstResult.click();
    await driver.pause(2000); // Wait for article to load
});

When(/^I navigate back$/, async () => {
    await driver.back();
    await driver.pause(1000);
});

Then(/^I should see the app is on the "([^"]*)" tab$/, async (tabName: string) => {
    const tab = await $(`//*[@text='${tabName}'] | //*[@content-desc='${tabName}']`);
    await tab.waitForDisplayed({ timeout: 8000 });
    await expect(tab).toBeDisplayed();
});

When(/^I wait (\d+) seconds$/, async (seconds: number) => {
    await driver.pause(seconds * 1000);
});

When(/^I am on the login screen$/, async () => {
    const loginScreen = await $('~login-screen');
    await loginScreen.waitForDisplayed({ timeout: 10000 });
});

When(/^I enter my valid username and password$/, async () => {
    const usernameField = await $('~username-input');
    const passwordField = await $('~password-input');

    await usernameField.setValue('testuser');
    await passwordField.setValue('Password123!');
});

When(/^I tap on the login button$/, async () => {
    await Actions.click('~login-button');
});

Then(/^I should be successfully logged in$/, async () => {
    // A step indicating transition from login state
});

Then(/^I should see the home screen$/, async () => {
    const homeScreen = await $('~home-screen');
    await expect(homeScreen).toBeDisplayed();
});

// --- MFA Flow ---
When(/^I log in with valid credentials that require MFA$/, async () => {
    const usernameField = await $('~username-input');
    const passwordField = await $('~password-input');

    await usernameField.setValue('mfauser');
    await passwordField.setValue('Password123!');
    await Actions.click('~login-button');
});

Then(/^I should be prompted for an MFA code$/, async () => {
    const mfaScreen = await $('~mfa-screen');
    await expect(mfaScreen).toBeDisplayed();
});

When(/^I enter a valid 6-digit MFA code$/, async () => {
    const mfaInput = await $('~mfa-input');
    // Using a mocked valid code
    await mfaInput.setValue('123456');
});

When(/^I tap the verify button$/, async () => {
    await Actions.click('~verify-button');
});


When(/^I tap on the (Profile|Settings|Home) tab$/, async (tab: string) => {
    await Actions.click(`~${tab.toLowerCase()}-tab`);
});

Then(/^I should see the (Profile|Settings|Home) screen$/, async (screen: string) => {
    const el = await $(`~${screen.toLowerCase()}-screen`);
    await expect(el).toBeDisplayed();
});

// --- Error Handling Flow ---
When(/^I enter an invalid username or password$/, async () => {
    const usernameField = await $('~username-input');
    const passwordField = await $('~password-input');

    await usernameField.setValue('invaliduser');
    await passwordField.setValue('wrongpassword');
});

Then(/^I should see an error message "([^"]*)"$/, async (errorMessage: string) => {
    const errorText = await $(`//*[@text='${errorMessage}']`);
    await expect(errorText).toBeDisplayed();
});

Then(/^I should remain on the login screen$/, async () => {
    const loginScreen = await $('~login-screen');
    await expect(loginScreen).toBeDisplayed();
});

// --- Generic Helpers ---
Then(/^I should see the text "([^"]*)" on the screen$/, async (expectedText: string) => {
    const selector = `//*[@text='${expectedText}'] | //*[contains(@content-desc, '${expectedText}')]`;
    const maxSwipes = 5;
    let found = false;

    // First check if immediately visible
    try {
        const el = await $(selector);
        await el.waitForDisplayed({ timeout: 8000 });
        found = true;
    } catch (e) {
        // Not visible yet — will try scrolling
    }

    // If not found, scroll down to find it
    if (!found) {
        for (let i = 0; i < maxSwipes; i++) {
            await Actions.scroll('down', 0.5);
            await driver.pause(800);
            try {
                const el = await $(selector);
                if (await el.isDisplayed()) {
                    found = true;
                    break;
                }
            } catch (e) {
                // Keep scrolling
            }
        }
    }

    const textElement = await $(selector);
    await expect(textElement).toBeDisplayed();
});

When(/^I scroll (down|up|left|right) to find the text "([^"]*)"$/, async (direction: 'up' | 'down' | 'left' | 'right', searchText: string) => {
    let found = false;
    const maxSwipes = 5;

    for (let i = 0; i < maxSwipes; i++) {
        const textElement = await $(`//*[@text='${searchText}'] | //*[contains(@content-desc, '${searchText}')]`);

        // Use a short timeout to check if it's currently on screen
        try {
            if (await textElement.isDisplayed()) {
                found = true;
                break;
            }
        } catch (e) {
            // isDisplayed might throw if not found at all in the DOM, which is expected
        }

        // Scroll and wait a moment for the UI to settle
        await Actions.scroll(direction, 0.5);
        await driver.pause(1000);
    }

    await expect(found).toEqual(true);
});

// --- Page Text Extraction ---
Then(/^I extract all text from the current page$/, async () => {
    // Collect all elements with non-empty text attributes
    const allElements = await $$('//*[@text and string-length(@text) > 0]');

    const texts: string[] = [];
    for (const el of allElements) {
        try {
            const text = await el.getAttribute('text');
            if (text && text.trim()) {
                texts.push(text.trim());
            }
        } catch (e) {
            // Skip stale elements
        }
    }

    // Deduplicate and format
    const uniqueTexts = [...new Set(texts)];
    const report = uniqueTexts.map((t, i) => `${i + 1}. ${t}`).join('\n');

    console.log('\n📄 Extracted page text:\n' + report);

    // Attach to Allure report as plain text
    allureReporter.addAttachment(
        '📄 All Text on Page',
        Buffer.from(report, 'utf8'),
        'text/plain'
    );
});

