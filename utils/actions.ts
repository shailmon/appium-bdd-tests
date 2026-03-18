import { $, driver } from '@wdio/globals';

export const Actions = {
  /**
   * Click on an element using WebdriverIO selector
   */
  async click(selector: string): Promise<void> {
    const el = await $(selector);
    await el.waitForDisplayed();
    await el.click();
  },

  /**
   * Tap on specific x, y coordinates
   */
  async tap(x: number, y: number): Promise<void> {
    await driver.action('pointer')
      .move({ x, y })
      .down()
      .pause(100)
      .up()
      .perform();
  },

  /**
   * Double tap on an element
   */
  async doubleTap(selector: string): Promise<void> {
    const el = await $(selector);
    await el.waitForDisplayed();
    
    // WebdriverIO multi-action for double tap
    await driver.action('pointer')
      .move({ origin: el })
      .down()
      .pause(10)
      .up()
      .pause(50)
      .down()
      .pause(10)
      .up()
      .perform();
  },

  /**
   * Scroll in a specific direction by a certain amount (percentage of screen height/width)
   */
  async scroll(direction: 'up' | 'down' | 'left' | 'right', amount: number = 0.5): Promise<void> {
    const { width, height } = await driver.getWindowRect();
    const startX = width / 2;
    const startY = height / 2;
    
    let endX = startX;
    let endY = startY;

    if (direction === 'up') endY = startY - (height * amount);
    if (direction === 'down') endY = startY + (height * amount);
    if (direction === 'left') endX = startX - (width * amount);
    if (direction === 'right') endX = startX + (width * amount);

    await driver.action('pointer')
      .move({ x: startX, y: startY })
      .down()
      .pause(200)
      .move({ x: endX, y: endY, duration: 1000 })
      .up()
      .perform();
  }
};
