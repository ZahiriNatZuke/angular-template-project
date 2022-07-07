import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorService {

  public hasError = (form: FormGroup, input: string): boolean => {
    return (
      !!form.controls[input].errors &&
      (form.controls[input].touched || form.controls[input].dirty)
    );
  };

  public hasRequiredError = (form: FormGroup, input: string): boolean => {
    return (
      form.controls[input].hasError('required') &&
      (form.controls[input].touched || form.controls[input].dirty)
    );
  };

  public hasMinLengthError = (form: FormGroup, input: string): boolean => {
    return (
      form.controls[input].hasError('minlength') &&
      (form.controls[input].touched || form.controls[input].dirty)
    );
  };

  public hasMaxLengthError = (form: FormGroup, input: string): boolean => {
    return (
      form.controls[input].hasError('maxlength') &&
      (form.controls[input].touched || form.controls[input].dirty)
    );
  };

  public hasEmailError = (form: FormGroup, input: string): boolean => {
    return (
      form.controls[input].hasError('email') &&
      (form.controls[input].touched || form.controls[input].dirty)
    );
  };

  public newPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('new_password')?.value;
    const confirmPass = group.get('confirm_new_password')?.value;
    return pass === confirmPass ? null : { newPassword: true };
  };
}
