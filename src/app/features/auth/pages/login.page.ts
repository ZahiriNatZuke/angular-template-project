import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
	signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/stores/auth.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-login-page',
	templateUrl: './login.page.html',
	imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
	private formBuilder = inject(FormBuilder);

	authStore = inject(AuthStore);

	/**
	 * URL a la que volver tras autenticarse. La escribe `authGuard` como query
	 * param y `withComponentInputBinding()` la enlaza a este input.
	 */
	returnUrl = input<string>();

	showPassword = signal(false);

	form = this.formBuilder.nonNullable.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(8)]],
		rememberMe: [false],
	});

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.authStore.login({
			...this.form.getRawValue(),
			returnUrl: this.returnUrl(),
		});
	}

	togglePassword(): void {
		this.showPassword.update(visible => !visible);
	}
}
