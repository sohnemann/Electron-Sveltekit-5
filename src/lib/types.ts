// src/lib/types.ts
export interface Patient {
  ptid: string;
  //encounter: string;
  //att_docnum: number;
  //location_docnum: number;
  //att_alpha_code?: string;
  //location_alpha_code?: string;
  //inactive: string;
  // Add other patient fields as needed
}

export interface User {
    usercode: string;
    uno: number;
    uconame: string;
    disabled: boolean;
    work_lab: number;
    attached_dept: number;
    attached_labno: number;
}

export interface Test {
  labno: number;
  test: number;
  alf_key: string;
  short_desc: string;
  text: string;
  orderable: string;
  is_orderable: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error_code?: number;
  error_message?: string;
}
