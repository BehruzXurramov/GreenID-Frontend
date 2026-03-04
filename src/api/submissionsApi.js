import { apiRequest } from "./client";

export const getMySubmissions = () => apiRequest("/submissions/my");

export const getAllSubmissions = () => apiRequest("/submissions");

export const createSubmission = (payload) =>
  apiRequest("/submissions", {
    method: "POST",
    body: payload,
  });

export const updateSubmissionAdmin = (submissionId, payload) =>
  apiRequest(`/submissions/${submissionId}`, {
    method: "PATCH",
    body: payload,
  });
