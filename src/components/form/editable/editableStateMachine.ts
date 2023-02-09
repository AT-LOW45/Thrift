import { assign, createMachine } from "xstate";

const editableStateMachine =

/** @xstate-layout N4IgpgJg5mDOIC5QFEIEsAuBZAhgYwAs0A7MAOlUwAIBJY-DNANzAGIHmcMwrJMBtAAwBdRKAAOAe1iY0k4mJAAPRAEYAnOrKCA7ACZ1AZh0AOVQBZ1egKwA2cwBoQAT0SH1qstcE+9eneomJjqC1gC+YU6U2PhEpBToGFQAgniMLKwQYBxMXDx8GEKiSCBSMozyiioIGlq6BsZmljb2Tq4IhuaePr6qhqq2hiaCthFRibiEJOTRKWnM5ABikgBOALZUAMLyGCuSADZUAMoEkgDuxKwk3CsMRYplspUl1RbmZH7utjbmJobW1nMOjaiB0hkMXh6hhG1mM5iGYxA0UmcRmiTm6SWqw222IuwOx1OF1YeHkADM0OsqIQcMQYLB7iVHhUFC9EAZbB8zHpgrZ1IJzIJ1NYQQhTCZIT5DHo+t9wTpEcjYtMEtRNjhxBgAK4rHiLHBofaQVhKWAYPJkHBkm4ACm8ggAlKwlVN4rN1ZqdXqDUaIIyJNInqzQNVPmQTPCdCEuho9CNHC5ECY9JKfCZbNYPNZ03oIpEQMRJFl4CUXaiHoGWVVEABaWyiuuKibKt3oug5MAV8pyYPKRDWYGJjpA7R-TpWYJ-cz+JuYFEq2apTFdoPVhCA0X2Tk9QR6admQy2QSGWcxV1o6hLhZkZZU3H4w4nc695k9teqXei0x1KEyw96eVT3nVtL3mFgyA9bUVhIKAtgIWl6RXKs2QQIFPCMHQ7AMGUdF+UIvxMH9fGMPwAgGICWwvJJIK9Kh9UNSAkLfFDp1FMxU2PHwQhGWwTDzMIgA */
createMachine({
		schema: {
            services: {} as {
				submit: {
					data: void
				}
            },
			events: {} as
				| { type: "interact", value: string }
				| { type: "confirm changes"; service(): Promise<unknown>}
				| { type: "activate edit" }
				| { type: "deactivate edit" },
		},
        context: {
            editFieldValue: "",
            errorMessage: undefined as string | undefined,
			formData: {} as any
        },
        tsTypes: {} as import("./editableStateMachine.typegen").Typegen0,
		states: {
			"Edit Inactive": {
				on: {
					"activate edit": "Edit Active",
				},
			},

			"Edit Active": {
				on: {
					"deactivate edit": "Edit Inactive",
				},

				states: {
					"Form Control Shown": {
						on: {
							interact: {
								target: "Form Control Shown",
								internal: true,
							},
							"confirm changes": "Capturing Changes",
						},
					},
					"Capturing Changes": {
						invoke: {
							src: "submit"
						},
						on: {
							"deactivate edit": "#EditMachine.Edit Inactive"
						}
                    },
				},

				initial: "Form Control Shown",
			},

			"Edit Capture Failed": {
				after: {
					"500": "Edit Inactive",
				},
			},
		},

		initial: "Edit Inactive",
		id: "EditMachine",
	}, {
        actions: {

        }
    });

export default editableStateMachine;
