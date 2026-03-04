import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFileContent } from '$lib/studio/github-api';
import {
	loadDataFormsConfigFromRepo,
	getDataFormsEnabledMap,
	getDataFormsCopy,
	getDefaultDataFormsConfig
} from '$lib/studio/data-forms-config';

/** Public: which data forms are enabled + copy (labels, submitText, successMessage, fields) for enabled forms */
export const GET: RequestHandler = async () => {
	try {
		const config = await loadDataFormsConfigFromRepo(getFileContent);
		const enabled = getDataFormsEnabledMap(config);
		const copy = getDataFormsCopy(config);
		return json({ enabled, copy });
	} catch {
		const defaults = getDefaultDataFormsConfig();
		return json({
			enabled: getDataFormsEnabledMap(defaults),
			copy: getDataFormsCopy(defaults)
		});
	}
};
