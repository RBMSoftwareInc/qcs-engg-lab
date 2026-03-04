import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, requireAdmin } from '$lib/studio/auth';
import { runScheduledPublish } from '$lib/studio/scheduled-publish';

/**
 * POST /studio/api/publish/run-schedule
 * Run scheduled publish now (same logic as cron / GitHub Action). Admin only.
 * Trigger from Studio → Settings → Publishing → "Run scheduled publish now".
 */
export const POST: RequestHandler = async ({ cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!requireAdmin(session)) {
		return json({ success: false, message: 'Admin only' }, { status: 403 });
	}

	try {
		const result = await runScheduledPublish();
		const hasErrors = result.errors.length > 0;
		const hasPublished = result.published.length > 0;
		return json({
			success: !hasErrors || hasPublished,
			published: result.published,
			errors: result.errors,
			message:
				result.published.length > 0
					? `Published ${result.published.length} item(s).`
					: result.errors.length > 0
						? result.errors[0].message
						: 'No content due for scheduled publish.'
		});
	} catch (e) {
		return json(
			{
				success: false,
				message: e instanceof Error ? e.message : 'Scheduled publish failed',
				published: [],
				errors: [{ path: '', message: e instanceof Error ? e.message : String(e) }]
			},
			{ status: 500 }
		);
	}
};
