const VISITOR_KEY = 'qcs_visitor';
const FIRST_VISIT_KEY = 'qcs_first_visit';
const SESSION_KEY = 'qcs_session';

export interface VisitorState {
	isFirstVisit: boolean;
	hasVisitedBefore: boolean;
	sessionId: string;
	lastVisit: number;
}

export function getVisitorState(): VisitorState {
	if (typeof window === 'undefined') {
		return {
			isFirstVisit: true,
			hasVisitedBefore: false,
			sessionId: '',
			lastVisit: 0
		};
	}

	const firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
	const lastVisit = localStorage.getItem(VISITOR_KEY);
	const sessionId = sessionStorage.getItem(SESSION_KEY) || generateSessionId();

	if (!sessionStorage.getItem(SESSION_KEY)) {
		sessionStorage.setItem(SESSION_KEY, sessionId);
	}

	return {
		isFirstVisit: firstVisit === null,
		hasVisitedBefore: lastVisit !== null,
		sessionId,
		lastVisit: lastVisit ? parseInt(lastVisit, 10) : 0
	};
}

export function markFirstVisit(): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(FIRST_VISIT_KEY, 'false');
		localStorage.setItem(VISITOR_KEY, Date.now().toString());
	}
}

export function markVisit(): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(VISITOR_KEY, Date.now().toString());
	}
}

function generateSessionId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

