<script lang="ts">
	/**
	 * Google Tag Manager (GTM) and Google Analytics 4 (GA4).
	 * IDs can come from Studio SEO config (props) or from env vars. No scripts if both missing.
	 */
	import { onMount } from 'svelte';

	let { gtmId: gtmIdProp, gaMeasurementId: gaIdProp } = $props<{
		gtmId?: string | null;
		gaMeasurementId?: string | null;
	}>();

	const gtmId =
		(gtmIdProp && gtmIdProp.trim()) ||
		(typeof import.meta !== 'undefined' && import.meta.env?.VITE_GTM_ID);
	const gaId =
		(gaIdProp && gaIdProp.trim()) ||
		(typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID);

	onMount(() => {
		if (typeof document === 'undefined') return;

		if (gtmId) {
			const s = document.createElement('script');
			s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
			document.head.appendChild(s);
		}

		if (gaId) {
			const g = document.createElement('script');
			g.async = true;
			g.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
			document.head.appendChild(g);
			(window as any).dataLayer = (window as any).dataLayer || [];
			const gtag = function (...args: any[]) {
				((window as any).dataLayer).push(arguments);
			};
			(window as any).gtag = gtag;
			gtag('js', new Date());
			gtag('config', gaId, { send_page_view: true });
		}
	});
</script>

{#if gtmId}
	<!-- Google Tag Manager (noscript) -->
	<noscript>
		<iframe
			src="https://www.googletagmanager.com/ns.html?id={gtmId}"
			height="0"
			width="0"
			style="display:none;visibility:hidden"
			title="GTM"
		></iframe>
	</noscript>
{/if}
