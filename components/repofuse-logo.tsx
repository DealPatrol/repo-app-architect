export function RepoFuseLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-foreground to-foreground/80 flex flex-col items-center justify-center shadow-sm overflow-hidden`}>
      <div className="text-[10px] font-black leading-none text-background">
        REPO
      </div>
      <div className="text-[10px] font-black leading-none text-background">
        FUSE
      </div>
    </div>
  )
}
