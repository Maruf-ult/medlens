import type { Finding } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getUrgencyColor(score: number): string {
  if (score <= 3) {
    return "text-success-600:text-success-500";
  } else if (score <= 6) {
    return "text-warning-600 dark:text-warning-500";
  } else {
    return "text-danger-600 dark:text-danger-500";
  }
}

export function getUrgencyBgColor(score: number): string {
  if (score <= 3) {
    return "bg-success-50 border-success-200 dark:bg-success-950 dark:border-success-800";
  } else if (score <= 6) {
    return "bg-warning-50 border-warning-200 dark:bg-warning-950 dark:border-warning-800";
  } else {
    return "bg-danger-50 border-danger-200 dark:bg-danger-950 dark:border-danger-800";
  }
}

export function getUrgencyLabel(score: number): string {
  if (score <= 2) return "All Normal";
  if (score <= 4) return "Minor Concerns";
  if (score <= 6) return "Attention Needed";
  if (score <= 8) return "Urgent Review";
  return "Critical — See Doctor Now";
}

export function getSeverityClasses(severity: Finding["severity"]): string {
  switch (severity) {
    case "normal":
      return "severity-normal border";
    case "warning":
      return "severity-warning border";
    case "critical":
      return "severity-critical border";
    default:
      return "bg-surface-50 border border-surface-200";
  }
}

export function getSeverityIcon(severity: Finding["severity"]): string {
  switch (severity) {
    case "normal":
      return "✅";
    case "warning":
      return "⚠️";
    case "critical":
      return "🚨";
    default:
      return "📋";
  }
}

export function getSeverityLabel(severity:Finding["severity"]):string{
     switch(severity){
          case "normal": return "Normal";
          case "warning": return "Attention";
          case "critical": return "Critical";
          default: return "Unknown";
     }
}

export function formatProcessingTime(ms:number):string{
     if(ms<1000){
          return `${ms}ms`;
     }
     return `${(ms/1000).toFixed(1)}s`;
}

export function formatNumber(num:number):string{
     return num.toLocaleString();
}

export function formatDate(date:Date):string{
     return new Intl.DateTimeFormat("en-US",{
          month:"short",
          day:"numeric",
          year:"numeric",
          hour:"numeric",
          minute:"2-digit",
          hour12:true,
     }).format(date);
}

export function truncateText(text:string,maxLength:number):string{
     if(text.length<=maxLength)return text;
     return text.slice(0,maxLength).trim()+"...";
}

export function generateId():string{
     return `msg_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

export function isValidMedicalText(text:string):boolean{
     return text.trim().length>=20;
}

export function getFileTypeIcon(filename:string):string{
     const ext = filename.split(".").pop()?.toLocaleLowerCase();
     switch(ext){
          case "pdf":  return "📄";
          case "png":
           case "jpg":
           case "jpeg": return "🖼️";
         case "txt":  return "📝";
         default:     return "📎";
     }
}

export function countFindings(findings:Finding[]):{
     normal:number;
     warning:number;
     critical:number;
}{
     return findings.reduce(
          (acc,finding)=>{
               acc[finding.severity]++;
               return acc;
          },{normal:0,warning:0,critical:0}
     );
}