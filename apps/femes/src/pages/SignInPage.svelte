<script lang="ts">
	import { getErrorReason, requestSignInLink } from '../data/studio-api'
	import { readValue } from '../parts/read-value'
	import SiteHeader from '../parts/SiteHeader.svelte'

	type SignInStateT = 'idle' | 'sending' | 'sent' | 'failed'

	const isExpiredLink = new URLSearchParams(window.location.search).has('expired')
	let email = $state('')
	let signInState = $state<SignInStateT>('idle')
	let devLink = $state('')
	let failureReason = $state('')

	const isSending = $derived(signInState === 'sending')
	const isSent = $derived(signInState === 'sent')
	const isFailed = $derived(signInState === 'failed')
	const hasDevLink = $derived(devLink !== '')

	const failureMessages: Record<string, string> = {
		'invalid-email': "That doesn't look like an email address.",
		'email-unavailable': "We couldn't send email just now. Try again in a minute."
	}

	const failureMessage = $derived(failureMessages[failureReason] ?? 'Something went wrong. Try again.')

	const handleEmailInput = (event: Event) => {
		email = readValue(event)
	}

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		signInState = 'sending'

		try {
			const result = await requestSignInLink(email)
			devLink = result.devLink ?? ''
			signInState = 'sent'
		} catch (sendError) {
			failureReason = getErrorReason(sendError)
			signInState = 'failed'
		}
	}
</script>

<div class="app-page">
	<SiteHeader />
	<section class="signin">
		<fem-heading level={1} size="display">A quiet place for your music.</fem-heading>
		<fem-text color="muted">Listening never needs an account. Sign in to upload, edit, and share your own tracks.</fem-text>

		{#if isExpiredLink}
			<fem-banner color="warning">That sign-in link expired or was already used. Send a new one.</fem-banner>
		{/if}

		{#if isSent}
			<fem-banner color="success">Check your inbox for a sign-in link. It works once, for 15 minutes.</fem-banner>
			{#if hasDevLink}
				<a class="signin-dev-link" href={devLink}>Local run: open the sign-in link</a>
			{/if}
		{:else}
			<form class="signin-form" onsubmit={handleSubmit}>
				<fem-field label="Email">
					<fem-input type="email" required placeholder="you@example.com" value={email} oninput={handleEmailInput}></fem-input>
				</fem-field>
				{#if isFailed}
					<fem-text color="danger" size="small">{failureMessage}</fem-text>
				{/if}
				<fem-button type="submit" size="large" wide loading={isSending}>Email me a sign-in link</fem-button>
			</form>
		{/if}
		<fem-text size="small" color="muted">No passwords. No ads. No tracking.</fem-text>
	</section>
</div>
