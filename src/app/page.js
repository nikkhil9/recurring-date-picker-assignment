import RecurringDatePicker from '@/components/RecurringDatePicker';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-12 md:p-24 bg-gray-100">
      <RecurringDatePicker />
    </main>
  );
}