import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <main className="max-w-lg mx-auto pb-24 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
