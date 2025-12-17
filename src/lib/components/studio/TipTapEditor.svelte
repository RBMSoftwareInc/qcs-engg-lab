<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import Typography from '@tiptap/extension-typography';
	import { tiptapToMarkdown } from '$lib/studio/markdown-serializer';
	import { markdownToTiptap } from '$lib/studio/markdown-parser';

	let { content = '', onUpdate, placeholder = 'Write your content...' } = $props<{
		content?: string;
		onUpdate?: (markdown: string) => void;
		placeholder?: string;
	}>();

	let editorRef: HTMLElement;
	let editor: Editor | null = null;
	let isBold = $state(false);
	let isItalic = $state(false);
	let isCode = $state(false);
	let currentHeading = $state<number | null>(null);

	onMount(() => {
		editor = new Editor({
			element: editorRef,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4]
					},
					bulletList: {
						keepMarks: true,
						keepAttributes: false
					},
					orderedList: {
						keepMarks: true,
						keepAttributes: false
					}
				}),
				Image.configure({
					inline: false,
					allowBase64: false
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'editor-link'
					}
				}),
				Placeholder.configure({
					placeholder
				}),
				Typography
			],
			content,
			onUpdate: ({ editor }) => {
				const json = editor.getJSON();
				const markdown = tiptapToMarkdown(json);
				onUpdate?.(markdown);
				updateToolbarState();
			},
			onSelectionUpdate: () => {
				updateToolbarState();
			}
		});

		// Set initial content - convert markdown to HTML for TipTap
		if (content) {
			try {
				// Parse markdown to HTML, then TipTap will parse HTML
				const html = marked.parse(content) as string;
				editor.commands.setContent(html);
			} catch (e) {
				// Fallback: try parsing as markdown structure
				try {
					const tiptapDoc = markdownToTiptap(content);
					editor.commands.setContent(tiptapDoc);
				} catch (e2) {
					// Last resort: set as plain text paragraph
					editor.commands.setContent(`<p>${content}</p>`);
				}
			}
		}

		updateToolbarState();
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function updateToolbarState() {
		if (!editor) return;
		isBold = editor.isActive('bold');
		isItalic = editor.isActive('italic');
		isCode = editor.isActive('code');
		const headingLevel = editor.getAttributes('heading').level;
		currentHeading = headingLevel || null;
	}

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}

	function setHeading(level: number | null) {
		if (level === null) {
			editor?.chain().focus().setParagraph().run();
		} else {
			editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
		}
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function insertCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}

	function insertHorizontalRule() {
		editor?.chain().focus().setHorizontalRule().run();
	}

	function insertImage() {
		const url = window.prompt('Enter image URL:');
		if (url) {
			editor?.chain().focus().setImage({ src: url, alt: '' }).run();
		}
	}

	function insertLink() {
		const url = window.prompt('Enter URL:');
		if (url) {
			editor?.chain().focus().setLink({ href: url }).run();
		}
	}

	function undo() {
		editor?.chain().focus().undo().run();
	}

	function redo() {
		editor?.chain().focus().redo().run();
	}
</script>

<div class="tiptap-editor">
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<button
				class="toolbar-btn"
				class:active={isBold}
				onclick={toggleBold}
				title="Bold (Ctrl+B)"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
					<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
				</svg>
			</button>
			<button
				class="toolbar-btn"
				class:active={isItalic}
				onclick={toggleItalic}
				title="Italic (Ctrl+I)"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="4" x2="10" y2="4"></line>
					<line x1="14" y1="20" x2="5" y2="20"></line>
					<line x1="15" y1="4" x2="9" y2="20"></line>
				</svg>
			</button>
			<button
				class="toolbar-btn"
				class:active={isCode}
				onclick={toggleCode}
				title="Inline Code"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="16 18 22 12 16 6"></polyline>
					<polyline points="8 6 2 12 8 18"></polyline>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<div class="toolbar-group">
			<select
				class="toolbar-select"
				value={currentHeading || 'paragraph'}
				onchange={(e) => {
					const value = (e.target as HTMLSelectElement).value;
					setHeading(value === 'paragraph' ? null : parseInt(value));
				}}
			>
				<option value="paragraph">Paragraph</option>
				<option value="1">Heading 1</option>
				<option value="2">Heading 2</option>
				<option value="3">Heading 3</option>
				<option value="4">Heading 4</option>
			</select>
		</div>

		<div class="toolbar-divider"></div>

		<div class="toolbar-group">
			<button class="toolbar-btn" onclick={toggleBulletList} title="Bullet List">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="8" y1="6" x2="21" y2="6"></line>
					<line x1="8" y1="12" x2="21" y2="12"></line>
					<line x1="8" y1="18" x2="21" y2="18"></line>
					<line x1="3" y1="6" x2="3.01" y2="6"></line>
					<line x1="3" y1="12" x2="3.01" y2="12"></line>
					<line x1="3" y1="18" x2="3.01" y2="18"></line>
				</svg>
			</button>
			<button class="toolbar-btn" onclick={toggleOrderedList} title="Numbered List">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="10" y1="6" x2="21" y2="6"></line>
					<line x1="10" y1="12" x2="21" y2="12"></line>
					<line x1="10" y1="18" x2="21" y2="18"></line>
					<line x1="4" y1="6" x2="4" y2="6"></line>
					<line x1="4" y1="12" x2="4" y2="12"></line>
					<line x1="4" y1="18" x2="4" y2="18"></line>
				</svg>
			</button>
			<button class="toolbar-btn" onclick={toggleBlockquote} title="Quote">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
					<path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
				</svg>
			</button>
			<button class="toolbar-btn" onclick={insertCodeBlock} title="Code Block">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="16 18 22 12 16 6"></polyline>
					<polyline points="8 6 2 12 8 18"></polyline>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<div class="toolbar-group">
			<button class="toolbar-btn" onclick={insertImage} title="Insert Image">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<circle cx="8.5" cy="8.5" r="1.5"></circle>
					<polyline points="21 15 16 10 5 21"></polyline>
				</svg>
			</button>
			<button class="toolbar-btn" onclick={insertLink} title="Insert Link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
				</svg>
			</button>
			<button class="toolbar-btn" onclick={insertHorizontalRule} title="Horizontal Rule">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<div class="toolbar-group">
			<button class="toolbar-btn" onclick={undo} title="Undo (Ctrl+Z)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 7v6h6"></path>
					<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
				</svg>
			</button>
			<button class="toolbar-btn" onclick={redo} title="Redo (Ctrl+Y)">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 7v6h-6"></path>
					<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
				</svg>
			</button>
		</div>
	</div>

	<div class="editor-content" bind:this={editorRef}></div>
</div>

<style>
	.tiptap-editor {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		background: var(--bg-primary);
		overflow: hidden;
	}

	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-subtle);
		flex-wrap: wrap;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.toolbar-divider {
		width: 1px;
		height: 24px;
		background: var(--border-subtle);
		margin: 0 0.25rem;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}

	.toolbar-btn:hover {
		background: var(--bg-primary);
		border-color: var(--border-subtle);
		color: var(--text-primary);
	}

	.toolbar-btn.active {
		background: var(--bg-primary);
		border-color: var(--highlight);
		color: var(--text-primary);
	}

	.toolbar-select {
		padding: 0.5rem 0.75rem;
		background: var(--bg-primary);
		border: 1px solid var(--border-subtle);
		border-radius: 4px;
		font-size: 0.9rem;
		color: var(--text-primary);
		cursor: pointer;
	}

	.toolbar-select:focus {
		outline: none;
		border-color: var(--highlight);
	}

	.editor-content {
		flex: 1;
		min-height: 500px;
		padding: 1.5rem;
		overflow-y: auto;
	}

	:global(.ProseMirror) {
		outline: none;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text-primary);
	}

	:global(.ProseMirror p) {
		margin: 0 0 1rem 0;
	}

	:global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: var(--text-muted);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.ProseMirror h1),
	:global(.ProseMirror h2),
	:global(.ProseMirror h3),
	:global(.ProseMirror h4) {
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 1rem;
		line-height: 1.2;
	}

	:global(.ProseMirror h1) {
		font-size: 2rem;
	}

	:global(.ProseMirror h2) {
		font-size: 1.5rem;
	}

	:global(.ProseMirror h3) {
		font-size: 1.25rem;
	}

	:global(.ProseMirror h4) {
		font-size: 1.1rem;
	}

	:global(.ProseMirror ul),
	:global(.ProseMirror ol) {
		margin: 0 0 1rem 0;
		padding-left: 2rem;
	}

	:global(.ProseMirror li) {
		margin: 0.5rem 0;
	}

	:global(.ProseMirror blockquote) {
		border-left: 4px solid var(--highlight);
		padding-left: 1.5rem;
		margin: 1.5rem 0;
		color: var(--text-secondary);
		font-style: italic;
	}

	:global(.ProseMirror code) {
		background: var(--bg-secondary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9em;
		color: var(--text-primary);
	}

	:global(.ProseMirror pre) {
		background: var(--bg-secondary);
		border: 1px solid var(--border-subtle);
		border-radius: 6px;
		padding: 1rem;
		margin: 1.5rem 0;
		overflow-x: auto;
	}

	:global(.ProseMirror pre code) {
		background: transparent;
		padding: 0;
	}

	:global(.ProseMirror hr) {
		border: none;
		border-top: 2px solid var(--border-subtle);
		margin: 2rem 0;
	}

	:global(.ProseMirror img) {
		max-width: 100%;
		height: auto;
		border-radius: 6px;
		margin: 1.5rem 0;
	}

	:global(.ProseMirror a.editor-link) {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--highlight);
	}

	:global(.ProseMirror a.editor-link:hover) {
		text-decoration-color: var(--text-primary);
	}

	:global(.ProseMirror strong) {
		font-weight: 600;
	}

	:global(.ProseMirror em) {
		font-style: italic;
	}
</style>

