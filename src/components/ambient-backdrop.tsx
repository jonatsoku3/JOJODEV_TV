export function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#08060f]" />
      <div className="absolute -top-32 left-[-10%] size-[42rem] rounded-full bg-rose-500/18 blur-[120px]" />
      <div className="absolute top-[18%] right-[-12%] size-[36rem] rounded-full bg-violet-500/16 blur-[110px]" />
      <div className="absolute bottom-[-18%] left-[20%] size-[32rem] rounded-full bg-amber-400/10 blur-[100px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,#08060f_72%)]" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(rgba(255,255,255,0.55)_0.6px,transparent_0.6px)] [background-size:3px_3px]" />
    </div>
  );
}
