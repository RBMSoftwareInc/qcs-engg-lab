/**
 * Scheduled publish (CLI): same logic as Studio "Run scheduled publish now" and GitHub Action.
 * Run from repo root. Requires env: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH.
 *
 * Usage: npm run scheduled-publish
 * Or: npx tsx scripts/run-scheduled-publish.ts
 */

import { runScheduledPublish } from '../src/lib/studio/scheduled-publish';

async function main() {
	const result = await runScheduledPublish();
	if (result.published.length > 0) {
		console.log(`Published ${result.published.length} item(s):`);
		result.published.forEach((p) => console.log(`  ${p}`));
	}
	if (result.errors.length > 0) {
		result.errors.forEach((e) => console.error(`  Error ${e.path}: ${e.message}`));
	}
	if (result.published.length === 0 && result.errors.length === 0) {
		console.log('No content due for scheduled publish.');
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
