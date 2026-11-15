import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Apple Store "buy" configurator, e.g. /shop/buy-iphone/iphone-17.
 *
 * READ-ONLY: this page object can make selections but deliberately has no
 * method that clicks "Add to Bag" — see CLAUDE.md, never add to bag on the
 * live site. `addToBagButton` exists only to assert on its state.
 *
 * Behaviour verified live 2026-11-14:
 * - Each section is a group of radios sharing a `name` attribute. Sections
 *   unlock in order (color -> storage -> trade-in -> payment -> carrier ->
 *   AppleCare); a radio is `disabled` until the section above is answered.
 * - While choices are missing, the summary shows a disabled "Continue" button
 *   (data-autom="continueButton"). Once every required choice is made it is
 *   replaced by an enabled "Add to Bag" submit button (data-autom="add-to-cart").
 * - The radio inputs overlap their labels differently per section (the color
 *   swatch image covers its input; the trade-in input covers its label), and
 *   the sticky summary bar can cover either. So a selection waits for the
 *   radio to unlock, scrolls it to the viewport centre (clear of the sticky
 *   bar), clicks at its position with force (which hits whichever of
 *   input/label is on top — both select the same radio), then asserts it is
 *   checked so a missed click still fails loudly.
 */
export const CONFIG_OPTION_GROUPS = {
  Color: 'dimensionColor',
  Storage: 'dimensionCapacity',
  'Trade-in': 'tradeupinline',
  Payment: 'purchase_option_group',
  Connectivity: 'carrierModel',
  AppleCare: 'applecare-options',
} as const;

export type ConfigOptionGroup = keyof typeof CONFIG_OPTION_GROUPS;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class BuyConfiguratorPage extends BasePage {
  readonly addToBagButton = this.page.getByRole('button', { name: 'Add to Bag', exact: true });

  /**
   * The radio in `group` whose accessible name starts with `choice`. Names
   * include price/footnote text (e.g. "256GB Footnote 1 Buy from $899 ..."),
   * hence a prefix match; scoping by the group's `name` attribute keeps e.g.
   * Payment "Buy" from matching storage's "Buy from $899" text.
   */
  option(group: ConfigOptionGroup, choice: string) {
    return this.page
      .locator(`input[type="radio"][name="${CONFIG_OPTION_GROUPS[group]}"]`)
      .and(this.page.getByRole('radio', { name: new RegExp(`^${escapeRegExp(choice)}`) }));
  }

  async selectOption(group: ConfigOptionGroup, choice: string) {
    const radio = this.option(group, choice);
    await expect(radio, `${group} "${choice}" should unlock`).toBeEnabled({ timeout: 15_000 });
    // After each selection the page smooth-scrolls itself to the next section.
    // `force` skips Playwright's own "stable" check, so settle manually: wait
    // for any in-flight scroll to stop, centre the radio, then wait again.
    await radio.evaluate(async el => {
      const settle = async () => {
        const deadline = Date.now() + 5_000;
        let last = NaN;
        let stableFrames = 0;
        while (stableFrames < 10 && Date.now() < deadline) {
          await new Promise(requestAnimationFrame);
          const top = el.getBoundingClientRect().top;
          stableFrames = top === last ? stableFrames + 1 : 0;
          last = top;
        }
      };
      await settle();
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      await settle();
    });
    await radio.check({ force: true });
    await expect(radio, `${group} "${choice}" should be selected`).toBeChecked();
  }

  async selectColor(color: string) {
    await this.selectOption('Color', color);
  }
}
