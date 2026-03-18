import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect, $ } from '@wdio/globals';
import { Actions } from '../utils/actions';

// --- Login Flow ---
Given(/^I launch the application$/, async () => {
    // The Appium driver automatically launches the app defined in capabilities
    // This step is mostly semantic to ensure driver is ready
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

// --- Navigation Flow ---
Given(/^I am on the home screen$/, async () => {
    const homeScreen = await $('~home-screen');
    await homeScreen.waitForDisplayed();
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
    // Look for text attributes or content descriptions matching the requested string
    const textElement = await $(`//*[@text='${expectedText}'] | //*[contains(@content-desc, '${expectedText}')]`);
    await textElement.waitForDisplayed({ timeout: 5000 });
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
