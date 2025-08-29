import { Id } from "@/convex/_generated/dataModel";

export type UserDetails = {
  _id?: Id<'UserTable'>;
  email: string;
  imageUrl: string;
  name: string;
};

export type FormDataType = {
  resume?: File | null; // This can be undefined if resume is not provided (another hidden type: undefined)
  jobTitle?: string;
  jobDescription?: string;
};

export type onInputChangeType = <K extends keyof FormDataType>(
  field: K,
  value: FormDataType[K]
) => void;