<script lang="ts">
	import { getErrorReason, requestSignInLink } from '../data/studio-api'
	import { readValue } from '../parts/read-value'
	import SiteHeader from '../parts/SiteHeader.svelte'

	type SignInStateT = 'idle' | 'sending' | 'sent' | 'failed'

	// One field, one button, then "check your inbox". It
	// borrows the home page's type so the two feel like
	// one place.
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
	const sentMessage = $derived(`We sent a link to ${email}. It works once, for 15 minutes.`)

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

	const handleStartOver = () => {
		devLink = ''
		signInState = 'idle'
	}
</script>

<div class="home signin-page">
	<div class="home-frame">
		<SiteHeader />
	</div>

	<section class="signin-hero home-frame">
		{#if isSent}
			<h1 class="signin-headline">
				<span class="home-headline-line">Check</span>
				<span class="home-headline-line">your inbox.</span>
			</h1>
			<div class="signin-body">
				<p class="home-lede">{sentMessage}</p>
				{#if hasDevLink}
					<a class="home-action isPrimary" href={devLink}>Open the sign-in link</a>
				{/if}
				<button class="signin-text-button" type="button" onclick={handleStartOver}>Use a different email</button>
			</div>
		{:else}
			<h1 class="signin-headline">
				<span class="home-headline-line">Sign in</span>
				<span class="home-headline-line">with your email.</span>
			</h1>
			<div class="signin-body">
				<p class="home-lede">No password to remember. We email you a link, and it signs you in.</p>
				{#if isExpiredLink}
					<p class="signin-note">That link expired or was already used. Send yourself a new one.</p>
				{/if}
				<form class="signin-row" onsubmit={handleSubmit}>
					<fem-input class="signin-input" type="email" size="large" required label="Email" placeholder="you@example.com" value={email} oninput={handleEmailInput}></fem-input>
					<fem-button type="submit" size="large" color="accent" loading={isSending}>Email me a link</fem-button>
				</form>
				{#if isFailed}
					<p class="signin-note isDanger">{failureMessage}</p>
				{/if}
			</div>
		{/if}
	</section>

	<section class="home-frame">
		<ul class="home-promises">
			<li class="home-promise">
				<h3 class="home-promise-heading">No passwords</h3>
				<p class="home-promise-text">Every sign-in is a fresh link that works once.</p>
			</li>
			<li class="home-promise">
				<h3 class="home-promise-heading">Listeners never sign in</h3>
				<p class="home-promise-text">This is only for artists who want a page.</p>
			</li>
			<li class="home-promise">
				<h3 class="home-promise-heading">Free, no ads</h3>
				<p class="home-promise-text">Nothing plays before your song, ever.</p>
			</li>
		</ul>
	</section>
</div>
