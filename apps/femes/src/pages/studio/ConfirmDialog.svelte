<script lang="ts">
	type ConfirmDialogPropsT = {
		open: boolean
		heading: string
		message: string
		confirmLabel: string
		isWorking: boolean
		onConfirm: () => void
		onClose: () => void
	}

	// A yes-or-no question for something that can't be
	// undone, like deleting a track.
	const props: ConfirmDialogPropsT = $props()
</script>

<fem-dialog open={props.open} heading={props.heading} onclose={props.onClose}>
	<fem-text color="muted">{props.message}</fem-text>
	<fem-button slot="actions" kind="soft" onclick={props.onClose}>Keep it</fem-button>
	<fem-button slot="actions" color="danger" loading={props.isWorking} onclick={props.onConfirm}>{props.confirmLabel}</fem-button>
</fem-dialog>
