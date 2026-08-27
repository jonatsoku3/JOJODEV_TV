import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("app-width py-6 sm:py-10 tv:py-14", className)}>{children}</div>;
}
