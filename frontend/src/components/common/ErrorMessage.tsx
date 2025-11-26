export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-[#ffebe6] border border-[#ff8f73] text-[#de350b] px-4 py-3 rounded text-sm mb-4">
      <span className="font-semibold">Error: </span>{message}
    </div>
  );
}
