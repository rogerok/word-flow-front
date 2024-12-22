import { computed, makeAutoObservable } from 'mobx';
import { FormField } from './FormField';
import { ZodSchema } from 'zod';
import { Validator } from './Validator';
import { makeLoggable } from 'mobx-log';
import { ValidationResult } from './validators/types';

type FormHandleSubmitType<TFormValues> = (values: TFormValues) => Promise<void>;

interface FormStoreConstructor<TFormValues> {
  defaultValues: TFormValues;
  schema: ZodSchema;
  handleSubmit?: FormHandleSubmitType<TFormValues>;
}

type FieldsMapper<TFormValues> = {
  [Property in keyof TFormValues]: FormField<TFormValues[Property]>;
};

export class FormStore<TFormValues extends Record<string | number, unknown>> {
  defaultValues: TFormValues;
  validator: Validator<TFormValues>;

  fields: FieldsMapper<TFormValues> = {} as FieldsMapper<TFormValues>;

  isSubmitting = false;
  isSubmitted = false;
  submitError: unknown;
  handleSubmit: FormHandleSubmitType<TFormValues> | undefined = undefined;

  constructor(options: FormStoreConstructor<TFormValues>) {
    this.defaultValues = options.defaultValues;
    this.validator = new Validator(options.schema);
    this.handleSubmit = options.handleSubmit;

    this.initFields();

    makeAutoObservable(
      this,
      {
        errors: computed,
      },
      { autoBind: true }
    );

    makeLoggable(this);
  }

  initFields() {
    for (const field in this.defaultValues) {
      this.fields[field] = this.initField(field, this.defaultValues[field]);
    }
  }

  initField<Key extends keyof TFormValues>(
    path: Key,
    data: TFormValues[Key]
  ): FormField<TFormValues[Key]> {
    return new FormField<TFormValues[Key]>(String(path), data);
  }

  get errors(): ValidationResult<TFormValues> {
    return this.validator.errors;
  }

  setIsSubmitting(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;
  }

  setIsSubmitted(isSubmitted: boolean): void {
    this.isSubmitted = isSubmitted;
  }

  async submit(): Promise<void> {
    if (this.handleSubmit) {
      try {
        this.setIsSubmitting(true);

        this.validate();

        // if (this.errors.isSuccess) {
        //   await this.handleSubmit(this.values);
        // }

        await this.handleSubmit(this.values);
      } catch (err: unknown) {
        this.submitError = err;
      } finally {
        this.setIsSubmitting(false);
        this.setIsSubmitted(true);
      }
    }
  }

  reset(): void {
    for (const field in this.fields) {
      this.fields[field].reset();
    }

    this.setIsSubmitting(false);
    this.setIsSubmitted(false);
    this.validator.reset();
  }

  get values(): TFormValues {
    const values = {} as TFormValues;

    for (const field in this.fields) {
      values[field] = this.fields[field].value;
    }

    return values;
  }

  validate(): void {
    this.validator.validate(this.values);
  }
}
