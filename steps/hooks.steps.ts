import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/pages.fixture';

const { Before, After } = createBdd(test);

/**
 * Tag-scoped hooks: these only run for scenarios tagged @content-validation
 * (see features/inventory_content_validation.feature), not every scenario.
 * The tag expression supports boolean combinators too, e.g. '@content-validation
 * and not @skip'. Real use here would be something like extra data-integrity
 * logging/alerting specifically around content checks, kept separate from
 * hooks that should run for every scenario.
 */
Before({ tags: '@content-validation' }, async () => {
  console.log('[content-validation] starting scenario — treat any failure here as a data-integrity signal, not just a UI bug');
});

After({ tags: '@content-validation' }, async () => {
  console.log('[content-validation] scenario finished');
});
