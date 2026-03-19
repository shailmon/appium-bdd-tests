import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $, $$ } from '@wdio/globals';
import { driver } from '@wdio/globals';
import allureReporter from '@wdio/allure-reporter';
import { Actions } from '../utils/actions';

// --- Launch & Onboarding Flow ---
Given(/^I launch the application$/, async () => {
    // The Appium driver automatically launches the app defined in capabilities
});

Given(/^I bypass the onboarding screens$/, async () => {
    console.log('[Onboarding] Starting bypass sequence...');
    await driver.pause(2000); // Initial wait for app to settle

    const onboardingButtons = [
        'Let\'s get started!',
        'Let\'s get Started',
        'Let\'s get Start',
        'I\'ve been here before',
        'Next',
        'Set as Default Browser',
        'Choose your Browser',
        'Skip',
        'Maybe Later',
        'Not Now',
        'Continue',
        'Got it',
        'Dismiss',
        'Next',
        'I Understand',
        'Maybe Later',
        'No Thanks',
        'Cancel'
    ];

    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
        // Look for home screen indicators with robust resource-ID XPath
        const homeFound =
            await $('//*[@resource-id="com.duckduckgo.mobile.android:id/fire"]').isDisplayed().catch(() => false) ||
            await $('//*[@resource-id="com.duckduckgo.mobile.android:id/search_text"]').isDisplayed().catch(() => false) ||
            await $('//*[@resource-id="com.duckduckgo.mobile.android:id/omnibarTextInput"]').isDisplayed().catch(() => false) ||
            await $('//*[@text="Search or type URL"]').isDisplayed().catch(() => false);

        if (homeFound) {
            console.log('[Onboarding] Home screen detected.');
            break;
        }

        let clicked = false;
        // Search for any known onboarding button
        for (const btnText of onboardingButtons) {
            const selectors = [
                `//*[@text="${btnText}"]`,
                `//*[contains(@text, "${btnText}")]`,
                `//*[contains(@content-desc, "${btnText}")]`,
                `//*[@resource-id='com.duckduckgo.mobile.android:id/primaryCta']`,
                `//*[@resource-id='com.duckduckgo.mobile.android:id/secondaryCta']`
            ];

            for (const selector of selectors) {
                try {
                    const btn = await $(selector);
                    if (await btn.isDisplayed().catch(() => false)) {
                        console.log(`[Onboarding] Clicking: ${btnText} (via ${selector})`);
                        await btn.click();
                        await driver.pause(2000);
                        clicked = true;
                        break;
                    }
                } catch (e: any) {
                    console.error(`[Onboarding] Error clicking ${btnText}: ${e.message}`);
                }
            }
            if (clicked) break;
        }

        if (!clicked) {
            console.log('[Onboarding] No buttons found, waiting...');
            await driver.pause(2000);
            attempts++;
        } else {
            attempts = 0; // Reset if we are making progress
        }

        if (attempts > 5) break;
    }
});

Given(/^I am on the browser home screen$/, async () => {
    const homeSelectors = [
        '//*[@resource-id="com.duckduckgo.mobile.android:id/search_text"]',
        '//*[@resource-id="com.duckduckgo.mobile.android:id/omnibarTextInput"]',
        '//*[@resource-id="com.duckduckgo.mobile.android:id/fire"]',
        '//*[@text="Search or type URL"]'
    ];

    let foundEl = null;
    const timeout = 15000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
        for (const selector of homeSelectors) {
            const el = await $(selector);
            if (await el.isDisplayed().catch(() => false)) {
                foundEl = el;
                break;
            }
        }
        if (foundEl) break;
        await driver.pause(1000);
    }

    if (!foundEl) {
        throw new Error('DuckDuckGo home screen (omnibar/fire button) not found after onboarding bypass.');
    }
});

// --- Navigation & Interaction ---
When(/^I tap on the search bar$/, async () => {
    const searchBarSelectors = [
        '//*[@resource-id="com.duckduckgo.mobile.android:id/search_text"]',
        '//*[@resource-id="com.duckduckgo.mobile.android:id/omnibarTextInput"]',
        '//*[@text="Search or type URL"]'
    ];

    let searchBar = null;
    for (const selector of searchBarSelectors) {
        const el = await $(selector);
        if (await el.isDisplayed().catch(() => false)) {
            searchBar = el;
            break;
        }
    }

    if (!searchBar) {
        throw new Error('Could not find search bar on screen.');
    }
    await searchBar.click();
});

When(/^I tap the Fire button$/, async () => {
    const fireBtnSelectors = [
        '//*[@resource-id="com.duckduckgo.mobile.android:id/fireIconMenu"]',
        '//*[@resource-id="com.duckduckgo.mobile.android:id/fireIconImageView"]',
        '//*[@content-desc="Clear Data"]',
        '//*[@resource-id="com.duckduckgo.mobile.android:id/fire"]'
    ];

    let fireBtn = null;
    for (const selector of fireBtnSelectors) {
        const el = await $(selector);
        if (await el.isDisplayed().catch(() => false)) {
            fireBtn = el;
            break;
        }
    }

    if (!fireBtn) {
        throw new Error('Could not find Fire button on screen.');
    }
    await fireBtn.click();
});

When(/^I tap the Clear Tabs and Data button from Bottom sheet$/, async () => {
    const confirmSelectors = [
        '//*[@text="Burn All Tabs and Data"]',
        '//*[@resource-id="com.duckduckgo.mobile.android:id/fire_all_tabs_and_data_cta"]',
        '//*[@text="CLOSE TABS AND CLEAR DATA"]',
        '//*[@text="Clear Tabs and Data"]'
    ];

    let confirmBtn = null;
    for (const selector of confirmSelectors) {
        const el = await $(selector);
        if (await el.isDisplayed().catch(() => false)) {
            confirmBtn = el;
            break;
        }
    }

    if (!confirmBtn) {
        throw new Error('Could not find "Clear Tabs and Data" button on the bottom sheet.');
    }
    await confirmBtn.click();
    await driver.pause(4000); // Wait for fire animation
});

When(/^I tap on "([^"]*)"$/, async (text: string) => {
    const selector = `//*[@text='${text}'] | //*[contains(@content-desc, '${text}')]`;
    const el = await $(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    await el.click();
});

// --- Keyboard & Input ---
When(/^I send keys "([^"]*)" to the active input$/, async (value: string) => {
    await driver.pause(1000); // Wait for keyboard/field focus
    const input = await $('//android.widget.EditText | //android.widget.AutoCompleteTextView');
    await input.waitForDisplayed({ timeout: 10000 });
    await input.addValue(value);
});

When(/^I send keys "([^"]*)" to the "([^"]*)" field$/, async (value: string, fieldName: string) => {
    const selector = [
        `//*[@hint='${fieldName}']`,
        `//*[@content-desc='${fieldName}']`,
        `//*[@text='${fieldName}']/following-sibling::*[1]`,
        `//android.widget.EditText[@text='${fieldName}']`,
        `//android.widget.AutoCompleteTextView[@text='${fieldName}']`
    ].join(' | ');

    const field = await $(selector);
    await field.waitForDisplayed({ timeout: 10000 });
    await field.setValue(value);
});

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
    if (!keyCode) throw new Error(`Unknown key: "${keyName}"`);
    await driver.pressKeyCode(keyCode);
});

When(/^I tap on the "([^"]*)" button$/, async (btnName: string) => {
    let selector = `//*[@text='${btnName}'] | //*[contains(@content-desc, '${btnName}')]`;

    // Special handling for common browser buttons with specific IDs
    if (btnName.toLowerCase() === 'tabs') {
        selector = `${selector} | //*[@resource-id='com.duckduckgo.mobile.android:id/tabs_count'] | //*[@resource-id='com.duckduckgo.mobile.android:id/tabsControl']`;
    }

    const btn = await $(selector);
    await btn.waitForDisplayed({ timeout: 10000 });
    await btn.click();
});

When(/^I tap on "([^"]*)"$/, async (text: string) => {
    const selector = `//*[@text='${text}'] | //*[contains(@content-desc, '${text}')] | //*[@resource-id='com.duckduckgo.mobile.android:id/primaryCta']`;
    const el = await $(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    await el.click();
});

// --- Validation ---
Then(/^I should see results for "([^"]*)"$/, async (searchText: string) => {
    // Look for search term in browser view
    const result = await $(`//*[contains(@text, '${searchText}')] | //*[contains(@content-desc, '${searchText}')]`);
    await result.waitForDisplayed({ timeout: 20000 });
    await expect(result).toBeDisplayed();
});

Then(/^I should see the text "([^"]*)" in the Favorites section$/, async (text: string) => {
    // In DDG, favorites are usually in a specific grid/recycler view
    const selector = `//*[contains(@resource-id, 'favorite')]//*[@text='${text}'] | //*[@text='${text}']`;
    const el = await $(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    await expect(el).toBeDisplayed();
});

Then(/^I should see the text "([^"]*)" on the screen$/, async (expectedText: string) => {
    const selector = `//*[@text='${expectedText}'] | //*[contains(@content-desc, '${expectedText}')]`;
    const el = await $(selector);
    await el.waitForDisplayed({ timeout: 15000 });
    await expect(el).toBeDisplayed();
});

// --- Page Analysis ---
Then(/^I extract all text from the current page$/, async () => {
    const allElements = await $$('//*[@text and string-length(@text) > 0]');
    const texts: string[] = [];
    for (const el of allElements) {
        try {
            const text = await el.getAttribute('text');
            if (text && text.trim()) texts.push(text.trim());
        } catch (e) { }
    }
    const report = [...new Set(texts)].map((t, i) => `${i + 1}. ${t}`).join('\n');
    console.log('\n📄 Extracted page text:\n' + report);
    allureReporter.addAttachment('📄 Page Text', Buffer.from(report, 'utf8'), 'text/plain');
});

When(/^I wait (\d+) seconds$/, async (seconds: number) => {
    await driver.pause(seconds * 1000);
});

When(/^I navigate back$/, async () => {
    await driver.back();
    await driver.pause(1000);
});
