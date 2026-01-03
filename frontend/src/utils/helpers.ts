import { TaskStatus } from "@/types";

export const normalizeStatus = (status: number | string): TaskStatus => {
  if (status === 0 || status === "0") return "Pending";
  if (status === 1 || status === "1") return "InProgress";
  if (status === 2 || status === "2") return "Completed";
  return "Pending";
};

export const handleApiError = (err: unknown, fallback = "Something went wrong"): string => {
  let message = fallback;
  if (typeof err === "object" && err !== null) {
    const axiosError = err as { response?: { data?: { message?: string; title?: string } } };
    message = axiosError.response?.data?.message || axiosError.response?.data?.title || message;
  }
  return message;
};
