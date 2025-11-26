export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="w-8 h-8 border-3 border-[#dfe1e6] border-t-[#0052cc] rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-[#5e6c84]">{message}</p>
    </div>
  );
}
