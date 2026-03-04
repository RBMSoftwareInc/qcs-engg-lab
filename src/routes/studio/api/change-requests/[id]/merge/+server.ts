import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseSession, requireAdmin } from '$lib/studio/auth';
import { getChangeRequest, setChangeRequestStatus } from '$lib/studio/change-requests';
import { createOrUpdateFile } from '$lib/studio/github-api';
import { getPublishWebhookUrl } from '$lib/studio/publish-webhook';

function getPublishWebhookUrlSafe(): string {
	try {
		return getPublishWebhookUrl();
	} catch {
		return '';
	}
}

export const POST: RequestHandler = async ({ params, cookies }) => {
	const session = parseSession(cookies.get('studio_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!requireAdmin(session)) return json({ error: 'Admin only' }, { status: 403 });

	const id = params.id;
	const cr = getChangeRequest(id);
	if (!cr) return json({ success: false, message: 'Change request not found' }, { status: 404 });
	if (cr.status !== 'open') {
		return json({ success: false, message: 'Change request is no longer open' }, { status: 400 });
	}

	try {
		for (const file of cr.files) {
			const result = await createOrUpdateFile(
				file.path,
				file.content,
				`Merge change request: ${cr.title} (#${id})`
			);
			if (!result.success) {
				return json({
					success: false,
					message: result.error || `Failed to write ${file.path}`
				}, { status: 500 });
			}
		}
		setChangeRequestStatus(id, 'merged', session.email);
		const webhookUrl = getPublishWebhookUrl();
		if (webhookUrl) fetch(webhookUrl, { method: 'POST' }).catch(() => {});
		return json({ success: true, message: 'Merged successfully' });
	} catch (e: any) {
		return json({ success: false, message: e.message || 'Merge failed' }, { status: 500 });
	}
};
