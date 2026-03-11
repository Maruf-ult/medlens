import type { AnalysisResult,AnalyzeRequest,QARequest,QAResponse,DatasetStatus,HealthCheck } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000";

async function apiRequest<T>(
     endpoint:string,
     options:RequestInit = {}
):Promise<T>{
     const url = `${BASE_URL}${endpoint}`;

     const defaultHeaders:HeadersInit = {
          "Content-Type":"application/json",
          Accept:"application/json",
     };
     try{
          const response = await fetch(url,{...options,headers:{
               ...defaultHeaders,
               ...options.headers,
          }});
          if(!response.ok){
               const errorData = await response.json().catch(()=>({
                    detail:`server error:${response.status}`,
               }));
               throw new Error(errorData.detail||`HTTP ${response.status}`);
          }
          return response.json() as Promise<T>;
     }catch(error){
          if(error instanceof TypeError && error.message === "Failed to fetch"){
               throw new Error(
                    "Cannot connect to MedLens server.Make sure the backend is running on port 8000."
               );
          }
          throw error;
     }
}


export async function checkHealth():Promise<HealthCheck>{
     return apiRequest<HealthCheck>("/health");
}

export async function analyzeText(request:AnalyzeRequest):Promise<AnalysisResult>{
     return apiRequest<AnalysisResult>("/analyze/text",{
          method:"POST",
          body:JSON.stringify(request),
     });
}


export async function analyzeFile(file:File): Promise<AnalysisResult>{
     const formData = new FormData();
     formData.append("file",file);

     const url = `${BASE_URL}/analyze/file`;

     try {
          const response = await fetch(url,{method:"POST",body:formData,});

          if(!response.ok){
               const errorData = await response.json().catch(()=>({
                    detail:`Upload failed: ${response.status}`,
               }));
               throw new Error(errorData.detail||`HTTP ${response.status}`);
          }
          return response.json() as Promise<AnalysisResult>;
     } catch (error) {
            if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to MedLens server. Make sure the backend is running on port 8000."
      );
    }
    throw error;
     }
}


export async function askQuestion(
     request:QARequest
):Promise<QAResponse>{
     return apiRequest<QAResponse>("/qa",{
          method:"POST",
          body:JSON.stringify(request),
     });
}

export async function getDatasetStatus():Promise<DatasetStatus>{
     return apiRequest<DatasetStatus>("/datasets/status");
}


export async function isBackendOnline():Promise<boolean>{
     try{
       await checkHealth();
       return true;
     }catch{
       return false;
     }
}