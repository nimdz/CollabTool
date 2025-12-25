interface ProgressBarProps {
    progress: number; 
}

export default function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="w-full bg-[#e0e0e0] rounded-full h-3">
            <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
