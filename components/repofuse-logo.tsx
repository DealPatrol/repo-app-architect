import Image from 'next/image'

export function RepoFuseLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div className={className}>
      <Image 
        src="/repofuse-logo-3d.jpg" 
        alt="RepoFuse Logo" 
        width={400}
        height={100}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  )
}
