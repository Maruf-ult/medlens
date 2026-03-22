export interface Finding {
     severity:"normal"|"warning"|"critical";
     title:string;
     detail:string;
     value?:string;
     reference_range?:string;
}

export interface AnalysisResult{
     overall_status:string;
     urgency_score:number;
     summary:string;
     findings:Finding[];
     doctor_questions:string[];
     dataset_context_used:string;
     processing_time_ms:number;
     phi_detected:boolean;
}

export interface QARequest{
     question:string;
     report_context?:string;
}

export interface QAResponse{
     answer:string;
     sources_used:number;
     confidence:"high"|"medium"|"low";
     processing_time_ms:number;
}

export interface ChatMessage{
     id:string;
     role:"user"|"assistant";
     content:string;
     timestamp:Date;
     isLoading?:boolean;
}

export interface DatasetStatus{
     mtsamples:number;
     medquad:number;
     pmcpatients:number;
     total:number;
}

export interface HealthCheck{
     status:"ok"|"error";
     version:string;
}

export interface ApiError{
     detail:string;
     status_code?:number;
}

export interface AnalyzeRequest{
     text:string;
     mode:"full"|"redflags"|"layman";
     dataset_context?:string;
}

export interface UploadState{
     file:File|null;
     preview:string|null;
     isUploading:boolean;
     error:string|null;
}

export type Theme = "light"|"dark"|"system";

export interface NavItem{
     label:string;
     href:string;
     icon?:string;
     badge?:string;
}

export interface ConversationRecord {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

export interface MessageRecord {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}


export interface AnalysisRecord {
  id: string;
  title: string;
  overall_status: string;
  urgency_score: number;
  summary: string;
  created_at: string;
  phi_detected: boolean;
}

export interface AnalysisDetailRecord extends AnalysisRecord {
  report_text: string;
  findings: AnalysisResult["findings"];
  doctor_questions: string[];
  dataset_context: string;
  processing_time_ms: number;
}