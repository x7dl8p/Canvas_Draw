interface SaveIndicatorProps {
  isSaving: boolean
}

const SaveIndicator = ({ isSaving }: SaveIndicatorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isSaving ? "bg-zinc-500" : "bg-green-500"}`} />
      <span className="text-sm text-zinc-600">{isSaving ? "Saving..." : "Saved"}</span>
    </div>
  )
}

export default SaveIndicator
