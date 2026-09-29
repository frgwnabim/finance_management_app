/** Standard return value for Server Actions called from client components. */
export type ActionResult<TFields extends string = string> =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<TFields, string[]>>;
    };
