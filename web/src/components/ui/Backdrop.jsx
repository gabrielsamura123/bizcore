export default function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora aurora-violet -left-40 -top-40 h-[36rem] w-[36rem]" />
      <div className="aurora aurora-cyan -right-52 top-40 h-[32rem] w-[32rem]" />
      <div className="aurora aurora-fuchsia -bottom-52 left-1/3 h-[30rem] w-[30rem]" />
      <div className="grid-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(5,6,11,0.85)_75%)]" />
    </div>
  )
}
