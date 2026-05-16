import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center w-full min-h-[100dvh]">
      <div className="w-full max-w-md relative min-h-[100dvh] bg-background shadow-2xl">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
